import { describe, expect, it } from 'vitest';
import { convertAmountThroughSnapshot } from './fxRates';
import {
  buildRelativeFxIndexSeries,
  fxSnapshotOrHistoricalForAnchorYmd,
  historicalFxSnapshotForYmd,
  minWorkStartYmdFromProjects
} from './frankfurterHistorical';
import { type ProjectEntry } from './moneyClockPersistence';

describe('frankfurterHistorical', () => {
  it('minWorkStartYmdFromProjects', () => {
    const ps: ProjectEntry[] = [
      {
        id: 'a',
        name: 'x',
        projectAmount: '1',
        projectBilling: 'monthly',
        projMonths: '0',
        projDays: '0',
        projHours: '0',
        projMinutes: '0',
        workedMonths: '0',
        workedDays: '0',
        workedHours: '0',
        workedMinutes: '0',
        workStartDate: '2020-06-01',
        projectEndDate: '',
        vacations: [],
        currencyCode: 'EUR'
      },
      {
        id: 'b',
        name: 'y',
        projectAmount: '1',
        projectBilling: 'monthly',
        projMonths: '0',
        projDays: '0',
        projHours: '0',
        projMinutes: '0',
        workedMonths: '0',
        workedDays: '0',
        workedHours: '0',
        workedMinutes: '0',
        workStartDate: '2010-01-15',
        projectEndDate: '',
        vacations: [],
        currencyCode: 'USD'
      }
    ];
    expect(minWorkStartYmdFromProjects(ps)).toBe('2010-01-15');
  });

  it('buildRelativeFxIndexSeries: на старте диапазона индекс ≈ 100', () => {
    const rows = [
      { date: '2020-01-01', base: 'EUR', quote: 'USD', rate: 1.1 },
      { date: '2020-01-02', base: 'EUR', quote: 'USD', rate: 1.2 }
    ];
    const tMin = new Date(2020, 0, 1, 12, 0, 0, 0).getTime();
    const tMax = new Date(2020, 0, 2, 12, 0, 0, 0).getTime();
    const s = buildRelativeFxIndexSeries(rows, 'EUR', ['USD'], tMin, tMax, 8);
    expect(s).not.toBeNull();
    expect(s!.points[0][1]).toBeCloseTo(100, 5);
    expect(s!.points[s!.points.length - 1][1]).toBeCloseTo((100 * 1.2) / 1.1, 5);
  });

  it('historicalFxSnapshotForYmd: пересчёт USD→RUB по курсу на дату, не по другому дню', () => {
    const rows = [
      { date: '2020-06-01', base: 'RUB', quote: 'USD', rate: 0.014 },
      { date: '2024-06-01', base: 'RUB', quote: 'USD', rate: 0.011 }
    ];
    const snapOld = historicalFxSnapshotForYmd(rows, 'RUB', '2020-06-15', ['USD']);
    const snapNew = historicalFxSnapshotForYmd(rows, 'RUB', '2024-06-15', ['USD']);
    expect(snapOld).not.toBeNull();
    expect(snapNew).not.toBeNull();
    const usd = 1000;
    const rubOld = convertAmountThroughSnapshot(usd, 'USD', 'RUB', snapOld!);
    const rubNew = convertAmountThroughSnapshot(usd, 'USD', 'RUB', snapNew!);
    expect(rubOld).not.toBeNull();
    expect(rubNew).not.toBeNull();
    expect(rubOld!).toBeCloseTo(usd / 0.014, 5);
    expect(rubNew!).toBeCloseTo(usd / 0.011, 5);
    expect(rubNew! > rubOld!).toBe(true);
  });

  it('fxSnapshotOrHistoricalForAnchorYmd: берёт историю при наличии строк', () => {
    const spot = {
      base: 'RUB',
      updatedUtc: '',
      rates: { USD: 0.009 }
    };
    const rows = [{ date: '2022-01-01', base: 'RUB', quote: 'USD', rate: 0.013 }];
    const s = fxSnapshotOrHistoricalForAnchorYmd(
      'RUB',
      ['USD'],
      '2022-01-01',
      spot,
      rows
    );
    expect(s).not.toBeNull();
    expect(s!.rates.USD).toBeCloseTo(0.013, 8);
    const s2 = fxSnapshotOrHistoricalForAnchorYmd('RUB', ['USD'], '2022-01-01', spot, []);
    expect(s2!.rates.USD).toBeCloseTo(0.009, 8);
  });
});
