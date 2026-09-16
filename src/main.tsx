import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { BackgroundMusic } from './components/background-music';
import { KoHiLocalizationBridge } from './components/ko-hi-localization-bridge';
import { routeTree } from './routeTree.gen';
import './styles.css';
import './intro-extra.css';
import './emblems.css';
import './client-hotfix.css';
import './visual-refresh.css';
import './stone-visual-fix.css';
import './motif-row-lock.css';
import './focused-report.css';
import './character-panel.css';
import './login-breathing.css';
import './palm-light-refinement.css';
import './wallpaper-visibility-fix.css';
import './green-dragon-guide.css';
import './report-history.css';
import './tea-guardian.css';
import './landscape-paper.css';
import './production-visual-reset.css';
import './gallery-unification.css';
import './approved-mobile-ui-v2.css';
import './approved-parchment-ui-v3.css';
import './visual-readability-lock-v4.css';
import './home-sheet-ui-v5.css';
import './typography-lock-v6.css';
import './home-quiz-paper.css';
import './content-layout-fixes.css';
import './parchment-layout.css';
import './zhaowu-paper-reference-v31.css';
import './ios-section-visibility.css';
import './report-visual-book.css';
import './report-luck-book.css';
import './report-share-card.css';
import './zhaowu-layout-v41.css';
import './home-art-direction-r47.css';
import './daily-spirit-slip-r52.css';
import './home-background-visibility-r55.css';
import './home-birth-hub-r60.css';
import './report-art-final-r62.css';
import './site-ux-r63.css';
import './site-ux-r63-lock.css';
import './daily-almanac-r69.css';
import './site-ux-r75-final.css';
import './visual-hotfix-r94.css';
import './brand-ui-r97.css';
import './brand-ui-r98.css';
import './brand-ui-r99.css';
import './five-element-wardrobe-r100.css';
import './night-oracle-readability-r101.css';
import './report-answer-first-r110.css';
import './free-experience-r114.css';
import './guest-first-r116.css';
import './night-readability-r127.css';
import './night-home-r129.css';
import './night-readability-r135.css';
import './sky-events-article.css';
import './device-question-flow-r144.css';
import './zhaowu-design-system.css';
import './login-approved-r89.css';

const router = createRouter({ routeTree });
declare module '@tanstack/react-router' { interface Register { router: typeof router; } }
declare const __ZHAOWU_RELEASE_ID__: string;

const root = document.getElementById('root');
if (!root) throw new Error('Missing root element');

const LOCAL_RELEASE = String(__ZHAOWU_RELEASE_ID__ || 'dev').trim();
const RELEASE_PARAM = '_zwv';
const RELOAD_GUARD_KEY = 'zhaowu.release.reload.v1';
let refreshCheckInFlight = false;
let lastRefreshCheckAt = 0;

function cleanReleaseParam() {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(RELEASE_PARAM)) return;
    url.searchParams.delete(RELEASE_PARAM);
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch {
    // Cosmetic cleanup only.
  }
}

function activateRelease(remoteRelease: string) {
  const remote = remoteRelease.trim();
  if (!remote || remote === LOCAL_RELEASE) {
    cleanReleaseParam();
    try { sessionStorage.removeItem(RELOAD_GUARD_KEY); } catch {}
    return;
  }

  try {
    if (sessionStorage.getItem(RELOAD_GUARD_KEY) === remote) return;
    sessionStorage.setItem(RELOAD_GUARD_KEY, remote);
  } catch {
    // Session storage is optional; the URL cache-buster still forces a fresh navigation.
  }

  const target = new URL(window.location.href);
  target.searchParams.set(RELEASE_PARAM, remote.slice(0, 16));
  window.location.replace(target.toString());
}

async function checkForFreshRelease() {
  const now = Date.now();
  if (refreshCheckInFlight || now - lastRefreshCheckAt < 15_000) return;
  refreshCheckInFlight = true;
  lastRefreshCheckAt = now;
  try {
    const response = await fetch(`/release.json?t=${now}`, {
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) return;
    const payload = await response.json() as { release?: unknown };
    activateRelease(String(payload.release ?? ''));
  } catch {
    // Fail open: update checks must never block the site.
  } finally {
    refreshCheckInFlight = false;
  }
}

function refreshInstalledApp() {
  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((registration) => registration.update())
      .catch(() => undefined);
  }
  void checkForFreshRelease();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    const data = event.data as { type?: string; release?: string } | null;
    if (data?.type === 'ZHAOWU_RELEASE_READY' && data.release) activateRelease(data.release);
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    void checkForFreshRelease();
  });

  refreshInstalledApp();
  window.addEventListener('pageshow', refreshInstalledApp);
  window.addEventListener('focus', refreshInstalledApp);
  window.addEventListener('online', refreshInstalledApp);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshInstalledApp();
  });

  window.setInterval(() => {
    if (document.visibilityState === 'visible') void checkForFreshRelease();
  }, 5 * 60 * 1000);
} else {
  void checkForFreshRelease();
}

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
    <KoHiLocalizationBridge />
    <BackgroundMusic />
  </StrictMode>,
);
