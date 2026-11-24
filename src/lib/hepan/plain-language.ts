// src/lib/hepan/plain-language.ts
//
// Plain-language rendering for the /hepan result page (Shi, 2026-11-24).
// The page shows ONLY what this module returns: a headline, a
// "what works" list, a "needs more patience" list, one everyday
// reminder, and a footer line about the full document. No jargon,
// no system names, no per-system scores, no weights, no formula.
// All of that is still computed in the backend (pair-model.ts etc.)
// and this module reads it to build sentences — it never recalculates
// anything and never changes a score.
//
// Mapping (each sentence traces to one computed data point):
//  - day-master 85 (generates) / 70 (same) / 45 (controls) -> dm-*
//  - day-branch kind, parsed from the reading's evidence line
//    "主關係：X（N分）" (fallback: score bands 90/80/40/60) -> db-*
//  - elements score >= 70 / 50-69 skip / < 50 -> el-*
//  - numerology reading score 85/65/45 -> num-* (same life-path
//    number is detected by parsing the reading's evidence line)
//  - western readings by id (western-sun-moon etc.), 85/65/45;
//    at most one western sentence per block, fixed priority order
//  - vedic section total (36-point only; denominator 15 = partial,
//    no sentence): >= 24 strengths, 18-23 skip, < 18 patience;
//    Nadi or Gana at 0 adds the habits detail
//  - ziwei section lines containing "磨合點：" -> one patience
//    sentence (a flag, not a score; the lines themselves are never
//    rendered, only scanned for the flag)
//  - yizhangjing section lines containing "同道：" -> one strengths
//    sentence; mixed relations with no shared dao -> no sentence
//  - qizheng: no sentence in this version (no comparable pair signal;
//    the section only states the method and its limitation)
//  - conflicts.length > 0 -> the reminder names the contrast; the
//    lowest bazi reading goes first in the patience block
//  - headline band: index >= 75 high, 55-74 mid, < 55 low
//
// Tone rules (Shi's brief): plain Mandarin, short sentences, like
// talking to a friend; no 首先/其次/總的來說, no lecturing lists,
// no "建議你們……" AI voice; sentence structures vary by key.

import type { HepanIndex, HepanReading, HepanSystemSection } from "./pair-model";

export type PlainLocale = "zh-Hant" | "zh-Hans" | "en";

export type PlainLanguageResult = {
  headline: string;
  strengths: string[];
  patience: string[];
  reminder: string;
  footer: string;
};

type Candidate = {
  key: string;
  domain: string; // dedup key within a block
  system: string; // one sentence per non-bazi system per block
  norm: number; // 0..1; flags carry 0.45 for ordering only
  priority: number; // patience only: 0 conflict item, 1 flag, 2 scored
};

