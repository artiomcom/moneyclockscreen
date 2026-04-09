import { useCallback, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import {
  type ProjectEntry,
  projectEarningsAt,
  parseLocalDateYmd,
  normalizeCurrencyCode,
  getCurrencySymbol,
  balanceOnAccountAt
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

export const INCOME_CHART_STEPS = 64;
const STEPS = INCOME_CHART_STEPS;
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
  chartLabels?: ChartSeriesLabels
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
  const { tMin, tMax } = range;

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

const HOVER_HIT_PX = 24;

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

export function IncomeChart({
  projects,
  nowMs,
  balanceAfterPayroll,
  balanceCurrency,
  lastPayrollYmd,
  embedded = false,
  fxSnapshot = null,
  fxHistoryRows = null,
  chartFocusProjectId = null,
  inflationYearly = null,
  inflationCurrencyCodes = []
}: {
  projects: ProjectEntry[];
  nowMs: number;
  balanceAfterPayroll: number;
  balanceCurrency: string;
  lastPayrollYmd: string;
  /** Без внешней «карточки» — внутри общего glass-блока */
  embedded?: boolean;
  /** Если есть — добавляется суммарная линия «все проекты» в валюте счёта по курсу */
  fxSnapshot?: FxSnapshot | null;
  /** История Frankfurter: относительный индекс курсов (отдельная ось по масштабу серии) */
  fxHistoryRows?: FrankfurterRow[] | null;
  /** Одна компания на переднем плане; остальные серии приглушены */
  chartFocusProjectId?: string | null;
  /** Годовой CPI (World Bank), смешанный по экономикам выбранных валют */
  inflationYearly?: BlendedInflationYear[] | null;
  /** Коды валют, по которым строилась инфляция (для подписи) */
  inflationCurrencyCodes?: readonly string[];
}) {
  const { t, locale } = useI18n();
  const localeTag = locale === 'ru' ? 'ru-RU' : 'en-US';

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

  const { series, tMin, tMax } = useMemo(() => {
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
      chartFocusProjectId ?? null,
      chartLabels
    );
    let nextSeries = [...base.series];
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
    projects,
    nowMs,
    balanceAfterPayroll,
    balanceCurrency,
    lastPayrollYmd,
    fxSnapshot,
    fxHistoryRows,
    chartFocusProjectId,
    inflationYearly,
    inflationCurrencyCodes,
    chartLabels,
    locale
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

  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

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
  const showMidDate = rangeMs > 45 * DAY_MS;
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
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-auto block mx-auto touch-none select-none"
        style={{
          maxHeight: embedded ?
            'clamp(18rem, min(42vh, 520px), 36rem)'
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
        {[0, 0.5, 1].map((frac) => {
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
        <text
          x={PAD_L - 6}
          y={PAD_T + 22}
          fill="rgba(255,255,255,0.35)"
          fontSize="8"
          fontFamily="inherit"
          textAnchor="end">
          {hover ? t('chart.yHover') : hasProjectFocus ? t('chart.yCompany') : t('chart.yFirst')}
        </text>

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

        <text
          x={PAD_L}
          y={VB_H - 36}
          fill="rgba(255,255,255,0.42)"
          fontSize="10"
          fontFamily="inherit">
          {t('chart.fromStart')}
        </text>
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
        <text
          x={VB_W - PAD_R}
          y={VB_H - 36}
          fill="rgba(255,255,255,0.42)"
          fontSize="10"
          fontFamily="inherit"
          textAnchor="end">
          {t('chart.now')}
        </text>
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
          {series.map((s, idx) => {
            const color = strokeColorForSeries(series, s, idx);
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
      {(series.some((s) => s.kind === 'fxHist') || series.some((s) => s.kind === 'infHist')) &&
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
