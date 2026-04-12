import { parseMagicLinkPath } from './cloudBackupApi';

const KEY = 'mc_magic_link_id';

/** Call on every load (e.g. useLayoutEffect) so we keep the id if something later strips /u/… from the path. */
export function captureMagicLinkIdFromUrlToSession(): void {
  try {
    const id = parseMagicLinkPath(window.location.pathname);
    if (id) sessionStorage.setItem(KEY, id);
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
