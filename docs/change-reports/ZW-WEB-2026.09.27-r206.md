# 昭梧更新報告｜ZW-WEB-2026.09.27-r206

## 本次改動

- `src/zhaowu-design-system.css`：`.zhaowu-unified-birth-report` 新增 `max-width: 560px`。

## 為什麼改

命書報告區塊在寬螢幕下沒有寬度上限，行長超出建議閱讀範圍。

（本輪原本也計畫修正夜間模式文字對比：在 `:root` 層級加入 `html[data-zw-theme="night"]` 覆寫 `--zw-ink` 等變數。但 CI 的 `scripts/r184-iphone-report-hierarchy.test.mjs`「r185 keeps paper surfaces dark-ink and dark metadata panels light-ink at night」明確禁止這個寫法：系統設計是「紙面卡片在夜間模式仍維持淺色背景＋深色文字」的局部模式，並非全域變暗；根層級覆寫會讓 `.zhaowu-result-flow` 等紙面卡片的深色文字變成淺色文字疊在淺色背景上，反而致盲。已撤回該項變更，僅保留寬度修復。）

## 影響範圍

- 命書報告（`.zhaowu-unified-birth-report`）新增閱讀寬度上限。

## 受保護範圍

- 不改 BaZi/紫微計算引擎、報告生成契約、auth/owner 權限、Supabase schema、支付、路由。
- 不改夜間模式紙面／深色面板的既有局部配色架構（`r184-iphone-report-hierarchy.test.mjs` 的 r185 契約）。
- 不改行動版 Header 佈局（現有多處競爭性 `grid-template-columns` 規則，本次不動）。

## 驗證狀態

- 合併前：Deploy gate、Engine suite、iPhone Safari 必須全綠。
- 本地驗證：`scripts/release-ledger.test.mjs`、`scripts/r162-production-closeout.test.mjs`、`scripts/r193-night-contrast.test.mjs` 全數通過。
- 合併後：Vercel Production githubCommitSha 必須等於最新 main，並驗證命書報告寬度。

## 回滾

`git revert` 本次 commit 即可完整還原（純 CSS + 版本號變更，無資料庫遷移）。
