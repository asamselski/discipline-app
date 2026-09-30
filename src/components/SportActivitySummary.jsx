import { useMemo, useState } from 'react';
import { Activity, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateStr } from '../utils/date';
import { useI18n } from '../i18n-context';

const SPORT_TYPES = {
  walk_km: 'Marsz',
  run: 'Bieganie',
  bike: 'Rower',
  stretching: 'Rozciąganie',
  pullups: 'Drążek',
  pushups: 'Pompki',
  squats: 'Przysiady',
  situps: 'Brzuszki',
  gym: 'Siłownia',
  steps: 'Kroki',
};

const startOfWeek = (date) => {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = result.getDay() || 7;
  result.setDate(result.getDate() - day + 1);
  return result;
};

export default function SportActivitySummary({ workouts, currentFontConfig, tStyle }) {
  const { locale, t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState('week');
  const [offset, setOffset] = useState(0);

  const period = useMemo(() => {
    const now = new Date();
    if (mode === 'week') {
      const start = startOfWeek(now);
      start.setDate(start.getDate() + offset * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { start, end, label: `${start.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })} – ${end.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })}` };
    }
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    return { start, end, label: start.toLocaleDateString(locale, { month: 'long', year: 'numeric' }) };
  }, [locale, mode, offset]);

  const activities = useMemo(() => {
    const start = formatDateStr(period.start);
    const end = formatDateStr(period.end);
    const grouped = new Map();
    workouts.forEach((workout) => {
      if (!SPORT_TYPES[workout.type] || workout.date < start || workout.date > end) return;
      const key = `${workout.type}:${workout.unit || ''}`;
      const current = grouped.get(key) || { type: workout.type, label: SPORT_TYPES[workout.type], unit: workout.unit || '', amount: 0, count: 0 };
      current.amount += Number(workout.amount) || 0;
      current.count += 1;
      grouped.set(key, current);
    });
    return [...grouped.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pl'));
  }, [period, workouts]);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setOffset(0);
  };

  return (
    <section className={'rounded-3xl border shadow-sm mb-6 overflow-hidden ' + tStyle.cardBg}>
      <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="w-full p-5 md:p-6 flex items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-orange-500/15 text-orange-500 border border-orange-500/30"><Activity className="w-6 h-6" /></div>
          <div>
            <h3 className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{t('Podsumowanie sportu')}</h3>
            <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>{t('Tylko wykonane aktywności')}</p>
          </div>
        </div>
        <ChevronDown className={'w-5 h-5 transition-transform ' + tStyle.subText + (expanded ? ' rotate-180' : '')} />
      </button>

      {expanded && (
        <div className="px-5 md:px-6 pb-6 border-t border-slate-500/20 animate-fadeIn">
          <div className="flex gap-2 my-4">
            <button onClick={() => changeMode('week')} className={'flex-1 py-2.5 rounded-xl border font-bold ' + currentFontConfig.smallClass + ' ' + (mode === 'week' ? tStyle.optSelected : tStyle.optUnselected)}>{t('Tydzień')}</button>
            <button onClick={() => changeMode('month')} className={'flex-1 py-2.5 rounded-xl border font-bold ' + currentFontConfig.smallClass + ' ' + (mode === 'month' ? tStyle.optSelected : tStyle.optUnselected)}>{t('Miesiąc')}</button>
          </div>

          <div className="flex items-center justify-between gap-3 mb-4">
            <button onClick={() => setOffset((value) => value - 1)} className={'p-2.5 rounded-xl ' + tStyle.modalBtnBg} title={t('Poprzedni okres')}><ChevronLeft className="w-5 h-5" /></button>
            <strong className={'capitalize text-center ' + currentFontConfig.smallClass + ' ' + tStyle.titleText}>{period.label}</strong>
            <button disabled={offset >= 0} onClick={() => setOffset((value) => Math.min(0, value + 1))} className={'p-2.5 rounded-xl disabled:opacity-30 ' + tStyle.modalBtnBg} title={t('Następny okres')}><ChevronRight className="w-5 h-5" /></button>
          </div>

          {activities.length > 0 ? (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div key={`${activity.type}-${activity.unit}`} className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between gap-3">
                  <div>
                    <strong className={tStyle.titleText}>{t(activity.label)}</strong>
                    <span className={currentFontConfig.smallClass + ' block mt-0.5 ' + tStyle.subText}>{t(activity.count === 1 ? '{{count}} aktywność' : '{{count}} aktywności', { count: activity.count })}</span>
                  </div>
              <strong className="text-orange-500 font-mono">{Number(activity.amount.toFixed(2))} {t(activity.unit)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className={currentFontConfig.smallClass + ' text-center py-6 ' + tStyle.subText}>{t('Brak aktywności sportowych w tym okresie.')}</p>
          )}
        </div>
      )}
    </section>
  );
}
