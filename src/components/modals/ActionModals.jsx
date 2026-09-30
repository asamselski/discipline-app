import { AlertTriangle, Check, RotateCcw, Target } from 'lucide-react';

export function DeleteConfirmationModal({ modal, tasks, deleteAssociatedTasks, setDeleteAssociatedTasks, onCancel, onConfirm, currentFontConfig, tStyle }) {
  if (!modal) return null;
  const associatedTasksCount = tasks.filter(task => task.goalId === modal.id).length;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[150]">
      <div className={'w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center border ' + tStyle.modalBg}>
        <div className="w-12 h-12 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle className="w-6 h-6" /></div>
        <h3 className={currentFontConfig.sizeClass + ' font-bold mb-2 ' + tStyle.titleText}>Potwierdź usunięcie</h3>
        <p className={currentFontConfig.smallClass + ' mb-6 ' + tStyle.subText}>Czy na pewno chcesz usunąć: <strong className="text-red-400">&quot;{modal.name}&quot;</strong>?</p>

        {modal.type === 'goal' && associatedTasksCount > 0 && (
          <div className="mb-6 text-left p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={deleteAssociatedTasks} onChange={event => setDeleteAssociatedTasks(event.target.checked)} className="mt-1 accent-red-500 w-4 h-4 cursor-pointer" />
              <span className={currentFontConfig.smallClass + ' ' + tStyle.subText}>Usuń również wszystkie zadania powiązane z tym celem ({associatedTasksCount} szt.)</span>
            </label>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onCancel} className={'flex-1 py-3 rounded-2xl font-semibold ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
          <button onClick={onConfirm} className={'flex-1 bg-red-500 hover:bg-red-400 text-white py-3 rounded-2xl font-bold ' + currentFontConfig.smallClass + ' shadow-lg shadow-red-500/30'}>Usuń</button>
        </div>
      </div>
    </div>
  );
}

export function CompleteConfirmationModal({ modal, completeTaskValue, setCompleteTaskValue, onCancel, onConfirm, currentFontConfig, tStyle }) {
  if (!modal) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[150] animate-fadeIn">
      <div className={'w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center border ' + tStyle.modalBg}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${modal.isDone ? 'bg-amber-500/20 text-amber-500 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'} border`}>
          {modal.isDone ? <RotateCcw className="w-6 h-6" /> : <Check className="w-6 h-6" />}
        </div>
        <h3 className={currentFontConfig.sizeClass + ' font-bold mb-2 ' + tStyle.titleText}>Potwierdź {modal.isDone ? 'cofnięcie' : 'wykonanie'}</h3>
        <p className={currentFontConfig.smallClass + ' mb-6 ' + tStyle.subText}>
          Czy na pewno chcesz oznaczyć jako <strong className={modal.isDone ? 'text-amber-500' : 'text-emerald-500'}>{modal.isDone ? 'NIEzrobione' : 'zrobione'}</strong>: <br /> &quot;{modal.name}&quot;?
        </p>

        {!modal.isDone && modal.goalId && (
          <div className="mb-6 text-left border-t border-slate-500/20 pt-4 mt-4">
            <label className={currentFontConfig.smallClass + ' font-medium block mb-3 text-center ' + tStyle.subText}>
              <Target className="w-5 h-5 inline mr-1 text-amber-500" /> O ile zaktualizować postęp celu?
            </label>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => {
                const current = parseFloat(completeTaskValue === '' ? '1' : completeTaskValue) || 1;
                setCompleteTaskValue(String(Math.max(1, current - 1)));
              }} className={'w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl border text-2xl font-bold transition-transform active:scale-95 hover:bg-slate-500/20 ' + tStyle.cardBg}>−</button>
              <input type="number" step="any" value={completeTaskValue === '' ? '1' : completeTaskValue} onChange={event => setCompleteTaskValue(event.target.value)} className={'w-24 text-center font-bold text-xl rounded-2xl px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 ' + tStyle.inputBg} />
              <button onClick={() => {
                const current = parseFloat(completeTaskValue === '' ? '1' : completeTaskValue) || 1;
                setCompleteTaskValue(String(current + 1));
              }} className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl border text-2xl font-bold transition-transform active:scale-95 bg-emerald-500/20 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/30">+</button>
            </div>
            <div className="mt-4 text-center">
              <button onClick={() => setCompleteTaskValue('0')} className={'text-xs font-semibold px-4 py-2 rounded-xl opacity-60 hover:opacity-100 transition-all border border-slate-500/30 hover:bg-slate-500/10 ' + tStyle.titleText}>Nie dodawaj postępu (0)</button>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button onClick={onCancel} className={'flex-1 py-3 rounded-2xl font-semibold ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
          <button onClick={onConfirm} className={`flex-1 py-3 rounded-2xl font-bold ${currentFontConfig.smallClass} shadow-lg text-slate-950 ${modal.isDone ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/30' : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30'}`}>
            {modal.isDone ? 'Cofnij' : 'Zrobione'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeleteNoteConfirmationModal({ isOpen, selectedDate, onCancel, onConfirm, currentFontConfig, tStyle }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[150]">
      <div className={'w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center border ' + tStyle.modalBg}>
        <div className="w-12 h-12 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle className="w-6 h-6" /></div>
        <h3 className={currentFontConfig.sizeClass + ' font-bold mb-2 ' + tStyle.titleText}>Usunąć notatkę?</h3>
        <p className={currentFontConfig.smallClass + ' mb-6 ' + tStyle.subText}>Czy na pewno chcesz skasować refleksję z dnia <strong className="text-emerald-500">{selectedDate}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className={'flex-1 py-3 rounded-2xl font-semibold ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
          <button onClick={onConfirm} className={'flex-1 bg-red-500 hover:bg-red-400 text-white py-3 rounded-2xl font-bold ' + currentFontConfig.smallClass + ' shadow-lg shadow-red-500/30'}>Usuń</button>
        </div>
      </div>
    </div>
  );
}
