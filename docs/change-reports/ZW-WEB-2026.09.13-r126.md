# 昭梧更新報告｜ZW-WEB-2026.09.13-r126

## 本次改動

- Loading 原片改為一進站就可見並主動 `play()`。拿掉「影片 opacity:0 直到 is-playing」與 buffering 時 `onStalled` 再把片藏起來——這兩項會讓 9.2MB 飛升片看起來完全沒動，只剩靜態海報。成功播放仍走原時長 10.04 秒，右下角 Skip，硬退出 12 秒。真正影片錯誤才 1.6 秒 fail-open，且不會把 intro 標成已看過。
- 系統「減少動態效果」不再把原片 `display:none`；Skip 仍可隨時離開。
- 站主登入：Supabase 回 402／spend cap／egress quota 時，直接顯示中文說明，而不是空白「登入失敗」。登入頁補充後台額度提示。
- Intro seen key 改 `zhaowu.intro.seen.r126`，PWA cache `zhaowu-shell-r126`，讓上一版被藏片或誤關的訪客再看一次已修好的原片。

## 為什麼改

正式線出現「動畫完全沒動」。根因是片被藏到開始播放才顯示，而 9.2MB 在 iPhone 上常常還沒第一幀、或 buffering 觸發 stalled，閘門就把片藏回去。站主登入失敗的根因是 Supabase 專案 `plgpxusmemnmzckbwtiv` 因 `exceed_cached_egress_quota` 被暫停，不是帳密表單壞掉。

## 影響範圍

IntroGate 顯示與時長、intro CSS opacity、seen key、PWA cache、登入錯誤文案。不改八字／紫微／七政／西占／D60 公式。不改 auth 架構。付費圖片 PR #295 仍暫停。

## 保護範圍

- Astronomy Engine、Lahiri、Ascendant、D60 分段公式
- guest-first、站主-only login
- r113 App Icon／Header 金葫蘆
- Paid visual #295 暫停

## 驗證

Deploy gate、Engine suite、iPhone Safari 全綠後才合併。真機 iPhone 需再確認原片會動。Supabase 登入在 spend cap 解除前仍無法成功，頁面必須把原因講清楚。

## 回滾

回退 r126 提交即可回到 r125 的 opacity:0 影片與沒有 spend-cap 中文提示的登入頁。不需資料庫 migration。
