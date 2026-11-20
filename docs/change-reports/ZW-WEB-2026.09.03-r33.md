# 昭梧更新報告｜ZW-WEB-2026.09.03-r33

## 本次改動

- 加強開場雙生並蒂蓮在 iPhone / Safari 上的可見動勢：原畫面縮放／上浮幅度提高到肉眼可辨，並加入低飽和礦物金的呼吸式光暈，不依賴 MP4 逐幀播放才看得見變化。
- 加入影片停滯 watchdog：`play()` 成功後 480ms 內若 `currentTime` 沒有至少前進 0.06 秒，或媒體已 paused / ended，立即切到 still fallback；3 秒 hard-exit 規則完全保留。
- `prefers-reduced-motion` 仍尊重系統設定：不做位移／縮放，只保留柔和明暗呼吸，不讓頁面完全像卡死。
- `昭梧 · 觀世錄` 補入四組近期未獨立收錄的 OWNER_MATERIAL：真正的風水＝日常行為與環境、`不當真`＝不把一刻當終局、情緒與決策分線、規律／規則／人性／自我覺察。
- 四組文章均提供繁中、簡中、英文，並沿用現有舊宣紙古畫漫畫插圖家族。

## 為什麼改

站主在 Production 實際看到「動畫沒有在動」。上一版雖已有 `play()` 重試和細微 CSS transform，但使用者實際結果優先，因此不能以 build PASS 或程式存在判定已修復。這版把 fallback 動勢提高到肉眼可辨，並檢查影片是否真的有時間軸前進，而不是只檢查 `play()` Promise。

近期來源中仍有幾組核心小開悟沒有形成獨立文章條目。本次按 `OWNER_MATERIAL` 吸收到公共解釋／建議層，只保留可落地的部分；象徵性的風水或修行語言不寫成物理、醫療或確定因果定律。

## 影響範圍

- 前端：`src/components/intro-gate.tsx`、`src/intro-extra.css`。
- 內容：`昭梧 · 觀世錄` 四組新文章及其三語版本。
- 版本：public release fallback 升為 `ZW-WEB-2026.09.03-r33` / update 33。
- 測試：新增 intro motion watchdog / fallback 契約及 late OWNER_MATERIAL intake 契約。

## 保護範圍

- 不改四柱、節氣、真太陽時、子時換日、紫微或 D60 計算。
- 不改登入、支付、Supabase schema、權限、環境變數或 production data。
- 不合併先前失敗的 r33-r35 Preview 資產分支。

## 驗證狀態

- 合併前：需由 Vercel Production build 執行全套 tests / TypeScript / Vite build。
- 上線後：必須確認 Production `githubCommitSha` = main HEAD，首頁、intro MP4、觀世錄資產可讀。
- 真實 iPhone Safari 動畫視覺仍必須以可視瀏覽器或站主實機結果判定；若工具無法渲染動畫，不得把程式契約或 READY 狀態冒充視覺 PASS。

## 回滾

- 若新動勢過強或產生 iPhone 問題，可獨立回退 `intro-gate.tsx` / `intro-extra.css` 到 r32，不影響文章。
- 若文章內容需調整，可只移除 `LIFE_VIEW_20260903_LATE_ARTICLES` 的入口，不觸碰命理計算核心。
