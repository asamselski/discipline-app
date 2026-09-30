import { useState, useEffect, useRef } from 'react';
import { getYesterdayReview } from './motivationEngine';
import { QUOTES } from './data/quotes';
import { FONT_SIZE_OPTIONS, GOAL_CATEGORIES_CONFIG, INITIAL_CATEGORIES, MAX_LEVEL, RANKS, TROPHIES } from './data/constants';
import { getNotificationStatus, requestNotificationPermission, showAppNotification } from './notifications';
import { createBackupDocument, downloadBackupDocument, restoreBackupDocument } from './appData';
import { disablePushNotifications, enablePushNotifications, getPushApiUrl, getPushSubscriptionStatus, savePushApiUrl, syncPushReminders } from './pushNotifications';
import { formatDateStr, getAppDayString, isTaskDoneForDate, parseLocalDate, taskAppliesToDate } from './utils/date';
import { calculateTotalPoints, getLevelInfo } from './utils/scoring';
import AppNavigation from './components/AppNavigation';
import FloatingActionButton from './components/FloatingActionButton';
import ProfileTab from './components/ProfileTab';
import GoalsTab from './components/GoalsTab';
import HistoryTab from './components/HistoryTab';
import { TrophyDetailsModal, TrophiesModal } from './components/modals/TrophiesModals';
import ArchiveModal from './components/modals/ArchiveModal';
import { CompleteConfirmationModal, DeleteConfirmationModal, DeleteNoteConfirmationModal } from './components/modals/ActionModals';
import SettingsModal from './components/modals/SettingsModal';
import GoalWizardModal from './components/modals/GoalWizardModal';
import TaskModals from './components/modals/TaskModals';
import {
  GOOGLE_API_KEY,
  GOOGLE_CLIENT_ID,
  GOOGLE_DISCOVERY_DOC,
  GOOGLE_DRIVE_SCOPE,
  clearStoredGoogleAccessToken,
  getGoogleErrorMessage,
  getStoredGoogleAccessToken,
  loadGapiClient,
  loadGoogleScript,
  saveGoogleAccessToken,
} from './services/googleApi';
import { 
  History, CheckCircle2, Circle, Plus, Trophy, Zap, 
  Trash2, Calendar as CalendarIcon, Check, Play, Pause, Quote, X, ShieldCheck, Moon, Flame, AlertTriangle, Edit3, Target, Activity, Dumbbell, Footprints, Brain, ChevronDown, Bell, Laptop, BookOpen, Archive,
  ChevronLeft, ChevronRight, CheckSquare,
  MoreVertical, Star, RefreshCw
} from 'lucide-react';

export default function App() {
  const [resetTime, setResetTime] = useState(() => localStorage.getItem('discipline_reset_time') || '00:00');
  const [todayStr, setTodayStr] = useState(() => getAppDayString());
  const [notificationStatus, setNotificationStatus] = useState(() => getNotificationStatus());
  const [pushStatus, setPushStatus] = useState('checking');
  const [pushApiUrl, setPushApiUrl] = useState(() => getPushApiUrl());
  const [pushMessage, setPushMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const currentAppDay = getAppDayString(resetTime);
      if (currentAppDay !== todayStr) setTodayStr(currentAppDay);
    }, 30000);
    return () => clearInterval(interval);
  }, [todayStr, resetTime]);

  const enableNotifications = async () => {
    const status = await requestNotificationPermission();
    setNotificationStatus(status);
    return status;
  };

  const testNotification = async () => {
    const status = notificationStatus === 'granted'
      ? 'granted'
      : await enableNotifications();

    if (status === 'granted') {
      await showAppNotification('Powiadomienia działają! ✅', {
        body: 'SamoDyscyplina może wyświetlać przypomnienia na tym urządzeniu.',
        tag: 'discipline-notification-test',
      });
    }
  };

  useEffect(() => {
    getPushSubscriptionStatus()
      .then(setPushStatus)
      .catch(() => setPushStatus('disabled'));
  }, []);

  const enableFullPush = async () => {
    setPushMessage('Łączenie z usługą powiadomień...');
    try {
      const permission = await enableNotifications();
      if (permission !== 'granted') throw new Error('Najpierw zezwól aplikacji na powiadomienia.');
      savePushApiUrl(pushApiUrl);
      await enablePushNotifications(tasks);
      setPushStatus('enabled');
      setPushMessage('✅ Pełne powiadomienia są aktywne także po zamknięciu aplikacji.');
    } catch (error) {
      setPushStatus('disabled');
      setPushMessage(`❌ ${error.message}`);
    }
  };

  const disableFullPush = async () => {
    try {
      await disablePushNotifications();
      setPushStatus('disabled');
      setPushMessage('Powiadomienia w tle zostały wyłączone.');
    } catch (error) {
      setPushMessage(`❌ ${error.message}`);
    }
  };

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


