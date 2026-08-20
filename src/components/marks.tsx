import type { ReactNode, SVGProps } from "react";

type MarkProps = Omit<SVGProps<SVGSVGElement>, "id"> & {
  id: string;
  size?: number;
  eager?: boolean;
  alt?: string;
};

function Medallion({ children }: { children: ReactNode }) {
  return (
    <>
      <circle cx="50" cy="50" r="42" fill="currentColor" opacity=".055" stroke="none" />
      <circle cx="50" cy="50" r="41" strokeWidth="1.6" opacity=".32" />
      <circle cx="50" cy="50" r="36.5" strokeWidth="1" opacity=".18" strokeDasharray="1.8 4.6" />
      <path d="M50 8l2.4 3.8L50 15.5l-2.4-3.7L50 8Zm0 84-2.4-3.8L50 84.5l2.4 3.7L50 92ZM8 50l3.8-2.4 3.7 2.4-3.7 2.4L8 50Zm84 0-3.8 2.4-3.7-2.4 3.7-2.4L92 50Z" fill="currentColor" stroke="none" opacity=".38" />
      {children}
    </>
  );
}

function Glyph({ id }: { id: string }): ReactNode {
  switch (id) {
    case "brand":
      return (
        <Medallion>
          <circle cx="50" cy="31" r="11" fill="currentColor" opacity=".12" strokeWidth="2.4" />
          <path d="M50 18v7M37 22l4 6M63 22l-4 6M33 33h8M59 33h8" strokeWidth="2.2" opacity=".74" />
          <path d="M50 34c-11 6-17 15-15 25 2 12 9 19 15 23 6-4 13-11 15-23 2-10-4-19-15-25Z" fill="currentColor" opacity=".11" strokeWidth="2.8" />
          <path d="M50 40v32M50 49l-9-6M50 55l11-7M50 61l-10 7M50 66l9 6" strokeWidth="2.2" />
          <path d="M29 76c7-3 14-2 21 4 7-6 14-7 21-4" strokeWidth="2" opacity=".62" />
        </Medallion>
      );

    case "01": // 莲花
      return (
        <Medallion>
          <path d="M50 76c-4-15-3-27 0-39 3 12 4 24 0 39Z" fill="currentColor" opacity=".12" strokeWidth="2.5" />
          <path d="M49 70C38 64 31 54 31 42c10 2 17 9 19 20M51 70c11-6 18-16 18-28-10 2-17 9-19 20" fill="currentColor" opacity=".09" strokeWidth="2.6" />
          <path d="M36 67c-8-1-14-6-18-14 9-1 16 2 22 9M64 67c8-1 14-6 18-14-9-1-16 2-22 9" strokeWidth="2.2" />
          <path d="M28 75c7 4 14 6 22 6s15-2 22-6" strokeWidth="2.2" opacity=".7" />
        </Medallion>
      );

    case "02": // 火焰莲
      return (
        <Medallion>
          <path d="M50 18c7 9 12 15 8 24 7-4 12-1 13 6 1 8-6 14-13 17-3-8-6-14-8-22-2 8-5 14-8 22-8-3-14-9-13-17 1-7 6-10 13-6-4-9 1-15 8-24Z" fill="currentColor" opacity=".11" strokeWidth="2.8" />
          <path d="M50 42c5 6 7 11 4 18 4-2 7 0 8 4 1 6-5 10-12 13-7-3-13-7-12-13 1-4 4-6 8-4-3-7-1-12 4-18Z" strokeWidth="2.3" />
          <path d="M26 78c8 3 16 4 24 4s16-1 24-4M34 72c6 3 11 4 16 4s10-1 16-4" strokeWidth="1.9" opacity=".62" />
        </Medallion>
      );

    case "03": // 仙鹤
      return (
        <Medallion>
          <path d="M60 25c-5-5-12-3-13 3-1 5 3 8 8 8 4 0 7 3 6 7-2 8-12 10-18 16-5 5-7 11-6 18" strokeWidth="2.8" />
          <path d="M57 24l9 2-7 4" strokeWidth="2.2" />
          <path d="M40 54c-12-5-20-3-25 5 10-1 18 2 25 9M44 57c11-10 22-14 34-10-7 8-15 14-27 20" fill="currentColor" opacity=".08" strokeWidth="2.5" />
          <path d="M41 68l-8 15M50 67l4 16M28 84h10M50 84h10" strokeWidth="2.1" />
          <circle cx="55" cy="28" r="1.7" fill="currentColor" stroke="none" />
        </Medallion>
      );

    case "04": // 如意结
      return (
        <Medallion>
          <path d="M50 19c7 0 12 5 12 11 0 5-3 9-8 12 9-3 17 2 17 11 0 7-5 12-12 12-4 0-7-2-9-5-2 3-5 5-9 5-7 0-12-5-12-12 0-9 8-14 17-11-5-3-8-7-8-12 0-6 5-11 12-11Z" fill="currentColor" opacity=".07" strokeWidth="2.7" />
          <path d="M50 31v43M39 41l22 22M61 41 39 63M33 52h34" strokeWidth="2.2" />
          <path d="M44 74c0 5-2 8-5 11M56 74c0 5 2 8 5 11" strokeWidth="2" opacity=".68" />
        </Medallion>
      );

    case "05": // 宝瓶
      return (
        <Medallion>
          <path d="M39 22h22M42 27h16l-2 10c9 6 14 15 12 26-2 13-9 20-18 20s-16-7-18-20c-2-11 3-20 12-26l-2-10Z" fill="currentColor" opacity=".09" strokeWidth="2.7" />
          <path d="M38 47c7 4 17 4 24 0M36 61c9 5 19 5 28 0" strokeWidth="2" opacity=".68" />
          <path d="M31 31c4 0 8 3 10 7M69 31c-4 0-8 3-10 7" strokeWidth="2" />
          <path d="M43 70c5-4 9-4 14 0-4 5-10 7-14 0Z" fill="currentColor" opacity=".12" strokeWidth="1.8" />
        </Medallion>
      );

    case "06": // 山岳
      return (
        <Medallion>
          <path d="M18 69 36 43l9 12 13-24 24 38" fill="currentColor" opacity=".06" strokeWidth="2.7" />
          <path d="M26 66 36 52l8 10 14-22 15 26" strokeWidth="2.1" opacity=".72" />
          <path d="M21 75c11-5 21-4 29 0 10 5 20 4 29-1M28 81c9-3 17-2 24 1 7 3 15 3 22 0" strokeWidth="2" opacity=".68" />
          <circle cx="70" cy="28" r="7.5" fill="currentColor" opacity=".1" strokeWidth="2" />
        </Medallion>
      );

    case "07": // 法轮
      return (
        <Medallion>
          <circle cx="50" cy="50" r="25" fill="currentColor" opacity=".05" strokeWidth="2.8" />
          <circle cx="50" cy="50" r="8" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="3" fill="currentColor" stroke="none" />
          <path d="M50 25v17M50 58v17M25 50h17M58 50h17M32 32l12 12M56 56l12 12M68 32 56 44M44 56 32 68" strokeWidth="2.4" />
          <path d="M46 21h8M46 79h8M21 46v8M79 46v8" strokeWidth="2.2" opacity=".62" />
        </Medallion>
      );

    case "08": // 日云
      return (
        <Medallion>
          <circle cx="58" cy="35" r="12" fill="currentColor" opacity=".1" strokeWidth="2.4" />
          <path d="M58 17v6M42 21l4 5M74 21l-4 5M78 35h6" strokeWidth="2.1" opacity=".72" />
          <path d="M19 59c-4-8 3-15 11-14 2-10 16-14 23-6 7-7 20-4 22 7 9-1 14 8 10 15-3 6-8 8-16 8H31c-7 0-10-3-12-10Z" fill="currentColor" opacity=".07" strokeWidth="2.7" />
          <path d="M35 70c5 7 12 10 20 9 7-1 12-4 16-8" strokeWidth="2" opacity=".65" />
        </Medallion>
      );

    case "09": // 天门
      return (
        <Medallion>
          <path d="M24 37h52M30 37v39M70 37v39M37 44h26v32H37z" fill="currentColor" opacity=".055" strokeWidth="2.6" />
          <path d="M20 31c8 2 15 0 21-6 6 5 12 5 18 0 6 6 13 8 21 6" strokeWidth="2.6" />
          <path d="M43 52h14M50 45v31M32 80h36" strokeWidth="2.1" opacity=".72" />
          <circle cx="50" cy="54" r="3" fill="currentColor" stroke="none" opacity=".75" />
        </Medallion>
      );

    case "10": // 灯笼
      return (
        <Medallion>
          <path d="M39 24h22M36 31h28M39 35c-7 8-8 21-4 31 4 9 10 13 15 13s11-4 15-13c4-10 3-23-4-31H39Z" fill="currentColor" opacity=".08" strokeWidth="2.7" />
          <path d="M50 35v44M39 45h22M36 57h28M40 69h20" strokeWidth="2" opacity=".7" />
          <path d="M43 79h14M46 84h8M48 88h4" strokeWidth="2" />
        </Medallion>
      );

    case "11": // 阴阳罗盘
      return (
        <Medallion>
          <circle cx="50" cy="50" r="29" fill="currentColor" opacity=".045" strokeWidth="2.6" />
          <circle cx="50" cy="50" r="18" strokeWidth="2.2" />
          <path d="M50 32c10 0 18 8 18 18-5-6-11-8-18-4-7 4-13 2-18-4 3-6 9-10 18-10Z" fill="currentColor" opacity=".15" strokeWidth="1.8" />
          <path d="M50 68c-10 0-18-8-18-18 5 6 11 8 18 4 7-4 13-2 18 4-3 6-9 10-18 10Z" strokeWidth="1.8" />
          <circle cx="42" cy="40" r="2.4" fill="currentColor" stroke="none" />
          <circle cx="58" cy="60" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M50 21v8M50 71v8M21 50h8M71 50h8M29 29l6 6M65 65l6 6M71 29l-6 6M35 65l-6 6" strokeWidth="1.8" opacity=".58" />
        </Medallion>
      );

    case "12": // 宝珠
      return (
        <Medallion>
          <circle cx="50" cy="47" r="18" fill="currentColor" opacity=".1" strokeWidth="2.7" />
          <path d="M50 20v8M50 66v13M23 47h9M68 47h9M31 28l7 7M69 28l-7 7" strokeWidth="2.2" opacity=".72" />
          <path d="M33 75c7-7 13-9 17-5 4-4 10-2 17 5-5 6-11 9-17 9s-12-3-17-9Z" fill="currentColor" opacity=".07" strokeWidth="2.2" />
          <circle cx="44" cy="41" r="4" fill="white" stroke="none" opacity=".42" />
        </Medallion>
      );

    case "13": // 灵芝
      return (
        <Medallion>
          <path d="M28 49c-11-3-11-17-2-22 6-3 12-1 16 4 5-12 23-13 30-2 10-2 17 10 10 18-6 7-17 7-27 3-9 4-19 4-27-1Z" fill="currentColor" opacity=".07" strokeWidth="2.6" />
          <path d="M38 37c7-5 17-5 24 1M34 46c11-5 25-4 35 1" strokeWidth="1.9" opacity=".68" />
          <path d="M55 50c-1 15-6 26-15 35M55 61c8-3 14-1 18 5M49 70c-7-1-12 1-15 6" strokeWidth="2.2" />
        </Medallion>
      );

    case "14": // 双鱼
      return (
        <Medallion>
          <path d="M25 44c10-15 30-19 44-9-3 13-15 21-28 20-7-1-12-4-16-11Z" fill="currentColor" opacity=".08" strokeWidth="2.5" />
          <path d="M75 56c-10 15-30 19-44 9 3-13 15-21 28-20 7 1 12 4 16 11Z" strokeWidth="2.5" />
          <path d="M28 42 18 35l3 13M72 58l10 7-3-13" strokeWidth="2.1" />
          <circle cx="57" cy="36" r="2.1" fill="currentColor" stroke="none" />
          <circle cx="43" cy="64" r="2.1" fill="currentColor" stroke="none" />
          <path d="M36 48c5-3 10-4 15-3M64 52c-5 3-10 4-15 3" strokeWidth="1.7" opacity=".55" />
        </Medallion>
      );

    case "15": // 祥云宝珠
      return (
        <Medallion>
          <circle cx="50" cy="35" r="10" fill="currentColor" opacity=".1" strokeWidth="2.3" />
          <path d="M50 18v7M36 22l5 5M64 22l-5 5" strokeWidth="2" opacity=".7" />
          <path d="M20 61c-5-8 2-16 11-15 2-9 14-12 21-6 6-6 18-3 20 6 10-1 15 9 10 16-4 6-10 7-18 7H31c-6 0-9-2-11-8Z" fill="currentColor" opacity=".06" strokeWidth="2.6" />
          <path d="M35 69c3 7 10 11 18 10 7 0 13-3 17-8" strokeWidth="2" opacity=".68" />
        </Medallion>
      );

    case "16": // 宝瓶祥云
      return (
        <Medallion>
          <path d="M41 27h18M43 31h14l-2 9c8 5 12 13 11 23-1 12-8 19-16 19s-15-7-16-19c-1-10 3-18 11-23l-2-9Z" fill="currentColor" opacity=".08" strokeWidth="2.5" />
          <path d="M38 53c8 4 16 4 24 0M39 65c7 4 15 4 22 0" strokeWidth="1.9" opacity=".68" />
          <path d="M24 38c4-6 12-6 16 0M76 38c-4-6-12-6-16 0" strokeWidth="2.1" />
          <path d="M21 72c6-4 12-4 18 0M61 72c6-4 12-4 18 0" strokeWidth="1.8" opacity=".55" />
        </Medallion>
      );

    case "17": // 天镜
      return (
        <Medallion>
          <circle cx="50" cy="43" r="25" fill="currentColor" opacity=".05" strokeWidth="2.7" />
          <circle cx="50" cy="43" r="18" strokeWidth="1.8" opacity=".68" />
          <path d="M50 22v8M29 43h8M63 43h8M35 28l6 6M65 28l-6 6" strokeWidth="1.9" opacity=".62" />
          <path d="M50 68v13M40 82h20" strokeWidth="2.5" />
          <path d="M42 49c6 4 12 4 18 0" strokeWidth="1.8" opacity=".58" />
        </Medallion>
      );

    case "jade": // 玉佩
      return (
        <Medallion>
          <path d="M50 16c14 0 25 10 25 24 0 18-12 31-25 45-13-14-25-27-25-45 0-14 11-24 25-24Z" fill="currentColor" opacity=".07" strokeWidth="2.7" />
          <circle cx="50" cy="38" r="9" strokeWidth="2.3" />
          <path d="M34 56c10 5 22 5 32 0M40 67c7 4 13 4 20 0M45 77c4 2 6 2 10 0" strokeWidth="2" opacity=".68" />
          <path d="M44 24c4-2 8-2 12 0" strokeWidth="1.8" opacity=".55" />
        </Medallion>
      );

    case "scatter-a":
      return <Glyph id="01" />;
    case "scatter-b":
      return <Glyph id="03" />;
    case "scatter-c":
      return <Glyph id="07" />;
    case "scatter-d":
      return <Glyph id="13" />;
    case "scatter-e":
      return <Glyph id="09" />;
    default:
      return <Glyph id="12" />;
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
      style={{ filter: "drop-shadow(0 1.5px 1.5px rgb(88 48 25 / 0.16))", ...props.style }}
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth="2.45" strokeLinecap="round" strokeLinejoin="round">
        <g transform="translate(0 1.2)" opacity=".16" strokeWidth="4.8"><Glyph id={id} /></g>
        <Glyph id={id} />
      </g>
    </svg>
  );
}

export function SealScatter() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-cinnabar" aria-hidden>
      <Mark id="scatter-a" className="absolute left-[1%] top-[13%] h-28 w-28 -rotate-12 opacity-[0.07]" />
      <Mark id="scatter-b" className="absolute right-[1%] top-[30%] h-36 w-36 rotate-6 opacity-[0.065]" />
      <Mark id="scatter-c" className="absolute left-[5%] top-[55%] h-32 w-32 rotate-12 opacity-[0.055]" />
      <Mark id="scatter-d" className="absolute right-[4%] top-[69%] h-28 w-28 -rotate-6 opacity-[0.055]" />
      <Mark id="scatter-e" className="absolute bottom-[2%] left-[26%] h-40 w-40 opacity-[0.045]" />
    </div>
  );
}
