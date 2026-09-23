# 昭梧｜CURRENT STATE

最後核對：2026-09-23 14:08 AEST

> 本文件只保留「現在仍有效」的事實與規則。歷史版本請看 Git history／change reports；舊聊天、舊 Issue、舊部署說明若與本文件、AGENTS.md、current main 或 current Production 衝突，一律不具執行權。

## 1. 唯一 Production

- GitHub：`stoneweiwei-dot/zhaowu`
- Branch：`main`
- current main：以 GitHub `main` 即時 SHA 為準；不得把文件內固定 SHA 當永久 CURRENT。
- Hosting：Vercel
- Project：`stone-zhaowu-official`
- Production URL：`https://stone-zhaowu-official.vercel.app/`
- current Production：以 Vercel `stone-zhaowu-official` Production 即時 SHA 為準。
- 發布前必須確認 Production SHA = current main SHA。
- Vercel Git policy：只有 `main` 可觸發 Production；`deploymentEnabled` 以 `**: false + main: true` 覆蓋含 `/` 的分支名，`ignoreCommand` 再用 `VERCEL_GIT_COMMIT_REF != main` 作第二道硬擋；純 docs/Markdown／GitHub workflow 變更亦跳過。
- Netlify：archive only；不得作 Production／canonical／fallback truth。
- AppDeploy／Sites／Floot／Dropbox：只可作開發、管理、資產或備份工具，不得成為訪客 runtime 必要依賴。

## 2. 公開產品 CURRENT

最終產品收線為「昭梧命書」。

不再以增加流派入口、首頁卡片或獨立工具作為產品主線。

唯一公開主流程：

**出生資料 → 四柱與基礎解釋 → 單一完整報告 → 可選追問**

- 七個公開專卷入口已退出 active path。
- 專項 routes（紫微／七政／西占／印度古法／一掌等）保留作站主／內部能力與回歸驗證。
- 首頁吉象圖鑑入口隱藏；獨立頁與站主圖庫保留。
- 完整報告第一屏先回答使用者原問題；不得先堆術語。
- 新報告持久化契約仍為 `summary / body`；客戶前端只呈現一份連續閱讀層，不復活九頁／四卡／多 session。
- 圖片／provider／背景失敗不得阻塞文字答案。
- 身體內容只作傳統象義提醒，不作醫療診斷。

唯一報告契約：`docs/FOCUSED-REPORT.md`。

## 3. Login／身份

- 公開訪客：guest-first，本機保存生辰與一般使用狀態；核心問答不要求會員帳號。
- `/login`：目前是 **owner-only login**。
- 站主登入：獨立 owner cookie／owner session，不依賴 Supabase Auth。
- 不得復活公開 Email／OAuth／註冊 active path，除非站主另行明確下令。

## 4. 語言

公開 selector 只有：

- 繁體中文
- English

ko／hi／zh-Hans／ja 原始碼或相容 bridge 可保留，但不得出現在公開 selector，也不得阻塞 Production 驗收。

## 5. 視覺權威

- `src/main.tsx` 全域 CSS 載入順序：
  1. `styles.css`
  2. `legacy-visual-compat.css`
  3. `zhaowu-design-system.css`
- `zhaowu-design-system.css` 是最後 visual authority。
- 不再新增新的 `visual-hotfix-rXXX.css` 全域入口。
- SiteShell 語言列不得用 inline style 與 canonical CSS 打架。
- iPhone 優先；主要 touch target >=44px；表單控制文字 16px，避免 Safari auto zoom。
- 浮動 UI 只有青玉小龍；播放器控制整合在小龍內，不得掛第二個 fixed music dock。
- 手機頁面不得要求左右拖動。

## 6. Login animation

r179 起，舊全站 `IntroGate` 已退出 active route tree。

- 首頁、重新整理、一般路由、報告頁與回訪都不得播放 opening/loading 動畫。
- 動畫只屬於 `/login`；由 `LoginStageBackdrop` 顯示站主登入動畫。
- `zhaowu.intro.force`、`zhaowu.intro.seen.r148` 與舊 IntroGate 元件可保留作歷史／回歸素材，但不得再影響公開 runtime。
- Login 動畫保留可見聲音控制；iPhone Safari 仍需使用者手勢開聲。\n- r183 起 `/login` 採全屏動態舞台＋底部輕量紙感登入層；只改呈現，不改 owner auth／cookie／session。\n- r181 Storage 寫入凍結期間，新上傳登入影片不得寫入 Supabase；runtime 仍只使用正式 build 內 same-origin 素材。

