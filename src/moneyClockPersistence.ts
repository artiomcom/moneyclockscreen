/** В приложении остались только проекты; в JSON могут встречаться устаревшие значения. */
export type Mode = 'project';

/** Коды валют для проектов и баланса (ISO 4217, где уместно) */
export const MONEYCLOCK_CURRENCIES: readonly {
  code: string;
  symbol: string;
  labelRu: string;
  labelEn: string;
}[] = [
  { code: 'USD', symbol: '$', labelRu: 'Доллар США (USD)', labelEn: 'US dollar (USD)' },
  { code: 'EUR', symbol: '€', labelRu: 'Евро (EUR)', labelEn: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', labelRu: 'Фунт (GBP)', labelEn: 'Pound sterling (GBP)' },
  { code: 'MDL', symbol: 'L', labelRu: 'Молдавский лей (MDL)', labelEn: 'Moldovan leu (MDL)' },
  { code: 'RON', symbol: 'lei', labelRu: 'Румынский лей (RON)', labelEn: 'Romanian leu (RON)' },
  { code: 'UAH', symbol: '₴', labelRu: 'Гривна (UAH)', labelEn: 'Hryvnia (UAH)' },
  { code: 'RUB', symbol: '₽', labelRu: 'Рубль (RUB)', labelEn: 'Ruble (RUB)' },
  { code: 'CHF', symbol: 'Fr', labelRu: 'Швейцарский франк (CHF)', labelEn: 'Swiss franc (CHF)' },
  { code: 'TRY', symbol: '₺', labelRu: 'Лира (TRY)', labelEn: 'Turkish lira (TRY)' },
  { code: 'PLN', symbol: 'zł', labelRu: 'Злотый (PLN)', labelEn: 'Złoty (PLN)' }
];

export const DEFAULT_CURRENCY_CODE = 'USD';

export function normalizeCurrencyCode(raw: string | undefined | null): string {
  const u = String(raw ?? '')
    .trim()
    .toUpperCase();
  if (MONEYCLOCK_CURRENCIES.some((c) => c.code === u)) return u;
  return DEFAULT_CURRENCY_CODE;
}

export function getCurrencySymbol(code: string): string {
  const c = MONEYCLOCK_CURRENCIES.find(
    (x) => x.code === normalizeCurrencyCode(code)
  );
  return c?.symbol ?? '$';
}

export type VacationEntry = {
  id: string;
  /** Inclusive start, `YYYY-MM-DD` local */
  startDate: string;
  /** Inclusive end, `YYYY-MM-DD` local */
  endDate: string;
};

/** Как интерпретировать `projectAmount` при расчёте ставки */
export type ProjectBillingMode = 'contract' | 'monthly' | 'hourly';

export function normalizeProjectBillingMode(raw: unknown): ProjectBillingMode {
  if (raw === 'monthly' || raw === 'hourly' || raw === 'contract') return raw;
  return 'contract';
}

export type ProjectEntry = {
  id: string;
  name: string;
  /**
   * Сумма в зависимости от `projectBilling`:
   * - contract, вся сумма контракта (ставка = сумма / календарный срок до даты окончания);
   * - monthly, фиксированный месячный платёж (как зарплата: 22×8 ч в «месяце»);
   * - hourly, ставка за один рабочий час.
   */
  projectAmount: string;
  projectBilling: ProjectBillingMode;
  projMonths: string;
  projDays: string;
  projHours: string;
  projMinutes: string;
  workedMonths: string;
  workedDays: string;
  workedHours: string;
  workedMinutes: string;
  /** Local calendar date `YYYY-MM-DD`; empty = not used */
  workStartDate: string;
  /** Inclusive last day of the project; empty = still ongoing, caps time used for totals */
  projectEndDate: string;
  /** Past and planned vacations; time inside these ranges is not billed from work start */
  vacations: VacationEntry[];
  /** Валюта суммы и ставки проекта (USD, EUR, MDL, …) */
  currencyCode: string;
};

export type ProjectsBundle = {
  projects: ProjectEntry[];
  activeProjectId: string;
  /** Проекты, которые суммируются на главном экране и показываются виджетами */
  selectedProjectIds: string[];
};

/**
 * Embedded CV / portfolio JSON (same structure as profile-*.json).
 * Stored and re-exported with app state; does not affect earnings math.
 */
export type MoneyClockProfile = Record<string, unknown>;

export type MoneyClockSavedState = {
  mode: Mode;
  monthlySalary: string;
  hourlyRate: string;
  projectsBundle: ProjectsBundle;
  workedMonths: string;
  workedDays: string;
  workedHours: string;
  workedMinutes: string;
  /**
   * Сумма на счёте после последней зарплаты (на дату lastPayrollYmd). На экране к ней
   * прибавляется линейное начисление со следующего календарного дня после этой даты.
   */
  currentBalance: string;
  /** Валюта стартового баланса и режимов зарплата/час */
  currentBalanceCurrency: string;
  /**
   * День последней зарплаты (локальный календарь). Поле «на счёте», на момент после этой
   * выплаты; начисление к остатку, с 00:00 следующего дня до текущего момента.
   */
  lastPayrollYmd: string;
  /**
   * Доля начисления, которая остаётся «на руки» после налогов и взносов (оценка, 0…1).
   * 1 = вся сумма контракта как сейчас в расчётах.
   */
  takeHomeFraction: number;
  /**
   * Локальное окно «Сегодня» и полосы дня: час начала (0–23) и час конца (start+1…24).
   * 24 = полночь конца календарного дня.
   */
  dayMeterStartHour: number;
  dayMeterEndHour: number;
  /** Optional: резюме и метаданные рядом с настройками MoneyClock */
  profile?: MoneyClockProfile;
};

const STORAGE_KEY = 'moneyclock.v1';
const FILE_VERSION = 1 as const;

type StoredPayload = {
  v: typeof FILE_VERSION;
} & MoneyClockSavedState;

function isLegacyModeField(x: unknown): boolean {
  return x === 'project' || x === 'salary' || x === 'hourly';
}

export const DEFAULT_DAY_METER_START_HOUR = 8;
export const DEFAULT_DAY_METER_END_HOUR = 18;

/** Окно дня на герое: по умолчанию 8→18; конец 24 = полночь. */
export function normalizeDayMeterHours(
  rawStart: unknown,
  rawEnd: unknown
): { start: number; end: number } {
  const parseH = (x: unknown): number => {
    if (typeof x === 'number' && Number.isFinite(x)) return Math.trunc(x);
    if (typeof x === 'string' && x.trim() !== '') {
      const n = parseInt(x, 10);
      if (Number.isFinite(n)) return n;
    }
    return NaN;
  };
  let start = parseH(rawStart);
  let end = parseH(rawEnd);
  if (!Number.isFinite(start)) start = DEFAULT_DAY_METER_START_HOUR;
  if (!Number.isFinite(end)) end = DEFAULT_DAY_METER_END_HOUR;
  start = Math.min(23, Math.max(0, start));
  end = Math.min(24, Math.max(1, end));
  if (end <= start) {
    start = DEFAULT_DAY_METER_START_HOUR;
    end = DEFAULT_DAY_METER_END_HOUR;
  }
  return { start, end };
}

export function formatHourClockLabel(h: number): string {
  if (h >= 24) return '24:00';
  const c = Math.min(23, Math.max(0, Math.trunc(h)));
  return `${String(c).padStart(2, '0')}:00`;
}

/** Парсинг доли «на руки» из сохранённого JSON; по умолчанию 1. */
export function clampTakeHomeFraction(raw: unknown): number {
  const n =
    typeof raw === 'number' ?
      raw
    : typeof raw === 'string' ?
      parseFloat(raw.replace(',', '.'))
    : NaN;
  if (!Number.isFinite(n)) return 1;
  return Math.min(1, Math.max(0, n));
}

function isStr(x: unknown): x is string {
  return typeof x === 'string';
}

function isNonEmptyString(x: unknown): x is string {
  return typeof x === 'string' && x.length > 0;
}

function isVacationEntry(x: unknown): x is VacationEntry {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    isNonEmptyString(o.id) &&
    typeof o.startDate === 'string' &&
    typeof o.endDate === 'string'
  );
}

