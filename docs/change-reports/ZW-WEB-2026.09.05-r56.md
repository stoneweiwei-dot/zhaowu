# 昭梧更新報告｜ZW-WEB-2026.09.05-r56

日期：2026-09-05 AEST

## 本次改動

- 修復站主在 `/account` 看不到「背景音樂管理」入口的問題。
- 將 `OwnerBackgroundMusicManager` 從全域 `BackgroundMusic` 元件移出，改掛在 `AuthProvider` 內，確保可讀取真正的站主 `user` 與 `session`。
- 保留既有背景音樂上傳、瀏覽器本地 AAC-LC `.m4a` + MP3 備援轉碼、Supabase Storage、曲目切換與 iPhone Safari 播放邏輯。
- 新增回歸測試：音樂管理器必須位於 `AuthProvider` 內，禁止再次掛回沒有 auth context 的全域音樂元件。

## 為什麼改

r53 雖建立了背景音樂管理器與轉碼資料管線，但管理器被渲染在 `BackgroundMusic` 內；而 `BackgroundMusic` 在 `src/main.tsx` 中位於 `RouterProvider`／路由內 `AuthProvider` 之外。React Context 因此只會回傳預設 auth 狀態 `user=null`、`session=null`，管理器每次都命中 `return null`。所以程式檔存在、CI 也可編譯，但站主實際畫面完全不會出現入口。

## 影響範圍

- `src/routes/__root.tsx`
- `src/components/background-music.tsx`
- `scripts/background-music.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- 本變更報告

## 保護範圍

未修改 r55 首頁背景／宣紙視覺；未修改背景音樂資料庫 schema、Storage 物件、AAC/MP3 轉碼參數、站主判定規則、一般會員權限、命理計算、登入流程、報告、付款與其他路由。

## 回滾

若 r56 產生未知回歸，可回滾本次前端 commit；Supabase `background_music_assets` 與既有音檔不需回滾。不得恢復把 owner manager 掛在 AuthProvider 外的舊結構。

## 驗證狀態

- 根因：PASS，已由實際 component tree 證實 auth context 邊界錯誤。
- 靜態契約：待本分支 CI；測試要求 manager 位於 `AuthProvider` 內。
- TypeScript / Production build：待 CI。
- iPhone Safari regression：待 CI。
- Vercel Production exact SHA：待合併後驗證。
- `/`、`/login`、`/account`：待 Production 後驗證。
- 站主真實登入後可見性：需 Production 上線後由實際 owner session 最終確認；未取得站主 session 前不得假稱真機已看見。
