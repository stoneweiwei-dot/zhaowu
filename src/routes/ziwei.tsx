import { createFileRoute } from "@tanstack/react-router";
import { MethodExplainPage } from "@/components/method-explain-page";

export const Route = createFileRoute("/ziwei")({ component: ZiweiPage });

function ZiweiPage() {
  return (
    <MethodExplainPage
      method="ziwei"
      copies={{
        "zh-Hant": { title: "紫微斗數", hint: "直接沿用同一份生辰，生成命宮、身宮、五行局、命宮主星與生年四化等已驗證本命骨架。" },
        "zh-Hans": { title: "紫微斗数", hint: "直接沿用同一份生辰，生成命宫、身宫、五行局、命宫主星与生年四化等已验证本命骨架。" },
        en: { title: "Zi Wei Dou Shu", hint: "Uses the same birth record to generate the verified natal backbone: Life/Body palaces, bureau, major stars and natal transformations." },
      }}
    />
  );
}
