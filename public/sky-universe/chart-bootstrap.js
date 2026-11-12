import { createChartContext } from './chart-context.js?v=20261112';

const language = new URLSearchParams(window.location.search).get('lang');
const context = createChartContext(language);
window.ZhaowuSky = context;
document.documentElement.lang = context.locale;
document.title = context.text('昭梧觀象');

const script = document.createElement('script');
script.src = '/sky-universe/chart-artwork.js?v=20261112';
let settled = false;
const report = (type) => {
  if (settled) return;
  settled = true;
  window.clearTimeout(timeout);
  observer.disconnect();
  window.parent.postMessage({ type }, window.location.origin);
};
const checkCanvas = () => {
  const canvas = document.querySelector('#root canvas');
  if (canvas) report(canvas.getContext('2d') ? 'zhaowu:sky-chart-ready' : 'zhaowu:sky-chart-failed');
};
const observer = new MutationObserver(checkCanvas);
observer.observe(document.getElementById('root'), { childList: true, subtree: true });
const timeout = window.setTimeout(() => report('zhaowu:sky-chart-failed'), 12_000);
script.onload = checkCanvas;
script.onerror = () => report('zhaowu:sky-chart-failed');
window.addEventListener('error', (event) => {
  if (event.filename?.includes('/sky-universe/chart-artwork.js')) report('zhaowu:sky-chart-failed');
});
document.head.appendChild(script);
