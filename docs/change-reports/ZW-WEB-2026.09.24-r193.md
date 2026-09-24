# 昭梧更新報告｜ZW-WEB-2026.09.24-r193

## 本次改動

- 修正英文夜間模式的頂部語言與日／夜切換：移除舊首頁規則殘留的半透明淺色底，回到深色 Header 上的高對比文字。
- 修正英文夜間模式「今日指引」「心境小測」「觀世錄」等延伸入口的主／次文字色。
- 修正夜間暖紙內容面「第二步」段落標題過淺的問題。
- 新增 r193 CSS 順序與選擇器回歸測試，避免舊英文或首頁規則再次壓過夜間樣式。

## 為什麼改

r192 已正確合併並上線，但正式站瀏覽器驗收發現三組 CSS 權重衝突：舊首頁 `[role=group]` 淺底規則覆蓋夜間 Header；英文專用文字色覆蓋夜間延伸入口；舊夜間標題色落在現行暖紙內容面後對比不足。這些問題不影響功能，但會直接降低閱讀與操作辨識度。

## 影響範圍

- 首頁英文夜間模式 Header。
- 首頁英文夜間模式延伸入口。
- 首頁夜間模式第二步標題。
- 公開版本與 release ledger 更新至 r193。

## 受保護範圍

本版只修改 CSS 與 release metadata，不修改：

- 四柱、真太陽時、子時換日、命理 runtime 或報告內容。
- `/login` 動畫、15 秒限制、站主登入與權限。
- Supabase Auth、Database、Storage 物件或寫入凍結。
- 付款、報告保存、PWA、播放器或青玉小龍互動。
- Netlify archive 狀態與 Vercel 單一 Production 政策。

## 驗證狀態

合併前必須通過：

- r193 night contrast contract。
- Deploy gate / release ledger。
- Engine suite。
- TypeScript / Vite build。
- 現有 iPhone Safari CI。

合併後必須：

- Vercel Production SHA = current main SHA。
- Production `/` 切換 English + Night，核對 Header、延伸入口與第二步標題。
- Production `/login` smoke，確認 r192 動畫一次性播放與 44px 喇叭控制未回歸。
- Production runtime error scan。

真 iPhone Safari 人工觀感未由實機完成時，仍標為未人工真機驗證。

## 回滾

可單獨回滾 r193 的三組 CSS override 與 release metadata；不涉及資料 migration、Storage 刪除或內容重算。