function isProjectEntry(x: unknown): x is ProjectEntry {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    isNonEmptyString(o.id) &&
    typeof o.name === 'string' &&
    isStr(o.projectAmount) &&
    isStr(o.projMonths) &&
    isStr(o.projDays) &&
    isStr(o.projHours) &&
    isStr(o.projMinutes) &&
    isStr(o.workedMonths) &&
    isStr(o.workedDays) &&
    isStr(o.workedHours) &&
    isStr(o.workedMinutes) &&
    (o.workStartDate === undefined || typeof o.workStartDate === 'string') &&
    (o.projectEndDate === undefined || typeof o.projectEndDate === 'string') &&
    (o.vacations === undefined ||
      (Array.isArray(o.vacations) && o.vacations.every(isVacationEntry)))
  );
}

function isProjectsBundle(x: unknown): x is Omit<ProjectsBundle, 'selectedProjectIds'> {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  if (!Array.isArray(o.projects) || !isNonEmptyString(o.activeProjectId)) return false;
  if (!o.projects.every(isProjectEntry)) return false;
  if (o.projects.length === 0) return false;
  return o.projects.some((p) => p.id === o.activeProjectId);
}

function normalizeSelectedProjectIds(
  projects: ProjectEntry[],
  activeProjectId: string,
  raw: unknown
): string[] {
  const valid = new Set(projects.map((p) => p.id));
  if (!valid.has(activeProjectId)) return [projects[0].id];
  if (Array.isArray(raw) && raw.length > 0 && raw.every(isStr)) {
    const uniq: string[] = [];
    const seen = new Set<string>();
    for (const id of raw) {
      if (valid.has(id) && !seen.has(id)) {
        seen.add(id);
        uniq.push(id);
      }
    }
    if (uniq.length > 0) return uniq;
  }
  return [activeProjectId];
}

