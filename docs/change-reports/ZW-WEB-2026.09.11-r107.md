# 昭梧更新報告｜ZW-WEB-2026.09.11-r107

## 本次改動
- 將 `/numerology` 由原本的簡版「結果＋強項／課題／行動」擴充為完整連續報告：結果身份 → 核心解讀 → 五個核心詞 → 中央命象 → 你是怎樣的人 → 五項天賦 → 容易卡住的位置 → 真正的人生課題 → 適合發展方向 → 現實行動 → 收束句。
- 保留 1–9、11／22／33 的既有計算邏輯；11／22／33 繼續與基礎數一起理解，並明示 Master Number 不是人生高低排名或另一個命格。
- 五項天賦在 iPhone 採橫向 snap 滑動，桌面才展開五欄，避免 390–430 px 寬度下卡片被壓得過窄。
- 生命靈數的發展方向明示為能力傾向，不寫成職業宿命；整頁繼續標示為象徵性自我探索工具，不取代昭梧子平八字主判。
- 保留 `/knowledge` 入口，直接銜接 r106 已上線的昭梧知識圖鑑。
- 更新既有 Master Number 回歸測試，由鎖死舊 DOM 標記改為驗證實際產品契約：Master Number 判斷、基礎數聯讀、非等級化文案與個人結果頁位置。
- Release fallback 推進到 r107 / 累計更新 107。

## 為什麼改
- r106 已完成三輪站主素材的知識圖鑑、十天干規範與素材分層，但 production 的 `/numerology` 仍只有簡版結果層，未完成先前已確立的完整手機報告讀序。
- 本次只補足生命靈數閱讀層，不重複改動 r106 已完成的 `/knowledge`、十天干、神煞與 OWNER_MATERIAL ingestion。
- 舊回歸測試檢查的是已被新版 UI 取代的 `data-master-number-insight` DOM 寫法；功能契約仍保留，因此同步將測試改成行為／內容契約，避免舊標記阻止新版呈現。

## 影響範圍
- `src/routes/numerology.tsx`
- `src/lib/site-stats.ts`
- `scripts/numerology-report.test.mjs`
- `scripts/mobile-owner-regressions.test.mjs`
- `scripts/release-ledger.test.mjs`
- `docs/change-reports/ZW-WEB-2026.09.11-r107.md`

## 保護範圍
- 不修改出生日期取值與生命靈數加總／11、22、33 保留算法。
- 不修改八字排盤、真太陽時、月令、格局、病藥、喜用、歲運或任何 deterministic calculation。
- 不修改 R6.2.1 主判、auth、payment、Supabase schema、完整付費報告 `summary / body` 契約、使用者資料、`/fun-tests` 或 `/quiz/six-realms`。
- 不回滾或覆蓋 r106 已上線的 `/knowledge` 與三輪素材 ingestion。

## 回滾
- 將 `src/routes/numerology.tsx` 還原至 r106 簡版結果頁。
- 將 Master Number 回歸測試、release fallback 與 release-ledger test 還原至 r106。
- 本次沒有資料庫 migration。

## 驗證
- PR 必須通過既有 GitHub CI／Engine suite／Deploy gate／TypeScript／Vite build。
- Vercel Preview／GitHub Vercel check 必須成功，確認 `/numerology` 可構建並保留 `/knowledge` 連結。
- 合併後 Vercel Production 必須 READY 且 `githubCommitSha == main HEAD`。
- 正式站至少驗證 `/numerology`、`/knowledge`，並檢查 production runtime errors。
- iPhone Safari 套件必須通過；390–430 px 的五項天賦採內層橫向滑動，不得造成整頁橫向溢出。
