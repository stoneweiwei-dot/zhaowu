# 昭梧更新報告｜ZW-WEB-2026.09.08-r82

## 本次改動

- 《昭梧 · 觀世錄》新增三語長篇：〈一個人可能抵達的最高境界：自知、自勝與無為〉。
- 保留站主原稿的核心論述，將重複的職場段落合併，整理為「自知／自勝 → 無為 → 職場實踐 → 高壓下的覺察—抽離—微行動」完整結構。
- 新文章接入既有首頁文章排序，發布日期為 2026-09-08，沿用《觀世錄》latest-first 折疊閱讀方式。
- 補繁體中文、簡體中文與英文完整版本；不新增路由、不改文章 UI、不改命理或報告邏輯。
- 新增文章回歸測試，驗證首頁接入、三語完整度、長文長度與核心段落存在。
- 公開 release fallback 升至 `ZW-WEB-2026.09.08-r82` / 累計更新 `82`。

## 為什麼改

站主要求把本批《道德經》「自知、自勝、無為」文章加入昭梧網站。原稿中現代職場段落有兩組高度重複內容，因此在不刪除核心觀點的前提下合併重複處，保留並展開高壓環境中的實踐方法，使文章能直接作為《觀世錄》長文發布，而不是把聊天素材原樣堆疊上線。

## 影響範圍

會變更：

- `src/lib/life-view-long-form/dao-self-mastery.ts`：新增三語文章正文。
- `src/components/life-view-home-section.tsx`：將文章接入既有《觀世錄》首頁資料源。
- `scripts/dao-self-mastery-article.test.mjs`：新增文章完整度與首頁接入回歸。
- `src/lib/site-stats.ts`：release fallback 升至 r82 / update 82。
- `scripts/release-ledger.test.mjs`：release ledger 對齊 r82。
- `docs/change-reports/ZW-WEB-2026.09.08-r82.md`：本次發布紀錄。

不變更：

- 八字、真太陽時、節氣、四柱、十神與大運計算
- 紫微、七政、一掌經等其他命理模組
- 報告生成、付費牆、登入、帳戶與 Owner 權限
- Supabase schema、權限、資料與環境變數
- Vercel 專案與 production routing
- 首頁既有《觀世錄》折疊 UI 與 iPhone 優先版面

## 內容處理

- 原稿中兩段幾乎重複的「將自勝與無為落實於現代職場／生活」已合併，不重複刊登。
- 「無為」明確解釋為不妄為、不強作、順應條件與節奏，不寫成消極怠惰。
- 高壓焦慮段落維持一般性的自我覺察與行動整理，不作醫療診斷或治療宣稱。
- 英文版使用自然白話翻譯，不堆未轉譯術語。

## 驗證要求

- `npm run test:engine`
- `npm run build`
- Vercel exact commit deployment 必須為 `READY`
- Production 必須對應同一 commit SHA
- 正式站首頁《觀世錄》必須能取得新文章標題與三語正文資產

## 回滾

如 r82 導致文章 import、渲染或 build 回歸，回滾本次單一 production commit 即可恢復 r81。本次沒有資料庫 migration，也不修改命理引擎、登入、支付、報告或使用者資料。

## 驗證狀態

撰寫本檔時：**PENDING CI / PRODUCTION VERIFICATION**。
