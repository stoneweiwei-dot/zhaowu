import { useMemo } from "react";
import type { AnalysisResult } from "@/lib/bazi/types";
import { useI18n, type Locale } from "@/lib/i18n";
import { buildEvidenceGovernanceModel, type EvidenceItem } from "@/lib/report/evidence-governance";

const COPY: Record<Locale, {
  kicker: string;
  title: string;
  lead: string;
  levels: Record<EvidenceItem["level"], string>;
  states: Record<EvidenceItem["state"], string>;
  items: Record<string, string>;
}> = {
  "zh-Hant": {
    kicker: "ZHAOWU · 證據治理",
    title: "結論可信度",
    lead: "每項判斷都標示來源與權重；資料不足時保留，不用模板補完。",
    levels: { A: "A · 主判", B: "B · 獨立驗證", C: "C · 輔助", D: "D · 象徵／不判" },
    states: { verified: "已校驗", probable: "較高概率", disputed: "流派爭議", symbolic: "藝術象徵", withheld: "不作判定" },
    items: {
      "birth-chart": "出生資料與原始排盤",
      "day-master": "日主",
      "month-command": "月令",
      "useful-elements": "喜用／調節方向",
      "formal-structure-remedy": "正式格局病藥",
      "symbolic-art": "古畫與命象視覺",
    },
  },
  "zh-Hans": {
    kicker: "ZHAOWU · 证据治理",
    title: "结论可信度",
    lead: "每项判断都标示来源与权重；资料不足时保留，不用模板补完。",
    levels: { A: "A · 主判", B: "B · 独立验证", C: "C · 辅助", D: "D · 象征／不判" },
    states: { verified: "已校验", probable: "较高概率", disputed: "流派争议", symbolic: "艺术象征", withheld: "不作判定" },
    items: {
      "birth-chart": "出生资料与原始排盘",
      "day-master": "日主",
      "month-command": "月令",
      "useful-elements": "喜用／调节方向",
      "formal-structure-remedy": "正式格局病药",
      "symbolic-art": "古画与命象视觉",
    },
  },
  en: {
    kicker: "ZHAOWU · EVIDENCE GOVERNANCE",
    title: "Confidence of conclusions",
    lead: "Every conclusion is tagged by source and weight. Missing evidence stays unresolved rather than being filled by a template.",
    levels: { A: "A · Primary", B: "B · Independent check", C: "C · Supporting", D: "D · Symbolic / withheld" },
    states: { verified: "Verified", probable: "Probable", disputed: "Disputed", symbolic: "Symbolic", withheld: "Withheld" },
    items: {
      "birth-chart": "Birth data and calculated chart",
      "day-master": "Core day stem",
      "month-command": "Birth-month command",
      "useful-elements": "Balancing direction",
      "formal-structure-remedy": "Formal structure-and-remedy judgement",
      "symbolic-art": "Artwork and symbolic imagery",
    },
  },
};

export function EvidenceGovernancePanel({ result }: { result: AnalysisResult }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const model = useMemo(() => buildEvidenceGovernanceModel(result), [result]);

  return (
    <section
      aria-labelledby="zhaowu-evidence-governance-title"
      style={{
        margin: "0 0 18px",
        border: "1px solid rgba(124, 91, 53, .22)",
        borderRadius: 16,
        padding: 14,
        background: "rgba(251, 246, 235, .92)",
        color: "#302b24",
      }}
    >
      <p style={{ margin: 0, color: "#956b38", fontSize: 9, fontWeight: 700, letterSpacing: ".18em" }}>{copy.kicker}</p>
      <h4 id="zhaowu-evidence-governance-title" style={{ margin: "5px 0 0", fontFamily: "var(--font-display, serif)", fontSize: "1.05rem" }}>{copy.title}</h4>
      <p style={{ margin: "6px 0 12px", color: "#6d6153", fontSize: 10.5, lineHeight: 1.65 }}>{copy.lead}</p>
      <div style={{ display: "grid", gap: 7 }}>
        {model.items.map((item) => (
          <div
            key={item.key}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) auto",
              gap: 10,
              alignItems: "center",
              borderTop: "1px solid rgba(124, 91, 53, .12)",
              paddingTop: 7,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <b style={{ display: "block", fontSize: 10.5 }}>{copy.items[item.key] ?? item.key}</b>
              <span style={{ display: "block", marginTop: 3, color: "#806f5d", fontSize: 9 }}>{copy.levels[item.level]}</span>
            </div>
            <span
              style={{
                borderRadius: 999,
                padding: "5px 8px",
                background: item.state === "withheld" || item.state === "symbolic" ? "rgba(132, 112, 84, .11)" : item.state === "probable" ? "rgba(167, 116, 49, .12)" : "rgba(65, 93, 76, .12)",
                color: item.state === "withheld" || item.state === "symbolic" ? "#776a5b" : item.state === "probable" ? "#8d652e" : "#405d4e",
                fontSize: 9,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {copy.states[item.state]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
