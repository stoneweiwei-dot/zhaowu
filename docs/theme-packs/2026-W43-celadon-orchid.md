# 昭梧｜2026-W43 宋式皮膚包：蘭汀青瓷

> **狀態：DESIGN PACKAGE / NOT REGISTERED / NOT DEPLOYED / NOT PUBLISHED.** 本包為可執行的美術與程式規格，不是已完成的圖像、真實首頁截圖或 Production 發佈。唯一來源 `stoneweiwei-dot/zhaowu/main`；唯一 Vercel Production `stone-zhaowu-official`。

## 0. 基線與重複檢查（2026-10-20）

- 開工 main：`42bc21c5e4b0b941f327c08fcfd88c325d83c136`；Vercel 最新 READY Production 同 SHA（deployment `dpl_6kJef3PZJgkMcwznr3hoHyy93P3K`）。
- `src/lib/theme-skins.ts` 已有 **25** 套；第 25 套 `song-gallery-frostleaf`（霜葉照溪）已在 main。站主共用設定 `owner-music:public/site/active-skin.json` 記錄 `song-gallery-frostleaf`，更新時間 2026-10-19T11:53:56.032Z。這是儲存的已選主題，不等於本次完成新的實機截圖。
- 未在 `docs/`、Instruction Registry 或可查的既往記錄找到可核驗的**12 週逐週題名表**。因此不冒稱「蘭汀青瓷」是既定第幾週；本週以 W43 暫定新題名，待原表可查時按原表校正。已避開霜葉、荷舟、龍、雨竹、錦鯉等既有主題主意象。
- 視覺權威：`docs/ZHAOWU-SONG-AESTHETIC-FRAMEWORK.md`；產品/權限：`AGENTS.md`、`docs/CURRENT-STATE.md`、`docs/INSTRUCTION-REGISTRY.md`。
- 現有後台 `OwnerThemeSkinsManager` 由 `SKINS` 驅動；全站發佈需要 `lib/owner-site-skin-public.js` 同步白名單。共用選擇寫入 owner-music 分支的設定檔，需站主有效 cookie 與同源 POST；**不得以改 CSS 假稱已上架**。
- 此次**不修改**上述 registry/白名單/資料庫/付款/登入/排盤，也不觸發 Vercel Preview 或 Production。

## 1. 美術方向｜蘭汀青瓷 / Celadon Orchid Shoal

與霜葉照溪的秋葉敘事不同，本款以**汀蘭、青瓷釉光、春水淺灣、遠岸一亭**為識別。宋式編輯留白作骨架；絹本纖維、石青石綠薄罩染、細墨線與少量礦物淡金作層次。暖紙正文絕不直接壓在風景上。禁止黑底、濕霧糊面、光粒、厚金框、遊戲卡片、假書法、女性粉萌風。

**全站色票（CSS 來源）**

| 用途 | 值 | 使用界線 |
| --- | --- | --- |
| 暖宣紙 page | `#F7F3EA` | 頁面與閱讀留白 |
| 紙絹 surface | `#FAF7EF` | 不透明連續閱讀面 |
| 主墨 ink | `#243C36` | 正文與標題 |
| 次墨 soft | `#53645C` | 輔助正文，仍需 ≥4.5:1 |
| 深松綠 action | `#315E50` | 主要按鈕、焦點 |
| 青瓷 celadon | `#8DAFA6` | 畫面與裝飾，不作小字色 |
| 天青 lake | `#91B7BC` | 局部水光，不作正文色 |
| 礦金 gold | `#A99570` | 1px 細線／章節節點，不作小字色 |
| 朱砂 seal | `#9B4438` | 警示與必要標記 |
| 夜色環境 | `#1C342F` | 夜間**背景**；正文仍暖紙深墨 |

字體由程式選擇：中文標題 `Noto Serif TC → Songti TC/SC → serif`，英文 `Iowan Old Style → Baskerville → Georgia`；正文維持網站原有可讀字族，不在圖片生成字。390px 主標題 26–30px、正文 ≥16px、行高 ≥1.65；操作 ≥44px；邊框 1px、圓角 6–10px、無玻璃與卡牆。閱讀面最大 560px。夜間不把暖紙文字反白。

## 2. 素材清單與生成指令（**未生成；待真實授權素材**）

