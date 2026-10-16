import type { DataGradeReport } from "@/lib/bazi/data-grade";
import { dataGradeFooterTitle, dataGradeNoticeLines, type GradeLocale } from "@/lib/data-grade-copy";

/** Report-end statement of how far the birth data supports the reading. Renders nothing for reports saved before the grade existed. */
export function DataGradeFooter({ grade, locale }: { grade?: DataGradeReport | null; locale: GradeLocale }) {
  if (!grade) return null;
  return (
    <aside className="zhaowu-data-grade-footer" data-data-grade-footer={grade.grade}>
      <h4>{dataGradeFooterTitle(locale)}</h4>
      {dataGradeNoticeLines(grade.grade, grade.reasons, grade.parts, locale).map((line, index) => <p key={index}>{line}</p>)}
    </aside>
  );
}
