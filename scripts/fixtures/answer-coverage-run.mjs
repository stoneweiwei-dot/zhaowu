import { CORPUS } from "./answer-coverage-corpus.mjs";
import { HOLDOUT } from "./answer-coverage-holdout.mjs";
import { HOLDOUT2 } from "./answer-coverage-holdout2.mjs";
import { HOLDOUT3 } from "./answer-coverage-holdout3.mjs";

const { analyzeLife } = await import("../../src/lib/actions.ts");
const { buildDecisionReportModel } = await import("../../src/lib/report/decision-report-model.ts");
const { FEATURED_CITIES } = await import("../../src/lib/bazi/cities.ts");

export const JARGON = /月令|格局|正印格|十神|七殺|七杀|殺印|杀印|日主|喜用|用神|病藥|病药|承載|承载|制化|透干|藏干|庫氣|六親定位|六亲定位|主看日柱|結構完成度|结构完成度|結構摘要|结构摘要/;
export const SIMPLIFIED = /[这顺险点属暂杀阳内题拥协达旧杂酿绪经弹项预馈视诺维竞]/;

const BIRTH = { year: 1988, month: 10, day: 4, hour: 3, minute: 30, timeUnknown: false, gender: "male" };

export async function screenOf(question, locale = "zh-Hant", birth = {}) {
  const result = await analyzeLife({
    data: { question, locale, ...BIRTH, ...birth, relation: "unset", city: FEATURED_CITIES[0], liveCity: null, ziPolicy: "midnight", useTrueSolar: false },
  });
  const model = buildDecisionReportModel(result);
  return { result, answer: model.directAnswer, next: model.nextAction };
}

function sentenceCount(text, locale) {
  return locale === "en" ? (text.match(/[.!?](\s|$)/g) ?? []).length : (text.match(/。/g) ?? []).length;
}

export async function measure(birth = {}, corpus = CORPUS) {
  const rows = [];
  for (const [group, question, must] of corpus) {
    const locale = group.startsWith("en.") ? "en" : "zh-Hant";
    const { answer, next } = await screenOf(question, locale, birth);
    const text = `${answer}${next}`;
    const fails = [];
    if (!must.test(text)) fails.push("off-topic");
    const n = sentenceCount(answer, locale);
    if (n < 1 || n > 3) fails.push(`sentences=${n}`);
    // bazi.* questions ask in chart terms (格局, 身強弱…), so chart vocabulary is the answer there.
    if (locale === "zh-Hant" && !group.startsWith("bazi.") && JARGON.test(text)) fails.push("jargon");
    if (locale === "zh-Hant" && SIMPLIFIED.test(text)) fails.push("simplified");
    rows.push({ group, question, answer, next, fails, ok: fails.length === 0 });
  }
  return rows;
}

export function summarize(rows) {
  const by = new Map();
  for (const r of rows) {
    const top = r.group.split(".")[0];
    const cur = by.get(top) ?? { ok: 0, total: 0 };
    cur.total += 1; if (r.ok) cur.ok += 1;
    by.set(top, cur);
  }
  const ok = rows.filter((r) => r.ok).length;
  return { ok, total: rows.length, pct: Math.round((ok / rows.length) * 1000) / 10, by };
}

export { CORPUS, HOLDOUT, HOLDOUT2, HOLDOUT3 };
