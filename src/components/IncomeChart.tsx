import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2, Minimize2, XIcon } from 'lucide-react';
import { useI18n } from '../i18n';
import {
  type ProjectEntry,
  projectEarningsAt,
  parseLocalDateYmd,
  normalizeCurrencyCode,
  getCurrencySymbol,
  balanceOnAccountAt,
  projectIsEndedByDeadline
} from '../moneyClockPersistence';
import {
  convertAmountThroughSnapshot,
  type FxSnapshot
} from '../fxRates';
import {
  buildRelativeFxIndexSeries,
  frankfurterQuoteCurrencies,
  type FrankfurterRow
} from '../frankfurterHistorical';
import {
  inflationChartLabel,
  inflationIndexSeriesPoints,
  type BlendedInflationYear
} from '../worldBankInflation';
import { intlLocaleTag } from '../i18n/localeMeta';

export const INCOME_CHART_STEPS = 64;
const STEPS = INCOME_CHART_STEPS;
const HOVER_HIT_PX = 24;
const VB_W = 520;
const VB_H = 248;
const PAD_L = 58;
const PAD_R = 16;
const PAD_T = 20;
const PAD_B = 52;
const DAY_MS = 86400000;

type Series = {
  id: string;
  code: string;
  label: string;
  points: [number, number][];
  kind: 'projects' | 'balance' | 'fx' | 'fxHist' | 'infHist';
  /** Фоновые серии в режиме «одна компания» */
  muted?: boolean;
};

export type ChartSeriesLabels = {
  defaultProject: string;
  others: string;
  projects: string;
  account: string;
  allFx: string;
};

const LINE_COLORS = ['#ffffff', '#fef9c3', '#bbf7d0', '#a5f3fc', '#e9d5ff'];
const BALANCE_LINE = '#fde68a';
const FX_MERGE_LINE = '#fb7185';
const FX_HIST_LINE = '#38bdf8';
const INF_HIST_LINE = '#fb923c';
const FOCUS_PROJECT_LINE = '#fef08a';
const MUTED_PROJECT_LINE = 'rgba(203, 213, 225, 0.42)';
const PRODUCT_YOU_LINE = '#34d399';
const PRODUCT_TREND_LINE = 'rgba(255, 255, 255, 0.38)';

export function getIncomeChartTimeRange(
  projects: ProjectEntry[],
  nowMs: number
): { tMin: number; tMax: number } | null {
  if (projects.length === 0) return null;
  const starts = projects
    .map((p) => (p.workStartDate.trim() ? parseLocalDateYmd(p.workStartDate) : null))
    .filter((t): t is number => t != null);
  if (starts.length === 0) return null;
  const tMin = Math.min(...starts);
  const tMax = nowMs > tMin ? nowMs : tMin + DAY_MS;
  return { tMin, tMax };
}

function strokeColorForSeries(all: Series[], s: Series, idx: number): string {
  if (s.kind === 'balance') return s.muted ? 'rgba(253, 230, 138, 0.42)' : BALANCE_LINE;
  if (s.kind === 'fx') return FX_MERGE_LINE;
  if (s.kind === 'fxHist') return FX_HIST_LINE;
  if (s.kind === 'infHist') return INF_HIST_LINE;
  if (s.muted) return MUTED_PROJECT_LINE;
  if (s.id.startsWith('proj-focus-')) return FOCUS_PROJECT_LINE;
  const n = all.slice(0, idx).filter((x) => x.kind === 'projects' && !x.muted).length;
  return LINE_COLORS[n % LINE_COLORS.length];
}

function chartLabelFromProjectName(
  name: string,
  defaultName: string,
  maxLen = 22
): string {
  const n = name.trim() || defaultName;
  return n.length > maxLen ? `${n.slice(0, maxLen - 1)}…` : n;
}

function buildIncomeSeries(
  projects: ProjectEntry[],
  nowMs: number,
  balanceInput?: {
    amount: number;
    currency: string;
    lastPayrollYmd: string;
  },
  fxMerge?: { snapshot: FxSnapshot; targetCode: string } | null,
  focusProjectId?: string | null,
  chartLabels?: ChartSeriesLabels,
  /** Optional view window (e.g. last 1Y). Clamped to data range. */
  viewWindow?: { tMin: number; tMax: number } | null
): { series: Series[]; tMin: number; tMax: number } {
  const L: ChartSeriesLabels = chartLabels ?? {
    defaultProject: 'Project',
    others: 'others',
    projects: 'projects',
    account: 'account',
    allFx: 'all (FX)'
  };
  const range = getIncomeChartTimeRange(projects, nowMs);
  if (!range) {
    return { series: [], tMin: 0, tMax: 0 };
  }
  let { tMin, tMax } = range;
  if (viewWindow) {
    tMin = Math.max(tMin, viewWindow.tMin);
    tMax = Math.min(tMax, viewWindow.tMax);
  }
  if (tMax <= tMin) {
    return { series: [], tMin: 0, tMax: 0 };
  }

  const byCcy = new Map<string, ProjectEntry[]>();
  for (const p of projects) {
    const c = normalizeCurrencyCode(p.currencyCode);
    if (!byCcy.has(c)) byCcy.set(c, []);
    byCcy.get(c)!.push(p);
  }

  const series: Series[] = [];
  const focus =
    focusProjectId ?
      projects.find((p) => p.id === focusProjectId) ?? null
    : null;

  if (focus) {
    const fCode = normalizeCurrencyCode(focus.currencyCode);
    const heroPoints: [number, number][] = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = tMin + (i / STEPS) * (tMax - tMin);
      heroPoints.push([t, projectEarningsAt(focus, t)]);
    }
    series.push({
      id: `proj-focus-${focus.id}`,
      code: fCode,
      label: `${chartLabelFromProjectName(focus.name, L.defaultProject)} · ${fCode}`,
      points: heroPoints,
      kind: 'projects',
      muted: false
    });

    for (const [, plist] of byCcy) {
      const others = plist.filter((p) => p.id !== focus.id);
      if (others.length === 0) continue;
      const points: [number, number][] = [];
      for (let i = 0; i <= STEPS; i++) {
        const t = tMin + (i / STEPS) * (tMax - tMin);
        let y = 0;
        for (const p of others) {
          y += projectEarningsAt(p, t);
        }
        points.push([t, y]);
      }
      const code = normalizeCurrencyCode(plist[0]?.currencyCode ?? 'USD');
      series.push({
        id: `proj-muted-${code}`,
        code,
        label: `${code} · ${L.others}`,
        points,
        kind: 'projects',
        muted: true
      });
    }

    series.sort((a, b) => {
      if (a.id.startsWith('proj-focus-')) return -1;
      if (b.id.startsWith('proj-focus-')) return 1;
      return a.code.localeCompare(b.code);
    });
  } else {
    for (const [, plist] of byCcy) {
      const points: [number, number][] = [];
      for (let i = 0; i <= STEPS; i++) {
        const t = tMin + (i / STEPS) * (tMax - tMin);
        let y = 0;
        for (const p of plist) {
          y += projectEarningsAt(p, t);
        }
        points.push([t, y]);
      }
      const code = normalizeCurrencyCode(plist[0]?.currencyCode ?? 'USD');
      series.push({
        id: `proj-${code}`,
        code,
        label: `${code} · ${L.projects}`,
        points,
        kind: 'projects'
      });
    }

    series.sort((a, b) => a.code.localeCompare(b.code));
  }

  const payOk =
    balanceInput &&
    parseLocalDateYmd(balanceInput.lastPayrollYmd.trim()) != null;

  if (payOk && balanceInput) {
    const bCode = normalizeCurrencyCode(balanceInput.currency);
    const balPoints: [number, number][] = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = tMin + (i / STEPS) * (tMax - tMin);
      const y = balanceOnAccountAt(
        projects,
        balanceInput.currency,
        balanceInput.amount,
        balanceInput.lastPayrollYmd,
        t
      );
      balPoints.push([t, y]);
    }
    series.push({
      id: `bal-${bCode}`,
      code: bCode,
      label: `${bCode} · ${L.account}`,
      points: balPoints,
      kind: 'balance',
      muted: Boolean(focus)
    });
  }

  if (fxMerge && projects.length > 0 && !focus) {
    const target = normalizeCurrencyCode(fxMerge.targetCode);
    const fxPoints: [number, number][] = [];
    let ok = true;
    for (let i = 0; i <= STEPS; i++) {
      const t = tMin + (i / STEPS) * (tMax - tMin);
      let sum = 0;
      for (const p of projects) {
        const raw = projectEarningsAt(p, t);
        const c = convertAmountThroughSnapshot(
          raw,
          p.currencyCode,
          target,
          fxMerge.snapshot
        );
        if (c == null) {
          ok = false;
          break;
        }
        sum += c;
      }
      if (!ok) break;
      fxPoints.push([t, sum]);
    }
    if (ok && fxPoints.length === STEPS + 1) {
      series.push({
        id: `fx-${target}`,
        code: target,
        label: `${target} · ${L.allFx}`,
        points: fxPoints,
        kind: 'fx'
      });
    }
  }

  return { series, tMin, tMax };
}

