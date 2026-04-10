const KEY = 'moneyclock-locale';

export const APP_LOCALES = ['en', 'ru', 'es', 'fr', 'de', 'zh', 'ja', 'pt'] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

const VALID = new Set<string>(APP_LOCALES);

/** Map browser primary language subtag → supported app locale (null = unsupported). */
function primarySubtagToAppLocale(primary: string): AppLocale | null {
  const p = primary.toLowerCase();
  if (p === 'en') return 'en';
  if (p === 'ru') return 'ru';
  if (p === 'es') return 'es';
  if (p === 'fr') return 'fr';
  if (p === 'de') return 'de';
  if (p === 'zh') return 'zh';
  if (p === 'ja') return 'ja';
  if (p === 'pt') return 'pt';
  return null;
}

/**
 * Best-effort match from a BCP 47 tag (e.g. en-US, pt-BR, zh-Hans-CN).
 */
export function matchBrowserLangTagToAppLocale(tag: string): AppLocale | null {
  const t = tag.trim();
  if (!t) return null;
  const primary = t.split('-')[0];
  return primarySubtagToAppLocale(primary);
}

/**
 * Detect locale from `navigator.languages` / `navigator.language`. Returns null if nothing matches.
 */
export function detectAppLocaleFromNavigator(): AppLocale | null {
  if (typeof navigator === 'undefined') return null;
  const candidates: string[] = [];
  if (Array.isArray(navigator.languages)) {
    for (const x of navigator.languages) {
      if (typeof x === 'string' && x) candidates.push(x);
    }
  }
  if (typeof navigator.language === 'string' && navigator.language) {
    candidates.push(navigator.language);
  }
  for (const tag of candidates) {
    const m = matchBrowserLangTagToAppLocale(tag);
    if (m) return m;
  }
  return null;
}

export function readStoredLocale(): AppLocale {
  try {
    const v = localStorage.getItem(KEY);
    if (v && VALID.has(v)) return v as AppLocale;
  } catch {
    /* ignore */
  }
  const initial = detectAppLocaleFromNavigator() ?? 'en';
  try {
    localStorage.setItem(KEY, initial);
  } catch {
    /* ignore */
  }
  return initial;
}

export function writeStoredLocale(locale: AppLocale): void {
  try {
    localStorage.setItem(KEY, locale);
  } catch {
    /* ignore */
  }
}
