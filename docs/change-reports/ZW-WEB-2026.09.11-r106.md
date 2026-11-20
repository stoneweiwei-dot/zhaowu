# 昭梧更新報告｜ZW-WEB-2026.09.11-r106

## 本次改動
- 新增 `/knowledge`「昭梧知識圖鑑」：收錄十天干本象、五步知識卡讀序、神煞旁證使用規則、古籍原文／今人整理來源標籤，以及趣味測驗與正式命理的隔離說明。
- 將站主本輪三組參考素材正式收口到 `docs/OWNER-MATERIAL-INGESTION-2026-09-11.md`，只吸收產品結構、內容語法與視覺方向；第三方圖片、原文案、品牌、水印、角框與版式不得直接再利用。
- 更新 `docs/STEM-VISUAL-SYMBOLISM-v1.0.md` 至 v1.1：加入甲乙丙丁戊己庚辛壬癸的教學本象、白話功能詞、昭梧視覺主象與宋式原創規格。
- 固定十天干使用邊界：本象只作教學與命象轉譯，不得脫離月令、旺衰、格局、病藥、透藏與歲運單獨斷命；辛金月華仍只屬昭梧視覺象義延伸。
- 現有 `/numerology` 已在目前 main 保留完整 1–9、11／22／33 結果頁與 `/knowledge` 入口，本次補上實際知識圖鑑路由，不重做已存在功能。
- 收緊 Tea Guardian iPhone Safari QA：已知的外部 Supabase `402 Payment Required` 只有在實際 402 response 可追溯到固定 Supabase host 時才視為可降級外部服務；任何其他 402、其他 console error、圖片 fallback 失敗或橫向溢出仍會讓測試失敗。這是測試分類修正，不改 Tea Guardian runtime。
- Release fallback 由 r105 / 105 推進到 r106 / 106。

## 為什麼改
- 站主三輪素材同時涵蓋排盤入口、生命靈數、修心／古訓、神煞、趣味分級、五行天干與青綠仙境；若零散加入，容易把正式子平主判、象徵工具、網路文案與視覺參考混在一起，因此先做結構化分層。
- `/numerology` 已經有指向 `/knowledge` 的入口，而 production 尚未有對應知識圖鑑頁；本次補齊後可避免入口指向不存在的路由。
- 十天干具象法適合教學，但必須明確防止「甲木＝樹」「丙火＝太陽」等比喻反向取代 deterministic calculation。
- 首輪與單次重跑的 iPhone Safari 都是同一個既有 Tea Guardian 測試報錯：38/39 通過，唯一失敗是瀏覽器把外部資源的 `402 Payment Required` 記為 console error。Supabase 專案本身已另行確認為 `ACTIVE_HEALTHY`，現用 publishable key 亦未停用；因此 QA 改成辨識來源而不是無條件忽略 402，避免外部降級噪音阻塞完全無關的 UI 變更，同時保留對未知 402 的阻擋能力。

## 影響範圍
- `src/routes/knowledge.tsx`
- `docs/OWNER-MATERIAL-INGESTION-2026-09-11.md`
- `docs/STEM-VISUAL-SYMBOLISM-v1.0.md`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- `e2e/tea-guardian.iphone-safari.spec.ts`
- `docs/change-reports/ZW-WEB-2026.09.11-r106.md`

## 保護範圍
- 不修改八字排盤、真太陽時、月令、旺衰、格局、病藥、喜用、歲運或任何 deterministic calculation。
- 不修改 R6.2.1 主判順序與權重；生命靈數、神煞與本象維持降級／象徵／教學角色。
- 不修改 auth、payment、Supabase schema、完整報告 `summary / body` 契約、使用者資料或既有 `/fun-tests` 評分邏輯。
- 不修改 Tea Guardian runtime 或推薦邏輯；本次 Tea Guardian 變更僅限 E2E 對已知外部 402 的來源分類。
- 不直接導入站主提供的第三方參考圖片、品牌、水印或原版文案。

## 回滾
- 回滾 r106 整合提交即可移除 `/knowledge` runtime、站主素材 ingestion、十天干 v1.1 擴充與 Tea Guardian E2E 分類修正，並把 release fallback／ledger test 還原到 r105。
- 本次沒有資料庫 migration。

## 驗證
- 舊分支 `feat/numerology-knowledge-r105` 的三個內容提交已產生 Vercel Preview `READY`，其中 `/knowledge` 對應提交 SHA 為 `804b39fc0c79090b8e336c7a45c6da49b5f0c811`。
- r106 以目前 production/main SHA `9e86a0c9bd9ca2f2b9c07ea33a9350cb935e6078` 為新基底重新整合，避免覆蓋已上線的每日色彩 r105。
- 首輪及單次重跑的 Production CI：Engine suite 成功、Deploy gate 成功、iPhone Safari 38/39；唯一失敗均為 Tea Guardian 收到 14 個相同 `402 Payment Required` console 訊息，功能本身、結果卡、fallback 圖片與 overflow 檢查均已通過。
- Supabase project `plgpxusmemnmzckbwtiv` 已確認 `ACTIVE_HEALTHY`，預設 `sb_publishable_...` key 為 enabled；本次因此以「來源可驗證」方式修正測試，而非把所有 402 靜默忽略。
- QA 修正提交後仍要求完整 GitHub CI／Deploy gate／TypeScript／Vite build 再通過後才允許合併。
- 合併後必須確認 Vercel Production `READY` 且 `githubCommitSha == main HEAD`，再檢查 `/`、`/numerology`、`/knowledge` 與 production runtime errors。
- iPhone 真機畫面未經此提交階段聲稱已驗證；只在有實際 production evidence 後標記完成。
