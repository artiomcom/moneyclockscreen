import { normalizeCurrencyCode, type ProjectEntry } from './moneyClockPersistence';

export type FrankfurterRow = {
  date: string;
  base: string;
  quote: string;
  rate: number;
};

const API = 'https://api.frankfurter.dev/v2/rates';
const CACHE_PREFIX = 'moneyclock-ffx-v1-';
const CACHE_TTL_MS = 6 * 3600 * 1000;

export function formatLocalYmdFromMs(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Минимальная валидная дата начала среди проектов `YYYY-MM-DD`. */
export function minWorkStartYmdFromProjects(projects: ProjectEntry[]): string | null {
  const valid = projects
    .map((p) => p.workStartDate.trim())
    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
  if (valid.length === 0) return null;
  return [...valid].sort()[0]!;
}

/** Валюты проектов, отличные от базы (для Frankfurter `quotes=`). */
export function frankfurterQuoteCurrencies(
  projects: ProjectEntry[],
  balanceCurrency: string
): string[] {
  const b = normalizeCurrencyCode(balanceCurrency);
  const s = new Set<string>();
  for (const p of projects) s.add(normalizeCurrencyCode(p.currencyCode));
  return [...s].filter((c) => c !== b).sort();
}

function cacheKey(
  base: string,
  quotes: string[],
  from: string,
  to: string,
  ecb: boolean
): string {
  return `${CACHE_PREFIX}${ecb ? 'ecb:' : ''}${base}|${quotes.join(',')}|${from}|${to}`;
}

async function fetchFrankfurterChunk(
  from: string,
  to: string,
  base: string,
  quotes: string[],
  providersEcb: boolean,
  signal?: AbortSignal
): Promise<FrankfurterRow[]> {
  const u = new URL(API);
  u.searchParams.set('from', from);
  u.searchParams.set('to', to);
  u.searchParams.set('base', base);
  u.searchParams.set('quotes', quotes.join(','));
  if (providersEcb) u.searchParams.set('providers', 'ECB');
  const res = await fetch(u.toString(), { signal });
  if (!res.ok) throw new Error(`Frankfurter ${res.status}`);
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) throw new Error('Frankfurter: ожидался массив');
  return data as FrankfurterRow[];
}

/**
 * Исторические курсы по календарным дням (рабочие дни в данных ECB/источника).
 * Запросы по годам, слияние, кэш в localStorage.
 */
export async function fetchFrankfurterHistoricalRates(
  fromYmd: string,
  toYmd: string,
  baseRaw: string,
  quotesRaw: string[],
  opts?: { providersEcb?: boolean; signal?: AbortSignal }
): Promise<FrankfurterRow[]> {
  const base = normalizeCurrencyCode(baseRaw);
  const quotes = [...new Set(quotesRaw.map((c) => normalizeCurrencyCode(c)))].filter(
    (c) => c !== base
  );
  if (quotes.length === 0) return [];
  const ecb = opts?.providersEcb ?? false;
  const key = cacheKey(base, quotes, fromYmd, toYmd, ecb);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as { at?: number; rows?: FrankfurterRow[] };
      if (
        typeof parsed.at === 'number' &&
        Date.now() - parsed.at < CACHE_TTL_MS &&
        Array.isArray(parsed.rows)
      ) {
        return parsed.rows;
      }
    }
  } catch {
    /* ignore */
  }

  const y0 = +fromYmd.slice(0, 4);
  const y1 = +toYmd.slice(0, 4);
  if (!Number.isFinite(y0) || !Number.isFinite(y1) || y0 > y1) return [];

  const merged = new Map<string, FrankfurterRow>();
  for (let y = y0; y <= y1; y++) {
    const chunkFrom = y === y0 ? fromYmd : `${y}-01-01`;
    const chunkTo = y === y1 ? toYmd : `${y}-12-31`;
    const part = await fetchFrankfurterChunk(
      chunkFrom,
      chunkTo,
      base,
      quotes,
      ecb,
      opts?.signal
    );
    for (const row of part) {
      merged.set(`${row.date}|${row.quote}`, row);
    }
  }

  const rows = [...merged.values()].sort(
    (a, b) => a.date.localeCompare(b.date) || a.quote.localeCompare(b.quote)
  );
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), rows }));
  } catch {
    /* quota */
  }
  return rows;
}

function rateOnOrBefore(
  sorted: { date: string; rate: number }[],
  ymd: string
): number | null {
  if (sorted.length === 0) return null;
  let lo = 0;
  let hi = sorted.length - 1;
  let best: number | null = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid].date <= ymd) {
      best = sorted[mid].rate;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

function denominatorForQuote(
  sorted: { date: string; rate: number }[],
  ymdMin: string
): number | null {
  const onOrBefore = rateOnOrBefore(sorted, ymdMin);
  if (onOrBefore != null && onOrBefore > 0) return onOrBefore;
  const after = sorted.find((x) => x.date >= ymdMin);
  if (after && after.rate > 0) return after.rate;
  const last = sorted[sorted.length - 1];
  return last && last.rate > 0 ? last.rate : null;
}

/**
 * Средний относительный индекс котировок: для каждой валюты 100% = курс на дату начала графика
 * (или первая доступная точка), далее 100 × rate(t)/rate(база).
 */
export function buildRelativeFxIndexSeries(
  rows: FrankfurterRow[],
  baseRaw: string,
  quoteCodes: string[],
  tMin: number,
  tMax: number,
  steps: number
): { label: string; points: [number, number][] } | null {
  const base = normalizeCurrencyCode(baseRaw);
  const quotes = [...new Set(quoteCodes.map((c) => normalizeCurrencyCode(c)))].filter(
    (c) => c !== base
  );
  if (quotes.length === 0 || tMax <= tMin || steps < 1) return null;

  const byQuote = new Map<string, { date: string; rate: number }[]>();
  for (const q of quotes) byQuote.set(q, []);
  for (const r of rows) {
    if (normalizeCurrencyCode(r.base) !== base) continue;
    const q = normalizeCurrencyCode(r.quote);
    const arr = byQuote.get(q);
    if (!arr) continue;
    if (Number.isFinite(r.rate) && r.rate > 0) arr.push({ date: r.date, rate: r.rate });
  }
  for (const [, arr] of byQuote) arr.sort((a, b) => a.date.localeCompare(b.date));

  const ymdMin = formatLocalYmdFromMs(tMin);
  const denom: Record<string, number> = {};
  for (const q of quotes) {
    const arr = byQuote.get(q);
    if (!arr?.length) return null;
    const d = denominatorForQuote(arr, ymdMin);
    if (d == null) return null;
    denom[q] = d;
  }

  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = tMin + (i / steps) * (tMax - tMin);
    const ymd = formatLocalYmdFromMs(t);
    let sum = 0;
    let n = 0;
    for (const q of quotes) {
      const arr = byQuote.get(q)!;
      const rt = rateOnOrBefore(arr, ymd);
      if (rt == null || rt <= 0) continue;
      sum += (100 * rt) / denom[q];
      n++;
    }
    if (n === 0) return null;
    points.push([t, sum / n]);
  }

  const label =
    quotes.length === 1 ?
      `Курс ${quotes[0]}/${base} (индекс, 100% = старт графика)`
    : `Курс средн. индекс ${quotes.join(', ')}/${base}`;

  return { label, points };
}
