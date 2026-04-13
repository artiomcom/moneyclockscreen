const STORAGE_KEY = 'moneyclock.cloudMeta.v1';

export type CloudBackupLocalMeta = {
  /** SHA-256 hex of the exact JSON string last uploaded (or dedup-matched). */
  hash: string;
  id: string;
};

export async function hashMoneyClockExportJson(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  const bytes = new Uint8Array(buf);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function parseStored(raw: string): CloudBackupLocalMeta | null {
  try {
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== 'object') return null;
    const rec = o as Record<string, unknown>;
    if (typeof rec.hash !== 'string' || typeof rec.id !== 'string') return null;
    const id = rec.id.toLowerCase();
    if (!/^[a-f0-9]{32}$/.test(id)) return null;
    if (rec.hash.length < 16) return null;
    return { hash: rec.hash, id };
  } catch {
    return null;
  }
}

export function readCloudBackupMeta(): CloudBackupLocalMeta | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseStored(raw);
  } catch {
    return null;
  }
}

export function writeCloudBackupMeta(hash: string, id: string): void {
  try {
    const low = id.toLowerCase();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ hash, id: low }));
  } catch {
    /* ignore */
  }
}

/** Full magic URL for the last successful cloud save in this browser, or null. */
export function getLastCloudProfileMagicUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const m = readCloudBackupMeta();
  if (!m) return null;
  return `${window.location.origin}/u/${m.id}`;
}
