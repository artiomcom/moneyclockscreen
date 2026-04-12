import { parseMagicLinkPath } from './cloudBackupApi';
import { isHistoryNavigationLoggingEnabled } from './historyNavigationLogging';

const KEY = 'mc_magic_link_id';

/** Call on every load (e.g. useLayoutEffect) so we keep the id if something later strips /u/… from the path. */
export function captureMagicLinkIdFromUrlToSession(): void {
  try {
    const id = parseMagicLinkPath(window.location.pathname);
    if (id) {
      sessionStorage.setItem(KEY, id);
      if (isHistoryNavigationLoggingEnabled()) {
        console.warn('[MoneyClock] magic link → sessionStorage', {
          id,
          pathname: window.location.pathname
        });
      }
    }
  } catch {
    /* ignore */
  }
}

export function peekMagicLinkIdFromSession(): string | null {
  try {
    const v = sessionStorage.getItem(KEY);
    if (!v) return null;
    const low = v.toLowerCase();
    if (!/^[a-f0-9]{32}$/.test(low)) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return low;
  } catch {
    return null;
  }
}

export function clearMagicLinkSession(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

const id32 = (s: string) => /^[a-f0-9]{32}$/i.test(s);

/**
 * After a successful cloud restore, force `/u/<id>` into the address bar.
 * Some environments mutate the path after React commits; retries win that race.
 */
export function ensureMagicLinkInAddressBar(id: string): void {
  if (!id32(id)) return;
  const wantPath = `/u/${id.toLowerCase()}`;
  const fullUrl = `${window.location.origin}${wantPath}`;
  const pathMatches = (): boolean => {
    const p = (window.location.pathname || '').replace(/\/$/, '') || '/';
    return p.toLowerCase() === wantPath.toLowerCase();
  };
  const fix = (): void => {
    try {
      if (isHistoryNavigationLoggingEnabled()) {
        console.warn('[MoneyClock] ensureMagicLinkInAddressBar', {
          id,
          pathname: window.location.pathname,
          href: window.location.href,
          alreadyMatches: pathMatches()
        });
      }
      if (pathMatches()) return;
      window.history.replaceState(window.history.state ?? null, '', fullUrl);
    } catch {
      /* ignore */
    }
  };
  fix();
  queueMicrotask(fix);
  setTimeout(fix, 0);
  setTimeout(fix, 50);
  setTimeout(fix, 200);
}
