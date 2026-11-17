import map from "../../content/article-redirect-map.json" with { type: "json" };
import { languagePath, parseLanguagePath } from "./language-routing.js";

export function articleHashRedirect(hash: string, pathname: string): string | null {
  if (!hash.startsWith("#article-")) return null;
  const entry = map.redirects.find((item) => item.old_hash === hash);
  const locale = parseLanguagePath(pathname).language;
  const destination = entry?.group === "overview" ? "/knowledge" : entry?.new_slug ? `/knowledge/${entry.new_slug}` : "/knowledge";
  return languagePath(destination, locale);
}
