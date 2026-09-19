# 昭梧更新報告｜ZW-WEB-2026.09.19-r162

## 本次改動

- 八個專業計算路由加入站主 Cookie 前置驗證；未登入訪客不再能直接以網址打開。
- 公開「我的紀錄」、知識庫、首頁舊紫微功能卡與青玉小龍移除專業流派入口，只保留首頁完整命盤及心境小測導向。
- 新增 Netlify `/api/owner-data`，站主報告、背景、圖庫、登入素材與命詮圖改經同源伺服器橋接。
- 新增 Supabase `zhaowu-owner-data` Edge Function 原始碼與安全上傳票據驗證；瀏覽器不持有 service-role 憑證。
- 限縮 `get_customer_classic_passage(jsonb)` 的 SECURITY DEFINER 執行權限為 `service_role`。
- 後端驗證版本與公開 release ledger 同步升到 r162。

## 為什麼改

首頁雖已在 r158–r161 收成單一完整報告，但專業路由仍可由網址直接到達，站主資料功能也尚未在 Netlify canonical host 接通。r162 把 UI 隱藏提升為實際權限邊界，並補齊 canonical host 的後台資料入口。

## 影響範圍

- 公開導覽與本機紀錄頁。
- `/ziwei`、`/qizheng`、`/astrology`、`/indian-astrology`、`/yizhangjing`、`/numerology`、`/tianji-dual`、`/tianji-xinggong`。
- 站主 `/account` 與 `/gallery` 的資料操作。
- Netlify Functions、Supabase Edge Function 與一項資料庫函式權限。

Supabase Storage 現有容量約 1.20 GB，超過 Free plan 1 GB，故 live Storage／Edge gateway 仍會回 HTTP 402；本版提供完整程式與清楚錯誤回退，但不擅自刪除媒體或代替站主升級帳務。

## 受保護範圍

- 不改八字、紫微、七政、西占、印度古法、一掌經或生命靈數計算核心。
- 不改單一完整報告內容契約與付費邏輯。
- 不刪除 Supabase Storage 物件或既有報告。
- 付費圖片 provider 仍維持站主指定的暫停狀態。
- 正式取用／喜用全格局驗證仍維持 fail-closed，不假報完成。

## 驗證狀態

- r162 route／bridge／安全契約測試：PASS。
- TypeScript、production build、683 項 engine/contract suite：PASS。
- GitHub required checks：Deploy gate、Engine suite、iPhone Safari 全部 PASS。
- Supabase migration 已套用，SECURITY DEFINER advisor 警告已消失；Edge Function 已部署 v4。
- 真實實體 iPhone 驗收仍需站主持機完成。

## 回滾

回滾本版前端與 Netlify handler 可恢復 r161 UI；資料庫權限若需回滾，必須另建 migration 明確恢復 EXECUTE，不可直接改寫既有 migration。`zhaowu-owner-data` Edge Function 可切回上一版，但不得將 service-role key 移至瀏覽器。
