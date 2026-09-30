import { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Flag, Sparkles, Target, Trophy, UserRound, X } from 'lucide-react';
import { useI18n } from '../../i18n-context';

const FEATURES = [
  { icon: CheckCircle2, title: 'Planuj dzień', text: 'Wybieraj priorytety i realizuj zadania krok po kroku.' },
  { icon: Target, title: 'Pracuj nad celami', text: 'Łącz małe działania z tym, co naprawdę chcesz osiągnąć.' },
  { icon: Trophy, title: 'Obserwuj postęp', text: 'Zdobywaj punkty, rangi i trofea za konsekwentne działanie.' },
];

const TASK_EXAMPLES = {
  Zdrowie: 'np. Przygotować zdrowe śniadanie',
  Sport: 'np. 10 minut spokojnego spaceru',
  Książka: 'np. Przeczytać 5 stron',
  Nauka: 'np. Uczyć się przez 10 minut',
  Praca: 'np. Wykonać pierwszy 15-minutowy krok',
  Ogólne: 'np. Zrobić jedną prostą rzecz przez 10 minut',
};

export default function OnboardingModal({
  isOpen,
  initialName,
  categories,
  canClose,
  onComplete,
  onSkip,
  currentFontConfig,
  tStyle,
}) {
  const { language, setLanguage, t } = useI18n();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialName === 'Wojownik' ? '' : initialName);
  const [goals, setGoals] = useState([{ title: '', category: 'Ogólne' }]);
  const [taskPlans, setTaskPlans] = useState([{ createTask: true, title: '' }]);
  const [bookPlan, setBookPlan] = useState({ addBook: false, title: '', totalPages: '', status: 'in_progress' });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const goToGoals = () => {
    if (!name.trim()) {
      setErrors({ name: true });
      return;
    }
    setErrors({});
    setStep(2);
  };

  const goToTasks = () => {
    const missingGoals = goals.map((goal) => !goal.title.trim());
    if (missingGoals.some(Boolean)) {
      setErrors({ goals: missingGoals });
      return;
    }
    if (goals[0].category === 'Książka' && bookPlan.addBook && !bookPlan.title.trim()) {
      setErrors({ bookTitle: true });
      return;
    }
    setErrors({});
    setStep(3);
  };

  const finish = () => {
    const invalidTasks = taskPlans.map((task) => task.createTask && !task.title.trim());
    if (invalidTasks.some(Boolean)) {
      setErrors({ tasks: invalidTasks });
      return;
    }
    const selectedBook = goals[0].category === 'Książka' && bookPlan.addBook ? bookPlan : null;
    onComplete({ name: name.trim(), goals, taskPlans, bookPlan: selectedBook });
  };

  const updateGoal = (index, changes) => {
    setGoals((current) => current.map((goal, goalIndex) => goalIndex === index ? { ...goal, ...changes } : goal));
    setErrors({});
  };

  const updateTask = (index, changes) => {
    setTaskPlans((current) => current.map((task, taskIndex) => taskIndex === index ? { ...task, ...changes } : task));
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className={'w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 md:p-8 relative ' + tStyle.modalBg}>
        {canClose && (
          <button onClick={onSkip} className={'absolute top-4 right-4 p-2 rounded-xl ' + tStyle.modalBtnBg} title={t('Zamknij')}><X className="w-5 h-5" /></button>
        )}

        <div className="flex items-center justify-center gap-2 mb-7">
          {[1, 2, 3].map((number) => (
            <div key={number} className={'h-2 rounded-full transition-all ' + (step === number ? 'w-10 bg-emerald-500' : step > number ? 'w-6 bg-emerald-500/60' : 'w-6 bg-slate-500/25')} />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <p className={currentFontConfig.smallClass + ' mb-2 text-center font-semibold ' + tStyle.subText}>{t('Wybierz język')}</p>
              <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => setLanguage('pl')}
                  aria-pressed={language === 'pl'}
                  className={'rounded-2xl border px-3 py-2.5 font-bold transition-all ' + currentFontConfig.smallClass + ' ' + (language === 'pl' ? tStyle.optSelected : tStyle.optUnselected)}
                >
                  🇵🇱 Polski
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  aria-pressed={language === 'en'}
                  className={'rounded-2xl border px-3 py-2.5 font-bold transition-all ' + currentFontConfig.smallClass + ' ' + (language === 'en' ? tStyle.optSelected : tStyle.optUnselected)}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            <div className="text-center mb-7">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 flex items-center justify-center"><Sparkles className="w-8 h-8" /></div>
              <h1 className={currentFontConfig.headerClass + ' font-bold mb-2 ' + tStyle.titleText}>{t('Witaj w SamoDyscyplinie')}</h1>
              <p className={currentFontConfig.sizeClass + ' ' + tStyle.subText}>{t('To miejsce, w którym zamieniasz ważne cele w działania możliwe do wykonania każdego dnia.')}</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center mb-6">
              <strong className={'text-amber-500 ' + currentFontConfig.sizeClass}>{t('„Wielkie cele realizuje się małymi krokami.”')}</strong>
              <p className={currentFontConfig.smallClass + ' mt-1 ' + tStyle.subText}>{t('Nie musisz zrobić wszystkiego od razu. Najważniejsze, aby zrobić pierwszy realny krok.')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-7">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/20">
                  <Icon className="w-5 h-5 text-emerald-500 mb-2" />
                  <strong className={'block mb-1 ' + currentFontConfig.smallClass + ' ' + tStyle.titleText}>{t(title)}</strong>
                  <p className={'text-xs leading-relaxed ' + tStyle.subText}>{t(text)}</p>
                </div>
              ))}
            </div>

            <label className={currentFontConfig.smallClass + ' font-bold block mb-2 ' + tStyle.titleText}>{t('Jak masz na imię?')}</label>
            <div className="relative">
              <UserRound className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
              <input value={name} onChange={(event) => { setName(event.target.value); setErrors({}); }} onKeyDown={(event) => event.key === 'Enter' && goToGoals()} placeholder={t('Wpisz swoje imię')} className={'w-full rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none transition-all ' + currentFontConfig.sizeClass + ' ' + tStyle.inputBg + (errors.name ? ' ring-2 ring-red-500' : '')} />
            </div>
            {errors.name && <p className={currentFontConfig.smallClass + ' text-red-500 mt-2'}>{t('Wpisz imię, aby przejść dalej.')}</p>}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button onClick={onSkip} className={'sm:w-auto px-5 py-3 rounded-2xl font-bold ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>{t('Pomiń na razie')}</button>
              <button onClick={goToGoals} className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center gap-2">{t('Zaczynamy')} <ArrowRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center"><Target className="w-7 h-7" /></div>
              <h2 className={currentFontConfig.headerClass + ' font-bold mb-2 ' + tStyle.titleText}>{t('{{name}}, wybierz ważny cel', { name })}</h2>
              <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>{t('Zapisz rezultaty, które naprawdę mają dla Ciebie znaczenie. Szczegóły możesz później zmienić.')}</p>
            </div>

            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={index} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/25">
                  <label className={currentFontConfig.smallClass + ' font-bold block mb-2 text-amber-500'}>{t('Twój cel')}</label>
                  <input value={goal.title} onChange={(event) => updateGoal(index, { title: event.target.value })} placeholder={t('np. Poprawić kondycję')} className={'w-full rounded-xl px-4 py-3 mb-3 focus:outline-none focus:border-amber-500 ' + currentFontConfig.sizeClass + ' ' + tStyle.inputBg + (errors.goals?.[index] ? ' ring-2 ring-red-500' : '')} />
                  <select value={goal.category} onChange={(event) => updateGoal(index, { category: event.target.value })} className={'w-full rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 ' + currentFontConfig.smallClass + ' ' + tStyle.inputBg}>
                    {categories.map((category) => <option key={category.id} value={category.id}>{t(category.label)}</option>)}
                  </select>

                  {goal.category === 'Książka' && (
                    <div className="mt-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4">
                      <button type="button" onClick={() => { setBookPlan(current => ({ ...current, addBook: !current.addBook })); setErrors({}); }} className="flex w-full items-center justify-between gap-3 text-left">
                        <span className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-sky-500" /><span className={currentFontConfig.smallClass + ' font-bold ' + tStyle.titleText}>{t('Dodaj książkę do Mojej Biblioteki')}</span></span>
                        <span className={'rounded-xl border px-3 py-2 font-bold ' + currentFontConfig.smallClass + ' ' + (bookPlan.addBook ? tStyle.optSelected : tStyle.optUnselected)}>{bookPlan.addBook ? t('Tak') : t('Nie teraz')}</span>
                      </button>

                      {bookPlan.addBook && (
                        <div className="mt-4 space-y-3 border-t border-sky-500/20 pt-4">
                          <div>
                            <label className={currentFontConfig.smallClass + ' mb-1 block font-medium ' + tStyle.subText}>{t('Tytuł książki')}</label>
                            <input value={bookPlan.title} onChange={(event) => { setBookPlan(current => ({ ...current, title: event.target.value })); setErrors({}); }} placeholder={t('Wpisz tytuł książki')} className={'w-full rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 ' + currentFontConfig.sizeClass + ' ' + tStyle.inputBg + (errors.bookTitle ? ' ring-2 ring-red-500' : '')} />
                            {errors.bookTitle && <p className={currentFontConfig.smallClass + ' mt-1 text-red-500'}>{t('Wpisz tytuł książki.')}</p>}
                          </div>
                          <div>
                            <label className={currentFontConfig.smallClass + ' mb-1 block font-medium ' + tStyle.subText}>{t('Liczba stron (opcjonalnie)')}</label>
                            <input type="number" min="1" value={bookPlan.totalPages} onChange={(event) => setBookPlan(current => ({ ...current, totalPages: event.target.value }))} placeholder="np. 320" className={'w-full rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 ' + currentFontConfig.sizeClass + ' ' + tStyle.inputBg} />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => setBookPlan(current => ({ ...current, status: 'planned' }))} className={'rounded-xl border py-2.5 font-bold ' + currentFontConfig.smallClass + ' ' + (bookPlan.status === 'planned' ? tStyle.optSelectedWarning : tStyle.optUnselected)}>{t('W planach')}</button>
                            <button type="button" onClick={() => setBookPlan(current => ({ ...current, status: 'in_progress' }))} className={'rounded-xl border py-2.5 font-bold ' + currentFontConfig.smallClass + ' ' + (bookPlan.status === 'in_progress' ? tStyle.optSelected : tStyle.optUnselected)}>{t('Od razu czytam')}</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {errors.goals?.some(Boolean) && <p className={currentFontConfig.smallClass + ' text-red-500 mt-2'}>{t('Nadaj nazwę swojemu celowi.')}</p>}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className={'px-5 py-3 rounded-2xl font-bold flex items-center gap-2 ' + tStyle.modalBtnBg}><ArrowLeft className="w-4 h-4" /> {t('Wstecz')}</button>
              <button onClick={goToTasks} className="flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center gap-2">{t('Dalej')} <ArrowRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fadeIn">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-500 flex items-center justify-center"><Flag className="w-7 h-7" /></div>
              <h2 className={currentFontConfig.headerClass + ' font-bold mb-2 ' + tStyle.titleText}>{t('Zaplanuj pierwszy mały krok')}</h2>
              <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>{t('Czy chcesz dodać proste zadanie do swojego celu? Wybierz coś realnego, co możesz zrobić dziś bez wielkiego przygotowania.')}</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-5">
              <strong className={'text-emerald-500 block ' + currentFontConfig.smallClass}>{t('Wielkie cele realizuje się małymi krokami.')}</strong>
              <p className={'mt-1 ' + currentFontConfig.smallClass + ' ' + tStyle.subText}>{t('Dobre pierwsze zadanie powinno być konkretne, łatwe do rozpoczęcia i możliwe do wykonania w kilkanaście minut.')}</p>
            </div>

            <div className="space-y-4">
              {goals.map((goal, index) => {
                const task = taskPlans[index];
                return (
                  <div key={index} className="p-4 rounded-2xl border border-slate-500/20 bg-slate-500/5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div><span className={currentFontConfig.smallClass + ' text-amber-500 font-bold'}>{t('Twój cel')}</span><strong className={'block ' + tStyle.titleText}>{goal.title}</strong></div>
                      <button onClick={() => updateTask(index, { createTask: !task.createTask })} className={'px-3 py-2 rounded-xl border font-bold ' + currentFontConfig.smallClass + ' ' + (task.createTask ? tStyle.optSelected : tStyle.optUnselected)}>
                        {task.createTask ? <span className="flex items-center gap-1"><Check className="w-4 h-4" /> {t('Tak')}</span> : t('Nie teraz')}
                      </button>
                    </div>
                    {task.createTask && (
                      <input value={task.title} onChange={(event) => updateTask(index, { title: event.target.value })} placeholder={t(TASK_EXAMPLES[goal.category] || TASK_EXAMPLES.Ogólne)} className={'w-full rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 ' + currentFontConfig.sizeClass + ' ' + tStyle.inputBg + (errors.tasks?.[index] ? ' ring-2 ring-red-500' : '')} />
                    )}
                  </div>
                );
              })}
            </div>
            {errors.tasks?.some(Boolean) && <p className={currentFontConfig.smallClass + ' text-red-500 mt-2'}>{t('Wpisz nazwę wybranego pierwszego kroku.')}</p>}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className={'px-5 py-3 rounded-2xl font-bold flex items-center gap-2 ' + tStyle.modalBtnBg}><ArrowLeft className="w-4 h-4" /> {t('Wstecz')}</button>
              <button onClick={finish} className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> {t('Utwórz mój plan')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
