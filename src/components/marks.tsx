import type { ImgHTMLAttributes } from "react";

type MarkProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "id" | "width" | "height" | "alt" | "loading"> & {
  id: string;
  size?: number;
  eager?: boolean;
  alt?: string;
};

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
  brand: "brand",
  "01": "lotus",
  "02": "wutong",
  "03": "crane",
  "04": "ruyi",
  "05": "vase",
  "06": "mountain",
  "07": "wheel",
  "08": "wutong",
  "09": "gate",
  "10": "ruyi",
  "11": "wheel",
  "12": "brand",
  "13": "wutong",
  "14": "lotus",
  "15": "wutong",
  "16": "vase",
  "17": "crane",
  jade: "wutong",
  "scatter-a": "lotus",
  "scatter-b": "crane",
  "scatter-c": "wheel",
  "scatter-d": "wutong",
  "scatter-e": "gate",
};

function isScatter(id: string) {
  return id.startsWith("scatter-");
}

export function Mark({ id, size = 64, eager = false, alt = "", className = "", ...props }: MarkProps) {
  const emblem = ID_TO_EMBLEM[id] ?? "brand";
  const classes = [
    "zhaowu-emblem",
    id === "brand" ? "zhaowu-emblem-brand" : "",
    isScatter(id) ? "zhaowu-emblem-scatter" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <img
      src={EMBLEMS[emblem]}
      width={size}
      height={size}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={classes}
      aria-hidden={alt ? undefined : true}
      {...props}
    />
  );
}

export function SealScatter() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <Mark id="scatter-a" className="absolute left-[1%] top-[13%] h-28 w-28 -rotate-12 opacity-[0.055]" />
      <Mark id="scatter-b" className="absolute right-[1%] top-[30%] h-36 w-36 rotate-6 opacity-[0.05]" />
      <Mark id="scatter-c" className="absolute left-[5%] top-[55%] h-32 w-32 rotate-12 opacity-[0.045]" />
      <Mark id="scatter-d" className="absolute right-[4%] top-[69%] h-28 w-28 -rotate-6 opacity-[0.045]" />
      <Mark id="scatter-e" className="absolute bottom-[2%] left-[26%] h-40 w-40 opacity-[0.04]" />
    </div>
  );
}
