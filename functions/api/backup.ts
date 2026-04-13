const MAX_BYTES = 1_500_000; // below KV 25 MiB; enough for MoneyClock JSON

const ID_HEX_RE = /^[a-f0-9]{32}$/;

function jsonResponse(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init?.headers
    }
  });
}

function backupKey(id: string): string {
  return `mc:${id}`;
}

/** Reverse index: SHA-256(hex) of body → backup id (dedupe across devices / cleared localStorage). */
function contentHashKey(sha256Hex: string): string {
  return `mc:h:${sha256Hex}`;
}

async function sha256HexOf(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function onRequestPost(context: {
  request: Request;
  env: { BACKUP_KV: KVNamespace };
}): Promise<Response> {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, { status: 405 });
  }
  const len = request.headers.get('content-length');
  if (len != null && Number(len) > MAX_BYTES) {
    return jsonResponse({ error: 'payload_too_large' }, { status: 413 });
  }
  const text = await request.text();
  if (text.length > MAX_BYTES) {
    return jsonResponse({ error: 'payload_too_large' }, { status: 413 });
  }
  if (!text.trim()) {
    return jsonResponse({ error: 'empty_body' }, { status: 400 });
  }

  const contentHash = await sha256HexOf(text);
  const hKey = contentHashKey(contentHash);
  const mappedId = (await env.BACKUP_KV.get(hKey))?.trim().toLowerCase() ?? '';
  if (mappedId && ID_HEX_RE.test(mappedId)) {
    const existing = await env.BACKUP_KV.get(backupKey(mappedId));
    if (existing === text) {
      return jsonResponse({
        id: mappedId,
        path: `/u/${mappedId}`,
        deduped: true
      });
    }
  }

  const idBytes = new Uint8Array(16);
  crypto.getRandomValues(idBytes);
  const id = [...idBytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  const createdAt = new Date().toISOString();
  await env.BACKUP_KV.put(backupKey(id), text, {
    metadata: { createdAt, contentHash }
  });
  await env.BACKUP_KV.put(hKey, id, {
    metadata: { id, createdAt, contentHash }
  });
  return jsonResponse({ id, path: `/u/${id}` });
}
