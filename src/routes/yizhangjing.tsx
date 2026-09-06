import { createFileRoute } from "@tanstack/react-router";
import { MethodExplainPage } from "@/components/method-explain-page";

export const Route = createFileRoute("/yizhangjing")({ component: PastLifePage });

function PastLifePage() {
  const integrated = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("mode") === "integrated";
  return (
    <MethodExplainPage
      method={integrated ? "past" : "palm"}
      copies={integrated ? {
        "zh-Hant": { title: "前世今生", hint: "直接沿用同一份生辰，先排達摩一掌經四宮，再以七政性情層作旁證；民俗象意不寫成可驗證歷史。" },
        "zh-Hans": { title: "前世今生", hint: "直接沿用同一份生辰，先排达摩一掌经四宫，再以七政性情层作旁证；民俗象意不写成可验证历史。" },
        en: { title: "Past & Present", hint: "Uses the same birth record for the One-Palm four-palace reading with a Seven-Luminaries temperament cross-check; symbolism is not presented as historical fact." },
      } : {
        "zh-Hant": { title: "達摩一掌經", hint: "直接沿用同一份生辰，排前四世、前三世、前二世與最近一世四宮，以及重複加強、留到今生的習慣。" },
        "zh-Hans": { title: "达摩一掌经", hint: "直接沿用同一份生辰，排前四世、前三世、前二世与最近一世四宫，以及重复加强、留到今生的习惯。" },
        en: { title: "Dharma One-Palm Classic", hint: "Uses the same birth record to generate the four prior-life palaces and repeated habits carried into the present." },
      }}
    />
  );
}
