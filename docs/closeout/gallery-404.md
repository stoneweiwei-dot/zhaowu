# 圖庫 404 追查

/gallery 的 OwnerGalleryManager 經 galleryPublicUrl 解析圖檔，資料源包括遠端資產列及本機 BUNDLED_REPORT_ART。已核對 public/report-visuals/characters 的十幅天干和 branches 的十二幅地支原圖皆存在；天干原圖由 daac8d98 引入。尚缺十筆失效請求的 URL 或資產清單，無法據此認定哪十張需要還原。

本機建置逐筆 HTTP 與 WebP 檔頭核對：吉象圖鑑 26 張、雲衣神相 75 張原圖及 75 張縮圖、站主圖庫內建 22 張，共 198 筆，失敗 0 筆。失敗清單：無。PR #1165 提及的 12-stars-and-constellations.webp 亦已存在於 main，歷史提交 d060e709 可追溯。
