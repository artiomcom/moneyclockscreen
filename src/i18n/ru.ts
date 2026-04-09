/** Русская локаль */
export const ru: Record<string, string> = {
  'lang.en': 'EN',
  'lang.ru': 'RU',

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
  'hero.realHint': '· реально',
  'hero.today': 'Сегодня',
  'hero.todayNote': 'с полуночи · локальное время',
  'hero.moreNumbers': 'Ещё цифры',
  'hero.moreNominal': 'Номинал (до корректировок)',
  'hero.insightTitle': 'После налогов и инфляции',
  'hero.insightAria': 'Реальная покупательная способность',
  'hero.futureTitle': 'За 12 месяцев (оценка)',
  'hero.futureAria': 'Прогноз на год',
  'hero.futureIfPlus20': 'при +20% к ставке',
  'hero.btnHideDetails': 'Скрыть детали',
  'hero.btnShowDetails': 'Валюты, счёт, курсы',
  'hero.btnEditProjects': 'Настроить проекты',
  'hero.ctaGrow': 'Увеличить доход',
  'hero.btnBreakdown': 'По валютам и счёту',
  'hero.btnChart': 'Динамика дохода',
  'hero.btnBackCompact': 'К сводке',
  'hero.btnHideChart': 'Скрыть график',
  'hero.emptyPrompt':
    'Добавьте проект и сумму в настройках — здесь появится темп в реальном времени.',
  'hero.emptyCta': 'Открыть настройки',
  'hero.noFxHint':
    'Для одной строки темпа включите курсы API или выберите проекты в одной валюте.',

  'breakdown.totalEarned': 'Всего заработано',
  'breakdown.oneTotalTitle': 'Итого (все валюты → одна сумма)',
  'breakdown.showAllCurrencies': 'Показать все валюты',
  'breakdown.hideAllCurrencies': 'Только один итог',
  'breakdown.sortHintFx':
    'Каждая валюта отдельно. Сначала — валюты с действующими контрактами; внутри группы порядок по убыванию суммы в пересчёте на',
  'breakdown.sortHintFxApi': '(курс API).',
  'breakdown.sortHintNoFx': 'Без курса внутри группы — по коду валюты.',
  'breakdown.sortParagraphFx':
    'Каждая валюта отдельно. Сначала — валюты с действующими контрактами; внутри группы порядок по убыванию суммы в пересчёте на {ccy} (курс API).',
  'breakdown.sortParagraphNoFx':
    'Каждая валюта отдельно. Сначала — валюты с действующими контрактами; без курса внутри группы — по коду валюты.',
  'breakdown.endedBadge': 'Завершены',
  'breakdown.inAccount': 'На счёте сейчас',
  'breakdown.noContractsInCcy': 'Нет контрактов в',
  'breakdown.allEndedInCcy': 'Все завершены',
  'breakdown.noAccrualHint':
    'К остатку не капают проекты — в валюте счёта нет выбранных контрактов, только сумма после зарплаты.',
  'breakdown.allEndedHint':
    'Срок по всем проектам в этой валюте уже прошёл — доначисление по ним к остатку не идёт.',
  'breakdown.equivTitle': 'Всего в валюте счёта',
  'breakdown.equivHint':
    'Один столбец в валюте счёта — все выбранные проекты приведены к ней по курсу из блока «Курс» ниже.',
  'breakdown.fxBlurb':
    'Каждая сумма в своей валюте пересчитывается по текущим котировкам API в',
  'breakdown.sumBlurb':
    'Складываются уже пересчитанные величины — так можно сравнить вклад разных валют в одной цифре.',
  'breakdown.howTitle': 'Как считается.',
  'breakdown.howBody':
    'Берётся сумма после даты последней зарплаты; с полуночи следующего дня после этой даты добавляется доначисление до текущего момента.',
  'breakdown.onlyCcy':
    'В эту цифру входят только проекты в валюте {ccy}. Остальные валюты смотрите в блоке «Всего заработано».',
  'breakdown.sortEndedNote':
    '«Завершены» — все контракты в этой валюте уже по сроку закрыты.',
  'breakdown.rateHeading': 'Курс.',
  'breakdown.sumHeading': 'Сумма.',
  'breakdown.allEndedWithCcy': 'Все завершены ({ccy})',

  'fx.title': 'Курс',
  'fx.noForeign':
    'База API — {balance}; среди выбранных проектов нет других валют, отдельные котировки не показываем.',
  'fx.missing':
    'Для валют проектов ({codes}) в ответе API нет курса к базе {base} — пересчёт и линия на графике могут быть недоступны.',
  'fx.footer':
    'Используется для блока «Всего в валюте счёта», ставки Σ / sec и розовой линии на графике.',
  'fx.failed':
    'Курсы не загрузились — пересчёт в валюту счёта и линия на графике недоступны. Остаток и суммы по валютам без изменений.',

  'chart.panelTitle': 'Динамика накоплений',
  'chart.expand': 'Развернуть график',
  'chart.collapse': 'Компактный вид',
  'chart.expandAria': 'Развернуть график — полная легенда и подписи осей',
  'chart.collapseAria': 'Компактный график — меньше высота и подписей',
  'chart.panelHint':
    'Клик по проекту — одна линия; ещё раз — все снова.',
  'chart.panelHintCompact':
    'Нажмите на график для значений · развернуть — полная легенда',
  'chart.projects': 'Проекты',
  'chart.graphBadge': 'График',
  'chart.all': 'Все',

  'footer.perSec': '/ sec',
  'footer.sigmaPerSec': 'Σ ≈ +',
  'footer.inCcy': 'в',
  'footer.byRate': '(по курсу)',

  'awareness.title': 'Money Awareness Engine',
  'awareness.sub': 'Мой темп (шэринг)',
  'awareness.ladder': 'Выше ~{pct}% на условной EUR-лестнице',
  'awareness.ladderNote':
    'На языке «вирусного» сравнения: roughly "I earn more than ~{pct}%" of this demo ladder — не реальный опрос людей.',
  'awareness.ladderModel':
    'Модель: грубые якоря ~20–150k €/год → ставка/сек. Не финансовая рекомендация.',
  'awareness.needFx':
    'Загрузите курсы — появится демо-сравнение с той же EUR-шкалой (для контекста, не для хвастовства).',
  'awareness.share': 'Поделиться',
  'awareness.copied': 'Скопировано в буфер обмена',
  'awareness.copyFail': 'Не удалось скопировать',
  'awareness.clipboardEn': 'Английский — в буфере',
  'awareness.clipboardRu': 'Русский — в буфере',
  'awareness.clipboardErr': 'Ошибка копирования',

  'dates.start': 'Начало:',
  'dates.end': 'Окончание:',
  'dates.projectClosed': 'Проект завершён — итог за период зафиксирован',

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
    '{pct}% контрактной суммы — для блока «реальная ставка» на главном экране. Оценка, не бухучёт.',
  'settings.balanceFooter':
    'Счётчик «всего заработано» — сумма по выбранным проектам. Остаток на счёте — отдельно: база после зарплаты плюс доначисление с даты (см. выше). К остатку идут только проекты в валюте счёта; остальные валюты — в блоке «всего заработано».',
  'settings.projectsPicker': 'Проекты',
  'settings.projectsPickerHint':
    'Галочка — проект входит в общую сумму и виджет на главном экране (можно несколько). Имя — какой проект редактируется ниже.',
  'settings.showOnDashboard': 'Показать на главном экране',
  'settings.editProject': 'Редактировать поля этого проекта',
  'settings.contractEnded': 'Завершён',
  'settings.endedBadgeTitle':
    'Дата окончания проекта уже прошла — начисление по сроку остановлено',
  'settings.projectName': 'Имя проекта',
  'settings.projectCcy': 'Валюта проекта',
  'settings.workStart': 'Дата начала работы',
  'settings.workStartHint':
    'От полуночи этого дня считается прошедшее календарное время (в т.ч. за годы); оно умножается на ставку проекта (месячный платёж, почасовая или сумма контракта за срок до даты окончания). Время в отпусках ниже из интервала вычитается.',
  'settings.workEnd': 'Дата окончания проекта',
  'settings.workEndHint':
    'Для типа «вся сумма контракта» срок = интервал между датами (минус отпуск), ставка = сумма / этот срок. Для месячного и почасового типа дата конца только ограничивает период начисления. Пустое окончание — бесконечный срок (до смены даты). Старые сохранения без типа оплаты считаются режимом «контракт целиком».',
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
    'Настройки автоматически записываются в браузер (localStorage). Файл JSON — резервная копия или перенос на другой компьютер.',
  'settings.downloadJson': 'Скачать JSON',
  'settings.uploadJson': 'Загрузить JSON',

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
    'Укажите дату начала у проекта — появится график накопленного дохода.',
  'chart.ariaMain': 'График накопленного дохода по проектам и остатка на счёте',
  'chart.heading': 'Проекты и счёт',
  'chart.yHover': 'Y: линия под курсором',
  'chart.yCompany': 'Y: компания',
  'chart.yFirst': 'Y: первая в списке',
  'chart.fromStart': 'с начала (раньше всех)',
  'chart.now': 'сейчас',
  'chart.indexSuffix': 'инд.',
  'chart.legend.fxHistory': 'История курсов:',
  'chart.legend.fxBlurb':
    '. Средний относительный индекс (100% = курс на дату начала графика).',
  'chart.legend.inf': 'Инфляция (CPI, годовая %):',
  'chart.legend.infBlurb':
    ', индикатор FP.CPI.TOTL.ZG. Линия — средний накопленный индекс уровня цен по экономикам выбранных валют (100 = 1 янв. года старта графика); валюта ≠ страна — используется статический маппинг.',

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
