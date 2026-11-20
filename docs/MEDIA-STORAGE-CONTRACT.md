# 昭梧媒體儲存與檢索契約

Status: CURRENT  
Scope: 圖片、首頁背景、登入圖片／影片、背景音樂、報告私有圖片、ZVec 媒體索引。

## 1. 固定分層

昭梧的媒體必須分成兩層，禁止再把「檔案本體」與「搜尋／知識索引」混在一起。

### A. 檔案層：保存二進位內容

| 類型 | 正式儲存位置 | 公開性 |
|---|---|---|
| 公開圖庫、登入圖片／影片、茶仙、小綠龍等 | Supabase Storage `zhaowu-gallery` | Public |
| 首頁背景 | Supabase Storage `zhaowu-backgrounds` | Public |
| 新版背景音樂目標位置 | Supabase Storage `zhaowu-audio` | Public |
| 個人報告生成圖片 | Supabase Storage `zhaowu-report-images` | Private |
| 舊背景音樂 | GitHub `owner-music` branch | Legacy，遷移前只讀保留 |

ZVec **不得保存圖片、影片、音樂本體**。

### B. 索引層：保存「如何找到及理解媒體」

ZVec 媒體 collection 只保存可重建的 metadata：
- 媒體類型
- 名稱
- 分類
- MIME type
- Storage/GitHub pointer
- tags
- 圖庫 knowledge 的 subject/style/motif/mood/use-role/summary
- 是否 current / primary
- 更新時間

用途是讓維護者與 AI 可以跨媒體搜尋，例如：
- 「登入影片」
- 「水元素 山水」
- 「茶仙」
- 「背景音樂 432」
- 「目前使用中的音樂」

ZVec 是派生索引，不是唯一真相來源。索引毀損時必須可以由 Supabase metadata + legacy music manifest 重建。

## 2. Metadata 真相來源

- 圖庫與登入媒體：`public.gallery_assets`
- 圖片語義資料：`public.gallery_asset_knowledge`
- 首頁背景：`public.background_assets`
- Supabase 音樂：`public.background_music_assets`
- Legacy 音樂：`owner-music/public/audio/owner-manifest.json`

私人 `zhaowu-report-images` 不進公共媒體索引，也不得寫入 ZVec。

## 3. 不再新增的做法

- 不把大量圖片／影片直接提交到 main。
- 不用 ZVec 當 blob storage。
- 不為了建立索引重複複製媒體檔。
- 不把 GitHub legacy 音樂直接刪掉。
- 不在尚未完成遷移驗證前把 runtime 強制切到另一套音樂來源。

## 4. Legacy 音樂遷移 Gate

目前網站音樂 runtime 仍以 GitHub `owner-music` 為主，Supabase `zhaowu-audio` 是另一套來源。遷移只能逐步進行：

1. 先複製到 `zhaowu-audio`，不可先刪來源。
2. 核對 bytes/hash、content type、iPhone Safari 播放。
3. 建立／核對 `background_music_assets` metadata。
4. runtime 改讀 Supabase，保留 GitHub fallback。
5. Production + 真機播放驗收。
6. 確認無引用後才可刪 legacy 檔。

在 Storage 容量接近既有配額時，不做「為了統一而整庫雙寫」的複製。

## 5. 大檔上傳

Supabase 官方目前建議大於 6 MB 的檔案使用 TUS resumable upload。登入影片若未來放寬到數十／數百 MB，必須先把上傳路徑改成 TUS；禁止只把前端 size limit 調大。

## 6. ZVec 邊界

ZVec media index：
- 可以：全文檢索、之後增加向量語義檢索、跨來源定位媒體。
- 不可以：改變八字 deterministic calculation、決定登入權限、承擔檔案持久化、保存私有報告圖。
