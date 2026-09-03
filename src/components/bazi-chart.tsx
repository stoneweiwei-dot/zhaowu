import type { Chart, Pillar } from '@/lib/bazi/types';
import { useI18n, type Locale } from '@/lib/i18n';
import { chartTerm, emptyBranches, ganzhiLabel, pillarName, UNKNOWN_TIME_COPY } from '@/lib/bazi/presentation';

/** Presentation only: every value comes from the same immutable report snapshot. */
export function BaziChart({ chart }: { chart: Chart }) {
  const { locale } = useI18n();
  return <BaziChartContent chart={chart} locale={locale} />;
}

export function BaziChartContent({ chart, locale }: { chart: Chart; locale: Locale }) {
  const en = locale === 'en';
  const hans = locale === 'zh-Hans';
  const c = en
    ? {
        title: 'Four Pillars of Destiny',
        lead: 'Your birth chart — year, month, day and hour.',
        stem: 'Heavenly stem',
        branch: 'Earthly branch',
        role: 'Stem relationship',
        hidden: 'Hidden stems',
        sound: 'Na Yin image',
        stage: 'Twelve-stage cycle',
        void: 'Empty branches',
        life: 'Life palace',
        cycles: 'Ten-year luck cycles',
        missing: 'Birth time not known',
        more: 'Chart details',
        noCycles: 'Birth time and a cycle-direction setting are needed to show luck cycles.',
        note: 'Na Yin and the twelve stages are traditional symbolic terms, not health or lifespan predictions.',
        verifyTitle: 'Birth-hour verification needed',
        civilCandidate: 'Clock-time candidate',
        solarCandidate: 'True-solar candidate',
        verifyNote: 'True-solar correction crossed a two-hour branch boundary. Both candidates are retained for event-based verification; the working chart currently uses true solar time. Do not choose a chart from personality descriptions alone.',
      }
    : {
        title: hans ? '四柱八字' : '四柱八字',
        lead: hans ? '年、月、日、时，同一份出生资料排出的命盘。' : '年、月、日、時，同一份出生資料排出的命盤。',
        stem: '天干',
        branch: '地支',
        role: '十神',
        hidden: hans ? '藏干' : '藏干',
        sound: hans ? '纳音' : '納音',
        stage: hans ? '十二长生' : '十二長生',
        void: '空亡',
        life: hans ? '命宫' : '命宮',
        cycles: hans ? '大运' : '大運',
        missing: hans ? '时辰未知' : '時辰未知',
        more: hans ? '展开命盘细项' : '展開命盤細項',
        noCycles: hans ? '提供出生时辰与排运方向后，才能显示大运。' : '提供出生時辰與排運方向後，才能顯示大運。',
        note: hans ? '纳音与十二长生为传统象义，不是健康或寿命预测。' : '納音與十二長生為傳統象義，不是健康或壽命預測。',
        verifyTitle: hans ? '出生时柱需要校验' : '出生時柱需要校驗',
        civilCandidate: hans ? '钟表时间候选' : '鐘錶時間候選',
        solarCandidate: hans ? '真太阳时候选' : '真太陽時候選',
        verifyNote: hans
          ? '真太阳时校正跨过了一个时辰边界。系统同时保留两组候选，用已发生且年份明确的事件反证；当前工作主盘暂按真太阳时。不能只凭性格描述选盘。'
          : '真太陽時校正跨過了一個時辰邊界。系統同時保留兩組候選，用已發生且年份明確的事件反證；目前工作主盤暫按真太陽時。不能只憑性格描述選盤。',
      };
  const ready = (p: Pillar) => p.ready && !(chart.timeUnknown && p.key === 'time');
  const review = chart.birthTimeReview;

  return (
    <article className="zhaowu-bazi-chart seal-border" aria-label={c.title} data-bazi-chart>
      <header>
        <p className="zhaowu-section-kicker">ZHAOWU · BAZI</p>
        <h2>{c.title}</h2>
        <p>{c.lead}</p>
      </header>
      {chart.timeUnknown ? <p className="zhaowu-time-warning">{UNKNOWN_TIME_COPY[locale]}</p> : null}
      {review?.required && review.civil && review.trueSolar ? (
        <aside className="zhaowu-time-warning" data-birth-time-review="needs-verification">
          <strong>{c.verifyTitle}</strong>
          <p>
            {c.civilCandidate}：{ganzhiLabel(review.civil.dayGanZhi, locale)} · {ganzhiLabel(review.civil.timeGanZhi, locale)}
          </p>
          <p>
            {c.solarCandidate}：{ganzhiLabel(review.trueSolar.dayGanZhi, locale)} · {ganzhiLabel(review.trueSolar.timeGanZhi, locale)}
          </p>
          <small>{c.verifyNote}</small>
        </aside>
      ) : null}
      <div className="zhaowu-pillar-grid">
        {chart.pillars.map((p) => (
          <section key={p.key} data-pillar={p.key} aria-label={pillarName(p.key, locale)}>
            <h3>{pillarName(p.key, locale)}</h3>
            {ready(p) ? (
              <>
                <strong>{ganzhiLabel(p.ganZhi, locale)}</strong>
                <p>{chartTerm(p.gan, locale)}</p>
                <p>{chartTerm(p.zhi, locale)}</p>
                <small>{chartTerm(p.shiShenGan, locale)}</small>
              </>
            ) : (
              <p>{c.missing}</p>
            )}
          </section>
        ))}
      </div>
      <details className="zhaowu-chart-details">
        <summary>{c.more}</summary>
        <div className="zhaowu-pillar-detail-grid">
          {chart.pillars.map((p) => (
            <section key={p.key}>
              <h3>{pillarName(p.key, locale)}</h3>
              <dl>
                <dt>{c.hidden}</dt>
                <dd>
                  {ready(p)
                    ? p.hide.map((h) => (
                        <span key={h.gan}>
                          {chartTerm(h.gan, locale)} · {chartTerm(h.shiShen, locale)}
                          <br />
                        </span>
                      ))
                    : '—'}
                </dd>
                <dt>{c.sound}</dt>
                <dd>{ready(p) ? chartTerm(p.nayin, locale) : '—'}</dd>
                <dt>{c.stage}</dt>
                <dd>{ready(p) ? chartTerm(p.diShi, locale) : '—'}</dd>
                <dt>{c.void}</dt>
                <dd>{ready(p) ? emptyBranches(p.xunKong, locale) : '—'}</dd>
              </dl>
            </section>
          ))}
        </div>
        <p>
          {c.life}：{chart.timeUnknown ? '—' : ganzhiLabel(chart.minggong, locale)}
        </p>
        <p className="text-sm">{c.note}</p>
        <h3>{c.cycles}</h3>
        {!chart.timeUnknown && chart.dayun.length ? (
          <ol className="zhaowu-cycle-list">
            {chart.dayun.map((period) => (
              <li key={period.startYear}>
                <strong>{ganzhiLabel(period.ganZhi, locale)}</strong>
                <span>{period.startYear}–{period.endYear}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p>{c.noCycles}</p>
        )}
      </details>
    </article>
  );
}
