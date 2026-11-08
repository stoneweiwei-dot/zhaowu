# 昭梧 × Google AI Studio｜GitHub 共用交接入口

> **用途：** 讓 Google AI Studio／Gemini、ChatGPT／Codex、Claude Code 透過同一個 GitHub 倉庫交接工作。這是入口及操作約定，**不是**新的產品規格、CURRENT STATE、記憶庫，也**不是**證明兩個 AI 已直接連線的紀錄。
>
> 更新日期：2026-11-08（Australia/Sydney）。任何下述現況在執行前必須重新唯讀查證。

## 1. 唯一工作來源

- Repo：https://github.com/stoneweiwei-dot/zhaowu
- Integration branch：`main`；唯一正式站：https://zhao-wu.com/
- 作業權威順序：站主最新指令 → 現時 `main` / Production 證據 → `AGENTS.md`、`docs/AI-COORDINATION.md`、`docs/INSTRUCTION-REGISTRY.md`、`docs/CURRENT-STATE.md`。
- 本文不覆蓋既有專案治理，尤其不覆蓋 `docs/AI-COORDINATION.md` 的 task lock、file lock、分支隔離與完成證據。
- 不共享或提交密鑰、Supabase service role、Stripe webhook token、Cookie、原始個人資料或客戶報告。

## 2. AI Studio 第一次接入（站主操作授權）

官方 AI Studio Build mode 支援 **Import from GitHub** 與 **GitHub two-way sync**：

1. 開啟 https://aistudio.google.com/ ，進入 **Build**。
2. 使用輸入框旁 **＋ → Import from GitHub** 匯入 `stoneweiwei-dot/zhaowu`；首次需由站主同意 Google AI Studio 的 GitHub 存取權。
3. 既有 AI Studio 專案使用 **Settings → GitHub** 連接現有倉庫；**不得**為昭梧新建另一個主倉庫。若已有未保存的 AI Studio 修改，先保留副本，再確認 GitHub 同步差異。
4. 先 **Pull／讀取** 倉庫及下列「啟動指令」，不要立即 Push、覆寫既有檔案或建立 Cloud Run / Vercel / Supabase 資源。
5. Google AI Studio 帳戶授權必須由站主在 Google 端完成；ChatGPT 不能替代那次 OAuth 同意。這是**共用 GitHub 交換狀態**，不是 AI 模型之間自動傳送訊息。

官方使用說明：https://ai.google.dev/gemini-api/docs/aistudio-build-mode

## 3. 給 Google AI Studio 的啟動指令（直接貼入）

```text
你現在接手昭梧 ZHAOWU 站點工作，唯一代碼倉庫為 https://github.com/stoneweiwei-dot/zhaowu。
首先唯讀獲取最新 main、AGENTS.md、docs/AI-COORDINATION.md、docs/INSTRUCTION-REGISTRY.md、docs/CURRENT-STATE.md、docs/STANDBY-BACKUP-PLAN.md，並檢查 open PR / 現有 task locks。
先做「已證實 / 未證實 / 阻塞」的最新狀態分層；不要相信較舊交接文字比實際 GitHub、Vercel、Supabase 更準確。

當前單一優先任務：昭梧 Supabase 刪除後的安全恢復與付款鏈路完整性核對。只在自己隔離的分支處理獨立、已取得 file lock 的改動，PR 說明需標示 TASK / OWNER / STATUS / BASE_MAIN_SHA / SCOPE / DO_NOT_TOUCH / FILE_LOCKS / ACCEPTANCE / PR。不得覆寫他人未合併 PR；不得把 CI/local 當正式站；不得以 schema 備份當舊資料已恢復。

不創建新的 Supabase 專案或主機，不動正式版配置、不部署 Stripe webhook、不修改 DNS、不付費，除非站主另行批准該操作。任何 API key/token 僅透過服務平台 Secret 管理，不得寫入 GitHub 或對話。不要把 AI Studio 推送到 main；若 GitHub 連接只允許直接寫 main，停止並回報，先改走可審查的獨立分支／PR。

完成每一項任務只回報：GitHub 分支/PR/SHA、實際查證、尚缺證據、下一個最小動作。不要自行宣稱已與 ChatGPT 即時同步；兩端以 GitHub commit/PR/Issue 為交接證據。
```

