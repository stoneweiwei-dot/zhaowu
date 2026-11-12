# 觀世錄文章目錄接回（2026-11-12）

本次僅提交 PR，須經 Stone 批准後才可合併上線；不合併、不部署、不操作 Vercel 或資料庫。

原目錄為 55 篇；原先待接回的 19 篇經與既有主題比對，保留 13 篇獨立文章、排除 6 篇高度重複主題，另新增 1 篇三語情商文章後，ARTICLE_CATALOG 為 69 篇，原 55 篇保留且 ID 不重複。不新增或改寫正文。

首頁仍預設只顯示最新一篇，展開後顯示其餘文章；`/knowledge` 使用 `archiveMode` 顯示完整目錄。站主文章管理器沿用同一 ARTICLE_CATALOG。既有資料庫文章覆寫／下架狀態仍受尊重，本次不寫入資料庫。

## 接回的 13 篇獨立文章

- `world-as-mirror-not-physics`（`src/lib/life-view-20260831.ts`）
- `money-needs-order-not-anxiety`（`src/lib/life-view-20260903.ts`）
- `five-elements-as-movement`（`src/lib/life-view-20260903.ts`）
- `frequency-is-not-the-entrance`（`src/lib/life-view-from-files.ts`）
- `sensitivity-needs-boundaries`（`src/lib/life-view-from-files.ts`）
- `love-reveals-the-unfinished-self`（`src/lib/life-view-from-files.ts`）
- `capacity-is-real-energy`（`src/lib/life-view-from-files.ts`）
- `follow-the-flow-not-surrender`（`src/lib/life-view-from-files.ts`）
- `five-pillars-of-practice`（`src/lib/life-view-practice-manual.ts`）
- `break-the-deadlock`（`src/lib/life-view.ts`）
- `belief-and-world`（`src/lib/life-view.ts`）
- `relationships-and-boundaries`（`src/lib/life-view.ts`）
- `long-term-practice`（`src/lib/life-view.ts`）

## 合併主題、不重新公開的 6 篇

這 6 篇保留在 GitHub 歷史內容庫中，不刪除原文。以下相近主題已由既有的公開文章承載，避免在同一目錄重複講述相同觀點：

- `emotion-does-not-run-the-decision`：併入既有 `practice-lives-in-daily-choices`（情緒後的第二個選擇）
- `emotion-and-judgement`：與上一條同主題，統一導向 `practice-lives-in-daily-choices`
- `clarity-studies-patterns-rules-people`：由 `clarity-sees-rules-and-reality` 承載（認清規律與現實）
- `care-without-taking-over`：由 `kindness-needs-boundaries` 承載（家人責任與界線）
- `fate-has-bounds-choice-has-space`：由 `know-fate-keep-choice-curated` 承載（命與選擇）
- `awakening-and-reality`：由 `practice-lives-in-daily-choices` 承載（修行回到日常選擇）

## 本次新增與閱讀地圖

- 新文章：`emotional-intelligence-four-practices-20261112`（繁／簡／英文，來源註明韋珊心理影片內容啟發，非逐字稿）
- 文章正文中使用既有已批准原畫 `/articles/zhaojian-benxin-stone-original.webp`、`/articles/stone-cause-and-action.webp`，避免重複上傳或將未校對的 AI 圖文放上線。
- `src/components/life-view-home-section.tsx` 的完整文章目錄新增「觀世錄·閱讀地圖」，分為觀心與理解、人際與界線、現實與行動、五行與趨勢四個主題入口，點擊可展開對應文章。
- 精簡原則：保留原 55 篇、不刪任何歷史稿、不重新開放原本已淘汰的 7 篇與依站主要求移除的 2 篇。

## 7 篇已被後續版本取代，保持不公開

- `karma-is-not-blame` → `karma-cause-result-responsibility-without-judging-others`
- `from-huangquan-to-rebirth` → `yellow-springs-and-buddhist-rebirth`
- `feng-shui-begins-in-conduct` → `feng-shui-is-also-conduct`
- `do-not-take-it-as-final` → `do-not-take-everything-as-final-truth`
- `six-hearts-daily-practice` → `six-practices-of-the-heart`
- `stop-loss-is-clarity` → `letting-go-and-cutting-losses`
- `know-fate-keep-choice` → `know-fate-keep-choice-curated`

## 2 篇刻意移除，保持排除

- `china-accessibility-diagnosis`：PR #788 因內容過時移除。
- `intimacy-symbolism-boundaries`：PR #665 依站主要求移除。

## 指令相容與回退

本次明確還原指令只取代兩份測試中「所有舊來源一律不得接入」的斷言；7 篇被取代稿與 2 篇刻意移除文章的排除仍保留。其他正文、圖片、路由、權限與核心功能均不變。回退可撤回本次提交，無資料遷移。

## 本機驗證

- `npm run check`：PASS。
- `node --import tsx --test scripts/restore-articles-20261112.test.mjs scripts/life-view-short-form.test.mjs`：4 項 PASS。
- `node --import tsx --test --test-name-pattern='homepage life-view' scripts/life-view-curation.test.mjs`：1 項 PASS。
- tsx 前後比較：55 → 69（13 篇接回＋1 篇新稿）；原 55 篇完整物件不變，新增集合恰好等於保留的 13 篇。
- 完整 curation 測試仍有既有失敗：長文來源數量斷言為 16，實際為 27；本次不修改該來源或無關的長度門檻。
- short-form 測試同步修正舊 CONTENTS 名稱及誤植的字面 `\n`，以便執行現行目錄契約。
- 未跑完整視覺套件，未進行正式站視覺驗收。
