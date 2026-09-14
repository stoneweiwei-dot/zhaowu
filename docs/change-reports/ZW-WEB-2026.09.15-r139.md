# 昭梧更新報告｜ZW-WEB-2026.09.15-r139

## 本次改動

r139 依站主最新 iPhone 截圖與明示指令，一次收口首頁、D60 分組、會員登入、登入動畫、本機生辰與音樂上傳。

### 1. 首頁只留客人資料
- 拿掉「昭梧 · 問事」整塊：不再出現「此刻，你最想了解什麼？」「先給結論，再依據命局與時間節奏說明可行選擇。」「結論／依據／時機」與工作問題 placeholder。
- 子平八字入口改指 `#customer-record`。送出按鈕改為「保存生辰」，不再為了報告硬要一個問題、也不再偷偷塞自問自答。

### 2. D60 歸入自己的分組
- `/yizhangjing` 不再掛 `D60KarmaSection`。
- D60 只在 `/indian-astrology` 經既有 `D60ReliabilityGate`（分鐘確認、fingerprint、±2 分鐘）後輸出。
- 不改 Astronomy Engine／Lahiri／Ascendant／D60 分段公式。不作判定仍是 Gate 正常結果。

### 3. 會員登入／註冊重新放出
- `/login` 恢復「登入／註冊／站主」三分頁。站主仍走獨立 Cookie `__Host-zhaowu_owner_session`。
- 新增 `/auth/callback`。註冊確認與 OAuth 的 `redirect_to` 釘在正式站 callback，不再把 token 倒在首頁變成空白錯誤頁。
- 會員永遠不是站主：`profiles.is_owner` 不再授予後台。

### 4. 登入動畫鋪滿
- `.stone-login-stage-media` 改全螢幕 `object-fit: cover`，失敗時回退 `/intro/owner-immortal-ascent-r123.mp4`。
- IntroGate 仍維持 r126「看過就跳過」。

### 5. 每台手機自動讀取先前生辰
- `setSharedBirthAccessUser` 登入／登出不再刪 `zhaowu.birth-record.v1`。本機紀錄優先於帳戶資料。

### 6. 西洋十二宮換行
- 拿掉 `white-space: nowrap`。iPhone 改卡片列，宮位／宮頭／傳統主星／宮內行星／生活主題／解讀都看得到。

### 7. 音樂上傳回報真實錯誤
- iPhone `audio/aac`、`application/octet-stream` 與無副檔名檔用 magic byte 辨識。
- 上傳失敗改顯示 `detail`、error code 與 HTTP 狀態，不再只寫「背景音樂上傳失敗。」

## 為什麼改

站主最新指令覆蓋較舊的 STO-5／r128「普通會員登入廢止」、r110 首頁問事表、以及把 D60 嵌進前世今生的舊產品形狀。新意圖是：首頁只填生辰、D60 走自己的印度分組、登入後還能讀這台手機之前的資料、註冊必須有回調頁、登入要看見動畫、星座表不能裁欄、音樂失敗要講得出原因。

## 影響範圍

- `src/components/analysis-form.tsx`
- `src/routes/index.tsx`、`yizhangjing.tsx`、`login.tsx`、`auth.callback.tsx`、`account.tsx`
- `src/lib/auth/*`、`src/lib/shared-birth.ts`、`src/lib/supabase-rest.ts`、`src/lib/auth/signup.ts`
- `src/components/palm-standalone.tsx`、`d60-karma-section.tsx`、`specialist-chart.tsx`
- `src/specialist-system.css`、`src/login-approved-r89.css`
- `src/lib/owner-music-client.ts`、`src/lib/owner-music-transcode.ts`、`api/owner-music.js`
- 相關契約測試、e2e、PWA `zhaowu-shell-r139`

不改八字／紫微／D60／西洋計算公式，不復活 Supabase Audio CDN。

## 回滾

還原本 commit。回滾會讓首頁問事標語、前世頁 D60、登入清生辰、nowrap 星座表與無 callback 的註冊空白頁重新出現。
