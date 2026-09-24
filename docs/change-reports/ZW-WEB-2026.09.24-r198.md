# 昭梧更新報告｜ZW-WEB-2026.09.24-r198

## 本次改動

- 「昭梧 · 觀世錄」新增長文〈黃泉與輪迴：中國本土幽冥世界如何遇上佛教六道〉，沿用既有長文 registry；首頁最新文章與 `/knowledge` 文章庫自動共用同一內容。
- 文章把先秦「黃泉／幽都」、魂魄與祖先祭祀，和佛教「業／再生／六道／無我／解脫」分開說明，再整理魏晉至唐宋的中國化融合與十王冥府。
- 明確修正《長恨歌》過度推論：詩句「兩處茫茫皆不見」本身不能證明楊貴妃已輪迴；原詩隨後轉入海上仙山並找到太真。
- 常見的奈何橋、忘川、孟婆湯、十八層地獄只標為不同時期累積的複合民俗，不倒推成先秦或早期佛教原裝設定。
- 繁中、簡中與 English 三語全文同步加入，並納入既有觀世錄長文完整度、唯一 ID 與段落結構回歸。

## 為什麼改

站主要求把本輪「中國本土幽都世界與印度佛教六道輪迴的差異」研究內容正式加入網站底部閱讀文章。既有觀世錄已是統一文章入口，因此本次不另造孤立頁面，而是直接接入現有文章資料源，同時把研究草稿裡證據不足或過度簡化的說法收緊到可公開版本。

## 影響範圍

- `src/lib/life-view-long-form/yellow-springs-and-buddhist-rebirth.ts`
- `src/lib/life-view-long-form.ts`
- 首頁「昭梧 · 觀世錄」最新文章
- `/knowledge` 觀世錄文章庫
- `scripts/life-view-curation.test.mjs`
- `src/lib/site-stats.ts`
- `src/routes/updates.tsx`
- release ledger

## 受保護範圍

- 不改四柱 calculation、格局、喜用、報告生成或任何命理 truth。
- 不改 Owner login、payment、Supabase schema、RLS、Storage 或既有媒體。
- 不新增外部圖片、付費 provider、資料庫 migration 或新的公開入口。
- 文章是文化史／宗教史整理，不把信仰敘事包裝成可驗證的科學事實。

## 驗證狀態

- Source contract：新文章必須存在於唯一觀世錄長文 registry，三語內容完整，文章 ID 唯一。
- 內容 contract：繁簡中文各不少於既有長文最低長度，English 不少於既有英文最低長度，並保持完整段落結構。
- 歷史證據邊界：鄭莊公「黃泉」定位回《左傳·隱公元年》；《楚辭·招魂》只用來證明「幽都／土伯」想像；《長恨歌》不得推成「楊妃已輪迴」。
- 合併前需通過既有 deploy／engine／TypeScript／Vite build checks。
- 合併後必須核對 Vercel Production SHA = current main，並在正式站實際打開首頁觀世錄與 `/knowledge`，確認文章可展開閱讀；未取得正式站證據前不得標為完成。

## 回滾

移除新文章 module 與 `LIFE_VIEW_LONG_FORM_ARTICLES` 登記，將長文數量與 release ledger 回退至 r197 即可；沒有資料 migration、Storage 寫入或 Supabase schema 變更。
