# 昭梧更新報告｜ZW-WEB-2026.09.11-r103

## 本次改動
- 延續 r102 已完成的語言選擇 active 配色鎖定。
- 將宣紙殼層三個代表路由 `/`、`/ziwei`、`/qizheng` 拆成獨立 Playwright 測試 context，避免同一 page 第二次導航承接既有 Service Worker controller 而被自動刷新打斷。
- 不攔截、不修改正式 `/sw.js`；只修正測試隔離方式。
- Release fallback 升級為 r103 / 累計更新 103。

## 為什麼改
- r102 後完整 iPhone Safari 已由 31/33 提升為 32/33；語言 active 樣式測試已通過，唯一剩餘失敗仍是 `/ziwei` 導航被 `/` 自動刷新打斷。
- Playwright page routing 不能可靠攔截 Service Worker script 請求，因此改用每個代表路由一個全新 test context，直接消除跨導航 controller 狀態，且不改產品行為。

## 影響範圍
- `e2e/auspicious-emblems.iphone-safari.spec.ts`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- 本變更報告

## 保護範圍
- 不修改正式 Service Worker。
- 不修改命理引擎、auth、payment、Supabase schema、權限、資料或 env。

## 回滾
- 將宣紙殼層測試恢復為單一 page 依序巡覽路由。
- 將 release fallback / ledger 測試還原至 r102。

## 驗證
- Deploy gate、Engine suite、完整 iPhone Safari 必須全部 PASS。
- Vercel Production 必須 READY 且 `githubCommitSha == main HEAD`。
- 正式站唯讀驗證首頁、登入、帳戶、分析入口與語言切換。