const PHRASES: Record<PlainLocale, Record<string, string>> = {
  "zh-Hant": {
    "headline-high": "整體來說，你們合得來的地方明顯比需要磨合的地方多。",
    "headline-mid": "整體來說，你們合得來的地方不少，不過也有一個地方要多花點心思。",
    "headline-low": "整體來說，要磨合的地方不少，急不得，慢慢來。",
    "dm-generates": "一個人主動、一個人接得住，事情推得動。",
    "dm-same": "想法挺像，很多事不用多說就懂。",
    "dm-controls": "做事的方式不太一樣，容易在小事上較勁。",
    "db-liuhe": "過日子挺合拍，待在一起不累。",
    "db-sanhui": "剛開始要適應一下，處久了會越來越順。",
    "db-liuchong": "生活習慣和步調差得比較多，要多留空間給對方。",
    "db-other-low": "相處上有些地方容易互相牽制，要多留一點空間。",
    "el-high": "一個人缺的，另一個人剛好補得上。",
    "el-low": "一個人缺的，另一個人不一定補得上，遇到瓶頸容易一起卡住。",
    "num-xianghe": "兩個人看事情的角度挺像，節奏也合得來。",
    "num-same": "想法很像，連盲點都像，互補要靠其他地方。",
    "num-mohe": "做事的方式不太一樣，決定之前多商量一下。",
    "west-sun-moon-high": "平常過日子的節奏合得來，累了的時候對方也懂。",
    "west-venus-mars-high": "兩個人親近的方式合得來，喜歡待在一起。",
    "west-venus-venus-high": "喜歡的東西挺像，一起做點什麼都不難。",
    "west-moon-moon-high": "情緒上互相接得住，不用多說。",
    "west-saturn-high": "兩個人在一起挺穩的，長久相處不用擔心。",
    "west-sun-moon-low": "一個人想休息、一個人想出門的時候，節奏容易對不上。",
    "west-venus-mars-low": "親近的方式不太一樣，一個想靠近、一個想留點空間的時候多。",
    "west-venus-venus-low": "喜歡的東西不太一樣，花錢花時間的地方容易有不同想法。",
    "west-moon-moon-low": "情緒低落的時候，兩個人安慰人的方式不太一樣。",
    "west-saturn-low": "長久相處要多花點心思，責任和界線要講清楚。",
    "vedic-high": "整體來說，兩個人過日子的節奏合得來。",
    "vedic-low-habits": "有些生活習慣和性情上的地方，要多包容一點。",
    "vedic-low-general": "整體來說，兩個人要磨合的地方比較多，急不得。",
    "palm-shared": "有些在意的事，兩個人想得挺像。",
    "ziwei-flag": "有一個地方要多花點心力，不是誰對誰錯。",
    "reminder-contrast": "順的時候很順，卡的時候也卡得明顯。卡住的那天，晚一點再談通常比當場講清楚有用。",
    "reminder-smooth": "順的時候多，記得把這份順留在日常的小事裡。",
    "reminder-steady": "磨合的地方不少，別一次談完，分開幾次說比較好。",
    footer: "想要完整版解析（含詳細推算過程），付費後可以拿到完整文檔。",
  },
  "zh-Hans": {
    "headline-high": "整体来说，你们合得来的地方明显比需要磨合的地方多。",
    "headline-mid": "整体来说，你们合得来的地方不少，不过也有一个地方要多花点心思。",
    "headline-low": "整体来说，要磨合的地方不少，急不得，慢慢来。",
    "dm-generates": "一个人主动、一个人接得住，事情推得动。",
    "dm-same": "想法挺像，很多事不用多说就懂。",
    "dm-controls": "做事的方式不太一样，容易在小事上较劲。",
    "db-liuhe": "过日子挺合拍，待在一起不累。",
    "db-sanhui": "刚开始要适应一下，处久了会越来越顺。",
    "db-liuchong": "生活习惯和步调差得比较多，要多留空间给对方。",
    "db-other-low": "相处上有些地方容易互相牵制，要多留一点空间。",
    "el-high": "一个人缺的，另一个人刚好补得上。",
    "el-low": "一个人缺的，另一个人不一定补得上，遇到瓶颈容易一起卡住。",
    "num-xianghe": "两个人看事情的角度挺像，节奏也合得来。",
    "num-same": "想法很像，连盲点都像，互补要靠其他地方。",
    "num-mohe": "做事的方式不太一样，决定之前多商量一下。",
    "west-sun-moon-high": "平常过日子的节奏合得来，累了的时候对方也懂。",
    "west-venus-mars-high": "两个人亲近的方式合得来，喜欢待在一起。",
    "west-venus-venus-high": "喜欢的东西挺像，一起做点什么都不难。",
    "west-moon-moon-high": "情绪上互相接得住，不用多说。",
    "west-saturn-high": "两个人在一起挺稳的，长久相处不用担心。",
    "west-sun-moon-low": "一个人想休息、一个人想出门的时候，节奏容易对不上。",
    "west-venus-mars-low": "亲近的方式不太一样，一个想靠近、一个想留点空间的时候多。",
    "west-venus-venus-low": "喜欢的东西不太一样，花钱花时间的地方容易有不同想法。",
    "west-moon-moon-low": "情绪低落的时候，两个人安慰人的方式不太一样。",
    "west-saturn-low": "长久相处要多花点心思，责任和界线要讲清楚。",
    "vedic-high": "整体来说，两个人过日子的节奏合得来。",
    "vedic-low-habits": "有些生活习惯和性情上的地方，要多包容一点。",
    "vedic-low-general": "整体来说，两个人要磨合的地方比较多，急不得。",
    "palm-shared": "有些在意的事，两个人想得挺像。",
    "ziwei-flag": "有一个地方要多花点心力，不是谁对谁错。",
    "reminder-contrast": "顺的时候很顺，卡的时候也卡得明显。卡住的那天，晚一点再谈通常比当场讲清楚有用。",
    "reminder-smooth": "顺的时候多，记得把这份顺留在日常的小事里。",
    "reminder-steady": "磨合的地方不少，别一次谈完，分开几次说比较好。",
    footer: "想要完整版解析（含详细推算过程），付费后可以拿到完整文档。",
  },
  en: {
    "headline-high": "On the whole, the things that come easily between you clearly outweigh the things that take work.",
    "headline-mid": "On the whole, a fair amount comes easily, though one part will need a little extra care.",
    "headline-low": "On the whole, there is quite a bit to work through — no rush, take it slowly.",
    "dm-generates": "One of you takes the lead, the other picks it up, and things move.",
    "dm-same": "You think alike; a lot of things need no explaining.",
    "dm-controls": "You go about things differently, so small things can turn into a tug-of-war.",
    "db-liuhe": "Daily life fits well together; being around each other is easy.",
    "db-sanhui": "It takes a little adjusting at first, and it gets smoother the longer you are together.",
    "db-liuchong": "Your habits and pace differ quite a bit, so give each other room.",
    "db-other-low": "Some parts of living together pull against each other — leave a little extra space.",
    "el-high": "What one of you is short on, the other happens to have.",
    "el-low": "What one of you is short on, the other may not have either, so a rough patch can leave you both stuck.",
    "num-xianghe": "You see things from a similar angle, and the rhythm between you works.",
    "num-same": "You think so alike that even the blind spots match — the balance has to come from elsewhere.",
    "num-mohe": "You do things differently, so talk it over before deciding.",
    "west-sun-moon-high": "Your everyday rhythms fit; when one of you is tired, the other understands.",
    "west-venus-mars-high": "The way you are close to each other fits — you like being together.",
    "west-venus-venus-high": "You like similar things, so finding something to do together is easy.",
    "west-moon-moon-high": "You catch each other's moods without needing many words.",
    "west-saturn-high": "You are steady together, so the long term is nothing to worry about.",
    "west-sun-moon-low": "When one of you wants rest and the other wants to go out, the rhythm slips.",
    "west-venus-mars-low": "You are close in different ways — one wants to come nearer, the other wants a little space.",
    "west-venus-venus-low": "You like different things, so spending money and time is where your views are most likely to differ.",
    "west-moon-moon-low": "When one of you is down, you comfort each other in different ways.",
    "west-saturn-low": "The long term will need some care — talk openly about responsibilities and boundaries.",
    "vedic-high": "On the whole, the way you live day to day fits together.",
    "vedic-low-habits": "Some habits and temperaments will need a bit more tolerance from both sides.",
    "vedic-low-general": "On the whole, there is quite a bit to work through — no rush.",
    "palm-shared": "There are things you both care about, and you see them in a similar way.",
    "ziwei-flag": "There is one spot that will need extra care — it is nobody's fault.",
    "reminder-contrast": "When it is smooth, it is very smooth; when it sticks, it sticks clearly. On a stuck day, talking later usually works better than talking it out on the spot.",
    "reminder-smooth": "Much of it is smooth — keep that ease alive in the small everyday things.",
    "reminder-steady": "There is a fair amount to work through, so do not try to settle it all at once — a few separate conversations work better.",
    footer: "For the full reading, including the detailed calculation, a paid complete document is available.",
  },
};

