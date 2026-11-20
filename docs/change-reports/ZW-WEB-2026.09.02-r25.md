# 昭梧更新報告｜ZW-WEB-2026.09.02-r25

## 本次改動

依站主要求，首頁與登入頁的背景接線及樣式恢復到 r23：固定使用 `/wallpaper-song.jpg`，停止把後台圖鑑海報作為全站背景。

## 為什麼改

r24 恢復每日輪播後，帶有大字的神像圖覆蓋原有宋畫山水，與頁面標題重疊。站主明確要求恢復上一版本。

## 影響範圍

只還原 `site-shell.tsx`、`home-sheet-ui-v5.css` 的 r24 背景改動，並同步相關契約與本次版本紀錄。

保留 r23 註冊回調修復、r24 背景上傳與歷史分頁、QA 記錄隔離與報告卡操作。排盤、報告、付款、權限與資料庫均不變。

登入動畫更早已更換，本次未任意選取另一段動畫；站主想恢復的確切動畫仍待辨認，不能將整個還原要求標記完成。

## 回滾

對本次提交作正常 revert 即可恢復 r24 背景接線；無資料庫 migration。

## 驗證狀態

完整 engine/contract 測試 334/334 PASS；TypeScript PASS；Vite production build PASS。此環境阻止 tsx CLI 的 IPC socket，測試使用不開 socket 的 `node --import tsx --test scripts/*.test.mjs` 執行相同測試集合。

發布後核對正式站首頁、登入頁、背景資產及版本。部署與實際驗收結果記入 release_history；本文件不宣稱動畫已還原。
