# 昭梧更新報告｜ZW-WEB-2026.09.03-r32

## 本次改動

- 修復 iPhone / Safari 開場動畫「影片存在但畫面看起來不動」：保留已驗證的 `wutong-owner-r29.mp4`，在 metadata / canplay 時主動呼叫 `play()`，回到前景時再次嘗試播放；若瀏覽器仍拒絕影片播放，底圖本身以 2734ms 的柔和推近／上浮動勢維持可見動畫。
- 保留 loading 最遲 3 秒硬退出與 bootstrap 失敗立即放行，動畫仍只是裝飾，不得阻塞首頁、登入、帳戶或報告文字。
- 未合併 PR #196 的 r35 圖標與缺失媒體分片，避免把已知的無效 PNG / 不完整資產帶入正式站。
- `昭梧 · 觀世錄` 新增六組 2026-09-03 近期命理小開悟：六種心功、家人邊界與不妄為、止損與沉沒成本、知命不認命、財運與現金流秩序、五行動勢模型。
- 新文章全部標為 `OWNER_MATERIAL`：只用於公共文章／建議層，不改八字、紫微 Calculation Truth，不把象徵語言寫成客觀定律。
- 新增文章攝取契約與 loading 播放／可見運動契約測試。

## 為什麼改

正式站仍使用 r29 雙生並蒂蓮 MP4；先前 r32-r35 分支嘗試換新媒體與手機圖標，但多次 Preview 失敗，其中 r35 圖標重建產物並非有效 PNG，且新 dawn-lotus 媒體分片不完整。這次不再把壞分支逐項修補，而是在當前 Production 對應的 main 上做最小修復：讓既有有效媒體在 iPhone 自動播放限制下仍有可靠的可見動勢。

近期和 Stone 討論的修心／命理小開悟有一部分尚未形成獨立觀世錄條目。本次依 `docs/ANALYSIS-INGESTION-POLICY.md` 歸類為 OWNER_MATERIAL，只吸收到解釋與行動建議層，避免污染子平八字主判。

## 影響範圍

- 前端：`IntroGate` 與 `src/intro-extra.css`。
- 內容：`昭梧 · 觀世錄`，繁中／簡中／英文。
- 測試：intro loading、2026-09-03 owner-material intake、release ledger。
- 不改：四柱／節氣／真太陽時／子時換日計算、紫微計算、登入、支付、Supabase schema / 權限 / 環境變數、現有手機圖標檔案。

## 驗證

- 必須通過 `npm run build`（包含 `scripts/*.test.mjs`、Vite build、TypeScript）。
- Production 後確認 `githubCommitSha` 與 main 相同，首頁與開場媒體可讀，三語觀世錄載入。
- 真實 iPhone Safari 的實機「影片本身正在逐幀播放」若無實機證據，不得假稱已驗證；但即使影片播放被拒絕，CSS 動勢與 3 秒硬退出仍提供降級。

## 回滾

- 若動畫造成新的 iPhone 問題，回退 `src/components/intro-gate.tsx` 與 `src/intro-extra.css` 至 r31；文章檔可獨立保留。
- 若新文章表述不合適，只移除 `LIFE_VIEW_20260903_ARTICLES` 的入口，不觸碰命理計算核心。
- 本次不寫 Supabase；`release_history` 同步需另有明確授權。
