import type { BlendedInflationYear } from './worldBankInflation';
import { clampTakeHomeFraction } from './moneyClockPersistence';

const SECONDS_PER_HOUR = 3600;

export type RealEarningsRateBreakdown = {
  nominalPerHour: number;
  afterTaxPerHour: number;
  /** В «ценах предыдущего года» по шагу CPI; null если мало данных */
  purchasingPowerPerHour: number | null;
  /** Доля роста цен за последний год в серии: I_end/I_prev − 1 */
  inflationYoYFraction: number | null;
  /** Год конечной точки индекса для подписи */
  inflationEndYear: number | null;
};

/**
 * Номинальная и «реальная» почасовая ставка из €/сек, доли на руки и годового CPI (как на графике).
 */
export function computeRealEarningsRateBreakdown(
  nominalPerSecond: number,
  takeHomeFraction: number,
  inflationYearly: BlendedInflationYear[] | null | undefined
): RealEarningsRateBreakdown {
  const sec = Number.isFinite(nominalPerSecond) ? nominalPerSecond : 0;
  const th = clampTakeHomeFraction(takeHomeFraction);
  const nominalPerHour = sec * SECONDS_PER_HOUR;
  const afterTaxPerHour = nominalPerHour * th;

  const series = inflationYearly?.length ?
    [...inflationYearly].sort((a, b) => a.year - b.year)
  : [];
  if (series.length < 2) {
    return {
      nominalPerHour,
      afterTaxPerHour,
      purchasingPowerPerHour: null,
      inflationYoYFraction: null,
      inflationEndYear: null
    };
  }
  const prev = series[series.length - 2]!;
  const end = series[series.length - 1]!;
  if (
    !(prev.index > 0) ||
    !Number.isFinite(prev.index) ||
    !Number.isFinite(end.index)
  ) {
    return {
      nominalPerHour,
      afterTaxPerHour,
      purchasingPowerPerHour: null,
      inflationYoYFraction: null,
      inflationEndYear: null
    };
  }
  const pi = end.index / prev.index - 1;
  const denom = 1 + pi;
  if (!Number.isFinite(pi) || denom <= 0) {
    return {
      nominalPerHour,
      afterTaxPerHour,
      purchasingPowerPerHour: null,
      inflationYoYFraction: null,
      inflationEndYear: end.year
    };
  }
  return {
    nominalPerHour,
    afterTaxPerHour,
    purchasingPowerPerHour: afterTaxPerHour / denom,
    inflationYoYFraction: pi,
    inflationEndYear: end.year
  };
}
