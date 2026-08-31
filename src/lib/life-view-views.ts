import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

export type LifeViewCounts = Record<string, number>;

const headers = {
  apikey: SUPABASE_KEY,
  "Content-Type": "application/json",
};

export async function fetchLifeViewCounts(): Promise<LifeViewCounts> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/life_view_article_views?select=article_id,view_count`, {
    headers,
  });
  if (!res.ok) return {};
  const rows = await res.json() as Array<{ article_id: string; view_count: number | string }>;
  return Object.fromEntries(rows.map((row) => [row.article_id, Number(row.view_count) || 0]));
}

export async function incrementLifeViewCount(articleId: string): Promise<number | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_life_view_article_view`, {
    method: "POST",
    headers,
    body: JSON.stringify({ p_article_id: articleId }),
  });
  if (!res.ok) return null;
  const value = await res.json();
  return Number(value) || 0;
}
