# 昭梧十天干靈象｜2026-10-12 使用者定稿交接

## 站主核定方向
- **陽干**：甲、丙、戊、庚、壬；造型挺拔、有氣勢、硬朗灑脫；用輪廓、比例、重心與動勢區分，不是只換顏色。
- **陰干**：乙、丁、己、辛、癸；嬌小玲瓏、柔和圓潤、外觀纖弱但內有韌性，不用尖角與華麗裝甲。
- 兩組均使用中文＋英文；每個角色對應的天干字必須清晰且正確，站主要求角色額頭標識。
- 壬水是玄墨深藍、江海奔流；癸水是通透淺藍、雨露泉滴；其他八干遵循 `docs/STEM-VISUAL-SYMBOLISM-v1.0.md`。
- 宋式冊頁、米白宣紙、工筆淡彩、岩彩節制、大幅留白、角色形體清楚，不做遊戲海報、十宮格和浮誇裝飾。**青玉小龍仍是唯一網站助手**。
- 版面以 390px 手機寬度、繁中／簡中／英文為準；顯示文字由 HTML/CSS 控制，不把 AI 生成字形當作網站正式標題。
- 外部 Bazikawa 截圖僅為閱讀與情緒風格參考，禁止再製角色、上傳截圖或沿用對方排版／商標／水印。以 STONE 原創資產為準。

## 真實接入位置
目前主要路徑是 `src/routes/index.tsx` → `ResultView` → `FocusedReportSections`。本次在該正式路徑的第 02 段「命書圖解」內，於敘事場景前插入 **DayStemPortrait**，日主圖片從 `AnalysisResult.chart` 統一結果經 `buildReportVisualModel` 取得，只顯示一位日主。文字與八字主判不可由圖片反向決定。

沒有新增首頁漫畫入口、不更換首頁背景、不啟動 legacy Comic Lite、不另建後端或圖片生成服務、不改支付／授權邏輯。另一個既有 `ReportVisualBook` 位於第 04 段展開的判斷備註，維持不變。

## 本次程式接線與素材交接的區別
已接好：十天干映射、主報告條件式顯示、中英文名稱、原圖載入失敗備援、宋式簡約容器；沿用現有 `public/report-visuals/full/` 的十天干母圖，避免新增網絡成本。

**尚未完成：使用者在本次對話最後確認的新版「陰／陽角色」原始檔，尚未作為十張獨立的壓縮公開資產寫入 GitHub。** 當前可用附件包含第三方網站截圖和部分較早的五行瑞獸畫稿，不能推定它們就是最後核准的十幅；因此不能冒充「定稿圖片已上線」。

替換時將十個獲核對的原創角色輸出至 `public/report-visuals/characters/`，以 `jia-wood.webp`、`yi-wood.webp`、`bing-fire.webp`、`ding-fire.webp`、`wu-earth.webp`、`ji-earth.webp`、`geng-metal.webp`、`xin-metal.webp`、`ren-water.webp`、`gui-water.webp` 命名，分別進行陰陽差異與額頭文字 QA；上傳後才切換圖像路徑，禁止空路徑造成 404。若有分層透明角色圖，另保存作編輯母檔，但正式載入以 WebP 小尺寸優先。

## 核對和發佈
- 先驗證 ten-stem map、fallback、三語文案、目前主路徑有載入，且沒有動命理結果。
- 新圖交付後逐張核對原創性、額頭字、陽剛／陰柔形態、壬癸水差異和 390px 可讀性。
- 遵守唯一 Production：僅 `main` → `stone-zhaowu-official`，這一批次先 PR 審核；避免分支預覽和多次部署，不為此開啟 Safari/Visual Regression 強制 CI。
