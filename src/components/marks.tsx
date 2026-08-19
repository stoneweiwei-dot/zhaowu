import type { SVGProps } from "react";

type MarkProps = SVGProps<SVGSVGElement> & {
  id: string;
  size?: number;
  eager?: boolean;
  alt?: string;
};

export function Mark({ id, size = 64, className = "", eager: _eager, alt: _alt, ...props }: MarkProps) {
  const isBrand = id === "brand";
  const isJade = id === "jade";
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx="32" cy="32" r="27" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth=".8" opacity=".28" />
      {isBrand ? (
        <>
          <text x="32" y="28" textAnchor="middle" fontSize="14" fontFamily="serif" fill="currentColor">昭</text>
          <text x="32" y="44" textAnchor="middle" fontSize="14" fontFamily="serif" fill="currentColor">梧</text>
          <circle cx="49" cy="15" r="3" fill="#8f3027" />
        </>
      ) : isJade ? (
        <>
          <path d="M24 18c8 3 10 9 8 15-2-6-7-9-13-10 1 10 6 17 13 22 7-5 12-12 13-22-6 1-11 4-13 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M32 12v35" stroke="currentColor" strokeWidth="1" opacity=".55" />
        </>
      ) : (
        <>
          <path d="M18 32h28M32 18v28" stroke="currentColor" strokeWidth="1" opacity=".5" />
          <path d="M22 22c6 2 14 2 20 0M22 42c6-2 14-2 20 0" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="32" cy="32" r="4" fill="#8f3027" opacity=".72" />
        </>
      )}
    </svg>
  );
}

export function SealScatter() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-cinnabar" aria-hidden="true">
      <Mark id="scatter-a" className="absolute left-[5%] top-[18%] h-12 w-12 opacity-[0.05]" />
      <Mark id="scatter-b" className="absolute right-[6%] top-[34%] h-16 w-16 rotate-12 opacity-[0.045]" />
      <Mark id="scatter-c" className="absolute left-[12%] top-[67%] h-14 w-14 -rotate-12 opacity-[0.04]" />
      <Mark id="scatter-d" className="absolute right-[12%] top-[78%] h-10 w-10 opacity-[0.05]" />
    </div>
  );
}
