# 昭梧更新報告｜ZW-WEB-2026.10.06-r224

## 本次改動

- `/updates` 不再只依賴 Supabase `release_history` 的單一正式版本摘要；新增 source-controlled 公開改動清單，補回 2026-10-02 至 2026-10-06 的主要客戶／站主可見變化。
- Production CI 新增 public changelog gate：`src/`、`public/`、`api/`、`lib/`、Supabase runtime／migration 或主要 production config 有實際改動時，同一個 change 必須更新 `src/lib/public-changelog.ts`。
- 正式版本 fallback 由 r223 接續為 r224，避免 Supabase `release_history` 暫時落後時公開頁再次停在舊版。
- 站主後台 loading／開場影片已整理為可讀名稱；目前使用版本改為「雙生並蒂蓮｜主版」MP4。原影片均保留，未刪 Storage 原檔。

## 為什麼改

r223 之後 GitHub main 持續有正式改動，但 `release_history` 沒有新增資料，因此公開更新頁長時間停在 2026-10-01。站主的新指令是：每次網站有新的實際改動，都必須讓使用者看得見變化；正式 release 可以批次發布，但公開 change history 不能再因 release ledger 沒有 bump 而停住。

## 影響範圍

- `/updates` 公開更新頁。
- Production CI 的變更紀錄 gate。
- 公開 release fallback／verification 常數。
- Supabase `gallery_assets` 的 loading 影片 display-name tags 與目前使用的 `is_primary`。

## 受保護範圍

- 不改八字、紫微、D60、曆法或其他 deterministic 命理核心。
- 不改付款、Auth、站主權限、Supabase schema。
- 不刪除任何 loading／開場影片原檔。
- 不恢復已停用的 iPhone Safari CI。
- 不新增第二 production host 或 preview deployment。

## 驗證狀態

- GitHub Deploy gate／Engine suite 必須通過後才可合併。
- 合併後核對 Vercel Production exact main SHA 與 `/updates` 正式頁。
- Supabase 需核對唯一 `is_primary` loading video 為「雙生並蒂蓮｜主版」。

## 回滾

- 前端：revert 本 release PR 即可恢復舊 `/updates` 與 r223 fallback。
- 後台影片：將原 `is_primary` 指回先前素材即可；本次沒有刪檔，所有影片仍可回切。
