/**
 * OpenAI Chat Completions streaming → Vercel AI UI Message SSE stream (v1).
 * Avoids bundling `ai` / `@ai-sdk/openai` in Cloudflare Pages Functions (Wrangler Windows issue).
 */

export type OpenAIChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type UiStreamChunk =
  | { type: 'start'; messageId?: string }
  | { type: 'text-start'; id: string }
  | { type: 'text-delta'; id: string; delta: string }
  | { type: 'text-end'; id: string }
  | { type: 'finish'; finishReason?: 'stop' | 'length' | 'error' | 'other' };

const UI_HEADERS = {
  'content-type': 'text/event-stream; charset=utf-8',
  'cache-control': 'no-cache',
  connection: 'keep-alive',
  'x-vercel-ai-ui-message-stream': 'v1',
  'x-accel-buffering': 'no'
} as const;

function sseLine(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

/** Extract plain text from AI SDK UIMessage-like JSON (parts[] or legacy content). */
export function uiMessageToText(m: Record<string, unknown>): string {
  const parts = m.parts;
  if (Array.isArray(parts)) {
    const texts: string[] = [];
    for (const p of parts) {
      if (!p || typeof p !== 'object') continue;
      const o = p as Record<string, unknown>;
      if (o.type === 'text' && typeof o.text === 'string') texts.push(o.text);
    }
    return texts.join('');
  }
  const c = m.content;
  if (typeof c === 'string') return c;
  return '';
}

export function uiMessagesToOpenAI(
  system: string,
  rawMessages: unknown[]
): OpenAIChatMessage[] {
  const out: OpenAIChatMessage[] = [{ role: 'system', content: system }];
  for (const m of rawMessages) {
    if (!m || typeof m !== 'object') continue;
    const o = m as Record<string, unknown>;
    const role = o.role;
    if (role !== 'user' && role !== 'assistant') continue;
    const text = uiMessageToText(o).trim();
    if (!text) continue;
    out.push({ role, content: text });
  }
  return out;
}

export type StreamOpenAIResult = {
  response: Response;
  /** Resolves when stream ends; usage from OpenAI if present */
  finished: Promise<{ promptTokens: number; completionTokens: number }>;
};

export function streamOpenAIChatToUiMessageResponse(options: {
  apiKey: string;
  model: string;
  messages: OpenAIChatMessage[];
  maxTokens: number;
  signal: AbortSignal;
}): StreamOpenAIResult {
  const textPartId = crypto.randomUUID();
  const assistantMessageId = crypto.randomUUID();

  let resolveUsage!: (u: { promptTokens: number; completionTokens: number }) => void;
  const finished = new Promise<{ promptTokens: number; completionTokens: number }>((res) => {
    resolveUsage = res;
  });

  const openaiRequest = fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${options.apiKey}`
    },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      stream: true,
      max_tokens: options.maxTokens,
      stream_options: { include_usage: true }
    }),
    signal: options.signal
  });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const push = (c: UiStreamChunk) => controller.enqueue(enc.encode(sseLine(c)));

      try {
        const res = await openaiRequest;
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          push({ type: 'start', messageId: assistantMessageId });
          controller.enqueue(
            enc.encode(
              sseLine({
                type: 'error',
                errorText: (errText || res.statusText).slice(0, 2000)
              })
            )
          );
          push({ type: 'finish', finishReason: 'error' });
          controller.enqueue(enc.encode('data: [DONE]\n\n'));
          controller.close();
          resolveUsage({ promptTokens: 0, completionTokens: 0 });
          return;
        }
        if (!res.body) {
          push({ type: 'start', messageId: assistantMessageId });
          controller.enqueue(enc.encode(sseLine({ type: 'error', errorText: 'empty_body' })));
          push({ type: 'finish', finishReason: 'error' });
          controller.enqueue(enc.encode('data: [DONE]\n\n'));
          controller.close();
          resolveUsage({ promptTokens: 0, completionTokens: 0 });
          return;
        }

        push({ type: 'start', messageId: assistantMessageId });
        push({ type: 'text-start', id: textPartId });

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buffer = '';
        let promptTokens = 0;
        let completionTokens = 0;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += dec.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === '[DONE]') continue;
            let json: Record<string, unknown>;
            try {
              json = JSON.parse(payload) as Record<string, unknown>;
            } catch {
              continue;
            }
            const usage = json.usage as Record<string, unknown> | undefined;
            if (usage && typeof usage === 'object') {
              const pt = usage.prompt_tokens;
              const ct = usage.completion_tokens;
              if (typeof pt === 'number') promptTokens = pt;
              if (typeof ct === 'number') completionTokens = ct;
            }
            const choices = json.choices as Record<string, unknown>[] | undefined;
            const ch0 = choices?.[0] as Record<string, unknown> | undefined;
            const delta = ch0?.delta as Record<string, unknown> | undefined;
            const content = delta?.content;
            if (typeof content === 'string' && content.length > 0) {
              push({ type: 'text-delta', id: textPartId, delta: content });
            }
          }
        }

        push({ type: 'text-end', id: textPartId });
        push({ type: 'finish', finishReason: 'stop' });
        controller.enqueue(enc.encode('data: [DONE]\n\n'));
        controller.close();
        resolveUsage({ promptTokens, completionTokens });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'stream_error';
        controller.enqueue(enc.encode(sseLine({ type: 'error', errorText: msg })));
        controller.enqueue(enc.encode(sseLine({ type: 'finish', finishReason: 'error' })));
        controller.enqueue(enc.encode('data: [DONE]\n\n'));
        controller.close();
        resolveUsage({ promptTokens: 0, completionTokens: 0 });
      }
    }
  });

  return {
    response: new Response(stream, { headers: UI_HEADERS }),
    finished
  };
}
