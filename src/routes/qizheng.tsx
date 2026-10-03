import { createFileRoute } from "@tanstack/react-router";
import { SpecialistSystemPage } from "@/components/specialist-system-page";

export const Route = createFileRoute("/qizheng")({ component: QizhengPage });

function QizhengPage() {
  return <SpecialistSystemPage id="qizheng" />;
}
