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
import './zhaowu-design-system.css';
import './login-approved-r89.css';
import './visual-hotfix-r94.css';
import './brand-ui-r97.css';
import './brand-ui-r98.css';
import './brand-ui-r99.css';
import './five-element-wardrobe-r100.css';
import './night-oracle-readability-r101.css';
import './report-answer-first-r110.css';
import './free-experience-r114.css';

const router = createRouter({ routeTree });
declare module '@tanstack/react-router' { interface Register { router: typeof router; } }
const root = document.getElementById('root');
if (!root) throw new Error('Missing root element');

const currentBundlePath = () => {
  const script = document.querySelector<HTMLScriptElement>('script[type="module"][src*="/assets/"]');
  if (!script?.src) return null;
  try { return new URL(script.src, window.location.href).pathname; } catch { return null; }
};

const freshBundlePath = (html: string) => {
  const match = html.match(/<script[^>]+src=["']([^"']*\/assets\/index-[^"']+\.js)["']/i);
  if (!match?.[1]) return null;
  try { return new URL(match[1], window.location.origin).pathname; } catch { return null; }
};

let refreshCheckInFlight = false;
let lastRefreshCheckAt = 0;
const checkForFreshShell = async () => {
  const now = Date.now();
  if (refreshCheckInFlight || now - lastRefreshCheckAt < 15_000) return;
  refreshCheckInFlight = true;
  lastRefreshCheckAt = now;
  try {
    const response = await fetch('/', { cache: 'no-store', credentials: 'same-origin', headers: { 'Cache-Control': 'no-cache' } });
    if (!response.ok) return;
    const html = await response.text();
    const current = currentBundlePath();
    const fresh = freshBundlePath(html);
    if (current && fresh && current !== fresh) window.location.reload();
  } catch {
    // Fail open: never block the app just because an update check failed.
  } finally { refreshCheckInFlight = false; }
};

if ('serviceWorker' in navigator) {
  const hadControllerAtBoot = Boolean(navigator.serviceWorker.controller);
  let reloadedForControllerChange = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadControllerAtBoot || reloadedForControllerChange) return;
    reloadedForControllerChange = true;
    window.location.reload();
  });
  const refreshServiceWorker = () => {
    void navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).then((registration) => registration.update()).catch(() => undefined);
    void checkForFreshShell();
  };
  refreshServiceWorker();
  window.addEventListener('pageshow', refreshServiceWorker);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshServiceWorker(); });
}

createRoot(root).render(<StrictMode><RouterProvider router={router} /><KoHiLocalizationBridge /><BackgroundMusic /></StrictMode>);
