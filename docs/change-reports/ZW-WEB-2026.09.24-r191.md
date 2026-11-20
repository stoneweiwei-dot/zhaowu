# 昭梧更新報告｜ZW-WEB-2026.09.24-r191

## 本次改動

- 移除 `SiteShell` 對舊 `IntroGate` 的掛載，首頁、一般分區、報告頁與返回導覽不再出現登入／開場動畫。
- `/login` 動畫改為每次站主登入流程只播放一次，不再循環；影片結束或同一流程再次返回登入頁時顯示靜態封面。
- 站主主動登出時重置單次播放狀態，下一次真正登入流程仍可看到一次動畫。
- 後台登入動畫管理只載入具有登入標記的影片，只接受 MP4／WebM，並移除圖片卡片與圖片上傳入口。
- 新增 source contract 與 iPhone Safari 回歸，鎖定跨 route 不重播與後台影片隔離。

## 為什麼改

舊首頁掛載仍會在返回首頁時觸發開場，登入頁影片本身也持續循環；後台管理器同時接受圖片和影片，造成封面、背景圖與動畫素材混在同一分區。這些行為讓使用者反覆被動畫打斷，也使站主難以辨認真正的登入影片。

## 影響範圍

- 公開首頁與一般 route 的 shell 掛載。
- `/login` 動畫播放週期、結束狀態與登出後重置。
- `/gallery#login-visuals` 的載入過濾、預覽及上傳格式。
- 登入動畫上傳的客戶端格式驗證。

## 受保護範圍

本版不修改：

- 站主 cookie、登入 API、owner 權限與 route guard。
- 八字、紫微、報告生成、已保存報告與付款。
- Supabase schema、既有 Storage 物件及媒體原件。
- 首頁背景、總圖庫及其普通圖片管理。

## 驗證狀態

合併前必須通過 Deploy gate、Engine suite、iPhone Safari、TypeScript 與 Vite build。合併後只建立一次 Production deployment，並核對 exact main SHA、`/`、`/login` 首次播放、跨 route 返回靜態封面及 `/updates`。需要站主權限的後台資料畫面以 source contract 與 CI 驗證；若沒有可用登入憑證，不冒充已做正式站後台視覺驗收。

## 回滾

可回滾本版前端 commit 恢復上一版登入舞台。回滾不需修改 Supabase schema 或資料；本版未刪除任何 Storage 物件。
