import { normalizeCurrencyCode } from './moneyClockPersistence';

/**
 * Валюта → код страны/региона World Bank (CPI годовой, %).
 * Инфляция привязана к экономике, не к ISO валюте напрямую.
 */
export const CURRENCY_TO_WB_COUNTRY: Readonly<Record<string, string>> = {
  USD: 'USA',
  /** WB aggregate EMU (XC) часто без значений по FP.CPI.TOTL.ZG — берём DEU как прокси еврозоны. */
  EUR: 'DEU',
  GBP: 'GBR',
  JPY: 'JPN',
  CHF: 'CHE',
  CAD: 'CAN',
  AUD: 'AUS',
  CNY: 'CHN',
  HKD: 'HKG',
  SGD: 'SGP',
  KRW: 'KOR',
  INR: 'IND',
  BRL: 'BRA',
  MXN: 'MEX',
  TRY: 'TUR',
  PLN: 'POL',
  RON: 'ROU',
  RUB: 'RUS',
  UAH: 'UKR',
  MDL: 'MDA',
  SEK: 'SWE',
  NOK: 'NOR',
  DKK: 'DNK',
  CZK: 'CZE',
  HUF: 'HUN',
  ILS: 'ISR',
  ZAR: 'ZAF',
  THB: 'THA',
  MYR: 'MYS',
  IDR: 'IDN',
  PHP: 'PHL',
  NZD: 'NZL'
};

export function worldBankCountryForCurrency(ccyRaw: string): string | null {
  const c = normalizeCurrencyCode(ccyRaw);
  return CURRENCY_TO_WB_COUNTRY[c] ?? null;
}

/** Валюты из списка, для которых есть маппинг WB (уникальные страны для запроса). */
export function worldBankCountriesForCurrencies(currencies: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of currencies) {
    const wb = worldBankCountryForCurrency(raw);
    if (wb && !seen.has(wb)) {
      seen.add(wb);
      out.push(wb);
    }
  }
  return out;
}

type WbRow = {
  countryiso3code: string;
  date: string;
  value: number | null;
};

function parseWbJson(data: unknown): WbRow[] {
  if (!Array.isArray(data) || data.length < 2) return [];
  const second = data[1];
  if (!Array.isArray(second)) return [];
  return second.filter(
    (x): x is WbRow =>
      x != null &&
      typeof x === 'object' &&
      typeof (x as WbRow).countryiso3code === 'string' &&
      typeof (x as WbRow).date === 'string'
  );
}

/** Год → годовая инфляция % (может быть null). */
export function annualRatesByCountryFromWbRows(rows: WbRow[]): Map<string, Map<number, number | null>> {
  const byCountry = new Map<string, Map<number, number | null>>();
  for (const r of rows) {
    const c = r.countryiso3code;
    if (!c) continue;
    const y = parseInt(r.date, 10);
    if (!Number.isFinite(y)) continue;
    if (!byCountry.has(c)) byCountry.set(c, new Map());
    const m = byCountry.get(c)!;
    m.set(y, r.value != null && Number.isFinite(r.value) ? r.value : null);
  }
  return byCountry;
}

/** Заполнить пропуски: назад от первой точки и вперёд от последней. */
function fillRatesBothWays(
  yearToRate: Map<number, number | null>,
  yMin: number,
  yMax: number
): Map<number, number> {
  const out = new Map<number, number>();
  let first: number | null = null;
  for (let y = yMin; y <= yMax; y++) {
    const v = yearToRate.get(y);
    if (v != null && Number.isFinite(v)) {
      first = v;
      break;
    }
  }
  if (first == null) return out;
  let last = first;
  for (let y = yMin; y <= yMax; y++) {
    const v = yearToRate.get(y);
    if (v != null && Number.isFinite(v)) last = v;
    out.set(y, last);
  }
  return out;
}

/**
 * Индекс уровня цен на 1 янв. года Y: 100 на yStart, далее цепочка (1+π/100) по годам.
 */
export function priceLevelIndexByYear(
  yearToRateFilled: Map<number, number>,
  yStart: number,
  yEnd: number
): Map<number, number> {
  const idx = new Map<number, number>();
  idx.set(yStart, 100);
  let cur = 100;
  for (let y = yStart; y < yEnd; y++) {
    const pi = yearToRateFilled.get(y);
    if (pi == null) {
      idx.set(y + 1, cur);
      continue;
    }
    cur *= 1 + pi / 100;
    idx.set(y + 1, cur);
  }
  return idx;
}

export type BlendedInflationYear = { year: number; index: number };

