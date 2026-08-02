// src/components/tabs/GoalsTab.jsx
import React from 'react';
import { Target, ChevronDown, CheckCircle2, Dumbbell, Utensils, Brain, Edit3, Trash2, Circle, Archive } from 'lucide-react';

export default function GoalsTab({
  currentFontConfig, tStyle, openGoalWizard, activeGoalsCollapsed, setActiveGoalsCollapsed,
  goals, setEditingGoal, setConfirmDeleteModal, futureTasksCollapsed, setFutureTasksCollapsed,
  futureTasks, getCategoryStyle, setConfirmCompleteModal, setCompleteTaskValue, tomorrowStr,
  setEditingTask, setShowArchiveModal
}) {
  return (
    <>
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className={currentFontConfig.headerClass + ' font-bold tracking-tight ' + tStyle.titleText}>Cele i Zadania</h1>
          <p className={currentFontConfig.smallClass + ' md:text-base ' + tStyle.subText}>Globalne centrum zarządzania celami oraz zadaniami</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={openGoalWizard} className={'bg-amber-500 hover:bg-amber-400 transition-colors text-slate-950 font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg ' + currentFontConfig.smallClass}><Target className="w-4 h-4" /> + Cel</button>
        </div>
      </header>

      <div className="mb-8">
        <div className="space-y-4 col-span-full">
          <div 
              className="flex justify-between items-center cursor-pointer" 
              onClick={() => setActiveGoalsCollapsed(!activeGoalsCollapsed)}
          >
             <h3 className={currentFontConfig.smallClass + ' font-semibold uppercase tracking-wider ' + tStyle.subText}>Twoje Aktywne Cele</h3>
             <ChevronDown className={`w-5 h-5 transition-transform ${tStyle.subText} ${activeGoalsCollapsed ? '-rotate-90' : ''}`} />
          </div>
          
          {!activeGoalsCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
              {goals.length > 0 ? (
                goals.map(goal => {
                  const currentVal = goal.currentPage || 0;
                  const percent = Math.min(100, Math.round((currentVal / goal.target) * 100));
                  const isCompleted = percent >= 100;
                  
                  let CatIcon = Target;
                  if (goal.category === 'Zdrowie') CatIcon = Dumbbell;
                  if (goal.category === 'Dom') CatIcon = Utensils;
                  if (goal.category === 'Rozwój') CatIcon = Brain;

                  return (
                    <div key={goal.id} className={'p-5 rounded-3xl border shadow-sm relative bg-amber-500/10 border-amber-500/25 ' + (isCompleted ? ' border-emerald-500/50 bg-emerald-500/10' : '')}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={'p-2 rounded-xl ' + (isCompleted ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/25 text-amber-500')}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <CatIcon className="w-5 h-5" />}
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-500/10 text-amber-600 dark:text-amber-400 mb-1 inline-block">
                              {goal.category}
                            </span>
                            <h4 className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{goal.title}</h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditingGoal({ ...goal })} className={'hover:text-amber-500 p-1 ' + tStyle.subText}><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => setConfirmDeleteModal({ type: 'goal', id: goal.id, name: goal.title })} className={'hover:text-red-500 p-1 ' + tStyle.subText}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      {goal.comment && <div className={'mb-2 p-2.5 rounded-xl bg-slate-500/10 italic ' + currentFontConfig.smallClass + ' ' + tStyle.subText}>💬 "{goal.comment}"</div>}
                      
                      <div className="flex justify-between items-center mb-1.5 font-mono text-sm mt-3">
                        <span className={tStyle.subText}>Postęp:</span>
                        <span className="font-bold text-emerald-500">{currentVal} / {goal.target} ({percent}%) {isCompleted && '✨ (+30 PKT)'}</span>
                      </div>
                      <div className="w-full bg-slate-500/20 h-2.5 rounded-full overflow-hidden mb-0">
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: percent + '%' }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={'col-span-full p-6 text-center rounded-3xl border ' + currentFontConfig.smallClass + ' ' + tStyle.cardBg + ' ' + tStyle.subText}>Brak zdefiniowanych celów. Kliknij „+ Cel”.</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 pt-6 border-t border-slate-500/20">
        <div 
           className="flex justify-between items-center mb-4 cursor-pointer"
           onClick={() => setFutureTasksCollapsed(!futureTasksCollapsed)}
        >
           <h3 className={currentFontConfig.smallClass + ' font-semibold uppercase tracking-wider ' + tStyle.subText}>Zadania na przyszłość</h3>
           <ChevronDown className={`w-5 h-5 transition-transform ${tStyle.subText} ${futureTasksCollapsed ? '-rotate-90' : ''}`} />
        </div>

        {!futureTasksCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            {futureTasks.length > 0 ? (
              futureTasks.map((task) => {
                const catStyle = getCategoryStyle(task.category);
                const associatedGoal = goals.find(g => g.id === task.goalId);
                return (
                  <div key={task.id} className={'p-4 rounded-3xl border flex justify-between items-start shadow-sm bg-violet-500/10 border-violet-500/25'}>
                    <div className="flex items-start gap-3 w-full">
                      <button onClick={() => {
                          setConfirmCompleteModal({ type: 'task', id: task.id, name: task.title, isDone: false, goalId: task.goalId, targetDate: task.dueDate || tomorrowStr });
                          setCompleteTaskValue('');
                      }} className="mt-1">
                        <Circle className="w-6 h-6 text-slate-400 shrink-0 hover:text-violet-500 transition-colors" />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{task.title}</span>
                          <span className={'px-2 py-0.5 rounded-full border text-[10px] ' + catStyle}>{task.category || 'Ogólne'}</span>
                          {associatedGoal && (
                            <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Cel: {associatedGoal.title}
                            </span>
                          )}
                        </div>
                        <span className={currentFontConfig.smallClass + ' block ' + tStyle.subText}>
                          {!task.repeat || task.repeat === 'once' ? `Jednorazowe (Termin: ${task.dueDate})` : task.repeat === 'daily' ? 'Codziennie' : task.repeat === 'interval' ? `Co ${task.intervalDays} dni` : 'Dni wybrane ręcznie'} 
                          {task.duration > 0 && ` • ${task.duration} min`} • <strong className="text-violet-500">+{task.pkt || 20} PKT</strong>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      <button onClick={() => setEditingTask({ ...task })} className={'p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 hover:text-amber-500 transition-colors ' + tStyle.subText}><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmDeleteModal({ type: 'task', id: task.id, name: task.title })} className={'p-2 rounded-xl bg-slate-500/10 hover:bg-red-500/10 hover:text-red-500 transition-colors ' + tStyle.subText}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={'col-span-full p-6 text-center rounded-3xl border ' + currentFontConfig.smallClass + ' ' + tStyle.cardBg + ' ' + tStyle.subText}>
                Brak zaplanowanych zadań w przyszłości.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-500/20">
        <button
          onClick={() => setShowArchiveModal(true)}
          className={'w-full py-4 rounded-3xl border font-bold flex items-center justify-center gap-2.5 transition-all shadow-md ' + tStyle.cardBg + ' hover:opacity-90'}
        >
          <Archive className="w-5 h-5 text-amber-500" /> Archiwum (Zrealizowane zadania i cele)
        </button>
      </div>
    </>
  );
}