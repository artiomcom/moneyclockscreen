/** Deutsch */
export const de: Record<string, string> = {
  'lang.en': 'EN',
  'lang.ru': 'RU',
  'lang.es': 'ES',
  'lang.fr': 'FR',
  'lang.de': 'DE',
  'lang.zh': 'ZH',
  'lang.ja': 'JA',
  'lang.pt': 'PT',
  'lang.selectAria': 'Oberflächensprache',

  'theme.lightAria': 'Helles Design',
  'theme.darkAria': 'Dunkles Design',
  'settings.aria': 'Einstellungen öffnen',
  'settings.title': 'Einstellungen',
  'settings.close': 'Schließen',

  'hero.aria': 'Verdienstrate',
  'hero.now': 'Jetzt',
  'hero.tagline': 'Ihre Einkommensgeschwindigkeit',
  'hero.perSecondLife': 'Ihre Einkommensgeschwindigkeit',
  'hero.perSec': '/ s',
  'hero.nominalApprox': 'nominal ≈',
  'hero.perHour': '/Std.',
  'hero.heroEarningsPerSecond': 'pro Sekunde',
  'hero.heroEarningsHour': '/ Stunde',
  'hero.heroEarningsLive': 'Live',
  'hero.realHint': '· real',
  'hero.today': 'Heute',
  'hero.dayMeterAria': 'Tagesfortschritt bis Mitternacht',
  'hero.dayMeterTitle': 'Heutiger Fortschritt',
  'hero.dayWindowEndMidnight': '24:00',
  'hero.dayLeftLabel': 'Verbleibt',
  'hero.lastHourLabel': 'Letzte Stunde',
  'hero.remainingLabel': 'Verbleibend',
  'hero.dayProgressTrendFaster':
    'Du verdienst heute schneller als gestern',
  'hero.moreNominal': 'Nominal (vor Anpassung)',
  'hero.insightTitle': 'Nach Steuern & Inflation',
  'hero.insightAria': 'Reale Kaufkraft',
  'hero.futureAria': 'Schätzung für ein Jahr',
  'hero.btnHideDetails': 'Details ausblenden',
  'hero.btnShowDetails': 'Währungen, Saldo, Kurse',
  'hero.btnEditProjects': 'Projekte bearbeiten',
  'hero.ctaGrow': 'Einkommen steigern',
  'hero.btnBreakdown': 'Nach Währung & Saldo',
  'hero.btnTrajectory': 'Trajektorie (Schätzung)',
  'hero.btnChart': 'Einkommen über die Zeit',
  'hero.btnBackCompact': 'Zurück zur Übersicht',
  'hero.btnBackBreakdown': 'Zurück zur Aufschlüsselung',
  'hero.btnBackTrajectory': 'Zurück zur Trajektorie',
  'hero.btnHideChart': 'Diagramm ausblenden',
  'hero.emptyPrompt':
    'Projekt und Beträge in den Einstellungen hinzufügen, hier erscheint Ihre Live-Rate.',
  'hero.emptyCta': 'Einstellungen öffnen',
  'hero.noFxHint':
    'Für eine einzige Kopfzeilen-Rate: Wechselkurse API aktivieren oder Projekte in einer Währung.',

  'magic.projectionsTitle': 'Prognosen',
  'magic.projTonight': 'Bis heute Abend',
  'magic.projTonightDesc': 'Tagesdeckel beim aktuellen Tempo',
  'magic.projMonth': 'Dieser Monat',
  'magic.projMonthDesc': '~1/12 des Jahres-Nettos (Schätzung)',
  'magic.proj5y': 'In 5 Jahren',
  'magic.proj5yDesc': 'Bei aktuellem Tempo (Trajektorie)',
  'magic.insightsTitle': 'Einblicke',
  'magic.insight1': 'Aufstockung jede Sekunde aus gewählten Projekten.',
  'magic.insight2': '„Trajektorie“ unten: +20%-Szenario und Horizonte.',
  'magic.insight3': 'Wechselkurse und Inflation wie im Hero-Block.',

  'trajectory.aria': 'Trajektorie-Schätzung',
  'trajectory.kicker': 'Wenn Sie dieses Tempo halten',
  'trajectory.disclaimer':
    'Illustrative Schätzung, kein Versprechen. Geht von ähnlich bleibendem realem Einkommen pro Sekunde aus.',
  'trajectory.steadyLead': 'Beim heutigen Tempo',
  'trajectory.next12': 'in den nächsten ~12 Monaten',
  'trajectory.fiveYearLead': 'Über ~5 Jahre, gleiches Tempo:',
  'trajectory.morePaths': 'Andere Pfade (Schätzung)',
  'trajectory.plus20Lead': 'Wenn der Satz ~20% steigt',
  'trajectory.deltaLead': 'Jährliche Differenz zum heutigen Tempo',
  'trajectory.perYearVs': 'pro Jahr vs. stabiles Szenario',
  'trajectory.fiveCompare':
    '5-Jahres-Skala: etwa {base} vs. etwa {plus} bei ~20% höherem Satz.',
  'trajectory.geekFootnote':
    'In Ihrer Kontowährung; gleiche „Realrate“-Logik wie im Hauptblock.',

  'breakdown.totalEarned': 'Insgesamt verdient',
  'breakdown.oneTotalTitle': 'Gesamt (Ihre Währungen → eine Zahl)',
  'breakdown.showAllCurrencies': 'Alle Währungen anzeigen',
  'breakdown.hideAllCurrencies': 'Nur eine Gesamtsumme',
  'breakdown.endedBadge': 'Beendet',
  'breakdown.inAccount': 'Auf dem Konto jetzt',
  'breakdown.noContractsInCcy': 'Keine Verträge in',
  'breakdown.allEndedInCcy': 'Alle beendet',
  'breakdown.noAccrualHint':
    'Keine Live-FX-Kurse: der laufende Saldo bleibt bei der Zahl nach Lohn. Kurse laden (oder Projekt in Kontowährung), damit Fremdwährungen einfließen.',
  'breakdown.foreignAccrualFxHint':
    'Kein Vertrag in Kontowährung; der Saldo wächst trotzdem über Aufstockung aus anderen Währungen zum aktuellen API-Kurs (wie „Heute“).',
  'breakdown.allEndedHint':
    'Alle Projekte in dieser Währung sind beendet, kein Zufluss zum Saldo.',
  'breakdown.equivTitle': 'Gesamt in Kontowährung',
  'breakdown.equivHint':
    'Eine Spalte in Kontowährung, alle ausgewählten Projekte zum Kurs unten umgerechnet.',
  'breakdown.fxBlurb':
    'Jeder Betrag in seiner Währung wird mit dem aktuellen API-Kurs umgerechnet in',
  'breakdown.sumBlurb': 'Umgerechnete Beträge werden summiert, um in einer Zahl zu vergleichen.',
  'breakdown.howTitle': 'So funktioniert es.',
  'breakdown.howBody':
    'Saldo nach letztem Lohn; ab Mitternacht des Folgetags Aufstockung aller gewählten Projekte bis jetzt (Fremdwährungen zum Live-Kurs wie im Hero).',
  'breakdown.onlyCcy':
    'Laufender Saldo: alle gewählten Projekte nach Umrechnung in {ccy}. Währungsdetails unter „Insgesamt verdient“.',
  'breakdown.sortEndedNote':
    '„Beendet“ heißt: jeder Vertrag in dieser Währung ist über dem Enddatum.',
  'breakdown.rateHeading': 'Kurs.',
  'breakdown.sumHeading': 'Summe.',
  'breakdown.allEndedWithCcy': 'Alle beendet ({ccy})',

  'fx.title': 'Kurs',
  'fx.noForeign':
    'API-Basis ist {balance}; keine anderen Währungen unter den gewählten Projekten, keine separaten Kurse.',
  'fx.missing':
    'Kein API-Kurs von Projekt-Währungen ({codes}) zur Basis {base}, kombinierte Diagrammlinie ggf. nicht verfügbar.',
  'fx.footer':
    'Für Kontowährungs-Gesamt, kombiniertes Σ/s und die rosa Diagrammlinie.',
  'fx.failed':
    'Kurse konnten nicht geladen werden, Umrechnung und Diagrammlinie nicht verfügbar. Salden unverändert.',

  'chart.panelTitle': 'Auflauf über die Zeit',
  'chart.graphBadge': 'Diagramm',
  'chart.range1y': '1J',
  'chart.rangeAll': 'Gesamte Zeit',
  'chart.toolbarAria': 'Diagrammbereich und Ansicht',
  'chart.allCompanies': 'Alle',
  'chart.markerStartAbbr': 'S',
  'chart.markerEndAbbr': 'E',
  'chart.contractStart': 'Vertragsbeginn',
  'chart.contractEnd': 'Vertragsende',
  'chart.markersToggleAria': 'Vertrags-Start- und Endmarkierungen ein- oder ausblenden',
  'chart.monthlyRatesToggleAria':
    'Nominale Monatslinien pro Projekt (in Kontowährung über Zeit, FX) ein-/ausblenden',
  'chart.monthlyRatesToggleTitle':
    'Gestrichelt: nominale Monatssumme je Projekt in Kontowährung über die Zeit (Frankfurter). Rechte Achse = diese Skala.',
  'chart.monthlyRatesTipMonth': '{month}',
  'chart.monthlyRatesTipLine': '{name}: {amount}',
  'chart.monthlyRatesTipSum': 'Umgerechnete Summe: {amount}',
  'chart.monthlyRateLineLabel': '{name} · nominell monatlich (FX)',
  'chart.monthlyRateUnit': '/Mo.',
  'chart.monthlyAxisShort': 'Monatlich (FX)',
  'chart.currencyCycleAria': 'Diagrammwährung wechseln. Aktuell: {code}',
  'chart.currencyCycleTitle': 'Diagramm in {code}. Klicken zum Wechseln.',
  'chart.currencyCycleDisabledAria': 'Nur eine Währung — kein Wechsel möglich',
  'chart.currencyCycleDisabledTitle': 'Projekt in anderer Währung hinzufügen, um zu wechseln',
  'chart.advancedShow': 'Diagramm-Details',
  'chart.advancedHide': 'Einfache Ansicht',
  'chart.productAria': 'Einkommenswachstum und Trend',
  'chart.productKicker': 'Wie es läuft',
  'chart.productAboveTrend':
    'Sie liegen über einem geraden Trend in diesem Fenster, Schwung auf Ihrer Seite.',
  'chart.productBelowTrend':
    'Gegen einen Geraden-Trend vom Fensteranfang sind Sie etwa {pct}% darunter.',
  'chart.productNeutralTrend': 'Nahe einem stabilen linearen Trend in diesem Fenster.',
  'chart.productNow': 'Verdient (jetzt)',
  'chart.productTrendEnd': 'Trend (Anpassung)',
  'chart.productGapTrend': 'Abstand zum Trend',
  'chart.productYou': 'Sie',
  'chart.productTrend': 'Trend',
  'chart.productNeedRates':
    'API-Kurse aktivieren (oder eine Währung), um eine kombinierte Einkommenslinie zu sehen.',
  'chart.productDisclaimer':
    'Trend = lineare Anpassung der Vertrags-Einnahmen in diesem Fenster. Illustrativ, kein Prognose.',
  'chart.productTrajectoryLead': 'Satzausblick (~12 Monate)',
  'chart.productSteady12': 'Stabiles Tempo',
  'chart.productPlus20': 'Bei Satz +20%',
  'chart.productPerYearHint': '/ Jahr vs. stabil',
  'chart.ctaGrow': 'Einkommen steigern',

  'footer.perSec': '/ s',
  'footer.sigmaPerSec': 'Σ ≈ +',
  'footer.inCcy': 'in',
  'footer.byRate': '(API-Kurs)',
  'footer.appTagline': 'Money Clock · Live',

  'awareness.title': 'Money Awareness Engine',
  'awareness.sub': 'Mein Tempo (Teilen)',
  'awareness.ladder': 'Über ~{pct}% auf einer Demo-EUR-Leiter',
  'awareness.ladderNote':
    'Viral-Formulierung: „Ich verdiene mehr als ~{pct}%“ auf dieser Demo-Leiter, keine echte Umfrage.',
  'awareness.ladderModel':
    'Modell: grobe Anker ~20–150k €/Jahr → €/s. Keine Finanzberatung.',
  'awareness.needFx':
    'Kurse laden für denselben EUR-Demo-Vergleich (Kontext, nicht angeben).',
  'awareness.share': 'Teilen',
  'awareness.copied': 'In die Zwischenablage kopiert',
  'awareness.copyFail': 'Kopieren fehlgeschlagen',
  'awareness.clipboardErr': 'Kopieren fehlgeschlagen',
  'awareness.copyCurrent': 'Share-Text kopieren',

  'dates.start': 'Start:',
  'dates.end': 'Ende:',
  'dates.projectClosed': 'Projekt beendet, Periodensumme ist final',

  'profile.phone': 'Tel.:',

  'settings.projectsTitle': 'Projekte',
  'settings.projectsSubtitle': 'Vertragssätze und Optionen',
  'settings.balanceLabel': 'Saldo nach letztem Lohn (an diesem Tag)',
  'settings.payrollDate': 'Datum des letzten Lohns',
  'settings.payrollHint':
    'Saldo direkt nach dieser Auszahlung eingeben. Ab Mitternacht des nächsten Tages wird auf dem Hauptbildschirm aufgestockt.',
  'settings.accountCcy': 'Kontowährung',
  'settings.takeHome': 'Nettoanteil nach Steuern (Schätzung)',
  'settings.takeHomeAria': 'Netto-Prozentsatz nach Steuern',
  'settings.takeHomeHint':
    '{pct}% des Vertrags für den „Realrate“-Block auf dem Hauptbildschirm. Schätzung, keine Buchhaltung.',
  'settings.balanceFooter':
    '„Insgesamt verdient“ summiert gewählte Projekte. Kontosaldo getrennt: Lohnbasis plus Aufstockung aller gewählten Projekte; Fremdwährungen mit Live-API-Kurs (wie Hauptanzeige).',
  'settings.projectsPicker': 'Projekte',
  'settings.projectsPickerHint':
    'Angehakt = in Dashboard-Summen (mehrere erlaubt). Klick auf den Namen zum Bearbeiten unten.',
  'settings.showOnDashboard': 'Auf Hauptbildschirm anzeigen',
  'settings.editProject': 'Dieses Projekt bearbeiten',
  'settings.contractEnded': 'Beendet',
  'settings.endedBadgeTitle': 'Enddatum überschritten, Aufstockung für diesen Vertrag gestoppt.',
  'settings.projectName': 'Projektname',
  'settings.projectCcy': 'Projektwährung',
  'settings.workStart': 'Arbeitsbeginn',
  'settings.workStartHint':
    'Kalenderzeit ab dieser Mitternacht (inkl. vergangener Jahre) × Ihr Satz (monatlich, stündlich oder Vertrag bis Ende). Urlaubszeiträume unten werden abgezogen.',
  'settings.workEnd': 'Projektende',
  'settings.workEndHint':
    'Bei „ganzer Vertrag“ Laufzeit zwischen Daten (minus Urlaub). Bei monatlich/stündlich begrenzt nur das Enddatum. Leer = offen.',
  'settings.vacations': 'Urlaub (vergangen & geplant)',
  'settings.vacationsHint':
    'Zeiträume wählen; diese Kalendertage zählen nicht zur Zeit seit Arbeitsbeginn (Ende inklusive).',
  'settings.vacationN': 'Urlaub {n}',
  'settings.removeVacation': 'Urlaub entfernen',
  'settings.vacationFrom': 'Von',
  'settings.vacationTo': 'Bis',
  'settings.addVacation': 'Urlaub hinzufügen',
  'settings.billingType': 'Abrechnungsart',
  'settings.billing.monthly': 'Monatszahlung',
  'settings.billing.hourly': 'Stundensatz',
  'settings.billing.contract': 'Gesamtvertragssumme',
  'settings.billingHelp.monthly':
    'Wie Gehalt: Monatsbetrag auf 22×8 Arbeitsstunden; jede Kalendersekunde seit Start.',
  'settings.billingHelp.hourly':
    'Satz pro Stunde; pro Sekunde = Betrag / 3600. Für Stundenabrechnung.',
  'settings.billingHelp.contract':
    'Ganzer Vertrag; Satz = Betrag / Kalenderspanne zwischen Start und Ende (minus Urlaub). Summe am Ende = Vertrag.',
  'settings.amount.monthly': 'Monatszahlung',
  'settings.amount.hourly': 'Stundensatz',
  'settings.amount.contract': 'Gesamtvertragssumme',
  'settings.suffix.perMonth': ' / Mon.',
  'settings.suffix.perHour': ' / Std.',
  'settings.dataTitle': 'Daten',
  'settings.dataHint':
    'Automatisch in diesem Browser (localStorage). JSON-Datei ist Backup oder Gerätewechsel.',
  'settings.storageRiskTitle': 'Nur in diesem Browser',
  'settings.storageRiskBody':
    'Daten löschen, anderes Profil oder Gerät kann alles entfernen. JSON gelegentlich laden oder kopieren, ohne Konto.',
  'settings.downloadJson': 'JSON herunterladen',
  'settings.copyJson': 'JSON kopieren',
  'settings.copyJsonOk': 'JSON kopiert, sicher aufbewahren',
  'settings.copyJsonFail': 'Kopieren fehlgeschlagen',
  'settings.uploadJson': 'JSON hochladen',

  'backupBanner.title': 'Backup anlegen',
  'backupBanner.body':
    'Ihre Einstellungen liegen nur in diesem Browser. Unter Einstellungen → Daten können Sie JSON laden oder kopieren.',
  'backupBanner.openSettings': 'Zu Backup-Optionen',
  'backupBanner.later': 'Später erinnern',

  'profile.title': 'Profil (aus JSON)',
  'profile.storedHint':
    'Mit Einstellungen gespeichert; in „JSON herunterladen“ enthalten. Quelldatei bearbeiten und erneut importieren.',
  'profile.remove': 'Aus Speicher entfernen',
  'profile.version': 'Profilversion:',
  'profile.location': 'Standort:',
  'profile.format': 'Format:',
  'profile.topSkills': 'Top skills:',

  'import.badFile':
    'Ungültige Datei. MoneyClock-Export-JSON nötig: v: 1 und Blöcke mode, projectsBundle usw.',

  'chart.empty':
    'Projektstartdatum setzen, das kumulierte Einkommensdiagramm erscheint.',
  'chart.ariaMain': 'Kumuliertes Einkommen, Kontosaldo und FX',
  'chart.heading': 'Projekte & Konto',
  'chart.yHover': 'Y: Linie unter Cursor',
  'chart.yFirst': 'Y: Erster in Liste',
  'chart.fromStart': 'vom frühesten Start',
  'chart.now': 'jetzt',
  'chart.indexSuffix': 'idx',
  'chart.legend.fxHistory': 'Kursverlauf:',
  'chart.legend.fxBlurb':
    '. Mittlerer relativer Index (100% = Kurs am Diagrammstart).',
  'chart.legend.inf': 'Inflation (VPI, jährlich %):',
  'chart.legend.infBlurb':
    ', FP.CPI.TOTL.ZG. Linie = mittlerer Preisniveau-Index für Volkswirtschaften der gewählten Währungen (100 = 1. Jan. des Startjahrs); Währung ≠ Land, statisches Mapping.',

  'chart.insightsTitle': 'Auffällig in diesem Ausschnitt',
  'chart.insightHover':
    'Sie sind nahe einem hervorgehobenen FX- oder Inflationsereignis (siehe unten).',
  'chart.insight.fxPeak':
    'FX-Mittelindex erreicht etwa {pct}% um {date} (100% = Kurs am Diagrammstart).',
  'chart.insight.fxTrough': 'FX-Mittelindex fällt auf etwa {pct}% um {date}.',
  'chart.insight.fxJump':
    'Größter FX-Index-Schritt in diesem Plot: etwa {delta} Prozentpunkte um {date}.',
  'chart.insight.infPeak':
    'Inflations-Preisindex erreicht etwa {idx} um {date}.',
  'chart.insight.infJump':
    'Größter Inflationsindex-Schritt in diesem Plot: etwa {delta} um {date}.',

  'chart.series.others': 'andere',
  'chart.series.projects': 'Projekte',
  'chart.series.account': 'Konto',
  'chart.series.allFx': 'alle Projekte (FX)',
  'chart.defaultProject': 'Projekt',
  'chart.ariaPanel': 'Einkommensdiagramm',
  'chart.unfocus': 'Auswahl aufheben: {name}',
  'chart.focusLine': 'Im Diagramm: {name}',
  'chart.addProject': 'Projekt hinzufügen',

  'common.projectFallback': 'Projekt'
};
