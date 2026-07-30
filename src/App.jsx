import React, { useState, useEffect, useRef } from 'react';
import { QUOTES } from './data/quotes';
import { 
  CheckCircle2, Circle, Plus, Trophy, Zap, 
  Trash2, Calendar as CalendarIcon, Check, Play, Pause, Quote, X, User, Settings, ShieldCheck, Sun, Moon, Sparkles, Flame, MessageSquare, AlertTriangle, Edit3, Tag, PieChart, ChevronLeft, ChevronRight, CheckSquare, Clock, Type, Target, Activity, Dumbbell, Footprints, Utensils, Brain, ChevronDown, GripVertical, Bell, Laptop, BookOpen, Archive, RotateCcw
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
  { id: 'Rozwój', label: '🧠 Rozwój', color: 'bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold border-sky-500/50' },
  { id: 'Praca', label: '💼 Praca', color: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold border-indigo-500/50' },
  { id: 'Dom', label: '🏠 Dom', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border-amber-500/50' },
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

const appliesToDate = (habit, targetDateStr) => {
  if (targetDateStr < habit.createdAt) return false;
  if (habit.repeat === 'daily') return true;
  if (habit.repeat === 'custom') {
    return habit.customDates && habit.customDates.includes(targetDateStr);
  }
  if (habit.repeat === 'interval') {
    const start = parseLocalDate(habit.createdAt);
    const target = parseLocalDate(targetDateStr);
    start.setHours(0,0,0,0);
    target.setHours(0,0,0,0);
    const diffTime = Math.abs(target - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays % (habit.intervalDays || 2) === 0;
  }
  return false;
};

const isTaskDone = (t) => Boolean(t.isCompleted || (t.completedDates && Object.values(t.completedDates).some(v => v)));
const getTaskCompletedDate = (t) => t.completedAt || (t.completedDates ? Object.keys(t.completedDates).find(k => t.completedDates[k]) : null);

export default function App() {
  const [resetTime, setResetTime] = useState(() => localStorage.getItem('discipline_reset_time') || '00:00');
  const [todayStr, setTodayStr] = useState(() => getAppDayString());

  useEffect(() => {
    const interval = setInterval(() => {
      const currentAppDay = getAppDayString(resetTime);
      if (currentAppDay !== todayStr) {
        setTodayStr(currentAppDay);
      }
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
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [newCatLabel, setNewCatLabel] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const [blockOrder, setBlockOrder] = useState(() => {
    const saved = localStorage.getItem('discipline_block_order');
    return saved ? JSON.parse(saved) : ['habits', 'tasks', 'workouts'];
  });

  const [isLayoutEditing, setIsLayoutEditing] = useState(false);
  const pressTimer = useRef(null);

  const startLongPress = () => {
    pressTimer.current = setTimeout(() => {
      setIsLayoutEditing(true);
      if (navigator.vibrate) navigator.vibrate(60);
    }, 500);
  };
  const cancelLongPress = () => clearTimeout(pressTimer.current);

  const moveBlock = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blockOrder.length) return;
    const updated = [...blockOrder];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setBlockOrder(updated);
    localStorage.setItem('discipline_block_order', JSON.stringify(updated));
  };

  const [collapsedSections, setCollapsedSections] = useState(() => {
    const saved = localStorage.getItem('discipline_collapsed_sections');
    return saved ? JSON.parse(saved) : { tasks: false, workouts: false, habits: false };
  });

  const toggleSection = (sectionKey) => {
    setCollapsedSections(prev => {
      const updated = { ...prev, [sectionKey]: !prev[sectionKey] };
      localStorage.setItem('discipline_collapsed_sections', JSON.stringify(updated));
      return updated;
    });
  };

  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('discipline_habits_v2');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: 'Trening fizyczny', category: 'Zdrowie', pkt: 35, difficulty: 'hard', repeat: 'daily', duration: 30, hasReminder: false, reminderTime: '08:00', createdAt: getAppDayString(), intervalDays: 1, customDates: [] },
      { id: 2, name: 'Brak słodyczy', category: 'Zdrowie', pkt: 20, difficulty: 'medium', repeat: 'daily', duration: 0, hasReminder: false, reminderTime: '08:00', createdAt: getAppDayString(), intervalDays: 1, customDates: [] },
      { id: 3, name: 'Nauka programowania', category: 'Rozwój', pkt: 25, difficulty: 'medium', repeat: 'daily', duration: 45, hasReminder: false, reminderTime: '08:00', createdAt: getAppDayString(), intervalDays: 1, customDates: [] }
    ];
  });

  const [habitLogs, setHabitLogs] = useState(() => {
    const saved = localStorage.getItem('discipline_habit_logs_v2');
    return saved ? JSON.parse(saved) : {};
  });

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('discipline_tasks');
    if (savedTasks) return JSON.parse(savedTasks);
    return [];
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
      { id: 302, title: 'Wiedźmin: Ostatnie Życzenie', category: 'umysl', type: 'read_book', target: 332, currentPage: 120, dueDate: getAppDayString(), comment: '', isDaily: false }
    ];
  });

  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('discipline_notes');
    return savedNotes ? JSON.parse(savedNotes) : {};
  });

  const [selectedMonthDate, setSelectedMonthDate] = useState(() => new Date());
  const [habitPickerDate, setHabitPickerDate] = useState(() => new Date());

  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Zdrowie');
  const [newHabitRepeat, setNewHabitRepeat] = useState('daily');
  const [newHabitIntervalDays, setNewHabitIntervalDays] = useState('2');
  const [newHabitCustomDates, setNewHabitCustomDates] = useState([]);
  const [newHabitDuration, setNewHabitDuration] = useState('');
  const [newHabitDifficulty, setNewHabitDifficulty] = useState('medium');
  const [newHabitHasReminder, setNewHabitHasReminder] = useState(false);
  const [newHabitReminderTime, setNewHabitReminderTime] = useState('08:00');
    
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(() => getAppDayString());
  const [newTaskDifficulty, setNewTaskDifficulty] = useState('medium');

  const [newWorkoutType, setNewWorkoutType] = useState('run');
  const [newWorkoutAmount, setNewWorkoutAmount] = useState('');

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('sport');
  const [newGoalType, setNewGoalType] = useState('steps');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCurrentPage, setNewGoalCurrentPage] = useState('0');
  const [newGoalDueDate, setNewGoalDueDate] = useState(() => getAppDayString());
  const [newGoalComment, setNewGoalComment] = useState('');
  const [newGoalIsDaily, setNewGoalIsDaily] = useState(false);

  const [activityGoalId, setActivityGoalId] = useState('');
  const [activityPages, setActivityPages] = useState('');

  const [editingHabit, setEditingHabit] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);

  const [confirmDeleteModal, setConfirmDeleteModal] = useState(null);
  const [confirmCompleteModal, setConfirmCompleteModal] = useState(null);

  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showAllQuotesModal, setShowAllQuotesModal] = useState(false);
  const [showDeleteNoteConfirm, setShowDeleteNoteConfirm] = useState(false);
    
  const [selectedDate, setSelectedDate] = useState(() => getAppDayString());

  const [lastCheckedLevel, setLastCheckedLevel] = useState(() => {
    const saved = localStorage.getItem('discipline_last_checked_level');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [levelUpModalData, setLevelUpModalData] = useState(null);

  const allTodayHabits = habits
    .filter(h => appliesToDate(h, todayStr))
    .map(h => {
      const log = habitLogs[todayStr]?.[h.id] || { completed: false, timeLeft: h.duration * 60, isRunning: false };
      return { ...h, ...log };
    });

  const todayHabits = allTodayHabits.filter(h => !h.completed);
  const completedHabitsCount = allTodayHabits.filter(h => h.completed).length;
  const progressPercent = allTodayHabits.length > 0 ? Math.round((completedHabitsCount / allTodayHabits.length) * 100) : 0;

  const todayWorkouts = workouts.filter(w => w.date === todayStr);
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

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
        
      habits.forEach(h => {
        if (h.hasReminder && h.reminderTime === currentTimeStr && appliesToDate(h, todayStr)) {
          const log = habitLogs[todayStr]?.[h.id] || {};
          if (!log.completed && log.lastNotifiedDate !== todayStr && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Przypomnienie o nawyku! ⚡', { body: `Czas na wykonanie: "${h.name}"` });
            setHabitLogs(prev => ({
              ...prev,
              [todayStr]: {
                ...(prev[todayStr] || {}),
                [h.id]: { ...log, lastNotifiedDate: todayStr }
              }
            }));
          }
        }
      });
    }, 30000);
    return () => clearInterval(reminderInterval);
  }, [habits, habitLogs, todayStr]);

  useEffect(() => localStorage.setItem('discipline_habits_v2', JSON.stringify(habits)), [habits]);
  useEffect(() => localStorage.setItem('discipline_habit_logs_v2', JSON.stringify(habitLogs)), [habitLogs]);
  useEffect(() => localStorage.setItem('discipline_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('discipline_workouts', JSON.stringify(workouts)), [workouts]);
  useEffect(() => localStorage.setItem('discipline_goals', JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem('discipline_notes', JSON.stringify(notes)), [notes]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHabitLogs((prev) => {
        const todayLogsObj = prev[todayStr] || {};
        let updated = false;
        const newTodayLogs = { ...todayLogsObj };

        Object.keys(newTodayLogs).forEach(id => {
          const log = newTodayLogs[id];
          if (log.isRunning && log.timeLeft > 0) {
            updated = true;
            const newTime = log.timeLeft - 1;
            newTodayLogs[id] = {
              ...log,
              timeLeft: newTime,
              completed: newTime === 0 ? true : log.completed,
              isRunning: newTime === 0 ? false : log.isRunning
            };
          }
        });

        if (!updated) return prev;
        return { ...prev, [todayStr]: newTodayLogs };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [todayStr]);

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

  const checkStreakBonus = (habitId, targetDate) => {
    const d = parseLocalDate(targetDate);
    const d1 = new Date(d); d1.setDate(d.getDate() - 1);
    const d2 = new Date(d); d2.setDate(d.getDate() - 2);
    const str1 = formatDateStr(d1);
    const str2 = formatDateStr(d2);
    const done1 = habitLogs[str1]?.[habitId]?.completed;
    const done2 = habitLogs[str2]?.[habitId]?.completed;
    return done1 && done2;
  };

  const toggleHabit = (id) => {
    setHabitLogs(prev => {
      const dayLogs = prev[todayStr] || {};
      const habit = habits.find(h => h.id === id);
      const currentLog = dayLogs[id] || { completed: false, isRunning: false, timeLeft: habit?.duration * 60 || 0 };
      return {
        ...prev,
        [todayStr]: {
          ...dayLogs,
          [id]: { ...currentLog, completed: !currentLog.completed, isRunning: false }
        }
      };
    });
  };

  const toggleTimer = (id, e) => {
    e.stopPropagation();
    setHabitLogs(prev => {
      const dayLogs = prev[todayStr] || {};
      const habit = habits.find(h => h.id === id);
      const currentLog = dayLogs[id] || { completed: false, isRunning: false, timeLeft: habit?.duration * 60 || 0 };
      return {
        ...prev,
        [todayStr]: {
          ...dayLogs,
          [id]: { ...currentLog, isRunning: !currentLog.isRunning }
        }
      };
    });
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const currentlyDone = isTaskDone(t);
        return { 
          ...t, 
          isCompleted: !currentlyDone, 
          completedAt: !currentlyDone ? todayStr : null
        };
      }
      return t;
    }));
  };

  const executeDelete = () => {
    if (!confirmDeleteModal) return;
    const { type, id } = confirmDeleteModal;

    if (type === 'habit') setHabits(habits.filter(h => h.id !== id));
    else if (type === 'task') setTasks(tasks.filter(t => t.id !== id));
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
    const { type, id } = confirmCompleteModal;

    if (type === 'habit') {
      toggleHabit(id);
    } else if (type === 'task') {
      toggleTask(id);
    }
    setConfirmCompleteModal(null);
  };

  const restoreArchivedItem = (type, item) => {
    if (type === 'habit') {
      setHabitLogs(prev => {
        const dayLogs = prev[item.date] || {};
        const currentLog = dayLogs[item.id] || { completed: true };
        return {
          ...prev,
          [item.date]: {
            ...dayLogs,
            [item.id]: { ...currentLog, completed: false }
          }
        };
      });
    } else if (type === 'task') {
      setTasks(tasks.map(t => {
        if (t.id === item.id) {
          return { ...t, isCompleted: false, completedAt: null };
        }
        return t;
      }));
    } else if (type === 'goal') {
      setGoals(goals.map(g => {
        if (g.id === item.id) {
          if (g.type === 'read_book' || g.type === 'study' || g.type === 'no_sweets') {
            return { ...g, currentPage: Math.max(0, g.target - 1) };
          } else {
            return { ...g, target: g.target + 1 };
          }
        }
        return g;
      }));
    }
  };

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const durationMin = parseInt(newHabitDuration) || 0;
    let basePkt = newHabitDifficulty === 'easy' ? 10 : newHabitDifficulty === 'hard' ? 35 : 20;
    const finalPkt = durationMin > 0 ? Math.max(basePkt, Math.min(50, durationMin)) : basePkt;

    const newHabit = {
      id: Date.now(),
      name: newHabitName,
      category: newHabitCategory,
      pkt: finalPkt,
      difficulty: newHabitDifficulty,
      repeat: newHabitRepeat,
      intervalDays: newHabitRepeat === 'interval' ? parseInt(newHabitIntervalDays) || 2 : 1,
      customDates: newHabitRepeat === 'custom' ? newHabitCustomDates : [],
      duration: durationMin,
      hasReminder: newHabitHasReminder,
      reminderTime: newHabitReminderTime,
      createdAt: todayStr
    };

    setHabits([...habits, newHabit]);

    setNewHabitName('');
    setNewHabitCategory(categories[0]?.id || 'Ogólne');
    setNewHabitDuration('');
    setNewHabitDifficulty('medium');
    setNewHabitRepeat('daily');
    setNewHabitCustomDates([]);
    setNewHabitHasReminder(false);
    setNewHabitReminderTime('08:00');
    setShowAddHabitModal(false);
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    let basePkt = newTaskDifficulty === 'easy' ? 10 : newTaskDifficulty === 'hard' ? 35 : 20;
    setTasks([...tasks, { id: Date.now(), title: newTaskTitle, dueDate: newTaskDueDate, difficulty: newTaskDifficulty, isCompleted: false, completedAt: null, pkt: basePkt }]);
    setNewTaskTitle('');
    setNewTaskDueDate(todayStr);
    setNewTaskDifficulty('medium');
    setShowAddTaskModal(false);
  };

  const addWorkout = (e) => {
    e.preventDefault();
    const amountVal = parseFloat(newWorkoutAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;
    let calculatedPkt = 20; let unit = 'km';
    if (newWorkoutType === 'run') { calculatedPkt = Math.round(amountVal * 10); unit = 'km'; }
    else if (newWorkoutType === 'pushups') { calculatedPkt = Math.round((amountVal / 10) * 2); unit = 'powt.'; }
    else if (newWorkoutType === 'pullups') { calculatedPkt = Math.round((amountVal / 5) * 2); unit = 'powt.'; }
    else if (newWorkoutType === 'squats') { calculatedPkt = Math.round((amountVal / 20) * 2); unit = 'powt.'; }
    else if (newWorkoutType === 'situps') { calculatedPkt = Math.round((amountVal / 15) * 2); unit = 'powt.'; }
    else if (newWorkoutType === 'bike') { calculatedPkt = Math.round(amountVal * 5); unit = 'km'; }
    else if (newWorkoutType === 'gym') { calculatedPkt = Math.round(amountVal * 3); unit = 'min'; }
    else if (newWorkoutType === 'steps') { calculatedPkt = Math.round(amountVal / 1000 * 5); unit = 'kroków'; }
    else if (newWorkoutType === 'study') { calculatedPkt = Math.round(amountVal * 10); unit = 'godz.'; }
    else if (newWorkoutType === 'no_sweets') { calculatedPkt = 20; unit = 'dni'; }
      
    setWorkouts([{ id: Date.now(), date: todayStr, type: newWorkoutType, amount: amountVal, unit, pkt: calculatedPkt }, ...workouts]);
    setNewWorkoutAmount('');
    setShowAddWorkoutModal(false);
    setIsFabOpen(false);
  };

  const addGoal = (e) => {
    e.preventDefault();
    const targetVal = parseFloat(newGoalTarget);
    if (!newGoalTitle.trim() || isNaN(targetVal) || targetVal <= 0) return;

    const currentPg = (newGoalType === 'read_book' || newGoalType === 'study' || newGoalType === 'no_sweets') ? (parseInt(newGoalCurrentPage) || 0) : 0;

    setGoals([...goals, { 
      id: Date.now(), 
      title: newGoalTitle.trim(), 
      category: newGoalCategory, 
      type: newGoalType, 
      target: targetVal, 
      currentPage: currentPg,
      dueDate: newGoalIsDaily ? null : newGoalDueDate, 
      isDaily: newGoalIsDaily,
      comment: newGoalComment.trim() 
    }]);

    setNewGoalTitle(''); 
    setNewGoalTarget(''); 
    setNewGoalCurrentPage('0');
    setNewGoalDueDate(todayStr); 
    setNewGoalComment('');
    setNewGoalIsDaily(false);
    setShowAddGoalModal(false);
  };

  const addActivity = (e) => {
    e.preventDefault();
    const val = parseFloat(activityPages);
    if (!activityGoalId || isNaN(val) || val <= 0) return;

    const goal = goals.find(g => g.id.toString() === activityGoalId.toString());
    if (!goal) return;

    const newCurrent = Math.min(goal.target, (goal.currentPage || 0) + val);
      
    setGoals(goals.map(g => g.id === goal.id ? { ...g, currentPage: newCurrent } : g));

    let unitLabel = 'stron';
    if (goal.type === 'study') unitLabel = 'godz.';
    else if (goal.type === 'no_sweets') unitLabel = 'dni';

    const newWorkout = {
      id: Date.now(),
      goalId: goal.id, 
      date: todayStr,
      type: goal.type,
      amount: val,
      unit: unitLabel,
      pkt: goal.type === 'study' ? Math.round(val * 10) : goal.type === 'no_sweets' ? Math.round(val * 20) : val
    };
    setWorkouts([newWorkout, ...workouts]);

    setActivityGoalId('');
    setActivityPages('');
    setShowAddActivityModal(false);
    setIsFabOpen(false);
  };

  const saveEditedGoal = (e) => {
    e.preventDefault();
    if (!editingGoal || !editingGoal.title.trim()) return;
    setGoals(goals.map(g => g.id === editingGoal.id ? editingGoal : g));
    setEditingGoal(null);
  };

  const saveEditedTask = (e) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;
    let basePkt = editingTask.difficulty === 'easy' ? 10 : editingTask.difficulty === 'hard' ? 35 : 20;
    setTasks(tasks.map(t => t.id === editingTask.id ? { ...editingTask, pkt: basePkt } : t));
    setEditingTask(null);
  };

  const saveEditedHabit = (e) => {
    e.preventDefault();
    if (!editingHabit || !editingHabit.name.trim()) return;
    const durationMin = parseInt(editingHabit.duration) || 0;
    let basePkt = editingHabit.difficulty === 'easy' ? 10 : editingHabit.difficulty === 'hard' ? 35 : 20;
    const finalPkt = durationMin > 0 ? Math.max(basePkt, Math.min(50, durationMin)) : basePkt;

    setHabits(habits.map(h => {
      if (h.id === editingHabit.id) {
        return { ...editingHabit, duration: durationMin, pkt: finalPkt };
      }
      return h;
    }));
    setEditingHabit(null);
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

  const calculateTotalPKTWithPenalties = () => {
    const allDatesSet = new Set();
    Object.keys(habitLogs).forEach(d => allDatesSet.add(d));
    tasks.forEach(t => { 
      const cDate = getTaskCompletedDate(t);
      if (cDate) allDatesSet.add(cDate);
      if (t.dueDate) allDatesSet.add(t.dueDate); 
    });
    workouts.forEach(w => { if (w.date) allDatesSet.add(w.date); });
    allDatesSet.add(todayStr);

    const sortedDates = Array.from(allDatesSet).sort();
    if (sortedDates.length === 0) return 0;

    const startDate = parseLocalDate(sortedDates[0]);
    const endDate = parseLocalDate(todayStr);

    let rawPkt = 0;
    Object.entries(habitLogs).forEach(([dateStr, logs]) => {
      Object.entries(logs).forEach(([hId, log]) => {
        if (log.completed) {
          const habit = habits.find(h => h.id.toString() === hId.toString());
          if (habit) {
            let base = habit.pkt || 20;
            const hasBonus = checkStreakBonus(habit.id, dateStr);
            rawPkt += base + (hasBonus ? 10 : 0);
          }
        }
      });
    });

    tasks.forEach(t => { 
      if (isTaskDone(t)) {
        rawPkt += (t.pkt || 20);
      }
    });

    workouts.forEach(w => { rawPkt += (w.pkt || 0); });

    goals.forEach(goal => {
      const isProgressType = goal.type === 'read_book' || goal.type === 'study' || goal.type === 'no_sweets';
      
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
      const hasHabit = Object.values(habitLogs[dStr] || {}).some(l => l.completed);
      const hasTask = tasks.some(t => getTaskCompletedDate(t) === dStr);
      const hasWorkout = workouts.some(w => w.date === dStr);
        
      if (hasHabit || hasTask || hasWorkout) {
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

  const activeTasks = sortedTasks.filter(task => !isTaskDone(task));
  const completedActiveTasksCount = sortedTasks.filter(t => isTaskDone(t)).length;
  const todayTasksForProgress = sortedTasks.filter(t => t.dueDate === todayStr);
  const completedTodayTasksCount = todayTasksForProgress.filter(t => isTaskDone(t)).length;
  const todayTasksProgressPercent = todayTasksForProgress.length > 0 ? Math.round((completedTodayTasksCount / todayTasksForProgress.length) * 100) : 0;

  const earnedPKTToday = allTodayHabits.reduce((acc, h) => {
    if (!h.completed) return acc;
    return acc + (h.pkt || 20) + (checkStreakBonus(h.id, todayStr) ? 10 : 0);
  }, 0) +
    tasks.reduce((acc, t) => acc + (getTaskCompletedDate(t) === todayStr ? (t.pkt || 20) : 0), 0) +
    todayWorkouts.reduce((acc, w) => acc + (w.pkt || 0), 0);

  const prevMonth = () => setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const getCategoryStatsForMonth = () => {
    const stats = {};
    const year = selectedMonthDate.getFullYear();
    const month = selectedMonthDate.getMonth();
      
    Object.entries(habitLogs).forEach(([dateStr, logs]) => {
      const d = parseLocalDate(dateStr);
      if (d.getFullYear() === year && d.getMonth() === month) {
        Object.entries(logs).forEach(([hId, log]) => {
          if (log.completed) {
            const habit = habits.find(h => h.id.toString() === hId.toString());
            if (habit) {
              const cat = habit.category || 'Ogólne';
              stats[cat] = (stats[cat] || 0) + 1;
            }
          }
        });
      }
    });

    const totalDone = Object.values(stats).reduce((a, b) => a + b, 0);
    return { stats, totalDone };
  };

  const { stats: monthCategoryStats, totalDone: monthTotalDoneHabits } = getCategoryStatsForMonth();

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
        habitsBg: 'bg-emerald-50 border-emerald-100 text-black shadow-sm',
        tasksBg: 'bg-sky-50 border-sky-100 text-black shadow-sm',
        workoutsBg: 'bg-amber-50 border-amber-100 text-black shadow-sm',
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
        habitsBg: 'bg-zinc-900/90 border-emerald-500/30 text-zinc-100 shadow-xl',
        tasksBg: 'bg-zinc-900/90 border-sky-500/30 text-zinc-100 shadow-xl',
        workoutsBg: 'bg-zinc-900/90 border-amber-500/30 text-zinc-100 shadow-xl',
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
      habitsBg: 'bg-emerald-900/20 border-emerald-700/30 text-slate-100 shadow-lg',
      tasksBg: 'bg-sky-900/20 border-sky-700/30 text-slate-100 shadow-lg',
      workoutsBg: 'bg-amber-900/20 border-amber-700/30 text-slate-100 shadow-lg',
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
        
      let dayHabitsPKT = 0;
      if (habitLogs[dateStr]) {
        Object.entries(habitLogs[dateStr]).forEach(([hId, log]) => {
          if (log.completed) {
            const habit = habits.find(h => h.id.toString() === hId.toString());
            if (habit) dayHabitsPKT += (habit.pkt || 20) + (checkStreakBonus(habit.id, dateStr) ? 10 : 0);
          }
        });
      }

      const dayTasksPKT = tasks.reduce((acc, t) => acc + (getTaskCompletedDate(t) === dateStr ? (t.pkt || 20) : 0), 0);
      const dayWorkoutsPKT = workouts.filter(w => w.date === dateStr).reduce((acc, w) => acc + (w.pkt || 0), 0);
        
      const dayPKT = dayHabitsPKT + dayTasksPKT + dayWorkoutsPKT;
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
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
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
          <h3 className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{now.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}</h3>
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
            if (dateStr < todayStr) dayColorClass = 'bg-slate-500/15 text-slate-500 border border-slate-500/20';
            else if (dateStr === todayStr) dayColorClass = 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/50 font-bold';
            else dayColorClass = 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30';
            const hasNote = Boolean(notes[dateStr]);
            return (
              <button key={dateStr} onClick={() => setSelectedDate(dateStr)} className={'h-10 md:h-12 rounded-xl flex items-center justify-center ' + currentFontConfig.sizeClass + ' transition-all relative ' + dayColorClass + ' ' + (isSelected ? 'ring-2 ring-amber-500 scale-105 z-10' : '')}>
                {dayNum}{hasNote && <span className="w-2 h-2 rounded-full bg-amber-500 absolute bottom-1.5" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const selectedDayHabits = habits
    .filter(h => appliesToDate(h, selectedDate))
    .map(h => ({ ...h, ...(habitLogs[selectedDate]?.[h.id] || { completed: false }) }));

  const selectedDayTasks = tasks.filter(t => t.dueDate === selectedDate || getTaskCompletedDate(t) === selectedDate);
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

  const renderBlock = (blockKey, blockIndex) => {
    const blockHeaderProps = {
      onTouchStart: startLongPress, onTouchEnd: cancelLongPress, onMouseDown: startLongPress, onMouseUp: cancelLongPress, onMouseLeave: cancelLongPress
    };

    const handleHeaderClick = (e, section) => {
      if (isLayoutEditing) return;
      toggleSection(section);
    };

    if (blockKey === 'habits') {
      return (
        <div key="habits" className={'p-4 md:p-5 rounded-3xl border shadow-sm transition-all ' + tStyle.habitsBg + (isLayoutEditing ? ' ring-2 ring-amber-500 animate-pulse' : '')}>
          <div 
            {...blockHeaderProps} 
            onClick={(e) => handleHeaderClick(e, 'habits')}
            className={`flex justify-between items-center select-none pb-2 ${isLayoutEditing ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-2 flex-1">
              <GripVertical className={`w-4 h-4 shrink-0 transition-opacity ${isLayoutEditing ? 'text-amber-500 opacity-100' : 'text-slate-400 opacity-50'}`} />
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 shrink-0" />
              <h2 className={currentFontConfig.smallClass + ' md:text-sm font-semibold uppercase tracking-wider ' + tStyle.titleText}>Nawyki na dziś</h2>
              <span className={currentFontConfig.smallClass + ' ml-1 ' + tStyle.subText}>({completedHabitsCount}/{allTodayHabits.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {isLayoutEditing && (
                <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-xl border border-amber-500/40" onClick={e => e.stopPropagation()}>
                  <button onClick={() => moveBlock(blockIndex, 'up')} disabled={blockIndex === 0} className="text-amber-500 hover:text-amber-700 disabled:opacity-20 text-xs px-1 font-bold">▲</button>
                  <button onClick={() => moveBlock(blockIndex, 'down')} disabled={blockIndex === blockOrder.length - 1} className="text-amber-500 hover:text-amber-700 disabled:opacity-20 text-xs px-1 font-bold">▼</button>
                </div>
              )}
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 shrink-0 ${tStyle.subText} ${collapsedSections.habits ? '-rotate-90' : ''}`} />
            </div>
          </div>

          {!collapsedSections.habits && (
            <div className="mt-4 pt-3 border-t border-slate-500/25 space-y-3 animate-fadeIn">
              <div className="space-y-3">
                {todayHabits.length > 0 ? (
                  todayHabits.map((habit) => {
                    const hasStreakBonus = checkStreakBonus(habit.id, todayStr);
                    const catStyle = getCategoryStyle(habit.category);

                    return (
                      <div key={habit.id} onClick={() => setConfirmCompleteModal({ type: 'habit', id: habit.id, name: habit.name })} className={'flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer shadow-sm bg-emerald-500/10 border-emerald-500/25'}>
                        <div className="flex items-center gap-3">
                          <Circle className="w-6 h-6 text-slate-400 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={'font-medium block ' + tStyle.titleText}>{habit.name}</span>
                              <span className={currentFontConfig.smallClass + ' px-2.5 py-0.5 rounded-full border ' + catStyle}>{habit.category || 'Ogólne'}</span>
                              {habit.hasReminder && (
                                <span className="bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Bell className="w-3 h-3" /> {habit.reminderTime}
                                </span>
                              )}
                              {hasStreakBonus && (
                                <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Flame className="w-3 h-3 fill-amber-500" /> +10 Bonifikata
                                </span>
                              )}
                            </div>
                            <span className={currentFontConfig.smallClass + ' ' + tStyle.subText}>
                              {habit.repeat === 'daily' ? 'Codziennie' : habit.repeat === 'interval' ? 'Co ' + habit.intervalDays + ' dni' : 'Niestandardowe dni'} 
                              {habit.duration > 0 ? ' • ' + habit.duration + ' min' : ''} • +{habit.pkt || 20} PKT
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          {habit.duration > 0 && (
                            <button onClick={(e) => toggleTimer(habit.id, e)} className={'px-3 py-1.5 rounded-xl ' + currentFontConfig.smallClass + ' font-mono font-semibold flex items-center gap-1.5 transition-colors border shadow-sm ' + (habit.isRunning ? 'bg-amber-500 text-slate-950 border-amber-600 animate-pulse' : tStyle.modalBtnBg)}>
                              {habit.isRunning ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5" />}
                              <span>{formatTime(habit.timeLeft)}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={'p-4 text-center rounded-2xl border ' + currentFontConfig.smallClass + ' ' + tStyle.subText}>
                    Wszystkie dzisiejsze nawyki zostały zrealizowane! 🚀
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (blockKey === 'tasks') {
      return (
        <div key="tasks" className={'p-4 md:p-5 rounded-3xl border shadow-sm transition-all ' + tStyle.tasksBg + (isLayoutEditing ? ' ring-2 ring-amber-500 animate-pulse' : '')}>
          <div 
            {...blockHeaderProps} 
            onClick={(e) => handleHeaderClick(e, 'tasks')}
            className={`flex justify-between items-center select-none pb-2 ${isLayoutEditing ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-2 flex-1">
              <GripVertical className={`w-4 h-4 shrink-0 transition-opacity ${isLayoutEditing ? 'text-amber-500 opacity-100' : 'text-slate-400 opacity-50'}`} />
              <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-sky-500 shrink-0" />
              <h2 className={currentFontConfig.smallClass + ' md:text-sm font-semibold uppercase tracking-wider ' + tStyle.titleText}>Zadania z term. i jednorazowe</h2>
              <span className={currentFontConfig.smallClass + ' ml-1 ' + tStyle.subText}>({completedActiveTasksCount}/{sortedTasks.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {isLayoutEditing && (
                <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-xl border border-amber-500/40" onClick={e => e.stopPropagation()}>
                  <button onClick={() => moveBlock(blockIndex, 'up')} disabled={blockIndex === 0} className="text-amber-500 hover:text-amber-700 disabled:opacity-20 text-xs px-1 font-bold">▲</button>
                  <button onClick={() => moveBlock(blockIndex, 'down')} disabled={blockIndex === blockOrder.length - 1} className="text-amber-500 hover:text-amber-700 disabled:opacity-20 text-xs px-1 font-bold">▼</button>
                </div>
              )}
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 shrink-0 ${tStyle.subText} ${collapsedSections.tasks ? '-rotate-90' : ''}`} />
            </div>
          </div>
            
          {!collapsedSections.tasks && (
            <div className="mt-4 pt-3 border-t border-slate-500/20 space-y-3 animate-fadeIn">
              {todayTasksForProgress.length > 0 && (
                <div className="p-3.5 rounded-2xl border mb-3 flex flex-col gap-2 bg-slate-500/5">
                  <div className="flex justify-between items-center">
                    <span className={'font-medium ' + currentFontConfig.smallClass + ' ' + tStyle.subText}>Postęp zadań z terminem na dziś:</span>
                    <span className={'font-mono text-sky-600 dark:text-sky-400 font-bold ' + currentFontConfig.smallClass}>{todayTasksProgressPercent}% ({completedTodayTasksCount}/{todayTasksForProgress.length})</span>
                  </div>
                  <div className="w-full bg-slate-500/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: todayTasksProgressPercent + '%' }} />
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {activeTasks.length > 0 ? (
                  activeTasks.map((task) => {
                    const isOverdue = task.dueDate < todayStr;
                    return (
                      <div key={task.id} onClick={() => setConfirmCompleteModal({ type: 'task', id: task.id, name: task.title })} className={'flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer shadow-sm bg-sky-500/10 border-sky-500/25'}>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded border border-slate-400 shrink-0" />
                          <div>
                            <span className={'font-medium block ' + tStyle.titleText}>{task.title}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className={currentFontConfig.smallClass + ' font-mono ' + (isOverdue ? 'text-red-500 font-bold' : tStyle.subText)}>Termin: {task.dueDate} {isOverdue && '(przekroczony!)'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={'p-4 text-center rounded-2xl border ' + currentFontConfig.smallClass + ' ' + tStyle.subText}>Wszystkie zadania zostały zrealizowane! 🎉</div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (blockKey === 'workouts') {
      return (
        <div key="workouts" className={'p-4 md:p-5 rounded-3xl border shadow-sm transition-all ' + tStyle.workoutsBg + (isLayoutEditing ? ' ring-2 ring-amber-500 animate-pulse' : '')}>
          <div 
            {...blockHeaderProps} 
            onClick={(e) => handleHeaderClick(e, 'workouts')}
            className={`flex justify-between items-center select-none pb-2 ${isLayoutEditing ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-2 flex-1">
              <GripVertical className={`w-4 h-4 shrink-0 transition-opacity ${isLayoutEditing ? 'text-amber-500 opacity-100' : 'text-slate-400 opacity-50'}`} />
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-amber-500 shrink-0" />
              <h2 className={currentFontConfig.smallClass + ' md:text-sm font-semibold uppercase tracking-wider ' + tStyle.titleText}>Dzisiejsze treningi i aktywności</h2>
              <span className={currentFontConfig.smallClass + ' ml-1 ' + tStyle.subText}>({todayWorkouts.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {isLayoutEditing && (
                <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-xl border border-amber-500/40" onClick={e => e.stopPropagation()}>
                  <button onClick={() => moveBlock(blockIndex, 'up')} disabled={blockIndex === 0} className="text-amber-500 hover:text-amber-700 disabled:opacity-20 text-xs px-1 font-bold">▲</button>
                  <button onClick={() => moveBlock(blockIndex, 'down')} disabled={blockIndex === blockOrder.length - 1} className="text-amber-500 hover:text-amber-700 disabled:opacity-20 text-xs px-1 font-bold">▼</button>
                </div>
              )}
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 shrink-0 ${tStyle.subText} ${collapsedSections.workouts ? '-rotate-90' : ''}`} />
            </div>
          </div>
            
          {!collapsedSections.workouts && (
            <div className="mt-4 pt-3 border-t border-slate-500/20 space-y-3 animate-fadeIn">
              <div className="space-y-3">
                {todayWorkouts.length > 0 ? (
                  todayWorkouts.map((w) => {
                    let typeName = w.type === 'run' ? 'Bieg' : w.type === 'pushups' ? 'Pompki' : w.type === 'pullups' ? 'Drążek' : w.type === 'squats' ? 'Przysiady' : w.type === 'situps' ? 'Brzuszki' : w.type === 'bike' ? 'Rower' : w.type === 'gym' ? 'Siłownia' : w.type === 'walk_km' ? 'Spacer' : w.type === 'steps' ? 'Kroki' : w.type === 'study' ? 'Nauka' : w.type === 'read_book' ? 'Książka' : w.type === 'no_sweets' ? 'Dni bez słodyczy' : 'Spacer (czas)';
                    const workoutName = `${typeName}: ${w.amount} ${w.unit}`;
                    return (
                      <div key={w.id} className={'flex items-center justify-between p-3.5 rounded-2xl border bg-slate-500/5 border-slate-500/20'}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/25 border border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            {w.type === 'run' || w.type === 'walk_km' ? <Footprints className="w-4 h-4" /> : w.type === 'pushups' || w.type === 'pullups' || w.type === 'squats' || w.type === 'situps' ? <Dumbbell className="w-4 h-4" /> : w.type === 'read_book' || w.type === 'study' ? <BookOpen className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className={'font-bold block ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{workoutName}</span>
                            <span className={currentFontConfig.smallClass + ' text-amber-600 dark:text-amber-400 font-bold'}>+{w.pkt} PKT</span>
                          </div>
                        </div>
                        <button onClick={() => setConfirmDeleteModal({ type: 'workout', id: w.id, name: workoutName })} className={'hover:text-red-500 p-2 transition-colors ' + tStyle.subText}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    );
                  })
                ) : (
                  <div className={'p-4 text-center rounded-2xl border ' + currentFontConfig.smallClass + ' ' + tStyle.subText}>Brak dzisiejszych aktywności. Użyj przycisku +, aby dodać.</div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const archivedHabits = [];
  Object.entries(habitLogs).forEach(([dateStr, logs]) => {
    Object.entries(logs).forEach(([hId, log]) => {
      if (log.completed) {
        const h = habits.find(item => item.id.toString() === hId.toString());
        archivedHabits.push({ date: dateStr, name: h ? h.name : 'Usunięty nawyk', id: hId });
      }
    });
  });

  const archivedTasks = tasks.filter(t => isTaskDone(t));
  const archivedGoals = goals.filter(goal => {
    if (goal.isDaily) return false;
    const isProgressType = goal.type === 'read_book' || goal.type === 'study' || goal.type === 'no_sweets';
    const currentVal = isProgressType ? (goal.currentPage || 0) : workouts.filter(w => w.type === goal.type).reduce((acc, w) => acc + w.amount, 0);
    const percent = Math.min(100, Math.round((currentVal / goal.target) * 100));
    return percent >= 100;
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
                <span className={currentFontConfig.smallClass + ' md:text-sm font-medium'}>Postęp nawyków</span>
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

          {isLayoutEditing && (
            <div className="bg-amber-500/20 border border-amber-500/50 p-4 rounded-3xl mb-6 flex justify-between items-center shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛠️</span>
                <div>
                  <h4 className={'font-bold text-amber-700 dark:text-amber-400 ' + currentFontConfig.smallClass}>Tryb edycji układu aktywny</h4>
                  <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>Użyj strzałek przy nagłówkach, aby zmienić kolejność.</p>
                </div>
              </div>
              <button onClick={() => setIsLayoutEditing(false)} className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl font-bold transition-transform active:scale-95 shadow-md text-xs">Gotowe</button>
            </div>
          )}

          <div className="space-y-6">
            {blockOrder.map((blockKey, index) => renderBlock(blockKey, index))}
          </div>

          <div className="fixed bottom-24 right-6 md:right-12 flex flex-col items-end gap-3 z-40">
            {isFabOpen && (
              <div className="flex flex-col items-end gap-3 animate-fadeIn">
                <button onClick={() => { setShowAddActivityModal(true); setIsFabOpen(false); }} className={'bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl shadow-xl font-bold ' + currentFontConfig.smallClass + ' flex items-center gap-2.5 transition-transform active:scale-95'}><BookOpen className="w-4 h-4" /> Zarejestruj postęp (Umysł / Jedzenie)</button>
                <button onClick={() => { setShowAddWorkoutModal(true); setIsFabOpen(false); }} className={'bg-amber-500 text-slate-950 px-5 py-3 rounded-2xl shadow-xl font-bold ' + currentFontConfig.smallClass + ' flex items-center gap-2.5 transition-transform active:scale-95'}><Activity className="w-4 h-4" /> Dodaj nowy trening / aktywność</button>
              </div>
            )}
            <button onClick={() => setIsFabOpen(!isFabOpen)} className={'bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-4.5 rounded-full shadow-lg shadow-emerald-500/30 font-bold transition-transform active:scale-95 flex items-center justify-center ' + (isFabOpen ? 'rotate-45 bg-amber-500' : '')}><Plus className="w-7 h-7 stroke-[3]" /></button>
          </div>
        </>
      )}

      {activeTab === 'goals' && (
        <>
          <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
            <div>
              <h1 className={currentFontConfig.headerClass + ' font-bold tracking-tight ' + tStyle.titleText}>Nawyki, Zadania i Cele</h1>
              <p className={currentFontConfig.smallClass + ' md:text-base ' + tStyle.subText}>Globalne centrum zarządzania aktywnościami</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setShowAddHabitModal(true)} className={'bg-emerald-500 hover:bg-emerald-400 transition-colors text-slate-950 font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg ' + currentFontConfig.smallClass}><Zap className="w-4 h-4" /> + Nawyk</button>
              <button onClick={() => setShowAddTaskModal(true)} className={'bg-sky-500 hover:bg-sky-400 transition-colors text-slate-950 font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg ' + currentFontConfig.smallClass}><CheckSquare className="w-4 h-4" /> + Zadanie</button>
              <button onClick={() => setShowAddGoalModal(true)} className={'bg-amber-500 hover:bg-amber-400 transition-colors text-slate-950 font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg ' + currentFontConfig.smallClass}><Target className="w-4 h-4" /> + Cel</button>
            </div>
          </header>

          <div className="mb-8">
            <h3 className={currentFontConfig.smallClass + ' font-semibold uppercase tracking-wider mb-4 ' + tStyle.subText}>Wszystkie Skonfigurowane Nawyki</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.length > 0 ? (
                habits.map((habit) => {
                  const catStyle = getCategoryStyle(habit.category);
                  return (
                    <div key={habit.id} className={'p-4 rounded-3xl border flex justify-between items-center shadow-sm bg-emerald-500/10 border-emerald-500/25'}>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{habit.name}</span>
                          <span className={'px-2 py-0.5 rounded-full border text-[10px] ' + catStyle}>{habit.category || 'Ogólne'}</span>
                        </div>
                        <span className={currentFontConfig.smallClass + ' block ' + tStyle.subText}>
                          {habit.repeat === 'daily' ? 'Codziennie' : habit.repeat === 'interval' ? `Co ${habit.intervalDays} dni` : 'Dni wybrane ręcznie'} 
                          {habit.duration > 0 && ` • ${habit.duration} min`} • <strong className="text-emerald-500">+{habit.pkt || 20} PKT</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2">
                        <button onClick={() => setEditingHabit({ ...habit })} className={'p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 hover:text-amber-500 transition-colors ' + tStyle.subText}><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => setConfirmDeleteModal({ type: 'habit', id: habit.id, name: habit.name })} className={'p-2 rounded-xl bg-slate-500/10 hover:bg-red-500/10 hover:text-red-500 transition-colors ' + tStyle.subText}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={'col-span-full p-6 text-center rounded-3xl border ' + currentFontConfig.smallClass + ' ' + tStyle.cardBg + ' ' + tStyle.subText}>
                  Brak zdefiniowanych nawyków. Kliknij „+ Nawyk”.
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 pt-6 border-t border-slate-500/20">
            <h3 className={currentFontConfig.smallClass + ' font-semibold uppercase tracking-wider mb-4 ' + tStyle.subText}>Zadania z terminem (Wszystkie)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedTasks.length > 0 ? (
                sortedTasks.map((task) => {
                  const isDone = isTaskDone(task);
                  const isOverdue = !isDone && task.dueDate < todayStr;
                  return (
                    <div key={task.id} className={'p-4 rounded-3xl border flex justify-between items-center shadow-sm bg-sky-500/10 border-sky-500/25'}>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={'font-bold ' + currentFontConfig.sizeClass + ' ' + (isDone ? 'line-through opacity-50 ' : '') + tStyle.titleText}>{task.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className={currentFontConfig.smallClass + ' font-mono ' + (isOverdue ? 'text-red-500 font-bold' : tStyle.subText)}>Termin: {task.dueDate} {isOverdue && '(przekroczony!)'} {isDone && '(Ukończone)'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2">
                        <button onClick={() => setEditingTask({ ...task })} className={'p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 hover:text-amber-500 transition-colors ' + tStyle.subText}><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => setConfirmDeleteModal({ type: 'task', id: task.id, name: task.title })} className={'p-2 rounded-xl bg-slate-500/10 hover:bg-red-500/10 hover:text-red-500 transition-colors ' + tStyle.subText}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={'col-span-full p-6 text-center rounded-3xl border ' + currentFontConfig.smallClass + ' ' + tStyle.cardBg + ' ' + tStyle.subText}>
                  Brak zdefiniowanych zadań. Kliknij „+ Zadanie”.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pt-6 border-t border-slate-500/20">
            <div className="space-y-4">
              <h3 className={currentFontConfig.smallClass + ' font-semibold uppercase tracking-wider ' + tStyle.subText}>Twoje Aktywne Cele (+30 PKT)</h3>
              {goals.length > 0 ? (
                goals.map(goal => {
                  const isProgressType = goal.type === 'read_book' || goal.type === 'study' || goal.type === 'no_sweets';
                  
                  let currentVal = 0;
                  if (goal.isDaily) {
                      if (isProgressType) {
                          currentVal = workouts.filter(w => w.goalId === goal.id && w.date === todayStr).reduce((acc, w) => acc + w.amount, 0);
                      } else {
                          currentVal = workouts.filter(w => w.type === goal.type && w.date === todayStr).reduce((acc, w) => acc + w.amount, 0);
                      }
                  } else {
                      currentVal = isProgressType ? (goal.currentPage || 0) : workouts.filter(w => w.type === goal.type).reduce((acc, w) => acc + w.amount, 0);
                  }
                  
                  const percent = Math.min(100, Math.round((currentVal / goal.target) * 100));
                  const isOverdue = !goal.isDaily && goal.dueDate && goal.dueDate < todayStr && percent < 100;
                  const isCompleted = percent >= 100;
                  
                  let CatIcon = Target;
                  if (goal.category === 'sport') CatIcon = Dumbbell;
                  if (goal.category === 'jedzenie') CatIcon = Utensils;
                  if (goal.category === 'umysl') CatIcon = Brain;

                  return (
                    <div key={goal.id} className={'p-5 rounded-3xl border shadow-sm relative bg-amber-500/10 border-amber-500/25 ' + (isCompleted ? ' border-emerald-500/50 bg-emerald-500/10' : '')}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={'p-2 rounded-xl ' + (isCompleted ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/25 text-amber-500')}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : (isProgressType ? <BookOpen className="w-5 h-5" /> : <CatIcon className="w-5 h-5" />)}
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-500/10 text-amber-600 dark:text-amber-400 mb-1 inline-block">
                              {goal.category === 'sport' ? 'Sport' : goal.category === 'jedzenie' ? 'Jedzenie' : 'Umysł'}
                            </span>
                            <h4 className={'font-bold ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{goal.title}</h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditingGoal({ ...goal })} className={'hover:text-amber-500 p-1 ' + tStyle.subText}><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => setConfirmDeleteModal({ type: 'goal', id: goal.id, name: goal.title })} className={'hover:text-red-500 p-1 ' + tStyle.subText}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      {goal.comment && <div className={'mb-2 p-2.5 rounded-xl bg-slate-500/10 italic ' + currentFontConfig.smallClass + ' ' + tStyle.subText}>💬 "{goal.comment}"</div>}
                      
                      {goal.isDaily ? (
                          <div className="flex items-center gap-1.5 mb-2">
                            <RotateCcw className="w-3.5 h-3.5 text-sky-500" />
                            <span className={currentFontConfig.smallClass + ' font-mono text-sky-600 dark:text-sky-400 font-bold'}>Cel codzienny (dzisiejszy postęp)</span>
                          </div>
                      ) : goal.dueDate ? (
                          <div className="flex items-center gap-1.5 mb-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className={currentFontConfig.smallClass + ' font-mono ' + (isOverdue ? 'text-red-500 font-bold' : tStyle.subText)}>Termin: {goal.dueDate} {isOverdue && '(przekroczony!)'}</span>
                          </div>
                      ) : null}

                      <div className="flex justify-between items-center mb-1.5 font-mono text-sm">
                        <span className={tStyle.subText}>{goal.type === 'read_book' ? 'Strona:' : goal.type === 'study' ? 'Godziny:' : goal.type === 'no_sweets' ? 'Dni:' : 'Postęp:'}</span>
                        <span className="font-bold text-emerald-500">{currentVal} / {goal.target} {goal.type === 'read_book' ? 'stron' : goal.type === 'study' ? 'godz.' : goal.type === 'no_sweets' ? 'dni' : goal.type === 'steps' ? 'kroków' : ''} ({percent}%) {isCompleted && '✨ (+30 PKT)'}</span>
                      </div>
                      <div className="w-full bg-slate-500/20 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: percent + '%' }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={'p-6 text-center rounded-3xl border ' + currentFontConfig.smallClass + ' ' + tStyle.cardBg + ' ' + tStyle.subText}>Brak zdefiniowanych celów. Kliknij „+ Cel”.</div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className={currentFontConfig.smallClass + ' font-semibold uppercase tracking-wider ' + tStyle.subText}>Ostatnio dodane aktywności</h3>
              {workouts.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {workouts.map(w => {
                    let typeName = w.type === 'run' ? 'Bieg' : w.type === 'pushups' ? 'Pompki' : w.type === 'pullups' ? 'Drążek' : w.type === 'squats' ? 'Przysiady' : w.type === 'situps' ? 'Brzuszki' : w.type === 'bike' ? 'Rower' : w.type === 'gym' ? 'Siłownia' : w.type === 'walk_km' ? 'Spacer' : w.type === 'steps' ? 'Kroki' : w.type === 'study' ? 'Nauka' : w.type === 'read_book' ? 'Książka' : w.type === 'no_sweets' ? 'Dni bez słodyczy' : 'Spacer (czas)';
                    const workoutName = `${typeName}: ${w.amount} ${w.unit}`;
                    return (
                      <div key={w.id} className={'flex items-center justify-between p-4 rounded-2xl border ' + tStyle.cardBg}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            {w.type === 'run' || w.type === 'walk_km' ? <Footprints className="w-5 h-5" /> : w.type === 'pushups' || w.type === 'pullups' || w.type === 'squats' || w.type === 'situps' ? <Dumbbell className="w-5 h-5" /> : w.type === 'read_book' || w.type === 'study' ? <BookOpen className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                          </div>
                          <div>
                            <span className={'font-bold block ' + currentFontConfig.sizeClass + ' ' + tStyle.titleText}>{workoutName}</span>
                            <span className={currentFontConfig.smallClass + ' ' + tStyle.subText}>{w.date} • <strong className="text-amber-500">+{w.pkt} PKT</strong></span>
                          </div>
                        </div>
                        <button onClick={() => setConfirmDeleteModal({ type: 'workout', id: w.id, name: workoutName })} className={'hover:text-red-500 p-2 ' + tStyle.subText}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={'p-6 text-center rounded-3xl border ' + currentFontConfig.smallClass + ' ' + tStyle.cardBg + ' ' + tStyle.subText}>Brak zarejestrowanych aktywności.</div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-500/20">
            <button
              onClick={() => setShowArchiveModal(true)}
              className={'w-full py-4 rounded-3xl border font-bold flex items-center justify-center gap-2.5 transition-all shadow-md ' + tStyle.cardBg + ' hover:opacity-90'}
            >
              <Archive className="w-5 h-5 text-amber-500" /> Archiwum (Zrealizowane nawyki, zadania i cele)
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
                {(selectedDayHabits.length > 0 || selectedDayTasks.length > 0 || selectedDayWorkouts.length > 0) ? (
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {selectedDayHabits.map((h) => (
                      <div key={'h-' + h.id} className={'flex items-center justify-between bg-slate-500/10 p-3.5 rounded-xl ' + currentFontConfig.smallClass}>
                        <div>
                          <span className={h.completed && !isFutureDay ? 'text-emerald-500 line-through' : tStyle.titleText}>⚡ {h.name}</span>
                          {h.duration > 0 && <span className={'block opacity-70 mt-0.5 ' + tStyle.subText}>{h.duration} minut</span>}
                        </div>
                        <span className={'font-semibold px-2.5 py-1 rounded-full text-[10px] md:text-xs uppercase tracking-wider border ' + (
                          isFutureDay 
                            ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30'
                            : h.completed 
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                              : 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30'
                        )}>
                          {isFutureDay ? 'Zaplanowany' : (h.completed ? 'Wykonane' : 'Niewykonane')}
                        </span>
                      </div>
                    ))}
                    {selectedDayTasks.map((t) => {
                      const isDone = isTaskDone(t);
                      return (
                        <div key={'t-' + t.id} className={'flex items-center justify-between bg-sky-500/10 p-3.5 rounded-xl border border-sky-500/25 ' + currentFontConfig.smallClass}>
                          <div>
                            <span className={isDone ? 'text-sky-500 line-through' : tStyle.titleText}>📋 {t.title}</span>
                            <span className={'block opacity-70 mt-0.5 ' + tStyle.subText}>Termin: {t.dueDate}</span>
                          </div>
                          <span className={'font-semibold px-2.5 py-1 rounded-full text-[10px] md:text-xs uppercase tracking-wider border ' + (isDone ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30')}>
                            {isDone ? 'Zadanie ukończone' : 'Zadanie aktywne'}
                          </span>
                        </div>
                      );
                    })}
                    {selectedDayWorkouts.map((w) => {
                      let typeName = w.type === 'run' ? 'Bieg' : w.type === 'pushups' ? 'Pompki' : w.type === 'pullups' ? 'Drążek' : w.type === 'squats' ? 'Przysiady' : w.type === 'situps' ? 'Brzuszki' : w.type === 'bike' ? 'Rower' : w.type === 'gym' ? 'Siłownia' : w.type === 'walk_km' ? 'Spacer' : w.type === 'steps' ? 'Kroki' : w.type === 'study' ? 'Nauka' : w.type === 'read_book' ? 'Książka' : w.type === 'no_sweets' ? 'Dni bez słodyczy' : 'Spacer (czas)';
                      return (
                        <div key={'w-' + w.id} className={'flex items-center justify-between bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/25 ' + currentFontConfig.smallClass}>
                          <div>
                            <span className={'font-bold ' + tStyle.titleText}>🔥 {typeName}: {w.amount} {w.unit}</span>
                            <span className={'block opacity-70 mt-0.5 text-amber-500 font-bold'}>+{w.pkt} PKT</span>
                          </div>
                          <span className="font-semibold px-2.5 py-1 rounded-full text-[10px] md:text-xs uppercase tracking-wider border bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
                            Trening/Aktywność
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={currentFontConfig.smallClass + ' text-center py-4 ' + tStyle.subText}>Brak zarejestrowanych aktywności w tym dniu.</p>
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

          <div className={'p-6 md:p-8 rounded-3xl border mb-6 shadow-xl relative overflow-hidden ' + tStyle.cardBg}>
            <div className="flex items-center gap-5 mb-5">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center font-bold text-2xl bg-amber-500/20 border border-amber-500/40 text-amber-500 shadow-inner">
                <ShieldCheck className="w-10 h-10 md:w-12 md:h-12" />
              </div>
              <div>
                <span className={currentFontConfig.smallClass + ' md:text-sm font-bold uppercase tracking-wider block ' + tStyle.subText}>Ranga (Poziom {levelInfo.level}/50)</span>
                <h2 className={currentFontConfig.headerClass + ' font-bold ' + tStyle.titleText}>{levelInfo.name}</h2>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className={'bg-slate-500/10 p-4 rounded-2xl flex justify-between items-center ' + currentFontConfig.smallClass + ' md:text-base'}>
                <span className={tStyle.subText}>Postęp w bieżącym poziomie:</span>
                <span className="font-mono font-bold text-amber-500 text-lg md:text-xl">{levelInfo.pointsInLevel}/{levelInfo.maxLevelPoints} PKT</span>
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
            {monthTotalDoneHabits > 0 ? (
              <div className="space-y-3">
                {categories.map(cat => {
                  const count = monthCategoryStats[cat.id] || 0;
                  const percent = Math.round((count / monthTotalDoneHabits) * 100);
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
              <p className={currentFontConfig.smallClass + ' text-center py-6 ' + tStyle.subText}>Brak ukończonych nawyków w miesiącu {monthNameDisplay}.</p>
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
                  <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}>Wszystkie zrealizowane nawyki, zadania i cele</p>
                </div>
              </div>
              <button onClick={() => setShowArchiveModal(false)} className={'p-2 rounded-full transition-colors ' + tStyle.modalBtnBg}><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-1">
              <div>
                <h4 className={currentFontConfig.smallClass + ' font-bold uppercase tracking-wider mb-3 text-emerald-500 flex items-center gap-2'}>
                  <Zap className="w-4 h-4" /> Zrealizowane Nawyki ({archivedHabits.length})
                </h4>
                {archivedHabits.length > 0 ? (
                  <div className="space-y-2">
                    {archivedHabits.map((item, idx) => (
                      <div key={idx} className={'p-3.5 rounded-2xl border flex justify-between items-center bg-emerald-500/10 border-emerald-500/25 ' + currentFontConfig.smallClass}>
                        <div>
                          <span className={'font-medium block ' + tStyle.titleText}>{item.name}</span>
                          <span className={'font-mono text-xs ' + tStyle.subText}>Data: {item.date}</span>
                        </div>
                        <button 
                          onClick={() => restoreArchivedItem('habit', item)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Przywróć
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={'p-4 rounded-2xl border text-center ' + currentFontConfig.smallClass + ' ' + tStyle.subText + ' ' + tStyle.cardBg}>Brak zrealizowanych nawyków w archiwum.</p>
                )}
              </div>

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
                          <span className={'font-mono text-xs opacity-80 ' + tStyle.subText}>Termin: {task.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-500/20 text-emerald-500 font-bold px-2.5 py-1 rounded-full text-xs">Ukończone</span>
                          <button 
                            onClick={() => restoreArchivedItem('task', task)}
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
              <label className={currentFontConfig.smallClass + ' md:text-sm font-medium block mb-2 ' + tStyle.subText}>Kategorie Nawyków</label>
              <div className="space-y-2 mb-3">
                {categories.map(cat => (
                  <div key={cat.id} className={'flex items-center justify-between p-3 rounded-2xl border ' + tStyle.cardBg}>
                    <span className={currentFontConfig.smallClass + ' px-3 py-1 rounded-full border font-bold ' + cat.color}>{cat.label}</span>
                    {categories.length > 1 && (
                      <button onClick={() => deleteCategory(cat.id)} className={'hover:text-red-500 p-2 rounded-xl hover:bg-red-500/10 transition-colors ' + tStyle.subText} title="Usuń kategorię"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={addCategory} className="flex gap-2">
                <input type="text" placeholder="np. 🚀 Kariera" value={newCatLabel} onChange={(e) => setNewCatLabel(e.target.value)} className={'flex-1 rounded-xl px-4 py-2.5 ' + currentFontConfig.smallClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                <button type="submit" className={'bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold ' + currentFontConfig.smallClass + ' transition-all'}>+ Dodaj</button>
              </form>
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

      {levelUpModalData && levelUpModalData.show && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-5 z-[120] animate-fadeIn">
          <div className={'w-full max-w-md rounded-3xl p-8 shadow-2xl relative text-center border ' + tStyle.modalBg}>
            <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-500 shadow-inner"><Trophy className="w-8 h-8" /></div>
            <span className={currentFontConfig.smallClass + ' md:text-sm font-bold uppercase tracking-widest text-amber-500 block mb-2'}>{levelUpModalData.isRankUp ? '🎉 Nowa Ranga Odblokowana!' : '⚡ Awans na Poziom!'}</span>
            <h2 className={currentFontConfig.headerClass + ' font-bold mb-4 ' + tStyle.titleText}>Poziom {levelUpModalData.level}</h2>
            {levelUpModalData.isRankUp && levelUpModalData.rankName && <div className="mb-4 inline-block bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full text-amber-600 dark:text-amber-400 font-bold text-sm">Ranga: {levelUpModalData.rankName}</div>}
            <p className={currentFontConfig.sizeClass + ' md:text-lg font-medium leading-relaxed mb-8 ' + tStyle.subText}>"{levelUpModalData.message}"</p>
            <button onClick={() => setLevelUpModalData(null)} className={'w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-2xl font-bold ' + currentFontConfig.sizeClass + ' transition-transform active:scale-95 shadow-lg shadow-emerald-500/20'}>Działamy dalej! 🚀</button>
          </div>
        </div>
      )}

      {showAddHabitModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 ' + tStyle.titleText}>Dodaj nowy nawyk</h3>
            <form onSubmit={addHabit} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Nazwa nawyku</label>
                <input type="text" placeholder="np. Nauka angielskiego" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Kategoria</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {categories.map((cat) => (
                    <button key={cat.id} type="button" onClick={() => setNewHabitCategory(cat.id)} className={'py-2.5 px-3 ' + currentFontConfig.smallClass + ' rounded-xl text-left transition-all ' + (newHabitCategory === cat.id ? tStyle.optSelected : tStyle.optUnselected)}>{cat.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Trudność zadania</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setNewHabitDifficulty('easy')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newHabitDifficulty === 'easy' ? tStyle.optSelected : tStyle.optUnselected)}>Łatwy</button>
                  <button type="button" onClick={() => setNewHabitDifficulty('medium')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newHabitDifficulty === 'medium' ? tStyle.optSelectedWarning : tStyle.optUnselected)}>Średni</button>
                  <button type="button" onClick={() => setNewHabitDifficulty('hard')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newHabitDifficulty === 'hard' ? tStyle.optSelectedDanger : tStyle.optUnselected)}>Trudny</button>
                </div>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Powtarzalność</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button type="button" onClick={() => setNewHabitRepeat('daily')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newHabitRepeat === 'daily' ? tStyle.optSelected : tStyle.optUnselected)}>Codziennie</button>
                  <button type="button" onClick={() => setNewHabitRepeat('interval')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newHabitRepeat === 'interval' ? tStyle.optSelected : tStyle.optUnselected)}>Co kilka dni</button>
                  <button type="button" onClick={() => setNewHabitRepeat('custom')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newHabitRepeat === 'custom' ? tStyle.optSelected : tStyle.optUnselected)}>Niestandardowe</button>
                </div>
                {newHabitRepeat === 'interval' && (
                  <div className="mt-2">
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Co ile dni?</label>
                    <input type="number" min="2" max="30" value={newHabitIntervalDays} onChange={(e) => setNewHabitIntervalDays(e.target.value)} className={'w-full rounded-2xl px-4 py-2.5 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                  </div>
                )}
                {newHabitRepeat === 'custom' && (
                  <div className="mt-3 space-y-2">
                    <label className={currentFontConfig.smallClass + ' font-medium block ' + tStyle.subText}>Zaznacz dni w kalendarzu:</label>
                    <div className={'p-3 rounded-2xl border ' + tStyle.cardBg}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={'font-bold ' + currentFontConfig.smallClass + ' ' + tStyle.titleText}>{habitPickerDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setHabitPickerDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="p-1 rounded hover:bg-slate-500/20"><ChevronLeft className="w-4 h-4" /></button>
                          <button type="button" onClick={() => setHabitPickerDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="p-1 rounded hover:bg-slate-500/20"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className={'grid grid-cols-7 gap-1 text-center text-[10px] font-semibold mb-1 ' + tStyle.subText}>
                        <span>Pn</span><span>Wt</span><span>Śr</span><span>Cz</span><span>Pt</span><span>Sob</span><span>Ndz</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {(() => {
                          const year = habitPickerDate.getFullYear(); const month = habitPickerDate.getMonth();
                          const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
                          const offset = firstDay === 0 ? 6 : firstDay - 1;
                          const slots = [];
                          for (let i = 0; i < offset; i++) slots.push(null);
                          for (let d = 1; d <= daysInMonth; d++) slots.push(year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'));
                          return slots.map((dStr, idx) => {
                            if (!dStr) return <div key={'empty-' + idx} className="h-8" />;
                            const dayNum = parseInt(dStr.split('-')[2]);
                            const isSelected = newHabitCustomDates.includes(dStr);
                            return (
                              <button key={dStr} type="button" onClick={() => setNewHabitCustomDates(isSelected ? newHabitCustomDates.filter(d => d !== dStr) : [...newHabitCustomDates, dStr])} className={'h-8 rounded-lg flex items-center justify-center text-xs transition-all ' + (isSelected ? 'bg-emerald-500 text-slate-950 font-bold shadow-md ring-2 ring-emerald-400' : 'bg-slate-500/10 hover:bg-slate-500/20 ' + tStyle.titleText)}>{dayNum}</button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-slate-500/20">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={newHabitHasReminder} onChange={(e) => { const checked = e.target.checked; setNewHabitHasReminder(checked); if (checked && 'Notification' in window) Notification.requestPermission(); }} className="w-4 h-4 accent-emerald-500 rounded cursor-pointer" />
                  <span className={currentFontConfig.smallClass + ' font-medium ' + tStyle.subText}>Włącz powiadomienie (przypomnienie)</span>
                </label>
                {newHabitHasReminder && (
                  <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Godzina powiadomienia</label>
                    <input type="time" value={newHabitReminderTime} onChange={(e) => setNewHabitReminderTime(e.target.value)} className={'w-full rounded-2xl px-4 py-2.5 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
                  </div>
                )}
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Czas trwania (w minutach, opcjonalnie)</label>
                <input type="number" placeholder="np. 15 (zostaw puste jeśli bez limitu)" value={newHabitDuration} onChange={(e) => setNewHabitDuration(e.target.value)} min="1" max="480" className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddHabitModal(false)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                <button type="submit" className={'flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>Dodaj</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingHabit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 ' + tStyle.titleText}>Edytuj nawyk</h3>
            <form onSubmit={saveEditedHabit} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Nazwa nawyku</label>
                <input type="text" value={editingHabit.name} onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Kategoria</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {categories.map((cat) => (
                    <button key={cat.id} type="button" onClick={() => setEditingHabit({ ...editingHabit, category: cat.id })} className={'py-2.5 px-3 ' + currentFontConfig.smallClass + ' rounded-xl text-left transition-all ' + (editingHabit.category === cat.id ? tStyle.optSelected : tStyle.optUnselected)}>{cat.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Trudność zadania</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setEditingHabit({ ...editingHabit, difficulty: 'easy' })} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (editingHabit.difficulty === 'easy' ? tStyle.optSelected : tStyle.optUnselected)}>Łatwy</button>
                  <button type="button" onClick={() => setEditingHabit({ ...editingHabit, difficulty: 'medium' })} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (editingHabit.difficulty === 'medium' ? tStyle.optSelectedWarning : tStyle.optUnselected)}>Średni</button>
                  <button type="button" onClick={() => setEditingHabit({ ...editingHabit, difficulty: 'hard' })} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (editingHabit.difficulty === 'hard' ? tStyle.optSelectedDanger : tStyle.optUnselected)}>Trudny</button>
                </div>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Czas trwania (w minutach, opcjonalnie)</label>
                <input type="number" placeholder="np. 15" value={editingHabit.duration || ''} onChange={(e) => setEditingHabit({ ...editingHabit, duration: e.target.value })} min="1" max="480" className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingHabit(null)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                <button type="submit" className={'flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>Zapisz zmiany</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={'w-full max-w-md rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 ' + tStyle.titleText}>Dodaj nowe zadanie</h3>
            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Tytuł zadania</label>
                <input type="text" placeholder="np. Przegląd samochodu" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Termin realizacji</label>
                <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className={'w-full max-w-full box-border appearance-none rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} style={{ WebkitAppearance: 'none' }} />
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Trudność zadania</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setNewTaskDifficulty('easy')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskDifficulty === 'easy' ? tStyle.optSelected : tStyle.optUnselected)}>Łatwy</button>
                  <button type="button" onClick={() => setNewTaskDifficulty('medium')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskDifficulty === 'medium' ? tStyle.optSelectedWarning : tStyle.optUnselected)}>Średni</button>
                  <button type="button" onClick={() => setNewTaskDifficulty('hard')} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newTaskDifficulty === 'hard' ? tStyle.optSelectedDanger : tStyle.optUnselected)}>Trudny</button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddTaskModal(false)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                <button type="submit" className={'flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>Dodaj</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={'w-full max-w-md rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 ' + tStyle.titleText}>Edytuj zadanie</h3>
            <form onSubmit={saveEditedTask} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Tytuł zadania</label>
                <input type="text" value={editingTask.title} onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Termin realizacji</label>
                <input type="date" value={editingTask.dueDate} onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })} className={'w-full max-w-full box-border appearance-none rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} style={{ WebkitAppearance: 'none' }} />
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Trudność zadania</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setEditingTask({ ...editingTask, difficulty: 'easy' })} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (editingTask.difficulty === 'easy' ? tStyle.optSelected : tStyle.optUnselected)}>Łatwy</button>
                  <button type="button" onClick={() => setEditingTask({ ...editingTask, difficulty: 'medium' })} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (editingTask.difficulty === 'medium' ? tStyle.optSelectedWarning : tStyle.optUnselected)}>Średni</button>
                  <button type="button" onClick={() => setEditingTask({ ...editingTask, difficulty: 'hard' })} className={'py-2.5 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (editingTask.difficulty === 'hard' ? tStyle.optSelectedDanger : tStyle.optUnselected)}>Trudny</button>
                </div>
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={'w-full max-w-md rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 ' + tStyle.titleText}>Dodaj trening / aktywność</h3>
            <form onSubmit={addWorkout} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Typ aktywności</label>
                <select value={newWorkoutType} onChange={(e) => setNewWorkoutType(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg}>
                  <option value="steps">Kroki (liczba)</option>
                  <option value="run">Bieganie (km)</option>
                  <option value="pushups">Pompki (powtórzenia)</option>
                  <option value="pullups">Drążek (powtórzenia)</option>
                  <option value="squats">Przysiady (powtórzenia)</option>
                  <option value="situps">Brzuszki (powtórzenia)</option>
                  <option value="bike">Rower (km)</option>
                  <option value="gym">Siłownia (minuty)</option>
                  <option value="study">Nauka (godziny)</option>
                  <option value="no_sweets">Dni bez słodyczy (dni)</option>
                </select>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>
                  {newWorkoutType === 'run' || newWorkoutType === 'bike' ? 'Dystans (km)' : newWorkoutType === 'pushups' || newWorkoutType === 'pullups' || newWorkoutType === 'squats' || newWorkoutType === 'situps' ? 'Liczba powtórzeń' : newWorkoutType === 'steps' ? 'Liczba kroków' : newWorkoutType === 'gym' ? 'Czas (minuty)' : newWorkoutType === 'study' ? 'Czas (godziny)' : newWorkoutType === 'no_sweets' ? 'Liczba dni' : 'Wartość'}
                </label>
                <input type="number" step="any" placeholder={newWorkoutType === 'steps' ? 'np. 10000' : 'np. 1'} value={newWorkoutAmount} onChange={(e) => setNewWorkoutAmount(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddWorkoutModal(false)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                <button type="submit" className={'flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>Dodaj</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddActivityModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={'w-full max-w-md rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 ' + tStyle.titleText}>Zarejestruj postęp (Umysł / Jedzenie)</h3>
            <form onSubmit={addActivity} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Wybierz cel</label>
                <select value={activityGoalId} onChange={(e) => setActivityGoalId(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg}>
                  <option value="">-- Wybierz cel --</option>
                  {goals.filter(g => g.category === 'umysl' || g.category === 'jedzenie').map(g => {
                    const isProgressType = g.type === 'read_book' || g.type === 'study' || g.type === 'no_sweets';
                    let currentVal = 0;
                    if (g.isDaily) {
                        currentVal = workouts.filter(w => w.goalId === g.id && w.date === todayStr).reduce((acc, w) => acc + w.amount, 0);
                    } else {
                        currentVal = (g.currentPage || 0);
                    }
                    return (
                      <option key={g.id} value={g.id}>{g.title} (obecnie: {currentVal}/{g.target} {g.type === 'study' ? 'godz.' : g.type === 'no_sweets' ? 'dni' : 'stron'})</option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Wartość do dodania (strony / godziny / dni)</label>
                <input type="number" step="any" min="0.1" placeholder="np. 20 lub 1.5" value={activityPages} onChange={(e) => setActivityPages(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-emerald-500 ' + tStyle.inputBg} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddActivityModal(false)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                <button type="submit" className={'flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>Zapisz</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddGoalModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 ' + tStyle.titleText}>Dodaj nowy cel</h3>
            <form onSubmit={addGoal} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Tytuł / Nazwa celu</label>
                <input type="text" placeholder="np. 100k kroków lub Książka lub Dni bez słodyczy" value={newGoalTitle} onChange={(e) => setNewGoalTitle(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg} />
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Kategoria</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => { setNewGoalCategory('sport'); setNewGoalType('steps'); }} className={'py-2 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newGoalCategory === 'sport' ? tStyle.optSelected : tStyle.optUnselected)}>Sport</button>
                  <button type="button" onClick={() => { setNewGoalCategory('jedzenie'); setNewGoalType('no_sweets'); }} className={'py-2 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newGoalCategory === 'jedzenie' ? tStyle.optSelected : tStyle.optUnselected)}>Jedzenie</button>
                  <button type="button" onClick={() => { setNewGoalCategory('umysl'); setNewGoalType('read_book'); }} className={'py-2 ' + currentFontConfig.smallClass + ' rounded-xl transition-all ' + (newGoalCategory === 'umysl' ? tStyle.optSelected : tStyle.optUnselected)}>Umysł</button>
                </div>
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Typ monitorowania</label>
                <select 
                  value={newGoalType} 
                  onChange={(e) => setNewGoalType(e.target.value)} 
                  className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg}
                >
                  {newGoalCategory === 'umysl' ? (
                    <>
                      <option value="read_book">Książka (strony)</option>
                      <option value="study">Nauka (godziny)</option>
                    </>
                  ) : newGoalCategory === 'sport' ? (
                    <>
                      <option value="steps">Kroki (liczba kroków)</option>
                      <option value="run">Bieganie (km)</option>
                      <option value="pushups">Pompki (powtórzenia)</option>
                      <option value="bike">Rower (km)</option>
                      <option value="gym">Siłownia (minuty)</option>
                      <option value="pullups">Drążek (powtórzenia)</option>
                      <option value="squats">Przysiady (powtórzenia)</option>
                      <option value="situps">Brzuszki (powtórzenia)</option>
                    </>
                  ) : (
                    <>
                      <option value="no_sweets">Dni bez słodyczy (dni)</option>
                    </>
                  )}
                </select>
              </div>
              
              <div className="pt-2 border-t border-slate-500/20">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={newGoalIsDaily} onChange={(e) => setNewGoalIsDaily(e.target.checked)} className="w-4 h-4 accent-amber-500 rounded cursor-pointer" />
                  <span className={currentFontConfig.smallClass + ' font-medium ' + tStyle.subText}>Codziennie (odnawia się każdego dnia)</span>
                </label>
              </div>

              {(!newGoalIsDaily && (newGoalType === 'read_book' || newGoalType === 'study' || newGoalType === 'no_sweets')) && (
                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Już zrealizowane (start: {newGoalType === 'study' ? 'godziny' : newGoalType === 'no_sweets' ? 'dni' : 'strony'})</label>
                  <input type="number" step="any" min="0" value={newGoalCurrentPage} onChange={(e) => setNewGoalCurrentPage(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg} />
                </div>
              )}
              
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Docelowa wartość {newGoalIsDaily ? '(na dzień)' : ''}</label>
                <input type="number" step="any" placeholder={newGoalType === 'study' ? 'np. 50' : newGoalType === 'read_book' ? 'np. 300' : newGoalType === 'no_sweets' ? 'np. 30' : 'np. 100000'} value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg} />
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + (newGoalIsDaily ? 'opacity-50 ' : '') + tStyle.subText}>Termin realizacji (opcjonalnie)</label>
                <input disabled={newGoalIsDaily} type="date" value={newGoalDueDate} onChange={(e) => setNewGoalDueDate(e.target.value)} className={'w-full max-w-full box-border appearance-none rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg + (newGoalIsDaily ? ' opacity-50 cursor-not-allowed' : '')} style={{ WebkitAppearance: 'none' }} />
              </div>
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Komentarz / Motywacja (opcjonalnie)</label>
                <input type="text" placeholder="np. Konsekwencja kluczem do sukcesu" value={newGoalComment} onChange={(e) => setNewGoalComment(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddGoalModal(false)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                <button type="submit" className={'flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>Dodaj</button>
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
                <input type="text" value={editingGoal.title} onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg} />
              </div>
              
              <div className="pt-2 border-t border-slate-500/20">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={editingGoal.isDaily || false} onChange={(e) => setEditingGoal({ ...editingGoal, isDaily: e.target.checked, dueDate: e.target.checked ? null : editingGoal.dueDate })} className="w-4 h-4 accent-amber-500 rounded cursor-pointer" />
                  <span className={currentFontConfig.smallClass + ' font-medium ' + tStyle.subText}>Codziennie (odnawia się każdego dnia)</span>
                </label>
              </div>

              {(!editingGoal.isDaily && (editingGoal.type === 'read_book' || editingGoal.type === 'study' || editingGoal.type === 'no_sweets')) && (
                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Aktualny postęp ({editingGoal.type === 'study' ? 'godziny' : editingGoal.type === 'no_sweets' ? 'dni' : 'strony'})</label>
                  <input type="number" step="any" min="0" value={editingGoal.currentPage || 0} onChange={(e) => setEditingGoal({ ...editingGoal, currentPage: parseFloat(e.target.value) || 0 })} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg} />
                </div>
              )}
              
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Docelowa wartość {editingGoal.isDaily ? '(na dzień)' : ''}</label>
                <input type="number" step="any" value={editingGoal.target} onChange={(e) => setEditingGoal({ ...editingGoal, target: parseFloat(e.target.value) || 0 })} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-amber-500 ' + tStyle.inputBg} />
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[150]">
          <div className={'w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center border ' + tStyle.modalBg}>
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500"><Check className="w-6 h-6" /></div>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-2 ' + tStyle.titleText}>Potwierdź wykonanie</h3>
            <p className={currentFontConfig.smallClass + ' mb-6 ' + tStyle.subText}>Czy na pewno chcesz oznaczyć jako zrobione: <strong className="text-emerald-400">"{confirmCompleteModal.name}"</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCompleteModal(null)} className={'flex-1 py-3 rounded-2xl font-semibold ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
              <button onClick={executeComplete} className={'flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-2xl font-bold ' + currentFontConfig.smallClass + ' shadow-lg shadow-emerald-500/30'}>Zrobione</button>
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

    </div>
  );
}