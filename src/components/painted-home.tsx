import type { CSSProperties } from 'react';
import { useSkin, type SkinDef } from '@/lib/theme-skins';
import { useI18n } from '@/lib/i18n';
import { BrandIcon } from '@/components/brand-icon';
import { readLocalReports } from '@/lib/local-report-history';

type Section = 'form' | 'today' | 'quiz' | 'notes';
export function homeComposition(skin: SkinDef | null) {
  if (skin?.id === 'pastel-koi' || !skin) return 'koi';
  if (skin.id === 'cloud-jade') return 'comic';
  if (skin?.id === 'day-flute' || skin?.mode === 'dark') return 'flute';
  return 'scroll';
}

/** Real links and controls over separate art layers; never a screenshot with hotspots. */
export function PaintedHome({ onOpen }: { onOpen: (section: Section) => void }) {
  const { skin } = useSkin();
  const { locale } = useI18n();
  const t = (zh: string, hans: string, en: string) => locale === 'en' ? en : locale === 'zh-Hans' ? hans : zh;
  const layout = homeComposition(skin);
  const dark = skin?.mode === 'dark';
  const art = !skin || skin.id === 'pastel-koi' ? '/theme-skins/reference-koi.webp' : skin.hero;
  const reports = readLocalReports().slice(0, 2);
  const items: { id: Section; title: string; hint: string; art: string; icon: 'reports' | 'calendar' | 'insight' | 'articles' }[] = [
    { id: 'form', title: t('命書', '命书', 'Your reading'), hint: t('讀懂命運的紋理，\n看見更多可能。', '读懂命运的纹理，\n看见更多可能。', 'Understand your patterns.\nSee more possibilities.'), art: '/art/scene-koi-rider-v1.webp', icon: 'reports' },
    { id: 'today', title: t('今日', '今日', 'Today'), hint: t('一日之氣，\n順勢而行。', '一日之气，\n顺势而行。', 'A moment to pause.\nFind your rhythm.'), art: '/art/scene-lotus-boat-v1.webp', icon: 'calendar' },
    { id: 'quiz', title: t('測驗', '测验', 'Explore'), hint: t('探索內心，\n遇見另一種自己。', '探索内心，\n遇见另一种自己。', 'Look within.\nMeet another side of you.'), art: '/art/scene-osmanthus-tea-v1.webp', icon: 'insight' },
    { id: 'notes', title: t('文章', '文章', 'Stories'), hint: t('看見更大的世界，\n也看見更深的自己。', '看见更大的世界，\n也看见更深的自己。', 'A wider world.\nA deeper understanding.'), art: '/art/scene-butterfly-dream-v1.webp', icon: 'articles' },
  ];
  const style = {
    '--ph-art': `url("${art}")`, '--ph-paper': skin?.swatch[0] || '#f7efdf',
    '--ph-ink': dark ? '#f8eace' : '#203f36', '--ph-muted': dark ? '#dfdacb' : '#595447',
    '--ph-accent': dark ? '#e1bd7d' : skin?.swatch[1] || '#557f79',
    '--ph-on-accent': dark ? '#142b32' : '#fff9e9',
  } as CSSProperties;
  return <section className="zw-painted-home" data-composition={layout} data-reference-art={!skin || ['pastel-koi','dragon-lotus','lotus-boat','night-flute','day-flute','cloud-jade'].includes(skin.id)} data-tone={dark ? 'dark' : 'light'} style={style}>
    <div className="ph-hero">
      <img className="ph-hero-art" src={art} alt="" fetchPriority="high" width="1248" height="1248" />
      <a className="ph-brand" href="/" aria-label="昭梧 Zhaowu"><strong>昭梧</strong><small>Z H A O W U</small></a>
      <div className="ph-title">
        {layout === 'comic' ? <><h1>{t('命理不只是答案，\n更是看見自己的另一種方式。','命理不只是答案，\n更是看见自己的另一种方式。','Another way to\nunderstand yourself.')}</h1></> : layout === 'koi' ? <><h1>昭<br/>梧</h1><p>{t('觀天地之氣，\n照你心中之梧。', '观天地之气，\n照你心中之梧。', 'See the world clearly.\nFind your own way.')}</p><small>{t('以東方智慧，尋見更清明的自己。', '以东方智慧，寻见更清明的自己。', 'Eastern wisdom, a clearer sense of self.')}</small></> : layout === 'flute' ? <><h1>{t('今日一覽', '今日一览', 'Your day, in view')}</h1><p>{t('探索你的專屬指引', '探索你的专属指引', 'Discover your personal guide')}</p></> : <><h1>{t('順應天時\n看見更好的選擇', '顺应天时\n看见更好的选择', 'Find your rhythm.\nSee your next step.')}</h1><p className="ph-motto">{t('命 · 勢 · 選', '命 · 势 · 选', 'LIFE · TIMING · CHOICE')}</p><small>{t('在變動的時代，找到屬於你的節奏', '在变动的时代，找到属于你的节奏', 'Find your own rhythm in a changing world.')}</small></>}
      </div>
      {(layout === 'scroll' || layout === 'flute') && <div className="ph-actions"><button onClick={() => onOpen('form')} data-home-birth-entry>{t('開始解讀', '开始解读', 'Start a reading')} <span>›</span></button>{<a href={layout === 'flute' ? '/history' : '#today'} onClick={layout === 'flute' ? undefined : e => {e.preventDefault(); onOpen('today');}}>{layout === 'flute' ? t('查看報告', '查看报告', 'My reports') : t('今日指引', '今日指引', 'Today’s guide')} <span>›</span></a>}</div>}
    </div>
    {layout === 'comic' ? <section className="ph-comic-panel">
      <h2>{t('漫畫命書預覽','漫画命书预览','Your illustrated reading')}</h2>
      <p>{t('把抽象命理，講成你看得懂的圖。','把抽象命理，讲成你看得懂的图。','Discover the ideas through gentle illustrations.')}</p>
      <img src="/theme-skins/reference-comic-dragons.webp" alt={t('藍色、粉色與青玉小龍插畫','蓝色、粉色与青玉小龙插画','Blue, pink and jade dragon illustrations')} width="1942" height="809" />
      <div className="ph-comic-labels"><span>{t('你的日主','你的日主','Your nature')}</span><span>{t('你的感情','你的感情','Relationships')}</span><span>{t('你的五行','你的五行','Five elements')}</span></div>
      <button className="ph-comic-cta" onClick={() => onOpen('form')}>{t('開始我的命書','开始我的命书','Begin my reading')} <span>›</span></button>
      <small>{t('以宋式留白，讀懂命理的文化意象。','以宋式留白，读懂命理的文化意象。','A quiet introduction to traditional imagery.')}</small>
    </section> : null}
    {layout === 'comic' ? <nav className="ph-small-portals ph-comic-links">{items.slice(1).map(item=><button key={item.id} onClick={()=>onOpen(item.id)}>{item.title} ›</button>)}</nav> : layout === 'scroll' ? <div className="ph-scroll-panels">
      <button className="ph-daily ph-paper-panel" onClick={() => onOpen('today')}><img src="/today/almanac-lotus-v1.webp" alt=""/><span><small>{t('今日指引','今日指引','TODAY’S GUIDE')}</small><h2>{t('觀今日，從容而行','观今日，从容而行','A calmer way through today')}</h2><p>{t('黃曆、每日穿衣與文化節日，\n在日常裡找到自己的節奏。','黄历、每日穿衣与文化节日，\n在日常里找到自己的节奏。','Almanac, colours and cultural dates.\nFind a little space in your day.')}</p><em>{t('查看詳情','查看详情','Explore')} ›</em></span></button>
      <button className="ph-reading ph-paper-panel" onClick={() => onOpen('form')}><img src="/art/scene-butterfly-dream-v1.webp" alt=""/><span><h2>{t('深度解讀','深度解读','Your personal reading')}</h2><p>{t('從命盤看見更完整的你','从命盘看见更完整的你','A fuller view of your patterns')}</p><small>{t('性格天賦 / 人生節奏 / 關係緣分 / 事業財運','性格天赋 / 人生节奏 / 关系缘分 / 事业财运','Strengths · Life patterns · Relationships · Work')}</small><em>{t('開始深度解讀','开始深度解读','Begin your reading')} ›</em></span></button>
      <div className="ph-small-portals">{items.slice(2).map(item => <button key={item.id} onClick={() => onOpen(item.id)}><BrandIcon name={item.icon}/>{item.title}<span>›</span></button>)}</div>
    </div> : <nav className="ph-portals" aria-label={t('主要功能','主要功能','Main features')}>{items.map(item => <button key={item.id} className="ph-portal" data-home-card={item.id} onClick={() => onOpen(item.id)}>
      {layout === 'koi' ? <img src={item.art} alt="" loading="lazy"/> : <span className="ph-medallion"><BrandIcon name={item.icon}/></span>}
      <strong>{item.title}</strong>{layout === 'koi' && <><small>{item.hint}</small><i aria-hidden>→</i></>}
    </button>)}</nav>}
    {layout === 'koi' ? <button className="ph-dragon-panel" onClick={() => window.dispatchEvent(new Event('zhaowu:open-guide'))}><img src="/art/zhaowu-dragon-lake-v1.webp" alt="" loading="lazy"/><span><h2>{t('青玉小龍','青玉小龙','Your little jade dragon')}</h2><p>{t('與溫柔的神獸，一起看見日常的微光。','与温柔的神兽，一起看见日常的微光。','A gentle guide to your next discovery.')}</p><em>{t('進入','进入','Explore')} →</em></span></button> : layout === 'flute' ? <section className="ph-recent"><header><h2>{t('最近內容','最近内容','Your collection')}</h2><a href="/history">{t('查看全部','查看全部','View all')} ›</a></header><a className="ph-recent-row" href="/history"><img src="/hero-gallery/temple-bamboo-rain.webp" alt=""/><span><strong>{t('我的報告','我的报告','My reports')}</strong><small>{reports.length ? t('繼續閱讀已儲存的命書','继续阅读已保存的命书','Continue your saved readings') : t('你的命書，從這裡開始','你的命书，从这里开始','Your own story starts here')}</small></span><i>›</i></a><button className="ph-recent-row" onClick={() => onOpen('notes')}><img src="/today/almanac-lotus-v1.webp" alt=""/><span><strong>{t('生活文章','生活文章','Stories & reflections')}</strong><small>{t('讀一段文字，看見新的角度','读一段文字，看见新的角度','A little reading, a fresh perspective')}</small></span><i>›</i></button></section> : null}
    <nav className="ph-bottom-nav" aria-label={t('頁面導覽','页面导航','Page navigation')}><a href="/" aria-current="page"><BrandIcon name="home"/><span>{t('首頁','首页','Home')}</span></a><button onClick={() => onOpen('form')}><BrandIcon name="reports"/><span>{t('命書','命书','Reading')}</span></button><button onClick={() => onOpen('today')}><BrandIcon name="calendar"/><span>{t('指引','指引','Today')}</span></button><a href="/history"><BrandIcon name="account"/><span>{t('我的','我的','Account')}</span></a></nav>
  </section>;
}
