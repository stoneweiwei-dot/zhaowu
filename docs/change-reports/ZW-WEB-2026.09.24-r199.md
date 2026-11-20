# 昭梧更新報告｜ZW-WEB-2026.09.24-r199

## 本次改動

- 站主背景音樂管理移除常駐教學／流程文案，只保留真正需要操作的控制。
- 音樂批量工具列只在已勾選曲目後顯示，與登入影片、內容圖庫、背景與報告的後台減法規則一致。
- `/api/owner-music` 公開讀取不再先呼叫 isomorphic-git smart-HTTP 的 remote-info；直接讀 `owner-music` branch raw manifest。
- 保留 Owner Cookie、同源檢查、SSH push、既有上傳／改名／啟用／刪除與前台播放器契約。

## 為什麼改

正式站最近 24 小時的 Vercel runtime errors 聚合顯示 `/api/owner-music` 有 23 次 Node `DEP0169 url.parse()` 警告。應用程式本身已使用 WHATWG `URL`，熱讀路徑中的額外 Git remote-info 沒有產品必要性，且會把公開讀取帶進舊 URL stack。同時音樂管理器仍殘留其他站主後台已移除的常駐說明與空閒批量工具列。

## 影響範圍

- `lib/owner-music-git.js` 的公開 manifest 讀取。
- `src/components/owner-background-music-manager.tsx` 的站主操作呈現。
- r199 release ledger／updates／CURRENT 文件與相關 source contracts。

## 受保護範圍

- 不改背景音樂寫入 branch、SSH key 封裝或 push 方法。
- 不改 Owner Cookie、Auth、payment、Supabase schema／Storage。
- 不改排盤、命理分析、完整報告、文章內容或公開播放器功能。
- 不刪任何曲目。

## 驗證狀態

- 合併前：Deploy gate、Engine suite、iPhone Safari gate 必須全通過。
- 正式站：Production 必須 READY 且 exact runtime SHA 對齊。
- `/api/owner-music` 必須保持可讀，Owner 寫操作仍保持 Cookie gate。
- 部署後以新 runtime 時窗檢查 DEP0169；舊 deployment 的歷史警告不得誤算成新版本回歸。
- 真實站主登入後的肉眼視覺仍需可用 owner authenticated session 才能稱為人工驗收。

## 回滾

回滾 r199 即恢復 r198 音樂管理呈現與 manifest remote-info 讀取；沒有資料 migration 或 Storage 刪除。
