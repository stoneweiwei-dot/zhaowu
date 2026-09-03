# 昭梧更新報告｜ZW-WEB-2026.09.04-r38

## 本次改動

- Loading 啟動鏈改成 **local-only / fail-open**：`src/lib/bootstrap-readiness.ts` 不再於首屏等待 Supabase `migration_state`、命理核心 bundle、舊九頁報告或圖像規格預熱。
- 保留目前已批准的雙生蓮 Loading 圖像、動效與 3 秒硬退出；本批不改 Loading 美工，只改它是否能卡住網站。
- iPhone Safari 回歸新增「啟動期間不得請求 migration_state」與「後端 503 不能控制 Loading 放行」。
- PWA service worker shell cache 升到 `zhaowu-shell-r38`，讓已存到手機桌面的舊殼可收到新的啟動邏輯。
- 把 Supabase 已啟用但尚未合進 `main` 的 directive runtime 正式接到網站：
  - 已核驗、直接引文的古籍句子可由只讀 RPC 匹配進中文連續報告。
  - RPC/資料讀取失敗時完全不阻塞文字報告。
  - `metaphysics_default_protocol`、`ziwei_interpretation_grammar` 沿用既有 production runtime，不另建第二套。
  - `paid_report_style` 服從目前「總體概括 → 身體需要注意」連續紙面；舊九頁不得復活。
  - `classical_bazi_research_digest` 保持背景研究用途，未驗證 owner material 不冒充古籍。
- 將 classic passage 的三個 migration 同步回 repo，與已執行的 Supabase production 狀態對齊。
- 公開 release fallback 更新為 `ZW-WEB-2026.09.04-r38` / 累計更新 `38`。

## 為什麼改

目前 Loading 雖有 3 秒硬退出，但首屏 readiness 仍把 Supabase、報告 bundle、已廢止的 `nine-page` 模組與圖像規格當作啟動前置條件。這會把任何網路延遲、資料服務異常或次要模組錯誤放大成「看起來網站卡住」。網站正文其實已在 Loading 下方掛載，因此正確邊界是：Loading 只負責短暫視覺過場，不能充當後端健康檢查器。

同時，Supabase directive runtime 已在 production database 啟用，但對應網站 runtime 還停在 PR #202。這次把它與 Loading 修復合成一次非視覺 production batch，避免再多觸發不必要的 Preview / Production build。

## 影響範圍

會變更：

- 首屏 bootstrap readiness 的依賴邊界
- iPhone Safari Loading 防卡死回歸
- 已安裝 PWA 的 shell cache 版本
- 中文完整報告可選的一條 verified classic passage
- Supabase directive runtime 的 repo migration / runtime 對照
- footer release fallback

不變更：

- 現在正在做的網站美工、宣紙、卡片、Loading 圖畫與動畫設計
- 八字排盤、真太陽時、四柱、藏干、十神、大運 calculation truth
- 紫微 calculation truth
- 報告「總體概括 → 身體需要注意」結構
- 登入、帳戶、payment
- 圖像 provider 與 Gallery fallback
- 英文報告不輸出未核驗的古籍翻譯

## 安全邊界

- Loading 不再用 Supabase 是否可連線判斷首頁能否顯示。
- 古籍匹配只取 `verified + is_direct_quote=true + active`；base tables 不向 anon/authenticated 直接開放。
- 高風險自傷、精神危機與喪親急性期按 passage avoid tags 排除不適合的句子。
- classic passage RPC 失敗採 fail-open，不得讓主報告消失。
- 不改任何鎖定的 Bazi calculation core。

## 測試

Release candidate 必須通過：

- `npm run test:engine`
- TypeScript `tsc --noEmit`
- Vite production build
- `classic-passage-runtime.test.mjs`
- `intro-loading.test.mjs`
- `loading-gate.iphone-safari.spec.ts`
- 現有登入／帳戶／報告保存回歸
- release ledger regression

## 回滾

回滾本 release commit 可恢復 r37 網站行為；PWA cache 會在下一 service-worker 版本重新接管。Supabase classic-passage tables/RPC 已先行存在於 production database，網站回滾只會停止前端消費它們，不需要刪除客戶資料，也不應因前端回滾破壞既有資料庫結構。

## 驗證狀態

撰寫本檔時為 release candidate：**PENDING CI / PREVIEW / PRODUCTION VERIFICATION**。

只有 exact commit 通過 Production CI、唯一 Vercel 專案 `stone-zhaowu-official` 的 Preview 驗證後，再合入 `main`；正式站 Production `READY` 且首頁／登入／帳戶在 iPhone 路徑可用後，才可寫入 `public.release_history`。
