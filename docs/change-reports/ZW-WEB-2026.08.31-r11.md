# 昭梧更新報告｜ZW-WEB-2026.08.31-r11

日期：2026-08-31（AEST）
狀態：待 CI、main 合併與 Production 驗證後寫入 `release_history`

## 本次改動

1. 完整八字報告新增歲運疊加層：先讀 canonical 原局，再讀目標年份所在大運，再讀該流年。
2. 自動辨識大運與流年、流年與原局地支的合／沖／害；沖只先解釋為動、重整、引動，不直接判凶；合也不直接判吉。
3. 喜用／病藥仍為 provisional 時，禁止把流年五行直接翻成「補某一行」。只有 canonical useful 已確認，才轉成當期生活功能重點。
4. 付費五行屬性圖、七脈輪靈光圖與最高檔訂制畫，在生成前必須經過大運／流年覆核；跨年份重新計算。使用者明確問月份時才繼續疊流月。
5. 網站最底部固定顯示：正式版本、累計更新次數、最近更新日期，以及可展開的「最新更新報告」。Supabase `release_history` 暫時落後時，前端仍用本版 fallback 顯示正確版本。
6. 恢復強制更新紀錄制度：每次會進 production 的 runtime/backend 修改，都必須同步升版、增加更新次數、建立 `docs/change-reports/` 報告，Production 驗證後寫入 Supabase `release_history`。

## 為什麼改

先前 `release_history` 實際保留了 r1–r10，但 2026-08-22 之後的多次改動沒有繼續逐次寫入版本台帳；同時先前的歲運 PR #168 被暫停並未進入 main。本版從最新 main 重新實作，不沿用暫停分支作為 production 真值。

## 影響範圍

- 完整八字報告的總體概括
- 付費視覺生成規則
- 全站非登入頁 footer
- 公開版本／更新紀錄讀取
- Repository execution protocol

## 不改範圍

- 四柱排盤演算法
- 真太陽時
- 大運順逆與起運演算法
- 紫微、七政、一掌經核心計算
- Auth / payment / Supabase schema

## 回滾

如歲運文字層造成回歸，可移除 `buildCycleOverlayLines()` 在 `focused-report.ts` 的掛載而不改 canonical chart。版本 footer 可獨立保留。資料庫 `release_history` 只新增版本紀錄，不覆寫歷史 r1–r10。

## Production 驗證欄

- GitHub PR：待建立
- Merge commit：待 CI 通過後填寫於 Supabase notes
- Vercel deployment：待 Production READY 後填寫於 Supabase notes
- Production route：`/`
- 結果：待驗證
