import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { KoHiLocalizationBridge } from './components/ko-hi-localization-bridge';
import { routeTree } from './routeTree.gen';
import './styles.css';
import './zhaowu-layered-styles.css';
// Canonical visual authority must load last. Do not add visual hotfix layers after this import.
import './zhaowu-design-system.css';
// Owner-selectable theme skins + jade almanac board. Gated by html[data-zws]/[data-variant]; inert by default.
import './theme-skins.css';


const router = createRouter({ routeTree });
declare module '@tanstack/react-router' { interface Register { router: typeof router; } }
declare const __ZHAOWU_RELEASE_ID__: string;
const root = document.getElementById('root');
if (!root) throw new Error('Missing root element');

const CURRENT_RELEASE = __ZHAOWU_RELEASE_ID__ || 'dev';
const RELEASE_PARAM = 'zw_release';
const RELEASE_RELOAD_KEY = 'zhaowu.pwa.release-reload';
const SHELL_RELOAD_KEY = 'zhaowu.pwa.shell-reload';
const RECOVERY_STATE_KEY = 'zhaowu.pwa.recovery-state';
const RESET_PARAM = 'zw_reset';
const MAX_RELEASE_RETRIES = 3;
const RELEASE_RETRY_COOLDOWN_MS = 8_000;

const isStandaloneWebApp = (() => {
  try {
    const standaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
    const legacyStandalone = Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    return standaloneMedia || legacyStandalone;
  } catch {
    return false;
  }
})();

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
    url.searchParams.delete(RESET_PARAM);
    url.searchParams.delete('zw_retry');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    sessionStorage.removeItem(RELEASE_RELOAD_KEY);
    sessionStorage.removeItem(SHELL_RELOAD_KEY);
    sessionStorage.removeItem(RECOVERY_STATE_KEY);
  } catch {
    // Query cleanup is cosmetic; never block the app if iOS rejects it.
  }
};

clearSatisfiedReleaseParam();

type RecoveryState = {
  release: string;
  attempts: number;
  lastAttemptAt: number;
  hardResetAt?: number;
};

const readRecoveryState = (): RecoveryState | null => {
  try {
    const raw = sessionStorage.getItem(RECOVERY_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RecoveryState>;
    if (
      typeof parsed.release !== 'string' ||
      typeof parsed.attempts !== 'number' ||
      typeof parsed.lastAttemptAt !== 'number'
    ) return null;
    return {
      release: parsed.release,
      attempts: parsed.attempts,
      lastAttemptAt: parsed.lastAttemptAt,
      hardResetAt: typeof parsed.hardResetAt === 'number' ? parsed.hardResetAt : undefined,
    };
  } catch {
    return null;
  }
};

const writeRecoveryState = (state: RecoveryState) => {
  try { sessionStorage.setItem(RECOVERY_STATE_KEY, JSON.stringify(state)); } catch { /* best effort */ }
};

const promoteFreshServiceWorker = async () => {
  try {
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) return false;

    let settled = false;
    let timeoutId: number | undefined;
    const controllerChanged = new Promise<boolean>((resolve) => {
      const finish = (value: boolean) => {
        if (settled) return;
        settled = true;
        if (timeoutId !== undefined) window.clearTimeout(timeoutId);
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
        resolve(value);
      };
      const onControllerChange = () => finish(true);
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
      timeoutId = window.setTimeout(() => finish(false), 3_000);
    });

    await registration.update();

    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else if (registration.installing) {
      const installing = registration.installing;
      const promoteWhenReady = () => {
        if (installing.state === 'installed') {
          registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        }
      };
      installing.addEventListener('statechange', promoteWhenReady);
      promoteWhenReady();
    }

    return await controllerChanged;
  } catch {
    return false;
  }
};

const hardResetForRelease = async (freshRelease: string) => {
  const now = Date.now();
  const previous = readRecoveryState();
  if (previous?.release === freshRelease && previous.hardResetAt && now - previous.hardResetAt < 30_000) {
    return false;
  }

  writeRecoveryState({
    release: freshRelease,
    attempts: Math.max(previous?.attempts ?? 0, MAX_RELEASE_RETRIES),
    lastAttemptAt: now,
    hardResetAt: now,
  });

  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith('zhaowu-shell-')).map((key) => caches.delete(key)));
    }
  } catch {
    // Cache cleanup is a recovery aid; never block navigation if Safari rejects it.
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration('/');
    await registration?.unregister();
  } catch {
    // The next navigation can still escape a stale standalone snapshot.
  }

  const url = new URL(window.location.href);
  url.searchParams.set(RELEASE_PARAM, freshRelease);
  url.searchParams.set(RESET_PARAM, String(now));
  window.location.replace(url.toString());
  return true;
};

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
      if (freshRelease === CURRENT_RELEASE) {
        sessionStorage.removeItem(RELEASE_RELOAD_KEY);
        sessionStorage.removeItem(RECOVERY_STATE_KEY);
      }
      return false;
    }

    // iPhone/iPad/macOS standalone Web Apps can restore an older WebKit snapshot
    // even when the network already serves a newer release. Always ask the existing
    // registration to update first: service-worker script updates bypass the stale
    // page shell and are the safest bridge from an old installed app to the new
    // release. Only fall back to the scoped hard reset if no new controller takes
    // over within the update window.
    if (isStandaloneWebApp) {
      if (await promoteFreshServiceWorker()) return true;
      return await hardResetForRelease(freshRelease);
    }

    const registration = await navigator.serviceWorker.getRegistration('/');
    if (registration) {
      await registration.update();
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    }

    const now = Date.now();
    const previous = readRecoveryState();
    const sameRelease = previous?.release === freshRelease;
    const attempts = sameRelease ? previous.attempts : 0;
    const lastAttemptAt = sameRelease ? previous.lastAttemptAt : 0;

    if (sameRelease && now - lastAttemptAt < RELEASE_RETRY_COOLDOWN_MS) return false;

    if (attempts >= MAX_RELEASE_RETRIES) {
      return await hardResetForRelease(freshRelease);
    }

    const nextAttempts = attempts + 1;
    writeRecoveryState({
      release: freshRelease,
      attempts: nextAttempts,
      lastAttemptAt: now,
      hardResetAt: sameRelease ? previous?.hardResetAt : undefined,
    });
    sessionStorage.setItem(RELEASE_RELOAD_KEY, freshRelease + ':' + nextAttempts);

    const url = new URL(window.location.href);
    url.searchParams.set(RELEASE_PARAM, freshRelease);
    url.searchParams.set('zw_retry', String(nextAttempts));
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
    if (current && fresh && current !== fresh) {
      const fingerprint = `${current}→${fresh}`;
      if (sessionStorage.getItem(SHELL_RELOAD_KEY) !== fingerprint) {
        sessionStorage.setItem(SHELL_RELOAD_KEY, fingerprint);
        window.location.reload();
      }
    }
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
    if (event.data?.type === 'ZHAOWU_RELEASE_PROBE') {
      event.ports?.[0]?.postMessage({
        type: 'ZHAOWU_CLIENT_RELEASE',
        release: CURRENT_RELEASE,
      });
      if (event.data?.release !== CURRENT_RELEASE) void checkForFreshShell();
      return;
    }
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
