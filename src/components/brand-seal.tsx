import "@/brand-ui-r97.css";
import { useBrandTheme } from "@/lib/brand-theme";

type BrandSealProps = {
  size?: "sm" | "lg";
  className?: string;
  decorative?: boolean;
};

const OFFICIAL_MARK = "/brand-ui/logo-primary.svg";
const NIGHT_MARK = "/brand-ui/logo-primary-night.svg";

/** Official circular 昭梧 lockup: pine, sun, cloud. Gourd is a special auspicious mark only. */
export function BrandSeal({ size = "sm", className = "", decorative = false }: BrandSealProps) {
  const { night } = useBrandTheme();
  return (
    <span
      className={`zhaowu-brand-seal zhaowu-brand-seal--${size} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "昭梧"}
      aria-hidden={decorative || undefined}
    >
      <img className="zhaowu-brand-seal__image" src={night ? NIGHT_MARK : OFFICIAL_MARK} alt="" width={200} height={200} decoding="async" />
    </span>
  );
}
