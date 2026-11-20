# 昭梧 Gallery 自動入庫規則

Status: ACTIVE
Owner directive: 2026-09-06

本規則適用於 ChatGPT、Codex、Grok 及任何替昭梧產生或整理視覺素材的 agent。

## 1. 預設行為

凡由站主要求生成、編修或完成的圖片，只要具備昭梧長期重用價值，agent 應預設把最終核准版本加入後台 Gallery，不再要求站主另行手動上傳。

例外只有：
- 站主明確說明為臨時、測試、不要保存；
- 純 QA 截圖、contact sheet、UI mockup、拼貼預覽；
- 未被選中的近似變體；
- 沒有明確未來用途 / slot 的泛用圖；
- 重複、低品質、錯字、構圖失敗或不符合昭梧視覺規範的圖。

## 2. 先定用途，再入庫

任何圖片進 Gallery 前必須能回答「之後在哪裡用」。至少標記一個功能角色，例如：
- `day-master`
- `month-command`
- `luck-five-elements`
- `report-overview`
- `decree-candidate`
- `login-background`
- `article-illustration`
- `auspicious-atlas`
- `guardian`
- `archive-reference`

沒有用途就不生成、不入庫。

## 3. 正式入庫流程

首選既有流程：

`gallery_ingest_queue` → `gallery-ingest-finalize` → `zhaowu-gallery` → `gallery_assets`

入庫時至少帶：
- 有語義的 `asset_key`
- 可讀標題
- `chat-generated` 或實際來源 tag
- 功能角色 tag
- 風格 tag（例如 `song-atlas`）
- 必要的題材 / 五行 / 季節 tag

固定 report slot 已由站主明確核准的最終圖，可直接標記 `approved`；普通候選圖不得因「生成成功」就自動成為客戶可選主圖，仍須遵守 Gallery knowledge / vision audit 的 `client_eligible` 判定。

## 4. 去重規則

入庫前優先以檔案內容 hash / Storage eTag + bytes 做 exact duplicate 檢查；同一內容只保留一個 Gallery entry。

若內容不是 byte-identical，但主體、構圖、用途高度重複：
- 保留較清楚、較符合昭梧規格、已被實際引用或已核准者；
- 其他不進 active Gallery，必要時只留 archive reference。

不得為了增加 Gallery 數量保存一批幾乎相同的版本。

## 5. 正式報告母圖凍結

目前新版宋系報告美工系統的正式固定母圖為：
- 十天干：10
- 十二月令：12
- 運之書五行：5
- 命之書總覽：1
- 宣紙 fallback：既有正式備援

這套固定母圖完成後停止無目的擴圖。新增固定 slot 必須先有新的產品需求。

## 6. 安全邊界

圖片只負責視覺，不得反向改寫：
- 八字計算
- 月令邊界
- 喜用判定
- 格局病藥
- 大運 / 流年計算
- 客戶正文

圖片失敗時文字與程式化圖表必須照常交付。
