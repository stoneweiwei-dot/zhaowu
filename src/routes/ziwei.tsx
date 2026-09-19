import { createFileRoute } from "@tanstack/react-router";
import { SpecialistSystemPage } from "@/components/specialist-system-page";
import { requireOwnerRoute } from "@/lib/auth/owner-route";

export const Route = createFileRoute("/ziwei")({ beforeLoad: requireOwnerRoute, component: ZiweiPage });

function ZiweiPage() {
  return <SpecialistSystemPage id="ziwei" />;
}
