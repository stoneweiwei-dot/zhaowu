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

createRoot(root).render(<StrictMode><RouterProvider router={router} /><KoHiLocalizationBridge /></StrictMode>);
