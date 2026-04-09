import { MONEYCLOCK_CURRENCIES, normalizeCurrencyCode } from './moneyClockPersistence';

export type FxSnapshot = {
  base: string;
  /** UTC-строка от API */
  updatedUtc: string;
  rates: Record<string, number>;
};

/**
 * Курсы относительно базы: 1 BASE = rates[X] единиц валюты X
 * (поле `rates` в ответе open.er-api.com v6).
 */
export async function fetchLatestFxRates(baseRaw: string): Promise<FxSnapshot | null> {
  const base = normalizeCurrencyCode(baseRaw);
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result?: string;
      time_last_update_utc?: string;
      /** v6 open.er-api.com */
      rates?: Record<string, number>;
      /** альтернативное имя в доках */
      conversion_rates?: Record<string, number>;
    };
    if (data.result !== 'success') return null;
    const table = data.rates ?? data.conversion_rates;
    if (!table || typeof table !== 'object') return null;
    return {
      base,
      updatedUtc: data.time_last_update_utc ?? '',
      rates: table
    };
  } catch {
    return null;
  }
}

export function formatFxRate(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n >= 500) return n.toFixed(2);
  if (n >= 10) return n.toFixed(3);
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(5);
}

function rateForCode(rates: Record<string, number>, code: string): number | undefined {
  const u = code.toUpperCase();
  const direct = rates[u] ?? rates[code];
  if (direct != null && Number.isFinite(direct)) return direct;
  const key = Object.keys(rates).find((k) => k.toUpperCase() === u);
  if (key == null) return undefined;
  const v = rates[key];
  return v != null && Number.isFinite(v) ? v : undefined;
}

export function fxRateLinesForAppCurrencies(snapshot: FxSnapshot): { code: string; line: string }[] {
  const out: { code: string; line: string }[] = [];
  for (const { code } of MONEYCLOCK_CURRENCIES) {
    if (code === snapshot.base) continue;
    const r = rateForCode(snapshot.rates, code);
    if (r == null) continue;
    out.push({
      code,
      line: `1 ${snapshot.base} = ${formatFxRate(r)} ${code}`
    });
  }
  return out;
}

/**
 * Перевод суммы из `fromCcy` в `toCcy` через базу API (`snapshot.base` и `snapshot.rates`):
 * 1 base = rates[X] единиц X.
 */
export function convertAmountThroughSnapshot(
  amount: number,
  fromCcy: string,
  toCcy: string,
  snapshot: FxSnapshot
): number | null {
  if (!Number.isFinite(amount)) return null;
  const from = normalizeCurrencyCode(fromCcy);
  const to = normalizeCurrencyCode(toCcy);
  if (from === to) return amount;
  const { base, rates } = snapshot;
  const unitInBase = (ccy: string): number | null => {
    if (ccy === base) return 1;
    const x = rateForCode(rates, ccy);
    if (x == null || x === 0) return null;
    return x;
  };
  let inBase: number;
  if (from === base) {
    inBase = amount;
  } else {
    const uf = unitInBase(from);
    if (uf == null) return null;
    inBase = amount / uf;
  }
  if (to === base) return inBase;
  const ut = unitInBase(to);
  if (ut == null) return null;
  return inBase * ut;
}
