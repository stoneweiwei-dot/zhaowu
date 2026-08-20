import type { ReactNode, SVGProps } from "react";

type MarkProps = Omit<SVGProps<SVGSVGElement>, "id"> & {
  id: string;
  size?: number;
  eager?: boolean;
  alt?: string;
};

const LABELS: Record<string, string> = {
  "01": "莲",
  "02": "焰",
  "03": "鹤",
  "04": "如意",
  "05": "瓶",
  "06": "山",
  "07": "轮",
  "08": "日云",
  "09": "门",
  "10": "灯",
  "11": "盘",
  "12": "珠",
  "13": "芝",
  "14": "双鱼",
  "15": "祥云",
  "16": "宝瓶",
  "17": "镜",
  jade: "玉",
};

function BadgeBase() {
  return (
    <>
      <circle cx="50" cy="50" r="44" fill="currentColor" opacity=".075" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".32" />
      <path d="M50 6l3 5-3 5-3-5 3-5ZM50 94l-3-5 3-5 3 5-3 5ZM6 50l5-3 5 3-5 3-5-3ZM94 50l-5 3-5-3 5-3 5 3Z" fill="currentColor" stroke="none" opacity=".45" />
    </>
  );
}

function Lotus() {
  return (
    <>
      <path d="M50 24c7 9 10 18 7 27 7-7 14-10 21-9-1 11-7 20-18 25 7-1 13 1 18 5-8 7-17 10-28 10S30 79 22 72c5-4 11-6 18-5-11-5-17-14-18-25 7-1 14 2 21 9-3-9 0-18 7-27Z" fill="currentColor" opacity=".88" stroke="none" />
      <path d="M50 33v38M34 48c5 5 9 10 16 18M66 48c-5 5-9 10-16 18" fill="none" stroke="var(--color-cream, #f7efe2)" strokeWidth="2.2" opacity=".72" />
    </>
  );
}

function Flame() {
  return (
    <>
      <path d="M51 20c10 13 14 24 8 35 7-5 14-1 15 7 1 12-10 21-24 21S25 74 26 62c1-8 8-12 15-7-6-11-2-22 10-35Z" fill="currentColor" opacity=".88" stroke="none" />
      <path d="M50 43c6 7 8 13 4 20 4-2 8 1 8 5 0 6-6 10-12 10s-12-4-12-10c0-4 4-7 8-5-4-7-2-13 4-20Z" fill="var(--color-cream, #f7efe2)" opacity=".86" stroke="none" />
    </>
  );
}

function Crane() {
  return (
    <>
      <ellipse cx="49" cy="59" rx="22" ry="15" fill="currentColor" opacity=".88" stroke="none" />
      <path d="M52 54c8-8 12-16 10-23-1-6 3-11 9-11 5 0 8 4 8 8 0 5-5 8-10 7-3 0-5 2-4 5 2 8-2 16-8 22Z" fill="currentColor" stroke="none" />
      <path d="M77 25l12 3-11 5Z" fill="currentColor" stroke="none" />
      <path d="M35 61 17 52c4 12 12 19 25 22M55 64l20-16c-2 12-8 21-19 28" fill="currentColor" opacity=".88" stroke="none" />
      <path d="M43 71 36 86M55 72l3 14M31 86h10M54 86h10" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="72" cy="27" r="1.8" fill="var(--color-cream, #f7efe2)" stroke="none" />
    </>
  );
}

function Ruyi() {
  return (
    <>
      <path d="M31 28c0-10 12-15 20-7 5-9 19-7 21 3 11 0 15 14 7 21-8 8-20 6-27 0L37 62c-5 6-4 13 2 17 5 4 12 3 17-2l11-12" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="67" cy="66" r="7" fill="currentColor" opacity=".82" stroke="none" />
    </>
  );
}

function Vase() {
  return (
    <>
      <path d="M39 20h22v8H39zM42 30h16l-2 11c10 7 15 17 13 29-2 12-9 18-19 18s-17-6-19-18c-2-12 3-22 13-29l-2-11Z" fill="currentColor" opacity=".88" stroke="none" />
      <path d="M36 55c9 5 19 5 28 0M35 68c10 5 20 5 30 0" fill="none" stroke="var(--color-cream, #f7efe2)" strokeWidth="2.2" opacity=".75" />
    </>
  );
}

function Mountain() {
  return (
    <>
      <path d="M13 76 34 43l10 13 14-28 29 48Z" fill="currentColor" opacity=".9" stroke="none" />
      <path d="M21 76 35 55l9 12 14-25 20 34Z" fill="var(--color-cream, #f7efe2)" opacity=".72" stroke="none" />
      <path d="M15 82c13-5 24-4 34 1 11 5 23 5 36-1" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="72" cy="25" r="8" fill="currentColor" opacity=".72" stroke="none" />
    </>
  );
}

function Wheel() {
  return (
    <>
      <circle cx="50" cy="54" r="29" fill="none" stroke="currentColor" strokeWidth="7" />
      <circle cx="50" cy="54" r="9" fill="currentColor" stroke="none" />
      <path d="M50 25v20M50 63v20M21 54h20M59 54h20M30 34l14 14M56 60l14 14M70 34 56 48M44 60 30 74" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </>
  );
}

