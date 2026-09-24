import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { KoHiLocalizationBridge } from './components/ko-hi-localization-bridge';
import { routeTree } from './routeTree.gen';
import './styles.css';
import './legacy-visual-compat.css';
// Canonical visual authority must load last. Do not add visual hotfix layers after this import.
import './zhaowu-design-system.css';

const router = createRouter({ routeTree });
declare module '@tanstack/react-router' { interface Register { router: typeof router; } }
declare const __ZHAOWU_RELEASE_ID__: string;
const root = document.getElementById('root');
if (!root) throw new Error('Missing root element');

const CURRENT_RELEASE = __ZHAOWU_RELEASE_ID__ || 'dev';
const RELEASE_PARAM = 'zw_release';
const RELEASE_RELOAD_KEY = 'zhaowu.pwa.release-reload';

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

const clearSatisfiedReleaseParam = () => {
  try {
    const url = new URL(window.location.href);
    const requestedRelease = url.searchParams.get(RELEASE_PARAM);
    if (!requestedRelease || requestedRelease !== CURRENT_RELEASE) return;
    url.searchParams.delete(RELEASE_PARAM);
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    sessionStorage.removeItem(RELEASE_RELOAD_KEY);
  } catch {
    // Query cleanup is cosmetic; never block the app if iOS rejects it.
  }
};

clearSatisfiedReleaseParam();

let refreshCheckInFlight = false;
let lastRefreshCheckAt = 0;

const checkForFreshRelease = async () => {
  try {
    const response = await fetch(`/release.json?t=${Date.now()}`, {
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) return false;

    const payload = await response.json() as { release?: unknown };
    const freshRelease = typeof payload.release === 'string' ? payload.release.trim() : '';
    if (!freshRelease || freshRelease === CURRENT_RELEASE) {
      if (freshRelease === CURRENT_RELEASE) sessionStorage.removeItem(RELEASE_RELOAD_KEY);
      return false;
    }

    const registration = await navigator.serviceWorker.getRegistration('/');
    if (registration) {
      await registration.update();
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    }

    if (sessionStorage.getItem(RELEASE_RELOAD_KEY) === freshRelease) return true;
    sessionStorage.setItem(RELEASE_RELOAD_KEY, freshRelease);

    const url = new URL(window.location.href);
    url.searchParams.set(RELEASE_PARAM, freshRelease);
    window.location.replace(url.toString());
    return true;
  } catch {
    return false;
  }
};

const checkForFreshShell = async () => {
  const now = Date.now();
  if (refreshCheckInFlight || now - lastRefreshCheckAt < 15_000) return;
  refreshCheckInFlight = true;
  lastRefreshCheckAt = now;
  try {
    if (await checkForFreshRelease()) return;
    const response = await fetch('/', { cache: 'no-store', credentials: 'same-origin', headers: { 'Cache-Control': 'no-cache' } });
    if (!response.ok) return;
    const html = await response.text();
    const current = currentBundlePath();
    const fresh = freshBundlePath(html);
    if (current && fresh && current !== fresh) window.location.reload();
  } catch {
    // Fail open: never block the app just because an update check failed.
  } finally {
    refreshCheckInFlight = false;
  }
};

if ('serviceWorker' in navigator) {
  const hadControllerAtBoot = Boolean(navigator.serviceWorker.controller);
  let reloadedForControllerChange = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadControllerAtBoot || reloadedForControllerChange) return;
    reloadedForControllerChange = true;
    window.location.reload();
  });

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'ZHAOWU_RELEASE_READY') void checkForFreshShell();
  });

  const refreshServiceWorker = () => {
    void navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then(async (registration) => {
        await registration.update();
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        await checkForFreshShell();
      })
      .catch(() => undefined);
  };

  refreshServiceWorker();
  window.addEventListener('pageshow', refreshServiceWorker);
  window.addEventListener('focus', refreshServiceWorker);
  window.addEventListener('online', refreshServiceWorker);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshServiceWorker();
  });
  window.setInterval(() => {
    if (document.visibilityState === 'visible') void checkForFreshShell();
  }, 60_000);
}

createRoot(root).render(<StrictMode><RouterProvider router={router} /><KoHiLocalizationBridge /></StrictMode>);
