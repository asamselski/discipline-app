import { CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react';

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
  return (
    <>
      {editingTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 ' + tStyle.titleText}>Edytuj zadanie</h3>
            <form onSubmit={saveEditedTask} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Tytuł zadania</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => { setEditingTask({ ...editingTask, title: e.target.value }); clearError('editingTaskTitle'); }}
                  className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.editingTaskTitle ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-emerald-500'} ${tStyle.inputBg}`}
                />
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Kategoria (Obszar życia)</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {categories.map((cat) => (
                    <button key={cat.id} type="button" onClick={() => setEditingTask({ ...editingTask, category: cat.id })} className={'py-2.5 px-3 ' + currentFontConfig.smallClass + ' rounded-xl text-left transition-all ' + (editingTask.category === cat.id ? tStyle.optSelected : tStyle.optUnselected)}>{cat.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Przypisz do celu</label>
                <select value={editingTask.goalId || ''} onChange={(e) => setEditingTask({ ...editingTask, goalId: e.target.value ? parseInt(e.target.value) : null })} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg}>
                  <option value="">-- Brak powiązania z celem --</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Trudność zadania</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setEditingTask({ ...editingTask, difficulty: 'easy' })} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (editingTask.difficulty === 'easy' ? tStyle.optSelected : tStyle.optUnselected)}>Łatwy</button>
                  <button type="button" onClick={() => setEditingTask({ ...editingTask, difficulty: 'medium' })} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (editingTask.difficulty === 'medium' ? tStyle.optSelectedWarning : tStyle.optUnselected)}>Średni</button>
                  <button type="button" onClick={() => setEditingTask({ ...editingTask, difficulty: 'hard' })} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (editingTask.difficulty === 'hard' ? tStyle.optSelectedDanger : tStyle.optUnselected)}>Trudny</button>
                </div>
              </div>
              {(!editingTask.repeat || editingTask.repeat === 'once') && (
                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Termin realizacji</label>
                  <input type="date" value={editingTask.dueDate} onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })} className={'w-full max-w-full box-border appearance-none rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} style={{ WebkitAppearance: 'none' }} />
                </div>
              )}
              {editingTask.repeat === 'custom' && (
                  <div className="mt-3 space-y-2">
                    <label className={currentFontConfig.smallClass + ' font-medium block ' + tStyle.subText}>Zaznacz dni w kalendarzu:</label>
                    <div className={'p-3 rounded-2xl border ' + tStyle.cardBg}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={'font-bold ' + currentFontConfig.smallClass + ' ' + tStyle.titleText}>{taskPickerDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setTaskPickerDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="p-1 rounded hover:bg-slate-500/20"><ChevronLeft className="w-4 h-4" /></button>
                          <button type="button" onClick={() => setTaskPickerDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="p-1 rounded hover:bg-slate-500/20"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className={'grid grid-cols-7 gap-1 text-center text-[10px] font-semibold mb-1 ' + tStyle.subText}>
                        <span>Pn</span><span>Wt</span><span>Śr</span><span>Cz</span><span>Pt</span><span>Sob</span><span>Ndz</span>
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
                  <span className={currentFontConfig.smallClass + ' font-medium ' + tStyle.subText}>Włącz powiadomienie (przypomnienie)</span>
                </label>
                {editingTask.hasReminder && (
                  <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Godzina powiadomienia</label>
                    <input type="time" value={editingTask.reminderTime || '08:00'} onChange={(e) => setEditingTask({ ...editingTask, reminderTime: e.target.value })} className={'w-full rounded-2xl px-4 py-2.5 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                  </div>
                )}
              </div>

              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Czas trwania (w minutach, opcjonalnie)</label>
                <input type="number" placeholder="np. 15" value={editingTask.duration || ''} onChange={(e) => setEditingTask({ ...editingTask, duration: e.target.value })} min="1" max="480" className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingTask(null)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                <button type="submit" className={'flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>Zapisz zmiany</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 flex items-center gap-2 text-emerald-500'}><CheckSquare className="w-5 h-5"/> Dodaj nowe zadanie</h3>
            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Tytuł zadania</label>
                <input
                  type="text" placeholder="np. Nauka angielskiego (Wymagane)" value={newTaskTitle}
                  onChange={(e) => { setNewTaskTitle(e.target.value); clearError('newTaskTitle'); }}
                  className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.newTaskTitle ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-emerald-500'} ${tStyle.inputBg}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Kategoria</label>
                    <select value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg}>
                       {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Przypisz cel</label>
                    <select value={newTaskGoalId} onChange={(e) => setNewTaskGoalId(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg}>
                      <option value="">Brak</option>
                      {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>
                 </div>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Trudność zadania</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setNewTaskDifficulty('easy')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskDifficulty === 'easy' ? tStyle.optSelected : tStyle.optUnselected)}>Łatwy</button>
                  <button type="button" onClick={() => setNewTaskDifficulty('medium')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskDifficulty === 'medium' ? tStyle.optSelectedWarning : tStyle.optUnselected)}>Średni</button>
                  <button type="button" onClick={() => setNewTaskDifficulty('hard')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskDifficulty === 'hard' ? tStyle.optSelectedDanger : tStyle.optUnselected)}>Trudny</button>
                </div>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Powtarzalność / Typ</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button type="button" onClick={() => setNewTaskRepeat('once')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskRepeat === 'once' ? tStyle.optSelected : tStyle.optUnselected)}>Jednorazowe</button>
                  <button type="button" onClick={() => setNewTaskRepeat('daily')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskRepeat === 'daily' ? tStyle.optSelected : tStyle.optUnselected)}>Codziennie</button>
                  <button type="button" onClick={() => setNewTaskRepeat('interval')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskRepeat === 'interval' ? tStyle.optSelected : tStyle.optUnselected)}>Co kilka dni</button>
                  <button type="button" onClick={() => setNewTaskRepeat('custom')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskRepeat === 'custom' ? tStyle.optSelected : tStyle.optUnselected)}>Niestandardowe</button>
                </div>
                {(!newTaskRepeat || newTaskRepeat === 'once') && (
                  <div className="mt-2">
                    <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className={'w-full max-w-full box-border appearance-none rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} style={{ WebkitAppearance: 'none' }} />
                  </div>
                )}
                {newTaskRepeat === 'interval' && (
                  <div className="mt-2">
                    <input type="number" min="2" max="30" value={newTaskIntervalDays} placeholder="Co ile dni?" onChange={(e) => setNewTaskIntervalDays(e.target.value)} className={'w-full rounded-2xl px-4 py-2.5 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                  </div>
                )}
                {newTaskRepeat === 'custom' && (
                  <div className="mt-3 space-y-2">
                    <div className={'p-3 rounded-2xl border ' + tStyle.cardBg}>
                      <div className="grid grid-cols-7 gap-1">
                        {renderCustomCalendar(false, null, null)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-slate-500/20">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={newTaskHasReminder} onChange={async (e) => { const checked = e.target.checked; setNewTaskHasReminder(checked); if (checked) await enableNotifications(); }} className="w-4 h-4 accent-emerald-500 rounded cursor-pointer" />
                  <span className={currentFontConfig.smallClass + ' font-medium ' + tStyle.subText}>Włącz powiadomienie (przypomnienie)</span>
                </label>
                {newTaskHasReminder && (
                  <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Godzina powiadomienia</label>
                    <input type="time" value={newTaskReminderTime} onChange={(e) => setNewTaskReminderTime(e.target.value)} className={'w-full rounded-2xl px-4 py-2.5 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                  </div>
                )}
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Czas trwania (w minutach, opcjonalnie)</label>
                <input type="number" placeholder="Włącz stoper dla tego zadania..." value={newTaskDuration} onChange={(e) => setNewTaskDuration(e.target.value)} min="1" max="480" className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
              </div>
              <div className="flex gap-3 pt-2 border-t border-slate-500/20">
                <button type="button" onClick={() => setShowAddTaskModal(false)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                <button type="submit" className={'flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>Dodaj zadanie</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
