import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  readSharedBirthRecord,
  SHARED_BIRTH_EVENT,
  type SharedBirthRecord,
} from "@/lib/shared-birth";
import {
  buildIndianReading,
  buildPalmReading,
  buildQizhengReading,
  buildWesternReading,
  buildZiweiReading,
  type SpecialistId,
  type SpecialistReading,
} from "@/lib/specialist-reading";

type InlineReportId = SpecialistId;

type InlineMeta = {
  title: string;
  hint: string;
};

const META: Record<Locale, Record<InlineReportId, InlineMeta>> = {
  "zh-Hant": {
    indian: { title: "印度古法占星", hint: "業力細分層與時間敏感旁證" },
    western: { title: "西洋星座", hint: "太陽、月亮、上升與人生領域" },
    ziwei: { title: "紫微斗數", hint: "性格、關係、事業、財務與十年主軸" },
    qizheng: { title: "七政四餘", hint: "性情、節奏、壓力反應與天時變化" },
    past: { title: "前世今生", hint: "前四世文化象意、反覆習性與獨立旁證" },
    dharma: { title: "一掌古法", hint: "四世象意與被反覆加強的習性" },
  },
  "zh-Hans": {
    indian: { title: "印度古法占星", hint: "业力细分层与时间敏感旁证" },
    western: { title: "西洋星座", hint: "太阳、月亮、上升与人生领域" },
    ziwei: { title: "紫微斗数", hint: "性格、关系、事业、财务与十年主轴" },
    qizheng: { title: "七政四余", hint: "性情、节奏、压力反应与天时变化" },
    past: { title: "前世今生", hint: "前四世文化象意、反复习性与独立旁证" },
    dharma: { title: "一掌古法", hint: "四世象意与被反复加强的习性" },
  },
  en: {
    indian: { title: "Classical Indian Astrology", hint: "Karmic detail and time-sensitive supporting layer" },
    western: { title: "Western Astrology", hint: "Sun, Moon, Rising and life areas" },
    ziwei: { title: "Zi Wei Dou Shu", hint: "Character, relationships, work, money and decade focus" },
    qizheng: { title: "Seven Luminaries", hint: "Temperament, rhythm, pressure response and timing" },
    past: { title: "Past & Present", hint: "Four-life symbolism and recurring patterns" },
    dharma: { title: "One-Palm Classical Reading", hint: "Four-life symbolism and reinforced habits" },
  },
};

const ORDER: InlineReportId[] = ["indian", "western", "ziwei", "qizheng", "past", "dharma"];

function buildReading(id: InlineReportId, birth: SharedBirthRecord, locale: Locale): SpecialistReading {
  if (id === "western") return buildWesternReading(birth, locale);
  if (id === "ziwei") return buildZiweiReading(birth, locale);
  if (id === "qizheng") return buildQizhengReading(birth, locale);
  if (id === "indian") return buildIndianReading(birth, locale);
  return buildPalmReading(birth, locale);
}

function copy(locale: Locale) {
  if (locale === "en") {
    return {
      open: "Show full report",
      close: "Collapse",
      missing: "Add your birth data once in the Zi Ping BaZi section above. The report will then appear directly inside this section.",
      report: "Report",
    };
  }
  if (locale === "zh-Hans") {
    return {
      open: "显示完整报告",
      close: "收起",
      missing: "先在上方四柱八字填写一次出生资料。完成后，本体系报告会直接显示在这个分区里，不再跳去另一个空页面。",
      report: "分析报告",
    };
  }
  return {
    open: "顯示完整報告",
    close: "收起",
    missing: "先在上方四柱八字填寫一次出生資料。完成後，本體系報告會直接顯示在這個分區裡，不再跳去另一個空頁面。",
    report: "分析報告",
  };
}

