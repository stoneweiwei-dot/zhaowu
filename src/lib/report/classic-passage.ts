import type { AnalysisResult, AppLocale, QuestionKind } from "@/lib/bazi/types";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase-config";

export type ClassicPassage = {
  passage_key: string;
  source_title_zh_hant: string;
  source_title_zh_hans: string;
  locator: string;
  original_text: string;
  simplified_text: string;
};

export type ClassicPassageContext = {
  themes: string[];
  elements: string[];
  stems: string[];
  branches: string[];
  questions: string[];
  life_stages: string[];
  avoid: string[];
};

const QUESTION_TAGS: Record<QuestionKind, readonly string[]> = {
  career: ["事業", "決策"],
  love: ["關係", "人際"],
  money: ["財務", "事業"],
  health: ["健康", "自我"],
  choice: ["選擇", "決策"],
  timing: ["時機", "決策"],
  self: ["自我"],
  past: ["自我", "關係"],
  home: ["居住", "家庭"],
};

const THEME_TAGS: Record<QuestionKind, readonly string[]> = {
  career: ["行動", "持續", "落地", "順勢"],
  love: ["邊界", "包容", "不執", "自知"],
  money: ["穩定", "知足", "落地", "定力"],
  health: ["清靜", "定心", "清明", "內觀"],
  choice: ["順勢", "觀時", "行動", "自知"],
  timing: ["觀時", "時機", "順勢", "規律"],
  self: ["自知", "洞察", "清明", "自省"],
  past: ["放下", "無常", "洞察", "自知"],
  home: ["環境", "穩定", "包容", "落地"],
};

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function lifeStageTags(result: AnalysisResult): string[] {
  const period = result.chart.currentDayun;
  if (!period) return [];
  if (period.startAge < 18) return ["起步"];
  if (period.startAge < 35) return ["上升"];
  if (period.startAge < 55) return ["成熟"];
  return ["守成"];
}

function avoidTags(question: string): string[] {
  const tags: string[] = [];
  if (/自殺|自杀|自傷|自伤|輕生|轻生|suicid/i.test(question)) tags.push("自傷風險");
  if (/精神危機|精神危机|幻覺|幻觉|psychosis|hallucinat/i.test(question)) tags.push("精神危機");
  if (/喪親|丧亲|bereavement|grief/i.test(question)) tags.push("喪親急性期");
  return tags;
}

export function buildClassicPassageContext(result: AnalysisResult): ClassicPassageContext {
  const readyPillars = result.chart.pillars.filter((pillar) => pillar.ready);
  return {
    themes: unique(THEME_TAGS[result.reading.kind]),
    elements: [result.chart.dayMasterElement],
    stems: unique(readyPillars.map((pillar) => pillar.gan)),
    branches: unique(readyPillars.map((pillar) => pillar.zhi)),
    questions: unique(QUESTION_TAGS[result.reading.kind]),
    life_stages: lifeStageTags(result),
    avoid: avoidTags(result.question),
  };
}

export async function fetchClassicPassage(
  result: AnalysisResult,
  locale: AppLocale,
  signal?: AbortSignal,
): Promise<ClassicPassage | null> {
  if (!supabaseConfigured || locale === "en") return null;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_customer_classic_passage`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_context: buildClassicPassageContext(result) }),
      signal,
    });
    if (!response.ok) return null;

    const rows = await response.json() as ClassicPassage[];
    const passage = rows[0] ?? null;
    if (!passage?.original_text || !passage?.passage_key) return null;
    return passage;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return null;
    return null;
  }
}
