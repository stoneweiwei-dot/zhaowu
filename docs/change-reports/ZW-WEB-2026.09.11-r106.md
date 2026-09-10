# 昭梧更新報告｜ZW-WEB-2026.09.11-r106

## 本次改動
- 新增 `/knowledge`「昭梧知識圖鑑」：收錄十天干本象、五步知識卡讀序、神煞旁證使用規則、古籍原文／今人整理來源標籤，以及趣味測驗與正式命理的隔離說明。
- 將站主本輪三組參考素材正式收口到 `docs/OWNER-MATERIAL-INGESTION-2026-09-11.md`，只吸收產品結構、內容語法與視覺方向；第三方圖片、原文案、品牌、水印、角框與版式不得直接再利用。
- 更新 `docs/STEM-VISUAL-SYMBOLISM-v1.0.md` 至 v1.1：加入甲乙丙丁戊己庚辛壬癸的教學本象、白話功能詞、昭梧視覺主象與宋式原創規格。
- 固定十天干使用邊界：本象只作教學與命象轉譯，不得脫離月令、旺衰、格局、病藥、透藏與歲運單獨斷命；辛金月華仍只屬昭梧視覺象義延伸。
- 現有 `/numerology` 已在目前 main 保留完整 1–9、11／22／33 結果頁與 `/knowledge` 入口，本次補上實際知識圖鑑路由，不重做已存在功能。
- Release fallback 由 r105 / 105 推進到 r106 / 106。

## 為什麼改
- 站主三輪素材同時涵蓋排盤入口、生命靈數、修心／古訓、神煞、趣味分級、五行天干與青綠仙境；若零散加入，容易把正式子平主判、象徵工具、網路文案與視覺參考混在一起，因此先做結構化分層。
- `/numerology` 已經有指向 `/knowledge` 的入口，而 production 尚未有對應知識圖鑑頁；本次補齊後可避免入口指向不存在的路由。
- 十天干具象法適合教學，但必須明確防止「甲木＝樹」「丙火＝太陽」等比喻反向取代 deterministic calculation。

## 影響範圍
- `src/routes/knowledge.tsx`
- `docs/OWNER-MATERIAL-INGESTION-2026-09-11.md`
- `docs/STEM-VISUAL-SYMBOLISM-v1.0.md`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- `docs/change-reports/ZW-WEB-2026.09.11-r106.md`

## 保護範圍
- 不修改八字排盤、真太陽時、月令、旺衰、格局、病藥、喜用、歲運或任何 deterministic calculation。
- 不修改 R6.2.1 主判順序與權重；生命靈數、神煞與本象維持降級／象徵／教學角色。
- 不修改 auth、payment、Supabase schema、完整報告 `summary / body` 契約、使用者資料或既有 `/fun-tests` 評分邏輯。
- 不直接導入站主提供的第三方參考圖片、品牌、水印或原版文案。

## 回滾
- 回滾 r106 整合 commit 即可移除 `/knowledge` runtime、站主素材 ingestion 與十天干 v1.1 擴充，並把 release fallback／ledger test 還原到 r105。
- 本次沒有資料庫 migration。

## 驗證
- 舊分支 `feat/numerology-knowledge-r105` 的三個內容提交已產生 Vercel Preview `READY`，其中 `/knowledge` 對應提交 SHA 為 `804b39fc0c79090b8e336c7a45c6da49b5f0c811`。
- r106 以目前 production/main SHA `9e86a0c9bd9ca2f2b9c07ea33a9350cb935e6078` 為新基底重新整合，避免覆蓋已上線的每日色彩 r105。
- 合併前仍要求 GitHub CI／Deploy gate／TypeScript／Vite build 通過。
- 合併後必須確認 Vercel Production `READY` 且 `githubCommitSha == main HEAD`，再檢查 `/`、`/numerology`、`/knowledge` 與 production runtime errors。
- iPhone 真機畫面未經此提交階段聲稱已驗證；只在有實際 production evidence 後標記完成。
