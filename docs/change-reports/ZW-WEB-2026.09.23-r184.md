# 昭梧更新報告｜ZW-WEB-2026.09.23-r184

## 本次改動

- 依真 iPhone Safari 驗收恢復首頁一次性 Loading／IntroGate。
- Intro seen key 改為穩定的 `zhaowu.intro.seen.public.v1`：同一瀏覽器只播一次；refresh／回訪不重播。
- 夜間模式增加文字對比下限，主要、次要與 muted 文字都不得靠低 opacity 呈現。
- 第一屏主答案移除「依據狀態／最大現實變數」，改放進收合的「判斷備註」。
- 「查看完整分析」改成「查看補充重點」；前台最多顯示三項真正影響判斷的補充。
- 命盤、完整 reasons／risks／timing／actions、五行／歲運視圖、時間換算與 evidence governance 全部移到最下方判斷備註。

## 為什麼改

2026-09-23 真 iPhone Safari 驗收發現三個實際問題：首頁未出現預期 Loading；夜間模式部分文字對比不足；「天賦」報告雖可用，但大量分析與主答案同權重，主次不分。

本版直接以「答案是正文，分析過程是註腳」重排前台，不改生成核心。

## 影響範圍

- 首頁首次 Loading。
- iPhone 夜間模式文字對比。
- ResultView 第一屏與完整報告的資訊層級。
- FOCUSED-REPORT 呈現契約。

## 受保護範圍

- 不改八字／紫微／西占等計算核心。
- 不改 owner Auth、Payment、Supabase schema／RLS。
- 不解除 r181 Supabase Storage write freeze。
- 不新增付費 provider、Floot／Dropbox runtime 依賴。
- 不把分析資料刪掉；只把它降到收合備註層。

## 驗證狀態

- PR 必須通過 Deploy gate、Engine suite、iPhone Safari CI。
- 合併後由 main 建立一次 Vercel Production。
- Production 必須 READY 且 SHA = main。
- 真機需再次確認：首訪 Loading 一次、night 可讀、天賦報告主答案明顯且分析備註預設收合。

## 回滾

若 r184 造成回歸，可回滾 SiteShell IntroGate mount、ResultView／paid-report-pages 呈現與同一 canonical CSS 內的 r184 規則；不需回滾命理核心或資料庫。
