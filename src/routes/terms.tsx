import { pageHead } from "@/lib/route-meta";
import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/terms")({ head: pageHead, component: TermsPage });

function TermsPage() {
  return <LegalPage doc="terms" />;
}
