import { reviewedPersonalKnowledge, reviewedPersonalArt } from '../../../supabase/functions/_shared/reviewed-personal-art';
import type { Chart } from '../bazi/types';
import type { Locale } from '../i18n';
import { chartTerm, characterFacts } from '../bazi/presentation';
import { rankCustomerGalleryArt, type CustomerGalleryArt, type GalleryArtKnowledge } from '../gallery-match';
import type { GalleryAsset } from '../gallery-assets';
import { isPublicAtlasAsset } from '../gallery-groups';
import { isCharacterPanelVisualEligible } from './character-panel-visual-contract';
import { explainCustomerDecreeImageChoice } from './decree-selection-copy';

type Candidate = { asset: GalleryAsset; knowledge: GalleryArtKnowledge };
function semantic(row:Candidate):string {
  return [row.asset.title,...(row.asset.tags??[]),...row.knowledge.subject_labels,...row.knowledge.motifs,row.knowledge.summary].join(' ').toLowerCase();
}
export function rankPersonalArt(chart:Chart, rows:Candidate[]):CustomerGalleryArt[] {
  const nayin=chart.pillars.find(p=>p.key==='day')?.nayin;
  const reviewed=rows.flatMap(row=>{const knowledge=reviewedPersonalKnowledge(row.asset,row.knowledge);return knowledge?[{...row,knowledge}]:[];});
  const eligible=reviewed.filter(({asset,knowledge})=>isPublicAtlasAsset(asset) && isCharacterPanelVisualEligible({category:asset.category,asset_key:asset.asset_key,title:asset.title,storage_path:asset.storage_path,summary:knowledge.summary,subject_labels:knowledge.subject_labels,motifs:knowledge.motifs,use_roles:knowledge.use_roles}));
  const ranked=rankCustomerGalleryArt(chart,eligible);
  const affinity=(row:Candidate)=>Boolean(nayin && (semantic(row).includes(nayin) || semantic(row).includes(chartTerm(nayin,'en').toLowerCase())));
  // An explicitly identified natal image first; otherwise use the chart's existing visual direction.
  // No inferred facial resemblance, religious identity, or extra BaZi calculations.
  return ranked.sort((a,b)=>Number(affinity(b))-Number(affinity(a)) || b.score-a.score || a.asset.id.localeCompare(b.asset.id));
}
export function personalArtReason(chart:Chart, question:string, art:Candidate, locale:Locale):string {
  const en=locale==='en', hans=locale==='zh-Hans';
  const day=chart.pillars.find(p=>p.key==='day');
  const title=chartTerm(day?.nayin??'',locale);
  const text=semantic(art);
  const exact=day?.nayin && (text.includes(day.nayin) || text.includes(chartTerm(day.nayin,'en').toLowerCase()));
  const symbolKnown=[...art.knowledge.subject_labels,...art.knowledge.motifs].length>0;
  const chartLine=en?`Your day-pillar image is ${title}; your Day Master is ${chartTerm(chart.dayMaster,locale)}.`:hans?`你的日柱纳音为「${title}」，日主为${chart.dayMaster}。`:`你的日柱納音為「${title}」，日主為${chart.dayMaster}。`;
  if (exact) return chartLine+(en?' This artwork shares that traditional image, giving the pattern in your chart a visual form. It is symbolic, rather than a claim about your appearance or religious identity.':hans?' 画作承接了这个传统意象，把盘面特征转成可以观看的画面；它是象征，不代表你的真实长相或宗教身份。':' 畫作承接了這個傳統意象，把盤面特徵轉成可以觀看的畫面；它是象徵，不代表你的真實長相或宗教身份。');
  const review=reviewedPersonalArt(art.asset);
  if(review) {
    const directions=chart.useful.map(e=>chartTerm(e,locale)).join(en?' and ':'、');
    return chartLine+(en?` The artwork shows ${review.scene.en}. These visible motifs were selected to echo this reading's ${directions} visual direction. This is symbolic companionship, not a claim about your appearance or spiritual identity.`:hans?` 画面中有${review.scene['zh-Hans']}，这些可见意象呼应本次盘面用于配图的「${directions}」方向。这是象征性的陪伴，不认定真实长相或灵性身份。`:` 畫面中有${review.scene['zh-Hant']}，這些可見意象呼應本次盤面用於配圖的「${directions}」方向。這是象徵性的陪伴，不認定真實長相或靈性身份。`)+(chart.usefulProvisional?(en?' The elemental interpretation remains provisional.':hans?' 五行取用仍属初步参考。':' 五行取用仍屬初步參考。'):'');
  }
  if (symbolKnown) return chartLine+' '+explainCustomerDecreeImageChoice(chart,question,art,locale)+(chart.usefulProvisional?(en?' The elemental interpretation is provisional.':hans?' 五行取用仍属初步参考。':' 五行取用仍屬初步參考。'):'');
  const directions=chart.useful.map(e=>chartTerm(e,locale)).join(en?' and ':'、');
  return chartLine+(en?` This artwork is a symbolic companion to the ${directions || 'overall'} direction in this reading. A specific figure is not identified as your match; the artwork offers a visual reminder of that direction. It does not establish a confirmed favourable element.`:hans?` 这张画作为「${directions || '整体'}」方向的陪伴意象。不把画中人物认作你的固定身份，而以画面的气氛提醒你留意这份盘面的方向；这不等于已确定正式喜用神。`:` 這張畫作為「${directions || '整體'}」方向的陪伴意象。不把畫中人物認作你的固定身份，而以畫面的氣氛提醒你留意這份盤面的方向；這不等於已確定正式喜用神。`);
}

