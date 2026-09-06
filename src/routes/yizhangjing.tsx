import { createFileRoute } from "@tanstack/react-router";
import { D60KarmaSection } from "@/components/d60-karma-section";
import { PalmStandalone } from "@/components/palm-standalone";
import { SpecialistSystemPage } from "@/components/specialist-system-page";

export const Route = createFileRoute("/yizhangjing")({ component: PastLifePage });

function PastLifePage() {
  return (
    <>
      <SpecialistSystemPage id="dharma" />
      <PalmStandalone />
      <D60KarmaSection />
    </>
  );
}
