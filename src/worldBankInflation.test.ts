import { describe, expect, it } from 'vitest';
import {
  blendInflationIndices,
  annualRatesByCountryFromWbRows,
  inflationIndexSeriesPoints,
  priceLevelIndexByYear,
  worldBankCountryForCurrency
} from './worldBankInflation';

describe('worldBankInflation', () => {
  it('worldBankCountryForCurrency: EUR→DEU (WB EMU без CPI по этому индикатору), MDL→MDA', () => {
    expect(worldBankCountryForCurrency('EUR')).toBe('DEU');
    expect(worldBankCountryForCurrency('MDL')).toBe('MDA');
    // неизвестный код в приложении нормализуется к USD → маппинг USA
    expect(worldBankCountryForCurrency('ZZZ')).toBe('USA');
  });

  it('priceLevelIndexByYear: 2 года по 10% → 110 затем 121', () => {
    const m = new Map<number, number>([
      [2020, 10],
      [2021, 10]
    ]);
    const idx = priceLevelIndexByYear(m, 2020, 2022);
    expect(idx.get(2020)).toBe(100);
    expect(idx.get(2021)).toBeCloseTo(110, 5);
    expect(idx.get(2022)).toBeCloseTo(121, 5);
  });

  it('blendInflationIndices усредняет две экономики', () => {
    const rows = [
      { countryiso3code: 'USA', date: '2020', value: 0 },
      { countryiso3code: 'USA', date: '2021', value: 10 },
      { countryiso3code: 'GBR', date: '2020', value: 0 },
      { countryiso3code: 'GBR', date: '2021', value: 0 }
    ];
    const by = annualRatesByCountryFromWbRows(rows);
    const blend = blendInflationIndices(by, ['USA', 'GBR'], 2020, 2022);
    const y2021 = blend.find((x) => x.year === 2021)?.index;
    const y2022 = blend.find((x) => x.year === 2022)?.index;
    expect(y2021).toBeCloseTo(100, 5);
    expect(y2022).toBeCloseTo(105, 5);
  });

  it('inflationIndexSeriesPoints возвращает ступени по годам', () => {
    const pts = inflationIndexSeriesPoints(
      [
        { year: 2020, index: 100 },
        { year: 2021, index: 110 }
      ],
      new Date(2020, 5, 1).getTime(),
      new Date(2021, 5, 1).getTime(),
      4
    );
    expect(pts).not.toBeNull();
    expect(pts![0][1]).toBe(100);
    expect(pts![pts!.length - 1][1]).toBe(110);
  });
});
