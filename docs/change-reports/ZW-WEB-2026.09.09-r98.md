# 昭梧更新報告｜ZW-WEB-2026.09.09-r98

## 本次改動
- 依 Brand UI Kit 實裝對照表落地 P1：19 個細圓框功能 Icon、橫版 Logo、豎版徽章、文字標誌、日／月／星／雲／山母題、朱印／金印／松葉印。
- Header 登入／帳戶／首頁改用同一套功能 Icon；新增日／夜切換，夜間使用深松綠底、金線、月白字與夜間主 Logo。
- Footer 改用橫版「昭梧＋雲紋」標誌；靈籤使用葫蘆吉祥標，不進入 Header。
- 後台 Brand UI 庫依 Logo → Marks → Icons → Dividers → Ornaments → Seals → Frames 分組，每項顯示名稱、用途、日／夜、是否正在使用。
- 主按鈕維持金底松字；次按鈕／登出改 Ghost 金框。同一畫面仍最多兩種裝飾母題。

## 為什麼改
- 站主鎖定 Brand UI Kit 不得再隨機混用圖案；P0 主 Logo／App Icon／按鈕之後，按執行順序做功能 Icon、首頁收斂與夜間模式。
- 正式品牌主體是松、日／月、山、水、雲；葫蘆只作特殊吉祥功能標。

## 影響範圍
- Header、Footer、登入品牌區、夜間主題、分享按鈕 Icon、靈籤吉祥標、後台 Brand UI 庫、brand-ui SVG 資產。
- 不修改八字核心、calendar 計算、auth、付款、Supabase schema、紫微／六道／一掌經、黃曆四柱分色、登入動畫庫。

## 回滾
- 回滾 r98 單一提交即可回到 r97 P0 主 Logo／金按鈕狀態。無資料庫 migration。

## 驗證
- Engine / source regression / TypeScript / Vite build 必須全部通過。
- Vercel Production 必須精確指向 r98 最終 SHA 且 READY。
- 正式網址 Header 可見圓形松日昭梧標與功能 Icon；夜間切換後底色為深松綠且主 Logo 換夜版；Footer 為橫版 Logo；葫蘆不出現在 Header，只出現在靈籤。
