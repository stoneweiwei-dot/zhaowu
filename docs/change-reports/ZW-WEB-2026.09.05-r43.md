# 昭梧更新報告｜ZW-WEB-2026.09.05-r43

日期：2026-09-05 AEST

## 本次改動
- 新增 `src/lib/bazi/branch-relations.ts`：完整列入六合、六沖、六害、相破、子卯刑、寅巳申刑、丑戌未刑、辰午酉亥自刑，以及四組三合、四組三會；保留四庫標記，所有合局只標「條件」，不自動判合化。
- 新增 `src/lib/bazi/structural-remedy.ts`：以月令／旺衰與可見十神通道建立正式病藥／通關層，分 clear／provisional／insufficient；禁止把五行百分比或「缺什麼補什麼」當病藥。
- `src/lib/bazi/structure.ts` 改為固定順序：月令 → 立格 → 可見制化 → 地支作用 → 病藥／通關；格局回答同時列出原局刑沖合害與通關證據。
- 新增 `src/lib/bazi/cycle-chain.ts`：建立原局 → 大運 → 流年 → 流月作用鏈；補上原本缺少的大運×流年、流月×大運／流年交叉關係。
- `src/lib/bazi/forecast-safe.ts` 將交叉作用納入月份排序；調整幅度設硬上限，避免單一合沖刑害蓋過月令、十神與原局基線。
- 新增三組 deterministic regression tests：地支關係庫、病藥通關、歲運作用鏈。

## 為什麼改
先前核心已能排盤、立格、看流年流月，但地支關係散落在 forecast／四庫專析，病藥只停留在「不可說滿」，而大運、流年、流月多為分層打分，缺少動態層彼此作用。r43 把這三個缺口收斂成可測、可追溯的推理鏈，避免只靠文案補足。

## 影響範圍
- `src/lib/bazi/branch-relations.ts`
- `src/lib/bazi/structural-remedy.ts`
- `src/lib/bazi/cycle-chain.ts`
- `src/lib/bazi/structure.ts`
- `src/lib/bazi/forecast-safe.ts`
- `scripts/branch-relations.test.mjs`
- `scripts/structural-remedy.test.mjs`
- `scripts/cycle-chain.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`

## 判讀邊界
- 六合、三合、三會不因支組存在就自動判合化／成局。
- 沖、刑、害、破只先判引動、摩擦、牽扯或鬆動，不直接外推疾病、婚變、失職、破財等具體事件。
- 病藥先回答「結構哪裡失衡、靠哪條已存在通道處理」，不是喜用神元素購物清單。
- 出生時間未知時，大運不進入滿格歲運鏈。
- 歲運交叉分數只作 bounded adjustment；原局與月令仍是基線。

## 保護範圍
- Supabase Auth / OAuth
- 排盤曆法與真太陽時
- 紫微、七政、一掌經、D60
- 報告儲存與歷史
- 付款
- routing / multilingual
- database schema / user data

## 回滾
回滾 r43 commit 即恢復 r42 的結構與 timing 行為；本次不含資料庫 schema migration。

## 驗證狀態
- GitHub：本報告與 r43 engine commit 同批提交。
- CI/build：提交後由 Production `npm run build` 執行完整 engine tests → Vite → TypeScript。
- Vercel：提交時待自動 Production deployment；READY 後核對 exact commit SHA。
- Production：READY 後驗證 `/`、`/login`、`/quiz/six-realms`。
- Supabase：Production 驗證後寫入 `public.release_history` r43。
- Mobile Safari：自動 contract 保留；真實 iPhone 視覺仍為 `NOT VISUALLY VERIFIED`，除非有真機證據。
