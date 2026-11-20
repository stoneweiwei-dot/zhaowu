# 昭梧更新報告｜ZW-WEB-2026.09.05-r42

日期：2026-09-05 AEST

## 本次改動
- 將開場雙生蓮正式鎖定為倉庫已提交的 `/intro/twin-lotus-restored-r26.mp4` 與 `/intro/twin-lotus-restored-r26.jpg`。
- 移除仍要求不存在 `loading-owner-r40.mp4`／舊分片寫入器的 intro regression contract。
- 保留現有 5 秒視覺節奏、bootstrap readiness 與 hard-exit 保護；裝飾動畫失敗不得阻塞網站。
- 發布台帳升級至 r42，避免 runtime change 與 release metadata 漂移。

## 為什麼改
雙生蓮 asset fix 已進入 main，但先前 production build 曾被遺漏的舊測試阻擋；其後測試雖已改到可通過，仍殘留對 r40 分片生成器的非 runtime 契約。本版正式清理 active contract，使測試、runtime 與已提交素材一致。

## 影響範圍
- `src/components/intro-gate.tsx`（前一提交已切換素材，本版完成正式發佈）
- `scripts/intro-motion-r33.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- `public/intro/twin-lotus-restored-r26.mp4`
- `public/intro/twin-lotus-restored-r26.jpg`

## 保護範圍
- Supabase Auth / OAuth
- 八字、紫微、七政、一掌經計算
- 報告生成與歷史
- 付款
- routing
- multilingual
- database schema / user data

## 回滾
回滾 r42 release commit，再回滾 `a6f7903b15bb45e6a7d7199cd141354cf6d3b85c` 與其雙生蓮 asset 切換提交，即可恢復 r41 production 行為；不涉及資料 migration。

## 驗證狀態
- GitHub：本報告隨 r42 修復 commit 一起提交。
- CI/build：提交後由 production build 執行完整 `npm run build`（engine tests → Vite → TypeScript）。
- Vercel：提交時待自動 production deployment；最終 deployment ID 與 commit 寫入 `public.release_history`。
- Production：提交時待 `/`、`/login`、`/quiz/six-realms` 與雙生蓮 `.mp4`／`.jpg` 驗證。
- Mobile Safari：自動測試契約保留；真實 iPhone 視覺仍為 `NOT VISUALLY VERIFIED`，除非有真機證據。
