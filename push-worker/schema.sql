CREATE TABLE IF NOT EXISTS subscriptions (
  client_id TEXT PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  scheduled_at INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tag TEXT NOT NULL,
  sent_at INTEGER,
  PRIMARY KEY (id, client_id),
  FOREIGN KEY (client_id) REFERENCES subscriptions(client_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS reminders_due_idx
ON reminders(sent_at, scheduled_at);
