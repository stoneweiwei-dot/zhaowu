# 昭梧更新報告｜ZW-WEB-2026.09.19-r155

## 本次改動

- 延續 r154 的全站視覺收口與 Netlify 正式主機切換。
- 修正 `owner-music` 在 Netlify serverless bundle 內找不到 `owner-music-ssh.json` 而回傳 502 的問題。
- 改用 Node JSON module 靜態匯入密封資料，讓打包器把必要檔案納入 Function，同時維持原本加密內容與站主驗證流程。

## 為什麼改

r154 上線後的公開逐路由驗證發現，首頁、內容頁與九個 API 路由正常，但公開歌單端點因 runtime 相對路徑已被 bundle 改寫而失敗。這是替代主機的打包差異，不是 Vercel handler 邏輯錯誤；必須在宣告正式完成前修正並重新部署。

## 影響範圍

- `lib/owner-music-git.js` 的密封金鑰載入方式。
- Netlify `owner-music` Function 的 production bundle。
- 公開版本資訊更新為 r155／累計 155 次。

## 受保護範圍

- 不改密封金鑰內容、站主密碼驗證、GitHub `owner-music` 分支或曲目資料格式。
- 不改八字、紫微、七政、D60、命書或報告的 calculation truth。
- 不改 Supabase schema、RLS、付款、報告資料與圖庫原始資產。
- GitHub `main` 仍是唯一原始碼真相。

## 驗證狀態

- r154 GitHub required checks：Engine suite、Deploy gate、iPhone Safari 全數 PASS。
- r154 Netlify Production：首頁、`/updates`、`/login`、`/gallery`、capabilities、doctor 與 owner session 公開檢查通過；owner music 502 並由本版修正。
- r155 必須通過 TypeScript、Vite production build、Netlify Functions bundling、完整 engine／contract suite 與 GitHub required checks。
- r155 合併後必須重新核對 Netlify exact commit 與 `owner-music` 公開回應。
- 實體 iPhone Safari：仍需站主真機最終確認；不得以 CI 或桌面畫面冒充。

## 回滾

回滾 r155 commit 會回到已知 `owner-music` 502 的 r154，不建議單獨回滾；若必須回退主機，Vercel r151 仍可作為舊版緊急 fallback。沒有資料庫 schema 或資料刪除操作。
