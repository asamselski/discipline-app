import { Award, Lock, Share2, Trophy, X } from 'lucide-react';
import { parseLocalDate } from '../../utils/date';
import { useI18n } from '../../i18n-context';

const TROPHY_GROUPS = [
  { rank: 'bronze', title: 'Brązowe', text: 'text-orange-500', border: 'border-orange-600/30' },
  { rank: 'silver', title: 'Srebrne', text: 'text-slate-300', border: 'border-slate-300/30' },
  { rank: 'gold', title: 'Złote', text: 'text-amber-500', border: 'border-amber-500/30' },
];

const getTrophyColors = (rank, isEarned) => {
  if (!isEarned) return 'bg-slate-500/10 border-slate-500/20 text-slate-500 opacity-60 grayscale';
  if (rank === 'bronze') return 'bg-orange-700/20 border-orange-600/50 text-orange-500 shadow-inner';
  if (rank === 'silver') return 'bg-slate-300/20 border-slate-300/50 text-slate-300 shadow-inner';
  return 'bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
};

export function TrophiesModal({
  isOpen,
  onClose,
  trophies,
  earnedTrophies,
  earnedCount,
  onSelectTrophy,
  currentFontConfig,
  tStyle,
}) {
  const { locale, t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[400] animate-fadeIn">
      <div className={'w-full max-w-4xl max-h-[90vh] rounded-3xl p-5 md:p-7 shadow-2xl border flex flex-col ' + tStyle.modalBg}>
        <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-slate-500/25">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/40">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h2 className={'font-bold ' + currentFontConfig.headerClass + ' ' + tStyle.titleText}>{t('Moja Gablota Trofeów')}</h2>
              <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>{t('Zdobyte: {{earned}} z {{total}}', { earned: earnedCount, total: trophies.length })}</p>
            </div>
          </div>
          <button onClick={onClose} className={'p-2 rounded-full shrink-0 transition-colors ' + tStyle.modalBtnBg} title={t('Zamknij gablotę')}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto pr-1 space-y-7">
          {TROPHY_GROUPS.map(group => {
            const groupTrophies = trophies.filter(trophy => trophy.rank === group.rank);
            const groupEarnedCount = groupTrophies.filter(trophy => earnedTrophies[trophy.id]).length;
            return (
              <section key={group.rank}>
                <div className={'flex items-center justify-between mb-3 pb-2 border-b ' + group.border}>
                  <h3 className={'font-bold uppercase tracking-wider flex items-center gap-2 ' + group.text}>
                    <Trophy className="w-5 h-5" /> {t(group.title)}
                  </h3>
                  <span className={currentFontConfig.smallClass + ' font-mono ' + tStyle.subText}>{groupEarnedCount}/{groupTrophies.length}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {groupTrophies.map(trophy => {
                    const earnedDate = earnedTrophies[trophy.id];
                    return (
                      <button
                        key={trophy.id}
                        type="button"
                        onClick={() => onSelectTrophy(trophy)}
                        className={'min-h-40 p-4 rounded-2xl border text-left flex flex-col items-center justify-between gap-3 transition-transform active:scale-95 ' + tStyle.cardBg}
                      >
                        <div className={'w-14 h-14 rounded-full border flex items-center justify-center ' + getTrophyColors(trophy.rank, Boolean(earnedDate))}>
                          {earnedDate ? <Trophy className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
                        </div>
                        <div className="text-center w-full">
                          <span className={'font-bold block leading-tight ' + currentFontConfig.smallClass + ' ' + tStyle.titleText}>{t(trophy.title)}</span>
                          <span className={'block mt-2 text-[11px] ' + (earnedDate ? 'text-emerald-500 font-medium' : tStyle.subText)}>
                            {earnedDate ? t('Zdobyto {{date}}', { date: parseLocalDate(earnedDate).toLocaleDateString(locale) }) : t('Do zdobycia')}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <button onClick={onClose} className="w-full mt-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-transform active:scale-95">
          {t('Zamknij gablotę')}
        </button>
      </div>
    </div>
  );
}

export function TrophyDetailsModal({ trophy, earnedTrophies, userName, onShare, onClose }) {
  const { locale, t } = useI18n();
  if (!trophy) return null;
  const earnedDate = earnedTrophies[trophy.id];
  const rankColor = trophy.rank === 'gold'
    ? 'text-amber-500'
    : trophy.rank === 'silver' ? 'text-slate-300' : 'text-orange-500';
  const medalStyle = trophy.rank === 'gold'
    ? 'bg-amber-500/20 text-amber-500 shadow-amber-500/50 ring-4 ring-amber-500'
    : trophy.rank === 'silver'
      ? 'bg-slate-300/20 text-slate-300 shadow-slate-300/50 ring-4 ring-slate-300'
      : 'bg-orange-700/20 text-orange-500 shadow-orange-700/50 ring-4 ring-orange-500';

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 z-[500] animate-fadeIn">
      <div className="max-w-md w-full text-center">
        <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-2xl ${earnedDate ? 'animate-bounce ' : ''}${medalStyle}`}>
          {earnedDate ? <Trophy className="w-16 h-16" /> : <Lock className="w-16 h-16 opacity-50" />}
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
          {earnedDate ? (trophy.isNew ? t('Gratulacje, {{name}}!', { name: userName }) : t('Zdobyte trofeum')) : t('Trofeum do zdobycia')}
        </h2>
        <p className={'text-lg mb-8 uppercase tracking-widest font-bold ' + rankColor}>
          {earnedDate
            ? t(trophy.rank === 'gold' ? 'Odblokowano złote trofeum' : trophy.rank === 'silver' ? 'Odblokowano srebrne trofeum' : 'Odblokowano brązowe trofeum')
            : t(trophy.rank === 'gold' ? 'Złote trofeum' : trophy.rank === 'silver' ? 'Srebrne trofeum' : 'Brązowe trofeum')}
        </p>

        <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-700/50 mb-8 shadow-inner">
          <h3 className="text-2xl font-bold text-white mb-2">{t(trophy.title)}</h3>
          <p className="text-slate-400 text-lg">{t(trophy.desc)}</p>
          {earnedDate && (
            <p className="text-emerald-400 font-bold mt-4">{t('Zdobyto: {{date}}', { date: parseLocalDate(earnedDate).toLocaleDateString(locale) })}</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {earnedDate && (
            <button onClick={() => onShare(trophy)} className="w-full py-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-400 transition-transform active:scale-95 shadow-lg shadow-emerald-500/20">
              <Share2 className="w-6 h-6" /> {t('Udostępnij sukces')}
            </button>
          )}
          <button onClick={onClose} className="w-full py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold text-lg hover:bg-slate-700 transition-colors">
            {t('Zamknij')}
          </button>
        </div>
      </div>
    </div>
  );
}
