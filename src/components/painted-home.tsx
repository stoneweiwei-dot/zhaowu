import { useDisplayLanguage } from "@/lib/display-language";
import { customerChrome } from "@/lib/customer-chrome";
import { Link } from '@tanstack/react-router';
import { FROST_SKIN_ID, seasonalPackForSkin, SEASONAL_AUTO_ID, SOLAR_TERMS_24, seasonalState, frostEdition } from '@/lib/seasonal-skins';
import { HomeLanguageMount } from "@/components/language-switcher";
import { useContext, useEffect, type CSSProperties } from 'react';
import { useSkin, type SkinDef } from '@/lib/theme-skins';
import { useI18n } from '@/lib/i18n';
import { BrandIcon } from '@/components/brand-icon';
import { HomeTree } from '@/components/home-tree';
import { CuratedVideoShelf } from '@/components/curated-video-shelf';
import { AnalysisForm } from '@/components/analysis-form';
import '@/home-mobile-v2.css';
import '@/wuling-home.css';

type Section = 'form' | 'today' | 'quiz' | 'notes';
/** Skins whose painting is clean enough to show at full strength behind the home title. */
const FULL_PAINTING_HOMES = new Set([
  'solar-frost-descent', 'solar-start-winter', 'solar-minor-snow', 'solar-major-snow', 'solar-winter-solstice', 'solar-minor-cold', 'sydney-jacaranda', 'southern-summer', 'southern-autumn', 'southern-winter', 'pastel-koi', 'dragon-lotus', 'lotus-boat', 'night-flute', 'day-flute', 'cloud-jade',
  'dawn-dragon', 'moon-lotus-boat', 'bamboo-falls', 'petal-immortal', 'pink-lotus-stream', 'butterfly-lotus',
]);
export function homeComposition(skin: SkinDef | null): 'scroll' | 'comic' | 'koi' {
  // All published skins share one Song editorial shell; preserve the unskinned classic fallback.
  // Artwork, colour and title still come from each individual SkinDef.
  return skin ? 'scroll' : 'koi';
}

