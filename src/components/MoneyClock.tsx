import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SettingsIcon,
  CalendarIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
  DownloadIcon,
  UploadIcon } from
'lucide-react';
import { ParticleBackground } from './ParticleBackground';
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
  parseMoneyClockJson,
  projectEarningsAt,
  projectRatePerSecond,
  projectIsEndedByDeadline,
  parseLocalDateYmd,
  balanceOnAccountAt,
  MONEYCLOCK_CURRENCIES,
  getCurrencySymbol,
  normalizeCurrencyCode } from
'../moneyClockPersistence';
import {
  fetchLatestFxRates,
  fxRateLinesForAppCurrencies,
  convertAmountThroughSnapshot,
  type FxSnapshot
} from '../fxRates';
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
      <label className="text-gray-700 text-sm font-bold text-center">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3.5 rounded-xl text-gray-700 text-base font-medium placeholder:text-gray-300 outline-none transition-all focus:ring-2 focus:ring-sky-300 bg-white"
          style={{
            border: '2px solid #38bdf8'
          }} />
        
        {suffix &&
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
            {suffix}
          </span>
        }
      </div>
    </div>);

}

function formatYmdLong(ymd: string): string {
  const ts = parseLocalDateYmd(ymd);
  return ts != null ?
  new Date(ts).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) :
  ymd;
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

const initialMoneyClockRef = { current: null as MoneyClockSavedState | null };
function getInitialMoneyClockState(): MoneyClockSavedState {
  if (!initialMoneyClockRef.current) {
    initialMoneyClockRef.current = getHydratedMoneyClockState();
  }
  return initialMoneyClockRef.current;
}

