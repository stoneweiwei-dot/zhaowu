# 昭梧更新報告｜ZW-WEB-2026.09.27-r206

## 本次改動

- `src/zhaowu-design-system.css`：`:root` 之後新增 `html[data-zw-theme="night"]` 區塊，覆寫 `--zw-ink` / `--zw-ink-soft` / `--zw-muted` 三個文字色變數（分別為 `#f4ead9` / `#d8d0c1` / `#b3ada1`）。
- `src/zhaowu-design-system.css`：`.zhaowu-unified-birth-report` 新增 `max-width: 560px`。

## 為什麼改

稽核發現夜間模式（`data-zw-theme="night"`）先前只針對邊框、背景做了局部 scoped 覆寫，但三個核心文字色變數在 `:root` 從未有夜間對應值，全站沿用日間深色（`#29251f` 等），對深色夜間背景不足 WCAG AA 對比（4.5:1），造成夜間模式下正文近乎不可讀。命書報告區塊在寬螢幕下也沒有寬度上限，行長超出建議閱讀範圍。

## 影響範圍

- 純視覺／CSS 自定義屬性層級變更：夜間模式下所有引用 `--zw-ink` / `--zw-ink-soft` / `--zw-muted` 的文字元件全站連動變亮（預期效果）。
- 命書報告（`.zhaowu-unified-birth-report`）新增閱讀寬度上限。

## 受保護範圍

- 不改 BaZi/紫微計算引擎、報告生成契約、auth/owner 權限、Supabase schema、支付、路由。
- 不改行動版 Header 佈局（現有多處競爭性 `grid-template-columns` 規則，本次不動，避免在未充分驗證下產生新衝突）。

## 驗證狀態

- 合併前：Deploy gate、Engine suite、iPhone Safari 必須全綠。
- 既有測試 `scripts/r193-night-contrast.test.mjs`（3/3）與 `pretest:deploy` 子集（`r196/r197/r201`，14/14）本地驗證通過，無回歸。
- 合併後：Vercel Production githubCommitSha 必須等於最新 main，並驗證夜間模式下報告文字對比與寬度。

## 回滾

`git revert` 本次 commit 即可完整還原（純 CSS + 版本號變更，無資料庫遷移，無破壞性資料變更）。
