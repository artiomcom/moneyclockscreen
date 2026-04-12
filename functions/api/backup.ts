const MAX_BYTES = 1_500_000; // below KV 25 MiB; enough for MoneyClock JSON

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
  let id = '';
  const idBytes = new Uint8Array(16);
  crypto.getRandomValues(idBytes);
  id = [...idBytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  await env.BACKUP_KV.put(backupKey(id), text, {
    metadata: { createdAt: new Date().toISOString() }
  });
  return jsonResponse({ id, path: `/u/${id}` });
}
