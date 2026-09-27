# 昭梧更新報告｜ZW-WEB-2026.09.27-r210

## 本次改動

- 在 `/knowledge` 的命理小知識新增「五行五色、五音與五氣」教學頁，繁中／簡中／英文三語。
- 以《黃帝內經·素問·陰陽應象大論》、《靈樞·順氣一日分為四時》、《漢書·律曆志》核對：青／赤／黃／白／黑、角／徵／宮／商／羽，以及風／熱／濕／燥／寒的傳統象義。
- 用 iPhone 單欄卡片呈現，說明五氣在此指氣候象義，與情志、臟腑等其他「氣」的語境分開。
- 加入功能優先的通用行動例子，並連回既有報告「五行功能訓練」；不新增命盤推斷、不作醫療建議、不將顏色／音樂／物件當作改命或補用神手段。
- 在 `test:deploy` 加入頁面內容與邊界回歸測試。

## 保護範圍

- 不改 deterministic chart truth、報告核心生成、auth、payment、Supabase schema／Storage。
- 不新增首頁卡片；新內容只進既有 `/knowledge` 教學區。

## 驗證

- `scripts/five-elements-tone-qi.test.mjs`
- Deploy gate、Engine suite、iPhone Safari CI
- 合併 main 後確認 Vercel Production exact SHA
