import {
  type MoneyClockSavedState,
  type ProjectEntry,
  earningsTotalsByCurrency,
  normalizeCurrencyCode,
  projectIsEndedByDeadline,
  projectNominalHourlyFteInProjectCurrency,
  projectNominalMonthlyInProjectCurrency,
  balanceOnAccountAt,
  clampTakeHomeFraction
} from '../moneyClockPersistence';

/** Sanitized aggregates for the AI layer (no free-form profile blobs). */
export type AiMoneySnapshot = {
  generatedAtIso: string;
  localeHint: string;
  takeHomeFraction: number;
  lastPayrollYmd: string;
  balanceByCurrency: Record<string, number>;
  earningsByCurrency: Record<string, number>;
  selectedProjects: Array<{
    name: string;
    currency: string;
    billing: string;
    ended: boolean;
    nominalMonthly: number;
    nominalHourly: number;
  }>;
};

export function buildAiMoneySnapshot(
  state: MoneyClockSavedState,
  nowMs: number,
  localeHint: string
): AiMoneySnapshot {
  const bundle = state.projectsBundle;
  const selected = bundle.selectedProjectIds
    .map((id) => bundle.projects.find((p) => p.id === id))
    .filter((p): p is ProjectEntry => p != null);

  const earningsMap = earningsTotalsByCurrency(selected, nowMs);
  const earningsByCurrency: Record<string, number> = {};
  for (const [k, v] of earningsMap) {
    earningsByCurrency[k] = Math.round(v * 100) / 100;
  }

  const balanceCcy = normalizeCurrencyCode(state.currentBalanceCurrency);
  const bal = balanceOnAccountAt(
    selected,
    balanceCcy,
    parseFloat(String(state.currentBalance).replace(',', '.')) || 0,
    state.lastPayrollYmd,
    nowMs
  );
  const balanceByCurrency: Record<string, number> = { [balanceCcy]: Math.round(bal * 100) / 100 };

  return {
    generatedAtIso: new Date(nowMs).toISOString(),
    localeHint,
    takeHomeFraction: clampTakeHomeFraction(state.takeHomeFraction),
    lastPayrollYmd: state.lastPayrollYmd,
    balanceByCurrency,
    earningsByCurrency,
    selectedProjects: selected.map((p) => ({
      name: p.name,
      currency: normalizeCurrencyCode(p.currencyCode),
      billing: p.projectBilling,
      ended: projectIsEndedByDeadline(p, nowMs),
      nominalMonthly: Math.round(projectNominalMonthlyInProjectCurrency(p) * 100) / 100,
      nominalHourly: Math.round(projectNominalHourlyFteInProjectCurrency(p) * 100) / 100
    }))
  };
}
