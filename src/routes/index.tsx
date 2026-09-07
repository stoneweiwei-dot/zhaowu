import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnalysisForm } from "@/components/analysis-form";
import { AuspiciousGallerySection } from "@/components/auspicious-gallery-section";
import { DailyAlmanacWidget } from "@/components/daily-almanac-widget";
import { FollowUpBox } from "@/components/follow-up-box";
import { HomeScreenInstallPrompt } from "@/components/home-screen-install-prompt";
import { LifeViewHomeSection } from "@/components/life-view-home-section";
import { ResultView } from "@/components/result-view";
import { ScentFiveElementTest } from "@/components/scent-five-element-test";
import { useI18n, type Locale } from "@/lib/i18n";
import { readSharedBirthRecord, SHARED_BIRTH_EVENT, type SharedBirthRecord } from "@/lib/shared-birth";
import {
  buildIndianReading,
  buildPalmReading,
  buildQizhengReading,
  buildWesternReading,
  buildZiweiReading,
  type SpecialistId,
  type SpecialistReading,
} from "@/lib/specialist-reading";
import { useAppStore } from "@/lib/store";
import "@/home-polish-v3.css";
import "@/home-portals.css";
import "@/home-portals-astrology.css";
import "@/home-layout-r46.css";
import "@/home-birth-hub-r60.css";

export const Route = createFileRoute("/")({ component: Home });

type PortalId = SpecialistId | "bazi";

function portalAction(locale: Locale, birth: SharedBirthRecord | null, needsTime: boolean) {
  if (!birth) return locale === "en" ? "Add birth data" : locale === "zh-Hans" ? "填写生辰" : "填寫生辰";
  if (needsTime && birth.timeUnknown) return locale === "en" ? "View · birth time needed for full precision" : locale === "zh-Hans" ? "查看分析 · 完整精度需时辰" : "查看分析 · 完整精度需時辰";
  return locale === "en" ? "Open analysis" : locale === "zh-Hans" ? "查看分析" : "查看分析";
}

function baziAction(locale: Locale, hasResult: boolean) {
  if (hasResult) return locale === "en" ? "Open BaZi analysis" : locale === "zh-Hans" ? "查看八字分析" : "查看八字分析";
  return locale === "en" ? "Start BaZi analysis" : locale === "zh-Hans" ? "开始八字分析" : "開始八字分析";
}

function buildPortalReading(id: SpecialistId, birth: SharedBirthRecord, locale: Locale): SpecialistReading {
  if (id === "western") return buildWesternReading(birth, locale);
  if (id === "ziwei") return buildZiweiReading(birth, locale);
  if (id === "qizheng") return buildQizhengReading(birth, locale);
  if (id === "indian") return buildIndianReading(birth, locale);
  return buildPalmReading(birth, locale);
}

function readingPreview(reading: SpecialistReading | undefined, locale: Locale) {
  if (!reading) return "";
  const raw = reading.warning || reading.sections.find((section) => section.body.trim())?.body || reading.lead;
  const clean = raw.replace(/\s+/g, " ").trim();
  if (clean.length <= 132) return clean;
  return `${clean.slice(0, 130)}${locale === "en" ? "…" : "……"}`;
}

