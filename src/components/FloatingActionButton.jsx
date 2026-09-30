import { BookOpen, Brain, CheckSquare, Dumbbell, Plus } from 'lucide-react';
import { useI18n } from '../i18n-context';

export default function FloatingActionButton({
  isFabOpen,
  setIsFabOpen,
  isAnyModalOpen,
  currentFontConfig,
  onAddTask,
  onAddWorkout,
  onAddReading,
  onAddInboxItem,
}) {
  const { t } = useI18n();
  if (isAnyModalOpen) return null;

  return (
    <>
      {isFabOpen && (
        <button
          type="button"
          aria-label={t('Zamknij menu dodawania')}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsFabOpen(false);
          }}
          className="fixed inset-0 z-[900] cursor-default bg-transparent border-0 p-0"
        />
      )}

      <div className="fixed bottom-24 right-6 md:right-12 flex flex-col items-end gap-3 z-[901]">
        {isFabOpen && (
          <div className="flex flex-col items-end gap-2.5 animate-fadeIn mb-3">
            <button onClick={onAddTask} className={'bg-emerald-500 text-slate-950 px-5 py-3.5 rounded-2xl shadow-xl font-bold ' + currentFontConfig.smallClass + ' flex items-center gap-2.5 transition-transform active:scale-95'}>
              <CheckSquare className="w-4 h-4" /> {t('Dodaj zadanie')}
            </button>
            <button onClick={onAddWorkout} className={'bg-orange-500 text-slate-950 px-5 py-3.5 rounded-2xl shadow-xl font-bold ' + currentFontConfig.smallClass + ' flex items-center gap-2.5 transition-transform active:scale-95'}>
              <Dumbbell className="w-4 h-4" /> {t('Dodaj trening')}
            </button>
            <button onClick={onAddReading} className={'bg-sky-500 text-slate-950 px-5 py-3.5 rounded-2xl shadow-xl font-bold ' + currentFontConfig.smallClass + ' flex items-center gap-2.5 transition-transform active:scale-95'}>
              <BookOpen className="w-4 h-4" /> {t('Dodaj czytanie')}
            </button>
            <button onClick={onAddInboxItem} className={'bg-violet-500 text-white px-5 py-3.5 rounded-2xl shadow-xl font-bold ' + currentFontConfig.smallClass + ' flex items-center gap-2.5 transition-transform active:scale-95'}>
              <Brain className="w-4 h-4" /> {t('Zrzut myśli')}
            </button>
          </div>
        )}
        <button onClick={() => setIsFabOpen(!isFabOpen)} className={'bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-4.5 rounded-full shadow-lg shadow-emerald-500/30 font-bold transition-transform duration-300 active:scale-95 flex items-center justify-center ' + (isFabOpen ? 'rotate-45 bg-amber-500' : '')}>
          <Plus className="w-7 h-7 stroke-[3]" />
        </button>
      </div>
    </>
  );
}
