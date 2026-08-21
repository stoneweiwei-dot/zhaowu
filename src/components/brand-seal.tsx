type BrandSealProps = {
  size?: "sm" | "lg";
  className?: string;
  decorative?: boolean;
};

export function BrandSeal({ size = "sm", className = "", decorative = false }: BrandSealProps) {
  const sizeClass = size === "lg" ? "h-24 w-24 text-[25px] sm:h-28 sm:w-28 sm:text-[29px]" : "h-9 w-9 text-[11px] sm:h-10 sm:w-10 sm:text-xs";

  return (
    <span
      className={`inline-grid shrink-0 place-items-center border border-[#8f342a] bg-[#9d4033] p-[3px] shadow-[0_5px_14px_rgba(84,38,29,.16)] ${sizeClass} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "昭梧"}
      aria-hidden={decorative || undefined}
    >
      <span className="grid h-full w-full grid-rows-2 place-items-center border border-[#f1ddbd]/55 font-display font-semibold leading-none tracking-[0.06em] text-[#f7ead2]">
        <span>昭</span>
        <span>梧</span>
      </span>
    </span>
  );
}
