import { Check, Star, X } from 'lucide-react';

export default function DailyPlanningCard({
  tasks,
  selectedTaskIds,
  onToggleTask,
  onConfirm,
  onDismiss,
  currentFontConfig,
  tStyle,
}) {
  return (
    <section className="p-5 md:p-6 rounded-3xl border border-amber-500/35 bg-amber-500/10 mb-6 shadow-sm animate-fadeIn">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className={currentFontConfig.sizeClass + ' font-bold text-amber-500 flex items-center gap-2'}>
            <Star className="w-5 h-5 fill-amber-500" /> Co jest dziś naprawdę ważne?
          </h2>
          <p className={currentFontConfig.smallClass + ' mt-1 ' + tStyle.subText}>
            Wybierz maksymalnie 3 zadania. To plan dnia, nie kolejna lista obowiązków.
          </p>
        </div>
        <button onClick={onDismiss} className={'p-2 rounded-xl shrink-0 ' + tStyle.modalBtnBg} title="Nie pytaj dzisiaj">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {tasks.length > 7 && (
          <div className={'p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 ' + currentFontConfig.smallClass + ' text-orange-600 dark:text-orange-400'}>
            Masz dziś {tasks.length} zadań. Wybierz 3 najważniejsze i rozważ przeniesienie mniej istotnych podczas zamknięcia dnia.
          </div>
        )}
        {tasks.map((task) => {
          const selected = selectedTaskIds.has(task.id);
          return (
            <button
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={'w-full p-3 rounded-2xl border flex items-center gap-3 text-left transition-all ' + (selected ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400' : tStyle.optUnselected)}
            >
              <span className={'w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ' + (selected ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-500/40')}>
                {selected && <Check className="w-4 h-4" />}
              </span>
              <span className={'font-medium flex-1 ' + currentFontConfig.smallClass}>{task.title}</span>
              <span className="text-[10px] font-bold opacity-70">{task.category}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-amber-500/25">
        <span className={currentFontConfig.smallClass + ' font-bold text-amber-500'}>{selectedTaskIds.size}/3 wybrane</span>
        <button onClick={onConfirm} className={'px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold ' + currentFontConfig.smallClass}>
          Zapisz plan dnia
        </button>
      </div>
    </section>
  );
}
