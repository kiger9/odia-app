-- The reminder service's whole memory. Deliberately small: a push address, when
-- to knock, and the two dates that decide whether tonight's knock is owed. No
-- name, no streak, no account — the phone composes the reminder itself, so none
-- of that has to leave it.
--
-- Applied with `npm run migrate` (add :local for the dev database). Every
-- statement is IF NOT EXISTS, so re-running it is safe.

CREATE TABLE IF NOT EXISTS subscriptions (
  -- The push endpoint is a capability URL: whoever holds it can push to that
  -- phone. It is the primary key so re-registering updates a row rather than
  -- adding one, which is what makes the client's daily refresh cheap.
  endpoint TEXT PRIMARY KEY,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  hour INTEGER NOT NULL,
  tz TEXT NOT NULL,
  last_practiced_day TEXT,
  last_notified_day TEXT,
  -- Consecutive delivery failures that were *not* "this address is gone". Kept
  -- for the health endpoint; never a reason on its own to forget a phone.
  failures INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- The hourly sweep reads by hour and skips anyone already dealt with today.
CREATE INDEX IF NOT EXISTS subscriptions_by_hour ON subscriptions (hour, last_notified_day);

-- Progress backups, filed under a hash of the learner's sync code. The code
-- itself is never stored: it is the whole credential, and it only exists on the
-- phone that generated it.
CREATE TABLE IF NOT EXISTS backups (
  code_hash TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  saved_at INTEGER NOT NULL
);

-- Guessing a code is the only attack on a backup, so restores are rate limited
-- per caller. One row per caller per window; the sweep clears out old ones.
CREATE TABLE IF NOT EXISTS restore_attempts (
  caller TEXT PRIMARY KEY,
  tries INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);
