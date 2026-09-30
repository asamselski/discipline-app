import { useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronRight, Clock3, Inbox, Trash2, X } from 'lucide-react';
import { formatDateStr, parseLocalDate } from '../../utils/date';
import { useI18n } from '../../i18n-context';

const DAY_REASONS = [
  'Zaplanowałem za dużo',
  'Brak czasu',
  'Brak energii',
  'Zapomniałem',
  'Zadanie było za trudne lub niejasne',
  'Przeszkoda zewnętrzna',
  'Zadanie straciło znaczenie',
];

export default function DayClosureModal({
  date,
  tasks,
  completedCount,
  totalCount,
  points,
  priorityCompletedCount,
  priorityCount,
  initialReflection,
  existingResults = [],
  onResolveTask,
  onFinish,
  onClose,
  currentFontConfig,
  tStyle,
}) {
  const { t } = useI18n();
  const [resolvedIds, setResolvedIds] = useState(() => new Set());
  const [reasons, setReasons] = useState({});
  const [customDates, setCustomDates] = useState({});
  const [results, setResults] = useState([]);
  const [reflection, setReflection] = useState(initialReflection || '');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [initialSummary] = useState({ completedCount, totalCount, points, priorityCompletedCount, priorityCount });
  const [initialTaskCount] = useState(tasks.length);

  const tomorrow = parseLocalDate(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDateStr(tomorrow);
  const previouslyResolvedIds = new Set(existingResults.map((result) => result.taskId));
  const pendingTasks = tasks.filter((task) => !resolvedIds.has(task.id) && !previouslyResolvedIds.has(task.id));
  const completedDuringClosure = results.filter((result) => result.action === 'done').length;
  const priorityCompletedDuringClosure = results.filter((result) => result.action === 'done' && result.wasPriority).length;
  const pointsDuringClosure = results
    .filter((result) => result.action === 'done')
    .reduce((sum, result) => sum + result.points, 0);
  const currentSummary = {
    completed: Math.min(initialSummary.totalCount, initialSummary.completedCount + completedDuringClosure),
    total: initialSummary.totalCount,
    points: initialSummary.points + pointsDuringClosure,
    priorityCompleted: Math.min(initialSummary.priorityCount, initialSummary.priorityCompletedCount + priorityCompletedDuringClosure),
    priorityTotal: initialSummary.priorityCount,
  };
  const closeForLater = () => onClose({
    results: [...existingResults, ...results],
    reflection: reflection.trim(),
    summary: currentSummary,
  });

  const resolve = (task, action, toDate = null) => {
    const resolution = {
      taskId: task.id,
      title: task.title,
      action,
      reason: reasons[task.id] || '',
      fromDate: date,
      toDate,
      wasPriority: Boolean(task.isPriority && task.priorityDate === date),
      points: task.closurePoints ?? (task.pkt || 20),
    };
    onResolveTask(task, resolution);
    setResults((current) => [...current, resolution]);
    setResolvedIds((current) => new Set([...current, task.id]));
    setConfirmDeleteId(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[600] overflow-y-auto animate-fadeIn">
      <div className={'w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl p-5 md:p-7 shadow-2xl border border-emerald-500/30 ' + tStyle.modalBg}>
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-500/20">
          <div>
            <h2 className={currentFontConfig.headerClass + ' font-bold ' + tStyle.titleText}>{t('Zamknij dzień')}</h2>
            <p className={currentFontConfig.smallClass + ' mt-1 ' + tStyle.subText}>{t('Uporządkuj niedokończone sprawy i zostaw krótką refleksję.')}</p>
          </div>
          <button onClick={closeForLater} className={'p-2 rounded-xl shrink-0 ' + tStyle.modalBtnBg}><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"><span className={'block ' + currentFontConfig.smallClass + ' ' + tStyle.subText}>{t('Zadania')}</span><strong className="text-xl text-emerald-500">{Math.min(initialSummary.totalCount, initialSummary.completedCount + completedDuringClosure)}/{initialSummary.totalCount}</strong></div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20"><span className={'block ' + currentFontConfig.smallClass + ' ' + tStyle.subText}>{t('Priorytety')}</span><strong className="text-xl text-amber-500">{Math.min(initialSummary.priorityCount, initialSummary.priorityCompletedCount + priorityCompletedDuringClosure)}/{initialSummary.priorityCount}</strong></div>
          <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20"><span className={'block ' + currentFontConfig.smallClass + ' ' + tStyle.subText}>{t('Punkty')}</span><strong className="text-xl text-violet-500">+{initialSummary.points + pointsDuringClosure}</strong></div>
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20"><span className={'block ' + currentFontConfig.smallClass + ' ' + tStyle.subText}>{t('Do decyzji')}</span><strong className="text-xl text-sky-500">{pendingTasks.length}</strong></div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {pendingTasks.length > 0 ? pendingTasks.map((task) => {
            const recurring = task.repeat && task.repeat !== 'once';
            const askReason = (task.carriedCount || 0) >= 1 || initialTaskCount >= 3;
            return (
              <div key={task.id} className="p-4 rounded-2xl border border-slate-500/20 bg-slate-500/5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <strong className={currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{task.title}</strong>
                    <span className={currentFontConfig.smallClass + ' block mt-1 ' + tStyle.subText}>{t(recurring ? 'Zadanie powtarzalne' : 'Zadanie jednorazowe')}{task.carriedCount ? ` • ${t('przeniesiono {{count}}×', { count: task.carriedCount })}` : ''}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-500/10">{t(task.category)}</span>
                </div>

                {askReason && (
                  <div className="mb-3">
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-2 ' + tStyle.subText}>{t('Co przeszkodziło?')} <span className="opacity-60">{t('(opcjonalnie)')}</span></label>
                    <select value={reasons[task.id] || ''} onChange={(event) => setReasons((current) => ({ ...current, [task.id]: event.target.value }))} className={'w-full rounded-xl px-3 py-2.5 ' + currentFontConfig.smallClass + ' ' + tStyle.inputBg}>
                      <option value="">{t('Pomiń odpowiedź')}</option>
                      {DAY_REASONS.map((reason) => <option key={reason} value={reason}>{t(reason)}</option>)}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button onClick={() => resolve(task, 'done')} className="py-2.5 px-3 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {t('Wykonałem')}</button>
                  {recurring ? (
                    <button onClick={() => resolve(task, 'skipped')} className={'py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 ' + tStyle.modalBtnBg}><ChevronRight className="w-4 h-4" /> {t('Pomiń dziś')}</button>
                  ) : (
                    <>
                      <button onClick={() => resolve(task, 'tomorrow', tomorrowStr)} className="py-2.5 px-3 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold flex items-center justify-center gap-1.5"><Clock3 className="w-4 h-4" /> {t('Jutro')}</button>
                      <button onClick={() => resolve(task, 'waiting')} className="py-2.5 px-3 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30 font-bold flex items-center justify-center gap-1.5"><Inbox className="w-4 h-4" /> {t('Poczekalnia')}</button>
                    </>
                  )}
                </div>

                {!recurring && (
                  <div className="mt-2 flex flex-col sm:flex-row gap-2">
                    <div className="flex flex-1 gap-2">
                      <input type="date" min={tomorrowStr} value={customDates[task.id] || tomorrowStr} onChange={(event) => setCustomDates((current) => ({ ...current, [task.id]: event.target.value }))} className={'min-w-0 flex-1 rounded-xl px-3 py-2.5 ' + currentFontConfig.smallClass + ' ' + tStyle.inputBg} />
                      <button onClick={() => resolve(task, 'date', customDates[task.id] || tomorrowStr)} className={'px-3 rounded-xl font-bold flex items-center gap-1.5 ' + tStyle.modalBtnBg}><CalendarDays className="w-4 h-4" /> {t('Przenieś')}</button>
                    </div>
                    {confirmDeleteId === task.id ? (
                      <button onClick={() => resolve(task, 'deleted')} className="py-2.5 px-3 rounded-xl bg-red-500 text-white font-bold">{t('Potwierdź usunięcie')}</button>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(task.id)} className="py-2.5 px-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold flex items-center justify-center gap-1.5"><Trash2 className="w-4 h-4" /> {t('Usuń')}</button>
                    )}
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <strong className="text-emerald-500">{t('Wszystkie zadania zostały uporządkowane.')}</strong>
            </div>
          )}

          <div className="pt-2">
            <label className={currentFontConfig.smallClass + ' font-bold block mb-2 ' + tStyle.titleText}>{t('Co dziś najbardziej pomogło albo przeszkodziło?')} <span className={'font-normal ' + tStyle.subText}>{t('(opcjonalnie)')}</span></label>
            <textarea rows="3" value={reflection} onChange={(event) => setReflection(event.target.value)} placeholder={t('Jedno zdanie wystarczy...')} className={'w-full rounded-2xl p-4 resize-none focus:outline-none focus:border-emerald-500 ' + currentFontConfig.sizeClass + ' ' + tStyle.inputBg} />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-500/20 flex gap-3">
          <button onClick={closeForLater} className={'flex-1 py-3 rounded-2xl font-bold ' + tStyle.modalBtnBg}>{t('Zamknij później')}</button>
          <button disabled={pendingTasks.length > 0} onClick={() => onFinish({ results: [...existingResults, ...results], reflection: reflection.trim(), summary: currentSummary })} className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed">{t('Zakończ dzień')}</button>
        </div>
      </div>
    </div>
  );
}