/**
 * Средний индекс CPI по выбранным экономикам; у каждой страны свой индекс с 100 на yStart, затем среднее по годам.
 */
export function blendInflationIndices(
  byCountryRaw: Map<string, Map<number, number | null>>,
  countries: readonly string[],
  yStart: number,
  yEnd: number
): BlendedInflationYear[] {
  if (countries.length === 0 || yEnd < yStart) return [];

  const perCountry: Map<number, number>[] = [];
  for (const code of countries) {
    const raw = byCountryRaw.get(code);
    if (!raw || raw.size === 0) continue;
    const filled = fillRatesBothWays(raw, yStart, yEnd);
    if (filled.size === 0) continue;
    const idxMap = priceLevelIndexByYear(filled, yStart, yEnd);
    perCountry.push(idxMap);
  }
  if (perCountry.length === 0) return [];

  const out: BlendedInflationYear[] = [];
  for (let y = yStart; y <= yEnd; y++) {
    let sum = 0;
    let n = 0;
    for (const m of perCountry) {
      const v = m.get(y);
      if (v != null && Number.isFinite(v)) {
        sum += v;
        n++;
      }
    }
    if (n > 0) out.push({ year: y, index: sum / n });
  }
  return out;
}

const CACHE_PREFIX = 'moneyclock-wb-cpi-v1-';
const CACHE_TTL_MS = 7 * 24 * 3600 * 1000;

export async function fetchWorldBankInflationRows(
  countries: string[],
  startYear: number,
  endYear: number,
  opts?: { signal?: AbortSignal }
): Promise<WbRow[]> {
  if (countries.length === 0 || endYear < startYear) return [];
  const sorted = [...countries].sort().join(',');
  const cacheKey = `${CACHE_PREFIX}${sorted}|${startYear}|${endYear}`;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const parsed = JSON.parse(raw) as { at?: number; rows?: WbRow[] };
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

  const enc = countries.join(';');
  const url = `https://api.worldbank.org/v2/country/${enc}/indicator/FP.CPI.TOTL.ZG?format=json&date=${startYear}:${endYear}&per_page=2000`;
  const res = await fetch(url, { signal: opts?.signal });
  if (!res.ok) throw new Error(`World Bank ${res.status}`);
  const data = (await res.json()) as unknown;
  const rows = parseWbJson(data);
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), rows }));
  } catch {
    /* quota */
  }
  return rows;
}

export async function fetchBlendedInflationYearly(
  currencyCodes: readonly string[],
  startYear: number,
  endYear: number,
  opts?: { signal?: AbortSignal }
): Promise<BlendedInflationYear[] | null> {
  const countries = worldBankCountriesForCurrencies(currencyCodes);
  if (countries.length === 0 || endYear < startYear) return null;
  try {
    const rows = await fetchWorldBankInflationRows(countries, startYear, endYear, opts);
    if (rows.length === 0) return null;
    const byCountry = annualRatesByCountryFromWbRows(rows);
    const blend = blendInflationIndices(byCountry, countries, startYear, endYear);
    return blend.length > 0 ? blend : null;
  } catch {
    return null;
  }
}

/** Построить сглаженную линию индекса на отрезке графика (годовые шаги). */
export function inflationIndexSeriesPoints(
  yearly: BlendedInflationYear[],
  tMin: number,
  tMax: number,
  steps: number
): [number, number][] | null {
  if (yearly.length === 0 || tMax <= tMin || steps < 1) return null;
  const sorted = [...yearly].sort((a, b) => a.year - b.year);
  const yFirst = sorted[0].year;
  const yLast = sorted[sorted.length - 1].year;

  const indexAtYear = (y: number): number => {
    if (y <= yFirst) return sorted[0].index;
    if (y >= yLast) return sorted[sorted.length - 1].index;
    let best = sorted[0].index;
    for (const row of sorted) {
      if (row.year <= y) best = row.index;
      else break;
    }
    return best;
  };

  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = tMin + (i / steps) * (tMax - tMin);
    const y = new Date(t).getFullYear();
    points.push([t, indexAtYear(y)]);
  }
  return points;
}

export function inflationChartLabel(
  currencies: string[],
  locale: 'en' | 'ru' = 'en'
): string {
  const uniq = [...new Set(currencies.map((c) => normalizeCurrencyCode(c)))].sort();
  const short = uniq.slice(0, 4).join(', ');
  const more = uniq.length > 4 ? ` +${uniq.length - 4}` : '';
  return locale === 'ru' ?
      `Инфляция CPI (средн., ${short}${more}) · индекс 100 = начало года старта`
    : `Inflation CPI (blend, ${short}${more}) · index 100 = start year Jan 1`;
}
