import { useState } from 'react';
import { Bell, CalendarDays, CheckSquare, ChevronDown, ChevronLeft, ChevronRight, Clock3, Target, X } from 'lucide-react';
import { formatDateStr, getAppDayString, parseLocalDate } from '../../utils/date';
import { useI18n } from '../../i18n-context';

export default function TaskModals({
  editingTask,
  setEditingTask,
  saveEditedTask,
  showAddTaskModal,
  setShowAddTaskModal,
  addTask,
  currentFontConfig,
  tStyle,
  formErrors,
  clearError,
  categories,
  goals,
  taskPickerDate,
  setTaskPickerDate,
  renderCustomCalendar,
  enableNotifications,
  newTaskTitle,
  setNewTaskTitle,
  newTaskCategory,
  setNewTaskCategory,
  newTaskGoalId,
  setNewTaskGoalId,
  newTaskDifficulty,
  setNewTaskDifficulty,
  newTaskRepeat,
  setNewTaskRepeat,
  newTaskDueDate,
  setNewTaskDueDate,
  newTaskIntervalDays,
  setNewTaskIntervalDays,
  newTaskHasReminder,
  setNewTaskHasReminder,
  newTaskReminderTime,
  setNewTaskReminderTime,
  newTaskDuration,
  setNewTaskDuration,
}) {
  const { locale, t } = useI18n();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const todayDate = getAppDayString();
  const tomorrow = parseLocalDate(todayDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = formatDateStr(tomorrow);
  const quickDurations = ['10', '15', '30'];
  const hasCustomDuration = Boolean(newTaskDuration) && !quickDurations.includes(String(newTaskDuration));
  const durationMin = parseInt(newTaskDuration, 10) || 0;
  const basePoints = newTaskDifficulty === 'easy' ? 10 : newTaskDifficulty === 'hard' ? 35 : 20;
  const previewPoints = durationMin > 0 ? Math.max(basePoints, Math.min(50, durationMin)) : basePoints;

  const closeAddTaskModal = () => {
    setShowAdvanced(false);
    setShowCustomDuration(false);
    setShowAddTaskModal(false);
  };

  const submitNewTask = (event) => {
    addTask(event);
    if (newTaskTitle.trim()) {
      setShowAdvanced(false);
      setShowCustomDuration(false);
    }
  };

  return (
    <>
      {editingTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 ' + tStyle.titleText}>{t('Edytuj zadanie')}</h3>
            <form onSubmit={saveEditedTask} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>{t('Tytuł zadania')}</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => { setEditingTask({ ...editingTask, title: e.target.value }); clearError('editingTaskTitle'); }}
                  className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.editingTaskTitle ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-emerald-500'} ${tStyle.inputBg}`}
                />
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>{t('Kategoria (Obszar życia)')}</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {categories.map((cat) => (
                    <button key={cat.id} type="button" onClick={() => setEditingTask({ ...editingTask, category: cat.id })} className={'py-2.5 px-3 ' + currentFontConfig.smallClass + ' rounded-xl text-left transition-all ' + (editingTask.category === cat.id ? tStyle.optSelected : tStyle.optUnselected)}>{t(cat.label)}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>{t('Przypisz do celu')}</label>
                <select value={editingTask.goalId || ''} onChange={(e) => setEditingTask({ ...editingTask, goalId: e.target.value ? parseInt(e.target.value) : null })} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg}>
                  <option value="">{t('-- Brak powiązania z celem --')}</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>{t('Trudność zadania')}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setEditingTask({ ...editingTask, difficulty: 'easy' })} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (editingTask.difficulty === 'easy' ? tStyle.optSelected : tStyle.optUnselected)}>{t('Łatwy')}</button>
                  <button type="button" onClick={() => setEditingTask({ ...editingTask, difficulty: 'medium' })} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (editingTask.difficulty === 'medium' ? tStyle.optSelectedWarning : tStyle.optUnselected)}>{t('Średni')}</button>
                  <button type="button" onClick={() => setEditingTask({ ...editingTask, difficulty: 'hard' })} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (editingTask.difficulty === 'hard' ? tStyle.optSelectedDanger : tStyle.optUnselected)}>{t('Trudny')}</button>
                </div>
              </div>
              {(!editingTask.repeat || editingTask.repeat === 'once') && (
                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>{t('Termin realizacji')}</label>
                  <input type="date" value={editingTask.dueDate} onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })} className={'w-full max-w-full box-border appearance-none rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} style={{ WebkitAppearance: 'none' }} />
                </div>
              )}
              {editingTask.repeat === 'custom' && (
                  <div className="mt-3 space-y-2">
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
                        {renderCustomCalendar(true, editingTask, setEditingTask)}
                      </div>
                    </div>
                  </div>
              )}

              <div className="pt-2 border-t border-slate-500/20">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={editingTask.hasReminder || false} onChange={async (e) => { const checked = e.target.checked; setEditingTask({ ...editingTask, hasReminder: checked }); if (checked) await enableNotifications(); }} className="w-4 h-4 accent-emerald-500 rounded cursor-pointer" />
                  <span className={currentFontConfig.smallClass + ' font-medium ' + tStyle.subText}>{t('Włącz powiadomienie (przypomnienie)')}</span>
                </label>
                {editingTask.hasReminder && (
                  <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>{t('Godzina powiadomienia')}</label>
                    <input type="time" value={editingTask.reminderTime || '08:00'} onChange={(e) => setEditingTask({ ...editingTask, reminderTime: e.target.value })} className={'w-full rounded-2xl px-4 py-2.5 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                  </div>
                )}
              </div>

              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>{t('Czas trwania (w minutach, opcjonalnie)')}</label>
                <input type="number" placeholder="np. 15" value={editingTask.duration || ''} onChange={(e) => setEditingTask({ ...editingTask, duration: e.target.value })} min="1" max="480" className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingTask(null)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>{t('Anuluj')}</button>
                <button type="submit" className={'flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>{t('Zapisz zmiany')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:p-4">
          <div className={'flex h-full w-full flex-col overflow-hidden border shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-3xl ' + tStyle.modalBg}>
            <div className="flex shrink-0 items-center justify-between border-b border-slate-500/20 px-5 py-4">
              <h3 className={currentFontConfig.sizeClass + ' flex items-center gap-2 font-bold text-emerald-500'}>
                <CheckSquare className="h-5 w-5" /> {t('Dodaj nowe zadanie')}
              </h3>
              <button type="button" onClick={closeAddTaskModal} aria-label={t('Zamknij')} className={'rounded-xl p-2 transition-colors ' + tStyle.modalBtnBg}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitNewTask} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                <div>
                  <label className={currentFontConfig.smallClass + ' mb-1 block font-medium ' + tStyle.subText}>{t('Co chcesz zrobić?')}</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder={t('np. 10 minut nauki angielskiego')}
                    value={newTaskTitle}
                    onChange={(e) => { setNewTaskTitle(e.target.value); clearError('newTaskTitle'); }}
                    className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.newTaskTitle ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-emerald-500'} ${tStyle.inputBg}`}
                  />
                  {formErrors.newTaskTitle && <p className="mt-1 text-xs text-red-400">{t('Wpisz tytuł zadania.')}</p>}
                </div>

                {newTaskRepeat === 'once' ? (
                  <div>
                    <label className={currentFontConfig.smallClass + ' mb-2 flex items-center gap-2 font-medium ' + tStyle.subText}>
                      <CalendarDays className="h-4 w-4" /> {t('Kiedy?')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button type="button" onClick={() => setNewTaskDueDate(todayDate)} className={'rounded-xl px-2 py-2.5 ' + currentFontConfig.smallClass + ' transition-all ' + (newTaskDueDate === todayDate ? tStyle.optSelected : tStyle.optUnselected)}>{t('Dzisiaj')}</button>
                      <button type="button" onClick={() => setNewTaskDueDate(tomorrowDate)} className={'rounded-xl px-2 py-2.5 ' + currentFontConfig.smallClass + ' transition-all ' + (newTaskDueDate === tomorrowDate ? tStyle.optSelected : tStyle.optUnselected)}>{t('Jutro')}</button>
                      <label className={'cursor-pointer rounded-xl px-2 py-2.5 text-center ' + currentFontConfig.smallClass + ' transition-all ' + (![todayDate, tomorrowDate].includes(newTaskDueDate) ? tStyle.optSelected : tStyle.optUnselected)}>
                        {t('Inna data')}
                        <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="sr-only" />
                      </label>
                    </div>
                    {![todayDate, tomorrowDate].includes(newTaskDueDate) && (
                      <p className={'mt-2 text-center text-xs ' + tStyle.subText}>{parseLocalDate(newTaskDueDate).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    )}
                  </div>
                ) : (
                  <div className={'flex items-center gap-2 rounded-2xl border p-3 ' + tStyle.cardBg}>
                    <CalendarDays className="h-4 w-4 shrink-0 text-emerald-500" />
                    <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>{t('Termin ustala wybrany niżej harmonogram powtarzania.')}</p>
                  </div>
                )}

                <div>
                  <label className={currentFontConfig.smallClass + ' mb-1 block font-medium ' + tStyle.subText}>{t('Kategoria')}</label>
                  <select value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg}>
                    {categories.map(c => <option key={c.id} value={c.id}>{t(c.label)}</option>)}
                  </select>
                </div>

                <button type="button" onClick={() => setShowAdvanced(value => !value)} className={'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ' + tStyle.cardBg}>
                  <span>
                    <span className={currentFontConfig.smallClass + ' block font-bold ' + tStyle.titleText}>{t('Więcej ustawień')}</span>
                    <span className={'text-xs ' + tStyle.subText}>{t('Cel, trudność, czas, powtarzanie i przypomnienie')}</span>
                  </span>
                  <ChevronDown className={'h-5 w-5 shrink-0 transition-transform ' + (showAdvanced ? 'rotate-180' : '')} />
                </button>

                {showAdvanced && (
                  <div className="space-y-5 border-t border-slate-500/20 pt-5">
                    <div>
                      <label className={currentFontConfig.smallClass + ' mb-1 flex items-center gap-2 font-medium ' + tStyle.subText}><Target className="h-4 w-4" /> {t('Powiąż z celem')}</label>
                      <select value={newTaskGoalId} onChange={(e) => setNewTaskGoalId(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg}>
                        <option value="">{t('Bez powiązania')}</option>
                        {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className={currentFontConfig.smallClass + ' mb-2 block font-medium ' + tStyle.subText}>{t('Trudność i punkty')}</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button type="button" onClick={() => setNewTaskDifficulty('easy')} className={'rounded-xl py-2.5 ' + currentFontConfig.smallClass + ' transition-all ' + (newTaskDifficulty === 'easy' ? tStyle.optSelected : tStyle.optUnselected)}>{t('Łatwe')}<br/><span className="text-xs">+10 {t('PKT')}</span></button>
                        <button type="button" onClick={() => setNewTaskDifficulty('medium')} className={'rounded-xl py-2.5 ' + currentFontConfig.smallClass + ' transition-all ' + (newTaskDifficulty === 'medium' ? tStyle.optSelectedWarning : tStyle.optUnselected)}>{t('Średnie')}<br/><span className="text-xs">+20 {t('PKT')}</span></button>
                        <button type="button" onClick={() => setNewTaskDifficulty('hard')} className={'rounded-xl py-2.5 ' + currentFontConfig.smallClass + ' transition-all ' + (newTaskDifficulty === 'hard' ? tStyle.optSelectedDanger : tStyle.optUnselected)}>{t('Trudne')}<br/><span className="text-xs">+35 {t('PKT')}</span></button>
                      </div>
                    </div>

                    <div>
                      <label className={currentFontConfig.smallClass + ' mb-2 flex items-center gap-2 font-medium ' + tStyle.subText}><Clock3 className="h-4 w-4" /> {t('Czas trwania')}</label>
                      <div className="grid grid-cols-5 gap-1.5">
                        <button type="button" onClick={() => { setNewTaskDuration(''); setShowCustomDuration(false); }} className={'rounded-xl px-1 py-2.5 text-xs transition-all ' + (!newTaskDuration ? tStyle.optSelected : tStyle.optUnselected)}>{t('Bez czasu')}</button>
                        {quickDurations.map(minutes => (
                          <button key={minutes} type="button" onClick={() => { setNewTaskDuration(minutes); setShowCustomDuration(false); }} className={'rounded-xl px-1 py-2.5 text-xs transition-all ' + (String(newTaskDuration) === minutes ? tStyle.optSelected : tStyle.optUnselected)}>{minutes} min</button>
                        ))}
                        <button type="button" onClick={() => setShowCustomDuration(true)} className={'rounded-xl px-1 py-2.5 text-xs transition-all ' + ((showCustomDuration || hasCustomDuration) ? tStyle.optSelected : tStyle.optUnselected)}>{t('Inny')}</button>
                      </div>
                      {(showCustomDuration || hasCustomDuration) && (
                        <input autoFocus type="number" placeholder={t('Liczba minut')} value={newTaskDuration} onChange={(e) => setNewTaskDuration(e.target.value)} min="1" max="480" className={'mt-2 w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                      )}
                      {durationMin > 0 && <p className={'mt-1 text-xs ' + tStyle.subText}>{t('Zadanie uruchomi stoper. Punktacja: +{{points}} PKT.', { points: previewPoints })}</p>}
                    </div>

                    <div>
                      <label className={currentFontConfig.smallClass + ' mb-2 block font-medium ' + tStyle.subText}>{t('Powtarzanie')}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setNewTaskRepeat('once')} className={'rounded-xl py-2.5 ' + currentFontConfig.smallClass + ' transition-all ' + (newTaskRepeat === 'once' ? tStyle.optSelected : tStyle.optUnselected)}>{t('Jednorazowe')}</button>
                        <button type="button" onClick={() => setNewTaskRepeat('daily')} className={'rounded-xl py-2.5 ' + currentFontConfig.smallClass + ' transition-all ' + (newTaskRepeat === 'daily' ? tStyle.optSelected : tStyle.optUnselected)}>{t('Codziennie')}</button>
                        <button type="button" onClick={() => setNewTaskRepeat('interval')} className={'rounded-xl py-2.5 ' + currentFontConfig.smallClass + ' transition-all ' + (newTaskRepeat === 'interval' ? tStyle.optSelected : tStyle.optUnselected)}>{t('Co kilka dni')}</button>
                        <button type="button" onClick={() => setNewTaskRepeat('custom')} className={'rounded-xl py-2.5 ' + currentFontConfig.smallClass + ' transition-all ' + (newTaskRepeat === 'custom' ? tStyle.optSelected : tStyle.optUnselected)}>{t('Wybrane daty')}</button>
                      </div>
                      {newTaskRepeat === 'interval' && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className={currentFontConfig.smallClass + ' ' + tStyle.subText}>{t('Powtarzaj co')}</span>
                          <input type="number" min="2" max="30" value={newTaskIntervalDays} onChange={(e) => setNewTaskIntervalDays(e.target.value)} className={'w-20 rounded-xl px-3 py-2 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                          <span className={currentFontConfig.smallClass + ' ' + tStyle.subText}>{t('dni')}</span>
                        </div>
                      )}
                      {newTaskRepeat === 'custom' && (
                        <div className={'mt-3 rounded-2xl border p-3 ' + tStyle.cardBg}>
                          <div className="mb-2 flex items-center justify-between">
                            <span className={'font-bold capitalize ' + currentFontConfig.smallClass + ' ' + tStyle.titleText}>{taskPickerDate.toLocaleString(locale, { month: 'long', year: 'numeric' })}</span>
                            <div className="flex gap-1">
                              <button type="button" onClick={() => setTaskPickerDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="rounded p-1 hover:bg-slate-500/20"><ChevronLeft className="h-4 w-4" /></button>
                              <button type="button" onClick={() => setTaskPickerDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="rounded p-1 hover:bg-slate-500/20"><ChevronRight className="h-4 w-4" /></button>
                            </div>
                          </div>
                          <div className={'mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold ' + tStyle.subText}><span>{t('Pn')}</span><span>{t('Wt')}</span><span>{t('Śr')}</span><span>{t('Cz')}</span><span>{t('Pt')}</span><span>{t('Sob')}</span><span>{t('Ndz')}</span></div>
                          <div className="grid grid-cols-7 gap-1">{renderCustomCalendar(false, null, null)}</div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-500/20 pt-4">
                      <label className="flex cursor-pointer items-center justify-between gap-3">
                        <span className="flex items-center gap-2"><Bell className="h-4 w-4 text-emerald-500" /><span className={currentFontConfig.smallClass + ' font-medium ' + tStyle.subText}>{t('Przypomnienie')}</span></span>
                        <input type="checkbox" checked={newTaskHasReminder} onChange={async (e) => { const checked = e.target.checked; setNewTaskHasReminder(checked); if (checked) await enableNotifications(); }} className="h-5 w-5 cursor-pointer rounded accent-emerald-500" />
                      </label>
                      {newTaskHasReminder && (
                        <input type="time" value={newTaskReminderTime} onChange={(e) => setNewTaskReminderTime(e.target.value)} className={'mt-3 w-full rounded-2xl px-4 py-2.5 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 gap-3 border-t border-slate-500/20 p-4">
                <button type="button" onClick={closeAddTaskModal} className={'px-5 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>{t('Anuluj')}</button>
                <button type="submit" className={'min-w-0 flex-1 rounded-2xl bg-emerald-500 px-3 py-3 font-bold text-slate-950 hover:bg-emerald-400 ' + currentFontConfig.smallClass}>{t('Dodaj zadanie · +{{points}} PKT', { points: previewPoints })}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
