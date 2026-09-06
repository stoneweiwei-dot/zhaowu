# 昭梧更新報告｜ZW-WEB-2026.09.06-r59

日期：2026-09-06 AEST

## 本次改動

- 正式啟用站主確認的翡翠金蓮＋朱印「昭梧」透明 Logo，取代 Header 舊方形文字印章。
- 正式啟用亮版祥雲翡翠金蓮作為 iPhone Apple Touch Icon、PWA 180/192/512 圖標與 favicon。
- 「把昭梧存到手機桌面」引導改為預覽真正會保存到主畫面的 r59 圖標，不再顯示舊 lotus emblem。
- Manifest、HTML metadata、Service Worker shell cache 全部切到 r59 圖標路徑。
- 四個正式 PNG 保存在 Supabase Production 公共資產桶 `zhaowu-backgrounds/brand/r59/`；Vercel 以同源 rewrite 提供 `/brand/...`、`/apple-touch-icon-r59.png` 與 `/icons/...`，避免第三方臨時外鏈成為正式依賴。

## 為什麼改

舊 Production 仍以 `/apple-touch-icon-r53.png` 與舊文字印章作品牌入口，與站主最後確認的翡翠金蓮視覺不一致；手機保存引導本身也仍顯示另一枚舊蓮花 emblem。這次把品牌 Logo、favicon、Apple/PWA 圖標與安裝預覽收斂為同一套正式資產，並使用新的 r59 URL 避免舊 PWA/Service Worker 快取持續命中 r53。

## 影響範圍

- `src/components/brand-seal.tsx`
- `src/components/home-screen-install-prompt.tsx`
- `index.html`
- `public/manifest.webmanifest`
- `public/sw.js`
- `vercel.json`
- Home Screen / PWA / favicon 相關回歸測試
- `src/lib/site-stats.ts` 與 release ledger
- Supabase Storage：`zhaowu-backgrounds/brand/r59/*`

## 保護範圍

未修改八字／紫微／七政／一掌經計算、完整報告內容與流程、登入與權限、付款、使用者資料、報告歷史、Supabase schema、背景音樂資料與其他 Production 路由。

## 回滾

若 r59 品牌資產造成未知回歸，可回滾本次 GitHub merge commit，使 Header、Manifest、Apple/PWA metadata 與 Service Worker 回到 r58；Supabase `brand/r59/` 四個靜態物件可保留作審計，不需刪除資料。不得以失敗的舊 PR 或另一條 Production 主線替代回滾。

## 驗證狀態

- Supabase 四個 r59 Production PNG：PASS，已確認物件存在、MIME 為 `image/png` 且大小符合來源檔。
- GitHub 靜態契約／TypeScript／Production build：待 PR CI。
- Vercel Production exact SHA：待合併後驗證。
- `/`、`/manifest.webmanifest`、r59 Logo／Apple Touch Icon／192／512 圖標：待 Production 後逐項驗證。
- iPhone 真機「加入主畫面」最終 OS 動作：網站端路徑與引導可自動驗證；iOS 系統桌面實際新增仍需真機操作確認。
