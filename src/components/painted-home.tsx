import type { CSSProperties } from 'react';
import { useSkin, type SkinDef } from '@/lib/theme-skins';
import { useI18n } from '@/lib/i18n';
import { BrandIcon } from '@/components/brand-icon';
import { HomeTree } from '@/components/home-tree';

type Section = 'form' | 'today' | 'quiz' | 'notes';
/** Skins whose painting is clean enough to show at full strength behind the home title. */
const FULL_PAINTING_HOMES = new Set([
  'pastel-koi', 'dragon-lotus', 'lotus-boat', 'night-flute', 'day-flute', 'cloud-jade',
  'dawn-dragon', 'moon-lotus-boat', 'bamboo-falls', 'petal-immortal', 'pink-lotus-stream', 'butterfly-lotus',
]);
export function homeComposition(skin: SkinDef | null) {
  // Product lock from owner refs: day = koi (1st image); night = scroll (2nd image).
  if (skin?.mode === 'dark') return 'scroll';
  if (skin?.id === 'cloud-jade') return 'comic';
  return 'koi';
}

/** Real links and controls over separate art layers; never a screenshot with hotspots. */
export function PaintedHome({ onOpen }: { onOpen: (section: Section) => void }) {
  const { skin } = useSkin();
  const { locale } = useI18n();
  const t = (zh: string, hans: string, en: string) => locale === 'en' ? en : locale === 'zh-Hans' ? hans : zh;
  const layout = homeComposition(skin);
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
      <a className="ph-brand" href="/" aria-label="昭梧 Zhaowu"><strong>昭梧</strong><small>Z H A O W U</small></a>
      <div className="ph-title">
        {layout === 'comic' ? <><h1>{t('命理不只是答案，\n更是看見自己的另一種方式。','命理不只是答案，\n更是看见自己的另一种方式。','Another way to\nunderstand yourself.')}</h1></> : layout === 'koi' ? <><h1>昭<br/>梧</h1><p>{t('觀天地之氣，\n照你心中之梧。', '观天地之气，\n照你心中之梧。', 'See the world clearly.\nFind your own way.')}</p><small>{t('以東方智慧，尋見更清明的自己。', '以东方智慧，寻见更清明的自己。', 'Eastern wisdom, a clearer sense of self.')}</small></> : <><h1>{t('順應天時\n看見更好的選擇', '顺应天时\n看见更好的选择', 'Find your rhythm.\nSee your next step.')}</h1><p className="ph-motto">{t('命 · 勢 · 選', '命 · 势 · 选', 'LIFE · TIMING · CHOICE')}</p><small>{t('在變動的時代，找到屬於你的節奏', '在变动的时代，找到属于你的节奏', 'Find your own rhythm in a changing world.')}</small></>}
      </div>
      {layout === 'scroll' && <div className="ph-actions"><button onClick={() => onOpen('form')} data-home-birth-entry>{t('開始分析', '开始分析', 'Begin analysis')} <span>›</span></button><a href="#today" onClick={e => {e.preventDefault(); onOpen('today');}}>{t('今日指引', '今日指引', 'Today’s guide')} <span>›</span></a></div>}
    </div>
    {layout === 'comic' ? <section className="ph-comic-panel">
      <h2>{t('漫畫命盤預覽','漫画命盘预览','Your illustrated chart')}</h2>
      <p>{t('把抽象命理，講成你看得懂的圖。','把抽象命理，讲成你看得懂的图。','Discover the ideas through gentle illustrations.')}</p>
      <div className="ph-comic-scenes" aria-hidden><img src="/art/scene-koi-rider-v1.webp" alt="" loading="lazy" width="400" height="400"/><img src="/art/scene-butterfly-dream-v1.webp" alt="" loading="lazy" width="400" height="400"/><img src="/art/scene-lotus-boat-v1.webp" alt="" loading="lazy" width="400" height="400"/></div>
      <div className="ph-comic-labels"><span>{t('你的日主','你的日主','Your nature')}</span><span>{t('你的感情','你的感情','Relationships')}</span><span>{t('你的五行','你的五行','Five elements')}</span></div>
      <button className="ph-comic-cta" onClick={() => onOpen('form')}>{t('開始我的命盤','开始我的命盘','Begin my chart')} <span>›</span></button>
      <small>{t('以宋式留白，讀懂命理的文化意象。','以宋式留白，读懂命理的文化意象。','A quiet introduction to traditional imagery.')}</small>
    </section> : null}
    {layout === 'scroll' ? <div className="ph-scroll-panels">
      <button className="ph-daily ph-paper-panel" onClick={() => onOpen('today')}><img src="/today/almanac-lotus-v1.webp" alt=""/><span><small>{t('今日指引','今日指引','TODAY’S GUIDE')}</small><h2>{t('觀今日，從容而行','观今日，从容而行','A calmer way through today')}</h2><p>{t('黃曆、每日穿衣與文化節日，\n在日常裡找到自己的節奏。','黄历、每日穿衣与文化节日，\n在日常里找到自己的节奏。','Almanac, colours and cultural dates.\nFind a little space in your day.')}</p><em>{t('查看詳情','查看详情','Explore')} ›</em></span></button>
      <button className="ph-reading ph-paper-panel" onClick={() => onOpen('form')}><img src="/art/scene-butterfly-dream-v1.webp" alt=""/><span><h2>{t('深度解讀','深度解读','Your personal reading')}</h2><p>{t('從命盤看見更完整的你','从命盘看见更完整的你','A fuller view of your patterns')}</p><small>{t('性格天賦 / 人生節奏 / 關係緣分 / 事業財運','性格天赋 / 人生节奏 / 关系缘分 / 事业财运','Strengths · Life patterns · Relationships · Work')}</small><em>{t('開始深度解讀','开始深度解读','Begin your reading')} ›</em></span></button>
    </div> : null}
    <HomeTree t={t} onOpen={onOpen} />
    {layout === 'koi' ? <button className="ph-guide-panel" onClick={() => window.dispatchEvent(new Event('zhaowu:open-guide'))}><img src="/art/zhaowu-lotus-ascend-v1.webp" alt="" loading="lazy"/><span><h2>{t('不知道從哪開始？','不知道从哪开始？','Not sure where to start?')}</h2><p>{t('兩分鐘導覽，帶你走到最適合你的那一頁。','两分钟导览，带你走到最适合你的那一页。','A two-minute guide to the page that suits you.')}</p><em>{t('打開導覽','打开导览','Open the guide')} →</em></span></button> : null}
    <a href="/soul-chapters" className="sc-entry-strip" data-home-card="soul-chapters"><span className="sc-entry-kicker">{t('靈階鏡像','灵阶镜像','Soul Chapters')}</span><span className="sc-entry-text">{t('人生有十章，哪一章最像現在的你？','人生有十章，哪一章最像现在的你？','Ten life chapters. Which one feels like yours right now?')}</span><span className="sc-entry-arrow" aria-hidden>→</span></a>
    <nav className="ph-bottom-nav" aria-label={t('頁面導覽','页面导航','Page navigation')}><a href="/" aria-current="page"><BrandIcon name="home"/><span>{t('首頁','首页','Home')}</span></a><button onClick={() => onOpen('form')}><BrandIcon name="reports"/><span>{t('命盤','命盘','Chart')}</span></button><button onClick={() => onOpen('today')}><BrandIcon name="calendar"/><span>{t('指引','指引','Today')}</span></button><a href="/history"><BrandIcon name="account"/><span>{t('我的','我的','Account')}</span></a></nav>
  </section>;
}