統一負面詞：`no text, no calligraphy, no glyphs, no logo, no watermark, no UI, no cards, no phone mockup, no neon, no particles, no game poster, no black background, no full-image blur, no photorealistic CGI`。所有畫作先輸出無字原畫；「STONE 原創」以圖像後處理**單獨加章**，不能交給模型生成偽字；不可覆蓋文字區。不得複製他人水印或現成參考圖。

| 檔名（目標 WebP） | 尺寸 | 構圖與用途 |
| --- | --- | --- |
| `song-celadon-orchid-art.webp` | 1080×1920, 9:16 | 首頁主畫：右下三株汀蘭、左下青瓷淺水、遠岸單亭，左上 55% 淡暖天空留白；遠山石綠罩染；焦點 `52% 60%`。 |
| `song-celadon-orchid-alt-rain.webp` | 1080×1920 | 備選 A：雨後蘭汀，水線由左下引向遠亭；焦點 `48% 56%`，主題與主畫不同取景。 |
| `song-celadon-orchid-alt-dawn.webp` | 1080×1920 | 備選 B：曉光映青瓷釉色，一葉小舟極小，蘭葉右緣收勢；焦點 `56% 54%`。 |
| `song-celadon-orchid-today.webp` | 960×640 | 今日指引：淺水漣漪＋蘭葉影，右上可裁切。 |
| `song-celadon-orchid-reading.webp` | 960×640 | 深度解讀：石青層巒與一道細金山脊。 |
| `song-celadon-orchid-report.webp` | 960×720 | 命書：絹紙卷首遠山，中央清空供 DOM 正文。 |
| `song-celadon-orchid-login.webp` | 720×960 | 登入：一只青瓷瓶與蘭枝，偏右構圖。 |
| `song-celadon-orchid-account.webp` | 720×960 | 帳戶：卷冊、淺水與紙邊陰影，無假文字。 |
| `song-celadon-orchid-oracle.webp` | 960×720 | 靈籤：素竹籤筒與蘭葉，籤面**完全無字**。 |
| `song-celadon-orchid-loading.svg` | 96×96 | 細水環、三筆蘭葉，CSS opacity/translate 微動。 |
| `song-celadon-orchid-empty.svg` | 192×192 | 留白小卷與淡青水紋，空狀態 DOM 文案獨立。 |
| `song-celadon-orchid-icons.svg` | sprite | 章節線／細山／蘭葉／水紋四款線性圖標；只用 SVG 路徑。 |

**主畫完整 prompt**：`An original Northern Song-inspired silk-and-xuan-paper landscape painting, celadon orchid shoal beside a quiet spring inlet, three elegant wild orchid stalks anchored in the lower right, a tiny waterside pavilion far in the distance, thin mineral malachite and azurite pigment washes, crisp fine ink contours, subtle translucent celadon-glaze reflection across the lower left water, warm ivory negative space occupying the upper half, graceful asymmetrical vertical 9:16 composition, painterly handmade layering, clear subject silhouettes, refined restrained pale-gold line only along one distant ridge, no text, no UI, no characters, no lettering, no black background, no haze filter, no glow, no particles, no fantasy game art.`

**備選 A prompt**：`Original Northern Song ink-and-mineral-pigment painting of a rain-cleared orchid shoal, a narrow winding stream beginning in the lower left and receding toward a distant pavilion, wet stone texture with crisp brushwork, wild orchid leaves along the lower right bank, subdued celadon and pale lake-blue mineral tones, luminous ivory silk ground, generous upper negative space, vertical 9:16, no text or UI, no digital blur or cinematic effects.`

**備選 B prompt**：`Original Northern Song-inspired dawn waterscape on warm xuan paper, a small celadon porcelain vessel reflecting early light beside orchid leaves on the right edge, a tiny boat far across a clear inlet, mineral azurite, malachite and soft ivory layers, meticulous fine-ink contour, subtle gold hairline, airy asymmetrical vertical 9:16, no text, no UI, no synthetic CGI, no foggy filter, no neon.`

**分區 prompt 基礎**：以主畫的紙絹、色票、筆觸為共同 seed/reference；只替換「今日＝水紋蘭影」「深度＝山脊」「命書＝卷首」「登入＝瓷瓶」「帳戶＝卷冊」「靈籤＝素竹籤筒」，全部無文字與 UI。不得把同一畫面硬裁成所有區塊；保留各區塊可辨識的構圖差異。

