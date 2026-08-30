import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase-config";

export type BootstrapProgress = {
  percent: number;
  label: string;
  key: string;
};

type BootstrapTask = {
  key: string;
  label: string;
  weight: number;
  run: () => Promise<void>;
};

const REQUEST_TIMEOUT_MS = 2600;

async function withTimeout<T>(run: (signal: AbortSignal) => Promise<T>, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await run(controller.signal);
  } finally {
    window.clearTimeout(timeout);
  }
}

async function waitForDocumentReady() {
  if (document.readyState !== "loading") return;
  await new Promise<void>((resolve) => {
    document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
  });
}

async function verifyDataModel() {
  if (!supabaseConfigured) throw new Error("資料服務尚未配置。");
  const url = `${SUPABASE_URL}/rest/v1/site_settings?key=eq.migration_state&select=key,value&limit=1`;
  const rows = await withTimeout(async (signal) => {
    const res = await fetch(url, {
      signal,
      cache: "no-store",
      headers: {
        apikey: SUPABASE_KEY,
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error(`資料模型檢查失敗（HTTP ${res.status}）。`);
    return res.json() as Promise<Array<{ key?: string; value?: unknown }>>;
  });
  if (!rows.length || rows[0]?.key !== "migration_state") {
    throw new Error("資料模型尚未就緒。");
  }
}

async function warmCoreRuntime() {
  const runtime = await import("@/lib/actions");
  if (typeof runtime.analyzeLife !== "function" || typeof runtime.writeFullReport !== "function") {
    throw new Error("命理核心尚未就緒。");
  }
}

async function warmReportRuntime() {
  const [ninePage, style] = await Promise.all([
    import("@/lib/report/nine-page"),
    import("@/lib/report/paid-report-style"),
  ]);
  if (typeof ninePage.composeNinePageReport !== "function") {
    throw new Error("九頁報告模組尚未就緒。");
  }
  const reportStyle = style.getPaidReportStyle();
  if (reportStyle.status !== "production") {
    throw new Error("付費報告規格尚未就緒。");
  }
}

async function warmImageStandby() {
  const style = await import("@/lib/report/paid-report-style");
  const config = style.getPaidReportStyle();
  if (!config.visual?.ratio?.includes("9:16") || !config.visual?.watermark?.includes("STONE 原創")) {
    throw new Error("四柱繪意規格尚未就緒。");
  }
}

export async function runBootstrapReadiness(onProgress: (progress: BootstrapProgress) => void) {
  const tasks: BootstrapTask[] = [
    { key: "document", label: "正在建立啟動環境", weight: 10, run: waitForDocumentReady },
    { key: "data", label: "正在連接資料模型", weight: 25, run: verifyDataModel },
    { key: "core", label: "正在待命命理核心", weight: 25, run: warmCoreRuntime },
    { key: "report", label: "正在準備九頁報告", weight: 20, run: warmReportRuntime },
    { key: "image", label: "正在待命四柱繪意與命誥圖", weight: 20, run: warmImageStandby },
  ];

  const total = tasks.reduce((sum, task) => sum + task.weight, 0);
  let completed = 0;

  onProgress({ percent: 0, label: "正在啟動昭梧", key: "start" });
  for (const task of tasks) {
    onProgress({
      percent: Math.round((completed / total) * 100),
      label: task.label,
      key: task.key,
    });
    await task.run();
    completed += task.weight;
    onProgress({
      percent: Math.round((completed / total) * 100),
      label: task.label,
      key: task.key,
    });
  }

  onProgress({ percent: 100, label: "準備完成", key: "ready" });
}
