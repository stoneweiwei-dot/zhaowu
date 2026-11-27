import { pageHead } from "@/lib/route-meta";
import { createFileRoute } from "@tanstack/react-router";
import { SpecialistSystemPage } from "@/components/specialist-system-page";

export const Route = createFileRoute("/ziwei")({ head: pageHead, component: ZiweiPage });

function ZiweiPage() {
  return <SpecialistSystemPage id="ziwei" />;
}