**後處理與性能**：優先由原畫轉 sRGB WebP，主畫 `quality 82–86`、≤350 KB；分區圖 ≤180 KB；首屏不 lazy，其他 lazy；保持原畫可回退。用 `sharp` 或 Pillow 對 WebP 做像素、色域與尺寸檢查，壓縮後以 390px 實機核對；不可將未生成檔案登記入 SKINS。

## 3. 全站落點（使用現有 CSS/React，不重建）

1. **首頁**：保留 `SiteShell` 已選 wallpaper 優先權與既有 Hero 輪播；畫作只進 `SKINS.hero`／畫冊展示，**不覆蓋站主 wallpaper**。9:16 主畫的圖片層不得含按鈕、字體、文案。
2. **今日指引**：`#daily-almanac` 內黃曆、五行穿衣、靈籤三段垂直；只用淡青分隔與局部紙絹；色票本身保留真實顏色。
3. **深度解讀**：沿用既有專項 sheet 與付費邊界，插畫在卷首，正文一紙承文。
4. **命書／報告**：`.zhaowu-report-continuous-sheet`、`.zhaowu-specialist-sheet` 與封面共享紙面，不能有內外兩層卡框。
5. **登入／帳戶**：`/login`、`/account` 保留既有表單、站主權限與 44px 操作；只替換視覺 token 和局部插圖。
6. **靈籤**：保留現有真籤文、遮罩、鍵盤關閉與內容來源；只改空白卷首／籤筒圖，不能生成假的籤文。
7. **Loading／空狀態**：SVG 細線＋現有 DOM 文案，尊重 reduced-motion；圖片失敗回退暖紙與純文字。
8. **按鈕／圖標**：按鈕文字與尺寸由 React/CSS 控制，青綠實色主操作；次操作細線下劃；圖標為單色 SVG，不能將整頁 UI 烘焙到圖像。
9. **繁／簡／英**：名稱「蘭汀青瓷／兰汀青瓷／Celadon Orchid Shoal」；英文 320px 可換行，三語都不使用 AI 圖中文字。

## 4. 三條原創短句（非古籍引文）

- 繁：**山不言遠，水自成行。**｜簡：**山不言远，水自成行。**｜英：**Mountains keep their distance; water finds a way.**
- 繁：**一寸清光，留與未言。**｜簡：**一寸清光，留与未言。**｜英：**A little light for what remains unsaid.**
- 繁：**蘭生水畔，風過無聲。**｜簡：**兰生水畔，风过无声。**｜英：**Orchids by the water; the wind passes quietly.**

短句只可在 Hero 題跋、報告卷首、空狀態擇一使用，不堆滿全站；不替代真實結果或操作標籤。

## 5. 完成／發布門檻（本包尚未達成）

- [x] 讀取現行審美權威、後台 SKINS 實作、server 白名單、main 與 Vercel 最新 deployment；確認 25 套與霜葉重複風險。
- [x] 完整設計、色票、三語、三句、分區素材規格與提示詞；獨立 CSS 草案、靜態概念預覽。
- [ ] 取得 3 張**真實**主視覺＋6 張分區圖、優化 WebP、核驗來源與授權、生成真正 DOM 截圖。
- [ ] 先確認 12 週權威輪替表，再確定本週題名；本候選可因輪替表而改名或撤回。
- [ ] 將實際 WebP 加入 `public/theme-skins/`；再同步 `SKINS`、`src/theme-skins.css`、`src/theme-skins-full.css`、`lib/owner-site-skin-public.js`，更新現有硬編碼 25 套測試，避免只加後台或只改 CSS。
- [ ] `npm run test:themes`、`npm run check`、`npm run build`，以及主題相關 PR 既有 Theme acceptance（390px／430px、繁簡英、日夜、圖片失效、焦點與 44px）。
- [ ] 確認站主可用權限、唯一 Production 版本、回退目標 `song-gallery-frostleaf`；**只在全部門檻通過後**合併 main → 一次部署 → 核對 `release.json` 與 alias → 再由站主既有 `site-skin.publish` 選用。
- [ ] 無 owner session 的情況下不能宣稱已在後台「全站套用」。本包不觸碰 Supabase schema、資料或密鑰。

**下次輪替提案（非既定已核實題名）**：2026-W44／10 月 27 日「茶嶺初霽 / Tea Ridge After Rain」，以茶山層畦與暖日石青為主，避開蘭汀及霜葉。
