/** Português (Brasil) */
export const pt: Record<string, string> = {
  'lang.en': 'EN',
  'lang.ru': 'RU',
  'lang.es': 'ES',
  'lang.fr': 'FR',
  'lang.de': 'DE',
  'lang.zh': 'ZH',
  'lang.ja': 'JA',
  'lang.pt': 'PT',
  'lang.selectAria': 'Idioma da interface',

  'theme.lightAria': 'Tema claro',
  'theme.darkAria': 'Tema escuro',
  'settings.aria': 'Abrir configurações',
  'settings.title': 'Configurações',
  'settings.close': 'Fechar',

  'hero.aria': 'Ritmo de ganhos',
  'hero.now': 'Agora',
  'hero.tagline': 'Sua velocidade de renda',
  'hero.perSecondLife': 'Sua velocidade de renda',
  'hero.perSec': '/ s',
  'hero.nominalApprox': 'nominal ≈',
  'hero.perHour': '/h',
  'hero.realHint': '· real',
  'hero.today': 'Hoje',
  'hero.todayNote': 'desde meia-noite · hora local',
  'hero.moreNominal': 'Nominal (antes de ajustes)',
  'hero.insightTitle': 'Após impostos e inflação',
  'hero.insightAria': 'Poder de compra real',
  'hero.futureAria': 'Estimativa para um ano',
  'hero.btnHideDetails': 'Ocultar detalhes',
  'hero.btnShowDetails': 'Moedas, saldo, câmbio',
  'hero.btnEditProjects': 'Editar projetos',
  'hero.ctaGrow': 'Aumente sua renda',
  'hero.btnBreakdown': 'Por moeda e saldo',
  'hero.btnTrajectory': 'Trajetória (estimativa)',
  'hero.btnChart': 'Renda ao longo do tempo',
  'hero.btnBackCompact': 'Voltar ao resumo',
  'hero.btnBackBreakdown': 'Voltar ao detalhamento',
  'hero.btnBackTrajectory': 'Voltar à trajetória',
  'hero.btnHideChart': 'Ocultar gráfico',
  'hero.emptyPrompt':
    'Adicione um projeto e valores nas configurações, seu ritmo ao vivo aparece aqui.',
  'hero.emptyCta': 'Abrir configurações',
  'hero.noFxHint':
    'Para uma taxa única, ative câmbio API ou use projetos em uma só moeda.',

  'trajectory.aria': 'Estimativa de trajetória',
  'trajectory.kicker': 'Se mantiver este ritmo',
  'trajectory.disclaimer':
    'Estimativa ilustrativa, não garantia. Assume renda real por segundo parecida.',
  'trajectory.steadyLead': 'No ritmo de hoje',
  'trajectory.next12': 'nos próximos ~12 meses',
  'trajectory.fiveYearLead': 'Em ~5 anos, mesmo ritmo:',
  'trajectory.morePaths': 'Outros caminhos (estimativa)',
  'trajectory.plus20Lead': 'Se a taxa subir ~20%',
  'trajectory.deltaLead': 'Diferença anual vs ritmo de hoje',
  'trajectory.perYearVs': 'por ano vs cenário estável',
  'trajectory.fiveCompare':
    'Escala 5 anos: cerca de {base} vs cerca de {plus} com taxa ~20% maior.',
  'trajectory.geekFootnote':
    'Na moeda da conta; mesma lógica de “taxa real” do bloco principal.',

  'breakdown.totalEarned': 'Total ganho',
  'breakdown.oneTotalTitle': 'Total (suas moedas → um número)',
  'breakdown.showAllCurrencies': 'Mostrar todas as moedas',
  'breakdown.hideAllCurrencies': 'Só um total',
  'breakdown.sortHintFx':
    'Cada moeda separada. Contratos ativos primeiro; no grupo, ordenado por valor em',
  'breakdown.sortHintFxApi': '(taxa API).',
  'breakdown.sortHintNoFx': 'Sem taxas, ordenado por código da moeda.',
  'breakdown.sortParagraphFx':
    'Cada moeda separada. Contratos ativos primeiro; em cada grupo, ordem decrescente convertida para {ccy} (taxa API).',
  'breakdown.sortParagraphNoFx':
    'Cada moeda separada. Contratos ativos primeiro; sem FX, ordem por código.',
  'breakdown.endedBadge': 'Encerrados',
  'breakdown.inAccount': 'Na conta agora',
  'breakdown.balancePayrollCaption':
    'Saldo nas definições após o pagamento em {payroll}; acréscimo dos projetos na moeda da conta desde {accrualFrom} (meia-noite do dia seguinte).',
  'breakdown.noContractsInCcy': 'Sem contratos em',
  'breakdown.allEndedInCcy': 'Todos encerrados',
  'breakdown.noAccrualHint':
    'Nada acumula no saldo, sem projetos selecionados na moeda da conta, só saldo pós-folha.',
  'breakdown.allEndedHint':
    'Todos os projetos nesta moeda terminaram, sem acréscimo ao saldo.',
  'breakdown.equivTitle': 'Total na moeda da conta',
  'breakdown.equivHint':
    'Uma coluna na moeda da conta, todos os projetos convertidos pela taxa abaixo.',
  'breakdown.fxBlurb':
    'Cada valor em sua moeda é convertido com a taxa API atual para',
  'breakdown.sumBlurb': 'Valores convertidos são somados para comparar em um número.',
  'breakdown.howTitle': 'Como funciona.',
  'breakdown.howBody':
    'Saldo após a última data de folha; da meia-noite do dia seguinte, acumula até agora.',
  'breakdown.onlyCcy':
    'Só projetos em {ccy} aqui. Outras moedas estão em “Total ganho”.',
  'breakdown.sortEndedNote':
    '“Encerrados” = todos os contratos nesta moeda passaram da data final.',
  'breakdown.rateHeading': 'Taxa.',
  'breakdown.sumHeading': 'Soma.',
  'breakdown.allEndedWithCcy': 'Todos encerrados ({ccy})',

  'fx.title': 'Taxa',
  'fx.noForeign':
    'Base API é {balance}; sem outras moedas nos projetos selecionados, sem cotações separadas.',
  'fx.missing':
    'Sem taxa API das moedas do projeto ({codes}) para a base {base}, linha mesclada do gráfico pode faltar.',
  'fx.footer':
    'Usado para total na moeda da conta, Σ/s combinado e linha rosa do gráfico.',
  'fx.failed':
    'Falha ao carregar taxas, mesclagem e linha do gráfico indisponíveis. Saldos inalterados.',

  'chart.panelTitle': 'Acúmulo ao longo do tempo',
  'chart.graphBadge': 'Gráfico',
  'chart.range1y': '1A',
  'chart.rangeAll': 'Todo o período',
  'chart.toolbarAria': 'Intervalo e vista do gráfico',
  'chart.allCompanies': 'Todas',
  'chart.markerStartAbbr': 'I',
  'chart.markerEndAbbr': 'F',
  'chart.contractStart': 'Início do contrato',
  'chart.contractEnd': 'Fim do contrato',
  'chart.markersToggleAria': 'Mostrar ou ocultar início e fim do contrato no gráfico',
  'chart.advancedShow': 'Detalhes do gráfico',
  'chart.advancedHide': 'Vista simples',
  'chart.productAria': 'Crescimento da renda e tendência',
  'chart.productKicker': 'Como você vai',
  'chart.productAboveTrend':
    'Acima de uma tendência reta nesta janela, momentum a seu favor.',
  'chart.productBelowTrend':
    'Em relação a uma linha reta desde o início da janela, cerca de {pct}% abaixo.',
  'chart.productNeutralTrend': 'Perto de uma tendência linear estável nesta janela.',
  'chart.productNow': 'Ganho (agora)',
  'chart.productTrendEnd': 'Tendência (ajuste)',
  'chart.productGapTrend': 'Diferença vs tendência',
  'chart.productYou': 'Você',
  'chart.productTrend': 'Tendência',
  'chart.productNeedRates':
    'Ative taxas API (ou uma moeda só) para ver uma linha de renda combinada.',
  'chart.productDisclaimer':
    'Tendência = ajuste linear nos ganhos do contrato nesta janela. Ilustrativo, não previsão.',
  'chart.productTrajectoryLead': 'Perspectiva da taxa (~12 meses)',
  'chart.productSteady12': 'Ritmo estável',
  'chart.productPlus20': 'Se taxa +20%',
  'chart.productPerYearHint': '/ ano vs estável',
  'chart.ctaGrow': 'Aumente sua renda',

  'footer.perSec': '/ s',
  'footer.sigmaPerSec': 'Σ ≈ +',
  'footer.inCcy': 'em',
  'footer.byRate': '(taxa API)',

  'awareness.title': 'Money Awareness Engine',
  'awareness.sub': 'Meu ritmo (compartilhar)',
  'awareness.ladder': 'Acima de ~{pct}% numa escada demo em EUR',
  'awareness.ladderNote':
    'Estilo viral: “ganho mais que ~{pct}%” nesta escada, não é pesquisa real.',
  'awareness.ladderModel':
    'Modelo: âncoras ~20–150k €/ano → €/s. Não é aconselhamento financeiro.',
  'awareness.needFx':
    'Carregue taxas para a mesma comparação demo em escala EUR (contexto, não ostentação).',
  'awareness.share': 'Compartilhar',
  'awareness.copied': 'Copiado para a área de transferência',
  'awareness.copyFail': 'Não foi possível copiar',
  'awareness.clipboardErr': 'Falha ao copiar',
  'awareness.copyCurrent': 'Copiar texto para compartilhar',

  'dates.start': 'Início:',
  'dates.end': 'Fim:',
  'dates.projectClosed': 'Projeto encerrado, total do período é final',

  'profile.phone': 'Tel.:',

  'settings.projectsTitle': 'Projetos',
  'settings.projectsSubtitle': 'Taxas de contrato e opções',
  'settings.balanceLabel': 'Saldo após última folha (nessa data)',
  'settings.payrollDate': 'Data da última folha',
  'settings.payrollHint':
    'Informe o saldo logo após esse pagamento. Da meia-noite do dia seguinte, acumula na tela principal.',
  'settings.accountCcy': 'Moeda da conta',
  'settings.takeHome': 'Parcela líquida após impostos (estimativa)',
  'settings.takeHomeAria': 'Percentual líquido após impostos',
  'settings.takeHomeHint':
    '{pct}% do contrato contam para o bloco “taxa real” na tela principal. Estimativa, não contabilidade.',
  'settings.balanceFooter':
    '“Total ganho” soma projetos selecionados. Saldo da conta é separado: base da folha mais acúmulo. Só projetos na moeda da conta acumulam no saldo.',
  'settings.projectsPicker': 'Projetos',
  'settings.projectsPickerHint':
    'Marcado = entra nos totais do painel (vários permitidos). Clique no nome para editar abaixo.',
  'settings.showOnDashboard': 'Mostrar na tela principal',
  'settings.editProject': 'Editar este projeto',
  'settings.contractEnded': 'Encerrado',
  'settings.endedBadgeTitle': 'Data final passou, acúmulo deste contrato parou.',
  'settings.projectName': 'Nome do projeto',
  'settings.projectCcy': 'Moeda do projeto',
  'settings.workStart': 'Data de início do trabalho',
  'settings.workStartHint':
    'Tempo de calendário desta meia-noite (incl. anos passados) × sua taxa (mensal, horária ou contrato até o fim). Férias abaixo são excluídas.',
  'settings.workEnd': 'Data de fim do projeto',
  'settings.workEndHint':
    'Para “contrato integral”, duração entre datas (menos férias). Para mensal/horária, só limita o acúmulo. Vazio = sem fim fixo.',
  'settings.vacations': 'Férias (passadas e planejadas)',
  'settings.vacationsHint':
    'Escolha intervalos; esses dias não entram no tempo desde o início (fins inclusivos).',
  'settings.vacationN': 'Férias {n}',
  'settings.removeVacation': 'Remover férias',
  'settings.vacationFrom': 'De',
  'settings.vacationTo': 'Até',
  'settings.addVacation': 'Adicionar férias',
  'settings.billingType': 'Tipo de cobrança',
  'settings.billing.monthly': 'Pagamento mensal',
  'settings.billing.hourly': 'Taxa horária',
  'settings.billing.contract': 'Valor total do contrato',
  'settings.billingHelp.monthly':
    'Como salário: mensal em 22×8 h úteis; acumula cada segundo desde o início.',
  'settings.billingHelp.hourly':
    'Taxa por hora; por segundo = valor / 3600. Para cobrança por hora.',
  'settings.billingHelp.contract':
    'Contrato integral; taxa = valor / período entre início e fim (menos férias). Fecha no valor do contrato.',
  'settings.amount.monthly': 'Pagamento mensal',
  'settings.amount.hourly': 'Taxa horária',
  'settings.amount.contract': 'Valor total do contrato',
  'settings.suffix.perMonth': ' / mês',
  'settings.suffix.perHour': ' / h',
  'settings.dataTitle': 'Dados',
  'settings.dataHint':
    'Salvo automaticamente neste navegador (localStorage). JSON é backup ou mudança de dispositivo.',
  'settings.storageRiskTitle': 'Só neste navegador',
  'settings.storageRiskBody':
    'Limpar dados, outro perfil ou dispositivo pode apagar. Baixe ou copie JSON às vezes, sem conta.',
  'settings.downloadJson': 'Baixar JSON',
  'settings.copyJson': 'Copiar JSON',
  'settings.copyJsonOk': 'JSON copiado, guarde em local seguro',
  'settings.copyJsonFail': 'Não foi possível copiar',
  'settings.uploadJson': 'Enviar JSON',

  'backupBanner.title': 'Faça um backup',
  'backupBanner.body':
    'Sua configuração fica só neste navegador. Em Configurações → Dados você pode baixar ou copiar JSON.',
  'backupBanner.openSettings': 'Ir às opções de backup',
  'backupBanner.later': 'Lembrar depois',

  'profile.title': 'Perfil (do JSON)',
  'profile.storedHint':
    'Guardado com as configurações; incluído em “Baixar JSON”. Edite o arquivo e importe de novo.',
  'profile.remove': 'Remover do salvamento',
  'profile.version': 'Versão do perfil:',
  'profile.location': 'Local:',
  'profile.format': 'Formato:',
  'profile.topSkills': 'Top skills:',

  'import.badFile':
    'Arquivo inválido. É preciso JSON de exportação MoneyClock: v: 1 e blocos mode, projectsBundle, etc.',

  'chart.empty':
    'Defina a data de início do projeto, o gráfico de renda acumulada aparecerá.',
  'chart.ariaMain': 'Renda acumulada, saldo da conta e câmbio',
  'chart.heading': 'Projetos e conta',
  'chart.yHover': 'Y: linha sob o cursor',
  'chart.yFirst': 'Y: primeiro da lista',
  'chart.fromStart': 'desde o início mais antigo',
  'chart.now': 'agora',
  'chart.indexSuffix': 'índ.',
  'chart.legend.fxHistory': 'Histórico de taxas:',
  'chart.legend.fxBlurb':
    '. Índice relativo médio (100% = taxa no início do gráfico).',
  'chart.legend.inf': 'Inflação (IPC, % ao ano):',
  'chart.legend.infBlurb':
    ', FP.CPI.TOTL.ZG. Linha = índice médio do nível de preços das economias das moedas escolhidas (100 = 1º jan do ano inicial); moeda ≠ país, mapeamento estático.',

  'chart.series.others': 'outros',
  'chart.series.projects': 'projetos',
  'chart.series.account': 'conta',
  'chart.series.allFx': 'todos os projetos (FX)',
  'chart.defaultProject': 'Projeto',
  'chart.ariaPanel': 'Gráfico de renda',
  'chart.unfocus': 'Limpar seleção: {name}',
  'chart.focusLine': 'Mostrar no gráfico: {name}',
  'chart.addProject': 'Adicionar projeto',

  'common.projectFallback': 'projeto'
};
