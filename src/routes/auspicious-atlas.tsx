import { createFileRoute, Link } from "@tanstack/react-router";
import { AuspiciousGallerySection } from "@/components/auspicious-gallery-section";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auspicious-atlas")({ component: AuspiciousAtlasPage });

function AuspiciousAtlasPage() {
  const { locale } = useI18n();
  const back = locale === "en" ? "Back to home" : locale === "zh-Hans" ? "返回主页" : "返回主頁";

  return (
    <main className="mx-auto max-w-6xl space-y-5 pb-12">
      <Link
        to="/"
        className="inline-flex min-h-11 items-center rounded-full border border-line bg-cream px-5 text-sm text-ink-soft"
      >
        ← {back}
      </Link>
      <AuspiciousGallerySection mode="full" />
    </main>
  );
}
