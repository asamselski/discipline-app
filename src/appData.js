const PREFIX = 'discipline_';

export const createBackupDocument = (storage = localStorage) => {
  const data = {};

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(PREFIX)) data[key] = storage.getItem(key);
  }

  return {
    app: 'SamoDyscyplina',
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    data,
  };
};

export const readBackupDocument = (document) => {
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    throw new Error('Nieprawidłowy format kopii zapasowej.');
  }

  const source = document.data && typeof document.data === 'object'
    ? document.data
    : document;
  const entries = Object.entries(source).filter(([key, value]) =>
    key.startsWith(PREFIX) && typeof value === 'string');

  if (entries.length === 0) {
    throw new Error('Plik nie zawiera danych aplikacji SamoDyscyplina.');
  }

  return Object.fromEntries(entries);
};

export const restoreBackupDocument = (document, storage = localStorage) => {
  const data = readBackupDocument(document);

  Object.entries(data).forEach(([key, value]) => storage.setItem(key, value));
  return Object.keys(data).length;
};

export const downloadBackupDocument = () => {
  const document = createBackupDocument();
  const blob = new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  const day = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `samodyscyplina-backup-${day}.json`;
  link.click();
  URL.revokeObjectURL(url);
};
