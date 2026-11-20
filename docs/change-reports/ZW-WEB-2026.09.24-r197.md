# 昭梧更新報告｜ZW-WEB-2026.09.24-r197

## 本次改動

- 站主素材後台改成單一工作面：「登入影片」與「內容圖片」以兩個分頁切換，一次只顯示一套管理器。
- 登入影片、總圖庫、首頁背景、報告四處的批量工具列改為先勾選項目後才出現，未操作時不再鋪滿按鈕。
- 保留登入影片 MP4／WebM、15 秒成品、Owner bridge 500 MB 與現行 TUS 上傳能力。
- 將目前 main／Production 已存在的 installed-PWA 免刪除更新機制納入正式 release ledger，修正 runtime 已前進但公開版本仍停在 r196 的記錄落差。

## 為什麼改

前一輪已移除後台教學式廢話，也把登入素材限制為真正的影片，但 `/gallery` 仍同時把登入影片管理和總圖庫整塊上下堆疊；四個管理區在未選任何項目時亦持續顯示批量按鈕。功能雖在，手機後台仍像工具集合而不是乾淨的管理介面。

## 影響範圍

- `/gallery` 站主素材管理。
- 登入影片管理器與內容圖庫的空閒狀態。
- `/account` 首頁背景與報告的批量工具列顯示條件。
- `/updates`、release fallback 與 current release ledger。
- 已安裝 PWA 的現行版本更新能力只作版本記錄對齊，不在本次重新改寫其 runtime。

## 受保護範圍

- 不改 Owner Cookie、會員 Auth、站主權限或登入 API。
- 不改 Supabase schema、RLS、Storage 物件、metadata row 或現有素材引用。
- 不改 payment、四柱排盤、命理 deterministic calculation、報告生成與既有報告資料。
- 不刪任何登入影片、背景、圖庫圖片或客戶報告。

## 驗證狀態

- 新增 r197 source contract：素材後台一次只顯示一個管理器，四處空閒批量工具列不常駐。
- 既有 r191 contract 繼續鎖定登入影片只接受 MP4／WebM，圖片不得進入登入動畫管理器。
- 合併前需通過 pretest／deploy suite／engine suite／TypeScript／Vite build。
- 合併後只建立一次 Production，核對 exact main SHA 與正式 `/gallery`、`/account`。需站主登入的實際視覺若工具無法取得已驗證會話，明確標為未視覺驗證，不以 CI 冒充。

## 回滾

回滾 r197 前端與 release-ledger commit 即可恢復先前管理呈現；沒有資料 migration 或 Storage 刪除，不需要資料回滾。
