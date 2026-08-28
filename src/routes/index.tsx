import { createFileRoute, Link } from "@tanstack/react-router";
import { AnalysisForm } from "@/components/analysis-form";
import { FollowUpBox } from "@/components/follow-up-box";
import { HomeScreenInstallPrompt } from "@/components/home-screen-install-prompt";
import { ResultView } from "@/components/result-view";
import { ZiweiHomeFeature } from "@/components/ziwei-home-feature";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import "@/home-polish-v3.css";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { t, locale } = useI18n();
  const current = useAppStore((s) => s.current);
  const toolsCopy = locale === "en"
    ? {
        kicker: "ZHAOWU · CHARACTER TOOL",
        title: "Two-angle character reading",
        lead: "Enter your birth details once to see how you tend to come across and the patterns that often drive your choices.",
        eyebrow: "ONE FORM · TWO ANGLES",
        toolTitle: "Two-angle character reading",
        desc: "Enter your birth date, exact time and birthplace. The system adjusts for the local time zone, daylight saving and true solar time automatically.",
        points: ["See how you usually come across", "See the habits that repeat in your choices", "Birthplace differences are adjusted automatically"],
        meta: "Birth details entered once",
        button: "Start analysis",
        teaEyebrow: "TASTE × CURRENT STATE × CHART",
        teaTitle: "Tea Guardian · Seven-question match",
        teaDesc: "Find a taste favourite and a best fit for right now. If a chart is available, add a separate chart-based tea guardian.",
        teaPoints: ["16 original tea-guardian artworks", "Taste and chart scored separately", "No medical or generic element claims"],
        teaMeta: "Seven questions · three answers",
        teaButton: "Start tea guardian test",
      }
    : locale === "zh-Hans"
      ? {
          kicker: "昭梧 · 性格辅助工具",
          title: "双轨性格分析",
          lead: "出生资料只填一次，从两个角度看你平时给人的感觉，以及做选择时反复出现的习惯。",
          eyebrow: "一次填写 · 两个角度",
          toolTitle: "双轨性格分析",
          desc: "填写出生日期、准确时间和出生地。系统会自动处理当地时区、夏令时和真太阳时，不需要你自己换算。",
          points: ["看你在人前通常怎么表现", "看你做决定时容易重复的习惯", "出生地不同，时间会自动校正"],
          meta: "出生资料只填一次",
          button: "开始分析",
          teaEyebrow: "口味 × 当下状态 × 命盘",
          teaTitle: "茶仙守护・七题评估",
          teaDesc: "分别找出纯口味最爱、当下适合茶；若本次命盘已完成，再加入本命茶仙守护。",
          teaPoints: ["16 张原创茶仙图", "口味与命理分开计算", "不做医疗或缺什么补什么"],
          teaMeta: "七题 · 三个答案",
          teaButton: "开始茶仙测验",
        }
      : {
          kicker: "昭梧 · 性格輔助工具",
          title: "雙軌性格分析",
          lead: "出生資料只填一次，從兩個角度看你平時給人的感覺，以及做選擇時反覆出現的習慣。",
          eyebrow: "一次填寫 · 兩個角度",
          toolTitle: "雙軌性格分析",
          desc: "填寫出生日期、準確時間和出生地。系統會自動處理當地時區、夏令時和真太陽時，不需要你自己換算。",
          points: ["看你在人前通常怎麼表現", "看你做決定時容易重複的習慣", "出生地不同，時間會自動校正"],
          meta: "出生資料只填一次",
          button: "開始分析",
          teaEyebrow: "口味 × 當下狀態 × 命盤",
          teaTitle: "茶仙守護・七題評估",
          teaDesc: "分別找出純口味最愛、當下適合茶；若本次命盤已完成，再加入本命茶仙守護。",
          teaPoints: ["16 張原創茶仙圖", "口味與命理分開計算", "不做醫療或缺什麼補什麼"],
          teaMeta: "七題 · 三個答案",
          teaButton: "開始茶仙測驗",
        };

  return (
    <main className="zhaowu-home-sheet-page space-y-7 sm:space-y-12">
      <HomeScreenInstallPrompt />

      <section className="zhaowu-home-intro" aria-labelledby="zhaowu-home-intro-title">
        <p className="zhaowu-home-intro-kicker">ZHAOWU · {t("heroKicker")}</p>
        <div className="zhaowu-home-intro-line" aria-hidden />
        <h1 id="zhaowu-home-intro-title" className="zhaowu-home-intro-title">{t("heroLead")}</h1>
        <p className="zhaowu-home-intro-copy">{t("heroSlogan")}</p>
      </section>

      <section className="relative" aria-label={t("formTitle")}><AnalysisForm /></section>
      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}

      <ZiweiHomeFeature />

      <section className="zhaowu-tools-section" aria-label={t("galleryTitle")}>
        <header className="zhaowu-tools-heading"><div><p>{toolsCopy.kicker}</p><h2>{toolsCopy.title}</h2></div><span>{toolsCopy.lead}</span></header>
        <div className="zhaowu-tools-grid">
          <article className="zhaowu-specialist-card is-tianji is-dual">
            <div className="zhaowu-card-number" aria-hidden>雙</div>
            <div className="zhaowu-specialist-content"><p className="zhaowu-specialist-eyebrow">{toolsCopy.eyebrow}</p><h3>{toolsCopy.toolTitle}</h3><p className="zhaowu-specialist-desc">{toolsCopy.desc}</p><ul className="zhaowu-specialist-points">{toolsCopy.points.map((point) => <li key={point}>{point}</li>)}</ul><div className="zhaowu-specialist-meta"><span />{toolsCopy.meta}</div></div>
            <Link to="/tianji-dual" className="zhaowu-specialist-action is-tianji-action"><span>{toolsCopy.button}</span><b aria-hidden>→</b></Link>
          </article>
          <article className="zhaowu-specialist-card is-tea">
            <div className="zhaowu-card-number" aria-hidden>茶</div>
            <div className="zhaowu-specialist-content"><p className="zhaowu-specialist-eyebrow">{toolsCopy.teaEyebrow}</p><h3>{toolsCopy.teaTitle}</h3><p className="zhaowu-specialist-desc">{toolsCopy.teaDesc}</p><ul className="zhaowu-specialist-points">{toolsCopy.teaPoints.map((point) => <li key={point}>{point}</li>)}</ul><div className="zhaowu-specialist-meta"><span />{toolsCopy.teaMeta}</div></div>
            <Link to="/tea-guardian" className="zhaowu-specialist-action is-tea-action"><span>{toolsCopy.teaButton}</span><b aria-hidden>→</b></Link>
          </article>
        </div>
      </section>
    </main>
  );
}
