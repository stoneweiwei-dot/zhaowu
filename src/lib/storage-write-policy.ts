export const SUPABASE_STORAGE_WRITES_PAUSED = false;

export const STORAGE_WRITES_PAUSED_MESSAGE = {
  "zh-Hant": "Supabase Storage 寫入目前可用。",
  "zh-Hans": "Supabase Storage 写入目前可用。",
  en: "Supabase Storage writes are available.",
} as const;

export function assertSupabaseStorageWritesEnabled() {
  if (SUPABASE_STORAGE_WRITES_PAUSED) {
    throw new Error(STORAGE_WRITES_PAUSED_MESSAGE["zh-Hant"]);
  }
}
