# 昭梧更新報告｜ZW-WEB-2026.09.28-r216

**發佈日期:** 2026-09-28 13:10 UTC+10
**累計更新:** 216

---

## 本次改動

站主提供 4 張正式環境夜間模式截圖，回報「介面越做越爛、字看不清楚」。逐一比對截圖與 `src/zhaowu-design-system.css` 原始碼後，定位並修復 3 個各自獨立的夜間模式對比度／版面錯誤，全數為**純 CSS 新增規則，未變更任何既有選擇器的原值、未觸碰 `:root` 的 `--zw-ink` / `--zw-ink-soft` / `--zw-muted`**（r184/r185 受保護合約維持不變）。

### 1. 首頁「今日」小工具（黃曆卡片）夜間文字消失

`.zhaowu-today-guide__grid`、`.zhaowu-today-guide__page-title`、`.zhaowu-today-guide__wardrobe-notes`、`.zhaowu-today-guide__spirit`、`.zhaowu-today-guide__footer` 這幾個容器本身背景一律是 `transparent`（見既有規則 `.zhaowu-today-guide__grid .zhaowu-today-card{...background:transparent!important}`），實際看到的背景色來自外層 `.zhaowu-home-stage--daily-priority .zhaowu-home-disclosure` 在夜間模式的 `#102a23`（深綠）覆寫。問題是：這幾個容器內的 `<small>`／`<strong>`／`<span>`／`<b>`／`<i>` 文字**從未有對應的夜間模式上色規則**，只繼承日間模式的深色墨色，疊在深綠背景上幾乎不可見。唯一例外是同層的 `.zhaowu-today-guide__tabs`，它在 r201 就已經有夜間覆寫（`color:#d2c8b7` / `#fff5e4`），因此分頁籤是唯一維持可讀的部分——這也是為何看起來像「有些字看得到、有些看不到」。

修復：新增一組限定在 `.zhaowu-today-guide__*` 內的夜間模式規則，主要文字設為 `#f4ead9`、次要（小標籤／輔助文字）設為 `#d3c9b8`，數值與既有 `.zhaowu-home-disclosure-trigger` 夜間配色（同一張卡片的標題列）完全一致，維持視覺統一。刻意排除 `.zhaowu-today-guide__wardrobe` 內的 `[data-daily-colors="embed"]`（五行穿衣模組），因為它本來就有自己不透明的淺色卡片背景，夜間也刻意維持淺底深字。

### 2. 青玉小龍「背景音樂」控制列夜間文字消失

`<BackgroundMusic />`（`.zhaowu-dragon-music`）實際掛載在 `.zhaowu-dragon-guide-panel`（展開後的大對話框）內，而非站主原先回報時外觀上看似所屬的小浮動氣泡 `.zhaowu-dragon-bubble`。`.zhaowu-dragon-guide-panel` 在夜間模式刻意维持**淺色紙面**（`background:#ebe5d9`、`color:#292824`，屬既有正確行為），但 `.zhaowu-dragon-music` 這個子區塊被獨立設計成深綠色小盒子（`background:#102a23!important;color:#f1e8d8!important`，與 `.zhaowu-dragon-bubble` 共用同一條規則）。問題出在兩條選擇器優先級與 `.zhaowu-dragon-guide-panel :is(p,span,strong,input){color:#34312b!important}` 及 `.zhaowu-dragon-guide-panel .zhaowu-dragon-music-controls button{color:#4a4c46!important}` 完全相同或更高，且在原始碼中排序在後，導致面板整體「深字配淺底」的規則覆蓋掉了音樂盒自己「淺字配深底」的需求——標題、曲名、播放鍵文字全部變成深灰疊深綠。

修復：新增更高優先級（多一層 `.zhaowu-dragon-music` 類別選擇器）且原始碼順序更後的規則，把音樂盒內文字／按鈕文字強制拉回 `#f1e8d8`，只影響這個深綠盒子本身，不影響面板其餘淺色紙面文字。

### 3. 「今日靈籤」完整籤文彈窗形同重複文字

