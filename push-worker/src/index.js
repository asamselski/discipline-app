import { buildPushHTTPRequest } from '@pushforge/builder';

const json = (payload, status = 200, origin = '*') => new Response(JSON.stringify(payload), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  },
});

const allowedOrigin = (request, env) => {
  const origin = request.headers.get('Origin');
  return origin === env.ALLOWED_ORIGIN ? origin : null;
};

const handleApi = async (request, env) => {
  const url = new URL(request.url);
  const origin = allowedOrigin(request, env);

  if (request.method === 'OPTIONS') {
    return origin ? json({ ok: true }, 200, origin) : json({ error: 'Niedozwolone źródło.' }, 403);
  }
  if (!origin) return json({ error: 'Niedozwolone źródło.' }, 403);

  if (request.method === 'GET' && url.pathname === '/vapid-public-key') {
    return json({ publicKey: env.VAPID_PUBLIC_KEY }, 200, origin);
  }

  if (request.method === 'POST' && url.pathname === '/subscriptions') {
    const payload = await request.json();
    const { clientId, subscription } = payload;
    if (!clientId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return json({ error: 'Niepełna subskrypcja.' }, 400, origin);
    }

    const now = Date.now();
    await env.DB.prepare(`
      INSERT INTO subscriptions (client_id, endpoint, p256dh, auth, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(client_id) DO UPDATE SET
        endpoint = excluded.endpoint,
        p256dh = excluded.p256dh,
        auth = excluded.auth,
        updated_at = excluded.updated_at
    `).bind(clientId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth, now, now).run();

    return json({ ok: true }, 200, origin);
  }

  if (request.method === 'PUT' && url.pathname === '/reminders') {
    const { clientId, reminders } = await request.json();
    if (!clientId || !Array.isArray(reminders) || reminders.length > 1000) {
      return json({ error: 'Nieprawidłowa lista przypomnień.' }, 400, origin);
    }

    const subscription = await env.DB.prepare('SELECT client_id FROM subscriptions WHERE client_id = ?')
      .bind(clientId).first();
    if (!subscription) return json({ error: 'Najpierw włącz subskrypcję.' }, 409, origin);

    const statements = [env.DB.prepare('DELETE FROM reminders WHERE client_id = ? AND sent_at IS NULL').bind(clientId)];
    reminders.forEach((reminder) => {
      const scheduledAt = Date.parse(reminder.scheduledAt);
      if (!reminder.id || !Number.isFinite(scheduledAt) || !reminder.title || !reminder.body) return;
      statements.push(env.DB.prepare(`
        INSERT OR REPLACE INTO reminders (id, client_id, scheduled_at, title, body, tag, sent_at)
        VALUES (?, ?, ?, ?, ?, ?, NULL)
      `).bind(
        String(reminder.id).slice(0, 160),
        clientId,
        scheduledAt,
        String(reminder.title).slice(0, 120),
        String(reminder.body).slice(0, 300),
        String(reminder.tag || reminder.id).slice(0, 120),
      ));
    });
    await env.DB.batch(statements);

    return json({ ok: true, scheduled: statements.length - 1 }, 200, origin);
  }

  if (request.method === 'DELETE' && url.pathname.startsWith('/subscriptions/')) {
    const clientId = decodeURIComponent(url.pathname.slice('/subscriptions/'.length));
    await env.DB.batch([
      env.DB.prepare('DELETE FROM reminders WHERE client_id = ?').bind(clientId),
      env.DB.prepare('DELETE FROM subscriptions WHERE client_id = ?').bind(clientId),
    ]);
    return json({ ok: true }, 200, origin);
  }

  return json({ error: 'Nie znaleziono endpointu.' }, 404, origin);
};

const sendDueReminders = async (env) => {
  const now = Date.now();
  const due = await env.DB.prepare(`
    SELECT r.id, r.client_id, r.title, r.body, r.tag,
           s.endpoint, s.p256dh, s.auth
    FROM reminders r
    JOIN subscriptions s ON s.client_id = r.client_id
    WHERE r.sent_at IS NULL AND r.scheduled_at <= ? AND r.scheduled_at >= ?
    ORDER BY r.scheduled_at ASC
    LIMIT 100
  `).bind(now, now - 86400000).all();

  const privateJWK = JSON.parse(env.VAPID_PRIVATE_JWK);
  for (const reminder of due.results || []) {
    try {
      const request = await buildPushHTTPRequest({
        privateJWK,
        subscription: {
          endpoint: reminder.endpoint,
          keys: { p256dh: reminder.p256dh, auth: reminder.auth },
        },
        message: {
          payload: {
            title: reminder.title,
            body: reminder.body,
            tag: reminder.tag,
            url: 'https://asamselski.github.io/discipline-app/',
          },
          adminContact: env.VAPID_SUBJECT,
          options: { ttl: 3600, urgency: 'high' },
        },
      });
      const response = await fetch(request.endpoint, {
        method: 'POST',
        headers: request.headers,
        body: request.body,
      });

      if (response.ok) {
        await env.DB.prepare('UPDATE reminders SET sent_at = ? WHERE id = ? AND client_id = ?')
          .bind(now, reminder.id, reminder.client_id).run();
      } else if (response.status === 404 || response.status === 410) {
        await env.DB.batch([
          env.DB.prepare('DELETE FROM reminders WHERE client_id = ?').bind(reminder.client_id),
          env.DB.prepare('DELETE FROM subscriptions WHERE client_id = ?').bind(reminder.client_id),
        ]);
      }
    } catch (error) {
      console.error('Nie udało się wysłać przypomnienia:', reminder.id, error);
    }
  }

  await env.DB.prepare('DELETE FROM reminders WHERE sent_at IS NOT NULL AND sent_at < ?')
    .bind(now - 30 * 86400000).run();
};

export default {
  fetch: handleApi,
  scheduled(_controller, env, context) {
    context.waitUntil(sendDueReminders(env));
  },
};
