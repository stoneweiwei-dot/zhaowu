# 昭梧更新報告｜ZW-WEB-2026.09.11-r104

## 本次改動
- 將首次載入的靜態 HTML 預設語言由 `zh-Hant` 改為 `zh-Hans`，同步把首頁 title、description、Open Graph 與 Twitter 預設文案改為簡體中文，`og:locale` 改為 `zh_CN`。
- PWA `manifest.webmanifest` 增加 `lang: zh-CN`，名稱與描述同步為簡體中文。
- 保留返回使用者已保存的顯示語言偏好，並在 React hydration 前先套用已保存的 `html lang`，避免語言狀態被簡中預設覆蓋。
- 新增 iPhone Safari 六語契約測試：首次簡中、English → 简体 → 繁體 → 日本語 → 한국어 → हिन्दी 順序、六語逐一切換、無橫向溢出、Hindi 已保存偏好恢復。
- Release fallback 升級為 r104 / 累計更新 104。

## 為什麼改
- 線上驗證發現前端 runtime 雖已在無偏好時使用 `zh-Hans`，但正式站最初送出的 HTML 仍是 `lang=zh-Hant`、`og:locale=zh_TW` 與繁體 metadata，與「首次開啟預設簡體中文」不一致。
- 原有 iPhone Safari 套件主要以預先注入的繁體偏好驗證既有流程，不能直接證明全新訪客的簡中預設與六語切換，因此補上獨立契約測試。

## 影響範圍
- `index.html`
- `public/manifest.webmanifest`
- `e2e/default-language.iphone-safari.spec.ts`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- 本變更報告

## 保護範圍
- 不修改八字、真太陽時、排盤、大運或任何命理計算核心。
- 不修改 auth、payment、Supabase schema、權限、資料或環境變數。
- 日文、韓文、Hindi 仍只屬顯示層；核心計算 locale 契約維持 `zh-Hant / zh-Hans / en`。
- 不建立新分支、新倉庫或第二個 Vercel production。

## 回滾
- 將 `index.html` 與 PWA manifest 恢復 r103 靜態預設。
- 移除新增的六語 iPhone Safari 契約測試。
- 將 release fallback / ledger 測試還原至 r103。

## 驗證
- Deploy gate、Engine suite、完整 iPhone Safari 必須全部 PASS。
- 新增的顯示語言契約必須在 WebKit iPhone 390×844 通過首次簡中、六語順序、逐語切換、偏好恢復及無橫向溢出。
- Vercel Production 必須 READY 且 `githubCommitSha == main HEAD`。
- 正式站唯讀回應必須顯示 `html lang=zh-Hans`、`og:locale=zh_CN` 與簡體中文首頁 metadata。
