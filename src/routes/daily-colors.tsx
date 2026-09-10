import { createFileRoute } from "@tanstack/react-router";
import { DailyColorsModule } from "@/components/daily-colors-module";

export const Route = createFileRoute("/daily-colors")({ component: DailyColorsPage });

function DailyColorsPage() {
  return (
    <main className="zhaowu-home-sheet-page zhaowu-home-layout">
      <div className="zhaowu-home-stage">
        <DailyColorsModule variant="page" />
      </div>
    </main>
  );
}
