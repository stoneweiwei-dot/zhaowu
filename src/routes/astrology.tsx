import { createFileRoute } from "@tanstack/react-router";
import { MethodExplainPage } from "@/components/method-explain-page";

export const Route = createFileRoute("/astrology")({ component: AstrologyPage });

function AstrologyPage() {
  const vedic = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("mode") === "vedic";
  return vedic ? (
    <MethodExplainPage
      method="vedic"
      copies={{
        "zh-Hant": { title: "印度古法占星", hint: "沿用同一份生辰做精度檢查；D60 對出生分鐘高度敏感，未驗證層不硬補。" },
        "zh-Hans": { title: "印度古法占星", hint: "沿用同一份生辰做精度检查；D60 对出生分钟高度敏感，未验证层不硬补。" },
        en: { title: "Classical Indian Astrology", hint: "Reuses the same birth record. D60 is minute-sensitive; unverified layers are not fabricated." },
      }}
    />
  ) : (
    <MethodExplainPage
      method="western"
      copies={{
        "zh-Hant": { title: "西洋星座", hint: "主要看太陽、月亮、上升、相位與人生領域（西洋星盤）。" },
        "zh-Hans": { title: "西洋星座", hint: "主要看太阳、月亮、上升、相位与人生领域（西洋星盘）。" },
        en: { title: "Western Astrology", hint: "Looks at Sun, Moon, Rising, aspects and life areas." },
      }}
    />
  );
}
