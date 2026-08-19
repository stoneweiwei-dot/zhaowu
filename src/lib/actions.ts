import { FEATURED_CITIES, filterFeatured } from "@/lib/bazi/cities";
import type { AnalysisResult, AnalyzeInput, CityHit } from "@/lib/bazi/types";

function newId(): string {
  return crypto.randomUUID();
}

function isCity(value: unknown): value is CityHit {
  if (!value || typeof value !== "object") return false;
  const c = value as CityHit;
  return (
    typeof c.name === "string" &&
    typeof c.display === "string" &&
    typeof c.timezone === "string" &&
    Number.isFinite(c.latitude) &&
    Number.isFinite(c.longitude)
  );
}

function parseInput(raw: AnalyzeInput): AnalyzeInput {
  if (!raw.question?.trim()) throw new Error("請先寫下你真正想問的問題。");
  const year = Number(raw.year);
  const month = Number(raw.month);
  const day = Number(raw.day);
  const hour = Number(raw.hour);
  const minute = Number.isFinite(Number(raw.minute)) ? Math.round(Number(raw.minute)) : 0;
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new Error("請分別填寫出生年、月、日。");
  }
  if (year < 1900 || year > 2100 || month < 1 || month > 12) {
    throw new Error("出生日期不正確，請檢查年、月、日。");
  }
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > lastDay) throw new Error("出生日期不正確，請檢查年、月、日。");
  if (!isCity(raw.city)) throw new Error("請填寫出生城市與國家。");
  if (!raw.timeUnknown && (!Number.isInteger(hour) || hour < 0 || hour > 23 || minute < 0 || minute > 59)) {
    throw new Error("出生時間請使用 24 小時格式。");
  }
  return {
    ...raw,
    year,
    month,
    day,
    hour: raw.timeUnknown ? 12 : hour,
    question: raw.question.trim().slice(0, 400),
    minute: raw.timeUnknown ? 0 : minute,
    liveCity: raw.liveCity && isCity(raw.liveCity) ? raw.liveCity : null,
    relation: raw.relation === "hetero" || raw.relation === "same" || raw.relation === "any" ? raw.relation : "unset",
  };
}

/**
 * Client-safe runtime layer.
 *
 * The deterministic chart / palm / routing engines are pure TypeScript, so they
 * do not need a server function. Keeping these calls in the browser means the
 * production Netlify deployment remains usable even when no Netlify Functions
 * are present. Secrets are never exposed here: the full-report path intentionally
 * uses the deterministic rule composer only.
 */
export async function getAlmanac() {
  const { currentAlmanac } = await import("@/lib/bazi/chart");
  return currentAlmanac(new Date());
}

export async function searchCities({ data }: { data: string }): Promise<CityHit[]> {
  const q = String(data ?? "").trim().slice(0, 40);
  const local = filterFeatured(q);
  if (!q || q.length < 2) return local;

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=zh`;
    const res = await fetch(url);
    if (!res.ok) return local.length ? local : FEATURED_CITIES.slice(0, 6);
    const body = (await res.json()) as {
      results?: {
        name: string;
        country?: string;
        admin1?: string;
        latitude: number;
        longitude: number;
        timezone?: string;
      }[];
    };
    const remote: CityHit[] = (body.results ?? []).map((r) => ({
      name: r.name,
      country: r.country ?? "",
      display: [r.name, r.admin1, r.country].filter(Boolean).join("，"),
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone || "UTC",
    }));
    const seen = new Set<string>();
    const merged: CityHit[] = [];
    for (const item of [...local, ...remote]) {
      const key = `${item.display}-${item.latitude.toFixed(2)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
    return merged.slice(0, 8);
  } catch {
    return local.length ? local : FEATURED_CITIES.slice(0, 6);
  }
}

export async function analyzeLife({ data: raw }: { data: AnalyzeInput }): Promise<AnalysisResult> {
  const data = parseInput(raw);
  const [{ buildChart }, { interpret, classifyQuestion }, { buildPalm }, { routeMethods }] = await Promise.all([
    import("@/lib/bazi/chart"),
    import("@/lib/bazi/interpret"),
    import("@/lib/palm/engine"),
    import("@/lib/core/method"),
  ]);

  const chart = buildChart(data);
  const palm = buildPalm({
    year: data.year,
    month: data.month,
    day: data.day,
    hour: data.hour,
    timeUnknown: data.timeUnknown,
    gender: data.gender,
  });
  const kind = classifyQuestion(data.question);
  const methodProtocol = routeMethods(kind, {
    palmReady: palm.ready,
    palmMissing: palm.missing,
  });
  const reading = interpret(data.question, chart, data.relation, palm);

  return {
    id: newId(),
    question: data.question,
    chart,
    reading,
    createdAt: new Date().toISOString(),
    methodProtocol,
    palm,
  };
}

export async function writeFullReport({
  data,
}: {
  data: {
    question: string;
    chart: AnalysisResult["chart"];
    reading: AnalysisResult["reading"];
    palm?: AnalysisResult["palm"];
  };
}) {
  const { composeFullReport } = await import("@/lib/bazi/interpret");
  const text = composeFullReport(data.question, data.chart, data.reading, data.palm ?? null);
  return { text, source: "rule" as const };
}
