import {
  memo,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties
} from 'react';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  decimals?: number;
  className?: string;
  /** Падающие «денежные листья» на фоне, только для крупных hero-сумм. */
  atmosphere?: boolean;
  leavesCount?: number;
}

type DisplayPart =
  | { kind: 'digit'; n: number; id: string }
  | { kind: 'sep'; ch: string; id: string };

function buildMoneyDisplayParts(value: number, decimals: number): DisplayPart[] {
  const d = Math.max(0, Math.min(20, Math.floor(decimals)));
  const finite = Number.isFinite(value) ? value : 0;
  const neg = finite < 0;
  const abs = Math.abs(finite);
  const fixed = abs.toFixed(d);
  const dotIdx = fixed.indexOf('.');
  const intRaw = dotIdx >= 0 ? fixed.slice(0, dotIdx) : fixed;
  const frac = dotIdx >= 0 ? fixed.slice(dotIdx + 1) : '';
  const intGrouped = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const parts: DisplayPart[] = [];
  let uid = 0;
  const nid = () => `p${uid++}`;

  if (neg) parts.push({ kind: 'sep', ch: '\u2212', id: nid() });

  for (const ch of intGrouped) {
    if (ch === ',') parts.push({ kind: 'sep', ch: ',', id: nid() });
    else if (/\d/.test(ch)) {
      parts.push({ kind: 'digit', n: parseInt(ch, 10), id: nid() });
    }
  }
  if (d > 0) {
    parts.push({ kind: 'sep', ch: '.', id: 'dot' });
    for (let i = 0; i < frac.length; i++) {
      parts.push({ kind: 'digit', n: parseInt(frac[i], 10), id: `f${i}` });
    }
  }
  return parts;
}

const PUNCT_WIDTH: Record<string, string> = {
  ',': '0.65ch',
  /** Must stay readable in flex rows (e.g. hero /sec); too narrow reads as "000558" instead of "0.00558". */
  '.': 'min(1ch, 0.85em)',
  '\u2212': '0.7ch'
};

function PunctuationCell({ ch }: { ch: string }) {
  const w = PUNCT_WIDTH[ch] ?? '0.5ch';
  return (
    <span
      className="inline-flex shrink-0 select-none items-center justify-center self-center font-[inherit] tabular-nums leading-none"
      style={{ width: w, minWidth: w, maxWidth: w }}>
      {ch}
    </span>
  );
}

const DigitCell = memo(function DigitCell({ id, n }: { id: string; n: number }) {
  return (
    <span
      key={`${id}-${n}`}
      className="money-digit-static inline-flex w-[1ch] min-w-[1ch] max-w-[1ch] justify-center tabular-nums shrink-0 self-center font-[inherit] leading-none">
      {n}
    </span>
  );
});

type MoneyLeafData = {
  id: number;
  leftPct: number;
  size: number;
  duration: number;
  delay: number;
  rotateStart: number;
  rotateEnd: number;
  drift: number;
  blur: number;
  opacity: number;
  shapeSkew: number;
};

