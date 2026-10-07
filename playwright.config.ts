import { defineConfig, devices } from "@playwright/test";

const TRADITIONAL_CHINESE_STORAGE = {
  cookies: [],
  origins: [
    {
      origin: "http://127.0.0.1:4173",
      localStorage: [
        { name: "zhaowu.display-language", value: "zh-Hant" },
      ],
    },
  ],
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  // In CI, also emit GitHub-native annotations (file/line/message per failed
  // test) so a failure can be diagnosed from the Checks API without needing
  // the raw job log. Local runs keep the plain line reporter.
  reporter: process.env.CI ? [["line"], ["github"]] : "line",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "iphone-safari",
      testIgnore: /today-visual-regression/,
      use: {
        ...devices["iPhone 13"],
        browserName: "webkit",
        viewport: { width: 390, height: 844 },
        storageState: TRADITIONAL_CHINESE_STORAGE,
      },
    },
    {
      name: "android-chrome",
      testIgnore: /today-visual-regression/,
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
        viewport: { width: 412, height: 915 },
      },
    },
    {
      name: "desktop-chrome",
      testIgnore: /today-visual-regression/,
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      // Screenshot regression: Chromium only, Linux baselines, run via npm run test:visual.
      name: "visual-regression",
      testMatch: /today-visual-regression\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], browserName: "chromium", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, storageState: TRADITIONAL_CHINESE_STORAGE },
    },
    {
      name: "capture",
      testMatch: /capture\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], browserName: "chromium", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, storageState: TRADITIONAL_CHINESE_STORAGE },
    },
  ],
  expect: { toHaveScreenshot: { animations: "disabled", caret: "hide", scale: "css" } },
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFileName}/{arg}{ext}",
  webServer: {
    command: "npm exec vite -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
