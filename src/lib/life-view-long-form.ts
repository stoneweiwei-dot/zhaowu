import type { LifeViewArticle } from "@/lib/life-view";
import { LIFE_VIEW_LONG_FORM_ARTICLES as legacyLongFormArticles } from "@/lib/life-view-long-form-legacy";
import { HUAGAI_LONG_FORM } from "@/lib/life-view-long-form/huagai";

/**
 * 長篇版《昭梧 · 觀世錄》總表。
 * 新文章置頂；既有文章由 legacy registry 原樣保留，避免重寫歷史內容。
 */
export const LIFE_VIEW_LONG_FORM_ARTICLES: LifeViewArticle[] = [
  HUAGAI_LONG_FORM,
  ...legacyLongFormArticles,
];
