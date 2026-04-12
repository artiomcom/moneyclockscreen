function backupKey(id: string): string {
  return `mc:${id}`;
}

const ID_RE = /^[a-f0-9]{32}$/;

export async function onRequestGet(context: {
  request: Request;
  env: { BACKUP_KV: KVNamespace };
  params: { id: string };
}): Promise<Response> {
  const { env, params } = context;
  const raw = params.id ?? '';
  const id = raw.toLowerCase();
  if (!ID_RE.test(id)) {
    return new Response('not found', { status: 404 });
  }
  const data = await env.BACKUP_KV.get(backupKey(id));
  if (data == null) {
    return new Response('not found', { status: 404 });
  }
  return new Response(data, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'private, max-age=60'
    }
  });
}