function section(index: HepanIndex, id: string): HepanSystemSection | undefined {
  return index.systems.find((s) => s.id === id);
}

function reading(index: HepanIndex, id: string): HepanReading | undefined {
  return index.bazi.readings.find((r) => r.id === id);
}

function normOf(score: number, max: number | undefined): number {
  return score / (max ?? 100);
}


function dayBranchKind(reading: HepanReading): string | null {
  const line = reading.evidence.find((l) => l.startsWith("主關係："));
  if (!line) return null;
  const match = /主關係：([^（]+)/.exec(line);
  return match ? match[1] : null;
}

function buildCandidates(index: HepanIndex): { strengths: Candidate[]; patience: Candidate[] } {
  const strengths: Candidate[] = [];
  const patience: Candidate[] = [];
  const s = (c: Candidate) => strengths.push(c);
  const p = (c: Candidate) => patience.push(c);
  const mk = (key: string, domain: string, system: string, norm: number, priority: number): Candidate => ({
    key,
    domain,
    system,
    norm,
    priority,
  });

  // 八字：日主
  const dm = reading(index, "day-master");
  if (dm) {
    if (dm.score >= 85) s(mk("dm-generates", "dm", "bazi", 0.85, 2));
    else if (dm.score >= 70) s(mk("dm-same", "dm", "bazi", 0.7, 2));
    else if (dm.score < 65) p(mk("dm-controls", "dm", "bazi", dm.score / 100, 2));
  }

  // 八字：日支
  const db = reading(index, "day-branch");
  if (db) {
    const kind = dayBranchKind(db);
    if (kind === "六合") s(mk("db-liuhe", "db", "bazi", 0.9, 2));
    else if (kind === "半三合" || kind === "半三會") s(mk("db-sanhui", "db", "bazi", 0.8, 2));
    else if (kind === "六沖") p(mk("db-liuchong", "db", "bazi", 0.4, 2));
    else if (db.score < 60) p(mk("db-other-low", "db", "bazi", db.score / 100, 2));
    // score 60 (no clear relation) -> no sentence; nothing to claim
  }

  // 八字：五行互補
  const el = reading(index, "elements");
  if (el) {
    if (el.score >= 70) s(mk("el-high", "el", "bazi", el.score / 100, 2));
    else if (el.score < 50) p(mk("el-low", "el", "bazi", el.score / 100, 2));
  }

  // 生命靈數
  const num = section(index, "numerology")?.readings?.[0];
  if (num) {
    let same = false;
    const evidence = num.evidence.join("");
    const a = /甲生命靈數 (\d+)/.exec(evidence);
    const b = /乙生命靈數 (\d+)/.exec(evidence);
    if (a && b && a[1] === b[1]) same = true;
    if (num.score >= 85) s(mk(same ? "num-same" : "num-xianghe", "num", "numerology", normOf(num.score, num.max), 2));
    else if (num.score < 65) p(mk("num-mohe", "num", "numerology", normOf(num.score, num.max), 2));
  }

  // 西方占星：至多一條，優先級固定
  const west = section(index, "western");
  if (west?.readings?.length) {
    const highOrder: Array<[string, string]> = [
      ["western-sun-moon", "west-sun-moon-high"],
      ["western-venus-mars", "west-venus-mars-high"],
      ["western-venus-venus", "west-venus-venus-high"],
      ["western-moon-moon", "west-moon-moon-high"],
      ["western-saturn", "west-saturn-high"],
    ];
    const lowOrder: Array<[string, string]> = [
      ["western-sun-moon", "west-sun-moon-low"],
      ["western-venus-mars", "west-venus-mars-low"],
      ["western-venus-venus", "west-venus-venus-low"],
      ["western-moon-moon", "west-moon-moon-low"],
      ["western-saturn", "west-saturn-low"],
    ];
    for (const [id, key] of highOrder) {
      const r = west.readings.find((x) => x.id === id);
      if (r && r.score >= 85) {
        s(mk(key, "west", "western", normOf(r.score, r.max), 2));
        break;
      }
    }
    for (const [id, key] of lowOrder) {
      const r = west.readings.find((x) => x.id === id);
      if (r && r.score < 65) {
        p(mk(key, "west", "western", normOf(r.score, r.max), 2));
        break;
      }
    }
  }

  // 印度占星：只看總分（36 點制），分母 15 的局部結果不出句
  const vedic = section(index, "vedic");
  if (vedic && vedic.score !== null && vedic.scoreDenominator === 36) {
    const habitsZero = (vedic.readings ?? []).some(
      (r) => (r.id === "vedic-nadi" || r.id === "vedic-gana") && r.score === 0,
    );
    if (vedic.score >= 24) s(mk("vedic-high", "vedic", "vedic", vedic.score / 36, 2));
    else if (vedic.score < 18) {
      p(mk(habitsZero ? "vedic-low-habits" : "vedic-low-general", "vedic", "vedic", vedic.score / 36, 2));
    }
  }

  // 紫微：磨合點只是一個標記
  const ziwei = section(index, "ziwei");
  if (ziwei?.lines?.some((l) => l.includes("磨合點："))) {
    p(mk("ziwei-flag", "ziwei-flag", "ziwei", 0.45, 1));
  }

  // 一掌經：同道才算
  const palm = section(index, "yizhangjing");
  if (palm?.lines?.some((l) => l.includes("同道："))) {
    s(mk("palm-shared", "palm", "yizhangjing", 0.6, 2));
  }

  return { strengths, patience };
}

