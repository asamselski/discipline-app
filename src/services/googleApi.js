export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY?.trim();
export const GOOGLE_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
export const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

const GOOGLE_SCRIPT_TIMEOUT_MS = 30000;
const GOOGLE_TOKEN_STORAGE_KEY = 'discipline_google_access_token';
const GOOGLE_TOKEN_EXPIRY_MARGIN_MS = 60000;

export const saveGoogleAccessToken = (tokenResponse) => {
  const expiresInSeconds = Number(tokenResponse?.expires_in);
  if (!tokenResponse?.access_token || !Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) return;

  localStorage.setItem(GOOGLE_TOKEN_STORAGE_KEY, JSON.stringify({
    access_token: tokenResponse.access_token,
    token_type: tokenResponse.token_type || 'Bearer',
    scope: tokenResponse.scope || GOOGLE_DRIVE_SCOPE,
    expires_at: Date.now() + expiresInSeconds * 1000,
  }));
};

export const getStoredGoogleAccessToken = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(GOOGLE_TOKEN_STORAGE_KEY));
    const hasDriveScope = stored?.scope?.split(' ').includes(GOOGLE_DRIVE_SCOPE);
    if (stored?.access_token && hasDriveScope && stored.expires_at > Date.now() + GOOGLE_TOKEN_EXPIRY_MARGIN_MS) {
      return stored;
    }
  } catch (error) {
    console.warn('Nie udało się odczytać zapisanej sesji Google:', error);
  }

  localStorage.removeItem(GOOGLE_TOKEN_STORAGE_KEY);
  return null;
};

export const clearStoredGoogleAccessToken = () => {
  localStorage.removeItem(GOOGLE_TOKEN_STORAGE_KEY);
};

export const loadGoogleScript = (src, isReady, libraryName) => new Promise((resolve, reject) => {
  if (isReady()) {
    resolve();
    return;
  }

  let script = document.querySelector(`script[src="${src}"]`);
  const timeoutId = window.setTimeout(() => {
    cleanup();
    reject(new Error(`Przekroczono czas ładowania biblioteki ${libraryName}.`));
  }, GOOGLE_SCRIPT_TIMEOUT_MS);
  const intervalId = window.setInterval(() => {
    if (isReady()) finish();
  }, 100);

  const cleanup = () => {
    window.clearTimeout(timeoutId);
    window.clearInterval(intervalId);
    script?.removeEventListener('load', handleLoad);
    script?.removeEventListener('error', handleError);
  };
  const finish = () => {
    if (!isReady()) return;
    cleanup();
    resolve();
  };
  const handleLoad = () => finish();
  const handleError = () => {
    cleanup();
    reject(new Error(`Nie udało się pobrać biblioteki ${libraryName}.`));
  };

  const shouldAppendScript = !script;
  if (shouldAppendScript) {
    script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
  }

  script.addEventListener('load', handleLoad);
  script.addEventListener('error', handleError, { once: true });
  if (shouldAppendScript) document.head.appendChild(script);
  finish();
});

export const loadGapiClient = () => new Promise((resolve, reject) => {
  window.gapi.load('client', {
    callback: resolve,
    onerror: () => reject(new Error('Nie udało się uruchomić klienta Google API.')),
    timeout: GOOGLE_SCRIPT_TIMEOUT_MS,
    ontimeout: () => reject(new Error('Przekroczono czas inicjalizacji Google API.')),
  });
});

export const getGoogleErrorMessage = (error) => {
  const code = error?.result?.error?.code ?? error?.status;
  const detail = error?.result?.error?.message ?? error?.message ?? error?.error_description ?? error?.error;
  if (code === 401 || error?.result?.error?.status === 'UNAUTHENTICATED') {
    return 'Sesja Google wygasła. Zaloguj się ponownie.';
  }
  if (code === 403) {
    return 'Google odrzucił dostęp. Sprawdź włączenie Drive API, uprawnienia i ograniczenia klucza API.';
  }
  return detail || 'Nieznany błąd połączenia z Google.';
};
