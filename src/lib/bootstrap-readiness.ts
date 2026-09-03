export type BootstrapProgress = {
  percent: number;
  label: string;
  key: string;
};

async function waitForDocumentReady() {
  if (document.readyState !== "loading") return;
  await new Promise<void>((resolve) => {
    document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
  });
}

/**
 * Startup readiness is deliberately local-only.
 *
 * The application shell is already mounted underneath the decorative intro,
 * so Supabase, report generation, images and calculation bundles must never
 * become prerequisites for revealing Home/Login/Account. Those capabilities
 * load on demand after the user can use the site.
 */
export async function runBootstrapReadiness(onProgress: (progress: BootstrapProgress) => void) {
  onProgress({ percent: 0, label: "正在啟動昭梧", key: "start" });
  await waitForDocumentReady();
  onProgress({ percent: 80, label: "正在建立頁面", key: "document" });

  // Yield once so the already-mounted application shell can paint before the
  // decorative intro finishes. No network or report/image warmup belongs here.
  await Promise.resolve();

  onProgress({ percent: 100, label: "準備完成", key: "ready" });
}
