/** URL language is authoritative; unknown first segments remain ordinary routes. */
export const LANGUAGES = ['zh-Hant', 'zh-Hans', 'en', 'ja', 'ko', 'hi', 'th', 'id', 'vi', 'fil'];
export const LANGUAGE_PREFIXES = { 'zh-Hant': '', 'zh-Hans': '/zh-hans', en: '/en', ja: '/ja', ko: '/ko', hi: '/hi', th: '/th', id: '/id', vi: '/vi', fil: '/fil' };
export function parseLanguagePath(pathname) {
  const first = pathname.split('/')[1];
  const language = LANGUAGES.find(lang => LANGUAGE_PREFIXES[lang] === `/${first}` && lang !== 'zh-Hant');
  return language ? { language, rest: pathname.slice(first.length + 1) || '/' } : { language: 'zh-Hant', rest: pathname || '/' };
}
export function languagePath(path, language) {
  const prefix = LANGUAGE_PREFIXES[language] ?? '';
  const rest = parseLanguagePath(path).rest;
  return `${prefix}${rest === '/' && prefix ? '' : rest}`;
}
export function languageAlternates(path, origin) {
  const rest = parseLanguagePath(path).rest;
  return [...LANGUAGES.map(language => ({ language, href: `${origin}${languagePath(rest, language)}` })), { language: 'x-default', href: `${origin}${rest}` }];
}
/** TanStack's in/out rewrite applies to Link and navigate without duplicating route trees. */
export function createLanguageRewrite(getLanguage) {
  return {
    input: ({ url }) => { url.pathname = parseLanguagePath(url.pathname).rest; return url; },
    output: ({ url }) => { url.pathname = languagePath(url.pathname, getLanguage()); return url; },
  };
}
