import {
  applyUsageAfterSuccess,
  checkQuota,
  estimateRequestBudgetTokens,
  loadUsageState,
  normalizeClientId,
  readLimitsFromEnv,
  roughTokenEstimate,
  saveUsageState,
  type QuotaLimits
} from '../lib/aiQuota';
import {
  streamOpenAIChatToUiMessageResponse,
  uiMessagesToOpenAI
} from '../lib/openaiUiStream';

const MAX_BODY_BYTES = 96_000;
const MAX_UI_MESSAGES = 32;
const MAX_COMPLETION_TOKENS = 3072;

function jsonResponse(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init?.headers
    }
  });
}

function isMessageArray(x: unknown): x is Record<string, unknown>[] {
  return Array.isArray(x) && x.length <= MAX_UI_MESSAGES;
}

function buildSystemPrompt(locale: string, snapshotJson: string): string {
  const snap =
    snapshotJson ?
      `\nUser financial snapshot (aggregates, same app UI; not verified):\n${snapshotJson}\n`
    : '\nNo structured snapshot was sent; answer from the conversation only.\n';

  return [
    'You are “Money AI”, a concise assistant inside the Money Clock web app.',
    'Help interpret earnings pace, balances, and planning ideas in plain language.',
    'Do not claim to retrieve live market data unless the user provided it.',
    'Give non-binding suggestions, not regulated financial advice.',
    `Reply in the user's language when possible (locale hint: ${locale}).`,
    snap
  ].join('\n');
}

export async function onRequestPost(context: {
  request: Request;
  env: {
    BACKUP_KV: KVNamespace;
    OPENAI_API_KEY?: string;
    AI_MODEL?: string;
    AI_MAX_TOKENS_PER_DAY?: string;
    AI_MAX_TOKENS_PER_MONTH?: string;
    AI_MAX_REQUESTS_PER_DAY?: string;
  };
  waitUntil?: (p: Promise<unknown>) => void;
}): Promise<Response> {
  const { request, env } = context;
  const waitUntil = context.waitUntil ?? ((p: Promise<unknown>) => void p);

  const len = request.headers.get('content-length');
  if (len != null && Number(len) > MAX_BODY_BYTES) {
    return jsonResponse({ error: 'payload_too_large' }, { status: 413 });
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return jsonResponse({ error: 'payload_too_large' }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: 'invalid_json' }, { status: 400 });
  }

  const clientId = normalizeClientId(body.clientId);
  if (!clientId) {
    return jsonResponse({ error: 'invalid_client_id' }, { status: 400 });
  }

  const messages = body.messages;
  if (!isMessageArray(messages)) {
    return jsonResponse({ error: 'invalid_messages' }, { status: 400 });
  }

  const locale =
    typeof body.locale === 'string' && body.locale.length <= 12 ? body.locale : 'en';

  const moneySnapshot = body.moneySnapshot;
  const snapshotStr =
    moneySnapshot === undefined || moneySnapshot === null ?
      ''
    : JSON.stringify(moneySnapshot);
  if (snapshotStr.length > 24_000) {
    return jsonResponse({ error: 'snapshot_too_large' }, { status: 400 });
  }

  const apiKey = env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return jsonResponse({ error: 'ai_not_configured' }, { status: 503 });
  }

  const limits: QuotaLimits = readLimitsFromEnv(env);
  const promptEstimate = roughTokenEstimate(text);
  const budget = estimateRequestBudgetTokens(promptEstimate, MAX_COMPLETION_TOKENS);

  const usageState = await loadUsageState(env.BACKUP_KV, clientId);
  const quota = checkQuota(usageState, budget, limits);
  if (!quota.ok) {
    return jsonResponse(
      { error: 'quota_exceeded', reason: quota.reason },
      { status: 429 }
    );
  }

  const modelId = env.AI_MODEL?.trim() || 'gpt-4o-mini';
  const system = buildSystemPrompt(locale, snapshotStr);
  const openaiMessages = uiMessagesToOpenAI(system, messages);
  if (openaiMessages.length < 2) {
    return jsonResponse({ error: 'no_usable_messages' }, { status: 400 });
  }

  const { response, finished } = streamOpenAIChatToUiMessageResponse({
    apiKey,
    model: modelId,
    messages: openaiMessages,
    maxTokens: MAX_COMPLETION_TOKENS,
    signal: request.signal
  });

  waitUntil(
    finished.then(async ({ promptTokens, completionTokens }) => {
      const latest = await loadUsageState(env.BACKUP_KV, clientId);
      const next = applyUsageAfterSuccess(latest, promptTokens, completionTokens);
      await saveUsageState(env.BACKUP_KV, clientId, next);
    })
  );

  return response;
}
