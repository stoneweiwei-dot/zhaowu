export type PublicChangeEntry = {
  id: string;
  date: string;
  zhHant: { title: string; summary: string };
  zhHans: { title: string; summary: string };
  en: { title: string; summary: string };
};

/**
 * Public, user-facing change history.
 *
 * Owner rule (2026-10-06): every production-impacting product change must add
 * or update an entry here in the same PR. Formal rN releases can still be
 * batched, but /updates must never stop showing what changed between releases.
 */
export const PUBLIC_CHANGELOG: readonly PublicChangeEntry[] = [
  {
    id: "2026-10-06-today-first-home-rhythm",
    date: "2026-10-06",
    zhHant: { title: "今日指引移到首頁主流程最前", summary: "今日摘要與青玉「今日」入口會進入同一套既有正式版完整指引；載入時保留版面高度避免跳動，減少動態模式與手動選圖會停止自動輪播。命書仍保持單一路徑，深度解讀只在已有命盤結果後出現。" },
    zhHans: { title: "今日指引移到首页主流程最前", summary: "今日摘要与青玉「今日」入口会进入同一套既有正式版完整指引；载入时保留版面高度避免跳动，减少动态模式与手动选图会停止自动轮播。命书仍保持单一路径，深度解读只在已有命盘结果后出现。" },
    en: { title: "Today Guide now leads the homepage flow", summary: "The Today summary and jade Today shortcut now open the same approved full guide, with reserved loading space to prevent layout jumps. Reduced-motion mode and manual painting selection stop auto-cycling; the Destiny Book stays a single path and deep-reading promotion appears only after a result exists." },
  },
  {
    id: "2026-10-06-public-change-log",
    date: "2026-10-06",
    zhHant: { title: "更新紀錄改為每次改動必寫", summary: "網站功能、視覺、後台或正式 runtime 有實際變化時，同一個 PR 必須加入公開更新紀錄；CI 會阻止漏寫的產品變更。" },
    zhHans: { title: "更新记录改为每次改动必写", summary: "网站功能、视觉、后台或正式 runtime 有实际变化时，同一个 PR 必须加入公开更新记录；CI 会阻止漏写的产品变更。" },
    en: { title: "Every product change now needs a public note", summary: "Any real change to the site, visuals, owner console or production runtime must add a public change note in the same PR; CI blocks product changes that omit it." },
  },
  {
    id: "2026-10-06-opening-library",
    date: "2026-10-06",
    zhHant: { title: "開場動畫整理並選定雙生並蒂蓮", summary: "後台開場影片改用可讀名稱；目前開場切換為較輕的 MP4「雙生並蒂蓮」，並保留其他版本作備用。" },
    zhHans: { title: "开场动画整理并选定双生并蒂莲", summary: "后台开场影片改用可读名称；目前开场切换为较轻的 MP4「双生并蒂莲」，并保留其他版本作备用。" },
    en: { title: "Opening-video library cleaned up", summary: "Owner opening videos now use readable names. The lighter MP4 Twin Lotus clip is the current opening, while the other versions remain available as fallbacks." },
  },
  {
    id: "2026-10-06-song-visual-qc",
    date: "2026-10-06",
    zhHant: { title: "正式宋式圖像加入硬性品質門檻", summary: "正式母圖加入解析度與重影檢查；不合格素材不再回到報告或站主圖庫，圖片放大也不超過原始解析度。" },
    zhHans: { title: "正式宋式图像加入硬性质量门槛", summary: "正式母图加入分辨率与重影检查；不合格素材不再回到报告或站主图库，图片放大也不超过原始分辨率。" },
    en: { title: "Formal Song artwork now has a hard QC gate", summary: "Formal source art is checked for resolution and ghosting; blocked art cannot return to reports or the owner gallery, and zoom is capped at native resolution." },
  },
  {
    id: "2026-10-06-gallery-groups",
    date: "2026-10-06",
    zhHant: { title: "核心宋式圖庫分組並防誤刪", summary: "正式宋式母圖、天干、地支／月令、五行運圖等核心素材與私人上傳、舊素材分開；核心資產禁止批次或單筆誤刪。" },
    zhHans: { title: "核心宋式图库分组并防误删", summary: "正式宋式母图、天干、地支／月令、五行运图等核心素材与私人上传、旧素材分开；核心资产禁止批量或单笔误删。" },
    en: { title: "Core Song artwork is separated and protected", summary: "Formal source art, stems, branches/month commands and five-element artwork are separated from private uploads and legacy assets, with destructive deletion blocked for core assets." },
  },
  {
    id: "2026-10-05-owner-bulk",
    date: "2026-10-05",
    zhHant: { title: "站主後台改為精簡、多選優先", summary: "音樂、圖庫、開場影片、首頁背景與客戶報告加入全選、清除與批次操作；縮小過大的控制區並移除含糊選項。" },
    zhHans: { title: "站主后台改为精简、多选优先", summary: "音乐、图库、开场影片、首页背景与客户报告加入全选、清除与批量操作；缩小过大的控制区并移除含糊选项。" },
    en: { title: "Owner console is denser and bulk-first", summary: "Music, gallery, opening-video, home-background and customer-report managers gained select-all, clear and bulk actions, while oversized and ambiguous controls were removed." },
  },
  {
    id: "2026-10-05-mobile-home-five-elements",
    date: "2026-10-05",
    zhHant: { title: "手機首頁與每日五行重新收口", summary: "首頁頂部資訊合併成單排，主視覺上移，站主入口移到頁尾；每日五行五格改為同屏完整顯示，不再橫向滑動。" },
    zhHans: { title: "手机首页与每日五行重新收口", summary: "首页顶部信息合并成单排，主视觉上移，站主入口移到页尾；每日五行五格改为同屏完整显示，不再横向滑动。" },
    en: { title: "Mobile home and five-element layout tightened", summary: "Home utilities now share one compact row, the hero sits higher, owner access moved to the footer, and all five daily-element choices fit the phone viewport without horizontal swiping." },
  },
  {
    id: "2026-10-05-social-publisher",
    date: "2026-10-05",
    zhHant: { title: "Instagram／Threads 發布器完成整合", summary: "站主發布器可從圖庫選素材、手機上傳、預覽與填 alt text，並支援 Instagram 與 Threads 並行提交；後台收斂為單一入口。" },
    zhHans: { title: "Instagram／Threads 发布器完成整合", summary: "站主发布器可从图库选素材、手机上传、预览与填写 alt text，并支持 Instagram 与 Threads 并行提交；后台收敛为单一入口。" },
    en: { title: "Instagram and Threads publisher integrated", summary: "The owner publisher can use gallery assets, mobile uploads, previews and alt text, then submit to Instagram and Threads in parallel from a single console flow." },
  },
  {
    id: "2026-10-05-report-mobile",
    date: "2026-10-05",
    zhHant: { title: "報告手機版清理與單一署名", summary: "專項表格改為手機卡片式閱讀，清除重複插畫文字與重複署名，縮小青玉小龍對內容的遮擋。" },
    zhHans: { title: "报告手机版清理与单一署名", summary: "专项表格改为手机卡片式阅读，清除重复插画文字与重复署名，缩小青玉小龙对内容的遮挡。" },
    en: { title: "Report mobile layout cleaned up", summary: "Specialist tables now adapt to phone cards, duplicate illustration copy and signatures were removed, and the jade-dragon assistant overlaps less content." },
  },
  {
    id: "2026-10-05-jade-navigation",
    date: "2026-10-05",
    zhHant: { title: "首頁主導航換成青玉牌圖示", summary: "命書、今日、測驗、觀世錄四個主要入口統一為青玉牌視覺，並針對手機尺寸調整。" },
    zhHans: { title: "首页主导航换成青玉牌图标", summary: "命书、今日、测验、观世录四个主要入口统一为青玉牌视觉，并针对手机尺寸调整。" },
    en: { title: "Home navigation moved to jade plaques", summary: "The four primary entrances—Destiny Book, Today, Quiz and Notes—now use a consistent jade-plaque visual sized for mobile." },
  },
  {
    id: "2026-10-05-pwa-self-heal",
    date: "2026-10-05",
    zhHant: { title: "PWA 更新流程改為先更新再自癒", summary: "已安裝的 Web App 遇到版本落後時先更新 Service Worker 並等待接管，必要時才做範圍化修復，降低刪除後重裝的需求。" },
    zhHans: { title: "PWA 更新流程改为先更新再自愈", summary: "已安装的 Web App 遇到版本落后时先更新 Service Worker 并等待接管，必要时才做范围化修复，降低删除后重装的需求。" },
    en: { title: "Installed PWA now updates before self-healing", summary: "When an installed web app is stale, it updates its service worker and waits for takeover first, only using scoped recovery when necessary." },
  },
  {
    id: "2026-10-05-performance-a11y-seo",
    date: "2026-10-05",
    zhHant: { title: "效能、無障礙與 SEO 收尾", summary: "首頁延後載入次要模組，補上鍵盤跳轉、在地化 metadata 與保守的結構化資料，降低首屏負擔。" },
    zhHans: { title: "性能、无障碍与 SEO 收尾", summary: "首页延后加载次要模块，补上键盘跳转、本地化 metadata 与保守的结构化数据，降低首屏负担。" },
    en: { title: "Performance, accessibility and SEO closeout", summary: "Secondary home modules load later, while keyboard skip navigation, localized metadata and conservative structured data reduce first-screen overhead." },
  },
  {
    id: "2026-10-04-home-hero",
    date: "2026-10-04",
    zhHant: { title: "首頁改為畫作主視覺與二層導航", summary: "首頁主視覺改為宋式礦彩畫作方向，主要操作與次要入口重新分層，維持手機優先。" },
    zhHans: { title: "首页改为画作主视觉与二层导航", summary: "首页主视觉改为宋式矿彩画作方向，主要操作与次要入口重新分层，维持手机优先。" },
    en: { title: "Home rebuilt around artwork and two-level navigation", summary: "The homepage hero moved to the Song mineral-painting direction, with primary and secondary actions separated in a mobile-first hierarchy." },
  },
  {
    id: "2026-10-04-paid-reports",
    date: "2026-10-04",
    zhHant: { title: "公開基本盤與三檔按次付費報告", summary: "六類基本盤公開；深讀報告改為三檔一次性付費，加入客戶出生資料專屬頁與命盤五音贈曲，付款權限仍由伺服器驗證。" },
    zhHans: { title: "公开基本盘与三档按次付费报告", summary: "六类基本盘公开；深读报告改为三档一次性付费，加入客户出生资料专属页与命盘五音赠曲，付款权限仍由服务器验证。" },
    en: { title: "Public base charts and three one-off report tiers", summary: "Six base charts are public; deeper readings use three one-off paid tiers with personal birth-data pages and chart-linked five-tone bonus tracks, with entitlements verified server-side." },
  },
  {
    id: "2026-10-04-illustrated-destiny",
    date: "2026-10-04",
    zhHant: { title: "命盤加入一盤一景插畫系統", summary: "完整報告可依命盤與問題生成統一敘事場景，圖像只作報告附件，不改命理計算，也不因圖像失敗阻塞文字報告。" },
    zhHans: { title: "命盘加入一盘一景插画系统", summary: "完整报告可依命盘与问题生成统一叙事场景，图像只作报告附件，不改命理计算，也不因图像失败阻塞文字报告。" },
    en: { title: "Illustrated destiny scene added to full reports", summary: "Full reports can derive one coherent visual scene from the chart and question. Artwork remains an attachment: it does not alter calculation truth or block the text report if generation fails." },
  },
  {
    id: "2026-10-03-day-song-theme",
    date: "2026-10-03",
    zhHant: { title: "全站固定日間宋式礦彩方向", summary: "夜間模式關閉；共用色彩、首頁、報告概覽與品牌控制統一為暖紙、青玉、柔和礦彩與克制留白。" },
    zhHans: { title: "全站固定日间宋式矿彩方向", summary: "夜间模式关闭；共用色彩、首页、报告概览与品牌控制统一为暖纸、青玉、柔和矿彩与克制留白。" },
    en: { title: "Site fixed to the daytime Song mineral palette", summary: "Night mode was retired. Shared colours, home, report overview and brand controls now use warm paper, jade, soft mineral washes and restrained spacing." },
  },
  {
    id: "2026-10-03-answer-layer",
    date: "2026-10-03",
    zhHant: { title: "第一屏回答更白話並加強安全邊界", summary: "問題回答擴充更多生活情境，限制第一屏為簡短結論、原因與時間；醫療、離婚／暴力等問題不再由命盤替使用者作決定。" },
    zhHans: { title: "第一屏回答更白话并加强安全边界", summary: "问题回答扩充更多生活情境，限制第一屏为简短结论、原因与时间；医疗、离婚／暴力等问题不再由命盘替用户作决定。" },
    en: { title: "First-screen answers are plainer and safer", summary: "More real-life question types are covered, while the first screen stays to a short verdict, reason and timing. Medical and high-stakes relationship decisions are no longer nudged by the chart." },
  },
  {
    id: "2026-10-03-today-intro",
    date: "2026-10-03",
    zhHant: { title: "今日指引重排，開場影片不再先閃舊片", summary: "黃曆、五行穿衣、靈籤改為三段獨立閱讀；站主影片載入時先保持中性畫面，不再短暫播放舊的內建開場。" },
    zhHans: { title: "今日指引重排，开场影片不再先闪旧片", summary: "黄历、五行穿衣、灵签改为三段独立阅读；站主影片加载时先保持中性画面，不再短暂播放旧的内建开场。" },
    en: { title: "Today guide reorganised; old intro flash removed", summary: "Almanac, five-element dressing and spirit slips now read as three separate sections, while custom opening videos resolve over a neutral field instead of briefly flashing the old built-in clip." },
  },
  {
    id: "2026-10-02-three-languages",
    date: "2026-10-02",
    zhHant: { title: "繁體／简体／English 三語顯示恢復", summary: "簡體中文重新成為正式顯示語言，並修正多個頁面把繁體字串錯送到簡體模式的問題。" },
    zhHans: { title: "繁体／简体／English 三语显示恢复", summary: "简体中文重新成为正式显示语言，并修正多个页面把繁体字符串错送到简体模式的问题。" },
    en: { title: "Traditional / Simplified / English display restored", summary: "Simplified Chinese returned as a first-class display language, with multiple Traditional-text leaks in Simplified mode corrected." },
  },
  {
    id: "2026-10-02-owner-report-structure",
    date: "2026-10-02",
    zhHant: { title: "站主後台分區，完整報告恢復連續閱讀", summary: "後台管理區重新分開，減少功能混在同一頁；完整報告恢復單一連續 summary／body，不再被舊分組切碎。" },
    zhHans: { title: "站主后台分区，完整报告恢复连续阅读", summary: "后台管理区重新分开，减少功能混在同一页；完整报告恢复单一连续 summary／body，不再被旧分组切碎。" },
    en: { title: "Owner console separated; full report flow restored", summary: "Back-office sections were separated to reduce clutter, while the full report returned to one continuous summary/body instead of being fragmented by older grouping." },
  },
] as const;

export function publicChangeText(entry: PublicChangeEntry, language: string) {
  if (language === "en") return entry.en;
  if (language === "zh-Hans") return entry.zhHans;
  return entry.zhHant;
}
