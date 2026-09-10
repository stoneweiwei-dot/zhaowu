import type { LifeViewArticle } from "@/lib/life-view";
import { LIFE_VIEW_LONG_FORM_ARTICLES as legacyLongFormArticles } from "@/lib/life-view-long-form-legacy";
import { HUAGAI_LONG_FORM } from "@/lib/life-view-long-form/huagai";

/**
 * 長篇版《昭梧 · 觀世錄》總表。
 * 新文章置頂；既有文章由 legacy registry 原樣保留，避免重寫歷史內容。
 * 傳統／传统宗教與修行材料只作文化、哲學與歷史脈絡整理；未經驗證的主張不得包裝成科學事實。
 */
export const LIFE_VIEW_LONG_FORM_ARTICLES: LifeViewArticle[] = [
  HUAGAI_LONG_FORM,
  ...legacyLongFormArticles,
];
