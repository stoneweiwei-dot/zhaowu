import { createFileRoute } from "@tanstack/react-router";
import { SpecialistSystemPage } from "@/components/specialist-system-page";

export const Route = createFileRoute("/ziwei")({ component: ZiweiPage });

function ZiweiPage() {
  return <SpecialistSystemPage id="ziwei" />;
}