## 4. 先前查證的 Supabase 事故基線（非即時結果）

**必須重新核對**：2026-11-08 先前連接器唯讀檢查顯示：

- 原正式 Supabase 專案 `plgpxusmemnmzckbwtiv` 已刪除，Supabase 官方曾答覆不可直接還原。
- 現存 `zhaowu-core` 專案 `gyisxbkjzvdretbqzeuw` 為 `ACTIVE_HEALTHY`，schema/migrations 及部分 Edge Functions 存在，但不能等同舊資料復原。
- 當時 `stripe-checkout` 已 ACTIVE，而正式付款事件收件的 `stripe-webhook` **未**在此專案的已部署 Edge Functions 清單；GitHub 有 `supabase/functions/stripe-webhook/index.ts`。**先查 Stripe 實際 webhook endpoint 與事件，再決定是否需要部署；未授權不能直接上線。**
- `zhaowu-core` 當時 Storage `zhaowu-gallery` / `zhaowu-backgrounds` 均為 **0 objects**；`owner_devices`、`report_requests`、`report_purchase_entitlements` 為 0 rows；最近又有新用戶/訪問計數資料，查詢時應以即時數據為準。
- Vercel `stone-zhaowu-official` Production `VITE_SUPABASE_URL` 及 `SUPABASE_URL` 的值查證為 `gyisxbkjzvdretbqzeuw`；`NEXT_PUBLIC_SUPABASE_URL` 殘留舊專案 URL（**先確認程式是否引用，不能盲刪**）。`VITE_SUPABASE_PUBLISHABLE_KEY` 曾與現存 Supabase 公開金鑰對上；**其餘加密 Key 必須逐一安全比對，不能以環境變數名稱或註解推測正確**。
- `main` 與當時 Vercel production deployment 的 Git commit 均為 `12a64ed1894c26c724aa6844e280361f8f1b908e`（此 SHA 非永久 CURRENT）。
- GitHub `owner-music` 分支的 manifest 當時列出 41 首曲目；`main/public/` 有靜態媒體檔，但它們不是 Supabase 舊 Storage 已還原的證據。
- Dropbox `/Zhaowu-Backup/` 只有結構/程式/遷移/部署清單備份；沒有已驗證的完整舊庫資料 dump / Storage 物件備份。
- Supabase security advisor 有 INFO：部分刻意封閉的表 RLS enabled no policy；不能因提示就任意加匿名政策。Supabase Auth leaked password protection 另有 WARN，但站主 login 是 owner-cookie 系統，優先證明實際影響再處理。

## 5. 共用工作規則

- 職責：AI Studio 依站主指定執行修復/測試；ChatGPT 依 GitHub、Supabase、Vercel 的當前證據作獨立唯讀驗收。不是雙方同步持久記憶。
- 單一任務僅一位編輯者；先確認他人 PR/file locks，避免兩個 AI 同時改 `supabase/`、`lib/owner-`、`vercel.json`、支付或認證模組。
- 若 AI Studio 可選分支，使用 `aistudio/<task-id>-<slug>`；提交 PR 後由另一端只讀 review。如 AI Studio 僅能直接推 `main`，**不要推**；改用 ZIP / patch 經隔離分支審核。
- 技術文件 / PR 可以共用；正式部署、付款配置、刪除、資料導入與額外費用必須另獲站主批准。
- 不要假設「綁定 Google Drive」等於「AI Studio 已讀取該 Drive 檔案」；同步的核心是 **GitHub**。

## 6. 一句話交接格式

`TASK | OWNER | STATUS | BASE_MAIN_SHA | BRANCH | PR | FILES_CHANGED | LOCKS_HELD | TESTS | PRODUCTION | NEXT_ACTION | NEW_BACKLOG`

詳見 `docs/AI-COORDINATION.md`。如果尚未有 AI Studio GitHub OAuth 授權，`STATUS=BLOCKED`，`NEXT_ACTION=站主在 AI Studio Build mode 選擇 Import from GitHub 並授權`。
