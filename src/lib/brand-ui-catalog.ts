export type BrandUiAsset = {
  key: string;
  titleHant: string;
  titleHans: string;
  titleEn: string;
  publicPath: string;
  tags: string[];
};

export const BRAND_UI_CATALOG: BrandUiAsset[] = [
  { key: "logo-primary", titleHant: "昭梧主標誌", titleHans: "昭梧主标志", titleEn: "Primary logo", publicPath: "/brand-ui/logo-primary.svg", tags: ["logo", "brand", "day"] },
  { key: "logo-app", titleHant: "昭梧 App 標誌", titleHans: "昭梧 App 标志", titleEn: "App logo", publicPath: "/brand-ui/logo-app.svg", tags: ["logo", "app", "brand"] },
  { key: "mark-pine", titleHant: "松日徽記", titleHans: "松日徽记", titleEn: "Pine and sun mark", publicPath: "/brand-ui/mark-pine.svg", tags: ["mark", "pine", "sun"] },
  { key: "mark-night", titleHant: "月夜徽記", titleHans: "月夜徽记", titleEn: "Night mark", publicPath: "/brand-ui/mark-night.svg", tags: ["mark", "night", "moon"] },
  { key: "divider-mountain", titleHant: "山日分隔線", titleHans: "山日分隔线", titleEn: "Mountain divider", publicPath: "/brand-ui/divider-mountain.svg", tags: ["divider", "mountain", "sun"] },
  { key: "divider-river", titleHant: "流水分隔線", titleHans: "流水分隔线", titleEn: "River divider", publicPath: "/brand-ui/divider-river.svg", tags: ["divider", "water"] },
  { key: "ornament-pine", titleHant: "松枝裝飾", titleHans: "松枝装饰", titleEn: "Pine ornament", publicPath: "/brand-ui/ornament-pine.svg", tags: ["ornament", "pine"] },
  { key: "ornament-sun-cloud", titleHant: "日雲裝飾", titleHans: "日云装饰", titleEn: "Sun and cloud ornament", publicPath: "/brand-ui/ornament-sun-cloud.svg", tags: ["ornament", "sun", "cloud"] },
  { key: "icon-moon", titleHant: "月相小圖標", titleHans: "月相小图标", titleEn: "Moon icon", publicPath: "/brand-ui/icon-moon.svg", tags: ["icon", "moon", "night"] },
  { key: "icon-spark", titleHant: "星芒小圖標", titleHans: "星芒小图标", titleEn: "Spark icon", publicPath: "/brand-ui/icon-spark.svg", tags: ["icon", "spark", "accent"] },
];
