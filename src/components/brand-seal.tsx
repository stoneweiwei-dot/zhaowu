type BrandSealProps = {
  size?: "sm" | "lg";
  className?: string;
  decorative?: boolean;
};

const OFFICIAL_MARK = "/apple-touch-icon-v3.png";

/** Official mark. Gourd asset swap waits until public/brand files are on main. */
export function BrandSeal({ size = "sm", className = "", decorative = false }: BrandSealProps) {
  return (
    <span
      className={`zhaowu-brand-seal zhaowu-brand-seal--${size} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "昭梧"}
      aria-hidden={decorative || undefined}
    >
      <img className="zhaowu-brand-seal__image" src={OFFICIAL_MARK} alt="" width={180} height={180} decoding="async" />
    </span>
  );
}
