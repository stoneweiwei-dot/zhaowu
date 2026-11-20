import assert from 'node:assert/strict';
import {test} from 'node:test';
import {REVIEWED_PERSONAL_ART, reviewedPersonalKnowledge} from '../supabase/functions/_shared/reviewed-personal-art.ts';
import {rankPersonalArt,personalArtReason} from '../src/lib/report/personal-art.ts';
import {emptyGalleryKnowledge} from '../src/lib/gallery-match.ts';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const rows=REVIEWED_PERSONAL_ART.map(r=>({asset:{id:r.id,storage_path:r.storage_path,category:'visual-library',asset_key:'library-report-art-'+r.id,title:r.id,bucket_id:'zhaowu-backgrounds',enabled:true,tags:[]},knowledge:emptyGalleryKnowledge(r.id)}));
const chart={useful:['水','木'],drain:['火'],dayMaster:'甲',usefulProvisional:true,pillars:[{key:'day',nayin:'海中金'}]};
test('unreviewed colour scores cannot outrank visible water and trees; fire picks a different image',()=>{
 const bad={asset:{...rows[0].asset,id:'unreviewed-flame',storage_path:'fire.jpg'},knowledge:{...emptyGalleryKnowledge(),element_scores:{wood:100,water:100,fire:0,metal:0,earth:0},confidence:1,style_labels:['pixel-profile']}};
 const chosen=rankPersonalArt(chart,[bad,...rows])[0];
 assert.equal(chosen.asset.id,'d19fbdb4-0401-40ed-af08-44f58904a5d3');
 const fire=rankPersonalArt({...chart,useful:['火'],drain:['水']},rows)[0];
 assert.notEqual(fire.asset.id,chosen.asset.id);
 assert.ok(fire.knowledge.subject_labels.some(s=>/red|flame/.test(s)));
 assert.match(personalArtReason(chart,'A decision',chosen,'en'),/pines, waterfalls/);
 assert.doesNotMatch(personalArtReason(chart,'A decision',chosen,'en'),/[\u3400-\u9fff]/);
});
test('review is bound to the exact file path; missing metadata never asserts an identity',()=>{
 assert.equal(reviewedPersonalKnowledge({...rows[0].asset,storage_path:'replacement.jpg'},rows[0].knowledge),null);
 assert.deepEqual(rankPersonalArt(chart,[]),[]);
 assert.ok(REVIEWED_PERSONAL_ART.every(r=>r.scene.en && r.scene['zh-Hant'] && r.scene['zh-Hans']));
});
test('deployed function ranking applies the same subject review before choosing a generator reference',()=>{
 const source=readFileSync(new URL('../supabase/functions/generate-decree-image/index.ts',import.meta.url),'utf8').split('Deno.serve(')[0].replace(/^import[\s\S]*?;\n/gm,'');
 const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
 const context={reviewedPersonalKnowledge};
 runInNewContext(code+'\nthis.rank=rankGalleryAssets;',context);
 const chosen=context.rank(rows.map(r=>r.asset),new Map(),chart,'A difficult decision')[0];
 assert.equal(chosen.asset.id,'d19fbdb4-0401-40ed-af08-44f58904a5d3');
 assert.equal(context.rank([{...rows[0].asset,id:'unknown'}],new Map(),chart,'')[0],undefined);
});
