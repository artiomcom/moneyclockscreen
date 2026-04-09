export type Mode = 'salary' | 'hourly' | 'project';

export type VacationEntry = {
  id: string;
  /** Inclusive start, `YYYY-MM-DD` local */
  startDate: string;
  /** Inclusive end, `YYYY-MM-DD` local */
  endDate: string;
};

export type ProjectEntry = {
  id: string;
  name: string;
  projectAmount: string;
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
  /** Inclusive last day of the project; empty = still ongoing — caps time used for totals */
  projectEndDate: string;
  /** Past and planned vacations; time inside these ranges is not billed from work start */
  vacations: VacationEntry[];
};

export type ProjectsBundle = {
  projects: ProjectEntry[];
  activeProjectId: string;
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
  /** Сумма на счёте / остаток; показывается на главном экране */
  currentBalance: string;
  /** Optional: резюме и метаданные рядом с настройками MoneyClock */
  profile?: MoneyClockProfile;
};

const STORAGE_KEY = 'moneyclock.v1';
const FILE_VERSION = 1 as const;

type StoredPayload = {
  v: typeof FILE_VERSION;
} & MoneyClockSavedState;

function isMode(x: unknown): x is Mode {
  return x === 'salary' || x === 'hourly' || x === 'project';
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

function isProjectsBundle(x: unknown): x is ProjectsBundle {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  if (!Array.isArray(o.projects) || !isNonEmptyString(o.activeProjectId)) return false;
  if (!o.projects.every(isProjectEntry)) return false;
  if (o.projects.length === 0) return false;
  return o.projects.some((p) => p.id === o.activeProjectId);
}

function parsePayload(data: unknown): MoneyClockSavedState | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  if (o.v !== undefined && o.v !== FILE_VERSION) return null;
  if (!isMode(o.mode)) return null;
  if (
    !isStr(o.monthlySalary) ||
    !isStr(o.hourlyRate) ||
    !isProjectsBundle(o.projectsBundle) ||
    !isStr(o.workedMonths) ||
    !isStr(o.workedDays) ||
    !isStr(o.workedHours) ||
    !isStr(o.workedMinutes)
  ) {
    return null;
  }
  const bundle = o.projectsBundle;
  const profile =
    o.profile !== undefined && o.profile !== null && typeof o.profile === 'object' &&
    !Array.isArray(o.profile) ?
      (o.profile as MoneyClockProfile)
    : undefined;

  return {
    mode: o.mode,
    monthlySalary: o.monthlySalary,
    hourlyRate: o.hourlyRate,
    currentBalance: isStr(o.currentBalance) ? o.currentBalance : '0',
    projectsBundle: {
      ...bundle,
      projects: bundle.projects.map((p) => ({
        ...p,
        workStartDate: typeof p.workStartDate === 'string' ? p.workStartDate : '',
        projectEndDate: typeof p.projectEndDate === 'string' ? p.projectEndDate : '',
        vacations:
          Array.isArray(p.vacations) && p.vacations.every(isVacationEntry) ?
            p.vacations
          : []
      }))
    },
    workedMonths: o.workedMonths,
    workedDays: o.workedDays,
    workedHours: o.workedHours,
    workedMinutes: o.workedMinutes,
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
  return {
    id,
    name: 'New project',
    projectAmount: '5000',
    projMonths: '0',
    projDays: '30',
    projHours: '0',
    projMinutes: '0',
    workedMonths: '0',
    workedDays: '0',
    workedHours: '0',
    workedMinutes: '0',
    workStartDate: '',
    projectEndDate: '',
    vacations: [],
    ...overrides
  };
}

export function initProjectsBundle(): ProjectsBundle {
  const p = newProject({ name: 'Project 1' });
  return { projects: [p], activeProjectId: p.id };
}

export function defaultMoneyClockState(): MoneyClockSavedState {
  return {
    mode: 'project',
    monthlySalary: '3000',
    hourlyRate: '25',
    projectsBundle: initProjectsBundle(),
    workedMonths: '0',
    workedDays: '0',
    workedHours: '0',
    workedMinutes: '0',
    currentBalance: '0'
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

export function exportMoneyClockJsonBlob(state: MoneyClockSavedState): Blob {
  const payload: StoredPayload = { v: FILE_VERSION, ...state };
  return new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8'
  });
}

export function getHydratedMoneyClockState(): MoneyClockSavedState {
  return loadMoneyClockState() ?? defaultMoneyClockState();
}
