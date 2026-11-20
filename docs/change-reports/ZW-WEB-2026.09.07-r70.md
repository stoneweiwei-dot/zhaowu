# 昭梧更新報告｜ZW-WEB-2026.09.07-r70

日期：2026-09-07 AEST

## 本次改動

- 補回站主後台手機優先的背景音樂上傳流程：MP3 直接上傳；標準 AAC/M4A 驗證為正常 MP4/AAC 後直接上傳；其他常見格式只做一次 128 kbps、48 kHz、立體聲 MP3 轉碼。
- 音訊轉碼器加入兩組來源與 28 秒核心載入超時；上傳加入 120 秒超時與實際進度。失敗時停止等待並清理已建立的物件／metadata，不再無限卡在 3%。
- 前台播放器改讀目前啟用曲目的實際 MIME type，避免站主之後上傳 MP3 卻仍被瀏覽器標成 audio/mp4。
- `/account` 站主後台恢復收合式管理分組：背景音樂、首頁背景、總圖庫、客戶報告。背景與報告區只有在站主打開時才展開，降低 iPhone 長頁面負擔。
- 總圖庫改為預設收合、每次顯示 18 張並可逐批載入；同時保留目前正式的「登入動畫」獨立分組與內置 Loading 素材，不回退 r68 的圖庫規則。
- 更新 iPhone Safari 回歸測試，使首頁六種看法、達摩一掌經、七政四餘、紫微斗數的 selector／文案與目前共享生辰介面一致。

## 為什麼改

今日回查發現，早上已做過的 r59 手機音訊與站主後台整理並沒有安全進入後來持續前進的 main。現行 main 仍保留手機端重型轉碼流程，因此站主上傳音樂仍可能卡在早期進度。另外 r69 的 iPhone Safari CI 有 5 條測試仍在尋找已被 r60–r68 正式介面取代的舊角色與舊文案。r70 把遺漏的實際功能補回目前 main，並只更新已失效的測試契約，不回退後續功能。

## Supabase 核對

- Supabase project：`plgpxusmemnmzckbwtiv`，狀態 ACTIVE_HEALTHY。
- `background_music_assets` 目前啟用曲目仍為《淨佛聖願》：`background/jingfo-shengyuan-aac.m4a`，AAC-LC，5,703,917 bytes。
- 音樂 metadata 的 owner SELECT/INSERT/UPDATE/DELETE RLS 均存在，公開端只能讀取 enabled=true 曲目。
- `zhaowu-audio` Storage 已有 owner INSERT/UPDATE/DELETE policy；r70 不擴大站主權限、不加入 service_role、不建立新的公開寫入入口。
- 本次不修改 Supabase schema。`release_history` 只在 Production exact SHA 驗證完成後才記錄 r70。

## 影響範圍

- `src/lib/background-music-upload.ts`
- `src/components/owner-background-music-manager.tsx`
- `src/components/background-music.tsx`
- `src/components/owner-console-organizer.tsx`
- `src/routes/__root.tsx`
- `src/components/owner-gallery-manager.tsx`
- `e2e/core-flow.iphone-safari.spec.ts`
- `e2e/dual-destiny.iphone-safari.spec.ts`
- `e2e/specialist-reports.iphone-safari.spec.ts`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- `scripts/owner-r70.test.mjs`
- `docs/change-reports/ZW-WEB-2026.09.07-r70.md`

保護範圍：不修改八字排盤核心、真太陽時、紫微／D60／一掌經計算、登入權限模型、付款、客戶報告資料、Supabase schema 或既有音樂檔。

## 驗證要求

- deterministic / engine tests PASS。
- TypeScript check PASS。
- Production build PASS。
- iPhone Safari regression PASS。
- 音樂上傳 contract 必須確認 MP3 直傳、標準 AAC/M4A 直傳、非標準格式單次 MP3 轉碼、28 秒轉碼核心超時、120 秒上傳超時。
- 前台播放器必須使用 asset 實際 `content_type`。
- Owner console 必須掛在 AuthProvider 內，只對 owner 顯示。
- Gallery 必須預設收合、18 張分批載入，且保留 Loading 分組。
- 合併後 Vercel Production `githubCommitSha` 必須等於 `main` HEAD；在 Vercel deployment rate limit 解除前，不得把 r70 標為 Production 完成。
- Production `/`、`/login`、`/account` 驗證通過後才可寫入 Supabase `release_history`。

## 回滾

若 r70 造成回歸，只回退 r70 的音訊上傳、owner organizer、Gallery 收合與 Safari test 修改；不得回退 r69 的直接問事答案／四柱日曆，也不得回退 r60–r68 的共享生辰、六種看法、登入動畫圖庫、正式 Logo、報告大圖或命理核心。
