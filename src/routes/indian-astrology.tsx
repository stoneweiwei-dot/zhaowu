import { createFileRoute } from "@tanstack/react-router";
import { SpecialistSystemPage } from "@/components/specialist-system-page";
import { requireOwnerRoute } from "@/lib/auth/owner-route";

export const Route = createFileRoute("/indian-astrology")({ beforeLoad: requireOwnerRoute, component: IndianAstrologyPage });

function IndianAstrologyPage() {
  return <SpecialistSystemPage id="indian" />;
}
