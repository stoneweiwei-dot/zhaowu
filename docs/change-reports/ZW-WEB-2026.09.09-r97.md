# 昭梧更新報告｜ZW-WEB-2026.09.09-r97

## 本次改動
- Header／登入品牌標改為圓形「昭梧＋松＋日＋雲紋」主 Logo，取代金色葫蘆。
- PWA／加入主畫面改用深松綠圓角 App Icon；瀏覽器 tab 改用簡化松日 favicon。
- 主按鈕改為金底松綠字圓角膠囊，次按鈕改為象牙白金框；不改排盤與表單結構。
- 葫蘆降為特殊吉祥功能標，保留在品牌庫，不再搶主 Logo。
- 首頁裝飾收斂為「松枝＋山日分隔」兩種母題，去掉 Header 流水線、入口星芒與 Footer 日雲疊加。

## 為什麼改
- 站主鎖定 Brand UI Kit：正式品牌主體是松、日／月、山、水、雲；葫蘆只作吉祥功能標。
- 執行順序 P0：Logo／App Icon／按鈕先落地，避免再隨機混用圖案。

## 影響範圍
- Header、登入品牌區、PWA 圖標、favicon、主／次按鈕樣式、後台 Brand UI 庫、首頁裝飾密度。
- 不修改八字核心、calendar 計算、auth、付款、Supabase schema、紫微／六道／一掌經、黃曆四柱分色、登入動畫庫。

## 回滾
- 回滾 r97 單一提交即可回到 r96 金色葫蘆 Header 與舊 PWA 圖標。無資料庫 migration。

## 驗證
- Engine / source regression / TypeScript / Vite build 必須全部通過。
- Vercel Production 必須精確指向 r97 最終 SHA 且 READY。
- 正式網址 Header 可見圓形松日昭梧標；主按鈕為金底松字；PWA 圖標為深松綠章；葫蘆不出現在 Header。
