import { buildTravelDestinationAnswer, extractNamedPlaces, pickTravelDestinations } from "@/lib/bazi/forecast";
import { buildDistinctTimingAnswer } from "@/lib/bazi/forecast-safe";
import { inspectAnswerRequirements } from "@/lib/core/answer-contract";
import type { Chart, Reading } from "@/lib/bazi/types";
import { applyCosmicSymbolicReading, isCosmicSymbolicQuestion } from "@/lib/symbolic/cosmic-profile";

const ELEMENT_PROFILE_RE = /(五行.{0,8}(屬性|属性|主導|主导|分布|比例|占比|能量|哪個最多|哪个最多)|哪個五行|哪个五行|五行誰最強|五行谁最强)/;
const TRAVEL_FOLLOWUP_RE = /((具體|具体|推薦|推荐|適合|适合).{0,16}(國家|国家|城市|目的地)|(國家|国家|城市|目的地).{0,16}(旅行|旅遊|旅游|度假|充電|充电|適合|适合|推薦|推荐))/;
const CAUTION_RE = /(注意|小心|風險|风险|避開|避开|careful|watch out|caution|risk|avoid)/i;
const ENGLISH_RE = /[A-Za-z]{4,}/;
const HAN_RE = /[\u3400-\u9fff]/;

function elementProfileAnswer(chart: Chart): string {
  const entries = Object.entries(chart.elementPercents) as [keyof Chart["elementPercents"], number][];
  const ranked = [...entries].sort((a, b) => b[1] - a[1]);
  const topValue = ranked[0]?.[1] ?? 0;
  const leaders = ranked.filter(([, value]) => value === topValue).map(([element]) => element);
  const detail = ranked.map(([element, value]) => `${element}${value}%`).join("、");
  const leaderText = leaders.length > 1 ? `${leaders.join("、")}並列最高` : `${leaders[0] ?? "—"}最高`;
  return `直接結論：以目前四柱天干＋藏干的結構計數看，${leaderText}。分布是：${detail}。這個比例只回答「盤面有哪些五行、數量結構如何」，不等同旺衰權重；身強身弱仍以月令、根氣與扶泄制化判。你的日主是${chart.dayMaster}${chart.dayMasterElement}，原局旺衰目前判為${chart.strength.tendency}。`;
}

function englishPlace(question: string): string | null {
  const match = question.match(/\b(Seoul|Tokyo|Kyoto|Osaka|Singapore|Busan|Sydney|Melbourne|Paris|London|Vienna|Bali|Okinawa)\b/i);
  return match?.[1] ?? null;
}

function travelCautionAnswer(question: string, chart: Chart): string {
  const named = extractNamedPlaces(question)[0] ?? englishPlace(question);
  const place = named || "這次行程";
  const strong = chart.strength.tendency.includes("旺");
  if (ENGLISH_RE.test(question) && !HAN_RE.test(question)) {
    return `For ${place}, the main thing to watch is itinerary overload. Your chart is currently ${chart.strength.tendency} at the base level, so use the trip to discharge pressure rather than create another packed project: keep daily transfers low, leave one recovery block each day, avoid stacking several late nights, and keep budget/transport/weather buffer. This is a timing-and-rhythm reading, not a safety guarantee; use current official travel advice for real-world safety.`;
  }
  return `直接結論：去${place}最需要防的不是「不能去」，而是把行程排成另一個工作項目。你的原局目前是${chart.strength.tendency}，${strong ? "更適合用旅行做泄放與換氣，不適合每天塞滿景點" : "更需要保留恢復時間，不適合連續高強度轉場"}。實際安排抓四件事：少轉場、每天留一段空白、不要連續熬夜、交通／天氣／預算各留緩衝。現實安全仍以當地最新官方資訊為準。`;
}

function travelAnswer(question: string, chart: Chart, reading: Reading): Reading {
  const req = inspectAnswerRequirements(question);
  if (CAUTION_RE.test(question)) {
    const englishOnly = ENGLISH_RE.test(question) && !HAN_RE.test(question);
    return {
      ...reading,
      directAnswer: travelCautionAnswer(question, chart),
      action: englishOnly
        ? "Keep one low-load block in every travel day and verify transport, weather and official advisories before departure."
        : "把每一天至少留一段空白，出發前再核對交通、天氣與官方安全資訊。",
    };
  }

  const where = buildTravelDestinationAnswer(chart, req.targetYears, {
    months: req.targetMonths,
    question,
  });
  const timing = req.asksWhen
    ? buildDistinctTimingAnswer(chart, "travel", req.targetYears, req.targetMonths)
    : "";
  const picks = pickTravelDestinations(chart, req.targetYears[0], req.targetMonths);
  const first = picks[0]?.name ?? "主選目的地";
  return {
    ...reading,
    directAnswer: [where, timing].filter(Boolean).join(" "),
    action: `先把${first}當主選，只留一個備選；日期落在較順窗口，再按機票、假期、預算和體力做最後決定。`,
  };
}

/**
 * Last customer-facing correction layer. It only overrides answers when a
 * concrete, reproducible routing failure exists; it does not recalculate the chart.
 */
export function applyCustomerAnswerHotfix(question: string, chart: Chart, reading: Reading): Reading {
  if (isCosmicSymbolicQuestion(question)) {
    const locale = ENGLISH_RE.test(question) && !HAN_RE.test(question) ? "en" : "zh-Hans";
    return applyCosmicSymbolicReading(question, chart, reading, locale);
  }

  if (ELEMENT_PROFILE_RE.test(question)) {
    return {
      ...reading,
      kind: "self",
      directAnswer: elementProfileAnswer(chart),
      action: "先分清兩件事：五行分布看結構，身強身弱看月令與扶泄；不要再用同一個百分比回答兩個不同問題。",
    };
  }

  const req = inspectAnswerRequirements(question);
  const travelIntent = req.asksTravel || TRAVEL_FOLLOWUP_RE.test(question) || /\b(travel|trip|vacation)\b/i.test(question);
  if (travelIntent) return travelAnswer(question, chart, reading);

  if (req.asksWhen && !/(感情.*工作|工作.*感情|工作.*財|工作.*财|財.*工作|财.*工作)/.test(question)) {
    const topic = reading.kind === "timing" ? "self" : reading.kind;
    return {
      ...reading,
      directAnswer: buildDistinctTimingAnswer(chart, topic, req.targetYears, req.targetMonths),
    };
  }

  return reading;
}
