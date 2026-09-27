# ZW-WEB-2026.09.27-r206

## 變更
1. `src/zhaowu-design-system.css`：`:root` 之後新增 `html[data-zw-theme="night"]` 區塊，覆寫 `--zw-ink` / `--zw-ink-soft` / `--zw-muted` 三個文字色變數（分別為 `#f4ead9` / `#d8d0c1` / `#b3ada1`），對深色夜間背景達到 WCAG AA 對比（>4.5:1）。
2. `src/zhaowu-design-system.css`：`.zhaowu-unified-birth-report` 新增 `max-width: 560px`。

## 為什麼
- 稽核發現夜間模式（`data-zw-theme="night"`）先前只針對邊框、背景做了局部 scoped 覆寫（例如 L722/L726/L1615-1631 一類的規則），但三個核心文字色變數在 `:root` 從未有夜間對應值，全站沿用日間深色（`#29251f` 等），造成夜間模式下正文近乎不可讀。
- 命書報告區塊在寬螢幕下沒有寬度上限，行長超出建議閱讀範圍。

## 影響範圍
- 純視覺／CSS 變數層級變更，不涉及排盤邏輯、認證、路由、Supabase schema、支付。
- 因為 `--zw-ink` 等變數是全站共用的 CSS 自定義屬性，夜間模式下所有引用這些變數的文字都會連動變亮（這是預期效果，不是副作用）。

## 保護範圍（未觸碰）
- BaZi/紫微計算引擎、報告生成契約、auth/owner 權限、Supabase schema、支付、行動 Header 佈局（多處競爭規則，本次不動，避免在未充分驗證下產生新衝突）。

## 回滾路徑
- `git revert` 本次 commit 即可完整還原（純 CSS + 版本號變更，無資料庫遷移）。

## 驗證狀態
- 既有測試 `scripts/r193-night-contrast.test.mjs`（3/3）與 `pretest:deploy` 套件（`r196/r197/r201`，共 14/14）全數通過，無回歸。
- 尚未執行完整 `npm run build`（含 `test:deploy` 全量 47 份測試 + `tsc --noEmit` + `vite build`）與 Vercel production 部署驗證——見主回報的 completion report。