export async function downloadPersonalArt(chart:Chart, locale:Locale, imageUrl:string, reason:string):Promise<void> {
  const pic=new Image(); pic.crossOrigin='anonymous';
  await new Promise<void>((resolve,reject)=>{pic.onload=()=>resolve();pic.onerror=()=>reject(new Error('IMAGE_UNAVAILABLE'));pic.src=imageUrl;});
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;
  const ctx=canvas.getContext('2d');if(!ctx) throw new Error('CANVAS_UNAVAILABLE');
  ctx.fillStyle='#f4ead7';ctx.fillRect(0,0,1080,1920);ctx.strokeStyle='#b9a27c';ctx.strokeRect(40,40,1000,1840);
  ctx.fillStyle='#304d3d';ctx.font='600 40px serif';ctx.fillText(locale==='en'?'Your chart in an image':locale==='zh-Hans'?'你的命象':'你的命象',80,115);
  const scale=Math.min(920/pic.naturalWidth,1030/pic.naturalHeight);
  ctx.drawImage(pic,(1080-pic.naturalWidth*scale)/2,160,pic.naturalWidth*scale,pic.naturalHeight*scale);
  ctx.fillStyle='#3b352b';
  characterFacts(chart,locale).forEach(([label,value],i)=>{ctx.font='24px sans-serif';ctx.fillText(label,80,1240+i*54);ctx.font='500 26px serif';ctx.fillText(value,430,1240+i*54,550);});
  ctx.font='600 28px serif';ctx.fillText(locale==='en'?'Why this image':locale==='zh-Hans'?'为什么是这张图':'為什麼是這張圖',80,1485);
  ctx.font='24px sans-serif';let line='',y=1530;
  const words=locale==='en'?reason.split(/\s+/).map(w=>w+' '):[...reason];
  for(const word of words){if(ctx.measureText(line+word).width>920){ctx.fillText(line,80,y);y+=33;line='';}line+=word;}
  if(line)ctx.fillText(line,80,y);
  ctx.globalAlpha=.4;ctx.font='42px serif';ctx.fillText('STONE 原創',735,1825);ctx.globalAlpha=1;
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('EXPORT_FAILED');
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='zhaowu-personal-art-9x16.png';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
