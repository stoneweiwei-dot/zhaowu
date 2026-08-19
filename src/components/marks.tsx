import type { SVGProps } from "react";

type MarkProps = Omit<SVGProps<SVGSVGElement>, "id"> & {
  id: string;
  size?: number;
  eager?: boolean;
  alt?: string;
};

export function Mark({ id, size = 64, eager: _eager, alt = "", className = "", ...props }: MarkProps) {
  const n = Array.from(id).reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const rotate = (n % 4) * 15;
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
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" transform={`rotate(${rotate} 50 50)`}>
        <circle cx="50" cy="50" r="37" opacity="0.5" />
        <path d="M50 18c8 11 12 21 12 30 0 12-5 22-12 34-7-12-12-22-12-34 0-9 4-19 12-30Z" opacity="0.75" />
        <path d="M25 50h50M50 25v50" opacity="0.28" />
        <path d="M36 64c8-5 20-5 28 0" opacity="0.55" />
      </g>
    </svg>
  );
}

export function SealScatter() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-cinnabar" aria-hidden>
      <Mark id="scatter-a" className="absolute left-[4%] top-[18%] h-20 w-20 opacity-[0.035]" />
      <Mark id="scatter-b" className="absolute right-[3%] top-[42%] h-28 w-28 opacity-[0.03]" />
      <Mark id="scatter-c" className="absolute bottom-[12%] left-[12%] h-24 w-24 opacity-[0.025]" />
    </div>
  );
}
