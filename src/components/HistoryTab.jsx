// src/components/tabs/HistoryTab.jsx
import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { isTaskDoneForDate } from '../../utils/helpers';

export default function HistoryTab({
  currentFontConfig, tStyle, renderCalendar, selectedDate, selectedDayTasks,
  selectedDayWorkouts, isPastDay, isFutureDay, currentNote, setShowDeleteNoteConfirm,
  textareaRef, saveNote
}) {
  return (
    <>
      <header className="mb-6 md:mb-8">
        <h1 className={currentFontConfig.headerClass + ' font-bold tracking-tight ' + tStyle.titleText}>Kalendarz i Notatnik</h1>
        <p className={currentFontConfig.smallClass + ' md:text-base ' + tStyle.subText}>Historia, refleksje oraz przewidywane aktywności</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {renderCalendar()}
        </div>

        <div className="space-y-6">
          <div className={'p-5 rounded-2xl border shadow-sm ' + tStyle.cardBg}>
            <h3 className={currentFontConfig.smallClass + ' md:text-sm font-semibold uppercase tracking-wider mb-3 ' + tStyle.titleText}>
              Podgląd Dnia: <span className="text-emerald-500 font-mono">{selectedDate}</span>
            </h3>
            {(selectedDayTasks.length > 0 || selectedDayWorkouts.length > 0) ? (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {selectedDayTasks.map((t) => {
                  const isDone = isTaskDoneForDate(t, selectedDate);
                  return (
                    <div key={'t-' + t.id} className={'flex items-center justify-between bg-slate-500/10 p-3.5 rounded-xl ' + currentFontConfig.smallClass}>
                      <div>
                        <span className={isDone && !isFutureDay ? 'text-emerald-500 line-through' : tStyle.titleText}>⚡ {t.title}</span>
                        {t.duration > 0 && <span className={'block opacity-70 mt-0.5 ' + tStyle.subText}>{t.duration} minut</span>}
                      </div>
                      <span className={'font-semibold px-2.5 py-1 rounded-full text-[10px] md:text-xs uppercase tracking-wider border ' + (
                        isFutureDay 
                          ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30'
                          : isDone 
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                            : 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30'
                      )}>
                        {isFutureDay ? 'Zaplanowane' : (isDone ? 'Wykonane' : 'Niewykonane')}
                      </span>
                    </div>
                  );
                })}
                {selectedDayWorkouts.map((w) => {
                  let typeName = w.type === 'run' ? 'Bieg' : w.type === 'pushups' ? 'Pompki' : w.type === 'pullups' ? 'Drążek' : w.type === 'squats' ? 'Przysiady' : w.type === 'situps' ? 'Brzuszki' : w.type === 'bike' ? 'Rower' : w.type === 'gym' ? 'Siłownia' : w.type === 'walk_km' ? 'Spacer' : w.type === 'steps' ? 'Kroki' : w.type === 'study' ? 'Nauka' : w.type === 'read_book' ? 'Książka' : w.type === 'read_chapters' ? 'Książka (rozdziały)' : w.type === 'no_sweets' ? 'Dni bez słodyczy' : 'Spacer (czas)';
                  return (
                    <div key={'w-' + w.id} className={'flex items-center justify-between bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/25 ' + currentFontConfig.smallClass}>
                      <div>
                        <span className={'font-bold ' + tStyle.titleText}>🔥 {typeName}: {w.amount} {w.unit}</span>
                        <span className={'block opacity-70 mt-0.5 text-amber-500 font-bold'}>+{w.pkt} PKT</span>
                      </div>
                      <span className="font-semibold px-2.5 py-1 rounded-full text-[10px] md:text-xs uppercase tracking-wider border bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
                        Aktywność
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={currentFontConfig.smallClass + ' text-center py-4 ' + tStyle.subText}>Brak zarejestrowanych zadań w tym dniu.</p>
            )}
          </div>

          <div className={'p-5 rounded-2xl border shadow-sm ' + tStyle.cardBg}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                <h3 className={currentFontConfig.smallClass + ' md:text-sm font-semibold uppercase tracking-wider ' + tStyle.titleText}>Refleksja na Dzień {selectedDate}</h3>
              </div>
              {isPastDay && currentNote && (
                <button onClick={() => setShowDeleteNoteConfirm(true)} className={currentFontConfig.smallClass + ' text-red-500 hover:text-red-400 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10'}><Trash2 className="w-3.5 h-3.5" /> Usuń</button>
              )}
            </div>

            <textarea
              ref={textareaRef}
              rows={2}
              disabled={isPastDay && Boolean(currentNote)}
              value={currentNote}
              onChange={(e) => {
                saveNote(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              placeholder={isPastDay ? "Brak notatki dla tego dnia." : "Wpisz swoje myśli..."}
              className={'w-full rounded-2xl p-4 focus:outline-none transition-all resize-none overflow-hidden ' + tStyle.inputBg + (isPastDay && Boolean(currentNote) ? ' opacity-80 cursor-not-allowed italic' : '')}
            />
          </div>
        </div>
      </div>
    </>
  );
}