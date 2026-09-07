type BrandSealProps = {
  size?: "sm" | "lg";
  className?: string;
  decorative?: boolean;
};

/**
 * Header mark is intentionally typographic rather than the home-screen app icon.
 * A single crisp seal survives iPhone scaling better than a miniature poster/logo asset.
 */
export function BrandSeal({ size = "sm", className = "", decorative = false }: BrandSealProps) {
  return (
    <span
      className={`zhaowu-brand-seal zhaowu-brand-seal--${size} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "昭梧"}
      aria-hidden={decorative || undefined}
    >
      <span className="zhaowu-brand-seal__character" aria-hidden="true">昭</span>
      <span className="zhaowu-brand-seal__corner" aria-hidden="true" />
    </span>
  );
}
