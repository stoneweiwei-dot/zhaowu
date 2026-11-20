export type BrandUiGroup = "logo" | "mark" | "icon" | "divider" | "ornament" | "seal" | "frame";

export type BrandUiAsset = {
  key: string;
  titleHant: string;
  titleHans: string;
  titleEn: string;
  purposeHant: string;
  purposeHans: string;
  purposeEn: string;
  publicPath: string;
  theme: "day" | "night" | "both";
  inUse: boolean;
  group: BrandUiGroup;
};

const icon = (
  key: string,
  hant: string,
  hans: string,
  en: string,
  purposeHant: string,
  inUse: boolean,
): BrandUiAsset => ({
  key,
  titleHant: hant,
  titleHans: hans,
  titleEn: en,
  purposeHant,
  purposeHans: purposeHant,
  purposeEn: en,
  publicPath: `/brand-ui/icons/${key}.svg`,
  theme: "both",
  inUse,
  group: "icon",
});

export const BRAND_UI_GROUPS: { id: BrandUiGroup; hant: string; hans: string; en: string }[] = [
  { id: "logo", hant: "Logo", hans: "Logo", en: "Logo" },
  { id: "mark", hant: "徽記", hans: "徽记", en: "Marks" },
  { id: "icon", hant: "功能圖標", hans: "功能图标", en: "Icons" },
  { id: "divider", hant: "分隔線", hans: "分隔线", en: "Dividers" },
  { id: "ornament", hant: "裝飾", hans: "装饰", en: "Ornaments" },
  { id: "seal", hant: "印章", hans: "印章", en: "Seals" },
  { id: "frame", hant: "標題框", hans: "标题框", en: "Frames" },
];

