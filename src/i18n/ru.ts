/** Русская локаль */
export const ru: Record<string, string> = {
  'lang.en': 'EN',
  'lang.ru': 'RU',
  'lang.es': 'ES',
  'lang.fr': 'FR',
  'lang.de': 'DE',
  'lang.zh': 'ZH',
  'lang.ja': 'JA',
  'lang.pt': 'PT',
  'lang.selectAria': 'Язык интерфейса',

  'theme.lightAria': 'Светлая тема',
  'theme.darkAria': 'Тёмная тема',
  'settings.aria': 'Открыть настройки',
  'settings.title': 'Настройки',
  'settings.close': 'Закрыть',

  'hero.aria': 'Темп начисления',
  'hero.now': 'Сейчас',
  'hero.tagline': 'Ваша скорость дохода',
  'hero.perSecondLife': 'Ваша скорость дохода',
  'hero.perSec': '/ сек',
  'hero.nominalApprox': 'номинал ≈',
  'hero.perHour': '/час',
  'hero.heroEarningsPerSecond': 'в секунду',
  'hero.heroEarningsHour': '/ час',
  'hero.heroEarningsLive': 'Онлайн',
  'hero.realHint': '· реально',
  'hero.today': 'Сегодня',
  'hero.dayMeterAria': 'Прогресс дня до полуночи',
  'hero.dayMeterTitle': 'Прогресс за сегодня',
  'hero.dayWindowEndMidnight': '24:00',
  'hero.dayLeftLabel': 'Осталось',
  'hero.lastHourLabel': 'За час',
  'hero.remainingLabel': 'Осталось',
  'hero.dayProgressTrendFaster':
    'Сегодня вы зарабатываете быстрее, чем вчера',
  'hero.moreNominal': 'Номинал (до корректировок)',
  'hero.insightTitle': 'После налогов и инфляции',
  'hero.insightAria': 'Реальная покупательная способность',
  'hero.futureAria': 'Прогноз на год',
  'hero.btnHideDetails': 'Скрыть детали',
  'hero.btnShowDetails': 'Валюты, счёт, курсы',
  'hero.btnEditProjects': 'Настроить проекты',
  'hero.ctaGrow': 'Увеличить доход',
  'hero.btnBreakdown': 'По валютам и счёту',
  'hero.btnTrajectory': 'Траектория (оценка)',
  'hero.btnChart': 'Динамика дохода',
  'hero.btnBackCompact': 'К сводке',
  'hero.btnBackBreakdown': 'К разбивке',
  'hero.btnBackTrajectory': 'К траектории',
  'hero.btnHideChart': 'Скрыть график',
  'hero.emptyPrompt':
    'Добавьте проект и сумму в настройках, здесь появится темп в реальном времени.',
  'hero.emptyCta': 'Настройки, зелёная кнопка вверху справа.',
  'hero.noFxHint':
    'Для одной строки темпа включите курсы API или выберите проекты в одной валюте.',

  'magic.projectionsTitle': 'Прогноз',
  'magic.projTonight': 'К вечеру',
  'magic.projTonightDesc': 'Потолок дня при текущем темпе',
  'magic.projMonth': 'Этот месяц',
  'magic.projMonthDesc': '~1/12 годового «на руки» (оценка)',
  'magic.proj5y': 'За 5 лет',
  'magic.proj5yDesc': 'При текущем темпе (траектория)',
  'magic.insightsTitle': 'Инсайты',
  'magic.insight1': 'Начисление каждую секунду по выбранным проектам.',
  'magic.insight2': 'Ниже блок «Траектория» — сценарий +20% и горизонты.',
  'magic.insight3': 'Курсы и инфляция — те же источники, что у героя.',

  'trajectory.aria': 'Оценка траектории',
  'trajectory.kicker': 'Если сохранить этот темп',
  'trajectory.disclaimer':
    'Иллюстративная оценка, не обещание. Предполагается, что реальная ставка дохода останется примерно такой же.',
  'trajectory.steadyLead': 'При сегодняшнем темпе',
  'trajectory.next12': 'за ~12 месяцев',
  'trajectory.fiveYearLead': 'За ~5 лет при том же темпе:',
  'trajectory.morePaths': 'Другие сценарии (оценка)',
  'trajectory.plus20Lead': 'Если доход (ставка в приложении) вырастет ~на 20%',
  'trajectory.deltaLead': 'Разница в год к «как сейчас»',
  'trajectory.perYearVs': 'в год к стабильному сценарию',
  'trajectory.fiveCompare':
    'Масштаб 5 лет: порядка {base} против порядка {plus} при ставке выше на ~20%.',
  'trajectory.geekFootnote':
    'В валюте счёта; та же логика «реальной ставки», что в блоке на главном экране.',

  'breakdown.totalEarned': 'Всего заработано',
  'breakdown.oneTotalTitle': 'Итого (все валюты → одна сумма)',
  'breakdown.showAllCurrencies': 'Показать все валюты',
  'breakdown.hideAllCurrencies': 'Только один итог',
  'breakdown.endedBadge': 'Завершены',
  'breakdown.inAccount': 'Сколько сейчас на счёте',
  'breakdown.balanceEchoHint':
    'Тот же итог, что наверху, живое начисление в валюте счёта.',
  'breakdown.noContractsInCcy': 'Нет контрактов в',
  'breakdown.allEndedInCcy': 'Все завершены',
  'breakdown.noAccrualHint':
    'Нет живых курсов FX: на экране остаётся только сумма после зарплаты. Загрузите курсы (или добавьте проект в валюте счёта), чтобы доначисление учитывало контракты в других валютах.',
  'breakdown.foreignAccrualFxHint':
    'Ни один контракт не в валюте счёта; итог всё равно растёт за счёт доначисления по другим валютам по текущему курсу API (как у блока «Сегодня»).',
  'breakdown.allEndedHint':
    'Срок по всем проектам в этой валюте уже прошёл, доначисление по ним к остатку не идёт.',
  'breakdown.equivTitle': 'Всего в валюте счёта',
  'breakdown.equivOneLiner':
    'Проекты пересчитаны в {ccy} по курсу на дату последней выплаты (история курсов), при нехватке данных — по текущему API, и суммированы.',
  'breakdown.equivHint':
    'Один столбец в валюте счёта: пересчёт по курсу на дату последней выплаты из истории (как на графике по датам), иначе по курсу из блока «Курс» ниже.',
  'breakdown.accrualTileTitle': 'Начисление на счёт',
  'breakdown.takeHomeTileHint': 'Доля на руки после налогов, в настройках.',
  'breakdown.fxBlurb':
    'Каждая сумма в своей валюте пересчитывается по текущим котировкам API в',
  'breakdown.sumBlurb':
    'Складываются уже пересчитанные величины, так можно сравнить вклад разных валют в одной цифре.',
  'breakdown.howTitle': 'Как считается.',
  'breakdown.howBody':
    'Сумма после последней зарплаты; с полуночи следующего дня — доначисление по всем выбранным проектам до сейчас (другие валюты по текущему курсу, как у героя).',
  'breakdown.onlyCcy':
    'Текущий остаток учитывает все выбранные проекты после пересчёта в {ccy}. Разбивку по валютам — в «Всего заработано».',
  'breakdown.sortEndedNote':
    '«Завершены», все контракты в этой валюте уже по сроку закрыты.',
  'breakdown.rateHeading': 'Курс.',
  'breakdown.sumHeading': 'Сумма.',
  'breakdown.allEndedWithCcy': 'Все завершены ({ccy})',

  'fx.title': 'Курс',
  'fx.noForeign':
    'База API, {balance}; среди выбранных проектов нет других валют, отдельные котировки не показываем.',
  'fx.missing':
    'Для валют проектов ({codes}) в ответе API нет курса к базе {base}, пересчёт и линия на графике могут быть недоступны.',
  'fx.footer':
    'Нужно для итога в валюте счёта (клетка сетки), Σ / sec и линии на графике.',
  'fx.failed':
    'Курсы не загрузились, пересчёт в валюту счёта и линия на графике недоступны. Остаток и суммы по валютам без изменений.',

  'chart.panelTitle': 'Динамика накоплений',
  'chart.graphBadge': 'График',
  'chart.range1y': '1 год',
  'chart.rangeAll': 'Всё время',
  'chart.toolbarAria': 'Диапазон и вид графика',
  'chart.allCompanies': 'Все',
  'chart.markerStartAbbr': 'Н',
  'chart.markerEndAbbr': 'К',
  'chart.contractStart': 'Старт контракта',
  'chart.contractEnd': 'Окончание контракта',
  'chart.markersToggleAria': 'Показать или скрыть даты входа и выхода по контрактам на графике',
  'chart.monthlyRatesToggleAria':
    'Показать или скрыть линии номинальной месячной ставки по проектам (пересчёт в валюту счёта по курсу во времени)',
  'chart.monthlyRatesToggleTitle':
    'Пунктир: как номинальная месячная сумма каждого проекта пересчитывается в валюту графика по ходу времени (Frankfurter). Справа — шкала этих значений.',
  'chart.monthlyRatesTipMonth': '{month}',
  'chart.monthlyRatesTipLine': '{name}: {amount}',
  'chart.monthlyRatesTipSum': 'Сумма (пересчёт): {amount}',
  'chart.monthlyRateLineLabel': '{name} · номинал в мес. (курс)',
  'chart.monthlyRateUnit': '/мес',
  'chart.monthlyAxisShort': 'Мес. (курс)',
  'chart.currencyCycleAria': 'Сменить валюту графика. Сейчас: {code}',
  'chart.currencyCycleTitle': 'График в {code}. Нажмите для переключения.',
  'chart.currencyCycleDisabledAria': 'На графике одна валюта — переключать нечего',
  'chart.currencyCycleDisabledTitle': 'Добавьте проект в другой валюте, чтобы включить переключение',
  'chart.advancedShow': 'Детали графика',
  'chart.advancedHide': 'Простой вид',
  'chart.productAria': 'Рост дохода и тренд',
  'chart.productKicker': 'Как идёте',
  'chart.productAboveTrend':
    'Вы опережаете прямолинейный тренд в этом окне, накопления растут сильнее «ровной» линии.',
  'chart.productBelowTrend':
    'Относительно прямой линии от начала окна вы примерно на {pct}% ниже.',
  'chart.productNeutralTrend': 'Близко к ровному линейному тренду в этом окне.',
  'chart.productNow': 'Накоплено (сейчас)',
  'chart.productTrendEnd': 'Тренд (аппрокс.)',
  'chart.productGapTrend': 'Разрыв к тренду',
  'chart.productYou': 'Вы',
  'chart.productTrend': 'Тренд',
  'chart.productNeedRates':
    'Включите курсы API в настройках или оставьте проекты в одной валюте, тогда будет одна суммарная линия дохода.',
  'chart.productDisclaimer':
    'Тренд, линейная аппроксимация по накоплениям по контрактам в этом окне. Иллюстрация, не прогноз.',
  'chart.productTrajectoryLead': 'Сценарий по ставке (~12 мес.)',
  'chart.productSteady12': 'Стабильный темп',
  'chart.productPlus20': 'Если доход на 20% выше',
  'chart.productPerYearHint': 'доп. в год к «как сейчас»',
  'chart.ctaGrow': 'Увеличить доход',

  'footer.perSec': '/ sec',
  'footer.sigmaPerSec': 'Σ ≈ +',
  'footer.inCcy': 'в',
  'footer.byRate': '(по курсу)',
  'footer.liveRates': 'Курсы live',
  'footer.engineBrand': 'Money awareness engine',
  'footer.appTagline': 'Money Clock · Live',

  'dashboard.momentumTitle': 'Анализ темпа',
  'dashboard.momentumTeaser': 'Темп на вашей стороне',
  'dashboard.momentumColDelta': 'При +20% к доходу',
  'dashboard.estimate12m': 'Оценка на 12 мес.',

  'awareness.title': 'Money Awareness Engine',
  'awareness.sub': 'Мой темп (шэринг)',
  'awareness.ladder': 'Выше ~{pct}% на условной EUR-лестнице',
  'awareness.ladderNote':
    'На языке «вирусного» сравнения: roughly "I earn more than ~{pct}%" of this demo ladder, не реальный опрос людей.',
  'awareness.ladderModel':
    'Модель: грубые якоря ~20–150k €/год → ставка/сек. Не финансовая рекомендация.',
  'awareness.needFx':
    'Загрузите курсы, появится демо-сравнение с той же EUR-шкалой (для контекста, не для хвастовства).',
  'awareness.share': 'Поделиться',
  'awareness.copied': 'Скопировано в буфер обмена',
  'awareness.copyFail': 'Не удалось скопировать',
  'awareness.clipboardErr': 'Ошибка копирования',
  'awareness.copyCurrent': 'Копировать текст для шаринга',

  'dates.start': 'Начало:',
  'dates.end': 'Окончание:',
  'dates.projectClosed': 'Проект завершён, итог за период зафиксирован',

  'profile.phone': 'Тел.:',

  'settings.projectsTitle': 'Проекты',
  'settings.projectsSubtitle': 'Настройки и ставки по контрактам',
  'settings.balanceLabel': 'Остаток после последней зарплаты (на её дату)',
  'settings.payrollDate': 'Дата последней зарплаты',
  'settings.payrollHint':
    'Введите сумму, которая была на счёте после этой выплаты. К остатку на главном экране каждую секунду прибавляется ставка × время с полуночи следующего дня после этой даты.',
  'settings.accountCcy': 'Валюта счёта',
  'settings.takeHome': 'Доля на руки после налогов (оценка)',
  'settings.takeHomeAria': 'Доля на руки после налогов в процентах',
  'settings.takeHomeHint':
    '{pct}% контрактной суммы, для блока «реальная ставка» на главном экране. Оценка, не бухучёт.',
  'settings.workdayWindow': 'Рабочее окно',
  'settings.workdayWindowHint':
    'Локальное начало и конец интервала для «Сегодня» и прогресса дня на дашборде. Сохраняется с данными.',
  'settings.workdayStartHour': 'С',
  'settings.workdayEndHour': 'До',
  'settings.workdayEndMidnight': '24:00 (полночь)',
  'settings.balanceFooter':
    '«Всего заработано» — сумма по выбранным проектам. Остаток на счёте отдельно: база после зарплаты плюс доначисление по всем выбранным проектам; суммы в других валютах пересчитываются по текущему курсу API (как главный счётчик).',
  'settings.projectsPicker': 'Проекты',
  'settings.projectsPickerHint':
    'Галочка, проект входит в общую сумму и виджет на главном экране (можно несколько). Имя, какой проект редактируется ниже.',
  'settings.showOnDashboard': 'Показать на главном экране',
  'settings.editProject': 'Редактировать поля этого проекта',
  'settings.contractEnded': 'Завершён',
  'settings.endedBadgeTitle':
    'Дата окончания проекта уже прошла, начисление по сроку остановлено',
  'settings.projectName': 'Имя проекта',
  'settings.projectCcy': 'Валюта проекта',
  'settings.workStart': 'Дата начала работы',
  'settings.workStartHint':
    'От полуночи этого дня считается прошедшее календарное время (в т.ч. за годы); оно умножается на ставку проекта (месячный платёж, почасовая или сумма контракта за срок до даты окончания). Время в отпусках ниже из интервала вычитается.',
  'settings.workEnd': 'Дата окончания проекта',
  'settings.workEndHint':
    'Для типа «вся сумма контракта» срок = интервал между датами (минус отпуск), ставка = сумма / этот срок. Для месячного и почасового типа дата конца только ограничивает период начисления. Пустое окончание, бесконечный срок (до смены даты). Старые сохранения без типа оплаты считаются режимом «контракт целиком».',
  'settings.vacations': 'Отпуска (прошлые и запланированные)',
  'settings.vacationsHint':
    'Укажите периоды календарём: эти дни не идут в расчёт времени от даты начала работы (концы дней включительно).',
  'settings.vacationN': 'Отпуск {n}',
  'settings.removeVacation': 'Удалить отпуск',
  'settings.vacationFrom': 'С даты',
  'settings.vacationTo': 'По дату',
  'settings.addVacation': 'Добавить отпуск',
  'settings.billingType': 'Тип оплаты',
  'settings.billing.monthly': 'Месячный платёж',
  'settings.billing.hourly': 'Почасовая ставка',
  'settings.billing.contract': 'Вся сумма контракта',
  'settings.billingHelp.monthly':
    'Как зарплата: сумма в месяц делится на 22×8 рабочих часов, начисление идёт за каждую секунду календарного времени от даты начала.',
  'settings.billingHelp.hourly': 'Ставка за один час; в секунду = сумма / 3600.',
  'settings.billingHelp.contract':
    'Общая сумма договора; ставка = она делится на календарный срок между датой начала и окончания (минус отпуск). К концу срока начисление сходится к этой сумме.',
  'settings.amount.monthly': 'Месячный платёж',
  'settings.amount.hourly': 'Ставка за час',
  'settings.amount.contract': 'Сумма контракта целиком',
  'settings.suffix.perMonth': ' / мес',
  'settings.suffix.perHour': ' / ч',
  'settings.dataTitle': 'Сохранение данных',
  'settings.dataHint':
    'Автоматически в этом браузере (localStorage). Файл или копия JSON, резервная копия и перенос на другой компьютер.',
  'settings.storageRiskTitle': 'Только в этом браузере',
  'settings.storageRiskBody':
    'Очистка данных сайта, другой профиль или другой компьютер могут всё стереть. Иногда скачайте или скопируйте JSON, без регистрации.',
  'settings.downloadJson': 'Скачать JSON',
  'settings.copyJson': 'Копировать JSON',
  'settings.copyJsonOk': 'JSON скопирован, сохраните в надёжном месте',
  'settings.copyJsonFail': 'Не удалось скопировать',
  'settings.uploadJson': 'Загрузить JSON',
  'settings.saveCloud': 'Сохранить в облаке',
  'settings.cloudSavedTitle': 'Ваш профиль сохранён',
  'settings.cloudLinkLabel': 'Ваша ссылка',
  'settings.cloudSaveHint':
    'Сохраните её, это magic link. У кого есть ссылка, тот может открыть эту копию. Без регистрации.',
  'settings.cloudCopyLink': 'Копировать ссылку',
  'settings.cloudCopied': 'Ссылка скопирована',
  'settings.cloudClose': 'Закрыть',
  'settings.cloudBusy': 'Сохранение…',
  'settings.cloudErr':
    'Не удалось сохранить в облако. Нужен деплой на Cloudflare Pages с KV (см. wrangler.toml).',
  'settings.cloudRestoreFail': 'Ссылка недействительна или данные не найдены.',
  'settings.cloudRestoreOk':
    'Данные загружены по ссылке из облака. Адрес /u/… остаётся в строке, это закладка на эту копию.',
  'settings.cloudProfileLinkTitle': 'Ссылка на профиль в облаке',
  'settings.cloudProfileLinkHint':
    'Последняя magic link в этом браузере. Если данные не менялись, «Сохранить в облаке» отдаёт ту же ссылку (без дубликата в KV).',
  'settings.cloudProfileCopy': 'Копировать ссылку',

  'backupBanner.title': 'Резервная копия',
  'backupBanner.body':
    'Данные хранятся только в этом браузере. В настройках → блок «Сохранение» можно скачать или скопировать JSON.',
  'backupBanner.openSettings': 'К вариантам сохранения',
  'backupBanner.later': 'Напомнить позже',

  'profile.title': 'Профиль (из JSON)',
  'profile.storedHint':
    'Хранится вместе с настройками; попадает в «Скачать JSON». Редактируйте исходный файл и импортируйте снова.',
  'profile.remove': 'Убрать из сохранения',
  'profile.version': 'Версия профиля:',
  'profile.location': 'Локация:',
  'profile.format': 'Формат:',
  'profile.topSkills': 'Top skills:',

  'import.badFile':
    'Файл не подходит. Нужен JSON экспорта MoneyClock: поле v: 1 и блоки mode, projectsBundle и т.д. Файл profile-artem-miherea.json уже совмещён: приложение + вложенный profile.',

  'chart.empty':
    'Укажите дату начала у проекта, появится график накопленного дохода.',
  'chart.ariaMain': 'График накопленного дохода по проектам и остатка на счёте',
  'chart.heading': 'Проекты и счёт',
  'chart.yHover': 'Y: линия под курсором',
  'chart.yFirst': 'Y: первая в списке',
  'chart.fromStart': 'с начала (раньше всех)',
  'chart.now': 'сейчас',
  'chart.indexSuffix': 'инд.',
  'chart.legend.fxHistory': 'История курсов:',
  'chart.legend.fxBlurb':
    '. Средний относительный индекс (100% = курс на дату начала графика).',
  'chart.legend.inf': 'Инфляция (CPI, годовая %):',
  'chart.legend.infBlurb':
    ', индикатор FP.CPI.TOTL.ZG. Линия, средний накопленный индекс уровня цен по экономикам выбранных валют (100 = 1 янв. года старта графика); валюта ≠ страна, используется статический маппинг.',

  'chart.insightsTitle': 'На этом отрезке заметно',
  'chart.insightHover':
    'Рядом с этой датой — выделенный скачок по индексу курса или инфляции (см. ниже).',
  'chart.insight.fxPeak':
    'Индекс курсов (средний) доходит до ~{pct}% около {date} (100% = курс на начало графика).',
  'chart.insight.fxTrough': 'Индекс курсов опускается до ~{pct}% около {date}.',
  'chart.insight.fxJump':
    'Самый крупный шаг индекса курсов на этом графике: ~{delta} п.п. около {date}.',
  'chart.insight.infPeak':
    'Индекс уровня цен (инфляция) максимума ~{idx} около {date}.',
  'chart.insight.infJump':
    'Самый крупный шаг индекса инфляции на этом графике: ~{delta} около {date}.',

  'chart.series.others': 'остальные',
  'chart.series.projects': 'проекты',
  'chart.series.account': 'счёт',
  'chart.series.allFx': 'все проекты (курс)',
  'chart.defaultProject': 'Проект',
  'chart.ariaPanel': 'График дохода',
  'chart.unfocus': 'Снять выделение: {name}',
  'chart.focusLine': 'Показать на графике: {name}',
  'chart.addProject': 'Добавить проект',

  'common.projectFallback': 'проект'
};
