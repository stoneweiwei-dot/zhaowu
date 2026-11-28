import { useDisplayLanguage } from "@/lib/display-language";
import { customerChrome } from "@/lib/customer-chrome";
import { Link } from '@tanstack/react-router';
import { FROST_SKIN_ID, seasonalPackForSkin, SEASONAL_AUTO_ID, SOLAR_TERMS_24, seasonalState, frostEdition } from '@/lib/seasonal-skins';
import { useEffect, type CSSProperties } from 'react';
import { useSkin, type SkinDef } from '@/lib/theme-skins';
import { useI18n } from '@/lib/i18n';
import { BrandIcon } from '@/components/brand-icon';
import { HomeTree } from '@/components/home-tree';
import { CuratedVideoShelf } from '@/components/curated-video-shelf';
import { AnalysisForm } from '@/components/analysis-form';
import '@/home-mobile-v2.css';

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
  const editorialArt = !skin || (!seasonalAuto && /flute/i.test(skin.id)) ? '/theme-skins/verdant-mist-art.webp' : art.endsWith('/option-still-valley.webp') ? art.replace('/option-still-valley.webp', '/option-still-valley-home.webp') : art;
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
    <section className="zw-v2-hero" aria-labelledby="zw-v2-title">
      <header className="zw-v2-masthead">
        <Link className="zw-v2-wordmark" to="/" aria-label="昭梧 ZHAOWU">
          <img
            src="/brand-ui/header-gourd-wordmark-r113-144.webp"
            srcSet="/brand-ui/header-gourd-wordmark-r113-144.webp 144w, /brand-ui/header-gourd-wordmark-r113-288.webp 288w"
            sizes="48px"
            alt=""
            width={48}
            height={48}
            decoding="async"
          />
          <span><strong>昭梧</strong><small>Z H A O W U</small></span>
        </Link>
        <svg className="zw-season-mark" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="11" r="4"/><path d="M18 3v2m0 12v2M10 11H8m20 0h-2M9 23h15a4 4 0 0 0-4-5 6 6 0 0 0-10 1 3 3 0 0 0-1 4z"/>
          <g className="zw-south-spring" strokeWidth="1"><circle cx="26" cy="26" r="1.1"/><path d="M26 22.6c.7 1.1.7 2 .1 3-.6-1-.6-1.9-.1-3zm0 6.8c-.7-1.1-.7-2-.1-3 .6 1 .6 1.9.1 3zM22.8 24.2c1.2.6 1.8 1.2 1.9 2.2-1.3-.1-2-1-1.9-2.2zm6.4 0c-1.2.6-1.8 1.2-1.9 2.2 1.3-.1 2-1 1.9-2.2zM23.4 28.6c1-.6 1.8-.6 2.6 0-1 .5-1.8.5-2.6 0z"/></g>
          <g className="zw-south-summer" strokeWidth="1"><path d="M21 25c1.2-1.4 2.4-1.4 3.6 0s2.4 1.4 3.6 0 2.4-1.4 3.6 0M21 28.2c1.2-1.4 2.4-1.4 3.6 0s2.4 1.4 3.6 0 2.4-1.4 3.6 0"/></g>
          <g className="zw-south-autumn" strokeWidth="1"><path d="M21 29.2 24 23l2 3.2 2.2-5.4L31 29.2z"/></g>
          <g className="zw-south-winter" strokeWidth="1"><path d="M23 30c.4-3 1.6-5.2 2.2-8.2 1.6 1.8 3.6 2.2 5.6 1.2M24.2 30c1.4-.6 2.8-2.6 2.4-5.4"/></g>
        </svg>
        <svg className="ph-jacaranda-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeOpacity=".45" />
          <circle cx="20" cy="20" r="6" stroke="currentColor"/><path d="M20 9v3M20 28v3M9 20h3M28 20h3M12 12l2 2M26 26l2 2M28 12l-2 2M14 26l-2 2" stroke="currentColor" strokeLinecap="round"/>
          <path d="M20 2.5c-2 2-2 3.5 0 4.5 2-1 2-2.5 0-4.5Z" fill="currentColor" />
        </svg>
      </header>
      <HomeTree t={t} onOpen={onOpen} />
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
        {/* ── 昭梧生辰案台（第一屏實體直接呈現） ── */}
        <section className="zw-home-birth-desk-container" data-home-birth-entry aria-label={t('昭梧生辰案台', '昭梧生辰案台', 'ZHAOWU Birth Desk')}>
          <div className="zw-hero-secondary-panel zhaowu-home-stage zhaowu-home-stage--primary relative">
            <AnalysisForm />
          </div>
        </section>

        <div className="zw-v2-actions">
          <Link className="zw-v2-sample" to="/sample-report">{t('先看公開命書示例', '先看公开命书示例', 'View a sample report')} <span aria-hidden="true">›</span></Link>
        </div>
      </div>
      {(seasonalAuto || frostOnly || selectedPhase) && <p className="zw-v2-season">{seasonalAuto ? `${locale === 'en' ? seasonalAuto.term.en : locale === 'zh-Hans' ? seasonalAuto.term.hans : seasonalAuto.term.zh} · ${seasonalAuto.hou[locale]}` : selectedPhase && selectedTerm ? `${locale === 'en' ? selectedTerm.en : locale === 'zh-Hans' ? selectedTerm.hans : selectedTerm.zh} · ${selectedPhase.name[locale]}` : `${t('霜降', '霜降', 'Frost’s Descent')} · ${frostOnly!.name[locale]}`}</p>}
      {selectedPhase && <p className="zw-winter-quote">{selectedPhase.quote[locale]} <span>STONE 原創</span></p>}
    </section>
    {(seasonalAuto || frostOnly) && <p className="zw-season-context" data-seasonal-note data-solar-hou={seasonalAuto ? seasonalAuto.houIndex + 1 : undefined}>{t('節氣為中國傳統名稱；畫作依粗略半球位置調整，位置不明沿用原畫，並非當地天氣預報。', '节气为中国传统名称；画作依粗略半球位置调整，位置不明沿用原画，并非当地天气预报。', 'Traditional Chinese seasonal names; existing artwork follows approximate hemisphere when available, not local weather.')}{seasonalAuto && (locale === 'en' ? ` Pentad ${houNumber} / 72 · Sydney calendar schedule.` : ` 第 ${houNumber} / 72 候 · 悉尼節氣日程。`)}</p>}
    <CuratedVideoShelf placement="home" />
    <nav className="ph-bottom-nav" aria-label={t('頁面導覽','页面导航','Page navigation')}><Link to="/" aria-current="page"><BrandIcon name="home"/><span>{t('首頁','首页','Home')}</span></Link><button onClick={() => onOpen('form')}><BrandIcon name="reports"/><span>{t('命盤','命盘','Chart')}</span></button><button onClick={() => onOpen('today')}><BrandIcon name="calendar"/><span>{t('指引','指引','Today')}</span></button><Link to="/history"><BrandIcon name="account"/><span>{t('我的','我的','Account')}</span></Link></nav>
  </section>;
}
