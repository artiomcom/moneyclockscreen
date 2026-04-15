import { describe, expect, it } from 'vitest';
import { convertAmountThroughSnapshot, type FxSnapshot } from './fxRates';
import {
  AVERAGE_CALENDAR_MONTH_SECONDS,
  balanceOnAccountAt,
  defaultMoneyClockState,
  earningsTotalsByCurrency,
  exportMoneyClockJsonString,
  exportMoneyClockJsonCanonical,
  FTE_WORK_HOURS_PER_MONTH,
  newProject,
  parseLocalDateYmd,
  parseMoneyClockJson,
  projectEarningsAt,
  projectNominalHourlyFteInProjectCurrency,
  projectNominalMonthlyInProjectCurrency,
  projectRatePerSecond
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

describe('projectEarningsAt, monthly и contract', () => {
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

  it('projectNominalMonthlyInProjectCurrency для monthly совпадает с суммой в настройках', () => {
    const p = newProject({
      projectAmount: '15000',
      projectBilling: 'monthly',
      currencyCode: 'RUB'
    });
    expect(projectNominalMonthlyInProjectCurrency(p)).toBeCloseTo(15000, 5);
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

  it('contract: к концу срока, полная сумма контракта', () => {
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

describe('projectNominalHourlyFteInProjectCurrency (FTE 40 h/week)', () => {
  it('monthly: месячная сумма / среднее число рабочих часов в месяце', () => {
    const p = newProject({
      projectAmount: '6000',
      projectBilling: 'monthly',
      currencyCode: 'EUR'
    });
    expect(projectNominalHourlyFteInProjectCurrency(p)).toBeCloseTo(
      6000 / FTE_WORK_HOURS_PER_MONTH,
      8
    );
  });

  it('hourly: возвращает ставку за час как есть', () => {
    const p = newProject({
      projectAmount: '85',
      projectBilling: 'hourly',
      currencyCode: 'USD'
    });
    expect(projectNominalHourlyFteInProjectCurrency(p)).toBe(85);
  });

  it('contract: совпадает с projectRatePerSecond × 3600', () => {
    const p = newProject({
      workStartDate: '2025-01-01',
      projectEndDate: '2025-01-31',
      projectAmount: '6200',
      projectBilling: 'contract',
      currencyCode: 'USD'
    });
    expect(projectNominalHourlyFteInProjectCurrency(p)).toBeCloseTo(
      projectRatePerSecond(p) * 3600,
      10
    );
  });
});

describe('balanceOnAccountAt', () => {
  it('EUR на счёте + проект в USD: доначисление через convertToBalance (как главный экран с FX)', () => {
    const snap: FxSnapshot = {
      base: 'EUR',
      rates: { USD: 1.1 },
      updatedUtc: ''
    };
    const p = newProject({
      workStartDate: '2026-01-01',
      projectEndDate: '',
      projectAmount: '22000',
      projectBilling: 'monthly',
      currencyCode: 'USD'
    });
    const base = 20_500;
    const lastPay = '2026-04-09';
    const accrualStart = parseLocalDateYmd('2026-04-10')!;
    const now = accrualStart + 86400000 * 3 + 3600000;
    const withoutFx = balanceOnAccountAt([p], 'EUR', base, lastPay, now);
    expect(withoutFx).toBe(base);
    const withFx = balanceOnAccountAt(
      [p],
      'EUR',
      base,
      lastPay,
      now,
      (amt, from) => convertAmountThroughSnapshot(amt, from, 'EUR', snap)
    );
    expect(withFx).toBeGreaterThan(base + 100);
  });

  it('до начала доначисления (день после зарплаты) остаток = база, без отрицательной дельты на графике', () => {
    const p = newProject({
      name: 'E',
      workStartDate: '2024-01-01',
      projectEndDate: '',
      projectAmount: '6000',
      projectBilling: 'monthly',
      currencyCode: 'EUR'
    });
    const base = 20_000;
    const lastPay = '2025-10-01';
    const accrualStart = parseLocalDateYmd(lastPay)! + 86400000;
    const tBefore = parseLocalDateYmd('2025-08-23')!;
    const atPast = balanceOnAccountAt([p], 'EUR', base, lastPay, tBefore);
    expect(atPast).toBe(base);
    const tAfter = accrualStart + 86400000 * 7;
    const atWeekLater = balanceOnAccountAt([p], 'EUR', base, lastPay, tAfter);
    expect(atWeekLater).toBeGreaterThan(base);
  });
});

describe('exportMoneyClockJsonString', () => {
  it('produces JSON that parseMoneyClockJson accepts', () => {
    const s = defaultMoneyClockState();
    const json = exportMoneyClockJsonString(s);
    const back = parseMoneyClockJson(json);
    expect(back).not.toBeNull();
    expect(back!.projectsBundle.projects.length).toBe(s.projectsBundle.projects.length);
  });
});

describe('exportMoneyClockJsonCanonical (дедуп облака)', () => {
  it('одинаковый смысл при разном порядке ключей в profile даёт ту же строку', () => {
    const base = defaultMoneyClockState();
    const a: typeof base = {
      ...base,
      profile: { zebra: 1, apple: 2, moneyClockMeta: { b: 1, a: 2 } }
    };
    const b: typeof base = {
      ...base,
      profile: { apple: 2, zebra: 1, moneyClockMeta: { a: 2, b: 1 } }
    };
    expect(exportMoneyClockJsonCanonical(a)).toBe(exportMoneyClockJsonCanonical(b));
  });

  it('разные значения в profile дают разную строку', () => {
    const base = defaultMoneyClockState();
    const a = { ...base, profile: { name: 'A' } };
    const b = { ...base, profile: { name: 'B' } };
    expect(exportMoneyClockJsonCanonical(a)).not.toBe(exportMoneyClockJsonCanonical(b));
  });
});
