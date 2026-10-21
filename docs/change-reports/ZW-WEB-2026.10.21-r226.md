# 昭梧更新報告｜ZW-WEB-2026.10.21-r226

## 本次改動

近日天象新增 2026 年 10 月 19–25 日的週報資料：太陽於 10 月 23 日進入熱帶黃道天蠍座、水星於 10 月 24 日在天蠍座開始視逆行，以及同日太陽合金星。資料列明 UTC 與悉尼 AEDT 時刻、角度／座標慣例、來源與時間差異，並以繁體中文、簡體中文及英文呈現。首頁與 `/sky-events` 由既有 `getFeaturedSkyEvent()` 自動選取最新發布內容。

同步更新公開版本備援資訊至 `ZW-WEB-2026.10.21-r226`／`updateNumber 226`、驗證常數及本報告。序號依 Supabase `public.release_history` 最新列 `r225 / 225` 加一。

## 為什麼改

按每週天象維護，提供本週可由星曆核驗的重要換座、視逆行與合相資訊。使用者需要能區分幾何／座標事實和傳統占星象徵；逆行不應被描述為行星真的倒退，也不應把占星象徵包裝成科學因果。

## 影響範圍

- `src/lib/sky-events.ts`：新增一筆三語 `SkyEvent`，發布日期為悉尼 2026-10-21。
- `src/lib/site-stats.ts`、`lib/zhaowu-verification.js`、`scripts/r162-production-closeout.test.mjs`：同步版本與序號契約。
- `docs/change-reports/`：新增本次版本報告。
- Supabase：僅在匹配版本通過正式部署驗證後，新增一筆 `release_history` 帳本記錄；不變更 schema 或舊列。

## 受保護範圍

不改動八字／紫微計算引擎、報告生成契約、登入與站主權限、付款、路由、多語系統、Supabase schema、天象頁元件及首頁選取邏輯。正式站維持唯一 Vercel Production。

## 驗證狀態

- 天象時刻由 Cafe Astrology、CHANI、Astrolis 與 Swiss Ephemeris 相關星曆交叉查核；悉尼時刻按 AEDT（UTC+11）換算。各來源約一分鐘的時刻差異已標示為近似值。
- 本地 `npm run check` 與 `npm run build`：通過；建置輸出含獨立 lazy `sky-events` chunk。
- 定向測試 `scripts/today-sky-cards.test.mjs` 與 `scripts/release-ledger.release.mjs`：14/14 通過。`npm run test:deploy` 的原有首頁斷言與目前 `PaintedHome` 標記不一致，已調整測試定位至 `data-home-resolve`／`data-home-birth-entry`，待重跑。
- Engine suite 曾以 main 基線重跑：1180 項中 108 項失敗，包含多個既有缺檔／舊契約錯誤；待確認分支結果是否相同，未將其視為通過。
- GitHub Actions：待確認 Deploy gate、Engine suite、iPhone Safari 三項檢查。
- Production deployment 與部署 bundle：待確認；未完成驗證前不得寫入 Supabase release ledger。

## 回滾

若驗證發現事件或版號錯誤，於同一分支修正並重跑檢查；若已合併但未通過正式驗證，依 repo 正常回滾流程還原本次 commit，再核對唯一 Production。帳本只在部署確認後 insert；若已記錄，保留原列並以後續更正版本追溯，不刪改歷史資料。
