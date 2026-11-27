# PR #1169 第二輪 Playwright 對照

分支 084b8aa7 與 main-base cbcdd766 各自執行原設定的 `playwright test --list`，均列出 31 個檔案、570 個案例。兩版之間 e2e、playwright.config.ts 與既有 workflow 沒有差異。

兩邊的 webServer 命令都是 `npm exec vite -- --host 127.0.0.1 --port 4173`。CI 模式停用既有 server 重用。裝置、重試次數、斷言與測試檔均沿用倉庫版本。

瀏覽器執行暫停在對外網路隔離。即使自動化瀏覽器會跳過 recordVisit 寫入，site-shell.tsx 仍會呼叫 getPublicSiteStats，後者透過 publicFetch 讀取遠端 Supabase 的 site_settings 與 release_history。原設定未統一攔截這些請求。兩份 JSON 尚未產生，無實測紅項可逐條歸因，新紅數未知。舊首頁元素及 390px 裝置線索尚待實跑確認。

main-base 開工時已有五個受追蹤建置差異及兩個未追蹤檔，其中包含 review-base.config.ts。本輪僅在該目錄探索原設定的測試清單。

## 寫入路徑複查與執行狀態

檢查版本為分支 4a7b0afa、main-base cbcdd766。兩版的排盤流程在 src/components/analysis-form.tsx 計算成功後呼叫 saveVisitorChart，由 src/lib/supabase-rest.ts 向 /functions/v1/visitor-chart-save 發出 POST。這會影響實際送出排盤的案例，包括 authenticated-report-save 的訪客流程。寫入採 best effort，畫面成功不能證明遠端已保存。recordVisit 在 navigator.webdriver 為真時會提前返回，不會送出 /rest/v1/rpc/zhaowu_record_visit。

預定兩版均以行程環境設定 VITE_SUPABASE_URL=http://127.0.0.1:9 與 VITE_SUPABASE_PUBLISHABLE_KEY=offline-placeholder。Supabase 共用基底，因此未由 page.route 模擬的 /rest/v1、/auth/v1、/functions/v1 請求都會被隔離，包括 site_settings 和 release_history。authenticated-report-save 的 REST/auth 模擬仍由原測試處理。guest-account-isolation 呼叫同源 /api/owner-data，原 Vite webServer 未設定 API proxy。functions/sb 的代理只供部署環境使用，本機 HTTP 網域不會選用 /sb。

背景啟動在建立行程前被執行政策拒絕。兩版均未取得 JSON，三項計數與新紅均未知，不能將未執行的案例算作略過。
