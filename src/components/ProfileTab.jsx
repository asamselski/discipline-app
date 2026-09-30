import { useState } from 'react';
import { Settings, Award, ChevronDown, ChevronRight, ShieldCheck, PieChart, UserRound, ChartNoAxesCombined } from 'lucide-react';
import SportActivitySummary from './SportActivitySummary';
import { useI18n } from '../i18n-context';

function CollapsibleSection({ title, subtitle, Icon, accentClass, expanded, onToggle, currentFontConfig, tStyle, children }) {
  return (
    <section className={'mb-6 overflow-hidden rounded-3xl border shadow-sm ' + tStyle.cardBg}>
      <button type="button" onClick={onToggle} aria-expanded={expanded} className="flex w-full items-center justify-between gap-4 p-5 text-left md:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className={'shrink-0 rounded-2xl border p-3 ' + accentClass}><Icon className="h-6 w-6" /></div>
          <div className="min-w-0">
            <h2 className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{title}</h2>
            <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>{subtitle}</p>
          </div>
        </div>
        <ChevronDown className={'h-5 w-5 shrink-0 transition-transform ' + tStyle.subText + (expanded ? ' rotate-180' : '')} />
      </button>
      {expanded && <div className="animate-fadeIn border-t border-slate-500/20 p-5 md:p-6">{children}</div>}
    </section>
  );
}

