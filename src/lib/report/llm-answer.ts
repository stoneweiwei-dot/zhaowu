/**
 * Optional LLM rewrite of the first-screen answer (zh-Hant only).
 *
 * The rule answer is always shown first; the rewrite only replaces it when the
 * answer-writer function returns text that passes the same contract the rule
 * answer obeys (1–3 sentences, no chart jargon, no Simplified, no unlisted month).
 * High-stakes and dedicated answers never go to the model.
 */
import type { AnalysisResult } from "@/lib/bazi/types";
import { composeCustomerAnswer, leakFallback, LEAK_RE, writerFacts, type ComposedCustomerAnswer } from "@/lib/report/customer-answer";
import { customerDirectAnswer } from "@/lib/report/customer-copy";
import { toTraditionalCustomerText } from "@/lib/report/reading-locale";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

/** Routes whose fixed wording is a safety decision, not a quality gap. */
const KEEP_FIXED = /^(safe:|intent:(love\.suspect|money\.lottery|legal|family\.parentHealth|other\.ghost|other\.pastlife|other\.guardian)$)/;

const JARGON = /日主|月令|格局|十神|用神|喜用|七殺|七杀|正印|偏印|正官|偏官|正財|偏財|食神|傷官|比肩|劫財|身強|身弱|大運|流年|天干|地支|納音|結構摘要|六親定位/;
const SIMPLIFIED = /[这们个说时会过还为对没现发经问点关头实样两后学里应开么让给变见进动产业买卖东车门长钱间难题顺险属暂杀阳内拥协达旧杂酿绪弹项预馈视诺维竞]/;
const FORBIDDEN = /死期|壽命|會死|去世|過世|絕症|血光|中獎號碼|(?<!不)保證|(?<!不)一定會/;

export type WriterRequest = {
  question: string;
  facts: string;
  months: number[];
  draft: { answer: string; next: string };
};

export function ruleAnswerFor(result: AnalysisResult): ComposedCustomerAnswer | null {
  const composed = composeCustomerAnswer(result);
  if (composed) return composed;
  const direct = customerDirectAnswer(result.question, result.reading.directAnswer);
  return LEAK_RE.test(direct) ? leakFallback(result) : null;
}

export function buildWriterRequest(result: AnalysisResult): WriterRequest | null {
  if ((result.locale ?? "zh-Hant") !== "zh-Hant") return null;
  const question = String(result.question ?? "").trim();
  if (!question || question.length > 300) return null;
  const rule = ruleAnswerFor(result);
  if (!rule || !rule.route || KEEP_FIXED.test(rule.route)) return null;
  const { facts, months } = writerFacts(result);
  return { question, facts, months, draft: { answer: rule.answer, next: rule.nextAction } };
}

export function acceptWriterOutput(answer: unknown, next: unknown, months: number[]): { answer: string; next: string } | null {
  const a = toTraditionalCustomerText(String(answer ?? "").trim());
  const n = toTraditionalCustomerText(String(next ?? "").trim());
  const count = (a.match(/[。！？]/g) ?? []).length;
  if (count < 1 || count > 3 || a.length > 220 || !n || n.length > 100) return null;
  const all = `${a}${n}`;
  if (JARGON.test(all) || SIMPLIFIED.test(all) || FORBIDDEN.test(all)) return null;
  for (const m of all.matchAll(/(\d{1,2})月/g)) if (!months.includes(Number(m[1]))) return null;
  return { answer: a, next: n };
}

export async function requestWrittenAnswer(req: WriterRequest, timeoutMs = 15000): Promise<{ answer: string; next: string } | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/answer-writer`, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
      body: JSON.stringify(req),
    });
    if (!res.ok) return null;
    const out = await res.json();
    if (out?.source !== "llm") return null;
    return acceptWriterOutput(out.answer, out.next, req.months);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
