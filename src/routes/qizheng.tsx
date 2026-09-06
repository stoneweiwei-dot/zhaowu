import { createFileRoute } from "@tanstack/react-router";
import { MethodExplainPage } from "@/components/method-explain-page";

export const Route = createFileRoute("/qizheng")({ component: QizhengPage });

function QizhengPage() {
  return (
    <MethodExplainPage
      method="qizheng"
      copies={{
        "zh-Hant": { title: "七政四餘", hint: "直接沿用同一份生辰，生成性情、節奏、壓力反應、關係取向與天時節奏。" },
        "zh-Hans": { title: "七政四余", hint: "直接沿用同一份生辰，生成性情、节奏、压力反应、关系取向与天时节奏。" },
        en: { title: "Seven Luminaries", hint: "Uses the same birth record to generate temperament, rhythm, pressure response, relationships and timing." },
      }}
    />
  );
}
