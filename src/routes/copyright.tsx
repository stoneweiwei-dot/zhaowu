import { pageHead } from "@/lib/route-meta";
import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/copyright")({ head: pageHead, component: CopyrightPage });

function CopyrightPage() {
  return <LegalPage doc="copyright" />;
}
