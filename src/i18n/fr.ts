/** Français */
export const fr: Record<string, string> = {
  'lang.en': 'EN',
  'lang.ru': 'RU',
  'lang.es': 'ES',
  'lang.fr': 'FR',
  'lang.de': 'DE',
  'lang.zh': 'ZH',
  'lang.ja': 'JA',
  'lang.pt': 'PT',
  'lang.selectAria': 'Langue de l’interface',

  'theme.lightAria': 'Thème clair',
  'theme.darkAria': 'Thème sombre',
  'settings.aria': 'Ouvrir les réglages',
  'settings.title': 'Réglages',
  'settings.close': 'Fermer',

  'hero.aria': 'Rythme de gains',
  'hero.now': 'Maintenant',
  'hero.tagline': 'Votre vitesse de revenu',
  'hero.perSecondLife': 'Votre vitesse de revenu',
  'hero.perSec': '/ s',
  'hero.nominalApprox': 'nominal ≈',
  'hero.perHour': '/h',
  'hero.realHint': '· réel',
  'hero.today': 'Aujourd’hui',
  'hero.todayNote': 'depuis minuit · heure locale',
  'hero.moreNominal': 'Nominal (avant ajustements)',
  'hero.insightTitle': 'Après impôts et inflation',
  'hero.insightAria': 'Pouvoir d’achat réel',
  'hero.futureAria': 'Estimation à un an',
  'hero.btnHideDetails': 'Masquer les détails',
  'hero.btnShowDetails': 'Devises, solde, taux',
  'hero.btnEditProjects': 'Modifier les projets',
  'hero.ctaGrow': 'Faire croître vos revenus',
  'hero.btnBreakdown': 'Par devise et solde',
  'hero.btnTrajectory': 'Trajectoire (estimation)',
  'hero.btnChart': 'Revenus dans le temps',
  'hero.btnBackCompact': 'Retour au résumé',
  'hero.btnBackBreakdown': 'Retour au détail',
  'hero.btnBackTrajectory': 'Retour à la trajectoire',
  'hero.btnHideChart': 'Masquer le graphique',
  'hero.emptyPrompt':
    'Ajoutez un projet et des montants dans les réglages, votre rythme en direct apparaît ici.',
  'hero.emptyCta': 'Ouvrir les réglages',
  'hero.noFxHint':
    'Pour un seul taux d’en-tête, activez les taux API ou des projets dans une seule devise.',

  'trajectory.aria': 'Estimation de trajectoire',
  'trajectory.kicker': 'Si vous gardez ce rythme',
  'trajectory.disclaimer':
    'Estimation illustrative, pas une garantie. Suppose un revenu réel par seconde stable.',
  'trajectory.steadyLead': 'Au rythme d’aujourd’hui',
  'trajectory.next12': 'dans les ~12 prochains mois',
  'trajectory.fiveYearLead': 'Sur ~5 ans, même rythme :',
  'trajectory.morePaths': 'Autres scénarios (estimation)',
  'trajectory.plus20Lead': 'Si le taux augmente ~de 20%',
  'trajectory.deltaLead': 'Écart annuel vs rythme d’aujourd’hui',
  'trajectory.perYearVs': 'par an vs scénario stable',
  'trajectory.fiveCompare':
    'Échelle 5 ans : environ {base} vs environ {plus} avec un taux ~20% plus élevé.',
  'trajectory.geekFootnote':
    'Dans la devise du compte ; même logique de « taux réel » que le bloc principal.',

  'breakdown.totalEarned': 'Total gagné',
  'breakdown.oneTotalTitle': 'Total (vos devises → un nombre)',
  'breakdown.showAllCurrencies': 'Afficher toutes les devises',
  'breakdown.hideAllCurrencies': 'Un seul total',
  'breakdown.sortHintFx':
    'Chaque devise séparément. Contrats actifs d’abord ; dans le groupe, tri par montant en',
  'breakdown.sortHintFxApi': '(taux API).',
  'breakdown.sortHintNoFx': 'Sans taux, tri par code devise.',
  'breakdown.sortParagraphFx':
    'Chaque devise séparément. Contrats actifs d’abord ; dans chaque groupe, tri par montant décroissant converti en {ccy} (taux API).',
  'breakdown.sortParagraphNoFx':
    'Chaque devise séparément. Contrats actifs d’abord ; sans FX, tri par code devise.',
  'breakdown.endedBadge': 'Terminés',
  'breakdown.inAccount': 'Sur le compte maintenant',
  'breakdown.balancePayrollCaption':
    'Solde réglé après la paie du {payroll}; ajout depuis les projets en devise du compte à partir du {accrualFrom} (minuit du lendemain).',
  'breakdown.noContractsInCcy': 'Aucun contrat en',
  'breakdown.allEndedInCcy': 'Tous terminés',
  'breakdown.noAccrualHint':
    'Rien ne s’accumule au solde, pas de projets sélectionnés dans la devise du compte, seulement solde post-paie.',
  'breakdown.allEndedHint':
    'Tous les projets dans cette devise sont terminés, pas d’accumulation au solde.',
  'breakdown.equivTitle': 'Total en devise du compte',
  'breakdown.equivHint':
    'Une colonne dans la devise du compte, tous les projets convertis au taux ci-dessous.',
  'breakdown.fxBlurb':
    'Chaque montant dans sa devise est converti au taux API actuel vers',
  'breakdown.sumBlurb': 'Les montants convertis sont additionnés pour comparer en un seul chiffre.',
  'breakdown.howTitle': 'Comment ça marche.',
  'breakdown.howBody':
    'Solde après la dernière date de paie ; à partir de minuit le lendemain, l’accumulation court jusqu’à maintenant.',
  'breakdown.onlyCcy':
    'Seuls les projets en {ccy} comptent ici. Les autres devises sont sous « Total gagné ».',
  'breakdown.sortEndedNote':
    '« Terminés » = chaque contrat dans cette devise est après sa date de fin.',
  'breakdown.rateHeading': 'Taux.',
  'breakdown.sumHeading': 'Somme.',
  'breakdown.allEndedWithCcy': 'Tous terminés ({ccy})',

  'fx.title': 'Taux',
  'fx.noForeign':
    'Base API {balance} ; pas d’autres devises parmi les projets sélectionnés, pas de cotations séparées.',
  'fx.missing':
    'Pas de taux API des devises projet ({codes}) vers la base {base}, ligne fusionnée du graphique peut manquer.',
  'fx.footer':
    'Utilisé pour le total en devise du compte, le Σ/s combiné et la ligne rose du graphique.',
  'fx.failed':
    'Échec du chargement des taux, fusion et ligne du graphique indisponibles. Soldes inchangés.',

  'chart.panelTitle': 'Accumulation dans le temps',
  'chart.graphBadge': 'Graphique',
  'chart.range1y': '1A',
  'chart.rangeAll': 'Toute la période',
  'chart.toolbarAria': 'Plage et affichage du graphique',
  'chart.allCompanies': 'Toutes',
  'chart.markerStartAbbr': 'D',
  'chart.markerEndAbbr': 'F',
  'chart.contractStart': 'Début du contrat',
  'chart.contractEnd': 'Fin du contrat',
  'chart.markersToggleAria': 'Afficher ou masquer début et fin de contrat sur le graphique',
  'chart.advancedShow': 'Détails du graphique',
  'chart.advancedHide': 'Vue simple',
  'chart.productAria': 'Croissance du revenu et tendance',
  'chart.productKicker': 'Comment ça se passe',
  'chart.productAboveTrend':
    'Vous dépassez une tendance linéaire sur cette fenêtre, l’élan est avec vous.',
  'chart.productBelowTrend':
    'Par rapport à une ligne droite depuis le début de la fenêtre, vous êtes environ {pct}% en dessous.',
  'chart.productNeutralTrend': 'Proche d’une tendance linéaire stable sur cette fenêtre.',
  'chart.productNow': 'Gagné (maintenant)',
  'chart.productTrendEnd': 'Tendance (ajustement)',
  'chart.productGapTrend': 'Écart vs tendance',
  'chart.productYou': 'Vous',
  'chart.productTrend': 'Tendance',
  'chart.productNeedRates':
    'Activez les taux API (ou une seule devise) pour voir une ligne de revenu combinée.',
  'chart.productDisclaimer':
    'Tendance = ajustement linéaire sur les gains du contrat dans cette fenêtre. Illustratif, pas un pronostic.',
  'chart.productTrajectoryLead': 'Perspective de taux (~12 mois)',
  'chart.productSteady12': 'Rythme stable',
  'chart.productPlus20': 'Si taux +20%',
  'chart.productPerYearHint': '/ an vs stable',
  'chart.ctaGrow': 'Faire croître vos revenus',

  'footer.perSec': '/ s',
  'footer.sigmaPerSec': 'Σ ≈ +',
  'footer.inCcy': 'en',
  'footer.byRate': '(taux API)',

  'awareness.title': 'Money Awareness Engine',
  'awareness.sub': 'Mon rythme (partage)',
  'awareness.ladder': 'Au-dessus de ~{pct}% sur une échelle demo EUR',
  'awareness.ladderNote':
    'Formulation virale : « je gagne plus que ~{pct}% » sur cette échelle, pas un vrai sondage.',
  'awareness.ladderModel':
    'Modèle : ancres ~20–150k €/an → €/s. Pas un conseil financier.',
  'awareness.needFx':
    'Chargez les taux pour la même comparaison demo à l’échelle EUR (contexte, pas vanterie).',
  'awareness.share': 'Partager',
  'awareness.copied': 'Copié dans le presse-papiers',
  'awareness.copyFail': 'Impossible de copier',
  'awareness.clipboardErr': 'Échec de la copie',
  'awareness.copyCurrent': 'Copier le texte de partage',

  'dates.start': 'Début :',
  'dates.end': 'Fin :',
  'dates.projectClosed': 'Projet terminé, le total de la période est définitif',

  'profile.phone': 'Tél. :',

  'settings.projectsTitle': 'Projets',
  'settings.projectsSubtitle': 'Taux de contrat et options',
  'settings.balanceLabel': 'Solde après la dernière paie (à cette date)',
  'settings.payrollDate': 'Date de la dernière paie',
  'settings.payrollHint':
    'Saisissez le solde juste après ce versement. À partir de minuit le lendemain, l’accumulation s’ajoute à l’écran principal.',
  'settings.accountCcy': 'Devise du compte',
  'settings.takeHome': 'Part nette après impôts (estimation)',
  'settings.takeHomeAria': 'Pourcentage net après impôts',
  'settings.takeHomeHint':
    '{pct}% du contrat comptés pour le bloc « taux réel » sur l’écran principal. Estimation, pas de la compta.',
  'settings.balanceFooter':
    '« Total gagné » additionne les projets sélectionnés. Le solde du compte est séparé : base paie plus accumulation. Seuls les projets dans la devise du compte s’accumulent au solde.',
  'settings.projectsPicker': 'Projets',
  'settings.projectsPickerHint':
    'Coché = inclus dans les totaux du tableau (plusieurs possibles). Clic sur le nom pour éditer ci-dessous.',
  'settings.showOnDashboard': 'Afficher sur l’écran principal',
  'settings.editProject': 'Modifier ce projet',
  'settings.contractEnded': 'Terminé',
  'settings.endedBadgeTitle': 'Date de fin dépassée, l’accumulation pour ce contrat est arrêtée.',
  'settings.projectName': 'Nom du projet',
  'settings.projectCcy': 'Devise du projet',
  'settings.workStart': 'Date de début du travail',
  'settings.workStartHint':
    'Temps calendaire depuis cette minuit (y compris années passées) × votre taux (mensuel, horaire ou contrat jusqu’à la fin). Les congés ci-dessous sont exclus.',
  'settings.workEnd': 'Date de fin du projet',
  'settings.workEndHint':
    'Pour facturation « contrat entier », durée entre les dates (moins congés). Pour mensuel/horaire, la fin limite seulement l’accumulation. Vide = sans fin fixe.',
  'settings.vacations': 'Congés (passés et planifiés)',
  'settings.vacationsHint':
    'Choisissez des plages ; ces jours sont exclus du temps depuis le début (fins inclusives).',
  'settings.vacationN': 'Congé {n}',
  'settings.removeVacation': 'Supprimer le congé',
  'settings.vacationFrom': 'Du',
  'settings.vacationTo': 'Au',
  'settings.addVacation': 'Ajouter un congé',
  'settings.billingType': 'Type de facturation',
  'settings.billing.monthly': 'Paiement mensuel',
  'settings.billing.hourly': 'Taux horaire',
  'settings.billing.contract': 'Montant total du contrat',
  'settings.billingHelp.monthly':
    'Comme un salaire : montant mensuel sur 22×8 h ouvrées ; accumule chaque seconde depuis le début.',
  'settings.billingHelp.hourly':
    'Taux par heure ; par seconde = montant / 3600. Pour facturation à l’heure.',
  'settings.billingHelp.contract':
    'Contrat entier ; taux = montant / période calendaire entre début et fin (moins congés). Total = contrat à la fin.',
  'settings.amount.monthly': 'Paiement mensuel',
  'settings.amount.hourly': 'Taux horaire',
  'settings.amount.contract': 'Montant total du contrat',
  'settings.suffix.perMonth': ' / mois',
  'settings.suffix.perHour': ' / h',
  'settings.dataTitle': 'Données',
  'settings.dataHint':
    'Enregistré automatiquement dans ce navigateur (localStorage). Un fichier JSON sert de sauvegarde ou de transfert.',
  'settings.storageRiskTitle': 'Uniquement dans ce navigateur',
  'settings.storageRiskBody':
    'Effacer les données, autre profil ou autre appareil peut tout supprimer. Téléchargez ou copiez le JSON parfois, sans compte.',
  'settings.downloadJson': 'Télécharger JSON',
  'settings.copyJson': 'Copier JSON',
  'settings.copyJsonOk': 'JSON copié, gardez-le en lieu sûr',
  'settings.copyJsonFail': 'Impossible de copier',
  'settings.uploadJson': 'Importer JSON',

  'backupBanner.title': 'Faites une sauvegarde',
  'backupBanner.body':
    'Votre config est stockée seulement dans ce navigateur. Dans Réglages → Données vous pouvez télécharger ou copier le JSON.',
  'backupBanner.openSettings': 'Options de sauvegarde',
  'backupBanner.later': 'Me le rappeler plus tard',

  'profile.title': 'Profil (depuis JSON)',
  'profile.storedHint':
    'Stocké avec les réglages ; inclus dans « Télécharger JSON ». Modifiez le fichier source et réimportez.',
  'profile.remove': 'Retirer de la sauvegarde',
  'profile.version': 'Version du profil :',
  'profile.location': 'Lieu :',
  'profile.format': 'Format :',
  'profile.topSkills': 'Top skills :',

  'import.badFile':
    'Fichier invalide. Il faut un JSON d’export MoneyClock : v: 1 et blocs mode, projectsBundle, etc.',

  'chart.empty':
    'Indiquez une date de début de projet, le graphique de revenu cumulé apparaîtra.',
  'chart.ariaMain': 'Revenu cumulé, solde du compte et devises',
  'chart.heading': 'Projets et compte',
  'chart.yHover': 'Y : ligne sous le curseur',
  'chart.yFirst': 'Y : premier de la liste',
  'chart.fromStart': 'depuis le plus ancien début',
  'chart.now': 'maintenant',
  'chart.indexSuffix': 'idx',
  'chart.legend.fxHistory': 'Historique des taux :',
  'chart.legend.fxBlurb':
    '. Indice relatif moyen (100% = taux au début du graphique).',
  'chart.legend.inf': 'Inflation (IPC, % annuel) :',
  'chart.legend.infBlurb':
    ', FP.CPI.TOTL.ZG. Ligne = indice moyen du niveau des prix pour les économies des devises choisies (100 = 1er janv. de l’année de début) ; devise ≠ pays, mapping statique.',

  'chart.series.others': 'autres',
  'chart.series.projects': 'projets',
  'chart.series.account': 'compte',
  'chart.series.allFx': 'tous les projets (FX)',
  'chart.defaultProject': 'Projet',
  'chart.ariaPanel': 'Graphique des revenus',
  'chart.unfocus': 'Effacer la sélection : {name}',
  'chart.focusLine': 'Afficher sur le graphique : {name}',
  'chart.addProject': 'Ajouter un projet',

  'common.projectFallback': 'projet'
};
