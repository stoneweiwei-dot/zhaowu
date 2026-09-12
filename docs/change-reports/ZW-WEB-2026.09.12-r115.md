# 昭梧更新報告｜ZW-WEB-2026.09.12-r115

## 本次改動

- 修正登入與載入視覺 catalog，讓公開路徑全部指向已提交的 `/intro` 同源素材。
- 保留登入動畫與站主圖庫的 loading 分組、標籤與目前預設動畫；動畫改用已存在的站主蓮開或雙蓮素材。
- loading multipart payload 仍採完整度檢查，未完整時不生成半成品檔案；catalog 不再依賴未生成的 `/gallery/loading` 路徑。
- 延續 r114 的公開圖庫、命誥配圖與報告視覺同源靜態投遞，以及背景音樂明確點擊後才載入。

## 為什麼改

r114 已把客戶端公開媒體從 Supabase 移出，但目前 repository 的 loading multipart payload 尚未完成，舊 catalog 的數個 `/gallery/loading` 路徑會在 Vercel fallback rewrite 下回到 `index.html`。r115 將 catalog 收斂到已提交且可直接部署的 `/intro` 素材，避免登入頁收到錯誤內容，也避免為了補救再發生 Supabase 公開媒體讀取。

## 影響範圍

- 登入頁與 loading 視覺選擇。
- 站主 `/gallery` 的 loading 分組預覽。
- 公開頁面的 Supabase Cached Egress 防護維持 r114 行為。

## 保護範圍

- 不修改 Supabase schema、使用者資料、登入驗證、付款、私有報告圖片或付費生圖權限。
- 不刪除歷史 storage 物件，也不把 QA 配額截圖寫入圖庫。
- loading multipart payload 不完整時維持 fail-closed，不提交或使用半成品檔案。

## 驗證

- 靜態契約檢查會確認 catalog 只使用已提交的 `/intro` 檔案，且公開媒體程式碼不重新引用 Supabase storage。
- GitHub Production CI、Vercel READY 與正式 URL 檢查將在本版完成部署後補記。

## 回滾

回滾本版的 r115 catalog、service-worker cache 與 release ledger 即可；不需要變更 Supabase schema 或資料。
