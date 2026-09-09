import type { AnalyzeInput, AppLocale, CityHit, Gender, RelationPref } from "@/lib/bazi/types";

export const SHARED_BIRTH_STORAGE_KEY = "zhaowu.birth-record.v1";
export const SHARED_BIRTH_OWNER_KEY = "zhaowu.birth-record-owner.v1";
export const SHARED_BIRTH_EVENT = "zhaowu-birth-record-change";
const GUEST_BIRTH_OWNER_ID = "__zhaowu_guest__";

export type SharedBirthRecord = Omit<AnalyzeInput, "question" | "locale">;

// Guest visitors may reuse one birth record across public specialist routes on the
// same device. Signed-in records remain isolated by user id and never leak back to
// guest mode after sign-out.
let activeSharedBirthUserId: string = GUEST_BIRTH_OWNER_ID;

function asCity(value: unknown): CityHit | null {
  if (!value || typeof value !== "object") return null;
  const city = value as Partial<CityHit>;
  if (
    typeof city.name !== "string" ||
    typeof city.country !== "string" ||
    typeof city.display !== "string" ||
    typeof city.timezone !== "string" ||
    !Number.isFinite(city.latitude) ||
    !Number.isFinite(city.longitude)
  ) return null;
  return city as CityHit;
}

function numberIn(value: unknown, min: number, max: number): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

function validDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function sharedBirthFromUnknown(value: unknown): SharedBirthRecord | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const year = numberIn(raw.year, 1900, 2100);
  const month = numberIn(raw.month, 1, 12);
  const day = numberIn(raw.day, 1, 31);
  const timeUnknown = Boolean(raw.timeUnknown);
  const hour = timeUnknown ? 12 : numberIn(raw.hour, 0, 23);
  const minute = timeUnknown ? 0 : numberIn(raw.minute ?? 0, 0, 59);
  const city = asCity(raw.city);
  if (year == null || month == null || day == null || hour == null || minute == null || !city || !validDate(year, month, day)) return null;

  const gender: Gender = raw.gender === "male" || raw.gender === "female" || raw.gender === "unspecified" ? raw.gender : "unspecified";
  const relation: RelationPref = raw.relation === "any" || raw.relation === "hetero" || raw.relation === "same" || raw.relation === "unset" ? raw.relation : "unset";
  const liveCity = raw.liveCity == null ? null : asCity(raw.liveCity);

  return {
    year,
    month,
    day,
    hour,
    minute,
    timeUnknown,
    gender,
    relation,
    city,
    liveCity,
    ziPolicy: "midnight",
    useTrueSolar: true,
  };
}

export function setSharedBirthAccessUser(userId: string | null) {
  const nextOwner = userId ?? GUEST_BIRTH_OWNER_ID;
  activeSharedBirthUserId = nextOwner;
  if (typeof window === "undefined") return;
  try {
    const storedOwner = window.localStorage.getItem(SHARED_BIRTH_OWNER_KEY);
    const raw = window.localStorage.getItem(SHARED_BIRTH_STORAGE_KEY);

    // Older guest records predate the owner marker. Adopt them only into guest
    // scope; a signed-in user never inherits an unowned browser record.
    if (!storedOwner && raw && nextOwner === GUEST_BIRTH_OWNER_ID) {
      window.localStorage.setItem(SHARED_BIRTH_OWNER_KEY, GUEST_BIRTH_OWNER_ID);
      return;
    }

    if (storedOwner !== nextOwner) {
      window.localStorage.removeItem(SHARED_BIRTH_STORAGE_KEY);
      window.localStorage.setItem(SHARED_BIRTH_OWNER_KEY, nextOwner);
    }
  } catch {
    // Restricted/private browser storage must never block the current page.
  }
}

export function clearSharedBirthRecord() {
  activeSharedBirthUserId = GUEST_BIRTH_OWNER_ID;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SHARED_BIRTH_STORAGE_KEY);
    window.localStorage.setItem(SHARED_BIRTH_OWNER_KEY, GUEST_BIRTH_OWNER_ID);
  } catch {
    // Ignore unavailable storage; the current page can still operate in memory.
  }
}

export function readSharedBirthRecord(): SharedBirthRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SHARED_BIRTH_STORAGE_KEY);
    if (!raw) return null;
    const storedOwner = window.localStorage.getItem(SHARED_BIRTH_OWNER_KEY);

    // Adopt legacy unowned data only for a guest visitor. This preserves the
    // original public flow while keeping authenticated records isolated.
    if (!storedOwner && activeSharedBirthUserId === GUEST_BIRTH_OWNER_ID) {
      window.localStorage.setItem(SHARED_BIRTH_OWNER_KEY, GUEST_BIRTH_OWNER_ID);
      return sharedBirthFromUnknown(JSON.parse(raw));
    }

    if (storedOwner !== activeSharedBirthUserId) return null;
    return sharedBirthFromUnknown(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeSharedBirthRecord(record: SharedBirthRecord) {
  if (typeof window === "undefined") return;
  const safe = sharedBirthFromUnknown(record);
  if (!safe) return;
  try {
    window.localStorage.setItem(SHARED_BIRTH_OWNER_KEY, activeSharedBirthUserId);
    window.localStorage.setItem(SHARED_BIRTH_STORAGE_KEY, JSON.stringify(safe));
    window.dispatchEvent(new CustomEvent<SharedBirthRecord>(SHARED_BIRTH_EVENT, { detail: safe }));
  } catch {
    // Storage can be unavailable in private/restricted browser contexts. The current page still keeps the in-memory fields.
  }
}

export function formatSharedBirthRecord(record: SharedBirthRecord, locale: AppLocale) {
  const pad = (value: number) => String(value).padStart(2, "0");
  const date = `${record.year}-${pad(record.month)}-${pad(record.day)}`;
  const time = record.timeUnknown
    ? (locale === "en" ? "time unknown" : locale === "zh-Hans" ? "时辰未知" : "時辰未知")
    : `${pad(record.hour)}:${pad(record.minute)}`;
  return `${date} · ${time} · ${record.city.display}`;
}