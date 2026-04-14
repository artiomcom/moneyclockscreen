import { describe, expect, it } from 'vitest';
import { buildChartSeriesInsights } from './chartSeriesInsights';

const fmt = () => 'D';

describe('buildChartSeriesInsights', () => {
  it('flags FX peak when index rises well above 100%', () => {
    const t0 = Date.UTC(2020, 0, 1);
    const pts: [number, number][] = [];
    for (let i = 0; i <= 8; i++) {
      const t = t0 + i * 30 * 86400000;
      pts.push([t, 100 + i * 2.5]);
    }
    const r = buildChartSeriesInsights([{ id: 'fx', kind: 'fxHist', points: pts }], fmt, {
      maxItems: 5
    });
    expect(r.some((x) => x.key === 'chart.insight.fxPeak')).toBe(true);
  });

  it('flags FX jump when a single step is large', () => {
    const t0 = Date.UTC(2022, 0, 1);
    const pts: [number, number][] = [
      [t0, 100],
      [t0 + 86400000 * 20, 101],
      [t0 + 86400000 * 40, 118],
      [t0 + 86400000 * 60, 119]
    ];
    const r = buildChartSeriesInsights([{ id: 'fx', kind: 'fxHist', points: pts }], fmt, {
      maxItems: 5
    });
    expect(r.some((x) => x.key === 'chart.insight.fxJump')).toBe(true);
  });

  it('returns empty for short series', () => {
    const pts: [number, number][] = [
      [0, 100],
      [1, 101]
    ];
    expect(
      buildChartSeriesInsights([{ id: 'fx', kind: 'fxHist', points: pts }], fmt).length
    ).toBe(0);
  });

  it('flags inflation peak when index climbs', () => {
    const t0 = Date.UTC(2018, 0, 1);
    const pts: [number, number][] = [];
    for (let i = 0; i <= 10; i++) {
      const t = t0 + i * 40 * 86400000;
      pts.push([t, 100 + i * 3]);
    }
    const r = buildChartSeriesInsights([{ id: 'inf', kind: 'infHist', points: pts }], fmt, {
      maxItems: 5
    });
    expect(r.some((x) => x.key === 'chart.insight.infPeak')).toBe(true);
  });
});
