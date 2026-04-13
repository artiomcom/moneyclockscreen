/** Español */
export const es: Record<string, string> = {
  'lang.en': 'EN',
  'lang.ru': 'RU',
  'lang.es': 'ES',
  'lang.fr': 'FR',
  'lang.de': 'DE',
  'lang.zh': 'ZH',
  'lang.ja': 'JA',
  'lang.pt': 'PT',
  'lang.selectAria': 'Idioma de la interfaz',

  'theme.lightAria': 'Tema claro',
  'theme.darkAria': 'Tema oscuro',
  'settings.aria': 'Abrir ajustes',
  'settings.title': 'Ajustes',
  'settings.close': 'Cerrar',

  'hero.aria': 'Ritmo de ingresos',
  'hero.now': 'Ahora',
  'hero.tagline': 'Tu velocidad de ingreso',
  'hero.perSecondLife': 'Tu velocidad de ingreso',
  'hero.perSec': '/ s',
  'hero.nominalApprox': 'nominal ≈',
  'hero.perHour': '/h',
  'hero.realHint': '· real',
  'hero.today': 'Hoy',
  'hero.todayNote': 'desde medianoche · hora local',
  'hero.moreNominal': 'Nominal (antes de ajustes)',
  'hero.insightTitle': 'Tras impuestos e inflación',
  'hero.insightAria': 'Poder adquisitivo real',
  'hero.futureAria': 'Estimación a un año',
  'hero.btnHideDetails': 'Ocultar detalles',
  'hero.btnShowDetails': 'Divisas, saldo, tipos',
  'hero.btnEditProjects': 'Editar proyectos',
  'hero.ctaGrow': 'Haz crecer tus ingresos',
  'hero.btnBreakdown': 'Por divisa y saldo',
  'hero.btnTrajectory': 'Trayectoria (estimación)',
  'hero.btnChart': 'Ingresos en el tiempo',
  'hero.btnBackCompact': 'Volver al resumen',
  'hero.btnBackBreakdown': 'Volver al desglose',
  'hero.btnBackTrajectory': 'Volver a la trayectoria',
  'hero.btnHideChart': 'Ocultar gráfico',
  'hero.emptyPrompt':
    'Añade un proyecto e importes en ajustes, aquí verás tu ritmo en vivo.',
  'hero.emptyCta': 'Abrir ajustes',
  'hero.noFxHint':
    'Para una sola cifra de ritmo, activa los tipos de cambio API o usa proyectos en una sola divisa.',

  'trajectory.aria': 'Estimación de trayectoria',
  'trajectory.kicker': 'Si mantienes este ritmo',
  'trajectory.disclaimer':
    'Estimación ilustrativa, no una promesa. Supone que tu ingreso real por segundo se mantiene parecido.',
  'trajectory.steadyLead': 'Al ritmo de hoy',
  'trajectory.next12': 'en los próximos ~12 meses',
  'trajectory.fiveYearLead': 'En ~5 años, mismo ritmo:',
  'trajectory.morePaths': 'Otros escenarios (estimación)',
  'trajectory.plus20Lead': 'Si la tarifa crece ~un 20%',
  'trajectory.deltaLead': 'Diferencia anual frente al ritmo de hoy',
  'trajectory.perYearVs': 'por año frente al escenario estable',
  'trajectory.fiveCompare':
    'Escala 5 años: unos {base} frente a unos {plus} con una tarifa ~20% mayor.',
  'trajectory.geekFootnote':
    'En la divisa de tu cuenta; misma lógica de “ritmo real” que el bloque principal.',

  'breakdown.totalEarned': 'Total ganado',
  'breakdown.oneTotalTitle': 'Total (tus divisas → un número)',
  'breakdown.showAllCurrencies': 'Mostrar todas las divisas',
  'breakdown.hideAllCurrencies': 'Solo un total',
  'breakdown.sortHintFx':
    'Cada divisa por separado. Primero contratos activos; dentro del grupo, orden por importe en',
  'breakdown.sortHintFxApi': '(tipo API).',
  'breakdown.sortHintNoFx': 'Sin tipos, orden por código de divisa.',
  'breakdown.sortParagraphFx':
    'Cada divisa por separado. Primero contratos activos; dentro de cada grupo, orden por importe descendente convertido a {ccy} (tipo API).',
  'breakdown.sortParagraphNoFx':
    'Cada divisa por separado. Primero contratos activos; sin FX, dentro de cada grupo el orden es por código de divisa.',
  'breakdown.endedBadge': 'Finalizados',
  'breakdown.inAccount': 'En la cuenta ahora',
  'breakdown.balancePayrollCaption':
    'Saldo en ajustes tras la nómina del {payroll}; acumulación desde todos los proyectos seleccionados desde el {accrualFrom} (medianoche del día siguiente), otras divisas al tipo API actual.',
  'breakdown.noContractsInCcy': 'Sin contratos en',
  'breakdown.allEndedInCcy': 'Todos finalizados',
  'breakdown.noAccrualHint':
    'Sin tipos FX en vivo: el saldo en pantalla se queda en la cifra post-nómina. Carga tipos (o añade un proyecto en la divisa de la cuenta).',
  'breakdown.foreignAccrualFxHint':
    'Ningún contrato está en la divisa de la cuenta; el total sigue creciendo con devengo de otras divisas al tipo API actual (como «Hoy»).',
  'breakdown.allEndedHint':
    'Todos los proyectos en esta divisa han terminado, no hay devengo al saldo.',
  'breakdown.equivTitle': 'Total en divisa de la cuenta',
  'breakdown.equivHint':
    'Una columna en la divisa de la cuenta, todos los proyectos seleccionados convertidos al tipo de abajo.',
  'breakdown.fxBlurb':
    'Cada importe en su divisa se convierte con el tipo API actual a',
  'breakdown.sumBlurb': 'Se suman los importes ya convertidos para comparar en un solo número.',
  'breakdown.howTitle': 'Cómo funciona.',
  'breakdown.howBody':
    'Saldo tras la última nómina; desde medianoche del día siguiente, devengo de todos los proyectos elegidos hasta ahora (otras divisas al tipo en vivo, como el héroe).',
  'breakdown.onlyCcy':
    'Saldo corriente: todos los proyectos elegidos convertidos a {ccy}. Desglose por divisa en “Total ganado”.',
  'breakdown.sortEndedNote':
    '“Finalizados” significa que todos los contratos en esa divisa pasaron su fecha de fin.',
  'breakdown.rateHeading': 'Tipo.',
  'breakdown.sumHeading': 'Suma.',
  'breakdown.allEndedWithCcy': 'Todos finalizados ({ccy})',

  'fx.title': 'Tipo',
  'fx.noForeign':
    'La base API es {balance}; no hay otras divisas entre los proyectos seleccionados, sin cotizaciones aparte.',
  'fx.missing':
    'Sin tipo API desde las divisas del proyecto ({codes}) a la base {base}, la línea combinada del gráfico puede no estar disponible.',
  'fx.footer':
    'Se usa para el total en divisa de cuenta, el Σ/s combinado y la línea rosa del gráfico.',
  'fx.failed':
    'No se cargaron los tipos, fusión a divisa de cuenta y línea del gráfico no disponibles. Saldos sin cambio.',

  'chart.panelTitle': 'Acumulación en el tiempo',
  'chart.graphBadge': 'Gráfico',
  'chart.range1y': '1A',
  'chart.rangeAll': 'Todo el periodo',
  'chart.toolbarAria': 'Rango y vista del gráfico',
  'chart.allCompanies': 'Todas',
  'chart.markerStartAbbr': 'I',
  'chart.markerEndAbbr': 'F',
  'chart.contractStart': 'Inicio del contrato',
  'chart.contractEnd': 'Fin del contrato',
  'chart.markersToggleAria': 'Mostrar u ocultar inicio y fin de contrato en el gráfico',
  'chart.currencyCycleAria': 'Cambiar moneda del gráfico. Actual: {code}',
  'chart.currencyCycleTitle': 'Gráfico en {code}. Clic para cambiar.',
  'chart.currencyCycleDisabledAria': 'Solo hay una moneda en el gráfico',
  'chart.currencyCycleDisabledTitle': 'Añade un proyecto en otra moneda para poder cambiar',
  'chart.advancedShow': 'Detalles del gráfico',
  'chart.advancedHide': 'Vista simple',
  'chart.productAria': 'Crecimiento del ingreso y tendencia',
  'chart.productKicker': 'Cómo vas',
  'chart.productAboveTrend':
    'Vas por delante de una tendencia recta en esta ventana, el impulso te favorece.',
  'chart.productBelowTrend':
    'Frente a una línea recta desde el inicio de la ventana, estás unos {pct}% por debajo.',
  'chart.productNeutralTrend': 'Cerca de una tendencia lineal estable en esta ventana.',
  'chart.productNow': 'Ganado (ahora)',
  'chart.productTrendEnd': 'Tendencia (ajuste)',
  'chart.productGapTrend': 'Brecha vs tendencia',
  'chart.productYou': 'Tú',
  'chart.productTrend': 'Tendencia',
  'chart.productNeedRates':
    'Activa los tipos API en ajustes (o usa proyectos en una divisa) para ver una línea de ingreso combinada.',
  'chart.productDisclaimer':
    'Tendencia = ajuste lineal sobre ingresos por contrato en esta ventana. Ilustrativo, no un pronóstico.',
  'chart.productTrajectoryLead': 'Perspectiva de tarifa (~12 meses)',
  'chart.productSteady12': 'Ritmo estable',
  'chart.productPlus20': 'Si la tarifa +20%',
  'chart.productPerYearHint': '/ año vs estable',
  'chart.ctaGrow': 'Haz crecer tus ingresos',

  'footer.perSec': '/ s',
  'footer.sigmaPerSec': 'Σ ≈ +',
  'footer.inCcy': 'en',
  'footer.byRate': '(tipo API)',

  'awareness.title': 'Money Awareness Engine',
  'awareness.sub': 'Mi ritmo (compartir)',
  'awareness.ladder': 'Por encima del ~{pct}% en una escala demo en EUR',
  'awareness.ladderNote':
    'Estilo viral: “gano más que ~{pct}%” en esta escala demo, no es una encuesta real.',
  'awareness.ladderModel':
    'Modelo: anclas ~20–150k €/año → €/s. No es asesoramiento financiero.',
  'awareness.needFx':
    'Carga tipos para la misma comparación demo en escala EUR (contexto, no presumir).',
  'awareness.share': 'Compartir',
  'awareness.copied': 'Copiado al portapapeles',
  'awareness.copyFail': 'No se pudo copiar',
  'awareness.clipboardErr': 'Error al copiar',
  'awareness.copyCurrent': 'Copiar texto para compartir',

  'dates.start': 'Inicio:',
  'dates.end': 'Fin:',
  'dates.projectClosed': 'Proyecto terminado, el total del periodo es definitivo',

  'profile.phone': 'Tel.:',

  'settings.projectsTitle': 'Proyectos',
  'settings.projectsSubtitle': 'Tarifas de contrato y opciones',
  'settings.balanceLabel': 'Saldo tras la última nómina (en esa fecha)',
  'settings.payrollDate': 'Fecha de la última nómina',
  'settings.payrollHint':
    'Introduce el saldo justo después de ese pago. Desde medianoche del día siguiente, el devengo se suma en la pantalla principal.',
  'settings.accountCcy': 'Divisa de la cuenta',
  'settings.takeHome': 'Parte neta tras impuestos (estimación)',
  'settings.takeHomeAria': 'Porcentaje neto tras impuestos',
  'settings.takeHomeHint':
    'Se cuenta un {pct}% del contrato para el bloque de “ritmo real” en la pantalla principal. Estimación, no contabilidad.',
  'settings.balanceFooter':
    '“Total ganado” suma los proyectos seleccionados. Saldo aparte: base tras nómina más devengo de todos ellos; divisas extranjeras con tipo API en vivo (como el contador principal).',
  'settings.projectsPicker': 'Proyectos',
  'settings.projectsPickerHint':
    'Marcado = entra en totales del panel (varios permitidos). Clic en el nombre para editar abajo.',
  'settings.showOnDashboard': 'Mostrar en la pantalla principal',
  'settings.editProject': 'Editar este proyecto',
  'settings.contractEnded': 'Finalizado',
  'settings.endedBadgeTitle': 'La fecha de fin ya pasó, el devengo de este contrato se detuvo.',
  'settings.projectName': 'Nombre del proyecto',
  'settings.projectCcy': 'Divisa del proyecto',
  'settings.workStart': 'Fecha de inicio del trabajo',
  'settings.workStartHint':
    'Tiempo de calendario desde esta medianoche (incl. años pasados) por tu tarifa (mensual, por hora o contrato hasta fin). Los rangos de vacaciones de abajo se excluyen.',
  'settings.workEnd': 'Fecha de fin del proyecto',
  'settings.workEndHint':
    'Para facturación “contrato completo”, la duración va entre fechas (menos vacaciones). Para mensual/por hora, la fecha fin solo limita el devengo. Vacío = sin fin fijo.',
  'settings.vacations': 'Vacaciones (pasadas y planificadas)',
  'settings.vacationsHint':
    'Elige rangos; esos días de calendario no cuentan en el tiempo desde el inicio (fines inclusivos).',
  'settings.vacationN': 'Vacaciones {n}',
  'settings.removeVacation': 'Quitar vacaciones',
  'settings.vacationFrom': 'Desde',
  'settings.vacationTo': 'Hasta',
  'settings.addVacation': 'Añadir vacaciones',
  'settings.billingType': 'Tipo de facturación',
  'settings.billing.monthly': 'Pago mensual',
  'settings.billing.hourly': 'Tarifa por hora',
  'settings.billing.contract': 'Importe total del contrato',
  'settings.billingHelp.monthly':
    'Como salario: importe mensual repartido en 22×8 h laborables; devenga cada segundo de calendario desde el inicio.',
  'settings.billingHelp.hourly':
    'Tarifa por hora; por segundo = importe / 3600. Para facturación por horas.',
  'settings.billingHelp.contract':
    'Contrato completo; tarifa = importe / lapso de calendario entre inicio y fin (menos vacaciones). Al final coincide con el contrato.',
  'settings.amount.monthly': 'Pago mensual',
  'settings.amount.hourly': 'Tarifa por hora',
  'settings.amount.contract': 'Importe total del contrato',
  'settings.suffix.perMonth': ' / mes',
  'settings.suffix.perHour': ' / h',
  'settings.dataTitle': 'Datos',
  'settings.dataHint':
    'Guardado automático en este navegador (localStorage). Un JSON es copia de seguridad o traslado a otro dispositivo.',
  'settings.storageRiskTitle': 'Solo en este navegador',
  'settings.storageRiskBody':
    'Borrar datos del sitio, otro perfil u otro dispositivo puede borrarlo. Descarga o copia JSON de vez en cuando, sin cuenta.',
  'settings.downloadJson': 'Descargar JSON',
  'settings.copyJson': 'Copiar JSON',
  'settings.copyJsonOk': 'JSON copiado, guárdalo en un sitio seguro',
  'settings.copyJsonFail': 'No se pudo copiar',
  'settings.uploadJson': 'Subir JSON',

  'backupBanner.title': 'Haz una copia',
  'backupBanner.body':
    'Tu configuración solo está en este navegador. En Ajustes → Datos puedes descargar o copiar JSON.',
  'backupBanner.openSettings': 'Ir a opciones de copia',
  'backupBanner.later': 'Recordar más tarde',

  'profile.title': 'Perfil (desde JSON)',
  'profile.storedHint':
    'Guardado con los ajustes; incluido en “Descargar JSON”. Edita el archivo fuente e importa de nuevo.',
  'profile.remove': 'Quitar del guardado',
  'profile.version': 'Versión del perfil:',
  'profile.location': 'Ubicación:',
  'profile.format': 'Formato:',
  'profile.topSkills': 'Top skills:',

  'import.badFile':
    'Archivo no válido. Se necesita JSON de exportación MoneyClock: v: 1 y bloques mode, projectsBundle, etc.',

  'chart.empty':
    'Indica una fecha de inicio del proyecto, aparecerá el gráfico de ingreso acumulado.',
  'chart.ariaMain': 'Ingreso acumulado, saldo de cuenta y divisas',
  'chart.heading': 'Proyectos y cuenta',
  'chart.yHover': 'Y: línea bajo el cursor',
  'chart.yFirst': 'Y: primero en la lista',
  'chart.fromStart': 'desde el inicio más temprano',
  'chart.now': 'ahora',
  'chart.indexSuffix': 'índ.',
  'chart.legend.fxHistory': 'Historial de tipos:',
  'chart.legend.fxBlurb':
    '. Índice relativo medio (100% = tipo al inicio del gráfico).',
  'chart.legend.inf': 'Inflación (IPC, % anual):',
  'chart.legend.infBlurb':
    ', FP.CPI.TOTL.ZG. Línea = índice medio del nivel de precios para economías de las divisas elegidas (100 = 1 ene del año de inicio del gráfico); divisa ≠ país, mapeo estático.',

  'chart.series.others': 'otros',
  'chart.series.projects': 'proyectos',
  'chart.series.account': 'cuenta',
  'chart.series.allFx': 'todos los proyectos (FX)',
  'chart.defaultProject': 'Proyecto',
  'chart.ariaPanel': 'Gráfico de ingresos',
  'chart.unfocus': 'Quitar selección: {name}',
  'chart.focusLine': 'Mostrar en gráfico: {name}',
  'chart.addProject': 'Añadir proyecto',

  'common.projectFallback': 'proyecto'
};
