import type { Chart, Element } from "@/lib/bazi/types";
import { toSimplifiedCustomerText } from "@/lib/report/reading-locale";

/**
 * Plain-language first screen after a visitor saves their birth record
 * (owner 2026-10-08: "不要一股腦炸出命理訊息，全部用白話文列出來").
 *
 * Translation layer only: every line is derived from values the deterministic
 * engine already produced (day master, strength tendency, useful / drain
 * elements, day branch, current luck pillar). Nothing here recalculates the
 * chart, adds a new verdict or changes R6.2.x truth.
 */

export type PlainLocale = "zh-Hant" | "zh-Hans" | "en";
export type PlainItem = { key: string; title: string; body: string };

const STEM_ELEMENT: Record<string, Element> = { 甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水" };

const STEM_PLAIN: Record<string, { zh: string; en: string; image: { zh: string; en: string } }> = {
  甲: { image: { zh: "大樹", en: "a tall tree" }, zh: "有骨氣、肯負責，喜歡自己撐起一片天。要留意：不必什麼都自己扛。", en: "Upright and responsible; you like to hold things up yourself. Watch for: carrying everything alone." },
  乙: { image: { zh: "花草藤蔓", en: "flowers and vines" }, zh: "柔軟有彈性，很會調和人與人之間的關係。要留意：自己的界線要早點說出口。", en: "Flexible and good at smoothing relationships. Watch for: stating your own limits too late." },
  丙: { image: { zh: "太陽", en: "the sun" }, zh: "熱情外放，走到哪裡都能帶動氣氛。要留意：別把自己燒得太乾。", en: "Warm and outgoing; you lift the room. Watch for: burning yourself out." },
  丁: { image: { zh: "燭光", en: "a candle flame" }, zh: "細膩、有耐心，能安靜地照亮身邊的人。要留意：別被拖延和含糊慢慢消耗。", en: "Careful and patient; you quietly light up the people near you. Watch for: being drained by delays and vagueness." },
  戊: { image: { zh: "高山", en: "a mountain" }, zh: "穩重可靠，讓人有安全感。要留意：改變的速度不要太慢、不要太固執。", en: "Steady and dependable; people feel safe around you. Watch for: changing too slowly or holding on too hard." },
  己: { image: { zh: "田園沃土", en: "fertile soil" }, zh: "擅長整理、照顧和整合資源。要留意：別讓別人的雜事全堆到你身上。", en: "Good at organising, caring and bringing resources together. Watch for: other people's chores piling onto you." },
  庚: { image: { zh: "刀劍礦石", en: "raw metal" }, zh: "果斷、俐落，做決定很有魄力。要留意：快的時候別忘了照顧別人的感受。", en: "Decisive and efficient. Watch for: moving so fast that feelings and follow-up costs get missed." },
  辛: { image: { zh: "珠玉", en: "a polished jewel" }, zh: "講究品質、眼光好、看得到細節。要留意：標準太高會讓自己卡住。", en: "You notice quality and detail. Watch for: standards so high that progress stalls." },
  壬: { image: { zh: "江河大海", en: "a river or sea" }, zh: "見識廣、反應快，很會連結人和資源。要留意：吸收太多、做出來太少。", en: "Broad-minded and quick; you connect people and resources. Watch for: taking in a lot but producing too little." },
  癸: { image: { zh: "雨露", en: "rain and dew" }, zh: "敏銳、觀察深，沉得住氣。要留意：等太久才行動，機會會溜走。", en: "Perceptive and patient. Watch for: waiting for certainty so long that chances slip away." },
};

const BRANCH_PLAIN: Record<string, { zh: string; en: string }> = {
  子: { zh: "心裡的事常在夜深人靜時繼續轉，做決定最好給自己一個截止點。", en: "Your mind keeps processing in quiet hours; give decisions a clear deadline." },
  丑: { zh: "習慣先默默承接，等累積很多才說，適合早一點把感受講出來。", en: "You tend to absorb first and speak late; say how you feel earlier." },
  寅: { zh: "一旦決定就會直接行動，先確認方向再全力衝，效果最好。", en: "Once decided you act directly; confirm direction first, then commit fully." },
  卯: { zh: "對環境和關係變化很敏感，保留彈性，但別讓事情長期含糊。", en: "Sensitive to changes around you; stay flexible but avoid long ambiguity." },
  辰: { zh: "腦中資訊會反覆整理，把複雜的事寫下來再決定，會清楚很多。", en: "You keep re-sorting information; write complex things down before deciding." },
  巳: { zh: "判斷很快，但容易一直處在高壓，重要的事要預留休息時間。", en: "You judge quickly but run hot; leave recovery time around big things." },
  午: { zh: "別人的回應會明顯影響你的速度，把目標和底線說清楚最好。", en: "Feedback strongly affects your pace; state your goals and limits openly." },
  未: { zh: "常先照顧別人或環境的需要，記得替自己保留位置和資源。", en: "You often look after others first; keep space and resources for yourself." },
  申: { zh: "很會拆解問題，溝通時記得補上關係和執行成本的考量。", en: "You break problems down well; remember relationship and execution costs." },
  酉: { zh: "標準和眼光都高，先講清楚最低底線，避免過度挑剔。", en: "You have high standards; state your minimum clearly and avoid over-polishing." },
  戌: { zh: "重視承諾和一致，合作與感情中把責任範圍說清楚最安心。", en: "You value commitment; spell out who is responsible for what." },
  亥: { zh: "內心處理的事情很多，需要減少噪音，留一段固定的獨處時間。", en: "A lot goes on inside; cut noise and keep regular time alone." },
};

const ELEMENT_HELP: Record<Element, { zh: string; en: string; color: { zh: string; en: string } }> = {
  木: { zh: "學習成長、閱讀、多接觸自然和植物", en: "learning, reading and time in nature", color: { zh: "綠色系", en: "greens" } },
  火: { zh: "表達自己、運動、曬太陽、讓人看見你的成果", en: "expressing yourself, exercise, sunlight and visible results", color: { zh: "紅橙暖色", en: "warm reds and oranges" } },
  土: { zh: "規律作息、整理環境、做穩定可靠的承諾", en: "steady routines, tidying up and dependable commitments", color: { zh: "大地色、米黃", en: "earth tones" } },
  金: { zh: "定規則、做決定、斷捨離、把標準說清楚", en: "setting rules, deciding, decluttering and clear standards", color: { zh: "白、金、銀色", en: "white, gold and silver" } },
  水: { zh: "好好休息、安靜思考、交流和適度的旅行流動", en: "rest, quiet thinking, conversation and some travel", color: { zh: "黑、深藍色", en: "black and deep blue" } },
};

const ELEMENT_DRAIN: Record<Element, { zh: string; en: string }> = {
  木: { zh: "同時開太多頭、什麼都想做", en: "starting too many things at once" },
  火: { zh: "太急太躁、過度燃燒熱情", en: "rushing and burning through enthusiasm" },
  土: { zh: "扛太多別人的事、死守舊習慣", en: "carrying other people's loads and clinging to old habits" },
  金: { zh: "太硬太挑剔、跟人正面硬碰", en: "being too hard or critical and clashing head-on" },
  水: { zh: "想太多、情緒堆著不處理、拖延", en: "overthinking, bottled-up feelings and procrastination" },
};

function joinZh(items: string[]) { return items.join("；"); }

export function buildPlainChartSummary(chart: Chart, locale: PlainLocale): PlainItem[] {
  const en = locale === "en";
  const stem = STEM_PLAIN[chart.dayMaster];
  const dayBranch = chart.pillars.find((pillar) => pillar.key === "day")?.zhi ?? "";
  const branch = BRANCH_PLAIN[dayBranch];
  const useful = (chart.useful ?? []).filter((el) => ELEMENT_HELP[el]);
  const drain = (chart.drain ?? []).filter((el) => ELEMENT_DRAIN[el]);
  const items: PlainItem[] = [];

  if (stem) {
    items.push(en
      ? { key: "nature", title: "Who you are at heart", body: `Your core is ${chart.dayMaster} (${chart.dayMasterElement}) — like ${stem.image.en}. ${stem.en}` }
      : { key: "nature", title: "你是什麼樣的人", body: `你的本命是「${chart.dayMaster}${chart.dayMasterElement}」，像${stem.image.zh}。${stem.zh}` });
  }

  const tendency = chart.strength?.tendency ?? "";
  const energy = tendency === "偏旺"
    ? { zh: "你的能量偏足、主見強、扛得住壓力。最適合把力氣花出去：做事、輸出、幫助人，而不是悶在心裡。", en: "Your energy runs strong; you have opinions and handle pressure. Spend that energy outward—work, create, help—rather than holding it in." }
    : tendency === "偏弱"
      ? { zh: "你比較容易被環境和人消耗。先把自己照顧好，找對的人和環境借力，穩了再往前衝。", en: "You are more easily drained by people and surroundings. Look after yourself first, lean on the right people and places, then push forward." }
      : { zh: "你的能量大致平衡，進可攻、退可守。重點是穩定的節奏，不要忽冷忽熱。", en: "Your energy is fairly balanced. What matters most is a steady rhythm rather than bursts and crashes." };
  items.push(en ? { key: "energy", title: "Your natural energy", body: energy.en } : { key: "energy", title: "你天生的能量", body: energy.zh });

  if (useful.length) {
    const body = en
      ? `What tends to help you: ${useful.map((el) => ELEMENT_HELP[el].en).join("; ")}. Helpful colours: ${useful.map((el) => ELEMENT_HELP[el].color.en).join(", ")}.${chart.usefulProvisional ? " (An early reading—confirm against real life.)" : ""}`
      : `${joinZh(useful.map((el) => ELEMENT_HELP[el].zh))}。適合的顏色：${useful.map((el) => ELEMENT_HELP[el].color.zh).join("、")}。${chart.usefulProvisional ? "（初步判斷，請以實際生活感受核對。）" : ""}`;
    items.push(en ? { key: "helps", title: "What helps you", body } : { key: "helps", title: "對你有幫助的事", body });
  }

  if (drain.length) {
    const body = en
      ? `Easier to drain you: ${drain.map((el) => ELEMENT_DRAIN[el].en).join("; ")}.`
      : `${joinZh(drain.map((el) => ELEMENT_DRAIN[el].zh))}。`;
    items.push(en ? { key: "drains", title: "What drains you", body } : { key: "drains", title: "容易消耗你的事", body });
  }

  if (branch) {
    items.push(en ? { key: "inner", title: "Your inner habits & close relationships", body: branch.en } : { key: "inner", title: "你的內在習慣與親密關係", body: branch.zh });
  }

  const dayun = chart.currentDayun;
  if (dayun && dayun.ganZhi) {
    const dayunElement = STEM_ELEMENT[dayun.ganZhi[0]];
    const tone = dayunElement && useful.includes(dayunElement) ? "smooth" : dayunElement && drain.includes(dayunElement) ? "adjust" : "steady";
    const zhTone = tone === "smooth" ? "大方向對你比較順，適合主動推進想做的事。" : tone === "adjust" ? "需要多一點調整和自我保養，先穩住基本盤，不必硬衝。" : "整體平穩，靠累積和選對方向慢慢拉開差距。";
    const enTone = tone === "smooth" ? "the overall direction tends to support you—a good time to push what you want." : tone === "adjust" ? "it asks for more adjustment and self-care—secure the basics before pushing hard." : "it is broadly steady—progress comes from accumulation and good choices.";
    items.push(en
      ? { key: "decade", title: "This decade", body: `Ages ${dayun.startAge}–${dayun.endAge} (${dayun.startYear}–${dayun.endYear}): ${enTone}` }
      : { key: "decade", title: "你現在這十年", body: `${dayun.startAge}–${dayun.endAge} 歲（${dayun.startYear}–${dayun.endYear} 年）：${zhTone}` });
  }

  if (chart.timeUnknown) {
    items.push(en
      ? { key: "time", title: "About your birth time", body: "Without a birth time, the hour pillar is unknown, so finer details and timing stay broad." }
      : { key: "time", title: "關於出生時間", body: "沒有出生時辰，時柱無法確定，所以細節與時間點只能看大方向。" });
  }

  if (locale === "zh-Hans") return items.map((item) => ({ ...item, title: toSimplifiedCustomerText(item.title), body: toSimplifiedCustomerText(item.body) }));
  return items;
}
