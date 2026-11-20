# 昭梧更新報告｜ZW-WEB-2026.09.08-r81

## 本次改動

- Header 改為寬螢幕單列、手機雙列；會員入口不再於 390px 被隱藏。
- 左上識別改為清晰的梧桐樹向量標誌，不再使用縮小 app icon 或方框文字章。
- 「繁體／簡體／ENG」提高至手機 16px、48px 點按高度，選中態維持深色文字與明確朱砂底線。
- Loading 保留原始蓮花影片，並加入會實際播放的向量蓮花、呼吸光暈、漣漪與進度線備援。
- 六份命理專卷移除舊版點擊阻擋，全部改為真正連結；專項頁移除重複標題並統一閱讀層級。
- 重整首頁問事文案、字級、留白、表單、專卷目錄與輕測驗視覺。

## 為什麼改

正式站仍使用舊版視覺，而 STO-18 Preview 亦被多份歷史 CSS 覆寫：語言選中態變成淺底白字、R60 將報告入口設為不可點擊，390px 規則又隱藏會員入口。這些衝突必須從原規則移除，不能再靠新的 runtime 補丁遮蓋。

## 影響範圍

首頁、全站 Header、Loading gate、六份命理專卷入口與專項報告頁。八字計算、問答引擎、會員資料、付款、Supabase 儲存與命理算法均未變更。

## 保護範圍

本次只調整顧客可見的視覺、文案與導覽層。子平排盤、命理解讀規則、完整報告生成、登入權限、付款、歷史報告與 Supabase 資料結構均保持原有契約。

## 驗證狀態

- PR #268 已 squash merge；Production commit：`326008cb1a1ea258f28bc6b20f1238ebbcc887e3`。
- Deploy gate、Engine suite 均通過；iPhone Safari 29/29 通過。
- Vercel Production `dpl_ATJuRjv9ndi4Munb4AomDBk99eGi` 為 READY，正式網域指向同一 commit。
- 正式首頁已驗證 r81、Loading gate、梧桐標誌、三語選中對比與六條專卷入口，未見應用程式錯誤。

## 回滾

回滾本版本 commit，可恢復 r80 的 Header、Loading fallback、首頁目錄樣式與專項頁呈現；Supabase 的既有資料與音檔 bucket 不需回滾。
