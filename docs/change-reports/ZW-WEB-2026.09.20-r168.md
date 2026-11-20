# 昭梧更新報告｜ZW-WEB-2026.09.20-r168

## 本次改動

- 修正開場動畫右下角「開啟聲音」控制在 iPhone 上被壓成 44px 圓鈕，導致中文逐字直排的問題。
- 從 `IntroGate` 的聲音按鈕移除 `data-background-music-control`，避免誤吃全站播放器的固定 44×44 規則。
- `.zhaowu-intro-sound` 與登入頁 `.stone-login-sound` 明確鎖定：
  - 橫向排版；
  - `white-space: nowrap`；
  - `writing-mode: horizontal-tb`；
  - 高度 44px；
  - 寬度自適應內容；
  - iPhone safe-area 內右下角定位。
- 保留原本的聲音播放、暫停、音量與五秒開場動畫邏輯。
- 修正 r161 舊 regression contract，明確禁止開場聲音鈕再次掛上全站背景播放器 selector。
- 新增 `scripts/r168-intro-sound-control.test.mjs` 並加入 deploy gate。

## 為什麼改

實機截圖顯示開場動畫右下角的聲音控制出現「白色圓鈕 + 開啟聲音逐字直排」的明顯 UI 錯誤。根因不是動畫素材，而是 `IntroGate` 同時掛了 `data-background-music-control`；canonical design system 對該 selector 強制 `width: 44px; height: 44px`，把本來應該是橫向膠囊的文字壓縮到逐字換行。

## 影響範圍

- 開場動畫 `IntroGate` 的聲音控制。
- 登入動畫聲音控制的橫排防呆樣式。
- iPhone safe-area 內的右下角聲音 UI。
- 對應 regression tests 與 release metadata。

## 受保護範圍

- 不修改開場 MP4／poster／聲音檔。
- 不修改五秒開場時間與 hard-exit policy。
- 不修改背景音樂播放器與青玉小龍播放器功能。
- 不修改站主後台、Supabase、Auth、Payment、報告或命理計算。
- 不修改登入密碼與 owner-cookie 驗證。

## 驗證狀態

- Source fix 已完成。
- 合併前必須 Deploy gate、Engine suite、iPhone Safari 全綠。
- 合併後必須確認 Production release 為 r168，正式 bundle 不再把 intro sound control 標記成 `data-background-music-control`。
- iPhone 實機／Safari 應顯示單行「♪ 開啟聲音」小膠囊，不得再出現直排文字。

## 回滾

回滾 `intro-gate.tsx`、`zhaowu-design-system.css`、r161/r168 tests 與 r168 release metadata 即可返回 r167；不涉及資料遷移。
