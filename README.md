# ATHX Training Tracker

A single-user training tracker that closes the weekly loop: Claude drafts the
week in the planning Project, the plan lands here via a Claude Code prompt, you
log against it at the gym on your phone, and a one-tap export feeds results
back into next week's planning chat.

## The core idea: plans are code, logs are data

- **Plans** live in this repo as one plain-JS module per week under
  [`src/plans/`](src/plans), deployed with the app. Weekly plan changes never
  touch app logic.
- **Logs** (actuals, RPE, notes, deferrals) live in **Cloudflare KV**, written
  through a small JSON API. Logging never requires a deploy.

## Weekly workflow loop

1. Sunday: screenshot Runna, tap **Copy week summary** in the app (Week tab).
2. New chat in the planning Project: attach screenshot, paste export.
3. The chat drafts the week; approve or adjust.
4. It outputs a Claude Code prompt: *"create `src/plans/2026-wk29.js` with this
   object, update `currentWeekId` in `src/plans/index.js`, deploy"*.
5. Run it; the new week is live on phone and laptop.

## Adding / editing a week

1. Create `src/plans/<weekId>.js` default-exporting a week object (copy an
   existing week for the shape).
2. Register it in [`src/plans/index.js`](src/plans/index.js): import it, add it
   to `weeks`, and point `currentWeekId` at it.
3. Commit + push (auto-redeploys), or `npm run deploy`.

### Plan module shape

```js
export default {
  weekId: '2026-wk28',
  label: '6-10 July',
  wendler: { cycle: 1, week: 1 },            // optional; shown in header + STATE line
  stages: 'BMU s1 | DU s1 | HSW s1 | T2B s1', // optional; echoed into the STATE line
  days: [
    {
      day: 'Mon', // Mon-Fri
      blocks: [
        {
          id: 'press',              // stable id
          title: '5/3/1 Strict press',
          short: 'press',           // compact label used in the export (falls back to title)
          priority: 1,              // P1 runs/main lifts/physio, P2 skills/C2, P3 oly/extras
          wendler: true,            // optional: marks 5/3/1 main lifts, drives "complete" in STATE
          exercises: [
            {
              id: 'press-main',
              name: 'Strict press',
              rx: '40x5, 47.5x5, 52.5x5+ kg',
              // Per-set programming: the app shows one editable row per set
              // (weight x reps, programmed values as placeholders) that is
              // ticked off at the gym. Omit `w` for bodyweight work; omit
              // `sets` entirely for free-text logging (runs, C2, carries).
              sets: [
                { w: 40, r: 5 },
                { w: 47.5, r: 5 },
                { w: 52.5, r: '5+' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
```

**Rules:** exercise ids stay stable across weeks where the exercise recurs
(`press-main` is always `press-main`), so history queries stay trivial later.

## Logging model

Set-based exercises (those with `sets` in the plan) show one row per set —
**done** tick, **weight**, and **reps**. The inputs start empty with the
programming as placeholders — a stored value always means it was typed, and a
set ticked done with nothing typed counts as done-as-prescribed without
inventing an actual; the exercise-level tick marks all sets at once. Weighted exercises show a live **estimated 1RM** (Epley, from the best
completed set — the AMRAP top set in a 5/3/1 week) inline under the sets.
Exercises without programmed sets keep a single **done** toggle and a
free-text **actual** (e.g. `7.5km 42:10`). Every exercise also has **RPE**
(1-10 stepper) and an optional **note**. Per day: a session note. Per week
(Week tab): max unbroken DU and C2 pace/watts quick fields.

Each exercise resolves a **measurement type** from the catalogue
(`src/catalogue`): `weightReps` (kg × reps rows), `reps` (rep rows, no kg
field), `band` (a per-set band-colour picker, `src/lib/bands.ts`), `time`
(a time entry per set on set-based work, or the actual field on free-text
work), `freeText` (the actual field). Two in-app overrides, both stored in the
log so they sync across devices:

- the **type tag** next to the name (e.g. `LOAD ▾`) opens **Log as** to switch
  how the exercise is measured (Auto reverts to the catalogue default);
- the **⇄ button** opens a searchable catalogue picker to log a **different
  exercise than planned** (e.g. the plan said muscle-ups, you did devil press).
  The slot adopts the picked exercise's name and default measure, shows
  `was: <planned>`, and exports as what was actually done; **As programmed**
  reverts. Set-based slots only offer movements that can log per-set rows.

Block actions:

- **Defer** removes the block from the week with a required reason. Deferred
  blocks stay visible on their home day as placeholders (nothing lost
  silently), appear at the top of the export, and can be restored.
- **Move** reshuffles a block to another weekday.

"Compress week" judgment is never done in-app; that belongs to the planning
chat where the fatigue rules live.

## The week export (the contract with the planning chat)

The Week tab builds a deterministic summary:

```
WEEK EXPORT 2026-wk28 (6-10 July)
STATE: Wendler C1W1 complete | BMU s1 | DU s1 | HSW s1 | T2B s1
DEFERRED: clean and jerk (Thu, London trip)
MAX DU FRESH: 34
C2: 4x6min 2:05/500m
Mon press: 52.5x7 @8 "strong" | shoulder physio done | BMU done
NOTES: slept badly (Mon)
```

Day lines list blocks sorted by priority: a set-based exercise renders its
completed sets plus the estimated 1RM when one is computable
(`press: 40x5, 47.5x5, 52.5x7 (e1RM 64.5) @8`), a free-text exercise its
actual, and a block that is just ticked renders `short done` (or `short 2/3
done` when partial). Untouched blocks are omitted. `DEFERRED` is always
present (`none` when empty); `MAX DU FRESH` / `C2` appear when set.

