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

/** 用户图集对应的传统吉祥主题 — 内联 SVG，全站可见散落 */
const PAINTED_SVG: Record<string, string> = {
  cloud:
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M12 40c-4 0-8-3-8-8s4-8 8-8c1-6 6-10 12-10 5 0 9 3 11 7 2-1 4-2 7-2 6 0 10 4 10 10 5 0 9 4 9 9s-4 9-9 9H12z" fill="#7eb8d4" opacity=".9"/><path d="M14 38c-3 0-6-2-6-6s3-6 6-6c1-5 5-8 10-8 4 0 7 2 9 6 1-1 3-1 5-1 5 0 8 3 8 8 4 0 7 3 7 7s-3 7-7 7H14z" fill="#c5e4f2"/></svg>`,
    ),
  crane:
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M18 42c8-10 16-14 28-12-6 2-10 6-12 12 6-2 12-2 18 2-10 2-18 0-24-4-2 4-6 8-12 10 2-4 2-6 2-8z" fill="#f5f5f0" stroke="#3a3a3a" stroke-width="1.2"/><path d="M44 28c2-6 6-10 12-12-4 4-6 8-6 14" stroke="#c45c3a" stroke-width="1.5" fill="none"/><circle cx="42" cy="30" r="1.5" fill="#1a1a1a"/></svg>`,
    ),
  lotus:
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M32 48c-6-4-10-10-10-16 0 0 4 2 10 2s10-2 10-2c0 6-4 12-10 16z" fill="#f2b8c6"/><path d="M32 46c-8-2-14-8-16-14 4 2 10 4 16 4s12-2 16-4c-2 6-8 12-16 14z" fill="#f7d0da"/><path d="M32 44c-4-8-4-16 0-22 4 6 4 14 0 22z" fill="#ffe8ee"/><path d="M20 50c4-2 8-2 12-2s8 0 12 2c-4 2-8 3-12 3s-8-1-12-3z" fill="#7bc47f"/></svg>`,
    ),
  peony:
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="30" r="8" fill="#f5c4d1"/><circle cx="24" cy="26" r="7" fill="#e89aaa"/><circle cx="40" cy="26" r="7" fill="#e89aaa"/><circle cx="26" cy="34" r="6" fill="#f0b0c0"/><circle cx="38" cy="34" r="6" fill="#f0b0c0"/><circle cx="32" cy="30" r="4" fill="#f7e0a8"/><path d="M28 44c2 4 4 6 4 6s2-2 4-6c-2 0-4 0-4 0s-2 0-4 0z" fill="#6aaa6e"/></svg>`,
    ),
  yinyang:
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" fill="#1a1a1a"/><path d="M32 10a22 22 0 0 1 0 44 11 11 0 0 1 0-22 11 11 0 0 0 0-22z" fill="#f5f5f0"/><circle cx="32" cy="21" r="4" fill="#1a1a1a"/><circle cx="32" cy="43" r="4" fill="#f5f5f0"/></svg>`,
    ),
  fu:
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="10" y="10" width="44" height="44" rx="4" transform="rotate(45 32 32)" fill="#d4a017" stroke="#b8860b" stroke-width="1.5"/><text x="32" y="38" text-anchor="middle" font-size="20" font-family="serif" font-weight="700" fill="#5c3a0a">福</text></svg>`,
    ),
  knot:
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M20 20h8v8h-8zM36 20h8v8h-8zM20 36h8v8h-8zM36 36h8v8h-8zM28 28h8v8h-8z" fill="none" stroke="#c9a227" stroke-width="3" stroke-linejoin="round"/><path d="M24 24h16v16H24z" fill="none" stroke="#e8c547" stroke-width="2"/></svg>`,
    ),
  fish:
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M10 32c8-12 24-16 36-10 4 2 8 6 10 10-2 4-6 8-10 10-12 6-28 2-36-10z" fill="#5b9fd4"/><path d="M46 32l12-8v16z" fill="#3a7eb0"/><circle cx="20" cy="30" r="2" fill="#fff"/></svg>`,
    ),
  mountain:
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M8 48L24 18l10 16 6-10 16 24H8z" fill="#6a9e7a"/><path d="M24 18l4 8 6-4-10-4z" fill="#e8f0e8"/><circle cx="48" cy="16" r="5" fill="#f0c060"/></svg>`,
    ),
  fan:
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M32 50L12 28c8-12 32-12 40 0L32 50z" fill="#f5e6d0" stroke="#c4a882" stroke-width="1.2"/><path d="M32 50L20 32M32 50L32 28M32 50L44 32" stroke="#c4a882" stroke-width="1"/><circle cx="28" cy="34" r="3" fill="#7eb8d4"/></svg>`,
    ),
  bamboo:
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="28" y="10" width="6" height="44" rx="2" fill="#5a9e5e"/><rect x="28" y="22" width="6" height="2" fill="#3d7a42"/><rect x="28" y="36" width="6" height="2" fill="#3d7a42"/><path d="M34 18c8-4 12-2 14 2M34 32c8-4 12-2 14 2" stroke="#5a9e5e" stroke-width="2" fill="none"/></svg>`,
    ),
  wheel:
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="20" fill="none" stroke="#4a6fa5" stroke-width="2.5"/><circle cx="32" cy="32" r="6" fill="#4a6fa5"/><g stroke="#4a6fa5" stroke-width="2"><path d="M32 12v14M32 38v14M12 32h14M38 32h14M18 18l10 10M36 36l10 10M46 18L36 28M28 36L18 46"/></g></svg>`,
    ),
};

const SCATTER_KEYS = Object.keys(PAINTED_SVG);

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

/** 全站随机散落：可见、错落、不挡阅读区 */
function buildScatter(seed: number, count = 8): ScatterItem[] {
  const rand = mulberry32(seed);
  const items: ScatterItem[] = [];
  const remaining = [...SCATTER_KEYS];
  const used: Array<{ side: "left" | "right"; top: number }> = [];

  for (let i = 0; i < Math.min(count, remaining.length); i += 1) {
    const side: "left" | "right" = rand() < 0.5 ? "left" : "right";
    let top = 6 + rand() * 88;
    let tries = 0;
    while (tries < 24 && used.some((u) => u.side === side && Math.abs(u.top - top) < 11)) {
      top = 6 + rand() * 88;
      tries += 1;
    }
    used.push({ side, top });

    const left = side === "left" ? 1 + rand() * 14 : 85 + rand() * 14;
    const nameIndex = Math.floor(rand() * remaining.length);
    const [name = "lotus"] = remaining.splice(nameIndex, 1);

    items.push({
      key: `s-${i}-${name}`,
      src: PAINTED_SVG[name] ?? PAINTED_SVG.lotus,
      left,
      top,
      size: 40 + Math.floor(rand() * 28),
      rotate: -20 + rand() * 40,
      opacity: 0.52 + rand() * 0.28,
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

/**
 * Sitewide auspicious scatter — traditional motifs, random per route visit.
 */
export function SealScatter({ seedKey = "home" }: { seedKey?: string }) {
  const items = useMemo(() => {
    const pathname = typeof window === "undefined" ? seedKey : window.location.pathname;
    const routeSeed = hashSeed(`${seedKey}:${pathname}`);
    const visitJitter =
      typeof window === "undefined"
        ? 108
        : ((Date.now() >>> 0) ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    return buildScatter((routeSeed ^ visitJitter) >>> 0, 8);
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
