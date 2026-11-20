import { createFileRoute } from "@tanstack/react-router";
import { SpecialistSystemPage } from "@/components/specialist-system-page";

export const Route = createFileRoute("/astrology")({ component: WesternAstrologyPage });

function WesternAstrologyPage() {
  return <SpecialistSystemPage id="western" />;
}
