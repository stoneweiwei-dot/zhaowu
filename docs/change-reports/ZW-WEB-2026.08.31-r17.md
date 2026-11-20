# 昭梧更新報告｜ZW-WEB-2026.08.31-r17

日期：2026-08-31（AEST）
狀態：待 Production 驗證

## 本次改動

1. 「昭梧 · 觀世錄」新增三語文章《從黃泉到輪迴：中國人如何重新想像死亡》。
2. 文章把早期魂魄／黃泉、秦漢地下官僚想像、佛教業報與輪迴、目連救母、《長恨歌》的文學性第三空間、唐宋以後十王與本土幽冥融合，以及孟婆／奈何橋等較晚民間敘事分層處理。
3. 明確避免把不同時代、不同地區、不同宗教傳統拼成一套自古固定的地府組織架構；不把「早期陰間完全沒有道德審判」「業力絕不能因任何關係性實踐而變化」「十殿之上存在唯一固定最高神」等爭議說法寫成定論。
4. 《長恨歌》段落明確標為文學解讀，不把白居易詩句當成宗教 Calculation Truth。
5. 新增回歸測試，鎖定繁中／簡中／英文文章均存在，英文無中文殘留，且正文保留「歷史分層、非固定體系、較晚民間敘事」三項防錯口徑。
6. Release fallback 升級為 r17 / update 17。

## 為什麼改

站主提供了一套完整的華夏幽冥與輪迴敘事，主線價值很高，但原稿把先秦魂魄論、漢代泰山冥府、佛教輪迴、十王、目連、孟婆等不同歷史層次寫得過於像一套自古完整制度。本版保留「中國幽冥世界是多傳統長期疊合」的核心，同時把史料事實、學術爭議、民間信仰與文學解讀分開，避免為了敘事完整而製造單一宗教史結論。

## 影響範圍

- 首頁「昭梧 · 觀世錄」文章內容
- `src/lib/life-view-20260831.ts`
- 新增 `scripts/life-view-underworld.test.mjs`
- 全站 release footer fallback 升級為 r17

## 不改範圍

- 八字、紫微、七政與其他 Calculation Truth Layer
- 命理／修心建議的 runtime 路由與「修心與環境」模組
- 報告結構、Auth、payment、Supabase schema／permissions／data、Edge Functions
- 首頁分析表單、登入、帳戶、報告歷史、命誥圖與 Gallery
- 觀世錄既有文章與既有圖片資產

## 回滾

如文章內容或載入造成回歸，從 `src/lib/life-view-20260831.ts` 移除 `from-huangquan-to-rebirth` 文章並移除其專項測試；將 `src/lib/site-stats.ts` 與 `scripts/release-ledger.test.mjs` 回退至 r16。此版本不涉及資料庫 schema、權限或命理計算核心。

## Production 驗證欄

- GitHub commit：commit 後核驗
- CI / Build：由 Production build 執行 `npm run test:engine && vite build && tsc --noEmit`
- Vercel deployment：commit 後核驗
- Production commit：commit 後核驗
- Supabase：不修改 schema／permissions／data；`release_history` 於 Production VERIFIED 後仍需另依站主明確授權處理
- 驗證重點：首頁可讀到新文章；繁中／簡中／英文完整；英文無中文殘留；既有首頁、登入、帳戶與報告入口不受內容新增影響。
