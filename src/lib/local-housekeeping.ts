import { pruneSpecialistHistory } from "@/lib/specialist-history";

export const LOCAL_HOUSEKEEPING_MAX_IDLE_MS = 7 * 24 * 60 * 60 * 1000;

const KEEP_KEYS = new Set([
  "zhaowu.visitor.v1",
  "zhaowu.birth-draft.v1",
  "zhaowu.specialist-history.v1",
  "zhaowu.locale",
  "zhaowu.locale.v1",
]);

const DISPOSABLE_PREFIXES = [
  "zhaowu.generated.",
  "zhaowu.cache.",
  "zhaowu.temp.",
  "zhaowu.blob.",
  "zhaowu.media-cache.",
  "zhaowu.follow-up-draft.",
];

function browserStorage(storage?: Storage) {
  if (storage) return storage;
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function stampFromValue(raw: string | null): number | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      const record = parsed as Record<string, unknown>;
      for (const key of ["lastOpenedAt", "openedAt", "lastAccessedAt", "updatedAt", "createdAt", "ts"]) {
        const value = record[key];
        if (typeof value === "number" && Number.isFinite(value)) return value;
        if (typeof value === "string" && Number.isFinite(Date.parse(value))) return Date.parse(value);
      }
    }
  } catch {
    // Non-JSON disposable values fall back to no stamp.
  }
  return null;
}

export function pruneDisposableLocalMedia(now = Date.now(), storage?: Storage) {
  const target = browserStorage(storage);
  if (!target) return { removed: 0, kept: 0 };
  const keys: string[] = [];
  for (let i = 0; i < target.length; i += 1) {
    const key = target.key(i);
    if (key) keys.push(key);
  }
  let removed = 0;
  let kept = 0;
  for (const key of keys) {
    if (KEEP_KEYS.has(key)) {
      kept += 1;
      continue;
    }
    const disposable = DISPOSABLE_PREFIXES.some((prefix) => key.startsWith(prefix));
    if (!disposable) {
      kept += 1;
      continue;
    }
    const stamp = stampFromValue(target.getItem(key));
    const idle = stamp == null ? LOCAL_HOUSEKEEPING_MAX_IDLE_MS + 1 : now - stamp;
    if (idle > LOCAL_HOUSEKEEPING_MAX_IDLE_MS) {
      try {
        target.removeItem(key);
        removed += 1;
      } catch {
        kept += 1;
      }
    } else {
      kept += 1;
    }
  }
  return { removed, kept };
}

export function runLocalHousekeeping(now = Date.now(), storage?: Storage) {
  return {
    specialistHistory: pruneSpecialistHistory(now, storage),
    disposableMedia: pruneDisposableLocalMedia(now, storage),
  };
}
