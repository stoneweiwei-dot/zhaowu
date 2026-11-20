# 昭梧更新報告｜ZW-WEB-2026.09.23-r188

## 本次改動

- 在首頁 Hero 與「今日指引」之間加入「今日一格」：用當日天干的小漫畫，把抽象象意先翻譯成生活語言。
- 在「昭梧命書」核心底盤後只插入一個漫畫式白話頁，說明日主概念與一個可執行提醒。
- 在命書末端加入「可分享一格」，支援系統分享；不生成圖片、不呼叫付費 provider。
- 漫畫角色使用本機 React/SVG 繪製，依木、火、土、金、水切換柔和色系；沒有新增 Supabase Storage 寫入。
- 所有視覺仍由 `src/zhaowu-design-system.css` 控制；宋式紙本、留白、細線與正式命盤層級保持不變。

## 為什麼改

這次不是新增第四種網站風格，而是把既有宋式視覺與使用者偏好的小清新漫畫整合成同一套閱讀層級：

- 宋式負責品牌、正式命盤、長文閱讀與高級感。
- 小漫畫只負責入口、術語白話化與分享。
- 漫畫不負責重新排盤、判格局、定吉凶，也不取代正式報告。

這能降低術語門檻，同時避免首頁重新變成卡片牆或工具超市。

## 影響範圍

- 首頁：新增一個低干擾「今日一格」。
- 昭梧命書：核心底盤後新增一個漫畫翻譯插頁。
- 分享：命書末端新增系統分享按鈕。
- 繁中／簡中／英文都有對應文案；公開語言 selector 仍只維持繁中＋English。

## 受保護範圍

本版不修改：

- 八字曆法、四柱排盤、真太陽時、子時換日與節氣邊界。
- 格局、旺衰、用神、專項 reading truth。
- Auth、payment、Supabase schema。
- Supabase Storage freeze；沒有新增任何 Storage object。
- 青玉小龍、播放器、Loading／Login animation。
- r186/r187 已鎖定的宋式編輯排版、夜間紙面對比與 English 獨立排版。

## 驗證狀態

合併前必須通過：

- Deploy gate
- Engine suite
- iPhone Safari CI
- TypeScript／Vite production build

Production 合併後再核對：

- Vercel Production SHA = current main SHA
- Production runtime error scan

真實 iPhone Safari 的人工觀感仍需實機確認，CI 不冒充真機審美驗收。

## 回滾

若漫畫層造成首頁過重、手機 overflow 或報告閱讀節奏下降，可整體回滾 r188。因本版不修改資料庫 schema、排盤 truth、Auth 或 Storage，回滾不涉及資料遷移。
