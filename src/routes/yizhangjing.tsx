import { pageHead } from "@/lib/route-meta";
import { createFileRoute } from "@tanstack/react-router";
import { PalmStandalone } from "@/components/palm-standalone";
import { YizhangjingRuntimeR79 } from "@/components/yizhangjing-runtime-r79";

export const Route = createFileRoute("/yizhangjing")({ head: pageHead, component: PastLifePage });

function PastLifePage() {
  return (
    <>
      <PalmStandalone />
      <YizhangjingRuntimeR79 />
    </>
  );
}
