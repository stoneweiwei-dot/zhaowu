import assert from "node:assert/strict";
import test from "node:test";
import { explainCustomerGalleryChoice } from "../src/lib/gallery-match.ts";

const chart = {
  useful: ["木", "火"],
  drain: ["金", "水"],
};

const candidate = {
  asset: {
    id: "asset-1",
    category: "visual-library",
    asset_key: "library-report-art-asset-1",
    title: "Song landscape dragon cloud",
    storage_path: "art.png",
    bucket_id: "zhaowu-backgrounds",
    content_type: "image/png",
    tags: ["song", "landscape", "dragon", "cloud"],
    enabled: true,
  },
  knowledge: {
    asset_id: "asset-1",
    element_scores: { wood: 82, fire: 74, earth: 40, metal: 18, water: 22 },
    climate_scores: { warm: 60, cool: 30, dry: 30, moist: 55 },
    palette: [],
    mood_labels: [],
    summary: "",
    confidence: 0.9,
    analysis_status: "review_required",
    client_eligible: false,
    subject_labels: ["dragon"],
    style_labels: ["song", "landscape"],
    motifs: ["cloud"],
    use_roles: ["report-art"],
  },
};

test("Traditional Chinese explains a destiny image using question, chart direction and visible cues", () => {
  const text = explainCustomerGalleryChoice(chart, "我的命格亮點", candidate, "zh-Hant");
  assert.match(text, /不是隨機抽到/);
  assert.match(text, /命格與自我/);
  assert.match(text, /木/);
  assert.match(text, /火/);
  assert.match(text, /龍/);
  assert.match(text, /山水/);
  assert.doesNotMatch(text, /client_eligible|review_required|score|UUID/i);
});

test("Simplified Chinese keeps the explanation plain and customer-facing", () => {
  const text = explainCustomerGalleryChoice(chart, "我的命格亮点", candidate, "zh-Hans");
  assert.match(text, /不是随机抽到/);
  assert.match(text, /命格与自我/);
  assert.match(text, /当前作品库/);
});

test("English explanation is plain English rather than internal ranking jargon", () => {
  const text = explainCustomerGalleryChoice(chart, "What stands out in my chart?", candidate, "en");
  assert.match(text, /not picked at random/i);
  assert.match(text, /overall chart and personal pattern/i);
  assert.match(text, /Wood/);
  assert.match(text, /Fire/);
  assert.match(text, /dragon/i);
  assert.doesNotMatch(text, /client_eligible|review_required|score|UUID/i);
});
