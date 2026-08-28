import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  chooseCustomerGalleryArt,
  emptyGalleryKnowledge,
  rankCustomerGalleryArt,
  isPersonalDecreeAsset,
} from "../src/lib/gallery-match.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function fakeAsset(id) {
  return {
    id,
    category: "visual-library",
    asset_key: id,
    title: id,
    storage_path: `${id}.png`,
    bucket_id: "zhaowu-gallery",
    content_type: "image/png",
    tags: [],
    enabled: true,
    is_primary: false,
    created_at: "",
    updated_at: "",
  };
}

test("customer Gallery matching ranks the whole enabled visual library without approval gates", async () => {
  const source = await read("src/lib/gallery-match.ts");
  assert.doesNotMatch(source, /analysis_status=eq\.approved/);
  assert.doesNotMatch(source, /client_eligible=eq\.true/);
  assert.match(source, /enabled=eq\.true&category=eq\.visual-library/);
  assert.match(source, /Whole enabled visual-library first/);
  assert.match(source, /Approval is a ranking signal only/);
  assert.match(source, /chart\.useful/);
  assert.match(source, /chart\.drain/);
  assert.match(source, /rankCustomerGalleryArt/);
  assert.match(source, /a\.asset\.id\.localeCompare\(b\.asset\.id\)/);
});

test("an unapproved closer image beats an approved weaker image", () => {
  const chart = { useful: ["木"], drain: ["金"] };
  const approvedLow = {
    asset: fakeAsset("asset-approved-low"),
    knowledge: {
      ...emptyGalleryKnowledge("asset-approved-low"),
      element_scores: { wood: 50, fire: 0, earth: 0, metal: 10, water: 0 },
      confidence: 0.2,
      analysis_status: "approved",
      client_eligible: true,
    },
  };
  const unapprovedHigh = {
    asset: fakeAsset("asset-unapproved-high"),
    knowledge: {
      ...emptyGalleryKnowledge("asset-unapproved-high"),
      element_scores: { wood: 95, fire: 0, earth: 0, metal: 0, water: 0 },
      confidence: 0.9,
      analysis_status: "pending",
      client_eligible: false,
    },
  };

  const winner = chooseCustomerGalleryArt(chart, [approvedLow, unapprovedHigh]);
  assert.equal(winner?.asset.id, "asset-unapproved-high");
  const ranked = rankCustomerGalleryArt(chart, [approvedLow, unapprovedHigh]);
  assert.ok(ranked[0].score > ranked[1].score);
});

test("visual-library ranking stays deterministic when scores tie", () => {
  const chart = { useful: ["水"], drain: [] };
  const knowledge = {
    ...emptyGalleryKnowledge("b"),
    element_scores: { wood: 0, fire: 0, earth: 0, metal: 0, water: 40 },
  };
  const ranked = rankCustomerGalleryArt(chart, [
    { asset: fakeAsset("zeta"), knowledge: { ...knowledge, asset_id: "zeta" } },
    { asset: fakeAsset("alpha"), knowledge: { ...knowledge, asset_id: "alpha" } },
  ]);
  assert.equal(ranked[0].asset.id, "alpha");
  assert.equal(ranked[1].asset.id, "zeta");
});

test("Gallery match is visible at the decree action instead of appearing only after the full report", async () => {
  const [resultView, preview] = await Promise.all([
    read("src/components/result-view.tsx"),
    read("src/components/decree-gallery-preview.tsx"),
  ]);
  assert.match(resultView, /<DecreeGalleryPreview/);
  assert.match(resultView, /generatedImageUrl=\{imageUrl\}/);
  assert.doesNotMatch(resultView, /<CustomerStandardArt/);
  assert.match(resultView, /reportSections \? <FocusedReportSections/);
  assert.match(preview, /loadCustomerGalleryCandidates/);
  assert.match(preview, /rankCustomerGalleryArt/);
  assert.match(preview, /系統會按這次命盤和問題/);
  assert.match(preview, /The artwork presents the reading; it never changes it/);
  assert.match(preview, /Default generation is owned by generate-decree-image/);
  assert.match(preview, /const canGenerate = !loading;/);
  assert.doesNotMatch(preview, /matches\.length > 0/);
  assert.match(preview, /\.catch\(\(\) =>/);
});

test("owner Gallery is one upload surface with no manual religious taxonomy", async () => {
  const manager = await read("src/components/owner-gallery-manager.tsx");
  assert.match(manager, /category:\s*"visual-library"/);
  assert.match(manager, /tags:\s*\["owner-upload", "auto-classify"\]/);
  assert.match(manager, /分類、五行、用途、客戶匹配與背景調用都由系統在後台處理/);
  assert.doesNotMatch(manager, /const CATEGORIES/);
  assert.doesNotMatch(manager, /<select[^>]*>[^]*buddhist|<select[^>]*>[^]*daoist/);
});


test("personal decree images hard-exclude Tea Guardian art in both normal and fallback ranking", async () => {
  const chart = { useful: ["木"], drain: [] };
  const tea = fakeAsset("tea-guardian-super-match");
  tea.category = "tea-guardian";
  tea.tags = ["group:tea-guardian"];
  const ordinary = fakeAsset("landscape-ordinary");

  const teaCandidate = {
    asset: tea,
    knowledge: {
      ...emptyGalleryKnowledge(tea.id),
      element_scores: { wood: 100, fire: 0, earth: 0, metal: 0, water: 0 },
    },
  };
  const ordinaryCandidate = {
    asset: ordinary,
    knowledge: {
      ...emptyGalleryKnowledge(ordinary.id),
      element_scores: { wood: 10, fire: 0, earth: 0, metal: 0, water: 0 },
    },
  };

  assert.equal(isPersonalDecreeAsset(teaCandidate), false);
  assert.equal(chooseCustomerGalleryArt(chart, [teaCandidate, ordinaryCandidate])?.asset.id, ordinary.id);

  const edge = await read("supabase/functions/generate-decree-image/index.ts");
  assert.match(edge, /isPersonalDecreeAsset/);
  assert.match(edge, /category.*tea-guardian/);
  assert.match(edge, /\.filter\(\(asset: any\) => isPersonalDecreeAsset/);
});