function buildLeaves(count: number): MoneyLeafData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    leftPct: Math.random() * 100,
    size: 12 + Math.random() * 16,
    duration: 9 + Math.random() * 9,
    delay: Math.random() * 9,
    rotateStart: -40 + Math.random() * 80,
    rotateEnd: -200 + Math.random() * 400,
    drift: -55 + Math.random() * 110,
    blur: Math.random() * 0.55,
    opacity: 0.1 + Math.random() * 0.2,
    shapeSkew: 0.82 + Math.random() * 0.36
  }));
}

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Абстрактный «лист» / вытянутый ромб: изумруд, золото, жилка по центру. */
const MoneyLeafSvg = memo(function MoneyLeafSvg({
  gradId,
  skew
}: {
  gradId: string;
  skew: number;
}) {
  return (
    <svg
      viewBox="0 0 24 52"
      className="block h-full w-auto overflow-visible"
      style={{ transform: `scaleX(${skew})` }}
      aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(52, 211, 153, 0.92)" />
          <stop offset="45%" stopColor="rgba(16, 185, 129, 0.75)" />
          <stop offset="100%" stopColor="rgba(212, 175, 55, 0.55)" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradId})`}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="0.6"
        d="M12 1.5c5.5 4 9 14 9 24.5s-3.5 20.5-9 25.5c-5.5-5-9-15-9-25.5S6.5 5.5 12 1.5z"
      />
      <path
        d="M12 9v34"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
    </svg>
  );
});

const MoneyLeaf = memo(function MoneyLeaf({ leaf }: { leaf: MoneyLeafData }) {
  const reactId = useId().replace(/:/g, '');
  const gradId = `ml-${leaf.id}-${reactId}`;

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-[-18%] will-change-transform money-atmosphere-leaf"
      style={
        {
          left: `${leaf.leftPct}%`,
          height: leaf.size,
          width: leaf.size * 0.48,
          animation: `money-leaf-fall ${leaf.duration}s linear ${leaf.delay}s infinite`,
          filter: `blur(${leaf.blur}px)`,
          opacity: leaf.opacity,
          '--ml-rotate-start': `${leaf.rotateStart}deg`,
          '--ml-rotate-end': `${leaf.rotateEnd}deg`,
          '--ml-drift': `${leaf.drift}px`
        } as CSSProperties
      }>
      <span className="money-atmosphere-leaf-glass inline-flex h-full w-full items-center justify-center rounded-[0.2em] border border-white/[0.08] bg-emerald-400/[0.06] shadow-[0_0_18px_rgba(16,185,129,0.12)] backdrop-blur-[0.5px]">
        <MoneyLeafSvg gradId={gradId} skew={leaf.shapeSkew} />
      </span>
    </span>
  );
});

export function AnimatedCounter({
  value,
  prefix = '$',
  decimals = 2,
  className = '',
  atmosphere = false,
  leavesCount = 14
}: AnimatedCounterProps) {
  const parts = buildMoneyDisplayParts(value, decimals);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const leaves = useMemo(
    () => buildLeaves(Math.max(4, Math.min(28, leavesCount))),
    [leavesCount]
  );

  const prevValue = useRef<number | null>(null);
  const [burst, setBurst] = useState(false);
  const [burstLeaves, setBurstLeaves] = useState(false);

  useEffect(() => {
    if (!atmosphere || reduceMotion) {
      prevValue.current = value;
      return;
    }
    if (prevValue.current !== null && value > prevValue.current) {
      setBurst(true);
      setBurstLeaves(true);
      const a = window.setTimeout(() => setBurst(false), 420);
      const b = window.setTimeout(() => setBurstLeaves(false), 1100);
      prevValue.current = value;
      return () => {
        window.clearTimeout(a);
        window.clearTimeout(b);
      };
    }
    prevValue.current = value;
  }, [value, atmosphere, reduceMotion]);

  const showLeaves = atmosphere && !reduceMotion;
  const leafList = useMemo(() => {
    if (!burstLeaves || !showLeaves) return leaves;
    const extra = leaves.slice(0, 6).map((L, i) => ({
      ...L,
      id: 1000 + i,
      delay: L.delay * 0.35,
      opacity: Math.min(0.38, L.opacity * 1.2),
      leftPct: (L.leftPct + i * 7) % 100
    }));
    return [...leaves, ...extra];
  }, [leaves, burstLeaves, showLeaves]);

  const inner = (
    <>
      {prefix ?
        <span
          className="money-coma-prefix inline-block shrink-0 mr-[0.15em] font-[inherit]"
          aria-hidden>
          {prefix}
        </span>
      : null}
      {parts.map(part =>
        part.kind === 'digit' ?
          <DigitCell key={part.id} id={part.id} n={part.n} />
        : <PunctuationCell key={part.id} ch={part.ch} />
      )}
    </>
  );

  if (!atmosphere) {
    return (
      <div
        className={`money-coma-counter inline-flex shrink-0 items-center justify-center gap-0 whitespace-nowrap tabular-nums ${className}`}>
        {inner}
      </div>
    );
  }

  return (
    <div
      className={`relative isolate inline-flex max-w-full flex-col items-stretch justify-center ${className} money-atmosphere ${
        burst ? 'money-atmosphere--burst' : ''
      }`}>
      {showLeaves ?
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[1.25em] min-h-[2.5em] min-w-[6rem]"
          aria-hidden>
          {leafList.map((leaf) => (
            <MoneyLeaf key={leaf.id} leaf={leaf} />
          ))}
        </div>
      : null}
      <div className="money-atmosphere-digits relative z-10 inline-flex min-w-0 items-center justify-center px-1 py-0 sm:px-0">
        <div className="money-coma-counter inline-flex shrink-0 items-center justify-center gap-0 whitespace-nowrap tabular-nums">
          {inner}
        </div>
      </div>
    </div>
  );
}
