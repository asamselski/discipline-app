import { Archive, CheckSquare, RotateCcw, Target, X } from 'lucide-react';
import { useI18n } from '../../i18n-context';

export default function ArchiveModal({
  isOpen,
  onClose,
  archivedTasks,
  archivedGoals,
  restoreArchivedItem,
  todayStr,
  currentFontConfig,
  tStyle,
}) {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[120] overflow-y-auto">
      <div className={'w-full max-w-2xl max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 md:p-8 shadow-2xl border flex flex-col ' + tStyle.modalBg}>
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40"><Archive className="w-6 h-6" /></div>
            <div>
              <h3 className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{t('Archiwum')}</h3>
              <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>{t('Wszystkie zrealizowane zadania i cele')}</p>
            </div>
          </div>
          <button onClick={onClose} className={'p-2 rounded-full transition-colors ' + tStyle.modalBtnBg}><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-1">
          <div>
            <h4 className={currentFontConfig.smallClass + ' font-bold uppercase tracking-wider mb-3 text-sky-500 flex items-center gap-2'}>
              <CheckSquare className="w-4 h-4" /> {t('Zrealizowane Zadania ({{count}})', { count: archivedTasks.length })}
            </h4>
            {archivedTasks.length > 0 ? (
              <div className="space-y-2">
                {archivedTasks.map(task => (
                  <div key={task.id} className={'p-3.5 rounded-2xl border flex justify-between items-center bg-sky-500/10 border-sky-500/25 ' + currentFontConfig.smallClass}>
                    <div>
                      <span className={'font-medium block ' + tStyle.titleText}>{task.title}</span>
                      <span className={'font-mono text-xs opacity-80 ' + tStyle.subText}>{t('Kategoria: {{category}}', { category: t(task.category) })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/20 text-emerald-500 font-bold px-2.5 py-1 rounded-full text-xs">{t('Ukończone')}</span>
                      <button onClick={() => restoreArchivedItem('task', { id: task.id, date: todayStr })} className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1.5 transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" /> {t('Przywróć')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={'p-4 rounded-2xl border text-center ' + currentFontConfig.smallClass + ' ' + tStyle.subText + ' ' + tStyle.cardBg}>{t('Brak zrealizowanych zadań w archiwum.')}</p>
            )}
          </div>

          <div>
            <h4 className={currentFontConfig.smallClass + ' font-bold uppercase tracking-wider mb-3 text-amber-500 flex items-center gap-2'}>
              <Target className="w-4 h-4" /> {t('Zrealizowane Cele ({{count}})', { count: archivedGoals.length })}
            </h4>
            {archivedGoals.length > 0 ? (
              <div className="space-y-2">
                {archivedGoals.map(goal => (
                  <div key={goal.id} className={'p-3.5 rounded-2xl border flex justify-between items-center bg-amber-500/10 border-amber-500/25 ' + currentFontConfig.smallClass}>
                    <div>
                      <span className={'font-medium block ' + tStyle.titleText}>{goal.title}</span>
                      <span className={'font-mono text-xs opacity-80 ' + tStyle.subText}>{t('Cel: {{target}}', { target: goal.target })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/20 text-amber-500 font-bold px-2.5 py-1 rounded-full text-xs">{t('Osiągnięty')}</span>
                      <button onClick={() => restoreArchivedItem('goal', goal)} className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5 transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" /> {t('Przywróć')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={'p-4 rounded-2xl border text-center ' + currentFontConfig.smallClass + ' ' + tStyle.subText + ' ' + tStyle.cardBg}>{t('Brak osiągniętych celów w archiwum.')}</p>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-500/25">
          <button onClick={onClose} className={'w-full py-3.5 rounded-2xl font-bold ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>{t('Zamknij archiwum')}</button>
        </div>
      </div>
    </div>
  );
}
