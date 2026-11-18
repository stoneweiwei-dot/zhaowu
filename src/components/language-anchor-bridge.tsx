import { useEffect } from 'react';
import { useDisplayLanguage } from '@/lib/display-language';
import { languagePath, parseLanguagePath } from '@/lib/language-routing.js';
import { ROUTE_META_PATHS } from '@/lib/route-meta';

/** Legacy native anchors share the router's language policy, including open-in-new-tab.
 * Only registered document routes qualify: API calls, media, downloads, auth
 * callbacks and external links keep their original targets.
 */
const DOCUMENT_ROUTES = new Set([...ROUTE_META_PATHS, '/login', '/account', '/member', '/history', '/gallery', '/social', '/tianji-dual', '/tianji-xinggong']);
export function LanguageAnchorBridge() {
  const { language } = useDisplayLanguage();
  useEffect(() => {
    const localize = (anchor: HTMLAnchorElement) => {
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || anchor.hasAttribute('download')) return;
      let url: URL;
      try { url = new URL(href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin || !DOCUMENT_ROUTES.has(parseLanguagePath(url.pathname).rest)) return;
      // Explicitly localized links (including language controls) must remain explicit.
      if (parseLanguagePath(url.pathname).language !== 'zh-Hant') return;
      url.pathname = languagePath(url.pathname, language);
      const target = url.pathname + url.search + url.hash;
      if (target !== href) anchor.setAttribute('href', target);
    };
    const scan = (node: Node) => {
      if (!(node instanceof Element)) return;
      if (node instanceof HTMLAnchorElement) localize(node);
      node.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(localize);
    };
    scan(document.body);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'attributes') scan(record.target);
        else record.addedNodes.forEach(scan);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
    return () => observer.disconnect();
  }, [language]);
  return null;
}