function parsePayload(data: unknown): MoneyClockSavedState | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  if (o.v !== undefined && o.v !== FILE_VERSION) return null;
  if (o.mode !== undefined && !isLegacyModeField(o.mode)) return null;
  if (!isProjectsBundle(o.projectsBundle)) return null;
  const bundle = o.projectsBundle;
  const bundleRaw = o.projectsBundle as Record<string, unknown>;
  const selectedProjectIds = normalizeSelectedProjectIds(
    bundle.projects,
    bundle.activeProjectId,
    bundleRaw.selectedProjectIds
  );
  const profile =
    o.profile !== undefined && o.profile !== null && typeof o.profile === 'object' &&
    !Array.isArray(o.profile) ?
      (o.profile as MoneyClockProfile)
    : undefined;

  const dayMeter = normalizeDayMeterHours(o.dayMeterStartHour, o.dayMeterEndHour);

  return {
    mode: 'project',
    monthlySalary: '0',
    hourlyRate: '0',
    currentBalance: isStr(o.currentBalance) ? o.currentBalance : '0',
    currentBalanceCurrency: normalizeCurrencyCode(
      isStr(o.currentBalanceCurrency) ? o.currentBalanceCurrency : undefined
    ),
    lastPayrollYmd:
      isStr(o.lastPayrollYmd) && /^\d{4}-\d{2}-\d{2}$/.test(o.lastPayrollYmd.trim()) ?
        o.lastPayrollYmd.trim()
      : localTodayYmd(),
    takeHomeFraction: clampTakeHomeFraction(o.takeHomeFraction),
    dayMeterStartHour: dayMeter.start,
    dayMeterEndHour: dayMeter.end,
    projectsBundle: {
      ...bundle,
      selectedProjectIds,
      projects: bundle.projects.map((p) => ({
        ...p,
        workStartDate: typeof p.workStartDate === 'string' ? p.workStartDate : '',
        projectEndDate: typeof p.projectEndDate === 'string' ? p.projectEndDate : '',
        vacations:
          Array.isArray(p.vacations) && p.vacations.every(isVacationEntry) ?
            p.vacations
          : [],
        currencyCode: normalizeCurrencyCode(
          isStr(p.currencyCode) ? p.currencyCode : undefined
        ),
        projectBilling: normalizeProjectBillingMode(
          typeof p === 'object' && p && 'projectBilling' in p ?
            (p as { projectBilling: unknown }).projectBilling
          : undefined
        )
      }))
    },
    workedMonths: '0',
    workedDays: '0',
    workedHours: '0',
    workedMinutes: '0',
    ...(profile !== undefined ? { profile } : {})
  };
}

