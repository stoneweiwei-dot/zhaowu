import assert from "node:assert/strict";
import test from "node:test";
import { explainCustomerDecreeImageChoice } from "../src/lib/report/decree-selection-copy.ts";

const chart = {
  useful: ["木", "火"],
  drain: ["金", "水"],
};

const candidate = {
  asset: {
    id: "asset-1",
    category: "visual-library",
    asset_key: "mahakala-horse-guardian",
    title: "馬頭明王 觀音 白馬 火焰 劍",
    storage_path: "art.png",
    bucket_id: "zhaowu-gallery",
    content_type: "image/png",
    tags: ["馬", "明王", "觀音", "火焰", "劍"],
    enabled: true,
  },
  knowledge: {
    asset_id: "asset-1",
    element_scores: { wood: 82, fire: 74, earth: 40, metal: 18, water: 22 },
    climate_scores: { warm: 60, cool: 30, dry: 30, moist: 55 },
    palette: [],
    mood_labels: ["decisive", "protective"],
    summary: "馬頭明王與白馬、火焰、觀音構成迅疾破障與穩定護持的畫面。",
    confidence: 0.9,
    analysis_status: "review_required",
    client_eligible: false,
    subject_labels: ["horse", "guardian", "guanyin"],
    style_labels: ["song", "mineral painting"],
    motifs: ["flame", "sword"],
    use_roles: ["report-art"],
  },
};

const INTERNAL_ZH = /隨機|随机|系統|系统|視覺匹配|视觉匹配|五行|作品庫|作品库|演算法|算法|提示詞|提示词|不會改動命理|不会改动命理/i;
const INTERNAL_EN = /picked at random|visual direction|five[- ]element|library|algorithm|prompt|does not change the reading/i;

test("Traditional Chinese explains what the selected image means for the person now", () => {
  const text = explainCustomerDecreeImageChoice(chart, "我現在卡住了，下一步應該怎麼走？", candidate, "zh-Hant");
  assert.match(text, /馬/);
  assert.match(text, /護法|明王/);
  assert.match(text, /觀音|菩薩/);
  assert.match(text, /往前|行動|下一步|方向/);
  assert.match(text, /所以選這張/);
  assert.doesNotMatch(text, INTERNAL_ZH);
  assert.doesNotMatch(text, /client_eligible|review_required|score|UUID/i);
});

test("Simplified Chinese stays customer-facing and explains the image symbolism", () => {
  const text = explainCustomerDecreeImageChoice(chart, "我现在很纠结下一步怎么走", candidate, "zh-Hans");
  assert.match(text, /马/);
  assert.match(text, /护法|明王/);
  assert.match(text, /观音|菩萨/);
  assert.match(text, /所以选这张/);
  assert.doesNotMatch(text, INTERNAL_ZH);
});

test("English explains the visual meaning in plain customer language", () => {
  const text = explainCustomerDecreeImageChoice(chart, "I feel stuck. What should I do next?", candidate, "en");
  assert.match(text, /horse/i);
  assert.match(text, /guardian/i);
  assert.match(text, /bodhisattva/i);
  assert.match(text, /move forward|act|next step|direction/i);
  assert.match(text, /why this image belongs with this reading/i);
  assert.doesNotMatch(text, INTERNAL_EN);
  assert.doesNotMatch(text, /client_eligible|review_required|score|UUID/i);
});
