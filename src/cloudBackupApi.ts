/** Same-origin `/api/backup` on Cloudflare Pages, or set VITE_CLOUD_BACKUP_API_BASE. */
export function cloudBackupApiOrigin(): string {
  const b = import.meta.env.VITE_CLOUD_BACKUP_API_BASE;
  if (typeof b === 'string' && b.trim() !== '') {
    return b.replace(/\/$/, '');
  }
  return '';
}

export async function postCloudBackup(jsonText: string): Promise<{
  id: string;
  path: string;
}> {
  const origin = cloudBackupApiOrigin();
  const url = `${origin}/api/backup`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: jsonText
  });
  if (!res.ok) {
    const err = new Error(`cloud_backup_post_${res.status}`);
    throw err;
  }
  const data = (await res.json()) as { id?: string; path?: string };
  if (typeof data.id !== 'string' || typeof data.path !== 'string') {
    throw new Error('cloud_backup_bad_response');
  }
  return { id: data.id, path: data.path };
}

export async function fetchCloudBackupJson(id: string): Promise<string | null> {
  const origin = cloudBackupApiOrigin();
  const url = `${origin}/api/backup/${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: 'GET' });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.text();
}

export function parseMagicLinkPath(pathname: string): string | null {
  const p = pathname.replace(/\/$/, '') || '/';
  const m = p.match(/^\/u\/([a-fA-F0-9]{32})$/);
  return m ? m[1].toLowerCase() : null;
}

export function buildMagicLinkUrl(pathFromApi: string): string {
  if (typeof window === 'undefined') return pathFromApi;
  return `${window.location.origin}${pathFromApi}`;
}
