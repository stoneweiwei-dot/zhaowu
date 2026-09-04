# 昭梧更新報告｜ZW-WEB-2026.09.05-r45

日期：2026-09-05 AEST

## 本次改動
- 修正 Loading 雙蓮動畫在 Supabase readiness 暫時回傳 503、網路失敗或啟動檢查拋錯時被立即移除的問題。
- 啟動檢查維持 fail-open：錯誤不阻塞首頁、登入或會員頁，但不再因此直接抹掉正在播放的 Loading；正常影片依既有流程播放，最遲仍由 5.3 秒硬退出保護放行。
- iPhone Safari regression 移除「readiness 失敗＝立即隱藏 Loading」的舊契約，改為要求 Loading 至少具有可感知的顯示時間，同時保證最遲硬退出。
- 沿用既有 `/intro/twin-lotus-restored-r26.mp4` 與 `.jpg`，不重做素材、不另開 Loading 系統。

## 為什麼改
r44 雖然已掛載 Loading 元件與雙蓮影片，但 `runBootstrapReadiness()` 只要拋錯，`IntroGate` 就直接 `forceOff()`。因此部分裝置或瞬時 API 錯誤下，Loading 會快到使用者完全看不到；而既有 Safari 測試還把這個行為鎖成正確契約。

## 影響範圍
- `src/components/intro-gate.tsx`
- `e2e/loading-gate.iphone-safari.spec.ts`
- `src/lib/site-stats.ts`
- release ledger / change report

## 保護範圍
本版不修改：
- 八字、紫微、七政、一掌經等排盤／推理計算
- Supabase schema、使用者資料與既有報告
- Auth / OAuth / 登入權限
- 付款
- 報告內容與母圖 mapping
- routing / multilingual / report history

## 回滾
回滾 r45 commit 即可恢復 r44 啟動 gate 行為；不需要資料庫回滾。

## 驗證狀態
- GitHub / CI / Vercel / Production：以合併後 exact commit 與 Production deployment 為準。
- iPhone Safari：自動 regression 必須 PASS；真實 iPhone 視覺在沒有真機證據前仍標為 `NOT VISUALLY VERIFIED`。
