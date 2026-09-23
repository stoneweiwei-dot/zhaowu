# 昭梧更新報告｜ZW-WEB-2026.09.23-r187

## 本次改動

- 站主後台刪除「分區標題下面再解釋一次用途」的 helper copy。
- 背景管理、內容圖庫、登入動畫管理不再顯示長段教學文；Storage freeze 只保留單行 short status。
- 後台出生資料狀態由「已保存，可供下次分析回填」縮成「已保存」；保存來源由長句縮成「保存版本」。
- English 改成獨立 Latin typography：display 使用 Iowan Old Style／Baskerville／Georgia fallback，UI 使用 Avenir Next／SF Pro／system sans。
- English mobile Header 改為三列：品牌、Latest update、語言＋Appearance，避免長英文和中文尺寸共用時互相擠壓／上下交叉。
- English Hero、Disclosure、Updates、Owner Console 重新設定字級、行高、字距、最大行寬與按鈕換行規則。
- English owner bulk controls 在窄屏改為兩欄 grid，長按鈕文字可自然換行但不重疊。
- 修正 Updates 頁過時的 Netlify 英文 release 文案。

## 為什麼改

中文 r186 已形成可接受的視覺層級，但 English 仍只是把中文字符串換成 Latin 文字。英文單詞較長、字寬與最佳字距不同，沿用中文控件寬度與排版會造成 iPhone 上的交叉、擠壓與低質感。

站主後台同時存在大量「告訴站主這個區塊是做什麼」的說明句，增加噪音而沒有操作價值。

## 影響範圍

- English：全站 Header、首頁 Hero／Disclosure、Updates、Owner Console／Gallery。
- Owner：/account、/gallery、背景管理、內容圖庫、登入動畫管理。
- 不改公開產品流程、排盤、報告生成、登入權限或 Storage policy。

## 受保護範圍

- 不改 Bazi calculation truth、auth、payment、Supabase schema／RLS。
- 不解除 Storage write freeze。
- 不回退 r186 中文宋式編輯排版。
- 中文與 English 共用功能邏輯，但允許不同 typographic/layout metrics。

## 驗證狀態

- Deploy gate／Engine suite／iPhone Safari CI 必須全綠。
- English iPhone 必須檢查 Header 不交叉、無 horizontal overflow、控件 >=44px。
- 真 iPhone 最終仍需確認 English 視覺質感，不以 CI 代替審美驗收。

## 回滾

若 r187 出現回歸，可回滾 English r187 CSS block 與 owner helper-copy changes；不影響計算核心或資料層。
