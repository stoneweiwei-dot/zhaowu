import type { ReportSection } from "@/lib/report/focused-report";

export type ReportDragonTone =
  | "calm"
  | "reflection"
  | "joy"
  | "love"
  | "progress"
  | "recovery"
  | "concern"
  | "strain"
  | "distress";

export type ReportDragonAsset = {
  id: string;
  sheet: 1 | 2 | 3;
  row: 0 | 1 | 2;
  column: 0 | 1 | 2;
  tone: ReportDragonTone;
};

function asset(
  id: string,
  sheet: ReportDragonAsset["sheet"],
  row: ReportDragonAsset["row"],
  column: ReportDragonAsset["column"],
  tone: ReportDragonTone,
): ReportDragonAsset {
  return { id, sheet, row, column, tone };
}

/** All 27 user-supplied watercolor dragon reactions, kept as three 3×3 sprite sheets. */
export const REPORT_DRAGON_ASSETS = {
  sneeze: asset("sneeze", 1, 0, 0, "concern"),
  sealed: asset("sealed", 1, 0, 1, "reflection"),
  neutral: asset("neutral", 1, 0, 2, "calm"),
  giggle: asset("giggle", 1, 1, 0, "joy"),
  party: asset("party", 1, 1, 1, "joy"),
  angel: asset("angel", 1, 1, 2, "calm"),
  heartEyes: asset("heart-eyes", 1, 2, 0, "love"),
  cheerful: asset("cheerful", 1, 2, 1, "progress"),
  shyWave: asset("shy-wave", 1, 2, 2, "love"),

  angry: asset("angry", 2, 0, 0, "strain"),
  bittersweet: asset("bittersweet", 2, 0, 1, "distress"),
  crying: asset("crying", 2, 0, 2, "distress"),
  thumbsUp: asset("thumbs-up", 2, 1, 0, "progress"),
  sleeping: asset("sleeping", 2, 1, 1, "recovery"),
  starstruck: asset("starstruck", 2, 1, 2, "joy"),
  huffy: asset("huffy", 2, 2, 0, "strain"),
  worried: asset("worried", 2, 2, 1, "concern"),
  scream: asset("scream", 2, 2, 2, "concern"),

  thinking: asset("thinking", 3, 0, 0, "reflection"),
  wink: asset("wink", 3, 0, 1, "love"),
  embarrassed: asset("embarrassed", 3, 0, 2, "love"),
  cool: asset("cool", 3, 1, 0, "progress"),
  hungry: asset("hungry", 3, 1, 1, "joy"),
  nauseated: asset("nauseated", 3, 1, 2, "concern"),
  dizzy: asset("dizzy", 3, 2, 0, "strain"),
  pleading: asset("pleading", 3, 2, 1, "distress"),
  facepalm: asset("facepalm", 3, 2, 2, "strain"),
} as const satisfies Record<string, ReportDragonAsset>;

const GROUPS = {
  calm: [REPORT_DRAGON_ASSETS.neutral, REPORT_DRAGON_ASSETS.angel],
  reflection: [REPORT_DRAGON_ASSETS.thinking, REPORT_DRAGON_ASSETS.neutral, REPORT_DRAGON_ASSETS.sealed],
  joy: [REPORT_DRAGON_ASSETS.giggle, REPORT_DRAGON_ASSETS.party, REPORT_DRAGON_ASSETS.starstruck, REPORT_DRAGON_ASSETS.hungry],
  love: [REPORT_DRAGON_ASSETS.heartEyes, REPORT_DRAGON_ASSETS.shyWave, REPORT_DRAGON_ASSETS.wink, REPORT_DRAGON_ASSETS.embarrassed],
  progress: [REPORT_DRAGON_ASSETS.thumbsUp, REPORT_DRAGON_ASSETS.cheerful, REPORT_DRAGON_ASSETS.cool],
  recovery: [REPORT_DRAGON_ASSETS.sleeping, REPORT_DRAGON_ASSETS.angel, REPORT_DRAGON_ASSETS.neutral],
  concern: [REPORT_DRAGON_ASSETS.worried, REPORT_DRAGON_ASSETS.nauseated, REPORT_DRAGON_ASSETS.sneeze, REPORT_DRAGON_ASSETS.scream],
  strain: [REPORT_DRAGON_ASSETS.huffy, REPORT_DRAGON_ASSETS.facepalm, REPORT_DRAGON_ASSETS.dizzy, REPORT_DRAGON_ASSETS.angry],
  distress: [REPORT_DRAGON_ASSETS.bittersweet, REPORT_DRAGON_ASSETS.crying, REPORT_DRAGON_ASSETS.pleading],
} as const;

const RECOVERY_PATTERN = /睡|失眠|休息|恢復|恢复|復原|复原|疲|累|sleep|rest|recover|recovery/;
const CONCERN_PATTERN = /噁心|恶心|反胃|不適|不适|疼|痛|醫生|医生|就醫|就医|病|風險|风险|危險|危险|警惕|小心|nause|pain|doctor|medical|risk|danger|warning|caution/;
const ANGER_PATTERN = /憤怒|愤怒|生氣|生气|衝突|冲突|爭執|争执|暴躁|失控|angry|anger|conflict|rage/;
const DISTRESS_PATTERN = /難過|难过|失落|分手|結束|结束|拒絕|拒绝|孤單|孤单|傷心|伤心|sad|grief|breakup|rejection|lonely|loss/;
const STRAIN_PATTERN = /壓力|压力|卡住|反覆|反复|拖延|混亂|混乱|負擔|负担|困難|困难|stress|stuck|repeat|delay|confus|burden|difficult/;
const LOVE_PATTERN = /感情|關係|关系|愛|爱|對象|对象|伴侶|伴侣|婚姻|桃花|love|relationship|partner|romance|marriage/;
const JOY_PATTERN = /好消息|順利|顺利|機會|机会|開心|开心|喜悅|喜悦|成功|值得|good news|smooth|opportun|happy|joy|success|worth/;

function stableIndex(value: string, length: number): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

function pick(tone: keyof typeof GROUPS, seed: string): ReportDragonAsset {
  const group = GROUPS[tone];
  return group[stableIndex(seed, group.length)];
}

function sectionText(section: ReportSection): string {
  return `${section.title}\n${section.body.join("\n")}`.toLowerCase();
}

/**
 * Selects a stable, content-aware reaction. Text still renders independently if the asset fails.
 * Strong emotional signals win; section purpose is the safe fallback.
 */
export function selectReportDragon(section: ReportSection): ReportDragonAsset {
  const text = sectionText(section);
  const seed = `${section.key}|${text}`;

  if (RECOVERY_PATTERN.test(text)) return pick("recovery", seed);
  if (CONCERN_PATTERN.test(text)) return pick("concern", seed);
  if (ANGER_PATTERN.test(text)) return pick("strain", seed);
  if (DISTRESS_PATTERN.test(text)) return pick("distress", seed);
  if (STRAIN_PATTERN.test(text)) return pick("strain", seed);
  if (LOVE_PATTERN.test(text)) return pick("love", seed);
  if (JOY_PATTERN.test(text)) return pick("joy", seed);

  if (section.key === "basis") return pick("reflection", seed);
  if (section.key === "action") return pick("progress", seed);
  if (section.key === "relationship") return pick("love", seed);
  if (section.key === "timing") return pick("calm", seed);
  return pick("calm", seed);
}
