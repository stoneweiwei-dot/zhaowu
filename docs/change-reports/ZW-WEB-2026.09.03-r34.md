# 昭梧更新報告｜ZW-WEB-2026.09.03-r34

## 本次改動

- 修正「目前居住城市」三語標籤重複顯示選填字樣：若 label 已包含「選填／选填／optional」，CityPicker 不再附加第二個 Optional badge。
- iPhone Safari QA 對齊目前正式產品契約：首頁主判標題為「四柱八字」；登入成功回首頁再由「我的昭梧」進帳戶；Safari 加主畫面使用「顯示 iPhone 保存步驟／稍後再說」而不是假裝網站能直接把圖示寫入 iOS 桌面。
- 修正觀世錄測試：若第一篇文章本來就是展開狀態，不再先點擊把它關閉才檢查配圖。
- 修正一掌經 iPhone 測試欄位定位：出生日期限定在「出生日期（國曆）」fieldset，避免與同頁 D60 年／月／日欄位衝突。
- 保護站主帳戶頁的直接 section 在 iPhone Safari 上維持 display / opacity / visibility 可見，避免「首頁背景管理」DOM 已存在但被視覺層隱藏。
- 保留 r33 已上線的 loading：影片真實時間軸停滯偵測、CSS 雙生並蒂蓮動勢、3 秒 hard exit；本次沒有再用猜測方式疊加動畫效果。

## 為什麼改

最新 main 的 engine tests、TypeScript 與 Vite build 都已通過，但 iPhone Safari CI 仍有 13 個失敗。逐項對照現行 main 後，多數失敗源自舊測試仍要求已被定稿替代的 UI（例如「交卷，先看答案」、登入後直接去 /account、舊的加入主畫面按鈕字樣、把 wallpaper 誤判為 shell 自身背景）。這些不能反向把正式產品改回舊版。

本次只保留兩個真正需要產品層修正的點：三語 Optional 重複，以及站主帳戶 section 的 iPhone 可見性保護。登入、八字計算、報告生成、付費與 Supabase 資料結構均不改。

## 影響範圍

- 前端：`src/components/city-picker.tsx`、`src/ios-section-visibility.css`。
- QA：iPhone Safari parchment、登入／帳戶、報告保存、首頁核心流程、一掌經、loading gate 契約。
- 版本：public release fallback 升為 `ZW-WEB-2026.09.03-r34` / update 34。
- 不改：八字／節氣／真太陽時／子時換日、紫微、D60 計算、支付、Supabase schema／權限／環境變數、現有 r33 loading 媒體與動畫邏輯。

## 驗證

- 必須由同一筆 main CI 跑 engine tests、TypeScript、Vite build 與 iPhone Safari Playwright。
- Production 後確認 Vercel `githubCommitSha` 等於 main HEAD。
- 真實 iPhone Safari 動畫是否肉眼符合站主期待，仍以站主實機為最終視覺驗收；CI 只驗證不卡死與降級契約，不能冒充實機視覺確認。

## 回滾

- 若 Optional 修正造成 label 異常，只回退 `city-picker.tsx`。
- 若帳戶 section 可見性保護影響其他頁，只回退 `ios-section-visibility.css` 新增的 account selector。
- QA 斷言可獨立回退，不影響任何命理計算核心。
