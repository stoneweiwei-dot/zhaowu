import type { CSSProperties } from "react";
import type { ReportSection } from "@/lib/report/focused-report";
import { selectReportDragon } from "@/lib/report/report-dragon";

const SPRITE_POSITION = ["0%", "50%", "100%"] as const;

export function ReportDragonSticker({ section, compact = false }: { section: ReportSection; compact?: boolean }) {
  const dragon = selectReportDragon(section);
  const style = {
    backgroundImage: `url(/mascot/report-dragons/volume-0${dragon.sheet}.webp)`,
    backgroundPosition: `${SPRITE_POSITION[dragon.column]} ${SPRITE_POSITION[dragon.row]}`,
  } satisfies CSSProperties;

  return (
    <span
      aria-hidden="true"
      className={compact ? "zhaowu-report-dragon zhaowu-report-dragon--compact" : "zhaowu-report-dragon"}
      data-dragon-emotion={dragon.id}
      data-dragon-tone={dragon.tone}
      style={style}
    />
  );
}