/** Cumulative contract earnings in account currency (FX) or only balance-ccy projects without FX. */
function buildMergedEarningsPoints(
  projects: ProjectEntry[],
  tMin: number,
  tMax: number,
  steps: number,
  fxSnapshot: FxSnapshot | null,
  balanceCurrency: string
): { points: [number, number][]; code: string } | null {
  if (tMax <= tMin || projects.length === 0) return null;
  const target = normalizeCurrencyCode(balanceCurrency);
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = tMin + (i / steps) * (tMax - tMin);
    let sum = 0;
    if (fxSnapshot) {
      let ok = true;
      for (const p of projects) {
        const raw = projectEarningsAt(p, t);
        const c = convertAmountThroughSnapshot(
          raw,
          p.currencyCode,
          target,
          fxSnapshot
        );
        if (c == null) {
          ok = false;
          break;
        }
        sum += c;
      }
      if (!ok) return null;
    } else {
      const filtered = projects.filter(
        (p) => normalizeCurrencyCode(p.currencyCode) === target
      );
      if (filtered.length === 0) return null;
      for (const p of filtered) {
        sum += projectEarningsAt(p, t);
      }
    }
    points.push([t, sum]);
  }
  return { points, code: target };
}

function linearTrendFromPoints(
  points: [number, number][]
): { trend: [number, number][]; yEndActual: number; yEndPred: number } {
  const n = points.length;
  if (n < 2) {
    const y = points[0]?.[1] ?? 0;
    return { trend: points.map(([t]) => [t, y]), yEndActual: y, yEndPred: y };
  }
  const t0 = points[0][0];
  const t1 = points[n - 1][0];
  const span = t1 - t0 || 1;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (const [t, y] of points) {
    const x = (t - t0) / span;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }
  const denom = n * sumXX - sumX * sumX;
  const b = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
  const a = (sumY - b * sumX) / n;
  const trend = points.map(([t]) => {
    const x = (t - t0) / span;
    return [t, a + b * x] as [number, number];
  });
  const yEndActual = points[n - 1][1];
  const yEndPred = a + b;
  return { trend, yEndActual, yEndPred };
}

function sharedValueBounds(
  a: [number, number][],
  b: [number, number][]
): { minV: number; maxV: number } {
  const vals = [...a, ...b].map(([, y]) => y).filter((y) => Number.isFinite(y));
  if (vals.length === 0) return { minV: 0, maxV: 1 };
  let minV = Math.min(...vals);
  let maxV = Math.max(...vals);
  if (maxV <= minV) {
    minV -= 1;
    maxV += 1;
  }
  const pad = (maxV - minV) * 0.06;
  return { minV: minV - pad, maxV: maxV + pad };
}

function pickHoverProductMode(
  sx: number,
  sy: number,
  real: [number, number][],
  trend: [number, number][],
  tMin: number,
  tMax: number,
  minV: number,
  maxV: number
): { t: number; which: 'real' | 'trend' | null } {
  const plotW = VB_W - PAD_L - PAD_R;
  const t =
    tMax > tMin ? tMin + ((sx - PAD_L) / plotW) * (tMax - tMin) : tMin;
  const tClamped = Math.max(tMin, Math.min(tMax, t));

  const distTo = (pts: [number, number][]): number => {
    let best = HOVER_HIT_PX + 1;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ta, va] = pts[i];
      const [tb, vb] = pts[i + 1];
      const x1 = xScale(ta, tMin, tMax);
      const y1 = yScaleSeries(va, minV, maxV);
      const x2 = xScale(tb, tMin, tMax);
      const y2 = yScaleSeries(vb, minV, maxV);
      const d = distPointToSegment(sx, sy, x1, y1, x2, y2);
      if (d < best) best = d;
    }
    return best;
  };

  const dR = distTo(real);
  const dT = distTo(trend);
  if (dR > HOVER_HIT_PX && dT > HOVER_HIT_PX) {
    return { t: tClamped, which: null };
  }
  if (dR <= dT) return { t: tClamped, which: 'real' };
  return { t: tClamped, which: 'trend' };
}

function formatCompactAnnualChart(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const r = Math.round(Math.abs(n));
  if (r >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (r >= 1000) return `${Math.round(n / 1000)}k`;
  return `${Math.round(n)}`;
}

function xScale(t: number, tMin: number, tMax: number): number {
  const w = VB_W - PAD_L - PAD_R;
  if (tMax <= tMin) return PAD_L;
  return PAD_L + ((t - tMin) / (tMax - tMin)) * w;
}

/** Вертикальная шкала для одной серии: свои min/max, чтобы разные валюты не сжимались к нулю на общей оси. */
function yScaleSeries(v: number, minV: number, maxV: number): number {
  const h = VB_H - PAD_T - PAD_B;
  if (!Number.isFinite(v)) return PAD_T + h;
  if (!Number.isFinite(minV) || !Number.isFinite(maxV)) return PAD_T + h;
  if (maxV <= minV) return PAD_T + h / 2;
  const ratio = (v - minV) / (maxV - minV);
  return PAD_T + h * (1 - Math.min(1, Math.max(0, ratio)));
}

function seriesValueBounds(points: [number, number][]): { minV: number; maxV: number } {
  const vals = points.map(([, y]) => y).filter((y) => Number.isFinite(y));
  if (vals.length === 0) return { minV: 0, maxV: 1 };
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  if (maxV <= minV) return { minV: minV - 1, maxV: maxV + 1 };
  return { minV, maxV };
}

function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return '0';
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return n.toFixed(0);
}

