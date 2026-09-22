export const SUPABASE_STORAGE_WRITES_PAUSED = true;

export const STORAGE_WRITES_PAUSED_MESSAGE = {
  "zh-Hant": "Supabase 儲存空間正在瘦身，新增上傳暫停；現有內容仍可查看與管理。",
  "zh-Hans": "Supabase 存储空间正在瘦身，新增上传暂停；现有内容仍可查看与管理。",
  en: "New Supabase Storage uploads are temporarily paused while storage is being reduced. Existing content remains available.",
} as const;

export function assertSupabaseStorageWritesEnabled() {
  if (SUPABASE_STORAGE_WRITES_PAUSED) {
    throw new Error(STORAGE_WRITES_PAUSED_MESSAGE["zh-Hant"]);
  }
}
