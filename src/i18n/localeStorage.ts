const KEY = 'moneyclock-locale';

export type AppLocale = 'en' | 'ru';

export function readStoredLocale(): AppLocale {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'ru' || v === 'en') return v;
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
