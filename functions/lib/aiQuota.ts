/** AI usage quotas stored in KV (prefix ai:usage:), UTC day/month. */

export type AiUsageState = {
  dayYmd: string;
  dayTokens: number;
  dayRequests: number;
  monthYm: string;
  monthTokens: number;
  monthRequests: number;
};

export type QuotaLimits = {
  maxTokensPerDay: number;
  maxTokensPerMonth: number;
  maxRequestsPerDay: number;
};

export const DEFAULT_QUOTA_LIMITS: QuotaLimits = {
  maxTokensPerDay: 45_000,
  maxTokensPerMonth: 250_000,
  maxRequestsPerDay: 36
};

const KV_PREFIX = 'ai:usage:';

export function utcYmd(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function utcYearMonth(d = new Date()): string {
  return d.toISOString().slice(0, 7);
}

export function roughTokenEstimate(text: string): number {
  if (!text.length) return 0;
  return Math.ceil(text.length / 4);
}

function usageKey(clientId: string): string {
  return `${KV_PREFIX}${clientId}`;
}

export function normalizeClientId(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (s.length < 8 || s.length > 80) return null;
  if (!/^[a-zA-Z0-9:_-]+$/.test(s)) return null;
  return s;
}

function resetRollingFields(s: AiUsageState, now: Date): AiUsageState {
  const ymd = utcYmd(now);
  const ym = utcYearMonth(now);
  let next = { ...s };
  if (next.dayYmd !== ymd) {
    next = { ...next, dayYmd: ymd, dayTokens: 0, dayRequests: 0 };
  }
  if (next.monthYm !== ym) {
    next = { ...next, monthYm: ym, monthTokens: 0, monthRequests: 0 };
  }
  return next;
}

export async function loadUsageState(
  kv: KVNamespace,
  clientId: string,
  now = new Date()
): Promise<AiUsageState> {
  const raw = await kv.get(usageKey(clientId));
  const ymd = utcYmd(now);
  const ym = utcYearMonth(now);
  let base: AiUsageState = {
    dayYmd: ymd,
    dayTokens: 0,
    dayRequests: 0,
    monthYm: ym,
    monthTokens: 0,
    monthRequests: 0
  };
  if (raw) {
    try {
      const j = JSON.parse(raw) as Partial<AiUsageState>;
      base = {
        dayYmd: typeof j.dayYmd === 'string' ? j.dayYmd : ymd,
        dayTokens: typeof j.dayTokens === 'number' ? j.dayTokens : 0,
        dayRequests: typeof j.dayRequests === 'number' ? j.dayRequests : 0,
        monthYm: typeof j.monthYm === 'string' ? j.monthYm : ym,
        monthTokens: typeof j.monthTokens === 'number' ? j.monthTokens : 0,
        monthRequests: typeof j.monthRequests === 'number' ? j.monthRequests : 0
      };
    } catch {
      /* ignore */
    }
  }
  return resetRollingFields(base, now);
}

export async function saveUsageState(
  kv: KVNamespace,
  clientId: string,
  state: AiUsageState
): Promise<void> {
  await kv.put(usageKey(clientId), JSON.stringify(state), {
    expirationTtl: 60 * 60 * 24 * 120
  });
}

/** Budget for one request: pre-output estimate + max completion budget. */
export function estimateRequestBudgetTokens(
  promptEstimate: number,
  maxCompletionTokens: number
): number {
  return promptEstimate + maxCompletionTokens + 400;
}

export type QuotaCheck =
  | { ok: true; state: AiUsageState; budget: number }
  | { ok: false; reason: 'daily_requests' | 'daily_tokens' | 'monthly_tokens'; state: AiUsageState };

export function checkQuota(
  state: AiUsageState,
  budgetTokens: number,
  limits: QuotaLimits
): QuotaCheck {
  if (state.dayRequests >= limits.maxRequestsPerDay) {
    return { ok: false, reason: 'daily_requests', state };
  }
  if (state.dayTokens + budgetTokens > limits.maxTokensPerDay) {
    return { ok: false, reason: 'daily_tokens', state };
  }
  if (state.monthTokens + budgetTokens > limits.maxTokensPerMonth) {
    return { ok: false, reason: 'monthly_tokens', state };
  }
  return { ok: true, state, budget: budgetTokens };
}

export function applyUsageAfterSuccess(
  state: AiUsageState,
  promptTokens: number,
  completionTokens: number,
  now = new Date()
): AiUsageState {
  const s = resetRollingFields(state, now);
  const total = promptTokens + completionTokens;
  return {
    ...s,
    dayTokens: s.dayTokens + total,
    monthTokens: s.monthTokens + total,
    dayRequests: s.dayRequests + 1,
    monthRequests: s.monthRequests + 1
  };
}

export function readLimitsFromEnv(env: {
  AI_MAX_TOKENS_PER_DAY?: string;
  AI_MAX_TOKENS_PER_MONTH?: string;
  AI_MAX_REQUESTS_PER_DAY?: string;
}): QuotaLimits {
  const num = (s: string | undefined, fallback: number) => {
    const n = s != null ? parseInt(s, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  return {
    maxTokensPerDay: num(env.AI_MAX_TOKENS_PER_DAY, DEFAULT_QUOTA_LIMITS.maxTokensPerDay),
    maxTokensPerMonth: num(env.AI_MAX_TOKENS_PER_MONTH, DEFAULT_QUOTA_LIMITS.maxTokensPerMonth),
    maxRequestsPerDay: num(env.AI_MAX_REQUESTS_PER_DAY, DEFAULT_QUOTA_LIMITS.maxRequestsPerDay)
  };
}
