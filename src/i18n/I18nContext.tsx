import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { en } from './en';
import { ru } from './ru';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { zh } from './zh';
import { ja } from './ja';
import { pt } from './pt';
import { readStoredLocale, writeStoredLocale, type AppLocale } from './localeStorage';
import { htmlLang } from './localeMeta';

const DICTS: Record<AppLocale, Record<string, string>> = { en, ru, es, fr, de, zh, ja, pt };

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>
) => string;

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (l: AppLocale) => void;
  t: TranslateFn;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function applyVars(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => readStoredLocale());

  const setLocale = useCallback((l: AppLocale) => {
    setLocaleState(l);
    writeStoredLocale(l);
  }, []);

  useEffect(() => {
    document.documentElement.lang = htmlLang[locale];
  }, [locale]);

  const t = useCallback<TranslateFn>(
    (key, vars) => {
      const raw = DICTS[locale][key] ?? DICTS.en[key] ?? key;
      return applyVars(raw, vars);
    },
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
