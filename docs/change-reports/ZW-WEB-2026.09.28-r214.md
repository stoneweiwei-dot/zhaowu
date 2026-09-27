# 昭梧更新報告｜ZW-WEB-2026.09.28-r214

## 本次改動

- 將背景音樂公開讀取與站主寫入拆成兩個獨立 Serverless Functions。
- `/api/owner-music` 只讀公開 manifest、回傳曲目與處理播放 redirect；不再包含 Git／SSH writer dependency graph。
- 新增 `/api/owner-music-write` 專門處理 POST／PATCH／DELETE，保留 same-origin 與 owner cookie 驗證。
- 前端上傳、切換、改名與刪除全部改走 writer endpoint；一般載入與播放器 stream 維持 read endpoint。
- Vercel `includeFiles: lib/owner-music-ssh.json` 只掛在 writer function，public read function maxDuration 改為 10 秒。
- Netlify archive compatibility wrapper 同步新增 writer endpoint，但 Netlify 仍維持 build-frozen。

## 為什麼改

r213 已將 writer 改成 dynamic import，但 Production 真實 GET `/api/owner-music` 後，Vercel deployment-scope runtime logs 仍出現 Node `DEP0169 url.parse()`。這表示 Vercel tracing／bundling 仍把 writer dependency graph 收進同一 Serverless Function。r214 改採真正的函數級物理隔離，讓公開讀取 bundle 不再追蹤 `isomorphic-git`／`ssh2`。

## 影響範圍

- 背景音樂清單與播放讀取。
- 站主音樂上傳／切換／改名／刪除的 API endpoint。
- Serverless function 打包邊界。

## 受保護範圍

- 不改任何既有曲目或 manifest 格式。
- 不搬移、複製、刪除 Storage／GitHub 音檔。
- 不改 Supabase schema。
- 不改會員登入、payment、命理 deterministic calculation、R6.2.2、完整報告邏輯、r212 EP01/EP02 或 ZVec media index。
- r213 因 Production runtime 驗證失敗，不寫入 Supabase `release_history`。

## 驗證狀態

- 合併前：Deploy gate、Engine suite、iPhone Safari 必須全綠。
- regression 必須證明 public function source 與 Vercel config 都不再引用 writer bundle／sealed key。
- 合併後：Vercel Production SHA 必須等於最新 main，`/release.json` exact SHA match。
- 合併後實際 GET `/api/owner-music` 必須 HTTP 200。
- 同一新 deployment scope 查 `DEP0169` 必須沒有新事件。
- Production 驗證完成後才新增 Supabase `release_history` r214。

## 回滾

回滾本次 PR 即可恢復 r213 的單 API 路徑；本次沒有資料庫 migration 或媒體資料變更。
