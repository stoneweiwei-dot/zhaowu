import type { LifeViewArticle } from "@/lib/life-view";
import { LIFE_VIEW_LONG_FORM_ARTICLES as legacyLongFormArticles } from "@/lib/life-view-long-form-legacy";
import { FACE_MIND_CULTIVATION_LONG_FORM } from "@/lib/life-view-long-form/face-mind-cultivation";
import { HUAGAI_LONG_FORM } from "@/lib/life-view-long-form/huagai";
import { STRENGTH_OVERDRIVE_FIVE_ELEMENTS_LONG_FORM } from "@/lib/life-view-long-form/strength-overdrive-five-elements";
import { TEN_GODS_RELATIONSHIP_FRICTION_LONG_FORM } from "@/lib/life-view-long-form/ten-gods-relationship-friction";
import { WEALTH_ENVIRONMENT_SYMBOLISM_LONG_FORM } from "@/lib/life-view-long-form/wealth-environment-symbolism";
import { YELLOW_SPRINGS_AND_BUDDHIST_REBIRTH_LONG_FORM } from "@/lib/life-view-long-form/yellow-springs-and-buddhist-rebirth";

/**
 * 長篇版《昭梧 · 觀世錄》總表。
 * 新文章置頂；既有文章由 legacy registry 原樣保留，避免重寫歷史內容。
 * 傳統／传统宗教與修行材料只作文化、哲學與歷史脈絡整理；未經驗證的主張不得包裝成科學事實。
 */
export const LIFE_VIEW_LONG_FORM_ARTICLES: LifeViewArticle[] = [
  YELLOW_SPRINGS_AND_BUDDHIST_REBIRTH_LONG_FORM,
  STRENGTH_OVERDRIVE_FIVE_ELEMENTS_LONG_FORM,
  FACE_MIND_CULTIVATION_LONG_FORM,
  TEN_GODS_RELATIONSHIP_FRICTION_LONG_FORM,
  WEALTH_ENVIRONMENT_SYMBOLISM_LONG_FORM,
  HUAGAI_LONG_FORM,
  ...legacyLongFormArticles,
];
