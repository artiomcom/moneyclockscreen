import { describe, expect, it } from 'vitest';
import {
  earningsTotalsByCurrency,
  parseLocalDateYmd,
  type ProjectEntry
} from './moneyClockPersistence';

/**
 * Упрощённая копия проектов из профиля (10 шт., валюты USD/EUR/RUB).
 * Момент «сейчас»: 2026-04-09 12:00 в TZ из vitest.setup (UTC).
 */
function userProfileLikeProjects(): ProjectEntry[] {
  return [
    {
      id: 'p-napier-aml',
      name: 'Napier Technologies',
      projectAmount: '6600',
      projectBilling: 'monthly',
      projMonths: '46',
      projDays: '0',
      projHours: '0',
      projMinutes: '0',
      workedMonths: '0',
      workedDays: '0',
      workedHours: '0',
      workedMinutes: '0',
      workStartDate: '2022-06-01',
      projectEndDate: '',
      vacations: [{ id: '4fa6c670-6300-4ff0-a1bd-1f7c058166c7', startDate: '', endDate: '' }],
      currencyCode: 'USD'
    },
    {
      id: 'p-skilltools',
      name: 'Netco',
      projectAmount: '6300',
      projectBilling: 'monthly',
      projMonths: '46',
      projDays: '0',
      projHours: '0',
      projMinutes: '0',
      workedMonths: '0',
      workedDays: '0',
      workedHours: '0',
      workedMinutes: '0',
      workStartDate: '2026-01-05',
      projectEndDate: '',
      vacations: [],
      currencyCode: 'EUR'
    },
    {
      id: 'p-x5-group',
      name: 'X5 Group',
      projectAmount: '220000',
      projectBilling: 'monthly',
      projMonths: '25',
      projDays: '0',
      projHours: '0',
      projMinutes: '0',
      workedMonths: '0',
      workedDays: '0',
      workedHours: '0',
      workedMinutes: '0',
      workStartDate: '2020-03-01',
      projectEndDate: '2022-03-31',
      vacations: [],
      currencyCode: 'RUB'
    },
    {
      id: 'p-sberbank',
      name: 'Sberbank',
      projectAmount: '180000',
      projectBilling: 'monthly',
      projMonths: '16',
      projDays: '0',
      projHours: '0',
      projMinutes: '0',
      workedMonths: '0',
      workedDays: '0',
      workedHours: '0',
      workedMinutes: '0',
      workStartDate: '2018-12-01',
      projectEndDate: '2020-03-31',
      vacations: [],
      currencyCode: 'RUB'
    },
    {
      id: 'p-x5-retail',
      name: 'X5 Retail Group',
      projectAmount: '170000',
      projectBilling: 'monthly',
      projMonths: '34',
      projDays: '0',
      projHours: '0',
      projMinutes: '0',
      workedMonths: '0',
      workedDays: '0',
      workedHours: '0',
      workedMinutes: '0',
      workStartDate: '2016-03-01',
      projectEndDate: '2018-12-31',
      vacations: [],
      currencyCode: 'RUB'
    },
    {
      id: 'p-afrpplus',
      name: 'Afrpplus',
      projectAmount: '1200',
      projectBilling: 'contract',
      projMonths: '17',
      projDays: '0',
      projHours: '0',
      projMinutes: '0',
      workedMonths: '0',
      workedDays: '0',
      workedHours: '0',
      workedMinutes: '0',
      workStartDate: '2016-08-01',
      projectEndDate: '2017-12-31',
      vacations: [],
      currencyCode: 'USD'
    },
    {
      id: 'p-kjw-aerocon',
      name: 'KJW AEROCON LIMITED',
      projectAmount: '1000000',
      projectBilling: 'contract',
      projMonths: '51',
      projDays: '0',
      projHours: '0',
      projMinutes: '0',
      workedMonths: '0',
      workedDays: '0',
      workedHours: '0',
      workedMinutes: '0',
      workStartDate: '2012-06-01',
      projectEndDate: '2016-09-30',
      vacations: [],
      currencyCode: 'RUB'
    },
    {
      id: 'p-mniti',
      name: 'MNITI',
      projectAmount: '78000',
      projectBilling: 'monthly',
      projMonths: '16',
      projDays: '0',
      projHours: '0',
      projMinutes: '0',
      workedMonths: '0',
      workedDays: '0',
      workedHours: '0',
      workedMinutes: '0',
      workStartDate: '2014-09-01',
      projectEndDate: '2015-12-31',
      vacations: [],
      currencyCode: 'RUB'
    },
    {
      id: 'p-pays-de-retz',
      name: 'PAYS DE RETZ ENERGIES',
      projectAmount: '32000',
      projectBilling: 'monthly',
      projMonths: '49',
      projDays: '0',
      projHours: '0',
      projMinutes: '0',
      workedMonths: '0',
      workedDays: '0',
      workedHours: '0',
      workedMinutes: '0',
      workStartDate: '2010-10-01',
      projectEndDate: '2014-10-31',
      vacations: [],
      currencyCode: 'RUB'
    },
    {
      id: 'p-auto-mall',
      name: 'AUTO MALL SRL',
      projectAmount: '300',
      projectBilling: 'monthly',
      projMonths: '',
      projDays: '0',
      projHours: '0',
      projMinutes: '0',
      workedMonths: '0',
      workedDays: '0',
      workedHours: '0',
      workedMinutes: '0',
      workStartDate: '2009-01-01',
      projectEndDate: '2010-06-30',
      vacations: [],
      currencyCode: 'USD'
    }
  ];
}

describe('Фикстура профиля: «Всего заработано» по валютам', () => {
  const asOfMs = parseLocalDateYmd('2026-04-09')! + 12 * 3600000;

  it('сумма только по RUB-проектам (6 шт.)', () => {
    const all = userProfileLikeProjects();
    const rubOnly = all.filter((p) => p.currencyCode === 'RUB');
    const rub = earningsTotalsByCurrency(rubOnly, asOfMs).get('RUB');
    expect(rub).toBeDefined();
    expect(rub!).toBeCloseTo(17_983_326.488706, 3);
  });

  it('полный набор 10 проектов: RUB / USD / EUR', () => {
    const totals = earningsTotalsByCurrency(userProfileLikeProjects(), asOfMs);
    expect(totals.get('RUB')).toBeCloseTo(17_983_326.488706, 3);
    expect(totals.get('USD')).toBeCloseTo(311_997.535934, 3);
    expect(totals.get('EUR')).toBeCloseTo(19_559.753593, 3);
  });
});
