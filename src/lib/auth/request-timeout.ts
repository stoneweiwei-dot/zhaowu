export const VISITOR_AUTH_TIMEOUT_MS = 15_000;

/** Abort the actual request, including response-body reads, rather than only dismissing its UI. */
export async function withVisitorAuthTimeout<T>(run: (signal: AbortSignal) => Promise<T>, timeoutMs = VISITOR_AUTH_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

export function isVisitorNetworkError(error: unknown): boolean {
  return error instanceof TypeError || (error instanceof Error && ["AbortError", "TimeoutError"].includes(error.name));
}
