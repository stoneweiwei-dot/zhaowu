type BrandSealProps = {
  size?: "sm" | "lg";
  className?: string;
  decorative?: boolean;
};

const SIZE_CLASS = {
  sm: "h-12 w-12 sm:h-14 sm:w-14",
  lg: "h-24 w-24 sm:h-28 sm:w-28",
} as const;

export function BrandSeal({ size = "sm", className = "", decorative = false }: BrandSealProps) {
  return (
    <span
      className={`zhaowu-brand-seal inline-grid shrink-0 place-items-center overflow-hidden rounded-[10px] bg-[#fbf5e9] shadow-[0_5px_14px_rgba(84,38,29,.12)] ${SIZE_CLASS[size]} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "昭梧"}
      aria-hidden={decorative || undefined}
    >
      <img
        src="/icons/zhaowu-lotus-192.png"
        alt=""
        width={112}
        height={112}
        className="h-full w-full object-cover"
        decoding="async"
      />
    </span>
  );
}
