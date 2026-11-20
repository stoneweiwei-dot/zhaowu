import type { LifeViewArticle } from "@/lib/life-view";
import type { Locale } from "@/lib/i18n";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

export type ArticleOverride = {
  id: string;
  title: Record<Locale, string> | null;
  summary: Record<Locale, string> | null;
  body: Record<Locale, string> | null;
  archived: boolean;
  updated_at?: string;
};

export async function fetchArticleOverrides(): Promise<ArticleOverride[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/article_editor_overrides?select=id,title,summary,body,archived&limit=500`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, cache: "no-store", signal: controller.signal },
    );
    if (!res.ok) throw new Error("ARTICLE_READ_UNAVAILABLE");
    const rows: unknown = await res.json();
    if (!Array.isArray(rows)) throw new Error("ARTICLE_READ_INVALID");
    return rows.filter((item): item is ArticleOverride =>
      !!item && typeof item === "object" && typeof item.id === "string" && typeof item.archived === "boolean");
  } finally {
    clearTimeout(timeout);
  }
}

export function applyArticleOverrides<T extends LifeViewArticle>(catalog: T[], rows: ArticleOverride[]): T[] {
  const byId = new Map(rows.map((row) => [row.id, row]));
  return catalog.flatMap((article) => {
    const row = byId.get(article.id);
    if (row?.archived) return [];
    if (!row) return [article];
    return [{
      ...article,
      title: { ...article.title, ...(row.title ?? {}) },
      summary: { ...article.summary, ...(row.summary ?? {}) },
      body: { ...article.body, ...(row.body ?? {}) },
    }];
  });
}
