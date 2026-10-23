import test from "node:test";
import assert from "node:assert/strict";
import { OWNER_PRODUCTION_SUPABASE_URL, ownerSupabaseUrl } from "../lib/owner-supabase-origin.js";
import { ownerEdgeRequest } from "../lib/owner-auth.js";
import { socialQueueRequest } from "../lib/social-queue-client.js";

test("Production backend always targets canonical Supabase despite injected stale integration env", () => {
 const env={VERCEL_ENV:"production",SUPABASE_URL:"https://unrelated-project.supabase.co",VITE_SUPABASE_URL:"https://another-project.supabase.co"};
 assert.equal(ownerSupabaseUrl(env),OWNER_PRODUCTION_SUPABASE_URL);
 assert.equal(ownerSupabaseUrl({VERCEL_ENV:"preview",SUPABASE_URL:"https://local-project.supabase.co/"}),"https://local-project.supabase.co");
 assert.equal(ownerSupabaseUrl({VERCEL_ENV:"development"}),OWNER_PRODUCTION_SUPABASE_URL);
});
test("both owner bridge and social queue reach same canonical Production host",async()=>{
 const env={VERCEL_ENV:"production",SUPABASE_URL:"https://wrong-project.supabase.co",ZHAOWU_OWNER_BRIDGE_SECRET:"unit-test-bridge-not-a-live-key-0123456789",ZHAOWU_SOCIAL_QUEUE_SECRET:"unit-test-queue-not-a-live-key-0123456789"};
 const urls=[];
 const fetchImpl=async(url)=>{urls.push(url);return new Response(JSON.stringify({ok:true}),{status:200});};
 await ownerEdgeRequest("owner.device.check",{deviceId:"00000000-0000-4000-8000-000000000000"},null,env,fetchImpl);
 await socialQueueRequest("settings.get",{},env,fetchImpl);
 assert.deepEqual(urls,[OWNER_PRODUCTION_SUPABASE_URL+"/functions/v1/zhaowu-owner-data",OWNER_PRODUCTION_SUPABASE_URL+"/functions/v1/zhaowu-social-queue"]);
});