/** Start of local calendar day for `YYYY-MM-DD`; null if invalid or empty */
export function parseLocalDateYmd(ymd: string): number | null {
  const s = ymd.trim();
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const t = new Date(+m[1], +m[2] - 1, +m[3], 0, 0, 0, 0).getTime();
  return Number.isNaN(t) ? null : t;
}

/**
 * Секунды с полуночи календарного дня, следующего за днём последней зарплаты, до `nowMs`.
 * Сумма в `currentBalance` задаётся на момент после выплаты в `lastPayrollYmd`.
 */
export function balanceAccrualSecondsSincePayroll(
  lastPayrollYmd: string,
  nowMs: number
): number {
  const pay = parseLocalDateYmd(lastPayrollYmd);
  if (pay == null) return 0;
  const startNext = pay + 86400000;
  if (nowMs <= startNext) return 0;
  return (nowMs - startNext) / 1000;
}

/**
 * Остаток на счёте к моменту `nowMs`: сумма после выплаты в `lastPayrollYmd` плюс изменение
 * накоплений по выбранным проектам с полуночи следующего дня после зарплаты.
 * Проекты в валюте счёта — напрямую; в других валютах — через `convertToBalance` (тот же смысл,
 * что пересчёт ставки в блоке «Сегодня»), иначе такие проекты не дают доначисления к этой цифре.
 */
export function balanceOnAccountAt(
  projects: ProjectEntry[],
  balanceCurrency: string,
  currentBalanceAfterPayroll: number,
  lastPayrollYmd: string,
  nowMs: number,
  convertToBalance?: (amount: number, fromCurrencyCode: string) => number | null
): number {
  const pay = parseLocalDateYmd(lastPayrollYmd.trim());
  if (pay == null) return currentBalanceAfterPayroll;
  const accrualStartMs = pay + 86400000;
  // До полуночи дня после зарплаты дельта не считаем (иначе на ранних t на графике, минус).
  if (nowMs <= accrualStartMs) {
    return currentBalanceAfterPayroll;
  }
  const target = normalizeCurrencyCode(balanceCurrency);
  let delta = 0;
  for (const p of projects) {
    const fromCcy = normalizeCurrencyCode(p.currencyCode);
    const ws =
      p.workStartDate.trim() ? parseLocalDateYmd(p.workStartDate.trim()) : null;
    const sliceStartMs =
      ws != null ? Math.max(accrualStartMs, ws) : accrualStartMs;
    const raw =
      projectEarningsAt(p, nowMs) - projectEarningsAt(p, sliceStartMs);
    if (!Number.isFinite(raw)) continue;
    if (fromCcy === target) {
      delta += raw;
      continue;
    }
    if (convertToBalance) {
      const c = convertToBalance(raw, fromCcy);
      if (c != null && Number.isFinite(c)) delta += c;
    }
  }
  return currentBalanceAfterPayroll + delta;
}

