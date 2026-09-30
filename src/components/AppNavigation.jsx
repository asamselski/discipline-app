import { Calendar as CalendarIcon, Target, User, Zap } from 'lucide-react';

const TABS = [
  { id: 'today', label: 'Dzisiaj', Icon: Zap },
  { id: 'goals', label: 'Cele', Icon: Target },
  { id: 'history', label: 'Kalendarz', Icon: CalendarIcon },
  { id: 'profile', label: 'Profil', Icon: User },
];

export default function AppNavigation({ activeTab, setActiveTab, currentFontConfig, tStyle }) {
  return (
    <nav className={'fixed bottom-0 left-0 right-0 backdrop-blur-md border-t px-6 py-3 max-w-md md:max-w-3xl lg:max-w-5xl mx-auto flex justify-around items-center z-50 rounded-t-3xl shadow-2xl ' + tStyle.navBg}>
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={'flex flex-col items-center gap-1 ' + currentFontConfig.smallClass + ' md:text-sm font-medium transition-colors ' + (activeTab === id ? 'text-emerald-500 font-bold' : tStyle.subText + ' hover:text-emerald-500')}
        >
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
