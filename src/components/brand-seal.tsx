import "@/brand-ui-r97.css";
import { useBrandTheme } from "@/lib/brand-theme";

type BrandSealProps = {
  size?: "sm" | "lg";
  className?: string;
  decorative?: boolean;
};

const HEADER_MARK = "/brand-ui/header-gourd-wordmark-r113.png";

/** Header uses the owner-provided gold-gourd + deep-blue 昭梧 source artwork. App/PWA icons use separate square outputs. */
export function BrandSeal({ size = "sm", className = "", decorative = false }: BrandSealProps) {
  const { night } = useBrandTheme();
  return (
    <span
      className={`zhaowu-brand-seal zhaowu-brand-seal--${size} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "昭梧"}
      aria-hidden={decorative || undefined}
    >
      <img className="zhaowu-brand-seal__image" src={HEADER_MARK} alt="" width={1024} height={1024} decoding="async" />
    </span>
  );
}
