import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { SharedBirthRecord } from "@/lib/shared-birth";
import { buildPersonalPaidProfile } from "@/lib/report/personal-paid-profile";

const COPY: Record<Locale, {
  kicker: string;
  title: string;
  lead: string;
  pageOne: string;
  pageTwo: string;
  pageThree: string;
  birth: string;
  pillars: string;
  core: string;
  cycle: string;
  colors: string;
  quietColors: string;
  materials: string;
  relations: string;
  hours: string;
  persona: string;
  next: string;
  previous: string;
}> = {
  "zh-Hant": {
    kicker: "ZHAOWU · PERSONAL EDITION",
    title: "你的個人命格專頁",
    lead: "只按這位客戶自己的出生資料生成；同一版式，每一份內容都不同。",
    pageOne: "命格總覽",
    pageTwo: "專屬穿衣",
    pageThree: "關係與節律",
    birth: "出生資料",
    pillars: "四柱",
    core: "核心氣機",
    cycle: "目前大運",
    colors: "適合色系",
    quietColors: "少量使用",
    materials: "首飾／材質",
    relations: "合沖刑害",
    hours: "較順手時段",
    persona: "性格面具",
    next: "下一頁",
    previous: "上一頁",
  },
  "zh-Hans": {
    kicker: "ZHAOWU · PERSONAL EDITION",
    title: "你的个人命格专页",
    lead: "只按这位客户自己的出生资料生成；同一版式，每一份内容都不同。",
    pageOne: "命格总览",
    pageTwo: "专属穿衣",
    pageThree: "关系与节律",
    birth: "出生资料",
    pillars: "四柱",
    core: "核心气机",
    cycle: "目前大运",
    colors: "适合色系",
    quietColors: "少量使用",
    materials: "首饰／材质",
    relations: "合冲刑害",
    hours: "较顺手时段",
    persona: "性格面具",
    next: "下一页",
    previous: "上一页",
  },
  en: {
    kicker: "ZHAOWU · PERSONAL EDITION",
    title: "Your personal chart page",
    lead: "Generated only from this customer's birth record. The layout stays consistent; the content does not.",
    pageOne: "Chart overview",
    pageTwo: "Personal palette",
    pageThree: "Relations & rhythm",
    birth: "Birth record",
    pillars: "Four pillars",
    core: "Core dynamic",
    cycle: "Current cycle",
    colors: "Working palette",
    quietColors: "Use lightly",
    materials: "Materials",
    relations: "Branch relations",
    hours: "Easier windows",
    persona: "Persona",
    next: "Next",
    previous: "Previous",
  },
};

export function PersonalPaidProfile({ birth, locale }: { birth: SharedBirthRecord; locale: Locale }) {
  const copy = COPY[locale];
  const model = useMemo(() => buildPersonalPaidProfile(birth, locale), [birth, locale]);
  const [page, setPage] = useState(0);

  useEffect(() => setPage(0), [birth.year, birth.month, birth.day, birth.hour, birth.minute, birth.timeUnknown, birth.city.display]);

  const pageTitle = [copy.pageOne, copy.pageTwo, copy.pageThree][page];

  return (
    <section
      className="zhaowu-paid-personal-profile"
      data-personal-paid-profile
      data-personal-source="customer-birth-only"
      aria-labelledby="zhaowu-paid-personal-title"
    >
      <header className="zhaowu-paid-personal-profile__head">
        <div>
          <p>{copy.kicker}</p>
          <h3 id="zhaowu-paid-personal-title">{copy.title}</h3>
          <span>{copy.lead}</span>
        </div>
        <div className="zhaowu-paid-personal-profile__pager" aria-label={pageTitle}>
          <b>{page + 1}/3</b>
          <button type="button" aria-label={copy.previous} disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>←</button>
          <button type="button" aria-label={copy.next} disabled={page === 2} onClick={() => setPage((value) => Math.min(2, value + 1))}>→</button>
        </div>
      </header>

      <div className="zhaowu-paid-personal-profile__page-title">
        <strong>{pageTitle}</strong>
        <span aria-hidden="true">STONE · {String(page + 1).padStart(2, "0")}</span>
      </div>

      {page === 0 ? (
        <div className="zhaowu-paid-personal-profile__page is-overview">
          <article className="zhaowu-paid-personal-card is-birth">
            <small>{copy.birth}</small>
            <strong>{model.birthLine}</strong>
          </article>

          <article className="zhaowu-paid-personal-card is-pillars">
            <small>{copy.pillars}</small>
            <div className="zhaowu-paid-personal-pillars">
              {model.pillars.map((pillar) => (
                <span key={pillar.key} data-ready={pillar.ready}>
                  <i>{pillar.label}</i>
                  <b>{pillar.ganZhi}</b>
                </span>
              ))}
            </div>
          </article>

          <article className="zhaowu-paid-personal-card is-core">
            <small>{copy.core}</small>
            <strong>{model.core}</strong>
          </article>

          <article className="zhaowu-paid-personal-card is-cycle">
            <small>{copy.cycle}</small>
            <strong>{model.currentCycle}</strong>
          </article>
        </div>
      ) : null}

      {page === 1 ? (
        <div className="zhaowu-paid-personal-profile__page is-palette">
          <article className="zhaowu-paid-personal-card is-colors">
            <small>{copy.colors}</small>
            <div className="zhaowu-paid-personal-swatches">
              {model.colorSwatches.map((item) => (
                <span key={item.label}>
                  <i style={{ backgroundColor: item.hex }} aria-hidden="true" />
                  <b>{item.label}</b>
                </span>
              ))}
            </div>
          </article>

          <article className="zhaowu-paid-personal-card is-quiet">
            <small>{copy.quietColors}</small>
            <div className="zhaowu-paid-personal-mini-swatches">
              {model.quietColorSwatches.map((item) => (
                <span key={item.label}><i style={{ backgroundColor: item.hex }} aria-hidden="true" />{item.label}</span>
              ))}
            </div>
          </article>

          <article className="zhaowu-paid-personal-card is-materials">
            <small>{copy.materials}</small>
            <div className="zhaowu-paid-personal-tags">{model.materials.map((item) => <span key={item}>{item}</span>)}</div>
          </article>
        </div>
      ) : null}

      {page === 2 ? (
        <div className="zhaowu-paid-personal-profile__page is-rhythm">
          <article className="zhaowu-paid-personal-card is-relations">
            <small>{copy.relations}</small>
            <div className="zhaowu-paid-personal-tags">{model.relations.map((item) => <span key={item}>{item}</span>)}</div>
          </article>

          <article className="zhaowu-paid-personal-card is-hours">
            <small>{copy.hours}</small>
            <div className="zhaowu-paid-personal-tags">{model.hours.map((item) => <span key={item}>{item}</span>)}</div>
          </article>

          <article className="zhaowu-paid-personal-card is-persona">
            <small>{copy.persona}</small>
            <strong>{model.persona}</strong>
          </article>
        </div>
      ) : null}

      <footer className="zhaowu-paid-personal-profile__foot">
        <p>{model.note}</p>
        <span aria-hidden="true">昭梧</span>
      </footer>
    </section>
  );
}
