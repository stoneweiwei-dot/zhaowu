# 昭梧更新報告｜ZW-WEB-2026.09.14-r130

## 本次改動

- 背景音樂不再播放 r129 內建佔位音。全站只播站主在後台上傳並啟用的曲子。
- 站主後台 `/account` 在獨立 Cookie 登入後即可看到「背景音樂管理」。上傳不經 Supabase session，也不再被 402 spend cap 擋住。
- 新曲寫入 `owner-music` 分支曲庫（不部署、不碰 `main` 公式）。播放走 `/api/owner-music`。單檔 4 MB，MP3／M4A／AAC／WAV／FLAC。
- 先前上傳在 Supabase `zhaowu-audio` 的曲子（含《淨佛聖願》）仍在原桶，但 live HEAD 繼續 402，無法下載。站主可在後台重新上傳同一批檔。
- 站主密碼接到真正生效的 `api/owner-*.js`（8 位以上）。只改 TypeScript `owner-auth.ts` 不能登入。舊 32 位密鑰失效。明文不進 repo。

## 為什麼改

正式站還在播內建佔位音，不是站主以前上傳的曲子。後台上傳入口被 Supabase session 卡住。站主問密碼：舊明文從未進過 repo，只能換一把能用的新鑰匙。

## 影響範圍

`api/owner-music.js`、`lib/owner-music-git.js`、站主後台音樂管理、背景音樂播放器、獨立站主 Cookie hash、PWA cache `zhaowu-shell-r130`。不改八字／紫微／七政／西占／D60 公式。不改 Loading 影片。付費圖片 PR #295 仍暫停。`owner-music` 分支禁止 Vercel 部署。

## 保護範圍

- Astronomy Engine、Lahiri、Ascendant、D60 分段公式
- guest-first、站主-only login
- r113 App Icon／Header 金葫蘆
- r126 Loading 原片可見＋Skip
- r129 首頁結構／觀世錄／夜間實色底
- Paid visual #295 暫停
- 首頁不得出現「你是少見的」大師數文章標題
- Safari 關閉黃曆高度契約仍適用

## 驗證

Deploy gate、Engine suite、iPhone Safari 全綠後才合併。真機：用站主密碼登入 → 後台看到上傳 → 上傳 MP3／M4A → 全站音符改播該曲。舊 Supabase 曲子在流量上限解除前無法自動撈回。

## 回滾

回退 r130 提交即可回到 r129：佔位音、舊站主 hash、Supabase session 才顯示的上傳入口。`owner-music` 分支可保留不刪。不需資料庫 migration。
