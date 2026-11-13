#!/usr/bin/env node
/**
 * ZHAOWU / 昭梧 Buffer GraphQL bridge. No dependencies. Node 20+.
 * Default is a dry-run; network writes require --enqueue plus an explicit flag.
 * This is a bridge for a trusted scheduler such as Make, not a registered Make Blueprint.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ENDPOINT = 'https://api.buffer.com';
const ZONE = 'Australia/Sydney';

const normalized = value => String(value ?? '').trim().toLowerCase().replace(/^@/, '');
const graphString = value => JSON.stringify(String(value));

export function sydneyTimeToUtc(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw new Error('Invalid local date/time');
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONE, year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', hourCycle:'h23',
  });
  const want = `${date} ${time}`;
  const base = Date.parse(`${date}T${time}:00.000Z`);
  if (!Number.isFinite(base)) throw new Error('Invalid date');
  const matches = [];
  for (let offset = -14; offset <= 14; offset++) {
    const instant = new Date(base - offset * 3600_000);
    const p = Object.fromEntries(formatter.formatToParts(instant).map(x => [x.type, x.value]));
    if (`${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}` === want) matches.push(instant.toISOString());
  }
  if (matches.length !== 1) throw new Error('Sydney local time nonexistent or ambiguous');
  return matches[0];
}

export function validateInput(config, content) {
  if (!config || !content) throw new Error('Missing config/content');
  if (!content.captions || typeof content.captions !== 'object') throw new Error('Missing platform-specific captions');
  if (config.timezone !== ZONE) throw new Error('Timezone must be Australia/Sydney');
  const dueAt = sydneyTimeToUtc(content.local_date, config.publish_time);
  const targets = config.targets || {};
  const allowed = ['facebook','threads','instagram'];
  for (const k of Object.keys(targets)) if (!allowed.includes(k)) throw new Error(`Unknown target ${k}`);
  for (const k of allowed) {
    const t = targets[k];
    if (!t?.enabled) continue;
    if (typeof t.channel_id !== 'string' || !t.channel_id.trim() || typeof t.expected_name !== 'string' || !t.expected_name.trim()) throw new Error(`${k}: verified channel ID/name required`);
    if (k === 'facebook' && (typeof t.expected_service_id !== 'string' || !t.expected_service_id.trim())) throw new Error('facebook: verified Page service ID required');
    if (typeof content.captions?.[k] !== 'string' || !content.captions[k].trim()) throw new Error(`${k}: caption required`);
    if (k === 'threads' && [...content.captions[k]].length > 500) throw new Error('Threads text too long');
    if (k === 'instagram' && [...content.captions[k]].length > 2200) throw new Error('Instagram caption too long');
    if (k === 'instagram') {
      if (!content.image_url || !/^https:\/\//.test(content.image_url)) throw new Error('Instagram requires publicly hosted image');
      const image = new URL(content.image_url);
      if (image.username || image.password || !image.hostname.includes('.') || /^(localhost|127\.|10\.|192\.168\.)/.test(image.hostname)) throw new Error('Instagram image must be a public HTTPS URL');
      if (!['1:1','4:5'].includes(content.image_aspect_ratio)) throw new Error('Instagram requires verified 1:1 or 4:5 image derivative');
      if (!content.image_alt) throw new Error('Instagram requires alt text for this workflow');
    }
  }
  return dueAt;
}

export function buildPostMutation({channel, text, dueAt, imageUrl='', imageAlt=''}) {
  const media = imageUrl ? `\n          assets: [{image: {url: ${graphString(imageUrl)}${imageAlt ? ` metadata: {altText: ${graphString(imageAlt)}}` : ''}}}]` : '';
  const meta = channel === 'facebook' ? '\n          metadata: {facebook: {type: post}}' : channel === 'instagram' ? '\n          metadata: {instagram: {type: post, shouldShareToFeed: true}}' : '';
  return `mutation CreateZhaowuPost { createPost(input: {
          text: ${graphString(text)}
          channelId: ${graphString(channel)}
          schedulingType: automatic
          mode: customScheduled
          dueAt: ${graphString(dueAt)}${media}${meta}
        }) {
          ... on PostActionSuccess { post { id text dueAt channelId } }
          ... on MutationError { message }
        } }`;
}

export function draftPlan(config, content) {
  const dueAt = validateInput(config, content);
  return Object.entries(config.targets).filter(([,t])=>t.enabled).map(([service,t])=>({
    service, channel_id:t.channel_id, expected_name:t.expected_name, expected_service_id:t.expected_service_id,
    dueAt, text:content.captions[service],
    imageUrl: service==='instagram' ? content.image_url : '',
    imageAlt: service==='instagram' ? content.image_alt : '',
  }));
}

async function bufferQuery(query, token, fetchImpl=fetch) {
  if (!token) throw new Error('BUFFER_API_KEY missing');
  const response = await fetchImpl(ENDPOINT, {
    method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` },
    body: JSON.stringify({query}),
  });
  if (!response.ok) throw new Error(`Buffer HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors?.length) throw new Error(`Buffer GraphQL: ${result.errors.map(x=>x.message).join('; ')}`);
  return result.data;
}

export async function readAccountChannels(token, fetchImpl=fetch) {
  const account = await bufferQuery('query {account {organizations {id name}}}',token,fetchImpl);
  const orgs = account?.account?.organizations;
  if (!Array.isArray(orgs)) throw new Error('Incomplete Buffer organizations response');
  const output=[];
  for (const org of orgs) {
    const query = `query { channels(input: {organizationId: ${graphString(org.id)}}) {id name displayName service serviceId type isQueuePaused isDisconnected isLocked externalLink} }`;
    const r = await bufferQuery(query, token, fetchImpl);
    if (!Array.isArray(r?.channels)) throw new Error('Incomplete Buffer channels response');
    for (const ch of r.channels) output.push({...ch,organizationId:org.id,organizationName:org.name});
  }
  return output;
}

export function validateTargetChannels(plan, channels) {
  for (const p of plan) {
    const c = channels.find(x=>x.id===p.channel_id);
    if (!c) throw new Error(`${p.service}: channel not in authorized Buffer account`);
    if (normalized(c.service)!==p.service) throw new Error(`${p.service}: wrong provider ${c.service}`);
    const names = [normalized(c.name),normalized(c.displayName)];
    if (!names.includes(normalized(p.expected_name))) throw new Error(`${p.service}: channel name mismatch; actual ${c.name}/${c.displayName}`);
    for (const key of ['isQueuePaused','isDisconnected','isLocked']) {
      if (typeof c[key] !== 'boolean') throw new Error(`${p.service}: missing ${key} status`);
    }
    if (c.isQueuePaused) throw new Error(`${p.service}: queue paused`);
    if (c.isDisconnected || c.isLocked) throw new Error(`${p.service}: channel disconnected or locked`);
    if (p.service === 'facebook' && normalized(c.type) !== 'page') throw new Error('Facebook target must be a Page, not a personal profile');
    if (p.service === 'facebook' && (!p.expected_service_id || c.serviceId !== p.expected_service_id)) throw new Error('Facebook Page service ID mismatch');
  }
}

export async function checkScheduled(token, org, channelId, dueAt, fetchImpl=fetch) {
  // Search all scheduled/sent records: Buffer's date filters use createdAt/dueAt,
  // so a post actually sent on the target date could otherwise be missed.
  const q = `query {posts(first: 100, input: {organizationId: ${graphString(org)}, filter: {status: [scheduled, sent], channelIds: [${graphString(channelId)}]}}){edges{node{id dueAt sentAt channelId status}}pageInfo{hasNextPage}}}`;
  const res=await bufferQuery(q,token,fetchImpl);
  const posts=res?.posts;
  if (!posts || !Array.isArray(posts.edges) || typeof posts.pageInfo?.hasNextPage !== 'boolean') throw new Error('Incomplete Buffer posts response; cannot safely deduplicate');
  if (posts.pageInfo.hasNextPage) throw new Error('More than 100 scheduled/sent posts; cannot safely deduplicate');
  const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit'});
  const day=iso=>{const d=new Date(iso); if (!Number.isFinite(d.getTime())) throw new Error('Invalid post timestamp'); const p=Object.fromEntries(fmt.formatToParts(d).map(x=>[x.type,x.value])); return `${p.year}-${p.month}-${p.day}`;};
  const wanted=day(dueAt);
  let match;
  for (const edge of posts.edges) {
    const p=edge?.node;
    if (!p || !p.id || p.channelId !== channelId || !['scheduled','sent'].includes(p.status) || !Object.hasOwn(p,'dueAt') || !Object.hasOwn(p,'sentAt')) throw new Error('Incomplete or unexpected Buffer post; cannot safely deduplicate');
    if (p.status === 'scheduled' && !p.dueAt || p.status === 'sent' && !p.sentAt) throw new Error('Missing post timestamp; cannot safely deduplicate');
    const same=(p.dueAt && day(p.dueAt)===wanted) || (p.sentAt && day(p.sentAt)===wanted);
    if (same && !match) match=p;
  }
  return match;
}

export async function inspectPlan({plan, token, fetchImpl=fetch}) {
  if (!plan.length) throw new Error('No approved channels enabled');
  const channels=await readAccountChannels(token,fetchImpl);
  validateTargetChannels(plan,channels);
  const results=[];
  for (const p of plan) {
    const org=channels.find(x=>x.id===p.channel_id).organizationId;
    const existing=await checkScheduled(token,org,p.channel_id,p.dueAt,fetchImpl);
    results.push({service:p.service,channel_id:p.channel_id,existing:existing ? {id:existing.id,status:existing.status} : null});
  }
  return results;
}

export async function enqueuePlan({plan, token, fetchImpl=fetch, now=new Date()}) {
  if (plan.some(p=>p.service === 'instagram')) throw new Error('Instagram enqueue blocked pending verified public image and direct-publishing capability');
  const checks=await inspectPlan({plan,token,fetchImpl});
  if (checks.some(c=>c.existing)) throw new Error('Existing post found; stop all channels');
  const channels=await readAccountChannels(token,fetchImpl);
  validateTargetChannels(plan,channels);
  if (new Date(plan[0]?.dueAt).getTime() - now.getTime() < 120_000) throw new Error('Publish time too soon/past; stop instead of instant publish');
  const results=[];
  for (const p of plan) {
    const org=channels.find(x=>x.id===p.channel_id).organizationId;
    const existing=await checkScheduled(token,org,p.channel_id,p.dueAt,fetchImpl);
    if (existing) {results.push({service:p.service,status:'existing',id:existing.id});continue;}
    const query=buildPostMutation({channel:p.service,text:p.text,dueAt:p.dueAt,imageUrl:p.imageUrl,imageAlt:p.imageAlt}).replace(
      /channelId: ("[^"\\]*")/,`channelId: ${graphString(p.channel_id)}`);
    const data=await bufferQuery(query,token,fetchImpl);
    const item=data.createPost;
    if (!item?.post?.id) throw new Error(`${p.service}: Buffer mutation failed: ${item?.message||'unknown'}`);
    results.push({service:p.service,status:'scheduled',id:item.post.id,dueAt:item.post.dueAt});
  }
  return results;
}

async function main() {
  const args=process.argv.slice(2);
  const action=args.includes('--list-channels')?'list-channels':args.includes('--check')?'check':args.includes('--enqueue')?'enqueue':'dry-run';
  const cfgPath=args.find(x=>x.startsWith('--config='))?.slice(9) || './config.example.json';
  const postPath=args.find(x=>x.startsWith('--post='))?.slice(7) || './post.example.json';
  if (action==='list-channels') {
    const channels=await readAccountChannels(process.env.BUFFER_API_KEY);
    console.log(JSON.stringify({mode:'list-channels',liveWrites:false,channels},null,2));
    return;
  }
  const config=JSON.parse(readFileSync(resolve(cfgPath),'utf8'));
  const post=JSON.parse(readFileSync(resolve(postPath),'utf8'));
  const plan=draftPlan(config,post);
  if (!plan.length) throw new Error('No approved channels enabled');
  if (action==='check') {
    const results=await inspectPlan({plan,token:process.env.BUFFER_API_KEY});
    console.log(JSON.stringify({mode:'check',liveWrites:false,results,limitations:['Buffer only; check Metricool and existing schedules separately','Instagram media URL, actual image dimensions and automatic-publishing capability require independent verification']},null,2));
    if (results.some(r=>r.existing)) throw new Error('Existing Buffer post found; preflight blocked');
    return;
  }
  if (action==='dry-run') {
    console.log(JSON.stringify({mode:'dry-run',liveWrites:false,local:`${post.local_date} ${config.publish_time} ${ZONE}`,dueAt:plan[0].dueAt,enabledTargets:plan.map(p=>p.service),limitations:['Input validation only; no account, duplicate, public image or actual image dimension checks']},null,2));
    return;
  }
  if (process.env.ENABLE_BUFFER_QUEUE !== 'YES_I_APPROVED') throw new Error('Queue blocked until ENABLE_BUFFER_QUEUE=YES_I_APPROVED');
  console.log(JSON.stringify(await enqueuePlan({plan,token:process.env.BUFFER_API_KEY}),null,2));
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) main().catch(e=>{console.error(`FAILED CLOSED: ${e.message}`);process.exitCode=1;});
