# Training Tracker

A private, mobile-first hybrid-training tracker for a single user. It shows a
weekly training **plan** and lets you **log** it set by set, synced across your
phone and laptop through Cloudflare KV. Pin it to your home screen and use it
mid-session.

## The core idea: plan vs log

Two kinds of data, kept separate on purpose:

- **The plan** — what you are meant to do each week. Lives in this repo as
  editable TypeScript modules under [`src/plans/`](src/plans), versioned in git
  and bundled with the site. It is served with the app, so it is always current
  on every device. Changing the plan is a code edit + redeploy.
- **The log** — what you actually did (ticked sets, weights, reps, notes). Lives
  in **Cloudflare KV**, written through a small JSON API, so it follows you
  between devices. You fill it in yourself by tapping.

The plan evolves freely in code without touching stored data; the log stays
synced and durable without being locked to a rigid schema. New weeks arrive as
repo edits, never as an in-app import.

## Tech stack

- **Vite + React + TypeScript** front end (single screen, no router).
- One hand-written CSS file ([`src/styles.css`](src/styles.css)) using CSS
  custom properties for the palette. No Tailwind, no component library.
- **Cloudflare Workers** for hosting: the built app in `dist/` is served as
  static assets, and a small Worker ([`worker/index.ts`](worker/index.ts))
  serves the log API and the SPA fallback.
- **Cloudflare KV** for storage — one namespace, one key per week
  (`log:<weekId>`).
- A hand-written **service worker** + web manifest for PWA / offline.

> The API logic lives in [`server/logApi.ts`](server/logApi.ts) and is shared by
> the Worker and a Cloudflare **Pages Function** adapter
> ([`functions/api/log/[weekId].ts`](functions/api/log/%5BweekId%5D.ts)), so the
> app can also be deployed as a Pages project unchanged if you prefer.

---

## Prerequisites

- Node 20+ and npm (Node 22 is pinned for the Cloudflare build via
  [`.node-version`](.node-version)).
- A Cloudflare account (free tier is fine).
- A KV namespace bound as `TRACKER_KV` (see below).

## Deploy — the easy way (browser only, via Git)

Cloudflare builds and deploys on its own servers straight from GitHub — no local
tooling needed.

1. **Create the KV namespace.** Dashboard → **Storage & Databases → KV → Create
   a namespace**, name it `TRACKER_KV`, copy its **Namespace ID**, and put it in
   [`wrangler.toml`](wrangler.toml) (`id` and `preview_id`). When a
   `wrangler.toml` is present, Cloudflare reads bindings from it, so the id must
   live there. (This repo already has one wired in — replace it with yours.)
2. **Create the project from Git.** Dashboard → **Workers & Pages → Create →
   Connect to Git** → pick the repo → set the production branch. Cloudflare
   detects the config; the build command is `npm run build` and the deploy
   command is `npx wrangler deploy`.
3. **Deploy.** Every push to the production branch rebuilds and redeploys. You
   get a `…workers.dev` URL (or attach a custom domain).

The passcode is set via `[vars] APP_TOKEN` in `wrangler.toml`. To harden it into
a real secret, add an encrypted **Secret** named `APP_TOKEN` under the project's
**Settings → Variables and Secrets** (or `npx wrangler secret put APP_TOKEN`) and
remove the `[vars]` line.

## Deploy — from a terminal

```sh
npm install
npx wrangler login
# create the KV namespace and paste its id into wrangler.toml:
npx wrangler kv namespace create TRACKER_KV
npm run deploy            # runs: npm run build && wrangler deploy
```

Optionally make the passcode a real secret instead of a `[vars]` value:

```sh
npx wrangler secret put APP_TOKEN
```

