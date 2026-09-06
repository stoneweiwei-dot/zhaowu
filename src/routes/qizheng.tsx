import { createFileRoute } from "@tanstack/react-router";
import { MethodExplainPage } from "@/components/method-explain-page";

export const Route = createFileRoute("/qizheng")({ component: QizhengPage });

function QizhengPage() {
  return (
    <MethodExplainPage
      copies={{
        "zh-Hant": { title: "七政四餘", hint: "主要看性情、節奏、壓力反應與天時變化。" },
        "zh-Hans": { title: "七政四余", hint: "主要看性情、节奏、压力反应与天时变化。" },
        en: { title: "Seven Luminaries", hint: "Looks at temperament, rhythm, pressure response and timing." },
      }}
    />
  );
}
