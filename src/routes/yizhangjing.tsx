import { createFileRoute } from "@tanstack/react-router";
import { MethodExplainPage } from "@/components/method-explain-page";

export const Route = createFileRoute("/yizhangjing")({ component: PastLifePage });

function PastLifePage() {
  return (
    <MethodExplainPage
      copies={{
        "zh-Hant": { title: "達摩一掌經 · 前世今生", hint: "主要看前四世來路、反覆習性，以及被重複加強、留到今生的習慣。" },
        "zh-Hans": { title: "达摩一掌经 · 前世今生", hint: "主要看前四世来路、反复习性，以及被重复加强、留到今生的习惯。" },
        en: { title: "Dharma One-Palm Classic · Past & Present", hint: "Looks at four prior lives and the repeated habits that stay in this life." },
      }}
    />
  );
}
