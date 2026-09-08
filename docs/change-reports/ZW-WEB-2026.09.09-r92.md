# 昭梧更新報告｜ZW-WEB-2026.09.09-r92

## 本次改動
- 《觀世錄》新增三語長文〈十天干與身體象義：如何看先天體質與時間觸發〉。
- 文章整理十天干與臟腑、五行形體官竅、原局強弱、生剋連鎖、大運／流年／流月／流日引動與「病藥」比喻。
- 公開文案把相關內容明確限制為傳統象義，不作現代醫學診斷、疾病預測或治療建議。
- 《觀世錄》文章渲染新增可選的內文插圖能力；沒有插圖的既有文章不受影響，圖片失敗也不阻塞正文。
- 新文加入 4 張 9:16、無文字的宋式抽象插圖，分別對應五行循環、身體象義、時間層級與太過／不及的平衡。
- 新增 `scripts/bazi-health-article.test.mjs`，固定三語、醫療邊界、四張插圖與正文獨立交付契約。

## 為什麼改
站主要求後續直接把新文章加入昭梧，並自動依文章內容配置多張適合內文穿插的小插圖，而不是只生成一張大圖或把文章文字做成海報。本次同時把這個能力落到《觀世錄》的可重用渲染層。

## 影響範圍
- `src/components/life-view-home-section.tsx`
- `src/lib/life-view-long-form/bazi-health-symbolism.ts`
- `public/articles/bazi-health-*.svg`
- `scripts/bazi-health-article.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`

不改動：八字排盤核心、正式取用／喜用算法、健康診斷邏輯、登入／帳戶、支付、Supabase schema／權限／資料、報告儲存與既有客戶資料。

## 驗證狀態
提交前：待 CI / Vercel Production 驗證。

要求驗收：
1. 新文三語可展開閱讀。
2. 四張插圖均可載入，且沒有圖片文字亂碼。
3. 圖片載入失敗時正文仍完整可讀。
4. `npm run build` 與相關 contract tests 通過。
5. Production `githubCommitSha` 必須等於 `main` HEAD。

## 回滾
若新文章或插圖渲染造成回歸，回滾本次單一 r92 commit 即可；不需要改資料庫或回滾任何 Supabase 資料。
