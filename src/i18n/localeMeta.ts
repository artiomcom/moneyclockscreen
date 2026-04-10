import type { AppLocale } from './localeStorage';

/** BCP 47 tags for `Intl` / `toLocaleDateString` */
export const intlLocaleTag: Record<AppLocale, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  zh: 'zh-CN',
  ja: 'ja-JP',
  pt: 'pt-BR'
};

/** `document.documentElement.lang` */
export const htmlLang: Record<AppLocale, string> = {
  en: 'en',
  ru: 'ru',
  es: 'es',
  fr: 'fr',
  de: 'de',
  zh: 'zh-Hans',
  ja: 'ja',
  pt: 'pt'
};
