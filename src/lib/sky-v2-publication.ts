/**
 * Sky v2 editorial selection gate, not an ephemeris generator or a JPL client.
 * Structured provenance is required; the upstream computation must separately
 * authenticate and archive the source responses before any publication.
 */
export type SkyV2Grade = "S1" | "S2" | "S3" | "S4" | "S5" | "A1" | "A2" | "A3" | "B";
export type SkyV2EphemerisSample = {
  engine: "astronomy-engine" | "Swiss Ephemeris" | "JPL Horizons";
  sourceUrl: string;
  eventUtc: string;
  longitudeDeg: number;
  frame: "geocentric-tropical-ecliptic-of-date";
};
export type SkyV2Verification = {
  primary: SkyV2EphemerisSample;
  jpl: SkyV2EphemerisSample;
};
export type SkyV2Candidate = {
  kind: SkyV2Grade;
  bodies: string[];
  utc: string;
  title: string;
  meanings: string[];
  verification?: SkyV2Verification;
  stationKey?: string;
};
export type SkyV2Selection = {
  published: Array<SkyV2Candidate & { id: string }>;
  archived: Array<SkyV2Candidate & { id: string }>;
  blocked: Array<{ id: string; reason: string }>;
};

// S2's owner-approved priority is not specified. Archive it, never improvise
// a public rank; when S1 is verified for the same station it is a duplicate.
const PRIORITY: Record<Exclude<SkyV2Grade, "S2" | "B">, number> = {
  S1: 0, S4: 1, S5: 2, S3: 3, A1: 4, A2: 5, A3: 6
};
function validUtc(input: string): number {
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(input)) return NaN;
  const value = Date.parse(input);
  return Number.isFinite(value) ? value : NaN;
}
export function sydneyDay(utc: string): string {
  const date = new Date(utc);
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid UTC event time");
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(date);
  const p = (name: string) => parts.find((part) => part.type === name)?.value;
  return `${p("year")}-${p("month")}-${p("day")}`;
}
export function skyV2EventId(item: SkyV2Candidate): string {
  if (!Number.isFinite(validUtc(item.utc))) throw new Error("Event UTC must be a valid ISO timestamp ending in Z");
  if (!Array.isArray(item.bodies) || item.bodies.length === 0 ||
      item.bodies.some((body) => typeof body !== "string" || !body.trim())) {
    throw new Error("Event bodies must be nonempty");
  }
  const iso = new Date(item.utc).toISOString();
  const bodies = [...new Set(item.bodies.map((b) => b.trim().toLowerCase()))].sort();
  return [item.kind, ...bodies, iso].join(":");
}
function mismatch(v: SkyV2Verification | undefined, eventUtc: string): string | null {
  if (!v || typeof v !== "object" || !v.primary || !v.jpl) return "missing structured two-engine evidence";
  const { primary, jpl } = v;
  if (!["Swiss Ephemeris", "astronomy-engine"].includes(primary.engine) ||
      jpl.engine !== "JPL Horizons" || primary.engine === jpl.engine) {
    return "independent engine identity not established";
  }
  if (primary.frame !== "geocentric-tropical-ecliptic-of-date" ||
      jpl.frame !== primary.frame) return "coordinate reference frame mismatch";
  // URLs are audit references, not proof of authenticity. The upstream adapter
  // must retain the actual engine outputs and verify their provenance.
  if (typeof primary.sourceUrl !== "string" || !/^https:\/\//.test(primary.sourceUrl) ||
      typeof jpl.sourceUrl !== "string" ||
      !/^https:\/\/(?:ssd\.jpl\.nasa\.gov|ssd-api\.jpl\.nasa\.gov)(?:\/|$)/.test(jpl.sourceUrl)) {
    return "missing approved provenance URLs";
  }
  const pTime = validUtc(primary.eventUtc);
  const jTime = validUtc(jpl.eventUtc);
  const eTime = validUtc(eventUtc);
  if (![pTime, jTime, eTime].every(Number.isFinite) ||
      ![primary.longitudeDeg, jpl.longitudeDeg].every(
        (n) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n < 360
      )) return "invalid ephemeris values";
  const raw = Math.abs(primary.longitudeDeg - jpl.longitudeDeg);
  const angleError = Math.min(raw, 360 - raw);
  const timeErrorMin = Math.abs(pTime - jTime) / 60_000;
  if (angleError > 0.02 || timeErrorMin > 10 ||
      Math.abs(eTime - pTime) > 10 * 60_000) {
    return `ephemeris disagreement: ${angleError.toFixed(5)}°, ${timeErrorMin.toFixed(2)} min`;
  }
  return null;
}
export function skyV2PublicationGate(items: SkyV2Candidate[], day: string, cap = 4): SkyV2Selection {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) ||
      new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) !== day) {
    throw new Error("Invalid Sydney date");
  }
  if (!Number.isInteger(cap) || cap < 0) throw new Error("Invalid daily cap");
  const limit = Math.min(cap, 4);
  const blocked: SkyV2Selection["blocked"] = [];
  const archived: SkyV2Selection["archived"] = [];
  const approved: SkyV2Selection["published"] = [];
  const known = new Set<string>();
  for (const item of items) {
    if (sydneyDay(item.utc) !== day) continue;
    const id = skyV2EventId(item);
    if (known.has(id)) continue;
    if (item.kind === "B" || item.meanings.length === 0 || item.meanings.length > 3) {
      archived.push({ ...item, id });
      known.add(id);
      continue;
    }
    const reason = mismatch(item.verification, item.utc);
    if (reason) {
      blocked.push({ id, reason: `BLOCKED BY ${reason}` });
      continue; // An invalid duplicate must not suppress a later verified copy.
    }
    known.add(id);
    if (item.kind === "S2") { archived.push({ ...item, id }); continue; }
    approved.push({ ...item, id });
  }
  const stations = new Set(approved.filter((e) => e.kind === "S1" && e.stationKey).map((e) => e.stationKey));
  const finalArchive = archived.filter((e) => !(e.kind === "S2" && e.stationKey && stations.has(e.stationKey)));
  approved.sort((a, b) =>
    PRIORITY[a.kind as keyof typeof PRIORITY] - PRIORITY[b.kind as keyof typeof PRIORITY] ||
    a.utc.localeCompare(b.utc) || a.id.localeCompare(b.id)
  );
  return { published: approved.slice(0, limit), archived: [...finalArchive, ...approved.slice(limit)], blocked };
}
