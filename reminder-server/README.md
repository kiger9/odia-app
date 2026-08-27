# The reminder service

A Cloudflare Worker with one job: knock on a phone in the evening.

Apple gives a closed web app no way to wake itself up. Periodic Background Sync
— the thing that lets the app remind you on Android without any of this — does
not exist on iOS, so on an iPhone a push from somewhere else is the *only* way a
reminder can arrive while the app is shut. That somewhere else is this.

It is built to know as little as it can. A row is a push address, an hour, a
timezone and two dates:

| what it holds | why |
| --- | --- |
| the push endpoint and its keys | where to knock |
| hour + timezone | when it is evening *there* |
| last practised day | so it stays quiet on a day that already counts |
| last notified day | so nobody is nudged twice |

No name, no streak, no account, no email. The knock itself is the two words
`{"kind":"reminder"}`; the phone writes the reminder from what it already knows
about the learner, which never leaves it. (The progress backups this service also
keeps are filed under a hash of a code that only ever exists on the learner's
phone — see `src/backups.ts`.)

## Deploying it

You need a Cloudflare account and a VAPID key pair. **The public half must be
byte-identical to `VAPID_PUBLIC_KEY` in `src/notifications.ts` in the app.** A
mismatch is the nastiest failure this system has: everything looks healthy, the
service accepts subscriptions, and every push it sends is turned away. `/health`
reports the key it holds so you can compare the two, and the app records a
mismatch in Settings rather than leaving you to guess.

```sh
npm install

# 1. A database.
npx wrangler d1 create odia-reminder
#    Paste the database_id it prints into wrangler.jsonc, then:
npm run migrate

# 2. The key pair, if you don't already have one. Keep the private half.
node -e "import('@mmmike/web-push').then(async m =>
  console.log(await m.generateVapidKeys()))"

# 3. The secrets. VAPID_PRIVATE_KEY is what signs every push;
#    BACKUP_PEPPER is mixed into the sync-code hash, so a copy of the
#    database is not a head start on guessing people's codes.
npx wrangler secret put VAPID_PRIVATE_KEY
npx wrangler secret put BACKUP_PEPPER

# 4. Ship it.
npm run deploy
```

Then check what you deployed:

```sh
curl https://odia-reminder.<your-subdomain>.workers.dev/health
# {"ok":true,...,"vapidPublicKey":"BME-...","vapidConfigured":true}
```

`vapidConfigured` is `true` when the keys are usable, and otherwise a sentence
saying what is wrong with them. If it isn't `true`, nothing will be delivered —
so the sweep says so in the log and leaves everyone's rows alone rather than
burning through them.

The public settings — the origins allowed to call in, the contact address push
services complain to, the public key — live in `wrangler.jsonc`.

## Running it locally

```sh
cp .dev.vars.example .dev.vars   # then put a throwaway key pair in it
npm run migrate:local
npm run dev

curl http://localhost:8787/health
curl http://localhost:8787/cdn-cgi/handler/scheduled   # fire the sweep by hand
```

`.dev.vars` is gitignored. Use a throwaway key pair for it, not the deployed one.

## What it answers

Everything is `POST` with a JSON body, except `/health`. Every response is JSON,
and anything that isn't a 2xx means "try again later" to the app.

| route | body | what it does |
| --- | --- | --- |
| `/subscribe` | `{subscription, hour, tz, lastPracticedDay, replaces?}` | Signs a phone up, or updates it. Keyed on the endpoint, so calling it twice is calling it once. `replaces` names an address the phone has just rotated away from; its dates come across and the old row is dropped. Answers with the public key it holds. |
| `/unsubscribe` | `{endpoint}` | Forgets a phone. |
| `/practiced` | `{endpoint, lastPracticedDay}` | "Today already counts." 404 if the service has never heard of this address, which is the app's cue to sign up again. |
| `/status` | `{endpoint}` | What the service knows about this phone. The app uses it to rebuild a Settings screen the browser has wiped, and to tell "never signed up" from "the service had a bad minute". |
| `/test` | `{endpoint}` | A real knock, sent the real way. The Settings test button used to post a notification to itself, which proved only that the app was open. |
| `/backup` | `{code, data}` | Files a copy of someone's progress under a hash of their sync code. |
| `/restore` | `{code}` | Hands it back. Rate limited per caller, because guessing a code is the only attack on it. |
| `/health` | — | Is this deployed, and is the key pair usable. |

## The sweep

Every fifteen minutes (`triggers.crons` in `wrangler.jsonc`), the Worker reads
every row, works out what time it is where each phone is, and knocks on the ones
whose evening has arrived and who haven't practised.

Three details are load-bearing, and each of them is a way reminders used to stop
arriving:

- **Quarter-hourly, not hourly.** India runs at UTC+05:30 and Nepal at +05:45. A
  cron on the hour delivers everybody's 7:00 pm reminder at 7:30.
- **A window, not an instant.** The knock is owed from the chosen hour until
  midnight, not at the stroke of it. A tick that didn't run, or a service that
  was down at seven, used to cost the learner the whole evening; now the next
  tick catches up. The phone's own service worker uses the same rule, so the two
  can't disagree about whether tonight has been dealt with.
- **Only `404`/`410` forgets a phone.** Those mean the push service has dropped
  the address for good. Everything else — a flat battery, a plane, a push service
  having a bad hour — keeps its row and gets counted in `failures`, because a
  phone deleted over one bad night never gets another reminder.

The free plan allows fifty outbound requests per scheduled run, so the sweep
takes at most forty phones per tick and logs how many it left for the next one.
It never silently drops anybody.
