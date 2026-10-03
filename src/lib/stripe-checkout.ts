import type { AnalysisResult } from "./bazi/types";

/**
 * Generates a stable chartHash representing the current birth chart reading.
 * Combines the four pillars and result ID to create a unique fingerprint.
 */
export function computeChartHash(result: AnalysisResult | null | undefined): string {
  if (!result) return "";
  if (result.chart) {
    const c = result.chart;
    const pillars = `${c.year?.stem || ""}${c.year?.branch || ""}_${c.month?.stem || ""}${c.month?.branch || ""}_${c.day?.stem || ""}${c.day?.branch || ""}_${c.hour?.stem || ""}${c.hour?.branch || ""}`;
    return `${pillars}_${result.id || ""}`.slice(0, 100);
  }
  return String(result.id || "").slice(0, 100);
}

export type VerifySessionResult = {
  ok: boolean;
  verified?: boolean;
  reason?: string;
  payment_intent?: string | null;
  service?: string | null;
  error?: {
    code: string;
    message: string;
  };
};

/**
 * Calls the server-side verification endpoint to securely check payment status with Stripe.
 */
export async function verifyCheckoutSession(sessionId: string, chartHash: string): Promise<VerifySessionResult> {
  try {
    const res = await fetch("/api/verify-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId, chartHash }),
    });

    const data = await res.json();
    return data as VerifySessionResult;
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Failed to connect to verification service",
      },
    };
  }
}

/**
 * Initiates Stripe Checkout for unlocking the deep report.
 */
export async function createCheckoutSession(chartHash: string): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chartHash,
        origin: window.location.origin,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error?.message || "Failed to create checkout session" };
    }
    return { ok: true, url: data.url };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Network error" };
  }
}
