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
      {(seasonalAuto || frostOnly || selectedPhase) && <p className="zw-v2-season">{seasonalAuto ? `${locale === 'en' ? seasonalAuto.term.en : locale === 'zh-Hans' ? seasonalAuto.term.hans : seasonalAuto.term.zh} · ${seasonalAuto.hou[locale]}` : selectedPhase && selectedTerm ? `${locale === 'en' ? selectedTerm.en : locale === 'zh-Hans' ? selectedTerm.hans : selectedTerm.zh} · ${selectedPhase.name[locale]}` : `${t('霜降', '霜降', 'Frost’s Descent')} · ${frostOnly!.name[locale]}`}</p>}
      {selectedPhase && <p className="zw-winter-quote">{selectedPhase.quote[locale]} <span>STONE 原創</span></p>}
      <a className="zw-v2-discover" href="#home-guide">{t('往下探索昭梧', '继续探索昭梧', 'Discover more of ZHAOWU')} <span aria-hidden="true">↓</span></a>
    </section>
    <HomeTree t={t} onOpen={onOpen} />
    {(seasonalAuto || frostOnly) && <p className="zw-season-context" data-seasonal-note data-solar-hou={seasonalAuto ? seasonalAuto.houIndex + 1 : undefined}>{t('節氣為中國傳統名稱；畫作依粗略半球位置調整，位置不明沿用原畫，並非當地天氣預報。', '节气为中国传统名称；画作依粗略半球位置调整，位置不明沿用原画，并非当地天气预报。', 'Traditional Chinese seasonal names; existing artwork follows approximate hemisphere when available, not local weather.')}{seasonalAuto && (locale === 'en' ? ` Pentad ${houNumber} / 72 · Sydney calendar schedule.` : ` 第 ${houNumber} / 72 候 · 悉尼節氣日程。`)}</p>}
    <CuratedVideoShelf placement="home" />
    <nav className="ph-bottom-nav" aria-label={t('頁面導覽','页面导航','Page navigation')}><Link to="/" aria-current="page"><BrandIcon name="home"/><span>{t('首頁','首页','Home')}</span></Link><button onClick={() => onOpen('form')}><BrandIcon name="reports"/><span>{t('命盤','命盘','Chart')}</span></button><button onClick={() => onOpen('today')}><BrandIcon name="calendar"/><span>{t('指引','指引','Today')}</span></button><Link to="/history"><BrandIcon name="account"/><span>{t('我的','我的','Account')}</span></Link></nav>
  </section>;
}
