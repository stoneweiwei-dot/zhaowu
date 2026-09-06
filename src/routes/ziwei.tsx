import { createFileRoute } from "@tanstack/react-router";
import { MethodExplainPage } from "@/components/method-explain-page";

export const Route = createFileRoute("/ziwei")({ component: ZiweiPage });

function ZiweiPage() {
  return (
    <MethodExplainPage
      copies={{
        "zh-Hant": { title: "紫微斗數", hint: "主要看性格、關係、事業、財務與十年主軸。" },
        "zh-Hans": { title: "紫微斗数", hint: "主要看性格、关系、事业、财务与十年主轴。" },
        en: { title: "Zi Wei Dou Shu", hint: "Looks at character, relationships, work, money and the decade focus." },
      }}
    />
  );
}