export default function ProfileTab({
  currentFontConfig, tStyle, userName, setUserName, userGender, setUserGender,
  levelInfo, totalPKT, earnedTrophiesCount, trophyCount, setShowSettingsModal,
  setShowTrophiesModal, setShowRanksModal, renderMonthTimeline, monthNameDisplay,
  monthTotalDoneTasks, categories, monthCategoryStats, renderDetailedStats,
  weeklyDetailedStats, monthlyDetailedStats, workouts
}) {
  const { t } = useI18n();
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);

  return (
    <>
      <header className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className={currentFontConfig.headerClass + ' font-bold tracking-tight ' + tStyle.titleText}>{t('Mój Profil')}</h1>
          <p className={currentFontConfig.smallClass + ' md:text-base ' + tStyle.subText}>{t('Statystyki poziomu i aktywności')}</p>
        </div>
        
        <button onClick={() => setShowSettingsModal(true)} className={'p-3 md:p-3.5 rounded-full border text-emerald-500 active:scale-95 transition-all shadow-md ' + tStyle.cardBg} title={t('Ustawienia')}>
          <Settings className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </header>

      <CollapsibleSection
        title={t('Profil')}
        subtitle={t('Imię, ranga i zdobyte trofea')}
        Icon={UserRound}
        accentClass="border-emerald-500/30 bg-emerald-500/15 text-emerald-500"
        expanded={profileExpanded}
        onToggle={() => setProfileExpanded(value => !value)}
        currentFontConfig={currentFontConfig}
        tStyle={tStyle}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={currentFontConfig.smallClass + ' mb-2 block font-medium md:text-sm ' + tStyle.subText}>{t('Twoje Imię')}</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  localStorage.setItem('discipline_user_name', e.target.value);
                }}
                placeholder={t('Wpisz swoje imię...')}
                className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg}
              />
            </div>
            <div>
              <label className={currentFontConfig.smallClass + ' mb-2 block font-medium md:text-sm ' + tStyle.subText}>{t('Forma (Płeć)')}</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { setUserGender('male'); localStorage.setItem('discipline_user_gender', 'male'); }} className={'rounded-2xl border py-3 ' + currentFontConfig.smallClass + ' font-semibold transition-all ' + (userGender === 'male' ? tStyle.optSelected : tStyle.optUnselected)}>{t('Mężczyzna 👨')}</button>
                <button type="button" onClick={() => { setUserGender('female'); localStorage.setItem('discipline_user_gender', 'female'); }} className={'rounded-2xl border py-3 ' + currentFontConfig.smallClass + ' font-semibold transition-all ' + (userGender === 'female' ? tStyle.optSelected : tStyle.optUnselected)}>{t('Kobieta 👩')}</button>
              </div>
            </div>
          </div>

          <button type="button" onClick={() => setShowRanksModal(true)} className="relative w-full overflow-hidden rounded-2xl border border-slate-500/20 bg-slate-500/5 p-5 text-left shadow-sm transition-transform active:scale-[0.99] hover:border-amber-500/50 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/20 text-amber-500 shadow-inner md:h-16 md:w-16"><ShieldCheck className="h-8 w-8 md:h-10 md:w-10" /></div>
                <div className="min-w-0">
                  <span className={currentFontConfig.smallClass + ' block font-bold uppercase tracking-wider ' + tStyle.subText}>{t('Ranga · Poziom {{level}}/50', { level: levelInfo.level })}</span>
                  <h3 className={currentFontConfig.headerClass + ' font-bold ' + tStyle.titleText}>{t(levelInfo.name)}</h3>
                </div>
              </div>
              <ChevronRight className={'h-6 w-6 shrink-0 ' + tStyle.subText} />
            </div>
            <div className="flex flex-col gap-3">
              <div className={'relative flex items-center justify-between overflow-hidden rounded-2xl bg-slate-500/10 p-4 ' + currentFontConfig.smallClass + ' md:text-base'}>
                <div className="absolute inset-y-0 left-0 bg-amber-500/20 transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, (levelInfo.pointsInLevel / levelInfo.maxLevelPoints) * 100))}%` }} />
                <span className={'relative z-10 ' + tStyle.subText}>{t('Postęp poziomu:')}</span>
                <span className="relative z-10 font-mono text-lg font-bold text-amber-500 md:text-xl">{levelInfo.pointsInLevel}/{levelInfo.maxLevelPoints} {t('PKT')}</span>
              </div>
              <div className={'flex items-center justify-between rounded-2xl bg-slate-500/10 p-4 ' + currentFontConfig.smallClass + ' md:text-base'}>
                <span className={tStyle.subText}>{t('Łącznie zdobyte punkty:')}</span>
                <span className="font-mono text-lg font-bold text-emerald-500 md:text-xl">{totalPKT} {t('PKT')}</span>
              </div>
            </div>
          </button>

          <button type="button" onClick={() => setShowTrophiesModal(true)} className="flex w-full items-center justify-between rounded-2xl border border-slate-500/20 bg-slate-500/5 p-4 text-left transition-transform active:scale-[0.99] md:p-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="shrink-0 rounded-2xl border border-amber-500/40 bg-amber-500/20 p-3 text-amber-500"><Award className="h-7 w-7" /></div>
              <div className="min-w-0">
                <h3 className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{t('Moja Gablota Trofeów')}</h3>
                <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>{t('Zdobyte osiągnięcia: {{earned}}/{{total}}', { earned: earnedTrophiesCount, total: trophyCount })}</p>
              </div>
            </div>
            <ChevronRight className={'h-6 w-6 shrink-0 ' + tStyle.subText} />
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={t('Podsumowanie aktywności')}
        subtitle={t('Zadania, punkty, wykresy i kategorie')}
        Icon={ChartNoAxesCombined}
        accentClass="border-sky-500/30 bg-sky-500/15 text-sky-500"
        expanded={activityExpanded}
        onToggle={() => setActivityExpanded(value => !value)}
        currentFontConfig={currentFontConfig}
        tStyle={tStyle}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {renderDetailedStats(t('Ostatnie 7 dni'), weeklyDetailedStats, 'text-emerald-500')}
          {renderDetailedStats(t('Miesiąc: {{month}}', { month: monthNameDisplay }), monthlyDetailedStats, 'text-sky-500')}
        </div>

        <div className="mt-4">{renderMonthTimeline()}</div>

        <div className="rounded-3xl border border-slate-500/20 bg-slate-500/5 p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-slate-500/20 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-emerald-500" />
              <h3 className={'font-bold capitalize ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{t('Kategorie: {{month}}', { month: monthNameDisplay })}</h3>
            </div>
          </div>
          {monthTotalDoneTasks > 0 ? (
            <div className="space-y-3">
              {categories.map(cat => {
                const count = monthCategoryStats[cat.id] || 0;
                const percent = Math.round((count / monthTotalDoneTasks) * 100);
                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className={'flex items-center justify-between ' + currentFontConfig.smallClass + ' md:text-sm'}>
                      <span className={'font-medium ' + tStyle.titleText}>{t(cat.label)}</span>
                      <span className={'font-mono ' + tStyle.subText}>{count} ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-500/20"><div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: percent + '%' }} /></div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={currentFontConfig.smallClass + ' py-6 text-center ' + tStyle.subText}>{t('Brak ukończonych zadań w miesiącu {{month}}.', { month: monthNameDisplay })}</p>
          )}
        </div>
      </CollapsibleSection>

      <SportActivitySummary workouts={workouts} currentFontConfig={currentFontConfig} tStyle={tStyle} />
    </>
  );
}
