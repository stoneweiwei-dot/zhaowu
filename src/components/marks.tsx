import type { ReactNode, SVGProps } from "react";

type MarkProps = Omit<SVGProps<SVGSVGElement>, "id"> & {
  id: string;
  size?: number;
  eager?: boolean;
  alt?: string;
};

function Glyph({ id }: { id: string }): ReactNode {
  switch (id) {
    case "brand":
      return (
        <>
          <circle cx="50" cy="50" r="34" opacity=".34" />
          <path d="M50 18c8 8 13 17 13 27 0 13-6 24-13 37-7-13-13-24-13-37 0-10 5-19 13-27Z" />
          <path d="M50 28c-8 7-13 14-15 23M50 28c8 7 13 14 15 23M38 58c8-4 16-4 24 0" opacity=".8" />
          <path d="M28 71c8-2 15 0 22 6 7-6 14-8 22-6" opacity=".58" />
        </>
      );
    case "01": // 梧叶
      return (
        <>
          <path d="M50 18c-16 8-25 22-23 37 2 17 13 25 23 29 10-4 21-12 23-29 2-15-7-29-23-37Z" />
          <path d="M50 27v47M50 41l-13-8M50 50l15-10M50 59l-15 10M50 66l13 7" opacity=".72" />
        </>
      );
    case "02": // 如意云
      return (
        <>
          <path d="M25 56c-8-4-9-14-3-20 7-7 18-3 20 5 4-12 23-13 28-1 10-5 20 3 17 13-2 8-10 11-18 9H32c-7 0-10-1-13-6Z" />
          <path d="M38 63c3 8 12 13 21 11 7-1 12-5 16-10M47 69c1 6 5 10 11 12" opacity=".65" />
        </>
      );
    case "03": // 宝珠
      return (
        <>
          <circle cx="50" cy="47" r="17" />
          <path d="M50 20v9M50 65v16M23 47h10M67 47h10M31 28l7 7M69 28l-7 7" opacity=".7" />
          <path d="M32 74c7-6 14-8 18-5 4-3 11-1 18 5" />
        </>
      );
    case "04": // 山水
      return (
        <>
          <path d="M16 68 34 42l10 13 13-25 27 38" />
          <path d="M21 74c12-5 22-4 31 0 10 5 20 4 29-1M29 80c9-3 17-2 24 1 7 3 15 3 24 0" opacity=".62" />
          <circle cx="71" cy="27" r="7" opacity=".55" />
        </>
      );
    case "05": // 鹤羽
      return (
        <>
          <path d="M69 20C46 24 29 39 27 61c-1 12 5 20 13 23 3-21 14-38 29-64Z" />
          <path d="M62 29C48 41 39 57 35 78M51 42l-13 4M46 53l-12 7M42 64l-8 7" opacity=".72" />
        </>
      );
    case "06": // 玉璧
      return (
        <>
          <circle cx="50" cy="50" r="31" />
          <circle cx="50" cy="50" r="13" />
          <path d="M50 19v18M50 63v18M19 50h18M63 50h18" opacity=".45" />
          <path d="M29 29l12 12M59 59l12 12M71 29 59 41M41 59 29 71" opacity=".45" />
        </>
      );
    case "07": // 星盘
      return (
        <>
          <circle cx="50" cy="50" r="30" />
          <circle cx="50" cy="50" r="7" />
          <path d="M50 20v23M50 57v23M20 50h23M57 50h23M29 29l16 16M55 55l16 16M71 29 55 45M45 55 29 71" opacity=".52" />
        </>
      );
    case "08": // 如意
      return (
        <>
          <path d="M38 28c-3-8 5-15 13-11 4-8 17-6 18 4 8-1 13 8 8 14-5 7-14 7-20 3l-8 9" />
          <path d="M49 47 31 68c-5 6 3 15 10 10l20-18" />
          <path d="M31 68c4-2 8 2 6 6" opacity=".7" />
        </>
      );
    case "09": // 莲
      return (
        <>
          <path d="M50 77c-4-16-1-30 0-43 1 13 4 27 0 43Z" />
          <path d="M50 66c-13-5-20-15-20-27 11 3 18 11 20 22M50 66c13-5 20-15 20-27-11 3-18 11-20 22" />
          <path d="M28 72c7 5 14 7 22 7s15-2 22-7" opacity=".62" />
        </>
      );
    case "10": // 双鱼
      return (
        <>
          <path d="M26 46c9-16 31-20 45-9-4 14-17 23-31 21-6-1-11-5-14-12Z" />
          <path d="M74 54c-9 16-31 20-45 9 4-14 17-23 31-21 6 1 11 5 14 12Z" />
          <circle cx="56" cy="38" r="2.5" fill="currentColor" stroke="none" />
          <circle cx="44" cy="62" r="2.5" fill="currentColor" stroke="none" />
        </>
      );
    case "11": // 天圆地方
      return (
        <>
          <circle cx="50" cy="50" r="32" />
          <rect x="35" y="35" width="30" height="30" rx="3" />
          <path d="M50 18v17M50 65v17M18 50h17M65 50h17" opacity=".56" />
        </>
      );
    case "12": // 灵芝
      return (
        <>
          <path d="M31 47c-12-2-12-17-1-21 5-2 10 0 13 4 5-11 22-11 27 0 10-2 16 10 9 17-6 6-17 5-25 2-8 3-17 4-23-2Z" />
          <path d="M54 49c-1 15-5 25-13 33M54 59c7-2 12 0 15 5" />
        </>
      );
    case "13": // 古印
      return (
        <>
          <rect x="25" y="25" width="50" height="50" rx="6" />
          <path d="M34 39h12v12H34zM54 39h12M60 39v12M34 59h12M40 59v10M54 58h12v11H54z" opacity=".78" />
        </>
      );
    case "14": // 结绳
      return (
        <>
          <path d="M50 17c7 8 7 15 0 22-7-7-7-14 0-22ZM50 39c13 0 20 7 20 17 0 11-9 16-20 16S30 67 30 56c0-10 7-17 20-17Z" />
          <path d="M39 51c8 9 14 9 22 0M40 63c8-8 13-8 20 0M50 72v12" opacity=".7" />
        </>
      );
    case "15": // 日月
      return (
        <>
          <circle cx="38" cy="42" r="17" />
          <path d="M66 30c-8 3-13 10-13 19 0 10 7 18 17 20-4 3-9 5-14 5-15 0-27-12-27-27 0-13 9-24 21-27" opacity=".72" />
          <path d="M38 19v8M38 57v8M15 42h8M53 42h8" opacity=".5" />
        </>
      );
    case "16": // 祥云结
      return (
        <>
          <path d="M23 50c-7-6-3-18 7-18 4-10 19-10 24-1 7-7 20-3 20 8 10 2 11 16 2 20H30c-8 0-12-4-12-9" />
          <path d="M39 59c0 9 5 14 12 14 8 0 12-5 12-14M51 73v11" opacity=".68" />
        </>
      );
    case "17": // 铜镜
      return (
        <>
          <circle cx="50" cy="45" r="26" />
          <circle cx="50" cy="45" r="8" />
          <path d="M50 71v13M40 84h20M50 19v10M24 45h10M66 45h10" opacity=".56" />
        </>
      );
    case "jade": // 玉佩
      return (
        <>
          <path d="M50 15c14 0 25 10 25 24 0 18-12 32-25 46-13-14-25-28-25-46 0-14 11-24 25-24Z" />
          <circle cx="50" cy="38" r="9" />
          <path d="M36 57c8 4 20 4 28 0M43 69c5 2 9 2 14 0" opacity=".66" />
        </>
      );
    case "scatter-a":
      return <Glyph id="01" />;
    case "scatter-b":
      return <Glyph id="02" />;
    case "scatter-c":
      return <Glyph id="09" />;
    case "scatter-d":
      return <Glyph id="12" />;
    case "scatter-e":
      return <Glyph id="04" />;
    default:
      return (
        <>
          <circle cx="50" cy="50" r="30" />
          <path d="M29 57c12-18 30-27 48-27-7 19-21 35-42 43" />
        </>
      );
  }
}

export function Mark({ id, size = 64, eager: _eager, alt = "", className = "", ...props }: MarkProps) {
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
      <g fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <Glyph id={id} />
      </g>
    </svg>
  );
}

export function SealScatter() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-cinnabar" aria-hidden>
      <Mark id="scatter-a" className="absolute left-[2%] top-[14%] h-24 w-24 -rotate-12 opacity-[0.055]" />
      <Mark id="scatter-b" className="absolute right-[1%] top-[31%] h-32 w-32 rotate-6 opacity-[0.045]" />
      <Mark id="scatter-c" className="absolute left-[7%] top-[56%] h-28 w-28 rotate-12 opacity-[0.04]" />
      <Mark id="scatter-d" className="absolute right-[6%] top-[70%] h-24 w-24 -rotate-6 opacity-[0.04]" />
      <Mark id="scatter-e" className="absolute bottom-[3%] left-[28%] h-36 w-36 opacity-[0.035]" />
    </div>
  );
}