function dedupKey(c: Candidate): string {
  // Bazi contributes one sentence per domain (day-master / day-branch /
  // elements); every other system contributes at most one per block.
  return c.system === "bazi" ? `bazi:${c.domain}` : c.system;
}

function pickStrengths(cands: Candidate[]): Candidate[] {
  const byKey = new Map<string, Candidate>();
  for (const c of cands) {
    const k = dedupKey(c);
    const cur = byKey.get(k);
    if (!cur || c.norm > cur.norm) byKey.set(k, c);
  }
  return [...byKey.values()].sort((a, b) => b.norm - a.norm).slice(0, 3);
}

function pickPatience(cands: Candidate[]): Candidate[] {
  const byKey = new Map<string, Candidate>();
  for (const c of cands) {
    const k = dedupKey(c);
    const cur = byKey.get(k);
    if (!cur || c.norm < cur.norm) byKey.set(k, c);
  }
  return [...byKey.values()]
    .sort((a, b) => a.priority - b.priority || a.norm - b.norm)
    .slice(0, 4);
}

export function buildPlainLanguage(index: HepanIndex, locale: PlainLocale): PlainLanguageResult {
  const ph = PHRASES[locale] ?? PHRASES["zh-Hant"];
  const { strengths, patience } = buildCandidates(index);
  const s = pickStrengths(strengths);
  const p = pickPatience(patience);
  const high = index.index >= 75;
  const mid = index.index >= 55;
  return {
    headline: high ? ph["headline-high"] : mid ? ph["headline-mid"] : ph["headline-low"],
    strengths: s.map((c) => ph[c.key]),
    patience: p.map((c) => ph[c.key]),
    reminder:
      index.conflicts.length > 0
        ? ph["reminder-contrast"]
        : p.length === 0
          ? ph["reminder-smooth"]
          : ph["reminder-steady"],
    footer: ph.footer,
  };
}