> Wrangler's exact flags change between versions — if a command is rejected,
> check the current [Workers](https://developers.cloudflare.com/workers/) and
> [KV](https://developers.cloudflare.com/kv/) docs and adapt.

### Definition of done

- Open the live URL on a phone, enter the passcode once, see Week 6 with
  Wednesday marked as today.
- Tick a set, reload → it persists. Open on a second device → same state.
- Editing a week's plan in the repo and redeploying preserves already-logged
  sets for unchanged sessions.
- Adding a week is a repo edit + redeploy, no import step.
- Installable to the home screen; opens offline showing last-synced data.

## Local development

Install dependencies and create a local secrets file for the passcode
(git-ignored):

```sh
npm install
cp .dev.vars.example .dev.vars     # set APP_TOKEN=<your local passcode>
```

Run the **full stack** (built app + Worker API + a local KV emulator):

```sh
npm run preview:worker             # builds, then runs `wrangler dev`
```

Opens on <http://localhost:8787> with a local `TRACKER_KV`. `.dev.vars` sets the
local `APP_TOKEN` (overrides the `[vars]` value in dev). Exercise load, log,
autosave, reload-persists, reset, and export end to end.

For fast UI-only work (Vite HMR, **no** API/KV — API calls will 404):

```sh
npm run dev
```

---

## Adding / editing a week

This is the weekly workflow:

1. **Create a plan module** under `src/plans/`, e.g. `src/plans/2026-W07.ts`,
   default-exporting a `Week` object. Copy an existing week as a starting point.
2. **Register it** in [`src/plans/index.ts`](src/plans/index.ts): import it and
   add it to the `WEEKS` array. Weeks sort ascending by `id`, so use a sortable
   id like `2026-W07`.
3. If the week needs a new capability, make the small renderer change it calls
   for (see "Extending" below). Keep all previous weeks intact.
4. Commit + push (auto-redeploys), or `npm run deploy`.

The app shows the **current** week automatically: the week that contains a day
flagged `today: true`, otherwise the highest `id`. A compact week switcher in
the header jumps between weeks. Past weeks are never deleted.

### Plan reference shape

The shape is a *reference, not a hard contract*. Future weeks may add fields or
new session kinds; the renderer ignores unknown fields.

```ts
type Week = {
  id: string;          // sortable, e.g. "2026-W06"
  label: string;       // "Week 6"
  dateRange: string;   // "Mon 29 Jun to Sun 5 Jul"
  subtitle: string;    // short summary line
  days: Day[];
};

type Day = {
  key: string;         // "mon"
  dow: string;         // "Mon"
  date: string;        // "29 Jun"
  today?: boolean;
  sessions: Session[];
};

type Session = {
  id: string;          // unique within the week, stable; logs key off this
  type: SessionType;   // selects colour (see below)
  name: string;
  target: string;      // prescription text shown under the name
  kind: "logSets" | "repSets" | "single";
  sets?: number;       // for logSets and repSets
  optional?: boolean;  // excluded from progress totals, still tickable
  noteField?: boolean; // single only: show a free-text field
  prefillDone?: boolean;                                   // repSets or single
  prefillSets?: { w: string; r: string; done: boolean }[]; // logSets
};
```

**Session kinds**

- `logSets` — a loaded lift. Renders `sets` rows, each with a done toggle, a
  weight (kg) input and a reps input. `prefillSets` prefills rows in order.
- `repSets` — prescribed reps, no load. Renders `sets` numbered done chips.
  `prefillDone` starts them all done.
- `single` — one done toggle, plus a notes field if `noteField`. `prefillDone`
  starts it done.

**Session type colours** (`type`): `strength`, `oly`, `runQuality`, `runEasy`,
`runLong`, `physio`, `skill`, `cond`, `rest`. See
[`src/lib/theme.ts`](src/lib/theme.ts).

**Prefill** only seeds a week's log when that week has no stored log yet, on
first open. Once you have logged anything for a week, KV is authoritative and
prefill is ignored.

**Progress** counts non-optional sessions only: `logSets` and `repSets`
contribute `sets` units, `single` contributes 1.

### Extending: adding a new session kind

Kinds are built through a registry, so a new kind is an isolated change:

1. Add a `SessionKind` to [`src/types.ts`](src/types.ts).
2. Add one entry to `KINDS` in
   [`src/kinds/registry.tsx`](src/kinds/registry.tsx) with `init`, `reconcile`,
   `units`, `doneUnits`, and a `Component`.

Nothing else needs to change — reconciliation, progress, and rendering all read
from the registry.

---

## Reconciliation (why plan edits are safe mid-week)

A week's log is keyed by session `id`. On load, the stored log is merged onto
the current plan:

- stored entries for session ids that still exist are kept,
- missing sessions are initialised from their prefill,
- entries whose session is gone are dropped.

So you can add, move, or rename a session mid-week and your already-logged sets
for unchanged sessions are preserved.

## Sync & offline behaviour

- Every loaded log is mirrored to `localStorage`. On open, the local copy
  renders immediately, then the app refreshes from the API and reconciles,
  treating the **server as source of truth** when both exist.
- Logging **autosaves**: any change is debounced ~800 ms then `PUT` to the API
  (debounced because KV allows ~1 write/sec per key).
- If a save fails (offline), it is kept locally and retried on the next change
  or when the connection returns.
- The service worker serves the app shell offline (cache-first, with a
  build-time precache manifest) and is network-only for the API; offline log
  data comes from `localStorage`.

## The log API

Served by the Worker at `/api/log/:weekId` (logic in
[`server/logApi.ts`](server/logApi.ts)):

| Method   | Path               | Body            | Response               |
| -------- | ------------------ | --------------- | ---------------------- |
| `GET`    | `/api/log/:weekId` | –               | `{ "log": {…}\|null }` |
| `PUT`    | `/api/log/:weekId` | `{ "log": {…} }` | `{ "ok": true }`       |
| `DELETE` | `/api/log/:weekId` | –               | `{ "ok": true }`       |

Every request requires header `X-App-Token` equal to `APP_TOKEN`; mismatches
return `401`. KV layout: key `log:<weekId>` holds the log JSON.

**Log shape**, keyed by session `id`:

```ts
type SessionLog =
  | { done: boolean; value?: string }                    // single
  | boolean[]                                             // repSets
  | { weight: string; reps: string; done: boolean }[];   // logSets
type WeekLog = Record<string, SessionLog>;
```

## Passcode

The passcode gate keeps casual visitors out. The app asks for it once, stores it
in `localStorage`, and sends it on every request as `X-App-Token`. Use **Clear
passcode** in the header to remove it. A wrong passcode returns `401` and
re-prompts.

## Optional: Cloudflare Access (stronger, and free for one user)

The passcode is a light gate. For real protection, put **Cloudflare Access
(Zero Trust)** in front of the site so only your email can open it:

1. Dashboard → **Zero Trust → Access → Applications → Add an application →
   Self-hosted**.
2. Set the application domain to your deployment URL.
3. Add a policy: **Action: Allow**, **Include: Emails → your email address**.
4. Save. Cloudflare now requires an email one-time-PIN / SSO login before the app
   loads. Free for up to 50 users.

This does not replace the passcode (the API still checks `X-App-Token`); it adds
an identity gate in front of the whole site.

## Project structure

```
worker/index.ts                Worker entry: serves /api + static assets + SPA
server/logApi.ts               shared log API logic (KV + token check)
functions/api/log/[weekId].ts  Pages Function adapter (optional Pages deploys)
src/plans/                     one module per week + index (the plan)
src/kinds/registry.tsx         session-kind registry (render + logic)
src/lib/                       api, storage, reconcile, progress, theme
src/hooks/useWeekLog.ts        load, reconcile, debounced autosave, offline
src/components/                header, day card, session block, gate, …
public/sw.js                   service worker (built with an injected manifest)
public/manifest.webmanifest    PWA manifest
scripts/gen-icons.mjs          regenerate placeholder icons (npm run icons)
scripts/inject-sw-manifest.mjs post-build: precache manifest + cache version
wrangler.toml                  Worker + assets + KV + vars config
```

## Icons

Placeholder PWA icons live in `public/` and can be regenerated with
`npm run icons`. Replace them with real artwork any time (keep the filenames and
the `maskable` variants).