function SunCloud() {
  return (
    <>
      <circle cx="61" cy="34" r="15" fill="currentColor" opacity=".88" stroke="none" />
      <path d="M61 14v8M42 19l6 6M80 19l-6 6M83 34h8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 65c-3-9 4-17 14-16 3-12 20-15 28-5 7-8 21-4 22 7 10 0 14 13 7 19-4 4-9 5-17 5H31c-7 0-11-3-13-10Z" fill="currentColor" opacity=".9" stroke="none" />
      <path d="M35 80c8 5 17 6 26 2 5-2 9-5 13-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".75" />
    </>
  );
}

function Gate() {
  return (
    <>
      <path d="M18 33c10 2 18 0 25-7 5 5 10 5 15 0 7 7 15 9 24 7l-5 8H23l-5-8Z" fill="currentColor" opacity=".9" stroke="none" />
      <rect x="28" y="41" width="10" height="39" rx="2" fill="currentColor" />
      <rect x="62" y="41" width="10" height="39" rx="2" fill="currentColor" />
      <rect x="40" y="47" width="20" height="33" rx="2" fill="currentColor" opacity=".82" />
      <circle cx="50" cy="61" r="3" fill="var(--color-cream, #f7efe2)" stroke="none" />
      <path d="M22 82h56" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </>
  );
}

