export const INITIAL_CATEGORIES = [
  { id: 'Zdrowie', label: '🌿 Zdrowie', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border-emerald-500/50' },
  { id: 'Sport', label: '🏃 Sport', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold border-orange-500/50' },
  { id: 'Książka', label: '📖 Książka', color: 'bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold border-sky-500/50' },
  { id: 'Nauka', label: '🧠 Nauka', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold border-purple-500/50' },
  { id: 'Praca', label: '💼 Praca', color: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold border-indigo-500/50' },
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
  { id: 'bronze_task', title: 'Przebudzenie', desc: 'Wykonaj swoje pierwsze zadanie', rank: 'bronze', metric: 'tasks', target: 1 },
  { id: 'bronze_tasks3', title: 'Dobry początek', desc: 'Wykonaj łącznie 3 zadania', rank: 'bronze', metric: 'tasks', target: 3 },
  { id: 'bronze_tasks5', title: 'Pierwszy rytm', desc: 'Wykonaj łącznie 5 zadań', rank: 'bronze', metric: 'tasks', target: 5 },
  { id: 'bronze_tasks10', title: 'Rozgrzewka umysłu', desc: 'Wykonaj łącznie 10 zadań', rank: 'bronze', metric: 'tasks', target: 10 },
  { id: 'bronze_tasks15', title: 'Coraz pewniej', desc: 'Wykonaj łącznie 15 zadań', rank: 'bronze', metric: 'tasks', target: 15 },
  { id: 'bronze_tasks25', title: 'Ćwierć setki', desc: 'Wykonaj łącznie 25 zadań', rank: 'bronze', metric: 'tasks', target: 25 },
  { id: 'bronze_workout', title: 'Rozgrzewka', desc: 'Zarejestruj pierwszą aktywność', rank: 'bronze', metric: 'workouts', target: 1 },
  { id: 'bronze_workouts3', title: 'W ruchu', desc: 'Zarejestruj 3 aktywności', rank: 'bronze', metric: 'workouts', target: 3 },
  { id: 'bronze_workouts5', title: 'Aktywny tydzień', desc: 'Zarejestruj 5 aktywności', rank: 'bronze', metric: 'workouts', target: 5 },
  { id: 'bronze_workouts10', title: 'Młody Wilk', desc: 'Zarejestruj 10 aktywności', rank: 'bronze', metric: 'workouts', target: 10 },
  { id: 'bronze_level2', title: 'Pierwszy awans', desc: 'Osiągnij 2 poziom', rank: 'bronze', metric: 'level', target: 2 },
  { id: 'bronze_level3', title: 'Nabierasz rozpędu', desc: 'Osiągnij 3 poziom', rank: 'bronze', metric: 'level', target: 3 },
  { id: 'bronze_level5', title: 'Pierwsza krew', desc: 'Osiągnij 5 poziom', rank: 'bronze', metric: 'level', target: 5 },
  { id: 'bronze_note', title: 'Chwila refleksji', desc: 'Zapisz pierwszą notatkę dnia', rank: 'bronze', metric: 'notes', target: 1 },
  { id: 'bronze_goal', title: 'Cel osiągnięty', desc: 'Ukończ swój pierwszy cel', rank: 'bronze', metric: 'goals', target: 1 },
  { id: 'bronze_days3', title: 'Trzy dni działania', desc: 'Bądź aktywny w 3 różnych dniach', rank: 'bronze', metric: 'activeDays', target: 3 },
  { id: 'bronze_days7', title: 'Pełny tydzień', desc: 'Bądź aktywny w 7 różnych dniach', rank: 'bronze', metric: 'activeDays', target: 7 },
  { id: 'bronze_reading', title: 'Pierwsze strony', desc: 'Zarejestruj pierwszą aktywność czytelniczą', rank: 'bronze', metric: 'reading', target: 1 },
  { id: 'bronze_categories3', title: 'Wszechstronny', desc: 'Wykonaj zadania z 3 różnych kategorii', rank: 'bronze', metric: 'categories', target: 3 },
  { id: 'bronze_points100', title: 'Pierwsza setka', desc: 'Zdobądź łącznie 100 punktów', rank: 'bronze', metric: 'points', target: 100 },

  { id: 'silver_tasks50', title: 'Siła Nawyku', desc: 'Wykonaj łącznie 50 zadań', rank: 'silver', metric: 'tasks', target: 50 },
  { id: 'silver_tasks75', title: 'Stabilna forma', desc: 'Wykonaj łącznie 75 zadań', rank: 'silver', metric: 'tasks', target: 75 },
  { id: 'silver_tasks100', title: 'Niezłomny', desc: 'Wykonaj łącznie 100 zadań', rank: 'silver', metric: 'tasks', target: 100 },
  { id: 'silver_tasks150', title: 'Żelazna rutyna', desc: 'Wykonaj łącznie 150 zadań', rank: 'silver', metric: 'tasks', target: 150 },
  { id: 'silver_tasks200', title: 'Dwieście zwycięstw', desc: 'Wykonaj łącznie 200 zadań', rank: 'silver', metric: 'tasks', target: 200 },
  { id: 'silver_workouts25', title: 'Sportowy nawyk', desc: 'Zarejestruj 25 aktywności', rank: 'silver', metric: 'workouts', target: 25 },
  { id: 'gold_workouts50', title: 'Maszyna', desc: 'Zarejestruj 50 aktywności', rank: 'silver', metric: 'workouts', target: 50 },
  { id: 'silver_workouts75', title: 'Nie zwalniasz', desc: 'Zarejestruj 75 aktywności', rank: 'silver', metric: 'workouts', target: 75 },
  { id: 'silver_workouts100', title: 'Stalowe Mięśnie', desc: 'Zarejestruj 100 aktywności', rank: 'silver', metric: 'workouts', target: 100 },
  { id: 'silver_level10', title: 'Wędrowiec', desc: 'Osiągnij 10 poziom', rank: 'silver', metric: 'level', target: 10 },
  { id: 'silver_level15', title: 'Zdobywca', desc: 'Osiągnij 15 poziom', rank: 'silver', metric: 'level', target: 15 },
  { id: 'silver_level20', title: 'Hart Ducha', desc: 'Osiągnij 20 poziom', rank: 'silver', metric: 'level', target: 20 },
  { id: 'silver_level25', title: 'Połowa drogi', desc: 'Osiągnij 25 poziom', rank: 'silver', metric: 'level', target: 25 },
  { id: 'silver_notes10', title: 'Uważny obserwator', desc: 'Zapisz notatki dla 10 dni', rank: 'silver', metric: 'notes', target: 10 },
  { id: 'silver_goals3', title: 'Skuteczny strateg', desc: 'Ukończ 3 cele', rank: 'silver', metric: 'goals', target: 3 },
  { id: 'silver_days14', title: 'Dwa tygodnie działania', desc: 'Bądź aktywny w 14 różnych dniach', rank: 'silver', metric: 'activeDays', target: 14 },
  { id: 'silver_points1500', title: 'Punktowy wojownik', desc: 'Zdobądź łącznie 1500 punktów', rank: 'silver', metric: 'points', target: 1500 },

  { id: 'gold_tasks250', title: 'Ćwierć tysiąca', desc: 'Wykonaj łącznie 250 zadań', rank: 'gold', metric: 'tasks', target: 250 },
  { id: 'gold_tasks300', title: 'Mistrz działania', desc: 'Wykonaj łącznie 300 zadań', rank: 'gold', metric: 'tasks', target: 300 },
  { id: 'gold_tasks400', title: 'Potęga konsekwencji', desc: 'Wykonaj łącznie 400 zadań', rank: 'gold', metric: 'tasks', target: 400 },
  { id: 'gold_tasks500', title: 'Cyborg', desc: 'Wykonaj łącznie 500 zadań', rank: 'gold', metric: 'tasks', target: 500 },
  { id: 'gold_tasks750', title: 'Legenda działania', desc: 'Wykonaj łącznie 750 zadań', rank: 'gold', metric: 'tasks', target: 750 },
  { id: 'gold_workouts150', title: 'Atleta', desc: 'Zarejestruj 150 aktywności', rank: 'gold', metric: 'workouts', target: 150 },
  { id: 'gold_workouts250', title: 'Tytan ruchu', desc: 'Zarejestruj 250 aktywności', rank: 'gold', metric: 'workouts', target: 250 },
  { id: 'gold_workouts500', title: 'Herkules', desc: 'Zarejestruj 500 aktywności', rank: 'gold', metric: 'workouts', target: 500 },
  { id: 'gold_level30', title: 'Elita', desc: 'Osiągnij 30 poziom', rank: 'gold', metric: 'level', target: 30 },
  { id: 'gold_level40', title: 'Nieśmiertelny', desc: 'Osiągnij 40 poziom', rank: 'gold', metric: 'level', target: 40 },
  { id: 'platinum_level50', title: 'Absolutny Szczyt', desc: 'Osiągnij maksymalny 50 poziom', rank: 'gold', metric: 'level', target: 50 },
  { id: 'gold_days60', title: 'Długodystansowiec', desc: 'Bądź aktywny w 60 różnych dniach', rank: 'gold', metric: 'activeDays', target: 60 },
  { id: 'gold_goals10', title: 'Architekt sukcesu', desc: 'Ukończ 10 celów', rank: 'gold', metric: 'goals', target: 10 }
];

export const GOAL_CATEGORIES_CONFIG = {
  health: { id: 'health', label: '🌿 Zdrowie', dbCat: 'Zdrowie',
    types: [
      { id: 'no_sweets', label: 'Brak słodyczy (dni/godziny)' },
      { id: 'water', label: 'Picie wody (dni)' },
      { id: 'sleep', label: 'Sen min. 7h (dni)' }
    ]
  },
  sport: { id: 'sport', label: '🏃 Sport', dbCat: 'Sport',
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
  book: { id: 'book', label: '📖 Książka', dbCat: 'Książka', types: [{ id: 'read_book', label: 'Liczba stron' }, { id: 'read_chapters', label: 'Liczba rozdziałów' }] },
  study: { id: 'study', label: '🧠 Nauka', dbCat: 'Nauka',
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
