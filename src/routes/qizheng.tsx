import { createFileRoute } from "@tanstack/react-router";
import { SpecialistSystemPage } from "@/components/specialist-system-page";
import { requireOwnerRoute } from "@/lib/auth/owner-route";

export const Route = createFileRoute("/qizheng")({ beforeLoad: requireOwnerRoute, component: QizhengPage });

function QizhengPage() {
  return <SpecialistSystemPage id="qizheng" />;
}
