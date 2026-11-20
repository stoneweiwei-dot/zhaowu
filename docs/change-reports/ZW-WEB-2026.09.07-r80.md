# 昭梧更新報告｜ZW-WEB-2026.09.07-r80

日期：2026-09-07 AEST

## 本次改動

- 修正一掌古法已經生成結果後，再切換「順行／逆行」卻沒有重新計算的最後互動回歸。
- 共享出生資料完整時，進入一掌古法頁仍會自動生成報告；每次切換順逆都會強制重新提交既有表單、更新一掌結果，並重新把精確出生資料送入 D60。
- iPhone Safari 測試改為符合目前已移除重複 Specialist shell 的真實頁面，並新增「共享生辰自動生成 + 切換順逆後報告內容改變 + D60 區塊可見」回歸測試。
- 延續 r79 已上線的首頁分區實際報告、手機音樂直傳、香氣雙欄與右下角小型音樂控制；不另開第二套 UI。

## 為什麼改

r79 已解決第一次進頁無反應，但程式仍有一個 guard：只要 `.palm-result` 已存在，就阻止後續再次提交。因此使用者第一次有結果後再改順逆，畫面會看起來完全沒反應。r80 移除這個錯誤前提，只有首次自動生成會避免重複提交；使用者主動切換順逆則一定重新計算。

## 影響範圍

- `src/components/yizhangjing-runtime-r79.tsx`
- `scripts/r79-visible-regressions.test.mjs`
- `e2e/dual-destiny.iphone-safari.spec.ts`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`

不修改八字、紫微、七政、D60 天文計算公式、真太陽時、月令邊界、登入、付款、Supabase schema 或圖片資產。

## 驗證要求

- Deploy Gate / build PASS。
- Engine + contract suite PASS。
- iPhone Safari：沒有共享生辰時頁面可正常使用；有共享生辰時自動生成；切換順逆後 `.palm-result` 內容必須改變；D60 區塊必須存在；不得橫向溢出。
- Production `githubCommitSha` 必須等於 main HEAD，正式首頁與 `/yizhangjing` 均 HTTP 200 後才寫入 `release_history`。

## 回滾

如強制重新提交造成循環或其他回歸，回滾本次 runtime 的 `force` 路徑即可；r79 的首頁 inline reports、音樂與版面修復可獨立保留。
