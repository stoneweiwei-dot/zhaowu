import type { ReportAccessLevel } from "@/lib/report-access";

type AccessResult = { level: ReportAccessLevel; pending: boolean; owner: boolean };

/** Recheck a pending server-side entitlement without overlapping requests. */
export function watchReportAccess(
  resolve: () => Promise<AccessResult>,
  onResult: (result: AccessResult) => void,
  onError: () => void,
  options: { intervalMs?: number; maxAttempts?: number } = {},
) {
  const intervalMs = options.intervalMs ?? 3000;
  const maxAttempts = options.maxAttempts ?? 20;
  let cancelled = false;
  let attempts = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const check = async () => {
    try {
      const result = await resolve();
      if (cancelled) return;
      attempts += 1;
      onResult(result);
      if (!cancelled && result.pending && result.level !== "system" && attempts < maxAttempts) timer = setTimeout(check, intervalMs);
    } catch {
      if (!cancelled) onError();
    }
  };
  void check();
  return () => { cancelled = true; if (timer) clearTimeout(timer); };
}
