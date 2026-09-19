import { createFileRoute } from "@tanstack/react-router";
import { PalmStandalone } from "@/components/palm-standalone";
import { YizhangjingRuntimeR79 } from "@/components/yizhangjing-runtime-r79";
import { requireOwnerRoute } from "@/lib/auth/owner-route";

export const Route = createFileRoute("/yizhangjing")({ beforeLoad: requireOwnerRoute, component: PastLifePage });

function PastLifePage() {
  return (
    <>
      <PalmStandalone />
      <YizhangjingRuntimeR79 />
    </>
  );
}
