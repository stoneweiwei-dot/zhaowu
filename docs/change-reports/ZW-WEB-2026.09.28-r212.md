# 昭梧更新報告｜ZW-WEB-2026.09.28-r212

## 本次改動

- 修正 Production `/api/owner-music` 公開 GET／HEAD 仍會載入 `isomorphic-git`／`ssh2` 的依賴污染。
- 新增 `lib/owner-music-public.js`，只負責：
  - 讀取 `owner-music` branch 的公開 manifest。
  - 提供公開讀取所需的固定路徑與 fallback helpers。
- `api/owner-music.js` 改為：
  - GET／HEAD 只 import 輕量 public-read module。
  - POST／PATCH／DELETE 通過 same-origin + owner cookie 後，才動態 import `owner-music-git.js`。
- `owner-music-git.js` 保留原 Git／SSH 寫入行為，但不再承擔公開讀取。
- 更新 r130／r135 regression，明確禁止公開 API 對 write module 的 static import。

## 為什麼改

Vercel r211 Production 的真實 runtime logs 仍在 `/api/owner-music` 出現 Node `DEP0169 url.parse()`。先前只延後了 `isomorphic-git/http/node` 的載入，但 `api/owner-music.js` 頂層仍 static import 整個 `owner-music-git.js`，因此 public GET 仍會初始化 Git/SSH 依賴。這次把讀寫模組邊界真正拆開。

## 影響範圍

- 背景音樂公開清單讀取與播放導向。
- 站主音樂新增／切換／改名／刪除的依賴載入時機。
- 不改曲目內容、manifest 格式、播放器 UI 或現有 26 首 legacy 音樂。

## 受保護範圍

- 不改 Supabase schema／Storage。
- 不改 auth 規則；write module 仍只在 owner 驗證後載入。
- 不改 payment。
- 不改命理 deterministic calculation、R6.2.2、報告內容或 ZVec media index。
- 不搬移或複製任何音樂檔。

## 驗證狀態

- 合併前：Deploy gate、Engine suite、iPhone Safari 必須全綠。
- regression 必須證明 public-read module 不包含 `isomorphic-git`／`ssh2`，且 API 不再 static import write module。
- 合併後：Vercel Production SHA 必須等於最新 main，`/release.json` exact SHA match。
- 合併後實際呼叫 `/api/owner-music`，再以 Vercel runtime logs 驗證新 deployment 不再產生新的 DEP0169。
- 最後才寫入 Supabase `release_history` r212；不得預先寫成 PASS。

## 回滾

回滾本次 PR 即可恢復 r211 的 owner-music module boundary；本次沒有資料庫 migration 或 Storage 變更。
