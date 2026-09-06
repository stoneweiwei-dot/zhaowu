import { createFileRoute } from "@tanstack/react-router";
import { MethodExplainPage } from "@/components/method-explain-page";

export const Route = createFileRoute("/astrology")({ component: WesternAstrologyPage });

function WesternAstrologyPage() {
  return (
    <MethodExplainPage
      copies={{
        "zh-Hant": { title: "西洋星座", hint: "主要看太陽、月亮、上升、相位與人生領域（西洋星盤）。" },
        "zh-Hans": { title: "西洋星座", hint: "主要看太阳、月亮、上升、相位与人生领域（西洋星盘）。" },
        en: { title: "Western Astrology", hint: "Looks at Sun, Moon, Rising, aspects and life areas." },
      }}
    />
  );
}
