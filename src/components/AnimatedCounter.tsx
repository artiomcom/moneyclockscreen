import { memo, useLayoutEffect, useRef, useState } from 'react';
import {
  motion,
  useAnimationControls,
  useReducedMotion
} from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  decimals?: number;
  className?: string;
}

/** Центральная копия 0–9 в ленте (индексы 10..19), чтобы 9→0 крутилось вперёд */
const STRIP_CENTER = 10;
const REEL_CYCLES = 3;
const REEL_LEN = REEL_CYCLES * 10;
const STAGGER_STEP = 0.036;
const REEL_SPRING = {
  type: 'spring' as const,
  stiffness: 198,
  damping: 22,
  mass: 0.62
};

type DisplayPart =
  | { kind: 'digit'; n: number; id: string }
  | { kind: 'sep'; ch: string; id: string };

/** Без toLocaleString — иначе NBSP ломают разбор строки. */
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

/** Сколько цифровых колонок правее этой (для каскада анимации). */
function digitsToTheRight(parts: DisplayPart[], index: number): number {
  let n = 0;
  for (let j = parts.length - 1; j > index; j--) {
    if (parts[j].kind === 'digit') n++;
  }
  return n;
}

/** Кратчайший шаг по кругу 0..9 */
function wrapDigitDelta(from: number, to: number): number {
  let d = to - from;
  if (d > 5) d -= 10;
  if (d < -5) d += 10;
  return d;
}

const REEL_STRIP = Array.from({ length: REEL_LEN }, (_, i) => i % 10);

const PUNCT_WIDTH: Record<string, string> = {
  ',': '0.65ch',
  '.': '0.55ch',
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

const MoneyDigitReel = memo(function MoneyDigitReel({
  digit,
  staggerDelay
}: {
  digit: number;
  staggerDelay: number;
}) {
  const reduceMotion = useReducedMotion();
  const controls = useAnimationControls();
  const stripIndex = useRef(STRIP_CENTER + digit);
  const prevDigit = useRef(digit);
  const [rolling, setRolling] = useState(false);
  const animGeneration = useRef(0);

  useLayoutEffect(() => {
    if (reduceMotion) {
      prevDigit.current = digit;
      stripIndex.current = STRIP_CENTER + digit;
      return;
    }

    const from = prevDigit.current;
    if (digit === from) {
      void controls.set({ y: `calc(${-stripIndex.current} * 1em)` });
      return;
    }

    const delta = wrapDigitDelta(from, digit);
    prevDigit.current = digit;
    stripIndex.current += delta;

    const gen = ++animGeneration.current;
    setRolling(true);

    void controls
      .start({
        y: `calc(${-stripIndex.current} * 1em)`,
        transition: { ...REEL_SPRING, delay: staggerDelay }
      })
      .then(() => {
        if (animGeneration.current !== gen) return;
        setRolling(false);
        const cur = stripIndex.current;
        if (cur < STRIP_CENTER || cur > STRIP_CENTER + 9) {
          stripIndex.current = STRIP_CENTER + digit;
          void controls.set({ y: `calc(${-stripIndex.current} * 1em)` });
        }
      });
  }, [digit, reduceMotion, controls, staggerDelay]);

  if (reduceMotion) {
    return (
      <span className="inline-flex w-[1ch] min-w-[1ch] max-w-[1ch] justify-center tabular-nums shrink-0">
        {digit}
      </span>
    );
  }

  const initialY = -(STRIP_CENTER + digit);

  return (
    <span
      className="money-reel-column inline-block overflow-hidden tabular-nums w-[1ch] min-w-[1ch] max-w-[1ch] shrink-0 self-center"
      style={{
        height: '1em',
        lineHeight: 1,
        perspective: '480px',
        isolation: 'isolate',
        contain: 'layout style'
      }}>
      <motion.span
        className="money-reel-inner block will-change-transform"
        data-rolling={rolling ? '' : undefined}
        initial={{ y: `calc(${initialY} * 1em)` }}
        animate={controls}
        style={{ transformOrigin: '50% 50%' }}>
        {REEL_STRIP.map((n, i) => (
          <span
            key={i}
            className="money-reel-cell flex h-[1em] w-full items-center justify-center font-[inherit] leading-none">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
});

export function AnimatedCounter({
  value,
  prefix = '$',
  decimals = 2,
  className = ''
}: AnimatedCounterProps) {
  const parts = buildMoneyDisplayParts(value, decimals);

  return (
    <motion.div
      className={`money-coma-counter flex items-center justify-center gap-0 tabular-nums ${className}`}
      whileTap={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
      {prefix ?
        <span
          className="money-coma-prefix inline-block shrink-0 mr-[0.15em] font-[inherit]"
          aria-hidden>
          {prefix}
        </span>
      : null}
      {parts.map((part, i) =>
        part.kind === 'digit' ?
          <MoneyDigitReel
            key={part.id}
            digit={part.n}
            staggerDelay={digitsToTheRight(parts, i) * STAGGER_STEP}
          />
        : <PunctuationCell key={part.id} ch={part.ch} />
      )}
    </motion.div>
  );
}
