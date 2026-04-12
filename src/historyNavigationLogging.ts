const LS_KEY = 'moneyclock-debug-history';

function envFlagOn(): boolean {
  const v = import.meta.env.VITE_DEBUG_HISTORY;
  if (typeof v !== 'string') return false;
  const u = v.trim().toLowerCase();
  return u === '1' || u === 'true' || u === 'yes';
}

/** Включается: `localStorage.setItem('moneyclock-debug-history','1'); location.reload()` или `VITE_DEBUG_HISTORY=1` в сборке. */
export function isHistoryNavigationLoggingEnabled(): boolean {
  if (envFlagOn()) return true;
  try {
    return localStorage.getItem(LS_KEY) === '1';
  } catch {
    return false;
  }
}

let installed = false;

/**
 * Патчит `history.pushState` / `replaceState`: в консоли видно аргумент `url` и stack trace вызывающего кода.
 * Вызывать один раз при старте приложения (см. `index.tsx`).
 */
export function installHistoryNavigationLogging(): void {
  if (typeof window === 'undefined' || typeof history === 'undefined') return;
  if (installed) return;
  installed = true;
  if (!isHistoryNavigationLoggingEnabled()) return;

  console.warn(
    `[MoneyClock] Логирование History API включено. Выключить: localStorage.removeItem('${LS_KEY}'); location.reload()`
  );

  const push = history.pushState.bind(history);
  const replace = history.replaceState.bind(history);

  history.pushState = function pushStateWrapped(
    data: unknown,
    unused: string,
    url?: string | URL | null
  ): void {
    const before = window.location.href;
    push(data, unused, url);
    console.warn('[MoneyClock] history.pushState', {
      urlArg: url === undefined ? undefined : String(url),
      before,
      after: window.location.href
    });
    console.trace();
  };

  history.replaceState = function replaceStateWrapped(
    data: unknown,
    unused: string,
    url?: string | URL | null
  ): void {
    const before = window.location.href;
    replace(data, unused, url);
    console.warn('[MoneyClock] history.replaceState', {
      urlArg: url === undefined ? undefined : String(url),
      before,
      after: window.location.href
    });
    console.trace();
  };
}