export const BRAND_UI_CATALOG: BrandUiAsset[] = [
  { key: "logo-primary", titleHant: "昭梧主標誌", titleHans: "昭梧主标志", titleEn: "Primary logo", purposeHant: "Header、登入頁、品牌頁", purposeHans: "Header、登录页、品牌页", purposeEn: "Header, login, brand", publicPath: "/brand-ui/logo-primary.svg", theme: "day", inUse: true, group: "logo" },
  { key: "logo-primary-night", titleHant: "昭梧主標誌（夜）", titleHans: "昭梧主标志（夜）", titleEn: "Primary logo night", purposeHant: "夜間 Header／登入", purposeHans: "夜间 Header／登录", purposeEn: "Night header / login", publicPath: "/brand-ui/logo-primary-night.svg", theme: "night", inUse: true, group: "logo" },
  { key: "logo-app", titleHant: "昭梧 App 圖標", titleHans: "昭梧 App 图标", titleEn: "App icon", purposeHant: "PWA、手機桌面", purposeHans: "PWA、手机桌面", purposeEn: "PWA and home screen", publicPath: "/brand-ui/logo-app.svg", theme: "both", inUse: true, group: "logo" },
  { key: "favicon", titleHant: "瀏覽器小標", titleHans: "浏览器小标", titleEn: "Favicon", purposeHant: "Browser tab", purposeHans: "Browser tab", purposeEn: "Browser tab", publicPath: "/brand-ui/favicon.svg", theme: "day", inUse: true, group: "logo" },
  { key: "logo-horizontal", titleHant: "橫版標誌", titleHans: "横版标志", titleEn: "Horizontal logo", purposeHant: "Footer、桌面品牌列", purposeHans: "Footer、桌面品牌列", purposeEn: "Footer lockup", publicPath: "/brand-ui/logo-horizontal.svg", theme: "day", inUse: true, group: "logo" },
  { key: "logo-horizontal-night", titleHant: "橫版標誌（夜）", titleHans: "横版标志（夜）", titleEn: "Horizontal logo night", purposeHant: "夜間 Footer", purposeHans: "夜间 Footer", purposeEn: "Night footer", publicPath: "/brand-ui/logo-horizontal-night.svg", theme: "night", inUse: true, group: "logo" },
  { key: "badge-vertical", titleHant: "豎版徽章", titleHans: "竖版徽章", titleEn: "Vertical badge", purposeHant: "報告封面、卡片印記", purposeHans: "报告封面、卡片印记", purposeEn: "Report cover", publicPath: "/brand-ui/badge-vertical.svg", theme: "both", inUse: false, group: "logo" },
  { key: "wordmark", titleHant: "文字標誌", titleHans: "文字标志", titleEn: "Wordmark", purposeHant: "極小空間、SEO Header", purposeHans: "极小空间、SEO Header", purposeEn: "Compact wordmark", publicPath: "/brand-ui/wordmark.svg", theme: "day", inUse: false, group: "logo" },
  { key: "mark-pine", titleHant: "松日徽記", titleHans: "松日徽记", titleEn: "Pine and sun mark", purposeHant: "小圖標、載入、角標", purposeHans: "小图标、载入、角标", purposeEn: "Small marks", publicPath: "/brand-ui/mark-pine.svg", theme: "day", inUse: true, group: "mark" },
  { key: "mark-night", titleHant: "月夜徽記", titleHans: "月夜徽记", titleEn: "Night mark", purposeHant: "夜間、月曆", purposeHans: "夜间、月历", purposeEn: "Night and calendar", publicPath: "/brand-ui/mark-night.svg", theme: "night", inUse: false, group: "mark" },
  { key: "mark-gourd", titleHant: "葫蘆吉祥標", titleHans: "葫芦吉祥标", titleEn: "Gourd mark", purposeHant: "靈籤／吉祥功能，不搶主 Logo", purposeHans: "灵签／吉祥功能，不抢主 Logo", purposeEn: "Auspicious functions only", publicPath: "/brand-ui/mark-gourd.svg", theme: "both", inUse: true, group: "mark" },
  { key: "motif-sun", titleHant: "日輪", titleHans: "日轮", titleEn: "Sun disk", purposeHant: "日間、節氣", purposeHans: "日间、节气", purposeEn: "Day motif", publicPath: "/brand-ui/motif-sun.svg", theme: "day", inUse: false, group: "mark" },
  { key: "motif-moon", titleHant: "彎月", titleHans: "弯月", titleEn: "Crescent moon", purposeHant: "夜間模式、月相", purposeHans: "夜间模式、月相", purposeEn: "Night motif", publicPath: "/brand-ui/motif-moon.svg", theme: "night", inUse: false, group: "mark" },
  { key: "motif-star", titleHant: "星芒", titleHans: "星芒", titleEn: "Star spark", purposeHant: "Insight 重點", purposeHans: "Insight 重点", purposeEn: "Insight accent", publicPath: "/brand-ui/motif-star.svg", theme: "both", inUse: false, group: "mark" },
  { key: "motif-cloud", titleHant: "雲紋", titleHans: "云纹", titleEn: "Cloud line", purposeHant: "卡片、標題、Footer 備用", purposeHans: "卡片、标题、Footer 备用", purposeEn: "Spare cloud", publicPath: "/brand-ui/motif-cloud.svg", theme: "both", inUse: false, group: "mark" },
  { key: "motif-mountain", titleHant: "山形", titleHans: "山形", titleEn: "Mountain", purposeHant: "報告分區、空狀態", purposeHans: "报告分区、空状态", purposeEn: "Section mountain", publicPath: "/brand-ui/motif-mountain.svg", theme: "both", inUse: false, group: "mark" },
  icon("home", "首頁", "首页", "Home", "Header 首頁", true),
  icon("articles", "文章", "文章", "Articles", "文章入口", false),
  icon("reports", "報告", "报告", "Reports", "報告列表", false),
  icon("calendar", "日曆", "日历", "Calendar", "黃曆／日曆", false),
  icon("search", "搜索", "搜索", "Search", "搜索", false),
  icon("account", "個人中心", "个人中心", "Account", "Header 帳戶", true),
  icon("login", "登入", "登录", "Login", "Header 登入", true),
  icon("bookmark", "書籤", "书签", "Bookmark", "書籤", false),
  icon("favorite", "收藏", "收藏", "Favorite", "收藏", false),
  icon("share", "分享", "分享", "Share", "分享圖按鈕", true),
  icon("settings", "設定", "设置", "Settings", "設定", false),
  icon("language", "語言", "语言", "Language", "Header 語言列", false),
  icon("history", "歷史", "历史", "History", "歷史", false),
  icon("message", "諮詢", "咨询", "Message", "諮詢", false),
  icon("insight", "心靈", "心灵", "Insight", "Insight", false),
  icon("night", "夜間模式", "夜间模式", "Night mode", "Header 夜間切換", true),
  icon("day", "日間模式", "日间模式", "Day mode", "Header 日間切換", true),
  icon("lock", "鎖定", "锁定", "Lock", "鎖定", false),
  icon("payment", "支付", "支付", "Payment", "支付", false),
  { key: "divider-mountain", titleHant: "山日分隔線", titleHans: "山日分隔线", titleEn: "Mountain divider", purposeHant: "首頁專題分區", purposeHans: "首页专题分区", purposeEn: "Home section break", publicPath: "/brand-ui/divider-mountain.svg", theme: "day", inUse: true, group: "divider" },
  { key: "divider-river", titleHant: "流水分隔線", titleHans: "流水分隔线", titleEn: "River divider", purposeHant: "備用分隔，首頁不再同時使用", purposeHans: "备用分隔，首页不再同时使用", purposeEn: "Spare divider", publicPath: "/brand-ui/divider-river.svg", theme: "both", inUse: false, group: "divider" },
  { key: "divider-diamond", titleHant: "菱紋分隔", titleHans: "菱纹分隔", titleEn: "Diamond divider", purposeHant: "表單、設定頁備用", purposeHans: "表单、设置页备用", purposeEn: "Form divider", publicPath: "/brand-ui/divider-diamond.svg", theme: "both", inUse: false, group: "divider" },
  { key: "ornament-pine", titleHant: "松枝裝飾", titleHans: "松枝装饰", titleEn: "Pine ornament", purposeHant: "首頁問事紙面", purposeHans: "首页问事纸面", purposeEn: "Home form", publicPath: "/brand-ui/ornament-pine.svg", theme: "day", inUse: true, group: "ornament" },
  { key: "ornament-sun-cloud", titleHant: "日雲裝飾", titleHans: "日云装饰", titleEn: "Sun and cloud ornament", purposeHant: "備用，避免與松枝同屏", purposeHans: "备用，避免与松枝同屏", purposeEn: "Spare motif", publicPath: "/brand-ui/ornament-sun-cloud.svg", theme: "day", inUse: false, group: "ornament" },
  { key: "icon-moon", titleHant: "月相小圖標", titleHans: "月相小图标", titleEn: "Moon icon", purposeHant: "夜間模式備用", purposeHans: "夜间模式备用", purposeEn: "Night spare", publicPath: "/brand-ui/icon-moon.svg", theme: "night", inUse: false, group: "ornament" },
  { key: "icon-spark", titleHant: "星芒小圖標", titleHans: "星芒小图标", titleEn: "Spark icon", purposeHant: "Insight 備用", purposeHans: "Insight 备用", purposeEn: "Insight spare", publicPath: "/brand-ui/icon-spark.svg", theme: "both", inUse: false, group: "ornament" },
  { key: "seal-red", titleHant: "朱印", titleHans: "朱印", titleEn: "Red seal", purposeHant: "報告確認、文章署名", purposeHans: "报告确认、文章署名", purposeEn: "Report stamp", publicPath: "/brand-ui/seal-red.svg", theme: "both", inUse: false, group: "seal" },
  { key: "seal-gold", titleHant: "金印", titleHans: "金印", titleEn: "Gold seal", purposeHant: "VIP／付費報告", purposeHans: "VIP／付费报告", purposeEn: "Paid stamp", publicPath: "/brand-ui/seal-gold.svg", theme: "both", inUse: false, group: "seal" },
  { key: "seal-pine", titleHant: "松葉印", titleHans: "松叶印", titleEn: "Pine seal", purposeHant: "收藏、內容認證", purposeHans: "收藏、内容认证", purposeEn: "Content mark", publicPath: "/brand-ui/seal-pine.svg", theme: "both", inUse: false, group: "seal" },
  { key: "frame-title", titleHant: "標題框", titleHans: "标题框", titleEn: "Title frame", purposeHant: "Section Heading 備用", purposeHans: "Section Heading 备用", purposeEn: "Heading frame", publicPath: "/brand-ui/frame-title.svg", theme: "both", inUse: false, group: "frame" },
  { key: "corner-a", titleHant: "宋式轉角", titleHans: "宋式转角", titleEn: "Corner ornament", purposeHant: "卡片／模態備用", purposeHans: "卡片／模态备用", purposeEn: "Card corner", publicPath: "/brand-ui/corner-a.svg", theme: "both", inUse: false, group: "frame" },
];
