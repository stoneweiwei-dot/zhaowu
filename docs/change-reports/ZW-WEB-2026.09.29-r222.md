# 昭梧更新報告｜ZW-WEB-2026.09.29-r222

## 本次改動

- `src/zhaowu-design-system.css`：刪除 r221 區塊，改為 r222「首頁單一紙面系統」區塊。所有規則以 `html body .zhaowu-home-sheet-shell main.zhaowu-home-layout` 為前綴（五行穿衣再加 `#five-element-wardrobe`），確保在首頁實際生效。
- `src/components/daily-almanac-widget.tsx`：今日分頁按鈕改用短標籤（黃曆／穿衣／靈籤；英文 Almanac／Dress／Spirit slip），完整名稱保留為 `aria-label` 與頁內標題。
- `src/lib/site-stats.ts`、`lib/zhaowu-verification.js`：版本同步為 `ZW-WEB-2026.09.29-r222`。

## 為什麼改

站主回報 r221 上線後首頁「看不到變化」。以 GitHub Actions 對正式站截圖並輸出計算樣式後確認：

1. r221 的規則被舊層壓過：`five-element-wardrobe-r100.css` 使用 `#five-element-wardrobe` ID 選擇器，`daily-almanac-r69.css` 使用三層 class 選擇器，特異性都高於 r221 的單層 class 規則，因此 r221 幾乎沒有到達畫面。
2. 實際畫面問題：英雄標題被框住且有一條金線穿過標題；「今日」內為四層邊框卡中卡；分頁標籤換行（「每日穿衣｜五行／色彩」），頁內標題斷成「色／彩」；五色狀態卡片在手機上擠成直排並橫向捲動。
3. 夜間：「近日天象」標題為淺字配淺底（看不見）；延伸內容兩張卡為灰底淺字；頁面同時出現深綠、近黑、深藍三種底色；加入主畫面提示在夜間標題不可讀。

## 設計依據

`docs/ZHAOWU-SONG-AESTHETIC-FRAMEWORK.md` 第 4 條（避免層層浮框）、第 6 條（1px 細線、6–12px 低圓角、極弱紙面陰影）、第 8 條（夜間為墨色環境；今日與延伸內容為深松綠承載面配月白字；生辰表單暖紙維持深墨字）。

## 影響範圍

- 僅 `/` 首頁：英雄標題、今日指引（黃曆／穿衣／天象）、生辰表單外框圓角與陰影、延伸內容、加入主畫面提示。
- `/daily-colors` 獨立頁不受影響（規則限定 `main.zhaowu-home-layout` 內的 `[data-daily-colors="embed"]`）。

## 受保護範圍

- 不改命盤計算、報告生成、auth／payment、Supabase、路由。
- 不改 DOM 結構；唯一元件改動是分頁按鈕顯示文字。

## 驗證

- 本地 `node --import tsx --test scripts/*.test.mjs`：791 pass，3 fail 為本環境無法安裝 npm 依賴造成的既有失敗（與 main 基線相同）。
- 以臨時 visual-audit 分支（不觸發 Vercel）在 GitHub Actions 建置並截圖 iPhone 390px 日／夜與桌面 1440px，逐輪修正至：分頁單行、標題不斷字、五色清單正確、夜間所有文字可讀。
- 合併前需 Production CI 三項（Deploy gate、Engine suite、iPhone Safari）全綠；合併後核對 Vercel Production SHA 並對正式站截圖。

## 回滾

`git revert` 本次 commit 即可還原（純樣式與顯示文字，無資料變更）。
