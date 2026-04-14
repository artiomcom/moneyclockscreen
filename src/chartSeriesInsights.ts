/** Heuristics on chart snapshot series (FX % index, inflation index) for short UI hints. */

export type ChartSeriesForInsight = {
  id: string;
  kind: 'projects' | 'balance' | 'fx' | 'fxHist' | 'infHist';
  points: [number, number][];
};

export type ChartInsightItem = {
  id: string;
  key: string;
  vars: Record<string, string | number>;
  /** Time anchor for “you’re near this event” hover hints */
  anchorMs: number;
  priority: number;
};

const FX_JUMP_MIN_PP = 5.5;
const FX_PEAK_MIN_PCT = 108;
const FX_PEAK_DELTA_MIN = 12;
const FX_TROUGH_MAX_PCT = 92;
const FX_TROUGH_DELTA_MIN = 10;

const INF_JUMP_MIN = 6;
const INF_PEAK_MIN = 112;
const INF_RANGE_MIN = 15;

function finitePairs(points: [number, number][]): { t: number; v: number }[] {
  const out: { t: number; v: number }[] = [];
  for (const [t, v] of points) {
    if (Number.isFinite(t) && Number.isFinite(v)) out.push({ t, v });
  }
  return out;
}

function largestStep(pts: { t: number; v: number }[]): {
  tEnd: number;
  delta: number;
  fromV: number;
  toV: number;
} | null {
  if (pts.length < 2) return null;
  let best = { tEnd: pts[1]!.t, delta: 0, fromV: pts[0]!.v, toV: pts[1]!.v };
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const d = Math.abs(b.v - a.v);
    if (d > best.delta) best = { tEnd: b.t, delta: d, fromV: a.v, toV: b.v };
  }
  return best.delta > 0 ? best : null;
}

function extrema(pts: { t: number; v: number }[]): {
  maxT: number;
  maxV: number;
  minT: number;
  minV: number;
} | null {
  if (pts.length === 0) return null;
  let maxT = pts[0]!.t;
  let maxV = pts[0]!.v;
  let minT = pts[0]!.t;
  let minV = pts[0]!.v;
  for (const p of pts) {
    if (p.v > maxV) {
      maxV = p.v;
      maxT = p.t;
    }
    if (p.v < minV) {
      minV = p.v;
      minT = p.t;
    }
  }
  return { maxT, maxV, minT, minV };
}

/**
 * Builds up to `maxItems` insight lines from fxHist / infHist snapshots already on the chart.
 */
export function buildChartSeriesInsights(
  items: readonly ChartSeriesForInsight[],
  formatDate: (ms: number) => string,
  options?: { maxItems?: number }
): ChartInsightItem[] {
  const maxItems = options?.maxItems ?? 3;
  const collected: ChartInsightItem[] = [];

  for (const s of items) {
    if (s.kind !== 'fxHist' && s.kind !== 'infHist') continue;
    const pts = finitePairs(s.points);
    if (pts.length < 4) continue;

    const step = largestStep(pts);
    const ex = extrema(pts);
    if (!ex) continue;

    if (s.kind === 'fxHist') {
      const v0 = pts[0]!.v;
      const jump = step && step.delta >= FX_JUMP_MIN_PP ? step : null;
      if (jump) {
        collected.push({
          id: `${s.id}-fx-jump`,
          key: 'chart.insight.fxJump',
          vars: {
            delta: jump.delta.toFixed(1),
            date: formatDate(jump.tEnd)
          },
          anchorMs: jump.tEnd,
          priority: 100
        });
      }
      if (ex.maxV >= FX_PEAK_MIN_PCT || ex.maxV - v0 >= FX_PEAK_DELTA_MIN) {
        collected.push({
          id: `${s.id}-fx-peak`,
          key: 'chart.insight.fxPeak',
          vars: {
            pct: ex.maxV.toFixed(1),
            date: formatDate(ex.maxT)
          },
          anchorMs: ex.maxT,
          priority: 82
        });
      }
      if (ex.minV <= FX_TROUGH_MAX_PCT || v0 - ex.minV >= FX_TROUGH_DELTA_MIN) {
        collected.push({
          id: `${s.id}-fx-trough`,
          key: 'chart.insight.fxTrough',
          vars: {
            pct: ex.minV.toFixed(1),
            date: formatDate(ex.minT)
          },
          anchorMs: ex.minT,
          priority: 76
        });
      }
    } else {
      const v0 = pts[0]!.v;
      const jump = step && step.delta >= INF_JUMP_MIN ? step : null;
      if (jump) {
        collected.push({
          id: `${s.id}-inf-jump`,
          key: 'chart.insight.infJump',
          vars: {
            delta: jump.delta.toFixed(1),
            date: formatDate(jump.tEnd)
          },
          anchorMs: jump.tEnd,
          priority: 96
        });
      }
      const span = ex.maxV - ex.minV;
      if (ex.maxV >= INF_PEAK_MIN || span >= INF_RANGE_MIN) {
        collected.push({
          id: `${s.id}-inf-peak`,
          key: 'chart.insight.infPeak',
          vars: {
            idx: ex.maxV.toFixed(0),
            date: formatDate(ex.maxT)
          },
          anchorMs: ex.maxT,
          priority: 72 + (ex.maxV - v0 >= 20 ? 4 : 0)
        });
      }
    }
  }

  collected.sort((a, b) => b.priority - a.priority);

  const seen = new Set<string>();
  const out: ChartInsightItem[] = [];
  for (const c of collected) {
    const dedupeKey = `${c.key}|${c.vars.date}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push(c);
    if (out.length >= maxItems) break;
  }
  return out;
}
