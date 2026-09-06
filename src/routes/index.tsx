import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnalysisForm } from "@/components/analysis-form";
import { FollowUpBox } from "@/components/follow-up-box";
import { ResultView } from "@/components/result-view";
import { DailyAlmanacWidget } from "@/components/daily-almanac-widget";
import { HomeScreenInstallPrompt } from "@/components/home-screen-install-prompt";
import { AuspiciousGallerySection } from "@/components/auspicious-gallery-section";
import { LifeViewHomeSection } from "@/components/life-view-home-section";
import { ScentFiveElementTest } from "@/components/scent-five-element-test";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { readSharedBirthRecord } from "@/lib/shared-birth";
import { buildZiweiReading, buildWesternReading, type SpecialistReading } from "@/lib/specialist-reading";
import "@/home-layout-r46.css";
import "@/home-birth-hub-r60.css";

export const Route = createFileRoute("/")({ component: HomePage });

type PortalId = "yizhangjing" | "indian" | "ziwei" | "qizheng" | "astrology" | "bazi";

type PortalItem = {
  id: PortalId;
  to: "/yizhangjing" | "/indian-astrology" | "/ziwei" | "/qizheng" | "/astrology" | "/";
  title: string;
  hint: string;
  needsTime?: boolean;
};

function portalAction(locale: "zh-Hant" | "zh-Hans" | "en", birth: ReturnType<typeof readSharedBirthRecord>, needsTime?: boolean) {
  if (!birth) return locale === "en" ? "Enter birth details once" : locale === "zh-Hans" ? "先填一次出生资料" : "先填一次出生資料";
  if (needsTime && birth.timeUnknown) return locale === "en" ? "Auto-read · time needed" : locale === "zh-Hans" ? "已自动读取 · 需时辰" : "已自動讀取 · 需時辰";
  return locale === "en" ? "Auto-generated · view full" : locale === "zh-Hans" ? "已自动生成 · 查看完整" : "已自動生成 · 查看完整";
}

function readingPreview(reading: SpecialistReading | null, locale: "zh-Hant" | "zh-Hans" | "en") {
  if (!reading) return null;
  const first = reading.sections[0]?.body?.[0];
  if (!first) return null;
  const clean = first.replace(/\s+/g, " ").trim();
  const max = locale === "en" ? 108 : 48;
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function HomePage() {
  const { locale } = useI18n();
  const current = useAppStore((state) => state.current);
  const [birth, setBirth] = useState(() => readSharedBirthRecord());

  useEffect(() => {
    const sync = () => setBirth(readSharedBirthRecord());
    window.addEventListener("zhaowu-shared-birth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("zhaowu-shared-birth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const portalReadings = useMemo(() => {
    if (!birth) return {} as Partial<Record<PortalId, SpecialistReading>>;
    const out: Partial<Record<PortalId, SpecialistReading>> = {};
    try { out.ziwei = buildZiweiReading(birth, locale); } catch { /* keep portal available */ }
    try { out.astrology = buildWesternReading(birth, locale); } catch { /* keep portal available */ }
    return out;
  }, [birth, locale]);

  const portalCopy = locale === "en"
    ? {
        label: "Six ways to read the same birth record",
        lead: "Enter your birth details once in Four Pillars. The other systems reuse the same record automatically.",
        items: [
          { id: "bazi", to: "/" as const, title: "Four Pillars of Destiny", hint: "structure, timing and practical choices" },
          { id: "ziwei", to: "/ziwei" as const, title: "Zi Wei Dou Shu", hint: "personality, relationships and ten-year themes", needsTime: true },
          { id: "qizheng", to: "/qizheng" as const, title: "Seven Luminaries & Four Extras", hint: "temperament, timing and pressure response", needsTime: true },
          { id: "astrology", to: "/astrology" as const, title: "Western Astrology", hint: "planetary character and life emphasis", needsTime: true },
          { id: "yizhangjing", to: "/yizhangjing" as const, title: "Dharma One-Palm", hint: "four-life imagery and repeated habits", needsTime: true },
          { id: "indian", to: "/indian-astrology" as const, title: "Classical Indian Astrology", hint: "D60 minute-sensitive cross-check", needsTime: true },
        ] satisfies PortalItem[],
      }
    : locale === "zh-Hans"
      ? {
          label: "同一份生辰 · 六种看法",
          lead: "出生资料只在四柱八字填一次；其他系统直接沿用，不再重复输入。",
          items: [
            { id: "bazi", to: "/" as const, title: "四柱八字", hint: "格局、节奏与现实选择" },
            { id: "ziwei", to: "/ziwei" as const, title: "紫微斗数", hint: "性格、关系、事业与十年主轴", needsTime: true },
            { id: "qizheng", to: "/qizheng" as const, title: "七政四余", hint: "性情、节奏、压力反应与天时", needsTime: true },
            { id: "astrology", to: "/astrology" as const, title: "西洋占星", hint: "行星性格与人生重点", needsTime: true },
            { id: "yizhangjing", to: "/yizhangjing" as const, title: "达摩一掌经", hint: "四世象意与重复习气", needsTime: true },
            { id: "indian", to: "/indian-astrology" as const, title: "印度古法占星", hint: "D60 对出生分钟非常敏感", needsTime: true },
          ] satisfies PortalItem[],
        }
      : {
          label: "同一份生辰 · 六種看法",
          lead: "出生資料只在四柱八字填一次；其他系統直接沿用，不再重複輸入。",
          items: [
            { id: "bazi", to: "/" as const, title: "四柱八字", hint: "格局、節奏與現實選擇" },
            { id: "ziwei", to: "/ziwei" as const, title: "紫微斗數", hint: "性格、關係、事業與十年主軸", needsTime: true },
            { id: "qizheng", to: "/qizheng" as const, title: "七政四餘", hint: "性情、節奏、壓力反應與天時", needsTime: true },
            { id: "astrology", to: "/astrology" as const, title: "西洋占星", hint: "行星性格與人生重點", needsTime: true },
            { id: "yizhangjing", to: "/yizhangjing" as const, title: "達摩一掌經", hint: "四世象意與重複習氣", needsTime: true },
            { id: "indian", to: "/indian-astrology" as const, title: "印度古法占星", hint: "D60 對出生分鐘非常敏感", needsTime: true },
          ] satisfies PortalItem[],
        };

  const funCopy = locale === "en"
    ? {
        title: "Light self-tests",
        lead: "Standalone reflective tests. If a Four Pillars result already exists above, the scent test adds a structural comparison layer automatically.",
        cards: [
          { to: "/fun-tests" as const, title: "Inner Animal × Auspicious Beast", hint: "current personality strategy and instinctive response" },
          { to: "/fun-tests" as const, title: "Five-Element Function Test", hint: "which function you subjectively want to strengthen now" },
          { to: "/quiz/six-realms" as const, title: "Six-Realm Habit Test", hint: "the most visible everyday tendency right now" },
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
      <div className="zhaowu-home-stage zhaowu-home-stage--primary relative">
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
