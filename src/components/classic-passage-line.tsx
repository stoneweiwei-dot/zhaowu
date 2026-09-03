import { useEffect, useState } from "react";
import type { AnalysisResult } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import { fetchClassicPassage, type ClassicPassage } from "@/lib/report/classic-passage";

const COPY = {
  "zh-Hant": { label: "與此刻相應的一句" },
  "zh-Hans": { label: "与此刻相应的一句" },
  en: { label: "A line for this moment" },
} as const;

export function ClassicPassageLine({ result }: { result: AnalysisResult }) {
  const { locale } = useI18n();
  const [passage, setPassage] = useState<ClassicPassage | null>(null);

  useEffect(() => {
    if (locale === "en") {
      setPassage(null);
      return;
    }

    const controller = new AbortController();
    setPassage(null);
    void fetchClassicPassage(result, locale, controller.signal).then((next) => {
      if (!controller.signal.aborted) setPassage(next);
    });
    return () => controller.abort();
  }, [result.id, locale]);

  if (!passage || locale === "en") return null;

  const sourceTitle = locale === "zh-Hans" ? passage.source_title_zh_hans : passage.source_title_zh_hant;
  const text = locale === "zh-Hans" ? (passage.simplified_text || passage.original_text) : passage.original_text;

  return (
    <div className="zhaowu-report-classic-passage" data-passage-key={passage.passage_key}>
      <p className="zhaowu-report-classic-meta"><strong>{COPY[locale].label}</strong> · {sourceTitle} · {passage.locator}</p>
      <p className="zhaowu-report-classic-quote">「{text}」</p>
    </div>
  );
}
