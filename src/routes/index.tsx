import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getAlmanac } from "@/lib/actions";
import { AnalysisForm } from "@/components/analysis-form";
import { ResultView } from "@/components/result-view";
import { FollowUpBox } from "@/components/follow-up-box";
import { Mark } from "@/components/marks";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import "@/home-v2.css";

export const Route = createFileRoute("/")({ component: Home });

type Almanac = Awaited<ReturnType<typeof getAlmanac>>;
const STEP_MARKS = ["06", "16", "17"] as const;

function Home() {
  const { t, locale } = useI18n();
  const current = useAppStore((s) => s.current);
  const [almanac, setAlmanac] = useState<Almanac | null>(null);

  const proof = useMemo(() => {
    if (locale === "en") {
      return {
        title: "Clear method, clear boundary",
        lead: "A refined surface is not enough. Zhaowu tells users what is actually calculated, what is only a route label, and what is not yet connected.",
        cards: [
          ["Primary judgement", "Zi Ping BaZi is the sole judgement core. The site reads structure, timing and choices instead of filling the page with generic mystical wording."],
          ["Past-life route", "Six-realm questions use the deterministic Dharma Palm method. The answer must start with the realm and main star, with no extra AI expansion."],
          ["No fake systems", "Zi Wei, Western, Vedic, Liu Yao and Qi Men remain marked as not connected until each has its own independent calculation."],
        ],
      };
    }
    if (locale === "zh-Hans") {
      return {
        title: "方法清楚，边界也清楚",
        lead: "前台要有设计感，但判断不能含糊。用户一眼要看得出：哪些是真的接入，哪些还不能拿来当主判。",
        cards: [
          ["主判清楚", "昭梧只以子平八字作核心主判。看结构、看时机、看选择，不用五行百分比和通用玄学话术冒充结论。"],
          ["前世独立", "六道／前世题只走达摩一掌经确定性排盘。第一句必须给六道与主星，不再额外调用 AI 发散。"],
          ["不乱编流派", "紫微、西占、吠陀、六爻、奇门等未接入独立排盘前，只标资料未接入，不编宫位、星曜、相位或卦爻。"],
        ],
      };
    }
    return {
      title: "方法清楚，邊界也清楚",
      lead: "前台要有設計感，但判斷不能含糊。使用者一眼要看得出：哪些是真的接入，哪些還不能拿來當主判。",
      cards: [
        ["主判清楚", "昭梧只以子平八字作核心主判。看結構、看時機、看選擇，不用五行百分比和通用玄學話術冒充結論。"],
        ["前世獨立", "六道／前世題只走達摩一掌經確定性排盤。第一句必須給六道與主星，不再額外調用 AI 發散。"],
        ["不亂編流派", "紫微、西占、吠陀、六爻、奇門等未接入獨立排盤前，只標資料未接入，不編宮位、星曜、相位或卦爻。"],
      ],
    };
  }, [locale]);

  useEffect(() => {
    void getAlmanac().then(setAlmanac).catch(() => setAlmanac(null));
  }, []);

  return (
    <main className="zhaowu-v2">
      <section className="zhaowu-v2-hero" aria-labelledby="zhaowu-title">
        <span className="zhaowu-v2-build">ZW · 2026.08.20 · JADE</span>
        <Mark id="brand" size={340} eager className="zhaowu-v2-seal" />
        <Mark id="04" size={180} className="zhaowu-v2-corner a" />
        <Mark id="03" size={220} className="zhaowu-v2-corner b" />

        <div className="zhaowu-v2-inner">
          <p className="zhaowu-v2-kicker">ZHAOWU · {t("heroKicker")}</p>
          <h1 id="zhaowu-title" className="zhaowu-v2-wordmark">昭梧</h1>
          <p className="zhaowu-v2-slogan">{t("heroSlogan")}</p>
          <p className="zhaowu-v2-english">{t("heroEnglish")}</p>
          <div className="zhaowu-v2-rule" aria-hidden />
          <p className="zhaowu-v2-lead">{t("heroLead")}</p>
          <p className="zhaowu-v2-body">{t("heroBody")}</p>
          <p className="zhaowu-v2-sign">{t("heroSign")}</p>
          <a href="#analysisForm" className="zhaowu-v2-start">{t("start")}</a>
        </div>
      </section>

      <aside className="zhaowu-v2-almanac" aria-label={t("today")}>
        <Mark id="02" size={94} />
        <div>
          <p className="zhaowu-v2-almanac-title">{t("today")}</p>
          {almanac ? (
            <div className="zhaowu-v2-almanac-meta">
              <p>{almanac.day} · {almanac.year}年 {almanac.month}月 · {almanac.lunar}</p>
              {almanac.jieqi ? <p>{t("jieqi")} {almanac.jieqi}</p> : null}
              <p>{t("yi")} {almanac.yi.join("、") || "—"}</p>
              <p>{t("ji")} {almanac.ji.join("、") || "—"}</p>
            </div>
          ) : <div className="mt-2 h-12 animate-pulse bg-paper-deep/40" />}
        </div>
      </aside>

      <section className="zhaowu-v2-steps" aria-label="使用步骤">
        {[t("s1"), t("s2"), t("s3")].map((item, i) => (
          <article key={item} className="zhaowu-v2-step">
            <div className="zhaowu-v2-step-no">0{i + 1}</div>
            <div className="zhaowu-v2-step-text">{item}</div>
            <Mark id={STEP_MARKS[i]} size={150} />
          </article>
        ))}
      </section>

      <section className="zhaowu-v2-proof" aria-labelledby="zhaowu-proof-title">
        <div className="zhaowu-v2-proof-head">
          <p className="zhaowu-v2-proof-kicker">STONE CORE</p>
          <h2 id="zhaowu-proof-title">{proof.title}</h2>
          <p>{proof.lead}</p>
        </div>
        <div className="zhaowu-v2-proof-grid">
          {proof.cards.map(([title, body], i) => (
            <article key={title} className="zhaowu-v2-proof-card">
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="zhaowu-v2-form">
        <AnalysisForm />
      </section>

      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}

      <section className="zhaowu-v2-faq">
        <h2>{t("faq")}</h2>
        <dl>
          <div><dt>{t("faq1q")}</dt><dd>{t("faq1a")}</dd></div>
          <div><dt>{t("faq2q")}</dt><dd>{t("faq2a")}</dd></div>
          <div><dt>{t("faq3q")}</dt><dd>{t("faq3a")}</dd></div>
        </dl>
      </section>
    </main>
  );
}
