const KEY = 'moneyclock-theme';

export type ThemePreference = 'light' | 'dark';

/** Default for new visitors and invalid stored values */
export const DEFAULT_THEME: ThemePreference = 'dark';

export function readStoredTheme(): ThemePreference {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'dark' || v === 'light') return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME;
}

export function writeStoredTheme(mode: ThemePreference): void {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* ignore */
  }
}

export function applyThemeToDocument(mode: ThemePreference): void {
  document.documentElement.classList.toggle('dark', mode === 'dark');
}
