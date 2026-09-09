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
  group: "logo" | "mark" | "icon" | "divider" | "ornament" | "seal";
};

export const BRAND_UI_CATALOG: BrandUiAsset[] = [
  { key: "logo-primary", titleHant: "昭梧主標誌", titleHans: "昭梧主标志", titleEn: "Primary logo", purposeHant: "Header、登入頁、品牌頁", purposeHans: "Header、登录页、品牌页", purposeEn: "Header, login, brand", publicPath: "/brand-ui/logo-primary.svg", theme: "day", inUse: true, group: "logo" },
  { key: "logo-primary-night", titleHant: "昭梧主標誌（夜）", titleHans: "昭梧主标志（夜）", titleEn: "Primary logo night", purposeHant: "夜間 Header／登入", purposeHans: "夜间 Header／登录", purposeEn: "Night header / login", publicPath: "/brand-ui/logo-primary-night.svg", theme: "night", inUse: false, group: "logo" },
  { key: "logo-app", titleHant: "昭梧 App 圖標", titleHans: "昭梧 App 图标", titleEn: "App icon", purposeHant: "PWA、手機桌面", purposeHans: "PWA、手机桌面", purposeEn: "PWA and home screen", publicPath: "/brand-ui/logo-app.svg", theme: "both", inUse: true, group: "logo" },
  { key: "favicon", titleHant: "瀏覽器小標", titleHans: "浏览器小标", titleEn: "Favicon", purposeHant: "Browser tab", purposeHans: "Browser tab", purposeEn: "Browser tab", publicPath: "/brand-ui/favicon.svg", theme: "day", inUse: true, group: "logo" },
  { key: "mark-pine", titleHant: "松日徽記", titleHans: "松日徽记", titleEn: "Pine and sun mark", purposeHant: "小圖標、載入、角標", purposeHans: "小图标、载入、角标", purposeEn: "Small marks", publicPath: "/brand-ui/mark-pine.svg", theme: "day", inUse: true, group: "mark" },
  { key: "mark-night", titleHant: "月夜徽記", titleHans: "月夜徽记", titleEn: "Night mark", purposeHant: "夜間、月曆", purposeHans: "夜间、月历", purposeEn: "Night and calendar", publicPath: "/brand-ui/mark-night.svg", theme: "night", inUse: false, group: "mark" },
  { key: "mark-gourd", titleHant: "葫蘆吉祥標", titleHans: "葫芦吉祥标", titleEn: "Gourd mark", purposeHant: "靈籤／吉祥功能，不搶主 Logo", purposeHans: "灵签／吉祥功能，不抢主 Logo", purposeEn: "Auspicious functions only", publicPath: "/brand-ui/mark-gourd.svg", theme: "both", inUse: false, group: "mark" },
  { key: "divider-mountain", titleHant: "山日分隔線", titleHans: "山日分隔线", titleEn: "Mountain divider", purposeHant: "首頁專題分區", purposeHans: "首页专题分区", purposeEn: "Home section break", publicPath: "/brand-ui/divider-mountain.svg", theme: "day", inUse: true, group: "divider" },
  { key: "divider-river", titleHant: "流水分隔線", titleHans: "流水分隔线", titleEn: "River divider", purposeHant: "備用分隔，首頁不再同時使用", purposeHans: "备用分隔，首页不再同时使用", purposeEn: "Spare divider", publicPath: "/brand-ui/divider-river.svg", theme: "both", inUse: false, group: "divider" },
  { key: "ornament-pine", titleHant: "松枝裝飾", titleHans: "松枝装饰", titleEn: "Pine ornament", purposeHant: "首頁問事紙面", purposeHans: "首页问事纸面", purposeEn: "Home form", publicPath: "/brand-ui/ornament-pine.svg", theme: "day", inUse: true, group: "ornament" },
  { key: "ornament-sun-cloud", titleHant: "日雲裝飾", titleHans: "日云装饰", titleEn: "Sun and cloud ornament", purposeHant: "備用，避免與松枝同屏", purposeHans: "备用，避免与松枝同屏", purposeEn: "Spare motif", publicPath: "/brand-ui/ornament-sun-cloud.svg", theme: "day", inUse: false, group: "ornament" },
  { key: "icon-moon", titleHant: "月相小圖標", titleHans: "月相小图标", titleEn: "Moon icon", purposeHant: "夜間模式", purposeHans: "夜间模式", purposeEn: "Night mode", publicPath: "/brand-ui/icon-moon.svg", theme: "night", inUse: false, group: "icon" },
  { key: "icon-spark", titleHant: "星芒小圖標", titleHans: "星芒小图标", titleEn: "Spark icon", purposeHant: "Insight 重點", purposeHans: "Insight 重点", purposeEn: "Insight accent", publicPath: "/brand-ui/icon-spark.svg", theme: "both", inUse: false, group: "icon" },
];