export function MoneyClock() {
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
  const [profileBundle, setProfileBundle] = useState<MoneyClockProfile | undefined>(
    () => getInitialMoneyClockState().profile
  );
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [fxSnapshot, setFxSnapshot] = useState<FxSnapshot | null>(null);
  const [fxReady, setFxReady] = useState(false);

  const { projects, activeProjectId, selectedProjectIds } = projectsBundle;
  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? projects[0],
    [projects, activeProjectId]
  );

  const selectedProjectsOrdered = useMemo(() => {
    return selectedProjectIds
      .map((id) => projects.find((p) => p.id === id))
      .filter((p): p is ProjectEntry => p != null);
  }, [projects, selectedProjectIds]);

  const singleSelectedForCopy =
    selectedProjectsOrdered.length === 1 ? selectedProjectsOrdered[0] : null;

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
      selectedProjectsOrdered.reduce((acc, p) => acc + projectRatePerSecond(p), 0),
    [selectedProjectsOrdered]
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
  const earningsByCurrency = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of selectedProjectsOrdered) {
      const c = normalizeCurrencyCode(p.currencyCode);
      m.set(c, (m.get(c) ?? 0) + projectEarningsAt(p, nowTick));
    }
    return m;
  }, [selectedProjectsOrdered, nowTick]);

  const displayBalanceAmount = useMemo(() => {
    const raw = currentBalance.trim().replace(/[\s,]/g, '');
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  }, [currentBalance]);

  /** Остаток: сумма после последней зарплаты + дельта накоплений по проектам в валюте счёта (с отпусками). */
  const displayBalanceWithAccrual = useMemo(
    () =>
      balanceOnAccountAt(
        selectedProjectsOrdered,
        currentBalanceCurrency,
        displayBalanceAmount,
        lastPayrollYmd,
        nowTick
      ),
    [
      selectedProjectsOrdered,
      currentBalanceCurrency,
      displayBalanceAmount,
      lastPayrollYmd,
      nowTick
    ]
  );

  const balanceCurrencySymbol = getCurrencySymbol(currentBalanceCurrency);

  const ratesByCurrency = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of selectedProjectsOrdered) {
      const c = normalizeCurrencyCode(p.currencyCode);
      m.set(c, (m.get(c) ?? 0) + projectRatePerSecond(p));
    }
    return m;
  }, [selectedProjectsOrdered]);

  /** Сумма накоплений по всем выбранным проектам, пересчитанная в валюту счёта по курсу API. */
  const equivalentEarningsInBalanceCcy = useMemo(() => {
    if (!fxSnapshot || selectedProjectsOrdered.length === 0) return null;
    const target = normalizeCurrencyCode(currentBalanceCurrency);
    let sum = 0;
    for (const p of selectedProjectsOrdered) {
      const raw = projectEarningsAt(p, nowTick);
      const c = convertAmountThroughSnapshot(raw, p.currencyCode, target, fxSnapshot);
      if (c == null) return null;
      sum += c;
    }
    return sum;
  }, [fxSnapshot, selectedProjectsOrdered, currentBalanceCurrency, nowTick]);

  /** Сумма ставок (валюта/сек) всех проектов в пересчёте на валюту счёта. */
  const equivalentRatePerSecondInBalanceCcy = useMemo(() => {
    if (!fxSnapshot || selectedProjectsOrdered.length === 0) return null;
    const target = normalizeCurrencyCode(currentBalanceCurrency);
    let sum = 0;
    for (const p of selectedProjectsOrdered) {
      const r = projectRatePerSecond(p);
      const c = convertAmountThroughSnapshot(r, p.currencyCode, target, fxSnapshot);
      if (c == null) return null;
      sum += c;
    }
    return sum;
  }, [fxSnapshot, selectedProjectsOrdered, currentBalanceCurrency]);

  const hasPositiveAccrualRate = useMemo(
    () => selectedProjectsOrdered.some((p) => projectRatePerSecond(p) > 0),
    [selectedProjectsOrdered]
  );

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
      selectedProjectsOrdered.some(
        (p) =>
          p.workStartDate.trim() && !projectIsEndedByDeadline(p, nowTick)
      ),
    [selectedProjectsOrdered, nowTick]
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
      ...(profileBundle !== undefined ? { profile: profileBundle } : {})
    }),
    [
      projectsBundle,
      currentBalance,
      currentBalanceCurrency,
      lastPayrollYmd,
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
  }, [persistSnapshot]);

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
          window.alert(
            'Файл не подходит. Нужен JSON экспорта MoneyClock: поле v: 1 и блоки mode, projectsBundle и т.д. Файл profile-artem-miherea.json уже совмещён: приложение + вложенный profile.'
          );
          return;
        }
        setProjectsBundle(parsed.projectsBundle);
        setCurrentBalance(parsed.currentBalance);
        setCurrentBalanceCurrency(parsed.currentBalanceCurrency);
        setLastPayrollYmd(parsed.lastPayrollYmd);
        setProfileBundle(parsed.profile);
        saveMoneyClockState(parsed);
      };
      reader.readAsText(file, 'UTF-8');
    },
    []
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
        className="mb-4 rounded-2xl border-2 border-violet-200 bg-violet-50/80 p-4 flex flex-col gap-3">
        
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-violet-900 text-xs font-black uppercase tracking-wide">
              Профиль (из JSON)
            </p>
            <p className="text-violet-800/80 text-xs mt-0.5">
              Хранится вместе с настройками; попадает в «Скачать JSON». Редактируйте исходный файл
              и импортируйте снова.
            </p>
          </div>
          <motion.button
            type="button"
            onClick={clearProfileBundle}
            whileTap={{ scale: 0.96 }}
            className="shrink-0 text-xs font-bold text-violet-700 underline decoration-violet-400">
            
            Убрать из сохранения
          </motion.button>
        </div>

        {(pr.fullName || pr.headline) &&
        <div className="text-center">
          {pr.fullName &&
          <p className="text-gray-900 font-black text-lg">{pr.fullName}</p>
          }
          {pr.headline &&
          <p className="text-gray-600 text-sm font-semibold mt-1">{pr.headline}</p>
          }
        </div>
        }

        <div className="flex flex-col gap-1.5 text-sm text-gray-700">
          {pr.location &&
          <p>
            <span className="font-bold text-gray-500">Локация: </span>
            {pr.location}
          </p>
          }
          {pr.availability &&
          <p>
            <span className="font-bold text-gray-500">Формат: </span>
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
            <span className="font-bold text-gray-500">Тел.: </span>
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
          <span className="font-bold text-gray-500">Top skills: </span>
          {topSkills.join(' · ')}
        </p>
        }

        {summary &&
        <p className="text-xs text-gray-600 leading-relaxed border-t border-violet-200/60 pt-3">
          {summary.length > 360 ? `${summary.slice(0, 360)}…` : summary}
        </p>
        }

        {(metaHints || metaVersion) &&
        <p className="text-xs text-violet-900/90 bg-white/60 rounded-xl px-3 py-2 border border-violet-100">
          {metaVersion &&
          <span className="font-bold">Версия профиля: {metaVersion}. </span>
          }
          {metaHints}
        </p>
        }
      </motion.div>);

  }, [profileBundle, clearProfileBundle]);

  const settingsForm = (
    <>
      <motion.h2
        className="text-gray-800 text-2xl font-black text-center tracking-tight mb-1">
        Проекты
      </motion.h2>
      <p className="text-gray-500 text-sm text-center mb-4">
        Настройки и ставки по контрактам
      </p>

      {profileSettingsBlock}

      <motion.div
        layout
        className="bg-emerald-50/90 rounded-3xl p-5 border-2 border-emerald-100 mb-4 flex flex-col gap-1">
        <InputField
          label="Остаток после последней зарплаты (на её дату)"
          value={currentBalance}
          onChange={setCurrentBalance}
          placeholder="0"
          suffix={balanceCurrencySymbol}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-700 text-sm font-bold text-center">
            Дата последней зарплаты
          </label>
          <input
            type="date"
            value={lastPayrollYmd}
            onChange={(e) => setLastPayrollYmd(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl text-gray-700 text-base font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 bg-white"
            style={{ border: '2px solid #38bdf8' }} />
          <p className="text-gray-500 text-xs text-center leading-relaxed px-1">
            Введите сумму, которая была на счёте после этой выплаты. К остатку на главном экране
            каждую секунду прибавляется ставка × время с полуночи следующего дня после этой даты.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-700 text-sm font-bold text-center">
            Валюта счёта
          </label>
          <select
            value={normalizeCurrencyCode(currentBalanceCurrency)}
            onChange={(e) => setCurrentBalanceCurrency(normalizeCurrencyCode(e.target.value))}
            className="w-full px-4 py-3.5 rounded-xl text-gray-700 text-base font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 bg-white"
            style={{ border: '2px solid #38bdf8' }}>
            {MONEYCLOCK_CURRENCIES.map((c) =>
            <option key={c.code} value={c.code}>
                {c.labelRu}
              </option>
            )}
          </select>
        </div>
        <p className="text-gray-500 text-xs text-center leading-relaxed px-1">
          Счётчик «всего заработано» — сумма по выбранным проектам. Остаток на счёте — отдельно:
          база после зарплаты плюс доначисление с даты (см. выше). К остатку идут только проекты в
          валюте счёта; остальные валюты — в блоке «всего заработано».
        </p>
      </motion.div>

      <motion.div
        layout
        className="bg-gray-50 rounded-3xl p-5 border-2 border-gray-100 flex flex-col gap-4">
        
          {activeProject &&
          <motion.div layout className="flex flex-col gap-4">
            
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm font-bold text-center">
                  Projects
                </label>
                <p className="text-gray-500 text-xs text-center leading-relaxed px-1">
                  Галочка — проект входит в общую сумму и виджет на главном экране (можно несколько).
                  Имя — какой проект редактируется ниже.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {projects.map((p) => {
                    const isEditing = p.id === activeProjectId;
                    const onDash = selectedProjectIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-1 rounded-xl border-2 border-gray-200 bg-white pl-2 pr-1 py-1.5">
                        <input
                          type="checkbox"
                          checked={onDash}
                          onChange={() => toggleProjectOnDashboard(p.id)}
                          className="h-4 w-4 shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          aria-label={`Показать «${p.name || 'проект'}» на главном экране`}
                        />
                        <motion.button
                          type="button"
                          onClick={() => selectProject(p.id)}
                          whileTap={{ scale: 0.96 }}
                          className="px-2 py-1 rounded-lg text-sm font-bold max-w-[120px] truncate transition-all text-left"
                          style={{
                            background: isEditing ? '#22c55e' : 'transparent',
                            color: isEditing ? '#fff' : '#374151'
                          }}
                          title="Редактировать поля этого проекта">
                          {p.name || 'Untitled'}
                        </motion.button>
                        {projects.length > 1 &&
                        <motion.button
                          type="button"
                          onClick={() => removeProject(p.id)}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
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
                    className="p-2.5 rounded-xl flex items-center justify-center bg-sky-50 text-sky-600 border-2 border-sky-200"
                    aria-label="Add project">
                    
                    <PlusIcon size={22} strokeWidth={2.5} />
                  </motion.button>
                </div>
              </div>

              <InputField
              label="Project name"
              value={activeProject.name}
              onChange={(v) => patchActiveProject({ name: v })}
              placeholder="Name"
              inputType="text" />

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 text-sm font-bold text-center">
                  Валюта проекта
                </label>
                <select
                  value={normalizeCurrencyCode(activeProject.currencyCode)}
                  onChange={(e) =>
                  patchActiveProject({ currencyCode: normalizeCurrencyCode(e.target.value) })
                  }
                  className="w-full px-4 py-3.5 rounded-xl text-gray-700 text-base font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 bg-white"
                  style={{ border: '2px solid #38bdf8' }}>
                  {MONEYCLOCK_CURRENCIES.map((c) =>
                  <option key={c.code} value={c.code}>
                      {c.labelRu}
                    </option>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 text-sm font-bold text-center">
                  Дата начала работы
                </label>
                <input
                  type="date"
                  value={activeProject.workStartDate}
                  onChange={(e) => patchActiveProject({ workStartDate: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl text-gray-700 text-base font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 bg-white"
                  style={{ border: '2px solid #38bdf8' }} />
                <p className="text-gray-500 text-xs text-center leading-relaxed px-1">
                  От полуночи этого дня считается прошедшее календарное время (в т.ч. за годы); оно
                  умножается на ставку проекта (месячный платёж, почасовая или сумма контракта за
                  срок до даты окончания). Время в отпусках ниже из интервала вычитается.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 text-sm font-bold text-center">
                  Дата окончания проекта
                </label>
                <input
                  type="date"
                  value={activeProject.projectEndDate}
                  onChange={(e) => patchActiveProject({ projectEndDate: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl text-gray-700 text-base font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 bg-white"
                  style={{ border: '2px solid #38bdf8' }} />
                <p className="text-gray-500 text-xs text-center leading-relaxed px-1">
                  Для типа «вся сумма контракта» срок = интервал между датами (минус отпуск), ставка =
                  сумма / этот срок. Для месячного и почасового типа дата конца только ограничивает
                  период начисления. Пустое окончание — бесконечный срок (до смены даты). Старые
                  сохранения без типа оплаты считаются режимом «контракт целиком».
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2">
                  <CalendarIcon size={18} className="text-sky-600" />
                  <span className="text-gray-700 text-sm font-bold">
                    Отпуска (прошлые и запланированные)
                  </span>
                </div>
                <p className="text-gray-500 text-xs text-center leading-relaxed">
                  Укажите периоды календарём: эти дни не идут в расчёт времени от даты начала работы
                  (концы дней включительно).
                </p>
                <div className="flex flex-col gap-3">
                  {(activeProject.vacations ?? []).map((vac, idx) =>
                  <div
                    key={vac.id}
                    className="rounded-2xl border-2 border-gray-200 bg-white p-3 flex flex-col gap-2.5"
                  >
                    
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-500">
                          Отпуск {idx + 1}
                        </span>
                        <motion.button
                        type="button"
                        onClick={() => removeVacationEntry(vac.id)}
                        whileTap={{ scale: 0.92 }}
                        className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Удалить отпуск">
                        
                          <Trash2Icon size={18} />
                        </motion.button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-gray-600 text-xs font-bold text-center">
                            С даты
                          </label>
                          <input
                          type="date"
                          value={vac.startDate}
                          onChange={(e) =>
                          updateVacation(vac.id, { startDate: e.target.value })
                          }
                          className="w-full px-3 py-2.5 rounded-xl text-gray-700 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                          style={{ border: '2px solid #38bdf8' }} />
                        
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-gray-600 text-xs font-bold text-center">
                            По дату
                          </label>
                          <input
                          type="date"
                          value={vac.endDate}
                          onChange={(e) =>
                          updateVacation(vac.id, { endDate: e.target.value })
                          }
                          className="w-full px-3 py-2.5 rounded-xl text-gray-700 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                          style={{ border: '2px solid #38bdf8' }} />
                        
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <motion.button
                  type="button"
                  onClick={addVacationEntry}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-amber-50 text-amber-900 border-2 border-amber-200">
                  
                  <PlusIcon size={20} strokeWidth={2.5} />
                  Добавить отпуск
                </motion.button>
              </div>
            
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 text-sm font-bold text-center">
                  Тип оплаты
                </label>
                <select
                  value={activeProject.projectBilling}
                  onChange={(e) =>
                  patchActiveProject({
                    projectBilling: normalizeProjectBillingMode(e.target.value)
                  })
                  }
                  className="w-full px-4 py-3.5 rounded-xl text-gray-700 text-base font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 bg-white"
                  style={{ border: '2px solid #38bdf8' }}>
                  <option value="monthly">Месячный платёж</option>
                  <option value="hourly">Почасовая ставка</option>
                  <option value="contract">Вся сумма контракта</option>
                </select>
                <p className="text-gray-500 text-xs text-center leading-relaxed px-1">
                  {activeProject.projectBilling === 'monthly' &&
                  'Как зарплата: сумма в месяц делится на 22×8 рабочих часов, начисление идёт за каждую секунду календарного времени от даты начала.'}
                  {activeProject.projectBilling === 'hourly' &&
                  'Ставка за один час; в секунду = сумма / 3600. Подходит для почасовки.'}
                  {activeProject.projectBilling === 'contract' &&
                  'Общая сумма договора; ставка = она делится на календарный срок между датой начала и окончания (минус отпуск). К концу срока начисление сходится к этой сумме.'}
                </p>
              </div>

              <InputField
              label={
              activeProject.projectBilling === 'monthly' ?
              'Месячный платёж' :
              activeProject.projectBilling === 'hourly' ?
              'Ставка за час' :
              'Сумма контракта целиком'
              }
              value={activeProject.projectAmount}
              onChange={(v) => patchActiveProject({ projectAmount: v })}
              placeholder={
              activeProject.projectBilling === 'monthly' ? '5000' : activeProject.projectBilling === 'hourly' ? '25' : '50000'
              }
              suffix={
              activeProject.projectBilling === 'monthly' ?
              `${getCurrencySymbol(activeProject.currencyCode)} / мес` :
              activeProject.projectBilling === 'hourly' ?
              `${getCurrencySymbol(activeProject.currencyCode)} / ч` :
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

      <div className="mt-5 pt-5 border-t border-gray-200">
        <p className="text-gray-700 text-sm font-bold text-center mb-1">
          Сохранение данных
        </p>
        <p className="text-gray-500 text-xs text-center mb-4 leading-relaxed">
          Настройки автоматически записываются в браузер (localStorage). Файл JSON
          — резервная копия или перенос на другой компьютер.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <motion.button
            type="button"
            onClick={handleExportJson}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-sky-50 text-sky-800 border-2 border-sky-200">
            
            <DownloadIcon size={20} strokeWidth={2.2} />
            Скачать JSON
          </motion.button>
          <motion.button
            type="button"
            onClick={handlePickImportFile}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gray-100 text-gray-800 border-2 border-gray-200">
            
            <UploadIcon size={20} strokeWidth={2.2} />
            Загрузить JSON
          </motion.button>
        </div>
      </div>
    </>
  );

  const fxCaptionLines = fxSnapshot ? fxRateLinesForAppCurrencies(fxSnapshot) : [];

  return (
    <div className="relative w-full min-h-screen flex flex-col overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 flex-1 w-full max-w-[min(100%,96rem)] mx-auto px-5 pt-6 pb-10 flex flex-col min-h-0">
        <header className="flex items-center justify-end shrink-0 mb-4">
          <motion.button
            type="button"
            onClick={() => setSettingsOpen(true)}
            whileTap={{ scale: 0.92 }}
            aria-label="Open settings"
            aria-expanded={settingsOpen}
            className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/10">
            
            <SettingsIcon size={26} className="text-white" strokeWidth={2} />
          </motion.button>
        </header>

        <div className="flex-1 flex flex-col justify-center py-6 sm:py-8 w-full min-h-0">
          <motion.div
            layout
            className="w-full max-w-4xl xl:max-w-5xl mx-auto rounded-[1.75rem] border border-white/20 bg-gradient-to-b from-white/[0.13] to-white/[0.05] backdrop-blur-2xl shadow-[0_16px_64px_rgba(0,0,0,0.28)] ring-1 ring-inset ring-white/10 relative overflow-hidden px-1 sm:px-2">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.45]"
              style={{
                background:
                  'radial-gradient(ellipse 85% 55% at 50% -25%, rgba(255,255,255,0.2), transparent 50%)'
              }}
            />
            <div className="relative flex flex-col gap-5 sm:gap-6 px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-5 sm:pb-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
                <div className="space-y-3 text-center md:text-left min-w-0">
                  <p className="text-white/60 text-[0.65rem] sm:text-xs font-extrabold uppercase tracking-[0.14em]">
                    Всего заработано
                  </p>
                  <p className="text-white/42 text-[0.6rem] sm:text-[0.62rem] leading-snug max-w-md mx-auto md:mx-0">
                    Сумма по всем выбранным проектам; каждая валюта считается отдельно.
                  </p>
                  <div
                    className="relative font-black tracking-tight leading-none text-white flex flex-col md:flex-row md:flex-wrap items-center md:items-baseline justify-center md:justify-start gap-x-6 gap-y-3"
                    style={{
                      fontSize: 'clamp(1rem, 4.2vmin, 3.25rem)',
                      textShadow:
                        '0 2px 22px rgba(0,0,0,0.35), 0 0 36px rgba(255,255,255,0.12)'
                    }}>
                    {selectedProjectsOrdered.length > 0 ?
                    (() => {
                        const entries = [...earningsByCurrency.entries()].sort(([a], [b]) =>
                        a.localeCompare(b)
                        );
                        if (entries.length === 0) {
                          return (
                            <AnimatedCounter
                            value={0}
                            prefix={balanceCurrencySymbol}
                            decimals={2} />);


                        }
                        if (entries.length === 1) {
                          const [ccy, val] = entries[0];
                          return (
                            <AnimatedCounter
                            value={val}
                            prefix={getCurrencySymbol(ccy)}
                            decimals={2} />);


                        }
                        return entries.map(([ccy, val]) =>
                        <div key={ccy} className="flex flex-col items-center md:items-start gap-0.5">
                            <span
                            className="text-white/70 font-bold drop-shadow"
                            style={{ fontSize: 'clamp(0.55rem, 1.85vmin, 0.8rem)' }}>
                              {ccy}
                            </span>
                            <AnimatedCounter
                            value={val}
                            prefix={getCurrencySymbol(ccy)}
                            decimals={2} />
                          </div>
                        );
                      })()
                    : <AnimatedCounter
                      value={displayAmount}
                      prefix={balanceCurrencySymbol}
                      decimals={2} />
                    }
                  </div>
                  {equivalentEarningsInBalanceCcy != null &&
                  selectedProjectsOrdered.length > 0 &&
                  <div className="pt-3 mt-1 border-t border-white/12 w-full max-w-xl mx-auto md:mx-0">
                    <p className="text-white/50 text-[0.58rem] sm:text-[0.6rem] font-extrabold uppercase tracking-[0.12em] mb-1">
                      Всего в валюте счёта (по курсу)
                    </p>
                    <p className="text-white/36 text-[0.55rem] leading-snug mb-2">
                      Сумма накоплений по всем выбранным проектам, пересчитанная в{' '}
                      {normalizeCurrencyCode(currentBalanceCurrency)} по текущему курсу API.
                    </p>
                    <div
                      className="font-black tracking-tight text-white/95 tabular-nums"
                      style={{
                        fontSize: 'clamp(0.95rem, 2.8vmin, 1.65rem)',
                        textShadow: '0 1px 14px rgba(0,0,0,0.35)'
                      }}>
                      <AnimatedCounter
                        value={equivalentEarningsInBalanceCcy}
                        prefix={balanceCurrencySymbol}
                        decimals={2}
                      />
                    </div>
                  </div>
                  }
                </div>

                <div className="space-y-2 text-center md:text-left min-w-0 pt-1 border-t border-white/10 md:border-t-0 md:border-l md:border-white/15 md:pl-10">
                  <p className="text-white/60 text-[0.65rem] sm:text-xs font-extrabold uppercase tracking-[0.14em]">
                    На счёте сейчас
                  </p>
                  <p
                    className="text-white/48 font-medium leading-relaxed max-w-md mx-auto md:mx-0 sm:hidden"
                    style={{ fontSize: 'clamp(0.58rem, 1.45vmin, 0.72rem)' }}>
                    База после зарплаты + доначисление с полуночи следующего дня после даты зарплаты. В
                    остаток входят только проекты в валюте счёта; остальные валюты — в блоке «Всего
                    заработано».
                  </p>
                  <p
                    className="text-white/45 font-medium leading-relaxed max-w-md mx-auto md:mx-0 hidden sm:block"
                    style={{ fontSize: 'clamp(0.58rem, 1.5vmin, 0.75rem)' }}>
                    Остаток в валюте счёта: сумма после последней зарплаты плюс доначисление с полуночи
                    следующего дня после даты зарплаты до сейчас. К остатку относятся только проекты в
                    той же валюте; проекты в других валютах учитываются только в «Всего заработано».
                  </p>
                  <div
                    className="relative font-black tracking-tight leading-none text-white tabular-nums"
                    style={{
                      fontSize: 'clamp(1.1rem, 2.9vmin, 2.05rem)',
                      textShadow:
                        '0 2px 18px rgba(0,0,0,0.32), 0 0 28px rgba(255,255,255,0.1)'
                    }}>
                    <AnimatedCounter
                      value={displayBalanceWithAccrual}
                      prefix={balanceCurrencySymbol}
                      decimals={2}
                    />
                  </div>
                </div>
              </div>

              {fxCaptionLines.length > 0 &&
              <div
                className="rounded-xl bg-black/35 border border-white/15 px-3 py-2.5 sm:py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                role="note"
                aria-label="Справочные курсы валют">
                <p
                  className="text-[0.68rem] sm:text-xs leading-relaxed text-white/78 text-center md:text-left font-medium tabular-nums [text-shadow:0_1px_2px_rgba(0,0,0,0.45)] select-text"
                  title={fxCaptionLines.map((x) => x.line).join(' · ')}>
                  <span className="text-white/55 font-bold uppercase tracking-wider text-[0.6rem] sm:text-[0.65rem]">
                    Курс{' '}
                  </span>
                  {fxCaptionLines.map(({ code, line }, i) =>
                    <React.Fragment key={code}>
                      {i > 0 ?
                        <span className="text-white/35 mx-1.5" aria-hidden>
                          ·
                        </span>
                      : null}
                      <span className="text-white/90">{line}</span>
                    </React.Fragment>
                  )}
                </p>
                <p className="text-[0.6rem] sm:text-[0.65rem] text-white/45 mt-1.5 text-center md:text-left leading-snug">
                  Используется для блока «Всего в валюте счёта», ставки Σ / sec и розовой линии на графике.
                  {fxSnapshot?.updatedUtc ?
                    <>
                      {' '}
                      ·{' '}
                      {new Date(fxSnapshot.updatedUtc).toLocaleString(undefined, {
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
                    className="text-amber-200/90 underline underline-offset-2 decoration-amber-200/40 hover:text-amber-100">
                    exchangerate-api.com
                  </a>
                </p>
              </div>
              }
              {fxReady && fxCaptionLines.length === 0 &&
              <div
                className="rounded-xl bg-black/35 border border-white/15 px-3 py-2 text-[0.65rem] sm:text-xs text-white/60 text-center md:text-left [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"
                role="status">
                Курсы не загрузились — пересчёт в валюту счёта и линия на графике недоступны. Остаток и
                суммы по валютам без изменений.
              </div>
              }

              {selectedProjectsOrdered.length > 0 &&
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-white/18 to-transparent shrink-0" />
                <div className="min-w-0">
                  <p className="text-white/45 text-[0.62rem] font-bold uppercase tracking-wider mb-2.5">
                    Проекты в расчёте
                  </p>
                  <div
                    className="flex gap-2.5 overflow-x-auto pb-2 -mx-0.5 px-0.5 snap-x snap-mandatory [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.3)_transparent]"
                    aria-label="Проекты на главном экране">
                    {selectedProjectIds.map((id) => {
                      const p = projects.find((x) => x.id === id);
                      if (!p) return null;
                      return (
                        <motion.div
                          key={id}
                          layout
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="snap-start shrink-0 w-[min(11.5rem,72vw)] rounded-xl bg-white/10 backdrop-blur-sm border border-white/18 shadow-md px-3 py-2.5">
                          <p className="text-white/88 text-[0.68rem] sm:text-[0.72rem] font-bold truncate text-left mb-1 leading-tight">
                            {p.name || 'Проект'}
                          </p>
                          <div
                            className="relative font-black tracking-tight leading-none text-white flex justify-start tabular-nums"
                            style={{
                              fontSize: 'clamp(0.62rem, 1.75vmin, 0.95rem)',
                              textShadow: '0 1px 8px rgba(0,0,0,0.35)'
                            }}>
                            <AnimatedCounter
                              value={projectEarningsAt(p, nowTick)}
                              prefix={getCurrencySymbol(p.currencyCode)}
                              decimals={2}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div
                  className="rounded-2xl bg-black/22 border border-white/12 p-3 sm:p-4 lg:p-5 min-h-0 min-w-0 shadow-inner"
                  aria-label="График дохода">
                  <p className="text-white/55 text-[0.62rem] font-extrabold uppercase tracking-[0.12em] mb-3 text-center sm:text-left">
                    Динамика накоплений
                  </p>
                  <IncomeChart
                    projects={selectedProjectsOrdered}
                    nowMs={nowTick}
                    balanceAfterPayroll={displayBalanceAmount}
                    balanceCurrency={currentBalanceCurrency}
                    lastPayrollYmd={lastPayrollYmd}
                    fxSnapshot={fxSnapshot}
                    embedded
                  />
                </div>
              </>
              }

              <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center px-0 sm:px-2 space-y-[clamp(0.65rem,3vmin,2.5rem)] border-t border-white/10 pt-4 mt-0.5">
                
                {!hasPositiveAccrualRate ?
                <p
                  className="text-white/75 font-semibold drop-shadow"
                  style={{ fontSize: 'clamp(1rem, 4.25vmin, 5rem)' }}>
                  Откройте настройки и задайте сумму и срок — сумма посчитается сама
                </p> :
                <>
                  {singleSelectedForCopy &&
                  (singleSelectedForCopy.workStartDate.trim() ||
                  singleSelectedForCopy.projectEndDate.trim()) &&
                  <div
                    className="text-white/60 font-medium drop-shadow space-y-[clamp(0.25rem,1.25vmin,1.25rem)]"
                    style={{ fontSize: 'clamp(0.875rem, 3.75vmin, 4.375rem)' }}>
                    {singleSelectedForCopy.workStartDate.trim() &&
                    <p>Начало: {formatYmdLong(singleSelectedForCopy.workStartDate)}</p>
                    }
                    {singleSelectedForCopy.projectEndDate.trim() &&
                    <p>Окончание: {formatYmdLong(singleSelectedForCopy.projectEndDate)}</p>
                    }
                    {projectEndedInfo.ended &&
                    <p className="text-amber-200/95 font-semibold">
                      Проект завершён — итог за период зафиксирован
                    </p>
                    }
                  </div>
                  }
                  <div
                    className="flex items-center justify-center"
                    style={{ gap: 'clamp(0.5rem, 2.5vmin, 2.5rem)' }}>
                    <div
                    className="rounded-full shrink-0"
                    style={{
                      width: 'clamp(0.625rem, 3.125vmin, 3.125rem)',
                      height: 'clamp(0.625rem, 3.125vmin, 3.125rem)',
                      background:
                        anySelectedProjectLive ?
                          '#fff' :
                          '#ffffffaa',
                      boxShadow:
                        anySelectedProjectLive ?
                          '0 0 10px rgba(255,255,255,0.7)' :
                          'none'
                    }} />
                  
                    <span
                      className="text-white/90 font-bold tabular-nums drop-shadow flex flex-col items-center justify-center gap-y-1.5 w-full"
                      style={{ fontSize: 'clamp(0.75rem, 1.0625vmin, 1.25rem)' }}>
                      <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                        {ratesByCurrency.size > 0 ?
                        [...ratesByCurrency.entries()].
                        sort(([a], [b]) => a.localeCompare(b)).
                        map(([ccy, r]) =>
                        <span key={ccy}>
                              +{getCurrencySymbol(ccy)}
                              {r.toFixed(4)} / sec ({ccy})
                            </span>
                        ) :
                        <>
                            +{balanceCurrencySymbol}
                            {totalRatePerSecond.toFixed(4)} / sec
                          </>
                        }
                      </span>
                      {equivalentRatePerSecondInBalanceCcy != null &&
                      <span className="text-white/65 font-semibold text-[0.7em] sm:text-[0.72em]">
                        Σ ≈ +{balanceCurrencySymbol}
                        {equivalentRatePerSecondInBalanceCcy.toFixed(4)} / sec в{' '}
                        {normalizeCurrencyCode(currentBalanceCurrency)} (по курсу)
                      </span>
                      }
                    </span>
                  </div>
                </>
                }
              </motion.div>
            </AnimatePresence>
            </div>
          </motion.div>
        </div>

      <AnimatePresence>
        {settingsOpen &&
        <>
          <motion.button
            type="button"
            aria-label="Close settings"
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSettingsOpen(false)} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            className="fixed z-50 left-0 right-0 bottom-0 max-h-[min(92vh,100dvh)] max-w-lg mx-auto flex flex-col rounded-t-3xl bg-white shadow-2xl overflow-hidden"
            style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.25)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}>
            
            <div className="shrink-0 pt-3 pb-2 px-5 border-b border-gray-100 flex items-center justify-between gap-3 bg-white">
              <h2 id="settings-title" className="text-lg font-black text-gray-900 tracking-tight">
                Настройки
              </h2>
              <motion.button
                type="button"
                onClick={() => setSettingsOpen(false)}
                whileTap={{ scale: 0.92 }}
                className="w-11 h-11 rounded-xl flex items-center justify-center bg-gray-100 text-gray-700"
                aria-label="Закрыть">
                
                <XIcon size={22} strokeWidth={2.5} />
              </motion.button>
            </div>
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              
              {settingsForm}
            </div>
          </motion.div>
        </>
        }
      </AnimatePresence>
      </div>
    </div>
  );

}