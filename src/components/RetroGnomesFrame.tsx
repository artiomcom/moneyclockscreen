import React from 'react';

/**
 * Пиксель-арт гном с кучей золота (дань играм 80-х, shape-rendering crisp).
 */
function PixelGnomeWithGold({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      aria-hidden>
      <g>
        <rect x="28" y="48" width="18" height="4" fill="#713f12" />
        <rect x="30" y="44" width="14" height="4" fill="#a16207" />
        <rect x="32" y="40" width="10" height="4" fill="#ca8a04" />
        <rect x="34" y="36" width="6" height="4" fill="#eab308" />
        <rect x="36" y="32" width="4" height="4" fill="#fde047" />
        <rect x="30" y="48" width="2" height="2" fill="#fef08a" />
        <rect x="38" y="40" width="2" height="2" fill="#fef9c3" />
      </g>
      <rect x="14" y="46" width="6" height="6" fill="#451a03" />
      <rect x="22" y="46" width="6" height="6" fill="#451a03" />
      <rect x="15" y="44" width="4" height="4" fill="#78350f" />
      <rect x="23" y="44" width="4" height="4" fill="#78350f" />
      <rect x="12" y="30" width="18" height="14" fill="#1d4ed8" />
      <rect x="14" y="32" width="4" height="8" fill="#2563eb" />
      <rect x="24" y="32" width="4" height="8" fill="#2563eb" />
      <rect x="18" y="34" width="6" height="2" fill="#93c5fd" />
      <rect x="8" y="32" width="4" height="6" fill="#fca5a5" />
      <rect x="30" y="32" width="4" height="6" fill="#fca5a5" />
      <rect x="10" y="22" width="22" height="10" fill="#f8fafc" />
      <rect x="12" y="24" width="18" height="6" fill="#e2e8f0" />
      <rect x="14" y="18" width="14" height="8" fill="#fdba74" />
      <rect x="16" y="20" width="2" height="2" fill="#1c1917" />
      <rect x="24" y="20" width="2" height="2" fill="#1c1917" />
      <rect x="20" y="23" width="4" height="1" fill="#9a3412" />
      <rect x="12" y="14" width="18" height="4" fill="#b91c1c" />
      <rect x="14" y="10" width="14" height="4" fill="#dc2626" />
      <rect x="16" y="6" width="10" height="4" fill="#ef4444" />
      <rect x="18" y="2" width="6" height="4" fill="#f87171" />
      <rect x="20" y="0" width="4" height="2" fill="#fca5a5" />
      <rect x="22" y="0" width="4" height="2" fill="#fef08a" />
    </svg>
  );
}

function PixelSparkle({ className, delayMs = 0 }: { className?: string; delayMs?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={delayMs ? { animationDelay: `${delayMs}ms` } : undefined}>
      <rect x="5" y="0" width="2" height="12" fill="#fef08a" opacity="0.9" />
      <rect x="0" y="5" width="12" height="2" fill="#fef08a" opacity="0.9" />
      <rect x="5" y="5" width="2" height="2" fill="#fff" />
    </svg>
  );
}

function MiniGoldPile({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 12"
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden>
      <rect x="2" y="8" width="16" height="4" fill="#713f12" />
      <rect x="4" y="4" width="12" height="4" fill="#ca8a04" />
      <rect x="8" y="0" width="4" height="4" fill="#fde047" />
    </svg>
  );
}

/** Класс кнопки «панель аркады»: скос, без текста, как в играх 80-х. */
export const ARCADE_SETTINGS_BTN_CLASS =
  'inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-[2px] border-2 border-t-slate-300 border-l-slate-300 border-r-slate-900 border-b-slate-900 bg-gradient-to-br from-slate-500 to-slate-700 text-[#fef08a] shadow-[2px_2px_0_rgba(0,0,0,0.45)] ring-1 ring-inset ring-white/10 hover:from-slate-400 hover:to-slate-600 active:border-t-slate-900 active:border-l-slate-900 active:border-r-slate-300 active:border-b-slate-300 active:shadow-[inset_1px_1px_0_rgba(0,0,0,0.35)] transition-[filter,box-shadow] dark:border-t-slate-500 dark:border-l-slate-500 dark:border-r-black dark:border-b-black dark:from-slate-700 dark:to-slate-900 dark:text-[var(--accent-money)] dark:ring-white/5 dark:hover:from-slate-600 dark:hover:to-slate-800';

/** Пиксельная шестерёнка (NES/C64 vibe), `currentColor` для кнопки настроек без подписи. */
export function PixelSettingsCog({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 14 14"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      aria-hidden>
      <rect x="6" y="0" width="2" height="2" />
      <rect x="6" y="12" width="2" height="2" />
      <rect x="0" y="6" width="2" height="2" />
      <rect x="12" y="6" width="2" height="2" />
      <rect x="2" y="2" width="2" height="2" />
      <rect x="10" y="2" width="2" height="2" />
      <rect x="2" y="10" width="2" height="2" />
      <rect x="10" y="10" width="2" height="2" />
      <rect x="5" y="5" width="4" height="4" />
    </svg>
  );
}

/**
 * Рамка-украшение: гномы у нижних углов, мини-кучи сверху.
 * Родитель, `relative` с **padding-top** (карточка ниже), чтобы верхние спрайты жили в зоне паддинга
 * и не уходили под слой карточки (backdrop) и не обрезались overflow карточки.
 */
export function RetroGnomesFrame() {
  return (
    <>
      {/* верх: в области pt-* родителя, выше края стекла; z выше карточки */}
      <div
        className="pointer-events-none absolute left-[7%] z-20 w-8 h-4 opacity-85 sm:left-[8%] sm:w-11 sm:h-6"
        style={{ top: '0.35rem', imageRendering: 'pixelated' }}>
        <MiniGoldPile className="w-full h-full drop-shadow-md" />
      </div>
      <div
        className="pointer-events-none absolute right-[7%] z-20 w-8 h-4 opacity-85 sm:right-[8%] sm:w-11 sm:h-6"
        style={{ top: '0.35rem', imageRendering: 'pixelated' }}>
        <MiniGoldPile className="w-full h-full drop-shadow-md" />
      </div>

      {/* низ, как раньше */}
      <div
        className="pointer-events-none absolute -bottom-1 left-1 z-20 w-[4.25rem] h-[5rem] opacity-[0.93] drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)] sm:left-3 sm:w-[5rem] sm:h-[5.75rem]"
        style={{ imageRendering: 'pixelated' }}>
        <PixelGnomeWithGold className="w-full h-full" />
        <PixelSparkle className="absolute -top-0.5 right-2 w-3.5 h-3.5 animate-pulse motion-reduce:animate-none" />
      </div>
      <div
        className="pointer-events-none absolute -bottom-1 right-1 z-20 w-[4.25rem] h-[5rem] opacity-[0.93] drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)] [transform:scaleX(-1)] sm:right-3 sm:w-[5rem] sm:h-[5.75rem]"
        style={{ imageRendering: 'pixelated' }}>
        <PixelGnomeWithGold className="w-full h-full" />
        <PixelSparkle className="absolute -top-0.5 right-2 w-3.5 h-3.5 animate-pulse motion-reduce:animate-none" delayMs={500} />
      </div>
    </>
  );
}
