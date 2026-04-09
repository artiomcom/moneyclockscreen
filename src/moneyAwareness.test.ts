import { describe, expect, it } from 'vitest';
import {
  illustrativePercentileFromEurPerSec,
  buildMoneyAwarenessShareLines
} from './moneyAwareness';

describe('moneyAwareness', () => {
  it('illustrativePercentileFromEurPerSec растёт с доходом и даёт ~72 около 75k€/год', () => {
    const sec75k = 75_000 / (365.25 * 86400);
    const pLow = illustrativePercentileFromEurPerSec(sec75k * 0.5);
    const pMid = illustrativePercentileFromEurPerSec(sec75k);
    const pHigh = illustrativePercentileFromEurPerSec(sec75k * 2);
    expect(pMid).toBeGreaterThanOrEqual(68);
    expect(pMid).toBeLessThanOrEqual(76);
    expect(pLow).toBeLessThan(pMid);
    expect(pHigh).toBeGreaterThan(pMid);
  });

  it('buildMoneyAwarenessShareLines включает ставку и процентиль', () => {
    const { ru, en } = buildMoneyAwarenessShareLines({
      ratePerSec: 0.004,
      currencySymbol: '€',
      currencyCode: 'EUR',
      demoPercentile: 72
    });
    expect(ru).toContain('0.004');
    expect(ru).toContain('72');
    expect(en).toMatch(/sec/i);
    expect(en).toContain('72');
  });
});
