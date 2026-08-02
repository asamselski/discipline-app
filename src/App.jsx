import React, { useState, useEffect, useRef } from 'react';
import { QUOTES } from './data/quotes';
import { 
  CheckCircle2, Circle, Plus, Trophy, Zap, 
  Trash2, Calendar as CalendarIcon, Check, Play, Pause, Quote, X, User, Settings, ShieldCheck, Sun, Moon, Sparkles, Flame, MessageSquare, AlertTriangle, Edit3, Target, Activity, Dumbbell, Footprints, Utensils, Brain, ChevronDown, GripVertical, Bell, Laptop, BookOpen, Archive, RotateCcw,
  ChevronLeft, ChevronRight, PieChart, CheckSquare, Type, Clock,
  Award, Share2, Lock, MoreVertical
} from 'lucide-react';

const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatDateStr = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getAppDayString = (customResetTime) => {
  const resetTimeStr = customResetTime !== undefined ? customResetTime : (localStorage.getItem('discipline_reset_time') || '00:00');
  const now = new Date();
  const [resetH, resetM] = resetTimeStr.split(':').map(Number);
    
  let appDate = new Date(now);
  if (now.getHours() < resetH || (now.getHours() === resetH && now.getMinutes() < resetM)) {
    appDate.setDate(appDate.getDate() - 1);
  }
    
  return formatDateStr(appDate);
};

