import { defineConfig, devices } from "@playwright/test";

/**
 * Post-deploy smoke test against the REAL production site (no local dev server).
 * Run by .github/workflows/production-smoke.yml after every push to main, once
 * https://…/release.json reports the exact commit that was pushed.
 * A red result here means "production is not healthy" — never report a task done on a green build alone.
 */
export default defineConfig({
  testDir: "./e2e-production",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 45_000,
  reporter: process.env.CI ? [["line"], ["github"]] : "line",
  use: {
    baseURL: process.env.PROD_URL || "https://stone-zhaowu-official.vercel.app",
    trace: "retain-on-failure",
    ...devices["iPhone 13"],
    browserName: "webkit",
    viewport: { width: 390, height: 844 },
  },
});
