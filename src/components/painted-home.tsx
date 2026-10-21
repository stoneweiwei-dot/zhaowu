import { FROST_SKIN_ID, frostEdition } from '@/lib/seasonal-skins';
import type { CSSProperties } from 'react';
import { useSkin, type SkinDef } from '@/lib/theme-skins';
import { useI18n } from '@/lib/i18n';
import { BrandIcon } from '@/components/brand-icon';
import { HomeTree } from '@/components/home-tree';

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
  const { skin } = useSkin();
  const { locale } = useI18n();
  const t = (zh: string, hans: string, en: string) => locale === 'en' ? en : locale === 'zh-Hans' ? hans : zh;
  const layout = homeComposition(skin);
  const seasonal = skin?.id === FROST_SKIN_ID ? frostEdition() : null;
  const dark = skin?.mode === 'dark';
  // Every skin shows ITS OWN painting; the koi painting is only the no-skin / pastel-koi default.
  const art = skin?.hero || (dark ? '/theme-skins/reference-dragon.webp' : '/theme-skins/reference-koi.webp');
  const style = {
    '--ph-art': `url("${art}")`, '--ph-paper': skin?.swatch[0] || '#f7efdf',
    '--ph-ink': dark ? '#f8eace' : '#203f36', '--ph-muted': dark ? '#dfdacb' : '#595447',
    '--ph-accent': dark ? '#e1bd7d' : skin?.swatch[1] || '#557f79',
    '--ph-on-accent': dark ? '#142b32' : '#fff9e9',
  } as CSSProperties;
  return <section className="zw-painted-home" data-composition={layout} data-reference-art={!skin || FULL_PAINTING_HOMES.has(skin.id)} data-tone={dark ? 'dark' : 'light'} data-title-veil={layout === 'koi' && Boolean(skin) && skin?.id !== 'pastel-koi'} style={style}>
    <div className="ph-hero">
      <img className="ph-hero-art" src={art} alt="" fetchPriority="high" width="1248" height="1248" style={skin?.focus ? { objectPosition: skin.focus } : undefined} />
      {layout === 'scroll' && <p className="ph-resolve" data-home-resolve>{t('知命，不為認命，是為從容。', '知命，不为认命，是为从容。', 'Knowing your pattern isn’t giving in — it’s moving with composure.')}</p>}
      <a className="ph-brand" href="/" aria-label="昭梧 Zhaowu"><strong>昭梧</strong><small>Z H A O W U</small></a>
      <div className="ph-title">
        {layout === 'comic' ? <><h1>{t('命理不只是答案，\n更是看見自己的另一種方式。','命理不只是答案，\n更是看见自己的另一种方式。','Another way to\nunderstand yourself.')}</h1></> : layout === 'koi' ? <><h1>昭<br/>梧</h1><p>{t('觀天地之氣，\n照你心中之梧。', '观天地之气，\n照你心中之梧。', 'See the world clearly.\nFind your own way.')}</p><small>{t('以東方智慧，尋見更清明的自己。', '以东方智慧，寻见更清明的自己。', 'Eastern wisdom, a clearer sense of self.')}</small></> : <><h1>{skin ? (locale === 'en' ? skin.en : locale === 'zh-Hans' ? skin.hans : skin.zh) : t('順應天時\n看見更好的選擇', '顺应天时\n看见更好的选择', 'Find your rhythm.\nSee your next step.')}</h1><p className="ph-motto">{t('命 · 勢 · 選', '命 · 势 · 选', 'LIFE · TIMING · CHOICE')}</p><small>{t('在變動的時代，找到屬於你的節奏', '在变动的时代，找到属于你的节奏', 'Find your own rhythm in a changing world.')}</small></>}
      </div>
      <div className="ph-actions ph-guide-start"><a href="#home-guide">{t('從第一步開始', '从第一步开始', 'Start with step one')} <span>↓</span></a></div>
    </div>
    {layout === 'comic' ? <section className="ph-comic-panel">
      <h2>{t('漫畫命盤預覽','漫画命盘预览','Your illustrated chart')}</h2>
      <p>{t('把抽象命理，講成你看得懂的圖。','把抽象命理，讲成你看得懂的图。','Discover the ideas through gentle illustrations.')}</p>
      <div className="ph-comic-scenes" aria-hidden><img src="/art/scene-koi-rider-v1.webp" alt="" loading="lazy" width="400" height="400"/><img src="/art/scene-butterfly-dream-v1.webp" alt="" loading="lazy" width="400" height="400"/><img src="/art/scene-lotus-boat-v1.webp" alt="" loading="lazy" width="400" height="400"/></div>
      <div className="ph-comic-labels"><span>{t('你的日主','你的日主','Your nature')}</span><span>{t('你的感情','你的感情','Relationships')}</span><span>{t('你的五行','你的五行','Five elements')}</span></div>
      <button className="ph-comic-cta" onClick={() => onOpen('form')}>{t('開始我的命盤','开始我的命盘','Begin my chart')} <span>›</span></button>
      <small>{t('以宋式留白，讀懂命理的文化意象。','以宋式留白，读懂命理的文化意象。','A quiet introduction to traditional imagery.')}</small>
    </section> : null}
    {seasonal && <aside className="ph-seasonal-note" data-seasonal-note>
      <p className="ph-seasonal-term"><span lang="zh">霜降</span><span lang="en">Frost’s Descent</span></p>
      <p>{seasonal.name[locale]}</p>
      <blockquote>{seasonal.quote[locale]}</blockquote>
      <small>{t('中國傳統物候意象', '中国传统物候意象', 'Traditional Chinese seasonal imagery')}</small>
    </aside>}
    <HomeTree t={t} onOpen={onOpen} />
    <nav className="ph-bottom-nav" aria-label={t('頁面導覽','页面导航','Page navigation')}><a href="/" aria-current="page"><BrandIcon name="home"/><span>{t('首頁','首页','Home')}</span></a><button onClick={() => onOpen('form')}><BrandIcon name="reports"/><span>{t('命盤','命盘','Chart')}</span></button><button onClick={() => onOpen('today')}><BrandIcon name="calendar"/><span>{t('指引','指引','Today')}</span></button><a href="/history"><BrandIcon name="account"/><span>{t('我的','我的','Account')}</span></a></nav>
  </section>;
}
