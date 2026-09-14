export type MingshuDoctorResult = {
  ok: boolean;
  origin: string;
  apiVersion: string | null;
  connection: "reachable" | "failed";
  note?: string;
};

export type ZhaowuCapabilitiesResult = {
  ok: boolean;
  apiVersion: string;
  release: string;
  engine: {
    name: string;
    version: string;
    calculationTruth: string;
  };
  sourceKinds: Record<string, string>;
  capabilities: Record<string, unknown>;
  endpoints: Record<string, string>;
  privacy: Record<string, boolean>;
};

export type ZhaowuDoctorResult = {
  ok: boolean;
  release: string;
  local: {
    status: "reachable";
    engineVersion: string;
    calculationTruthReady: true;
  };
  sideChannels: {
    mingshu: {
      required: false;
      status: "reachable" | "failed";
      origin: string;
      apiVersion: string | null;
      error: unknown;
    };
  };
  safeguards: {
    failOpen: true;
    sideChannelOverridesCalculationTruth: false;
    birthDataSentByDoctor: false;
  };
};

export async function checkMingshuDoctor(): Promise<MingshuDoctorResult> {
  const response = await fetch("/api/mingshu-doctor", { method: "GET", cache: "no-store" });
  return response.json() as Promise<MingshuDoctorResult>;
}

export async function checkZhaowuCapabilities(): Promise<ZhaowuCapabilitiesResult> {
  const response = await fetch("/api/zhaowu-capabilities", { method: "GET", cache: "no-store" });
  return response.json() as Promise<ZhaowuCapabilitiesResult>;
}

export async function checkZhaowuDoctor(): Promise<ZhaowuDoctorResult> {
  const response = await fetch("/api/zhaowu-doctor", { method: "GET", cache: "no-store" });
  return response.json() as Promise<ZhaowuDoctorResult>;
}

export async function lookupMingshuLocations(query: string, locale = "zh-TW"): Promise<unknown> {
  const params = new URLSearchParams({ q: query, locale });
  const response = await fetch(`/api/mingshu-locations?${params}`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });
  return response.json();
}

export async function compareMingshuChart(input: {
  mingshuInput: Record<string, unknown>;
  zhaowuSnapshot: Record<string, unknown>;
}): Promise<unknown> {
  const response = await fetch("/api/mingshu-compare", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return response.json();
}
