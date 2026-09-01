import type { Locale } from "@/lib/i18n";

export const SPECIALIST_HISTORY_KEY = "zhaowu.specialist-history.v1";
export const SPECIALIST_HISTORY_LIMIT = 100;

export type SpecialistHistoryKind = "qizheng" | "ziwei" | "yizhangjing" | "fun-five-element";
export type SpecialistHistorySourcePath = "/qizheng" | "/ziwei" | "/yizhangjing" | "/fun-tests";

export type SpecialistHistorySection = {
  title: string;
  body: string;
};

export type SpecialistHistoryEntry = {
  id: string;
  kind: SpecialistHistoryKind;
  locale: Locale;
  createdAt: string;
  sourcePath: SpecialistHistorySourcePath;
  title: string;
  inputSummary: string;
  sections: SpecialistHistorySection[];
  closing: string;
};

type SpecialistHistoryDraft = Omit<SpecialistHistoryEntry, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
};

function browserStorage(storage?: Storage) {
  if (storage) return storage;
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isKind(value: unknown): value is SpecialistHistoryKind {
  return value === "qizheng" || value === "ziwei" || value === "yizhangjing" || value === "fun-five-element";
}

function isLocale(value: unknown): value is Locale {
  return value === "zh-Hant" || value === "zh-Hans" || value === "en";
}

function sourcePathForKind(kind: SpecialistHistoryKind): SpecialistHistorySourcePath {
  if (kind === "qizheng") return "/qizheng";
  if (kind === "ziwei") return "/ziwei";
  if (kind === "fun-five-element") return "/fun-tests";
  return "/yizhangjing";
}

function normalizeEntry(value: unknown): SpecialistHistoryEntry | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (!isKind(raw.kind) || !isLocale(raw.locale)) return null;
  const sourcePath = sourcePathForKind(raw.kind);
  const sections = Array.isArray(raw.sections)
    ? raw.sections.slice(0, 16).map((section) => {
        const item = section && typeof section === "object" ? section as Record<string, unknown> : {};
        return { title: cleanText(item.title, 120), body: cleanText(item.body, 4_000) };
      }).filter((section) => section.title && section.body)
    : [];
  const id = cleanText(raw.id, 100);
  const title = cleanText(raw.title, 160);
  if (!id || !title || !sections.length) return null;
  const createdAt = cleanText(raw.createdAt, 50);
  return {
    id,
    kind: raw.kind,
    locale: raw.locale,
    createdAt: Number.isFinite(Date.parse(createdAt)) ? createdAt : new Date().toISOString(),
    sourcePath,
    title,
    inputSummary: cleanText(raw.inputSummary, 320),
    sections,
    closing: cleanText(raw.closing, 2_000),
  };
}

export function readSpecialistHistory(storage?: Storage): SpecialistHistoryEntry[] {
  const target = browserStorage(storage);
  if (!target) return [];
  try {
    const parsed = JSON.parse(target.getItem(SPECIALIST_HISTORY_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeEntry).filter((entry): entry is SpecialistHistoryEntry => Boolean(entry)).slice(0, SPECIALIST_HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function writeSpecialistHistory(entries: SpecialistHistoryEntry[], storage?: Storage) {
  const target = browserStorage(storage);
  if (!target) return false;
  try {
    target.setItem(SPECIALIST_HISTORY_KEY, JSON.stringify(entries.slice(0, SPECIALIST_HISTORY_LIMIT)));
    return true;
  } catch {
    // Reports still render when private browsing blocks local storage.
    return false;
  }
}

export function saveSpecialistHistory(draft: SpecialistHistoryDraft, storage?: Storage) {
  const createdAt = draft.createdAt ?? new Date().toISOString();
  const candidate = normalizeEntry({
    ...draft,
    id: draft.id ?? `${draft.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt,
  });
  if (!candidate) return null;
  const current = readSpecialistHistory(storage).filter((entry) => entry.id !== candidate.id);
  return writeSpecialistHistory([candidate, ...current], storage) ? candidate : null;
}

export function deleteSpecialistHistory(id: string, storage?: Storage) {
  writeSpecialistHistory(readSpecialistHistory(storage).filter((entry) => entry.id !== id), storage);
}

export function clearSpecialistHistory(storage?: Storage) {
  const target = browserStorage(storage);
  if (!target) return;
  try {
    target.removeItem(SPECIALIST_HISTORY_KEY);
  } catch {
    // Nothing else to do when storage is unavailable.
  }
}