function Lantern() {
  return (
    <>
      <rect x="38" y="20" width="24" height="7" rx="3" fill="currentColor" />
      <path d="M34 31h32c5 8 7 17 5 27-2 13-10 20-21 20S31 71 29 58c-2-10 0-19 5-27Z" fill="currentColor" opacity=".9" stroke="none" />
      <path d="M34 43h32M31 57h38M39 31v47M61 31v47" fill="none" stroke="var(--color-cream, #f7efe2)" strokeWidth="2" opacity=".66" />
      <path d="M43 80h14M46 85h8M48 89h4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

function Compass() {
  return (
    <>
      <circle cx="50" cy="53" r="31" fill="none" stroke="currentColor" strokeWidth="6" />
      <circle cx="50" cy="53" r="20" fill="currentColor" opacity=".14" stroke="currentColor" strokeWidth="2" />
      <path d="M50 34c10 0 19 8 19 19-6-7-13-9-19-5-6 4-13 2-19-5 4-6 10-9 19-9Zm0 38c-10 0-19-8-19-19 6 7 13 9 19 5 6-4 13-2 19 5-4 6-10 9-19 9Z" fill="currentColor" opacity=".78" stroke="none" />
      <circle cx="42" cy="43" r="3" fill="var(--color-cream, #f7efe2)" stroke="none" />
      <circle cx="58" cy="63" r="3" fill="currentColor" stroke="none" />
    </>
  );
}

function Pearl() {
  return (
    <>
      <circle cx="50" cy="52" r="25" fill="currentColor" opacity=".88" stroke="none" />
      <circle cx="41" cy="42" r="8" fill="white" opacity=".48" stroke="none" />
      <path d="M50 18v10M50 76v10M16 52h10M74 52h10M27 29l7 7M73 29l-7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M31 82c7-7 13-9 19-5 6-4 12-2 19 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

function Lingzhi() {
  return (
    <>
      <path d="M24 50c-10-4-9-18 1-23 7-3 14 0 18 6 5-14 24-16 32-4 12-2 18 12 10 21-6 7-18 8-29 4-10 4-22 4-32-4Z" fill="currentColor" opacity=".9" stroke="none" />
      <path d="M36 39c9-6 20-6 29 0M31 48c12-5 27-4 39 1" fill="none" stroke="var(--color-cream, #f7efe2)" strokeWidth="2.2" opacity=".72" />
      <path d="M56 54c-1 14-7 25-17 34M56 66c8-3 15-1 19 5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </>
  );
}

function DoubleFish() {
  return (
    <>
      <path d="M19 43c11-17 31-22 47-12-4 15-18 25-33 23-7-1-12-5-14-11Zm62 14c-11 17-31 22-47 12 4-15 18-25 33-23 7 1 12 5 14 11Z" fill="currentColor" opacity=".9" stroke="none" />
      <path d="M22 41 11 32l3 17M78 59l11 9-3-17" fill="currentColor" stroke="none" />
      <circle cx="55" cy="34" r="2.5" fill="var(--color-cream, #f7efe2)" stroke="none" />
      <circle cx="45" cy="66" r="2.5" fill="var(--color-cream, #f7efe2)" stroke="none" />
    </>
  );
}

function Cloud() {
  return (
    <>
      <path d="M17 58c-4-9 4-18 14-17 3-12 20-16 29-6 8-8 22-4 23 8 11 0 15 13 8 20-4 5-10 6-18 6H31c-7 0-12-4-14-11Z" fill="currentColor" opacity=".9" stroke="none" />
      <path d="M34 70c5 8 13 12 22 11 8-1 15-5 20-11M42 80c2 5 6 8 11 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

function Mirror() {
  return (
    <>
      <circle cx="50" cy="48" r="28" fill="currentColor" opacity=".88" stroke="none" />
      <circle cx="50" cy="48" r="20" fill="var(--color-cream, #f7efe2)" opacity=".85" stroke="none" />
      <circle cx="50" cy="48" r="7" fill="currentColor" opacity=".7" stroke="none" />
      <path d="M50 76v11M39 88h22" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M35 32c7-5 15-7 24-5" stroke="white" strokeWidth="3" strokeLinecap="round" opacity=".42" />
    </>
  );
}

function Pendant() {
  return (
    <>
      <path d="M50 14c17 0 29 12 29 28 0 20-13 33-29 47-16-14-29-27-29-47 0-16 12-28 29-28Z" fill="currentColor" opacity=".88" stroke="none" />
      <circle cx="50" cy="39" r="11" fill="var(--color-cream, #f7efe2)" stroke="none" />
      <path d="M34 59c10 6 22 6 32 0M40 70c7 4 13 4 20 0" stroke="var(--color-cream, #f7efe2)" strokeWidth="2.5" strokeLinecap="round" opacity=".78" />
    </>
  );
}

function BrandGlyph() {
  return (
    <>
      <circle cx="50" cy="50" r="42" fill="currentColor" opacity=".09" stroke="currentColor" strokeWidth="2.2" />
      <path d="M50 19c13 7 20 18 18 31-2 16-11 25-18 31-7-6-16-15-18-31-2-13 5-24 18-31Z" fill="currentColor" opacity=".84" stroke="none" />
      <path d="M50 29v41M50 42l-11-7M50 49l13-8M50 57l-12 8M50 63l10 7" stroke="var(--color-cream, #f7efe2)" strokeWidth="2.6" strokeLinecap="round" />
    </>
  );
}

function Glyph({ id }: { id: string }): ReactNode {
  switch (id) {
    case "brand": return <BrandGlyph />;
    case "01": return <Lotus />;
    case "02": return <Flame />;
    case "03": return <Crane />;
    case "04": return <Ruyi />;
    case "05": return <Vase />;
    case "06": return <Mountain />;
    case "07": return <Wheel />;
    case "08": return <SunCloud />;
    case "09": return <Gate />;
    case "10": return <Lantern />;
    case "11": return <Compass />;
    case "12": return <Pearl />;
    case "13": return <Lingzhi />;
    case "14": return <DoubleFish />;
    case "15": return <Cloud />;
    case "16": return <Vase />;
    case "17": return <Mirror />;
    case "jade": return <Pendant />;
    case "scatter-a": return <Lotus />;
    case "scatter-b": return <Crane />;
    case "scatter-c": return <Wheel />;
    case "scatter-d": return <Lingzhi />;
    case "scatter-e": return <Gate />;
    default: return <Pearl />;
  }
}

function isScatter(id: string) {
  return id.startsWith("scatter-");
}

export function Mark({ id, size = 64, eager: _eager, alt = "", className = "", ...props }: MarkProps) {
  const label = LABELS[id];
  const showLabel = Boolean(label) && !isScatter(id) && id !== "brand";
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden={alt ? undefined : true}
      aria-label={alt || undefined}
      role={alt ? "img" : undefined}
      {...props}
    >
      {!isScatter(id) && id !== "brand" ? <BadgeBase /> : null}
      <g transform={showLabel ? "translate(0 -5) scale(0.92) translate(4.35 4.35)" : undefined}>
        <Glyph id={id} />
      </g>
      {showLabel ? (
        <g>
          <rect x="29" y="77" width="42" height="17" rx="8.5" fill="var(--color-cream, #f7efe2)" stroke="currentColor" strokeWidth="1.8" />
          <text
            x="50"
            y="89.2"
            textAnchor="middle"
            fill="currentColor"
            stroke="none"
            fontFamily="Songti SC, STSong, Noto Serif CJK TC, serif"
            fontSize={label.length > 1 ? 10 : 12.5}
            fontWeight="700"
            letterSpacing={label.length > 1 ? 0.4 : 0}
          >
            {label}
          </text>
        </g>
      ) : null}
    </svg>
  );
}

export function SealScatter() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-cinnabar" aria-hidden>
      <Mark id="scatter-a" className="absolute left-[1%] top-[13%] h-28 w-28 -rotate-12 opacity-[0.055]" />
      <Mark id="scatter-b" className="absolute right-[1%] top-[30%] h-36 w-36 rotate-6 opacity-[0.05]" />
      <Mark id="scatter-c" className="absolute left-[5%] top-[55%] h-32 w-32 rotate-12 opacity-[0.045]" />
      <Mark id="scatter-d" className="absolute right-[4%] top-[69%] h-28 w-28 -rotate-6 opacity-[0.045]" />
      <Mark id="scatter-e" className="absolute bottom-[2%] left-[26%] h-40 w-40 opacity-[0.04]" />
    </div>
  );
}
