# 昭梧更新報告｜ZW-WEB-2026.09.10-r101

## 本次改動
- 全站語言選擇順序改為：`English → 简体 → 繁體 → 日本語 → 한국어 → हिन्दी`；English 以完整名稱顯示並置於第一位。
- 首次開啟且沒有既有語言偏好時，預設改為簡體中文 `zh-Hans`；已經保存過語言選擇的使用者維持原偏好，不在每次刷新時強制重置。
- 新增 Hindi (`hi`) 顯示語言層與 `hi-IN` 日期／數字格式，首頁、登入、分析表單、帳戶與共用核心 UI 使用 Hindi 文案；尚未完成專用術語 QA 的專門報告內容採英文 fallback，避免中文滲漏。
- Japanese、Korean、Hindi 繼續與八字計算語系隔離；排盤引擎仍只有 `zh-Hant / zh-Hans / en` 計算 locale，切換日／韓／Hindi 不改四柱、干支、真太陽時、大運、輸入資料或已保存命盤事實。
- 語言切換按鈕在手機端維持橫向可滑動，並提高按鈕高度與字級，降低 iPhone 上誤觸與難讀問題。

## 為什麼改
- 站主要求 English 放在語言選擇第一位、首次預設簡體中文，並依序提供繁體、日文、韓文與 Hindi；同時要求這些語言區塊可實際使用，而不只是增加一個沒有翻譯邏輯的按鈕。

## 影響範圍
- `src/lib/display-language.ts`：新增 Hindi 顯示層、簡中預設、語言持久化與 locale 格式。
- `src/components/site-shell.tsx`：調整語言排序、標籤、Hindi 共用導覽文案與手機觸控尺寸。
- `scripts/display-language-r102.test.mjs`：鎖定六語順序、簡中預設及計算隔離契約。
- `docs/I18N-JA-KO-STATUS.md`：同步記錄 Hindi 與最新語言契約。
- 不修改八字／R6 判法、Supabase schema、登入提供商、付款、命盤計算或其他產品功能。

## 回滾
- 將上述語言層與 selector 改動回退到 r100 即可；沒有資料庫 migration，也不需要修改既有使用者資料。

## 驗證
- `npm run test:engine` 必須通過，包括六語 selector、簡中預設與 display-language 計算隔離測試。
- `npm run build` 必須通過。
- `npm run test:iphone-safari` 應確認首頁語言列在 iPhone 寬度可滑動且無整頁水平溢出。
- Vercel Production 必須為 READY，且 production `githubCommitSha` 等於本次 `main` HEAD；正式站需實際確認 English 第一、無保存偏好的新會話預設簡中、Hindi 可切換後，才可標記 VERIFIED COMPLETE。
