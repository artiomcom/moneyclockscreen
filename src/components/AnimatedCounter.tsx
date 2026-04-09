import { useLayoutEffect, useRef, useState } from 'react';
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

const REEL_CYCLES = 3;
const REEL_LEN = REEL_CYCLES * 10;
/** Middle copy of 0–9 so 9→0 rolls forward without running out of strip */
const CANON = 10;

function shortestDigitStep(from: number, to: number): number {
  let diff = to - from;
  if (diff > 5) diff -= 10;
  if (diff < -5) diff += 10;
  return diff;
}

function getStaggerRank(formatted: string, index: number): number {
  let n = 0;
  for (let j = formatted.length - 1; j > index; j--) {
    if (/\d/.test(formatted[j])) n++;
  }
  return n;
}

function MoneyDigitReel({
  digit,
  staggerDelay
}: {
  digit: number;
  staggerDelay: number;
}) {
  const reduceMotion = useReducedMotion();
  const controls = useAnimationControls();
  const stripIndexRef = useRef(CANON + digit);
  const prevDigit = useRef(digit);
  const [rolling, setRolling] = useState(false);
  const runId = useRef(0);

  useLayoutEffect(() => {
    if (reduceMotion) {
      prevDigit.current = digit;
      stripIndexRef.current = CANON + digit;
      return;
    }

    const from = prevDigit.current;
    if (digit === from) return;

    const step = shortestDigitStep(from, digit);
    if (step === 0) {
      prevDigit.current = digit;
      return;
    }

    const next = stripIndexRef.current + step;
    stripIndexRef.current = next;
    prevDigit.current = digit;

    const id = ++runId.current;
    setRolling(true);

    void controls
      .start({
        y: `calc(${-next} * 1em)`,
        transition: {
          type: 'spring',
          stiffness: 198,
          damping: 22,
          mass: 0.62,
          delay: staggerDelay
        }
      })
      .then(() => {
        if (runId.current !== id) return;
        setRolling(false);
        const cur = stripIndexRef.current;
        if (cur < 10 || cur > 19) {
          const norm = CANON + prevDigit.current;
          stripIndexRef.current = norm;
          void controls.set({ y: `calc(${-norm} * 1em)` });
        }
      });
  }, [digit, reduceMotion, controls, staggerDelay]);

  const digits = Array.from({ length: REEL_LEN }, (_, i) => i % 10);

  if (reduceMotion) {
    return (
      <span className="inline-flex justify-center tabular-nums w-[0.58em] shrink-0">
        {digit}
      </span>
    );
  }

  return (
    <span
      className="money-reel-column inline-block overflow-hidden align-baseline tabular-nums w-[0.58em] shrink-0"
      style={{
        height: '1em',
        lineHeight: 1,
        perspective: '480px'
      }}>
      <motion.span
        className="money-reel-inner block will-change-transform"
        data-rolling={rolling ? '' : undefined}
        initial={{ y: `calc(${-(CANON + digit)} * 1em)` }}
        animate={controls}
        style={{ transformOrigin: '50% 48%' }}>
        {digits.map((n, i) => (
          <span
            key={i}
            className="money-reel-cell flex h-[1em] items-center justify-center font-[inherit] leading-none">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function PunctuationCell({ digit }: { digit: string }) {
  return (
    <span
      className="inline-block shrink-0 self-end leading-none"
      style={{
        width: digit === ',' ? '0.3em' : '0.45em'
      }}>
      {digit}
    </span>
  );
}

export function AnimatedCounter({
  value,
  prefix = '$',
  decimals = 2,
  className = ''
}: AnimatedCounterProps) {
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  const digitChars = formatted.split('');

  return (
    <motion.div
      className={`money-coma-counter flex items-baseline justify-center tabular-nums ${className}`}
      whileTap={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
      {prefix ? (
        <span
          className="money-coma-prefix inline-block shrink-0 mr-[0.2em] font-[inherit]"
          aria-hidden>
          {prefix}
        </span>
      ) : null}
      {digitChars.map((char, i) =>
        /\d/.test(char) ? (
          <MoneyDigitReel
            key={i}
            digit={parseInt(char, 10)}
            staggerDelay={getStaggerRank(formatted, i) * 0.036}
          />
        ) : (
          <PunctuationCell key={i} digit={char} />
        )
      )}
    </motion.div>
  );
}
