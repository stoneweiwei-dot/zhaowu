import { createFileRoute } from "@tanstack/react-router";
import { SpecialistSystemPage } from "@/components/specialist-system-page";
import { requireOwnerRoute } from "@/lib/auth/owner-route";

export const Route = createFileRoute("/astrology")({ beforeLoad: requireOwnerRoute, component: WesternAstrologyPage });

function WesternAstrologyPage() {
  return <SpecialistSystemPage id="western" />;
}
