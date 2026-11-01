import { Link } from '@tanstack/react-router';
import { FROST_SKIN_ID, SEASONAL_AUTO_ID, SOLAR_TERMS_24, seasonalState, frostEdition } from '@/lib/seasonal-skins';
import type { CSSProperties } from 'react';
import { useSkin, type SkinDef } from '@/lib/theme-skins';
import { useI18n } from '@/lib/i18n';
import { BrandIcon } from '@/components/brand-icon';
import { HomeTree } from '@/components/home-tree';
import { CuratedVideoShelf } from '@/components/curated-video-shelf';
import { PortraitEditionShowcase } from '@/components/portrait-edition-showcase';
import '@/guaili-collection-entry.css';
import '@/home-mobile-v2.css';

type Section = 'form' | 'today' | 'quiz' | 'notes';
/** Skins whose painting is clean enough to show at full strength behind the home title. */
const FULL_PAINTING_HOMES = new Set([
  'solar-frost-descent', 'pastel-koi', 'dragon-lotus', 'lotus-boat', 'night-flute', 'day-flute', 'cloud-jade',
  'dawn-dragon', 'moon-lotus-boat', 'bamboo-falls', 'petal-immortal', 'pink-lotus-stream', 'butterfly-lotus',
]);
export function homeComposition(skin: SkinDef | null): 'scroll' | 'comic' | 'koi' {
  // All published skins share one Song editorial shell; preserve the unskinned classic fallback.
  // Artwork, colour and title still come from each individual SkinDef.
  return skin ? 'scroll' : 'koi';
}

