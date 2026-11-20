# 昭梧更新報告｜ZW-WEB-2026.09.23-r182

## 本次改動
- 在首頁「昭梧 · 心境小測」新增「修仙命格靈測」入口與獨立 route `/quiz/cultivation-destiny`。
- 以既有生辰及 `buildChart()` 結果，deterministic 轉譯靈根、品階、宗門、峰脈、弟子身份、六維資質、九大道途、諸宗適性、道侶適性、三句機驗與修行命途。
- 新增 1080×1920 的個人「天機命冊」圖：瀏覽器本機 SVG → Canvas → PNG，加入 `STONE 原創`。
- 新增 regression tests，鎖定 deterministic、未知時辰降級、9:16 PNG 與零 Storage/provider 寫入。

## 為什麼改
把已定型的修仙命理世界觀做成可直接玩的網站趣味產品，並讓每位使用者可取得自己的收藏圖；同時避開目前 Supabase Storage freeze 與付費圖像 provider 配額。

## 影響範圍
- `src/routes/index.tsx`
- `src/routes/quiz.cultivation-destiny.tsx`
- `src/lib/fun-tests/cultivation-destiny.ts`
- 趣味測驗 regression 與 release metadata／治理文件。

## 受保護範圍
- 不改八字 deterministic calculation truth。
- 不改正式喜用／格局／大運流年。
- 不改 auth、payment、Supabase schema。
- 不解除 Supabase Storage write freeze。
- 不建立第二套 production host。
- 趣味結果不得反向寫回正式命盤或報告。

## 驗證狀態
- Required: Engine suite、Deploy gate、iPhone Safari。
- Required after merge: Vercel Production 必須 READY 且 commit SHA 與 main 完全一致。
- Required production UX: 首頁入口、`/quiz/cultivation-destiny`、無生辰 fail-safe、結果頁與 9:16 圖片呈現。

## 回滾
回滾 r182 runtime commit，即可移除首頁卡片、新 route 與 deterministic 趣味模型；不涉及資料庫遷移或 Storage 新物件，因此無資料回滾。
