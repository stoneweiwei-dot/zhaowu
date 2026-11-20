# 昭梧更新報告｜ZW-WEB-2026.09.12-r117

## 本次改動
強制 Header 圖片寬高跟隨 132 × 54 容器，修正舊 CSS height 覆寫造成圖片仍為 132 × 132、只顯示頂部的問題。

## 為什麼改
r116 正式瀏覽器視覺驗證發現圖檔、引用與 HTTP 均正確，但圖片高度被舊樣式覆寫。此版修復該具體回歸；增加 390／430px 圖片與容器高度一致的真實 DOM 驗收。

## 影響範圍
Header 樣式、版本紀錄與 service worker cache r117。

## 保護範圍
不改 Auth、資料庫、付款、報告與命理計算。原圖及 App 圖示不重製。

## 驗證
- GitHub Production CI：Deploy gate、engine suite、41 項 iPhone Safari 契約全部成功。
- Vercel deployment `dpl_CW7ChBb9EJUZXVYYHAQfj6EFrxbt` 為 `READY / production`，`githubCommitSha` 精確對應當時 main `6045a2cb12fffa0537ee7f371b7f336407980918`。
- 正式首頁顯示 r117；Header 圖片與容器均為 132 × 54，完整顯示且無橫向溢出；Loading 已退出，沒有頁面錯誤覆蓋。
- 當時正式 `/login` 顯示 Email＋密碼登入，沒有 OAuth 按鈕；未登入 `/account` 顯示清楚登入入口，兩頁均無橫向溢出或錯誤覆蓋。後續 r119 已把登入收斂為 owner-only，本項只證明 r117 歷史狀態。
- Supabase `public.release_history` 已有 r117／117 記錄，包含相同 commit、deployment 與驗證分類。
- 真實 iPhone、已安裝 PWA 自動更新、真實登入／付款／provider 流程仍標為 `NOT VERIFIED`，不得由上述證據代替。

## 回滾
回滾本提交僅會恢復 r116；r116 存在已知 Header 裁切問題，不能把回滾當成完整修復。保留所有發布歷史。