/** Real links and controls over separate art layers; never a screenshot with hotspots. */
export function PaintedHome({ onOpen }: { onOpen: (section: Section) => void }) {
  const { id, skin } = useSkin();
  const { locale } = useI18n();
  const t = (zh: string, hans: string, en: string) => locale === 'en' ? en : locale === 'zh-Hans' ? hans : zh;
  const layout = homeComposition(skin);
  const seasonalAuto = id === SEASONAL_AUTO_ID ? seasonalState() : null;
  const frostOnly = !seasonalAuto && skin?.id === FROST_SKIN_ID ? frostEdition() : null;
  const houNumber = seasonalAuto ? SOLAR_TERMS_24.indexOf(seasonalAuto.term) * 3 + seasonalAuto.houIndex + 1 : null;
  const dark = skin?.mode === 'dark';
  // Every skin shows ITS OWN painting; the koi painting is only the no-skin / pastel-koi default.
  const art = skin?.hero || (dark ? '/theme-skins/reference-dragon.webp' : '/theme-skins/reference-koi.webp');
  // Keep published, owner-selected paintings; replace the disliked flute/default hero with an existing Song-style mist painting.
  const editorialArt = !skin || /flute/i.test(skin.id) ? '/theme-skins/verdant-mist-art.webp' : art;
  const style = {
    '--ph-art': `url("${art}")`, '--ph-paper': skin?.swatch[0] || '#f7efdf',
    '--ph-ink': dark ? '#f8eace' : '#203f36', '--ph-muted': dark ? '#dfdacb' : '#595447',
    '--ph-accent': dark ? '#e1bd7d' : skin?.swatch[1] || '#557f79',
    '--ph-highlight': skin?.swatch[2] || '#c7a468',
    '--ph-on-accent': dark ? '#142b32' : '#fff9e9',
  } as CSSProperties;
  return <section className="zw-painted-home zw-v2-home" data-home-v2 data-composition={layout} data-reference-art={!skin || FULL_PAINTING_HOMES.has(skin.id)} data-tone={dark ? 'dark' : 'light'} style={style}>
    <section className="zw-v2-hero" aria-labelledby="zw-v2-title">
      <header className="zw-v2-masthead">
        <Link className="zw-v2-wordmark" to="/" aria-label="昭梧 ZHAOWU">
          <img src="/brand-ui/header-gourd-wordmark-r113.png" alt="" width="48" height="48" />
          <span><strong>昭梧</strong><small>Z H A O W U</small></span>
        </Link>
      </header>
      <div className="zw-v2-opening">
        <p className="zw-v2-eyebrow">{t('東方時間文化 · 個人命書', '东方时间文化 · 个人命书', 'EASTERN TIME CULTURE · PERSONAL DESTINY BOOK')}</p>
        <h1 id="zw-v2-title">
          <span>{t('讓天時有形，', '让天时有形，', 'Give time a form.')}</span>
          <span>{t('讓命理可讀。', '让命理可读。', 'Make destiny readable.')}</span>
        </h1>
        <p className="zw-v2-intro">{t(
          '從一份生辰開始，免登入排盤，先讀免費核心解讀；再慢慢探索昭梧的文章、原創圖錄與每日指引。',
          '从一份生辰开始，无需登录即可排盘，先阅读免费的核心解读；再慢慢探索昭梧的文章、原创图鉴与每日指引。',
          'Start with your birth details to create a chart without signing in and read your free core insights. Then explore ZHAOWU’s essays, original art collections and daily guide.'
        )}</p>
        <div className="zw-v2-actions">
          <button type="button" className="zw-v2-primary" data-home-birth-entry onClick={() => onOpen('form')}>
            {t('開始免費排盤', '开始免费排盘', 'Start my free chart')} <span aria-hidden="true">→</span>
          </button>
          <p className="zw-v2-free-note">{t('免費 · 免登入 · 約 1 分鐘開始', '免费 · 免登录 · 约 1 分钟开始', 'Free · no sign-in · begin in about 1 minute')}</p>
          <Link className="zw-v2-sample" to="/sample-report">{t('先看公開命書示例', '先看公开命书示例', 'View a sample report')} <span aria-hidden="true">›</span></Link>
        </div>
      </div>
      <figure className="zw-v2-painting">
        <img src={editorialArt} alt={t('昭梧原創藝術畫境', '昭梧原创艺术画境', 'Original ZHAOWU artwork')} width="1248" height="1248" decoding="async" fetchPriority="high" />
        <figcaption>STONE 原創 · ZHAOWU</figcaption>
      </figure>
      <a className="zw-v2-discover" href="#home-guide">{t('往下探索昭梧', '继续探索昭梧', 'Discover more of ZHAOWU')} <span aria-hidden="true">↓</span></a>
    </section>
    <HomeTree t={t} onOpen={onOpen} />
    <PortraitEditionShowcase locale={locale} />
    {seasonalAuto && <aside className="ph-seasonal-note" data-seasonal-note data-solar-term={seasonalAuto.term.zh} data-solar-hou={seasonalAuto.houIndex + 1}>
      <p className="ph-seasonal-term"><span lang="zh">{locale === 'zh-Hans' ? seasonalAuto.term.hans : seasonalAuto.term.zh}</span><span lang="en">{seasonalAuto.term.en}</span></p>
      <p>{seasonalAuto.hou[locale]}</p>
      <blockquote>{t('初候・二候・三候，循時而變。', '初候・二候・三候，循时而变。', 'Three pentads, changing with the seasons.')}</blockquote>
      <small>{locale === 'en' ? `Pentad ${houNumber} / 72 · Sydney calendar schedule` : `第 ${houNumber} / 72 候 · 悉尼節氣日程`}</small>
      <small>{t('傳統中國物候，不代表澳洲當地氣候。非霜降節氣沿用已上架畫作。', '传统中国物候，不代表澳洲当地气候。非霜降节气沿用已上架画作。', 'Traditional Chinese imagery, not a Sydney weather forecast. Other terms reuse published artwork.')}</small>
    </aside>}
    {frostOnly && <aside className="ph-seasonal-note" data-seasonal-note>
      <p className="ph-seasonal-term"><span lang="zh">霜降</span><span lang="en">Frost’s Descent</span></p>
      <p>{frostOnly.name[locale]}</p>
      <blockquote>{frostOnly.quote[locale]}</blockquote>
      <small>{t('中國傳統物候意象', '中国传统物候意象', 'Traditional Chinese seasonal imagery')}</small>
    </aside>}
    <Link className="ph-mythic-entry" to="/mythic-atlas" data-home-mythic-atlas-entry>
      <img src="/mythic-atlas/originals/01-skeleton-puppet.webp" alt="" loading="lazy" width="941" height="1672" />
      <span>
        <small>{t('昭梧原創圖錄', '昭梧原创图录', 'ZHAOWU ORIGINAL ATLAS')}</small>
        <strong>{t('幽明萬象錄 · 原創設定集', '幽明万象录 · 原创设定集', 'Chronicle of Hidden and Manifest Worlds')}</strong>
        <em>{t('十二幅原創圖 · 八大支系 · 三十五位人物', '十二幅原创图 · 八大支系 · 三十五位人物', 'Twelve original plates · eight lineages · thirty-five figures')}</em>
      </span>
      <i aria-hidden>›</i>
    </Link>
    <Link className="ph-guaili-bookcase" to="/guaili-luanshen" data-home-guaili-collection>
      <span><small>{t('幽明萬象錄・獨立系列書目', '幽明万象录・独立系列书目', 'HIDDEN & MANIFEST · SERIES INDEX')}</small>
        <strong>{t('三界異聞錄｜七卷全書', '三界异闻录｜七卷全书', 'Tales of the Three Realms · The Seven Volumes')}</strong>
        <em>{t('十二地支四態・十二流煞・八災十年編年', '十二地支四态・十二流煞・八灾十年编年', 'Twelve branches · Twelve currents · The final chronicle')}</em></span>
      <i aria-hidden="true">↗</i>
    </Link>
    <CuratedVideoShelf placement="home" />
    <nav className="ph-bottom-nav" aria-label={t('頁面導覽','页面导航','Page navigation')}><Link to="/" aria-current="page"><BrandIcon name="home"/><span>{t('首頁','首页','Home')}</span></Link><button onClick={() => onOpen('form')}><BrandIcon name="reports"/><span>{t('命盤','命盘','Chart')}</span></button><button onClick={() => onOpen('today')}><BrandIcon name="calendar"/><span>{t('指引','指引','Today')}</span></button><Link to="/history"><BrandIcon name="account"/><span>{t('我的','我的','Account')}</span></Link></nav>
  </section>;
}
