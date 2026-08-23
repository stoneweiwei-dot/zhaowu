import { useMemo } from "react";
import type { ImgHTMLAttributes } from "react";

type MarkProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "id" | "width" | "height" | "alt" | "loading"
> & { id: string; size?: number; eager?: boolean; alt?: string };

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
  gourd: "/emblems/modern-gourd-emblem.svg",
  knot: "/emblems/modern-endless-knot-emblem.svg",
  bagua: "/emblems/modern-bagua-emblem.svg",
  conch: "/emblems/modern-conch-emblem.svg",
  fish: "/emblems/modern-golden-fish-emblem.svg",
  sword: "/emblems/modern-sword-emblem.svg",
  parasol: "/emblems/modern-parasol-emblem.svg",
  bell: "/emblems/modern-bell-emblem.svg",
  incense: "/emblems/modern-incense-emblem.svg",
  banner: "/emblems/modern-victory-banner-emblem.svg",
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
};

const SCATTER_POOL: EmblemName[] = [
  "lotus",
  "crane",
  "ruyi",
  "wheel",
  "gourd",
  "knot",
  "bagua",
  "vase",
  "mountain",
  "wutong",
  "conch",
  "fish",
  "sword",
  "parasol",
  "bell",
  "incense",
  "banner",
  "gate",
];

type ScatterItem = {
  key: string;
  src: string;
  left: number;
  top: number;
  size: number;
  rotate: number;
  opacity: number;
};

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildScatter(seed: number, count = 11): ScatterItem[] {
  const rand = mulberry32(seed);
  const items: ScatterItem[] = [];
  const used: Array<{ left: number; top: number }> = [];

  for (let i = 0; i < count; i += 1) {
    let left = 0;
    let top = 0;
    let tries = 0;
    do {
      left = 2 + rand() * 92;
      top = 3 + rand() * 90;
      tries += 1;
    } while (
      tries < 18 &&
      used.some((u) => Math.hypot(u.left - left, u.top - top) < 12)
    );
    used.push({ left, top });

    const name = SCATTER_POOL[Math.floor(rand() * SCATTER_POOL.length)] ?? "lotus";
    items.push({
      key: `s-${i}-${name}`,
      src: EMBLEMS[name],
      left,
      top,
      size: 34 + Math.floor(rand() * 42),
      rotate: -18 + rand() * 36,
      opacity: 0.11 + rand() * 0.14,
    });
  }
  return items;
}

export function Mark({ id, size = 64, eager = false, alt = "", className = "", ...props }: MarkProps) {
  const emblem = ID_TO_EMBLEM[id] ?? "brand";
  const classes = ["zhaowu-emblem", id === "brand" ? "zhaowu-emblem-brand" : "", className].filter(Boolean).join(" ");
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

/** Sitewide soft scatter: random positions each page visit, never a rigid strip. */
export function SealScatter({ seedKey = "home" }: { seedKey?: string }) {
  const items = useMemo(() => {
    const base =
      typeof window === "undefined"
        ? Array.from(seedKey).reduce((acc, ch) => acc + ch.charCodeAt(0), 1)
        : (Date.now() % 100000) +
          Array.from(`${seedKey}:${window.location.pathname}`).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return buildScatter(base || 108, 11);
  }, [seedKey]);

  return (
    <div className="zhaowu-seal-scatter pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
      {items.map((item) => (
        <img
          key={item.key}
          src={item.src}
          alt=""
          draggable={false}
          decoding="async"
          className="zhaowu-scatter-piece absolute"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            width: item.size,
            height: item.size,
            opacity: item.opacity,
            transform: `translate(-50%, -50%) rotate(${item.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