/** Сдвиг локальной календарной даты `YYYY-MM-DD` на `deltaDays` дней */
export function localYmdPlusDays(ymd: string, deltaDays: number): string {
  const t = parseLocalDateYmd(ymd.trim());
  if (t == null) return '';
  const d = new Date(t);
  d.setDate(d.getDate() + deltaDays);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

/**
 * Календарные секунды контракта между началом и концом (конец дня включительно), минус отпуска.
 * Совпадает по смыслу с окном, по которому считается начисление от даты старта.
 */
function projectContractBillableSecondsFromDates(p: ProjectEntry): number {
  const ws = parseLocalDateYmd(p.workStartDate);
  const pe = p.projectEndDate?.trim() ? parseLocalDateYmd(p.projectEndDate.trim()) : null;
  if (ws == null || pe == null || pe < ws) return 0;
  const endExclusive = pe + 86400000;
  const vacSec = vacationOverlapSecondsMerged(p.vacations ?? [], ws, endExclusive);
  const elapsedSec = (endExclusive - ws) / 1000;
  return Math.max(0, elapsedSec - vacSec);
}

/** Elapsed real-time seconds from local midnight of start date to now */
export function elapsedSecondsSinceWorkStart(ymd: string, nowMs: number): number {
  const start = parseLocalDateYmd(ymd);
  if (start == null) return 0;
  return Math.max(0, (nowMs - start) / 1000);
}

export function earningsFromWorkStartDate(
  ymd: string,
  ratePerSecond: number,
  nowMs: number
): number {
  return elapsedSecondsSinceWorkStart(ymd, nowMs) * ratePerSecond;
}

type MsInterval = { start: number; end: number };

function mergeIntervals(intervals: MsInterval[]): MsInterval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const out: MsInterval[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const last = out[out.length - 1];
    if (cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end);
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}

function vacationToInterval(v: VacationEntry): MsInterval | null {
  if (!v.startDate.trim() || !v.endDate.trim()) return null;
  const vs = parseLocalDateYmd(v.startDate);
  const ve = parseLocalDateYmd(v.endDate);
  if (vs == null || ve == null || ve < vs) return null;
  return { start: vs, end: ve + 86400000 };
}

/** Total seconds of vacation time overlapping [rangeStartMs, rangeEndMs], merged if ranges overlap */
export function vacationOverlapSecondsMerged(
  vacations: VacationEntry[],
  rangeStartMs: number,
  rangeEndMs: number
): number {
  const clipped: MsInterval[] = [];
  for (const v of vacations) {
    const iv = vacationToInterval(v);
    if (!iv) continue;
    const start = Math.max(iv.start, rangeStartMs);
    const end = Math.min(iv.end, rangeEndMs);
    if (start < end) clipped.push({ start, end });
  }
  const merged = mergeIntervals(clipped);
  return merged.reduce((acc, iv) => acc + (iv.end - iv.start) / 1000, 0);
}

/**
 * Earnings from work start to effective "now", minus vacation overlaps.
 * If `projectEndYmd` is set, time is capped at end of that calendar day (inclusive).
 * Секунды, обычный календарный интервал (мс/1000), без «переполнения» за несколько лет.
 */
export function earningsFromWorkStartMinusVacations(
  workStartYmd: string,
  ratePerSecond: number,
  nowMs: number,
  vacations: VacationEntry[],
  projectEndYmd?: string
): number {
  const ws = parseLocalDateYmd(workStartYmd);
  if (ws == null) return 0;
  let endMs = nowMs;
  const pe = projectEndYmd?.trim() ? parseLocalDateYmd(projectEndYmd.trim()) : null;
  if (pe != null) {
    const projectEndExclusive = pe + 86400000;
    endMs = Math.min(nowMs, projectEndExclusive);
  }
  if (endMs <= ws) return 0;
  const elapsedSec = (endMs - ws) / 1000;
  const vacSec = vacationOverlapSecondsMerged(vacations, ws, endMs);
  return Math.max(0, elapsedSec - vacSec) * ratePerSecond;
}

const PCLOCK_WORK_HOURS_PER_DAY = 8;
const PCLOCK_WORK_DAYS_PER_MONTH = 22;

/** Секунды из полей «уже отработано» проекта */
export function projectWorkedSeconds(p: ProjectEntry): number {
  return (
    (parseFloat(p.workedMonths) || 0) *
      PCLOCK_WORK_DAYS_PER_MONTH *
      PCLOCK_WORK_HOURS_PER_DAY *
      3600 +
    (parseFloat(p.workedDays) || 0) * PCLOCK_WORK_HOURS_PER_DAY * 3600 +
    (parseFloat(p.workedHours) || 0) * 3600 +
    (parseFloat(p.workedMinutes) || 0) * 60
  );
}

/** Ручная длительность контракта (сек), только для совместимости со старыми данными */
function projectLegacyDurationSeconds(p: ProjectEntry): number {
  return (
    (parseFloat(p.projMonths) || 0) *
      PCLOCK_WORK_DAYS_PER_MONTH *
      PCLOCK_WORK_HOURS_PER_DAY *
      3600 +
    (parseFloat(p.projDays) || 0) * PCLOCK_WORK_HOURS_PER_DAY * 3600 +
    (parseFloat(p.projHours) || 0) * 3600 +
    (parseFloat(p.projMinutes) || 0) * 60
  );
}

/**
 * Средняя длина календарного месяца (365.25/12 суток), в секундах.
 * Для `monthly` начисление идёт по календарному интервалу от `workStartDate`, поэтому знаменатель
 * должен быть календарным, иначе ставка от «рабочего месяца» (22×8 ч) даёт ~4× завышение.
 */
export const AVERAGE_CALENDAR_MONTH_SECONDS = (365.25 / 12) * 24 * 3600;

/**
 * Среднее число рабочих часов в месяце при полной ставке 40 ч/нед и 52 нед/год.
 * Для подписи «сколько в час» по месячной зарплате (без календарного распределения).
 */
export const FTE_WORK_HOURS_PER_MONTH = (52 * 40) / 12;

/**
 * Ставка валюты в секунду по проекту.
 * - contract: сумма контракта / календарный срок (даты начала–конца, минус отпуск) или старая ручная длительность;
 * - monthly: месячный платёж, равномерно на средний календарный месяц (согласовано с календарным `workStartDate`…`now`);
 * - hourly: ставка за час / 3600.
 */
export function projectRatePerSecond(p: ProjectEntry): number {
  const amount = parseFloat(p.projectAmount) || 0;
  const billing = normalizeProjectBillingMode(p.projectBilling);
  if (billing === 'hourly') return amount / 3600;
  if (billing === 'monthly') {
    return amount > 0 ? amount / AVERAGE_CALENDAR_MONTH_SECONDS : 0;
  }
  const fromDates = projectContractBillableSecondsFromDates(p);
  if (fromDates > 0) return amount / fromDates;
  const legacy = projectLegacyDurationSeconds(p);
  return legacy > 0 ? amount / legacy : 0;
}

/**
 * Номинальная сумма за средний календарный месяц в валюте проекта (как при начислении `projectEarningsAt`).
 * Удобно для подписей «месячная ставка» с последующей конвертацией по курсу на дату.
 */
export function projectNominalMonthlyInProjectCurrency(p: ProjectEntry): number {
  return projectRatePerSecond(p) * AVERAGE_CALENDAR_MONTH_SECONDS;
}

/**
 * Номинальная ставка «за рабочий час» в валюте проекта (для отображения рядом с месячной зарплатой):
 * - monthly: месячный платёж / {@link FTE_WORK_HOURS_PER_MONTH};
 * - hourly: ставка за час;
 * - contract: тот же «календарный» €/час, что и `projectRatePerSecond * 3600` (длительность контракта по календарю).
 */
export function projectNominalHourlyFteInProjectCurrency(p: ProjectEntry): number {
  const amount = parseFloat(p.projectAmount) || 0;
  const billing = normalizeProjectBillingMode(p.projectBilling);
  if (billing === 'hourly') return amount;
  if (billing === 'monthly') {
    return amount > 0 ? amount / FTE_WORK_HOURS_PER_MONTH : 0;
  }
  return projectRatePerSecond(p) * 3600;
}

/** «Всего заработано» по списку проектов: сумма `projectEarningsAt` в разрезе валют (без конвертации). */
export function earningsTotalsByCurrency(
  projects: ProjectEntry[],
  nowMs: number
): Map<string, number> {
  const m = new Map<string, number>();
  for (const p of projects) {
    const c = normalizeCurrencyCode(p.currencyCode);
    m.set(c, (m.get(c) ?? 0) + projectEarningsAt(p, nowMs));
  }
  return m;
}

/** Начислено по проекту к моменту `nowMs` (календарное время от даты начала, минус отпуск, до сейчас или даты конца). */
export function projectEarningsAt(p: ProjectEntry, nowMs: number): number {
  const r = projectRatePerSecond(p);
  const fromWorked = projectWorkedSeconds(p) * r;
  const fromStart =
    p.workStartDate.trim() ?
      earningsFromWorkStartMinusVacations(
        p.workStartDate,
        r,
        nowMs,
        p.vacations ?? [],
        p.projectEndDate?.trim() || undefined
      )
    : 0;
  return fromWorked + fromStart;
}

/** Проект с указанной датой окончания уже не капает к `nowMs` */
export function projectIsEndedByDeadline(p: ProjectEntry, nowMs: number): boolean {
  if (!p.projectEndDate?.trim()) return false;
  const pe = parseLocalDateYmd(p.projectEndDate);
  if (pe == null) return false;
  return nowMs >= pe + 86400000;
}

/** Сегодня по локальному календарю, `YYYY-MM-DD`, для даты начала по умолчанию (живой таймер). */
export function localTodayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function newVacation(overrides?: Partial<VacationEntry>): VacationEntry {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ?
      crypto.randomUUID()
    : `vac-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    startDate: '',
    endDate: '',
    ...overrides
  };
}

export function newProject(overrides?: Partial<ProjectEntry>): ProjectEntry {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ?
      crypto.randomUUID()
    : `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const workStartDate = localTodayYmd();
  return {
    id,
    name: 'New project',
    projectAmount: '5000',
    projMonths: '0',
    projDays: '0',
    projHours: '0',
    projMinutes: '0',
    workedMonths: '0',
    workedDays: '0',
    workedHours: '0',
    workedMinutes: '0',
    workStartDate,
    projectEndDate: localYmdPlusDays(workStartDate, 30),
    vacations: [],
    currencyCode: DEFAULT_CURRENCY_CODE,
    projectBilling: 'monthly',
    ...overrides
  };
}

export function initProjectsBundle(): ProjectsBundle {
  const p = newProject({ name: 'Project 1' });
  return { projects: [p], activeProjectId: p.id, selectedProjectIds: [p.id] };
}

export function defaultMoneyClockState(): MoneyClockSavedState {
  return {
    mode: 'project',
    monthlySalary: '0',
    hourlyRate: '0',
    projectsBundle: initProjectsBundle(),
    workedMonths: '0',
    workedDays: '0',
    workedHours: '0',
    workedMinutes: '0',
    currentBalance: '0',
    currentBalanceCurrency: DEFAULT_CURRENCY_CODE,
    lastPayrollYmd: localTodayYmd(),
    takeHomeFraction: 1,
    dayMeterStartHour: DEFAULT_DAY_METER_START_HOUR,
    dayMeterEndHour: DEFAULT_DAY_METER_END_HOUR
  };
}

export function loadMoneyClockState(): MoneyClockSavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    return parsePayload(data);
  } catch {
    return null;
  }
}

