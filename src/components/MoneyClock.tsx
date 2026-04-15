import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useRef
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
  DownloadIcon,
  UploadIcon,
  Wallet,
  Layers,
  Share2,
  Copy,
  CloudUpload,
  Moon,
  Sun,
  ArrowRight,
  CircleDollarSign,
  Rocket,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';
import { ParticleBackground } from './ParticleBackground';
import {
  ARCADE_SETTINGS_BTN_CLASS,
  PixelSettingsCog,
  RetroGnomesFrame
} from './RetroGnomesFrame';
import { AnimatedCounter } from './AnimatedCounter';
import { IncomeChart } from './IncomeChart';
import {
  type ProjectEntry,
  type ProjectsBundle,
  type MoneyClockSavedState,
  type MoneyClockProfile,
  type VacationEntry,
  normalizeProjectBillingMode,
  newProject,
  newVacation,
  getHydratedMoneyClockState,
  saveMoneyClockState,
  exportMoneyClockJsonBlob,
  exportMoneyClockJsonCanonical,
  exportMoneyClockJsonString,
  parseMoneyClockJson,
  projectEarningsAt,
  earningsTotalsByCurrency,
  projectRatePerSecond,
  projectNominalHourlyFteInProjectCurrency,
  normalizeWorkdayStartHour,
  normalizeWorkdayEndHour,
  projectIsEndedByDeadline,
  parseLocalDateYmd,
  balanceOnAccountAt,
  MONEYCLOCK_CURRENCIES,
  getCurrencySymbol,
  normalizeCurrencyCode,
  clampTakeHomeFraction } from
'../moneyClockPersistence';
import {
  touchLastExportTimestamp,
  readLastExportMs,
  readBackupBannerSnoozeUntil,
  persistBackupBannerSnoozeUntil
} from '../backupReminderStorage';
import {
  fetchLatestFxRates,
  buildFxCaptionForProjects,
  convertAmountThroughSnapshot,
  type FxSnapshot
} from '../fxRates';
import {
  fetchFrankfurterHistoricalRates,
  formatLocalYmdFromMs,
  fxSnapshotOrHistoricalForAnchorYmd,
  minWorkStartYmdFromProjects,
  frankfurterQuoteCurrencies,
  type FrankfurterRow
} from '../frankfurterHistorical';
import {
  buildMoneyAwarenessShareLines,
  illustrativePercentileFromEurPerSec
} from '../moneyAwareness';
import {
  fetchBlendedInflationYearly,
  worldBankCountryForCurrency,
  type BlendedInflationYear
} from '../worldBankInflation';
import { computeRealEarningsRateBreakdown } from '../realEarningsRate';
import {
  applyThemeToDocument,
  readStoredTheme,
  writeStoredTheme,
  type ThemePreference
} from '../themeStorage';
import { useI18n } from '../i18n';
import { intlLocaleTag } from '../i18n/localeMeta';
import { DASHBOARD_HINT_CLASS } from '../dashboardHintClass';
import {
  MagicPatternsAmbient,
  MagicProjectionCards,
  MagicInsightsFeed,
  type MagicProjectionItem,
  type MagicInsightItem
} from './magicPatterns';
import { APP_LOCALES, type AppLocale } from '../i18n/localeStorage';
import {
  postCloudBackup,
  fetchCloudBackupJson,
  parseMagicLinkPath,
  buildMagicLinkUrl
} from '../cloudBackupApi';
import {
  hashMoneyClockExportJson,
  readCloudBackupMeta,
  writeCloudBackupMeta,
  getLastCloudProfileMagicUrl
} from '../cloudBackupLocalMeta';
import {
  captureMagicLinkIdFromUrlToSession,
  peekMagicLinkIdFromSession,
  clearMagicLinkSession,
  ensureMagicLinkInAddressBar
} from '../magicLinkSession';
function InputField({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  inputType = 'number'
}: {label: string;value: string;onChange: (v: string) => void;placeholder: string;suffix?: string;inputType?: 'number' | 'text';}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-gray-700 dark:text-cyan-100/90 text-sm font-bold text-center">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3.5 rounded-r80-sm border-2 border-sky-400 text-gray-700 dark:text-cyan-50 text-base font-medium placeholder:text-gray-300 dark:placeholder:text-fuchsia-300/40 outline-none transition-all focus:ring-2 focus:ring-sky-300 dark:focus:ring-cyan-500 bg-white dark:bg-slate-950 dark:border-cyan-500/60"
        />

        {suffix &&
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-cyan-300/70 text-xs font-medium">
            {suffix}
          </span>
        }
      </div>
    </div>);

}

function formatYmdLong(ymd: string, locale: AppLocale): string {
  const ts = parseLocalDateYmd(ymd);
  const tag = intlLocaleTag[locale];
  return ts != null ?
  new Date(ts).toLocaleDateString(tag, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) :
  ymd;
}

function currencyOptionLabel(
  c: (typeof MONEYCLOCK_CURRENCIES)[number],
  locale: AppLocale
): string {
  return locale === 'ru' ? c.labelRu : c.labelEn;
}

