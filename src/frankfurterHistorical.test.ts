import { describe, expect, it } from 'vitest';
import { buildRelativeFxIndexSeries, minWorkStartYmdFromProjects } from './frankfurterHistorical';
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
});
