# 昭梧更新報告｜ZW-WEB-2026.09.27-r210

## 本次改動

- 完成 r1–r209 release integrity audit；不再把 change-report 文字本身當作完成證據。
- 依真實 Git commit 回填 15 個缺失歷史 release note：r71–r77、r93、r121、r124、r128、r143、r172、r195、r202。
- 保留 r59 為沒有對應 release commit 的真實歷史跳號；r1–r10 不因缺檔而補造假版本。
- 修正 >6 MB MP4/WebM TUS resumable upload：`Authorization` 改用 Supabase publishable/anon bearer credential，object signed-upload token 保留在 `x-signature`。
- 把 active Storage/TUS contract 加入 Production deploy gate，防止再由後續 commit 把錯誤 header 寫法釘回去。
- 修正 r209 release ledger 漂移，現行版本推進 r210 / updateNumber 210。
- 修正 CURRENT-STATE 中已被 r204 supersede 的登入動畫頻率：同裝置每本地日最多一次，支援 Skip。
- 修正 Instruction Registry 的 r206→r208 final-closure 標籤漂移。
- 新增 `docs/RELEASE-INTEGRITY-AUDIT-r1-r209.md` 與 release-history integrity regression。

## 為什麼改

站主要求確認 r 檔案中的內容是否真的落到程式，而不是只生成一份「已完成」文字。稽核確認大部分 CURRENT 行為已有 source / regression / CI，但也抓到幾個具體 drift：TUS bearer header 仍是錯的、r209 updateNumber 落後、CURRENT login 規則仍停在 r191、registry 標籤與實際 r208 不一致，以及 15 個有真實 release commit 卻沒有 change-report 的歷史缺口。

本版只修可由 repo / Production evidence 證明的缺口，不復活被後續版本 supersede 的舊 UI／舊登入／舊 PWA 行為。

## 影響範圍

- `src/lib/owner-data-client.ts`：TUS headers。
- release ledger / verification tests。
- Production deploy gate：加入 Storage upload contract。
- CURRENT / Instruction Registry / release audit docs。
- 15 份歷史 evidence backfill。

## 受保護範圍

- 不關 Supabase RLS。
- 不新增 anon Storage INSERT policy。
- 不把 service_role key 暴露到 browser。
- 不改 Bazi / 紫微 deterministic calculation truth。
- 不改 payment、owner cookie login 架構、Supabase schema。
- 不復活 Netlify Production。
- 不重新啟用已被 CURRENT supersede 的歷史產品入口。

## 驗證狀態

合併前必須：
- Production CI Deploy gate PASS；
- Engine suite PASS；
- iPhone Safari CI PASS；
- release-history integrity regression PASS。

合併後必須：
- Vercel Production deployment READY；
- runtime Production SHA 對齊 r210 merge commit；
- `/release.json` 顯示 r210 / updateNumber 210；
- `/`、`/login`、`/updates`、`/sky-events` 可正常取得；
- Vercel runtime error scan 無本次新增 server errors。

仍需站主真實 owner session 做：
- >6 MB、<=15s MP4/WebM 上傳；
- object 建立／後台列出；
- logout 後 upload 被拒絕。

真 iPhone Safari 最終人工驗收仍不能由 CI 冒充。

## 回滾

runtime 可 revert r210 TUS / release changes；歷史 evidence backfill 是 docs-only，不影響 runtime。若回滾 TUS 修復，不得把已知會造成 403 的 signed-upload-token-as-bearer 寫法重新定義為正確 contract。
