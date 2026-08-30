import type { Locale } from "@/lib/i18n";

export type LifeViewArticle = {
  id: string;
  publishedAt: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  body: Record<Locale, string>;
};

/**
 * Stone's own essays for the public "我的人生觀和理解" section.
 * New chat-submitted articles are appended here so the website has one
 * stable source of truth and no database/schema change is required.
 */
export const LIFE_VIEW_ARTICLES: LifeViewArticle[] = [];
