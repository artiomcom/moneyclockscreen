import { describe, expect, it } from 'vitest';
import { computeRealEarningsRateBreakdown } from './realEarningsRate';

describe('computeRealEarningsRateBreakdown', () => {
  it('номинал и после налогов: 1 €/ч при ставке 1/3600 €/с и доле 0.5', () => {
    const r = computeRealEarningsRateBreakdown(1 / 3600, 0.5, null);
    expect(r.nominalPerHour).toBeCloseTo(1, 8);
    expect(r.afterTaxPerHour).toBeCloseTo(0.5, 8);
    expect(r.purchasingPowerPerHour).toBeNull();
  });

  it('при двух точках CPI покупательская способность = afterTax / (1 + π)', () => {
    const inflation = [
      { year: 2023, index: 100 },
      { year: 2024, index: 110 }
    ];
    const r = computeRealEarningsRateBreakdown(10 / 3600, 1, inflation);
    expect(r.nominalPerHour).toBeCloseTo(10, 8);
    expect(r.afterTaxPerHour).toBeCloseTo(10, 8);
    expect(r.inflationYoYFraction).toBeCloseTo(0.1, 8);
    expect(r.purchasingPowerPerHour).toBeCloseTo(10 / 1.1, 8);
    expect(r.inflationEndYear).toBe(2024);
  });

  it('меньше двух годов — без поправки на инфляцию', () => {
    const r = computeRealEarningsRateBreakdown(1, 1, [{ year: 2024, index: 105 }]);
    expect(r.purchasingPowerPerHour).toBeNull();
    expect(r.inflationYoYFraction).toBeNull();
  });

  it('некорректная доля приводится к диапазону (через clamp)', () => {
    const r = computeRealEarningsRateBreakdown(3600 / 3600, 2, null);
    expect(r.afterTaxPerHour).toBeCloseTo(3600, 8);
    const r2 = computeRealEarningsRateBreakdown(3600 / 3600, -1, null);
    expect(r2.afterTaxPerHour).toBe(0);
  });
});