function formatCompactAnnual(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const r = Math.round(Math.abs(n));
  if (r >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (r >= 1000) return `${Math.round(n / 1000)}k`;
  return `${Math.round(n)}`;
}

function readProfilePersonal(p: MoneyClockProfile): {
  fullName?: string;
  headline?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  location?: string;
  availability?: string;
} {
  const raw = p.personal;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const s = (k: string) => (typeof o[k] === 'string' ? o[k] : undefined);
  return {
    fullName: s('fullName'),
    headline: s('headline'),
    email: s('email'),
    phone: s('phone'),
    linkedin: s('linkedin'),
    location: s('location'),
    availability: s('availability')
  };
}

const EMPTY_INFLATION_CCY: string[] = [];

/** Локальный час начала интервала «Сегодня» в герое (не полуночь). */
/** Easing из Magic Patterns `DayProgress` (framer cubic-bezier). */
const MP_DAY_PROGRESS_EASE: [number, number, number, number] = [
  0.16, 1, 0.3, 1
];

const initialMoneyClockRef = { current: null as MoneyClockSavedState | null };
function getInitialMoneyClockState(): MoneyClockSavedState {
  if (!initialMoneyClockRef.current) {
    initialMoneyClockRef.current = getHydratedMoneyClockState();
  }
  return initialMoneyClockRef.current;
}

export function MoneyClock() {
  const { t, locale, setLocale } = useI18n();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [projectsBundle, setProjectsBundle] = useState<ProjectsBundle>(
    () => getInitialMoneyClockState().projectsBundle
  );
  const [currentBalance, setCurrentBalance] = useState(
    () => getInitialMoneyClockState().currentBalance
  );
  const [currentBalanceCurrency, setCurrentBalanceCurrency] = useState(
    () => getInitialMoneyClockState().currentBalanceCurrency
  );
  const [lastPayrollYmd, setLastPayrollYmd] = useState(
    () => getInitialMoneyClockState().lastPayrollYmd
  );
  const [takeHomeFraction, setTakeHomeFraction] = useState(
    () => clampTakeHomeFraction(getInitialMoneyClockState().takeHomeFraction)
  );
  const [workdayStartHour, setWorkdayStartHour] = useState(
    () => normalizeWorkdayStartHour(getInitialMoneyClockState().workdayStartHour)
  );
  const [workdayEndHour, setWorkdayEndHour] = useState(() => {
    const s = getInitialMoneyClockState();
    return normalizeWorkdayEndHour(
      s.workdayEndHour,
      normalizeWorkdayStartHour(s.workdayStartHour)
    );
  });
  const [profileBundle, setProfileBundle] = useState<MoneyClockProfile | undefined>(
    () => getInitialMoneyClockState().profile
  );
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [fxSnapshot, setFxSnapshot] = useState<FxSnapshot | null>(null);
  const [fxReady, setFxReady] = useState(false);
  const [fxHistoryRows, setFxHistoryRows] = useState<FrankfurterRow[] | null>(null);
  const [inflationYearly, setInflationYearly] = useState<BlendedInflationYear[] | null>(null);
  const [awarenessToast, setAwarenessToast] = useState<string | null>(null);
  const [portalToast, setPortalToast] = useState<string | null>(null);
  const [lastExportMs, setLastExportMs] = useState<number | null>(() => readLastExportMs());
  const [cloudSavePending, setCloudSavePending] = useState(false);
  const [cloudLinkModal, setCloudLinkModal] = useState<string | null>(null);
  const [backupSnoozeUntil, setBackupSnoozeUntil] = useState(() =>
    readBackupBannerSnoozeUntil()
  );
  const [theme, setTheme] = useState<ThemePreference>(() => readStoredTheme());
  /** Multi-currency breakdown: default one merged total, expand for all tickers */
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);

  useEffect(() => {
    applyThemeToDocument(theme);
    writeStoredTheme(theme);
  }, [theme]);

  const { projects, activeProjectId, selectedProjectIds } = projectsBundle;
  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? projects[0],
    [projects, activeProjectId]
  );

  const selectedProjectsOrdered = useMemo(() => {
    const list = selectedProjectIds
      .map((id) => projects.find((p) => p.id === id))
      .filter((p): p is ProjectEntry => p != null);
    const startMs = (p: ProjectEntry): number => parseLocalDateYmd(p.workStartDate) ?? 0;
    const endDayMs = (p: ProjectEntry): number => {
      const s = p.projectEndDate?.trim();
      if (!s) return 0;
      return parseLocalDateYmd(s) ?? 0;
    };
    return [...list].sort((a, b) => {
      const aLive = !projectIsEndedByDeadline(a, nowTick);
      const bLive = !projectIsEndedByDeadline(b, nowTick);
      if (aLive !== bLive) return aLive ? -1 : 1;
      if (aLive) {
        return startMs(b) - startMs(a);
      }
      const byEnd = endDayMs(b) - endDayMs(a);
      if (byEnd !== 0) return byEnd;
      return startMs(b) - startMs(a);
    });
  }, [projects, selectedProjectIds, nowTick]);

  /** Только контракты, по которым ещё идёт начисление (для героя и «ставки в час»). */
  const activeSelectedProjectsOrdered = useMemo(
    () => selectedProjectsOrdered.filter((p) => !projectIsEndedByDeadline(p, nowTick)),
    [selectedProjectsOrdered, nowTick]
  );

  const singleSelectedForCopy =
    selectedProjectsOrdered.length === 1 ? selectedProjectsOrdered[0] : null;

  const showBackupReminderBanner = useMemo(() => {
    if (selectedProjectsOrdered.length === 0) return false;
    const now = Date.now();
    if (now < backupSnoozeUntil) return false;
    const staleMs = 7 * 86400000;
    return lastExportMs == null || now - lastExportMs > staleMs;
  }, [backupSnoozeUntil, lastExportMs, nowTick, selectedProjectsOrdered.length]);

  const patchActiveProject = useCallback((patch: Partial<ProjectEntry>) => {
    setProjectsBundle((s) => ({
      ...s,
      projects: s.projects.map((p) =>
      p.id === s.activeProjectId ? { ...p, ...patch } : p)

    }));
  }, []);

  const addProject = useCallback(() => {
    const p = newProject();
    setProjectsBundle((s) => ({
      projects: [...s.projects, p],
      activeProjectId: p.id,
      selectedProjectIds: [...s.selectedProjectIds, p.id]
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setProjectsBundle((s) => {
      const next = s.projects.filter((p) => p.id !== id);
      if (next.length === 0) {
        const p = newProject({ name: 'Project 1' });
        return {
          projects: [p],
          activeProjectId: p.id,
          selectedProjectIds: [p.id]
        };
      }
      const active =
        s.activeProjectId === id ? next[0].id : s.activeProjectId;
      let nextSel = s.selectedProjectIds.filter((x) => x !== id);
      if (nextSel.length === 0) nextSel = [active];
      if (!nextSel.includes(active)) nextSel = [active, ...nextSel];
      return {
        projects: next,
        activeProjectId: active,
        selectedProjectIds: nextSel
      };
    });
  }, []);

  const selectProject = useCallback((id: string) => {
    setProjectsBundle((s) => ({ ...s, activeProjectId: id }));
  }, []);

  const toggleProjectOnDashboard = useCallback((id: string) => {
    setProjectsBundle((s) => {
      const inSel = s.selectedProjectIds.includes(id);
      if (inSel && s.selectedProjectIds.length === 1) return s;
      const nextSel = inSel ?
        s.selectedProjectIds.filter((x) => x !== id)
      : [...s.selectedProjectIds, id];
      let nextActive = s.activeProjectId;
      if (inSel && id === s.activeProjectId) {
        nextActive = nextSel[0];
      }
      return {
        ...s,
        selectedProjectIds: nextSel,
        activeProjectId: nextActive
      };
    });
  }, []);

  const totalRatePerSecond = useMemo(
    () =>
      activeSelectedProjectsOrdered.reduce((acc, p) => acc + projectRatePerSecond(p), 0),
    [activeSelectedProjectsOrdered]
  );

  const balanceAccrualRatePerSecond = useMemo(() => {
    const target = normalizeCurrencyCode(currentBalanceCurrency);
    return selectedProjectsOrdered.reduce((acc, p) => {
      if (normalizeCurrencyCode(p.currencyCode) !== target) return acc;
      return acc + projectRatePerSecond(p);
    }, 0);
  }, [selectedProjectsOrdered, currentBalanceCurrency]);

  useEffect(() => {
    const tick = () => setNowTick(Date.now());
    const projectNeedsLive = selectedProjectsOrdered.some(
      (p) =>
        p.workStartDate.trim() &&
        !projectIsEndedByDeadline(p, Date.now())
    );
    const balanceNeedsLive = balanceAccrualRatePerSecond > 0;
    if (!projectNeedsLive && !balanceNeedsLive) {
      tick();
      return;
    }
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [selectedProjectsOrdered, balanceAccrualRatePerSecond]);

  useEffect(() => {
    let cancelled = false;
    setFxReady(false);
    fetchLatestFxRates(currentBalanceCurrency).then((s) => {
      if (!cancelled) {
        setFxSnapshot(s);
        setFxReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentBalanceCurrency]);

  const fxHistoryProjectSignature = useMemo(
    () =>
      selectedProjectsOrdered
        .map(
          (p) =>
            `${p.id}\u0000${p.workStartDate.trim()}\u0000${normalizeCurrencyCode(p.currencyCode)}`
        )
        .sort()
        .join('|'),
    [selectedProjectsOrdered]
  );

  const fxHistoryDayBucket = useMemo(() => {
    const d = new Date(nowTick);
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }, [nowTick]);

  useEffect(() => {
    const fromYmd = minWorkStartYmdFromProjects(selectedProjectsOrdered);
    const toYmd = formatLocalYmdFromMs(nowTick);
    const base = normalizeCurrencyCode(currentBalanceCurrency);
    const quotes = frankfurterQuoteCurrencies(
      selectedProjectsOrdered,
      currentBalanceCurrency
    );
    if (!fromYmd || quotes.length === 0) {
      setFxHistoryRows(null);
      return;
    }
    const ac = new AbortController();
    fetchFrankfurterHistoricalRates(fromYmd, toYmd, base, quotes, {
      providersEcb: false,
      signal: ac.signal
    })
      .then((rows) => {
        setFxHistoryRows(rows);
      })
      .catch(() => {
        setFxHistoryRows(null);
      });
    return () => ac.abort();
  }, [fxHistoryProjectSignature, currentBalanceCurrency, fxHistoryDayBucket]);

  const inflationCalendarYear = useMemo(
    () => new Date(nowTick).getFullYear(),
    [fxHistoryDayBucket]
  );

  const inflationDisplayCurrencies = useMemo(() => {
    const s = new Set<string>();
    s.add(normalizeCurrencyCode(currentBalanceCurrency));
    for (const p of selectedProjectsOrdered) {
      s.add(normalizeCurrencyCode(p.currencyCode));
    }
    const list = [...s].filter((c) => worldBankCountryForCurrency(c)).sort();
    return list.length === 0 ? EMPTY_INFLATION_CCY : list;
  }, [selectedProjectsOrdered, currentBalanceCurrency]);

  const inflationLoadKey = useMemo(
    () =>
      `${fxHistoryProjectSignature}\0${currentBalanceCurrency}\0${inflationCalendarYear}\0${inflationDisplayCurrencies.join('|')}`,
    [
      fxHistoryProjectSignature,
      currentBalanceCurrency,
      inflationCalendarYear,
      inflationDisplayCurrencies
    ]
  );

  useEffect(() => {
    if (inflationDisplayCurrencies.length === 0) {
      setInflationYearly(null);
      return;
    }
    const fromYmd = minWorkStartYmdFromProjects(selectedProjectsOrdered);
    if (!fromYmd) {
      setInflationYearly(null);
      return;
    }
    const yStart = parseInt(fromYmd.slice(0, 4), 10);
    const yEnd = inflationCalendarYear;
    if (!Number.isFinite(yStart) || yEnd < yStart) {
      setInflationYearly(null);
      return;
    }
    const ac = new AbortController();
    const codes = [
      normalizeCurrencyCode(currentBalanceCurrency),
      ...selectedProjectsOrdered.map((p) => normalizeCurrencyCode(p.currencyCode))
    ];
    fetchBlendedInflationYearly(codes, yStart, yEnd, { signal: ac.signal })
      .then(setInflationYearly)
      .catch(() => setInflationYearly(null));
    return () => ac.abort();
  }, [inflationLoadKey]);

  const computeInitialEarnings = useCallback(
    (nowMs: number) =>
      selectedProjectsOrdered.reduce(
        (sum, p) => sum + projectEarningsAt(p, nowMs),
        0
      ),
    [selectedProjectsOrdered]
  );

  const displayAmount = useMemo(
    () => computeInitialEarnings(nowTick),
    [computeInitialEarnings, nowTick]
  );

  /** Суммы по валютам среди выбранных проектов (нельзя складывать разные валюты в одну цифру). */
  const earningsByCurrency = useMemo(
    () => earningsTotalsByCurrency(selectedProjectsOrdered, nowTick),
    [selectedProjectsOrdered, nowTick]
  );

  const displayBalanceAmount = useMemo(() => {
    const raw = currentBalance.trim().replace(/[\s,]/g, '');
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  }, [currentBalance]);

  /** Остаток: сумма после последней зарплаты + дельта накоплений по проектам в валюте счёта (с отпусками). */
  const balanceConvertToAccount = useMemo(
    () =>
      fxSnapshot ?
        (amount: number, fromCcy: string) =>
          convertAmountThroughSnapshot(
            amount,
            fromCcy,
            currentBalanceCurrency,
            fxSnapshot
          )
      : undefined,
    [fxSnapshot, currentBalanceCurrency]
  );

  const displayBalanceWithAccrual = useMemo(
    () =>
      balanceOnAccountAt(
        selectedProjectsOrdered,
        currentBalanceCurrency,
        displayBalanceAmount,
        lastPayrollYmd,
        nowTick,
        balanceConvertToAccount
      ),
    [
      selectedProjectsOrdered,
      currentBalanceCurrency,
      displayBalanceAmount,
      lastPayrollYmd,
      nowTick,
      balanceConvertToAccount
    ]
  );

  const balanceCurrencySymbol = getCurrencySymbol(currentBalanceCurrency);

  /** Валюты, в которых есть хотя бы один выбранный проект с неистёкшим сроком (ещё «копит»). */
  const currenciesWithActiveContract = useMemo(() => {
    const s = new Set<string>();
    for (const p of selectedProjectsOrdered) {
      if (!projectIsEndedByDeadline(p, nowTick)) {
        s.add(normalizeCurrencyCode(p.currencyCode));
      }
    }
    return s;
  }, [selectedProjectsOrdered, nowTick]);

  const accountBalanceCurrencyStatus = useMemo(() => {
    const b = normalizeCurrencyCode(currentBalanceCurrency);
    const anyInCcy = selectedProjectsOrdered.some(
      (p) => normalizeCurrencyCode(p.currencyCode) === b
    );
    const hasActiveInCcy = currenciesWithActiveContract.has(b);
    return { anyInCcy, hasActiveInCcy };
  }, [selectedProjectsOrdered, currentBalanceCurrency, currenciesWithActiveContract]);

  const balanceAccrualNoFxWarning = useMemo(
    () =>
      selectedProjectsOrdered.length > 0 &&
      !accountBalanceCurrencyStatus.anyInCcy &&
      fxSnapshot == null,
    [
      selectedProjectsOrdered.length,
      accountBalanceCurrencyStatus.anyInCcy,
      fxSnapshot
    ]
  );

  const balanceAccrualForeignWithFxHint = useMemo(
    () =>
      selectedProjectsOrdered.length > 0 &&
      !accountBalanceCurrencyStatus.anyInCcy &&
      fxSnapshot != null,
    [
      selectedProjectsOrdered.length,
      accountBalanceCurrencyStatus.anyInCcy,
      fxSnapshot
    ]
  );

  /** Курс для итога «все валюты → одна сумма» и сортировки: на дату последней выплаты из истории, иначе spot. */
  const earningsConversionSnapshot = useMemo(() => {
    if (!fxSnapshot) return null;
    const target = normalizeCurrencyCode(currentBalanceCurrency);
    const foreign = [
      ...new Set(
        selectedProjectsOrdered.map((p) => normalizeCurrencyCode(p.currencyCode))
      )
    ].filter((c) => c !== target);
    const pay = lastPayrollYmd.trim();
    const anchorYmd =
      pay && parseLocalDateYmd(pay) != null ? pay : formatLocalYmdFromMs(nowTick);
    return fxSnapshotOrHistoricalForAnchorYmd(
      currentBalanceCurrency,
      foreign,
      anchorYmd,
      fxSnapshot,
      fxHistoryRows
    );
  }, [
    fxSnapshot,
    fxHistoryRows,
    selectedProjectsOrdered,
    currentBalanceCurrency,
    lastPayrollYmd,
    nowTick
  ]);

  /** Порядок строк «Всего заработано»: активные контракты выше; внутри группы, по убыванию суммы в валюте счёта (тот же курс, что для итога). */
  const earningsByCurrencySortedForDisplay = useMemo(() => {
    const target = normalizeCurrencyCode(currentBalanceCurrency);
    const rows = [...earningsByCurrency.entries()].map(([ccy, val]) => {
      const active = currenciesWithActiveContract.has(ccy);
      let equivForSort = 0;
      if (earningsConversionSnapshot) {
        const c = convertAmountThroughSnapshot(val, ccy, target, earningsConversionSnapshot);
        equivForSort = c != null ? c : Number.NEGATIVE_INFINITY;
      }
      return { ccy, val, active, equivForSort };
    });
    rows.sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      if (earningsConversionSnapshot && b.equivForSort !== a.equivForSort) {
        return b.equivForSort - a.equivForSort;
      }
      return a.ccy.localeCompare(b.ccy);
    });
    return rows.map((r) => [r.ccy, r.val] as [string, number]);
  }, [
    earningsByCurrency,
    currenciesWithActiveContract,
    earningsConversionSnapshot,
    currentBalanceCurrency
  ]);

  const ratesByCurrency = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of activeSelectedProjectsOrdered) {
      const c = normalizeCurrencyCode(p.currencyCode);
      m.set(c, (m.get(c) ?? 0) + projectRatePerSecond(p));
    }
    return m;
  }, [activeSelectedProjectsOrdered]);

  /** Сумма накоплений по всем выбранным проектам в валюте счёта (курс на дату последней выплаты из истории, иначе API). */
  const equivalentEarningsInBalanceCcy = useMemo(() => {
    if (!earningsConversionSnapshot || selectedProjectsOrdered.length === 0) return null;
    const target = normalizeCurrencyCode(currentBalanceCurrency);
    let sum = 0;
    for (const p of selectedProjectsOrdered) {
      const raw = projectEarningsAt(p, nowTick);
      const c = convertAmountThroughSnapshot(
        raw,
        p.currencyCode,
        target,
        earningsConversionSnapshot
      );
      if (c == null) return null;
      sum += c;
    }
    return sum;
  }, [earningsConversionSnapshot, selectedProjectsOrdered, currentBalanceCurrency, nowTick]);

  /** Правая карточка «в валюте счёта» повторяет число слева, одна валюта = счёт или свёрнутый Σ. */
  const hideEquivBreakdownTile = useMemo(() => {
    if (equivalentEarningsInBalanceCcy == null || selectedProjectsOrdered.length === 0) {
      return false;
    }
    const entries = earningsByCurrencySortedForDisplay;
    if (entries.length === 0) return false;
    const bal = normalizeCurrencyCode(currentBalanceCurrency);
    if (entries.length === 1 && normalizeCurrencyCode(entries[0][0]) === bal) return true;
    if (entries.length > 1 && fxSnapshot && !showAllCurrencies) return true;
    return false;
  }, [
    equivalentEarningsInBalanceCcy,
    selectedProjectsOrdered.length,
    earningsByCurrencySortedForDisplay,
    currentBalanceCurrency,
    fxSnapshot,
    showAllCurrencies
  ]);

  /** Сумма ставок (валюта/сек) всех проектов в пересчёте на валюту счёта. */
  const equivalentRatePerSecondInBalanceCcy = useMemo(() => {
    if (!fxSnapshot || activeSelectedProjectsOrdered.length === 0) return null;
    const target = normalizeCurrencyCode(currentBalanceCurrency);
    let sum = 0;
    for (const p of activeSelectedProjectsOrdered) {
      const r = projectRatePerSecond(p);
      const c = convertAmountThroughSnapshot(r, p.currencyCode, target, fxSnapshot);
      if (c == null) return null;
      sum += c;
    }
    return sum;
  }, [fxSnapshot, activeSelectedProjectsOrdered, currentBalanceCurrency]);

  /**
   * Номинальная «зарплата за рабочий час» (40 ч/нед) в валюте счёта: для monthly — месячная / (52×40/12) ч;
   * для hourly — ставка за час; завершённые контракты не входят.
   */
  const equivalentFteHourlyInBalanceCcy = useMemo(() => {
    if (activeSelectedProjectsOrdered.length === 0) return null;
    const target = normalizeCurrencyCode(currentBalanceCurrency);
    if (!fxSnapshot) {
      const codes = [
        ...new Set(
          activeSelectedProjectsOrdered.map((p) => normalizeCurrencyCode(p.currencyCode))
        )
      ];
      if (codes.length === 1 && codes[0] === target) {
        let sum = 0;
        for (const p of activeSelectedProjectsOrdered) {
          sum += projectNominalHourlyFteInProjectCurrency(p);
        }
        return sum;
      }
      return null;
    }
    let sum = 0;
    for (const p of activeSelectedProjectsOrdered) {
      const h = projectNominalHourlyFteInProjectCurrency(p);
      if (h <= 0) continue;
      const c = convertAmountThroughSnapshot(h, p.currencyCode, target, fxSnapshot);
      if (c == null) return null;
      sum += c;
    }
    return sum;
  }, [fxSnapshot, activeSelectedProjectsOrdered, currentBalanceCurrency]);

  const hasPositiveAccrualRate = useMemo(
    () => activeSelectedProjectsOrdered.some((p) => projectRatePerSecond(p) > 0),
    [activeSelectedProjectsOrdered]
  );

  const heroRateBasis = useMemo(() => {
    if (!hasPositiveAccrualRate || activeSelectedProjectsOrdered.length === 0) return null;
    const balCode = normalizeCurrencyCode(currentBalanceCurrency);
    if (equivalentRatePerSecondInBalanceCcy != null) {
      return {
        perSec: equivalentRatePerSecondInBalanceCcy,
        code: balCode,
        symbol: getCurrencySymbol(balCode)
      };
    }
    if (ratesByCurrency.size === 1) {
      const [code, perSec] = [...ratesByCurrency.entries()][0]!;
      const c = normalizeCurrencyCode(code);
      return { perSec, code: c, symbol: getCurrencySymbol(c) };
    }
    return null;
  }, [
    hasPositiveAccrualRate,
    activeSelectedProjectsOrdered.length,
    equivalentRatePerSecondInBalanceCcy,
    currentBalanceCurrency,
    ratesByCurrency
  ]);

  const realRateBreakdown = useMemo(() => {
    if (!heroRateBasis) return null;
    const fteHour = equivalentFteHourlyInBalanceCcy;
    if (fteHour != null && fteHour > 0) {
      return computeRealEarningsRateBreakdown(
        fteHour / 3600,
        takeHomeFraction,
        inflationYearly
      );
    }
    return computeRealEarningsRateBreakdown(
      heroRateBasis.perSec,
      takeHomeFraction,
      inflationYearly
    );
  }, [
    heroRateBasis,
    equivalentFteHourlyInBalanceCcy,
    takeHomeFraction,
    inflationYearly
  ]);

  const futureYearly = useMemo(() => {
    if (!heroRateBasis) return null;
    const secY = 365.25 * 86400;
    const grossYear = heroRateBasis.perSec * secY;
    const path = grossYear * takeHomeFraction;
    const plus20 = grossYear * 1.2 * takeHomeFraction;
    return { path, plus20 };
  }, [heroRateBasis, takeHomeFraction]);

  const trajectorySnap = useMemo(() => {
    if (!heroRateBasis || !futureYearly) return null;
    const y1 = futureYearly.path;
    const y1plus = futureYearly.plus20;
    const deltaY = y1plus - y1;
    return {
      symbol: heroRateBasis.symbol,
      code: heroRateBasis.code,
      y12: y1,
      y12plus: y1plus,
      deltaYear: deltaY,
      y5: y1 * 5,
      y5plus: y1plus * 5,
      delta5: (y1plus - y1) * 5
    };
  }, [heroRateBasis, futureYearly]);

  const heroDayWindowBounds = useMemo(() => {
    const d0 = new Date(nowTick);
    d0.setHours(workdayStartHour, 0, 0, 0);
    const startMs = d0.getTime();
    const d1 = new Date(nowTick);
    d1.setHours(workdayEndHour, 0, 0, 0);
    const endMs = d1.getTime();
    const windowSec = Math.max(0, (endMs - startMs) / 1000);
    return { startMs, endMs, windowSec };
  }, [nowTick, workdayStartHour, workdayEndHour]);

  const todayStartMs = heroDayWindowBounds.startMs;

  const heroTodayAccrual = useMemo(() => {
    if (!heroRateBasis) return null;
    const effectiveEnd = Math.min(nowTick, heroDayWindowBounds.endMs);
    const sec = Math.max(0, (effectiveEnd - heroDayWindowBounds.startMs) / 1000);
    const fte = equivalentFteHourlyInBalanceCcy;
    if (fte != null && fte > 0) {
      return fte * (sec / 3600);
    }
    return heroRateBasis.perSec * sec;
  }, [
    heroRateBasis,
    equivalentFteHourlyInBalanceCcy,
    nowTick,
    heroDayWindowBounds
  ]);

  /** Доля «сегодня» относительно остатка на начало дня (как в макете BalanceCard). */
  const balanceTodayPercentVsStart = useMemo(() => {
    if (heroTodayAccrual == null || heroTodayAccrual <= 0) return null;
    const before = displayBalanceWithAccrual - heroTodayAccrual;
    if (!Number.isFinite(before) || before <= 0) return null;
    return ((heroTodayAccrual / before) * 100).toFixed(1);
  }, [heroTodayAccrual, displayBalanceWithAccrual]);

  const heroDayCapEarnings = useMemo(() => {
    if (!heroRateBasis) return null;
    const fte = equivalentFteHourlyInBalanceCcy;
    const { windowSec } = heroDayWindowBounds;
    if (fte != null && fte > 0) {
      return fte * (windowSec / 3600);
    }
    return heroRateBasis.perSec * windowSec;
  }, [heroRateBasis, equivalentFteHourlyInBalanceCcy, heroDayWindowBounds]);

  const heroDayRemainingEarnings = useMemo(() => {
    if (heroDayCapEarnings == null || heroTodayAccrual == null) return null;
    return Math.max(0, heroDayCapEarnings - heroTodayAccrual);
  }, [heroDayCapEarnings, heroTodayAccrual]);

  const heroDayProgressFraction = useMemo(() => {
    if (!heroDayCapEarnings || heroDayCapEarnings <= 0) return 0;
    return Math.min(1, Math.max(0, (heroTodayAccrual ?? 0) / heroDayCapEarnings));
  }, [heroDayCapEarnings, heroTodayAccrual]);

  const heroDayWindowTimeLabels = useMemo(() => {
    const tag = intlLocaleTag[locale];
    const start = new Date(heroDayWindowBounds.startMs);
    const startStr = start.toLocaleTimeString(tag, {
      hour: 'numeric',
      minute: '2-digit',
      hourCycle: 'h23'
    });
    let endStr: string;
    if (workdayEndHour === 24) {
      endStr = t('hero.dayWindowEndMidnight');
    } else {
      const end = new Date(heroDayWindowBounds.endMs);
      endStr = end.toLocaleTimeString(tag, {
        hour: 'numeric',
        minute: '2-digit',
        hourCycle: 'h23'
      });
    }
    return { start: startStr, end: endStr };
  }, [heroDayWindowBounds, workdayEndHour, locale, t]);

  const heroDayProgressMarkers = useMemo(() => {
    const startH = workdayStartHour;
    const endH = workdayEndHour;
    const span = Math.max(0, endH - startH);
    const maxTicks = 6;
    const step = span <= 0 ? 1 : Math.max(1, Math.ceil(span / maxTicks));
    const markers: number[] = [];
    for (let h = startH; h < endH; h += step) {
      markers.push(h);
    }
    if (markers.length === 0 || markers[markers.length - 1] !== endH) {
      markers.push(endH);
    }
    return markers;
  }, [workdayStartHour, workdayEndHour]);

  const heroDayProgressMarkerLabels = useMemo(() => {
    const tag = intlLocaleTag[locale];
    return heroDayProgressMarkers.map((hour) => {
      if (hour >= 24) return t('hero.dayWindowEndMidnight');
      const d = new Date(todayStartMs);
      d.setHours(hour, 0, 0, 0);
      return d.toLocaleTimeString(tag, {
        hour: 'numeric',
        minute: '2-digit',
        hourCycle: 'h23'
      });
    });
  }, [heroDayProgressMarkers, todayStartMs, locale, t]);

  const magicPatternProjections = useMemo((): MagicProjectionItem[] | null => {
    if (!trajectorySnap || heroDayCapEarnings == null || !futureYearly || !heroRateBasis) {
      return null;
    }
    const sym = trajectorySnap.symbol;
    return [
      {
        label: t('magic.projTonight'),
        value: `${sym}${heroDayCapEarnings.toFixed(2)}`,
        description: t('magic.projTonightDesc'),
        Icon: Moon
      },
      {
        label: t('magic.projMonth'),
        value: `${sym}${formatCompactAnnual(futureYearly.path / 12)}`,
        description: t('magic.projMonthDesc'),
        Icon: CalendarIcon
      },
      {
        label: t('magic.proj5y'),
        value: `${sym}${formatCompactAnnual(trajectorySnap.y5)}`,
        description: t('magic.proj5yDesc'),
        Icon: Rocket
      }
    ];
  }, [trajectorySnap, heroDayCapEarnings, futureYearly, heroRateBasis, t]);

  const magicPatternInsights = useMemo((): MagicInsightItem[] | null => {
    if (!heroRateBasis) return null;
    return [
      {
        icon: Zap,
        text: t('magic.insight1'),
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10'
      },
      {
        icon: TrendingUp,
        text: t('magic.insight2'),
        color: 'text-neon',
        bgColor: 'bg-neon/10'
      },
      {
        icon: Clock,
        text: t('magic.insight3'),
        color: 'text-cyan-300',
        bgColor: 'bg-cyan-400/10'
      }
    ];
  }, [heroRateBasis, t]);

  /** Демо-шкала + тексты для шэринга (ставка в валюте счёта или единственной валюте проектов). */
  const moneyAwarenessSnap = useMemo(() => {
    if (!hasPositiveAccrualRate || activeSelectedProjectsOrdered.length === 0) return null;
    const bal = normalizeCurrencyCode(currentBalanceCurrency);
    let rate: number | null = equivalentRatePerSecondInBalanceCcy;
    let rateCurrency = bal;
    if (rate == null && ratesByCurrency.size === 1) {
      const [onlyCcy, onlyR] = [...ratesByCurrency.entries()][0]!;
      rate = onlyR;
      rateCurrency = onlyCcy;
    }
    if (rate == null || !(rate > 0)) return null;
    let demoPct: number | null = null;
    if (fxSnapshot) {
      const eur = convertAmountThroughSnapshot(rate, rateCurrency, 'EUR', fxSnapshot);
      if (eur != null && eur > 0) {
        demoPct = illustrativePercentileFromEurPerSec(eur);
      }
    }
    const lines = buildMoneyAwarenessShareLines({
      ratePerSec: rate,
      currencySymbol: getCurrencySymbol(rateCurrency),
      currencyCode: rateCurrency,
      demoPercentile: demoPct
    });
    return { rate, demoPct, lines, rateCurrency };
  }, [
    hasPositiveAccrualRate,
    activeSelectedProjectsOrdered.length,
    equivalentRatePerSecondInBalanceCcy,
    ratesByCurrency,
    currentBalanceCurrency,
    fxSnapshot
  ]);

  const showAwarenessToast = useCallback((msg: string) => {
    setAwarenessToast(msg);
    window.setTimeout(() => setAwarenessToast(null), 2400);
  }, []);

  const showPortalToast = useCallback((msg: string) => {
    setPortalToast(msg);
    window.setTimeout(() => setPortalToast(null), 2800);
  }, []);

  const applyImportedState = useCallback((parsed: MoneyClockSavedState) => {
    setProjectsBundle(parsed.projectsBundle);
    setCurrentBalance(parsed.currentBalance);
    setCurrentBalanceCurrency(parsed.currentBalanceCurrency);
    setLastPayrollYmd(parsed.lastPayrollYmd);
    setTakeHomeFraction(clampTakeHomeFraction(parsed.takeHomeFraction));
    const ws = normalizeWorkdayStartHour(parsed.workdayStartHour);
    setWorkdayStartHour(ws);
    setWorkdayEndHour(normalizeWorkdayEndHour(parsed.workdayEndHour, ws));
    setProfileBundle(parsed.profile);
    saveMoneyClockState(parsed);
    initialMoneyClockRef.current = null;
    touchLastExportTimestamp();
    setLastExportMs(Date.now());
  }, []);

  useLayoutEffect(() => {
    captureMagicLinkIdFromUrlToSession();
  }, []);

  useEffect(() => {
    const id =
      parseMagicLinkPath(window.location.pathname) || peekMagicLinkIdFromSession();
    if (!id) return;
    console.log('[MoneyClock] cloud restore start', {
      id,
      pathname: window.location.pathname,
      href: window.location.href
    });
    let cancelled = false;
    void (async () => {
      const raw = await fetchCloudBackupJson(id);
      if (cancelled) return;
      if (raw == null) {
        clearMagicLinkSession();
        showPortalToast(t('settings.cloudRestoreFail'));
        return;
      }
      const parsed = parseMoneyClockJson(raw);
      if (!parsed) {
        clearMagicLinkSession();
        showPortalToast(t('settings.cloudRestoreFail'));
        return;
      }
      applyImportedState(parsed);
      showPortalToast(t('settings.cloudRestoreOk'));
      clearMagicLinkSession();
      console.log('[MoneyClock] cloud restore OK → ensureMagicLinkInAddressBar', {
        id,
        pathname: window.location.pathname,
        href: window.location.href
      });
      ensureMagicLinkInAddressBar(id);
    })();
    return () => {
      cancelled = true;
    };
  }, [applyImportedState, showPortalToast, t]);

  const handleShareMoneyAwareness = useCallback(async () => {
    if (!moneyAwarenessSnap) return;
    const text =
      moneyAwarenessSnap.lines[locale] ?? moneyAwarenessSnap.lines.en;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'MoneyClock',
          text
        });
        return;
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showAwarenessToast(t('awareness.copied'));
    } catch {
      showAwarenessToast(t('awareness.copyFail'));
    }
  }, [moneyAwarenessSnap, locale, showAwarenessToast, t]);

  const handleCopyAwareness = useCallback(async () => {
    if (!moneyAwarenessSnap) return;
    const clip = moneyAwarenessSnap.lines[locale] ?? moneyAwarenessSnap.lines.en;
    try {
      await navigator.clipboard.writeText(clip);
      showAwarenessToast(t('awareness.copied'));
    } catch {
      showAwarenessToast(t('awareness.clipboardErr'));
    }
  }, [moneyAwarenessSnap, locale, showAwarenessToast, t]);

  const projectEndedInfo = useMemo(() => {
    const p = singleSelectedForCopy;
    if (!p?.projectEndDate?.trim()) {
      return { ended: false as boolean };
    }
    const pe = parseLocalDateYmd(p.projectEndDate);
    if (pe == null) return { ended: false as boolean };
    const endExclusive = pe + 86400000;
    return { ended: nowTick >= endExclusive };
  }, [singleSelectedForCopy, nowTick]);

  const anySelectedProjectLive = useMemo(
    () =>
      activeSelectedProjectsOrdered.some((p) => p.workStartDate.trim()),
    [activeSelectedProjectsOrdered]
  );

  const persistSnapshot: MoneyClockSavedState = useMemo(
    () => ({
      mode: 'project',
      monthlySalary: '0',
      hourlyRate: '0',
      projectsBundle,
      workedMonths: '0',
      workedDays: '0',
      workedHours: '0',
      workedMinutes: '0',
      currentBalance,
      currentBalanceCurrency,
      lastPayrollYmd,
      takeHomeFraction,
      workdayStartHour,
      workdayEndHour,
      ...(profileBundle !== undefined ? { profile: profileBundle } : {})
    }),
    [
      projectsBundle,
      currentBalance,
      currentBalanceCurrency,
      lastPayrollYmd,
      takeHomeFraction,
      workdayStartHour,
      workdayEndHour,
      profileBundle
    ]
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      saveMoneyClockState(persistSnapshot);
    }, 400);
    return () => window.clearTimeout(id);
  }, [persistSnapshot]);

  const handleExportJson = useCallback(() => {
    const blob = exportMoneyClockJsonBlob(persistSnapshot);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneyclock-${new Date().toISOString().slice(0, 10)}.json`;
    a.rel = 'noopener';
    a.click();
    URL.revokeObjectURL(url);
    touchLastExportTimestamp();
    setLastExportMs(Date.now());
  }, [persistSnapshot]);

  const handleCopyExportJson = useCallback(async () => {
    const text = exportMoneyClockJsonString(persistSnapshot);
    try {
      await navigator.clipboard.writeText(text);
      touchLastExportTimestamp();
      setLastExportMs(Date.now());
      showPortalToast(t('settings.copyJsonOk'));
    } catch {
      showPortalToast(t('settings.copyJsonFail'));
    }
  }, [persistSnapshot, showPortalToast, t]);

  const handleCloudSave = useCallback(async () => {
    if (cloudSavePending) return;
    setCloudSavePending(true);
    try {
      const text = exportMoneyClockJsonCanonical(persistSnapshot);
      const hash = await hashMoneyClockExportJson(text);
      const prev = readCloudBackupMeta();
      if (prev && prev.hash === hash) {
        setCloudLinkModal(buildMagicLinkUrl(`/u/${prev.id}`));
        touchLastExportTimestamp();
        setLastExportMs(Date.now());
        return;
      }
      const { id, path } = await postCloudBackup(text);
      writeCloudBackupMeta(hash, id);
      setCloudLinkModal(buildMagicLinkUrl(path));
      touchLastExportTimestamp();
      setLastExportMs(Date.now());
    } catch {
      showPortalToast(t('settings.cloudErr'));
    } finally {
      setCloudSavePending(false);
    }
  }, [cloudSavePending, persistSnapshot, showPortalToast, t]);

  const handleCopyCloudLink = useCallback(async () => {
    if (!cloudLinkModal) return;
    try {
      await navigator.clipboard.writeText(cloudLinkModal);
      showPortalToast(t('settings.cloudCopied'));
    } catch {
      showPortalToast(t('settings.copyJsonFail'));
    }
  }, [cloudLinkModal, showPortalToast, t]);

  const handleCopyLastCloudProfileUrl = useCallback(async () => {
    const url = getLastCloudProfileMagicUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      showPortalToast(t('settings.cloudCopied'));
    } catch {
      showPortalToast(t('settings.copyJsonFail'));
    }
  }, [showPortalToast, t]);

  const handleSnoozeBackupBanner = useCallback(() => {
    const until = Date.now() + 14 * 86400000;
    persistBackupBannerSnoozeUntil(until);
    setBackupSnoozeUntil(until);
  }, []);

  const handlePickImportFile = useCallback(() => {
    importFileRef.current?.click();
  }, []);

  const handleImportJsonFile: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const input = e.target;
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        input.value = '';
        const parsed = parseMoneyClockJson(String(reader.result ?? ''));
        if (!parsed) {
          window.alert(t('import.badFile'));
          return;
        }
        applyImportedState(parsed);
      };
      reader.readAsText(file, 'UTF-8');
    },
    [applyImportedState, t]
  );

  const updateVacation = useCallback(
    (vacationId: string, patch: Partial<VacationEntry>) => {
      if (!activeProject) return;
      const list = activeProject.vacations ?? [];
      patchActiveProject({
        vacations: list.map((v) => (v.id === vacationId ? { ...v, ...patch } : v))
      });
    },
    [activeProject, patchActiveProject]
  );

  const addVacationEntry = useCallback(() => {
    if (!activeProject) return;
    patchActiveProject({
      vacations: [...(activeProject.vacations ?? []), newVacation()]
    });
  }, [activeProject, patchActiveProject]);

  const removeVacationEntry = useCallback(
    (vacationId: string) => {
      if (!activeProject) return;
      patchActiveProject({
        vacations: (activeProject.vacations ?? []).filter((v) => v.id !== vacationId)
      });
    },
    [activeProject, patchActiveProject]
  );

  useEffect(() => {
    document.body.style.overflow = settingsOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [settingsOpen]);

  const clearProfileBundle = useCallback(() => setProfileBundle(undefined), []);

  const profileSettingsBlock = useMemo(() => {
    if (!profileBundle || Object.keys(profileBundle).length === 0) return null;
    const pr = readProfilePersonal(profileBundle);
    const summary =
    typeof profileBundle.summary === 'string' ? profileBundle.summary : '';
    const meta = profileBundle.moneyClockMeta;
    const metaObj =
    meta && typeof meta === 'object' && meta !== null && !Array.isArray(meta) ?
    (meta as Record<string, unknown>) :
    null;
    const metaHints = typeof metaObj?.hints === 'string' ? metaObj.hints : undefined;
    const metaVersion =
    typeof metaObj?.profileVersion === 'string' ? metaObj.profileVersion : undefined;
    const topSkills = Array.isArray(profileBundle.topSkills) ?
    profileBundle.topSkills.filter((x): x is string => typeof x === 'string') :
    [];

    return (
      <motion.div
        layout
        className="mb-4 rounded-r80 border-2 border-violet-200 bg-violet-50/80 p-4 flex flex-col gap-3 dark:border-fuchsia-500/40 dark:bg-[#14061f]/90 dark:shadow-[inset_0_0_0_1px_rgba(255,0,255,0.12)]">
        
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-violet-900 text-xs font-black uppercase tracking-wide">
              {t('profile.title')}
            </p>
            <p className="text-violet-800/80 text-xs mt-0.5">
              {t('profile.storedHint')}
            </p>
          </div>
          <motion.button
            type="button"
            onClick={clearProfileBundle}
            whileTap={{ scale: 0.96 }}
            className="shrink-0 text-xs font-bold text-violet-700 underline decoration-violet-400">
            
            {t('profile.remove')}
          </motion.button>
        </div>

        {(pr.fullName || pr.headline) &&
        <div className="text-center">
          {pr.fullName &&
          <p className="text-gray-900 dark:text-cyan-100 font-black text-lg">{pr.fullName}</p>
          }
          {pr.headline &&
          <p className="text-gray-600 dark:text-fuchsia-200/70 text-sm font-semibold mt-1">{pr.headline}</p>
          }
        </div>
        }

        <div className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-cyan-100/80">
          {pr.location &&
          <p>
            <span className="font-bold text-gray-500">{t('profile.location')} </span>
            {pr.location}
          </p>
          }
          {pr.availability &&
          <p>
            <span className="font-bold text-gray-500">{t('profile.format')} </span>
            {pr.availability}
          </p>
          }
          {pr.email &&
          <p>
            <span className="font-bold text-gray-500">Email: </span>
            <a href={`mailto:${pr.email}`} className="text-sky-700 underline">
              {pr.email}
            </a>
          </p>
          }
          {pr.phone &&
          <p>
            <span className="font-bold text-gray-500">{t('profile.phone')} </span>
            <a href={`tel:${pr.phone.replace(/\s/g, '')}`} className="text-sky-700 underline">
              {pr.phone}
            </a>
          </p>
          }
          {pr.linkedin &&
          <p>
            <span className="font-bold text-gray-500">LinkedIn: </span>
            <a
              href={pr.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-700 underline break-all">
              
              {pr.linkedin}
            </a>
          </p>
          }
        </div>

        {topSkills.length > 0 &&
        <p className="text-xs text-gray-600 text-center">
          <span className="font-bold text-gray-500">{t('profile.topSkills')} </span>
          {topSkills.join(' · ')}
        </p>
        }

        {summary &&
        <p className="text-xs text-gray-600 leading-relaxed border-t border-violet-200/60 pt-3">
          {summary.length > 360 ? `${summary.slice(0, 360)}…` : summary}
        </p>
        }

        {(metaHints || metaVersion) &&
        <p className="text-xs text-violet-900/90 bg-white/60 rounded-r80-sm px-3 py-2 border border-violet-100">
          {metaVersion &&
          <span className="font-bold">
            {t('profile.version')} {metaVersion}.{' '}
          </span>
          }
          {metaHints}
        </p>
        }
      </motion.div>);

  }, [profileBundle, clearProfileBundle, t]);

  const appLocalesSortedByLabel = useMemo(
    () =>
      [...APP_LOCALES].sort((a, b) =>
        t(`lang.${a}`).localeCompare(t(`lang.${b}`), intlLocaleTag[locale], {
          sensitivity: 'base',
          numeric: true
        })
      ),
    [locale, t]
  );

  const lastCloudProfileUrl = getLastCloudProfileMagicUrl();

  const settingsForm = (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-5 pb-5 border-b border-gray-200 dark:border-cyan-900/50">
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <label
            className="text-gray-700 dark:text-cyan-100/90 text-sm font-bold text-center"
            htmlFor="moneyclock-locale-select-settings">
            {t('lang.selectAria')}
          </label>
          <select
            id="moneyclock-locale-select-settings"
            value={locale}
            onChange={(e) => setLocale(e.target.value as AppLocale)}
            aria-label={t('lang.selectAria')}
            className="w-full px-4 py-3.5 rounded-r80-sm border-2 border-sky-400 text-gray-700 dark:border-cyan-500/60 dark:bg-slate-950 dark:text-cyan-50 text-base font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 dark:focus:ring-cyan-500 bg-white">
            {appLocalesSortedByLabel.map((loc) =>
              <option key={loc} value={loc}>
                {t(`lang.${loc}`)}
              </option>
            )}
          </select>
        </div>
        <motion.button
          type="button"
          onClick={() => setTheme((th) => (th === 'dark' ? 'light' : 'dark'))}
          whileTap={{ scale: 0.96 }}
          aria-label={theme === 'dark' ? t('theme.lightAria') : t('theme.darkAria')}
          className="shrink-0 w-full sm:w-14 h-14 rounded-r80-sm flex items-center justify-center bg-gray-100 text-gray-800 border-2 border-gray-200 dark:bg-slate-800 dark:text-amber-200 dark:border-cyan-600/40">
          {theme === 'dark' ?
            <Sun size={26} className="text-amber-400" strokeWidth={2.2} />
          : <Moon size={26} className="text-slate-600" strokeWidth={2.2} />}
        </motion.button>
      </div>

      <motion.h2
        className="text-gray-800 dark:text-fuchsia-200/95 text-2xl font-black text-center tracking-tight mb-1">
        {t('settings.projectsTitle')}
      </motion.h2>
      <p className="text-gray-500 dark:text-cyan-200/45 text-sm text-center mb-4">
        {t('settings.projectsSubtitle')}
      </p>

      {profileSettingsBlock}

      <motion.div
        layout
        className="bg-emerald-50/90 rounded-r80 p-5 border-2 border-emerald-100 mb-4 flex flex-col gap-1 dark:bg-[#0a1520] dark:border-cyan-600/35 dark:shadow-[inset_0_1px_0_0_rgba(0,255,255,0.06)]">
        <InputField
          label={t('settings.balanceLabel')}
          value={currentBalance}
          onChange={setCurrentBalance}
          placeholder="0"
          suffix={balanceCurrencySymbol}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-700 dark:text-cyan-100/90 text-sm font-bold text-center">
            {t('settings.payrollDate')}
          </label>
          <input
            type="date"
            value={lastPayrollYmd}
            onChange={(e) => setLastPayrollYmd(e.target.value)}
            className="w-full px-4 py-3.5 rounded-r80-sm border-2 border-sky-400 text-gray-700 dark:border-cyan-500/60 dark:bg-slate-950 dark:text-cyan-50 text-base font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 dark:focus:ring-cyan-500 bg-white" />
          <p className="text-gray-500 dark:text-cyan-200/45 text-xs text-center leading-relaxed px-1">
            {t('settings.payrollHint')}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-700 dark:text-cyan-100/90 text-sm font-bold text-center">
            {t('settings.accountCcy')}
          </label>
          <select
            value={normalizeCurrencyCode(currentBalanceCurrency)}
            onChange={(e) => setCurrentBalanceCurrency(normalizeCurrencyCode(e.target.value))}
            className="w-full px-4 py-3.5 rounded-r80-sm border-2 border-sky-400 text-gray-700 dark:border-cyan-500/60 dark:bg-slate-950 dark:text-cyan-50 text-base font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 dark:focus:ring-cyan-500 bg-white">
            {MONEYCLOCK_CURRENCIES.map((c) =>
            <option key={c.code} value={c.code}>
                {currencyOptionLabel(c, locale)}
              </option>
            )}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 pt-2 border-t border-emerald-200/50">
          <label className="text-gray-700 dark:text-cyan-100/90 text-sm font-bold text-center">
            {t('settings.takeHome')}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(takeHomeFraction * 100)}
            onChange={(e) =>
              setTakeHomeFraction(clampTakeHomeFraction(Number(e.target.value) / 100))
            }
            className="w-full h-2 accent-emerald-600 dark:accent-cyan-400"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(takeHomeFraction * 100)}
            aria-label={t('settings.takeHomeAria')}
          />
          <p className="text-gray-600 dark:text-cyan-300/55 text-[0.7rem] text-center leading-relaxed px-1">
            {t('settings.takeHomeHint', { pct: Math.round(takeHomeFraction * 100) })}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 pt-2 border-t border-emerald-200/50">
          <label className="text-gray-700 dark:text-cyan-100/90 text-sm font-bold text-center">
            {t('settings.workdayWindow')}
          </label>
          <p className="text-gray-500 dark:text-mp-text text-xs text-center leading-relaxed px-1">
            {t('settings.workdayWindowHint')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-gray-600 dark:text-cyan-200/70 text-[0.65rem] font-bold text-center uppercase tracking-wide">
                {t('settings.workdayStartHour')}
              </span>
              <select
                value={workdayStartHour}
                onChange={(e) => {
                  const s = normalizeWorkdayStartHour(Number(e.target.value));
                  setWorkdayStartHour(s);
                  setWorkdayEndHour((end) => normalizeWorkdayEndHour(end, s));
                }}
                className="w-full px-3 py-2.5 rounded-r80-sm border-2 border-sky-400 text-gray-700 dark:border-cyan-500/60 dark:bg-slate-950 dark:text-cyan-50 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 dark:focus:ring-cyan-500 bg-white"
                aria-label={t('settings.workdayStartHour')}>
                {Array.from({ length: 24 }, (_, h) =>
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}:00
                  </option>
                )}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-600 dark:text-cyan-200/70 text-[0.65rem] font-bold text-center uppercase tracking-wide">
                {t('settings.workdayEndHour')}
              </span>
              <select
                value={workdayEndHour}
                onChange={(e) =>
                  setWorkdayEndHour(
                    normalizeWorkdayEndHour(Number(e.target.value), workdayStartHour)
                  )
                }
                className="w-full px-3 py-2.5 rounded-r80-sm border-2 border-sky-400 text-gray-700 dark:border-cyan-500/60 dark:bg-slate-950 dark:text-cyan-50 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 dark:focus:ring-cyan-500 bg-white"
                aria-label={t('settings.workdayEndHour')}>
                {Array.from({ length: 24 }, (_, i) => {
                  const h = i + 1;
                  return (
                    <option key={h} value={h} disabled={h <= workdayStartHour}>
                      {h === 24 ? t('settings.workdayEndMidnight') : `${String(h).padStart(2, '0')}:00`}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
        <p className="text-gray-500 dark:text-cyan-200/45 text-xs text-center leading-relaxed px-1">
          {t('settings.balanceFooter')}
        </p>
      </motion.div>

      <motion.div
        layout
        className="bg-gray-50 rounded-r80 p-5 border-2 border-gray-100 flex flex-col gap-4 dark:bg-[#0c1022] dark:border-fuchsia-900/40">
        
          {activeProject &&
          <motion.div layout className="flex flex-col gap-4">
            
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 dark:text-cyan-100/90 text-sm font-bold text-center">
                  {t('settings.projectsPicker')}
                </label>
                <p className="text-gray-500 dark:text-cyan-200/45 text-xs text-center leading-relaxed px-1">
                  {t('settings.projectsPickerHint')}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {projects.map((p) => {
                    const isEditing = p.id === activeProjectId;
                    const onDash = selectedProjectIds.includes(p.id);
                    const contractEnded = projectIsEndedByDeadline(p, nowTick);
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-1 rounded-r80-sm border-2 pl-2 pr-1 py-1.5 ${
                          contractEnded ?
                            'border-gray-300 bg-gray-100/90'
                          : 'border-gray-200 bg-white'
                        }`}>
                        <input
                          type="checkbox"
                          checked={onDash}
                          onChange={() => toggleProjectOnDashboard(p.id)}
                          className="h-4 w-4 shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          aria-label={`${t('settings.showOnDashboard')}: ${p.name || t('common.projectFallback')}`}
                        />
                        <motion.button
                          type="button"
                          onClick={() => selectProject(p.id)}
                          whileTap={{ scale: 0.96 }}
                          className="px-2 py-1 rounded-r80-sm text-sm font-bold max-w-[100px] truncate transition-all text-left"
                          style={{
                            background: isEditing ? '#22c55e' : 'transparent',
                            color: isEditing ? '#fff' : '#374151'
                          }}
                          title={t('settings.editProject')}>
                          {p.name || 'Untitled'}
                        </motion.button>
                        {contractEnded ?
                          <span
                            className="shrink-0 text-[0.55rem] font-extrabold uppercase tracking-wide text-slate-600 px-1 py-0.5 rounded border border-slate-300 bg-slate-200/80"
                            title={t('settings.endedBadgeTitle')}>
                            {t('settings.contractEnded')}
                          </span>
                        : null}
                        {projects.length > 1 &&
                        <motion.button
                          type="button"
                          onClick={() => removeProject(p.id)}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-r80-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          aria-label={`Remove ${p.name}`}>
                          <Trash2Icon size={18} />
                        </motion.button>
                        }
                      </div>);

                  })}
                  <motion.button
                    type="button"
                    onClick={addProject}
                    whileTap={{ scale: 0.96 }}
                    className="p-2.5 rounded-r80-sm flex items-center justify-center bg-sky-50 text-sky-600 border-2 border-sky-200"
                    aria-label={t('chart.addProject')}>
                    
                    <PlusIcon size={22} strokeWidth={2.5} />
                  </motion.button>
                </div>
              </div>

              <InputField
              label={t('settings.projectName')}
              value={activeProject.name}
              onChange={(v) => patchActiveProject({ name: v })}
              placeholder="Name"
              inputType="text" />

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 dark:text-cyan-100/90 text-sm font-bold text-center">
                  {t('settings.projectCcy')}
                </label>
                <select
                  value={normalizeCurrencyCode(activeProject.currencyCode)}
                  onChange={(e) =>
                  patchActiveProject({ currencyCode: normalizeCurrencyCode(e.target.value) })
                  }
                  className="w-full px-4 py-3.5 rounded-r80-sm border-2 border-sky-400 text-gray-700 dark:border-cyan-500/60 dark:bg-slate-950 dark:text-cyan-50 text-base font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 dark:focus:ring-cyan-500 bg-white">
                  {MONEYCLOCK_CURRENCIES.map((c) =>
                  <option key={c.code} value={c.code}>
                      {currencyOptionLabel(c, locale)}
                    </option>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 dark:text-cyan-100/90 text-sm font-bold text-center">
                  {t('settings.workStart')}
                </label>
                <input
                  type="date"
                  value={activeProject.workStartDate}
                  onChange={(e) => patchActiveProject({ workStartDate: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-r80-sm border-2 border-sky-400 text-gray-700 dark:border-cyan-500/60 dark:bg-slate-950 dark:text-cyan-50 text-base font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 dark:focus:ring-cyan-500 bg-white"
                />
                <p className="text-gray-500 dark:text-cyan-200/45 text-xs text-center leading-relaxed px-1">
                  {t('settings.workStartHint')}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 dark:text-cyan-100/90 text-sm font-bold text-center">
                  {t('settings.workEnd')}
                </label>
                <input
                  type="date"
                  value={activeProject.projectEndDate}
                  onChange={(e) => patchActiveProject({ projectEndDate: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-r80-sm border-2 border-sky-400 text-gray-700 dark:border-cyan-500/60 dark:bg-slate-950 dark:text-cyan-50 text-base font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 dark:focus:ring-cyan-500 bg-white"
                />
                <p className="text-gray-500 dark:text-cyan-200/45 text-xs text-center leading-relaxed px-1">
                  {t('settings.workEndHint')}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2">
                  <CalendarIcon size={18} className="text-sky-600" />
                  <span className="text-gray-700 text-sm font-bold">
                    {t('settings.vacations')}
                  </span>
                </div>
                <p className="text-gray-500 text-xs text-center leading-relaxed">
                  {t('settings.vacationsHint')}
                </p>
                <div className="flex flex-col gap-3">
                  {(activeProject.vacations ?? []).map((vac, idx) =>
                  <div
                    key={vac.id}
                    className="rounded-r80 border-2 border-gray-200 bg-white p-3 flex flex-col gap-2.5"
                  >
                    
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-500">
                          {t('settings.vacationN', { n: idx + 1 })}
                        </span>
                        <motion.button
                        type="button"
                        onClick={() => removeVacationEntry(vac.id)}
                        whileTap={{ scale: 0.92 }}
                        className="p-2 rounded-r80-sm text-gray-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={t('settings.removeVacation')}>
                        
                          <Trash2Icon size={18} />
                        </motion.button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-gray-600 text-xs font-bold text-center">
                            {t('settings.vacationFrom')}
                          </label>
                          <input
                          type="date"
                          value={vac.startDate}
                          onChange={(e) =>
                          updateVacation(vac.id, { startDate: e.target.value })
                          }
                          className="w-full px-3 py-2.5 rounded-r80-sm border-2 border-sky-400 text-gray-700 dark:border-cyan-500/60 dark:bg-slate-950 dark:text-cyan-50 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-cyan-500 bg-white"
                        />

                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-gray-600 text-xs font-bold text-center">
                            {t('settings.vacationTo')}
                          </label>
                          <input
                          type="date"
                          value={vac.endDate}
                          onChange={(e) =>
                          updateVacation(vac.id, { endDate: e.target.value })
                          }
                          className="w-full px-3 py-2.5 rounded-r80-sm border-2 border-sky-400 text-gray-700 dark:border-cyan-500/60 dark:bg-slate-950 dark:text-cyan-50 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-cyan-500 bg-white"
                        />
                        
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <motion.button
                  type="button"
                  onClick={addVacationEntry}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 py-3 rounded-r80-sm font-bold text-sm bg-amber-50 text-amber-900 border-2 border-amber-200">
                  
                  <PlusIcon size={20} strokeWidth={2.5} />
                  {t('settings.addVacation')}
                </motion.button>
              </div>
            
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 dark:text-cyan-100/90 text-sm font-bold text-center">
                  {t('settings.billingType')}
                </label>
                <select
                  value={activeProject.projectBilling}
                  onChange={(e) =>
                  patchActiveProject({
                    projectBilling: normalizeProjectBillingMode(e.target.value)
                  })
                  }
                  className="w-full px-4 py-3.5 rounded-r80-sm border-2 border-sky-400 text-gray-700 dark:border-cyan-500/60 dark:bg-slate-950 dark:text-cyan-50 text-base font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 dark:focus:ring-cyan-500 bg-white">
                  <option value="monthly">{t('settings.billing.monthly')}</option>
                  <option value="hourly">{t('settings.billing.hourly')}</option>
                  <option value="contract">{t('settings.billing.contract')}</option>
                </select>
                <p className="text-gray-500 dark:text-cyan-200/45 text-xs text-center leading-relaxed px-1">
                  {activeProject.projectBilling === 'monthly' && t('settings.billingHelp.monthly')}
                  {activeProject.projectBilling === 'hourly' && t('settings.billingHelp.hourly')}
                  {activeProject.projectBilling === 'contract' && t('settings.billingHelp.contract')}
                </p>
              </div>

              <InputField
              label={
              activeProject.projectBilling === 'monthly' ?
              t('settings.amount.monthly') :
              activeProject.projectBilling === 'hourly' ?
              t('settings.amount.hourly') :
              t('settings.amount.contract')
              }
              value={activeProject.projectAmount}
              onChange={(v) => patchActiveProject({ projectAmount: v })}
              placeholder={
              activeProject.projectBilling === 'monthly' ? '5000' : activeProject.projectBilling === 'hourly' ? '25' : '50000'
              }
              suffix={
              activeProject.projectBilling === 'monthly' ?
              `${getCurrencySymbol(activeProject.currencyCode)}${t('settings.suffix.perMonth')}` :
              activeProject.projectBilling === 'hourly' ?
              `${getCurrencySymbol(activeProject.currencyCode)}${t('settings.suffix.perHour')}` :
              getCurrencySymbol(activeProject.currencyCode)
              } />
            
            </motion.div>
          }
        
      </motion.div>

      <input
        ref={importFileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportJsonFile} />

      <div className="mt-5 pt-5 border-t border-gray-200 dark:border-cyan-900/40">
        <p className="text-gray-700 dark:text-cyan-100/90 text-sm font-bold text-center mb-1">
          {t('settings.dataTitle')}
        </p>
        <p className="px-0.5 text-center text-xs leading-relaxed text-gray-500 dark:text-mp-text dark:[text-shadow:0_1px_8px_rgba(0,0,0,0.5)] mb-3">
          {t('settings.dataHint')}
        </p>
        <div
          className="rounded-r80-sm border border-amber-200/70 bg-amber-50/90 px-3 py-3 mb-4 dark:border-amber-400/25 dark:bg-amber-500/[0.12]">
          <p className="text-amber-950 dark:text-amber-100/95 text-[0.68rem] font-extrabold uppercase tracking-wide text-center mb-1.5">
            {t('settings.storageRiskTitle')}
          </p>
          <p className="text-center text-xs leading-relaxed text-amber-900/90 dark:text-amber-100 dark:[text-shadow:0_1px_10px_rgba(0,0,0,0.45)]">
            {t('settings.storageRiskBody')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
          <motion.button
            type="button"
            onClick={handleExportJson}
            whileTap={{ scale: 0.98 }}
            className="flex-1 min-w-[10rem] flex items-center justify-center gap-2 py-3.5 px-4 rounded-r80-sm font-bold text-sm bg-sky-50 text-sky-800 border-2 border-sky-200 dark:bg-sky-950/50 dark:text-sky-100 dark:border-sky-500/40">
            <DownloadIcon size={20} strokeWidth={2.2} />
            {t('settings.downloadJson')}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => void handleCopyExportJson()}
            whileTap={{ scale: 0.98 }}
            className="flex-1 min-w-[10rem] flex items-center justify-center gap-2 py-3.5 px-4 rounded-r80-sm font-bold text-sm bg-violet-50 text-violet-900 border-2 border-violet-200 dark:bg-violet-950/40 dark:text-violet-100 dark:border-violet-400/35">
            <Copy size={20} strokeWidth={2.2} />
            {t('settings.copyJson')}
          </motion.button>
          <motion.button
            type="button"
            onClick={handlePickImportFile}
            whileTap={{ scale: 0.98 }}
            className="flex-1 min-w-[10rem] flex items-center justify-center gap-2 py-3.5 px-4 rounded-r80-sm font-bold text-sm bg-gray-100 text-gray-800 border-2 border-gray-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600/60">
            <UploadIcon size={20} strokeWidth={2.2} />
            {t('settings.uploadJson')}
          </motion.button>
        </div>
        <motion.button
          type="button"
          onClick={() => void handleCloudSave()}
          disabled={cloudSavePending}
          whileTap={{ scale: cloudSavePending ? 1 : 0.98 }}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-r80-sm font-bold text-sm bg-cyan-50 text-cyan-900 border-2 border-cyan-200 dark:bg-cyan-950/45 dark:text-cyan-100 dark:border-cyan-500/45 disabled:opacity-60">
          <CloudUpload size={20} strokeWidth={2.2} />
          {cloudSavePending ? t('settings.cloudBusy') : t('settings.saveCloud')}
        </motion.button>
        {lastCloudProfileUrl ?
          <div className="mt-4 rounded-r80-sm border border-cyan-200/70 bg-cyan-50/60 px-3 py-3 dark:bg-cyan-950/35 dark:border-cyan-500/40">
            <p className="text-cyan-900 dark:text-cyan-100/95 text-xs font-bold text-center mb-1">
              {t('settings.cloudProfileLinkTitle')}
            </p>
            <p className="text-gray-600 dark:text-cyan-200/55 text-[0.65rem] text-center leading-snug mb-2 px-0.5">
              {t('settings.cloudProfileLinkHint')}
            </p>
            <p className="break-all text-center text-[0.65rem] font-mono text-gray-800 dark:text-cyan-50/90 bg-white/85 dark:bg-slate-900/85 rounded-r80-sm px-2 py-2 border border-cyan-100 dark:border-cyan-900/45 mb-2">
              {lastCloudProfileUrl}
            </p>
            <motion.button
              type="button"
              onClick={() => void handleCopyLastCloudProfileUrl()}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-r80-sm font-bold text-xs bg-white text-cyan-900 border border-cyan-200 dark:bg-slate-900 dark:text-cyan-100 dark:border-cyan-500/40">
              <Copy size={16} strokeWidth={2.2} />
              {t('settings.cloudProfileCopy')}
            </motion.button>
          </div>
        : null}
      </div>
    </>
  );

  const fxCaptionBlock = useMemo(() => {
    if (!fxSnapshot) return null;
    return buildFxCaptionForProjects(
      fxSnapshot,
      currentBalanceCurrency,
      selectedProjectsOrdered.map((p) => p.currencyCode)
    );
  }, [fxSnapshot, currentBalanceCurrency, selectedProjectsOrdered]);

  return (
    <div className="relative w-full min-h-screen flex flex-col overflow-x-hidden dark:bg-deep grid-bg">
      {theme === 'dark' ?
        <div className="scanline-overlay" aria-hidden />
      : null}
      {theme === 'light' ?
        <ParticleBackground sparse />
      : null}
      {theme === 'dark' ?
        <MagicPatternsAmbient />
      : null}

      <div className="relative z-10 flex-1 w-full max-w-[min(100%,96rem)] mx-auto px-5 pt-6 pb-10 flex flex-col min-h-0 dark:max-w-3xl dark:mx-auto dark:px-4 dark:sm:px-6 dark:pt-2 dark:pb-8">
        <div className="flex-1 flex flex-col justify-center py-6 sm:py-8 w-full min-h-0 dark:py-0 dark:justify-start">
          <div className="relative w-full max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-1 sm:px-2 pt-6 sm:pt-9 pb-11 sm:pb-14 dark:max-w-3xl dark:mx-auto dark:px-0 dark:pt-0 dark:pb-4">
            <motion.div
              layout={theme === 'light'}
              className={
                theme === 'light' ?
                  'relative z-10 w-full overflow-hidden px-1 sm:px-2 rounded-r80 border border-white/10 bg-white/[0.05] backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)]'
                : 'contents'
              }>
              {theme === 'light' ?
                <>
                  <div
                    className="pointer-events-none absolute inset-0 z-0 opacity-50"
                    style={{
                      background:
                        'radial-gradient(ellipse 75% 45% at 50% -15%, rgba(255,255,255,0.14), transparent 52%)'
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 z-0 opacity-0"
                    style={{
                      background:
                        'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,255,136,0.05), transparent 55%)'
                    }}
                  />
                </>
              : null}
              <div
                className={
                  theme === 'light' ?
                    'relative z-10 flex flex-col gap-5 sm:gap-6 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-5 sm:pb-7'
                  : 'relative z-10 flex w-full min-w-0 flex-col gap-3 sm:gap-4 px-0 sm:px-0 lg:px-1 pt-0 sm:pt-1 pb-4 sm:pb-5'
                }>
              <div className="sticky top-0 z-30 flex flex-wrap items-center justify-end gap-2 pt-0.5 pb-3 -mt-0.5 dark:pt-0 dark:pb-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSettingsOpen(true)}
                  aria-label={t('settings.aria')}
                  title={t('settings.aria')}
                  style={{ imageRendering: 'pixelated' }}
                  className={`shrink-0 ${ARCADE_SETTINGS_BTN_CLASS}`}>
                  <PixelSettingsCog className="w-[1.05rem] h-[1.05rem] sm:w-[1.15rem] sm:h-[1.15rem]" />
                </motion.button>
              </div>
              {showBackupReminderBanner ?
                <div
                  className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-3 py-3 sm:px-4 sm:py-3.5"
                  role="status">
                  <p className="text-amber-100/95 text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-center mb-1.5">
                    {t('backupBanner.title')}
                  </p>
                  <p className="mx-auto mb-3 max-w-md text-center text-sm font-medium leading-relaxed text-amber-950/95 dark:text-amber-50 dark:[text-shadow:0_1px_10px_rgba(0,0,0,0.55)]">
                    {t('backupBanner.body')}
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2 max-w-md mx-auto">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSettingsOpen(true)}
                      className="flex-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-[#061018] bg-amber-200 px-4 py-2.5 rounded-r80-sm hover:brightness-105 border border-amber-100/50">
                      {t('backupBanner.openSettings')}
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSnoozeBackupBanner}
                      className="flex-1 text-[0.65rem] font-bold uppercase tracking-wide text-amber-100/85 border border-amber-200/35 px-4 py-2.5 rounded-r80-sm hover:bg-amber-400/10">
                      {t('backupBanner.later')}
                    </motion.button>
                  </div>
                </div>
              : null}
              {hasPositiveAccrualRate && heroRateBasis && realRateBreakdown ?
                <>
                  <section
                    className={
                      theme === 'dark' ?
                        'text-center w-full space-y-2 sm:space-y-2.5 px-0 pt-1 sm:pt-1.5 pb-1'
                      : 'text-center max-w-2xl mx-auto space-y-4 sm:space-y-5 pt-2 pb-1'
                    }
                    aria-label={t('hero.aria')}
                    id="dash-hero">
                    <p
                      className={
                        theme === 'light' ?
                          'text-slate-600 text-sm sm:text-base font-semibold leading-snug max-w-[20rem] mx-auto tracking-tight'
                        : 'text-white/40 text-sm sm:text-base font-medium leading-snug max-w-[20rem] mx-auto tracking-[0.2em] uppercase'
                      }>
                      {t('hero.tagline')}
                    </p>
                    {heroTodayAccrual != null ?
                      <div
                        className={theme === 'dark' ? 'relative pt-0' : 'relative pt-1'}
                        id="dash-today">
                        <div
                          className={
                            theme === 'dark' ?
                              'relative flex min-w-0 flex-col gap-1'
                            : 'relative flex min-w-0 flex-col gap-1.5'
                          }>
                        <p
                          className={
                            theme === 'light' ?
                              'text-white/60 text-[0.68rem] sm:text-[0.72rem] font-extrabold uppercase tracking-[0.2em]'
                            : 'text-sm font-medium tracking-[0.2em] uppercase text-white/40'
                          }>
                          {t('hero.today')}
                        </p>
                        {theme === 'dark' ?
                          <div className="relative mx-auto w-fit max-w-full self-center">
                            <div
                              className="pointer-events-none absolute left-1/2 top-1/2 h-[min(360px,48vh)] w-[min(420px,100%)] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/5 blur-[120px]"
                              aria-hidden
                            />
                            <div
                              className={`hero-rate-glow relative z-[1] font-mono dark:font-arcade font-black tabular-nums leading-none text-[var(--accent-money)] flex flex-wrap items-baseline justify-center gap-x-1 glow-green`}
                              style={{ fontSize: 'clamp(3rem, 14vmin, 6rem)' }}>
                              <AnimatedCounter
                                value={heroTodayAccrual}
                                prefix={`+${heroRateBasis.symbol}`}
                                decimals={2}
                                atmosphere
                                leavesCount={16}
                              />
                            </div>
                          </div>
                        : <div
                            className={`hero-rate-glow font-mono dark:font-arcade font-black tabular-nums leading-none text-[var(--accent-money)] flex flex-wrap items-baseline justify-center gap-x-1 ${theme === 'dark' ? 'glow-green' : ''}`}
                            style={{ fontSize: 'clamp(3rem, 14vmin, 6rem)' }}>
                            <AnimatedCounter
                              value={heroTodayAccrual}
                              prefix={`+${heroRateBasis.symbol}`}
                              decimals={2}
                              atmosphere
                              leavesCount={16}
                            />
                          </div>
                        }
                        <div
                          className={
                            theme === 'dark' ?
                              'flex flex-col items-center text-center mt-4'
                            : 'flex flex-col items-center gap-3 pt-3 border-t border-white/[0.06]'
                          }>
                          {theme === 'light' ?
                            <p className="text-white/60 text-[0.62rem] font-extrabold uppercase tracking-[0.2em]">
                              {t('hero.now')}
                            </p>
                          : null}
                          {theme === 'dark' ?
                            <>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex items-center justify-center gap-2">
                                <span className="relative flex h-2 w-2 shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon/60 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neon" />
                                </span>
                                <span className="font-mono text-sm text-neon/70 animate-pulse-glow tabular-nums">
                                  +{heroRateBasis.symbol}
                                  {heroRateBasis.perSec.toFixed(4)}{' '}
                                  {t('hero.heroEarningsPerSecond')}
                                </span>
                              </motion.div>
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                className="mt-3 text-xs text-white/25">
                                {heroRateBasis.symbol}
                                {realRateBreakdown.nominalPerHour.toFixed(2)}{' '}
                                {t('hero.heroEarningsHour')} ·{' '}
                                {t('hero.heroEarningsLive')}
                              </motion.p>
                            </>
                          : <>
                              <div
                                className="hero-rate-glow flex min-w-0 flex-nowrap items-center justify-center gap-x-2 font-mono font-black tabular-nums leading-none text-[var(--accent-money)]"
                                style={{
                                  fontSize: 'clamp(1.08rem, 4.1vmin, 1.55rem)'
                                }}>
                                <span className="font-mono tabular-nums shrink-0">
                                  +{heroRateBasis.symbol}
                                  {heroRateBasis.perSec.toFixed(4)}
                                </span>
                                <span className="font-sans text-[0.68em] font-bold tracking-tight text-white/72">
                                  {t('hero.perSec')}
                                </span>
                              </div>
                              <div
                                className="hero-rate-glow flex flex-wrap items-baseline justify-center gap-x-1.5 gap-y-0.5 font-mono font-black tabular-nums leading-none text-[var(--accent-money)]/95"
                                style={{
                                  fontSize: 'clamp(1.5rem, 5vmin, 2.25rem)'
                                }}>
                                <span
                                  className="font-sans font-bold text-white/50"
                                  style={{ fontSize: '0.42em' }}>
                                  ≈
                                </span>
                                <span className="tracking-tight">
                                  {heroRateBasis.symbol}
                                  {realRateBreakdown.nominalPerHour.toFixed(2)}
                                </span>
                                <span
                                  className="font-sans font-bold text-white/58"
                                  style={{ fontSize: '0.52em' }}>
                                  {t('hero.perHour')}
                                </span>
                                <span
                                  className="font-sans font-medium text-white/42"
                                  style={{ fontSize: '0.44em' }}>
                                  · {heroRateBasis.code}
                                </span>
                              </div>
                            </>
                          }
                        </div>
                        {heroDayCapEarnings != null &&
                        heroDayRemainingEarnings != null &&
                        heroRateBasis ?
                          <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.7,
                              delay: 0.2,
                              ease: MP_DAY_PROGRESS_EASE
                            }}
                            className={
                              theme === 'dark' ?
                                'w-full px-0 pb-6 mt-16 sm:mt-20'
                              : 'mt-8 sm:mt-10 pt-4 border-t border-white/[0.08] max-w-3xl mx-auto px-1 w-full'
                            }
                            aria-label={t('hero.dayMeterAria')}>
                            <div
                              className={
                                theme === 'dark' ?
                                  'glass-card w-full p-6 sm:p-8'
                                : 'w-full'
                              }>
                              <div
                                className={
                                  theme === 'dark' ?
                                    'flex items-center justify-between mb-6'
                                  : 'flex flex-wrap items-center justify-between gap-2 mb-5'
                                }>
                                <h2
                                  className={
                                    theme === 'dark' ?
                                      'text-xs font-semibold tracking-[0.2em] uppercase text-white/40'
                                    : 'text-[0.58rem] sm:text-[0.62rem] font-black uppercase tracking-[0.28em] text-cyan-300/90 drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]'
                                  }>
                                  {t('hero.dayMeterTitle')}
                                </h2>
                                <span
                                  className={
                                    theme === 'dark' ?
                                      'text-xs text-white/30'
                                    : 'font-mono text-[0.55rem] sm:text-[0.58rem] tabular-nums text-white/55'
                                  }>
                                  {heroDayWindowTimeLabels.start}
                                  {' – '}
                                  {heroDayWindowTimeLabels.end}
                                </span>
                              </div>
                              <div className="relative mb-4">
                                <div
                                  className={
                                    theme === 'dark' ?
                                      'h-2 rounded-full bg-white/5 overflow-hidden'
                                    : 'h-2 rounded-full bg-slate-900/20 overflow-hidden'
                                  }>
                                  <motion.div
                                    className="h-full rounded-full relative"
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${heroDayProgressFraction * 100}%`
                                    }}
                                    transition={{
                                      duration: 0.55,
                                      ease: MP_DAY_PROGRESS_EASE
                                    }}
                                    style={{
                                      background:
                                        'linear-gradient(90deg, #064E3B, #00FF88)'
                                    }}
                                  />
                                </div>
                                <motion.div
                                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                  style={{ top: '4px' }}
                                  initial={{ left: '0%', opacity: 0 }}
                                  animate={{
                                    left: `${heroDayProgressFraction * 100}%`,
                                    opacity: 1
                                  }}
                                  transition={{
                                    duration: 0.55,
                                    ease: MP_DAY_PROGRESS_EASE
                                  }}
                                  aria-hidden>
                                  <div
                                    className={
                                      theme === 'dark' ?
                                        'w-4 h-4 rounded-full bg-neon animate-dot-pulse'
                                      : 'w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                    }
                                  />
                                </motion.div>
                                <div className="flex justify-between mt-3 gap-0.5 sm:gap-1">
                                  {heroDayProgressMarkerLabels.map((label, i) => (
                                    <span
                                      key={`${label}-${i}`}
                                      className={
                                        theme === 'dark' ?
                                          'text-[10px] text-white/20 font-mono tabular-nums shrink min-w-0'
                                        : 'text-[9px] sm:text-[10px] text-white/35 font-mono dark:font-arcade tabular-nums shrink min-w-0'
                                      }>
                                      {label}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div
                                className={
                                  theme === 'dark' ?
                                    'mt-6 pt-6 border-t border-white/5 w-full flex justify-between items-center gap-4'
                                  : 'mt-5 pt-5 border-t border-white/[0.08] w-full flex justify-between items-center gap-4'
                                }>
                                <div className="flex min-w-0 flex-col items-center">
                                  <p
                                    className={
                                      theme === 'dark' ?
                                        'text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1 text-center'
                                      : 'text-[10px] uppercase tracking-[0.15em] text-white/45 mb-1 text-center'
                                    }>
                                    {t('hero.lastHourLabel')}
                                  </p>
                                  <p
                                    className={
                                      theme === 'dark' ?
                                        'font-mono text-lg text-white font-medium tabular-nums text-center'
                                      : 'font-mono dark:font-arcade text-base sm:text-lg text-white font-bold tabular-nums text-[var(--accent-money)] text-center'
                                    }>
                                    +{heroRateBasis.symbol}
                                    {realRateBreakdown.nominalPerHour.toFixed(2)}
                                  </p>
                                </div>
                                <div className="flex min-w-0 flex-col items-center">
                                  <p
                                    className={
                                      theme === 'dark' ?
                                        'text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1 text-center'
                                      : 'text-[10px] uppercase tracking-[0.15em] text-white/45 mb-1 text-center'
                                    }>
                                    {t('hero.remainingLabel')}
                                  </p>
                                  <p
                                    className={
                                      theme === 'dark' ?
                                        'font-mono text-lg text-white/60 font-medium tabular-nums text-center'
                                      : 'font-mono dark:font-arcade text-base sm:text-lg text-white/70 font-bold tabular-nums text-center'
                                    }>
                                    {heroRateBasis.symbol}
                                    {heroDayRemainingEarnings.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                className={
                                  theme === 'dark' ?
                                    'mt-5 flex items-center gap-2 text-neon-dim'
                                  : 'mt-4 flex items-center gap-2 text-emerald-200/70'
                                }>
                                <TrendingUp
                                  className="w-3.5 h-3.5 shrink-0"
                                  aria-hidden
                                />
                                <span className="text-xs font-medium text-left">
                                  {t('hero.dayProgressTrendFaster')}
                                </span>
                              </motion.div>
                            </div>
                          </motion.section>
                        : null}
                        </div>
                      </div>
                    : null}
                  </section>
                  {theme === 'dark' && magicPatternProjections ?
                    <MagicProjectionCards
                      title={t('magic.projectionsTitle')}
                      items={magicPatternProjections}
                    />
                  : null}
                </>
              : !hasPositiveAccrualRate ?
                <section className="text-center py-8 sm:py-10 space-y-4 max-w-md mx-auto px-2">
                  <p className="text-white/70 text-base font-medium leading-relaxed">
                    {t('hero.emptyPrompt')}
                  </p>
                  <p className={`${DASHBOARD_HINT_CLASS} text-center`}>
                    {t('hero.emptyCta')}
                  </p>
                </section>
              : (
                <p className="text-center text-amber-200/90 text-sm py-8 px-4 max-w-md mx-auto leading-relaxed">
                  {t('hero.noFxHint')}
                </p>
              )}

              {hasPositiveAccrualRate && heroRateBasis && realRateBreakdown ?
              <div
                className={
                  theme === 'dark' ?
                    'w-full border-t border-white/[0.06] pt-6 mt-2 space-y-5 px-0'
                  : 'w-full max-w-3xl mx-auto border-t border-white/[0.06] pt-6 mt-2 space-y-5 px-1'
                }
                id="dash-breakdown">
                <div
                  className={`grid gap-x-4 gap-y-6 sm:gap-x-6 ${
                    hideEquivBreakdownTile ? 'grid-cols-1' : 'grid-cols-2'
                  }`}>
                  <div
                    className={
                      theme === 'dark' ?
                        'relative glass-card min-w-0 w-full rounded-2xl p-6 sm:p-8'
                      : 'relative rounded-2xl px-2 py-2 sm:px-3 sm:py-3 min-w-0 ring-1 ring-inset ring-white/[0.05] bg-white/[0.015] dark:bg-transparent dark:ring-0 dark:rounded-none'
                    }>
                    {theme === 'dark' ?
                      <>
                        <div className="mb-5 flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/5">
                            <Wallet
                              className="h-5 w-5 text-white/40"
                              strokeWidth={2}
                              aria-hidden
                            />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                              {t('breakdown.inAccount')}
                            </p>
                          </div>
                        </div>
                        <div
                          className="flex items-baseline gap-1"
                          id="dash-balance">
                          <span className="text-2xl font-light text-white/40">
                            {balanceCurrencySymbol}
                          </span>
                          <AnimatedCounter
                            value={displayBalanceWithAccrual}
                            prefix=""
                            decimals={2}
                            className="font-mono text-4xl font-bold tracking-tight text-white sm:text-5xl"
                          />
                        </div>
                        {heroTodayAccrual != null && heroTodayAccrual > 0 ?
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-neon/10 px-2.5 py-1 font-mono text-xs font-medium text-neon">
                              +{balanceCurrencySymbol}
                              {heroTodayAccrual.toFixed(2)} {t('hero.today')}
                            </span>
                            {balanceTodayPercentVsStart != null ?
                              <span className="font-mono text-xs text-neon/60">
                                +{balanceTodayPercentVsStart}%
                              </span>
                            : null}
                          </div>
                        : null}
                      </>
                    : <>
                        <span
                          className="pointer-events-none absolute right-2.5 top-2.5 text-[var(--accent-money)]/85"
                          aria-hidden>
                          <Layers size={15} strokeWidth={2.2} />
                        </span>
                        <div
                          className="mb-4 w-full min-w-0 border-b border-white/[0.08] pb-4"
                          id="dash-balance">
                          <p className="mb-2 text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-white/60 sm:text-[0.68rem]">
                            {t('breakdown.inAccount')}
                          </p>
                          <div
                            className="font-mono dark:font-arcade font-black tabular-nums leading-none text-white flex flex-wrap items-baseline justify-start gap-x-1 w-full min-w-0"
                            style={{
                              fontSize: 'clamp(1.5rem, 6.5vmin, 2.75rem)',
                              textShadow:
                                '0 2px 20px rgba(0,0,0,0.35), 0 0 28px rgba(255,255,255,0.08)'
                            }}>
                            <AnimatedCounter
                              value={displayBalanceWithAccrual}
                              prefix={balanceCurrencySymbol}
                              decimals={2}
                            />
                          </div>
                        </div>
                      </>
                    }
                    <div
                      className={
                        theme === 'dark' ?
                          'mt-6 border-t border-white/5 pt-5'
                        : ''
                      }>
                    <p
                      className={
                        theme === 'dark' ?
                          'mb-2 text-[0.55rem] font-extrabold uppercase tracking-[0.12em] text-white/50 sm:text-[0.6rem]'
                        : 'text-white/50 text-[0.55rem] sm:text-[0.6rem] font-extrabold uppercase tracking-[0.12em] pr-6 mb-2'
                      }>
                      {t('breakdown.totalEarned')}
                    </p>
                    {selectedProjectsOrdered.length > 0 &&
                    earningsByCurrencySortedForDisplay.length > 1 &&
                    fxSnapshot &&
                    equivalentEarningsInBalanceCcy != null &&
                    <div className="mb-2">
                      <button
                        type="button"
                        onClick={() => setShowAllCurrencies((v) => !v)}
                        className="text-[0.55rem] font-bold uppercase tracking-wide text-cyan-200/80 hover:text-cyan-100 underline decoration-cyan-400/25 underline-offset-2 transition-colors">
                        {showAllCurrencies ?
                          t('breakdown.hideAllCurrencies')
                        : t('breakdown.showAllCurrencies')}
                      </button>
                    </div>
                    }
                    <div
                      className="relative font-black tracking-tight leading-none text-white flex flex-col items-start gap-y-2 min-w-0"
                      style={{
                        fontSize: 'clamp(0.85rem, 3.2vmin, 1.85rem)',
                        textShadow:
                          '0 2px 18px rgba(0,0,0,0.35), 0 0 28px rgba(255,255,255,0.1)'
                      }}>
                      {selectedProjectsOrdered.length > 0 ?
                      (() => {
                          const entries = earningsByCurrencySortedForDisplay;
                          if (entries.length === 0) {
                            return (
                              <AnimatedCounter
                              value={0}
                              prefix={balanceCurrencySymbol}
                              decimals={2} />);


                          }
                          if (entries.length === 1) {
                            const [ccy, val] = entries[0];
                            const ccyActive = currenciesWithActiveContract.has(ccy);
                            return (
                              <div className="flex flex-col items-start gap-1 min-w-0 w-full">
                                <span className="inline-flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className="text-white/65 font-bold drop-shadow"
                                    style={{ fontSize: 'clamp(0.5rem, 1.6vmin, 0.72rem)' }}>
                                    {ccy}
                                  </span>
                                  {!ccyActive ?
                                    <span className="text-[0.45rem] font-extrabold uppercase tracking-[0.1em] text-white/55 px-1.5 py-0.5 rounded-md bg-white/[0.06]">
                                      {t('breakdown.endedBadge')}
                                    </span>
                                  : null}
                                </span>
                                <AnimatedCounter
                                  value={val}
                                  prefix={getCurrencySymbol(ccy)}
                                  decimals={2}
                                />
                              </div>
                            );
                          }
                          if (
                            entries.length > 1 &&
                            fxSnapshot &&
                            equivalentEarningsInBalanceCcy != null &&
                            !showAllCurrencies
                          ) {
                            return (
                              <div className="flex flex-col items-start gap-1.5 w-full min-w-0">
                                <p className="text-white/42 text-[0.55rem] font-bold uppercase tracking-[0.1em]">
                                  {t('breakdown.oneTotalTitle')}
                                </p>
                                <AnimatedCounter
                                  value={equivalentEarningsInBalanceCcy}
                                  prefix={balanceCurrencySymbol}
                                  decimals={2}
                                />
                              </div>
                            );
                          }
                          return entries.map(([ccy, val]) => {
                            const ccyActive = currenciesWithActiveContract.has(ccy);
                            return (
                              <div key={ccy} className="flex flex-col items-start gap-0.5 min-w-0 w-full">
                                <span className="inline-flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className="text-white/65 font-bold drop-shadow"
                                    style={{ fontSize: 'clamp(0.5rem, 1.6vmin, 0.72rem)' }}>
                                    {ccy}
                                  </span>
                                  {!ccyActive ?
                                    <span className="text-[0.45rem] font-extrabold uppercase tracking-[0.1em] text-white/55 px-1.5 py-0.5 rounded-md bg-white/[0.06]">
                                      {t('breakdown.endedBadge')}
                                    </span>
                                  : null}
                                </span>
                                <AnimatedCounter
                                  value={val}
                                  prefix={getCurrencySymbol(ccy)}
                                  decimals={2}
                                />
                              </div>
                            );
                          });
                        })()
                      : <AnimatedCounter
                        value={displayAmount}
                        prefix={balanceCurrencySymbol}
                        decimals={2} />
                      }
                    </div>
                    </div>
                  </div>

                  {!hideEquivBreakdownTile ?
                  <div className="relative rounded-2xl px-2 py-2 sm:px-3 sm:py-3 min-w-0 ring-1 ring-inset ring-white/[0.05] bg-white/[0.015] dark:bg-transparent dark:ring-0 dark:rounded-none overflow-hidden">
                    {equivalentEarningsInBalanceCcy != null && selectedProjectsOrdered.length > 0 ?
                    <>
                      <span
                        className="absolute top-2.5 right-2.5 text-[var(--accent-money)]/75 pointer-events-none"
                        aria-hidden>
                        <CircleDollarSign size={15} strokeWidth={2.2} />
                      </span>
                      <p className="text-white/50 text-[0.55rem] sm:text-[0.6rem] font-extrabold uppercase tracking-[0.12em] pr-6 mb-2">
                        {t('breakdown.equivTitle')}
                      </p>
                      <div
                        className="relative font-black tracking-tight leading-none text-white tabular-nums w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:thin]"
                        style={{
                          fontSize: 'clamp(0.85rem, 3vmin, 1.65rem)',
                          textShadow: '0 1px 14px rgba(0,0,0,0.3)'
                        }}>
                        <AnimatedCounter
                          value={equivalentEarningsInBalanceCcy}
                          prefix={balanceCurrencySymbol}
                          decimals={2}
                        />
                      </div>
                      <p className={`${DASHBOARD_HINT_CLASS} mt-2 pr-1`}>
                        {t('breakdown.equivOneLiner', {
                          ccy: normalizeCurrencyCode(currentBalanceCurrency)
                        })}
                      </p>
                      {balanceAccrualNoFxWarning ?
                        <p className="text-amber-200/75 text-[0.5rem] leading-snug mt-2">
                          {t('breakdown.noAccrualHint')}
                        </p>
                      : null}
                      {balanceAccrualForeignWithFxHint ?
                        <p className={`${DASHBOARD_HINT_CLASS} mt-2`}>
                          {t('breakdown.foreignAccrualFxHint')}
                        </p>
                      : null}
                      {selectedProjectsOrdered.length > 0 &&
                      accountBalanceCurrencyStatus.anyInCcy &&
                      !accountBalanceCurrencyStatus.hasActiveInCcy &&
                      <p className={`${DASHBOARD_HINT_CLASS} mt-2`}>
                        {t('breakdown.allEndedHint')}
                      </p>
                      }
                    </>
                    : <>
                      <span
                        className="absolute top-2.5 right-2.5 text-sky-300/90 pointer-events-none"
                        aria-hidden>
                        <Wallet size={15} strokeWidth={2.2} />
                      </span>
                      <p className="text-white/50 text-[0.55rem] sm:text-[0.6rem] font-extrabold uppercase tracking-[0.12em] pr-6 mb-2">
                        {t('breakdown.accrualTileTitle')}
                      </p>
                      {selectedProjectsOrdered.length > 0 && !accountBalanceCurrencyStatus.anyInCcy ?
                        <span className="inline-flex items-center text-[0.45rem] font-extrabold uppercase tracking-[0.1em] text-amber-200/90 px-1.5 py-0.5 rounded-md bg-amber-400/[0.08] w-fit mb-2">
                          {t('breakdown.noContractsInCcy')}{' '}
                          {normalizeCurrencyCode(currentBalanceCurrency)}
                        </span>
                      : selectedProjectsOrdered.length > 0 &&
                        accountBalanceCurrencyStatus.anyInCcy &&
                        !accountBalanceCurrencyStatus.hasActiveInCcy ?
                        <span className="inline-flex items-center text-[0.45rem] font-extrabold uppercase tracking-[0.1em] text-white/60 px-1.5 py-0.5 rounded-md bg-white/[0.06] w-fit mb-2">
                          {t('breakdown.allEndedWithCcy', {
                            ccy: normalizeCurrencyCode(currentBalanceCurrency)
                          })}
                        </span>
                      : null}
                      {balanceAccrualNoFxWarning ?
                        <p className="text-amber-100/75 text-[0.52rem] leading-snug mb-2">
                          {t('breakdown.noAccrualHint')}
                        </p>
                      : null}
                      {balanceAccrualForeignWithFxHint ?
                        <p className={`${DASHBOARD_HINT_CLASS} mb-2`}>
                          {t('breakdown.foreignAccrualFxHint')}
                        </p>
                      : null}
                      {selectedProjectsOrdered.length > 0 &&
                      accountBalanceCurrencyStatus.anyInCcy &&
                      !accountBalanceCurrencyStatus.hasActiveInCcy &&
                      <p className={`${DASHBOARD_HINT_CLASS} mb-2`}>
                        {t('breakdown.allEndedHint')}
                      </p>
                      }
                      {(selectedProjectsOrdered.length === 0 ||
                      (accountBalanceCurrencyStatus.anyInCcy &&
                        accountBalanceCurrencyStatus.hasActiveInCcy)) &&
                      <>
                        <p
                          className="font-black tabular-nums text-white leading-tight mt-0.5"
                          style={{ fontSize: 'clamp(1.1rem, 4vmin, 1.65rem)' }}>
                          {Math.round(takeHomeFraction * 100)}%
                        </p>
                        <p className={`${DASHBOARD_HINT_CLASS} mt-1.5`}>
                          {t('breakdown.takeHomeTileHint')}
                        </p>
                      </>
                      }
                    </>
                    }
                  </div>
                  : null}
                </div>
              </div>
              : null}

              {hasPositiveAccrualRate &&
              heroRateBasis &&
              realRateBreakdown &&
              fxSnapshot &&
              fxCaptionBlock?.kind === 'missing-rates' &&
              <div
                className="w-full max-w-3xl mx-auto rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] px-3 py-2.5 text-[0.65rem] sm:text-[0.68rem] leading-relaxed text-amber-100/90 text-center md:text-left"
                role="status">
                {t('fx.missing', {
                  codes: fxCaptionBlock.foreignCodes.join(', '),
                  base: normalizeCurrencyCode(fxSnapshot.base)
                })}
              </div>
              }
              {hasPositiveAccrualRate &&
              heroRateBasis &&
              realRateBreakdown &&
              fxReady &&
              !fxSnapshot &&
              <div
                className="rounded-2xl ring-1 ring-inset ring-white/[0.06] px-3 py-2 text-[0.65rem] sm:text-xs text-white/50 text-center md:text-left dark:ring-0 dark:bg-transparent dark:rounded-none"
                role="status">
                {t('fx.failed')}
              </div>
              }

              {hasPositiveAccrualRate &&
              heroRateBasis &&
              realRateBreakdown &&
              selectedProjectsOrdered.length > 0 &&
              <>
                <div
                  className="rounded-2xl ring-1 ring-inset ring-white/[0.05] bg-white/[0.012] dark:bg-transparent dark:ring-0 dark:rounded-none p-2 sm:p-3 lg:p-4 min-h-0 min-w-0 isolate"
                  aria-label={t('chart.ariaPanel')}
                  id="dash-chart">
                  <div className="relative z-[1] min-w-0">
                    <IncomeChart
                      projects={selectedProjectsOrdered}
                      nowMs={nowTick}
                      balanceAfterPayroll={displayBalanceAmount}
                      balanceCurrency={currentBalanceCurrency}
                      lastPayrollYmd={lastPayrollYmd}
                      fxSnapshot={fxSnapshot}
                      fxHistoryRows={fxHistoryRows}
                      inflationYearly={inflationYearly}
                      inflationCurrencyCodes={inflationDisplayCurrencies}
                      trajectoryHint={
                        trajectorySnap ?
                          {
                            y12: trajectorySnap.y12,
                            y12plus: trajectorySnap.y12plus,
                            deltaYear: trajectorySnap.deltaYear,
                            symbol: trajectorySnap.symbol
                          }
                        : null
                      }
                      onOpenGrow={() => setSettingsOpen(true)}
                      embedded
                    />
                  </div>
                </div>
                {theme === 'dark' && magicPatternInsights ?
                  <div className="mt-5 w-full">
                    <MagicInsightsFeed
                      title={t('magic.insightsTitle')}
                      items={magicPatternInsights}
                    />
                  </div>
                : null}
              </>
              }

              {hasPositiveAccrualRate &&
              heroRateBasis &&
              realRateBreakdown &&
              trajectorySnap ?
              <section
                className={
                  theme === 'dark' ?
                    'w-full border-t border-white/[0.06] pt-6 mt-4 px-0'
                  : 'max-w-3xl mx-auto border-t border-white/[0.06] pt-6 mt-4 px-1'
                }
                aria-label={t('trajectory.aria')}
                id="dash-trajectory">
                <p className="mb-2 text-center text-[0.52rem] font-extrabold uppercase tracking-[0.18em] text-mp-text [text-shadow:0_1px_12px_rgba(0,0,0,0.75)] sm:text-[0.54rem]">
                  {t('chart.productTrajectoryLead')}
                </p>
                <p className={`${DASHBOARD_HINT_CLASS} text-center mb-4 px-2`}>
                  {t('trajectory.disclaimer')}
                </p>
                <div className="rounded-2xl px-3 py-5 sm:px-5 sm:py-6 ring-1 ring-inset ring-white/[0.05] bg-white/[0.015] dark:bg-transparent dark:ring-0 dark:rounded-none">
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 items-center">
                    <div className="text-center min-w-0">
                      <p className="mb-2 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-mp-muted sm:text-[0.58rem]">
                        {t('chart.productSteady12')}
                      </p>
                      <p className="text-white font-black tabular-nums leading-tight text-sm sm:text-base">
                        ≈ {trajectorySnap.symbol}
                        {formatCompactAnnual(trajectorySnap.y12)}
                      </p>
                      <p className={`${DASHBOARD_HINT_CLASS} text-center mt-1`}>
                        {t('trajectory.next12')}
                      </p>
                    </div>
                    <ArrowRight
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white/25 shrink-0"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <div className="text-center min-w-0">
                      <p className="mb-2 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-mp-muted sm:text-[0.58rem]">
                        {t('chart.productPlus20')}
                      </p>
                      <p className="text-white font-black tabular-nums leading-tight text-sm sm:text-base">
                        ≈ {trajectorySnap.symbol}
                        {formatCompactAnnual(trajectorySnap.y12plus)}
                      </p>
                      <p className={`${DASHBOARD_HINT_CLASS} text-center mt-1`}>
                        {t('trajectory.next12')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/[0.05] text-center">
                    <p className="text-[var(--accent-money)] font-black tabular-nums text-base sm:text-lg">
                      {trajectorySnap.deltaYear >= 0 ? '+' : '−'}
                      {trajectorySnap.symbol}
                      {formatCompactAnnual(Math.abs(trajectorySnap.deltaYear))}
                      <span className="text-white/40 font-semibold text-xs sm:text-sm ml-1">
                        {t('chart.productPerYearHint')}
                      </span>
                    </p>
                  </div>
                  <details className="hero-more-numbers text-left mt-4 pt-3 border-t border-white/[0.05]">
                    <summary className="text-center text-[0.62rem] font-bold uppercase tracking-wide text-white/40 py-2 cursor-pointer hover:text-white/65">
                      {t('trajectory.morePaths')}
                    </summary>
                    <div className="space-y-3 pb-1 text-center text-xs sm:text-sm text-white/65">
                      <p className="tabular-nums">
                        {t('trajectory.fiveYearLead')}{' '}
                        <span className="text-white font-bold">
                          ≈ {trajectorySnap.symbol}
                          {formatCompactAnnual(trajectorySnap.y5)}
                        </span>
                      </p>
                      <p className="text-white/45 tabular-nums leading-relaxed">
                        {t('trajectory.fiveCompare', {
                          base: `${trajectorySnap.symbol}${formatCompactAnnual(trajectorySnap.y5)}`,
                          plus: `${trajectorySnap.symbol}${formatCompactAnnual(trajectorySnap.y5plus)}`
                        })}
                      </p>
                    </div>
                  </details>
                  <p className={`${DASHBOARD_HINT_CLASS} text-center mt-3`}>
                    {t('trajectory.geekFootnote')}
                  </p>
                </div>
              </section>
              : null}

              {hasPositiveAccrualRate &&
              heroRateBasis &&
              realRateBreakdown &&
              trajectorySnap &&
              <section
                className={
                  theme === 'dark' ?
                    'mt-4 w-full px-0'
                  : 'max-w-3xl mx-auto mt-4 px-1'
                }
                aria-label={t('dashboard.momentumTitle')}
                id="dash-momentum">
                <div className="rounded-2xl px-3 py-4 sm:px-5 sm:py-5 ring-1 ring-inset ring-white/[0.05] bg-white/[0.012] dark:bg-transparent dark:ring-0 dark:rounded-none">
                  <p className="text-white/40 text-[0.55rem] font-extrabold uppercase tracking-[0.14em] text-center mb-2">
                    {t('dashboard.momentumTitle')}
                  </p>
                  <p className="text-center text-[var(--accent-money)] font-bold text-sm sm:text-base mb-4 leading-snug">
                    {t('dashboard.momentumTeaser')}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div className="min-w-0">
                      <p className="text-white/35 text-[0.5rem] sm:text-[0.52rem] font-bold uppercase tracking-[0.08em] mb-1.5">
                        {t('chart.productNow')}
                      </p>
                      <p className="text-white font-black tabular-nums text-xs sm:text-sm">
                        +{heroRateBasis.symbol}
                        {heroRateBasis.perSec >= 0.01 ?
                          heroRateBasis.perSec.toFixed(4)
                        : heroRateBasis.perSec.toFixed(5)}
                      </p>
                      <p className={`${DASHBOARD_HINT_CLASS} mt-0.5`}>{t('hero.perSec')}</p>
                    </div>
                    <div className="min-w-0 border-x border-white/10 px-1">
                      <p className="text-white/35 text-[0.5rem] sm:text-[0.52rem] font-bold uppercase tracking-[0.08em] mb-1.5">
                        {t('chart.productTrendEnd')}
                      </p>
                      <p className="text-white font-black tabular-nums text-xs sm:text-sm">
                        ≈ {trajectorySnap.symbol}
                        {formatCompactAnnual(trajectorySnap.y12)}
                      </p>
                      <p className={`${DASHBOARD_HINT_CLASS} mt-0.5`}>{t('trajectory.next12')}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white/35 text-[0.5rem] sm:text-[0.52rem] font-bold uppercase tracking-[0.08em] mb-1.5">
                        {t('dashboard.momentumColDelta')}
                      </p>
                      <p className="text-[var(--accent-money)] font-black tabular-nums text-xs sm:text-sm">
                        {trajectorySnap.deltaYear >= 0 ? '+' : '−'}
                        {trajectorySnap.symbol}
                        {formatCompactAnnual(Math.abs(trajectorySnap.deltaYear))}
                      </p>
                      <p className={`${DASHBOARD_HINT_CLASS} mt-0.5`}>{t('trajectory.perYearVs')}</p>
                    </div>
                  </div>
                </div>
              </section>
              }

              {hasPositiveAccrualRate && (!heroRateBasis || realRateBreakdown) && (
              <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center px-0 sm:px-2 dark:sm:px-0 space-y-[clamp(0.65rem,3vmin,2.5rem)] border-t border-white/[0.06] pt-4 mt-0.5">
                <>
                  {singleSelectedForCopy &&
                  (singleSelectedForCopy.workStartDate.trim() ||
                  singleSelectedForCopy.projectEndDate.trim()) &&
                  <div
                    className="text-white/60 font-medium drop-shadow space-y-[clamp(0.25rem,1.25vmin,1.25rem)]"
                    style={{ fontSize: 'clamp(0.875rem, 3.75vmin, 4.375rem)' }}>
                    {singleSelectedForCopy.workStartDate.trim() &&
                    <p>
                      {t('dates.start')}{' '}
                      {formatYmdLong(singleSelectedForCopy.workStartDate, locale)}
                    </p>
                    }
                    {singleSelectedForCopy.projectEndDate.trim() &&
                    <p>
                      {t('dates.end')}{' '}
                      {formatYmdLong(singleSelectedForCopy.projectEndDate, locale)}
                    </p>
                    }
                    {projectEndedInfo.ended &&
                    <p className="text-amber-200/95 font-semibold">
                      {t('dates.projectClosed')}
                    </p>
                    }
                  </div>
                  }
                  {moneyAwarenessSnap &&
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="mx-auto w-full rounded-2xl ring-1 ring-inset ring-white/[0.05] bg-white/[0.015] dark:bg-transparent dark:ring-0 dark:rounded-none px-4 py-4 sm:px-5 sm:py-5"
                    id="dash-awareness">
                    <p className="text-center text-white/40 text-[0.52rem] sm:text-[0.54rem] font-extrabold uppercase tracking-[0.18em] mb-3">
                      {t('awareness.title')}
                    </p>
                    <p
                      className="text-center font-black tabular-nums leading-tight"
                      style={{ fontSize: 'clamp(0.95rem, 3.2vmin, 1.35rem)' }}>
                      <span className="text-white/45 text-[0.65em] font-bold block mb-1.5 normal-case tracking-normal">
                        {t('awareness.sub')}
                      </span>
                      <span className="text-[var(--accent-money)]">
                        +{getCurrencySymbol(moneyAwarenessSnap.rateCurrency)}
                        {moneyAwarenessSnap.rate >= 0.01 ?
                          moneyAwarenessSnap.rate.toFixed(3)
                        : moneyAwarenessSnap.rate >= 0.001 ?
                          moneyAwarenessSnap.rate.toFixed(4)
                        : moneyAwarenessSnap.rate.toFixed(5)}
                      </span>
                      <span className="text-white/50 font-bold text-[0.55em]">
                        {' '}
                        {t('hero.perSec')} · {moneyAwarenessSnap.rateCurrency}
                      </span>
                    </p>
                    {moneyAwarenessSnap.demoPct != null ?
                      <>
                        <p
                          className="text-center text-white/75 font-bold mt-3 leading-snug px-1"
                          style={{ fontSize: 'clamp(0.72rem, 2.1vmin, 0.95rem)' }}>
                          {t('awareness.ladder', { pct: moneyAwarenessSnap.demoPct })}
                        </p>
                        <p className="text-center text-[var(--accent-money)]/90 text-[0.58rem] sm:text-[0.6rem] font-semibold mt-1 px-2">
                          ~{moneyAwarenessSnap.demoPct}%
                        </p>
                        <p className={`${DASHBOARD_HINT_CLASS} text-center mt-2 px-2`}>
                          {t('awareness.ladderNote', { pct: moneyAwarenessSnap.demoPct })}
                        </p>
                        <p className={`${DASHBOARD_HINT_CLASS} text-center mt-1.5 px-2`}>
                          {t('awareness.ladderModel')}
                        </p>
                      </>
                    : <p className={`${DASHBOARD_HINT_CLASS} text-center mt-3 px-2`}>
                        {t('awareness.needFx')}
                      </p>
                    }
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => void handleShareMoneyAwareness()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent-money)]/35 bg-[var(--accent-money)]/12 px-3 py-2 text-[0.6rem] sm:text-[0.62rem] font-extrabold uppercase tracking-wide text-[var(--accent-money)] hover:bg-[var(--accent-money)]/18 transition-colors">
                        <Share2 size={14} strokeWidth={2.4} className="opacity-90" aria-hidden />
                        {t('awareness.share')}
                      </motion.button>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => void handleCopyAwareness()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-[0.58rem] sm:text-[0.6rem] font-bold text-white/80 hover:bg-white/10 transition-colors">
                        <Copy size={14} strokeWidth={2.2} className="opacity-85" aria-hidden />
                        {t('awareness.copyCurrent')}
                      </motion.button>
                    </div>
                    {awarenessToast ?
                      <p
                        className="text-center text-amber-200/95 text-[0.58rem] font-semibold mt-3"
                        role="status">
                        {awarenessToast}
                      </p>
                    : null}
                  </motion.div>
                  }

                  <div
                    className="w-full pt-2 space-y-3"
                    id="dash-live-rates">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={
                          'h-2 w-2 shrink-0 rounded-full bg-[var(--accent-money)] shadow-[0_0_10px_rgba(0,255,136,0.65)] ' +
                          (anySelectedProjectLive ? 'animate-pulse' : 'opacity-45')
                        }
                        aria-hidden
                      />
                      <p className="text-white/45 text-[0.58rem] sm:text-[0.62rem] font-extrabold uppercase tracking-[0.2em]">
                        {t('footer.liveRates')}
                      </p>
                    </div>
                    <p className="text-white/50 font-semibold tabular-nums text-center text-[0.65rem] sm:text-[0.72rem] leading-relaxed flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                      {ratesByCurrency.size > 0 ?
                      [...ratesByCurrency.entries()].
                      sort(([a], [b]) => a.localeCompare(b)).
                      map(([ccy, r]) =>
                      <span key={ccy} className="whitespace-nowrap">
                            +{getCurrencySymbol(ccy)}
                            {r.toFixed(4)} {t('footer.perSec')} ({ccy})
                          </span>
                      ) :
                      <>
                          +{balanceCurrencySymbol}
                          {totalRatePerSecond.toFixed(4)} {t('footer.perSec')}
                        </>
                      }
                    </p>
                    {equivalentRatePerSecondInBalanceCcy != null &&
                    <p className="text-center text-white/55 font-semibold tabular-nums text-[0.62rem] sm:text-[0.68rem]">
                      {t('footer.sigmaPerSec')}
                      {balanceCurrencySymbol}
                      {equivalentRatePerSecondInBalanceCcy.toFixed(4)} {t('footer.perSec')}{' '}
                      {t('footer.inCcy')}{' '}
                      {normalizeCurrencyCode(currentBalanceCurrency)} {t('footer.byRate')}
                    </p>
                    }
                    {theme === 'dark' ?
                      <p className="text-center text-[10px] text-white/15 tracking-widest uppercase pt-4 pb-1">
                        {t('footer.appTagline')}
                      </p>
                    : null}
                    <p className="text-center text-white/[0.22] text-[0.52rem] sm:text-[0.55rem] font-semibold uppercase tracking-[0.35em] pt-2">
                      {t('footer.engineBrand')}
                    </p>
                    {fxSnapshot &&
                    <p className={`${DASHBOARD_HINT_CLASS} text-center pt-1 px-2`}>
                      {t('fx.footer')}
                      {fxSnapshot.updatedUtc ?
                        <>
                          {' '}
                          ·{' '}
                          {new Date(fxSnapshot.updatedUtc).toLocaleString(intlLocaleTag[locale], {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </>
                      : null}{' '}
                      <a
                        href="https://www.exchangerate-api.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent-money)]/80 underline underline-offset-2 decoration-[var(--accent-money)]/30 hover:text-[var(--accent-money)]">
                        exchangerate-api.com
                      </a>
                    </p>
                    }
                  </div>
                </>
              </motion.div>
            </AnimatePresence>
              )}
              </div>
            </motion.div>
            <RetroGnomesFrame />
          </div>
        </div>

      <AnimatePresence>
        {settingsOpen &&
        <>
          <motion.button
            type="button"
            aria-label={t('settings.close')}
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] dark:bg-violet-950/60 dark:backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSettingsOpen(false)} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            className="fixed z-50 left-0 right-0 bottom-0 max-h-[min(92vh,100dvh)] max-w-lg mx-auto flex flex-col rounded-t-r80 bg-white dark:bg-[#060914] dark:border-t-2 dark:border-cyan-500/45 shadow-2xl overflow-hidden"
            style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.25)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}>
            
            <div className="shrink-0 pt-3 pb-2 px-5 border-b border-gray-100 dark:border-cyan-900/50 flex items-center justify-between gap-3 bg-white dark:bg-[#060914]">
              <h2
                id="settings-title"
                className="text-lg font-black text-gray-900 dark:text-cyan-200 tracking-tight">
                {t('settings.title')}
              </h2>
              <motion.button
                type="button"
                onClick={() => setSettingsOpen(false)}
                whileTap={{ scale: 0.92 }}
                className="w-11 h-11 rounded-r80-sm flex items-center justify-center bg-gray-100 text-gray-700 dark:bg-fuchsia-950/60 dark:text-fuchsia-100 dark:border dark:border-fuchsia-500/30"
                aria-label={t('settings.close')}>
                
                <XIcon size={22} strokeWidth={2.5} />
              </motion.button>
            </div>
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] dark:bg-[#080c18]">
              
              {settingsForm}
            </div>
          </motion.div>
        </>
        }
      </AnimatePresence>
      <AnimatePresence>
        {cloudLinkModal ?
          <>
            <motion.button
              type="button"
              aria-label={t('settings.cloudClose')}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] dark:bg-violet-950/65"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setCloudLinkModal(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cloud-link-title"
              className="fixed z-[61] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,22rem)] rounded-r80 border-2 border-cyan-200 bg-white p-5 shadow-2xl dark:bg-[#060914] dark:border-cyan-500/50"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              onClick={(e) => e.stopPropagation()}>
              <p
                id="cloud-link-title"
                className="text-center text-base font-black text-gray-900 dark:text-cyan-100 mb-2">
                {t('settings.cloudSavedTitle')}
              </p>
              <p className="text-center text-xs font-bold text-cyan-700 dark:text-cyan-300/90 mb-2">
                {t('settings.cloudLinkLabel')}
              </p>
              <p className="break-all text-center text-xs font-mono text-gray-800 dark:text-cyan-50/90 bg-gray-50 dark:bg-slate-900/80 rounded-r80-sm px-3 py-2 border border-gray-200 dark:border-cyan-900/40 mb-3">
                {cloudLinkModal}
              </p>
              <p className="text-center text-[0.65rem] text-gray-600 dark:text-cyan-200/55 leading-snug mb-4">
                {t('settings.cloudSaveHint')}
              </p>
              <div className="flex flex-col gap-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => void handleCopyCloudLink()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-r80-sm font-bold text-sm bg-violet-50 text-violet-900 border-2 border-violet-200 dark:bg-violet-950/40 dark:text-violet-100 dark:border-violet-400/35">
                  <Copy size={18} strokeWidth={2.2} />
                  {t('settings.cloudCopyLink')}
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCloudLinkModal(null)}
                  className="w-full py-2.5 rounded-r80-sm font-bold text-sm text-gray-600 dark:text-cyan-300/80">
                  {t('settings.cloudClose')}
                </motion.button>
              </div>
            </motion.div>
          </>
        : null}
      </AnimatePresence>
      {portalToast ?
        <div
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[70] max-w-[min(92vw,24rem)] -translate-x-1/2 rounded-r80-sm border border-emerald-400/35 bg-[#061018]/92 px-4 py-3 text-center text-emerald-100/95 text-xs font-semibold shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md"
          role="status">
          {portalToast}
        </div>
      : null}
      </div>
    </div>
  );

}