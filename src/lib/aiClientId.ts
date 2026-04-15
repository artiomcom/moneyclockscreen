const STORAGE_KEY = 'moneyclock.aiClientId.v1';

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `mc-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Stable anonymous id for AI quota (KV); not authentication. */
export function getOrCreateAiClientId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY)?.trim();
    if (existing && existing.length >= 8) return existing;
    const id = randomId();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return randomId();
  }
}
