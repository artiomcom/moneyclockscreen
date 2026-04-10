const KEY = 'moneyclock-locale';

export const APP_LOCALES = ['en', 'ru', 'es', 'fr', 'de', 'zh', 'ja', 'pt'] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

const VALID = new Set<string>(APP_LOCALES);

export function readStoredLocale(): AppLocale {
  try {
    const v = localStorage.getItem(KEY);
    if (v && VALID.has(v)) return v as AppLocale;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function writeStoredLocale(locale: AppLocale): void {
  try {
    localStorage.setItem(KEY, locale);
  } catch {
    /* ignore */
  }
}
