import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import type { Locale } from "@/lib/i18n";
import { oncePerSession, trackConversion } from "@/lib/observability/conversion-telemetry";
import type { ReportSystemId } from "@/lib/report-access";
import "@/report-access.css";

const NEXT_READING: Record<ReportSystemId, { route: string; zhHant: string; zhHans: string; en: string }> = {
  bazi: { route: "/ziwei", zhHant: "紫微斗數", zhHans: "紫微斗数", en: "Zi Wei" },
  ziwei: { route: "/qizheng", zhHant: "七政四餘", zhHans: "七政四余", en: "Seven Luminaries" },
  qizheng: { route: "/astrology", zhHant: "西洋占星", zhHans: "西洋占星", en: "Western astrology" },
  western: { route: "/indian-astrology", zhHant: "印度古法占星", zhHans: "印度古法占星", en: "Indian astrology" },
  indian: { route: "/yizhangjing", zhHant: "一掌經", zhHans: "一掌经", en: "One-Palm Classic" },
  palm: { route: "/numerology", zhHant: "生命靈數", zhHans: "生命灵数", en: "Numerology" },
  numerology: { route: "/ziwei", zhHant: "紫微斗數", zhHans: "紫微斗数", en: "Zi Wei" },
};

function copy(locale: Locale, next: (typeof NEXT_READING)[ReportSystemId]) {
  if (locale === "en") return {
    kicker: "FULL ACCESS CONFIRMED",
    title: "Your full reading is ready",
    body: "This access is a one-time unlock with no subscription or automatic renewal. Keep this browser's site data so the verified access can be recovered here later.",
    next: `Open my free ${next.en} chart`,
    reports: "My reports",
    boundary: "Traditional interpretation is for cultural reflection. It does not replace medical, mental-health, legal, financial or investment advice; important decisions should use real-world evidence and qualified professional guidance.",
  };
  if (locale === "zh-Hans") return {
    kicker: "完整权限已确认",
    title: "完整报告已经开放",
    body: "本次为单次解锁，不是订阅，也不会自动续费。请保留这个浏览器的网站数据，以便日后在同一浏览器恢复已验证的读取权限。",
    next: `查看我的${next.zhHans}免费基本盘`,
    reports: "我的报告",
    boundary: "传统命理解读只作文化与自我反思参考，不替代医疗、心理、法律、财务或投资专业意见；重要决定请回到现实资料与合资格专业人士。",
  };
  return {
    kicker: "完整權限已確認",
    title: "完整報告已經開放",
    body: "本次為單次解鎖，不是訂閱，也不會自動續費。請保留這個瀏覽器的網站資料，以便日後在同一瀏覽器恢復已驗證的讀取權限。",
    next: `查看我的${next.zhHant}免費基本盤`,
    reports: "我的報告",
    boundary: "傳統命理解讀只作文化與自我反思參考，不替代醫療、心理、法律、財務或投資專業意見；重要決定請回到現實資料與合資格專業人士。",
  };
}

export function ReportCompletionPanel({ system, locale }: { system: ReportSystemId; locale: Locale }) {
  const next = NEXT_READING[system];
  const text = copy(locale, next);

  useEffect(() => {
    if (oncePerSession(`report-completion:${system}`)) {
      trackConversion("report_completion_viewed", { system, locale });
    }
  }, [locale, system]);

  return (
    <section className="zhaowu-report-completion" data-report-completion={system} aria-labelledby={`report-completion-title-${system}`}>
      <p className="zhaowu-report-completion__kicker">{text.kicker}</p>
      <h2 id={`report-completion-title-${system}`}>{text.title}</h2>
      <p>{text.body}</p>
      <div className="zhaowu-report-completion__actions">
        <Link
          to={next.route}
          onClick={() => trackConversion("report_next_system_clicked", { from_system: system, to_path: next.route })}
        >
          {text.next}<span aria-hidden="true"> →</span>
        </Link>
        <Link to="/history" className="is-secondary">{text.reports}</Link>
      </div>
      <p className="zhaowu-report-completion__boundary">{text.boundary}</p>
    </section>
  );
}
