# 昭梧更新報告｜ZW-WEB-2026.08.31-r13

日期：2026-08-31（AEST）
狀態：待 CI、main 合併與 Vercel Production 驗證

## 本次改動

1. 「為什麼是這張圖／为什么是这张图」改為跟隨已交付命誥圖常駐：只要報告正在顯示命誥圖，就掛載正式 React 理由元件。
2. `/account` 歷史報告即使缺少完整 `engine_snapshot.chart`，也不再把理由區塊變成 `null`；理由元件接受缺失 chart，使用安全 fallback 保持客戶可讀。
3. 有 Gallery 母圖 ID 與現存語義資料時，仍解釋該圖本身的象徵；資料缺失時只給報告級理由，不展示匹配機制、分數、提示詞或內部演算法。
4. 新增回歸測試，鎖定「歷史報告缺 chart 仍顯示理由」以及「新報告有成圖即顯示理由」。
5. 本版直接繼承 r12 已恢復的完整 Gallery-direct 命誥後端，不重寫、不降級該後端。

## 為什麼改

理由元件本身已有 fallback，但歷史報告頁仍把 `snapshot?.chart` 當成整個理由元件的顯示條件。因此舊報告只要命盤快照不完整，就會出現「命誥圖還在，但理由又不見」的情況。這次把顯示條件改成以「圖片是否已交付」為準，chart 只決定理由能用多少命盤上下文，不再決定理由是否存在。

## 影響範圍

- 新報告命誥圖下方的選圖理由
- `/account` 已保存／歷史報告中的命誥圖理由
- 全站 release footer 版本資訊更新為 r13

## 不改範圍

- 四柱、真太陽時、月令、格局、喜用、歲運等八字核心計算
- 紫微、七政、一掌經計算核心
- Auth / payment / Supabase schema
- Gallery 排名與資產內容
- r12 已恢復的 `generate-decree-image` 後端行為
- 報告文字結論

## 回滾

如理由顯示造成 UI 回歸，只需回滾 `src/components/decree-image-reason.tsx`、`src/routes/account.tsx` 與本版回歸測試；不得回滾 r12 的完整命誥後端，也不得恢復「缺 chart 就不渲染理由」的舊條件。

## Production 驗證欄

- GitHub PR：#178（更新後以最終 head 為準）
- Merge commit：待 CI 通過後確認
- Vercel deployment：待 Production READY 後確認
- Production routes：`/`、`/account`
- 驗證重點：production SHA、route 可用、production bundle 包含理由元件與缺 chart fallback；若無登入測試 session，登入後歷史報告最終畫面標示 NOT VISUALLY VERIFIED
- 結果：待驗證
