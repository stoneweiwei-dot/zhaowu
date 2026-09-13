# 昭梧更新報告｜ZW-WEB-2026.09.14-r129

## 本次改動

- 背景音樂改由網站本機 `/audio/zhaowu-background.m4a`（MP3 備援）播放。不再把公開播放綁在 Supabase Storage；402 spend cap 不再讓右下角音符失效。
- 站主登入 API 改成可在 Vercel 直接跑的獨立 `.js` 函式，不再從 `src/` 引入 TypeScript。正式線先前 `/api/owner-login`、`/api/owner-session` 回 500，現在應回 401／200。SPA rewrite 不再攔截 `/api/*`。
- 首頁拿掉「客人資料」底下那份即時四柱預覽。八字排盤只在開始分析後的報告出現；七種個人分析裡的「子平八字」仍是專卷入口。
- 四柱卡片不再把天干、地支、十神疊在同一格裡。每柱只顯示柱名、干支、十神。
- 《術數的邊界》與研究札記收進 `/knowledge`「昭梧 · 觀世錄」。首頁觀世錄只留最新一篇與入口，不再把資料庫文章鋪在主分析流裡。
- 夜間：七種個人分析標題與導語改月白，區塊用實色松底，不再讓壁紙透出來；「展開命盤細項」改月白。客人資料卡維持宣紙深字。

## 為什麼改

iPhone 截圖證明：音樂被 Supabase 402 擋死；站主登入 API 在正式線 FUNCTION_INVOCATION_FAILED；客人資料下面的四柱預覽與下方子平八字專卷重疊，柱卡干支與十神互疊；夜間命盤區與「七種個人分析」寫在壁紙上幾乎看不見；研究文章出現在錯誤位置。

## 影響範圍

首頁結構、四柱展示 CSS、觀世錄入口、背景音樂資產、Vercel `/api/owner-*`、夜間可讀 CSS、PWA cache `zhaowu-shell-r129`。不改八字／紫微／七政／西占／D60 公式。不改 Loading 影片。付費圖片 PR #295 仍暫停。

## 保護範圍

- Astronomy Engine、Lahiri、Ascendant、D60 分段公式
- guest-first、站主-only login
- r113 App Icon／Header 金葫蘆
- r126 Loading 原片可見＋Skip
- Paid visual #295 暫停
- 首頁不得出現「你是少見的」大師數文章標題
- Safari 關閉黃曆高度契約仍適用

## 驗證

Deploy gate、Engine suite、iPhone Safari 全綠後才合併。真機需再看：點音符能出聲、站主密鑰能進後台、首頁只有一份八字入口、夜間七種分析標題可讀。

## 回滾

回退 r129 提交即可回到 r128：Supabase 音樂、TypeScript owner API、首頁即時四柱預覽、知識圖鑑舊標題。不需資料庫 migration。
