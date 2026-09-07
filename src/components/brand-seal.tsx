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
 * Use the same static brand asset as the installed-site icon.
 * Do not embed a JPEG data URI here: it makes the header logo hard to inspect,
 * easy to crop incorrectly on iOS, and duplicates tens of KB in the JS bundle.
 */
const OFFICIAL_MARK = "/apple-touch-icon.png";

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
