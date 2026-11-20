# 昭梧更新報告｜ZW-WEB-2026.09.28-r219

## 本次改動

- `src/components/site-shell.tsx`：`isHome` 為真時掛載 `<IntroGate />`（`{isHome ? <IntroGate /> : null}`），恢復首頁打開時的一次性開場影片；`/login` 的 `LoginStageBackdrop` 完全不動。
- `docs/CURRENT-STATE.md`：第 6 節（Loading／Login animation）與第 11 節 Done Gate 第 6 項改為記錄「首頁掛載一次性 IntroGate；其他公開路由仍不掛載」的現況，取代原本「首頁一律不掛載」的舊文字。
- `docs/INSTRUCTION-REGISTRY.md`：新增 `2026-09-28 r219 首頁一次性 IntroGate 恢復 supersession` 條目，記錄本次是站主對同一問題的第三次、也是最新一次明確指令，並明確標出 r179／r191 舊文字「僅在首頁這一項範圍內」被取代，其餘分區／報告頁／返回導覽的限制維持有效。
- 測試契約同步更新（原本鎖定「首頁不得掛載 IntroGate」的斷言全部改為驗證「首頁掛載一次性 IntroGate」）：`scripts/r183-login-cinematic.test.mjs`、`scripts/intro-loading.test.mjs`、`scripts/ui-contract.test.mjs`、`scripts/r191-login-animation-once.test.mjs`、`scripts/r184-iphone-report-hierarchy.test.mjs`。
- `src/lib/site-stats.ts`、`lib/zhaowu-verification.js`：`SITE_RELEASE_FALLBACK`／`ZHAOWU_RELEASE` 由 r218 提升為 r219。

## 為什麼改

站主回報「打開網頁時原本有的影片看不到了」。查證後確認：`src/components/intro-gate.tsx`（首頁一次性開場動畫，`zhaowu-opening-r148.mp4`）程式碼與素材檔案完好，但元件從未被任何 route 掛載——這不是意外壞掉，而是 r179／r191 兩次站主明確指令（「登入動畫只允許出現在 `/login`」）刻意把它從公開 runtime 移除，並各自寫測試鎖定；r184 曾短暫恢復首頁 IntroGate，隨即在 r191 範圍內再次被取代。本次是站主對同一件事第三次、也是最新一次明確表態要恢復，依 `AGENTS.md`「新指令戰勝舊指令」原則生效，僅在「首頁」這一項範圍內取代舊指令，不動其餘限制。

## 影響範圍

- 僅影響首頁（`/`）打開時是否顯示一次性開場影片；不影響 `/login`、一般分區、報告頁、返回導覽的動畫掛載範圍（維持不掛載）。
- `IntroGate` 本身邏輯不變：`zhaowu.intro.seen.public.v1` 記錄同一瀏覽器只播一次（非每日）；最短可見 5 秒、8 秒硬性逾時、播放失敗立即顯示靜態 poster，不阻塞首頁其餘內容的渲染或互動。

## 受保護範圍

- 不改 `/login` 登入邏輯、auth cookie、命理計算、報告生成、付款、Supabase schema。
- 不新增 Supabase 讀寫、不新增付費依賴；`zhaowu-opening-r148.mp4`／`.jpg` 為既有 `public/intro` 靜態檔，不需上傳新素材。
- 一般分區、報告頁、返回導覽仍不掛載 IntroGate，此限制維持 `ACTIVE`。

## 驗證狀態

- 本地容器 `npm ci`／`vite build` 對外部 registry 持續 403（環境既有限制，與本次改動無關）；改走 GitHub Actions `Production CI`（`build.yml`）在乾淨 runner 上執行 `npm ci && npm run build` 與 `npm run test:engine` 作為實際 build/test gate。
- 合併前：Deploy gate、Engine suite、iPhone Safari 三項 CI job 須全綠，含本次更新的 5 個測試檔。
- 合併後：需核對 Vercel Production `githubCommitSha` 對齊最新 main，並在正式站首頁核對開場影片已重新出現（清除該瀏覽器的 `zhaowu.intro.seen.public.v1` 或改用無痕視窗以重現首次造訪）。

## 回滾

`git revert` 本次 commit 即可完整還原（純前端掛載點＋文件＋測試斷言調整，無資料庫或結構性變更，無需額外回滾步驟）。
