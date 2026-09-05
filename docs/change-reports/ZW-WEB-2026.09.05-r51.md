# 昭梧更新報告｜ZW-WEB-2026.09.05-r51

日期：2026-09-05 AEST

## 本次改動

- 修正 Loading 雙蓮動畫在 `runBootstrapReadiness()` 遇到 503、網路失敗或啟動檢查拋錯時被立刻 `forceOff()` 的問題。
- 啟動檢查維持 fail-open：不阻塞首頁、登入或會員頁；錯誤改為標記 runtime ready，讓雙蓮仍可播完或走完最短可見時間。
- 硬退出仍為 5.3 秒，對齊現行 5 秒雙蓮開花契約。
- reduced-motion 靜帧改用已上線的 `/intro/twin-lotus-restored-r26.jpg`，不再指向尚未上線的 r40 路徑。
- 以本版 commit 推 `main`，讓 Vercel Production 同步已在 GitHub 的 r50 + r51。

## 為什麼改

Production 之前停在 r50 之前的 commit；同時 Loading 在啟動檢查失敗時會被立刻關掉，用戶看不到雙蓮。本版只改啟動 gate 與發佈領，不改排盤。

## 影響範圍

- `src/components/intro-gate.tsx`
- `src/intro-extra.css`
- `e2e/loading-gate.iphone-safari.spec.ts`
- `scripts/intro-loading.test.mjs`
- `src/lib/site-stats.ts`
- release ledger / change report
- `docs/CURRENT-STATE.md` Loading 現況

## 保護範圍

未修改：八字／紫微／七政／一掌經計算、auth、payment、Supabase schema、報告結構、母圖 mapping、PWA 圖標二進制檔、三語、路由。

## 回滾

回滾本 r51 commit 即可恢復 r50 啟動 gate；不需要資料庫回滾。

## 驗證狀態

- GitHub / CI / Vercel / Production：以合併後 exact commit 與 Production deployment 為準。
- iPhone Safari Loading regression 必須 PASS。真機視覺標為 `NOT VISUALLY VERIFIED`。
