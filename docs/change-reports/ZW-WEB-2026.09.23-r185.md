# 昭梧更新報告｜ZW-WEB-2026.09.23-r185

## 本次改動

- 依 2026-09-23 真 iPhone 截圖，移除首頁「大膠囊＋厚圓角卡＋暗綠塊」的 AI App 視覺語言。
- Header 改成兩行細字導覽；Logo 不再以白底圖片貼片形式佔據頂欄。
- Hero 改成宋式大留白、細金線、較克制的宋體標題。
- 「今日指引」與延伸區塊改為編輯式分隔列，不再用厚卡片。
- 生辰、命盤、問題、報告改為低圓角暖紙閱讀面，降低陰影與邊框重量。
- Night mode 改為墨色背景＋暖紙正文，避免綠底綠字與低透明文字。
- 青玉小龍縮成單一小入口；主動泡泡隱藏；展開後為底部小抽屜，播放器與快捷導覽改成輕量控件。
- 趣味內容列表去卡片化，以分隔線形成次要層級。

## 為什麼改

真機截圖顯示原版雖具備功能，但視覺上大量使用同權重圓角容器、深綠填色與大尺寸控件，造成「狗皮膏藥／低階 AI App」感，與昭梧既定的宋式留白、宣紙、克制礦物色定位相反。

r185 不改功能，只重新建立視覺層級：內容先於控件、留白先於卡片、紙面先於色塊。

## 影響範圍

- 全站 Header。
- 首頁 Hero／今日指引／延伸內容。
- 首頁生辰、命盤、問題與報告閱讀面。
- Night mode。
- 青玉小龍與內建播放器。

## 受保護範圍

- 不改排盤核心、問答生成核心、登入權限、Payment、Supabase schema／RLS。
- 不解除 Storage write freeze。
- 不改首頁主流程與報告契約。
- 不新增第二套 CSS authority；所有視覺規則仍寫入 canonical `zhaowu-design-system.css`。

## 驗證狀態

- PR 必須通過 Deploy gate、Engine suite、iPhone Safari CI。
- 合併後 Production SHA 必須等於 main。
- 真 iPhone Safari 需重新驗證 Header、Hero、Night mode、青玉小龍展開面、生辰卡與報告面。

## 回滾

若 r185 有視覺回歸，只需回滾 `zhaowu-design-system.css` 末端 r185 block 與 release metadata；不涉及命理核心或資料庫。
