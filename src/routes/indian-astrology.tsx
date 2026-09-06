import { createFileRoute } from "@tanstack/react-router";
import { SpecialistSystemPage } from "@/components/specialist-system-page";

export const Route = createFileRoute("/indian-astrology")({ component: IndianAstrologyPage });

function IndianAstrologyPage() {
  return <SpecialistSystemPage id="indian" />;
}
