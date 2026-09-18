const CLIENT_ID_KEY = 'discipline_push_client_id';
const API_URL_KEY = 'discipline_push_api_url';

const normalizeApiUrl = (value) => value?.trim().replace(/\/$/, '') || '';

export const getPushApiUrl = () => normalizeApiUrl(
  localStorage.getItem(API_URL_KEY) || import.meta.env.VITE_PUSH_API_URL,
);

export const savePushApiUrl = (value) => {
  const normalized = normalizeApiUrl(value);
  if (normalized) localStorage.setItem(API_URL_KEY, normalized);
  else localStorage.removeItem(API_URL_KEY);
  return normalized;
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)));
};

const getClientId = () => {
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
  return clientId;
};

const apiRequest = async (path, options = {}) => {
  const apiUrl = getPushApiUrl();
  if (!apiUrl) throw new Error('Najpierw wpisz adres usługi powiadomień.');

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Błąd usługi powiadomień (${response.status}).`);
  }

  return response.json().catch(() => ({}));
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const taskAppliesToDate = (task, dateString) => {
  if (!task.createdAt || dateString < task.createdAt) return false;
  if (!task.repeat || task.repeat === 'once') return task.dueDate === dateString;
  if (task.repeat === 'daily') return true;
  if (task.repeat === 'custom') return task.customDates?.includes(dateString);
  if (task.repeat === 'interval') {
    const start = new Date(`${task.createdAt}T00:00:00`);
    const target = new Date(`${dateString}T00:00:00`);
    const days = Math.round((target - start) / 86400000);
    return days >= 0 && days % (task.intervalDays || 2) === 0;
  }
  return false;
};

export const buildPushReminders = (tasks, daysAhead = 30) => {
  const reminders = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset <= daysAhead; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const dateString = formatDate(date);

    tasks.forEach((task) => {
      if (!task.hasReminder || !task.reminderTime || !taskAppliesToDate(task, dateString)) return;
      if (task.repeat === 'once' && task.isCompleted) return;
      if (task.repeat !== 'once' && task.completedDates?.[dateString]) return;

      const [hours, minutes] = task.reminderTime.split(':').map(Number);
      const scheduled = new Date(date);
      scheduled.setHours(hours, minutes, 0, 0);
      if (scheduled.getTime() <= Date.now()) return;

      reminders.push({
        id: `task-${task.id}-${dateString}`,
        scheduledAt: scheduled.toISOString(),
        title: 'Przypomnienie o zadaniu! ⚡',
        body: `Czas na wykonanie: "${task.title}"`,
        tag: `task-${task.id}-${dateString}`,
      });
    });

    const dailyPlan = new Date(date);
    dailyPlan.setHours(21, 0, 0, 0);
    if (dailyPlan.getTime() > Date.now()) {
      reminders.push({
        id: `daily-plan-${dateString}`,
        scheduledAt: dailyPlan.toISOString(),
        title: 'Czas zaplanować jutro! 🗓️',
        body: 'Przejrzyj swoje zadania i zaplanuj kolejny dzień.',
        tag: `daily-plan-${dateString}`,
      });
    }

    if (date.getDay() === 1) {
      const weeklyReview = new Date(date);
      weeklyReview.setHours(8, 0, 0, 0);
      if (weeklyReview.getTime() > Date.now()) {
        reminders.push({
          id: `weekly-review-${dateString}`,
          scheduledAt: weeklyReview.toISOString(),
          title: 'Tygodniowy Przegląd! 🏆',
          body: 'Czas podsumować ubiegły tydzień i zaplanować nowe zwycięstwa.',
          tag: `weekly-review-${dateString}`,
        });
      }
    }
  }

  return reminders;
};

export const getPushSubscriptionStatus = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';
  const registration = await navigator.serviceWorker.ready;
  return (await registration.pushManager.getSubscription()) ? 'enabled' : 'disabled';
};

export const enablePushNotifications = async (tasks) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('To urządzenie nie obsługuje Web Push.');
  }

  const registration = await navigator.serviceWorker.ready;
  const { publicKey } = await apiRequest('/vapid-public-key');
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const clientId = getClientId();
  await apiRequest('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({ clientId, subscription: subscription.toJSON() }),
  });
  await syncPushReminders(tasks);
  return true;
};

export const syncPushReminders = async (tasks) => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription || !getPushApiUrl()) return false;

  await apiRequest('/reminders', {
    method: 'PUT',
    body: JSON.stringify({ clientId: getClientId(), reminders: buildPushReminders(tasks) }),
  });
  return true;
};

export const disablePushNotifications = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  const clientId = localStorage.getItem(CLIENT_ID_KEY);

  if (clientId && getPushApiUrl()) {
    await apiRequest(`/subscriptions/${encodeURIComponent(clientId)}`, { method: 'DELETE' });
  }
  if (subscription) await subscription.unsubscribe();
};
