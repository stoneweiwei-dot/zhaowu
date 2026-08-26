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

/** Visible random scatter pool — real emblem assets, not thin line ornaments. */
const SCATTER_POOL = [
  "/emblems/lotus-emblem.svg",
  "/emblems/dharma-wheel-emblem.svg",
  "/emblems/modern-endless-knot-emblem.svg",
  "/emblems/modern-golden-fish-emblem.svg",
  "/emblems/crane-feather-emblem.svg",
  "/emblems/ruyi-emblem.svg",
  "/emblems/treasure-vase-emblem.svg",
  "/emblems/modern-gourd-emblem.svg",
] as const;

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

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function buildScatter(seed: number, count = 6): ScatterItem[] {
  const rand = mulberry32(seed);
  const items: ScatterItem[] = [];
  const remaining = [...SCATTER_POOL];
  const used: Array<{ side: "left" | "right"; top: number }> = [];

  for (let i = 0; i < Math.min(count, remaining.length); i += 1) {
    const side: "left" | "right" = rand() < 0.5 ? "left" : "right";
    let top = 6 + rand() * 88;
    let tries = 0;
    while (tries < 24 && used.some((u) => u.side === side && Math.abs(u.top - top) < 12)) {
      top = 6 + rand() * 88;
      tries += 1;
    }
    used.push({ side, top });

    const left = side === "left" ? 0.5 + rand() * 12 : 87 + rand() * 12;
    const assetIndex = Math.floor(rand() * remaining.length);
    const [src = SCATTER_POOL[0]] = remaining.splice(assetIndex, 1);

    items.push({
      key: `s-${i}-${src}`,
      src,
      left,
      top,
      size: 42 + Math.floor(rand() * 36),
      rotate: -18 + rand() * 36,
      opacity: 0.42 + rand() * 0.28,
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

export function SealScatter({ seedKey = "home" }: { seedKey?: string }) {
  const items = useMemo(() => {
    const pathname = typeof window === "undefined" ? seedKey : window.location.pathname;
    const routeSeed = hashSeed(`${seedKey}:${pathname}`);
    const visitJitter =
      typeof window === "undefined"
        ? 108
        : ((Date.now() >>> 0) ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    const count = 5 + (visitJitter % 3);
    return buildScatter((routeSeed ^ visitJitter) >>> 0, count);
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
