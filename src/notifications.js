const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

export const getNotificationStatus = () => {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return 'unsupported';
  }

  if (!isStandalone() && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    return 'ios-browser';
  }

  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  const status = getNotificationStatus();
  if (status === 'unsupported' || status === 'ios-browser') return status;
  if (Notification.permission !== 'default') return Notification.permission;

  return Notification.requestPermission();
};

export const showAppNotification = async (title, options = {}) => {
  if (getNotificationStatus() !== 'granted') return false;

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    ...options,
    data: {
      url: import.meta.env.BASE_URL,
      ...(options.data || {}),
    },
  });

  return true;
};
