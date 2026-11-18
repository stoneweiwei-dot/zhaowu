export type UrlLanguage = 'zh-Hant' | 'zh-Hans' | 'en' | 'ja' | 'ko' | 'hi' | 'th' | 'id' | 'vi' | 'fil';
export const LANGUAGES: UrlLanguage[];
export const LANGUAGE_PREFIXES: Record<UrlLanguage, string>;
export function parseLanguagePath(pathname: string): { language: UrlLanguage; rest: string };
export function languagePath(path: string, language: string): string;
export function languageAlternates(path: string, origin: string): { language: string; href: string }[];
export function createLanguageRewrite(getLanguage: () => string): {
  input: (options: {url: URL}) => URL;
  output: (options: {url: URL}) => URL;
};