export function saveMoneyClockState(state: MoneyClockSavedState): void {
  try {
    const payload: StoredPayload = { v: FILE_VERSION, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('[moneyclock] save failed', e);
  }
}

export function parseMoneyClockJson(text: string): MoneyClockSavedState | null {
  try {
    const data = JSON.parse(text) as unknown;
    return parsePayload(data);
  } catch {
    return null;
  }
}

/**
 * Детерминированный JSON (ключи объектов по алфавиту) для хеша и облака.
 * Иначе тот же профиль с разным порядком полей даёт разный SHA и ломает дедупликацию.
 */
function stableStringifyForHash(value: unknown): string {
  if (value === null) return 'null';
  const t = typeof value;
  if (t === 'number' || t === 'boolean') return JSON.stringify(value);
  if (t === 'string') return JSON.stringify(value);
  if (t !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(stableStringifyForHash).join(',')}]`;
  }
  const o = value as Record<string, unknown>;
  const keys = Object.keys(o).sort();
  const parts: string[] = [];
  for (const k of keys) {
    const v = o[k];
    if (v === undefined) continue;
    parts.push(`${JSON.stringify(k)}:${stableStringifyForHash(v)}`);
  }
  return `{${parts.join(',')}}`;
}

/** Компактный канонический JSON для POST /api/backup и SHA-256 в cloud meta (совпадает с телом запроса). */
export function exportMoneyClockJsonCanonical(state: MoneyClockSavedState): string {
  const payload: StoredPayload = { v: FILE_VERSION, ...state };
  return stableStringifyForHash(payload);
}

export function exportMoneyClockJsonString(state: MoneyClockSavedState): string {
  const payload: StoredPayload = { v: FILE_VERSION, ...state };
  return JSON.stringify(payload, null, 2);
}

export function exportMoneyClockJsonBlob(state: MoneyClockSavedState): Blob {
  return new Blob([exportMoneyClockJsonString(state)], {
    type: 'application/json;charset=utf-8'
  });
}

export function getHydratedMoneyClockState(): MoneyClockSavedState {
  return loadMoneyClockState() ?? defaultMoneyClockState();
}