function Home() {
  const { locale } = useI18n();
  const current = useAppStore((s) => s.current);
  const [birth, setBirth] = useState<SharedBirthRecord | null>(() => readSharedBirthRecord());
  const [scentOpen, setScentOpen] = useState(false);

  useEffect(() => {
    const sync = () => setBirth(readSharedBirthRecord());
    sync();
    window.addEventListener(SHARED_BIRTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SHARED_BIRTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const portalReadings = useMemo<Partial<Record<SpecialistId, SpecialistReading>>>(() => {
    if (!birth) return {};
    return {
      indian: buildPortalReading("indian", birth, locale),
      western: buildPortalReading("western", birth, locale),
      ziwei: buildPortalReading("ziwei", birth, locale),
      qizheng: buildPortalReading("qizheng", birth, locale),
      past: buildPortalReading("past", birth, locale),
    };
  }, [birth, locale]);

  const portalCopy: { label: string; lead: string; items: Array<{ id: PortalId; to?: "/indian-astrology" | "/astrology" | "/ziwei" | "/qizheng" | "/yizhangjing"; title: string; hint: string; needsTime: boolean }> } = locale === "en"
    ? {
        label: "Your six analysis reports",
        lead: "Use one birth record. Open the method you want to read; each report stays independent and does not overwrite the BaZi main judgement.",
        items: [
          { id: "bazi", title: "BaZi main analysis", hint: "structure, strength, useful functions, timing and your actual question", needsTime: false },
          { id: "ziwei", to: "/ziwei", title: "Zi Wei Dou Shu", hint: "palace-based supporting view of character, relationships and life phases", needsTime: true },
          { id: "western", to: "/astrology", title: "Western astrology", hint: "Sun, Moon, Rising, aspects and life areas", needsTime: false },
          { id: "indian", to: "/indian-astrology", title: "Classical Indian astrology", hint: "classical karmic pattern; D60 needs an accurate birth minute", needsTime: true },
          { id: "qizheng", to: "/qizheng", title: "Seven Luminaries", hint: "temperament, rhythm, pressure response and timing", needsTime: true },
          { id: "past", to: "/yizhangjing", title: "Past & Present", hint: "cultural symbolism and recurring habit patterns as a separate supporting layer", needsTime: false },
        ],
      }
    : locale === "zh-Hans"
      ? {
          label: "你的六种分析报告",
          lead: "出生资料只填一次。点开你要看的体系，每一份报告独立呈现，不覆盖八字主判。",
          items: [
            { id: "bazi", title: "八字主分析", hint: "看格局、旺衰、取用、岁运，以及你真正问的问题", needsTime: false },
            { id: "ziwei", to: "/ziwei", title: "紫微斗数", hint: "用宫位与阶段旁证性格、关系与人生主轴", needsTime: true },
            { id: "western", to: "/astrology", title: "西洋星座", hint: "看太阳、月亮、上升、相位与人生领域", needsTime: false },
            { id: "indian", to: "/indian-astrology", title: "印度古法占星", hint: "看古典业力细分层；D60 需要准确出生分钟", needsTime: true },
            { id: "qizheng", to: "/qizheng", title: "七政四余", hint: "看性情、节奏、压力反应与天时变化", needsTime: true },
            { id: "past", to: "/yizhangjing", title: "前世今生", hint: "看文化象意与反复习性，保持为独立旁证", needsTime: false },
          ],
        }
      : {
          label: "你的六種分析報告",
          lead: "出生資料只填一次。點開你要看的體系，每一份報告獨立呈現，不覆蓋八字主判。",
          items: [
            { id: "bazi", title: "八字主分析", hint: "看格局、旺衰、取用、歲運，以及你真正問的問題", needsTime: false },
            { id: "ziwei", to: "/ziwei", title: "紫微斗數", hint: "用宮位與階段旁證性格、關係與人生主軸", needsTime: true },
            { id: "western", to: "/astrology", title: "西洋星座", hint: "看太陽、月亮、上升、相位與人生領域", needsTime: false },
            { id: "indian", to: "/indian-astrology", title: "印度古法占星", hint: "看古典業力細分層；D60 需要準確出生分鐘", needsTime: true },
            { id: "qizheng", to: "/qizheng", title: "七政四餘", hint: "看性情、節奏、壓力反應與天時變化", needsTime: true },
            { id: "past", to: "/yizhangjing", title: "前世今生", hint: "看文化象意與反覆習性，保持為獨立旁證", needsTime: false },
          ],
        };

  const funCopy = locale === "en"
    ? {
        title: "Playful self-tests",
        lead: "Short self-tests that stay out of the way until you choose one.",
        scentTitle: "Five-Element Scent Map",
        scentHint: "sensory preference compared with five-element cultural imagery",
        cards: [
          { to: "/fun-tests" as const, title: "Inner Animal × Guardian Beast", hint: "current personality strategy and instinctive response" },
          { to: "/fun-tests" as const, title: "Five-Element Function Test", hint: "which function you currently want to strengthen" },
          { to: "/quiz/six-realms" as const, title: "Six Realms Habit Test", hint: "which everyday habit pattern is strongest now" },
        ],
      }
    : locale === "zh-Hans"
      ? {
          title: "趣味测验",
          lead: "轻量自评统一收在这里。先选项目，再展开。",
          scentTitle: "五行香气谱",
          scentHint: "看嗅觉偏好与五行文化象意，不当成身体缺什么",
          cards: [
            { to: "/fun-tests" as const, title: "内在动物 × 命局瑞兽", hint: "看现在常用的人格策略与本能反应" },
            { to: "/fun-tests" as const, title: "五行功能测验", hint: "看现在主观上最想加强哪一种功能" },
            { to: "/quiz/six-realms" as const, title: "六道习气测验", hint: "看目前最明显的日常惯性" },
          ],
        }
      : {
          title: "趣味測驗",
          lead: "輕量自評統一收在這裡。先選項目，再展開。",
          scentTitle: "五行香氣譜",
          scentHint: "看嗅覺偏好與五行文化象意，不當成身體缺什麼",
          cards: [
            { to: "/fun-tests" as const, title: "內在動物 × 命局瑞獸", hint: "看現在常用的人格策略與本能反應" },
            { to: "/fun-tests" as const, title: "五行功能測驗", hint: "看現在主觀上最想加強哪一種功能" },
            { to: "/quiz/six-realms" as const, title: "六道習氣測驗", hint: "看目前最明顯的日常慣性" },
          ],
        };

  return (
    <main className="zhaowu-home-sheet-page zhaowu-home-layout">
      <div className="zhaowu-home-stage zhaowu-home-stage--primary relative" id="bazi">
        <AnalysisForm />
      </div>

      {current ? <div className="zhaowu-home-stage zhaowu-home-stage--result"><ResultView result={current} /></div> : null}
      {current ? <div className="zhaowu-home-stage zhaowu-home-stage--result"><FollowUpBox result={current} /></div> : null}

      <div className="zhaowu-home-stage zhaowu-home-stage--daily"><DailyAlmanacWidget /></div>

      <section className="zhaowu-home-stage zhaowu-home-stage--directory zhaowu-home-portals-block" aria-label={portalCopy.label}>
        <header className="zhaowu-home-portals-heading">
          <h2>{portalCopy.label}</h2>
          <span>{portalCopy.lead}</span>
        </header>
        <div className="zhaowu-home-portals">
          {portalCopy.items.map((item) => {
            const reading = item.id === "bazi" ? undefined : portalReadings[item.id];
            const preview = readingPreview(reading, locale);
            const content = (
              <>
                <span className="zhaowu-home-portal-copy">
                  <strong>{item.title}</strong>
                  <small className="zhaowu-home-portal-hint">{item.hint}</small>
                  {birth && preview ? <small className="zhaowu-home-portal-preview">{preview}</small> : null}
                </span>
                <span className="zhaowu-home-portal-action">
                  {item.id === "bazi" ? baziAction(locale, Boolean(current)) : portalAction(locale, birth, item.needsTime)}
                  <span aria-hidden="true">›</span>
                </span>
              </>
            );

            return item.id === "bazi" ? (
              <a key={item.id} href={current ? "#result" : "#analysisForm"} data-specialist-link="bazi" className="zhaowu-home-portal is-bazi">
                {content}
              </a>
            ) : (
              <Link
                key={item.id}
                to={item.to!}
                data-specialist-link={item.id}
                className="zhaowu-home-portal"
                aria-label={`${item.title} · ${portalAction(locale, birth, item.needsTime)}`}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="zhaowu-home-stage zhaowu-home-stage--directory zhaowu-home-fun-section" aria-label={funCopy.title}>
        <header className="zhaowu-home-fun-heading">
          <h2>{funCopy.title}</h2>
          <p>{funCopy.lead}</p>
        </header>
        <div className="zhaowu-home-fun-grid">
          {funCopy.cards.map((card) => (
            <Link key={card.title} to={card.to} className="zhaowu-home-fun-card" aria-label={card.title}>
              <span className="min-w-0"><strong>{card.title}</strong><small>{card.hint}</small></span>
              <span className="zhaowu-home-fun-arrow" aria-hidden>›</span>
            </Link>
          ))}
          <button type="button" className="zhaowu-home-fun-card text-left" aria-expanded={scentOpen} aria-controls="home-scent-test" onClick={() => setScentOpen((value) => !value)}>
            <span className="min-w-0"><strong>{funCopy.scentTitle}</strong><small>{funCopy.scentHint}</small></span>
            <span className="zhaowu-home-fun-arrow" aria-hidden>{scentOpen ? "⌃" : "›"}</span>
          </button>
        </div>
        <div id="home-scent-test" data-scent-panel hidden={!scentOpen}>
          {scentOpen ? <ScentFiveElementTest result={current} /> : null}
        </div>
      </section>

      <div className="zhaowu-home-stage zhaowu-home-stage--gallery"><AuspiciousGallerySection /></div>
      <div className="zhaowu-home-stage zhaowu-home-stage--notes"><LifeViewHomeSection /></div>
      <div className="zhaowu-home-stage"><HomeScreenInstallPrompt /></div>
    </main>
  );
}
