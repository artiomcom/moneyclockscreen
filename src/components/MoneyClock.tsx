import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SettingsIcon,
  CalendarIcon,
  ClockIcon,
  BriefcaseIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
  DownloadIcon,
  UploadIcon } from
'lucide-react';
import { ParticleBackground } from './ParticleBackground';
import { AnimatedCounter } from './AnimatedCounter';
import {
  type Mode,
  type ProjectEntry,
  type ProjectsBundle,
  type MoneyClockSavedState,
  type MoneyClockProfile,
  type VacationEntry,
  newProject,
  newVacation,
  getHydratedMoneyClockState,
  saveMoneyClockState,
  exportMoneyClockJsonBlob,
  parseMoneyClockJson,
  earningsFromWorkStartMinusVacations,
  parseLocalDateYmd } from
'../moneyClockPersistence';
const MONTHLY_GOAL = 5000;
const WORK_HOURS_PER_DAY = 8;
const WORK_DAYS_PER_MONTH = 22;
const WORK_SECONDS_PER_MONTH = WORK_DAYS_PER_MONTH * WORK_HOURS_PER_DAY * 3600;
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
function DurationInputRow({
  label,
  months,
  days,
  hours,
  minutes,
  onMonths,
  onDays,
  onHours,
  onMinutes










}: {label: string;months: string;days: string;hours: string;minutes: string;onMonths: (v: string) => void;onDays: (v: string) => void;onHours: (v: string) => void;onMinutes: (v: string) => void;}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-gray-700 text-sm font-bold text-center">
        {label}
      </label>
      <div className="grid grid-cols-4 gap-2.5">
        {[
        {
          val: months,
          set: onMonths,
          ph: 'Mon'
        },
        {
          val: days,
          set: onDays,
          ph: 'Days'
        },
        {
          val: hours,
          set: onHours,
          ph: 'Hours'
        },
        {
          val: minutes,
          set: onMinutes,
          ph: 'Min'
        }].
        map((f) =>
        <input
          key={f.ph}
          type="number"
          value={f.val}
          onChange={(e) => f.set(e.target.value)}
          placeholder={f.ph}
          className="w-full px-2 py-3 rounded-xl text-gray-700 text-sm font-semibold text-center placeholder:text-gray-300 outline-none transition-all focus:ring-2 focus:ring-sky-300 bg-white"
          style={{
            border: '2px solid #38bdf8'
          }} />

        )}
      </div>
    </div>);

}
const MODE_LABELS: Record<Mode, string> = {
  salary: 'Salary',
  hourly: 'Hourly',
  project: 'Project'
};

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
  const [mode, setMode] = useState<Mode>(() => getInitialMoneyClockState().mode);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [monthlySalary, setMonthlySalary] = useState(
    () => getInitialMoneyClockState().monthlySalary
  );
  const [hourlyRate, setHourlyRate] = useState(() => getInitialMoneyClockState().hourlyRate);
  const [projectsBundle, setProjectsBundle] = useState<ProjectsBundle>(
    () => getInitialMoneyClockState().projectsBundle
  );
  const [workedMonths, setWorkedMonths] = useState(
    () => getInitialMoneyClockState().workedMonths
  );
  const [workedDays, setWorkedDays] = useState(() => getInitialMoneyClockState().workedDays);
  const [workedHours, setWorkedHours] = useState(() => getInitialMoneyClockState().workedHours);
  const [workedMinutes, setWorkedMinutes] = useState(
    () => getInitialMoneyClockState().workedMinutes
  );
  const [currentBalance, setCurrentBalance] = useState(
    () => getInitialMoneyClockState().currentBalance
  );
  const [profileBundle, setProfileBundle] = useState<MoneyClockProfile | undefined>(
    () => getInitialMoneyClockState().profile
  );
  const [nowTick, setNowTick] = useState(() => Date.now());

  const { projects, activeProjectId } = projectsBundle;
  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? projects[0],
    [projects, activeProjectId]
  );

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
      activeProjectId: p.id
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setProjectsBundle((s) => {
      const next = s.projects.filter((p) => p.id !== id);
      if (next.length === 0) {
        const p = newProject({ name: 'Project 1' });
        return { projects: [p], activeProjectId: p.id };
      }
      const active =
      s.activeProjectId === id ? next[0].id : s.activeProjectId;
      return { projects: next, activeProjectId: active };
    });
  }, []);

  const selectProject = useCallback((id: string) => {
    setProjectsBundle((s) => ({ ...s, activeProjectId: id }));
  }, []);

  const ratePerSecond = useMemo(() => {
    switch (mode) {
      case 'salary':{
          const monthly = parseFloat(monthlySalary) || 0;
          return monthly / WORK_SECONDS_PER_MONTH;
        }
      case 'hourly':{
          const rate = parseFloat(hourlyRate) || 0;
          return rate / 3600;
        }
      case 'project':{
          if (!activeProject) return 0;
          const amount = parseFloat(activeProject.projectAmount) || 0;
          const totalSeconds =
          (parseFloat(activeProject.projMonths) || 0) *
          WORK_DAYS_PER_MONTH *
          WORK_HOURS_PER_DAY *
          3600 +
          (parseFloat(activeProject.projDays) || 0) * WORK_HOURS_PER_DAY * 3600 +
          (parseFloat(activeProject.projHours) || 0) * 3600 +
          (parseFloat(activeProject.projMinutes) || 0) * 60;
          return totalSeconds > 0 ? amount / totalSeconds : 0;
        }
      default:
        return 0;
    }
  }, [
  mode,
  monthlySalary,
  hourlyRate,
  activeProject]
  );

  useEffect(() => {
    if (mode !== 'project' || !activeProject?.workStartDate?.trim()) return;
    const endEx =
    activeProject.projectEndDate?.trim() ?
    (() => {
      const pe = parseLocalDateYmd(activeProject.projectEndDate);
      return pe == null ? null : pe + 86400000;
    })() :
    null;

    const tick = () => setNowTick(Date.now());

    if (endEx != null && Date.now() >= endEx) {
      tick();
      return;
    }

    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [mode, activeProject?.workStartDate, activeProject?.projectEndDate]);

  const computeInitialEarnings = useCallback(
    (nowMs: number) => {
      const worked =
      mode === 'project' && activeProject ?
      {
        months: activeProject.workedMonths,
        days: activeProject.workedDays,
        hours: activeProject.workedHours,
        minutes: activeProject.workedMinutes
      } :
      {
        months: workedMonths,
        days: workedDays,
        hours: workedHours,
        minutes: workedMinutes
      };
      const totalWorkedSeconds =
      (parseFloat(worked.months) || 0) *
      WORK_DAYS_PER_MONTH *
      WORK_HOURS_PER_DAY *
      3600 +
      (parseFloat(worked.days) || 0) * WORK_HOURS_PER_DAY * 3600 +
      (parseFloat(worked.hours) || 0) * 3600 +
      (parseFloat(worked.minutes) || 0) * 60;
      const fromWorked = totalWorkedSeconds * ratePerSecond;
      const fromStart =
      mode === 'project' && activeProject?.workStartDate?.trim() ?
      earningsFromWorkStartMinusVacations(
        activeProject.workStartDate,
        ratePerSecond,
        nowMs,
        activeProject.vacations ?? [],
        activeProject.projectEndDate?.trim() || undefined
      ) :
      0;
      return fromWorked + fromStart;
    },
    [
    mode,
    activeProject,
    workedMonths,
    workedDays,
    workedHours,
    workedMinutes,
    ratePerSecond]
  );

  const displayAmount = useMemo(
    () => computeInitialEarnings(nowTick),
    [computeInitialEarnings, nowTick]
  );

  const displayBalanceAmount = useMemo(() => {
    const raw = currentBalance.trim().replace(/[\s,]/g, '');
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  }, [currentBalance]);

  const projectEndedInfo = useMemo(() => {
    if (mode !== 'project' || !activeProject?.projectEndDate?.trim()) {
      return { ended: false as boolean };
    }
    const pe = parseLocalDateYmd(activeProject.projectEndDate);
    if (pe == null) return { ended: false as boolean };
    const endExclusive = pe + 86400000;
    return { ended: nowTick >= endExclusive };
  }, [mode, activeProject?.projectEndDate, nowTick]);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
  };

  const persistSnapshot: MoneyClockSavedState = useMemo(
    () => ({
      mode,
      monthlySalary,
      hourlyRate,
      projectsBundle,
      workedMonths,
      workedDays,
      workedHours,
      workedMinutes,
      currentBalance,
      ...(profileBundle !== undefined ? { profile: profileBundle } : {})
    }),
    [
      mode,
      monthlySalary,
      hourlyRate,
      projectsBundle,
      workedMonths,
      workedDays,
      workedHours,
      workedMinutes,
      currentBalance,
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
        setMode(parsed.mode);
        setMonthlySalary(parsed.monthlySalary);
        setHourlyRate(parsed.hourlyRate);
        setProjectsBundle(parsed.projectsBundle);
        setWorkedMonths(parsed.workedMonths);
        setWorkedDays(parsed.workedDays);
        setWorkedHours(parsed.workedHours);
        setWorkedMinutes(parsed.workedMinutes);
        setCurrentBalance(parsed.currentBalance);
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

  const modes: {
    key: Mode;
    label: string;
    icon: React.ReactNode;
  }[] = [
  {
    key: 'salary',
    label: 'Salary',
    icon: <CalendarIcon size={22} />
  },
  {
    key: 'hourly',
    label: 'Hourly',
    icon: <ClockIcon size={22} />
  },
  {
    key: 'project',
    label: 'Project',
    icon: <BriefcaseIcon size={22} />
  }];

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
        
        {MODE_LABELS[mode]}
      </motion.h2>
      <p className="text-gray-500 text-sm text-center mb-4">
        Mode &amp; rates
      </p>

      {profileSettingsBlock}

      <motion.div
        layout
        className="bg-emerald-50/90 rounded-3xl p-5 border-2 border-emerald-100 mb-4 flex flex-col gap-1">
        <InputField
          label="Текущий остаток"
          value={currentBalance}
          onChange={setCurrentBalance}
          placeholder="0"
          suffix="$"
        />
        <p className="text-gray-500 text-xs text-center leading-relaxed px-1">
          Отображается на главном экране под основной суммой; к начислению по времени не
          прибавляется.
        </p>
      </motion.div>

      <div
        className="flex rounded-2xl overflow-hidden border-2 border-gray-200 mb-4"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        
        {modes.map((m) => {
          const isActive = mode === m.key;
          return (
            <motion.button
              key={m.key}
              type="button"
              onClick={() => handleModeChange(m.key)}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 transition-colors"
              style={{
                background: isActive ? '#22c55e' : '#f9fafb',
                color: isActive ? '#fff' : '#6b7280'
              }}>
              
              <div style={{ color: 'inherit' }}>{m.icon}</div>
              <span className="text-[10px] sm:text-xs font-bold leading-tight text-center">
                {m.label}
              </span>
            </motion.button>);

        })}
      </div>

      <motion.div
        layout
        className="bg-gray-50 rounded-3xl p-5 border-2 border-gray-100 flex flex-col gap-4">
        
        <AnimatePresence mode="wait">
          {mode === 'salary' &&
          <motion.div
            key="salary"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4">
            
              <InputField
              label="Enter monthly salary here"
              value={monthlySalary}
              onChange={setMonthlySalary}
              placeholder="Monthly salary"
              suffix="$ / month" />
            
            </motion.div>
          }
          {mode === 'hourly' &&
          <motion.div
            key="hourly"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4">
            
              <InputField
              label="Enter hourly rate here"
              value={hourlyRate}
              onChange={setHourlyRate}
              placeholder="Hourly rate"
              suffix="$ / hour" />
            
            </motion.div>
          }
          {mode === 'project' && activeProject &&
          <motion.div
            key="project"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4">
            
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm font-bold text-center">
                  Projects
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {projects.map((p) => {
                    const isSel = p.id === activeProjectId;
                    return (
                      <div key={p.id} className="flex items-center gap-0.5">
                        <motion.button
                          type="button"
                          onClick={() => selectProject(p.id)}
                          whileTap={{ scale: 0.96 }}
                          className="px-3 py-2 rounded-xl text-sm font-bold max-w-[140px] truncate transition-all"
                          style={{
                            background: isSel ? '#22c55e' : '#fff',
                            color: isSel ? '#fff' : '#374151',
                            border: isSel ? '2px solid #16a34a' : '2px solid #e5e7eb'
                          }}
                          title={p.name}>
                          
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
                  Дата начала работы
                </label>
                <input
                  type="date"
                  value={activeProject.workStartDate}
                  onChange={(e) => patchActiveProject({ workStartDate: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl text-gray-700 text-base font-medium outline-none transition-all focus:ring-2 focus:ring-sky-300 bg-white"
                  style={{ border: '2px solid #38bdf8' }} />
                <p className="text-gray-500 text-xs text-center leading-relaxed px-1">
                  От полуночи этого дня по вашему часовому поясу считается прошедшее время; сумма на
                  главном экране обновляется непрерывно по ставке проекта (плюс блок «уже
                  отработано»). Время в отпусках ниже из этого интервала вычитается.
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
                  Оставьте пустым, если проект ещё идёт. Если указана — расчёт времени и итога
                  обрывается в конце этого дня (включительно): после него сумма не растёт.
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
            
              <InputField
              label="Enter payment amount here"
              value={activeProject.projectAmount}
              onChange={(v) => patchActiveProject({ projectAmount: v })}
              placeholder="Payment amount"
              suffix="$" />
            
              <DurationInputRow
              label="Enter project duration here"
              months={activeProject.projMonths}
              days={activeProject.projDays}
              hours={activeProject.projHours}
              minutes={activeProject.projMinutes}
              onMonths={(v) => patchActiveProject({ projMonths: v })}
              onDays={(v) => patchActiveProject({ projDays: v })}
              onHours={(v) => patchActiveProject({ projHours: v })}
              onMinutes={(v) => patchActiveProject({ projMinutes: v })} />
            
            </motion.div>
          }
        </AnimatePresence>

        <DurationInputRow
          label="Enter time already worked here"
          months={
          mode === 'project' && activeProject ?
          activeProject.workedMonths :
          workedMonths
          }
          days={
          mode === 'project' && activeProject ?
          activeProject.workedDays :
          workedDays
          }
          hours={
          mode === 'project' && activeProject ?
          activeProject.workedHours :
          workedHours
          }
          minutes={
          mode === 'project' && activeProject ?
          activeProject.workedMinutes :
          workedMinutes
          }
          onMonths={
          mode === 'project' && activeProject ?
          (v) => patchActiveProject({ workedMonths: v }) :
          setWorkedMonths
          }
          onDays={
          mode === 'project' && activeProject ?
          (v) => patchActiveProject({ workedDays: v }) :
          setWorkedDays
          }
          onHours={
          mode === 'project' && activeProject ?
          (v) => patchActiveProject({ workedHours: v }) :
          setWorkedHours
          }
          onMinutes={
          mode === 'project' && activeProject ?
          (v) => patchActiveProject({ workedMinutes: v }) :
          setWorkedMinutes
          } />
        
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

        <div className="flex-1 flex flex-col items-center justify-center py-10">
          <div className="flex flex-col items-center w-full">
            <div className="relative w-full flex flex-col items-center">
              <motion.div
                className="absolute -inset-x-[min(40%,20rem)] -inset-y-[min(35%,12rem)] rounded-full blur-3xl pointer-events-none"
                style={{
                  background:
                  'radial-gradient(ellipse, rgba(255,255,255,0.25) 0%, transparent 72%)'
                }}
                animate={{
                  opacity: [0.35, 0.65, 0.35],
                  scale: [0.96, 1.04, 0.96]
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }} />
              
              <div
                className="relative font-black tracking-tight leading-none text-white"
                style={{
                  fontSize: 'clamp(2.75rem, 18vmin, 15rem)',
                  textShadow:
                  '0 2px 24px rgba(0,0,0,0.35), 0 0 40px rgba(255,255,255,0.15)'
                }}>
                
                <AnimatedCounter value={displayAmount} prefix="$" />
                
              </div>

              <div
                className="relative w-full flex flex-col items-center mt-[clamp(1rem,5vmin,5rem)]">
                <p
                  className="text-white/70 font-bold drop-shadow text-center mb-[clamp(0.35rem,1.75vmin,1.75rem)]"
                  style={{ fontSize: 'clamp(0.75rem, 3.25vmin, 3.5rem)' }}>
                  Текущий остаток
                </p>
                <div
                  className="relative font-black tracking-tight leading-none text-white"
                  style={{
                    fontSize: 'clamp(1.75rem, 11vmin, 9rem)',
                    textShadow:
                      '0 2px 18px rgba(0,0,0,0.32), 0 0 32px rgba(255,255,255,0.12)'
                  }}>
                  <AnimatedCounter value={displayBalanceAmount} prefix="$" />
                </div>
              </div>
            </div>

            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-[clamp(1.5rem,7.5vmin,7.5rem)] text-center px-4 space-y-[clamp(0.75rem,3.75vmin,3.75rem)]">
                
                {ratePerSecond <= 0 ?
                <p
                  className="text-white/75 font-semibold drop-shadow"
                  style={{ fontSize: 'clamp(1rem, 4.25vmin, 5rem)' }}>
                  Откройте настройки и задайте сумму и срок — сумма посчитается сама
                </p> :
                <>
                  <p
                    className="text-white/75 font-semibold drop-shadow"
                    style={{ fontSize: 'clamp(0.875rem, 3.75vmin, 4.375rem)' }}>
                    {mode === 'project' && activeProject?.workStartDate?.trim() ?
                    (activeProject.vacations?.some(
                      (v) => v.startDate.trim() && v.endDate.trim()
                    ) ?
                    '«Уже отработано» + время с даты начала минус календарные отпуска' :
                    '«Уже отработано» + время с даты начала') +
                    (activeProject.projectEndDate?.trim() ?
                    '. После даты окончания начисление останавливается.' :
                    '') :
                    'Считается автоматически по ставке и полю «уже отработано»'}
                  </p>
                  {mode === 'project' &&
                  (activeProject?.workStartDate?.trim() ||
                  activeProject?.projectEndDate?.trim()) &&
                  <div
                    className="text-white/60 font-medium drop-shadow space-y-[clamp(0.25rem,1.25vmin,1.25rem)]"
                    style={{ fontSize: 'clamp(0.875rem, 3.75vmin, 4.375rem)' }}>
                    {activeProject.workStartDate?.trim() &&
                    <p>Начало: {formatYmdLong(activeProject.workStartDate)}</p>
                    }
                    {activeProject.projectEndDate?.trim() &&
                    <p>Окончание: {formatYmdLong(activeProject.projectEndDate)}</p>
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
                        mode === 'project' && activeProject?.workStartDate?.trim() &&
                        !projectEndedInfo.ended ?
                          '#fff' :
                          '#ffffffaa',
                      boxShadow:
                        mode === 'project' && activeProject?.workStartDate?.trim() &&
                        !projectEndedInfo.ended ?
                          '0 0 10px rgba(255,255,255,0.7)' :
                          'none'
                    }} />
                  
                    <span
                      className="text-white/90 font-bold tabular-nums drop-shadow"
                      style={{ fontSize: 'clamp(1rem, 4.25vmin, 5rem)' }}>
                      +${ratePerSecond.toFixed(4)} / sec
                    </span>
                  </div>
                </>
                }
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
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
    </div>);

}