type BrandSealProps = {
  size?: "sm" | "lg";
  className?: string;
  decorative?: boolean;
};

const SIZE_CLASS = {
  sm: "h-12 w-12 sm:h-14 sm:w-14",
  lg: "h-24 w-24 sm:h-28 sm:w-28",
} as const;

/**
 * Reuse the same versioned static mark as the current iPhone home-screen icon.
 * Keep the logo inspectable and uncropped instead of embedding a JPEG data URI.
 */
const OFFICIAL_MARK = "/apple-touch-icon-v3.png";

export function BrandSeal({ size = "sm", className = "", decorative = false }: BrandSealProps) {
  return (
    <span
      className={`zhaowu-brand-seal inline-grid shrink-0 place-items-center overflow-hidden rounded-[10px] bg-[#fbf5e9] ${SIZE_CLASS[size]} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "昭梧"}
      aria-hidden={decorative || undefined}
    >
      <img
        src={OFFICIAL_MARK}
        alt=""
        width={180}
        height={180}
        className="h-full w-full object-contain"
        decoding="async"
      />
    </span>
  );
}