const INITIAL_CATEGORIES = [
  { id: 'Zdrowie', label: '🌿 Zdrowie', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border-emerald-500/50' },
  { id: 'Sport', label: '🏃 Sport', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold border-orange-500/50' },
  { id: 'Książka', label: '📖 Książka', color: 'bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold border-sky-500/50' },
  { id: 'Nauka', label: '🧠 Nauka', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold border-purple-500/50' },
  { id: 'Praca', label: '💼 Praca', color: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold border-indigo-500/50' },
  { id: 'Ogólne', label: '🎯 Ogólne', color: 'bg-slate-500/20 text-slate-600 dark:text-slate-400 font-bold border-slate-500/50' },
];

const FONT_SIZE_OPTIONS = [
  { level: 1, name: 'Bardzo mała', sizeClass: 'text-xs', headerClass: 'text-lg', smallClass: 'text-[10px]' },
  { level: 2, name: 'Mała', sizeClass: 'text-sm', headerClass: 'text-xl', smallClass: 'text-xs' },
  { level: 3, name: 'Normalna', sizeClass: 'text-base', headerClass: 'text-2xl md:text-3xl', smallClass: 'text-sm' },
  { level: 4, name: 'Duża', sizeClass: 'text-lg', headerClass: 'text-3xl md:text-4xl', smallClass: 'text-base' },
  { level: 5, name: 'Bardzo duża', sizeClass: 'text-xl', headerClass: 'text-4xl md:text-5xl', smallClass: 'text-lg' },
  { level: 6, name: 'Maksymalna', sizeClass: 'text-2xl', headerClass: 'text-5xl md:text-6xl', smallClass: 'text-xl' },
];

const MAX_LEVEL = 50;

const RANKS = [
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

const TROPHIES = [
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

const GOAL_CATEGORIES_CONFIG = {
  health: { id: 'health', label: '🌿 Zdrowie', dbCat: 'Zdrowie',
    types: [
      { id: 'no_sweets', label: 'Brak słodyczy (dni)' },
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
  book: { id: 'book', label: '📖 Książka', dbCat: 'Książka', types: [{ id: 'read_book', label: 'Liczba stron' }] },
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

const rankWeight = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
const sortedTrophies = [...TROPHIES].sort((a, b) => rankWeight[b.rank] - rankWeight[a.rank]);

const getTrophyColors = (rank, isEarned) => {
  if (!isEarned) return 'bg-slate-500/10 border-slate-500/20 text-slate-500 opacity-60 grayscale';
  if (rank === 'bronze') return 'bg-orange-700/20 border-orange-600/50 text-orange-500 shadow-inner';
  if (rank === 'silver') return 'bg-slate-300/20 border-slate-300/50 text-slate-300 shadow-inner';
  if (rank === 'gold') return 'bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
  if (rank === 'platinum') return 'bg-cyan-400/20 border-cyan-400/50 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] ring-1 ring-cyan-400';
};

const getLevelInfo = (pkt) => {
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

const taskAppliesToDate = (task, targetDateStr) => {
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

const isTaskDoneForDate = (t, dateStr) => {
  if (!t.repeat || t.repeat === 'once') return Boolean(t.isCompleted);
  return Boolean(t.completedDates && t.completedDates[dateStr]);
};

export default function App() {
  const [resetTime, setResetTime] = useState(() => localStorage.getItem('discipline_reset_time') || '00:00');
  const [todayStr, setTodayStr] = useState(() => getAppDayString());

  useEffect(() => {
    const interval = setInterval(() => {
      const currentAppDay = getAppDayString(resetTime);
      if (currentAppDay !== todayStr) setTodayStr(currentAppDay);
    }, 30000);
    return () => clearInterval(interval);
  }, [todayStr, resetTime]);

  const [activeTab, setActiveTab] = useState('today');
  const chartScrollRef = useRef(null);
    
  const [userName, setUserName] = useState(() => localStorage.getItem('discipline_user_name') || 'Wojownik');
  const [userGender, setUserGender] = useState(() => localStorage.getItem('discipline_user_gender') || 'male');
  const [theme, setTheme] = useState(() => localStorage.getItem('discipline_theme') || 'system');
  const [fontSizeLevel, setFontSizeLevel] = useState(() => {
    const saved = localStorage.getItem('discipline_font_size');
    return saved ? parseInt(saved, 10) : 3;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('discipline_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      const finalCats = [...INITIAL_CATEGORIES];
      const defaultIds = ['Zdrowie', 'Rozwój', 'Praca', 'Dom', 'Ogólne', 'Sport', 'Książka', 'Nauka'];
      parsed.forEach(c => {
        if (!defaultIds.includes(c.id) && !finalCats.some(fc => fc.id === c.id)) {
          finalCats.push(c);
        }
      });
      return finalCats;
    }
    return INITIAL_CATEGORIES;
  });

  const [newCatLabel, setNewCatLabel] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showTrophiesModal, setShowTrophiesModal] = useState(false);
  const [showRanksModal, setShowRanksModal] = useState(false);

  const [formErrors, setFormErrors] = useState({});
  const clearError = (field) => setFormErrors(prev => ({ ...prev, [field]: false }));

  const [blockOrder, setBlockOrder] = useState(() => {
    const saved = localStorage.getItem('discipline_block_order');
    if (saved) {
      let parsed = JSON.parse(saved);
      parsed = parsed.filter(id => INITIAL_CATEGORIES.some(c => c.id === id));
      INITIAL_CATEGORIES.forEach(c => {
         if (!parsed.includes(c.id)) parsed.push(c.id);
      });
      return parsed;
    }
    return INITIAL_CATEGORIES.map(c => c.id);
  });

  const [collapsedSections, setCollapsedSections] = useState(() => {
    const saved = localStorage.getItem('discipline_collapsed_sections');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeGoalsCollapsed, setActiveGoalsCollapsed] = useState(false);
  const [futureTasksCollapsed, setFutureTasksCollapsed] = useState(false);
  const [upcomingTasksCollapsed, setUpcomingTasksCollapsed] = useState(false);

  const toggleSection = (sectionKey) => {
    setCollapsedSections(prev => {
      const updated = { ...prev, [sectionKey]: !prev[sectionKey] };
      localStorage.setItem('discipline_collapsed_sections', JSON.stringify(updated));
      return updated;
    });
  };

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('discipline_tasks_unified');
    if (savedTasks) return JSON.parse(savedTasks);
    return [
      { id: 1, title: 'Trening fizyczny', category: 'Zdrowie', goalId: null, pkt: 35, difficulty: 'hard', repeat: 'daily', duration: 30, hasReminder: false, reminderTime: '08:00', createdAt: getAppDayString(), dueDate: getAppDayString(), isCompleted: false, completedDates: {} },
      { id: 3, title: 'Nauka programowania', category: 'Nauka', goalId: null, pkt: 25, difficulty: 'medium', repeat: 'daily', duration: 45, hasReminder: false, reminderTime: '08:00', createdAt: getAppDayString(), dueDate: getAppDayString(), isCompleted: false, completedDates: {} }
    ];
  });

  const [workouts, setWorkouts] = useState(() => {
    const savedWorkouts = localStorage.getItem('discipline_workouts');
    if (savedWorkouts) return JSON.parse(savedWorkouts);
    return [];
  });

  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem('discipline_goals');
    if (savedGoals) return JSON.parse(savedGoals);
    return [
      { id: 302, title: 'Wiedźmin: Ostatnie Życzenie', category: 'Książka', type: 'read_book', target: 332, currentPage: 120, dueDate: getAppDayString(), comment: '', isDaily: false }
    ];
  });

  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('discipline_notes');
    return savedNotes ? JSON.parse(savedNotes) : {};
  });

  const [earnedTrophies, setEarnedTrophies] = useState(() => {
    const saved = localStorage.getItem('discipline_trophies');
    return saved ? JSON.parse(saved) : {};
  });
  const [newTrophyModal, setNewTrophyModal] = useState(null);

  const [selectedMonthDate, setSelectedMonthDate] = useState(() => new Date());
  const [taskPickerDate, setTaskPickerDate] = useState(() => new Date());
  const [calendarViewDate, setCalendarViewDate] = useState(() => new Date());

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Zdrowie');
  const [newTaskGoalId, setNewTaskGoalId] = useState('');
  const [newTaskRepeat, setNewTaskRepeat] = useState('once');
  const [newTaskIntervalDays, setNewTaskIntervalDays] = useState('2');
  const [newTaskCustomDates, setNewTaskCustomDates] = useState([]);
  const [newTaskDueDate, setNewTaskDueDate] = useState(() => getAppDayString());
  const [newTaskDuration, setNewTaskDuration] = useState('');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState('medium');
  const [newTaskHasReminder, setNewTaskHasReminder] = useState(false);
  const [newTaskReminderTime, setNewTaskReminderTime] = useState('08:00');

  const [newWorkoutType, setNewWorkoutType] = useState('run');
  const [newWorkoutAmount, setNewWorkoutAmount] = useState('');
  const [newWorkoutGoalId, setNewWorkoutGoalId] = useState('');

  const [goalWizardStep, setGoalWizardStep] = useState(0); 
  const [wizardData, setWizardData] = useState({
    categoryKey: '',  
    type: '',         
    title: '',
    target: '',
    dueDate: getAppDayString(),
    isDaily: false,
    createTask: false,
    taskRepeat: 'daily',
    taskTitle: '',
    taskAmount: '',
    taskDifficulty: 'medium',
    taskDuration: ''
  });

  const openGoalWizard = () => {
    setWizardData({
      categoryKey: '', type: '', title: '', target: '', 
      dueDate: getAppDayString(), isDaily: false, 
      createTask: false, taskRepeat: 'daily', taskTitle: '',
      taskAmount: '', taskDifficulty: 'medium', taskDuration: ''
    });
    setFormErrors({}); 
    setGoalWizardStep(1);
    setShowAddGoalModal(true); 
  };

  const getUnitForType = (type) => {
    const units = {
      walk_km: 'km', run: 'km', bike: 'km',
      stretching: 'min', gym: 'min',
      pullups: 'powt.', pushups: 'powt.', squats: 'powt.', situps: 'powt.',
      read_book: 'stron', read_chapters: 'rozdziałów',
      study: 'godz.', language: 'lekcji', course: 'modułów',
      deep_work: 'godz.', project: 'szt.',
      no_sweets: 'dni', water: 'dni', sleep: 'dni', steps: 'kroków'
    };
    return units[type] || 'jedn.';
  };

  const [activityGoalId, setActivityGoalId] = useState('');
  const [activityPages, setActivityPages] = useState('');

  const [editingTask, setEditingTask] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);

  const [confirmDeleteModal, setConfirmDeleteModal] = useState(null);
  const [confirmCompleteModal, setConfirmCompleteModal] = useState(null);
  const [completeTaskValue, setCompleteTaskValue] = useState('');

  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showAllQuotesModal, setShowAllQuotesModal] = useState(false);
  const [showDeleteNoteConfirm, setShowDeleteNoteConfirm] = useState(false);
  const [openMenuTaskId, setOpenMenuTaskId] = useState(null);
    
  const [selectedDate, setSelectedDate] = useState(() => getAppDayString());

  const [lastCheckedLevel, setLastCheckedLevel] = useState(() => {
    const saved = localStorage.getItem('discipline_last_checked_level');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [levelUpModalData, setLevelUpModalData] = useState(null);

  // Zamykanie menu po kliknięciu poza elementem
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuTaskId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeTab === 'profile' && chartScrollRef.current) {
      const now = new Date();
      if (selectedMonthDate.getFullYear() === now.getFullYear() && selectedMonthDate.getMonth() === now.getMonth()) {
        const day = now.getDate();
        const itemWidth = 42;
        const scrollX = (day - 1) * itemWidth - (chartScrollRef.current.clientWidth / 2) + (itemWidth / 2);
        
        setTimeout(() => {
          if (chartScrollRef.current) {
            chartScrollRef.current.scrollTo({ left: Math.max(0, scrollX), behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [activeTab, selectedMonthDate]);

  useEffect(() => {
    localStorage.setItem('discipline_theme', theme);
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => document.body.className = e.matches ? 'theme-dark' : 'theme-light';
      document.body.className = mediaQuery.matches ? 'theme-dark' : 'theme-light';
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      document.body.className = 'theme-' + theme;
    }
  }, [theme]);

  useEffect(() => {
    const reminderInterval = setInterval(() => {
      const now = new Date();
      const currentTimeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        
      tasks.forEach(t => {
        if (t.hasReminder && t.reminderTime === currentTimeStr && taskAppliesToDate(t, todayStr)) {
          const isDone = isTaskDoneForDate(t, todayStr);
          if (!isDone && t.lastNotifiedDate !== todayStr && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Przypomnienie o zadaniu! ⚡', { body: `Czas na wykonanie: "${t.title}"` });
            setTasks(prev => prev.map(item => item.id === t.id ? { ...item, lastNotifiedDate: todayStr } : item));
          }
        }
      });
    }, 30000);
    return () => clearInterval(reminderInterval);
  }, [tasks, todayStr]);

  useEffect(() => localStorage.setItem('discipline_tasks_unified', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('discipline_workouts', JSON.stringify(workouts)), [workouts]);
  useEffect(() => localStorage.setItem('discipline_goals', JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem('discipline_notes', JSON.stringify(notes)), [notes]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => {
        let updated = false;
        const newTasks = prev.map(t => {
          if (t.isRunning && t.timeLeft > 0) {
            updated = true;
            const newTime = t.timeLeft - 1;
            const isFinished = newTime === 0;
            const newCompletedDates = { ...(t.completedDates || {}) };
            if (isFinished && t.repeat && t.repeat !== 'once') {
              newCompletedDates[todayStr] = true;
            }
            return {
              ...t,
              timeLeft: newTime,
              isCompleted: isFinished ? (t.repeat && t.repeat !== 'once' ? t.isCompleted : true) : t.isCompleted,
              completedDates: newCompletedDates,
              isRunning: isFinished ? false : t.isRunning
            };
          }
          return t;
        });
        if (!updated) return prev;
        return newTasks;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [todayStr]);

  const getCategoryTheme = (catName) => {
    const map = {
      'Zdrowie': { bg: 'bg-emerald-500/10 dark:bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', itemBg: 'bg-emerald-500/5', itemBorder: 'border-emerald-500/20', itemDoneBg: 'bg-emerald-500/20', iconText: 'text-emerald-500' },
      'Sport': { bg: 'bg-orange-500/10 dark:bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-700 dark:text-orange-400', itemBg: 'bg-orange-500/5', itemBorder: 'border-orange-500/20', itemDoneBg: 'bg-orange-500/20', iconText: 'text-orange-500' },
      'Książka': { bg: 'bg-sky-500/10 dark:bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-700 dark:text-sky-400', itemBg: 'bg-sky-500/5', itemBorder: 'border-sky-500/20', itemDoneBg: 'bg-sky-500/20', iconText: 'text-sky-500' },
      'Nauka': { bg: 'bg-purple-500/10 dark:bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-700 dark:text-purple-400', itemBg: 'bg-purple-500/5', itemBorder: 'border-purple-500/20', itemDoneBg: 'bg-purple-500/20', iconText: 'text-purple-500' },
      'Praca': { bg: 'bg-indigo-500/10 dark:bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-700 dark:text-indigo-400', itemBg: 'bg-indigo-500/5', itemBorder: 'border-indigo-500/20', itemDoneBg: 'bg-indigo-500/20', iconText: 'text-indigo-500' },
      'Ogólne': { bg: 'bg-slate-500/10 dark:bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-700 dark:text-slate-400', itemBg: 'bg-slate-500/5', itemBorder: 'border-slate-500/20', itemDoneBg: 'bg-slate-500/20', iconText: 'text-slate-500' }
    };
    return map[catName] || map['Ogólne'];
  };

  const getCategoryStyle = (catName) => {
    const found = categories.find(c => c.id === catName);
    return found ? found.color : 'bg-slate-500/20 text-slate-600 dark:text-slate-400 font-bold border-slate-500/50';
  };

  const addCategory = (e) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;
    const catId = newCatLabel.trim().replace(/\s+/g, '_');
    if (categories.some(c => c.id === catId)) return;
    const colors = [
      'bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold border-purple-500/50',
      'bg-pink-500/20 text-pink-600 dark:text-pink-400 font-bold border-pink-500/50',
      'bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold border-orange-500/50',
      'bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold border-teal-500/50',
      'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold border-rose-500/50'
    ];
    setCategories([...categories, { id: catId, label: newCatLabel.trim(), color: colors[Math.floor(Math.random() * colors.length)] }]);
    setNewCatLabel('');
  };

  const deleteCategory = (catId) => {
    if (categories.length <= 1) return;
    setCategories(categories.filter(c => c.id !== catId));
  };

  const getTaskStreak = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.repeat !== 'daily') return 0;
    let streak = 0;
    let checkDate = new Date(parseLocalDate(todayStr));
    
    if (isTaskDoneForDate(task, todayStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    } else {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
        const dateString = formatDateStr(checkDate);
        if (dateString < task.createdAt) break;
        if (isTaskDoneForDate(task, dateString)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
  };

  const checkStreakBonus = (taskId, targetDateStr) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.repeat !== 'daily') return false;
    const target = parseLocalDate(targetDateStr);
    target.setDate(target.getDate() - 1);
    const prevDayStr = formatDateStr(target);
    return isTaskDoneForDate(task, prevDayStr);
  };

  const toggleTaskStatus = (id, targetDate = todayStr) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        if (t.repeat && t.repeat !== 'once') {
          const currentDone = Boolean(t.completedDates && t.completedDates[targetDate]);
          const updatedDates = { ...(t.completedDates || {}), [targetDate]: !currentDone };
          return { ...t, completedDates: updatedDates, isRunning: false };
        } else {
          const currentDone = Boolean(t.isCompleted);
          return { ...t, isCompleted: !currentDone, completedAt: !currentDone ? targetDate : null, isRunning: false };
        }
      }
      return t;
    }));
  };

  const toggleTimer = (id, e) => {
    e.stopPropagation();
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, isRunning: !t.isRunning };
      }
      return t;
    }));
  };

  const executeDelete = () => {
    if (!confirmDeleteModal) return;
    const { type, id } = confirmDeleteModal;

    if (type === 'task') setTasks(tasks.filter(t => t.id !== id));
    else if (type === 'workout') {
      const wToDelete = workouts.find(w => w.id === id);
      if (wToDelete && wToDelete.goalId) {
         setGoals(goals.map(g => {
            if (g.id === wToDelete.goalId) {
               return { ...g, currentPage: Math.max(0, (g.currentPage || 0) - wToDelete.amount) };
            }
            return g;
         }));
      }
      setWorkouts(workouts.filter(w => w.id !== id));
    }
    else if (type === 'goal') setGoals(goals.filter(g => g.id !== id));

    setConfirmDeleteModal(null);
  };

  const executeComplete = () => {
    if (!confirmCompleteModal) return;
    const { type, id, isDone, goalId, targetDate } = confirmCompleteModal;
    const dateToUse = targetDate || todayStr;

    if (type === 'task') {
      toggleTaskStatus(id, dateToUse);

      if (!isDone && goalId && completeTaskValue) {
         const val = parseFloat(completeTaskValue);
         if (!isNaN(val) && val > 0) {
             const targetGoal = goals.find(g => g.id === goalId);
             if (targetGoal) {
                 let unitLabel = 'jednostek';
                 if (targetGoal.type === 'study') unitLabel = 'godz.';
                 else if (targetGoal.type === 'no_sweets') unitLabel = 'dni';
                 else if (targetGoal.type === 'read_book') unitLabel = 'stron';
                 else if (targetGoal.type === 'read_chapters') unitLabel = 'rozdziałów';
                 else unitLabel = 'wartość';

                 const newWorkout = {
                     id: Date.now(),
                     taskId: id, 
                     goalId: targetGoal.id, 
                     date: dateToUse, 
                     type: targetGoal.type,
                     amount: val,
                     unit: unitLabel,
                     pkt: 0 
                 };
                 
                 setWorkouts(prev => [newWorkout, ...prev]);

                 if (!targetGoal.isDaily) {
                     setGoals(prev => prev.map(g => g.id === targetGoal.id ? { ...g, currentPage: Math.min(g.target, (g.currentPage || 0) + val) } : g));
                 }
             }
         }
      } else if (isDone && goalId) {
         const workoutToUndo = workouts.find(w => w.taskId === id && w.date === dateToUse);
         
         if (workoutToUndo) {
             setWorkouts(prev => prev.filter(w => w.id !== workoutToUndo.id));
             
             const targetGoal = goals.find(g => g.id === goalId);
             if (targetGoal && !targetGoal.isDaily) {
                 setGoals(prev => prev.map(g => {
                     if (g.id === targetGoal.id) {
                         return { ...g, currentPage: Math.max(0, (g.currentPage || 0) - workoutToUndo.amount) };
                     }
                     return g;
                 }));
             }
         }
      }
    }
    setConfirmCompleteModal(null);
    setCompleteTaskValue('');
  };

  const restoreArchivedItem = (type, item) => {
    if (type === 'task') {
      setTasks(tasks.map(t => {
        if (t.id === item.id) {
          if (t.repeat && t.repeat !== 'once') {
            const updatedDates = { ...(t.completedDates || {}) };
            delete updatedDates[item.date];
            return { ...t, completedDates: updatedDates };
          } else {
            return { ...t, isCompleted: false, completedAt: null };
          }
        }
        return t;
      }));
    } else if (type === 'goal') {
      setGoals(goals.map(g => {
        if (g.id === item.id) {
          return { ...g, currentPage: Math.max(0, g.target - 1) };
        }
        return g;
      }));
    }
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setFormErrors(prev => ({ ...prev, newTaskTitle: true }));
      return;
    }

    const durationMin = parseInt(newTaskDuration) || 0;
    let basePkt = newTaskDifficulty === 'easy' ? 10 : newTaskDifficulty === 'hard' ? 35 : 20;
    const finalPkt = durationMin > 0 ? Math.max(basePkt, Math.min(50, durationMin)) : basePkt;

    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      goalId: newTaskGoalId ? parseInt(newTaskGoalId) : null,
      pkt: finalPkt,
      difficulty: newTaskDifficulty,
      repeat: newTaskRepeat,
      intervalDays: newTaskRepeat === 'interval' ? parseInt(newTaskIntervalDays) || 2 : 1,
      customDates: newTaskRepeat === 'custom' ? newTaskCustomDates : [],
      dueDate: newTaskDueDate,
      duration: durationMin,
      hasReminder: newTaskHasReminder,
      reminderTime: newTaskReminderTime,
      createdAt: todayStr,
      isCompleted: false,
      completedDates: {},
      timeLeft: durationMin * 60,
      isRunning: false
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskGoalId('');
    setNewTaskDuration('');
    setNewTaskDifficulty('medium');
    setNewTaskRepeat('once');
    setNewTaskCustomDates([]);
    setNewTaskHasReminder(false);
    setNewTaskReminderTime('08:00');
    setShowAddTaskModal(false);
  };

  const addWorkout = (e) => {
    e.preventDefault();
    const amountVal = parseFloat(newWorkoutAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
       setFormErrors(prev => ({ ...prev, newWorkoutAmount: true }));
       return;
    }
    
    let calculatedPkt = 20; let unit = 'km';
    if (newWorkoutType === 'run') { calculatedPkt = Math.round(amountVal * 10); unit = 'km'; }
    else if (newWorkoutType === 'walk_km') { calculatedPkt = Math.round(amountVal * 5); unit = 'km'; }
    else if (newWorkoutType === 'pushups') { calculatedPkt = Math.round((amountVal / 10) * 2); unit = 'powt.'; }
    else if (newWorkoutType === 'pullups') { calculatedPkt = Math.round((amountVal / 5) * 2); unit = 'powt.'; }
    else if (newWorkoutType === 'squats') { calculatedPkt = Math.round((amountVal / 20) * 2); unit = 'powt.'; }
    else if (newWorkoutType === 'situps') { calculatedPkt = Math.round((amountVal / 15) * 2); unit = 'powt.'; }
    else if (newWorkoutType === 'bike') { calculatedPkt = Math.round(amountVal * 5); unit = 'km'; }
    else if (newWorkoutType === 'gym') { calculatedPkt = Math.round(amountVal * 3); unit = 'min'; }
    else if (newWorkoutType === 'steps') { calculatedPkt = Math.round(amountVal / 1000 * 5); unit = 'kroków'; }
    else if (newWorkoutType === 'study') { calculatedPkt = Math.round(amountVal * 10); unit = 'godz.'; }
    else if (newWorkoutType === 'read_book') { calculatedPkt = Math.round(amountVal * 1); unit = 'stron'; }
    else if (newWorkoutType === 'read_chapters') { calculatedPkt = Math.round(amountVal * 5); unit = 'rozdziałów'; }
    else if (newWorkoutType === 'no_sweets') { calculatedPkt = Math.round(amountVal * 20); unit = 'dni'; }
      
    const newWorkoutObj = { 
      id: Date.now(), 
      date: todayStr, 
      type: newWorkoutType, 
      amount: amountVal, 
      unit, 
      pkt: calculatedPkt,
      goalId: newWorkoutGoalId ? parseInt(newWorkoutGoalId) : null
    };

    if (newWorkoutGoalId) {
      const goal = goals.find(g => g.id === parseInt(newWorkoutGoalId));
      if (goal && !goal.isDaily && (goal.type === 'read_book' || goal.type === 'read_chapters' || goal.type === 'study' || goal.type === 'no_sweets')) {
          const newCurrent = Math.min(goal.target, (goal.currentPage || 0) + amountVal);
          setGoals(goals.map(g => g.id === goal.id ? { ...g, currentPage: newCurrent } : g));
      }
    }

    setWorkouts([newWorkoutObj, ...workouts]);
    setNewWorkoutAmount('');
    setNewWorkoutGoalId('');
    setShowAddWorkoutModal(false);
    setIsFabOpen(false);
  };

  const saveEditedWorkout = (e) => {
    e.preventDefault();
    const amountVal = parseFloat(editingWorkout.amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setFormErrors(prev => ({ ...prev, editingWorkoutAmount: true }));
      return;
    }
    
    let calculatedPkt = 20; let unit = 'km';
    if (editingWorkout.type === 'run') { calculatedPkt = Math.round(amountVal * 10); unit = 'km'; }
    else if (editingWorkout.type === 'walk_km') { calculatedPkt = Math.round(amountVal * 5); unit = 'km'; }
    else if (editingWorkout.type === 'pushups') { calculatedPkt = Math.round((amountVal / 10) * 2); unit = 'powt.'; }
    else if (editingWorkout.type === 'pullups') { calculatedPkt = Math.round((amountVal / 5) * 2); unit = 'powt.'; }
    else if (editingWorkout.type === 'squats') { calculatedPkt = Math.round((amountVal / 20) * 2); unit = 'powt.'; }
    else if (editingWorkout.type === 'situps') { calculatedPkt = Math.round((amountVal / 15) * 2); unit = 'powt.'; }
    else if (editingWorkout.type === 'bike') { calculatedPkt = Math.round(amountVal * 5); unit = 'km'; }
    else if (editingWorkout.type === 'gym') { calculatedPkt = Math.round(amountVal * 3); unit = 'min'; }
    else if (editingWorkout.type === 'steps') { calculatedPkt = Math.round(amountVal / 1000 * 5); unit = 'kroków'; }
    else if (editingWorkout.type === 'study') { calculatedPkt = Math.round(amountVal * 10); unit = 'godz.'; }
    else if (editingWorkout.type === 'read_book') { calculatedPkt = Math.round(amountVal * 1); unit = 'stron'; }
    else if (editingWorkout.type === 'read_chapters') { calculatedPkt = Math.round(amountVal * 5); unit = 'rozdziałów'; }
    else if (editingWorkout.type === 'no_sweets') { calculatedPkt = Math.round(amountVal * 20); unit = 'dni'; }
      
    const updatedWorkout = { 
      ...editingWorkout, 
      amount: amountVal, 
      unit, 
      pkt: calculatedPkt,
      goalId: editingWorkout.goalId ? parseInt(editingWorkout.goalId) : null
    };

    const oldWorkout = workouts.find(w => w.id === editingWorkout.id);
    if (oldWorkout) {
      let goalsCopy = [...goals];

      if (oldWorkout.goalId) {
        const oldGoal = goalsCopy.find(g => g.id === oldWorkout.goalId);
        if (oldGoal && !oldGoal.isDaily) {
            goalsCopy = goalsCopy.map(g => g.id === oldGoal.id ? { ...g, currentPage: Math.max(0, (g.currentPage || 0) - oldWorkout.amount) } : g);
        }
      }

      if (updatedWorkout.goalId) {
        const newGoal = goalsCopy.find(g => g.id === updatedWorkout.goalId);
        if (newGoal && !newGoal.isDaily) {
            goalsCopy = goalsCopy.map(g => g.id === newGoal.id ? { ...g, currentPage: Math.min(newGoal.target, (g.currentPage || 0) + amountVal) } : g);
        }
      }
      setGoals(goalsCopy);
    }

    setWorkouts(workouts.map(w => w.id === editingWorkout.id ? updatedWorkout : w));
    setEditingWorkout(null);
  };

  const handleWizardNext = () => {
    if (goalWizardStep === 1 && wizardData.categoryKey) {
      if (wizardData.categoryKey === 'book') {
         setWizardData({...wizardData, type: 'read_book'});
      }
      setGoalWizardStep(2);
    } 
    else if (goalWizardStep === 2) {
      let errs = {};
      if (!wizardData.title.trim()) errs.wizardTitle = true;
      if (!wizardData.target || parseFloat(wizardData.target) <= 0) errs.wizardTarget = true;
      if (!wizardData.type && wizardData.categoryKey !== 'book') errs.wizardType = true;

      if (Object.keys(errs).length > 0) {
        setFormErrors(prev => ({...prev, ...errs}));
        return;
      }
      
      let generatedTaskTitle = `Praca nad: ${wizardData.title.trim()}`;
      if (wizardData.categoryKey === 'book') generatedTaskTitle = `Czytanie: ${wizardData.title.trim()}`;
      if (wizardData.categoryKey === 'sport') generatedTaskTitle = `Trening: ${wizardData.title.trim()}`;
      
      setWizardData({...wizardData, taskTitle: generatedTaskTitle});
      setGoalWizardStep(3); 
    }
    else if (goalWizardStep === 4) {
      if (wizardData.createTask && !wizardData.taskTitle.trim()) {
         setFormErrors(prev => ({ ...prev, wizardTaskTitle: true }));
         return;
      }
      finalizeWizard(true);
    }
  };

  const finalizeWizard = (forceCreateTask = null) => {
    const targetVal = parseFloat(wizardData.target);
    const catConfig = GOAL_CATEGORIES_CONFIG[wizardData.categoryKey];
    
    const newGoal = {
      id: Date.now(),
      title: wizardData.title.trim(),
      category: catConfig.dbCat,
      type: wizardData.type,
      target: targetVal,
      currentPage: 0,
      dueDate: wizardData.isDaily ? null : wizardData.dueDate,
      isDaily: wizardData.isDaily,
      comment: ''
    };
    
    setGoals(prev => [...prev, newGoal]);

    const shouldCreateTask = forceCreateTask !== null ? forceCreateTask : wizardData.createTask;

    if (shouldCreateTask && wizardData.taskTitle) {
       let finalTaskTitle = wizardData.taskTitle.trim();
       if (wizardData.taskAmount) {
          finalTaskTitle += ` (${wizardData.taskAmount} ${getUnitForType(wizardData.type)})`;
       }
       
       const durationMin = parseInt(wizardData.taskDuration) || 0;
       let basePkt = wizardData.taskDifficulty === 'easy' ? 10 : wizardData.taskDifficulty === 'hard' ? 35 : 20;
       const finalPkt = durationMin > 0 ? Math.max(basePkt, Math.min(50, durationMin)) : basePkt;

       const newTask = {
         id: Date.now() + 1,
         title: finalTaskTitle,
         category: catConfig.dbCat,
         goalId: newGoal.id,
         pkt: finalPkt, 
         difficulty: wizardData.taskDifficulty || 'medium',
         repeat: wizardData.taskRepeat,
         intervalDays: wizardData.taskRepeat === 'interval' ? 2 : 1,
         customDates: [],
         dueDate: wizardData.dueDate,
         duration: durationMin,
         hasReminder: false,
         reminderTime: '08:00',
         createdAt: todayStr,
         isCompleted: false,
         completedDates: {},
         timeLeft: durationMin * 60,
         isRunning: false
       };
       setTasks(prev => [...prev, newTask]);
    }

    setGoalWizardStep(0); 
    setShowAddGoalModal(false); 
  };


  const addActivity = (e) => {
    e.preventDefault();
    const val = parseFloat(activityPages);
    if (!activityGoalId || isNaN(val) || val <= 0) {
      setFormErrors(prev => ({
         ...prev,
         activityGoalId: !activityGoalId,
         activityPages: isNaN(val) || val <= 0
      }));
      return;
    }

    const goal = goals.find(g => g.id.toString() === activityGoalId.toString());
    if (!goal) return;

    const newCurrent = Math.min(goal.target, (goal.currentPage || 0) + val);
      
    setGoals(goals.map(g => g.id === goal.id ? { ...g, currentPage: newCurrent } : g));

    let unitLabel = 'stron';
    if (goal.type === 'study') unitLabel = 'godz.';
    else if (goal.type === 'no_sweets') unitLabel = 'dni';
    else if (goal.type === 'read_chapters') unitLabel = 'rozdziałów';

    const newWorkout = {
      id: Date.now(),
      goalId: goal.id, 
      date: todayStr,
      type: goal.type,
      amount: val,
      unit: unitLabel,
      pkt: goal.type === 'study' ? Math.round(val * 10) : goal.type === 'no_sweets' ? Math.round(val * 20) : goal.type === 'read_chapters' ? Math.round(val * 5) : val
    };
    setWorkouts([newWorkout, ...workouts]);

    setActivityGoalId('');
    setActivityPages('');
    setShowAddActivityModal(false);
    setIsFabOpen(false);
  };

  const saveEditedGoal = (e) => {
    e.preventDefault();
    let errs = {};
    if (!editingGoal.title.trim()) errs.editingGoalTitle = true;
    if (!editingGoal.target || parseFloat(editingGoal.target) <= 0) errs.editingGoalTarget = true;
    if (Object.keys(errs).length > 0) {
       setFormErrors(prev => ({ ...prev, ...errs }));
       return;
    }
    setGoals(goals.map(g => g.id === editingGoal.id ? editingGoal : g));
    setEditingGoal(null);
  };

  const saveEditedTask = (e) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) {
       setFormErrors(prev => ({ ...prev, editingTaskTitle: true }));
       return;
    }
    let basePkt = editingTask.difficulty === 'easy' ? 10 : editingTask.difficulty === 'hard' ? 35 : 20;
    const durationMin = parseInt(editingTask.duration) || 0;
    const finalPkt = durationMin > 0 ? Math.max(basePkt, Math.min(50, durationMin)) : basePkt;

    setTasks(tasks.map(t => t.id === editingTask.id ? { ...editingTask, duration: durationMin, pkt: finalPkt } : t));
    setEditingTask(null);
  };

  const saveNote = (text) => setNotes({ ...notes, [selectedDate]: text });
  const confirmDeleteNote = () => {
    const updatedNotes = { ...notes };
    delete updatedNotes[selectedDate];
    setNotes(updatedNotes);
    setShowDeleteNoteConfirm(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  };

  const renderCustomCalendar = (isEditing, currentObj, setObj) => {
    try {
      const targetDate = taskPickerDate || new Date();
      const year = targetDate.getFullYear(); 
      const month = targetDate.getMonth();
      const firstDay = new Date(year, month, 1).getDay(); 
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const offset = firstDay === 0 ? 6 : firstDay - 1;
      const slots = Array(Math.max(0, offset)).fill(null);
      
      for (let d = 1; d <= daysInMonth; d++) {
        slots.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
      }

      return slots.map((dStr, idx) => {
        if (!dStr) return <div key={`empty-${idx}`} className="h-8" />;
        const dayNum = parseInt(dStr.split('-')[2], 10);
        
        const datesList = isEditing ? (currentObj?.customDates || []) : (newTaskCustomDates || []);
        const isSelected = datesList.includes(dStr);
        
        const toggleDate = () => {
           if (isEditing) {
              setObj({...currentObj, customDates: isSelected ? datesList.filter(d => d !== dStr) : [...datesList, dStr]});
           } else {
              setNewTaskCustomDates(isSelected ? datesList.filter(d => d !== dStr) : [...datesList, dStr]);
           }
        };

        return (
          <button 
            key={dStr} 
            type="button" 
            onClick={toggleDate} 
            className={`h-8 rounded-lg flex items-center justify-center text-xs transition-all ${isSelected ? 'bg-emerald-500 text-slate-950 font-bold shadow-md ring-2 ring-emerald-400' : 'bg-slate-500/10 hover:bg-slate-500/20 ' + tStyle.titleText}`}
          >
            {dayNum}
          </button>
        );
      });
    } catch(e) {
      return <div className="col-span-7 text-xs text-center p-2">Błąd kalendarza</div>;
    }
  };

  const calculateTotalPKTWithPenalties = () => {
    const allDatesSet = new Set();
    tasks.forEach(t => {
      if (t.createdAt) allDatesSet.add(t.createdAt);
      if (t.dueDate) allDatesSet.add(t.dueDate);
      if (t.completedDates) {
        Object.keys(t.completedDates).forEach(d => {
          if (t.completedDates[d]) allDatesSet.add(d);
        });
      }
      if (t.completedAt) allDatesSet.add(t.completedAt);
    });
    workouts.forEach(w => { if (w.date) allDatesSet.add(w.date); });
    allDatesSet.add(todayStr);

    const sortedDates = Array.from(allDatesSet).sort();
    if (sortedDates.length === 0) return 0;

    const startDate = parseLocalDate(sortedDates[0]);
    const endDate = parseLocalDate(todayStr);

    let rawPkt = 0;
    tasks.forEach(t => {
      if (t.repeat && t.repeat !== 'once' && t.completedDates) {
        Object.entries(t.completedDates).forEach(([dStr, isDone]) => {
          if (isDone) {
            let base = t.pkt || 20;
            const hasBonus = checkStreakBonus(t.id, dStr);
            rawPkt += base + (hasBonus ? 10 : 0);
          }
        });
      } else if (t.isCompleted) {
        rawPkt += (t.pkt || 20);
      }
    });

    workouts.forEach(w => { rawPkt += (w.pkt || 0); });

    goals.forEach(goal => {
      const isProgressType = goal.type === 'read_book' || goal.type === 'read_chapters' || goal.type === 'study' || goal.type === 'no_sweets';
      
      if (goal.isDaily) {
          const dailySums = {};
          workouts.forEach(w => {
             if (isProgressType && w.goalId === goal.id) {
                 dailySums[w.date] = (dailySums[w.date] || 0) + w.amount;
             } else if (!isProgressType && w.type === goal.type) {
                 dailySums[w.date] = (dailySums[w.date] || 0) + w.amount;
             }
          });
          Object.values(dailySums).forEach(sum => {
             if (goal.target && sum >= goal.target) rawPkt += 30;
          });
      } else {
          if (isProgressType) {
            if ((goal.currentPage || 0) >= goal.target) rawPkt += 30;
          } else {
            const currentSum = workouts.filter(w => w.type === goal.type).reduce((acc, w) => acc + w.amount, 0);
            if (goal.target && currentSum >= goal.target) rawPkt += 30;
          }
      }
    });

    let consecutiveZeroDays = 0;
    let totalPenalty = 0;
    let curr = new Date(startDate);

    while (curr <= endDate) {
      const dStr = formatDateStr(curr);
      const hasDoneTask = tasks.some(t => {
        if (t.repeat && t.repeat !== 'once') return Boolean(t.completedDates && t.completedDates[dStr]);
        return t.isCompleted && (t.completedAt === dStr || t.dueDate === dStr);
      });
      const hasWorkout = workouts.some(w => w.date === dStr);
        
      if (hasDoneTask || hasWorkout) {
        consecutiveZeroDays = 0;
      } else {
        consecutiveZeroDays++;
        if (consecutiveZeroDays > 1) {
          totalPenalty += 10 * Math.pow(2, consecutiveZeroDays - 2);
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
    return Math.max(0, rawPkt - totalPenalty);
  };

  const totalPKT = calculateTotalPKTWithPenalties();
  const levelInfo = getLevelInfo(totalPKT);

  useEffect(() => {
    let totalTaskCompletions = 0;
    tasks.forEach(t => {
      if(t.repeat && t.repeat !== 'once') {
        totalTaskCompletions += Object.values(t.completedDates || {}).filter(Boolean).length;
      } else if (t.isCompleted) {
        totalTaskCompletions++;
      }
    });
    
    const totalWorkoutsCount = workouts.length;
    const currentLevel = levelInfo.level;

    const newlyEarned = [];
    const updatedTrophies = { ...earnedTrophies };

    const checkAndAward = (id, condition) => {
      if (!updatedTrophies[id] && condition) {
        updatedTrophies[id] = todayStr;
        newlyEarned.push(id);
      }
    };

    checkAndAward('bronze_task', totalTaskCompletions >= 1);
    checkAndAward('bronze_workout', totalWorkoutsCount >= 1);
    checkAndAward('bronze_level5', currentLevel >= 5);
    checkAndAward('bronze_tasks10', totalTaskCompletions >= 10);
    checkAndAward('bronze_workouts10', totalWorkoutsCount >= 10);
    
    checkAndAward('silver_level10', currentLevel >= 10);
    checkAndAward('silver_level20', currentLevel >= 20);
    checkAndAward('silver_tasks50', totalTaskCompletions >= 50);
    checkAndAward('silver_tasks100', totalTaskCompletions >= 100);
    checkAndAward('silver_workouts100', totalWorkoutsCount >= 100);
    
    checkAndAward('gold_level30', currentLevel >= 30);
    checkAndAward('gold_level40', currentLevel >= 40);
    checkAndAward('gold_workouts50', totalWorkoutsCount >= 50);
    checkAndAward('gold_tasks500', totalTaskCompletions >= 500);
    checkAndAward('gold_workouts500', totalWorkoutsCount >= 500);

    checkAndAward('platinum_level50', currentLevel >= 50);

    const earnedCount = Object.keys(updatedTrophies).filter(k => k !== 'platinum_master').length;
    checkAndAward('platinum_master', earnedCount >= 16);

    if (newlyEarned.length > 0) {
      setEarnedTrophies(updatedTrophies);
      localStorage.setItem('discipline_trophies', JSON.stringify(updatedTrophies));
      const latestTrophy = TROPHIES.find(t => t.id === newlyEarned[newlyEarned.length - 1]);
      setNewTrophyModal(latestTrophy);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, workouts, levelInfo.level, todayStr]);

  const handleShareTrophy = async (trophy) => {
    const rankName = trophy.rank === 'platinum' ? 'Platynowe' : trophy.rank === 'gold' ? 'Złote' : trophy.rank === 'silver' ? 'Srebrne' : 'Brązowe';
    const textToShare = `Właśnie odblokowałem ${rankName} trofeum: "${trophy.title}" w mojej drodze po samodyscyplinę! 🏆🔥`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Kolejne trofeum odblokowane!',
                text: textToShare,
            });
        } catch (err) {
            console.log('Share canceled');
        }
    } else {
        navigator.clipboard.writeText(textToShare);
        alert('Tekst skopiowany do schowka! Możesz go teraz wkleić w dowolnym miejscu.');
    }
  };

  useEffect(() => {
    const currentLevel = levelInfo.level;
    if (currentLevel > lastCheckedLevel) {
      const oldRankObj = RANKS.slice().reverse().find(r => lastCheckedLevel >= r.minLevel);
      const newRankObj = RANKS.slice().reverse().find(r => currentLevel >= r.minLevel);
      const isRankUp = oldRankObj && newRankObj && oldRankObj.name !== newRankObj.name;
      const msgs = isRankUp 
        ? [`Nowa ranga odblokowana, ${userName}: ${newRankObj.name}! To już nie jest zwykła dyscyplina, to Twój nowy charakter.`]
        : [`Poziom ${currentLevel} zdobyty, ${userName}! Twoja konsekwencja zaczyna przynosić realne owoce.`];
        
      setLevelUpModalData({ show: true, level: currentLevel, isRankUp, message: msgs[0], rankName: newRankObj?.name });
      setLastCheckedLevel(currentLevel);
      localStorage.setItem('discipline_last_checked_level', currentLevel.toString());
    } else if (currentLevel < lastCheckedLevel) {
      setLastCheckedLevel(currentLevel);
      localStorage.setItem('discipline_last_checked_level', currentLevel.toString());
    }
  }, [totalPKT, userName, userGender, lastCheckedLevel, levelInfo.level]);

  const tomorrowDate = parseLocalDate(todayStr);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = formatDateStr(tomorrowDate);

  const dayAfterDate = parseLocalDate(todayStr);
  dayAfterDate.setDate(dayAfterDate.getDate() + 2);
  const dayAfterStr = formatDateStr(dayAfterDate);

  const allTodayTasksRaw = tasks.filter(t => {
    if (t.repeat && t.repeat !== 'once') {
      return taskAppliesToDate(t, todayStr);
    }
    return t.dueDate === todayStr || (t.dueDate < todayStr && !t.isCompleted);
  });

  const allTodayTasks = allTodayTasksRaw.map(t => {
    const exists = categories.some(c => c.id === t.category);
    return exists ? t : { ...t, category: 'Ogólne' };
  });

  const upcomingTasks = tasks.filter(t => {
    if (t.repeat === 'daily') return false; 
    
    // ZMIANA 2: Nie pokazujemy zadań, które są już widoczne na liście "Dzisiaj"
    if (allTodayTasksRaw.some(todayTask => todayTask.id === t.id)) return false;
    
    const appliesTomorrow = taskAppliesToDate(t, tomorrowStr) && !isTaskDoneForDate(t, tomorrowStr);
    const appliesDayAfter = taskAppliesToDate(t, dayAfterStr) && !isTaskDoneForDate(t, dayAfterStr);
    
    return appliesTomorrow || appliesDayAfter;
  });
  
  const completedTodayCount = allTodayTasks.filter(t => isTaskDoneForDate(t, todayStr)).length;
  const progressPercent = allTodayTasks.length > 0 ? Math.round((completedTodayCount / allTodayTasks.length) * 100) : 0;

  const earnedPKTToday = allTodayTasks.reduce((acc, t) => {
    if (!isTaskDoneForDate(t, todayStr)) return acc;
    const hasBonus = checkStreakBonus(t.id, todayStr);
    return acc + (t.pkt || 20) + (hasBonus ? 10 : 0);
  }, 0) + workouts.filter(w => w.date === todayStr).reduce((acc, w) => acc + (w.pkt || 0), 0);

  const prevMonth = () => setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const getCategoryStatsForMonth = () => {
    const stats = {};
    const year = selectedMonthDate.getFullYear();
    const month = selectedMonthDate.getMonth();
      
    tasks.forEach(t => {
      const cat = t.category || 'Ogólne';
      if (t.repeat && t.repeat !== 'once' && t.completedDates) {
        Object.entries(t.completedDates).forEach(([dateStr, isDone]) => {
          if (isDone) {
            const d = parseLocalDate(dateStr);
            if (d.getFullYear() === year && d.getMonth() === month) {
              stats[cat] = (stats[cat] || 0) + 1;
            }
          }
        });
      } else if (t.isCompleted && t.completedAt) {
        const d = parseLocalDate(t.completedAt);
        if (d.getFullYear() === year && d.getMonth() === month) {
          stats[cat] = (stats[cat] || 0) + 1;
        }
      }
    });

    const totalDone = Object.values(stats).reduce((a, b) => a + b, 0);
    return { stats, totalDone };
  };

  const { stats: monthCategoryStats, totalDone: monthTotalDoneTasks } = getCategoryStatsForMonth();

  const [quoteModal, setQuoteModal] = useState(() => {
    const lastSeenDate = localStorage.getItem('discipline_quote_date');
    if (lastSeenDate !== getAppDayString()) {
      return { show: true, data: QUOTES[Math.floor(Math.random() * QUOTES.length)] };
    }
    return { show: false, data: null };
  });

  const closeQuoteModal = () => {
    localStorage.setItem('discipline_quote_date', todayStr);
    setQuoteModal({ ...quoteModal, show: false });
  };

  const getThemeStyles = () => {
    if (theme === 'light') {
      return {
        cardBg: 'bg-white border-slate-200/80 text-black shadow-sm',
        subText: 'text-slate-700',
        titleText: 'text-black',
        inputBg: 'bg-slate-50 border-slate-300 text-black placeholder-slate-500',
        navBg: 'bg-white/95 border-slate-200',
        modalBg: 'bg-white border-slate-200 text-black',
        modalBtnBg: 'bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 font-semibold',
        chartLine: '#10b981',
        chartGrid: '#e2e8f0',
        optUnselected: 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200',
        optSelected: 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500',
        optSelectedWarning: 'bg-amber-100 border-amber-500 text-amber-950 font-bold ring-1 ring-amber-500',
        optSelectedDanger: 'bg-purple-100 border-purple-500 text-purple-950 font-bold ring-1 ring-purple-500',
        optSelectedInfo: 'bg-sky-100 border-sky-500 text-sky-950 font-bold ring-1 ring-sky-500'
      };
    }
    if (theme === 'gold') {
      return {
        cardBg: 'bg-zinc-900/90 border-amber-500/20 text-zinc-100 shadow-xl',
        subText: 'text-zinc-400',
        titleText: 'text-zinc-100',
        inputBg: 'bg-zinc-950 border-amber-500/30 text-zinc-100 placeholder-zinc-500',
        navBg: 'bg-zinc-950/95 border-amber-500/20',
        modalBg: 'bg-zinc-900 border-amber-500/30 text-zinc-100',
        modalBtnBg: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-semibold',
        chartLine: '#f59e0b',
        chartGrid: '#27272a',
        optUnselected: 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800',
        optSelected: 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold ring-1 ring-amber-500',
        optSelectedWarning: 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold ring-1 ring-amber-500',
        optSelectedDanger: 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold ring-1 ring-amber-500',
        optSelectedInfo: 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold ring-1 ring-amber-500'
      };
    }
    return {
      cardBg: 'bg-slate-800/80 border-slate-700/60 text-slate-100 shadow-lg',
      subText: 'text-slate-400',
      titleText: 'text-white',
      inputBg: 'bg-slate-900 border-slate-700 text-white placeholder-slate-500',
      navBg: 'bg-slate-950/90 border-slate-800',
      modalBg: 'bg-slate-900 border-slate-800 text-slate-100',
      modalBtnBg: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold',
      chartLine: '#10b981',
      chartGrid: '#334155',
      optUnselected: 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700',
      optSelected: 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold ring-1 ring-emerald-500',
      optSelectedWarning: 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold ring-1 ring-amber-500',
      optSelectedDanger: 'bg-purple-500/20 border-purple-500 text-purple-400 font-bold ring-1 ring-purple-500',
      optSelectedInfo: 'bg-sky-500/20 border-sky-500 text-sky-400 font-bold ring-1 ring-sky-500'
    };
  };

  const tStyle = getThemeStyles();
  const currentFontConfig = FONT_SIZE_OPTIONS.find(f => f.level === fontSizeLevel) || FONT_SIZE_OPTIONS[2];

  const renderMonthTimeline = () => {
    const year = selectedMonthDate.getFullYear();
    const month = selectedMonthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysData = [];
    let monthTotalPKT = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        
      let dayTasksPKT = 0;
      tasks.forEach(t => {
        if (t.repeat && t.repeat !== 'once' && t.completedDates && t.completedDates[dateStr]) {
          dayTasksPKT += (t.pkt || 20) + (checkStreakBonus(t.id, dateStr) ? 10 : 0);
        } else if (t.isCompleted && t.completedAt === dateStr) {
          dayTasksPKT += (t.pkt || 20);
        }
      });
      const dayWorkoutsPKT = workouts.filter(w => w.date === dateStr).reduce((acc, w) => acc + (w.pkt || 0), 0);
        
      const dayPKT = dayTasksPKT + dayWorkoutsPKT;
      monthTotalPKT += dayPKT;
      daysData.push({ dateStr, dayLabel: String(day), pkt: dayPKT });
    }

    const maxPKTInWindow = Math.max(...daysData.map(d => d.pkt), 80);
    const itemWidth = 42;
    const chartHeight = 110;
    const totalWidth = daysData.length * itemWidth;
    const points = daysData.map((d, idx) => {
      const x = idx * itemWidth + itemWidth / 2;
      const y = chartHeight - Math.round((d.pkt / maxPKTInWindow) * (chartHeight - 20)) - 10;
      return x + ',' + y;
    });

    const pathData = 'M ' + points.join(' L ');
    const monthLabelName = selectedMonthDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' });

    return (
      <div className={'p-5 md:p-7 rounded-3xl border mb-6 ' + tStyle.cardBg}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className={'font-bold capitalize ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>Wykres: {monthLabelName}</h3>
            <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>Suma w miesiącu: <span className="text-amber-500 font-bold">{monthTotalPKT} PKT</span></p>
          </div>
          <div className="flex items-center gap-1 bg-slate-500/10 p-1 rounded-xl border border-slate-500/20">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-500/25 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-500/25 transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
        <div ref={chartScrollRef} className="overflow-x-auto pb-2 pt-2 scrollbar-thin">
          <div className="relative" style={{ width: totalWidth + 'px', height: (chartHeight + 35) + 'px' }}>
            <svg className="absolute top-0 left-0 w-full" height={chartHeight} style={{ overflow: 'visible' }}>
              <line x1="0" y1={chartHeight} x2={totalWidth} y2={chartHeight} stroke={tStyle.chartGrid} strokeDasharray="3 3" />
              <path d={pathData + ' L ' + (totalWidth - itemWidth / 2) + ',' + chartHeight + ' L ' + (itemWidth / 2) + ',' + chartHeight + ' Z'} fill="url(#gradient)" opacity="0.25" />
              <path d={pathData} fill="none" stroke={tStyle.chartLine} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={tStyle.chartLine} /><stop offset="100%" stopColor={tStyle.chartLine} stopOpacity="0" /></linearGradient></defs>
            </svg>
            {daysData.map((item, idx) => {
              const x = idx * itemWidth + itemWidth / 2;
              const y = chartHeight - Math.round((item.pkt / maxPKTInWindow) * (chartHeight - 20)) - 10;
              const isToday = item.dateStr === todayStr;
              return (
                <div key={item.dateStr}>
                  <div className={'absolute rounded-full border-2 transition-transform hover:scale-125 z-20 ' + (isToday ? 'w-4 h-4 bg-emerald-500 border-white ring-2 ring-emerald-500' : 'w-3 h-3 bg-amber-500 border-zinc-900 shadow-md')} style={{ left: (x - (isToday ? 8 : 6)) + 'px', top: (y - (isToday ? 8 : 6)) + 'px' }} />
                  {item.pkt > 0 && <span className="absolute text-[9px] font-mono font-bold text-amber-500 z-10 -translate-x-1/2" style={{ left: x + 'px', top: (y - 18) + 'px' }}>{item.pkt}</span>}
                  <span className={'absolute ' + currentFontConfig.smallClass + ' font-medium -translate-x-1/2 whitespace-nowrap ' + (isToday ? 'text-emerald-500 font-bold' : tStyle.subText)} style={{ left: x + 'px', top: (chartHeight + 10) + 'px' }}>{item.dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'));
    }

    return (
      <div className={'p-5 rounded-2xl border ' + tStyle.cardBg}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={'font-bold capitalize ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>
            {calendarViewDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center gap-1 bg-slate-500/10 p-1 rounded-xl border border-slate-500/20">
            <button onClick={() => setCalendarViewDate(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-slate-500/25 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setCalendarViewDate(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-slate-500/25 transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
        <div className={'grid grid-cols-7 gap-1 text-center ' + currentFontConfig.smallClass + ' font-semibold mb-2 ' + tStyle.subText}>
          <span>Pn</span><span>Wt</span><span>Śr</span><span>Cz</span><span>Pt</span><span>Sob</span><span>Ndz</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((dateStr, idx) => {
            if (!dateStr) return <div key={'empty-' + idx} className="h-10 md:h-12" />;
            const isSelected = selectedDate === dateStr;
            const dayNum = parseInt(dateStr.split('-')[2]);
            let dayColorClass = '';
            
            if (dateStr < todayStr) {
              const dayTasks = tasks.filter(t => {
                if (t.repeat && t.repeat !== 'once') return taskAppliesToDate(t, dateStr);
                if (t.dueDate === dateStr) return true;
                if (t.completedAt === dateStr) return true;
                if (!t.isCompleted && t.dueDate < dateStr && dateStr <= todayStr) return true;
                return false;
              });
              const totalTasks = dayTasks.length;
              const doneTasks = dayTasks.filter(t => {
                if (t.repeat && t.repeat !== 'once') return Boolean(t.completedDates && t.completedDates[dateStr]);
                return t.isCompleted && (t.completedAt === dateStr || t.dueDate === dateStr || t.dueDate < dateStr);
              }).length;

              if (totalTasks === 0) {
                dayColorClass = 'bg-slate-500/15 text-slate-500 border border-slate-500/20 opacity-70';
              } else if (doneTasks === totalTasks) {
                dayColorClass = 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40';
              } else if (doneTasks > 0) {
                dayColorClass = 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40';
              } else {
                dayColorClass = 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40';
              }
            } else if (dateStr === todayStr) {
              const dayTasks = tasks.filter(t => {
                if (t.repeat && t.repeat !== 'once') return taskAppliesToDate(t, dateStr);
                if (t.dueDate === dateStr) return true;
                if (t.completedAt === dateStr) return true;
                if (!t.isCompleted && t.dueDate < dateStr) return true;
                return false;
              });
              const totalTasks = dayTasks.length;
              const doneTasks = dayTasks.filter(t => {
                if (t.repeat && t.repeat !== 'once') return Boolean(t.completedDates && t.completedDates[dateStr]);
                return t.isCompleted;
              }).length;

              if (totalTasks === 0) {
                dayColorClass = 'bg-slate-500/20 text-slate-600 dark:text-slate-300 border-2 border-slate-500/50 font-bold';
              } else if (doneTasks === totalTasks) {
                dayColorClass = 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500/50 font-bold';
              } else if (doneTasks > 0) {
                dayColorClass = 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-2 border-amber-500/50 font-bold';
              } else {
                dayColorClass = 'bg-red-500/20 text-red-600 dark:text-red-400 border-2 border-red-500/50 font-bold';
              }
            } else {
              dayColorClass = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20';
            }

            const hasNote = Boolean(notes[dateStr]);
            return (
              <button key={dateStr} onClick={() => setSelectedDate(dateStr)} className={'h-10 md:h-12 rounded-xl flex items-center justify-center ' + currentFontConfig.sizeClass + ' transition-all relative ' + dayColorClass + ' ' + (isSelected ? 'ring-2 ring-emerald-400 scale-105 z-10' : '')}>
                {dayNum}{hasNote && <span className="w-2 h-2 rounded-full bg-amber-500 absolute bottom-1.5" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const selectedDayTasks = tasks.filter(t => {
    if (!t.repeat || t.repeat === 'once') {
      return t.dueDate === selectedDate || t.completedAt === selectedDate;
    }
    return taskAppliesToDate(t, selectedDate) || t.completedAt === selectedDate;
  });
  const selectedDayWorkouts = workouts.filter(w => w.date === selectedDate);

  const isPastDay = selectedDate < todayStr;
  const isFutureDay = selectedDate > todayStr;
  const currentNote = notes[selectedDate] || '';
  const monthNameDisplay = selectedMonthDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' });

  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [currentNote, selectedDate]);

  const archivedTasks = tasks.filter(t => {
    if (t.repeat && t.repeat !== 'once') {
      return t.completedDates && Object.values(t.completedDates).some(v => v);
    }
    return t.isCompleted;
  });

  const archivedGoals = goals.filter(goal => {
    if (goal.isDaily) return false;
    const isProgressType = goal.type === 'read_book' || goal.type === 'read_chapters' || goal.type === 'study' || goal.type === 'no_sweets';
    const currentVal = isProgressType ? (goal.currentPage || 0) : workouts.filter(w => w.type === goal.type).reduce((acc, w) => acc + w.amount, 0);
    const percent = Math.min(100, Math.round((currentVal / goal.target) * 100));
    return percent >= 100;
  });

  const futureTasks = tasks.filter(t => {
    if (t.isCompleted && (!t.repeat || t.repeat === 'once')) return false;
    const isTodayOrOverdue = t.repeat && t.repeat !== 'once' 
       ? taskAppliesToDate(t, todayStr) 
       : (t.dueDate === todayStr || t.dueDate < todayStr);
    return !isTodayOrOverdue;
  }).sort((a, b) => new Date(a.dueDate || '2099-01-01') - new Date(b.dueDate || '2099-01-01'));

  const activeBlockOrder = [...blockOrder];
  categories.forEach(c => {
    if (!activeBlockOrder.includes(c.id)) activeBlockOrder.push(c.id);
  });

  return (
    <div className={'min-h-screen pb-32 px-4 md:px-8 pt-6 md:pt-10 max-w-md md:max-w-3xl lg:max-w-5xl mx-auto select-none transition-colors duration-300 ' + currentFontConfig.sizeClass}>
        
      {activeTab === 'today' && (
        <>
          <header className="flex justify-between items-center mb-6 md:mb-8">
            <div>
              <h1 className={currentFontConfig.headerClass + ' font-bold tracking-tight ' + tStyle.titleText}>Cześć, {userName}! 👋</h1>
              <p className={currentFontConfig.smallClass + ' md:text-base ' + tStyle.subText}>Dyscyplina buduje wolność</p>
            </div>
            <button onClick={() => setShowAllQuotesModal(true)} className={'p-3 md:p-3.5 rounded-full border text-amber-500 active:scale-95 transition-all shadow-md ' + tStyle.cardBg} title="Cytaty"><Quote className="w-5 h-5 md:w-6 md:h-6" /></button>
          </header>

          <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className={'p-5 md:p-6 rounded-3xl border flex flex-col justify-between shadow-sm ' + tStyle.cardBg}>
              <div className={'flex items-center justify-between mb-2 ' + tStyle.subText}>
                <span className={currentFontConfig.smallClass + ' md:text-sm font-medium'}>Postęp dzisiejszy</span>
                <Zap className="w-5 h-5 text-emerald-500" />
              </div>
              <div className={currentFontConfig.headerClass + ' font-bold mb-3 ' + tStyle.titleText}>{progressPercent}%</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-500 ease-out" style={{ width: progressPercent + '%' }} />
              </div>
            </div>
            <div className={'p-5 md:p-6 rounded-3xl border flex flex-col justify-between shadow-sm ' + tStyle.cardBg}>
              <div className={'flex items-center justify-between mb-2 ' + tStyle.subText}>
                <span className={currentFontConfig.smallClass + ' md:text-sm font-medium'}>Dzisiejsze PKT</span>
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div className={currentFontConfig.headerClass + ' font-bold text-amber-500 mb-1'}>+{earnedPKTToday} PKT</div>
              <span className={currentFontConfig.smallClass + ' md:text-sm ' + tStyle.subText}>Poziom {levelInfo.level} ({levelInfo.name})</span>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* WSPÓLNA SEKCJA ZADAŃ NA DZISIAJ */}
            <div className={'p-4 md:p-5 rounded-3xl border shadow-sm transition-all bg-slate-500/10 dark:bg-slate-500/10 border-slate-500/20'}>
              <div className="flex justify-between items-center select-none pb-2">
                <div className="flex items-center gap-2 flex-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  {/* ZMIANA 1: Zwiększenie widoczności napisu "Zadania na dzisiaj" w jasnym motywie */}
                  <h2 className={currentFontConfig.smallClass + ' md:text-sm font-semibold uppercase tracking-wider ' + tStyle.titleText}>
                    Zadania na dzisiaj
                  </h2>
                  <span className={currentFontConfig.smallClass + ' ml-1 ' + tStyle.subText}>
                    ({completedTodayCount}/{allTodayTasks.length})
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-500/25 space-y-3 animate-fadeIn">
                {allTodayTasks.length === 0 ? (
                    <p className={'text-center py-3 opacity-60 ' + currentFontConfig.smallClass + ' ' + tStyle.subText}>Brak zadań na dziś.</p>
                ) : (
                   <div className="space-y-3">
                     {allTodayTasks.map((task) => {
                       const isDone = isTaskDoneForDate(task, todayStr);
                       const dailyStreak = task.repeat === 'daily' ? getTaskStreak(task.id) : 0;
                       const associatedGoal = goals.find(g => g.id === task.goalId);
                       
                       const cTheme = getCategoryTheme(task.category);

                       return (
                         <div key={task.id} onClick={() => {
                             setConfirmCompleteModal({ type: 'task', id: task.id, name: task.title, isDone, goalId: task.goalId, targetDate: todayStr });
                             setCompleteTaskValue('');
                         }} className={'flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer shadow-sm ' + (isDone ? `${cTheme.itemDoneBg} ${cTheme.itemBorder} opacity-75` : `${cTheme.itemBg} ${cTheme.itemBorder}`)}>
                            <div className="flex items-center gap-3">
                              {isDone ? <CheckCircle2 className={`w-6 h-6 shrink-0 ${cTheme.iconText}`} /> : <Circle className="w-6 h-6 text-slate-400 shrink-0" />}
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className={'font-medium block ' + tStyle.titleText + (isDone ? ' line-through opacity-75' : '')}>{task.title}</span>
                                  
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cTheme.bg} ${cTheme.text} ${cTheme.border}`}>
                                    {task.category}
                                  </span>

                                  {associatedGoal && (
                                    <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Target className="w-3 h-3" /> {associatedGoal.title}
                                    </span>
                                  )}
                                  {task.hasReminder && (
                                    <span className="bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Bell className="w-3 h-3" /> {task.reminderTime}
                                    </span>
                                  )}
                                  {dailyStreak > 0 && (
                                    <span className="bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Flame className="w-3 h-3 fill-orange-500" /> {dailyStreak} dni z rzędu
                                    </span>
                                  )}
                                </div>
                                <span className={currentFontConfig.smallClass + ' ' + tStyle.subText}>
                                  {!task.repeat || task.repeat === 'once' ? 'Jednorazowe' : task.repeat === 'daily' ? 'Codziennie' : task.repeat === 'interval' ? 'Co ' + task.intervalDays + ' dni' : 'Niestandardowe dni'} 
                                  {task.duration > 0 ? ' • ' + task.duration + ' min' : ''} • +{task.pkt || 20} PKT
                                </span>
                              </div>
                            </div>

                            {/* ZMIANA 3: 3 kropki (Menu dropdown) dla Edycji i Kosza */}
                            <div className="flex items-center gap-1.5 ml-2" onClick={e => e.stopPropagation()}>
                              {task.duration > 0 && !isDone && (
                                <button onClick={(e) => toggleTimer(task.id, e)} className={'px-3 py-1.5 rounded-xl ' + currentFontConfig.smallClass + ' font-mono font-semibold flex items-center gap-1.5 transition-colors border shadow-sm ' + (task.isRunning ? 'bg-amber-500 text-slate-950 border-amber-600 animate-pulse' : tStyle.modalBtnBg)}>
                                  {task.isRunning ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5" />}
                                  <span>{formatTime(task.timeLeft)}</span>
                                </button>
                              )}
                              
                              <div className="relative">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuTaskId(openMenuTaskId === task.id ? null : task.id);
                                  }}
                                  className={'p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 hover:text-amber-500 transition-colors ' + tStyle.subText}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {openMenuTaskId === task.id && (
                                  <div className={"absolute right-0 mt-2 w-36 rounded-xl shadow-lg border z-50 flex flex-col overflow-hidden " + tStyle.cardBg}>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuTaskId(null);
                                        setEditingTask({ ...task });
                                      }}
                                      className={"flex items-center gap-2 px-3 py-2.5 hover:bg-slate-500/10 transition-colors " + tStyle.subText + " hover:text-amber-500 text-sm font-medium"}
                                    >
                                      <Edit3 className="w-4 h-4" /> Edytuj
                                    </button>
                                    <div className="h-px bg-slate-500/20 w-full" />
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuTaskId(null);
                                        setConfirmDeleteModal({ type: 'task', id: task.id, name: task.title });
                                      }}
                                      className={"flex items-center gap-2 px-3 py-2.5 hover:bg-red-500/10 transition-colors " + tStyle.subText + " hover:text-red-500 text-sm font-medium"}
                                    >
                                      <Trash2 className="w-4 h-4" /> Usuń
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                         </div>
                       );
                     })}
                   </div>
                )}
              </div>
            </div>

            {workouts.filter(w => w.date === todayStr).length > 0 && (
              <div className={'p-4 md:p-5 rounded-3xl border shadow-sm transition-all bg-slate-500/10 dark:bg-slate-500/10 border-slate-500/20'}>
                <div className="flex justify-between items-center select-none pb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Activity className="w-5 h-5 text-amber-500" />
                    <h2 className={currentFontConfig.smallClass + ' md:text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400'}>
                      Zarejestrowane Aktywności
                    </h2>
                    <span className={currentFontConfig.smallClass + ' ml-1 ' + tStyle.subText}>
                      ({workouts.filter(w => w.date === todayStr).length})
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-500/25 space-y-3 animate-fadeIn">
                  <div className="space-y-3">
                    {workouts.filter(w => w.date === todayStr).map((w) => {
                      let typeName = w.type === 'run' ? 'Bieg' : w.type === 'pushups' ? 'Pompki' : w.type === 'pullups' ? 'Drążek' : w.type === 'squats' ? 'Przysiady' : w.type === 'situps' ? 'Brzuszki' : w.type === 'bike' ? 'Rower' : w.type === 'gym' ? 'Siłownia' : w.type === 'walk_km' ? 'Spacer' : w.type === 'steps' ? 'Kroki' : w.type === 'study' ? 'Nauka' : w.type === 'read_book' ? 'Książka' : w.type === 'read_chapters' ? 'Książka (rozdziały)' : w.type === 'no_sweets' ? 'Dni bez słodyczy' : 'Spacer (czas)';
                      const workoutName = `${typeName}: ${w.amount} ${w.unit}`;
                      return (
                        <div key={w.id} className={'flex items-center justify-between p-3.5 rounded-2xl border bg-slate-500/5 border-slate-500/20 shadow-sm'}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/25 border border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                              {w.type === 'run' || w.type === 'walk_km' ? <Footprints className="w-4 h-4" /> : w.type === 'pushups' || w.type === 'pullups' || w.type === 'squats' || w.type === 'situps' ? <Dumbbell className="w-4 h-4" /> : w.type === 'read_book' || w.type === 'read_chapters' || w.type === 'study' ? <BookOpen className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                            </div>
                            <div>
                              <span className={'font-bold block ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{workoutName}</span>
                              <span className={currentFontConfig.smallClass + ' text-amber-600 dark:text-amber-400 font-bold'}>+{w.pkt} PKT</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 ml-2">
                            <button onClick={() => { setFormErrors({}); setEditingWorkout({ ...w, goalId: w.goalId || '' }); }} className={'p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 hover:text-amber-500 transition-colors ' + tStyle.subText}><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => setConfirmDeleteModal({ type: 'workout', id: w.id, name: workoutName })} className={'p-2 rounded-xl bg-slate-500/10 hover:bg-red-500/10 hover:text-red-500 transition-colors ' + tStyle.subText}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {upcomingTasks.length > 0 && (
              <div className={'p-4 md:p-5 rounded-3xl border shadow-sm transition-all bg-violet-500/10 dark:bg-violet-500/10 border-violet-500/20 mt-6'}>
                <div className="flex justify-between items-center select-none pb-2 cursor-pointer" onClick={() => setUpcomingTasksCollapsed(!upcomingTasksCollapsed)}>
                  <div className="flex items-center gap-2 flex-1">
                    <CalendarIcon className="w-5 h-5 text-violet-500" />
                    <h2 className={currentFontConfig.smallClass + ' md:text-sm font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400'}>
                      Zadania zaplanowane do 2 dni
                    </h2>
                    <span className={currentFontConfig.smallClass + ' ml-1 ' + tStyle.subText}>
                      ({upcomingTasks.length})
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 shrink-0 ${tStyle.subText} ${upcomingTasksCollapsed ? '-rotate-90' : ''}`} />
                </div>
                
                {!upcomingTasksCollapsed && (
                  <div className="mt-4 pt-3 border-t border-violet-500/25 space-y-3 animate-fadeIn">
                    <div className="space-y-3">
                      {upcomingTasks.map(task => {
                        const isTomorrow = taskAppliesToDate(task, tomorrowStr) && !isTaskDoneForDate(task, tomorrowStr);
                        const targetD = isTomorrow ? tomorrowStr : dayAfterStr;
                        const dayLabel = isTomorrow ? 'Jutro' : 'Pojutrze';
                        const associatedGoal = goals.find(g => g.id === task.goalId);

                        return (
                          <div key={task.id} onClick={() => {
                              setConfirmCompleteModal({ type: 'task', id: task.id, name: task.title, isDone: false, goalId: task.goalId, targetDate: targetD });
                              setCompleteTaskValue('');
                          }} className={'flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer shadow-sm bg-violet-500/5 border-violet-500/20'}>
                            <div className="flex items-center gap-3">
                              <Circle className="w-6 h-6 text-violet-400 shrink-0 hover:text-violet-500 transition-colors" />
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className={'font-medium block ' + tStyle.titleText}>{task.title}</span>
                                  <span className="bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {dayLabel}
                                  </span>
                                  {associatedGoal && (
                                    <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Target className="w-3 h-3" /> {associatedGoal.title}
                                    </span>
                                  )}
                                </div>
                                <span className={currentFontConfig.smallClass + ' ' + tStyle.subText}>
                                  Kategoria: {task.category} • +{task.pkt || 20} PKT
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 ml-2" onClick={e => e.stopPropagation()}>
                              <button onClick={() => { setFormErrors({}); setEditingTask({ ...task }); }} className={'p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 hover:text-amber-500 transition-colors ' + tStyle.subText}><Edit3 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          <div className="fixed bottom-24 right-6 md:right-12 flex flex-col items-end gap-3 z-40">
            {isFabOpen && (
              <div className="flex flex-col items-end gap-2.5 animate-fadeIn mb-2">
                {categories.map((cat) => (
                  <button 
                    key={cat.id} 
                    onClick={() => { setNewTaskCategory(cat.id); setFormErrors({}); setShowAddTaskModal(true); setIsFabOpen(false); }} 
                    className={'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-5 py-3 rounded-2xl shadow-xl font-bold border border-slate-300 dark:border-slate-600 ' + currentFontConfig.smallClass + ' flex items-center gap-2.5 transition-transform active:scale-95'}
                  >
                    <Plus className="w-4 h-4 text-emerald-500" /> Zadanie: {cat.label}
                  </button>
                ))}
                <button 
                  onClick={() => { setFormErrors({}); setShowAddWorkoutModal(true); setIsFabOpen(false); }} 
                  className={'bg-amber-500 text-slate-950 px-5 py-3 rounded-2xl shadow-xl font-bold ' + currentFontConfig.smallClass + ' flex items-center gap-2.5 transition-transform active:scale-95 mt-2'}
                >
                  <Activity className="w-4 h-4" /> Zarejestruj aktywność
                </button>
              </div>
            )}
            <button onClick={() => setIsFabOpen(!isFabOpen)} className={'bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-4.5 rounded-full shadow-lg shadow-emerald-500/30 font-bold transition-transform duration-300 active:scale-95 flex items-center justify-center ' + (isFabOpen ? 'rotate-45 bg-amber-500' : '')}>
              <Plus className="w-7 h-7 stroke-[3]" />
            </button>
          </div>
        </>
      )}

      {activeTab === 'goals' && (
        <>
          <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
            <div>
              <h1 className={currentFontConfig.headerClass + ' font-bold tracking-tight ' + tStyle.titleText}>Cele i Zadania</h1>
              <p className={currentFontConfig.smallClass + ' md:text-base ' + tStyle.subText}>Globalne centrum zarządzania celami oraz zadaniami</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={openGoalWizard} className={'bg-amber-500 hover:bg-amber-400 transition-colors text-slate-950 font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg ' + currentFontConfig.smallClass}><Target className="w-4 h-4" /> + Cel</button>
            </div>
          </header>

          <div className="mb-8">
            <div className="space-y-4 col-span-full">
              <div 
                  className="flex justify-between items-center cursor-pointer" 
                  onClick={() => setActiveGoalsCollapsed(!activeGoalsCollapsed)}
              >
                 <h3 className={currentFontConfig.smallClass + ' font-semibold uppercase tracking-wider ' + tStyle.subText}>Twoje Aktywne Cele</h3>
                 <ChevronDown className={`w-5 h-5 transition-transform ${tStyle.subText} ${activeGoalsCollapsed ? '-rotate-90' : ''}`} />
              </div>
              
              {!activeGoalsCollapsed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                  {goals.length > 0 ? (
                    goals.map(goal => {
                      const currentVal = goal.currentPage || 0;
                      const percent = Math.min(100, Math.round((currentVal / goal.target) * 100));
                      const isCompleted = percent >= 100;
                      
                      let CatIcon = Target;
                      if (goal.category === 'Zdrowie' || goal.category === 'Sport') CatIcon = Dumbbell;
                      if (goal.category === 'Dom' || goal.category === 'Ogólne') CatIcon = Utensils;
                      if (goal.category === 'Rozwój' || goal.category === 'Nauka' || goal.category === 'Książka') CatIcon = Brain;

                      return (
                        <div key={goal.id} className={'p-5 rounded-3xl border shadow-sm relative bg-amber-500/10 border-amber-500/25 ' + (isCompleted ? ' border-emerald-500/50 bg-emerald-500/10' : '')}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className={'p-2 rounded-xl ' + (isCompleted ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/25 text-amber-500')}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <CatIcon className="w-5 h-5" />}
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-500/10 text-amber-600 dark:text-amber-400 mb-1 inline-block">
                                  {goal.category}
                                </span>
                                <h4 className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{goal.title}</h4>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setFormErrors({}); setEditingGoal({ ...goal }); }} className={'hover:text-amber-500 p-1 ' + tStyle.subText}><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => setConfirmDeleteModal({ type: 'goal', id: goal.id, name: goal.title })} className={'hover:text-red-500 p-1 ' + tStyle.subText}><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                          {goal.comment && <div className={'mb-2 p-2.5 rounded-xl bg-slate-500/10 italic ' + currentFontConfig.smallClass + ' ' + tStyle.subText}>💬 "{goal.comment}"</div>}
                          
                          <div className="flex justify-between items-center mb-1.5 font-mono text-sm mt-3">
                            <span className={tStyle.subText}>Postęp:</span>
                            <span className="font-bold text-emerald-500">{currentVal} / {goal.target} ({percent}%) {isCompleted && '✨ (+30 PKT)'}</span>
                          </div>
                          <div className="w-full bg-slate-500/20 h-2.5 rounded-full overflow-hidden mb-0">
                            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: percent + '%' }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={'col-span-full p-6 text-center rounded-3xl border ' + currentFontConfig.smallClass + ' ' + tStyle.cardBg + ' ' + tStyle.subText}>Brak zdefiniowanych celów. Kliknij „+ Cel”.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 pt-6 border-t border-slate-500/20">
            <div 
               className="flex justify-between items-center mb-4 cursor-pointer"
               onClick={() => setFutureTasksCollapsed(!futureTasksCollapsed)}
            >
               <h3 className={currentFontConfig.smallClass + ' font-semibold uppercase tracking-wider ' + tStyle.subText}>Zadania na przyszłość</h3>
               <ChevronDown className={`w-5 h-5 transition-transform ${tStyle.subText} ${futureTasksCollapsed ? '-rotate-90' : ''}`} />
            </div>

            {!futureTasksCollapsed && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                {futureTasks.length > 0 ? (
                  futureTasks.map((task) => {
                    const catStyle = getCategoryStyle(task.category);
                    const associatedGoal = goals.find(g => g.id === task.goalId);
                    return (
                      <div key={task.id} className={'p-4 rounded-3xl border flex justify-between items-start shadow-sm bg-violet-500/10 border-violet-500/25'}>
                        <div className="flex items-start gap-3 w-full">
                          <button onClick={() => {
                              setConfirmCompleteModal({ type: 'task', id: task.id, name: task.title, isDone: false, goalId: task.goalId, targetDate: task.dueDate || tomorrowStr });
                              setCompleteTaskValue('');
                          }} className="mt-1">
                            <Circle className="w-6 h-6 text-slate-400 shrink-0 hover:text-violet-500 transition-colors" />
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{task.title}</span>
                              <span className={'px-2 py-0.5 rounded-full border text-[10px] ' + catStyle}>{task.category || 'Ogólne'}</span>
                              {associatedGoal && (
                                <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Cel: {associatedGoal.title}
                                </span>
                              )}
                            </div>
                            <span className={currentFontConfig.smallClass + ' block ' + tStyle.subText}>
                              {!task.repeat || task.repeat === 'once' ? `Jednorazowe (Termin: ${task.dueDate})` : task.repeat === 'daily' ? 'Codziennie' : task.repeat === 'interval' ? `Co ${task.intervalDays} dni` : 'Dni wybrane ręcznie'} 
                              {task.duration > 0 && ` • ${task.duration} min`} • <strong className="text-violet-500">+{task.pkt || 20} PKT</strong>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 ml-2">
                          <button onClick={() => { setFormErrors({}); setEditingTask({ ...task }); }} className={'p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 hover:text-amber-500 transition-colors ' + tStyle.subText}><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => setConfirmDeleteModal({ type: 'task', id: task.id, name: task.title })} className={'p-2 rounded-xl bg-slate-500/10 hover:bg-red-500/10 hover:text-red-500 transition-colors ' + tStyle.subText}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={'col-span-full p-6 text-center rounded-3xl border ' + currentFontConfig.smallClass + ' ' + tStyle.cardBg + ' ' + tStyle.subText}>
                    Brak zaplanowanych zadań w przyszłości.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-500/20">
            <button
              onClick={() => setShowArchiveModal(true)}
              className={'w-full py-4 rounded-3xl border font-bold flex items-center justify-center gap-2.5 transition-all shadow-md ' + tStyle.cardBg + ' hover:opacity-90'}
            >
              <Archive className="w-5 h-5 text-amber-500" /> Archiwum (Zrealizowane zadania i cele)
            </button>
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <>
          <header className="mb-6 md:mb-8">
            <h1 className={currentFontConfig.headerClass + ' font-bold tracking-tight ' + tStyle.titleText}>Kalendarz i Notatnik</h1>
            <p className={currentFontConfig.smallClass + ' md:text-base ' + tStyle.subText}>Historia, refleksje oraz przewidywane aktywności</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {renderCalendar()}
            </div>

            <div className="space-y-6">
              <div className={'p-5 rounded-2xl border shadow-sm ' + tStyle.cardBg}>
                <h3 className={currentFontConfig.smallClass + ' md:text-sm font-semibold uppercase tracking-wider mb-3 ' + tStyle.titleText}>
                  Podgląd Dnia: <span className="text-emerald-500 font-mono">{selectedDate}</span>
                </h3>
                {(selectedDayTasks.length > 0 || selectedDayWorkouts.length > 0) ? (
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {selectedDayTasks.map((t) => {
                      const isDone = isTaskDoneForDate(t, selectedDate);
                      return (
                        <div key={'t-' + t.id} className={'flex items-center justify-between bg-slate-500/10 p-3.5 rounded-xl ' + currentFontConfig.smallClass}>
                          <div>
                            <span className={isDone && !isFutureDay ? 'text-emerald-500 line-through' : tStyle.titleText}>⚡ {t.title}</span>
                            {t.duration > 0 && <span className={'block opacity-70 mt-0.5 ' + tStyle.subText}>{t.duration} minut</span>}
                          </div>
                          <span className={'font-semibold px-2.5 py-1 rounded-full text-[10px] md:text-xs uppercase tracking-wider border ' + (
                            isFutureDay 
                              ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30'
                              : isDone 
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                                : 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30'
                          )}>
                            {isFutureDay ? 'Zaplanowane' : (isDone ? 'Wykonane' : 'Niewykonane')}
                          </span>
                        </div>
                      );
                    })}
                    {selectedDayWorkouts.map((w) => {
                      let typeName = w.type === 'run' ? 'Bieg' : w.type === 'pushups' ? 'Pompki' : w.type === 'pullups' ? 'Drążek' : w.type === 'squats' ? 'Przysiady' : w.type === 'situps' ? 'Brzuszki' : w.type === 'bike' ? 'Rower' : w.type === 'gym' ? 'Siłownia' : w.type === 'walk_km' ? 'Spacer' : w.type === 'steps' ? 'Kroki' : w.type === 'study' ? 'Nauka' : w.type === 'read_book' ? 'Książka' : w.type === 'read_chapters' ? 'Książka (rozdziały)' : w.type === 'no_sweets' ? 'Dni bez słodyczy' : 'Spacer (czas)';
                      return (
                        <div key={'w-' + w.id} className={'flex items-center justify-between bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/25 ' + currentFontConfig.smallClass}>
                          <div>
                            <span className={'font-bold ' + tStyle.titleText}>🔥 {typeName}: {w.amount} {w.unit}</span>
                            <span className={'block opacity-70 mt-0.5 text-amber-500 font-bold'}>+{w.pkt} PKT</span>
                          </div>
                          <span className="font-semibold px-2.5 py-1 rounded-full text-[10px] md:text-xs uppercase tracking-wider border bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
                            Aktywność
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={currentFontConfig.smallClass + ' text-center py-4 ' + tStyle.subText}>Brak zarejestrowanych zadań w tym dniu.</p>
                )}
              </div>

              <div className={'p-5 rounded-2xl border shadow-sm ' + tStyle.cardBg}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                    <h3 className={currentFontConfig.smallClass + ' md:text-sm font-semibold uppercase tracking-wider ' + tStyle.titleText}>Refleksja na Dzień {selectedDate}</h3>
                  </div>
                  {isPastDay && currentNote && (
                    <button onClick={() => setShowDeleteNoteConfirm(true)} className={currentFontConfig.smallClass + ' text-red-500 hover:text-red-400 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10'}><Trash2 className="w-3.5 h-3.5" /> Usuń</button>
                  )}
                </div>

                <textarea
                  ref={textareaRef}
                  rows={2}
                  disabled={isPastDay && Boolean(currentNote)}
                  value={currentNote}
                  onChange={(e) => {
                    saveNote(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  placeholder={isPastDay ? "Brak notatki dla tego dnia." : "Wpisz swoje myśli..."}
                  className={'w-full rounded-2xl p-4 focus:outline-none transition-all resize-none overflow-hidden ' + tStyle.inputBg + (isPastDay && Boolean(currentNote) ? ' opacity-80 cursor-not-allowed italic' : '')}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'profile' && (
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
      )}

      <nav className={'fixed bottom-0 left-0 right-0 backdrop-blur-md border-t px-6 py-3 max-w-md md:max-w-3xl lg:max-w-5xl mx-auto flex justify-around items-center z-50 rounded-t-3xl shadow-2xl ' + tStyle.navBg}>
        <button onClick={() => setActiveTab('today')} className={'flex flex-col items-center gap-1 ' + currentFontConfig.smallClass + ' md:text-sm font-medium transition-colors ' + (activeTab === 'today' ? 'text-emerald-500 font-bold' : tStyle.subText + ' hover:text-emerald-500')}>
          <Zap className="w-5 h-5 md:w-6 md:h-6" /><span>Dzisiaj</span>
        </button>
        <button onClick={() => setActiveTab('goals')} className={'flex flex-col items-center gap-1 ' + currentFontConfig.smallClass + ' md:text-sm font-medium transition-colors ' + (activeTab === 'goals' ? 'text-emerald-500 font-bold' : tStyle.subText + ' hover:text-emerald-500')}>
          <Target className="w-5 h-5 md:w-6 md:h-6" /><span>Cele</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={'flex flex-col items-center gap-1 ' + currentFontConfig.smallClass + ' md:text-sm font-medium transition-colors ' + (activeTab === 'history' ? 'text-emerald-500 font-bold' : tStyle.subText + ' hover:text-emerald-500')}>
          <CalendarIcon className="w-5 h-5 md:w-6 md:h-6" /><span>Kalendarz</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={'flex flex-col items-center gap-1 ' + currentFontConfig.smallClass + ' md:text-sm font-medium transition-colors ' + (activeTab === 'profile' ? 'text-emerald-500 font-bold' : tStyle.subText + ' hover:text-emerald-500')}>
          <User className="w-5 h-5 md:w-6 md:h-6" /><span>Profil</span>
        </button>
      </nav>

      {/* --- MODALE --- */}

      {/* NOWY KREATOR CELÓW (WIZARD) */}
      {(showAddGoalModal || goalWizardStep > 0) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto">
          <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-500/20">
               <div className="flex items-center gap-2">
                 {goalWizardStep > 1 && (
                    <button onClick={() => setGoalWizardStep(prev => prev - 1)} className="p-1.5 rounded-full hover:bg-slate-500/20 transition-colors">
                       <ChevronLeft className="w-5 h-5" />
                    </button>
                 )}
                 <h3 className={currentFontConfig.sizeClass + ' font-bold ' + tStyle.titleText}>
                    {goalWizardStep === 1 ? 'Krok 1: Kategoria' : goalWizardStep === 2 ? 'Krok 2: Parametry Celu' : goalWizardStep === 3 ? 'Krok 3: Synergia' : 'Krok 4: Nawyk'}
                 </h3>
               </div>
               <button onClick={() => { setGoalWizardStep(0); setShowAddGoalModal(false); }} className={'p-1.5 rounded-full hover:bg-slate-500/20 transition-colors'}><X className="w-5 h-5"/></button>
            </div>

            {/* KROK 1: WYBÓR KATEGORII */}
            {goalWizardStep === 1 && (
              <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                {Object.values(GOAL_CATEGORIES_CONFIG).map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => { setWizardData({...wizardData, categoryKey: cat.id}); clearError('wizardCategory'); }}
                    className={`p-4 rounded-2xl border text-center transition-all ${wizardData.categoryKey === cat.id ? 'bg-amber-500/20 border-amber-500 text-amber-500 ring-2 ring-amber-500' : 'bg-slate-500/10 border-slate-500/30 hover:bg-slate-500/20'}`}
                  >
                    <span className="block text-3xl mb-2">{cat.label.split(' ')[0]}</span>
                    <span className={'font-bold ' + currentFontConfig.smallClass}>{cat.label.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            )}

            {/* KROK 2: SZCZEGÓŁY CELU */}
            {goalWizardStep === 2 && wizardData.categoryKey && (
              <div className="space-y-4 animate-fadeIn">
                {wizardData.categoryKey !== 'book' && (
                  <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                      {wizardData.categoryKey === 'sport' ? 'Dyscyplina sportowa' :
                       wizardData.categoryKey === 'study' ? 'Rodzaj nauki' :
                       wizardData.categoryKey === 'health' ? 'Nawyk zdrowotny' : 'Typ pracy / kategoria'}
                    </label>
                    <select 
                      value={wizardData.type} 
                      onChange={(e) => { setWizardData({...wizardData, type: e.target.value}); clearError('wizardType'); }} 
                      className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.wizardType ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-amber-500'} ${tStyle.inputBg}`}
                    >
                      <option value="">-- Wybierz (Wymagane) --</option>
                      {GOAL_CATEGORIES_CONFIG[wizardData.categoryKey].types.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                    {wizardData.categoryKey === 'book' ? 'Tytuł książki (np. "Wiedźmin: Ostatnie Życzenie")' :
                     wizardData.categoryKey === 'sport' ? 'Cel sportowy (np. "Bieg dookoła jeziora")' :
                     wizardData.categoryKey === 'study' ? 'Czego się uczysz? (np. "Podstawy Pythona")' :
                     wizardData.categoryKey === 'health' ? 'Nazwa wyzwania (np. "Więcej wody", "Detoks")' :
                     'Nazwa projektu / celu (np. "Nowa aplikacja")'}
                  </label>
                  <input 
                    type="text" 
                    value={wizardData.title} 
                    onChange={(e) => { setWizardData({...wizardData, title: e.target.value}); clearError('wizardTitle'); }} 
                    className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.wizardTitle ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-amber-500'} ${tStyle.inputBg}`} 
                    placeholder="Wpisz nazwę... (Wymagane)" 
                  />
                </div>

                <div className="pt-2 border-t border-slate-500/20">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input type="checkbox" checked={wizardData.isDaily} onChange={(e) => setWizardData({...wizardData, isDaily: e.target.checked})} className="w-4 h-4 accent-amber-500 rounded cursor-pointer" />
                    <span className={currentFontConfig.smallClass + ' font-medium ' + tStyle.subText}>
                      {wizardData.categoryKey === 'health' ? 'Cel codzienny (wartość odnawia się każdego dnia)' :
                       wizardData.categoryKey === 'book' ? 'Czytam określoną ilość dziennie (brak sztywnego deadline\'u)' :
                       'Zadanie dzienne (odnawia się o wyznaczonej godzinie)'}
                    </span>
                  </label>
                </div>

                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                    {wizardData.categoryKey === 'book' ? 'Liczba stron / Rozdziałów' :
                     wizardData.type ? `Rozmiar wyzwania (w: ${getUnitForType(wizardData.type)})` : 'Rozmiar wyzwania (najpierw wybierz typ wyżej)'}
                  </label>
                  <input 
                    type="number" 
                    step="any" 
                    min="0.1" 
                    value={wizardData.target} 
                    onChange={(e) => { setWizardData({...wizardData, target: e.target.value}); clearError('wizardTarget'); }} 
                    className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.wizardTarget ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-amber-500'} ${tStyle.inputBg}`} 
                    placeholder={wizardData.categoryKey === 'book' ? "np. 320 (Wymagane)" : "np. 50 (Wymagane)"} 
                  />
                </div>
                
                {!wizardData.isDaily && (
                  <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                      {wizardData.categoryKey === 'book' ? 'Czas na przeczytanie (Deadline)' : 'Czas na realizację (Deadline)'}
                    </label>
                    <input type="date" value={wizardData.dueDate} onChange={(e) => setWizardData({...wizardData, dueDate: e.target.value})} className={'w-full max-w-full box-border appearance-none rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg} style={{ WebkitAppearance: 'none' }} />
                  </div>
                )}
              </div>
            )}

            {/* KROK 3: PROPOZYCJA ZADANIA */}
            {goalWizardStep === 3 && (
              <div className="text-center space-y-6 animate-fadeIn py-4">
                <div className="w-16 h-16 mx-auto bg-emerald-500/20 text-emerald-500 flex items-center justify-center rounded-2xl border border-emerald-500/40">
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                   <h4 className={'font-bold mb-2 ' + currentFontConfig.headerClass + ' ' + tStyle.titleText}>Połącz Cel z Nawykami</h4>
                   <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>
                      Cele łatwiej zrealizować, rozbijając je na codzienne lub regularne zadania. Czy chcesz ułożyć rutynę dla celu: <strong className="text-amber-500">"{wizardData.title}"</strong>?
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4">
                   <button onClick={() => { 
                       setWizardData({...wizardData, createTask: false}); 
                       finalizeWizard(false); 
                   }} className={'py-3.5 rounded-2xl font-bold ' + tStyle.modalBtnBg}>
                     Nie, dziękuję
                   </button>
                   <button onClick={() => { 
                       setWizardData({...wizardData, createTask: true}); 
                       setGoalWizardStep(4);
                   }} className={'py-3.5 rounded-2xl font-bold bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20'}>
                     Jasne, utwórz!
                   </button>
                </div>
              </div>
            )}

            {/* KROK 4: KONFIGURACJA ZADANIA */}
            {goalWizardStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                 <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                    Jak nazwiesz to konkretne zadanie w liście "Dzisiaj"?
                  </label>
                  <input 
                    type="text" 
                    value={wizardData.taskTitle} 
                    onChange={(e) => { setWizardData({...wizardData, taskTitle: e.target.value}); clearError('wizardTaskTitle'); }} 
                    className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.wizardTaskTitle ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-emerald-500'} ${tStyle.inputBg}`} 
                  />
                </div>

                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                    {wizardData.categoryKey === 'book' ? 'Ile stron planujesz przeczytać na jednej sesji?' :
                     wizardData.categoryKey === 'sport' ? `Cel na jeden trening (w: ${getUnitForType(wizardData.type)})` :
                     wizardData.categoryKey === 'study' ? `Wartość na jedną sesję nauki (w: ${getUnitForType(wizardData.type)})` :
                     `Wartość docelowa na jedno zadanie (w: ${getUnitForType(wizardData.type)})`}
                  </label>
                  <input type="number" step="any" min="0" placeholder={wizardData.categoryKey === 'book' ? "np. 20 (opcjonalnie)" : "np. 15 (opcjonalnie)"} value={wizardData.taskAmount} onChange={(e) => setWizardData({...wizardData, taskAmount: e.target.value})} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                </div>

                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Trudność zadania (wpływa na punkty)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => setWizardData({...wizardData, taskDifficulty: 'easy'})} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (wizardData.taskDifficulty === 'easy' ? tStyle.optSelected : tStyle.optUnselected)}>Łatwy</button>
                    <button type="button" onClick={() => setWizardData({...wizardData, taskDifficulty: 'medium'})} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (wizardData.taskDifficulty === 'medium' ? tStyle.optSelectedWarning : tStyle.optUnselected)}>Średni</button>
                    <button type="button" onClick={() => setWizardData({...wizardData, taskDifficulty: 'hard'})} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (wizardData.taskDifficulty === 'hard' ? tStyle.optSelectedDanger : tStyle.optUnselected)}>Trudny</button>
                  </div>
                </div>

                {getUnitForType(wizardData.type) !== 'godz.' && getUnitForType(wizardData.type) !== 'min' && (
                  <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Czas trwania sesji (uruchamia stoper w minutach, opcjonalnie)</label>
                    <input type="number" placeholder="np. 30" value={wizardData.taskDuration} onChange={(e) => setWizardData({...wizardData, taskDuration: e.target.value})} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                  </div>
                )}

                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                    {wizardData.categoryKey === 'sport' ? 'Jak często będziesz trenować?' :
                     wizardData.categoryKey === 'book' ? 'Jak często będziesz czytać?' :
                     'Jak często chcesz nad tym pracować?'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setWizardData({...wizardData, taskRepeat: 'daily'})} className={'py-3 rounded-xl transition-all font-semibold ' + (wizardData.taskRepeat === 'daily' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500 ring-2 ring-emerald-500' : 'bg-slate-500/10 border-transparent text-slate-400 border')}>Codziennie</button>
                    <button type="button" onClick={() => setWizardData({...wizardData, taskRepeat: 'interval'})} className={'py-3 rounded-xl transition-all font-semibold ' + (wizardData.taskRepeat === 'interval' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500 ring-2 ring-emerald-500' : 'bg-slate-500/10 border-transparent text-slate-400 border')}>Co 2 dni</button>
                    <button type="button" onClick={() => setWizardData({...wizardData, taskRepeat: 'once'})} className={'col-span-2 py-3 rounded-xl transition-all font-semibold ' + (wizardData.taskRepeat === 'once' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500 ring-2 ring-emerald-500' : 'bg-slate-500/10 border-transparent text-slate-400 border')}>Cel krótkoterminowy (Jednorazowo)</button>
                  </div>
                </div>
              </div>
            )}

            {(goalWizardStep === 1 || goalWizardStep === 2 || goalWizardStep === 4) && (
              <div className="mt-6 pt-4 border-t border-slate-500/20">
                 <button 
                   onClick={handleWizardNext}
                   disabled={goalWizardStep === 1 && !wizardData.categoryKey}
                   className={'w-full py-4 rounded-2xl font-bold transition-transform ' + (goalWizardStep === 4 ? 'bg-emerald-500 text-slate-900 shadow-emerald-500/30' : 'bg-amber-500 text-slate-900 shadow-amber-500/30') + ' disabled:opacity-50 disabled:active:scale-100 active:scale-95 shadow-lg'}
                 >
                   {goalWizardStep === 4 ? 'Zakończ i zapisz' : 'Dalej'}
                 </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showTrophiesModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[120] overflow-y-auto">
          <div className={'w-full max-w-3xl max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 md:p-8 shadow-2xl border flex flex-col ' + tStyle.modalBg}>
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>Moja Gablota Trofeów</h3>
                  <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>Wszystkie zdobyte osiągnięcia ({Object.keys(earnedTrophies).length}/{TROPHIES.length})</p>
                </div>
              </div>
              <button onClick={() => setShowTrophiesModal(false)} className={'p-2 rounded-full transition-colors ' + tStyle.modalBtnBg}><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-8 flex-1 overflow-y-auto pr-1 pb-4">
              {['bronze', 'silver', 'gold', 'platinum'].map(rank => {
                  const trophiesInRank = sortedTrophies.filter(t => t.rank === rank);
                  if (trophiesInRank.length === 0) return null;
                  const rankName = rank === 'platinum' ? 'Platynowe' : rank === 'gold' ? 'Złote' : rank === 'silver' ? 'Srebrne' : 'Brązowe';
                  const rankColor = rank === 'platinum' ? 'text-cyan-400' : rank === 'gold' ? 'text-amber-500' : rank === 'silver' ? 'text-slate-300' : 'text-orange-500';

                  return (
                      <div key={rank}>
                          <h4 className={`font-bold uppercase tracking-wider mb-4 border-b border-slate-500/20 pb-2 ${rankColor}`}>{rankName} Trofea</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {trophiesInRank.map(trophy => {
                                  const isEarned = Boolean(earnedTrophies[trophy.id]);
                                  const colors = getTrophyColors(trophy.rank, isEarned);
                                  return (
                                      <div key={trophy.id} 
                                           onClick={() => setNewTrophyModal(trophy)}
                                           className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer hover:scale-105 ${colors}`}>
                                          <div className="mb-3 relative">
                                              {isEarned ? <Award className="w-8 h-8" /> : <Lock className="w-8 h-8 opacity-50" />}
                                          </div>
                                          <span className="font-bold text-sm mb-1">{trophy.title}</span>
                                          <span className="text-[10px] opacity-70 leading-snug">{trophy.desc}</span>
                                          {isEarned && <span className="text-[9px] mt-3 font-mono opacity-60 bg-slate-900/20 px-2 py-0.5 rounded">{earnedTrophies[trophy.id]}</span>}
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                  )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-500/25">
              <button onClick={() => setShowTrophiesModal(false)} className={'w-full py-3.5 rounded-2xl font-bold ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Zamknij gablotę</button>
            </div>
          </div>
        </div>
      )}

      {newTrophyModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 z-[500] animate-fadeIn">
          <div className="max-w-md w-full text-center">
             <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-2xl ${
                 earnedTrophies[newTrophyModal.id] ? 'animate-bounce ' : ''
             }${
                 newTrophyModal.rank === 'platinum' ? 'bg-cyan-500/20 text-cyan-400 shadow-cyan-500/50 ring-4 ring-cyan-400' :
                 newTrophyModal.rank === 'gold' ? 'bg-amber-500/20 text-amber-500 shadow-amber-500/50 ring-4 ring-amber-500' :
                 newTrophyModal.rank === 'silver' ? 'bg-slate-300/20 text-slate-300 shadow-slate-300/50 ring-4 ring-slate-300' :
                 'bg-orange-700/20 text-orange-500 shadow-orange-700/50 ring-4 ring-orange-500'
             }`}>
                {earnedTrophies[newTrophyModal.id] ? <Trophy className="w-16 h-16" /> : <Lock className="w-16 h-16 opacity-50" />}
             </div>
             
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
               {earnedTrophies[newTrophyModal.id] ? `Gratulacje, ${userName}!` : 'Zablokowane'}
             </h2>
             <p className={`text-lg mb-8 uppercase tracking-widest font-bold ${
                 newTrophyModal.rank === 'platinum' ? 'text-cyan-400' :
                 newTrophyModal.rank === 'gold' ? 'text-amber-500' :
                 newTrophyModal.rank === 'silver' ? 'text-slate-300' : 'text-orange-500'
             }`}>
                {earnedTrophies[newTrophyModal.id] 
                  ? `Odblokowano ${newTrophyModal.rank === 'platinum' ? 'platynowe' : newTrophyModal.rank === 'gold' ? 'złote' : newTrophyModal.rank === 'silver' ? 'srebrne' : 'brązowe'} trofeum`
                  : `${newTrophyModal.rank === 'platinum' ? 'Platynowe' : newTrophyModal.rank === 'gold' ? 'Złote' : newTrophyModal.rank === 'silver' ? 'Srebrne' : 'Brązowe'} trofeum do zdobycia`}
             </p>
             
             <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-700/50 mb-8 shadow-inner">
                <h3 className="text-2xl font-bold text-white mb-2">{newTrophyModal.title}</h3>
                <p className="text-slate-400 text-lg">{newTrophyModal.desc}</p>
             </div>
             
             <div className="flex flex-col gap-4">
                 {earnedTrophies[newTrophyModal.id] && (
                   <button onClick={() => handleShareTrophy(newTrophyModal)} className="w-full py-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-400 transition-transform active:scale-95 shadow-lg shadow-emerald-500/20">
                      <Share2 className="w-6 h-6" /> Udostępnij sukces
                   </button>
                 )}
                 <button onClick={() => setNewTrophyModal(null)} className="w-full py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold text-lg hover:bg-slate-700 transition-colors">
                    Zamknij
                 </button>
             </div>
          </div>
        </div>
      )}

      {showArchiveModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[120] overflow-y-auto">
          <div className={'w-full max-w-2xl max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 md:p-8 shadow-2xl border flex flex-col ' + tStyle.modalBg}>
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40">
                  <Archive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>Archiwum</h3>
                  <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>Wszystkie zrealizowane zadania i cele</p>
                </div>
              </div>
              <button onClick={() => setShowArchiveModal(false)} className={'p-2 rounded-full transition-colors ' + tStyle.modalBtnBg}><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-1">
              <div>
                <h4 className={currentFontConfig.smallClass + ' font-bold uppercase tracking-wider mb-3 text-sky-500 flex items-center gap-2'}>
                  <CheckSquare className="w-4 h-4" /> Zrealizowane Zadania ({archivedTasks.length})
                </h4>
                {archivedTasks.length > 0 ? (
                  <div className="space-y-2">
                    {archivedTasks.map((task) => (
                      <div key={task.id} className={'p-3.5 rounded-2xl border flex justify-between items-center bg-sky-500/10 border-sky-500/25 ' + currentFontConfig.smallClass}>
                        <div>
                          <span className={'font-medium block ' + tStyle.titleText}>{task.title}</span>
                          <span className={'font-mono text-xs opacity-80 ' + tStyle.subText}>Kategoria: {task.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-500/20 text-emerald-500 font-bold px-2.5 py-1 rounded-full text-xs">Ukończone</span>
                          <button 
                            onClick={() => restoreArchivedItem('task', { id: task.id, date: todayStr })}
                            className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Przywróć
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={'p-4 rounded-2xl border text-center ' + currentFontConfig.smallClass + ' ' + tStyle.subText + ' ' + tStyle.cardBg}>Brak zrealizowanych zadań w archiwum.</p>
                )}
              </div>

              <div>
                <h4 className={currentFontConfig.smallClass + ' font-bold uppercase tracking-wider mb-3 text-amber-500 flex items-center gap-2'}>
                  <Target className="w-4 h-4" /> Zrealizowane Cele ({archivedGoals.length})
                </h4>
                {archivedGoals.length > 0 ? (
                  <div className="space-y-2">
                    {archivedGoals.map((goal) => (
                      <div key={goal.id} className={'p-3.5 rounded-2xl border flex justify-between items-center bg-amber-500/10 border-amber-500/25 ' + currentFontConfig.smallClass}>
                        <div>
                          <span className={'font-medium block ' + tStyle.titleText}>{goal.title}</span>
                          <span className={'font-mono text-xs opacity-80 ' + tStyle.subText}>Cel: {goal.target}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-500/20 text-amber-500 font-bold px-2.5 py-1 rounded-full text-xs">Osiągnięty</span>
                          <button 
                            onClick={() => restoreArchivedItem('goal', goal)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Przywróć
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={'p-4 rounded-2xl border text-center ' + currentFontConfig.smallClass + ' ' + tStyle.subText + ' ' + tStyle.cardBg}>Brak osiągniętych celów w archiwum.</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-500/25">
              <button onClick={() => setShowArchiveModal(false)} className={'w-full py-3.5 rounded-2xl font-bold ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Zamknij archiwum</button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border space-y-6 ' + tStyle.modalBg}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-500/20">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-500" />
                <h3 className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>Ustawienia aplikacji</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className={'p-2 rounded-full transition-colors ' + tStyle.modalBtnBg} title="Zamknij"><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className={currentFontConfig.smallClass + ' md:text-sm font-medium block mb-2 ' + tStyle.subText}>Kategorie (Zablokowane z Kreatorem)</label>
              <div className="space-y-2 mb-3">
                {categories.map(cat => (
                  <div key={cat.id} className={'flex items-center justify-between p-3 rounded-2xl border ' + tStyle.cardBg}>
                    <span className={currentFontConfig.smallClass + ' px-3 py-1 rounded-full border font-bold ' + cat.color}>{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className={currentFontConfig.smallClass + ' md:text-sm font-medium block mb-2 ' + tStyle.subText}>Motyw Kolorystyczny</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setTheme('light')} className={'p-3 rounded-2xl border ' + currentFontConfig.smallClass + ' font-semibold flex flex-col items-center gap-1.5 transition-all ' + (theme === 'light' ? tStyle.optSelected : tStyle.optUnselected)}><Sun className="w-4 h-4" /><span>Jasny</span></button>
                <button onClick={() => setTheme('dark')} className={'p-3 rounded-2xl border ' + currentFontConfig.smallClass + ' font-semibold flex flex-col items-center gap-1.5 transition-all ' + (theme === 'dark' ? tStyle.optSelected : tStyle.optUnselected)}><Moon className="w-4 h-4" /><span>Ciemny</span></button>
                <button onClick={() => setTheme('system')} className={'p-3 rounded-2xl border ' + currentFontConfig.smallClass + ' font-semibold flex flex-col items-center gap-1.5 transition-all ' + (theme === 'system' ? tStyle.optSelectedInfo : tStyle.optUnselected)}><Laptop className="w-4 h-4" /><span>Systemowy</span></button>
                <button onClick={() => setTheme('gold')} className={'p-3 rounded-2xl border ' + currentFontConfig.smallClass + ' font-semibold flex flex-col items-center gap-1.5 transition-all ' + (theme === 'gold' ? tStyle.optSelectedWarning : tStyle.optUnselected)}><Sparkles className="w-4 h-4" /><span>Prestiż</span></button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-500/20">
              <div className="flex justify-between items-center mb-2">
                <label className={currentFontConfig.smallClass + ' md:text-sm font-medium flex items-center gap-2 ' + tStyle.subText}><Type className="w-4 h-4 text-emerald-500" /> Rozmiar czcionki</label>
                <span className={currentFontConfig.smallClass + ' md:text-sm font-bold text-emerald-500'}>{FONT_SIZE_OPTIONS.find(f => f.level === fontSizeLevel)?.name}</span>
              </div>
              <input type="range" min="1" max="6" step="1" value={fontSizeLevel} onChange={(e) => setFontSizeLevel(parseInt(e.target.value, 10))} className="w-full accent-emerald-500 cursor-pointer h-2.5 bg-slate-500/20 rounded-lg" />
            </div>

            <div className="pt-2 border-t border-slate-500/20">
              <label className={currentFontConfig.smallClass + ' md:text-sm font-medium flex items-center gap-2 mb-2 ' + tStyle.subText}>
                <Clock className="w-4 h-4 text-emerald-500" /> Godzina restartu dnia
              </label>
              <input 
                type="time" 
                value={resetTime} 
                onChange={(e) => {
                  const newTime = e.target.value;
                  setResetTime(newTime);
                  localStorage.setItem('discipline_reset_time', newTime);
                    
                  const newToday = getAppDayString(newTime);
                  if (newToday !== todayStr) {
                    setTodayStr(newToday);
                    setSelectedDate(newToday);
                  }
                }} 
                className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} 
              />
            </div>

            <button onClick={() => setShowSettingsModal(false)} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-2xl font-bold transition-transform active:scale-95 shadow-lg shadow-emerald-500/20">Zamknij ustawienia</button>
          </div>
        </div>
      )}

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 ' + tStyle.titleText}>Dodaj nowe zadanie</h3>
            <div className="mb-4 p-3 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-between">
               <span className={currentFontConfig.smallClass + ' font-medium ' + tStyle.subText}>Dodajesz do kategorii:</span>
               <span className={'font-bold ' + currentFontConfig.smallClass + ' text-emerald-500'}>{categories.find(c => c.id === newTaskCategory)?.label || newTaskCategory}</span>
            </div>
            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Tytuł zadania</label>
                <input 
                  type="text" 
                  placeholder="np. Nauka angielskiego (Wymagane)" 
                  value={newTaskTitle} 
                  onChange={(e) => { setNewTaskTitle(e.target.value); clearError('newTaskTitle'); }} 
                  className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.newTaskTitle ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-emerald-500'} ${tStyle.inputBg}`} 
                />
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Przypisz do celu (opcjonalnie)</label>
                <select value={newTaskGoalId} onChange={(e) => setNewTaskGoalId(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg}>
                  <option value="">-- Brak powiązania z celem --</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Trudność zadania</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setNewTaskDifficulty('easy')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskDifficulty === 'easy' ? tStyle.optSelected : tStyle.optUnselected)}>Łatwy</button>
                  <button type="button" onClick={() => setNewTaskDifficulty('medium')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskDifficulty === 'medium' ? tStyle.optSelectedWarning : tStyle.optUnselected)}>Średni</button>
                  <button type="button" onClick={() => setNewTaskDifficulty('hard')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskDifficulty === 'hard' ? tStyle.optSelectedDanger : tStyle.optUnselected)}>Trudny</button>
                </div>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Powtarzalność / Typ</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button type="button" onClick={() => setNewTaskRepeat('once')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskRepeat === 'once' ? tStyle.optSelected : tStyle.optUnselected)}>Jednorazowe</button>
                  <button type="button" onClick={() => setNewTaskRepeat('daily')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskRepeat === 'daily' ? tStyle.optSelected : tStyle.optUnselected)}>Codziennie</button>
                  <button type="button" onClick={() => setNewTaskRepeat('interval')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskRepeat === 'interval' ? tStyle.optSelected : tStyle.optUnselected)}>Co kilka dni</button>
                  <button type="button" onClick={() => setNewTaskRepeat('custom')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskRepeat === 'custom' ? tStyle.optSelected : tStyle.optUnselected)}>Niestandardowe</button>
                </div>
                {(!newTaskRepeat || newTaskRepeat === 'once') && (
                  <div className="mt-2">
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Termin realizacji</label>
                    <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className={'w-full max-w-full box-border appearance-none rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} style={{ WebkitAppearance: 'none' }} />
                  </div>
                )}
                {newTaskRepeat === 'interval' && (
                  <div className="mt-2">
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Co ile dni?</label>
                    <input type="number" min="2" max="30" value={newTaskIntervalDays} onChange={(e) => setNewTaskIntervalDays(e.target.value)} className={'w-full rounded-2xl px-4 py-2.5 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                  </div>
                )}
                {newTaskRepeat === 'custom' && (
                  <div className="mt-3 space-y-2">
                    <label className={currentFontConfig.smallClass + ' font-medium block ' + tStyle.subText}>Zaznacz dni w kalendarzu:</label>
                    <div className={'p-3 rounded-2xl border ' + tStyle.cardBg}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={'font-bold ' + currentFontConfig.smallClass + ' ' + tStyle.titleText}>{taskPickerDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setTaskPickerDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="p-1 rounded hover:bg-slate-500/20"><ChevronLeft className="w-4 h-4" /></button>
                          <button type="button" onClick={() => setTaskPickerDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="p-1 rounded hover:bg-slate-500/20"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className={'grid grid-cols-7 gap-1 text-center text-[10px] font-semibold mb-1 ' + tStyle.subText}>
                        <span>Pn</span><span>Wt</span><span>Śr</span><span>Cz</span><span>Pt</span><span>Sob</span><span>Ndz</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {renderCustomCalendar(false, null, null)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-slate-500/20">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={newTaskHasReminder} onChange={(e) => { const checked = e.target.checked; setNewTaskHasReminder(checked); if (checked && 'Notification' in window) Notification.requestPermission(); }} className="w-4 h-4 accent-emerald-500 rounded cursor-pointer" />
                  <span className={currentFontConfig.smallClass + ' font-medium ' + tStyle.subText}>Włącz powiadomienie (przypomnienie)</span>
                </label>
                {newTaskHasReminder && (
                  <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Godzina powiadomienia</label>
                    <input type="time" value={newTaskReminderTime} onChange={(e) => setNewTaskReminderTime(e.target.value)} className={'w-full rounded-2xl px-4 py-2.5 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                  </div>
                )}
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Czas trwania (w minutach, opcjonalnie)</label>
                <input type="number" placeholder="np. 15 (zostaw puste jeśli bez limitu)" value={newTaskDuration} onChange={(e) => setNewTaskDuration(e.target.value)} min="1" max="480" className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddTaskModal(false)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                <button type="submit" className={'flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>Dodaj</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 ' + tStyle.titleText}>Edytuj zadanie</h3>
            <form onSubmit={saveEditedTask} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Tytuł zadania</label>
                <input 
                  type="text" 
                  value={editingTask.title} 
                  onChange={(e) => { setEditingTask({ ...editingTask, title: e.target.value }); clearError('editingTaskTitle'); }} 
                  className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.editingTaskTitle ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-emerald-500'} ${tStyle.inputBg}`} 
                />
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Kategoria (Obszar życia)</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {categories.map((cat) => (
                    <button key={cat.id} type="button" onClick={() => setEditingTask({ ...editingTask, category: cat.id })} className={'py-2.5 px-3 ' + currentFontConfig.smallClass + ' rounded-xl text-left transition-all ' + (editingTask.category === cat.id ? tStyle.optSelected : tStyle.optUnselected)}>{cat.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Przypisz do celu</label>
                <select value={editingTask.goalId || ''} onChange={(e) => setEditingTask({ ...editingTask, goalId: e.target.value ? parseInt(e.target.value) : null })} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg}>
                  <option value="">-- Brak powiązania z celem --</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Trudność zadania</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setEditingTask({ ...editingTask, difficulty: 'easy' })} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (editingTask.difficulty === 'easy' ? tStyle.optSelected : tStyle.optUnselected)}>Łatwy</button>
                  <button type="button" onClick={() => setEditingTask({ ...editingTask, difficulty: 'medium' })} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (editingTask.difficulty === 'medium' ? tStyle.optSelectedWarning : tStyle.optUnselected)}>Średni</button>
                  <button type="button" onClick={() => setEditingTask({ ...editingTask, difficulty: 'hard' })} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (editingTask.difficulty === 'hard' ? tStyle.optSelectedDanger : tStyle.optUnselected)}>Trudny</button>
                </div>
              </div>
              {(!editingTask.repeat || editingTask.repeat === 'once') && (
                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Termin realizacji</label>
                  <input type="date" value={editingTask.dueDate} onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })} className={'w-full max-w-full box-border appearance-none rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} style={{ WebkitAppearance: 'none' }} />
                </div>
              )}
              {editingTask.repeat === 'custom' && (
                  <div className="mt-3 space-y-2">
                    <label className={currentFontConfig.smallClass + ' font-medium block ' + tStyle.subText}>Zaznacz dni w kalendarzu:</label>
                    <div className={'p-3 rounded-2xl border ' + tStyle.cardBg}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={'font-bold ' + currentFontConfig.smallClass + ' ' + tStyle.titleText}>{taskPickerDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setTaskPickerDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="p-1 rounded hover:bg-slate-500/20"><ChevronLeft className="w-4 h-4" /></button>
                          <button type="button" onClick={() => setTaskPickerDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="p-1 rounded hover:bg-slate-500/20"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className={'grid grid-cols-7 gap-1 text-center text-[10px] font-semibold mb-1 ' + tStyle.subText}>
                        <span>Pn</span><span>Wt</span><span>Śr</span><span>Cz</span><span>Pt</span><span>Sob</span><span>Ndz</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {renderCustomCalendar(true, editingTask, setEditingTask)}
                      </div>
                    </div>
                  </div>
              )}
              
              <div className="pt-2 border-t border-slate-500/20">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={editingTask.hasReminder || false} onChange={(e) => { const checked = e.target.checked; setEditingTask({ ...editingTask, hasReminder: checked }); if (checked && 'Notification' in window) Notification.requestPermission(); }} className="w-4 h-4 accent-emerald-500 rounded cursor-pointer" />
                  <span className={currentFontConfig.smallClass + ' font-medium ' + tStyle.subText}>Włącz powiadomienie (przypomnienie)</span>
                </label>
                {editingTask.hasReminder && (
                  <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Godzina powiadomienia</label>
                    <input type="time" value={editingTask.reminderTime || '08:00'} onChange={(e) => setEditingTask({ ...editingTask, reminderTime: e.target.value })} className={'w-full rounded-2xl px-4 py-2.5 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                  </div>
                )}
              </div>

              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Czas trwania (w minutach, opcjonalnie)</label>
                <input type="number" placeholder="np. 15" value={editingTask.duration || ''} onChange={(e) => setEditingTask({ ...editingTask, duration: e.target.value })} min="1" max="480" className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingTask(null)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                <button type="submit" className={'flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>Zapisz zmiany</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddWorkoutModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 ' + tStyle.titleText}>Rejestruj aktywność</h3>
            <form onSubmit={addWorkout} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Typ aktywności</label>
                <select value={newWorkoutType} onChange={(e) => setNewWorkoutType(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg}>
                  <optgroup label="🏃 Sport">
                    <option value="run">Bieganie (km)</option>
                    <option value="bike">Rower (km)</option>
                    <option value="walk_km">Spacer (km)</option>
                    <option value="pushups">Pompki (powtórzenia)</option>
                    <option value="pullups">Drążek (powtórzenia)</option>
                    <option value="squats">Przysiady (powtórzenia)</option>
                    <option value="situps">Brzuszki (powtórzenia)</option>
                    <option value="gym">Siłownia (minuty)</option>
                  </optgroup>
                  <optgroup label="🧠 Umysł">
                    <option value="study">Nauka (godziny)</option>
                    <option value="read_book">Książka (strony)</option>
                    <option value="read_chapters">Książka (rozdziały)</option>
                  </optgroup>
                  <optgroup label="🌿 Zdrowie">
                    <option value="steps">Kroki (liczba)</option>
                    <option value="no_sweets">Dni bez słodyczy (dni)</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Powiąż z celem (opcjonalnie)</label>
                <select value={newWorkoutGoalId} onChange={(e) => setNewWorkoutGoalId(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg}>
                  <option value="">-- Brak powiązania --</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title} ({g.category})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                  {newWorkoutType === 'run' || newWorkoutType === 'bike' || newWorkoutType === 'walk_km' ? 'Dystans (km)' : newWorkoutType === 'pushups' || newWorkoutType === 'pullups' || newWorkoutType === 'squats' || newWorkoutType === 'situps' ? 'Liczba powtórzeń' : newWorkoutType === 'steps' ? 'Liczba kroków' : newWorkoutType === 'gym' ? 'Czas (minuty)' : newWorkoutType === 'study' ? 'Czas (godziny)' : newWorkoutType === 'read_book' ? 'Liczba stron' : newWorkoutType === 'read_chapters' ? 'Liczba rozdziałów' : newWorkoutType === 'no_sweets' ? 'Liczba dni' : 'Wartość'}
                </label>
                <input 
                  type="number" 
                  step="any" 
                  placeholder={newWorkoutType === 'steps' ? 'np. 10000 (Wymagane)' : 'np. 1 (Wymagane)'} 
                  value={newWorkoutAmount} 
                  onChange={(e) => { setNewWorkoutAmount(e.target.value); clearError('newWorkoutAmount'); }} 
                  className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.newWorkoutAmount ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-amber-500'} ${tStyle.inputBg}`} 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddWorkoutModal(false)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                <button type="submit" className={'flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>Dodaj</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingWorkout && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 ' + tStyle.titleText}>Edytuj aktywność</h3>
            <form onSubmit={saveEditedWorkout} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Typ aktywności</label>
                <select value={editingWorkout.type} onChange={(e) => setEditingWorkout({...editingWorkout, type: e.target.value})} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg}>
                  <optgroup label="🏃 Sport">
                    <option value="run">Bieganie (km)</option>
                    <option value="bike">Rower (km)</option>
                    <option value="walk_km">Spacer (km)</option>
                    <option value="pushups">Pompki (powtórzenia)</option>
                    <option value="pullups">Drążek (powtórzenia)</option>
                    <option value="squats">Przysiady (powtórzenia)</option>
                    <option value="situps">Brzuszki (powtórzenia)</option>
                    <option value="gym">Siłownia (minuty)</option>
                  </optgroup>
                  <optgroup label="🧠 Umysł">
                    <option value="study">Nauka (godziny)</option>
                    <option value="read_book">Książka (strony)</option>
                    <option value="read_chapters">Książka (rozdziały)</option>
                  </optgroup>
                  <optgroup label="🌿 Zdrowie">
                    <option value="steps">Kroki (liczba)</option>
                    <option value="no_sweets">Dni bez słodyczy (dni)</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Powiąż z celem (opcjonalnie)</label>
                <select value={editingWorkout.goalId || ''} onChange={(e) => setEditingWorkout({...editingWorkout, goalId: e.target.value})} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg}>
                  <option value="">-- Brak powiązania --</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title} ({g.category})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                  {editingWorkout.type === 'run' || editingWorkout.type === 'bike' || editingWorkout.type === 'walk_km' ? 'Dystans (km)' : editingWorkout.type === 'pushups' || editingWorkout.type === 'pullups' || editingWorkout.type === 'squats' || editingWorkout.type === 'situps' ? 'Liczba powtórzeń' : editingWorkout.type === 'steps' ? 'Liczba kroków' : editingWorkout.type === 'gym' ? 'Czas (minuty)' : editingWorkout.type === 'study' ? 'Czas (godziny)' : editingWorkout.type === 'read_book' ? 'Liczba stron' : editingWorkout.type === 'read_chapters' ? 'Liczba rozdziałów' : editingWorkout.type === 'no_sweets' ? 'Liczba dni' : 'Wartość'}
                </label>
                <input 
                  type="number" 
                  step="any" 
                  value={editingWorkout.amount} 
                  onChange={(e) => { setEditingWorkout({...editingWorkout, amount: e.target.value}); clearError('editingWorkoutAmount'); }} 
                  className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.editingWorkoutAmount ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-amber-500'} ${tStyle.inputBg}`} 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingWorkout(null)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                <button type="submit" className={'flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>Zapisz zmiany</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddActivityModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-md rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 ' + tStyle.titleText}>Zarejestruj postęp (Umysł / Jedzenie)</h3>
            <form onSubmit={addActivity} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Wybierz cel</label>
                <select 
                  value={activityGoalId} 
                  onChange={(e) => { setActivityGoalId(e.target.value); clearError('activityGoalId'); }} 
                  className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.activityGoalId ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-emerald-500'} ${tStyle.inputBg}`}
                >
                  <option value="">-- Wybierz cel (Wymagane) --</option>
                  {goals.filter(g => g.category === 'Nauka' || g.category === 'Książka' || g.category === 'Zdrowie').map(g => {
                    const isProgressType = g.type === 'read_book' || g.type === 'read_chapters' || g.type === 'study' || g.type === 'no_sweets';
                    let currentVal = 0;
                    if (g.isDaily) {
                        currentVal = workouts.filter(w => w.goalId === g.id && w.date === todayStr).reduce((acc, w) => acc + w.amount, 0);
                    } else {
                        currentVal = (g.currentPage || 0);
                    }
                    return (
                      <option key={g.id} value={g.id}>{g.title} (obecnie: {currentVal}/{g.target} {g.type === 'study' ? 'godz.' : g.type === 'no_sweets' ? 'dni' : g.type === 'read_chapters' ? 'rozdziałów' : 'stron'})</option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Wartość do dodania (strony / rozdziały / godziny / dni)</label>
                <input 
                  type="number" 
                  step="any" 
                  min="0.1" 
                  placeholder="np. 20 lub 1.5 (Wymagane)" 
                  value={activityPages} 
                  onChange={(e) => { setActivityPages(e.target.value); clearError('activityPages'); }} 
                  className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.activityPages ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-emerald-500'} ${tStyle.inputBg}`} 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddActivityModal(false)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                <button type="submit" className={'flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>Zapisz</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingGoal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 ' + tStyle.titleText}>Edytuj cel</h3>
            <form onSubmit={saveEditedGoal} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Tytuł / Nazwa celu</label>
                <input 
                  type="text" 
                  value={editingGoal.title} 
                  onChange={(e) => { setEditingGoal({ ...editingGoal, title: e.target.value }); clearError('editingGoalTitle'); }} 
                  className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.editingGoalTitle ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-amber-500'} ${tStyle.inputBg}`} 
                />
              </div>
              
              <div className="pt-2 border-t border-slate-500/20">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={editingGoal.isDaily || false} onChange={(e) => setEditingGoal({ ...editingGoal, isDaily: e.target.checked, dueDate: e.target.checked ? null : editingGoal.dueDate })} className="w-4 h-4 accent-amber-500 rounded cursor-pointer" />
                  <span className={currentFontConfig.smallClass + ' font-medium ' + tStyle.subText}>Codziennie (odnawia się każdego dnia)</span>
                </label>
              </div>

              {(!editingGoal.isDaily && (editingGoal.type === 'read_book' || editingGoal.type === 'read_chapters' || editingGoal.type === 'study' || editingGoal.type === 'no_sweets')) && (
                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Aktualny postęp (ręczny)</label>
                  <input type="number" step="any" min="0" value={editingGoal.currentPage || 0} onChange={(e) => setEditingGoal({ ...editingGoal, currentPage: parseFloat(e.target.value) || 0 })} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg} />
                </div>
              )}
              
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Docelowa wartość {editingGoal.isDaily ? '(na dzień)' : ''}</label>
                <input 
                  type="number" 
                  step="any" 
                  value={editingGoal.target} 
                  onChange={(e) => { setEditingGoal({ ...editingGoal, target: parseFloat(e.target.value) || 0 }); clearError('editingGoalTarget'); }} 
                  className={`w-full rounded-2xl px-4 py-3 ${currentFontConfig.sizeClass} focus:outline-none transition-all ${formErrors.editingGoalTarget ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-500/20 focus:border-amber-500'} ${tStyle.inputBg}`} 
                />
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + (editingGoal.isDaily ? 'opacity-50 ' : '') + tStyle.subText}>Termin realizacji</label>
                <input disabled={editingGoal.isDaily} type="date" value={editingGoal.dueDate || ''} onChange={(e) => setEditingGoal({ ...editingGoal, dueDate: e.target.value })} className={'w-full max-w-full box-border appearance-none rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg + (editingGoal.isDaily ? ' opacity-50 cursor-not-allowed' : '')} style={{ WebkitAppearance: 'none' }} />
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Komentarz / Motywacja</label>
                <input type="text" value={editingGoal.comment || ''} onChange={(e) => setEditingGoal({ ...editingGoal, comment: e.target.value })} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingGoal(null)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                <button type="submit" className={'flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>Zapisz zmiany</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAllQuotesModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-lg max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 md:p-8 shadow-2xl border flex flex-col ' + tStyle.modalBg}>
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-500/20">
              <div className="flex items-center gap-2">
                <Quote className="w-6 h-6 text-amber-500" />
                <h3 className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>Inspirujące cytaty motywacyjne</h3>
              </div>
              <button onClick={() => setShowAllQuotesModal(false)} className={'p-2 rounded-full transition-colors ' + tStyle.modalBtnBg}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {QUOTES.map((q, idx) => (
                <div key={idx} className={'p-4 rounded-2xl border bg-amber-500/5 border-amber-500/20'}>
                  <p className={'font-medium italic mb-1.5 ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>"{q.quote}"</p>
                  <p className={currentFontConfig.smallClass + ' text-amber-500 font-semibold text-right'}>— {q.author}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-500/20">
              <button onClick={() => setShowAllQuotesModal(false)} className={'w-full py-3.5 rounded-2xl font-bold ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Zamknij</button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[150]">
          <div className={'w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center border ' + tStyle.modalBg}>
            <div className="w-12 h-12 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle className="w-6 h-6" /></div>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-2 ' + tStyle.titleText}>Potwierdź usunięcie</h3>
            <p className={currentFontConfig.smallClass + ' mb-6 ' + tStyle.subText}>Czy na pewno chcesz usunąć: <strong className="text-red-400">"{confirmDeleteModal.name}"</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteModal(null)} className={'flex-1 py-3 rounded-2xl font-semibold ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
              <button onClick={executeDelete} className={'flex-1 bg-red-500 hover:bg-red-400 text-white py-3 rounded-2xl font-bold ' + currentFontConfig.smallClass + ' shadow-lg shadow-red-500/30'}>Usuń</button>
            </div>
          </div>
        </div>
      )}

      {confirmCompleteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[150] animate-fadeIn">
          <div className={'w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center border ' + tStyle.modalBg}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${confirmCompleteModal.isDone ? 'bg-amber-500/20 text-amber-500 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'} border`}>
                {confirmCompleteModal.isDone ? <RotateCcw className="w-6 h-6" /> : <Check className="w-6 h-6" />}
            </div>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-2 ' + tStyle.titleText}>
               Potwierdź {confirmCompleteModal.isDone ? 'cofnięcie' : 'wykonanie'}
            </h3>
            <p className={currentFontConfig.smallClass + ' mb-6 ' + tStyle.subText}>
               Czy na pewno chcesz oznaczyć jako <strong className={confirmCompleteModal.isDone ? "text-amber-500" : "text-emerald-500"}>{confirmCompleteModal.isDone ? 'NIEzrobione' : 'zrobione'}</strong>: <br/> "{confirmCompleteModal.name}"?
            </p>

            {!confirmCompleteModal.isDone && confirmCompleteModal.goalId && (
                <div className="mb-6 text-left border-t border-slate-500/20 pt-4 mt-4">
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-2 ' + tStyle.subText}>
                        <Target className="w-4 h-4 inline mr-1 text-amber-500" />
                        Zadanie jest powiązane z celem. O ile zaktualizować cel? (np. liczba przeczytanych stron):
                    </label>
                    <input 
                        type="number" 
                        step="any"
                        value={completeTaskValue} 
                        onChange={(e) => setCompleteTaskValue(e.target.value)} 
                        placeholder="Zostaw puste, by nie aktualizować"
                        className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} 
                    />
                </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setConfirmCompleteModal(null)} className={'flex-1 py-3 rounded-2xl font-semibold ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
              <button onClick={executeComplete} className={`flex-1 py-3 rounded-2xl font-bold ${currentFontConfig.smallClass} shadow-lg text-slate-950 ${confirmCompleteModal.isDone ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/30' : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30'}`}>
                  {confirmCompleteModal.isDone ? 'Cofnij' : 'Zrobione'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteNoteConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[150]">
          <div className={'w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center border ' + tStyle.modalBg}>
            <div className="w-12 h-12 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle className="w-6 h-6" /></div>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-2 ' + tStyle.titleText}>Usunąć notatkę?</h3>
            <p className={currentFontConfig.smallClass + ' mb-6 ' + tStyle.subText}>Czy na pewno chcesz skasować refleksję z dnia <strong className="text-emerald-500">{selectedDate}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteNoteConfirm(false)} className={'flex-1 py-3 rounded-2xl font-semibold ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
              <button onClick={confirmDeleteNote} className={'flex-1 bg-red-500 hover:bg-red-400 text-white py-3 rounded-2xl font-bold ' + currentFontConfig.smallClass + ' shadow-lg shadow-red-500/30'}>Usuń</button>
            </div>
          </div>
        </div>
      )}

      {quoteModal.show && quoteModal.data && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-5 z-[200] animate-fadeIn">
          <div className={'w-full max-w-md rounded-3xl p-8 shadow-2xl relative text-center border ' + tStyle.modalBg}>
            <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-500 shadow-inner"><Quote className="w-7 h-7" /></div>
            <span className={currentFontConfig.smallClass + ' md:text-sm font-bold uppercase tracking-widest text-amber-500 block mb-2'}>Cytat na dziś</span>
            <p className={currentFontConfig.sizeClass + ' md:text-xl font-medium leading-relaxed mb-4 ' + tStyle.titleText}>"{quoteModal.data.quote}"</p>
            <p className={currentFontConfig.smallClass + ' md:text-base font-semibold text-amber-500 mb-8'}>— {quoteModal.data.author}</p>
            <button onClick={closeQuoteModal} className={'w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-2xl font-bold ' + currentFontConfig.sizeClass + ' transition-transform active:scale-95 shadow-lg shadow-amber-500/25'}>Zaczynamy dzień! ⚡</button>
          </div>
        </div>
      )}

      {showRanksModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[120] overflow-y-auto">
          <div className={'w-full max-w-md max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 md:p-8 shadow-2xl border flex flex-col ' + tStyle.modalBg}>
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>Spis Rang</h3>
                  <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>Droga wojownika</p>
                </div>
              </div>
              <button onClick={() => setShowRanksModal(false)} className={'p-2 rounded-full transition-colors ' + tStyle.modalBtnBg}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 pb-4">
              {RANKS.map((r, idx) => {
                const nextRank = RANKS[idx + 1];
                const maxLvl = nextRank ? nextRank.minLevel - 1 : 50;
                const isCurrent = levelInfo.level >= r.minLevel && levelInfo.level <= maxLvl;
                return (
                  <div key={idx} className={`p-4 rounded-2xl border flex justify-between items-center ${isCurrent ? 'bg-amber-500/20 border-amber-500/50 shadow-md' : 'bg-slate-500/5 border-slate-500/20'}`}>
                    <div>
                      <span className={'font-bold block ' + (isCurrent ? 'text-amber-500' : tStyle.titleText)}>{r.name}</span>
                      <span className={currentFontConfig.smallClass + ' opacity-70 ' + tStyle.subText}>Poziomy: {r.minLevel} - {maxLvl}</span>
                    </div>
                    {isCurrent && <span className="text-[10px] font-bold uppercase bg-amber-500 text-slate-900 px-2 py-1 rounded-full">Obecna</span>}
                  </div>
                )
              })}
            </div>
            <div className="mt-2 pt-4 border-t border-slate-500/25">
              <button onClick={() => setShowRanksModal(false)} className={'w-full py-3.5 rounded-2xl font-bold ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Zamknij</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}