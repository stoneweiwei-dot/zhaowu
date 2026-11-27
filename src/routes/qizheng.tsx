import { pageHead } from "@/lib/route-meta";
import { createFileRoute } from "@tanstack/react-router";
import { SpecialistSystemPage } from "@/components/specialist-system-page";

export const Route = createFileRoute("/qizheng")({ head: pageHead, component: QizhengPage });

function QizhengPage() {
  return <SpecialistSystemPage id="qizheng" />;
}
