const KEY = 'moneyclock-theme';

export type ThemePreference = 'light' | 'dark';

export function readStoredTheme(): ThemePreference {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'dark' || v === 'light') return v;
  } catch {
    /* ignore */
  }
  return 'dark';
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
