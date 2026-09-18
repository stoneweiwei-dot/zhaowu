# 昭梧更新報告｜ZW-WEB-2026.09.19-r154

## 本次改動

- 正式發布 r153 已完成但未進入 Vercel Production 的全站視覺收口：深墨綠＋金色、宋式紙本、兩語控件、44px 觸控目標、16px 表單與獨立 `/updates` 頁面。
- 解除 Netlify 永久跳過建置的舊設定，改由既有 `archive-stone-zhaowu-official` 專案建置同一個 GitHub `main`。
- 以十個現代 Netlify Functions 路由重用原本的正式 API handler，保留站主登入、Session、歌單、命書側通道與系統診斷能力。
- 對齊 Service Worker、首頁、Manifest、音訊與報告圖片的快取規則，避免替代主機拿到長期舊殼。

## 為什麼改

Vercel Production 仍停在 r151，而最新 r153 的視覺版沒有進入正式別名。站主明確要求不得再讓 Vercel 額度成為視覺完成與發布的阻塞，因此改用既有 Netlify 專案承載同一主線。只發布 `dist` 的純靜態方案會讓十個 `/api/*` 端點失效，故同批補上相容 Functions，而不是交付只能看的假網站。

## 影響範圍

- 全站共用視覺、首頁、七種專卷、報告、登入、帳戶、圖庫與 `/updates`。
- Netlify 建置、SPA fallback、快取標頭與十個 `/api/*` 端點。
- 公開版本資訊更新為 r154／累計 154 次。

## 受保護範圍

- 不改八字、紫微、七政、D60、命書或報告的 calculation truth。
- 不改 Supabase schema、RLS、付款、報告資料與圖庫原始資產。
- API 相容層只轉接既有 handler，不另寫一套登入、歌單或命書邏輯。
- GitHub `main` 仍是唯一原始碼真相；不建立第二份命理程式碼。

## 驗證狀態

- r153 原始視覺收口：提交前 engine／contract suite 646/646、TypeScript 與 production build PASS。
- r154 本機 Vite production build、TypeScript、Netlify Functions bundling：PASS；engine／contract suite 658/658 PASS。
- 本機 WebKit 受執行環境缺少 GTK／GStreamer 系統函式庫阻擋；不把此環境錯誤記成產品失敗，iPhone Safari 由 GitHub required check 重新執行。
- Netlify Production、主要路由與 API：合併後驗證。
- 實體 iPhone Safari：仍需站主真機最終確認；不得以 CI 或桌面畫面冒充。

## 回滾

回滾 r154 commit 即恢復 Netlify 永久跳過與 r153 release fallback；Vercel r151 不受本次部署設定影響。沒有資料庫 schema 或資料刪除操作。
