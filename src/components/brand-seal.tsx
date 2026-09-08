type BrandSealProps = {
  size?: "sm" | "lg";
  className?: string;
  decorative?: boolean;
};

/**
 * A compact Wutong-tree mark for the site header.
 * It stays vector-sharp at iPhone sizes and avoids shrinking the detailed app icon
 * or turning the wordmark into another boxed character.
 */
export function BrandSeal({ size = "sm", className = "", decorative = false }: BrandSealProps) {
  return (
    <span
      className={`zhaowu-brand-seal zhaowu-brand-seal--${size} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "昭梧"}
      aria-hidden={decorative || undefined}
    >
      <svg className="zhaowu-brand-seal__mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle className="zhaowu-brand-seal__paper" cx="24" cy="24" r="22" />
        <circle className="zhaowu-brand-seal__sun" cx="24" cy="12.25" r="3.15" />
        <path className="zhaowu-brand-seal__canopy" d="M24 31.8C17.3 30.1 13.2 25.5 13.1 18.8c5.9.15 9.6 2.55 10.9 7.35 1.3-4.8 5-7.2 10.9-7.35-.1 6.7-4.2 11.3-10.9 13Z" />
        <path className="zhaowu-brand-seal__branch" d="M24 18.5v18.2M24 28.7l-6.2-5.8M24 28.7l6.2-5.8" />
        <path className="zhaowu-brand-seal__ground" d="M17 37.1c4.55-1.3 9.45-1.3 14 0" />
      </svg>
    </span>
  );
}
