# 昭梧更新報告｜ZW-WEB-2026.09.11-r109

## 本次改動
- 將 `/numerology` 由簡版結果頁擴充為完整連續手機報告：結果身份 → 核心解讀 → 五個核心詞 → 中央命象 → 你是怎樣的人 → 五項天賦 → 容易卡住的位置 → 真正的人生課題 → 適合發展方向 → 現實行動 → 收束句。
- 保留既有生命靈數算法：以出生年月日數字總和遞減，11／22／33 遇到即保留；Master Number 仍與基礎數一起理解，且明示不是人生高低排名或另一個命格。
- 五項天賦在 iPhone 採橫向 snap 滑動；較寬螢幕才展開五欄，避免 390–430 px 卡片過窄。
- 發展方向只作能力傾向，不寫成職業宿命；整頁持續標示為象徵性自我探索工具，不取代昭梧子平八字主判。
- 保留 `/knowledge` 入口，延續 r106 已上線的昭梧知識圖鑑。
- 調整 Master Number 回歸測試與 iPhone Safari 測試，使其驗證新版完整報告的實際語意與標題，而不是鎖死被新版 UI 取代的舊 DOM 標記。
- 同步修正 r108 Tea Guardian 已改為同源靜態圖後遺留的舊 Gallery 測試：現在明確驗證結果卡不再呼叫 Supabase Gallery／Storage；不改 Owner Gallery 管理能力。
- Release fallback 推進至 r109 / 累計更新 109。

## 為什麼改
- r106 已完成站主三輪參考素材的知識圖鑑、十天干規範與素材分層，但生命靈數仍停留在較短的結果呈現；本次補齊先前確立的完整手機閱讀層。
- r107／r108 已改動前台語言與 production 穩定化，因此本次直接建立在 r108 穩定化分支之上，不回滾較新的繁體預設、語言選擇器收口、Tea Guardian 同源靜態資產與 egress 修正。
- r108 的 Tea Guardian runtime 已不再查 Supabase Gallery，但舊 `gallery-assets` 測試仍要求舊查詢函式，會使 Engine suite 出現假性失敗；本次只把測試更新成與現行 runtime 一致的契約。

## 影響範圍
- `src/routes/numerology.tsx`
- `src/lib/site-stats.ts`
- `scripts/numerology-report.test.mjs`
- `scripts/mobile-owner-regressions.test.mjs`
- `scripts/gallery-assets.test.mjs`
- `scripts/release-ledger.test.mjs`
- `e2e/mobile-visual-navigation.iphone-safari.spec.ts`
- 本變更報告

## 保護範圍
- 不修改出生資料來源與生命靈數加總／11、22、33 保留算法。
- 不修改八字排盤、真太陽時、月令、格局、病藥、喜用、歲運或任何 deterministic calculation。
- 不修改 R6.2.1 主判、auth、payment、Supabase schema、完整付費報告 `summary / body` 契約、使用者資料、`/fun-tests` 或 `/quiz/six-realms`。
- 不恢復 r107 已撤下的簡體／日文前台選項，也不改 r108 Tea Guardian 靜態資產與 egress 修正。

## 回滾
- 將 `src/routes/numerology.tsx`、相關 Master Number／iPhone 回歸測試與 release metadata 還原至 r108。
- 還原 `scripts/gallery-assets.test.mjs` 時，必須連同 r108 Tea Guardian runtime 一起回滾，不能只恢復已失效的 Supabase 查詢測試。
- 刪除本次新增的 `scripts/numerology-report.test.mjs` 與本報告。
- 本次沒有資料庫 migration。

## 驗證
- 必須通過 Deploy gate、Engine suite、TypeScript、Vite build 與 iPhone Safari 套件。
- iPhone 390–430 px 的五項天賦必須可橫向閱讀，且不得造成整頁橫向溢出。
- Tea Guardian 固定結果圖必須繼續走同源 `/tea-guardians/*.webp`，不得恢復公共結果卡的 Supabase Gallery／Storage 讀取。
- 合併後 Vercel Production 必須 `READY` 且 `githubCommitSha == main HEAD`。
- 正式站至少驗證 `/numerology`、`/knowledge`、`/tea-guardian` 與 production runtime errors。
- 只有 Production 驗證通過後，才把 r109 寫入 Supabase `public.release_history`。
