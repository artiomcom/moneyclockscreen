import { useCallback, useMemo, useRef, useState } from 'react';
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

const STEPS = 64;
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
  kind: 'projects' | 'balance' | 'fx';
};

const LINE_COLORS = ['#ffffff', '#fef9c3', '#bbf7d0', '#a5f3fc', '#e9d5ff'];
const BALANCE_LINE = '#fde68a';
const FX_MERGE_LINE = '#fb7185';

function strokeColorForSeries(all: Series[], s: Series, idx: number): string {
  if (s.kind === 'balance') return BALANCE_LINE;
  if (s.kind === 'fx') return FX_MERGE_LINE;
  const n = all.slice(0, idx).filter((x) => x.kind === 'projects').length;
  return LINE_COLORS[n % LINE_COLORS.length];
}

function buildIncomeSeries(
  projects: ProjectEntry[],
  nowMs: number,
  balanceInput?: {
    amount: number;
    currency: string;
    lastPayrollYmd: string;
  },
  fxMerge?: { snapshot: FxSnapshot; targetCode: string } | null
): { series: Series[]; tMin: number; tMax: number } {
  if (projects.length === 0) {
    return { series: [], tMin: 0, tMax: 0 };
  }

  const starts = projects
    .map((p) => (p.workStartDate.trim() ? parseLocalDateYmd(p.workStartDate) : null))
    .filter((t): t is number => t != null);

  if (starts.length === 0) {
    return { series: [], tMin: 0, tMax: 0 };
  }

  /** Самая ранняя дата начала работы среди всех проектов (полночь локального дня). */
  const tMin = Math.min(...starts);
  /** Ось времени до текущего момента; накопления после конца проекта на линии не растут (см. projectEarningsAt). */
  const tMax = nowMs > tMin ? nowMs : tMin + DAY_MS;

  const byCcy = new Map<string, ProjectEntry[]>();
  for (const p of projects) {
    const c = normalizeCurrencyCode(p.currencyCode);
    if (!byCcy.has(c)) byCcy.set(c, []);
    byCcy.get(c)!.push(p);
  }

  const series: Series[] = [];

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
      label: `${code} · проекты`,
      points,
      kind: 'projects'
    });
  }

  series.sort((a, b) => a.code.localeCompare(b.code));

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
      label: `${bCode} · счёт`,
      points: balPoints,
      kind: 'balance'
    });
  }

  if (fxMerge && projects.length > 0) {
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
        label: `${target} · все проекты (курс)`,
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

function formatChartAxisDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatChartAxisNowDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatChartAxisTime(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatMoneyAmount(n: number): string {
  if (!Number.isFinite(n)) return '0,00';
  return n.toLocaleString(undefined, {
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
  fxSnapshot = null
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
}) {
  const { series, tMin, tMax } = useMemo(
    () =>
      buildIncomeSeries(
        projects,
        nowMs,
        {
          amount: balanceAfterPayroll,
          currency: balanceCurrency,
          lastPayrollYmd
        },
        fxSnapshot ?
          { snapshot: fxSnapshot, targetCode: balanceCurrency }
        : null
      ),
    [projects, nowMs, balanceAfterPayroll, balanceCurrency, lastPayrollYmd, fxSnapshot]
  );

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
          : 'rounded-2xl bg-white/10 border border-white/20 px-4 py-8 text-center text-white/60 text-sm font-medium backdrop-blur-sm w-full max-w-[min(100%,42rem)]'
        }
        role="img"
        aria-label="График дохода">
        Укажите дату начала у проекта — появится график накопленного дохода.
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
    : series.find((s) => s.kind === 'projects') ??
      series.find((s) => s.kind === 'fx') ??
      series[0];
  const yAxisRaw = seriesRawBounds(focusSeries.points);

  const shellClass = embedded ?
    'w-full min-w-0 relative'
  : 'rounded-2xl bg-white/10 border border-white/20 px-3 sm:px-5 pt-4 pb-3 backdrop-blur-sm shadow-lg w-full max-w-[min(100%,42rem)] relative';

  return (
    <div
      ref={wrapRef}
      className={shellClass}
      role="img"
      aria-label="График накопленного дохода по проектам и остатка на счёте">
      {!embedded &&
      <p className="text-white/85 text-xs sm:text-sm font-bold text-center uppercase tracking-wide mb-2 px-1">
        Проекты и счёт
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
                <stop offset="0%" stopColor={c} stopOpacity={s.kind === 'balance' ? '0.22' : '0.35'} />
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
                opacity: dim ? 0.28 : 1,
                transition: 'opacity 0.15s ease'
              }}>
              <path d={areaD} fill={`url(#income-fill-${s.id})`} />
              <path
                d={lineD}
                fill="none"
                stroke={color}
                strokeWidth={isHi ? 4.2 : 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={s.kind === 'balance' ? '5 4' : undefined}
                style={{
                  filter:
                    isHi ?
                      'drop-shadow(0 0 8px rgba(255,255,255,0.55))'
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
          {formatCompact(yAxisRaw.maxV)} {getCurrencySymbol(focusSeries.code)}
        </text>
        <text
          x={PAD_L - 6}
          y={y0 - 1}
          fill="rgba(255,255,255,0.55)"
          fontSize="9"
          fontFamily="inherit"
          textAnchor="end"
          style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCompact(yAxisRaw.minV)} {getCurrencySymbol(focusSeries.code)}
        </text>
        <text
          x={PAD_L - 6}
          y={PAD_T + 22}
          fill="rgba(255,255,255,0.35)"
          fontSize="8"
          fontFamily="inherit"
          textAnchor="end">
          {hover ? 'Y: линия под курсором' : 'Y: первая в списке'}
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
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            pointerEvents="none"
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
                  opacity: hover.seriesId === s.id ? 1 : 0.8
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
          с начала (раньше всех)
        </text>
        <text
          x={PAD_L}
          y={VB_H - 18}
          fill="rgba(255,255,255,0.78)"
          fontSize="12"
          fontFamily="inherit"
          fontWeight="600">
          {formatChartAxisDate(tMin)}
        </text>
        {showMidDate &&
        <text
          x={midX}
          y={VB_H - 18}
          fill="rgba(255,255,255,0.55)"
          fontSize="10"
          fontFamily="inherit"
          textAnchor="middle">
          {formatChartAxisDate(midMs)}
        </text>
        }
        <text
          x={VB_W - PAD_R}
          y={VB_H - 36}
          fill="rgba(255,255,255,0.42)"
          fontSize="10"
          fontFamily="inherit"
          textAnchor="end">
          сейчас
        </text>
        <text
          x={VB_W - PAD_R}
          y={VB_H - 20}
          fill="rgba(255,255,255,0.78)"
          fontSize="12"
          fontFamily="inherit"
          fontWeight="600"
          textAnchor="end">
          {formatChartAxisNowDate(nowMs)}
        </text>
        <text
          x={VB_W - PAD_R}
          y={VB_H - 4}
          fill="rgba(255,255,255,0.62)"
          fontSize="11"
          fontFamily="inherit"
          textAnchor="end"
          style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatChartAxisTime(nowMs)}
        </text>
      </svg>

      {hover &&
      <div
        className="pointer-events-none absolute z-20 rounded-xl border border-white/25 bg-black/80 px-2.5 py-2 text-[0.7rem] sm:text-xs text-white shadow-xl backdrop-blur-md max-w-[min(18rem,calc(100%-1rem))]"
        style={{
          left: hover.tipX,
          top: hover.tipY,
          transform: 'translate(-50%, calc(-100% - 10px))'
        }}>
        <p className="font-bold text-white/90 mb-1.5 border-b border-white/15 pb-1">
          {formatChartAxisDate(hover.t)}
        </p>
        <ul className="space-y-1 font-medium">
          {series.map((s, idx) => {
            const color = strokeColorForSeries(series, s, idx);
            const val = interpolateValueAtT(s.points, hover.t);
            const active = s.id === hover.seriesId;
            return (
              <li
                key={s.id}
                className={`flex items-baseline justify-between gap-3 ${active ? 'text-white' : 'text-white/65'}`}>
                <span className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="inline-block w-2 h-0.5 rounded-full shrink-0"
                    style={{
                      background: color,
                      ...(s.kind === 'balance' ?
                        {
                          background: 'repeating-linear-gradient(90deg, #fde68a 0 3px, transparent 3px 6px)'
                        }
                      : {})
                    }}
                  />
                  <span className="truncate">{s.label}</span>
                </span>
                <span
                  className="shrink-0 tabular-nums"
                  style={{ fontWeight: active ? 800 : 600 }}>
                  {getCurrencySymbol(s.code)}
                  {formatMoneyAmount(val)}
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
          return (
            <span
              key={s.id}
              className="text-[0.7rem] sm:text-xs font-bold text-white/80 inline-flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-1 rounded-full shrink-0"
                style={{
                  background: color,
                  ...(s.kind === 'balance' ?
                    {
                      background: 'repeating-linear-gradient(90deg, #fde68a 0 3px, transparent 3px 6px)'
                    }
                  : {})
                }}
              />
              {s.label} ({getCurrencySymbol(s.code)}) · {formatCompact(peak)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
