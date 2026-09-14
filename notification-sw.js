self.addEventListener('push', (event) => {
  const payload = (() => {
    try {
      return event.data ? event.data.json() : {};
    } catch {
      return { body: event.data?.text() || '' };
    }
  })();

  event.waitUntil(
    self.registration.showNotification(payload.title || 'SamoDyscyplina', {
      body: payload.body || 'Masz nowe przypomnienie.',
      tag: payload.tag || 'discipline-reminder',
      data: { url: payload.url || self.registration.scope },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || self.registration.scope;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const appClient = clients.find((client) => client.url.startsWith(self.registration.scope));
      if (appClient) {
        appClient.navigate(targetUrl);
        return appClient.focus();
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
