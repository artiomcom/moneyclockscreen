import type { AppLocale } from './i18n/localeStorage';
import type { FxSnapshot } from './fxRates';
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

/** Курс на календарный день: последняя точка ≤ ymd, иначе ближайшая ≥ ymd, иначе последняя в ряду. */
export function fxRateForCalendarDay(
  sorted: { date: string; rate: number }[],
  ymd: string
): number | null {
  const onOrBefore = rateOnOrBefore(sorted, ymd);
  if (onOrBefore != null && onOrBefore > 0) return onOrBefore;
  const after = sorted.find((x) => x.date >= ymd);
  if (after && after.rate > 0) return after.rate;
  const last = sorted[sorted.length - 1];
  return last && last.rate > 0 ? last.rate : null;
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
  return fxRateForCalendarDay(sorted, ymdMin);
}

/**
 * Снимок курсов на календарную дату (как у open.er-api: 1 base = rates[X] единиц X),
 * только для валют из `requiredQuotes`. Нужен для пересчёта накоплений в валюту счёта
 * по курсу на дату точки графика, а не по сегодняшнему споту.
 */
export function historicalFxSnapshotForYmd(
  rows: FrankfurterRow[],
  balanceBaseRaw: string,
  ymd: string,
  requiredQuotes: readonly string[]
): FxSnapshot | null {
  const base = normalizeCurrencyCode(balanceBaseRaw);
  const quotes = [
    ...new Set(requiredQuotes.map((c) => normalizeCurrencyCode(c)).filter((c) => c !== base))
  ];
  if (quotes.length === 0) return null;

  const byQuote = new Map<string, { date: string; rate: number }[]>();
  for (const q of quotes) byQuote.set(q, []);

  for (const r of rows) {
    if (normalizeCurrencyCode(r.base) !== base) continue;
    const q = normalizeCurrencyCode(r.quote);
    const arr = byQuote.get(q);
    if (!arr) continue;
    if (Number.isFinite(r.rate) && r.rate > 0) arr.push({ date: r.date, rate: r.rate });
  }

  const rates: Record<string, number> = {};
  for (const q of quotes) {
    const arr = byQuote.get(q)!;
    if (arr.length === 0) return null;
    arr.sort((a, b) => a.date.localeCompare(b.date));
    const rt = fxRateForCalendarDay(arr, ymd);
    if (rt == null || rt <= 0) return null;
    rates[q] = rt;
  }

  return { base, rates, updatedUtc: '' };
}

/**
 * Снимок для пересчёта накоплений в валюту счёта: курс на `anchorYmd` (например дата последней зарплаты),
 * если в истории есть все нужные котировки; иначе текущий spot из `fxSnapshot`.
 */
export function fxSnapshotOrHistoricalForAnchorYmd(
  balanceBaseRaw: string,
  foreignCurrencyCodes: readonly string[],
  anchorYmd: string,
  fxSnapshot: FxSnapshot | null,
  fxHistoryRows: FrankfurterRow[] | null
): FxSnapshot | null {
  if (!fxSnapshot) return null;
  const base = normalizeCurrencyCode(balanceBaseRaw);
  const quotes = [
    ...new Set(foreignCurrencyCodes.map((c) => normalizeCurrencyCode(c)))
  ].filter((c) => c !== base);
  if (quotes.length === 0) return fxSnapshot;
  if (!fxHistoryRows?.length) return fxSnapshot;
  const hist = historicalFxSnapshotForYmd(
    fxHistoryRows,
    balanceBaseRaw,
    anchorYmd,
    quotes
  );
  return hist ?? fxSnapshot;
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
  steps: number,
  locale: AppLocale = 'en'
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

  const qList = quotes.join(', ');
  const label = (() => {
    const single = (templates: { one: string; many: string }) =>
      quotes.length === 1 ? templates.one : templates.many;
    switch (locale) {
      case 'ru':
        return single({
          one: `Курс ${quotes[0]}/${base} (индекс, 100% = старт графика)`,
          many: `Курс средн. индекс ${qList}/${base}`
        });
      case 'es':
        return single({
          one: `Tipo ${quotes[0]}/${base} (índice, 100% = inicio del gráfico)`,
          many: `Tipo índice medio ${qList}/${base}`
        });
      case 'fr':
        return single({
          one: `Taux ${quotes[0]}/${base} (indice, 100% = début du graphique)`,
          many: `Taux indice moyen ${qList}/${base}`
        });
      case 'de':
        return single({
          one: `Kurs ${quotes[0]}/${base} (Index, 100% = Diagrammstart)`,
          many: `Kurs Mittelindex ${qList}/${base}`
        });
      case 'zh':
        return single({
          one: `汇率 ${quotes[0]}/${base}（指数，100% = 图表起点）`,
          many: `汇率平均指数 ${qList}/${base}`
        });
      case 'ja':
        return single({
          one: `為替 ${quotes[0]}/${base}（指数、100% = チャート開始）`,
          many: `為替平均指数 ${qList}/${base}`
        });
      case 'pt':
        return single({
          one: `Câmbio ${quotes[0]}/${base} (índice, 100% = início do gráfico)`,
          many: `Câmbio índice médio ${qList}/${base}`
        });
      default:
        return single({
          one: `FX ${quotes[0]}/${base} (index, 100% = chart start)`,
          many: `FX mean index ${qList}/${base}`
        });
    }
  })();

  return { label, points };
}
