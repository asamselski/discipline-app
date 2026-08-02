// constans.js
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const formatDateStr = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getAppDayString = (customResetTime) => {
  const resetTimeStr = customResetTime !== undefined ? customResetTime : (localStorage.getItem('discipline_reset_time') || '00:00');
  const now = new Date();
  const [resetH, resetM] = resetTimeStr.split(':').map(Number);
    
  let appDate = new Date(now);
  if (now.getHours() < resetH || (now.getHours() === resetH && now.getMinutes() < resetM)) {
    appDate.setDate(appDate.getDate() - 1);
  }
    
  return formatDateStr(appDate);
};

export const INITIAL_CATEGORIES = [
  { id: 'Zdrowie', label: '🌿 Zdrowie', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border-emerald-500/50' },
  { id: 'Rozwój', label: '🧠 Rozwój', color: 'bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold border-sky-500/50' },
  { id: 'Praca', label: '💼 Praca', color: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold border-indigo-500/50' },
  { id: 'Dom', label: '🏠 Dom', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border-amber-500/50' },
  { id: 'Ogólne', label: '🎯 Ogólne', color: 'bg-slate-500/20 text-slate-600 dark:text-slate-400 font-bold border-slate-500/50' },
];

export const FONT_SIZE_OPTIONS = [
  { level: 1, name: 'Bardzo mała', sizeClass: 'text-xs', headerClass: 'text-lg', smallClass: 'text-[10px]' },
  { level: 2, name: 'Mała', sizeClass: 'text-sm', headerClass: 'text-xl', smallClass: 'text-xs' },
  { level: 3, name: 'Normalna', sizeClass: 'text-base', headerClass: 'text-2xl md:text-3xl', smallClass: 'text-sm' },
  { level: 4, name: 'Duża', sizeClass: 'text-lg', headerClass: 'text-3xl md:text-4xl', smallClass: 'text-base' },
  { level: 5, name: 'Bardzo duża', sizeClass: 'text-xl', headerClass: 'text-4xl md:text-5xl', smallClass: 'text-lg' },
  { level: 6, name: 'Maksymalna', sizeClass: 'text-2xl', headerClass: 'text-5xl md:text-6xl', smallClass: 'text-xl' },
];

export const MAX_LEVEL = 50;

export const RANKS = [
  { minLevel: 1, name: 'Kanapowy Wojownik 🛋️' },
  { minLevel: 6, name: 'Poszukiwacz Iskry ✨' },
  { minLevel: 11, name: 'Wędrowiec Wytrwałości 🥾' },
  { minLevel: 16, name: 'Zdobywca Szczytów 🏔️' },
  { minLevel: 21, name: 'Kowal Własnego Losu 🔨' },
  { minLevel: 26, name: 'Generator Potu 💦' },
  { minLevel: 31, name: 'Legendarny Wojownik ⚔️' },
  { minLevel: 36, name: 'Oświecony Mistrz 🌟' },
  { minLevel: 41, name: 'Tytan Konsekwencji 🗿' },
  { minLevel: 46, name: 'Absolutny Mistrz Dyscypliny ⚡' }
];

export const TROPHIES = [
  { id: 'bronze_task', title: 'Przebudzenie', desc: 'Wykonaj swoje pierwsze zadanie', rank: 'bronze' },
  { id: 'bronze_workout', title: 'Rozgrzewka', desc: 'Zarejestruj pierwszą aktywność', rank: 'bronze' },
  { id: 'bronze_level5', title: 'Pierwsza krew', desc: 'Osiągnij 5 poziom', rank: 'bronze' },
  { id: 'bronze_tasks10', title: 'Rozgrzewka umysłu', desc: 'Wykonaj łącznie 10 zadań', rank: 'bronze' },
  { id: 'bronze_workouts10', title: 'Młody Wilk', desc: 'Zarejestruj 10 aktywności', rank: 'bronze' },
  
  { id: 'silver_level10', title: 'Wędrowiec', desc: 'Osiągnij 10 poziom', rank: 'silver' },
  { id: 'silver_level20', title: 'Hart Ducha', desc: 'Osiągnij 20 poziom', rank: 'silver' },
  { id: 'silver_tasks50', title: 'Siła Nawyku', desc: 'Wykonaj łącznie 50 zadań', rank: 'silver' },
  { id: 'silver_tasks100', title: 'Niezłomny', desc: 'Wykonaj łącznie 100 zadań', rank: 'silver' },
  { id: 'silver_workouts100', title: 'Stalowe Mięśnie', desc: 'Zarejestruj 100 aktywności', rank: 'silver' },
  
  { id: 'gold_level30', title: 'Elita', desc: 'Osiągnij 30 poziom', rank: 'gold' },
  { id: 'gold_level40', title: 'Nieśmiertelny', desc: 'Osiągnij 40 poziom', rank: 'gold' },
  { id: 'gold_workouts50', title: 'Maszyna', desc: 'Zarejestruj 50 aktywności', rank: 'gold' },
  { id: 'gold_tasks500', title: 'Cyborg', desc: 'Wykonaj łącznie 500 zadań', rank: 'gold' },
  { id: 'gold_workouts500', title: 'Herkules', desc: 'Zarejestruj 500 aktywności', rank: 'gold' },
  
  { id: 'platinum_level50', title: 'Absolutny Szczyt', desc: 'Osiągnij maksymalny 50 poziom', rank: 'platinum' },
  { id: 'platinum_master', title: 'Mistrz Dyscypliny', desc: 'Zdobądź wszystkie pozostałe trofea', rank: 'platinum' }
];

export const GOAL_CATEGORIES_CONFIG = {
  health: { id: 'health', label: '🌿 Zdrowie', dbCat: 'Zdrowie',
    types: [
      { id: 'no_sweets', label: 'Brak słodyczy (dni)' },
      { id: 'water', label: 'Picie wody (dni)' },
      { id: 'sleep', label: 'Sen min. 7h (dni)' }
    ]
  },
  sport: { id: 'sport', label: '🏃 Sport', dbCat: 'Zdrowie',
    types: [
      { id: 'walk_km', label: 'Marsz (km)' },
      { id: 'run', label: 'Bieganie (km)' },
      { id: 'bike', label: 'Rower (km)' },
      { id: 'stretching', label: 'Rozciąganie (min)' },
      { id: 'pullups', label: 'Drążek (powt.)' },
      { id: 'pushups', label: 'Pompki (powt.)' },
      { id: 'squats', label: 'Przysiady (powt.)' },
      { id: 'situps', label: 'Brzuszki (powt.)' }
    ]
  },
  book: { id: 'book', label: '📖 Książka', dbCat: 'Rozwój', types: [{ id: 'read_book', label: 'Liczba stron' }] },
  study: { id: 'study', label: '🧠 Nauka', dbCat: 'Rozwój',
    types: [
      { id: 'study', label: 'Nauka ogólna (godziny)' },
      { id: 'language', label: 'Język obcy (lekcje)' },
      { id: 'course', label: 'Kurs online (moduły)' }
    ]
  },
  work: { id: 'work', label: '💼 Praca', dbCat: 'Praca',
    types: [
      { id: 'deep_work', label: 'Praca w skupieniu (godziny)' },
      { id: 'project', label: 'Ukończone zadania (szt.)' }
    ]
  }
};

export const rankWeight = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
export const sortedTrophies = [...TROPHIES].sort((a, b) => rankWeight[b.rank] - rankWeight[a.rank]);

export const getTrophyColors = (rank, isEarned) => {
  if (!isEarned) return 'bg-slate-500/10 border-slate-500/20 text-slate-500 opacity-60 grayscale';
  if (rank === 'bronze') return 'bg-orange-700/20 border-orange-600/50 text-orange-500 shadow-inner';
  if (rank === 'silver') return 'bg-slate-300/20 border-slate-300/50 text-slate-300 shadow-inner';
  if (rank === 'gold') return 'bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
  if (rank === 'platinum') return 'bg-cyan-400/20 border-cyan-400/50 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] ring-1 ring-cyan-400';
};

export const getLevelInfo = (pkt) => {
  let level = 1;
  let pointsNeededForCurrentLevel = 100;
  let accumulatedPoints = 0;

  while (level < MAX_LEVEL) {
    if (pkt >= accumulatedPoints + pointsNeededForCurrentLevel) {
      accumulatedPoints += pointsNeededForCurrentLevel;
      level++;
      pointsNeededForCurrentLevel = Math.round(pointsNeededForCurrentLevel * 1.12);
    } else {
      break;
    }
  }
  const pointsInLevel = pkt - accumulatedPoints;
  let currentRank = RANKS[0].name;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (level >= RANKS[i].minLevel) {
      currentRank = RANKS[i].name;
      break;
    }
  }
  return { level, name: currentRank, pointsInLevel: Math.max(0, pointsInLevel), maxLevelPoints: pointsNeededForCurrentLevel };
};

export const taskAppliesToDate = (task, targetDateStr) => {
  if (targetDateStr < task.createdAt) return false;
  if (!task.repeat || task.repeat === 'once') {
    return task.dueDate === targetDateStr || (!task.isCompleted && task.dueDate < targetDateStr);
  }
  if (task.repeat === 'daily') return true;
  if (task.repeat === 'custom') {
    return task.customDates && task.customDates.includes(targetDateStr);
  }
  if (task.repeat === 'interval') {
    const start = parseLocalDate(task.createdAt);
    const target = parseLocalDate(targetDateStr);
    start.setHours(0,0,0,0);
    target.setHours(0,0,0,0);
    const diffTime = Math.abs(target - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays % (task.intervalDays || 2) === 0;
  }
  return false;
};

export const isTaskDoneForDate = (t, dateStr) => {
  if (!t.repeat || t.repeat === 'once') return Boolean(t.isCompleted);
  return Boolean(t.completedDates && t.completedDates[dateStr]);
};