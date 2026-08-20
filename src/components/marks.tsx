import type { ImgHTMLAttributes } from "react";

type MarkProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "id" | "width" | "height" | "alt" | "loading"> & { id: string; size?: number; eager?: boolean; alt?: string; };

const EMBLEMS = {
  brand: "/emblems/zhaowu-main-seal.svg",
  wutong: "/emblems/wutong-leaf-emblem.svg",
  ruyi: "/emblems/ruyi-emblem.svg",
  lotus: "/emblems/lotus-emblem.svg",
  vase: "/emblems/treasure-vase-emblem.svg",
  wheel: "/emblems/dharma-wheel-emblem.svg",
  gate: "/emblems/heaven-gate-emblem.svg",
  mountain: "/emblems/mountain-emblem.svg",
  crane: "/emblems/crane-feather-emblem.svg",
} as const;

type EmblemName = keyof typeof EMBLEMS;
const ID_TO_EMBLEM: Record<string, EmblemName> = {
  brand: "brand", "01": "lotus", "02": "wutong", "03": "crane", "04": "ruyi", "05": "vase", "06": "mountain", "07": "wheel", "08": "wutong", "09": "gate", "10": "ruyi", "11": "wheel", "12": "brand", "13": "wutong", "14": "lotus", "15": "wutong", "16": "vase", "17": "crane", jade: "wutong",
  "scatter-a": "brand", "scatter-b": "lotus", "scatter-c": "ruyi", "scatter-d": "vase", "scatter-e": "wheel", "scatter-f": "gate", "scatter-g": "mountain", "scatter-h": "crane", "scatter-i": "wutong",
};
function isScatter(id: string) { return id.startsWith("scatter-"); }
export function Mark({ id, size = 64, eager = false, alt = "", className = "", ...props }: MarkProps) {
  const emblem = ID_TO_EMBLEM[id] ?? "brand";
  const classes = ["zhaowu-emblem", id === "brand" ? "zhaowu-emblem-brand" : "", isScatter(id) ? "zhaowu-emblem-scatter" : "", className].filter(Boolean).join(" ");
  return <img src={EMBLEMS[emblem]} width={size} height={size} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} className={classes} aria-hidden={alt ? undefined : true} {...props} />;
}
export function SealScatter() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
      <Mark id="scatter-a" eager className="absolute left-[2%] top-[7%] h-11 w-11 -rotate-12 opacity-[0.20] sm:h-16 sm:w-16" />
      <Mark id="scatter-b" eager className="absolute right-[2%] top-[18%] h-12 w-12 rotate-6 opacity-[0.22] sm:h-16 sm:w-16" />
      <Mark id="scatter-c" eager className="absolute left-[4%] top-[31%] h-10 w-10 rotate-12 opacity-[0.18] sm:h-14 sm:w-14" />
      <Mark id="scatter-d" eager className="absolute right-[3%] top-[43%] h-12 w-12 -rotate-6 opacity-[0.21] sm:h-16 sm:w-16" />
      <Mark id="scatter-e" eager className="absolute left-[2%] top-[56%] h-11 w-11 rotate-6 opacity-[0.18] sm:h-14 sm:w-14" />
      <Mark id="scatter-f" eager className="absolute right-[5%] top-[66%] h-12 w-12 -rotate-3 opacity-[0.20] sm:h-16 sm:w-16" />
      <Mark id="scatter-g" eager className="absolute left-[4%] top-[76%] h-11 w-11 rotate-3 opacity-[0.18] sm:h-14 sm:w-14" />
      <Mark id="scatter-h" eager className="absolute right-[2%] top-[85%] h-12 w-12 rotate-12 opacity-[0.21] sm:h-16 sm:w-16" />
      <Mark id="scatter-i" eager className="absolute left-[45%] top-[92%] h-10 w-10 -rotate-6 opacity-[0.16] sm:h-14 sm:w-14" />
    </div>
  );
}