export function VisibleRegressionFixesR79() {
  const { locale } = useI18n();
  const c = copy(locale);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [birth, setBirth] = useState<SharedBirthRecord | null>(null);
  const [collapsed, setCollapsed] = useState<Partial<Record<InlineReportId, boolean>>>({});

  useEffect(() => {
    const syncBirth = () => setBirth(readSharedBirthRecord());
    syncBirth();
    window.addEventListener(SHARED_BIRTH_EVENT, syncBirth);
    window.addEventListener("storage", syncBirth);
    return () => {
      window.removeEventListener(SHARED_BIRTH_EVENT, syncBirth);
      window.removeEventListener("storage", syncBirth);
    };
  }, []);

  useEffect(() => {
    const locate = () => {
      const next = document.querySelector<HTMLElement>(".zhaowu-home-portals-block");
      setHost((current) => current === next ? current : next);
      const scent = document.querySelector<HTMLElement>('section[aria-labelledby="scent-five-element-title"]');
      if (scent) scent.dataset.r79Scent = "true";
    };
    locate();
    const observer = new MutationObserver(locate);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("popstate", locate);
    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", locate);
    };
  }, []);

  useEffect(() => {
    if (!host) return;
    host.dataset.r79InlineReports = "true";
    return () => { delete host.dataset.r79InlineReports; };
  }, [host]);

  const readings = useMemo(() => {
    if (!birth) return {} as Partial<Record<InlineReportId, SpecialistReading>>;
    return Object.fromEntries(ORDER.map((id) => [id, buildReading(id, birth, locale)])) as Record<InlineReportId, SpecialistReading>;
  }, [birth, locale]);

  const styles = (
    <style>{`
      [data-background-music-control] {
        left: auto !important;
        right: max(.65rem, env(safe-area-inset-right)) !important;
        bottom: max(.65rem, env(safe-area-inset-bottom)) !important;
        width: 2.35rem !important;
        height: 2.35rem !important;
        min-width: 2.35rem !important;
        padding: 0 !important;
        justify-content: center !important;
        border-radius: 999px !important;
      }
      [data-background-music-control] > span:last-child { display: none !important; }

      .zhaowu-home-portals-block[data-r79-inline-reports="true"] .zhaowu-home-portals { display: none !important; }
      .r79-inline-report-stack { border-top: 1px solid rgba(139,99,55,.18); }
      .r79-inline-report-row { border-bottom: 1px solid rgba(139,99,55,.22); }
      .r79-inline-report-toggle {
        width: 100%; display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 14px; align-items: center;
        padding: 18px 3px 12px; text-align: left; background: transparent; color: #29251f;
      }
      .r79-inline-report-toggle strong { display: block; font-family: var(--font-display, serif); font-size: 1.25rem; line-height: 1.35; letter-spacing: .045em; }
      .r79-inline-report-toggle small { display: block; margin-top: 5px; color: rgba(76,65,52,.68); font-size: .76rem; line-height: 1.6; }
      .r79-inline-report-action { color: rgba(143,48,39,.9); font-size: .77rem; white-space: nowrap; }
      .r79-inline-report-body { padding: 0 4px 22px; }
      .r79-inline-report-lead { margin: 0 0 14px; color: #5a554c; font-size: .92rem; line-height: 1.9; }
      .r79-inline-report-warning { margin: 0 0 14px; border-left: 3px solid rgba(167,53,43,.55); padding: 7px 0 7px 12px; color: #6f3d35; font-size: .82rem; line-height: 1.75; }
      .r79-inline-report-section { padding: 13px 0; border-top: 1px solid rgba(139,99,55,.14); }
      .r79-inline-report-section h4 { margin: 0 0 5px; font-family: var(--font-display, serif); color: #2d2a24; font-size: 1rem; line-height: 1.45; }
      .r79-inline-report-section p { margin: 0; white-space: pre-line; color: #5a554c; font-size: .88rem; line-height: 1.85; }
      .r79-inline-report-missing { padding: 4px 0 20px; color: #7a7063; font-size: .84rem; line-height: 1.8; }

      section[data-r79-scent="true"] {
        margin-top: 18px !important; border: 0 !important; border-top: 1px solid rgba(139,99,55,.24) !important;
        border-bottom: 1px solid rgba(139,99,55,.2) !important; border-radius: 0 !important;
        padding: 20px 2px 22px !important; background: transparent !important; box-shadow: none !important;
      }
      section[data-r79-scent="true"] > div.mt-3.grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; gap: 8px !important; }
      section[data-r79-scent="true"] > div.mt-3.grid > button {
        min-height: 44px !important; border-radius: 9px !important; padding: 9px 10px !important; font-size: .78rem !important; line-height: 1.45 !important;
      }
      @media (max-width: 390px) {
        .r79-inline-report-toggle { padding: 16px 1px 11px; }
        .r79-inline-report-toggle strong { font-size: 1.1rem; }
        section[data-r79-scent="true"] > div.mt-3.grid > button { font-size: .74rem !important; }
      }
    `}</style>
  );

  const portal = host ? createPortal(
    <div className="r79-inline-report-stack" data-r79-report-stack>
      {ORDER.map((id) => {
        const meta = META[locale][id];
        const reading = readings[id];
        const isOpen = Boolean(birth) && !collapsed[id];
        return (
          <section key={id} className="r79-inline-report-row" data-inline-report-id={id}>
            <button
              type="button"
              className="r79-inline-report-toggle"
              aria-expanded={isOpen}
              onClick={() => {
                if (!birth) {
                  document.getElementById("bazi")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  return;
                }
                setCollapsed((current) => ({ ...current, [id]: !current[id] }));
              }}
            >
              <span>
                <strong>{meta.title}</strong>
                <small>{meta.hint}</small>
              </span>
              <span className="r79-inline-report-action">{birth ? (isOpen ? c.close : c.open) : c.open}</span>
            </button>

            {isOpen && birth && reading ? (
              <div className="r79-inline-report-body" aria-label={`${meta.title} ${c.report}`}>
                {reading.warning ? <p className="r79-inline-report-warning">{reading.warning}</p> : null}
                {reading.lead ? <p className="r79-inline-report-lead">{reading.lead}</p> : null}
                {reading.sections.map((section, index) => (
                  <article key={`${id}-${index}-${section.title}`} className="r79-inline-report-section">
                    <h4>{section.title}</h4>
                    <p>{section.body}</p>
                  </article>
                ))}
              </div>
            ) : null}

            {!birth ? <p className="r79-inline-report-missing">{c.missing}</p> : null}
          </section>
        );
      })}
    </div>,
    host,
  ) : null;

  return <>{styles}{portal}</>;
}
