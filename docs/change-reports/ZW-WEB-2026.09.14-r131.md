# 昭梧更新報告｜ZW-WEB-2026.09.14-r131

## 本次改動

- 站主背景音樂上傳加入瀏覽器端自動優化：已很小且相容的 MP3/M4A 保留原檔；WAV、FLAC、大型或其他常見音訊自動轉為 Safari/iPhone 穩定的 AAC-LC/M4A，並以最高可容納 bitrate 壓到安全上傳大小後再送進 owner-music API。
- 原始音訊選檔上限提高到 200 MB；真正送進 serverless API 的是優化後檔案，避免把 Vercel request body 限制錯當成使用者原檔限制。
- Owner Cookie 已有效時，`/gallery` 不再因 `session === null` 誤顯示「請先登入站主帳號」。Supabase 資料服務不可用時，只明確暫停依賴 Supabase 的舊管理操作。
- Owner Console 在資料服務離線時不再保留「按了沒反應」的背景／報告控制；音樂與可用入口維持可操作。
- Header 移除 Logo 與圖庫之間重疊的日夜切換控制，將日夜切換移到第二列；頁尾移除重複的大型昭梧品牌圖，只保留簡潔文字標記。
- PWA shell bump 至 `zhaowu-shell-r131`。

## 為什麼改

站主截圖顯示獨立 Owner Cookie 已登入，但 Gallery 仍以舊 Supabase `session` 判斷登入，造成「已登入卻被叫重新登入」；同時 r130 音樂路線雖已脫離 Supabase，仍要求原檔直接通過 4 MB API 上限，對正常完整音樂不實用。Header 與頁尾也出現重複品牌元素，手機版視覺擁擠。

## 影響範圍

- `/account` 站主背景音樂管理
- `/gallery` 站主驗證狀態
- 全站 Header / Footer
- Owner Console 分組狀態
- PWA cache version

不修改八字、紫微、D60、西洋占星或其他命理 Calculation Truth；不復活 Supabase Audio CDN、一般會員登入、AppDeploy 或 Netlify。

## 回滾

若瀏覽器端音訊轉碼在特定裝置造成問題，可回滾本版本並恢復 r130 direct owner-music upload；Owner Cookie / r130 owner-music branch 本身不需回滾。Header / Gallery 修正可獨立還原，不影響命理引擎或資料庫 schema。
