import type { DecisionReportModel } from "@/lib/report/decision-report-model";
import type { Locale } from "@/lib/i18n";

const COPY = {
  "zh-Hant": { title: "簡明導讀", lead: "先看這一問，再決定要不要展開完整命書。", question: "你問的是", answer: "直接答案", why: "為什麼", risk: "需要留意", action: "下一步", evidence: "展開命理依據", limit: "這份導讀只整理已形成的判斷；其餘主題請看專業命書。" },
  "zh-Hans": { title: "简明导读", lead: "先看这一问，再决定要不要展开完整命书。", question: "你问的是", answer: "直接答案", why: "为什么", risk: "需要留意", action: "下一步", evidence: "展开命理依据", limit: "这份导读只整理已形成的判断；其余主题请看专业命书。" },
  en: { title: "Reading guide", lead: "Start with your question, then open the full reading when needed.", question: "Your question", answer: "Direct answer", why: "Why", risk: "What to watch", action: "Next step", evidence: "Open reading basis", limit: "This guide uses existing conclusions only. Read the full report for other topics." },
} as const;

/** Presentation only: every claim is a direct field from the existing decision model. */
export function MobileReadingGuide({ model, locale }: { model: DecisionReportModel; locale: Locale }) {
  const copy = COPY[locale];
  const reasons = model.reasons.filter(Boolean).slice(0, 2);
  const risks = model.risks.filter(Boolean).slice(0, 1);
  return <section className="zhaowu-mobile-guide" aria-labelledby="mobile-reading-guide-title" data-mobile-reading-guide>
    <header>
      <p className="zhaowu-mobile-guide__eyebrow">ZHAOWU · {copy.title}</p>
      <h3 id="mobile-reading-guide-title">{copy.title}</h3>
      <p>{copy.lead}</p>
    </header>
    <div className="zhaowu-mobile-guide__chapter">
      <h4>{copy.question}</h4>
      <p>{model.contract.primaryQuestion}</p>
    </div>
    <div className="zhaowu-mobile-guide__chapter zhaowu-mobile-guide__answer">
      <h4>{copy.answer}</h4>
      <p>{model.directAnswer}</p>
    </div>
    {reasons.length ? <div className="zhaowu-mobile-guide__chapter"><h4>{copy.why}</h4>{reasons.map((line, index) => <p key={index}>{line}</p>)}</div> : null}
    {risks.length ? <div className="zhaowu-mobile-guide__chapter"><h4>{copy.risk}</h4>{risks.map((line, index) => <p key={index}>{line}</p>)}</div> : null}
    {model.nextAction ? <div className="zhaowu-mobile-guide__chapter"><h4>{copy.action}</h4><p>{model.nextAction}</p></div> : null}
    <details className="zhaowu-mobile-guide__evidence">
      <summary>{copy.evidence}</summary>
      <p>{model.confidenceBasis}</p>
      {model.biggestVariable ? <p>{model.biggestVariable}</p> : null}
    </details>
    <p className="zhaowu-mobile-guide__limit">{copy.limit}</p>
  </section>;
}