function formatChartAxisDate(ms: number, localeTag: string): string {
  return new Date(ms).toLocaleDateString(localeTag, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatChartAxisNowDate(ms: number, localeTag: string): string {
  return new Date(ms).toLocaleDateString(localeTag, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatChartAxisTime(ms: number, localeTag: string): string {
  return new Date(ms).toLocaleTimeString(localeTag, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatMoneyAmount(n: number, localeTag: string): string {
  if (!Number.isFinite(n)) return (0).toLocaleString(localeTag, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString(localeTag, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/** Реальные границы значений серии (для подписей оси Y). */
function seriesRawBounds(points: [number, number][]): { minV: number; maxV: number } {
  const vals = points.map(([, y]) => y).filter((y) => Number.isFinite(y));
  if (vals.length === 0) return { minV: 0, maxV: 0 };
  return { minV: Math.min(...vals), maxV: Math.max(...vals) };
}

function interpolateValueAtT(points: [number, number][], t: number): number {
  if (points.length === 0) return 0;
  if (t <= points[0][0]) return points[0][1];
  const last = points[points.length - 1];
  if (t >= last[0]) return last[1];
  for (let i = 0; i < points.length - 1; i++) {
    const t0 = points[i][0];
    const t1 = points[i + 1][0];
    if (t >= t0 && t <= t1) {
      const v0 = points[i][1];
      const v1 = points[i + 1][1];
      const u = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
      return v0 + u * (v1 - v0);
    }
  }
  return last[1];
}

function distPointToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-12) return Math.hypot(px - x1, py - y1);
  let u = ((px - x1) * dx + (py - y1) * dy) / len2;
  u = Math.max(0, Math.min(1, u));
  return Math.hypot(px - (x1 + u * dx), py - (y1 + u * dy));
}

function pickHoverFromSvg(
  sx: number,
  sy: number,
  chartSeries: Series[],
  tMin: number,
  tMax: number
): { t: number; seriesId: string | null } {
  const plotW = VB_W - PAD_L - PAD_R;
  const t =
    tMax > tMin ?
      tMin + ((sx - PAD_L) / plotW) * (tMax - tMin)
    : tMin;
  const tClamped = Math.max(tMin, Math.min(tMax, t));

  let bestD = HOVER_HIT_PX + 1;
  let bestId: string | null = null;

  for (const s of chartSeries) {
    const { minV, maxV } = seriesValueBounds(s.points);
    for (let i = 0; i < s.points.length - 1; i++) {
      const [ta, va] = s.points[i];
      const [tb, vb] = s.points[i + 1];
      const x1 = xScale(ta, tMin, tMax);
      const y1 = yScaleSeries(va, minV, maxV);
      const x2 = xScale(tb, tMin, tMax);
      const y2 = yScaleSeries(vb, minV, maxV);
      const d = distPointToSegment(sx, sy, x1, y1, x2, y2);
      if (d < bestD) {
        bestD = d;
        bestId = s.id;
      }
    }
  }

  if (bestId === null || bestD > HOVER_HIT_PX) {
    return { t: tClamped, seriesId: null };
  }
  return { t: tClamped, seriesId: bestId };
}

export type ChartTrajectoryHint = {
  y12: number;
  y12plus: number;
  deltaYear: number;
  symbol: string;
};

export function IncomeChart({
  projects,
  nowMs,
  balanceAfterPayroll,
  balanceCurrency,
  lastPayrollYmd,
  embedded = false,
  fxSnapshot = null,
  fxHistoryRows = null,
  inflationYearly = null,
  inflationCurrencyCodes = [],
  variant: _variant = 'expanded',
  trajectoryHint = null,
  onOpenGrow
}: {
  projects: ProjectEntry[];
  nowMs: number;
  balanceAfterPayroll: number;
  balanceCurrency: string;
  lastPayrollYmd: string;
  variant?: 'compact' | 'expanded';
  embedded?: boolean;
  fxSnapshot?: FxSnapshot | null;
  fxHistoryRows?: FrankfurterRow[] | null;
  inflationYearly?: BlendedInflationYear[] | null;
  inflationCurrencyCodes?: readonly string[];
  trajectoryHint?: ChartTrajectoryHint | null;
  onOpenGrow?: () => void;
}) {
  const { t, locale } = useI18n();
  const localeTag = intlLocaleTag[locale];
  const [chartRange, setChartRange] = useState<'1y' | 'all'>('all');
  const [advancedDetails, setAdvancedDetails] = useState(false);
  const [internalFocusId, setInternalFocusId] = useState<string | null>(null);
  const [advChartTall, setAdvChartTall] = useState(false);

  const compact = advancedDetails ? !advChartTall : true;

  const chartLabels = useMemo<ChartSeriesLabels>(
    () => ({
      defaultProject: t('chart.defaultProject'),
      others: t('chart.series.others'),
      projects: t('chart.series.projects'),
      account: t('chart.series.account'),
      allFx: t('chart.series.allFx')
    }),
    [t]
  );

  const dataRange = useMemo(
    () => getIncomeChartTimeRange(projects, nowMs),
    [projects, nowMs]
  );

  const viewWindow = useMemo(() => {
    if (!dataRange) return null;
    if (chartRange === 'all') {
      return { tMin: dataRange.tMin, tMax: dataRange.tMax };
    }
    const cut = nowMs - 365.25 * DAY_MS;
    return { tMin: Math.max(dataRange.tMin, cut), tMax: dataRange.tMax };
  }, [dataRange, chartRange, nowMs]);

  const productMerged = useMemo(() => {
    if (!viewWindow || viewWindow.tMax <= viewWindow.tMin || projects.length === 0) {
      return null;
    }
    return buildMergedEarningsPoints(
      projects,
      viewWindow.tMin,
      viewWindow.tMax,
      STEPS,
      fxSnapshot,
      balanceCurrency
    );
  }, [viewWindow, projects, fxSnapshot, balanceCurrency]);

  const productInsight = useMemo(() => {
    if (!productMerged) return null;
    const { trend, yEndActual, yEndPred } = linearTrendFromPoints(productMerged.points);
    const denom = Math.max(Math.abs(yEndPred), 1e-9);
    const pctVsTrend = ((yEndActual - yEndPred) / denom) * 100;
    return {
      trend,
      yEndActual,
      yEndPred,
      pctVsTrend,
      symbol: getCurrencySymbol(productMerged.code)
    };
  }, [productMerged]);

  const productYBounds = useMemo(() => {
    if (!productMerged || !productInsight) return { minV: 0, maxV: 1 };
    return sharedValueBounds(productMerged.points, productInsight.trend);
  }, [productMerged, productInsight]);

  useEffect(() => {
    if (internalFocusId && !projects.some((p) => p.id === internalFocusId)) {
      setInternalFocusId(null);
    }
  }, [projects, internalFocusId]);

  const { series, tMin, tMax } = useMemo(() => {
    if (!embedded || !advancedDetails) {
      return { series: [] as Series[], tMin: 0, tMax: 0 };
    }
    const base = buildIncomeSeries(
      projects,
      nowMs,
      {
        amount: balanceAfterPayroll,
        currency: balanceCurrency,
        lastPayrollYmd
      },
      fxSnapshot ?
        { snapshot: fxSnapshot, targetCode: balanceCurrency }
      : null,
      internalFocusId ?? null,
      chartLabels,
      viewWindow
    );
    const nextSeries = [...base.series];
    const quotes = frankfurterQuoteCurrencies(projects, balanceCurrency);
    const hist =
      fxHistoryRows &&
      fxHistoryRows.length > 0 &&
      quotes.length > 0 &&
      base.tMax > base.tMin ?
        buildRelativeFxIndexSeries(
          fxHistoryRows,
          balanceCurrency,
          quotes,
          base.tMin,
          base.tMax,
          STEPS,
          locale
        )
      : null;
    if (hist) {
      nextSeries.push({
        id: 'fx-hist-rel',
        code: balanceCurrency,
        label: hist.label,
        points: hist.points,
        kind: 'fxHist'
      });
    }
    const infPts =
      inflationYearly &&
      inflationYearly.length > 0 &&
      base.tMax > base.tMin ?
        inflationIndexSeriesPoints(inflationYearly, base.tMin, base.tMax, STEPS)
      : null;
    if (infPts) {
      nextSeries.push({
        id: 'cpi-blended',
        code: balanceCurrency,
        label: inflationChartLabel([...inflationCurrencyCodes], locale),
        points: infPts,
        kind: 'infHist'
      });
    }
    return { ...base, series: nextSeries };
  }, [
    embedded,
    advancedDetails,
    projects,
    nowMs,
    balanceAfterPayroll,
    balanceCurrency,
    lastPayrollYmd,
    fxSnapshot,
    fxHistoryRows,
    internalFocusId,
    inflationYearly,
    inflationCurrencyCodes,
    chartLabels,
    locale,
    viewWindow
  ]);

  const plotW = VB_W - PAD_L - PAD_R;
  const plotH = VB_H - PAD_T - PAD_B;
  const y0 = PAD_T + plotH;

  const [hover, setHover] = useState<{
    t: number;
    seriesId: string;
    tipX: number;
    tipY: number;
  } | null>(null);
  const [productHover, setProductHover] = useState<{
    t: number;
    which: 'real' | 'trend';
    tipX: number;
    tipY: number;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const productSvgRef = useRef<SVGSVGElement>(null);
  const productWrapRef = useRef<HTMLDivElement>(null);

  const updateHover = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      const wrap = wrapRef.current;
      if (!svg || !wrap || series.length === 0) return;
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const p = pt.matrixTransform(ctm.inverse());
      const { t, seriesId } = pickHoverFromSvg(p.x, p.y, series, tMin, tMax);
      if (seriesId == null) {
        setHover(null);
        return;
      }
      const wr = wrap.getBoundingClientRect();
      setHover({
        t,
        seriesId,
        tipX: clientX - wr.left,
        tipY: clientY - wr.top
      });
    },
    [series, tMin, tMax]
  );

  const handleLeave = useCallback(() => setHover(null), []);

  const updateProductHover = useCallback(
    (clientX: number, clientY: number) => {
      if (!viewWindow || !productMerged || !productInsight) return;
      const svg = productSvgRef.current;
      const wrap = productWrapRef.current;
      if (!svg || !wrap) return;
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const p = pt.matrixTransform(ctm.inverse());
      const { minV, maxV } = productYBounds;
      const { t: ht, which } = pickHoverProductMode(
        p.x,
        p.y,
        productMerged.points,
        productInsight.trend,
        viewWindow.tMin,
        viewWindow.tMax,
        minV,
        maxV
      );
      if (which == null) {
        setProductHover(null);
        return;
      }
      const wr = wrap.getBoundingClientRect();
      setProductHover({
        t: ht,
        which,
        tipX: clientX - wr.left,
        tipY: clientY - wr.top
      });
    },
    [viewWindow, productMerged, productInsight, productYBounds]
  );

  const handleProductLeave = useCallback(() => setProductHover(null), []);

  if (!dataRange) {
    return (
      <div
        className={
          embedded ?
            'w-full py-8 sm:py-10 text-center text-white/55 text-sm font-medium'
          : 'rounded-r80 bg-white/10 border border-white/20 px-4 py-8 text-center text-white/60 text-sm font-medium backdrop-blur-sm w-full max-w-[min(100%,42rem)]'
        }
        role="img"
        aria-label={t('chart.ariaPanel')}>
        {t('chart.empty')}
      </div>
    );
  }

  if (embedded && !advancedDetails) {
    if (!productMerged || !productInsight || !viewWindow) {
      return (
        <div
          ref={productWrapRef}
          className="w-full min-w-0 relative rounded-r80-sm border border-white/10 bg-white/[0.04] px-3 py-4 sm:px-4 sm:py-5 space-y-4"
          role="img"
          aria-label={t('chart.ariaPanel')}>
          <p className="text-white/75 text-sm font-semibold text-center leading-snug">
            {t('chart.productNeedRates')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setChartRange('1y')}
              className={`rounded-r80-sm px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-wide border transition-colors ${
                chartRange === '1y' ?
                  'border-emerald-400/50 bg-emerald-500/20 text-emerald-100'
                : 'border-white/18 bg-white/[0.06] text-white/65 hover:bg-white/10'
              }`}>
              {t('chart.range1y')}
            </button>
            <button
              type="button"
              onClick={() => setChartRange('all')}
              className={`rounded-r80-sm px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-wide border transition-colors ${
                chartRange === 'all' ?
                  'border-emerald-400/50 bg-emerald-500/20 text-emerald-100'
                : 'border-white/18 bg-white/[0.06] text-white/65 hover:bg-white/10'
              }`}>
              {t('chart.rangeAll')}
            </button>
            <button
              type="button"
              onClick={() => setAdvancedDetails(true)}
              className="rounded-r80-sm px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wide border border-violet-400/35 bg-violet-500/15 text-violet-100 hover:bg-violet-500/25">
              {t('chart.advancedShow')}
            </button>
          </div>
          {onOpenGrow ?
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={onOpenGrow}
                className="text-[0.72rem] font-extrabold uppercase tracking-wide text-[#061018] bg-[var(--accent-money)] px-5 py-2.5 rounded-r80-sm hover:brightness-110">
                {t('hero.ctaGrow')}
              </button>
            </div>
          : null}
        </div>
      );
    }

    const { minV, maxV } = productYBounds;
    const { tMin: ptMin, tMax: ptMax } = viewWindow;
    const realPts = productMerged.points;
    const trendPts = productInsight.trend;
    const sym = productInsight.symbol;
    const pct = productInsight.pctVsTrend;
    const verdictKey =
      pct > 2 ? 'above'
      : pct < -2 ? 'below'
      : 'neutral';
    const verdictText =
      verdictKey === 'above' ? t('chart.productAboveTrend')
      : verdictKey === 'below' ?
        t('chart.productBelowTrend', { pct: String(Math.round(Math.abs(pct))) })
      : t('chart.productNeutralTrend');

    const pathD = (pts: [number, number][]) =>
      pts
        .map(([tt, v], i) => {
          const x = xScale(tt, ptMin, ptMax);
          const y = yScaleSeries(v, minV, maxV);
          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ');

    const lastReal = realPts[realPts.length - 1]!;
    const lastTrend = trendPts[trendPts.length - 1]!;
    const lxR = xScale(lastReal[0], ptMin, ptMax);
    const lyR = yScaleSeries(lastReal[1], minV, maxV);
    const lxT = xScale(lastTrend[0], ptMin, ptMax);
    const lyT = yScaleSeries(lastTrend[1], minV, maxV);

    const gapTrend = productInsight.yEndActual - productInsight.yEndPred;

    return (
      <div
        ref={productWrapRef}
        className="w-full min-w-0 relative rounded-r80-sm border border-cyan-400/15 bg-gradient-to-b from-white/[0.07] to-transparent px-3 py-4 sm:px-5 sm:py-5 space-y-4"
        role="img"
        aria-label={t('chart.productAria')}>
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <p className="text-emerald-200/90 text-[0.62rem] font-extrabold uppercase tracking-[0.14em]">
            {t('chart.productKicker')}
          </p>
          <p className="text-white text-base sm:text-lg font-bold leading-snug px-1">
            {verdictText}
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm tabular-nums pt-1">
            <div className="text-left min-w-[7rem]">
              <p className="text-white/40 text-[0.55rem] font-bold uppercase tracking-wider">
                {t('chart.productNow')}
              </p>
              <p className="text-white font-black text-lg">
                {sym}
                {formatCompactAnnualChart(productInsight.yEndActual)}
              </p>
            </div>
            <div className="text-left min-w-[7rem]">
              <p className="text-white/40 text-[0.55rem] font-bold uppercase tracking-wider">
                {t('chart.productTrendEnd')}
              </p>
              <p className="text-white/70 font-bold text-lg">
                {sym}
                {formatCompactAnnualChart(productInsight.yEndPred)}
              </p>
            </div>
            <div className="text-left min-w-[7rem]">
              <p className="text-white/40 text-[0.55rem] font-bold uppercase tracking-wider">
                {t('chart.productGapTrend')}
              </p>
              <p
                className={`font-black text-lg ${
                  gapTrend >= 0 ? 'text-[var(--accent-money)]' : 'text-amber-200/90'
                }`}>
                {gapTrend >= 0 ? '+' : '−'}
                {sym}
                {formatCompactAnnualChart(Math.abs(gapTrend))}
              </p>
            </div>
          </div>
          {trajectoryHint ?
            <div className="rounded-r80-sm border border-fuchsia-400/20 bg-fuchsia-500/[0.08] px-3 py-3 text-left max-w-md mx-auto">
              <p className="text-fuchsia-200/80 text-[0.55rem] font-extrabold uppercase tracking-wider mb-2 text-center">
                {t('chart.productTrajectoryLead')}
              </p>
              <div className="flex flex-wrap justify-between gap-2 text-xs tabular-nums text-white/85">
                <span>
                  {t('chart.productSteady12')}:{' '}
                  <strong>
                    {trajectoryHint.symbol}
                    {formatCompactAnnualChart(trajectoryHint.y12)}
                  </strong>
                </span>
                <span>
                  {t('chart.productPlus20')}:{' '}
                  <strong>
                    {trajectoryHint.symbol}
                    {formatCompactAnnualChart(trajectoryHint.y12plus)}
                  </strong>
                </span>
              </div>
              <p className="text-[var(--accent-money)] font-bold text-sm mt-2 text-center tabular-nums">
                {trajectoryHint.deltaYear >= 0 ? '+' : '−'}
                {trajectoryHint.symbol}
                {formatCompactAnnualChart(Math.abs(trajectoryHint.deltaYear))}
                <span className="text-white/45 font-medium text-[0.65rem] ml-1">
                  {t('chart.productPerYearHint')}
                </span>
              </p>
            </div>
          : null}
          <p className="text-white/32 text-[0.55rem] leading-snug px-2">
            {t('chart.productDisclaimer')}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setChartRange('1y')}
            className={`rounded-r80-sm px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-wide border transition-colors ${
              chartRange === '1y' ?
                'border-emerald-400/50 bg-emerald-500/20 text-emerald-100'
              : 'border-white/18 bg-white/[0.06] text-white/65 hover:bg-white/10'
            }`}>
            {t('chart.range1y')}
          </button>
          <button
            type="button"
            onClick={() => setChartRange('all')}
            className={`rounded-r80-sm px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-wide border transition-colors ${
              chartRange === 'all' ?
                'border-emerald-400/50 bg-emerald-500/20 text-emerald-100'
              : 'border-white/18 bg-white/[0.06] text-white/65 hover:bg-white/10'
            }`}>
            {t('chart.rangeAll')}
          </button>
          <button
            type="button"
            onClick={() => setAdvancedDetails(true)}
            className="rounded-r80-sm px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wide border border-violet-400/35 bg-violet-500/15 text-violet-100 hover:bg-violet-500/25">
            {t('chart.advancedShow')}
          </button>
        </div>

        <svg
          ref={productSvgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full h-auto block mx-auto touch-none select-none"
          style={{ maxHeight: 'clamp(12rem, min(36vh, 340px), 22rem)' }}
          aria-hidden>
          <defs>
            <linearGradient id="product-fill-you" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRODUCT_YOU_LINE} stopOpacity="0.22" />
              <stop offset="100%" stopColor={PRODUCT_YOU_LINE} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <line
            x1={PAD_L}
            y1={y0}
            x2={VB_W - PAD_R}
            y2={y0}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={y0}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
          {[0, 0.5, 1].map((frac) => (
            <line
              key={frac}
              x1={PAD_L}
              y1={PAD_T + plotH * (1 - frac)}
              x2={VB_W - PAD_R}
              y2={PAD_T + plotH * (1 - frac)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          ))}
          {(() => {
            const areaD =
              `M ${xScale(realPts[0][0], ptMin, ptMax).toFixed(1)} ${y0.toFixed(1)} ` +
              realPts
                .map(([tt, v]) => {
                  const x = xScale(tt, ptMin, ptMax);
                  const y = yScaleSeries(v, minV, maxV);
                  return `L ${x.toFixed(1)} ${y.toFixed(1)}`;
                })
                .join(' ') +
              ` L ${xScale(realPts[realPts.length - 1][0], ptMin, ptMax).toFixed(1)} ${y0.toFixed(1)} Z`;
            return <path d={areaD} fill="url(#product-fill-you)" />;
          })()}
          <path
            d={pathD(trendPts)}
            fill="none"
            stroke={PRODUCT_TREND_LINE}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={pathD(realPts)}
            fill="none"
            stroke={PRODUCT_YOU_LINE}
            strokeWidth="3.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 10px rgba(52,211,153,0.35))' }}
          />
          <text
            x={Math.min(lxR + 4, VB_W - PAD_R - 36)}
            y={Math.max(lyR - 6, PAD_T + 10)}
            fill="rgba(255,255,255,0.9)"
            fontSize="9"
            fontWeight="800"
            fontFamily="inherit">
            {t('chart.productYou')}
          </text>
          <text
            x={Math.min(lxT + 4, VB_W - PAD_R - 40)}
            y={Math.min(lyT + 14, y0 - 8)}
            fill="rgba(255,255,255,0.45)"
            fontSize="9"
            fontWeight="700"
            fontFamily="inherit">
            {t('chart.productTrend')}
          </text>
          <text
            x={PAD_L - 6}
            y={PAD_T + 11}
            fill="rgba(255,255,255,0.65)"
            fontSize="10"
            fontWeight="700"
            textAnchor="end"
            style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatCompact(maxV)} {sym}
          </text>
          <text
            x={PAD_L - 6}
            y={y0 - 1}
            fill="rgba(255,255,255,0.45)"
            fontSize="9"
            textAnchor="end"
            style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatCompact(minV)} {sym}
          </text>
          <rect
            x={PAD_L}
            y={PAD_T}
            width={plotW}
            height={plotH}
            fill="transparent"
            style={{ cursor: 'crosshair', touchAction: 'none' }}
            onMouseMove={(e) => updateProductHover(e.clientX, e.clientY)}
            onMouseLeave={handleProductLeave}
            onTouchStart={(e) => {
              const tt = e.touches[0];
              if (tt) updateProductHover(tt.clientX, tt.clientY);
            }}
            onTouchMove={(e) => {
              const tt = e.touches[0];
              if (tt) updateProductHover(tt.clientX, tt.clientY);
            }}
            onTouchEnd={handleProductLeave}
          />
        </svg>

        {productHover ?
          <div
            className="pointer-events-none absolute z-20 rounded-r80-sm border border-white/25 bg-black/85 px-2.5 py-2 text-[0.7rem] text-white shadow-xl backdrop-blur-md max-w-[min(16rem,calc(100%-1rem))]"
            style={{
              left: productHover.tipX,
              top: productHover.tipY,
              transform: 'translate(-50%, calc(-100% - 10px))'
            }}>
            <p className="font-bold text-white/90 mb-1 border-b border-white/12 pb-1">
              {formatChartAxisDate(productHover.t, localeTag)}
            </p>
            <p className="text-emerald-200/95 font-semibold tabular-nums">
              {t('chart.productYou')}: {sym}
              {formatMoneyAmount(interpolateValueAtT(realPts, productHover.t), localeTag)}
            </p>
            <p className="text-white/55 font-medium tabular-nums mt-0.5">
              {t('chart.productTrend')}: {sym}
              {formatMoneyAmount(interpolateValueAtT(trendPts, productHover.t), localeTag)}
            </p>
          </div>
        : null}

        {onOpenGrow ?
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={onOpenGrow}
              className="text-[0.72rem] font-extrabold uppercase tracking-wide text-[#061018] bg-[var(--accent-money)] px-6 py-3 rounded-r80-sm hover:brightness-110 shadow-[0_0_20px_rgba(0,255,160,0.2)]">
              {t('chart.ctaGrow')}
            </button>
          </div>
        : null}
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <div
        className={
          embedded ?
            'w-full py-8 sm:py-10 text-center text-white/55 text-sm font-medium'
          : 'rounded-r80 bg-white/10 border border-white/20 px-4 py-8 text-center text-white/60 text-sm font-medium backdrop-blur-sm w-full max-w-[min(100%,42rem)]'
        }
        role="img"
        aria-label={t('chart.ariaPanel')}>
        {t('chart.empty')}
      </div>
    );
  }

  const rangeMs = tMax - tMin;
  const showMidDate = !compact && rangeMs > 45 * DAY_MS;
  const gridFracs = compact ? ([0, 1] as const) : ([0, 0.5, 1] as const);
  const midMs = tMin + rangeMs / 2;
  const midX = (PAD_L + (VB_W - PAD_R)) / 2;

  const focusSeries =
    hover ?
      series.find((s) => s.id === hover.seriesId) ?? series[0]
    : series.find((s) => s.id.startsWith('proj-focus-')) ??
      series.find((s) => s.kind === 'projects' && !s.muted) ??
      series.find((s) => s.kind === 'fx') ??
      series.find((s) => s.kind === 'fxHist') ??
      series.find((s) => s.kind === 'infHist') ??
      series[0];
  const yAxisRaw = seriesRawBounds(focusSeries.points);
  const yAxisFxPct = focusSeries.kind === 'fxHist';
  const yAxisInfIdx = focusSeries.kind === 'infHist';
  const hasProjectFocus = series.some((s) => s.id.startsWith('proj-focus-'));
  const chartFocusProject =
    internalFocusId ?
      projects.find((p) => p.id === internalFocusId) ?? null
    : null;

  const shellClass = embedded ?
    'w-full min-w-0 relative rounded-r80-sm border border-transparent dark:border-cyan-400/18'
  : 'rounded-r80 bg-white/10 border border-white/20 px-3 sm:px-5 pt-4 pb-3 backdrop-blur-sm shadow-lg w-full max-w-[min(100%,42rem)] relative dark:border-cyan-400/25 dark:bg-cyan-950/10';

  return (
    <div
      ref={wrapRef}
      className={shellClass}
      role="img"
      aria-label={t('chart.ariaMain')}>
      {!embedded &&
      <p className="text-white/85 text-xs sm:text-sm font-bold text-center uppercase tracking-wide mb-2 px-1">
        {t('chart.heading')}
      </p>
      }
      {embedded && advancedDetails ?
        <div className="space-y-2 mb-2 sm:mb-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setChartRange('1y')}
              className={`rounded-r80-sm px-2.5 py-1.5 text-[0.6rem] font-extrabold uppercase tracking-wide border transition-colors ${
                chartRange === '1y' ?
                  'border-cyan-400/45 bg-cyan-500/20 text-cyan-50'
                : 'border-white/16 bg-white/[0.06] text-white/60 hover:bg-white/10'
              }`}>
              {t('chart.range1y')}
            </button>
            <button
              type="button"
              onClick={() => setChartRange('all')}
              className={`rounded-r80-sm px-2.5 py-1.5 text-[0.6rem] font-extrabold uppercase tracking-wide border transition-colors ${
                chartRange === 'all' ?
                  'border-cyan-400/45 bg-cyan-500/20 text-cyan-50'
                : 'border-white/16 bg-white/[0.06] text-white/60 hover:bg-white/10'
              }`}>
              {t('chart.rangeAll')}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdvancedDetails(false);
                setInternalFocusId(null);
              }}
              className="rounded-r80-sm px-2.5 py-1.5 text-[0.6rem] font-bold uppercase tracking-wide border border-white/20 bg-white/10 text-white/80 hover:bg-white/15">
              {t('chart.advancedHide')}
            </button>
            <button
              type="button"
              onClick={() => setAdvChartTall((v) => !v)}
              aria-expanded={advChartTall}
              className="inline-flex items-center gap-1 rounded-r80-sm border border-white/18 bg-white/[0.06] px-2 py-1.5 text-[0.58rem] font-bold uppercase tracking-wide text-white/75 hover:bg-white/10">
              {advChartTall ?
                <Minimize2 size={13} strokeWidth={2.4} aria-hidden />
              : <Maximize2 size={13} strokeWidth={2.4} aria-hidden />}
              {advChartTall ? t('chart.collapse') : t('chart.expand')}
            </button>
          </div>
          <p className="text-white/38 text-[0.55rem] text-center px-1">
            {compact ? t('chart.panelHintCompact') : t('chart.panelHint')}
          </p>
          <AnimatePresence mode="wait">
            {chartFocusProject ?
              <motion.div
                key={chartFocusProject.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-r80-sm border border-amber-200/30 bg-amber-400/10 pl-2.5 pr-1 py-1">
                  <span
                    className="h-2 w-2 rounded-none bg-amber-300"
                    aria-hidden
                  />
                  <span className="text-[0.6rem] font-bold text-white/90 max-w-[min(11rem,45vw)] truncate">
                    {chartFocusProject.name || t('chart.defaultProject')}
                  </span>
                  {projectIsEndedByDeadline(chartFocusProject, nowMs) ?
                    <span className="text-[0.48rem] font-extrabold uppercase text-slate-200/95 px-1.5 py-0.5 rounded-r80-sm bg-slate-700/55 border border-white/12 shrink-0">
                      {t('settings.contractEnded')}
                    </span>
                  : null}
                </span>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setInternalFocusId(null)}
                  className="inline-flex items-center gap-1 rounded-r80-sm border border-white/20 bg-white/10 px-2 py-1 text-[0.58rem] font-bold uppercase text-white/75 hover:text-white">
                  <XIcon size={12} strokeWidth={2.5} aria-hidden />
                  {t('chart.all')}
                </motion.button>
              </motion.div>
            : null}
          </AnimatePresence>
          <div className="rounded-r80-sm border border-white/[0.09] bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-2 py-2">
            <p className="text-white/35 text-[0.52rem] font-bold uppercase tracking-[0.1em] px-1 mb-1">
              {t('chart.projects')}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-0.5 snap-x [scrollbar-width:thin]">
              {projects.map((p) => {
                const selected = internalFocusId === p.id;
                const ended = projectIsEndedByDeadline(p, nowMs);
                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    aria-pressed={selected}
                    onClick={() =>
                      setInternalFocusId((prev) => (prev === p.id ? null : p.id))
                    }
                    className={`snap-start shrink-0 min-w-[5.5rem] max-w-[9rem] rounded-r80-sm border px-2 py-1.5 text-left transition-colors ${
                      selected ?
                        'border-amber-300/50 bg-amber-400/15 shadow-[inset_0_0_0_1px_rgba(253,224,71,0.2)]'
                      : 'border-white/12 bg-black/20 hover:border-white/22 hover:bg-white/[0.06]'
                    }`}>
                    <span className="block text-[0.58rem] font-bold text-white/88 truncate">
                      {p.name || t('chart.defaultProject')}
                    </span>
                    {ended ?
                      <span className="text-[0.48rem] text-amber-200/80 font-semibold">
                        {t('settings.contractEnded')}
                      </span>
                    : null}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      : null}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-auto block mx-auto touch-none select-none"
        style={{
          maxHeight: embedded ?
            compact ?
              'clamp(11rem, min(28vh, 320px), 22rem)'
            : 'clamp(18rem, min(42vh, 520px), 36rem)'
          : compact ?
            'clamp(12rem, 36vmin, 20rem)'
          : 'clamp(14rem, 48vmin, 24rem)'
        }}
        aria-hidden>
        <defs>
          {series.map((s, idx) => {
            const c = strokeColorForSeries(series, s, idx);
            return (
              <linearGradient
                key={`g-${s.id}`}
                id={`income-fill-${s.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1">
                <stop
                  offset="0%"
                  stopColor={c}
                  stopOpacity={
                    s.muted ? '0.06'
                    : s.id.startsWith('proj-focus-') ? '0.4'
                    : s.kind === 'balance' ? '0.22'
                    : s.kind === 'fxHist' ? '0.22'
                    : s.kind === 'infHist' ? '0.22'
                    : '0.35'
                  }
                />
                <stop offset="100%" stopColor={c} stopOpacity="0.02" />
              </linearGradient>
            );
          })}
        </defs>

        {/* grid */}
        <line
          x1={PAD_L}
          y1={y0}
          x2={VB_W - PAD_R}
          y2={y0}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
        <line
          x1={PAD_L}
          y1={PAD_T}
          x2={PAD_L}
          y2={y0}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        {gridFracs.map((frac) => {
          const y = PAD_T + plotH * (1 - frac);
          return (
            <line
              key={frac}
              x1={PAD_L}
              y1={y}
              x2={VB_W - PAD_R}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}

        {series.map((s, idx) => {
          const color = strokeColorForSeries(series, s, idx);
          const { minV, maxV } = seriesValueBounds(s.points);
          const isHi = Boolean(hover && hover.seriesId === s.id);
          const dim = Boolean(hover && hover.seriesId !== s.id);
          const isHero = s.id.startsWith('proj-focus-');
          const isInf = s.kind === 'infHist';
          const baseLayerOp = s.muted ? 0.44 : 1;
          const layerOpacity =
            isHi ? 1
            : dim ?
              baseLayerOp * (s.muted ? 0.32 : 0.28)
            : baseLayerOp;
          const lineD = s.points
            .map(([t, v], i) => {
              const x = xScale(t, tMin, tMax);
              const y = yScaleSeries(v, minV, maxV);
              return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
            })
            .join(' ');

          const areaD =
            `M ${xScale(s.points[0][0], tMin, tMax).toFixed(1)} ${y0.toFixed(1)} ` +
            s.points
              .map(([t, v]) => {
                const x = xScale(t, tMin, tMax);
                const y = yScaleSeries(v, minV, maxV);
                return `L ${x.toFixed(1)} ${y.toFixed(1)}`;
              })
              .join(' ') +
            ` L ${xScale(s.points[s.points.length - 1][0], tMin, tMax).toFixed(1)} ${y0.toFixed(1)} Z`;

          return (
            <g
              key={s.id}
              style={{
                opacity: layerOpacity,
                transition: 'opacity 0.18s ease'
              }}>
              <path d={areaD} fill={`url(#income-fill-${s.id})`} />
              <path
                d={lineD}
                fill="none"
                stroke={color}
                strokeWidth={isHi ? 4.4 : isHero ? 3.2 : 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={
                  s.kind === 'balance' ? '5 4'
                  : s.kind === 'fxHist' ? '4 3'
                  : s.kind === 'infHist' ? '5 4'
                  : undefined
                }
                style={{
                  filter:
                    isHi ?
                      isHero ?
                        'drop-shadow(0 0 12px rgba(253, 224, 71, 0.45))'
                      : isInf ?
                        'drop-shadow(0 0 11px rgba(251, 146, 60, 0.5))'
                      : 'drop-shadow(0 0 8px rgba(255,255,255,0.55))'
                    : isHero ?
                      'drop-shadow(0 0 6px rgba(253, 224, 71, 0.28))'
                    : isInf ?
                      'drop-shadow(0 0 5px rgba(251, 146, 60, 0.28))'
                    : 'drop-shadow(0 0 4px rgba(255,255,255,0.25))'
                }}
              />
            </g>
          );
        })}

        <text
          x={PAD_L - 6}
          y={PAD_T + 11}
          fill="rgba(255,255,255,0.72)"
          fontSize="10"
          fontFamily="inherit"
          fontWeight="700"
          textAnchor="end"
          style={{ fontVariantNumeric: 'tabular-nums' }}>
          {yAxisFxPct ?
            `${formatCompact(yAxisRaw.maxV)}%`
          : yAxisInfIdx ?
            formatCompact(yAxisRaw.maxV)
          : `${formatCompact(yAxisRaw.maxV)} ${getCurrencySymbol(focusSeries.code)}`}
        </text>
        <text
          x={PAD_L - 6}
          y={y0 - 1}
          fill="rgba(255,255,255,0.55)"
          fontSize="9"
          fontFamily="inherit"
          textAnchor="end"
          style={{ fontVariantNumeric: 'tabular-nums' }}>
          {yAxisFxPct ?
            `${formatCompact(yAxisRaw.minV)}%`
          : yAxisInfIdx ?
            formatCompact(yAxisRaw.minV)
          : `${formatCompact(yAxisRaw.minV)} ${getCurrencySymbol(focusSeries.code)}`}
        </text>
        {!compact &&
        <text
          x={PAD_L - 6}
          y={PAD_T + 22}
          fill="rgba(255,255,255,0.35)"
          fontSize="8"
          fontFamily="inherit"
          textAnchor="end">
          {hover ? t('chart.yHover') : hasProjectFocus ? t('chart.yCompany') : t('chart.yFirst')}
        </text>
        }

        <rect
          x={PAD_L}
          y={PAD_T}
          width={plotW}
          height={plotH}
          fill="transparent"
          style={{ cursor: 'crosshair', touchAction: 'none' }}
          onMouseMove={(e) => updateHover(e.clientX, e.clientY)}
          onMouseLeave={handleLeave}
          onTouchStart={(e) => {
            const t = e.touches[0];
            if (t) updateHover(t.clientX, t.clientY);
          }}
          onTouchMove={(e) => {
            const t = e.touches[0];
            if (t) updateHover(t.clientX, t.clientY);
          }}
          onTouchEnd={handleLeave}
        />

        {hover &&
        <>
          <line
            x1={xScale(hover.t, tMin, tMax)}
            y1={PAD_T}
            x2={xScale(hover.t, tMin, tMax)}
            y2={y0}
            stroke="rgba(255,255,255,0.72)"
            strokeWidth="1.35"
            strokeDasharray="4 3"
            pointerEvents="none"
            style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.35))' }}
          />
          {series.map((s, idx) => {
            const color = strokeColorForSeries(series, s, idx);
            const { minV, maxV } = seriesValueBounds(s.points);
            const v = interpolateValueAtT(s.points, hover.t);
            const cx = xScale(hover.t, tMin, tMax);
            const cy = yScaleSeries(v, minV, maxV);
            return (
              <circle
                key={`dot-${s.id}`}
                cx={cx}
                cy={cy}
                r={hover.seriesId === s.id ? 5 : 3.5}
                fill={color}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="1"
                pointerEvents="none"
                style={{
                  opacity:
                    hover.seriesId === s.id ? 1
                    : s.muted ? 0.35
                    : 0.8
                }}
              />
            );
          })}
        </>
        }

        {!compact &&
        <text
          x={PAD_L}
          y={VB_H - 36}
          fill="rgba(255,255,255,0.42)"
          fontSize="10"
          fontFamily="inherit">
          {t('chart.fromStart')}
        </text>
        }
        <text
          x={PAD_L}
          y={VB_H - 18}
          fill="rgba(255,255,255,0.78)"
          fontSize="12"
          fontFamily="inherit"
          fontWeight="600">
          {formatChartAxisDate(tMin, localeTag)}
        </text>
        {showMidDate &&
        <text
          x={midX}
          y={VB_H - 18}
          fill="rgba(255,255,255,0.55)"
          fontSize="10"
          fontFamily="inherit"
          textAnchor="middle">
          {formatChartAxisDate(midMs, localeTag)}
        </text>
        }
        {!compact &&
        <text
          x={VB_W - PAD_R}
          y={VB_H - 36}
          fill="rgba(255,255,255,0.42)"
          fontSize="10"
          fontFamily="inherit"
          textAnchor="end">
          {t('chart.now')}
        </text>
        }
        <text
          x={VB_W - PAD_R}
          y={VB_H - 20}
          fill="rgba(255,255,255,0.78)"
          fontSize="12"
          fontFamily="inherit"
          fontWeight="600"
          textAnchor="end">
          {formatChartAxisNowDate(nowMs, localeTag)}
        </text>
        {!compact &&
        <text
          x={VB_W - PAD_R}
          y={VB_H - 4}
          fill="rgba(255,255,255,0.62)"
          fontSize="11"
          fontFamily="inherit"
          textAnchor="end"
          style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatChartAxisTime(nowMs, localeTag)}
        </text>
        }
      </svg>

      {hover &&
      <div
        className="pointer-events-none absolute z-20 rounded-r80-sm border border-white/25 bg-black/80 px-2.5 py-2 text-[0.7rem] sm:text-xs text-white shadow-xl backdrop-blur-md max-w-[min(18rem,calc(100%-1rem))]"
        style={{
          left: hover.tipX,
          top: hover.tipY,
          transform: 'translate(-50%, calc(-100% - 10px))'
        }}>
        <p className="font-bold text-white/90 mb-1.5 border-b border-white/15 pb-1">
          {formatChartAxisDate(hover.t, localeTag)}
        </p>
        <ul className="space-y-1 font-medium">
          {(compact ? series.filter((s) => s.id === hover.seriesId) : series).map((s) => {
            const seriesIdx = series.indexOf(s);
            const color = strokeColorForSeries(series, s, seriesIdx);
            const val = interpolateValueAtT(s.points, hover.t);
            const active = s.id === hover.seriesId;
            return (
              <li
                key={s.id}
                className={`flex items-baseline justify-between gap-3 ${
                  active ? 'text-white'
                  : s.muted ? 'text-white/42'
                  : 'text-white/65'
                }`}>
                <span className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="inline-block w-2 h-1 rounded-none shrink-0"
                    style={{
                      background: color,
                      ...(s.kind === 'balance' ?
                        {
                          background: 'repeating-linear-gradient(90deg, #fde68a 0 3px, transparent 3px 6px)'
                        }
                      : s.kind === 'fxHist' ?
                        {
                          background: 'repeating-linear-gradient(90deg, #38bdf8 0 3px, transparent 3px 5px)'
                        }
                      : s.kind === 'infHist' ?
                        {
                          background: 'repeating-linear-gradient(90deg, #fb923c 0 3px, transparent 3px 5px)'
                        }
                      : {})
                    }}
                  />
                  <span className="truncate">{s.label}</span>
                </span>
                <span
                  className="shrink-0 tabular-nums"
                  style={{ fontWeight: active ? 800 : 600 }}>
                  {s.kind === 'fxHist' ?
                    `${val.toFixed(1)}%`
                  : s.kind === 'infHist' ?
                    `${val.toFixed(1)} ${t('chart.indexSuffix')}`
                  : <>
                      {getCurrencySymbol(s.code)}
                      {formatMoneyAmount(val, localeTag)}
                    </>
                  }
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      }

      {!compact &&
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 px-1 pt-2 pb-0.5">
        {series.map((s, idx) => {
          const color = strokeColorForSeries(series, s, idx);
          const peak = Math.max(
            0,
            ...s.points.map(([, v]) => (Number.isFinite(v) ? v : 0))
          );
          const peakLabel =
            s.kind === 'fxHist' ? `${peak.toFixed(0)}%`
            : s.kind === 'infHist' ? `${peak.toFixed(0)} ${t('chart.indexSuffix')}`
            : formatCompact(peak);
          return (
            <span
              key={s.id}
              className={`text-[0.7rem] sm:text-xs font-bold inline-flex items-center gap-1.5 ${s.muted ? 'text-white/48' : 'text-white/80'}`}>
              <span
                className="inline-block w-2.5 h-1.5 rounded-none shrink-0"
                style={{
                  background: color,
                  ...(s.kind === 'balance' ?
                    {
                      background: 'repeating-linear-gradient(90deg, #fde68a 0 3px, transparent 3px 6px)'
                    }
                  : s.kind === 'fxHist' ?
                    {
                      background: 'repeating-linear-gradient(90deg, #38bdf8 0 3px, transparent 3px 5px)'
                    }
                  : s.kind === 'infHist' ?
                    {
                      background: 'repeating-linear-gradient(90deg, #fb923c 0 3px, transparent 3px 5px)'
                    }
                  : {})
                }}
              />
              {s.label}
              {s.kind === 'fxHist' || s.kind === 'infHist' ?
                ` · ${peakLabel}`
              : ` (${getCurrencySymbol(s.code)}) · ${peakLabel}`}
            </span>
          );
        })}
      </div>
      }
      {!compact &&
      (series.some((s) => s.kind === 'fxHist') || series.some((s) => s.kind === 'infHist')) &&
      <div className="text-center text-white/38 text-[0.55rem] sm:text-[0.58rem] mt-1.5 px-2 leading-snug space-y-1">
        {series.some((s) => s.kind === 'fxHist') &&
        <p>
          {t('chart.legend.fxHistory')}{' '}
          <a
            href="https://www.frankfurter.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-200/85 underline underline-offset-2 decoration-sky-200/35">
            api.frankfurter.dev
          </a>
          {t('chart.legend.fxBlurb')}
        </p>
        }
        {series.some((s) => s.kind === 'infHist') &&
        <p>
          {t('chart.legend.inf')}{' '}
          <a
            href="https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-200/85 underline underline-offset-2 decoration-orange-200/35">
            World Bank
          </a>
          {t('chart.legend.infBlurb')}
        </p>
        }
      </div>
      }
    </div>
  );
}
