export const BRAND_ICON_NAMES = [
  "home", "articles", "reports", "calendar", "search", "account", "login",
  "bookmark", "favorite", "share", "settings", "language", "history", "message",
  "insight", "night", "day", "lock", "payment",
] as const;

export type BrandIconName = (typeof BRAND_ICON_NAMES)[number];

const GLYPH: Record<BrandIconName, string> = {
  home: '<path d="M18 30 32 18l14 12v16h-9V36h-10v10h-9Z"/>',
  articles: '<path d="M20 16h18l8 8v24H20Zm16 2v8h8"/><path d="M24 32h16M24 38h12" fill="none" stroke="currentColor" stroke-width="2"/>',
  reports: '<path d="M20 42V30h6v12zm10 0V22h6v20zm10 0V26h6v16z"/>',
  calendar: '<rect x="18" y="20" width="28" height="26" rx="3"/><path d="M24 16v6M40 16v6" fill="none" stroke="currentColor" stroke-width="2"/>',
  search: '<circle cx="28" cy="28" r="9" fill="none" stroke="currentColor" stroke-width="3"/><path d="M35 35l9 9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  account: '<circle cx="32" cy="24" r="8"/><path d="M16 46c2-10 10-14 16-14s14 4 16 14Z"/>',
  login: '<rect x="18" y="18" width="16" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M30 30h16l-6-6v4h-10v4h10v4Z"/>',
  bookmark: '<path d="M22 16h20v32l-10-7-10 7Z"/>',
  favorite: '<path d="M32 46s-14-9-14-20a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 11-14 20-14 20Z"/>',
  share: '<circle cx="44" cy="20" r="5"/><circle cx="18" cy="32" r="5"/><circle cx="44" cy="44" r="5"/><path d="M22.5 30.2 39.4 22.2M22.5 33.8 39.4 41.8" fill="none" stroke="currentColor" stroke-width="2.4"/>',
  settings: '<path d="M32 18 36 22l6-1 2 5-4 4 4 4-2 5-6-1-4 4-4-4-6 1-2-5 4-4-4-4 2-5 6 1 4-4Zm0 9a5 5 0 1 0 .01 0Z"/>',
  language: '<circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M18 32h28M32 18c4 5 6 9 6 14s-2 9-6 14c-4-5-6-9-6-14s2-9 6-14Z" fill="none" stroke="currentColor" stroke-width="2"/>',
  history: '<circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M32 24v9l6 4M22 20l-4 8 8-2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  message: '<path d="M16 20h32v22H28l-8 8v-8H16Z"/>',
  insight: '<path d="M32 14l3 12 12 3-12 3-3 12-3-12-12-3 12-3Z"/>',
  night: '<path d="M38 16a16 16 0 1 0 10 28 13 13 0 1 1-10-28Z"/>',
  day: '<circle cx="32" cy="32" r="8"/><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M32 16v5M32 43v5M16 32h5M43 32h5M21 21l3.5 3.5M39.5 39.5 43 43M43 21l-3.5 3.5M21 43l3.5-3.5"/></g>',
  lock: '<rect x="22" y="28" width="20" height="16" rx="3"/><path d="M26 28v-6a6 6 0 0 1 12 0v6" fill="none" stroke="currentColor" stroke-width="2.6"/>',
  payment: '<rect x="16" y="22" width="32" height="20" rx="3"/>',
};

type BrandIconProps = {
  name: BrandIconName;
  className?: string;
  title?: string;
};

export function BrandIcon({ name, className = "", title }: BrandIconProps) {
  return (
    <svg
      className={`zw-brand-icon ${className}`.trim()}
      viewBox="0 0 64 64"
      width="22"
      height="22"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <circle className="zw-brand-icon__ring" cx="32" cy="32" r="28.5" fill="none" strokeWidth="2" />
      <g className="zw-brand-icon__glyph" dangerouslySetInnerHTML={{ __html: GLYPH[name] }} />
    </svg>
  );
}
