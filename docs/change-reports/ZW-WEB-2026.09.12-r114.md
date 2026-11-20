# 昭梧更新報告｜ZW-WEB-2026.09.12-r114

## 本次改動

- 將客戶端命誥配圖候選改為 `PUBLIC_ATLAS_ASSETS` 的 Vercel 同源靜態目錄，保留固定的五行視覺匹配與不反向改動命理的邊界。
- 將登入頁視覺改為內建靜態 loading catalog，不再從公開頁面查詢 Supabase `gallery_assets`。
- 將報告日主、月令與運勢圖的 sprite 來源改為 Vercel `/report-visuals/groups`，縮圖與原圖維持同源快取。
- 將背景音樂改為預設不載入，只有使用者明確點擊播放時才查詢曲目並載入音訊；播放器改用 `preload="none"`。
- 讓圖庫 URL helper 可辨識同源靜態路徑，站主後台的 Supabase 上傳、標記與刪除流程維持原狀。

## 為什麼改

Supabase 配額截圖顯示 Cached Egress 已達 81.27 GB，Free Plan 只含 5 GB，並觸發服務限制。公開頁面仍有幾條路徑會直接讀取 Supabase 圖片與背景音樂；這些素材本身適合由 Vercel 靜態檔案與 CDN 快取提供。r114 將公開讀取收斂到同源靜態資源，並把音訊改成明確選擇後才載入，降低重複下載與快取出口。

## 影響範圍

- `/` 的公開圖鑑預覽與 `/auspicious-atlas` 完整圖鑑。
- 登入頁背景視覺。
- 命誥配圖、個人標配圖與報告視覺書。
- 網站背景音樂控制：首次訪問不會自動下載或播放；按下控制後才啟用。
- 站主圖庫、登入視覺與背景音樂管理仍使用 Supabase owner session。

## 保護範圍

- 不修改 Supabase schema、使用者資料、登入驗證、付款、私有報告圖片或付費生圖權限。
- 不刪除歷史 `zhaowu-backgrounds`、`zhaowu-gallery`、`zhaowu-audio` 或私有報告物件；QA 配額截圖也不會寫入圖庫。
- 五行計算、命理文字與報告保存流程不變。

## 驗證

- 已加入公開媒體契約檢查：命誥匹配、登入視覺與報告 sprite 不得再引用公開 Supabase 媒體；背景音樂必須 `preload="none"` 並經明確請求後才載入。
- GitHub Production CI、Vercel READY 與正式 URL 資源驗證將以本版提交 SHA 記錄；未完成前不宣稱正式上線。

## 回滾

回滾本版的 r114 靜態公開資源路徑、登入 catalog、背景音樂明確請求邏輯、service-worker cache 與 release ledger 即可；不需要變更 Supabase schema 或資料。
