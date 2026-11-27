import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { pageHead } from "@/lib/route-meta";

export const Route = createFileRoute("/pricing")({ head: pageHead, component: PricingPage });

const systems = [
  ["/", "八字", "八字", "BaZi", "A$24.90"],
  ["/ziwei", "紫微斗數", "紫微斗数", "Zi Wei Dou Shu", "A$24.90"],
  ["/qizheng", "七政", "七政", "Seven Luminaries", "A$14.90"],
  ["/astrology", "西洋占星", "西洋占星", "Western astrology", "A$14.90"],
  ["/indian-astrology", "印度占星", "印度占星", "Vedic astrology", "A$14.90"],
  ["/yizhangjing", "一掌經", "一掌经", "One-Palm reading", "A$14.90"],
  ["/numerology", "生命靈數", "生命灵数", "Numerology", "A$14.90"],
] as const;

function PricingPage() {
  const { locale } = useI18n();
  const label = locale === "zh-Hans" ? 2 : locale === "en" ? 3 : 1;
  const t = (tw: string, cn: string, en: string) => [tw, cn, en][label - 1];
  return <main className="mx-auto max-w-2xl space-y-6 px-5 py-10">
    <h1 className="text-3xl">{t("命書價目", "命书价目", "Report prices")}</h1>
    <p>{t("先免費排盤。想讀完整版時，再到對應的系統頁單次付費解鎖，不自動續費。", "先免费排盘。想读完整版时，再到对应的系统页单次付费解锁，不自动续费。", "Start with a free chart. When you want the full report, unlock it on the system page with a single payment. There is no automatic renewal.")}</p>
    <nav className="flex flex-wrap gap-4 underline"><Link to="/" hash="birth-form">{t("先免費排盤", "先免费排盘", "Create a free chart")}</Link><Link to="/sample-report">{t("先看公開命書示例", "先看公开命书示例", "Read a sample report")}</Link></nav>
    <table className="w-full text-left"><thead><tr><th scope="col">{t("選擇排盤系統", "选择排盘系统", "Choose a chart system")}</th><th scope="col">{t("完整版（澳幣）", "完整版（澳元）", "Full report (AUD)")}</th></tr></thead>
      <tbody>{systems.map(row => <tr key={row[0]} className="border-b"><th scope="row" className="py-3"><Link className="underline" to={row[0]}>{row[label]}</Link></th><td>{row[4]}</td></tr>)}</tbody>
    </table>
  </main>;
}