## Sync design

- **Local-first**: every change writes to `localStorage` immediately under a
  versioned key (`athx-log-v5:<weekId>`), then a debounced `PUT` to
  `/api/log/:weekId` (KV allows ~1 write/sec per key).
- **On load**: `GET` from KV, whole-record merge by `updatedAt`, last write
  wins (single user, acceptable).
- **Offline** at the gym is fine; unconfirmed edits are flagged and flushed
  when connectivity returns. The service worker keeps the app shell loading
  offline (PWA, installable).
- **Versioning rule**: any structural change to the log shape bumps the
  localStorage key version (`v1` → … → `v5`) so stale state never merges
  into new code. KV records are unversioned; v2-era records were repaired by
  the one-shot v2 → v3 migration (`src/lib/migrate.ts`) and rewritten clean.
  The repair never runs on v3+ data — a typed `0` weight legitimately means
  bodyweight and is kept as logged. `v4` added the per-set band colour and the
  per-exercise measure override; `v5` added the exercise swap — both purely
  additive, so those migrations just move the record forward.

## The log API

Served by the Worker at `/api/log/:weekId` (logic in
[`server/logApi.ts`](server/logApi.ts)):

| Method   | Path               | Body             | Response               |
| -------- | ------------------ | ---------------- | ---------------------- |
| `GET`    | `/api/log/:weekId` | –                | `{ "log": {…}\|null }` |
| `PUT`    | `/api/log/:weekId` | `{ "log": {…} }` | `{ "ok": true }`       |
| `DELETE` | `/api/log/:weekId` | –                | `{ "ok": true }`       |

Every request requires header `X-App-Token` equal to the `APP_TOKEN` Worker
var; mismatches return `401`. KV layout: key `log:<weekId>` holds:

```js
{
  exercises: {
    // set-based: index-aligned with the plan's sets; empty w/r = untouched (done as prescribed)
    "press-main": { sets: [ { w: "40", r: "5", done: true }, { w: "47.5", r: "5", done: true },
                            { w: "52.5", r: "7", done: true } ], rpe: 8, note: "strong" },
    // free-text: runs, C2, anything without programmed sets
    "easy-run": { done: true, actual: "7.5km 42:10", rpe: 6 }
  },
  sessionNotes: { "Mon": "slept badly" },
  deferred: [ { blockId: "cj", from: "Thu", reason: "London trip" } ],
  moves: { "c2-block": "Wed" },
  maxDU: 34,
  c2: "4x6min 2:05/500m",
  updatedAt: 1751790000000
}
```

## Auth

A single shared token, stored as an encrypted Worker **Secret** named
`APP_TOKEN` (dashboard: **Workers & Pages → personal-workout-app → Settings →
Variables and Secrets**, or `npx wrangler secret put APP_TOKEN`) and entered
once in the app; it is stored in `localStorage` and sent as `X-App-Token` on
every request. Good enough for one user; no accounts. The ⚙ button clears it.
This repo is public, so the token must never appear in `wrangler.toml` — if the
secret is missing, every API request returns 401 until it is set.

## Tech stack

- **Vite + React + TypeScript** front end; plan modules are deliberately plain
  JS. One hand-written CSS file, no component library.
- **Cloudflare Worker** serves the built app as static assets plus the log API
  ([`worker/index.ts`](worker/index.ts)). A Pages Function adapter
  ([`functions/api/log/[weekId].ts`](functions/api/log/%5BweekId%5D.ts)) shares
  the same handler if you ever deploy as a Pages project instead.
- **Cloudflare KV**: one namespace, one key per week.
- Hand-written **service worker** + manifest for PWA / offline.

## Deploy

Pushes to the production branch auto-build and deploy via the Cloudflare
dashboard Git integration (build `npm run build`, deploy `npx wrangler
deploy`). From a terminal:

```sh
npm install
npx wrangler login
npm run deploy
```

The KV namespace is bound as `TRACKER_KV` in `wrangler.toml`.

## Local development

```sh
npm install
cp .dev.vars.example .dev.vars   # set APP_TOKEN=<local passcode>
npm run preview:worker           # build + wrangler dev on :8787 (app + API + local KV)
npm run dev                      # UI-only Vite HMR (API calls 404)
npm run typecheck
```

## Project structure

```
src/plans/index.js             registry: weekId -> module, exports currentWeekId
src/plans/2026-wk28.js         one plain-JS module per training week
src/types.ts                   plan + log shapes
src/lib/plans.ts               typed plan access, day layout (moves/deferrals)
src/lib/export.ts              the week-summary text builder
src/lib/{api,storage,log}.ts   KV client, localStorage mirror, merge rules
src/hooks/useLog.ts            local-first state + debounced sync
src/components/                gate, header, day view, block card, week panel
worker/index.ts                Worker entry: /api + static assets + SPA fallback
server/logApi.ts               shared log API logic (KV + token check)
functions/api/log/[weekId].ts  Pages Function adapter (optional)
public/                        PWA: sw.js, manifest, icons
scripts/                       icon generation, SW precache injection
wrangler.toml                  Worker + assets + KV + APP_TOKEN config
```

## Non-goals (for now)

No historical charting or PR dashboards, no JSON import UI (plans arrive only
via repo edits), no multi-user support, no accounts.
