# 昭梧更新報告｜ZW-WEB-2026.09.15-r142

## 本次改動

把 2026-09-15 上一輪命理／網站系統盤點完整同步進正式網站系統，並把「已存在」「部分存在」「待實作」「研究」「私人」「趣味」分開，避免把規格冒充成已完成功能。

### 15 項能力全部進入 runtime map

新增 `src/lib/system-capability-map.ts`，逐項記錄：

1. 全站證據／可信度治理層
2. 核心變量鎖定＋矛盾檢測
3. 獨立印度吠陀占星 Jyotish
4. 達摩一掌經／前世今生文化層
5. 跨系統綜合報告
6. 30 題考時定刻工作台
7. 八字動態關係 Resolver v2
8. 每日黃曆＋宗教聖日層
9. 報告 → 9:16 分享卡
10. 命理知識來源庫
11. 形勢風水模組
12. 宗族族譜＋姓名文化檔案
13. 六十甲子日柱百科
14. 五行 × 音樂／聲音偏好
15. Love Type／寵物命名／守護獸等趣味工具

每一項都有 priority、真實 status、用途、當前實作真相、證據層級與現有入口（若有）。

### 四條硬邊界同步進 runtime

- Starseed、仙緣、童子、通靈、雙生火焰、具體前世身份只作文化／心理／藝術象徵，不進子平主判。
- 南北半球改四時、12 宮／海王星靈擾、「月行」等爭議模型只進研究模式。
- D60 維持精確分鐘 Gate；±2 分鐘不穩降為弱旁證；禁止用 D60 循環反推出生時間。
- calculation truth 與 interpretation truth 分離：沒有 deterministic engine、來源 profile 與 test vectors，就不得聲稱盤面已算出。

### 可核對頁

新增 `/knowledge/system-map`，直接由同一份 runtime map 渲染，不另複製一份前台文案。頁面會顯示 15 項能力、4 條硬邊界與每項真實狀態。

### 系統文件

新增 `docs/SYSTEM-CAPABILITY-MAP-2026-09-15.md`，作為本次同步的可審計規格；舊 V4／R6.1／Library Prompt 只吸收與 R6.2.1 不衝突的部分。

## 為什麼改

上一輪盤點已經辨識出真正值得進網站的能力與明確不應進核心的內容。如果只停留在聊天，後續 Agent 仍可能遺漏、重做已存在功能，或把「建議」誤當「已完成」。r142 把這一輪內容變成實際 runtime state + 可核頁 + 文件 + regression contract。

## 影響範圍

- 新增 `src/lib/system-capability-map.ts`
- 新增 `src/routes/knowledge.system-map.tsx`
- 新增 `docs/SYSTEM-CAPABILITY-MAP-2026-09-15.md`
- 新增 `scripts/system-capability-map-r142.test.mjs`
- `package.json`：Deploy gate 加入 r142 同步契約測試
- `src/lib/site-stats.ts`：公開版本升至 r142／142
- `public/sw.js`：PWA shell cache 升至 `zhaowu-shell-r142`

## 受保護範圍

- 不改任何八字／紫微／七政／西占／D60 的計算公式。
- 不把完整 Jyotish D1/D9/Dasha 規格冒充成已驗證 calculation engine。
- 不改 `/yizhangjing` 現有 runtime，也不把 D60 放回前世今生。
- 不改登入、支付、Supabase schema、RLS、Storage、報告存檔與會員資料。
- 不公開私人族譜內容。
- 不啟用 Starseed／仙緣／童子／通靈／雙生火焰作正式命理證據。

## 驗收契約

- runtime map 必須恰有 15 個同步 capability id。
- 必須有 4 條 governance boundary。
- `vedic-jyotish` 必須維持 `partial`，不得標 `active`。
- `cross-system-synthesis` 必須維持 `planned`，直到真正 runtime 完成。
- `report-share-cards` 可標 `active`，因現行元件與資料層已存在。
- `/knowledge/system-map` 必須由 runtime map 渲染，且可在 Production 打開。
- PWA cache 為 `zhaowu-shell-r142`。

## 回滾

回滾本 release 的新增 runtime map／route／test／doc，並把 `src/lib/site-stats.ts`、`public/sw.js` 回到 r141。此回滾不影響任何命盤計算與既有客戶資料。

## 驗證狀態

建立 PR 後必須通過 Deploy gate、Engine suite、iPhone Safari。合併後只在 Vercel Production exact SHA `READY` 且 `/knowledge/system-map` 實際可讀、15／4 數量與狀態標籤可核對後，才可標 `VERIFIED COMPLETE`。
