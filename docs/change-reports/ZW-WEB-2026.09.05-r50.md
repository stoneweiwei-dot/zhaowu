# 昭梧更新報告｜ZW-WEB-2026.09.05-r50

## 本次改動

- 前世今生報告的客戶前台不再顯示 `D60`／`SHASHTIAMSA` 技術名，統一改為「印度古法占星」；英文改為 `Indian Classical Astrology`。
- 首頁「四門分觀」的前世今生說明同步由「D60 旁證」改為「印度古法占星旁證」。
- 出生資料表單的精度確認、出生地提示、未知時間提示同步改用「印度古法占星」，避免同一功能在不同位置出現兩套名稱。
- 「核心慣性、情緒慣性、反覆責任、帶得走的資源、關係價值」五個結果全部改為可點擊展開的 disclosure card。
- 每張結果卡保留原本星座與關鍵詞，新增「點開看白話解釋」；展開後先說明該欄位在看什麼，再用白話解釋該星座在這個欄位的常見表現、優勢與壓力下的注意點。
- 同一時間只展開一張結果卡；按同一張可收起，按另一張會切換，避免手機頁面一次拉得過長。
- 白話解釋同時保存到本機的前世今生歷史報告，不只停留在當次畫面。

## 為什麼改

站主確認現有卡片排版本身可以保留，但 `D60` 對一般使用者過度技術化，且五個結果目前只列「欄位＋星座＋關鍵詞」，使用者無法直接理解這個結果在生活中代表什麼。因此本版只調整前台命名與資訊展開層，不重做已批准的米白卡片視覺，也不改動底層印度細分算法。

## 影響範圍

- `src/components/d60-karma-section.tsx`：前台命名、五張可展開白話卡、歷史保存內容。
- `src/components/palm-standalone.tsx`：出生資料表單中的客戶可見命名與提示。
- `src/routes/index.tsx`：四門分觀的前世今生入口說明。
- 相關 source-contract tests 與 release ledger。

## 保護範圍

未修改：印度細分計算公式、Lahiri ayanamsa、上升點計算、±2 分鐘敏感度測試、當次出生資料事件、出生地／時區換算、一掌經 `buildPalm` 核心算法、登入、付款、Supabase 使用者資料、其他八字／紫微／七政引擎、首頁主問事流程、背景音樂與其他路由。

## 驗證狀態

- 本地 source-contract tests：8/8 PASS，覆蓋「不再顯示舊 D60 前台名稱」、「五張卡都有白話展開」、「當次出生資料契約不退回帳戶舊資料」。
- TypeScript 單檔語法檢查：修改後 TSX 無語法錯誤；本地 scratch 環境因未安裝專案依賴只回報 module resolution，不作正式 build 結論。
- GitHub／Vercel：本版本採單一原子 commit 推 `main`，只觸發一次 Production build；正式 build 必須 PASS 且 Production `githubCommitSha` 必須等於 main SHA 才算完成。
- 正式站 `/yizhangjing`：部署後核對 HTTP 200 與新版 bundle；實體 iPhone Safari 的點擊展開視覺若本工具無法直接操作，明確標為未做肉眼實機驗證。

## 回滾

回復 `src/components/d60-karma-section.tsx`、`src/components/palm-standalone.tsx`、`src/routes/index.tsx`、兩個 D60 contract tests、`src/lib/site-stats.ts` 與 release-ledger test 到 r49／其後最新可用版本；刪除本 r50 change report。回滾不涉及資料庫 schema 或命理引擎資料。
