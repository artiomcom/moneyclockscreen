import { describe, expect, it } from 'vitest';
import {
  AVERAGE_CALENDAR_MONTH_SECONDS,
  earningsTotalsByCurrency,
  newProject,
  parseLocalDateYmd,
  projectEarningsAt
} from './moneyClockPersistence';

describe('earningsTotalsByCurrency (Всего заработано по валютам)', () => {
  it('пустой список проектов даёт пустую карту', () => {
    expect(earningsTotalsByCurrency([], Date.now()).size).toBe(0);
  });

  it('складывает несколько проектов в одной валюте', () => {
    const t = parseLocalDateYmd('2026-01-01')!;
    const now = t + 86400000; // сутки
    const a = newProject({
      name: 'A',
      workStartDate: '2026-01-01',
      projectEndDate: '',
      projectAmount: '1000',
      projectBilling: 'monthly',
      currencyCode: 'USD'
    });
    const b = newProject({
      name: 'B',
      workStartDate: '2026-01-01',
      projectEndDate: '',
      projectAmount: '2000',
      projectBilling: 'monthly',
      currencyCode: 'USD'
    });
    const m = earningsTotalsByCurrency([a, b], now);
    const rateA = 1000 / AVERAGE_CALENDAR_MONTH_SECONDS;
    const rateB = 2000 / AVERAGE_CALENDAR_MONTH_SECONDS;
    const expected = (rateA + rateB) * 86400;
    expect(m.size).toBe(1);
    expect(m.get('USD')).toBeCloseTo(expected, 5);
  });

  it('разносит разные валюты по разным ключам', () => {
    const t = parseLocalDateYmd('2026-01-01')!;
    const now = t + 86400000;
    const usd = newProject({
      name: 'U',
      workStartDate: '2026-01-01',
      projectEndDate: '',
      projectAmount: '3000',
      projectBilling: 'monthly',
      currencyCode: 'USD'
    });
    const eur = newProject({
      name: 'E',
      workStartDate: '2026-01-01',
      projectEndDate: '',
      projectAmount: '3000',
      projectBilling: 'monthly',
      currencyCode: 'EUR'
    });
    const m = earningsTotalsByCurrency([usd, eur], now);
    expect(m.size).toBe(2);
    expect(m.has('USD')).toBe(true);
    expect(m.has('EUR')).toBe(true);
    expect(m.get('USD')).toBeCloseTo(m.get('EUR')!, 5);
  });
});

describe('projectEarningsAt — monthly и contract', () => {
  it('monthly: за один средний календарный месяц начисляется ≈ месячная сумма', () => {
    const p = newProject({
      workStartDate: '2020-06-01',
      projectEndDate: '',
      projectAmount: '15000',
      projectBilling: 'monthly',
      currencyCode: 'RUB'
    });
    const start = parseLocalDateYmd('2020-06-01')!;
    const afterAvgMonth = start + AVERAGE_CALENDAR_MONTH_SECONDS * 1000;
    expect(projectEarningsAt(p, afterAvgMonth)).toBeCloseTo(15000, 0);
  });

  it('monthly: не использует знаменатель 22×8 ч на календарные секунды (регрессия ~4×)', () => {
    const p = newProject({
      workStartDate: '2020-06-01',
      projectEndDate: '',
      projectAmount: '10000',
      projectBilling: 'monthly',
      currencyCode: 'RUB'
    });
    const start = parseLocalDateYmd('2020-06-01')!;
    const afterAvgMonth = start + AVERAGE_CALENDAR_MONTH_SECONDS * 1000;
    const earned = projectEarningsAt(p, afterAvgMonth);
    const wrongDenominatorSeconds = 22 * 8 * 3600;
    const inflated =
      (10000 / wrongDenominatorSeconds) * AVERAGE_CALENDAR_MONTH_SECONDS;
    expect(earned).toBeCloseTo(10000, 0);
    expect(Math.abs(earned - inflated)).toBeGreaterThan(1000);
  });

  it('contract: к концу срока — полная сумма контракта', () => {
    const p = newProject({
      workStartDate: '2025-01-01',
      projectEndDate: '2025-01-31',
      projectAmount: '6200',
      projectBilling: 'contract',
      currencyCode: 'USD'
    });
    const endMs = parseLocalDateYmd('2025-02-01')!;
    expect(projectEarningsAt(p, endMs)).toBeCloseTo(6200, 0);
  });
});
