/** 日本語 */
export const ja: Record<string, string> = {
  'lang.en': 'EN',
  'lang.ru': 'RU',
  'lang.es': 'ES',
  'lang.fr': 'FR',
  'lang.de': 'DE',
  'lang.zh': 'ZH',
  'lang.ja': 'JA',
  'lang.pt': 'PT',
  'lang.selectAria': '表示言語',

  'theme.lightAria': 'ライトテーマ',
  'theme.darkAria': 'ダークテーマ',
  'settings.aria': '設定を開く',
  'settings.title': '設定',
  'settings.close': '閉じる',

  'hero.aria': '収入ペース',
  'hero.now': '今',
  'hero.tagline': 'あなたの収入スピード',
  'hero.perSecondLife': 'あなたの収入スピード',
  'hero.perSec': '/ 秒',
  'hero.nominalApprox': '名目 ≈',
  'hero.perHour': '/ 時',
  'hero.realHint': '· 実質',
  'hero.today': '今日',
  'hero.fteHourNote':
    '時給の名目はフルタイム（週40時間）。秒あたりの積み上げは暦ベースのままです。',
  'hero.dayMeterAria': '深夜0時までの今日の進行',
  'hero.dayMeterTitle': 'デイラン — 深夜まで',
  'hero.dayLeftLabel': '残り',
  'hero.per24hHint': '暦の1日（24時間）: {sym}{amt}',
  'hero.moreNominal': '名目（調整前）',
  'hero.insightTitle': '税・インフレ後',
  'hero.insightAria': '実質購買力',
  'hero.futureAria': '1年先の目安',
  'hero.btnHideDetails': '詳細を隠す',
  'hero.btnShowDetails': '通貨・残高・レート',
  'hero.btnEditProjects': 'プロジェクトを編集',
  'hero.ctaGrow': '収入を伸ばす',
  'hero.btnBreakdown': '通貨・残高別',
  'hero.btnTrajectory': '軌道（目安）',
  'hero.btnChart': '収入の推移',
  'hero.btnBackCompact': '概要に戻る',
  'hero.btnBackBreakdown': '内訳に戻る',
  'hero.btnBackTrajectory': '軌道に戻る',
  'hero.btnHideChart': 'チャートを隠す',
  'hero.emptyPrompt':
    '設定でプロジェクトと金額を追加, ここにライブレートが表示されます。',
  'hero.emptyCta': '設定を開く',
  'hero.noFxHint':
    '1本のヘッドラインにするには API 為替を有効にするか、同一通貨のプロジェクトにしてください。',

  'trajectory.aria': '軌道の目安',
  'trajectory.kicker': 'このペースを続けたら',
  'trajectory.disclaimer':
    'イメージ用の目安で保証ではありません。実質収入ペースが似たままと仮定します。',
  'trajectory.steadyLead': '今日のペースで',
  'trajectory.next12': 'おおよそ次の12ヶ月で',
  'trajectory.fiveYearLead': 'おおよそ5年、同じペース：',
  'trajectory.morePaths': '別シナリオ（目安）',
  'trajectory.plus20Lead': 'レートが約+20%なら',
  'trajectory.deltaLead': '今日のペースとの年間差',
  'trajectory.perYearVs': '年あたり vs 安定シナリオ',
  'trajectory.fiveCompare':
    '5年スケール：約 {base} vs レート約+20%で約 {plus}。',
  'trajectory.geekFootnote':
    '口座通貨で表示。メインブロックと同じ「実質レート」ロジック。',

  'breakdown.totalEarned': '累計獲得',
  'breakdown.oneTotalTitle': '合計（複数通貨 → 1つの数字）',
  'breakdown.showAllCurrencies': '全通貨を表示',
  'breakdown.hideAllCurrencies': '合計1つのみ',
  'breakdown.sortHintFx':
    '通貨ごと。有効契約を先に；グループ内は次の通貨換算額で並べ替え',
  'breakdown.sortHintFxApi': '（API レート）。',
  'breakdown.sortHintNoFx': 'レートなしは通貨コード順。',
  'breakdown.sortParagraphFx':
    '通貨ごと。有効契約を先に；各グループは {ccy} 換算の降順（API レート）。',
  'breakdown.sortParagraphNoFx':
    '通貨ごと。有効契約を先に；FX なしは通貨コード順。',
  'breakdown.endedBadge': '終了',
  'breakdown.inAccount': '現在の口座残高',
  'breakdown.balancePayrollCaption':
    '設定の残高（{payroll} の給与後）· 選択した全プロジェクトの積み上げは {accrualFrom}（翌日0時）から。他通貨は現在の API レートで換算。',
  'breakdown.noContractsInCcy': '契約なし',
  'breakdown.allEndedInCcy': 'すべて終了',
  'breakdown.noAccrualHint':
    'ライブ FX レートなし：表示残高は給与後の数字のまま。レートを読み込むか、口座通貨のプロジェクトを追加してください。',
  'breakdown.foreignAccrualFxHint':
    '口座通貨の契約はありませんが、他通貨の積み上げを現在の API レートで換算して合算します（「今日」と同じ考え方）。',
  'breakdown.allEndedHint':
    'この通貨のプロジェクトはすべて終了, 残高への積み上げなし。',
  'breakdown.equivTitle': '口座通貨での合計',
  'breakdown.equivHint':
    '口座通貨の1列, 下のレートですべての選択プロジェクトを換算。',
  'breakdown.fxBlurb': '各金額をその通貨から現在の API レートで換算し',
  'breakdown.sumBlurb': '換算後に合算し、1つの数字で比較。',
  'breakdown.howTitle': '仕組み。',
  'breakdown.howBody':
    '最終給与後の残高；翌日0時から、選択した全プロジェクトを現在まで積み上げ（他通貨はライブレート、ヒーローと同様）。',
  'breakdown.onlyCcy':
    '実行残高は選択プロジェクトを {ccy} に換算した合計。通貨別は「累計獲得」。',
  'breakdown.sortEndedNote':
    '「終了」= その通貨のすべての契約が終了日を過ぎている。',
  'breakdown.rateHeading': 'レート。',
  'breakdown.sumHeading': '合計。',
  'breakdown.allEndedWithCcy': 'すべて終了（{ccy}）',

  'fx.title': 'レート',
  'fx.noForeign':
    'API ベースは {balance}；選択プロジェクトに他通貨なし, 個別の見積なし。',
  'fx.missing':
    'プロジェクト通貨（{codes}）からベース {base} への API レートなし, 統合ラインが使えない場合あり。',
  'fx.footer': '口座通貨合計・統合 Σ/秒・ピンクのチャートラインに使用。',
  'fx.failed':
    'レート読み込み失敗, 口座通貨マージとチャートラインは利用不可。残高はそのまま。',

  'chart.panelTitle': '時間経過の積み上げ',
  'chart.graphBadge': 'チャート',
  'chart.range1y': '1年',
  'chart.rangeAll': '全期間',
  'chart.toolbarAria': 'チャートの期間と表示',
  'chart.allCompanies': 'すべて',
  'chart.markerStartAbbr': '始',
  'chart.markerEndAbbr': '終',
  'chart.contractStart': '契約開始',
  'chart.contractEnd': '契約終了',
  'chart.markersToggleAria': '契約の開始・終了マーカーの表示を切り替え',
  'chart.monthlyRatesToggleAria':
    '名目月額ライン（プロジェクト別、時間軸でFX換算）の表示を切り替え',
  'chart.monthlyRatesToggleTitle':
    '破線: 各プロジェクトの名目月額を口座通貨で時系列換算（Frankfurter）。右軸がそのスケール。',
  'chart.monthlyRatesTipMonth': '{month}',
  'chart.monthlyRatesTipLine': '{name}: {amount}',
  'chart.monthlyRatesTipSum': '換算合計: {amount}',
  'chart.monthlyRateLineLabel': '{name} · 名目月額（FX）',
  'chart.monthlyRateUnit': '/月',
  'chart.monthlyAxisShort': '月額（FX）',
  'chart.currencyCycleAria': 'チャートの通貨を切り替え。現在: {code}',
  'chart.currencyCycleTitle': 'チャートは {code}。クリックで切り替え。',
  'chart.currencyCycleDisabledAria': '通貨が1つだけのため切り替え不可',
  'chart.currencyCycleDisabledTitle': '別通貨のプロジェクトを追加すると切り替え可能',
  'chart.advancedShow': 'チャート詳細',
  'chart.advancedHide': 'シンプル表示',
  'chart.productAria': '収入成長とトレンド',
  'chart.productKicker': '調子はどうか',
  'chart.productAboveTrend':
    'この期間の直線トレンドを上回っています, 勢いあり。',
  'chart.productBelowTrend':
    '期間開始からの直線トレンドより約 {pct}% 下です。',
  'chart.productNeutralTrend': 'この期間では安定した線形トレンドに近い。',
  'chart.productNow': '獲得（現在）',
  'chart.productTrendEnd': 'トレンド（フィット）',
  'chart.productGapTrend': 'トレンドとの差',
  'chart.productYou': 'あなた',
  'chart.productTrend': 'トレンド',
  'chart.productNeedRates':
    '設定で API レートを有効にするか単一通貨にすると統合収入線が表示されます。',
  'chart.productDisclaimer':
    'トレンド = この期間の契約収入への線形フィット。イメージ用で予測ではありません。',
  'chart.productTrajectoryLead': 'レート見通し（約12ヶ月）',
  'chart.productSteady12': '安定ペース',
  'chart.productPlus20': 'レート+20%なら',
  'chart.productPerYearHint': '/ 年 vs 安定',
  'chart.ctaGrow': '収入を伸ばす',

  'footer.perSec': '/ 秒',
  'footer.sigmaPerSec': 'Σ ≈ +',
  'footer.inCcy': '通貨',
  'footer.byRate': '（API レート）',

  'awareness.title': 'Money Awareness Engine',
  'awareness.sub': 'マイペース（共有）',
  'awareness.ladder': 'デモ EUR ラダーで約上位 {pct}%',
  'awareness.ladderNote':
    'バイラル調の言い方：「約 {pct}% より上」— 実調査ではありません。',
  'awareness.ladderModel':
    'モデル：おおよそ 20–150k €/年のアンカー → €/秒。助言ではありません。',
  'awareness.needFx':
    '同じ EUR スケールのデモ比較のためにレートを読み込んでください。',
  'awareness.share': '共有',
  'awareness.copied': 'クリップボードにコピーしました',
  'awareness.copyFail': 'コピーできませんでした',
  'awareness.clipboardErr': 'コピーに失敗しました',
  'awareness.copyCurrent': '共有用テキストをコピー',

  'dates.start': '開始：',
  'dates.end': '終了：',
  'dates.projectClosed': 'プロジェクト終了, 期間合計は確定',

  'profile.phone': '電話：',

  'settings.projectsTitle': 'プロジェクト',
  'settings.projectsSubtitle': '契約レートとオプション',
  'settings.balanceLabel': '最終給与後の残高（その日）',
  'settings.payrollDate': '最終給与日',
  'settings.payrollHint':
    'その支払い直後の残高を入力。翌日0時からメイン画面に積み上げ。',
  'settings.accountCcy': '口座通貨',
  'settings.takeHome': '税引後手取り割合（目安）',
  'settings.takeHomeAria': '税引後の手取り％',
  'settings.takeHomeHint':
    '契約の {pct}% をメインの「実質レート」に使用。目安で会計ではありません。',
  'settings.balanceFooter':
    '「累計獲得」は選択プロジェクトの合計。口座残高は別：給与ベース＋全選択プロジェクトの積み上げ。外貨はライブ API レートで換算（メイン表示と同じ）。',
  'settings.projectsPicker': 'プロジェクト',
  'settings.projectsPickerHint':
    'チェック = ダッシュボード合計に含む（複数可）。名前をクリックして下を編集。',
  'settings.showOnDashboard': 'メイン画面に表示',
  'settings.editProject': 'このプロジェクトを編集',
  'settings.contractEnded': '終了',
  'settings.endedBadgeTitle': '終了日を過ぎました, この契約の積み上げは停止。',
  'settings.projectName': 'プロジェクト名',
  'settings.projectCcy': 'プロジェクト通貨',
  'settings.workStart': '稼働開始日',
  'settings.workStartHint':
    'この日の0時からの暦時間（過去年含む）× レート（月額・時給・契約終了までの一括）。下の休暇は除外。',
  'settings.workEnd': 'プロジェクト終了日',
  'settings.workEndHint':
    '「契約一括」は期間内（休暇控除）。月額・時給は終了日が積み上げ上限。空欄 = 無期限。',
  'settings.vacations': '休暇（過去・予定）',
  'settings.vacationsHint':
    '範囲を選ぶ；その暦日は開始からの時間に含めない（終了日含む）。',
  'settings.vacationN': '休暇 {n}',
  'settings.removeVacation': '休暇を削除',
  'settings.vacationFrom': 'から',
  'settings.vacationTo': 'まで',
  'settings.addVacation': '休暇を追加',
  'settings.billingType': '請求タイプ',
  'settings.billing.monthly': '月額',
  'settings.billing.hourly': '時給',
  'settings.billing.contract': '契約総額',
  'settings.billingHelp.monthly':
    '給与のように：月額を 22×8 労働時間で割り、開始から毎秒積み上げ。',
  'settings.billingHelp.hourly': '時給；毎秒 = 金額/3600。時間課金向け。',
  'settings.billingHelp.contract':
    '契約総額；レート = 金額 / 開始〜終了の暦期間（休暇控除）。終了時に契約額に一致。',
  'settings.amount.monthly': '月額',
  'settings.amount.hourly': '時給',
  'settings.amount.contract': '契約総額',
  'settings.suffix.perMonth': ' / 月',
  'settings.suffix.perHour': ' / 時',
  'settings.dataTitle': 'データ',
  'settings.dataHint':
    'このブラウザに自動保存（localStorage）。JSON はバックアップや別端末移行用。',
  'settings.storageRiskTitle': 'このブラウザのみ',
  'settings.storageRiskBody':
    'サイトデータ削除・別プロファイル・別端末で消えることがあります。時々 JSON を保存, アカウント不要。',
  'settings.downloadJson': 'JSON をダウンロード',
  'settings.copyJson': 'JSON をコピー',
  'settings.copyJsonOk': 'JSON をコピーしました, 安全に保管してください',
  'settings.copyJsonFail': 'コピーできませんでした',
  'settings.uploadJson': 'JSON をアップロード',

  'backupBanner.title': 'バックアップを',
  'backupBanner.body':
    '設定はこのブラウザのみ。設定 → データ で JSON を保存できます。',
  'backupBanner.openSettings': 'バックアップへ',
  'backupBanner.later': '後で通知',

  'profile.title': 'プロフィール（JSON から）',
  'profile.storedHint':
    '設定と一緒に保存。「JSON ダウンロード」に含まれます。ソースを編集して再インポート。',
  'profile.remove': '保存から削除',
  'profile.version': 'プロフィール版：',
  'profile.location': '所在地：',
  'profile.format': '形式：',
  'profile.topSkills': 'Top skills：',

  'import.badFile':
    '無効なファイル。MoneyClock エクスポート JSON（v: 1、mode、projectsBundle など）が必要です。',

  'chart.empty': 'プロジェクト開始日を設定すると累積収入チャートが表示されます。',
  'chart.ariaMain': '累積収入・口座残高・為替',
  'chart.heading': 'プロジェクトと口座',
  'chart.yHover': 'Y：カーソル下の線',
  'chart.yFirst': 'Y：リスト先頭',
  'chart.fromStart': '最も早い開始から',
  'chart.now': '今',
  'chart.indexSuffix': 'idx',
  'chart.legend.fxHistory': 'レート履歴：',
  'chart.legend.fxBlurb': '。平均相対指数（100% = チャート開始時のレート）。',
  'chart.legend.inf': 'インフレ（CPI、年率%）：',
  'chart.legend.infBlurb':
    '、FP.CPI.TOTL.ZG。線 = 選択通貨の経済圏の平均物価水準指数（100 = チャート開始年1月1日）；通貨≠国, 静的マッピング。',

  'chart.insightsTitle': 'この範囲で目立つ点',
  'chart.insightHover':
    'この付近は、下の注記で示した為替・インフレの変動に近い日付です。',
  'chart.insight.fxPeak':
    '為替平均指数が {date} 付近で約 {pct}% に達します（100% = チャート開始時のレート）。',
  'chart.insight.fxTrough': '為替平均指数が {date} 付近で約 {pct}% まで下がります。',
  'chart.insight.fxJump':
    'このプロット最大の為替指数ステップ：約 {delta} p.p.、{date} 付近。',
  'chart.insight.infPeak':
    '物価指数（インフレ）が {date} 付近で約 {idx} にピークします。',
  'chart.insight.infJump':
    'このプロット最大のインフレ指数ステップ：約 {delta}、{date} 付近。',

  'chart.series.others': 'その他',
  'chart.series.projects': 'プロジェクト',
  'chart.series.account': '口座',
  'chart.series.allFx': '全プロジェクト（FX）',
  'chart.defaultProject': 'プロジェクト',
  'chart.ariaPanel': '収入チャート',
  'chart.unfocus': '選択解除：{name}',
  'chart.focusLine': 'チャートに表示：{name}',
  'chart.addProject': 'プロジェクトを追加',

  'common.projectFallback': 'プロジェクト'
};
