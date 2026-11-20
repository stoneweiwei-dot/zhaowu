export const BRAND_ICON_NAMES = [
  "home", "articles", "reports", "calendar", "search", "account", "login",
  "bookmark", "favorite", "share", "settings", "language", "history", "message",
  "insight", "night", "day", "lock", "payment",
  "bazi", "ziwei", "western", "indian", "qizheng", "past", "numerology",
  "oracle", "wardrobe", "astronomy", "support",
] as const;

export type BrandIconName = (typeof BRAND_ICON_NAMES)[number];
export type BrandIconSize = "sm" | "md" | "lg";

const GLYPH: Record<BrandIconName, string> = {
  home: '<path d="M18 31 32 19l14 12v15H36V36h-8v10H18Z"/>',
  articles: '<path d="M17 20c7-2 11 0 15 4v24c-4-4-8-6-15-4Zm30 0c-7-2-11 0-15 4v24c4-4 8-6 15-4Z"/><path class="zw-brand-icon__accent" d="M22 29h6m-6 6h6m8-6h6m-6 6h6"/>',
  reports: '<path d="M19 17h22l6 6v24H19Z"/><path d="M41 17v7h6M24 40v-8m7 8V27m7 13v-5"/><circle class="zw-brand-icon__seal" cx="24" cy="27" r="1.8"/>',
  calendar: '<rect x="17" y="20" width="30" height="27" rx="4"/><path d="M24 16v8m16-8v8M17 28h30"/><circle class="zw-brand-icon__seal" cx="32" cy="36" r="2"/>',
  search: '<circle cx="28" cy="28" r="10"/><path d="M36 36l10 10"/>',
  account: '<circle cx="32" cy="24" r="8"/><path d="M17 47c2-9 8-14 15-14s13 5 15 14Z"/><circle class="zw-brand-icon__seal" cx="32" cy="42" r="1.8"/>',
  login: '<rect x="17" y="18" width="18" height="28" rx="3"/><path d="M29 32h18m-6-6 6 6-6 6"/>',
  bookmark: '<path d="M22 17h20v31l-10-7-10 7Z"/><circle class="zw-brand-icon__seal" cx="32" cy="29" r="1.8"/>',
  favorite: '<path d="m32 16 4.7 9.5 10.5 1.5-7.6 7.4 1.8 10.4L32 40l-9.4 4.8 1.8-10.4-7.6-7.4 10.5-1.5Z"/><circle class="zw-brand-icon__seal" cx="32" cy="32" r="1.8"/>',
  share: '<circle cx="44" cy="20" r="4.5"/><circle cx="19" cy="32" r="4.5"/><circle cx="44" cy="44" r="4.5"/><path d="m23 30 17-8m-17 12 17 8"/>',
  settings: '<path d="M32 17l4 4 6-1 2 6 5 3-3 5 1 6-6 2-4 5-5-3-5 3-4-5-6-2 1-6-3-5 5-3 2-6 6 1Z"/><circle class="zw-brand-icon__accent" cx="32" cy="32" r="6"/><circle class="zw-brand-icon__seal" cx="32" cy="32" r="1.7"/>',
  language: '<circle cx="32" cy="32" r="15"/><path d="M17 32h30M32 17c5 5 7 10 7 15s-2 10-7 15c-5-5-7-10-7-15s2-10 7-15Z"/>',
  history: '<circle cx="32" cy="32" r="15"/><path d="M32 23v10l7 4M21 20l-4 8 8-2"/>',
  message: '<path d="M17 20h30v21H29l-9 8v-8h-3Z"/><path class="zw-brand-icon__accent" d="M23 28h18m-18 6h12"/>',
  insight: '<path d="M32 15l3.2 12.8L48 31l-12.8 3.2L32 47l-3.2-12.8L16 31l12.8-3.2Z"/><circle class="zw-brand-icon__seal" cx="32" cy="31" r="1.8"/>',
  night: '<path d="M39 17a16 16 0 1 0 9 28 13 13 0 1 1-9-28Z"/><circle class="zw-brand-icon__accent" cx="45" cy="20" r="1.8"/>',
  day: '<circle cx="32" cy="32" r="8"/><path d="M32 16v5m0 22v5M16 32h5m22 0h5M21 21l4 4m14 14 4 4m0-22-4 4M21 43l4-4"/>',
  lock: '<rect x="21" y="28" width="22" height="18" rx="4"/><path d="M26 28v-6a6 6 0 0 1 12 0v6"/><circle class="zw-brand-icon__seal" cx="32" cy="37" r="1.8"/>',
  payment: '<rect x="16" y="21" width="32" height="22" rx="4"/><path d="M16 28h32M22 36h9"/>',

  bazi: '<rect x="13" y="19" width="8" height="27" rx="2"/><rect x="23" y="16" width="8" height="30" rx="2"/><rect x="33" y="18" width="8" height="28" rx="2"/><rect x="43" y="15" width="8" height="31" rx="2"/><path class="zw-brand-icon__accent" d="M15 24h4m6-3h4m6 3h4m6-4h4"/><circle class="zw-brand-icon__seal" cx="32" cy="50" r="1.8"/>',
  ziwei: '<rect x="17" y="17" width="30" height="30" rx="2"/><path d="M27 17v30m10-30v30M17 27h30M17 37h30"/><path class="zw-brand-icon__accent" d="m32 25 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/><circle class="zw-brand-icon__seal" cx="32" cy="32" r="1.6"/>',
  western: '<circle cx="32" cy="32" r="16"/><circle class="zw-brand-icon__accent" cx="32" cy="32" r="7"/><path d="M32 16v9m0 14v9M16 32h9m14 0h9M21 21l6 6m10 10 6 6m0-22-6 6M21 43l6-6"/><circle class="zw-brand-icon__seal" cx="32" cy="32" r="1.6"/>',
  indian: '<circle class="zw-brand-icon__accent" cx="32" cy="32" r="6"/><path d="M32 15l4 11 11-4-8 10 8 10-11-4-4 11-4-11-11 4 8-10-8-10 11 4Z"/><circle class="zw-brand-icon__seal" cx="32" cy="32" r="1.7"/>',
  qizheng: '<ellipse cx="32" cy="32" rx="18" ry="10"/><ellipse cx="32" cy="32" rx="10" ry="18" transform="rotate(35 32 32)"/><circle class="zw-brand-icon__seal" cx="32" cy="32" r="2"/><circle class="zw-brand-icon__accent" cx="16" cy="30" r="2"/><circle cx="24" cy="21" r="1.8"/><circle cx="40" cy="22" r="1.8"/><circle cx="48" cy="34" r="1.8"/><circle cx="39" cy="43" r="1.8"/><circle cx="24" cy="42" r="1.8"/>',
  past: '<path d="M17 32c5-10 12-10 15 0s10 10 15 0M17 32c5 10 12 10 15 0s10-10 15 0"/><path class="zw-brand-icon__accent" d="M20 22c6-7 18-8 25-1m-1 22c-7 5-18 4-24-2"/><circle class="zw-brand-icon__seal" cx="32" cy="32" r="1.8"/>',
  numerology: '<path d="m32 16 17 30H15Z"/><path d="M32 16v30M15 46l17-15 17 15"/><circle class="zw-brand-icon__seal" cx="32" cy="16" r="2"/><circle class="zw-brand-icon__accent" cx="15" cy="46" r="2"/><circle class="zw-brand-icon__accent" cx="49" cy="46" r="2"/><circle cx="32" cy="31" r="2"/>',
  oracle: '<path d="M22 28h20v19H22Z"/><path d="M25 28l-2-13m9 13V13m7 15 3-14"/><path class="zw-brand-icon__accent" d="M22 34h20"/><circle class="zw-brand-icon__seal" cx="32" cy="40" r="1.8"/>',
  wardrobe: '<path d="m24 18 8 4 8-4 9 8-5 8v14H20V34l-5-8Z"/><path d="M27 20c1 5 9 5 10 0"/><circle class="zw-brand-icon__seal" cx="32" cy="34" r="1.8"/><circle class="zw-brand-icon__accent" cx="25" cy="38" r="1.5"/><circle class="zw-brand-icon__accent" cx="39" cy="38" r="1.5"/>',
  astronomy: '<circle cx="24" cy="34" r="8"/><circle class="zw-brand-icon__accent" cx="43" cy="26" r="4"/><path d="M14 43c8 5 25 1 34-9M16 22c9-6 25-5 34 3"/><circle class="zw-brand-icon__seal" cx="49" cy="17" r="1.8"/>',
  support: '<path d="M18 33a14 14 0 0 1 28 0v10h-7v-9h7M18 34v9h7v-9Z"/><path d="M39 46c-2 3-5 4-9 4"/><circle class="zw-brand-icon__seal" cx="29" cy="50" r="1.8"/>',
};

type BrandIconProps = {
  name: BrandIconName;
  className?: string;
  title?: string;
  size?: BrandIconSize;
};

const SIZE_PX: Record<BrandIconSize, number> = { sm: 20, md: 24, lg: 56 };

export function BrandIcon({ name, className = "", title, size = "md" }: BrandIconProps) {
  const px = SIZE_PX[size];
  return (
    <svg
      className={`zw-brand-icon zw-brand-icon--${size} ${className}`.trim()}
      viewBox="0 0 64 64"
      width={px}
      height={px}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <circle className="zw-brand-icon__ring" cx="32" cy="32" r="28.5" fill="none" strokeWidth="2" />
      <g
        className="zw-brand-icon__glyph"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: GLYPH[name] }}
      />
    </svg>
  );
}
