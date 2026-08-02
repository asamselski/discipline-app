// src/components/tabs/ProfileTab.jsx
import React from 'react';
import { Settings, Award, ChevronRight, ShieldCheck, PieChart } from 'lucide-react';

export default function ProfileTab({
  currentFontConfig, tStyle, userName, setUserName, userGender, setUserGender,
  levelInfo, totalPKT, earnedTrophies, TROPHIES, setShowSettingsModal,
  setShowTrophiesModal, setShowRanksModal, renderMonthTimeline, monthNameDisplay,
  monthTotalDoneTasks, categories, monthCategoryStats
}) {
  return (
    <>
      <header className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className={currentFontConfig.headerClass + ' font-bold tracking-tight ' + tStyle.titleText}>Mój Profil</h1>
          <p className={currentFontConfig.smallClass + ' md:text-base ' + tStyle.subText}>Statystyki poziomu i aktywności</p>
        </div>
        
        <button onClick={() => setShowSettingsModal(true)} className={'p-3 md:p-3.5 rounded-full border text-emerald-500 active:scale-95 transition-all shadow-md ' + tStyle.cardBg} title="Ustawienia">
          <Settings className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </header>

      <button 
         onClick={() => setShowTrophiesModal(true)} 
         className={'w-full p-5 md:p-6 rounded-3xl border mb-6 shadow-sm flex items-center justify-between transition-transform active:scale-95 ' + tStyle.cardBg}
      >
         <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/40">
               <Award className="w-7 h-7" />
            </div>
            <div className="text-left">
               <h3 className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>Moja Gablota Trofeów</h3>
               <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>Zobacz zdobyte osiągnięcia ({Object.keys(earnedTrophies).length}/{TROPHIES.length})</p>
            </div>
         </div>
         <ChevronRight className={"w-6 h-6 " + tStyle.subText} />
      </button>

      <div className={'p-5 md:p-6 rounded-3xl border mb-6 shadow-sm ' + tStyle.cardBg}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={currentFontConfig.smallClass + ' md:text-sm font-medium block mb-2 ' + tStyle.subText}>Twoje Imię</label>
            <input 
              type="text" 
              value={userName} 
              onChange={(e) => {
                setUserName(e.target.value);
                localStorage.setItem('discipline_user_name', e.target.value);
              }} 
              placeholder="Wpisz swoje imię..." 
              className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} 
            />
          </div>
          <div>
            <label className={currentFontConfig.smallClass + ' md:text-sm font-medium block mb-2 ' + tStyle.subText}>Forma (Płeć)</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  setUserGender('male');
                  localStorage.setItem('discipline_user_gender', 'male');
                }} 
                className={'py-3 rounded-2xl border ' + currentFontConfig.smallClass + ' font-semibold transition-all ' + (userGender === 'male' ? tStyle.optSelected : tStyle.optUnselected)}
              >
                Mężczyzna 👨
              </button>
              <button 
                onClick={() => {
                  setUserGender('female');
                  localStorage.setItem('discipline_user_gender', 'female');
                }} 
                className={'py-3 rounded-2xl border ' + currentFontConfig.smallClass + ' font-semibold transition-all ' + (userGender === 'female' ? tStyle.optSelected : tStyle.optUnselected)}
              >
                Kobieta 👩
              </button>
            </div>
          </div>
        </div>
      </div>

      <div 
         onClick={() => setShowRanksModal(true)} 
         className={'p-6 md:p-8 rounded-3xl border mb-6 shadow-xl relative overflow-hidden cursor-pointer transition-transform active:scale-95 hover:border-amber-500/50 ' + tStyle.cardBg}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center font-bold text-2xl bg-amber-500/20 border border-amber-500/40 text-amber-500 shadow-inner">
              <ShieldCheck className="w-10 h-10 md:w-12 md:h-12" />
            </div>
            <div>
              <span className={currentFontConfig.smallClass + ' md:text-sm font-bold uppercase tracking-wider block ' + tStyle.subText}>Ranga (Poziom {levelInfo.level}/50)</span>
              <h2 className={currentFontConfig.headerClass + ' font-bold ' + tStyle.titleText}>{levelInfo.name}</h2>
            </div>
          </div>
          <ChevronRight className={"w-6 h-6 " + tStyle.subText} />
        </div>
        <div className="flex flex-col gap-3">
          <div className={'relative bg-slate-500/10 p-4 rounded-2xl flex justify-between items-center overflow-hidden ' + currentFontConfig.smallClass + ' md:text-base'}>
            <div className="absolute top-0 bottom-0 left-0 bg-amber-500/20 transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, (levelInfo.pointsInLevel / levelInfo.maxLevelPoints) * 100))}%` }} />
            <span className={'relative z-10 ' + tStyle.subText}>Postęp w bieżącym poziomie:</span>
            <span className="relative z-10 font-mono font-bold text-amber-500 text-lg md:text-xl">{levelInfo.pointsInLevel}/{levelInfo.maxLevelPoints} PKT</span>
          </div>
          <div className={'bg-slate-500/10 p-4 rounded-2xl flex justify-between items-center ' + currentFontConfig.smallClass + ' md:text-base'}>
            <span className={tStyle.subText}>Łącznie zdobyte punkty:</span>
            <span className="font-mono font-bold text-emerald-500 text-lg md:text-xl">{totalPKT} PKT</span>
          </div>
        </div>
      </div>

      {renderMonthTimeline()}

      <div className={'p-6 rounded-3xl border shadow-sm ' + tStyle.cardBg}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-500/20">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-500" />
            <h3 className={'font-bold capitalize ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>Kategorie: {monthNameDisplay}</h3>
          </div>
        </div>
        {monthTotalDoneTasks > 0 ? (
          <div className="space-y-3">
            {categories.map(cat => {
              const count = monthCategoryStats[cat.id] || 0;
              const percent = Math.round((count / monthTotalDoneTasks) * 100);
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className={'flex justify-between items-center ' + currentFontConfig.smallClass + ' md:text-sm'}>
                    <span className={'font-medium ' + tStyle.titleText}>{cat.label}</span>
                    <span className={'font-mono ' + tStyle.subText}>{count} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-500/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: percent + '%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={currentFontConfig.smallClass + ' text-center py-6 ' + tStyle.subText}>Brak ukończonych zadań w miesiącu {monthNameDisplay}.</p>
        )}
      </div>
    </>
  );
}