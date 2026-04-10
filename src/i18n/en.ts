/** English (default UI copy) */
export const en: Record<string, string> = {
  'lang.en': 'EN',
  'lang.ru': 'RU',

  'theme.lightAria': 'Light theme',
  'theme.darkAria': 'Dark theme',
  'settings.aria': 'Open settings',
  'settings.title': 'Settings',
  'settings.close': 'Close',

  'hero.aria': 'Earning rate',
  'hero.now': 'Now',
  'hero.tagline': 'Your income speed',
  'hero.perSecondLife': 'Your income speed',
  'hero.perSec': '/ sec',
  'hero.nominalApprox': 'nominal ≈',
  'hero.perHour': '/hr',
  'hero.realHint': '· real',
  'hero.today': 'Today',
  'hero.todayNote': 'since midnight · local time',
  'hero.moreNumbers': 'More numbers',
  'hero.moreNominal': 'Nominal (pre-adjustment)',
  'hero.insightTitle': 'After tax & inflation',
  'hero.insightAria': 'Real purchasing power',
  'hero.futureTitle': 'Next 12 months (estimate)',
  'hero.futureAria': 'Year-ahead estimate',
  'hero.futureIfPlus20': 'if +20% to rate',
  'hero.btnHideDetails': 'Hide details',
  'hero.btnShowDetails': 'Currencies, balance, rates',
  'hero.btnEditProjects': 'Edit projects',
  'hero.ctaGrow': 'Grow your income',
  'hero.btnBreakdown': 'By currency & balance',
  'hero.btnTrajectory': 'Trajectory (estimate)',
  'hero.btnChart': 'Earnings over time',
  'hero.btnBackCompact': 'Back to summary',
  'hero.btnBackBreakdown': 'Back to breakdown',
  'hero.btnBackTrajectory': 'Back to trajectory',
  'hero.btnHideChart': 'Hide chart',
  'hero.emptyPrompt':
    'Add a project and amounts in settings — your live rate appears here.',
  'hero.emptyCta': 'Open settings',
  'hero.noFxHint':
    'For a single headline rate, enable FX rates or use projects in one currency.',

  'trajectory.aria': 'Trajectory estimate',
  'trajectory.kicker': 'If you keep this pace',
  'trajectory.disclaimer':
    'Illustrative estimate — not a guarantee. Assumes your current real-income rate stays similar.',
  'trajectory.steadyLead': 'At today’s pace',
  'trajectory.next12': 'in the next ~12 months',
  'trajectory.fiveYearLead': 'Over ~5 years, same pace:',
  'trajectory.morePaths': 'Other paths (estimate)',
  'trajectory.plus20Lead': 'If rate grows ~20%',
  'trajectory.deltaLead': 'Yearly difference vs. today’s pace',
  'trajectory.perYearVs': 'per year vs. steady pace',
  'trajectory.fiveCompare':
    '5-year scale: about {base} vs. about {plus} with ~20% higher rate.',
  'trajectory.geekFootnote':
    'Shown in your account currency; uses the same “real rate” logic as the hero block.',

  'breakdown.totalEarned': 'Total earned',
  'breakdown.oneTotalTitle': 'Total (your currencies → one number)',
  'breakdown.showAllCurrencies': 'Show all currencies',
  'breakdown.hideAllCurrencies': 'Show one total only',
  'breakdown.sortHintFx':
    'Each currency separately. Active contracts first; within a group sorted by amount in',
  'breakdown.sortHintFxApi': '(API rate).',
  'breakdown.sortHintNoFx': 'Without rates, sorted by currency code.',
  'breakdown.sortParagraphFx':
    'Each currency separately. Active contracts first; within each group, sorted by descending amount converted to {ccy} (API rate).',
  'breakdown.sortParagraphNoFx':
    'Each currency separately. Active contracts first; without FX, within each group sort is by currency code.',
  'breakdown.endedBadge': 'Ended',
  'breakdown.inAccount': 'On account now',
  'breakdown.noContractsInCcy': 'No contracts in',
  'breakdown.allEndedInCcy': 'All ended',
  'breakdown.noAccrualHint':
    'Nothing accrues to balance — no selected projects in account currency, only post-payroll balance.',
  'breakdown.allEndedHint':
    'All projects in this currency have ended — no accrual to balance.',
  'breakdown.equivTitle': 'Total in account currency',
  'breakdown.equivHint':
    'One column in account currency — all selected projects converted at the rate below.',
  'breakdown.fxBlurb':
    'Each amount in its own currency is converted with the current API rate into',
  'breakdown.sumBlurb': 'Converted amounts are summed so you can compare in one number.',
  'breakdown.howTitle': 'How it works.',
  'breakdown.howBody':
    'Balance after last payroll date; from midnight the next day, accrual runs to now.',
  'breakdown.onlyCcy':
    'Only projects in {ccy} count here. Other currencies are under “Total earned”.',
  'breakdown.sortEndedNote':
    '“Ended” means every contract in that currency is past its end date.',
  'breakdown.rateHeading': 'Rate.',
  'breakdown.sumHeading': 'Sum.',
  'breakdown.allEndedWithCcy': 'All ended ({ccy})',

  'fx.title': 'Rate',
  'fx.noForeign':
    'API base is {balance}; no other currencies among selected projects — no separate quotes.',
  'fx.missing':
    'No API rate from project currencies ({codes}) to base {base} — merged chart line may be unavailable.',
  'fx.footer':
    'Used for account-currency total, combined Σ/sec, and the pink chart line.',
  'fx.failed':
    'Rates failed to load — account-currency merge and chart line unavailable. Balances unchanged.',

  'chart.panelTitle': 'Accumulation over time',
  'chart.expand': 'Expand chart',
  'chart.collapse': 'Compact chart',
  'chart.expandAria': 'Expand chart — full legend and axis labels',
  'chart.collapseAria': 'Compact chart — smaller plot, fewer labels',
  'chart.panelHint': 'Click a project for one line; click again for all series.',
  'chart.panelHintCompact': 'Tap the chart to see values · expand for full legend',
  'chart.projects': 'Projects',
  'chart.graphBadge': 'Chart',
  'chart.all': 'All',
  'chart.range1y': '1Y',
  'chart.rangeAll': 'All time',
  'chart.advancedShow': 'Chart details',
  'chart.advancedHide': 'Simple view',
  'chart.productAria': 'Income growth and trend',
  'chart.productKicker': 'How you’re doing',
  'chart.productAboveTrend':
    'You’re outpacing a straight-line trend in this window — momentum is on your side.',
  'chart.productBelowTrend':
    'Versus a straight-line trend from the start of this window, you’re about {pct}% lower.',
  'chart.productNeutralTrend': 'Close to a steady linear trend in this window.',
  'chart.productNow': 'Earned (now)',
  'chart.productTrendEnd': 'Trend (fit)',
  'chart.productGapTrend': 'Gap vs trend',
  'chart.productYou': 'You',
  'chart.productTrend': 'Trend',
  'chart.productNeedRates':
    'Enable API rates in settings (or use projects in one currency) to see one combined income line.',
  'chart.productDisclaimer':
    'Trend = linear fit on contract earnings in this window. Illustrative, not a forecast.',
  'chart.productTrajectoryLead': 'Rate outlook (~12 months)',
  'chart.productSteady12': 'Steady pace',
  'chart.productPlus20': 'If rate +20%',
  'chart.productPerYearHint': '/ yr vs steady',
  'chart.ctaGrow': 'Grow your income',

  'footer.perSec': '/ sec',
  'footer.sigmaPerSec': 'Σ ≈ +',
  'footer.inCcy': 'in',
  'footer.byRate': '(API rate)',

  'awareness.title': 'Money Awareness Engine',
  'awareness.sub': 'My pace (sharing)',
  'awareness.ladder':
    'Above ~{pct}% on a demo EUR ladder',
  'awareness.ladderNote':
    'Viral-style wording: “I earn more than ~{pct}%” on this demo ladder — not a real survey.',
  'awareness.ladderModel':
    'Model: rough anchors ~20–150k €/yr → rate/sec. Not financial advice.',
  'awareness.needFx':
    'Load rates for the same EUR-scale demo comparison (context, not bragging).',
  'awareness.share': 'Share',
  'awareness.copied': 'Copied to clipboard',
  'awareness.copyFail': 'Could not copy',
  'awareness.clipboardEn': 'English copied to clipboard',
  'awareness.clipboardRu': 'Russian copied to clipboard',
  'awareness.clipboardErr': 'Copy failed',

  'dates.start': 'Start:',
  'dates.end': 'End:',
  'dates.projectClosed': 'Project ended — period total is final',

  'profile.phone': 'Phone:',

  'settings.projectsTitle': 'Projects',
  'settings.projectsSubtitle': 'Contract rates and options',
  'settings.balanceLabel': 'Balance after last payroll (on that date)',
  'settings.payrollDate': 'Last payroll date',
  'settings.payrollHint':
    'Enter the balance right after that payout. From midnight the next day, accrual adds to the main screen.',
  'settings.accountCcy': 'Account currency',
  'settings.takeHome': 'Take-home share after tax (estimate)',
  'settings.takeHomeAria': 'Take-home percentage after tax',
  'settings.takeHomeHint':
    '{pct}% of contract counted for the “real rate” block on the main screen. Estimate, not accounting.',
  'settings.balanceFooter':
    '“Total earned” sums selected projects. Account balance is separate: payroll base plus accrual. Only projects in account currency accrue to balance.',
  'settings.projectsPicker': 'Projects',
  'settings.projectsPickerHint':
    'Checked = on dashboard totals (several allowed). Click name to edit fields below.',
  'settings.showOnDashboard': 'Show on main screen',
  'settings.editProject': 'Edit this project',
  'settings.contractEnded': 'Ended',
  'settings.endedBadgeTitle': 'End date passed — accrual for this contract has stopped.',
  'settings.projectName': 'Project name',
  'settings.projectCcy': 'Project currency',
  'settings.workStart': 'Work start date',
  'settings.workStartHint':
    'Calendar time from this midnight (including past years) times your rate (monthly, hourly, or contract to end). Vacation ranges below are excluded.',
  'settings.workEnd': 'Project end date',
  'settings.workEndHint':
    'For “full contract” billing, duration is between dates (minus vacation). For monthly/hourly, end date only caps accrual. Empty = open-ended.',
  'settings.vacations': 'Vacation (past & planned)',
  'settings.vacationsHint':
    'Pick ranges; those calendar days are excluded from time since work start (inclusive ends).',
  'settings.vacationN': 'Vacation {n}',
  'settings.removeVacation': 'Remove vacation',
  'settings.vacationFrom': 'From',
  'settings.vacationTo': 'To',
  'settings.addVacation': 'Add vacation',
  'settings.billingType': 'Billing type',
  'settings.billing.monthly': 'Monthly payment',
  'settings.billing.hourly': 'Hourly rate',
  'settings.billing.contract': 'Full contract amount',
  'settings.billingHelp.monthly':
    'Like salary: monthly amount spread over 22×8 working hours; accrues every calendar second from start date.',
  'settings.billingHelp.hourly':
    'Rate per hour; per second = amount / 3600. Suited to hourly billing.',
  'settings.billingHelp.contract':
    'Full contract; rate = amount / calendar span between start and end (minus vacation). Totals to contract by end.',
  'settings.amount.monthly': 'Monthly payment',
  'settings.amount.hourly': 'Hourly rate',
  'settings.amount.contract': 'Full contract amount',
  'settings.suffix.perMonth': ' / mo',
  'settings.suffix.perHour': ' / hr',
  'settings.dataTitle': 'Data',
  'settings.dataHint':
    'Saved automatically in this browser (localStorage). A JSON file is your backup or way to move to another device.',
  'settings.storageRiskTitle': 'Only in this browser',
  'settings.storageRiskBody':
    'Clearing site data, another profile, or a new device can remove it. Download or copy JSON occasionally — no account required.',
  'settings.downloadJson': 'Download JSON',
  'settings.copyJson': 'Copy JSON',
  'settings.copyJsonOk': 'JSON copied — keep it somewhere safe',
  'settings.copyJsonFail': 'Could not copy',
  'settings.uploadJson': 'Upload JSON',

  'backupBanner.title': 'Have a backup',
  'backupBanner.body':
    'Your setup is stored only in this browser. In Settings → Data you can download or copy JSON.',
  'backupBanner.openSettings': 'Open backup options',
  'backupBanner.later': 'Remind me later',

  'profile.title': 'Profile (from JSON)',
  'profile.storedHint':
    'Stored with settings; included in “Download JSON”. Edit source file and import again.',
  'profile.remove': 'Remove from save',
  'profile.version': 'Profile version:',
  'profile.location': 'Location:',
  'profile.format': 'Format:',
  'profile.topSkills': 'Top skills:',

  'import.badFile':
    'Invalid file. Need MoneyClock export JSON: v: 1 and blocks mode, projectsBundle, etc. profile-artem-miherea.json is a combined app + profile example.',

  'chart.empty':
    'Set a project start date — the cumulative income chart will appear.',
  'chart.ariaMain': 'Cumulative income, account balance, and FX',
  'chart.heading': 'Projects & account',
  'chart.yHover': 'Y: line under cursor',
  'chart.yCompany': 'Y: company',
  'chart.yFirst': 'Y: first in list',
  'chart.fromStart': 'from earliest start',
  'chart.now': 'now',
  'chart.indexSuffix': 'idx',
  'chart.legend.fxHistory': 'Rate history:',
  'chart.legend.fxBlurb':
    '. Mean relative index (100% = rate at chart start).',
  'chart.legend.inf': 'Inflation (CPI, yearly %):',
  'chart.legend.infBlurb':
    ', FP.CPI.TOTL.ZG. Line = mean price level index for economies of selected currencies (100 = Jan 1 of chart start year); currency ≠ country — static mapping.',

  'chart.series.others': 'others',
  'chart.series.projects': 'projects',
  'chart.series.account': 'account',
  'chart.series.allFx': 'all projects (FX)',
  'chart.defaultProject': 'Project',
  'chart.ariaPanel': 'Income chart',
  'chart.unfocus': 'Clear selection: {name}',
  'chart.focusLine': 'Show on chart: {name}',
  'chart.addProject': 'Add project',

  'common.projectFallback': 'project'
};
