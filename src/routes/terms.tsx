import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/terms")({ component: TermsPage });

function TermsPage() {
  return <LegalPage doc="terms" />;
}