// --- STANY I FUNKCJA DLA RAPORTU Z WCZORAJ ---
  const [showYesterdayModal, setShowYesterdayModal] = useState(false);
  const [yesterdayReportMessage, setYesterdayReportMessage] = useState('');
  const [yesterdayCalculatedStats, setYesterdayCalculatedStats] = useState(null);

  const handleOpenYesterdayReport = () => {
    // 1. Obliczamy wczorajszą datę
    const yDate = parseLocalDate(todayStr);
    yDate.setDate(yDate.getDate() - 1);
    const yStr = formatDateStr(yDate);

    let totalTasks = 0; let doneTasks = 0;
    let healthTotal = 0; let healthDone = 0;
    let points = 0;

    // 2. Filtrujemy i sprawdzamy zadania z wczoraj
    tasks.forEach(t => {
      const applies = (t.repeat && t.repeat !== 'once') 
        ? taskAppliesToDate(t, yStr) 
        : (t.dueDate === yStr || t.completedAt === yStr || (!t.isCompleted && t.dueDate < yStr));

      if (applies) {
        totalTasks++;
        const isHealth = t.category === 'Zdrowie' || t.category === 'Sport';
        if (isHealth) healthTotal++;

        let actuallyDone = false;
        if (t.repeat && t.repeat !== 'once') {
          actuallyDone = Boolean(t.completedDates && t.completedDates[yStr]);
        } else {
          actuallyDone = Boolean(t.isCompleted && (t.completedAt === yStr || t.dueDate <= yStr));
        }

        if (actuallyDone) {
          doneTasks++;
          if (isHealth) healthDone++;
          points += (t.pkt || 20) + (checkStreakBonus(t.id, yStr) ? 10 : 0);
        }
      }
    });

    // 3. Dodajemy Aktywności/Treningi z wczoraj
    workouts.filter(w => w.date === yStr).forEach(w => {
      points += (w.pkt || 0);
      const isSport = ['run', 'bike', 'walk_km', 'pushups', 'pullups', 'squats', 'situps', 'gym', 'steps', 'no_sweets'].includes(w.type);
      if (isSport) {
        healthTotal++;
        healthDone++;
      }
    });

    const finalStats = { points, totalTasks, doneTasks, healthDone, healthTotal };
    
    // Zapisujemy prawdziwe dane i odpalamy trenera
    setYesterdayCalculatedStats(finalStats);
    setYesterdayReportMessage(getYesterdayReview(finalStats));
    setShowYesterdayModal(true);
  };

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
    return [];
  });

  // Niewykonane zadania jednorazowe automatycznie przechodzą na bieżący dzień.
  useEffect(() => {
    // Aktualizacja jest celową migracją stanu wywołaną zmianą dnia aplikacji.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTasks((currentTasks) => {
      let changed = false;
      const updated = currentTasks.map((task) => {
        if ((!task.repeat || task.repeat === 'once') && !task.isCompleted && task.dueDate && task.dueDate < todayStr) {
          changed = true;
          return {
            ...task,
            carriedFrom: task.carriedFrom || task.dueDate,
            carriedCount: (task.carriedCount || 0) + 1,
            dueDate: todayStr,
          };
        }
        return task;
      });
      return changed ? updated : currentTasks;
    });
  }, [todayStr]);

  const [workouts, setWorkouts] = useState(() => {
    const savedWorkouts = localStorage.getItem('discipline_workouts');
    if (savedWorkouts) return JSON.parse(savedWorkouts);
    return [];
  });

  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem('discipline_goals');
    if (savedGoals) return JSON.parse(savedGoals);
    return [];
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

  // --- NOWE STANY DLA INBOXA, CZYTANIA I ZŁOŻONYCH TRENINGÓW ---
  const [inbox, setInbox] = useState(() => {
    const saved = localStorage.getItem('discipline_inbox');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => localStorage.setItem('discipline_inbox', JSON.stringify(inbox)), [inbox]);
  const [showInboxAddModal, setShowInboxAddModal] = useState(false);
  const [showInboxListModal, setShowInboxListModal] = useState(false);
  const [inboxText, setInboxText] = useState('');

  const [showAddReadingModal, setShowAddReadingModal] = useState(false);
  const [readingData, setReadingData] = useState({ goalId: '', manualTitle: '', type: 'read_book', amount: '', optionalPages: '' });

  const [selectedSportWorkouts, setSelectedSportWorkouts] = useState({});
  const [multiWorkoutStep, setMultiWorkoutStep] = useState(1); // <--- TĘ LINIJKĘ DODAJEMY

  // --- STANY DLA TYGODNIOWEGO PRZEGLĄDU ---

  // --- STANY DLA TYGODNIOWEGO PRZEGLĄDU ---
  const [showWeeklyReviewModal, setShowWeeklyReviewModal] = useState(false);
  const [weeklyReviewData, setWeeklyReviewData] = useState(() => {
    const saved = localStorage.getItem('discipline_weekly_review');
    return saved ? JSON.parse(saved) : { success: '', improvement: '', priorities: '' };
  });
  useEffect(() => localStorage.setItem('discipline_weekly_review', JSON.stringify(weeklyReviewData)), [weeklyReviewData]);
  // -----------------------------------------------------------

  const [goalWizardStep, setGoalWizardStep] = useState(0); 
  const [wizardData, setWizardData] = useState({
    categoryKey: '',  
    type: '',         
    targetUnit: 'days',
    title: '',
    target: '',
    dueDate: getAppDayString(),
    isDaily: false,
    purpose: '',
    createTask: false,
    taskRepeat: 'daily',
    customDates: [],
    taskTitle: '',
    taskAmount: '',
    taskDifficulty: 'medium',
    taskDuration: '',
    bookTotalPages: '' 
  });

  const openGoalWizard = () => {
    setWizardData({
      categoryKey: '', type: '', targetUnit: 'days', title: '', target: '', 
      dueDate: getAppDayString(), isDaily: false, purpose: '',
      createTask: false, taskRepeat: 'daily', taskTitle: '', customDates: [],
      taskAmount: '', taskDifficulty: 'medium', taskDuration: '',
      bookTotalPages: ''
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

  const getTypeIcon = (typeId) => {
    if (typeId === 'no_sweets') return <ShieldCheck className="w-8 h-8 mb-2 mx-auto text-amber-500" />;
    if (typeId === 'water') return <Zap className="w-8 h-8 mb-2 mx-auto text-sky-500" />;
    if (typeId === 'sleep') return <Moon className="w-8 h-8 mb-2 mx-auto text-indigo-400" />;
    if (typeId === 'walk_km' || typeId === 'run') return <Footprints className="w-8 h-8 mb-2 mx-auto text-emerald-500" />;
    if (typeId === 'bike' || typeId === 'stretching' || typeId === 'gym') return <Activity className="w-8 h-8 mb-2 mx-auto text-orange-500" />;
    if (typeId === 'pullups' || typeId === 'pushups' || typeId === 'squats' || typeId === 'situps') return <Dumbbell className="w-8 h-8 mb-2 mx-auto text-slate-400" />;
    if (typeId === 'study' || typeId === 'language' || typeId === 'course') return <Brain className="w-8 h-8 mb-2 mx-auto text-purple-500" />;
    if (typeId === 'deep_work' || typeId === 'project') return <Laptop className="w-8 h-8 mb-2 mx-auto text-slate-500" />;
    if (typeId === 'read_book' || typeId === 'read_chapters') return <BookOpen className="w-8 h-8 mb-2 mx-auto text-sky-500" />;
    return <Target className="w-8 h-8 mb-2 mx-auto text-emerald-500" />;
  };

  const [activityGoalId, setActivityGoalId] = useState('');
  const [activityPages, setActivityPages] = useState('');

  const [editingTask, setEditingTask] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);

  const [confirmDeleteModal, setConfirmDeleteModal] = useState(null);
  const [deleteAssociatedTasks, setDeleteAssociatedTasks] = useState(false);
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

  // --- KONFIGURACJA GOOGLE DRIVE ---
  const [isGoogleAuthorized, setIsGoogleAuthorized] = useState(false);
  const [googleBackupStatus, setGoogleBackupStatus] = useState('');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(() => localStorage.getItem('discipline_auto_backup') !== 'false');
  const tokenClientRef = useRef(null);
  const googleInitPromiseRef = useRef(null);
  const importFileRef = useRef(null);

  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false); // <--- do restartu aplikacji

  const initializeGoogle = () => {
    if (googleInitPromiseRef.current) return googleInitPromiseRef.current;

    googleInitPromiseRef.current = (async () => {
      if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
        throw new Error('Brak VITE_GOOGLE_CLIENT_ID lub VITE_GOOGLE_API_KEY w buildzie aplikacji.');
      }

      await Promise.all([
        loadGoogleScript(
          'https://apis.google.com/js/api.js',
          () => Boolean(window.gapi?.load),
          'Google API'
        ),
        loadGoogleScript(
          'https://accounts.google.com/gsi/client',
          () => Boolean(window.google?.accounts?.oauth2),
          'Google Identity Services'
        ),
      ]);

      await loadGapiClient();
      await window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        discoveryDocs: [GOOGLE_DISCOVERY_DOC],
      });

      const storedToken = getStoredGoogleAccessToken();
      if (storedToken) {
        window.gapi.client.setToken(storedToken);
        setIsGoogleAuthorized(true);
      }

      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_DRIVE_SCOPE,
        callback: (tokenResponse) => {
          if (tokenResponse?.error) {
            setIsGoogleAuthorized(false);
            setGoogleBackupStatus(`❌ Logowanie Google: ${getGoogleErrorMessage(tokenResponse)}`);
            return;
          }
          if (!tokenResponse?.access_token || !window.google.accounts.oauth2.hasGrantedAllScopes(tokenResponse, GOOGLE_DRIVE_SCOPE)) {
            setIsGoogleAuthorized(false);
            setGoogleBackupStatus('❌ Nie przyznano dostępu do kopii na Dysku Google.');
            return;
          }
          saveGoogleAccessToken(tokenResponse);
          window.gapi.client.setToken(tokenResponse);
          setIsGoogleAuthorized(true);
          setGoogleBackupStatus('✅ Połączono z Dyskiem Google.');
          setTimeout(() => setGoogleBackupStatus(''), 3000);
        },
        error_callback: (error) => {
          const message = error?.type === 'popup_closed'
            ? 'Okno logowania zostało zamknięte.'
            : error?.type === 'popup_failed_to_open'
              ? 'Przeglądarka zablokowała okno logowania.'
              : getGoogleErrorMessage(error);
          setGoogleBackupStatus(`❌ ${message}`);
        },
      });
    })().catch((error) => {
      googleInitPromiseRef.current = null;
      throw error;
    });

    return googleInitPromiseRef.current;
  };

  useEffect(() => {
    initializeGoogle().catch((error) => {
      console.error('Nie udało się zainicjalizować Google:', error);
      setGoogleBackupStatus(`❌ Google Drive: ${getGoogleErrorMessage(error)}`);
    });
  }, []);

  const handleAuthClick = async () => {
    setGoogleBackupStatus('Łączenie z Google...');
    try {
      await initializeGoogle();
      const prompt = window.gapi.client.getToken() === null ? 'consent' : '';
      tokenClientRef.current.requestAccessToken({ prompt });
    } catch (error) {
      console.error('Błąd logowania Google:', error);
      setGoogleBackupStatus(`❌ Google Drive: ${getGoogleErrorMessage(error)}`);
    }
  };
  const handleSignoutClick = () => {
    const token = window.gapi?.client?.getToken();
    const finishSignout = () => {
      clearStoredGoogleAccessToken();
      window.gapi?.client?.setToken('');
      setIsGoogleAuthorized(false);
      setGoogleBackupStatus('Wylogowano konto Google.');
    };

    if (token?.access_token) {
      window.google.accounts.oauth2.revoke(token.access_token, finishSignout);
    } else {
      finishSignout();
    }
  };

  const backupToGoogleDrive = async ({ silent = false } = {}) => {
    if (!silent) setGoogleBackupStatus('Tworzenie kopii...');
    try {
      const fileContent = JSON.stringify(createBackupDocument());
      const fileMetadata = {
        name: 'discipline_app_backup.json',
        mimeType: 'application/json'
      };

      // 2. Budujemy zapytanie Multipart (aby wgrać plik z zawartością)
      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";
      
      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(fileMetadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        fileContent +
        close_delim;

      const existing = await window.gapi.client.drive.files.list({
        q: "name='discipline_app_backup.json' and trashed=false",
        spaces: 'drive',
        fields: 'files(id)',
        orderBy: 'modifiedTime desc',
        pageSize: 1,
      });
      const existingFileId = existing.result.files?.[0]?.id;

      await window.gapi.client.request({
        path: existingFileId ? `/upload/drive/v3/files/${existingFileId}` : '/upload/drive/v3/files',
        method: existingFileId ? 'PATCH' : 'POST',
        params: { uploadType: 'multipart' },
        headers: { 'Content-Type': 'multipart/related; boundary="' + boundary + '"' },
        body: multipartRequestBody
      });

      localStorage.setItem('discipline_last_backup_at', new Date().toISOString());
      if (!silent) {
        setGoogleBackupStatus('✅ Sukces! Zapisano na Dysku Google.');
        setTimeout(() => setGoogleBackupStatus(''), 3000);
      }
    } catch (err) {
      console.error(err);
      const message = getGoogleErrorMessage(err);
      if (err?.status === 401 || err?.result?.error?.code === 401) {
        clearStoredGoogleAccessToken();
        window.gapi?.client?.setToken('');
        setIsGoogleAuthorized(false);
      }
      if (!silent || err?.status === 401 || err?.result?.error?.code === 401) {
        setGoogleBackupStatus(`❌ Nie zapisano kopii: ${message}`);
      }
    }
  };

  const exportDataToJson = () => {
    downloadBackupDocument();
    setGoogleBackupStatus('✅ Wyeksportowano dane do pliku JSON.');
    setTimeout(() => setGoogleBackupStatus(''), 3000);
  };

  const importDataFromJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const document = JSON.parse(await file.text());
      const restoredCount = restoreBackupDocument(document);
      setGoogleBackupStatus(`✅ Przywrócono ${restoredCount} elementów. Odświeżanie...`);
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      setGoogleBackupStatus(`❌ ${error.message}`);
    } finally {
      event.target.value = '';
    }
  };

  // --- FUNKCJA RESETU APLIKACJI ---
  const executeFactoryReset = () => {
    const keysToRemove = [];
    // Szukamy wszystkich kluczy w przeglądarce zaczynających się od 'discipline_'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('discipline_')) {
        keysToRemove.push(key);
      }
    }
    // Usuwamy je
    keysToRemove.forEach(k => localStorage.removeItem(k));
    // Przeładowujemy stronę (aplikacja uruchomi się z pustymi danymi)
    window.location.reload();
  };
  // ----------------------------------------------

  const restoreFromGoogleDrive = async () => {
    setGoogleBackupStatus('Szukanie kopii...');
    try {
      // Szukamy pliku na dysku
      const response = await window.gapi.client.drive.files.list({
        q: "name='discipline_app_backup.json' and trashed=false",
        spaces: 'drive',
        fields: 'files(id, name)',
        orderBy: 'createdTime desc'
      });

      const files = response.result.files;
      if (!files || files.length === 0) {
        setGoogleBackupStatus('❌ Nie znaleziono pliku kopii zapasowej.');
        return;
      }

      setGoogleBackupStatus('Pobieranie danych...');
      const fileId = files[0].id;
      
      const fileData = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      const restoredData = typeof fileData.result === 'string' ? JSON.parse(fileData.result) : fileData.result;
      restoreBackupDocument(restoredData);

      setGoogleBackupStatus('✅ Sukces! Odświeżanie...');
      setTimeout(() => window.location.reload(), 1000); // Przeładowujemy, aby wczytać stany

    } catch (err) {
      console.error(err);
      if (err?.status === 401 || err?.result?.error?.code === 401) {
        clearStoredGoogleAccessToken();
        window.gapi?.client?.setToken('');
        setIsGoogleAuthorized(false);
      }
      setGoogleBackupStatus(`❌ Nie pobrano kopii: ${getGoogleErrorMessage(err)}`);
    }
  };
  // ----------------------------------------------

  const [lastCheckedLevel, setLastCheckedLevel] = useState(() => {
    const saved = localStorage.getItem('discipline_last_checked_level');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [levelUpModalData, setLevelUpModalData] = useState(null);

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

  // Lokalne powiadomienia, gdy aplikacja jest uruchomiona.
  useEffect(() => {
    const checkReminders = async () => {
      const now = new Date();
      const currentTimeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      // Web Push jest jedynym nadawcą zaplanowanych przypomnień, gdy pełne
      // powiadomienia w tle są aktywne. Lokalny timer pozostaje fallbackiem.
      const shouldShowLocalNotification = pushStatus !== 'enabled' && pushStatus !== 'checking';
      
      if (now.getDay() === 1 && now.getHours() >= 8) {
         const reviewNotified = localStorage.getItem('discipline_weekly_review_date');
         if (reviewNotified !== todayStr) {
             setShowWeeklyReviewModal(true);
             localStorage.setItem('discipline_weekly_review_date', todayStr);
             if (shouldShowLocalNotification && notificationStatus === 'granted') {
                await showAppNotification('Tygodniowy Przegląd! 🏆', { body: 'Czas podsumować ubiegły tydzień i zaplanować nowe zwycięstwa.', tag: `weekly-review-${todayStr}` });
             }
         }
      }

      if (currentTimeStr === '21:00') {
        const notified = localStorage.getItem('discipline_daily_plan_notified');
        if (notified !== todayStr && shouldShowLocalNotification && notificationStatus === 'granted') {
          await showAppNotification('Czas zaplanować jutro! 🗓️', { body: 'Przejrzyj swoje zadania i zaplanuj kolejny dzień, by utrzymać dyscyplinę.', tag: `daily-plan-${todayStr}` });
          localStorage.setItem('discipline_daily_plan_notified', todayStr);
        }
      }

      for (const t of tasks) {
        if (t.hasReminder && t.reminderTime === currentTimeStr && taskAppliesToDate(t, todayStr)) {
          const isDone = isTaskDoneForDate(t, todayStr);
          if (!isDone && t.lastNotifiedDate !== todayStr && shouldShowLocalNotification && notificationStatus === 'granted') {
            await showAppNotification('Przypomnienie o zadaniu! ⚡', { body: `Czas na wykonanie: "${t.title}"`, tag: `task-${t.id}-${todayStr}` });
            setTasks(prev => prev.map(item => item.id === t.id ? { ...item, lastNotifiedDate: todayStr } : item));
          }
        }
      }
    };

    checkReminders();
    const reminderInterval = setInterval(checkReminders, 30000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setNotificationStatus(getNotificationStatus());
        checkReminders();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(reminderInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tasks, todayStr, notificationStatus, pushStatus]);

  useEffect(() => localStorage.setItem('discipline_tasks_unified', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('discipline_workouts', JSON.stringify(workouts)), [workouts]);
  useEffect(() => localStorage.setItem('discipline_goals', JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem('discipline_notes', JSON.stringify(notes)), [notes]);

  useEffect(() => {
    if (pushStatus !== 'enabled' || !getPushApiUrl()) return undefined;
    const timer = setTimeout(() => {
      syncPushReminders(tasks).catch((error) => setPushMessage(`Błąd synchronizacji: ${error.message}`));
    }, 1500);
    return () => clearTimeout(timer);
  }, [tasks, pushStatus]);

// --- STANY DLA BIBLIOTEKI KSIĄŻEK ---
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem('discipline_books');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => localStorage.setItem('discipline_books', JSON.stringify(books)), [books]);

  useEffect(() => {
    if (!isGoogleAuthorized || !autoBackupEnabled) return undefined;
    const timer = setTimeout(() => backupToGoogleDrive({ silent: true }), 12000);
    return () => clearTimeout(timer);
  // Kopia uruchamia się dopiero po zmianie danych, a nie po każdym renderze.
  }, [tasks, workouts, goals, notes, inbox, weeklyReviewData, books, userName, userGender, theme, fontSizeLevel, resetTime, categories, isGoogleAuthorized, autoBackupEnabled]);

  const [showBooksModal, setShowBooksModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newBookData, setNewBookData] = useState({ title: '', totalPages: '', status: 'planned' });

  const handleAddBook = (e) => {
    e.preventDefault();
    if (!newBookData.title.trim()) return;
    const newBook = {
      id: Date.now(),
      title: newBookData.title.trim(),
      totalPages: parseInt(newBookData.totalPages) || null,
      status: newBookData.status,
      createdAt: todayStr
    };
    setBooks([newBook, ...books]);
    setNewBookData({ title: '', totalPages: '', status: 'planned' });
    setShowAddBookModal(false);
  };

  const changeBookStatus = (id, status) => {
    setBooks(books.map(b => b.id === id ? { ...b, status } : b));
  };

  const deleteBook = (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę książkę z biblioteki?')) {
      setBooks(books.filter(b => b.id !== id));
    }
  };
  // -----------------------------------------------------------


  // LOGIKA STOPERÓW ODPORNA NA ZABLOKOWANY EKRAN (oparta na Date.now())
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTasks(prev => {
        let updated = false;
        const newTasks = prev.map(t => {
          if (t.isRunning && t.timeLeft > 0) {
            const elapsedSeconds = Math.floor((now - (t.lastTick || now)) / 1000);
            if (elapsedSeconds > 0) {
              updated = true;
              const newTime = Math.max(0, t.timeLeft - elapsedSeconds);
              const isFinished = newTime === 0;
              const newCompletedDates = { ...(t.completedDates || {}) };
              if (isFinished && t.repeat && t.repeat !== 'once') {
                newCompletedDates[todayStr] = true;
              }
              return {
                ...t,
                timeLeft: newTime,
                lastTick: now, 
                isCompleted: isFinished ? (t.repeat && t.repeat !== 'once' ? t.isCompleted : true) : t.isCompleted,
                completedDates: newCompletedDates,
                isRunning: isFinished ? false : t.isRunning
              };
            }
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
        return { ...t, isRunning: !t.isRunning, lastTick: !t.isRunning ? Date.now() : t.lastTick };
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
    else if (type === 'goal') {
      setGoals(goals.filter(g => g.id !== id));
      if (deleteAssociatedTasks) {
         setTasks(tasks.filter(t => t.goalId !== id)); 
      }
    }

    setConfirmDeleteModal(null);
    setDeleteAssociatedTasks(false);
  };

const executeComplete = () => {
    if (!confirmCompleteModal) return;
    const { type, id, isDone, goalId, targetDate } = confirmCompleteModal;
    const dateToUse = targetDate || todayStr;

    if (type === 'task') {
      const taskToUpdate = tasks.find(t => t.id === id);
      let valToModify = 0;

      if (goalId) {
         const targetGoal = goals.find(g => g.id === goalId);
         if (targetGoal && !targetGoal.isDaily) {
             if (!isDone) {
                 // Zadanie zaznaczane: pobieramy wartość z inputa i DODAJEMY do celu
                 const finalTaskValue = completeTaskValue === '' ? '1' : completeTaskValue;
                 valToModify = parseFloat(finalTaskValue) || 0;
                 if (valToModify > 0) {
                     setGoals(prev => prev.map(g => g.id === targetGoal.id ? { ...g, currentPage: Math.min(g.target, (g.currentPage || 0) + valToModify) } : g));
                 }
             } else {
                 // Zadanie cofane: odczytujemy zapisaną wartość i ODEJMUJEMY od celu (automatycznie)
                 valToModify = taskToUpdate?.goalProgressHistory?.[dateToUse] || 0;
                 if (valToModify > 0) {
                     setGoals(prev => prev.map(g => g.id === targetGoal.id ? { ...g, currentPage: Math.max(0, (g.currentPage || 0) - valToModify) } : g));
                 }
             }
         }
      }

      // Aktualizacja statusu zadania oraz historii postępu
      setTasks(prev => prev.map(t => {
        if (t.id === id) {
          const newHistory = { ...(t.goalProgressHistory || {}) };
          if (!isDone) {
              if (valToModify > 0) newHistory[dateToUse] = valToModify; // Zapisuje, ile dodałeś do celu
          } else {
              delete newHistory[dateToUse]; // Czyścimy pamięć po cofnięciu
          }

          if (t.repeat && t.repeat !== 'once') {
            const currentDone = Boolean(t.completedDates && t.completedDates[dateToUse]);
            const updatedDates = { ...(t.completedDates || {}), [dateToUse]: !currentDone };
            return { ...t, completedDates: updatedDates, isRunning: false, goalProgressHistory: newHistory };
          } else {
            const currentDone = Boolean(t.isCompleted);
            return { ...t, isCompleted: !currentDone, completedAt: !currentDone ? dateToUse : null, isRunning: false, goalProgressHistory: newHistory };
          }
        }
        return t;
      }));
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
      isRunning: false,
      lastTick: null
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

const handleMultiWorkoutSubmit = (e) => {
    e.preventDefault();
    const entries = Object.entries(selectedSportWorkouts);
    if(entries.length === 0) return;

    let newWorkoutsArr = [];
    let goalsCopy = [...goals];

    entries.forEach(([wType, wAmountStr]) => {
        const amountVal = parseFloat(wAmountStr);
        if (isNaN(amountVal) || amountVal <= 0) return;

        let calculatedPkt = 20; let unit = 'km';
        if (wType === 'run') { calculatedPkt = Math.round(amountVal * 10); unit = 'km'; }
        else if (wType === 'walk_km') { calculatedPkt = Math.round(amountVal * 5); unit = 'km'; }
        else if (wType === 'pushups') { calculatedPkt = Math.round((amountVal / 10) * 2); unit = 'powt.'; }
        else if (wType === 'pullups') { calculatedPkt = Math.round((amountVal / 5) * 2); unit = 'powt.'; }
        else if (wType === 'squats') { calculatedPkt = Math.round((amountVal / 20) * 2); unit = 'powt.'; }
        else if (wType === 'situps') { calculatedPkt = Math.round((amountVal / 15) * 2); unit = 'powt.'; }
        else if (wType === 'bike') { calculatedPkt = Math.round(amountVal * 5); unit = 'km'; }
        else if (wType === 'gym' || wType === 'stretching') { calculatedPkt = Math.round(amountVal * 3); unit = 'min'; }

        const newWorkoutObj = {
            id: Date.now() + Math.random(),
            date: todayStr,
            type: wType,
            amount: amountVal,
            unit,
            pkt: calculatedPkt,
            goalId: newWorkoutGoalId ? parseInt(newWorkoutGoalId) : null
        };
        newWorkoutsArr.push(newWorkoutObj);

        if (newWorkoutGoalId) {
            const goalIndex = goalsCopy.findIndex(g => g.id === parseInt(newWorkoutGoalId));
            if (goalIndex !== -1 && !goalsCopy[goalIndex].isDaily) {
                goalsCopy[goalIndex] = { ...goalsCopy[goalIndex], currentPage: Math.min(goalsCopy[goalIndex].target, (goalsCopy[goalIndex].currentPage || 0) + amountVal) };
            }
        }
    });

    if (newWorkoutsArr.length > 0) {
        setWorkouts(prev => [...newWorkoutsArr, ...prev]);
        setGoals(goalsCopy);
    }
    setSelectedSportWorkouts({});
    setNewWorkoutGoalId('');
    setShowAddWorkoutModal(false);
  };

  const addReading = (e) => {
    e.preventDefault();
    const amountVal = parseFloat(readingData.amount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    let calculatedPkt = readingData.type === 'read_book' ? Math.round(amountVal * 1) : Math.round(amountVal * 5);
    let unit = readingData.type === 'read_book' ? 'stron' : 'rozdziałów';
    let titlePrefix = readingData.goalId ? goals.find(g=>g.id.toString()===readingData.goalId)?.title : readingData.manualTitle;

    const baseId = Date.now();
    const newWorkoutObj = {
        id: baseId, date: todayStr, type: readingData.type, amount: amountVal, unit, pkt: calculatedPkt,
        goalId: readingData.goalId ? parseInt(readingData.goalId) : null,
        customTitle: titlePrefix
    };

    let addedWorkouts = [newWorkoutObj];

    // Jeśli rozdziały + dodano też opcjonalne strony, utwórz drugi wpis dla statystyk
    if (readingData.type === 'read_chapters' && readingData.optionalPages) {
        const optVal = parseFloat(readingData.optionalPages);
        if (!isNaN(optVal) && optVal > 0) {
            addedWorkouts.push({
                id: baseId + 1, date: todayStr, type: 'read_book', amount: optVal, unit: 'stron',
                pkt: Math.round(optVal * 1), goalId: readingData.goalId ? parseInt(readingData.goalId) : null,
                customTitle: titlePrefix
            });
        }
    }

    let goalsCopy = [...goals];
    if (readingData.goalId) {
       const goalIndex = goalsCopy.findIndex(g => g.id.toString() === readingData.goalId);
       if (goalIndex !== -1 && !goalsCopy[goalIndex].isDaily) {
           goalsCopy[goalIndex] = { ...goalsCopy[goalIndex], currentPage: Math.min(goalsCopy[goalIndex].target, (goalsCopy[goalIndex].currentPage || 0) + amountVal) };
       }
    }
    setWorkouts(prev => [...addedWorkouts, ...prev]);
    setGoals(goalsCopy);
    setReadingData({ goalId: '', manualTitle: '', type: 'read_book', amount: '', optionalPages: '' });
    setShowAddReadingModal(false);
  };

  const addInboxItem = (e) => {
    e.preventDefault();
    if(!inboxText.trim()) return;
    setInbox([{ id: Date.now(), text: inboxText, createdAt: todayStr }, ...inbox]);
    setInboxText('');
    setShowInboxAddModal(false);
  };

  const promoteInboxItem = (item, toWizard = false) => {
    setInbox(inbox.filter(i => i.id !== item.id));
    setShowInboxListModal(false);
    if (toWizard) {
       setWizardData({...wizardData, title: item.text});
       openGoalWizard();
    } else {
       setNewTaskTitle(item.text);
       setShowAddTaskModal(true);
    }
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
       setGoalWizardStep(2); 
    } 
    else if (goalWizardStep === 3) {
      let errs = {};
      if (!wizardData.title.trim()) errs.wizardTitle = true;
      if (!wizardData.target || parseFloat(wizardData.target) <= 0) errs.wizardTarget = true;
      if (!wizardData.type) errs.wizardType = true;

      if (Object.keys(errs).length > 0) {
        setFormErrors(prev => ({...prev, ...errs}));
        return;
      }
      
      // Przechodzimy do nowego kroku 4: PURPOSE (Dlaczego?)
      setGoalWizardStep(4); 
    }
    else if (goalWizardStep === 4) {
      let errs = {};
      if (!wizardData.purpose.trim()) errs.wizardPurpose = true; // Wymuszamy znalezienie powodu!
      
      if (Object.keys(errs).length > 0) {
        setFormErrors(prev => ({...prev, ...errs}));
        return;
      }

      if (wizardData.type === 'no_sweets' && wizardData.targetUnit === 'hours') {
         finalizeWizard(true);
         return;
      }
      
      let generatedTaskTitle = `Praca nad: ${wizardData.title.trim()}`;
      if (wizardData.categoryKey === 'book') generatedTaskTitle = `Czytanie: ${wizardData.title.trim()}`;
      if (wizardData.categoryKey === 'sport') generatedTaskTitle = `Trening: ${wizardData.title.trim()}`;
      
      setWizardData({...wizardData, taskTitle: generatedTaskTitle});
      setGoalWizardStep(5); // Krok "Synergia" przesuwa się na pozycję 5
    }
    else if (goalWizardStep === 6) { // Finalny krok zadania to teraz 6
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
      targetUnit: wizardData.targetUnit,
      target: targetVal,
      currentPage: 0,
      dueDate: wizardData.isDaily ? null : wizardData.dueDate,
      isDaily: wizardData.isDaily,
      comment: wizardData.purpose.trim(),
      totalPages: wizardData.categoryKey === 'book' && wizardData.type === 'read_chapters' ? (parseInt(wizardData.bookTotalPages) || null) : null
    };
    
    setGoals(prev => [...prev, newGoal]);

    const shouldCreateTask = forceCreateTask !== null ? forceCreateTask : wizardData.createTask;

    if (wizardData.type === 'no_sweets' && wizardData.targetUnit === 'hours') {
       const durationMin = targetVal * 60; 
       const newTask = {
         id: Date.now() + 1,
         title: `Wyzwanie: ${wizardData.title.trim()} (${targetVal}h)`,
         category: catConfig.dbCat,
         goalId: newGoal.id,
         pkt: Math.min(50, Math.max(20, targetVal * 2)), 
         difficulty: 'hard',
         repeat: 'once',
         intervalDays: 1,
         customDates: [],
         dueDate: todayStr,
         duration: durationMin,
         hasReminder: false,
         reminderTime: '08:00',
         createdAt: todayStr,
         isCompleted: false,
         completedDates: {},
         timeLeft: durationMin * 60, 
         isRunning: false, 
         lastTick: null
       };
       setTasks(prev => [...prev, newTask]);
    } 
    else if (shouldCreateTask && wizardData.taskTitle) {
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
         customDates: wizardData.taskRepeat === 'custom' ? wizardData.customDates : [],
         dueDate: wizardData.dueDate,
         duration: durationMin,
         hasReminder: false,
         reminderTime: '08:00',
         createdAt: todayStr,
         isCompleted: false,
         completedDates: {},
         timeLeft: durationMin * 60,
         isRunning: false,
         lastTick: null
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
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
        return h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }
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

  const totalPKT = calculateTotalPoints({
    tasks,
    workouts,
    goals,
    todayStr,
    hasStreakBonus: checkStreakBonus,
  });
  const levelInfo = getLevelInfo(totalPKT, RANKS, MAX_LEVEL);

  useEffect(() => {
    let totalTaskCompletions = 0;
    const activeDates = new Set();
    const completedCategories = new Set();

    tasks.forEach(t => {
      if(t.repeat && t.repeat !== 'once') {
        Object.entries(t.completedDates || {}).forEach(([date, isCompleted]) => {
          if (!isCompleted) return;
          totalTaskCompletions++;
          activeDates.add(date);
          if (t.category) completedCategories.add(t.category);
        });
      } else if (t.isCompleted) {
        totalTaskCompletions++;
        if (t.completedAt || t.dueDate) activeDates.add(t.completedAt || t.dueDate);
        if (t.category) completedCategories.add(t.category);
      }
    });

    workouts.forEach(workout => {
      if (workout.date) activeDates.add(workout.date);
    });

    const totalWorkoutsCount = workouts.length;
    const completedGoalsCount = goals.filter(goal => {
      if (goal.isDaily || !goal.target) return false;
      const isProgressType = ['read_book', 'read_chapters', 'study', 'no_sweets'].includes(goal.type);
      const currentValue = isProgressType
        ? (goal.currentPage || 0)
        : workouts.filter(workout => workout.type === goal.type).reduce((sum, workout) => sum + workout.amount, 0);
      return currentValue >= goal.target;
    }).length;
    const trophyMetrics = {
      tasks: totalTaskCompletions,
      workouts: totalWorkoutsCount,
      level: levelInfo.level,
      notes: Object.values(notes).filter(note => typeof note === 'string' && note.trim()).length,
      goals: completedGoalsCount,
      activeDays: activeDates.size,
      reading: workouts.filter(workout => ['read_book', 'read_chapters'].includes(workout.type)).length,
      categories: completedCategories.size,
      points: totalPKT,
    };

    const newlyEarned = [];
    const updatedTrophies = { ...earnedTrophies };

    const checkAndAward = (id, condition) => {
      if (!updatedTrophies[id] && condition) {
        updatedTrophies[id] = todayStr;
        newlyEarned.push(id);
      }
    };

    TROPHIES.forEach(trophy => {
      checkAndAward(trophy.id, trophyMetrics[trophy.metric] >= trophy.target);
    });

    if (newlyEarned.length > 0) {
      setEarnedTrophies(updatedTrophies);
      localStorage.setItem('discipline_trophies', JSON.stringify(updatedTrophies));
      const latestTrophy = TROPHIES.find(t => t.id === newlyEarned[newlyEarned.length - 1]);
      setNewTrophyModal({ ...latestTrophy, isNew: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, workouts, goals, notes, levelInfo.level, totalPKT, todayStr]);

  const handleShareTrophy = async (trophy) => {
    const earnedDate = earnedTrophies[trophy.id];
    if (!earnedDate) return;

    const rankName = trophy.rank === 'gold' ? 'Złote' : trophy.rank === 'silver' ? 'Srebrne' : 'Brązowe';
    const formattedDate = parseLocalDate(earnedDate).toLocaleDateString('pl-PL');
    const textToShare = `${rankName} trofeum „${trophy.title}” zdobyte ${formattedDate} w aplikacji SamoDyscyplina! 🏆🔥`;
    
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

  const priorityTasks = allTodayTasks.filter((task) => task.isPriority).slice(0, 3);
  const priorityTaskIds = new Set(priorityTasks.map((task) => task.id));
  const regularTodayTasks = allTodayTasks.filter((task) => !priorityTaskIds.has(task.id));
  const regularCompletedTodayCount = regularTodayTasks.filter((task) => isTaskDoneForDate(task, todayStr)).length;

  const toggleTaskPriority = (taskId) => {
    const selectedTask = tasks.find((task) => task.id === taskId);
    if (!selectedTask?.isPriority && priorityTasks.length >= 3) {
      alert('Możesz wybrać maksymalnie 3 najważniejsze zadania na dziś.');
      return;
    }
    setTasks((currentTasks) => currentTasks.map((task) =>
      task.id === taskId ? { ...task, isPriority: !task.isPriority } : task));
  };

  const upcomingTasks = tasks.filter(t => {
    if (t.repeat === 'daily') return false; 
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

  // Funkcja obliczania statystyk tygodniowych
  const getWeeklyStats = () => {
    const todayD = parseLocalDate(todayStr);
    const startD = new Date(todayD);
    startD.setDate(todayD.getDate() - 7);
    const startStr = formatDateStr(startD);

    let pts = 0; let tCount = 0; let wCount = 0;

    tasks.forEach(t => {
      if (t.repeat && t.repeat !== 'once' && t.completedDates) {
        Object.entries(t.completedDates).forEach(([dStr, isDone]) => {
          if (isDone && dStr >= startStr && dStr < todayStr) {
            tCount++; pts += (t.pkt || 20) + (checkStreakBonus(t.id, dStr) ? 10 : 0);
          }
        });
      } else if (t.isCompleted && t.completedAt && t.completedAt >= startStr && t.completedAt < todayStr) {
        tCount++; pts += (t.pkt || 20);
      }
    });

    workouts.forEach(w => {
      if (w.date >= startStr && w.date < todayStr) { wCount++; pts += (w.pkt || 0); }
    });
    return { pts, tCount, wCount };
  };

  const getDetailedStats = (startDate, endDate) => {
    let plannedTasks = 0;
    let completedTasks = 0;
    let activityCount = 0;
    let points = 0;
    let bestDay = { date: null, points: 0 };
    const cursor = new Date(startDate);

    while (cursor <= endDate) {
      const dateString = formatDateStr(cursor);
      let dayPoints = 0;
      tasks.forEach((task) => {
        const isRecurring = task.repeat && task.repeat !== 'once';
        const planned = isRecurring
          ? taskAppliesToDate(task, dateString)
          : task.dueDate === dateString;
        if (planned) plannedTasks += 1;

        const done = isRecurring
          ? Boolean(task.completedDates?.[dateString])
          : Boolean(task.isCompleted && task.completedAt === dateString);
        if (done) {
          completedTasks += 1;
          dayPoints += (task.pkt || 20) + (isRecurring && checkStreakBonus(task.id, dateString) ? 10 : 0);
        }
      });

      const dayActivities = workouts.filter((workout) => workout.date === dateString);
      activityCount += dayActivities.length;
      dayPoints += dayActivities.reduce((sum, workout) => sum + (workout.pkt || 0), 0);
      points += dayPoints;
      if (dayPoints > bestDay.points) bestDay = { date: dateString, points: dayPoints };
      cursor.setDate(cursor.getDate() + 1);
    }

    return {
      plannedTasks,
      completedTasks,
      activityCount,
      points,
      completionRate: plannedTasks > 0 ? Math.min(100, Math.round((completedTasks / plannedTasks) * 100)) : 0,
      bestDay,
    };
  };

  const todayForStats = parseLocalDate(todayStr);
  const weekStart = new Date(todayForStats);
  weekStart.setDate(todayForStats.getDate() - 6);
  const weeklyDetailedStats = getDetailedStats(weekStart, todayForStats);

  const monthStart = new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth(), 1);
  const monthLastDay = new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth() + 1, 0);
  const monthEnd = monthLastDay > todayForStats && monthStart <= todayForStats ? todayForStats : monthLastDay;
  const monthlyDetailedStats = monthStart > todayForStats
    ? { plannedTasks: 0, completedTasks: 0, activityCount: 0, points: 0, completionRate: 0, bestDay: { date: null, points: 0 } }
    : getDetailedStats(monthStart, monthEnd);

  const renderDetailedStats = (title, stats, accentClass) => (
    <div className={'p-5 rounded-3xl border shadow-sm ' + tStyle.cardBg}>
      <h3 className={'font-bold mb-4 ' + currentFontConfig.sizeClass + ' ' + accentClass}>{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl bg-slate-500/10"><span className={currentFontConfig.smallClass + ' block ' + tStyle.subText}>Skuteczność</span><strong className="text-2xl">{stats.completionRate}%</strong></div>
        <div className="p-3 rounded-2xl bg-slate-500/10"><span className={currentFontConfig.smallClass + ' block ' + tStyle.subText}>Zadania</span><strong className="text-2xl">{stats.completedTasks}/{stats.plannedTasks}</strong></div>
        <div className="p-3 rounded-2xl bg-slate-500/10"><span className={currentFontConfig.smallClass + ' block ' + tStyle.subText}>Aktywności</span><strong className="text-2xl">{stats.activityCount}</strong></div>
        <div className="p-3 rounded-2xl bg-slate-500/10"><span className={currentFontConfig.smallClass + ' block ' + tStyle.subText}>Punkty</span><strong className="text-2xl">{stats.points}</strong></div>
      </div>
      <p className={currentFontConfig.smallClass + ' mt-3 ' + tStyle.subText}>
        Najlepszy dzień: {stats.bestDay.date ? `${stats.bestDay.date} (${stats.bestDay.points} PKT)` : 'brak danych'}
      </p>
    </div>
  );
  // --------------------------------------

  const earnedTrophiesCount = TROPHIES.filter(trophy => Boolean(earnedTrophies[trophy.id])).length;
  const isAnyModalOpen = Boolean(
    showAddGoalModal || goalWizardStep > 0 || newTrophyModal ||
    showArchiveModal || showSettingsModal || showTrophiesModal || editingTask ||
    showAddTaskModal || showAddWorkoutModal || showAddReadingModal ||
    showInboxAddModal || showInboxListModal || editingWorkout ||
    showAddActivityModal || editingGoal || showAllQuotesModal ||
    confirmDeleteModal || confirmCompleteModal || showDeleteNoteConfirm ||
    (quoteModal.show && quoteModal.data) || showRanksModal ||
    showWeeklyReviewModal || showBooksModal || showAddBookModal ||
    showResetConfirmModal || showYesterdayModal
  );

  return (
    <div className={'min-h-screen pb-32 px-4 md:px-8 pt-6 md:pt-10 max-w-md md:max-w-3xl lg:max-w-5xl mx-auto select-none transition-colors duration-300 ' + currentFontConfig.sizeClass}>
        
      {activeTab === 'today' && (
        <>
          <header className="flex justify-between items-center mb-6 md:mb-8">
            <div>
              <h1 className={currentFontConfig.headerClass + ' font-bold tracking-tight ' + tStyle.titleText}>Cześć, {userName}! 👋</h1>
              <p className={currentFontConfig.smallClass + ' md:text-base ' + tStyle.subText}>Dyscyplina buduje wolność</p>
            </div>

          <  div className="flex items-center gap-2">
              <button onClick={handleOpenYesterdayReport} className={'p-3 md:p-3.5 rounded-full border text-blue-500 active:scale-95 transition-all shadow-md ' + tStyle.cardBg} title="Raport z wczoraj">
                <History className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button onClick={() => setShowInboxListModal(true)} className={'relative p-3 md:p-3.5 rounded-full border text-violet-500 active:scale-95 transition-all shadow-md ' + tStyle.cardBg} title="Skrzynka odbiorcza (Zrzut myśli)">
                <Archive className="w-5 h-5 md:w-6 md:h-6" />
                {inbox.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-slate-900 animate-bounce">{inbox.length}</span>}
              </button>
              <button onClick={() => setShowAllQuotesModal(true)} className={'p-3 md:p-3.5 rounded-full border text-amber-500 active:scale-95 transition-all shadow-md ' + tStyle.cardBg} title="Cytaty"><Quote className="w-5 h-5 md:w-6 md:h-6" /></button>
            </div>
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

          <div className="p-4 md:p-5 rounded-3xl border border-amber-500/30 bg-amber-500/10 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className={currentFontConfig.smallClass + ' md:text-sm font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-2'}>
                <Star className="w-5 h-5 fill-amber-500" /> 3 najważniejsze zadania
              </h2>
              <span className={currentFontConfig.smallClass + ' font-bold text-amber-500'}>{priorityTasks.length}/3</span>
            </div>
            {priorityTasks.length === 0 ? (
              <p className={currentFontConfig.smallClass + ' py-2 ' + tStyle.subText}>W menu zadania wybierz „Ustaw jako priorytet”.</p>
            ) : (
              <div className="space-y-2">
                {priorityTasks.map((task, index) => {
                  const isDone = isTaskDoneForDate(task, todayStr);
                  return (
                    <div key={task.id} className={'w-full p-3 rounded-2xl border flex items-center gap-2 transition-all ' + (isDone ? 'bg-emerald-500/10 border-emerald-500/30 opacity-70' : 'bg-amber-500/10 border-amber-500/30')}>
                      <button onClick={() => { setConfirmCompleteModal({ type: 'task', id: task.id, name: task.title, isDone, goalId: task.goalId, targetDate: todayStr }); setCompleteTaskValue(''); }} className="flex items-center gap-3 text-left flex-1 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">{index + 1}</span>
                        <span className={'font-medium flex-1 ' + tStyle.titleText + (isDone ? ' line-through' : '')}>{task.title}</span>
                        {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Circle className="w-5 h-5 text-amber-500 shrink-0" />}
                      </button>
                      <button onClick={() => toggleTaskPriority(task.id)} className="p-2 rounded-xl text-amber-500 hover:bg-amber-500/20" title="Usuń z priorytetów"><Star className="w-4 h-4 fill-amber-500" /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className={'p-4 md:p-5 rounded-3xl border shadow-sm transition-all bg-slate-500/10 dark:bg-slate-500/10 border-slate-500/20'}>
              <div className="flex justify-between items-center select-none pb-2">
                <div className="flex items-center gap-2 flex-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h2 className={currentFontConfig.smallClass + ' md:text-sm font-semibold uppercase tracking-wider ' + tStyle.titleText}>
                    {priorityTasks.length > 0 ? 'Pozostałe zadania na dzisiaj' : 'Zadania na dzisiaj'}
                  </h2>
                  <span className={currentFontConfig.smallClass + ' ml-1 ' + tStyle.subText}>
                    ({priorityTasks.length > 0 ? regularCompletedTodayCount : completedTodayCount}/{priorityTasks.length > 0 ? regularTodayTasks.length : allTodayTasks.length})
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-500/25 space-y-3 animate-fadeIn">
                {regularTodayTasks.length === 0 ? (
                    <p className={'text-center py-3 opacity-60 ' + currentFontConfig.smallClass + ' ' + tStyle.subText}>{priorityTasks.length > 0 ? 'Brak pozostałych zadań na dziś.' : 'Brak zadań na dziś.'}</p>
                ) : (
<div className="space-y-3">
                     {regularTodayTasks.map((task) => {
                       const isDone = isTaskDoneForDate(task, todayStr);
                       const dailyStreak = task.repeat === 'daily' ? getTaskStreak(task.id) : 0;
                       const associatedGoal = goals.find(g => g.id === task.goalId);
                       
                       const cTheme = getCategoryTheme(task.category);

                       // --- LOGIKA OPÓŹNIONYCH ZADAŃ ---
                       let isOverdue = false;
                       let overdueDays = 0;
                       if ((!task.repeat || task.repeat === 'once') && task.dueDate && task.dueDate < todayStr && !isDone) {
                           isOverdue = true;
                           const due = parseLocalDate(task.dueDate);
                           const today = parseLocalDate(todayStr);
                           due.setHours(0,0,0,0);
                           today.setHours(0,0,0,0);
                           overdueDays = Math.round((today - due) / (1000 * 60 * 60 * 24));
                       }
                       
                       let overdueRingClass = '';
                       if (isOverdue) {
                           // Jeżeli opóźnienie jest większe niż 2 dni -> czerwona ramka, inaczej żółta
                           overdueRingClass = overdueDays > 2 
                             ? ' ring-2 ring-red-500/80 bg-red-500/10' 
                             : ' ring-2 ring-amber-500/80 bg-amber-500/10';
                       }
                       // --------------------------------

                     return (
                         <div key={task.id} onClick={() => {
                             setConfirmCompleteModal({ type: 'task', id: task.id, name: task.title, isDone, goalId: task.goalId, targetDate: todayStr });
                             setCompleteTaskValue('');
                         }} className={'flex flex-col gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer shadow-sm ' + (isDone ? `${cTheme.itemDoneBg} ${cTheme.itemBorder} opacity-75` : `${cTheme.itemBg} ${cTheme.itemBorder}`) + overdueRingClass}>
                            
                            {/* GŁÓWNY WIERSZ: Checkbox + Teksty + Menu */}
                            <div className="flex items-start justify-between w-full">
                               <div className="flex items-start gap-3 flex-1 min-w-0">
                                 <div className="mt-0.5 shrink-0">
                                   {isDone ? <CheckCircle2 className={`w-6 h-6 ${cTheme.iconText}`} /> : <Circle className="w-6 h-6 text-slate-400" />}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <div className="flex items-center gap-2 flex-wrap mb-1">
                                     <span className={'font-medium block ' + tStyle.titleText + (isDone ? ' line-through opacity-75' : '')}>{task.title}</span>
                                     
                                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cTheme.bg} ${cTheme.text} ${cTheme.border}`}>
                                       {task.category}
                                     </span>

                                     {task.carriedCount > 0 && !isDone && (
                                       <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border bg-violet-500/20 text-violet-500 border-violet-500/40">
                                         <RefreshCw className="w-3 h-3" /> Przeniesiono ({task.carriedCount})
                                       </span>
                                     )}

                                     {/* BADGE OPÓŹNIENIA */}
                                     {isOverdue && (
                                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${overdueDays > 2 ? 'bg-red-500/20 text-red-500 border-red-500/40' : 'bg-amber-500/20 text-amber-500 border-amber-500/40'}`}>
                                          <AlertTriangle className="w-3 h-3" /> Niezrealizowane od {overdueDays} {overdueDays === 1 ? 'dnia' : 'dni'}
                                       </span>
                                     )}

                                    {associatedGoal && (
                                      <div className="w-full mt-1.5 flex flex-col gap-1.5">
                                        <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                                          <Target className="w-3 h-3" /> {associatedGoal.title}
                                        </span>
                                        {/* Tu wyświetlamy "Purpose" z RPM jako motywacyjne przypomnienie pod zadaniem */}
                                        {associatedGoal.comment && !isDone && (
                                          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                            <span className="text-[10px] md:text-xs text-amber-600 dark:text-amber-400 font-medium italic flex items-start gap-1.5 leading-snug">
                                              <Flame className="w-3 h-3 mt-0.5 shrink-0" /> "{associatedGoal.comment}"
                                            </span>
                                          </div>
                                        )}
                                      </div>
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

                               <div className="relative shrink-0 ml-2" onClick={e => e.stopPropagation()}>
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
                                   <div className={"absolute right-0 mt-2 w-48 rounded-xl shadow-lg border z-50 flex flex-col overflow-hidden " + tStyle.cardBg}>
                                     <button
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         setOpenMenuTaskId(null);
                                         toggleTaskPriority(task.id);
                                       }}
                                       className={"flex items-center gap-2 px-3 py-2.5 hover:bg-amber-500/10 transition-colors " + tStyle.subText + " hover:text-amber-500 text-sm font-medium"}
                                     >
                                       <Star className={'w-4 h-4 ' + (task.isPriority ? 'fill-amber-500 text-amber-500' : '')} /> {task.isPriority ? 'Usuń z priorytetów' : 'Ustaw jako priorytet'}
                                     </button>
                                     <div className="h-px bg-slate-500/20 w-full" />
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
                                         setDeleteAssociatedTasks(false);
                                       }}
                                       className={"flex items-center gap-2 px-3 py-2.5 hover:bg-red-500/10 transition-colors " + tStyle.subText + " hover:text-red-500 text-sm font-medium"}
                                     >
                                       <Trash2 className="w-4 h-4" /> Usuń
                                     </button>
                                   </div>
                                 )}
                               </div>
                            </div>

                            {/* TIMER - DODATKOWY WIERSZ POD SPODEM */}
                            {task.duration > 0 && !isDone && (
                               <div className="pl-9 pr-1 w-full" onClick={e => e.stopPropagation()}>
                                 <button onClick={(e) => toggleTimer(task.id, e)} className={'w-full px-4 py-2.5 rounded-xl text-base md:text-lg font-mono font-bold flex items-center justify-center gap-2 transition-colors border shadow-sm ' + (task.isRunning ? 'bg-amber-500 text-slate-950 border-amber-600 animate-pulse' : tStyle.modalBtnBg)}>
                                   {task.isRunning ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5" />}
                                   <span>{formatTime(task.timeLeft)}</span>
                                 </button>
                               </div>
                            )}
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
                      const workoutName = w.customTitle ? `${typeName} (${w.customTitle}): ${w.amount} ${w.unit}` : `${typeName}: ${w.amount} ${w.unit}`;
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
                            <button onClick={() => { setConfirmDeleteModal({ type: 'workout', id: w.id, name: workoutName }); setDeleteAssociatedTasks(false); }} className={'p-2 rounded-xl bg-slate-500/10 hover:bg-red-500/10 hover:text-red-500 transition-colors ' + tStyle.subText}><Trash2 className="w-4 h-4" /></button>
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

          <FloatingActionButton
            isFabOpen={isFabOpen}
            setIsFabOpen={setIsFabOpen}
            isAnyModalOpen={isAnyModalOpen}
            currentFontConfig={currentFontConfig}
            onAddTask={() => { setFormErrors({}); setShowAddTaskModal(true); setIsFabOpen(false); }}
            onAddWorkout={() => { setFormErrors({}); setSelectedSportWorkouts({}); setMultiWorkoutStep(1); setShowAddWorkoutModal(true); setIsFabOpen(false); }}
            onAddReading={() => { setFormErrors({}); setShowAddReadingModal(true); setIsFabOpen(false); }}
            onAddInboxItem={() => { setShowInboxAddModal(true); setIsFabOpen(false); }}
          />
        </>
      )}

      {activeTab === 'goals' && (
        <GoalsTab
          currentFontConfig={currentFontConfig}
          tStyle={tStyle}
          openGoalWizard={openGoalWizard}
          activeGoalsCollapsed={activeGoalsCollapsed}
          setActiveGoalsCollapsed={setActiveGoalsCollapsed}
          goals={goals}
          setEditingGoal={setEditingGoal}
          setConfirmDeleteModal={setConfirmDeleteModal}
          futureTasksCollapsed={futureTasksCollapsed}
          setFutureTasksCollapsed={setFutureTasksCollapsed}
          futureTasks={futureTasks}
          getCategoryStyle={getCategoryStyle}
          setConfirmCompleteModal={setConfirmCompleteModal}
          setCompleteTaskValue={setCompleteTaskValue}
          tomorrowStr={tomorrowStr}
          setEditingTask={setEditingTask}
          setShowArchiveModal={setShowArchiveModal}
          setShowBooksModal={setShowBooksModal}
          setShowWeeklyReviewModal={setShowWeeklyReviewModal}
          setFormErrors={setFormErrors}
          setDeleteAssociatedTasks={setDeleteAssociatedTasks}
        />
      )}

      {activeTab === 'history' && (
        <HistoryTab
          currentFontConfig={currentFontConfig}
          tStyle={tStyle}
          renderCalendar={renderCalendar}
          selectedDate={selectedDate}
          selectedDayTasks={selectedDayTasks}
          selectedDayWorkouts={selectedDayWorkouts}
          isPastDay={isPastDay}
          isFutureDay={isFutureDay}
          currentNote={currentNote}
          setShowDeleteNoteConfirm={setShowDeleteNoteConfirm}
          textareaRef={textareaRef}
          saveNote={saveNote}
        />
      )}

      {activeTab === 'profile' && (
        <ProfileTab
          currentFontConfig={currentFontConfig}
          tStyle={tStyle}
          userName={userName}
          setUserName={setUserName}
          userGender={userGender}
          setUserGender={setUserGender}
          levelInfo={levelInfo}
          totalPKT={totalPKT}
          earnedTrophiesCount={earnedTrophiesCount}
          trophyCount={TROPHIES.length}
          setShowSettingsModal={setShowSettingsModal}
          setShowTrophiesModal={setShowTrophiesModal}
          setShowRanksModal={setShowRanksModal}
          renderMonthTimeline={renderMonthTimeline}
          monthNameDisplay={monthNameDisplay}
          monthTotalDoneTasks={monthTotalDoneTasks}
          categories={categories}
          monthCategoryStats={monthCategoryStats}
          renderDetailedStats={renderDetailedStats}
          weeklyDetailedStats={weeklyDetailedStats}
          monthlyDetailedStats={monthlyDetailedStats}
        />
      )}

      <AppNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentFontConfig={currentFontConfig}
        tStyle={tStyle}
      />

      <GoalWizardModal
        showAddGoalModal={showAddGoalModal}
        goalWizardStep={goalWizardStep}
        setGoalWizardStep={setGoalWizardStep}
        setShowAddGoalModal={setShowAddGoalModal}
        currentFontConfig={currentFontConfig}
        tStyle={tStyle}
        wizardData={wizardData}
        setWizardData={setWizardData}
        clearError={clearError}
        formErrors={formErrors}
        getTypeIcon={getTypeIcon}
        getUnitForType={getUnitForType}
        books={books}
        changeBookStatus={changeBookStatus}
        finalizeWizard={finalizeWizard}
        taskPickerDate={taskPickerDate}
        setTaskPickerDate={setTaskPickerDate}
        renderCustomCalendar={renderCustomCalendar}
        handleWizardNext={handleWizardNext}
      />

      <TrophiesModal
        isOpen={showTrophiesModal}
        onClose={() => setShowTrophiesModal(false)}
        trophies={TROPHIES}
        earnedTrophies={earnedTrophies}
        earnedCount={earnedTrophiesCount}
        onSelectTrophy={setNewTrophyModal}
        currentFontConfig={currentFontConfig}
        tStyle={tStyle}
      />

      <TrophyDetailsModal
        trophy={newTrophyModal}
        earnedTrophies={earnedTrophies}
        userName={userName}
        onShare={handleShareTrophy}
        onClose={() => setNewTrophyModal(null)}
      />
      <ArchiveModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        archivedTasks={archivedTasks}
        archivedGoals={archivedGoals}
        restoreArchivedItem={restoreArchivedItem}
        todayStr={todayStr}
        currentFontConfig={currentFontConfig}
        tStyle={tStyle}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentFontConfig={currentFontConfig}
        tStyle={tStyle}
        categories={categories}
        theme={theme}
        setTheme={setTheme}
        fontSizeLevel={fontSizeLevel}
        setFontSizeLevel={setFontSizeLevel}
        resetTime={resetTime}
        setResetTime={setResetTime}
        todayStr={todayStr}
        setTodayStr={setTodayStr}
        setSelectedDate={setSelectedDate}
        notificationStatus={notificationStatus}
        testNotification={testNotification}
        pushApiUrl={pushApiUrl}
        setPushApiUrl={setPushApiUrl}
        pushStatus={pushStatus}
        pushMessage={pushMessage}
        enableFullPush={enableFullPush}
        disableFullPush={disableFullPush}
        isGoogleAuthorized={isGoogleAuthorized}
        handleAuthClick={handleAuthClick}
        handleSignoutClick={handleSignoutClick}
        autoBackupEnabled={autoBackupEnabled}
        setAutoBackupEnabled={setAutoBackupEnabled}
        backupToGoogleDrive={backupToGoogleDrive}
        restoreFromGoogleDrive={restoreFromGoogleDrive}
        googleBackupStatus={googleBackupStatus}
        exportDataToJson={exportDataToJson}
        importFileRef={importFileRef}
        importDataFromJson={importDataFromJson}
        setShowResetConfirmModal={setShowResetConfirmModal}
      />

      <TaskModals
        editingTask={editingTask}
        setEditingTask={setEditingTask}
        saveEditedTask={saveEditedTask}
        showAddTaskModal={showAddTaskModal}
        setShowAddTaskModal={setShowAddTaskModal}
        addTask={addTask}
        currentFontConfig={currentFontConfig}
        tStyle={tStyle}
        formErrors={formErrors}
        clearError={clearError}
        categories={categories}
        goals={goals}
        taskPickerDate={taskPickerDate}
        setTaskPickerDate={setTaskPickerDate}
        renderCustomCalendar={renderCustomCalendar}
        enableNotifications={enableNotifications}
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        newTaskCategory={newTaskCategory}
        setNewTaskCategory={setNewTaskCategory}
        newTaskGoalId={newTaskGoalId}
        setNewTaskGoalId={setNewTaskGoalId}
        newTaskDifficulty={newTaskDifficulty}
        setNewTaskDifficulty={setNewTaskDifficulty}
        newTaskRepeat={newTaskRepeat}
        setNewTaskRepeat={setNewTaskRepeat}
        newTaskDueDate={newTaskDueDate}
        setNewTaskDueDate={setNewTaskDueDate}
        newTaskIntervalDays={newTaskIntervalDays}
        setNewTaskIntervalDays={setNewTaskIntervalDays}
        newTaskHasReminder={newTaskHasReminder}
        setNewTaskHasReminder={setNewTaskHasReminder}
        newTaskReminderTime={newTaskReminderTime}
        setNewTaskReminderTime={setNewTaskReminderTime}
        newTaskDuration={newTaskDuration}
        setNewTaskDuration={setNewTaskDuration}
      />

{showAddWorkoutModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-500/20">
              <h3 className={currentFontConfig.sizeClass + ' font-bold flex items-center gap-2 text-orange-500'}>
                <Dumbbell className="w-5 h-5"/> Zarejestruj multitrening {multiWorkoutStep === 1 ? '(1/2)' : '(2/2)'}
              </h3>
              <button onClick={() => setShowAddWorkoutModal(false)} className={'p-1.5 rounded-full hover:bg-slate-500/20 transition-colors'}><X className="w-5 h-5"/></button>
            </div>
            
            {multiWorkoutStep === 1 ? (
              <div className="space-y-5 animate-fadeIn">
                <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}><strong>Krok 1:</strong> Zaznacz wszystkie aktywności, które dzisiaj wykonałeś.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   {GOAL_CATEGORIES_CONFIG.sport.types.map(t => {
                      const isActive = selectedSportWorkouts[t.id] !== undefined;
                      return (
                         <div 
                           key={t.id} 
                           onClick={() => {
                               if(isActive) { const n = {...selectedSportWorkouts}; delete n[t.id]; setSelectedSportWorkouts(n); }
                               else { setSelectedSportWorkouts({...selectedSportWorkouts, [t.id]: ''}) }
                           }} 
                           className={'p-4 rounded-2xl border transition-all cursor-pointer text-center flex flex-col items-center justify-center min-h-[100px] ' + (isActive ? 'bg-orange-500/10 border-orange-500 text-orange-500 ring-2 ring-orange-500/50 shadow-md scale-[1.02]' : 'bg-slate-500/5 border-slate-500/20 hover:bg-slate-500/10')}
                         >
                            <div className={"transition-all duration-300 " + (isActive ? 'drop-shadow-lg' : 'grayscale opacity-50')}>
                                {getTypeIcon(t.id)}
                            </div>
                            <span className={currentFontConfig.smallClass + ' font-bold leading-tight ' + (isActive ? 'text-orange-500' : tStyle.titleText)}>{t.label.split(' (')[0]}</span>
                         </div>
                      )
                   })}
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-500/20">
                  <button type="button" onClick={() => setShowAddWorkoutModal(false)} className={'flex-1 py-3.5 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                  <button type="button" disabled={Object.keys(selectedSportWorkouts).length === 0} onClick={() => setMultiWorkoutStep(2)} className={'flex-1 bg-orange-500 hover:bg-orange-400 text-slate-950 py-3.5 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-orange-500/20'}>Dalej</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMultiWorkoutSubmit} className="space-y-5 animate-fadeIn">
                <p className={currentFontConfig.smallClass + ' ' + tStyle.subText}><strong>Krok 2:</strong> Wpisz dokładne wartości dla zaznaczonych aktywności.</p>
                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2 pb-2">
                   {GOAL_CATEGORIES_CONFIG.sport.types.filter(t => selectedSportWorkouts[t.id] !== undefined).map((t, idx) => (
                       <div key={t.id} className={'p-4 rounded-2xl border bg-orange-500/5 border-orange-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fadeIn'}>
                           <span className={currentFontConfig.sizeClass + ' font-bold ' + tStyle.titleText}>🔥 {t.label.split(' (')[0]}</span>
                           <div className="relative w-full md:w-1/2">
                             <input type="number" step="any" autoFocus={idx === 0} placeholder="0" value={selectedSportWorkouts[t.id]} onChange={e => setSelectedSportWorkouts({...selectedSportWorkouts, [t.id]: e.target.value})} className={'w-full py-3 px-4 pr-16 rounded-xl font-bold text-center border focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none ' + tStyle.inputBg} />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold opacity-50 uppercase">{t.label.match(/\((.*?)\)/)?.[1] || ''}</span>
                           </div>
                       </div>
                   ))}
                </div>

                <div>
                  <label className={currentFontConfig.smallClass + ' font-medium block mb-2 ' + tStyle.subText}>Powiąż z celem sportowym (opcjonalnie)</label>
                  <select value={newWorkoutGoalId} onChange={(e) => setNewWorkoutGoalId(e.target.value)} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-orange-500 ' + tStyle.inputBg}>
                    <option value="">-- Brak powiązania --</option>
                    {goals.filter(g => g.category === 'Sport' || g.category === 'Zdrowie').map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-slate-500/20">
                  <button type="button" onClick={() => setMultiWorkoutStep(1)} className={'flex-1 py-3.5 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Wstecz</button>
                  <button type="submit" className={'flex-1 bg-orange-500 hover:bg-orange-400 text-slate-950 py-3.5 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold shadow-lg shadow-orange-500/20'}>Zapisz zestaw</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {showAddReadingModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={'w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 flex items-center gap-2 text-sky-500'}><BookOpen className="w-5 h-5"/> Zarejestruj czytanie ("Przeczytałem")</h3>
            <form onSubmit={addReading} className="space-y-4">
              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Co dzisiaj czytałeś?</label>
                <select value={readingData.goalId} onChange={(e) => setReadingData({...readingData, goalId: e.target.value, manualTitle: ''})} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-sky-500 ' + tStyle.inputBg}>
                  <option value="">Wpiszę tytuł ręcznie...</option>
                  {goals.filter(g => g.category === 'Książka').map(g => (
                    <option key={g.id} value={g.id}>Z celu: {g.title}</option>
                  ))}
                </select>
              </div>
              {!readingData.goalId && (
                <div>
                  <input type="text" placeholder="Tytuł książki (np. Władca Pierścieni)" value={readingData.manualTitle} onChange={(e) => setReadingData({...readingData, manualTitle: e.target.value})} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-sky-500 ' + tStyle.inputBg} />
                </div>
              )}
              
              <div className="pt-2 border-t border-slate-500/20">
                <label className={currentFontConfig.smallClass + ' font-medium block mb-2 ' + tStyle.subText}>Format zapisu</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setReadingData({...readingData, type: 'read_book'})} className={'py-3 rounded-xl transition-all font-semibold ' + (readingData.type === 'read_book' ? 'bg-sky-500/20 text-sky-500 border-sky-500 ring-2 ring-sky-500' : 'bg-slate-500/10 border-transparent text-slate-400 border')}>Przeczytane Strony</button>
                  <button type="button" onClick={() => setReadingData({...readingData, type: 'read_chapters'})} className={'py-3 rounded-xl transition-all font-semibold ' + (readingData.type === 'read_chapters' ? 'bg-sky-500/20 text-sky-500 border-sky-500 ring-2 ring-sky-500' : 'bg-slate-500/10 border-transparent text-slate-400 border')}>Przeczytane Rozdziały</button>
                </div>
              </div>

              <div>
                <label className={currentFontConfig.smallClass + ' font-medium block mb-1 text-sky-500'}>{readingData.type === 'read_chapters' ? 'Ile rozdziałów przeczytałeś?' : 'Ile stron przeczytałeś?'}</label>
                <input type="number" step="any" min="0.1" placeholder="np. 15 (Wymagane)" value={readingData.amount} onChange={(e) => setReadingData({...readingData, amount: e.target.value})} className={'w-full rounded-2xl px-4 py-3 font-bold ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 ' + tStyle.inputBg} />
              </div>

              {readingData.type === 'read_chapters' && (
                  <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                      <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Liczba stron w tych rozdziałach (opcjonalnie, do statystyk)</label>
                      <input type="number" step="any" placeholder="np. 40" value={readingData.optionalPages} onChange={(e) => setReadingData({...readingData, optionalPages: e.target.value})} className={'w-full rounded-xl px-4 py-2.5 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-sky-500 ' + tStyle.inputBg} />
                  </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-slate-500/20">
                <button type="button" onClick={() => setShowAddReadingModal(false)} className={'flex-1 py-3.5 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                <button type="submit" className={'flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 py-3.5 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold'}>Dodaj do historii</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInboxAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[150] animate-fadeIn">
          <div className={'w-full max-w-md rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
             <div className="flex items-center gap-3 mb-4">
                 <div className="w-12 h-12 bg-violet-500/20 text-violet-500 flex items-center justify-center rounded-xl border border-violet-500/40">
                     <Brain className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className={currentFontConfig.sizeClass + ' font-bold text-violet-500'}>Zrzut myśli</h3>
                    <p className="text-xs opacity-70">Opróżnij głowę. Zaplanujesz to później.</p>
                 </div>
             </div>
             <form onSubmit={addInboxItem}>
                 <textarea autoFocus rows={3} placeholder="Co Ci chodzi po głowie? (np. odpisać szefowi, kupić białko...)" value={inboxText} onChange={e => setInboxText(e.target.value)} className={'w-full rounded-2xl px-4 py-4 resize-none ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 ' + tStyle.inputBg} />
                 <div className="flex gap-3 pt-4 mt-2 border-t border-slate-500/20">
                    <button type="button" onClick={() => setShowInboxAddModal(false)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                    <button type="submit" className={'flex-1 bg-violet-500 hover:bg-violet-400 text-white py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold shadow-lg shadow-violet-500/20'}>Wrzuć do Skrzynki</button>
                 </div>
             </form>
          </div>
        </div>
      )}

      {showInboxListModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[150] overflow-y-auto">
          <div className={'w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-500/20">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-violet-500/20 text-violet-500 flex items-center justify-center rounded-xl border border-violet-500/40">
                     <Archive className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className={currentFontConfig.sizeClass + ' font-bold text-violet-500'}>Skrzynka Odbiorcza</h3>
                    <p className="text-xs opacity-70">Decyduj, co z tym zrobić (GTD)</p>
                 </div>
              </div>
              <button onClick={() => setShowInboxListModal(false)} className={'p-2 rounded-full transition-colors ' + tStyle.modalBtnBg}><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
               {inbox.length === 0 ? (
                   <div className="text-center py-10 opacity-50">
                       <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                       <p>Umysł czysty jak łza. Skrzynka jest pusta.</p>
                   </div>
               ) : (
                   inbox.map(item => (
                       <div key={item.id} className={'p-4 rounded-2xl border bg-slate-500/5 border-slate-500/20 shadow-sm animate-fadeIn'}>
                           <p className={'font-medium mb-3 ' + tStyle.titleText}>{item.text}</p>
                           <p className="text-[10px] font-mono opacity-50 mb-3">Dodano: {item.createdAt}</p>
                           <div className="flex flex-wrap gap-2">
                               <button onClick={() => promoteInboxItem(item, false)} className="flex-1 min-w-[120px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold py-2 px-3 rounded-xl transition-colors border border-emerald-500/30 flex justify-center items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5"/> Zrób Zadanie</button>
                               <button onClick={() => promoteInboxItem(item, true)} className="flex-1 min-w-[120px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold py-2 px-3 rounded-xl transition-colors border border-amber-500/30 flex justify-center items-center gap-1.5"><Target className="w-3.5 h-3.5"/> Twórz Cel (RPM)</button>
                               <button onClick={() => setInbox(inbox.filter(i => i.id !== item.id))} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-xl border border-red-500/20 transition-colors"><Trash2 className="w-4 h-4"/></button>
                           </div>
                       </div>
                   ))
               )}
            </div>
            
            <button onClick={() => { setShowInboxListModal(false); setShowInboxAddModal(true); }} className="w-full mt-4 bg-violet-500 hover:bg-violet-400 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-transform active:scale-95">
                + Dorzuć nową myśl
            </button>
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

      <DeleteConfirmationModal
        modal={confirmDeleteModal}
        tasks={tasks}
        deleteAssociatedTasks={deleteAssociatedTasks}
        setDeleteAssociatedTasks={setDeleteAssociatedTasks}
        onCancel={() => { setConfirmDeleteModal(null); setDeleteAssociatedTasks(false); }}
        onConfirm={executeDelete}
        currentFontConfig={currentFontConfig}
        tStyle={tStyle}
      />

      <CompleteConfirmationModal
        modal={confirmCompleteModal}
        completeTaskValue={completeTaskValue}
        setCompleteTaskValue={setCompleteTaskValue}
        onCancel={() => setConfirmCompleteModal(null)}
        onConfirm={executeComplete}
        currentFontConfig={currentFontConfig}
        tStyle={tStyle}
      />

      <DeleteNoteConfirmationModal
        isOpen={showDeleteNoteConfirm}
        selectedDate={selectedDate}
        onCancel={() => setShowDeleteNoteConfirm(false)}
        onConfirm={confirmDeleteNote}
        currentFontConfig={currentFontConfig}
        tStyle={tStyle}
      />

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

{showWeeklyReviewModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[500] overflow-y-auto animate-fadeIn">
          <div className={'w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl p-6 md:p-8 shadow-2xl border border-violet-500/30 ' + tStyle.modalBg}>
            
            <div className="text-center mb-6 border-b border-slate-500/20 pb-5">
              <div className="w-16 h-16 mx-auto bg-violet-500/20 text-violet-500 flex items-center justify-center rounded-full border border-violet-500/40 mb-3 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className={'font-bold text-2xl md:text-3xl mb-1 ' + tStyle.titleText}>Raport Bojowy</h2>
              <p className={currentFontConfig.smallClass + ' font-medium text-violet-500 uppercase tracking-widest'}>Podsumowanie ostatnich 7 dni</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              
              {/* Sekcja Statystyk */}
              <div className="grid grid-cols-3 gap-3">
                 {(() => {
                    const stats = getWeeklyStats();
                    return (
                        <>
                          <div className="bg-slate-500/10 p-3 rounded-2xl text-center border border-slate-500/20">
                             <Zap className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
                             <span className="block font-bold text-xl text-emerald-500">{stats.tCount}</span>
                             <span className="text-[10px] uppercase font-bold opacity-60">Zadań</span>
                          </div>
                          <div className="bg-slate-500/10 p-3 rounded-2xl text-center border border-slate-500/20">
                             <Activity className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                             <span className="block font-bold text-xl text-amber-500">{stats.wCount}</span>
                             <span className="text-[10px] uppercase font-bold opacity-60">Aktywności</span>
                          </div>
                          <div className="bg-slate-500/10 p-3 rounded-2xl text-center border border-slate-500/20">
                             <Trophy className="w-5 h-5 mx-auto text-violet-500 mb-1" />
                             <span className="block font-bold text-xl text-violet-500">{stats.pts}</span>
                             <span className="text-[10px] uppercase font-bold opacity-60">Punktów</span>
                          </div>
                        </>
                    )
                 })()}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl">
                 <p className="text-sm font-bold text-amber-500 italic text-center">
                    "Nie ma porażek. Są tylko informacje zwrotne, które czynią nas silniejszymi." — Anthony Robbins
                 </p>
              </div>

              {/* Sekcja Refleksji */}
              <div className="space-y-4">
                 <div>
                    <label className={'font-bold block mb-1 flex items-center gap-1.5 ' + currentFontConfig.smallClass + ' ' + tStyle.titleText}>
                       <Flame className="w-4 h-4 text-emerald-500" /> Największe zwycięstwo
                    </label>
                    <p className={'text-xs mb-2 opacity-60 ' + tStyle.subText}>Z czego jesteś najbardziej dumny z ubiegłego tygodnia?</p>
                    <textarea rows="2" value={weeklyReviewData.success} onChange={e => setWeeklyReviewData({...weeklyReviewData, success: e.target.value})} className={'w-full rounded-xl px-4 py-3 resize-none ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 ' + tStyle.inputBg} placeholder="Nawet małe sukcesy budują momentum..." />
                 </div>
                 
                 <div>
                    <label className={'font-bold block mb-1 flex items-center gap-1.5 ' + currentFontConfig.smallClass + ' ' + tStyle.titleText}>
                       <AlertTriangle className="w-4 h-4 text-orange-500" /> Lekcja i Kalibracja
                    </label>
                    <p className={'text-xs mb-2 opacity-60 ' + tStyle.subText}>Gdzie odpuściłeś? Co musisz poprawić od jutra?</p>
                    <textarea rows="2" value={weeklyReviewData.improvement} onChange={e => setWeeklyReviewData({...weeklyReviewData, improvement: e.target.value})} className={'w-full rounded-xl px-4 py-3 resize-none ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 ' + tStyle.inputBg} placeholder="Bądź ze sobą bezlitośnie szczery..." />
                 </div>

                 <div>
                    <label className={'font-bold block mb-1 flex items-center gap-1.5 ' + currentFontConfig.smallClass + ' ' + tStyle.titleText}>
                       <Target className="w-4 h-4 text-red-500" /> 3 Ciosy na ten Tydzień
                    </label>
                    <p className={'text-xs mb-2 opacity-60 ' + tStyle.subText}>Zasada 80/20. Jakie 3 Must-Do pchną Cię najmocniej do przodu?</p>
                    <textarea rows="3" value={weeklyReviewData.priorities} onChange={e => setWeeklyReviewData({...weeklyReviewData, priorities: e.target.value})} className={'w-full rounded-xl px-4 py-3 resize-none ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 ' + tStyle.inputBg} placeholder="1. ...&#10;2. ...&#10;3. ..." />
                 </div>
              </div>

            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-500/20">
               <button onClick={() => setShowWeeklyReviewModal(false)} className={'w-full bg-violet-500 hover:bg-violet-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-violet-500/25 transition-transform active:scale-95 text-lg'}>
                  Zatwierdź i Zdominuj ten Tydzień! ⚔️
               </button>
            </div>

          </div>
        </div>
      )}

          {showBooksModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[150] overflow-y-auto animate-fadeIn">
          <div className={'w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-500/20">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-sky-500/20 text-sky-500 flex items-center justify-center rounded-xl border border-sky-500/40">
                     <BookOpen className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className={currentFontConfig.sizeClass + ' font-bold text-sky-500'}>Moja Biblioteka</h3>
                    <p className="text-xs opacity-70">Zarządzaj swoimi lekturami</p>
                 </div>
              </div>
              <button onClick={() => setShowBooksModal(false)} className={'p-2 rounded-full transition-colors ' + tStyle.modalBtnBg}><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
               {['in_progress', 'planned', 'read'].map(statusGroup => {
                  const groupBooks = books.filter(b => b.status === statusGroup);
                  if (groupBooks.length === 0 && statusGroup !== 'in_progress') return null;
                  
                  const groupTitle = statusGroup === 'in_progress' ? '📖 W trakcie czytania' : statusGroup === 'planned' ? '📚 W planach' : '✅ Przeczytane';
                  const groupColor = statusGroup === 'in_progress' ? 'text-sky-500' : statusGroup === 'planned' ? 'text-amber-500' : 'text-emerald-500';

                  return (
                     <div key={statusGroup}>
                        <h4 className={'font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ' + currentFontConfig.smallClass + ' ' + groupColor}>
                           {groupTitle} ({groupBooks.length})
                        </h4>
                        
                        {groupBooks.length === 0 && statusGroup === 'in_progress' ? (
                           <p className="text-sm opacity-50 italic">Brak książek w trakcie czytania.</p>
                        ) : (
                           <div className="space-y-2">
                              {groupBooks.map(b => (
                                 <div key={b.id} className={'p-4 rounded-2xl border bg-slate-500/5 border-slate-500/20 shadow-sm flex items-center justify-between gap-3 transition-all'}>
                                    <div>
                                       <p className={'font-bold ' + tStyle.titleText + (b.status === 'read' ? ' line-through opacity-70' : '')}>{b.title}</p>
                                       {b.totalPages && <p className="text-xs font-mono opacity-60">Stron: {b.totalPages}</p>}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                       {b.status !== 'in_progress' && b.status !== 'read' && (
                                          <button onClick={() => changeBookStatus(b.id, 'in_progress')} className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 p-2 rounded-xl transition-colors text-xs font-bold" title="Rozpocznij czytanie"><Play className="w-4 h-4"/></button>
                                       )}
                                       {b.status !== 'read' && (
                                          <button onClick={() => changeBookStatus(b.id, 'read')} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 p-2 rounded-xl transition-colors text-xs font-bold" title="Oznacz jako przeczytane"><Check className="w-4 h-4"/></button>
                                       )}
                                       <button onClick={() => deleteBook(b.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-xl transition-colors" title="Usuń"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>
            
            <div className="pt-4 border-t border-slate-500/20 mt-2">
               <button onClick={() => setShowAddBookModal(true)} className="w-full bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold py-3.5 rounded-2xl shadow-lg shadow-sky-500/20 transition-transform active:scale-95 flex items-center justify-center gap-2">
                   <Plus className="w-5 h-5" /> Dodaj nową książkę
               </button>
            </div>
          </div>
        </div>
      )}

      {showAddBookModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-[160] animate-fadeIn">
          <div className={'w-full max-w-sm rounded-3xl p-6 shadow-2xl border ' + tStyle.modalBg}>
             <h3 className={currentFontConfig.sizeClass + ' font-bold mb-4 text-sky-500 flex items-center gap-2'}><BookOpen className="w-5 h-5" /> Nowa Książka</h3>
             <form onSubmit={handleAddBook} className="space-y-4">
                 <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Tytuł książki</label>
                    <input autoFocus type="text" placeholder="Wpisz tytuł..." value={newBookData.title} onChange={e => setNewBookData({...newBookData, title: e.target.value})} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 ' + tStyle.inputBg} />
                 </div>
                 <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Ilość stron (Opcjonalnie)</label>
                    <input type="number" placeholder="np. 350" value={newBookData.totalPages} onChange={e => setNewBookData({...newBookData, totalPages: e.target.value})} className={'w-full rounded-2xl px-4 py-3 ' + currentFontConfig.sizeClass + ' focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 ' + tStyle.inputBg} />
                 </div>
                 <div>
                    <label className={currentFontConfig.smallClass + ' font-medium block mb-1 ' + tStyle.subText}>Status</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setNewBookData({...newBookData, status: 'planned'})} className={'py-2.5 rounded-xl font-bold transition-colors text-xs ' + (newBookData.status === 'planned' ? 'bg-amber-500 text-slate-900 shadow-md' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20')}>W planach</button>
                        <button type="button" onClick={() => setNewBookData({...newBookData, status: 'in_progress'})} className={'py-2.5 rounded-xl font-bold transition-colors text-xs ' + (newBookData.status === 'in_progress' ? 'bg-sky-500 text-slate-900 shadow-md' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20')}>Od razu czytam</button>
                    </div>
                 </div>
                 <div className="flex gap-3 pt-4 mt-2 border-t border-slate-500/20">
                    <button type="button" onClick={() => setShowAddBookModal(false)} className={'flex-1 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>Anuluj</button>
                    <button type="submit" className={'flex-1 bg-sky-500 hover:bg-sky-400 text-slate-900 py-3 rounded-2xl ' + currentFontConfig.smallClass + ' font-bold shadow-lg shadow-sky-500/20'}>Zapisz</button>
                 </div>
             </form>
          </div>
        </div>
      )}

          {showResetConfirmModal && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-[500] animate-fadeIn">
              <div className={'w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center border border-red-500/40 ' + tStyle.modalBg}>
                <div className="w-16 h-16 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center mx-auto mb-5 text-red-500 shadow-inner">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className={currentFontConfig.sizeClass + ' font-bold mb-2 text-red-500'}>Ostrzeżenie Krytyczne</h3>
                <p className={currentFontConfig.smallClass + ' mb-6 opacity-80 ' + tStyle.titleText}>
                  Czy na pewno chcesz <strong>bezpowrotnie usunąć</strong> wszystkie swoje cele, zadania, historię i zdobyte trofea? 
                  <br/><br/>
                  Ta operacja całkowicie wyzeruje Twoją aplikację.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowResetConfirmModal(false)} className={'flex-1 py-3 rounded-2xl font-semibold ' + currentFontConfig.smallClass + ' ' + tStyle.modalBtnBg}>
                    Anuluj
                  </button>
                  <button onClick={executeFactoryReset} className={'flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-bold ' + currentFontConfig.smallClass + ' shadow-lg shadow-red-500/30'}>
                    Tak, kasuj wszystko
                  </button>
                </div>
              </div>
            </div>
          )}
        {/* ========================================= */}
      {/* MODAL: RAPORT Z WCZORAJ                     */}
      {/* ========================================= */}
      {showYesterdayModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-[2rem] bg-slate-50 dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
            
            {/* Nagłówek */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
              <h2 className="font-bold text-xl flex items-center gap-2 text-slate-800 dark:text-white">
                <History className="w-6 h-6 text-blue-500" /> Wczoraj
              </h2>
              <button 
                onClick={() => setShowYesterdayModal(false)} 
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Treść */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Sekcja liczbowych statystyk */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl text-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Punkty</p>
                  <p className="text-3xl font-black text-emerald-500">{yesterdayCalculatedStats?.points || 0}</p>
                </div>
                <div className="p-4 rounded-2xl text-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Zadania</p>
                  <p className="text-3xl font-black text-blue-500">{yesterdayCalculatedStats?.doneTasks || 0}<span className="text-lg text-slate-400">/{yesterdayCalculatedStats?.totalTasks || 0}</span></p>
                </div>
                <div className="col-span-2 p-4 rounded-2xl text-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Kategoria Zdrowie i Sport</p>
                  <p className="text-xl font-bold text-amber-500">
                     {yesterdayCalculatedStats?.healthDone || 0} na {yesterdayCalculatedStats?.healthTotal || 0} ukończone!
                  </p>
                </div>
              </div>

              {/* Opinia Trenera */}
              <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-5 h-5 text-blue-500" />
                  <span className="font-bold text-sm text-blue-700 dark:text-blue-400">Opinia Trenera</span>
                </div>
                <p className="font-medium italic leading-relaxed text-slate-700 dark:text-slate-300">
                  "{yesterdayReportMessage}"
                </p>
              </div>
              
              {/* Przycisk zamknięcia */}
              <button 
                onClick={() => setShowYesterdayModal(false)}
                className="w-full py-4 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 active:scale-95"
              >
                Przyjąłem do wiadomości
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
