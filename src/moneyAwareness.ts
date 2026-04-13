/**
 * «Money Awareness Engine», иллюстративные метрики для мотивации и шэринга.
 * Процентиль, не опрос населения, а позиция на упрощённой лог-шкале EUR-якорей.
 */

import type { AppLocale } from './i18n/localeStorage';

const SECONDS_PER_YEAR = 365.25 * 86400;

/** Условные ступени годового дохода (EUR, брутто-ордер) → демо-процентиль на кривой */
const EUR_INCOME_LADDER: { yearEur: number; demoPercentile: number }[] = [
  { yearEur: 20_000, demoPercentile: 14 },
  { yearEur: 35_000, demoPercentile: 32 },
  { yearEur: 55_000, demoPercentile: 52 },
  { yearEur: 75_000, demoPercentile: 72 },
  { yearEur: 100_000, demoPercentile: 86 },
  { yearEur: 150_000, demoPercentile: 94 }
];

function yearlyEurToPerSec(yearEur: number): number {
  return yearEur / SECONDS_PER_YEAR;
}

/**
 * Где оказывается ставка €/сек на демо-лестнице (5…99).
 * Не путать с реальным распределением доходов в стране или мире.
 */
export function illustrativePercentileFromEurPerSec(eurPerSec: number): number {
  if (!Number.isFinite(eurPerSec) || eurPerSec <= 0) return 8;
  const rungs = EUR_INCOME_LADDER.map((r) => ({
    s: yearlyEurToPerSec(r.yearEur),
    p: r.demoPercentile
  }));
  if (eurPerSec <= rungs[0].s) {
    const ratio = Math.max(0.15, eurPerSec / rungs[0].s);
    return Math.max(5, Math.round(4 + ratio * (rungs[0].p - 4)));
  }
  for (let i = 0; i < rungs.length - 1; i++) {
    if (eurPerSec <= rungs[i + 1].s) {
      const la = Math.log(rungs[i].s);
      const lb = Math.log(rungs[i + 1].s);
      const lx = Math.log(eurPerSec);
      const t = (lx - la) / (lb - la);
      return Math.round(rungs[i].p + t * (rungs[i + 1].p - rungs[i].p));
    }
  }
  const last = rungs[rungs.length - 1];
  const ratio = eurPerSec / last.s;
  return Math.min(99, Math.round(last.p + Math.min(5, (ratio - 1) * 8)));
}

function formatRateForShare(rate: number): string {
  if (!Number.isFinite(rate) || rate < 0) return '0';
  if (rate >= 0.1) return rate.toFixed(2);
  if (rate >= 0.01) return rate.toFixed(3);
  return rate.toFixed(4);
}

export type MoneyAwarenessSharePayload = {
  ratePerSec: number;
  currencySymbol: string;
  currencyCode: string;
  /** Демо-процентиль по EUR-шкале; null если не удалось оценить */
  demoPercentile: number | null;
  appLabel?: string;
};

export function buildMoneyAwarenessShareLines(
  p: MoneyAwarenessSharePayload
): Record<AppLocale, string> {
  const sym = p.currencySymbol;
  const code = p.currencyCode;
  const r = p.ratePerSec;
  const rf = formatRateForShare(r);
  const perMin = formatRateForShare(r * 60);
  const app = p.appLabel ?? 'MoneyClock';
  const pct = p.demoPercentile;

  const line1: Record<AppLocale, string> = {
    en: `💸 ${app}: I'm earning ~+${sym}${rf}/sec (~${sym}${perMin}/min) in ${code}.`,
    ru: `💸 ${app}: мой темп +${sym}${rf}/сек (~${sym}${perMin}/мин) в ${code}.`,
    es: `💸 ${app}: mi ritmo +${sym}${rf}/s (~${sym}${perMin}/min) en ${code}.`,
    fr: `💸 ${app}: mon rythme +${sym}${rf}/s (~${sym}${perMin}/min) en ${code}.`,
    de: `💸 ${app}: mein Tempo +${sym}${rf}/s (~${sym}${perMin}/Min.) in ${code}.`,
    zh: `💸 ${app}：我的节奏 +${sym}${rf}/秒（约 ${sym}${perMin}/分钟），${code}。`,
    ja: `💸 ${app}: ペース +${sym}${rf}/秒（約 ${sym}${perMin}/分）、${code}。`,
    pt: `💸 ${app}: meu ritmo +${sym}${rf}/s (~${sym}${perMin}/min) em ${code}.`
  };

  const ladder: Record<AppLocale, string | null> =
    pct == null ?
      { en: null, ru: null, es: null, fr: null, de: null, zh: null, ja: null, pt: null }
    : {
        en: `📊 Demo ladder (not a real survey): above ~${pct}% of illustrative EUR income rungs.`,
        ru: `📊 Демо-шкала (не опрос людей): выше ~${pct}% условных «ступеней» EUR-дохода.`,
        es: `📊 Escala demo (no es una encuesta real): por encima del ~${pct}% en peldaños ilustrativos de ingreso en EUR.`,
        fr: `📊 Échelle démo (pas un vrai sondage) : au-dessus de ~${pct}% des barres illustratives de revenu en EUR.`,
        de: `📊 Demo-Leiter (keine echte Umfrage): über ~${pct}% der illustrativen EUR-Einkommensstufen.`,
        zh: `📊 演示阶梯（非真实调查）：高于约 ${pct}% 的示意性 EUR 收入档位。`,
        ja: `📊 デモラダー（実調査ではありません）：EUR 収入の示意段階で約上位 ${pct}%。`,
        pt: `📊 Escala demo (não é pesquisa real): acima de ~${pct}% dos degraus ilustrativos de renda em EUR.`
      };

  const footer: Record<AppLocale, string> = {
    en: `#MoneyClock #moneyawareness, awareness only, not advice.`,
    ru: `Оценка для осознанности, не финсовет.`,
    es: `#MoneyClock #moneyawareness, solo contexto, no asesoramiento.`,
    fr: `#MoneyClock #moneyawareness, prise de conscience seulement, pas un conseil.`,
    de: `#MoneyClock #moneyawareness, nur zur Einordnung, keine Beratung.`,
    zh: `#MoneyClock #moneyawareness, 仅供认知参考，非理财建议。`,
    ja: `#MoneyClock #moneyawareness, 認識用であり助言ではありません。`,
    pt: `#MoneyClock #moneyawareness, só para reflexão, não é aconselhamento.`
  };

  const locales: AppLocale[] = ['en', 'ru', 'es', 'fr', 'de', 'zh', 'ja', 'pt'];
  const out = {} as Record<AppLocale, string>;
  for (const loc of locales) {
    const mid = ladder[loc];
    out[loc] =
      mid != null ?
        [line1[loc], mid, '', footer[loc]].join('\n')
      : [line1[loc], '', footer[loc]].join('\n');
  }
  return out;
}
