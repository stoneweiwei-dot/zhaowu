import { createFileRoute } from "@tanstack/react-router";
import { D60KarmaSection } from "@/components/d60-karma-section";
import { PalmStandalone } from "@/components/palm-standalone";

export const Route = createFileRoute("/yizhangjing")({ component: PastLifePage });

function PastLifePage() {
  return (
    <>
      <PalmStandalone />
      <D60KarmaSection />
    </>
  );
}
