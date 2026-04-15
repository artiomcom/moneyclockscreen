/** English (default UI copy) */
export const en: Record<string, string> = {
  'lang.en': 'EN',
  'lang.ru': 'RU',
  'lang.es': 'ES',
  'lang.fr': 'FR',
  'lang.de': 'DE',
  'lang.zh': 'ZH',
  'lang.ja': 'JA',
  'lang.pt': 'PT',
  'lang.selectAria': 'Interface language',

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
  'hero.heroEarningsPerSecond': 'per second',
  'hero.heroEarningsHour': '/ hour',
  'hero.heroEarningsLive': 'Live',
  'hero.realHint': '· real',
  'hero.today': 'Today',
  'hero.dayMeterAria': 'Day progress toward midnight',
  'hero.dayMeterTitle': "Today's Progress",
  'hero.dayWindowEndMidnight': '24:00',
  'hero.dayLeftLabel': 'Left',
  'hero.lastHourLabel': 'Last hour',
  'hero.remainingLabel': 'Remaining',
  'hero.dayProgressTrendFaster':
    "You're earning faster than yesterday",
  'hero.moreNominal': 'Nominal (pre-adjustment)',
  'hero.insightTitle': 'After tax & inflation',
  'hero.insightAria': 'Real purchasing power',
  'hero.futureAria': 'Year-ahead estimate',
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
    'Add a project and amounts in settings, your live rate appears here.',
  'hero.emptyCta': 'Use the green button at the top to open settings.',
  'hero.noFxHint':
    'For a single headline rate, enable FX rates or use projects in one currency.',

  'magic.projectionsTitle': 'Projections',
  'magic.projTonight': 'By tonight',
  'magic.projTonightDesc': 'Day cap at your current pace',
  'magic.projMonth': 'This month',
  'magic.projMonthDesc': '~1/12 of year-ahead take-home (estimate)',
  'magic.proj5y': 'In 5 years',
  'magic.proj5yDesc': 'At current pace (trajectory)',
  'magic.insightsTitle': 'Insights',
  'magic.insight1': 'Accrual updates every second from your selected projects.',
  'magic.insight2': 'Use Trajectory below for +20% and longer horizons.',
  'magic.insight3': 'FX and inflation use the same sources as the hero rate.',

  'trajectory.aria': 'Trajectory estimate',
  'trajectory.kicker': 'If you keep this pace',
  'trajectory.disclaimer':
    'Illustrative estimate, not a guarantee. Assumes your current real-income rate stays similar.',
  'trajectory.steadyLead': 'At today’s pace',
  'trajectory.next12': 'in the next ~12 months',
  'trajectory.fiveYearLead': 'Over ~5 years, same pace:',
  'trajectory.morePaths': 'Other paths (estimate)',
  'trajectory.plus20Lead': 'If in-app earning rate grows ~20%',
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
  'breakdown.endedBadge': 'Ended',
  'breakdown.inAccount': 'What’s on the account now',
  'breakdown.balanceEchoHint': 'Same total as at the top, live accrual in your account currency.',
  'breakdown.noContractsInCcy': 'No contracts in',
  'breakdown.allEndedInCcy': 'All ended',
  'breakdown.noAccrualHint':
    'Live FX rates are missing: the running balance stays at your post-payroll figure. Load rates (or add a project in your account currency) so accrual can include foreign contracts.',
  'breakdown.foreignAccrualFxHint':
    'No contract is in your account currency; this total still grows using accrual from other currencies at the current API rate (same conversion idea as “Today”).',
  'breakdown.allEndedHint':
    'All projects in this currency have ended, no accrual to balance.',
  'breakdown.equivTitle': 'Total in account currency',
  'breakdown.equivOneLiner':
    'All projects converted to {ccy} using the FX rate on your last payroll date (historical data), falling back to live API if needed, then summed.',
  'breakdown.equivHint':
    'One column in account currency: conversion uses the rate on last payroll date from history (same idea as the chart by date), otherwise the live rate below.',
  'breakdown.accrualTileTitle': 'Balance accrual',
  'breakdown.takeHomeTileHint': 'Take-home share (after tax), adjust in settings.',
  'breakdown.fxBlurb':
    'Each amount in its own currency is converted with the current API rate into',
  'breakdown.sumBlurb': 'Converted amounts are summed so you can compare in one number.',
  'breakdown.howTitle': 'How it works.',
  'breakdown.howBody':
    'Balance after last payroll; from midnight the next day, accrual from every selected project runs to now (other currencies converted at the live rate, like the hero).',
  'breakdown.onlyCcy':
    'Running balance uses all selected projects in {ccy} after conversion. Per-currency totals stay under “Total earned”.',
  'breakdown.sortEndedNote':
    '“Ended” means every contract in that currency is past its end date.',
  'breakdown.rateHeading': 'Rate.',
  'breakdown.sumHeading': 'Sum.',
  'breakdown.allEndedWithCcy': 'All ended ({ccy})',

  'fx.title': 'Rate',
  'fx.noForeign':
    'API base is {balance}; no other currencies among selected projects, no separate quotes.',
  'fx.missing':
    'No API rate from project currencies ({codes}) to base {base}, merged chart line may be unavailable.',
  'fx.footer':
    'Used for the merged account-currency total (grid), combined Σ/sec, and the chart line.',
  'fx.failed':
    'Rates failed to load, account-currency merge and chart line unavailable. Balances unchanged.',

  'chart.panelTitle': 'Accumulation over time',
  'chart.graphBadge': 'Chart',
  'chart.range1y': '1Y',
  'chart.rangeAll': 'All time',
  'chart.toolbarAria': 'Chart range and view',
  'chart.allCompanies': 'All',
  'chart.markerStartAbbr': 'S',
  'chart.markerEndAbbr': 'E',
  'chart.contractStart': 'Contract start',
  'chart.contractEnd': 'Contract end',
  'chart.markersToggleAria': 'Show or hide contract start and end markers on the chart',
  'chart.monthlyRatesToggleAria':
    'Show or hide nominal monthly pay lines (per company), converted to account currency over time using FX',
  'chart.monthlyRatesToggleTitle':
    'Dashed lines: how each project’s nominal monthly amount converts to the chart account currency along the timeline (Frankfurter history when available). Right axis = that scale.',
  'chart.monthlyRatesTipMonth': '{month}',
  'chart.monthlyRatesTipLine': '{name}: {amount}',
  'chart.monthlyRatesTipSum': 'Converted sum: {amount}',
  'chart.monthlyRateLineLabel': '{name} · nominal monthly (FX)',
  'chart.monthlyRateUnit': '/mo',
  'chart.monthlyAxisShort': 'Monthly (FX)',
  'chart.currencyCycleAria': 'Cycle chart currency. Current: {code}',
  'chart.currencyCycleTitle': 'Chart in {code}. Click to switch.',
  'chart.currencyCycleDisabledAria': 'Only one currency on the chart — nothing to switch',
  'chart.currencyCycleDisabledTitle': 'Add a project in another currency to enable switching',
  'chart.advancedShow': 'Chart details',
  'chart.advancedHide': 'Simple view',
  'chart.productAria': 'Income growth and trend',
  'chart.productKicker': 'How you’re doing',
  'chart.productAboveTrend':
    'You’re outpacing a straight-line trend in this window, momentum is on your side.',
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
  'chart.productPlus20': 'If earning rate +20%',
  'chart.productPerYearHint': 'extra per year vs steady',
  'chart.ctaGrow': 'Grow your income',

  'footer.perSec': '/ sec',
  'footer.sigmaPerSec': 'Σ ≈ +',
  'footer.inCcy': 'in',
  'footer.byRate': '(API rate)',
  'footer.liveRates': 'Live rates',
  'footer.engineBrand': 'Money awareness engine',
  'footer.appTagline': 'Money Clock · Live',

  'dashboard.momentumTitle': 'Momentum analysis',
  'dashboard.momentumTeaser': 'Momentum is on your side',
  'dashboard.momentumColDelta': 'If income +20%',
  'dashboard.estimate12m': '12-month estimate',

  'awareness.title': 'Money Awareness Engine',
  'awareness.sub': 'My pace (sharing)',
  'awareness.ladder':
    'Above ~{pct}% on a demo EUR ladder',
  'awareness.ladderNote':
    'Viral-style wording: “I earn more than ~{pct}%” on this demo ladder, not a real survey.',
  'awareness.ladderModel':
    'Model: rough anchors ~20–150k €/yr → rate/sec. Not financial advice.',
  'awareness.needFx':
    'Load rates for the same EUR-scale demo comparison (context, not bragging).',
  'awareness.share': 'Share',
  'awareness.copied': 'Copied to clipboard',
  'awareness.copyFail': 'Could not copy',
  'awareness.clipboardErr': 'Copy failed',
  'awareness.copyCurrent': 'Copy share text',

  'dates.start': 'Start:',
  'dates.end': 'End:',
  'dates.projectClosed': 'Project ended, period total is final',

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
  'settings.workdayWindow': 'Workday window',
  'settings.workdayWindowHint':
    'Local start and end of the band used for “Today” on the dashboard and daily progress. Stored with your data.',
  'settings.workdayStartHour': 'From',
  'settings.workdayEndHour': 'To',
  'settings.workdayEndMidnight': '24:00 (midnight)',
  'settings.balanceFooter':
    '“Total earned” sums selected projects. Account balance is separate: payroll base plus accrual from all selected projects; foreign amounts convert with the live API rate (same as the main counter).',
  'settings.projectsPicker': 'Projects',
  'settings.projectsPickerHint':
    'Checked = on dashboard totals (several allowed). Click name to edit fields below.',
  'settings.showOnDashboard': 'Show on main screen',
  'settings.editProject': 'Edit this project',
  'settings.contractEnded': 'Ended',
  'settings.endedBadgeTitle': 'End date passed, accrual for this contract has stopped.',
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
    'Clearing site data, another profile, or a new device can remove it. Download or copy JSON occasionally, no account required.',
  'settings.downloadJson': 'Download JSON',
  'settings.copyJson': 'Copy JSON',
  'settings.copyJsonOk': 'JSON copied, keep it somewhere safe',
  'settings.copyJsonFail': 'Could not copy',
  'settings.uploadJson': 'Upload JSON',
  'settings.saveCloud': 'Save to cloud',
  'settings.cloudSavedTitle': 'Your profile is saved',
  'settings.cloudLinkLabel': 'Your link',
  'settings.cloudSaveHint':
    'Keep it somewhere safe, it works like a magic link. Anyone with the link can open this backup. No account.',
  'settings.cloudCopyLink': 'Copy link',
  'settings.cloudCopied': 'Link copied',
  'settings.cloudClose': 'Close',
  'settings.cloudBusy': 'Saving…',
  'settings.cloudErr': 'Could not save to the cloud. Deploy the app on Cloudflare Pages with a KV binding (see wrangler.toml).',
  'settings.cloudRestoreFail': 'This cloud link is invalid or expired.',
  'settings.cloudRestoreOk':
    'Restored from your cloud link. The /u/… URL stays in the address bar as a bookmark to this backup.',
  'settings.cloudProfileLinkTitle': 'Cloud profile link',
  'settings.cloudProfileLinkHint':
    'Last magic link from this browser. If nothing changed, “Save to cloud” reuses the same link (no duplicate upload).',
  'settings.cloudProfileCopy': 'Copy cloud link',

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
    'Set a project start date, the cumulative income chart will appear.',
  'chart.ariaMain': 'Cumulative income, account balance, and FX',
  'chart.heading': 'Projects & account',
  'chart.yHover': 'Y: line under cursor',
  'chart.yFirst': 'Y: first in list',
  'chart.fromStart': 'from earliest start',
  'chart.now': 'now',
  'chart.indexSuffix': 'idx',
  'chart.legend.fxHistory': 'Rate history:',
  'chart.legend.fxBlurb':
    '. Mean relative index (100% = rate at chart start).',
  'chart.legend.inf': 'Inflation (CPI, yearly %):',
  'chart.legend.infBlurb':
    ', FP.CPI.TOTL.ZG. Line = mean price level index for economies of selected currencies (100 = Jan 1 of chart start year); currency ≠ country, static mapping.',

  'chart.insightsTitle': 'What stands out on this window',
  'chart.insightHover':
    'You’re near a highlighted FX or inflation event on this chart (see notes below).',
  'chart.insight.fxPeak':
    'FX mean index peaks near {pct}% around {date} (100% = rate at chart start).',
  'chart.insight.fxTrough': 'FX mean index dips near {pct}% around {date}.',
  'chart.insight.fxJump':
    'Largest FX index step in this plot: about {delta} p.p. around {date}.',
  'chart.insight.infPeak':
    'Inflation price index peaks near {idx} around {date}.',
  'chart.insight.infJump':
    'Largest inflation-index step in this plot: about {delta} around {date}.',

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
