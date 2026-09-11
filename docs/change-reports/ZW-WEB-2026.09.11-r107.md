# 昭梧更新報告｜ZW-WEB-2026.09.11-r107

## 本次改動
- 前台語言選擇器撤下「簡體」與「日本語」。現用順序：English → 繁體 → 한국어 → हिन्दी。
- 新鮮造訪預設改為繁體 `zh-Hant`。舊的 `zh-Hans` / `ja` 偏好自動折到繁體，不改計算引擎。
- 刪除未再被 IntroGate 引用的舊 loading 大檔（`loading-v10.mp4`、`loading-v11.mp4`、`wutong-owner-r29.*`、`twin-lotus-restored-r26.*`、舊 poster / part 碎片），只保留現行 `owner-lotus-bloom-r53`。
- 靜態殼、manifest、OG 預覽文案改為繁體。
- Release fallback 由 r106 / 106 推進到 r107 / 107。

## 為什麼改
- 站主要求先撤日文與簡體以降低前台負擔；日文整本 UI 詞典從 bundle 移除後，對 JS 體積有實際幫助。
- 簡體字串仍保留在內部 `Locale` 內容表，避免大面積改報告文案與測試；只是不再作為可選前台語言。
- 舊 loading 影片已不在 runtime 路徑上，卻仍佔部署包數 MB，屬於可刪垃圾素材。
- 本次不能修復登入：Supabase 專案 `plgpxusmemnmzckbwtiv` 仍因 `exceed_cached_egress_quota` 回 402。刪 repo 檔案不會立刻解除已用完的本月 cached egress。

## 影響範圍
- `src/lib/display-language.ts`
- `src/components/site-shell.tsx`
- `index.html`
- `public/manifest.webmanifest`
- `src/lib/site-stats.ts`
- 相關測試與 docs
- `public/intro/` 未引用舊檔

## 保護範圍
- 不修改八字排盤、auth、payment、Supabase schema、完整報告契約。
- 不修改現行 loading 影片路徑 `/intro/owner-lotus-bloom-r53.mp4`。
- 韓文／印地文暫留。

## 回滾
- 回滾 r107 提交即可恢復六語選擇器、簡體預設與舊 loading 檔。
- 本次沒有資料庫 migration。

## 驗證
- 必須通過 Deploy gate、相關語言／release ledger 測試、TypeScript、Vite build。
- 合併後必須確認 Vercel Production `READY` 且 `githubCommitSha == main HEAD`。
- 登入是否恢復只取決於 Supabase 配額。
