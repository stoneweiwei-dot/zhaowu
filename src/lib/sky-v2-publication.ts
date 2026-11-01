/**
 * Sky v2 editorial publication gate.
 * These functions never calculate ephemerides and must not be mistaken for
 * astronomical verification. Each publishable input must carry two-engine
 * evidence produced by the separate computation pipeline.
 */
export type SkyV2Grade = "S1"|"S2"|"S3"|"S4"|"S5"|"A1"|"A2"|"A3"|"B";
export type SkyV2Candidate = {
  kind: SkyV2Grade;
  bodies: string[];
  utc: string;
  title: string;
  meanings: string[];
  verification?: { independent: boolean; longitudeDeltaDeg: number; eventDeltaMinutes: number };
  stationKey?: string;
};
export type SkyV2Selection = {
  published: Array<SkyV2Candidate & { id: string }>;
  archived: Array<SkyV2Candidate & { id: string }>;
  blocked: Array<{ id: string; reason: string }>;
};

// S2 was omitted from the owner's explicit priority list. Keep shadow milestones
// visible directly after S1 rather than silently dropping them at the daily cap.
const PRIORITY: Record<SkyV2Grade, number> = {
  S1: 0, S2: 1, S4: 2, S5: 3, S3: 4, A1: 5, A2: 6, A3: 7, B: 8
};
export function sydneyDay(utc: string): string {
  const date = new Date(utc);
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid UTC event time");
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(date);
  const p = (name: string) => parts.find((entry) => entry.type === name)?.value;
  return `${p("year")}-${p("month")}-${p("day")}`;
}
export function skyV2EventId(item: SkyV2Candidate): string {
  if (!/Z$/.test(item.utc)) throw new Error("Event UTC must be an ISO timestamp ending in Z");
  const iso = new Date(item.utc).toISOString();
  return [item.kind, ...item.bodies.map((body) => body.toLowerCase()), iso].join(":");
}
export function skyV2PublicationGate(
  items: SkyV2Candidate[],
  day: string,
  cap = 4
): SkyV2Selection {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Invalid Sydney date");
  const blocked: SkyV2Selection["blocked"] = [];
  const archived: SkyV2Selection["archived"] = [];
  const approved: SkyV2Selection["published"] = [];
  const known = new Set<string>();
  const stationKeys = new Set(items.filter((e) => e.kind === "S1").map((e) => e.stationKey).filter(Boolean));
  for (const item of items) {
    if (sydneyDay(item.utc) !== day) continue;
    const id = skyV2EventId(item);
    // An S2 turning point with the same underlying S1 station is one event.
    if (known.has(id) || (item.kind === "S2" && item.stationKey && stationKeys.has(item.stationKey))) continue;
    known.add(id);
    if (item.kind === "B" || item.meanings.length > 3 || item.meanings.length === 0) {
      archived.push({ ...item, id }); continue;
    }
    const v = item.verification;
    if (!v?.independent || !Number.isFinite(v.longitudeDeltaDeg) ||
        !Number.isFinite(v.eventDeltaMinutes) || v.longitudeDeltaDeg < 0 ||
        v.eventDeltaMinutes < 0) {
      blocked.push({ id, reason: "BLOCKED BY missing or invalid independent ephemeris verification" }); continue;
    }
    if (v.longitudeDeltaDeg > 0.02 || v.eventDeltaMinutes > 10) {
      blocked.push({ id, reason: `BLOCKED BY ephemeris mismatch: ${v.longitudeDeltaDeg}°, ${v.eventDeltaMinutes} min` });
      continue;
    }
    approved.push({ ...item, id });
  }
  approved.sort((a, b) => PRIORITY[a.kind] - PRIORITY[b.kind] || a.utc.localeCompare(b.utc) || a.id.localeCompare(b.id));
  archived.push(...approved.slice(cap));
  return { published: approved.slice(0, cap), archived, blocked };
}