`.zhaowu-spirit-slip`（點擊「查看完整籤文」後出現的完整籤文卡片）在 CSS 裡**完全沒有 `position`／`z-index`／背景／邊框設定**，只有寬度與內距。實際渲染時它只是以一般文件流的方式插入在「今日靈籤」分頁 teaser 文字（`.zhaowu-today-guide__spirit`）正下方——等於同一段籤文標題／正文被印兩次，這正是站主截圖裡「文字重複／疊影」的成因，而非渲染錯誤或字型問題。

修復：補上完整的浮層樣式——`position:fixed` 置中（`inset:0;margin:auto`）、`z-index:90`、不透明紙面背景／邊框／陰影，並用 `::before` 加上一層半透明遮罩背景，讓彈窗真正以獨立卡片形式浮在頁面上方，而非插入在原文字流中。同時補齊先前完全沒有樣式的關閉按鈕（`.zhaowu-spirit-slip-close`）與內文子元素（kicker／rule／basis／mark）基礎樣式。

---

## 為什麼改

站主傳送 4 張正式環境截圖並回報「介面越做越爛」，明確指出：今日小工具數值文字看不清楚、青玉小龍音樂控制文字看不清楚、今日靈籤彈窗文字疊影。逐一比對截圖描述的視覺症狀與原始碼後定位並修復，未做任何範圍外的重構。

---

## 影響範圍

### ✅ 修復
- 首頁「今日」小工具夜間模式下的黃曆卡片文字全面可讀
- 青玉小龍展開後的背景音樂控制列夜間模式下文字可讀
- 今日靈籤完整籤文改為正確的置中浮層，不再與 teaser 文字重疊顯示

### ✓ 非影響區域
- BaZi/紫微計算引擎、報告生成契約、auth/owner 權限、Supabase schema、支付、路由
- 五行穿衣模組（`[data-daily-colors="embed"]`）維持原本淺色卡片設計，未改動
- `.zhaowu-dragon-guide-panel` 本身的淺色紙面行為未改動，只新增更高優先級的音樂盒例外規則
- r213 上傳修復已由另一併行工作階段以 r215（PR #501）合併至 main，本次不重複處理

---

## 受保護範圍

### r184 & r185 — 報告紙面表面合約
- ✅ 本次未觸碰 `:root` 的 `--zw-ink` / `--zw-ink-soft` / `--zw-muted`
- ✅ 未引入任何 `html[data-zw-theme="night"]` 根層級色彩變數覆寫
- ✅ 所有新增規則均以具體類別選擇器限定範圍，不影響 `.zhaowu-result-flow` / `.zhaowu-focused-report` 等既有紙面表面

---

## 驗證狀態

✅ **邏輯核對**
- 逐條追蹤 CSS 層疊與選擇器優先級，確認三個問題的根本成因（缺少夜間規則／規則優先級衝突／缺少浮層定位），而非臆測

✅ **測試覆蓋**
- `node --test scripts/*.test.mjs`：492 pass（與修改前 baseline 完全一致，58 個既有失敗為此沙箱環境缺少 `tsx` 套件所致的既存模組解析問題，與本次改動無關，已透過 `git stash` 比對確認為修改前後一致的既存基線）
- `scripts/r201-home-daily-polish.test.mjs`、`scripts/r184-iphone-report-hierarchy.test.mjs`、`scripts/r193-night-contrast.test.mjs`、`scripts/release-ledger.test.mjs` 全綠

⚠️ **待人工視覺驗證**
- 本沙箱環境無法實際渲染頁面截圖比對，僅能透過原始碼層級的層疊/優先級推導確認邏輯正確；需站主於正式環境實際切換夜間模式，重新查看「今日」小工具、青玉小龍音樂控制、今日靈籤彈窗三處畫面確認視覺效果後，方可視為 Verified
- 本 PR 需站主本人在 GitHub 點擊合併：AI 工具鏈的合併權限被系統政策擋下，無法自動合併受保護分支

---

## 回滾

```bash
git revert <commit-hash>
```

或：

```bash
git checkout HEAD~1 -- src/zhaowu-design-system.css
git checkout HEAD~1 -- src/lib/site-stats.ts
git checkout HEAD~1 -- lib/zhaowu-verification.js
```

### 前向相容性
純 CSS 新增規則與版本號更新，無資料庫遷移、無 HTML/JS 結構變更，向後兼容。

---

**昭梧夜間模式對比度修復 · 文案標準版**