## 7. Supabase

主專案：`plgpxusmemnmzckbwtiv`。

- Database 專案可讀；站主登入不走 Supabase Auth。
- Storage 目前約 **1.196 GB / Free 1 GB**；仍是未完成基礎設施問題。
- Storage／Edge 曾回 402 `exceed_storage_size_quota`。
- r181 起 **所有新增 Supabase Storage 寫入已凍結**：背景、站主圖庫、登入素材、新命誥圖不得新增；現有內容仍可讀取／管理。
- r174 已把 Supabase 從公開站 startup critical path 移除：資料服務失敗時首頁／命盤／問答必須 fail-open。
- 不得直接 SQL DELETE `storage.objects` 冒充刪除檔案。
- 已確認第一批純垃圾候選：14 個未引用 audio 約 77.94 MB + 2 個未引用 gallery 原件約 0.99 MB；待 Storage delete 恢復後優先刪除。
- backgrounds 約 611.5 MB、279 個 metadata row 目前全為 enabled=true，禁止整包刪；必須先冷備份／壓縮、停用 metadata、驗證無 runtime 引用後再刪。
- 未完成搬遷／引用核對前，不刪 private report images、仍被 metadata reference 的資產或 rollback 必要原件。

第二個 Supabase project `zhaowu-core` 目前 INACTIVE；不得擅自切 Production 過去。

## 8. Floot／Dropbox

- Floot `Zhaowu Media Vault` 可作媒體外移目標，但目前 workspace asset upload 已回 `storage quota exceeded`；不得宣稱 Supabase→Floot 遷移完成。
- Floot 不得成為訪客 runtime 必要依賴。
- Dropbox 目前不在 Production runtime；只可作冷備份／人工資產保存。

## 9. 已鎖核心

沒有明確新需求與完整 regression，不改：

- `src/lib/palm/engine.ts`
- `src/lib/core/method.ts`
- `src/lib/bazi/calendar.ts`
- `src/lib/bazi/chart.ts`
- `src/lib/bazi/interpret.ts` 的核心分類順序
- auth／payment／Supabase schema

子時規則保持 current 實作：23:00–23:59:59 按出生地當地當日；00:00 後次日，並處理時區／DST／真太陽時。不得復活舊「23:00 直接換日」。

## 10. 真正仍未完成

### P0
- 發布時必須確認 Vercel Production SHA = current main SHA。
- STO-5／STO-20 真 iPhone Safari 最終實機驗收尚未完成。
- Supabase Storage 超額仍未清理／遷移完成。

### P1 / Backlog
- STO-14 可選命誥圖真 provider 維持 Backlog；未重啟前不得消耗 provider 額度。
- 自訂子域名只有在站主重新指定並完成 DNS/SSL 後才取代 Vercel URL；目前 canonical 不變。

## 11. Done Gate

不得再使用「基本完成／差最後一步／可以收官」作完成判定。

只有同時有證據證明：

1. current main 的必要 CI／contract gate 通過；
2. Vercel Production SHA = current main SHA；
3. 正式站首頁／Login／出生表單／完整報告可用；
4. 真 iPhone Safari 無白屏、橫向 overflow、safe-area／鍵盤遮擋、雙 floating UI；
5. refresh／返回／前進／切 App／鎖屏恢復正常；
6. 首頁及一般路由不再出現 IntroGate，且 /login 動畫與聲音控制正常；
7. owner login／session restore／logout 正常；
8. Supabase 失效時公開核心流程仍 fail-open；

才可以把 STO-5／STO-20 標 Done。

CI、PR merge、Preview、單純 Vercel READY、桌面 viewport、文件描述均不能單獨代替 Production＋真機證據。


### r182 趣味測驗｜修仙命格靈測
- 首頁「昭梧 · 心境小測」新增 `/quiz/cultivation-destiny`。
- 來源：裝置既有生辰 → 現行 `buildChart()` 八字／五行 truth；MBTI 可選且低權重。
- 輸出：靈根／品階、宗門峰脈、入門身份、六維、九大道途、諸宗適性、三句機驗、修行命途與 9:16 個人命測圖。
- 命測圖完全在瀏覽器本機生成，不新增 Supabase Storage 寫入，不使用付費圖片 provider；r181 Storage freeze 維持。
- 邊界：仙俠結果只作趣味世界觀，不修改正式命盤；紫微未經校驗時不補造盤面。
