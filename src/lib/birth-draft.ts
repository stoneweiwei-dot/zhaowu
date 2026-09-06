import type { AnalyzeInput, CityHit, Gender, RelationPref } from "@/lib/bazi/types";

export const BIRTH_DRAFT_KEY = "zhaowu.birth-draft.v1";
export const BIRTH_DRAFT_EVENT = "zhaowu-birth-draft";

export type BirthDraft = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  timeUnknown: boolean;
  gender: Gender;
  relation: RelationPref;
  city: CityHit | null;
  liveCity: CityHit | null;
};

const EMPTY: BirthDraft = {
  year: "",
  month: "",
  day: "",
  hour: "",
  minute: "",
  timeUnknown: false,
  gender: "unspecified",
  relation: "unset",
  city: null,
  liveCity: null,
};

function asCity(value: unknown): CityHit | null {
  if (!value || typeof value !== "object") return null;
  const c = value as Partial<CityHit>;
  if (typeof c.display !== "string" || typeof c.name !== "string" || typeof c.timezone !== "string") return null;
  if (!Number.isFinite(Number(c.latitude)) || !Number.isFinite(Number(c.longitude))) return null;
  return c as CityHit;
}

export function emptyBirthDraft(): BirthDraft {
  return { ...EMPTY };
}

export function birthDraftFromRecord(raw: unknown): BirthDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const gender = b.gender === "male" || b.gender === "female" || b.gender === "unspecified" ? b.gender : "unspecified";
  const relation = b.relation === "any" || b.relation === "hetero" || b.relation === "same" || b.relation === "unset" ? b.relation : "unset";
  return {
    year: b.year != null ? String(b.year) : "",
    month: b.month != null ? String(b.month) : "",
    day: b.day != null ? String(b.day) : "",
    hour: b.hour != null ? String(b.hour) : "",
    minute: b.minute != null ? String(b.minute) : "",
    timeUnknown: Boolean(b.timeUnknown),
    gender,
    relation,
    city: asCity(b.city),
    liveCity: asCity(b.liveCity),
  };
}

export function readBirthDraft(): BirthDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BIRTH_DRAFT_KEY);
    if (!raw) return null;
    return birthDraftFromRecord(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeBirthDraft(draft: BirthDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BIRTH_DRAFT_KEY, JSON.stringify(draft));
    window.dispatchEvent(new Event(BIRTH_DRAFT_EVENT));
  } catch {
    /* private mode / quota */
  }
}

export function draftIsComplete(draft: BirthDraft | null): boolean {
  if (!draft?.city) return false;
  if (!draft.year || !draft.month || !draft.day) return false;
  if (!draft.timeUnknown && draft.hour === "") return false;
  return true;
}

export function draftToAnalyzeSlice(draft: BirthDraft): Pick<AnalyzeInput, "year" | "month" | "day" | "hour" | "minute" | "timeUnknown" | "gender" | "relation" | "city" | "liveCity" | "ziPolicy" | "useTrueSolar"> | null {
  if (!draftIsComplete(draft) || !draft.city) return null;
  return {
    year: Number(draft.year),
    month: Number(draft.month),
    day: Number(draft.day),
    hour: draft.timeUnknown ? 12 : Number(draft.hour),
    minute: draft.timeUnknown ? 0 : Number(draft.minute || 0),
    timeUnknown: draft.timeUnknown,
    gender: draft.gender,
    relation: draft.relation,
    city: draft.city,
    liveCity: draft.liveCity,
    ziPolicy: "midnight",
    useTrueSolar: true,
  };
}
