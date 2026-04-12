let installed = false;

/**
 * Патчит `history.pushState` / `replaceState`: в консоли видно аргумент `url` и stack trace вызывающего кода.
 * Вызывать один раз при старте приложения (см. `index.tsx`).
 */
export function installHistoryNavigationLogging(): void {
  if (typeof window === 'undefined' || typeof history === 'undefined') return;
  if (installed) return;
  installed = true;

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
