type BrandSealProps = {
  size?: "sm" | "lg";
  className?: string;
  decorative?: boolean;
};

const BRAND_LOGO = "/brand/zhaowu-logo-r59.png";

export function BrandSeal({ size = "sm", className = "", decorative = false }: BrandSealProps) {
  const sizeClass = size === "lg" ? "h-24 w-24 sm:h-28 sm:w-28" : "h-9 w-9 sm:h-10 sm:w-10";

  return (
    <span
      className={`inline-grid shrink-0 place-items-center ${sizeClass} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "昭梧"}
      aria-hidden={decorative || undefined}
    >
      <img src={BRAND_LOGO} alt="" className="h-full w-full object-contain" aria-hidden />
    </span>
  );
}
