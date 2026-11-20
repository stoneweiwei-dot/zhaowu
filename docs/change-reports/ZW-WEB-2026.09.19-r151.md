# 昭梧更新報告｜ZW-WEB-2026.09.19-r151

## 本次改動

- 站主後台採任務優先資訊架構，技術診斷預設收起，登入與 Loading 素材分離。
- 登入素材只保留「站主蓮開」與「站主飛升」兩組正式視覺。
- 移除未引用的舊 loading v11、損壞的 loading-user、v13 重建分片、舊海報／監控圖／雙蓮素材、未完成 loading pack 與兩個舊生成器。

## 為什麼改

後台不應展示工程監控圖、網站小元件或未完成素材；失效的歷史分片亦不應持續進入建置來源與 Production 包。

## 影響範圍

- `/account` 站主管理資訊架構與登入素材管理。
- `/login` 只讀取兩組白名單素材。
- Vite 建置不再重建沒有 runtime 消費者的歷史 loading 檔。

## 受保護範圍

- 首頁 r148 開場影片與海報保持不變。
- 不修改八字／命理引擎、報告、付款、權限、Supabase schema／資料或 Floot 媒體。
- 原始素材刪除僅限已證明無 runtime、build 或測試依賴的倉庫檔案。

## 驗證狀態

- Engine suite、Deploy gate、TypeScript build 與 iPhone Safari 在合併前執行。
- 合併後以 Vercel Production SHA、`/`、`/login`、`/account` 與保留媒體 URL 驗證。

## 回滾

回退 r151 清理提交即可恢復舊 catalog、生成器與歷史檔案；不需要資料庫 migration。
