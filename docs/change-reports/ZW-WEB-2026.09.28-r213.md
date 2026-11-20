# 昭梧更新報告｜ZW-WEB-2026.09.28-r213

## 本次改動

- 修正 Production `/api/owner-music` 公開 GET／HEAD 仍會載入 `isomorphic-git`／`ssh2` 的依賴污染。
- 新增 `lib/owner-music-public.js`，只負責公開 manifest 讀取與播放所需固定資料。
- `api/owner-music.js` 的 GET／HEAD 只載入 public-read 模組；POST／PATCH／DELETE 通過 same-origin 與 owner cookie 後才動態載入 `owner-music-git.js`。
- `owner-music-git.js` 繼續負責 Git／SSH 寫入，但不再承擔公開讀取。
- r130／r135／r197 regression 鎖定這條讀寫邊界。

## 為什麼改

r211 Production 的真實 Vercel runtime logs 顯示 `/api/owner-music` 仍出現 Node `DEP0169 url.parse()`。原因是 API 雖然沒有在 GET 主動呼叫 Git HTTP adapter，但頂層 static import 仍會初始化整個 Git／SSH writer dependency graph。本次把 public read 與 owner write 真正拆成不同 module graph。

## 影響範圍

- 背景音樂公開清單讀取與播放導向。
- 站主音樂新增／切換／改名／刪除的依賴載入時機。
- 保留 r212 已加入的 EP01 木／EP02 火報告內容，不改其判斷與呈現。

## 受保護範圍

- 不改 Supabase schema／Storage。
- 不改 auth 規則；write module 仍只在 owner 驗證後載入。
- 不改 payment。
- 不改命理 deterministic calculation、R6.2.2、報告邏輯或 ZVec media index。
- 不搬移、刪除或複製任何音樂檔。

## 驗證狀態

- 合併前：Deploy gate、Engine suite、iPhone Safari 必須全綠。
- regression 必須證明 public-read module 不包含 `isomorphic-git`／`ssh2`，且 API 不再 static import write module。
- 合併後：Vercel Production SHA 必須等於最新 main，`/release.json` exact SHA match。
- 合併後實際呼叫 `/api/owner-music`，再以新 deployment scope 的 Vercel runtime logs 驗證沒有新的 DEP0169。
- Production 驗證完成後才寫入 Supabase `release_history` r213。

## 回滾

回滾本次 PR 即可恢復 r212；本次沒有資料庫 migration 或 Storage 變更。