/** Real links and controls over separate art layers; never a screenshot with hotspots. */
export function PaintedHome({ onOpen }: { onOpen: (section: Section) => void }) {
  const languageMount = useContext(HomeLanguageMount);
  const { id, skin } = useSkin();
  const { locale } = useI18n();
  useDisplayLanguage((state) => state.language);
  const t = customerChrome;
  const layout = homeComposition(skin);
  const seasonalAuto = id === SEASONAL_AUTO_ID ? seasonalState() : null;
  const frostOnly = !seasonalAuto && skin?.id === FROST_SKIN_ID ? frostEdition() : null;
  const southernScene = !!skin && (skin.id === 'sydney-jacaranda' || skin.id.startsWith('southern-'));
  const selectedPack = seasonalAuto && southernScene ? null : seasonalPackForSkin(seasonalAuto?.term.skinId ?? skin?.id ?? '');
  const manualState = !seasonalAuto && selectedPack ? seasonalState() : null;
  const selectedPhase = selectedPack ? selectedPack[seasonalAuto?.houIndex ?? (manualState && manualState.term.skinId === skin?.id ? manualState.houIndex : 0)] : null;
  const selectedTerm = !seasonalAuto && selectedPack ? SOLAR_TERMS_24.find(term => term.skinId === skin?.id) : null;
  const houNumber = seasonalAuto ? SOLAR_TERMS_24.indexOf(seasonalAuto.term) * 3 + seasonalAuto.houIndex + 1 : null;
  const dark = skin?.mode === 'dark';
  // Every skin shows ITS OWN painting; the koi painting is only the no-skin / pastel-koi default.
  const art = skin?.hero || (dark ? '/theme-skins/reference-dragon.webp' : '/theme-skins/reference-koi.webp');
  // Keep published, owner-selected paintings; replace the disliked flute/default hero with an existing Song-style mist painting.
  const editorialArt = !skin || (!seasonalAuto && /flute/i.test(skin.id)) ? '/theme-skins/bamboo-falls-art.webp' : art.endsWith('/option-still-valley.webp') ? art.replace('/option-still-valley.webp', '/option-still-valley-home.webp') : art;
  useEffect(() => {
    const shell = document.querySelector<HTMLElement>('#root > .zhaowu-home-sheet-shell:not(.zhaowu-login-shell)');
    const update = () => {
      const y = Math.max(shell?.scrollTop || 0, window.scrollY, document.documentElement.scrollTop, document.body.scrollTop);
      document.documentElement.style.setProperty('--zw-veil', String(Math.min(.46, y / (window.innerHeight * 1.2) * .46)));
    };
    update(); window.addEventListener('scroll', update, { passive: true });
    shell?.addEventListener('scroll', update, { passive: true });
    document.addEventListener('scroll', update, { passive: true, capture: true });
    window.addEventListener('resize', update);
    document.documentElement.style.setProperty('--zw-scene', `url("${editorialArt}")`);
    document.documentElement.style.setProperty('--zw-focus', skin?.focus || '50% 35%');
    return () => { window.removeEventListener('scroll', update); shell?.removeEventListener('scroll', update); document.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); document.documentElement.style.removeProperty('--zw-veil'); document.documentElement.style.removeProperty('--zw-scene'); document.documentElement.style.removeProperty('--zw-focus'); };
  }, [editorialArt, skin?.focus]);
  const style = {
    '--zw-scene': `url("${editorialArt}")`, '--zw-focus': skin?.focus || '50% 35%',
    '--ph-art': `url("${art}")`, '--ph-paper': skin?.swatch[0] || '#f7efdf',
    '--ph-ink': dark ? '#f8eace' : '#203f36', '--ph-muted': dark ? '#dfdacb' : '#595447',
    '--ph-accent': dark ? '#e1bd7d' : skin?.swatch[1] || '#557f79',
    '--ph-highlight': skin?.swatch[2] || '#c7a468',
    '--ph-on-accent': dark ? '#142b32' : '#fff9e9',
  } as CSSProperties;
  return <section className="zw-painted-home zw-v2-home" data-home-v2 data-composition={layout} data-reference-art={!skin || FULL_PAINTING_HOMES.has(skin.id) || !!seasonalPackForSkin(skin.id)} data-tone={dark ? 'dark' : 'light'} style={style}>
    <div className="zw-stage" aria-hidden="true" /><div className="zw-veil" aria-hidden="true" />
    <div className="wl-scroll">
      <header className="wl-mast">
        <Link className="wl-brand" to="/" aria-label="昭梧 ZHAOWU"><b aria-hidden="true">昭梧</b>昭 梧</Link>
        <details className="wl-menu">
          <summary aria-label={t('網站選單','网站菜单','Site menu')}><span aria-hidden="true">☰</span></summary>
          <nav aria-label={t('主要導覽','主要导航','Main navigation')}>
            <Link to="/">{t('首頁','首页','Home')}</Link>
            <a href="#birth-form">{t('免費排盤','免费排盘','Free birth chart')}</a>
            <a href="#today">{t('今日指引','今日指引','Daily guide')}</a>
            <a href="#quiz">{t('趣味測驗','趣味测验','Quizzes')}</a>
            <a href="#notes">{t('文章與知識','文章与知识','Articles and knowledge')}</a>
            <Link to="/history">{t('我的報告','我的报告','My reports')}</Link>
            <button type="button" onClick={event => {
              event.currentTarget.closest('details')?.removeAttribute('open');
              window.dispatchEvent(new Event('zhaowu:open-guide'));
            }}>{t('怎麼用','怎么用','How to use Zhaowu')}</button>
          </nav>
        </details>
        <div ref={languageMount} className="wl-language" />
      </header>
      <section className="wl-hero" aria-labelledby="zw-v2-title">
        <p className="wl-caption">{t('霧 嶺 聽 泉','雾 岭 听 泉','Mist on the ridge')}</p>
        <h1 id="zw-v2-title">{t('昭梧','昭梧','Zhaowu')}<small className="zw-season-mark" aria-hidden="true">聽泉</small></h1>
        <p className="wl-motto">{t('觀天之道・悟人之心','观天之道・悟人之心','Read the sky, understand the heart.')}</p>
        <p>{t('從一份生辰，讀自己的命書。','从一份生辰，读自己的命书。','Begin your reading with your birth chart.')}<br/>{t('循今日節氣，尋日常的指引。','循今日节气，寻日常的指引。','Find daily guidance in the turning seasons.')}</p>
        <a href="#wl-portals" className="wl-explore">{t('開始探索','开始探索','Explore')} <span aria-hidden="true">›</span></a>
      </section>
      <nav id="wl-portals" aria-label={t('四個入口','四个入口','Explore Zhaowu')}>
        {[
          ['#today', t('今日指引','今日指引','Daily guide'), t('讀今日黃曆','读今日黄历','Read the almanac'), t('看節氣宜忌','看节气宜忌','Follow the seasons'), '/today/almanac-lotus-v1.webp'],
          ['/sample-report', t('深度解讀','深度解读','In-depth reading'), t('翻閱命書示例','翻阅命书示例','Open a sample report'), t('細看解讀脈絡','细看解读脉络','Trace the interpretation'), '/theme-skins/verdant-pavilion-art.webp'],
          ['#birth-form', t('命書','命书','Destiny book'), t('錄入生辰','录入生辰','Enter your birth details'), t('免費讀核心解讀','免费读核心解读','Read your free insights'), '/home-tiles/my-reports.webp'],
          ['#spirit-slip', t('靈籤','灵签','Spirit slip'), t('展讀今日籤文','展读今日签文','Read today’s verse'), t('留一念自省','留一念自省','Take time to reflect'), '/today/spirit-slip-song-mineral-v1.webp'],
        ].map(([href,title,first,second,image]) => <a href={href} key={href} style={{'--tile-art': `url("${image}")`} as CSSProperties}>
          <strong>{title}</strong><span>{first}<br/>{second}</span><i aria-hidden="true">↗</i>
        </a>)}
      </nav>
      <p className="wl-colophon">{t('山水有相，心自有答','山水有相，心自有答','In quiet landscapes, the heart finds its answer.')}</p>
      <HomeTree t={t} onOpen={onOpen} />
      <section className="zw-home-birth-desk-container" data-home-birth-entry aria-label={t('昭梧生辰案台', '昭梧生辰案台', 'ZHAOWU Birth Desk')}>
          <div className="zw-hero-secondary-panel zhaowu-home-stage zhaowu-home-stage--primary relative">
            <AnalysisForm />
          </div>
        </section>

        <div className="zw-v2-actions">
          <Link className="zw-v2-sample" to="/sample-report">{t('先看公開命書示例', '先看公开命书示例', 'View a sample report')} <span aria-hidden="true">›</span></Link>
        </div>
      {(seasonalAuto || frostOnly || selectedPhase) && <p className="zw-v2-season">{seasonalAuto ? `${locale === 'en' ? seasonalAuto.term.en : locale === 'zh-Hans' ? seasonalAuto.term.hans : seasonalAuto.term.zh} · ${seasonalAuto.hou[locale]}` : selectedPhase && selectedTerm ? `${locale === 'en' ? selectedTerm.en : locale === 'zh-Hans' ? selectedTerm.hans : selectedTerm.zh} · ${selectedPhase.name[locale]}` : `${t('霜降', '霜降', 'Frost’s Descent')} · ${frostOnly!.name[locale]}`}</p>}
      {selectedPhase && <p className="zw-winter-quote">{selectedPhase.quote[locale]} <span>STONE 原創</span></p>}
    </div>
    {(seasonalAuto || frostOnly) && <p className="zw-season-context" data-seasonal-note data-solar-hou={seasonalAuto ? seasonalAuto.houIndex + 1 : undefined}>{t('節氣為中國傳統名稱；畫作依粗略半球位置調整，位置不明沿用原畫，並非當地天氣預報。', '节气为中国传统名称；画作依粗略半球位置调整，位置不明沿用原画，并非当地天气预报。', 'Traditional Chinese seasonal names; existing artwork follows approximate hemisphere when available, not local weather.')}{seasonalAuto && (locale === 'en' ? ` Pentad ${houNumber} / 72 · Sydney calendar schedule.` : ` 第 ${houNumber} / 72 候 · 悉尼節氣日程。`)}</p>}
    <CuratedVideoShelf placement="home" />
    <nav className="ph-bottom-nav" aria-label={t('頁面導覽','页面导航','Page navigation')}><Link to="/" aria-current="page"><BrandIcon name="home"/><span>{t('首頁','首页','Home')}</span></Link><button onClick={() => onOpen('form')}><BrandIcon name="reports"/><span>{t('命盤','命盘','Chart')}</span></button><button onClick={() => onOpen('today')}><BrandIcon name="calendar"/><span>{t('指引','指引','Today')}</span></button><Link to="/history"><BrandIcon name="account"/><span>{t('我的','我的','Account')}</span></Link></nav>
  </section>;
}
