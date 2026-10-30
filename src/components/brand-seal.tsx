type BrandSealProps = {
  size?: "sm" | "lg";
  className?: string;
  decorative?: boolean;
};

const HEADER_MARK_144 = "/brand-ui/header-gourd-wordmark-r113-144.webp";
const HEADER_MARK_288 = "/brand-ui/header-gourd-wordmark-r113-288.webp";

/** Header uses the owner-provided gold-gourd + deep-blue 昭梧 source artwork, downscaled. The 1024 PNG stays for other uses. App/PWA icons use separate square outputs. */
export function BrandSeal({ size = "sm", className = "", decorative = false }: BrandSealProps) {
  const large = size === "lg";
  return (
    <span
      className={`zhaowu-brand-seal zhaowu-brand-seal--${size} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "昭梧"}
      aria-hidden={decorative || undefined}
    >
      <img
        className="zhaowu-brand-seal__image"
        src={large ? HEADER_MARK_288 : HEADER_MARK_144}
        srcSet={`${HEADER_MARK_144} 144w, ${HEADER_MARK_288} 288w`}
        sizes={large ? "92px" : "42px"}
        alt=""
        width={large ? 92 : 42}
        height={large ? 92 : 42}
        decoding="async"
      />
    </span>
  );
}
