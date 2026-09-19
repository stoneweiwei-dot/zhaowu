# 昭梧更新報告｜ZW-WEB-2026.09.19-r159

## 本次改動

- 青玉小龍移除七政、一掌經、紫微等公開流派捷徑；詢問這些名稱時也統一帶回首頁完整綜合報告。
- Supabase `site-guide` 相容端點同步改為單一報告文案，並允許 Netlify 主站、正式子域名與 Vercel 備援來源。
- canonical、Open Graph、Twitter 分享圖、會員確認信回呼與回答品質遙測改以 Netlify 主站為準。
- 公開 API release metadata 從 r138 修正為 r159；PWA shell cache 同步升版。
- CURRENT-STATE、DOMAIN 與未完成指令文件統一為「Netlify 主站、Vercel 同版備援」。

## 為什麼改

r158 雖已移除首頁七個流派入口，但青玉小龍仍展示流派捷徑與舊導覽文案，會讓客人再次進入分散專卷。同時網站 metadata、登入回呼、後端版本與文件仍混用 Vercel／Netlify 舊狀態。本版把可見入口與部署真值完整收口。

## 影響範圍

- 青玉小龍導覽與捷徑。
- Supabase `site-guide` 相容 Edge Function。
- SEO／社群分享 metadata、會員確認信回呼、PostHog host allowlist。
- `/api/zhaowu-doctor`、`/api/zhaowu-capabilities` 公開版本標記。
- PWA cache 與專案現況文件。

## 受保護範圍

- 不修改命理計算、綜合報告組裝內容、登入資料、付款、Supabase schema 或客戶資料。
- 原專項 routes 與 deterministic engines 保留作內部能力及回歸驗證；本版只移除公開導覽入口。
- Vercel 不刪除，保留同版備援；Netlify 為 canonical 主站。

## 驗證狀態

- 發佈前執行完整測試、TypeScript、Vite build 與 iPhone Safari CI 契約。
- 合併後核對 GitHub main、Netlify deploy、Vercel fallback、正式首頁 metadata、公開 API 版本與 Supabase `site-guide`。
- 真實 iPhone 與已安裝 PWA 仍需站主實機驗收，不以 CI 冒充完成。

## 回滾

回滾 r159 的青玉小龍／site-guide、host metadata、release metadata、文件與測試即可。沒有 schema migration 或客戶資料變更；Supabase Edge Function 可回滾至 v9。
