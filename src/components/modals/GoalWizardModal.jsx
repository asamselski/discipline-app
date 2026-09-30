import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Flame, X, Zap } from 'lucide-react';
import { GOAL_CATEGORIES_CONFIG } from '../../data/constants';
import { useI18n } from '../../i18n-context';

export default function GoalWizardModal({
  showAddGoalModal, goalWizardStep, setGoalWizardStep, setShowAddGoalModal,
  currentFontConfig, tStyle, wizardData, setWizardData, clearError, formErrors,
  getTypeIcon, getUnitForType, books, changeBookStatus, finalizeWizard,
  taskPickerDate, setTaskPickerDate, renderCustomCalendar, handleWizardNext,
}) {
  const { locale, t } = useI18n();
  if (!(showAddGoalModal || goalWizardStep > 0)) return null;

  return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto">
          <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>

            <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-500/20">
               <div className="flex items-center gap-2">
                 {goalWizardStep > 1 && (
                    <button onClick={() => setGoalWizardStep(prev => prev - 1)} className="p-1.5 rounded-full hover:bg-slate-500/20 transition-colors">
                       <ChevronLeft className="w-5 h-5" />
                    </button>
                 )}
                 <h3 className={currentFontConfig.sizeClass + ' font-bold ' + tStyle.titleText}>
                    {t(goalWizardStep === 1 ? 'Krok 1: Wybierz Obszar' :
                     goalWizardStep === 2 ? 'Krok 2: Typ Celu' :
                     goalWizardStep === 3 ? 'Krok 3: [R] Result (Czego pragniesz?)' :
                     goalWizardStep === 4 ? 'Krok 4: [P] Purpose (Dlaczego?)' :
                     goalWizardStep === 5 ? 'Krok 5: [M] Akcja (Synergia)' :
                     'Krok 6: [M] Action Plan (Zadanie)')}
                 </h3>
               </div>
               <button onClick={() => { setGoalWizardStep(0); setShowAddGoalModal(false); }} className={'p-1.5 rounded-full hover:bg-slate-500/20 transition-colors'}><X className="w-5 h-5"/></button>
            </div>

            {/* KROK 1: WYBÓR KATEGORII */}
            {goalWizardStep === 1 && (
              <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                {Object.values(GOAL_CATEGORIES_CONFIG).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setWizardData({...wizardData, categoryKey: cat.id}); clearError('wizardCategory'); }}
                    className={`p-4 rounded-2xl border text-center transition-all ${wizardData.categoryKey === cat.id ? 'bg-amber-500/20 border-amber-500 text-amber-500 ring-2 ring-amber-500' : 'bg-slate-500/10 border-slate-500/30 hover:bg-slate-500/20'}`}
                  >
                    <span className="block text-3xl mb-2">{cat.label.split(' ')[0]}</span>
                    <span className={'font-bold ' + currentFontConfig.smallClass}>{t(cat.label).split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </div>
            )}

            {/* KROK 2: KAFELKI Z TYPEM CELU */}
            {goalWizardStep === 2 && wizardData.categoryKey && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                {GOAL_CATEGORIES_CONFIG[wizardData.categoryKey].types.map(goalType => (
                  <button
                    key={goalType.id}
                    onClick={() => {
                        const selectedBook = books.find(book => String(book.id) === wizardData.selectedBookId);
                        const selectedBookPages = selectedBook && Number(selectedBook.totalPages) > 0
                          ? String(selectedBook.totalPages)
                          : '';

                        setWizardData({
                          ...wizardData,
                          type: goalType.id,
                          ...(wizardData.categoryKey === 'book' ? {
                            target: goalType.id === 'read_book' ? selectedBookPages : '',
                            bookTotalPages: selectedBookPages,
                          } : {}),
                        });
                        setGoalWizardStep(3);
                        clearError('wizardType');
                    }}
                    className={`p-4 rounded-2xl border text-center transition-all bg-slate-500/10 border-slate-500/30 hover:bg-slate-500/20 hover:scale-[1.02] active:scale-95`}
                  >
                    {getTypeIcon(goalType.id)}
                    <span className={'font-bold ' + currentFontConfig.smallClass + ' ' + tStyle.titleText}>{t(goalType.label).split(' (')[0]}</span>
                  </button>
                ))}
              </div>
            )}

            {/* KROK 3: SZCZEGÓŁY CELU */}
            {goalWizardStep === 3 && wizardData.categoryKey && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                    {(() => {
                      if (wizardData.categoryKey === 'book') return t('Wybierz z biblioteki lub wpisz tytuł ręcznie');
                      if (wizardData.categoryKey === 'sport') return t('Cel sportowy (np. "Bieg dookoła jeziora")');
                      if (wizardData.categoryKey === 'study') return t('Czego się uczysz? (np. "Podstawy Pythona")');
                      if (wizardData.categoryKey === 'health') {
                          if (wizardData.type === 'water') return t('Nazwa celu (np. "Picie min. 2L wody dziennie")');
                          if (wizardData.type === 'sleep') return t('Nazwa celu (np. "Zdrowy sen min. 7h")');
                          return t('Nazwa wyzwania (np. "Detoks od cukru")');
                      }
                      return t('Nazwa projektu / celu (np. "Nowa aplikacja")');
                    })()}
                  </label>

                  {wizardData.categoryKey === 'book' && books.length > 0 && (
                     <select
                       className={`w-full rounded-2xl px-4 py-3 mb-3 ${currentFontConfig.sizeClass} focus:outline-none focus:border-amber-500 border border-slate-500/20 ${tStyle.inputBg}`}
                       value={wizardData.selectedBookId || ''}
                       onChange={(e) => {
                          const bId = e.target.value;
                          if (!bId) {
                            setWizardData({
                              ...wizardData,
                              selectedBookId: '',
                              title: '',
                              target: '',
                              bookTotalPages: '',
                            });
                            return;
                          }

                          const b = books.find(x => String(x.id) === bId);
                          if (b) {
                             const totalPages = Number(b.totalPages);
                             const pageValue = Number.isFinite(totalPages) && totalPages > 0
                               ? String(b.totalPages)
                               : '';

                             setWizardData({
                               ...wizardData,
                               selectedBookId: bId,
                               title: b.title,
                               target: wizardData.type === 'read_book' ? pageValue : '',
                               bookTotalPages: pageValue,
                             });
                             clearError('wizardTitle');
                             if (wizardData.type === 'read_book' && pageValue) clearError('wizardTarget');
                             if (b.status === 'planned') changeBookStatus(b.id, 'in_progress'); // Automatycznie oznacza jako czytaną
                          }
                       }}
                     >
                        <option value="">{t('-- Wybierz z Moich Książek --')}</option>
                        {books.filter(b => b.status !== 'read').map(b => (
                           <option key={b.id} value={b.id}>{b.title}</option>
                        ))}
                     </select>
                  )}

                  <input
                    type="text"
                    value={wizardData.title}
                    onChange={(e) => { setWizardData({...wizardData, selectedBookId: '', title: e.target.value}); clearError('wizardTitle'); }}
                    className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.wizardTitle ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-amber-500'} ${tStyle.inputBg}`}
                    placeholder={t('Wpisz nazwę... (Wymagane)')}
                  />
                </div>

                {/* Opcje dla celu "Brak Słodyczy" - WYBÓR DNI/GODZINY */}
                {wizardData.type === 'no_sweets' && (
                  <div className="pt-2 border-t border-slate-500/20">
                     <label className={currentFontConfig.smallClass + ' font-medium block mb-2 ' + tStyle.subText}>{t('Typ wyzwania')}</label>
                     <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setWizardData({...wizardData, targetUnit: 'days'})} className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${wizardData.targetUnit === 'days' ? tStyle.optSelected : tStyle.optUnselected}`}>
                          <CalendarIcon className="w-5 h-5" /> {t('Cel w Dniach')}
                        </button>
                        <button onClick={() => setWizardData({...wizardData, targetUnit: 'hours'})} className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${wizardData.targetUnit === 'hours' ? tStyle.optSelectedWarning : tStyle.optUnselected}`}>
                          <Clock className="w-5 h-5" /> {t('Cel w Godzinach')}
                        </button>
                     </div>
                  </div>
                )}

                {wizardData.targetUnit !== 'hours' && (
                  <div className="pt-2 border-t border-slate-500/20">
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input type="checkbox" checked={wizardData.isDaily} onChange={(e) => setWizardData({...wizardData, isDaily: e.target.checked})} className="w-4 h-4 accent-amber-500 rounded cursor-pointer" />
                      <span className={currentFontConfig.smallClass + ' font-medium ' + tStyle.subText}>
                        {t(wizardData.categoryKey === 'health' ? 'Cel codzienny (odnawia się każdego dnia)' :
                         wizardData.categoryKey === 'book' ? 'Czytam określoną ilość dziennie' :
                         'Zadanie dzienne (odnawia się codziennie)')}
                      </span>
                    </label>
                  </div>
                )}

                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                    {(() => {
                      if (wizardData.type === 'read_chapters') return t('Liczba rozdziałów do przeczytania');
                      if (wizardData.type === 'read_book') return t('Liczba stron do przeczytania');
                      if (wizardData.type === 'no_sweets' && wizardData.targetUnit === 'hours') return t('Liczba GODZIN bez słodyczy (np. 24)');
                      if (wizardData.type === 'water') return t('Ile dni chcesz utrzymać nawyk nawodnienia?');
                      if (wizardData.type === 'sleep') return t('Przez ile dni chcesz pilnować zdrowego snu?');
                      if (wizardData.type) return t('Rozmiar wyzwania (w: {{unit}})', { unit: t(getUnitForType(wizardData.type)) });
                      return t('Rozmiar wyzwania');
                    })()}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    value={wizardData.target}
                    onChange={(e) => { setWizardData({...wizardData, target: e.target.value}); clearError('wizardTarget'); }}
                    className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.wizardTarget ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-amber-500'} ${tStyle.inputBg}`}
                    placeholder={wizardData.type === 'no_sweets' && wizardData.targetUnit === 'hours' ? "np. 20 (Wymagane)" : "np. 50 (Wymagane)"}
                  />
                </div>

                {wizardData.categoryKey === 'book' && wizardData.type === 'read_chapters' && (
                  <div className="mt-4 pt-4 border-t border-slate-500/20">
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                      {t('Całkowita liczba stron w książce (Opcjonalnie, do statystyk)')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={wizardData.bookTotalPages}
                      onChange={(e) => setWizardData({...wizardData, bookTotalPages: e.target.value})}
                      className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none focus:border-amber-500 ${tStyle.inputBg}`}
                      placeholder="np. 320"
                    />
                  </div>
                )}

                {(!wizardData.isDaily && wizardData.targetUnit !== 'hours') && (
                  <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                      {t('Czas na realizację (Deadline)')}
                    </label>
                    <input type="date" value={wizardData.dueDate} onChange={(e) => setWizardData({...wizardData, dueDate: e.target.value})} className={'w-full max-w-full box-border appearance-none rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg} style={{ WebkitAppearance: 'none' }} />
                  </div>
                )}

                {wizardData.targetUnit === 'hours' && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl mt-2 text-amber-500">
                    <p className={'text-xs font-medium text-center'}>
                      {t('Po zapisaniu wyzwania, w zakładce Dzisiaj pojawi się dedykowane zadanie ze stoperem. Kliknij ▶️, aby zacząć!')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* KROK 4: PURPOSE (Dlaczego to musisz zrobić?) */}
            {goalWizardStep === 4 && (
              <div className="space-y-4 animate-fadeIn py-2">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto bg-amber-500/20 text-amber-500 flex items-center justify-center rounded-2xl border border-amber-500/40 mb-4">
                    <Flame className="w-8 h-8" />
                  </div>
                  <h4 className={'font-bold mb-2 ' + currentFontConfig.headerClass + ' ' + tStyle.titleText}>{t('[P] Purpose – Dlaczego to robisz?')}</h4>
                  <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>
                    {t('Tony Robbins uważa, że to emocje dają nam napęd. Gdy masz wystarczająco silne "Dlaczego", znajdziesz każde "Jak".')}
                    <br/><strong className="text-amber-500 mt-2 block">{t('Dlaczego to dla Ciebie absolutnie konieczne? Jak się poczujesz, gdy to osiągniesz?')}</strong>
                  </p>
                </div>
                <div>
                  <textarea
                    rows={4}
                    value={wizardData.purpose}
                    onChange={(e) => { setWizardData({...wizardData, purpose: e.target.value}); clearError('wizardPurpose'); }}
                    className={`w-full rounded-2xl px-4 py-3 resize-none ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.wizardPurpose ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-amber-500'} ${tStyle.inputBg}`}
                    placeholder={t('Np. Chcę odzyskać pewność siebie, przestać czuć zmęczenie każdego dnia i udowodnić sobie, że potrafię trzymać dyscyplinę...')}
                  />
                  {formErrors.wizardPurpose && <span className="text-red-500 text-xs font-bold mt-1 block">{t('Zatrzymaj się. Musisz znaleźć swój powód, by iść naprzód!')}</span>}
                </div>
              </div>
            )}

            {/* KROK 5: [M] MASSIVE ACTION PLAN - Wstęp */}
            {goalWizardStep === 5 && (
              <div className="text-center space-y-6 animate-fadeIn py-4">
                <div className="w-16 h-16 mx-auto bg-emerald-500/20 text-emerald-500 flex items-center justify-center rounded-2xl border border-emerald-500/40">
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                   <h4 className={'font-bold mb-2 ' + currentFontConfig.headerClass + ' ' + tStyle.titleText}>{t('[M] Zmasowany Plan Działania')}</h4>
                   <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>
                      {t('Wielkie cele realizuje się małymi krokami.')} {t('Skonfigurujmy Twój Massive Action Plan (MAP). Czy chcesz od razu wygenerować konkretne zadanie dla celu:')} <strong className="text-amber-500">"{wizardData.title}"</strong>?
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4">
                   <button onClick={() => {
                       setWizardData({...wizardData, createTask: false});
                       finalizeWizard(false);
                   }} className={'py-3.5 rounded-2xl font-bold ' + tStyle.modalBtnBg}>
                     {t('Nie, sam coś wymyślę')}
                   </button>
                   <button onClick={() => {
                       setWizardData({...wizardData, createTask: true});
                       setGoalWizardStep(6);
                   }} className={'py-3.5 rounded-2xl font-bold bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20'}>
                     {t('Jasne, utwórz!')}
                   </button>
                </div>
              </div>
            )}

            {/* KROK 6: KONFIGURACJA ZADANIA */}
            {goalWizardStep === 6 && (
              <div className="space-y-4 animate-fadeIn">
                 <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                    {t('Jak nazwiesz to konkretne działanie w liście "Dzisiaj"?')}
                  </label>
                  <input
                    type="text"
                    value={wizardData.taskTitle}
                    onChange={(e) => { setWizardData({...wizardData, taskTitle: e.target.value}); clearError('wizardTaskTitle'); }}
                    className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.wizardTaskTitle ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-emerald-500'} ${tStyle.inputBg}`}
                  />
                </div>

                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                    {wizardData.categoryKey === 'book' ? t('Ile zrobisz podczas jednej sesji?') :
                     wizardData.type ? t('Wartość docelowa na jedno zadanie (w: {{unit}})', { unit: t(getUnitForType(wizardData.type)) }) : t('Wartość')}
                  </label>
                  <input type="number" step="any" min="0" placeholder="np. 15 (opcjonalnie)" value={wizardData.taskAmount} onChange={(e) => setWizardData({...wizardData, taskAmount: e.target.value})} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                </div>

                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>{t('Trudność zadania (wpływa na punkty)')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => setWizardData({...wizardData, taskDifficulty: 'easy'})} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (wizardData.taskDifficulty === 'easy' ? tStyle.optSelected : tStyle.optUnselected)}>{t('Łatwy')}</button>
                    <button type="button" onClick={() => setWizardData({...wizardData, taskDifficulty: 'medium'})} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (wizardData.taskDifficulty === 'medium' ? tStyle.optSelectedWarning : tStyle.optUnselected)}>{t('Średni')}</button>
                    <button type="button" onClick={() => setWizardData({...wizardData, taskDifficulty: 'hard'})} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (wizardData.taskDifficulty === 'hard' ? tStyle.optSelectedDanger : tStyle.optUnselected)}>{t('Trudny')}</button>
                  </div>
                </div>

                {getUnitForType(wizardData.type) !== 'godz.' && getUnitForType(wizardData.type) !== 'min' && (
                  <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>{t('Czas trwania sesji (włącza stoper, opcjonalnie)')}</label>
                    <input type="number" placeholder="np. 30" value={wizardData.taskDuration} onChange={(e) => setWizardData({...wizardData, taskDuration: e.target.value})} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                  </div>
                )}

                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                    {t('Jak często powtarzasz tę akcję?')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setWizardData({...wizardData, taskRepeat: 'daily'})} className={'py-3 rounded-xl transition-all font-semibold ' + (wizardData.taskRepeat === 'daily' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500 ring-2 ring-emerald-500' : 'bg-slate-500/10 border-transparent text-slate-400 border')}>{t('Codziennie')}</button>
                    <button type="button" onClick={() => setWizardData({...wizardData, taskRepeat: 'interval'})} className={'py-3 rounded-xl transition-all font-semibold ' + (wizardData.taskRepeat === 'interval' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500 ring-2 ring-emerald-500' : 'bg-slate-500/10 border-transparent text-slate-400 border')}>{t('Co 2 dni')}</button>
                    <button type="button" onClick={() => setWizardData({...wizardData, taskRepeat: 'custom'})} className={'py-3 rounded-xl transition-all font-semibold ' + (wizardData.taskRepeat === 'custom' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500 ring-2 ring-emerald-500' : 'bg-slate-500/10 border-transparent text-slate-400 border')}>{t('Niestandardowe')}</button>
                    <button type="button" onClick={() => setWizardData({...wizardData, taskRepeat: 'once'})} className={'col-span-2 py-3 rounded-xl transition-all font-semibold ' + (wizardData.taskRepeat === 'once' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500 ring-2 ring-emerald-500' : 'bg-slate-500/10 border-transparent text-slate-400 border')}>{t('Cel krótkoterminowy (Jednorazowo)')}</button>
                  </div>
                </div>

                {/* KALENDARZ DLA ZADAŃ NIESTANDARDOWYCH W KREATORZE */}
                {wizardData.taskRepeat === 'custom' && (
                  <div className="mt-3 space-y-2 animate-fadeIn">
                    <label className={currentFontConfig.smallClass + ' font-medium block ' + tStyle.subText}>{t('Zaznacz dni w kalendarzu:')}</label>
                    <div className={'p-3 rounded-2xl border ' + tStyle.cardBg}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={'font-bold ' + currentFontConfig.smallClass + ' ' + tStyle.titleText}>{taskPickerDate.toLocaleString(locale, { month: 'long', year: 'numeric' })}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setTaskPickerDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="p-1 rounded hover:bg-slate-500/20"><ChevronLeft className="w-4 h-4" /></button>
                          <button type="button" onClick={() => setTaskPickerDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="p-1 rounded hover:bg-slate-500/20"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className={'grid grid-cols-7 gap-1 text-center text-[10px] font-semibold mb-1 ' + tStyle.subText}>
                        <span>{t('Pn')}</span><span>{t('Wt')}</span><span>{t('Śr')}</span><span>{t('Cz')}</span><span>{t('Pt')}</span><span>{t('Sob')}</span><span>{t('Ndz')}</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {renderCustomCalendar(true, wizardData, setWizardData)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DOLNY PRZYCISK ZATWIERDZAJĄCY KROK */}
            {(goalWizardStep === 1 || goalWizardStep === 3 || goalWizardStep === 4 || goalWizardStep === 6) && (
              <div className="mt-6 pt-4 border-t border-slate-500/20">
                 <button
                   onClick={handleWizardNext}
                   disabled={goalWizardStep === 1 && !wizardData.categoryKey}
                   className={'w-full py-4 rounded-2xl font-bold transition-transform ' + ((goalWizardStep === 6 || (goalWizardStep === 4 && wizardData.type === 'no_sweets' && wizardData.targetUnit === 'hours')) ? 'bg-emerald-500 text-slate-900 shadow-emerald-500/30' : 'bg-amber-500 text-slate-900 shadow-amber-500/30') + ' disabled:opacity-50 disabled:active:scale-100 active:scale-95 shadow-lg'}
                 >
                   {t(goalWizardStep === 6 || (goalWizardStep === 4 && wizardData.type === 'no_sweets' && wizardData.targetUnit === 'hours') ? 'Zakończ i aktywuj' : 'Dalej')}
                 </button>
              </div>
            )}

          </div>
        </div>
  );
}
