import { useEffect, useMemo, useState } from "react";
import type { Chart, Element } from "@/lib/bazi/types";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  loadCustomerGalleryCandidates,
  type GalleryArtKnowledge,
} from "@/lib/gallery-match";
import type { GalleryAsset } from "@/lib/gallery-assets";
import { explainCustomerDecreeImageChoice } from "@/lib/report/decree-selection-copy";

type GalleryCandidate = { asset: GalleryAsset; knowledge: GalleryArtKnowledge };
type ReasonChart = Pick<Chart, "useful" | "drain">;

type Props = {
  chart?: ReasonChart | null;
  question: string;
  selectedAssetId?: string | null;
  compact?: boolean;
};

const COPY = {
  "zh-Hant": { title: "為什麼是這張圖" },
  "zh-Hans": { title: "为什么是这张图" },
  en: { title: "Why this image" },
} as const;

const NEED: Record<Element, Record<Locale, string>> = {
  木: {
    "zh-Hant": "重新往前生長，讓新的可能真正展開",
    "zh-Hans": "重新往前生长，让新的可能真正展开",
    en: "move forward and make room for a new possibility",
  },
  火: {
    "zh-Hant": "把意圖變成清楚而實際的行動",
    "zh-Hans": "把意图变成清楚而实际的行动",
    en: "turn intention into clear, practical action",
  },
  土: {
    "zh-Hant": "先穩住節奏、承載與現實基礎",
    "zh-Hans": "先稳住节奏、承载与现实基础",
    en: "steady your pace and strengthen the practical base",
  },
  金: {
    "zh-Hant": "收掉雜訊，重新做出明確取捨",
    "zh-Hans": "收掉杂讯，重新做出明确取舍",
    en: "cut through noise and make a clearer choice",
  },
  水: {
    "zh-Hant": "保留彈性，讓卡住的地方重新流動",
    "zh-Hans": "保留弹性，让卡住的地方重新流动",
    en: "stay flexible and let a stuck situation move again",
  },
};

function theme(question: string, locale: Locale): string {
  const q = question.toLowerCase();
  const love = /(感情|戀愛|恋爱|正緣|正缘|婚姻|伴侶|伴侣|關係|关系|桃花|love|relationship|partner)/i.test(q);
  const travel = /(旅行|旅遊|旅游|出行|出國|出国|搬家|城市|國家|国家|方向|travel|trip|move|city|country)/i.test(q);
  const work = /(財|财|收入|工作|事業|事业|money|finance|income|career|work)/i.test(q);
  const health = /(健康|修復|修复|療癒|疗愈|身體|身体|health|healing|recover|wellbeing)/i.test(q);

  if (locale === "en") return love ? "relationships" : travel ? "movement and direction" : work ? "work and resources" : health ? "recovery and wellbeing" : "the question you are facing now";
  if (locale === "zh-Hans") return love ? "感情与关系" : travel ? "移动与方向" : work ? "工作与资源" : health ? "修复与身心状态" : "你现在面对的这件事";
  return love ? "感情與關係" : travel ? "移動與方向" : work ? "工作與資源" : health ? "修復與身心狀態" : "你現在面對的這件事";
}

function fallbackReason(chart: ReasonChart, question: string, locale: Locale): string {
  const needs = [...new Set(chart.useful ?? [])].slice(0, 2).map((element) => NEED[element]?.[locale]).filter(Boolean);
  const state = needs.length
    ? locale === "en" ? needs.join(" and ") : needs.join("、")
    : locale === "en" ? "make the next step clearer" : "把下一步看清楚";
  const topic = theme(question, locale);

  if (locale === "en") {
    return `This image stays with your report because it carries the state this reading most needs you to recover now: ${state}. For ${topic}, its role is to hold the direction of the reading in one visual, so you can return to the main point without adding more noise.`;
  }
  if (locale === "zh-Hans") {
    return `这张图留在这份报告里，是因为它承接了这次分析最需要你拿回来的状态：${state}。放回「${topic}」这件事，它把这份分析的主方向收成一个画面，让你回头看时仍能抓住真正重要的那一点。`;
  }
  return `這張圖留在這份報告裡，是因為它承接了這次分析最需要你拿回來的狀態：${state}。放回「${topic}」這件事，它把這份分析的主方向收成一個畫面，讓你回頭看時仍能抓住真正重要的那一點。`;
}

export function DecreeImageReason({ chart, question, selectedAssetId = null, compact = false }: Props) {
  const { locale } = useI18n();
  const [candidates, setCandidates] = useState<GalleryCandidate[]>([]);
  const chartForReason: ReasonChart = chart ?? { useful: [], drain: [] };

  useEffect(() => {
    let active = true;
    if (!selectedAssetId) {
      setCandidates([]);
      return () => { active = false; };
    }

    void loadCustomerGalleryCandidates()
      .then((rows) => {
        if (active) setCandidates(rows);
      })
      .catch(() => {
        if (active) setCandidates([]);
      });

    return () => { active = false; };
  }, [selectedAssetId]);

  const selectedCandidate = useMemo(
    () => selectedAssetId
      ? candidates.find((candidate) => candidate.asset.id === selectedAssetId) ?? null
      : null,
    [candidates, selectedAssetId],
  );

  const reason = selectedCandidate
    ? explainCustomerDecreeImageChoice(chartForReason, question, selectedCandidate, locale)
    : fallbackReason(chartForReason, question, locale);

  return (
    <div
      className={`${compact ? "mt-3" : "mt-4"} rounded-xl border border-line bg-cream p-4 text-sm leading-7 text-ink-soft`}
      data-testid="decree-image-reason"
    >
      <p className="font-display text-base text-ink">{COPY[locale].title}</p>
      <p className="mt-1">{reason}</p>
    </div>
  );
}
