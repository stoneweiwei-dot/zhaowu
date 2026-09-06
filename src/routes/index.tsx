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

function portalAction(locale: Locale, birth: SharedBirthRecord | null, needsTime: boolean) {
  if (!birth) return locale === "en" ? "Add birth data" : locale === "zh-Hans" ? "填写生辰" : "填寫生辰";
  if (needsTime && birth.timeUnknown) return locale === "en" ? "Auto-read · time needed" : locale === "zh-Hans" ? "已自动读取 · 需时辰" : "已自動讀取 · 需時辰";
  return locale === "en" ? "Auto-generated · view full" : locale === "zh-Hans" ? "已自动生成 · 查看完整" : "已自動生成 · 查看完整";
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
  if (clean.length <= 168) return clean;
  return `${clean.slice(0, 166)}${locale === "en" ? "…" : "……"}`;
}

function Home() {
  const { locale } = useI18n();
  const current = useAppStore((s) => s.current);
  const [birth, setBirth] = useState<SharedBirthRecord | null>(null);

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
      dharma: buildPortalReading("dharma", birth, locale),
    };
  }, [birth, locale]);

  const portalCopy = locale === "en"
    ? {
        label: "Six other readings from the same birth record",
        lead: "Enter your birth details once above. Every system below automatically reuses that record and shows its own result preview; no repeated forms.",
        items: [
          { id: "indian" as const, to: "/indian-astrology" as const, title: "Classical Indian Astrology", hint: "karmic pattern · D60 minute-sensitive cross-check", needsTime: true },
          { id: "western" as const, to: "/astrology" as const, title: "Western Astrology", hint: "Sun · Moon · Rising · aspects · life areas", needsTime: false },
          { id: "ziwei" as const, to: "/ziwei" as const, title: "Zi Wei Dou Shu", hint: "character · relationships · work · money · decade focus", needsTime: true },
          { id: "qizheng" as const, to: "/qizheng" as const, title: "Seven Luminaries", hint: "temperament · rhythm · pressure response · timing", needsTime: true },
          { id: "past" as const, to: "/yizhangjing" as const, title: "Past & Present", hint: "carried patterns · prior-life symbolism · independent supporting layer", needsTime: false },
          { id: "dharma" as const, to: "/yizhangjing" as const, title: "Dharma One-Palm Classic", hint: "four-life symbolism · repeated habits carried into this life", needsTime: false },
        ],
      }
    : locale === "zh-Hans"
      ? {
          label: "同一份生辰，其他六种看法",
          lead: "上方出生资料只填一次。下面每个体系都会自动沿用同一份资料，并直接显示各自的结果摘要，不再让你重复填写。",
          items: [
            { id: "indian" as const, to: "/indian-astrology" as const, title: "印度古法占星", hint: "看业力细分层；D60 对出生分钟非常敏感", needsTime: true },
            { id: "western" as const, to: "/astrology" as const, title: "西洋星座", hint: "看太阳、月亮、上升、相位与人生领域", needsTime: false },
            { id: "ziwei" as const, to: "/ziwei" as const, title: "紫微斗数", hint: "看性格、关系、事业、财务与十年主轴", needsTime: true },
            { id: "qizheng" as const, to: "/qizheng" as const, title: "七政四余", hint: "看性情、节奏、压力反应与天时变化", needsTime: true },
            { id: "past" as const, to: "/yizhangjing" as const, title: "前世今生", hint: "看前四世文化象意、反复习性与独立旁证", needsTime: false },
            { id: "dharma" as const, to: "/yizhangjing" as const, title: "达摩一掌经", hint: "看四世象意，以及被重复加强、留到今生的习惯", needsTime: false },
          ],
        }
      : {
          label: "同一份生辰，其他六種看法",
          lead: "上方出生資料只填一次。下面每個體系都會自動沿用同一份資料，並直接顯示各自的結果摘要，不再讓你重複填寫。",
          items: [
            { id: "indian" as const, to: "/indian-astrology" as const, title: "印度古法占星", hint: "看業力細分層；D60 對出生分鐘非常敏感", needsTime: true },
            { id: "western" as const, to: "/astrology" as const, title: "西洋星座", hint: "看太陽、月亮、上升、相位與人生領域", needsTime: false },
            { id: "ziwei" as const, to: "/ziwei" as const, title: "紫微斗數", hint: "看性格、關係、事業、財務與十年主軸", needsTime: true },
            { id: "qizheng" as const, to: "/qizheng" as const, title: "七政四餘", hint: "看性情、節奏、壓力反應與天時變化", needsTime: true },
            { id: "past" as const, to: "/yizhangjing" as const, title: "前世今生", hint: "看前四世文化象意、反覆習性與獨立旁證", needsTime: false },
            { id: "dharma" as const, to: "/yizhangjing" as const, title: "達摩一掌經", hint: "看四世象意，以及被重複加強、留到今生的習慣", needsTime: false },
          ],
        };

  const funCopy = locale === "en"
    ? {
        title: "Playful self-tests",
        lead: "Short self-tests you can use on their own. If a BaZi result already exists, the scent test adds a low-weight structural comparison automatically.",
        cards: [
          { to: "/fun-tests" as const, title: "Inner Animal × Guardian Beast", hint: "current personality strategy and instinctive response" },
          { to: "/fun-tests" as const, title: "Five-Element Function Test", hint: "which function you currently want to strengthen" },
          { to: "/quiz/six-realms" as const, title: "Six Realms Habit Test", hint: "which everyday habit pattern is strongest now" },
        ],
      }
    : locale === "zh-Hans"
      ? {
          title: "趣味测验",
          lead: "可以独立玩的轻量自评；若上方已经有八字结果，香气测验会自动多一层命局结构对照。",
          cards: [
            { to: "/fun-tests" as const, title: "内在动物 × 命局瑞兽", hint: "看现在常用的人格策略与本能反应" },
            { to: "/fun-tests" as const, title: "五行功能测验", hint: "看现在主观上最想加强哪一种功能" },
            { to: "/quiz/six-realms" as const, title: "六道习气测验", hint: "看目前最明显的日常惯性" },
          ],
        }
      : {
          title: "趣味測驗",
          lead: "可以獨立玩的輕量自評；若上方已經有八字結果，香氣測驗會自動多一層命局結構對照。",
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
            const reading = portalReadings[item.id];
            const preview = readingPreview(reading, locale);
            return (
              <Link
                key={item.id}
                to={item.to}
                role="button"
                tabIndex={0}
                className="zhaowu-home-portal"
                aria-label={`${item.title} · ${portalAction(locale, birth, item.needsTime)}`}
              >
                <span className="zhaowu-home-portal-copy">
                  <strong>{item.title}</strong>
                  <small className="zhaowu-home-portal-hint">（{item.hint}）</small>
                  {birth && preview ? <small className="mt-2 block text-[13px] leading-6 text-ink-soft">{preview}</small> : null}
                </span>
                <span className="zhaowu-home-portal-action">{portalAction(locale, birth, item.needsTime)}</span>
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
              <span className="min-w-0">
                <strong>{card.title}</strong>
                <small>（{card.hint}）</small>
              </span>
              <span className="zhaowu-home-fun-arrow" aria-hidden>›</span>
            </Link>
          ))}
        </div>
        <ScentFiveElementTest result={current} />
      </section>

      <div className="zhaowu-home-stage zhaowu-home-stage--gallery"><AuspiciousGallerySection /></div>
      <div className="zhaowu-home-stage zhaowu-home-stage--notes"><LifeViewHomeSection /></div>
      <div className="zhaowu-home-stage"><HomeScreenInstallPrompt /></div>
    </main>
  );
}
