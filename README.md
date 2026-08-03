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

1. Sunday: screenshot Runna, tap **Copy week summary** in the app (**Week**
   section, bottom bar).
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
  wendler: { cycle: 1, week: 1 },            // optional; shown in the app header + the export
  stages: 'BMU s1 | DU s1 | HSW s1 | T2B s1', // optional; echoed into the export's stages= line
  notes: 'Revised 28 July: squat moved to Wed…', // optional; echoed into plan_notes=
  days: [
    {
      day: 'Mon', // Mon-Sun; omit days with nothing planned
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

## Navigation

Two levels, both thumb-reachable:

- **Bottom bar** — the app's top-level **sections**: **Train** (log a day) and
  **Week** (quick fields, skipped blocks, the export). This is the expansion
  point: a new section is an entry in `SECTIONS`
  ([`src/components/TabBar.tsx`](src/components/TabBar.tsx)) plus its panel in
  the section switch in [`src/App.tsx`](src/App.tsx).
- **Day tabs** (inside Train) — **Mon–Sun**, the full week. Today carries a dot,
  Sat/Sun sit on a slightly recessed surface so the shape of the week reads at a
  glance. The selected day survives a trip to the Week section and back.

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
(Week section): max unbroken DU and C2 pace/watts quick fields.

Each exercise resolves a **measurement type** from the catalogue
(`src/catalogue`): `weightReps` (kg × reps rows), `reps` (rep rows, no kg
field), `band` (a per-set band-colour picker, `src/lib/bands.ts`), `time`
(a time entry per set on set-based work, or the actual field on free-text
work), `freeText` (the actual field). Two in-app overrides, both stored in the
log so they sync across devices:

- the **type tag** next to the name (e.g. `LOAD ▾`) opens **Log as** to switch
  how the exercise is measured (Auto reverts to the catalogue default);
- the **+ Add exercise** line at the bottom of each block opens a searchable
  catalogue picker to log **extra work that wasn't planned** (did the class WOD
  instead of the skill block? skip the block and add what you did). The
  addition gets set rows from its catalogue type (lifts/reps/band ×3, timed
  efforts ×1, runs a free-text actual), logs like any exercise, is removable
  (✕), and exports as `<name> (added)`. (This replaced the earlier per-slot ⇄
  swap; legacy swapped logs still render and export as `x (was y)`.)

**Move** reshuffles a block to any other day of the week, weekend included.

### Skipping

Skipping works at two scopes — **Skip block** against the block title, and
**Skip** on any single exercise, for dropping one movement without dropping the
session around it (a tweaky shoulder, a machine someone else is on). They are
the same gesture, and behave identically, so the scope is the only thing you
have to think about — and it is in the words rather than left to be inferred
from where the control sits:

- **One tap skips.** The reason is optional and asked for afterwards, so
  nothing stands between you and the next set. It stays editable for as long as
  the thing is skipped.
- **Nothing is lost.** A skipped block or exercise stays where it was as a
  placeholder, keeping whatever was already logged against it — **Restore**
  brings the ticks and numbers back untouched.
- **Skipped beats done.** A skipped exercise never counts toward completion or
  the Wendler roll-up, and the export reports `skipped` whatever is ticked
  underneath (the typed values still ride the `act_*` columns).
- Both appear in the Week section's **Skipped** list and in the export, on the
  `skipped=` and `skipped_exercises=` lines respectively. An exercise skipped
  inside an already-skipped block is not listed separately — the block going is
  the fact, and reporting it twice would read as two separate decisions.

Block skips are stored under the log's `deferred` field for data compatibility;
exercise skips under the exercise's own `skipped` / `skipReason`.

"Compress week" judgment is never done in-app; that belongs to the planning
chat where the fatigue rules live.

## The week export (the contract with the planning chat)

The Week section builds a `key=value` header followed by **one pipe-delimited
row per set**, shaped to drop straight into the planning chat's training log
(whose natural key is `week_id + day + block_id + exercise_id + set_index`):

```
ATHX WEEK EXPORT v2
week_id=2026-wk31
label=27 July - 2 August
week_start=2026-07-27
week_end=2026-08-02
exported=2026-07-29
wendler=C2W1 status=in_progress main_lifts_done=2/3
stages=C2W1 5s week (TMs held 63/126/171) / Mon press done 52.5x6
plan_notes=Revised 28 July: Tue missed, squat moved to Wed. …
blocks=19 (2 completed, 3 partial, 1 skipped, 5 not_logged, 8 planned)
moved=wed-squat Tue->Wed
skipped=thu-oly (Thu) "work ran late"
skipped_exercises=scap (Mon) "shoulder tight"
max_du_fresh=34
c2=4x6min 2:05/500m
session_notes=Mon="slept badly"

# …legend…
day|date|block_id|block|prio|wendler|exercise_id|exercise|measure|set|plan_w|plan_r|plan_rx|act_w|act_r|act_value|rpe|e1rm|status|note
Mon|2026-07-27|press|5/3/1 Shoulder press|1|y|press-main|Strict press|weightReps|1|40|5|Warm-up 25/32.5/37.5…|40|5|||46.5|completed|
Mon|2026-07-27|press|5/3/1 Shoulder press|1|y|press-main|Strict press|weightReps|3|52.5|5+||52.5|6|||63|completed|failed the 7th
Wed|2026-07-29|wed-squat|Back squat 5/3/1 (C2W1)|1|y|squat-main|Back squat|weightReps|3|107.5|5+||107.5||||not_logged|
```

Four properties make it unambiguous, and they are the whole point of the format:

- **Every planned block is emitted**, whether or not anything was logged
  against it. "Planned and not done" and "never planned" are different facts,
  and only the app knows which is which.
- **Nothing is inferred.** `status` is one of `completed` (ticked), `skipped`
  (the block or the exercise itself was skipped — the reason is on the header's
  `skipped=` or `skipped_exercises=` line), `planned` (the day is still ahead)
  or `not_logged` (reached, nothing ticked).
  Typed values still ride the `act_*` columns on a `not_logged` row, so the
  reader applies its own evidence rules rather than inheriting a guess. A row
  with an RPE, a note or a typed number is never `planned`, even on a future
  day — that means the session moved earlier.
- **It is self-contained.** The prescription (`plan_w`, `plan_r`, `plan_rx`),
  the ids, the priority and the `wendler` flag all travel with the actuals, so
  the planning chat never has to fetch the week's plan module to resolve a row.
- **Dates are derived** from the ISO week id, so day lines carry real calendar
  dates rather than leaving them to be inferred from the free-text label.

One row per programmed set; exercises with no programmed sets (and blocks with
no exercises) get a single row with `set` blank. Exercise-level fields
(`plan_rx`, `rpe`, `note`) sit on the first row of each exercise. Blank means no
value, never zero, and a `|` inside free text is replaced with `/` so the column
count is fixed at 20. In-session additions export as `<name> (added)`; legacy
swapped slots as `<name> (was <planned>)`.

Deterministic for a given plan, log **and export date** — the date only affects
whether an untouched future day reports `planned` or `not_logged`.

## Sync design

- **Local-first**: every change writes to `localStorage` immediately under a
  versioned key (`athx-log-v8:<weekId>`), then a debounced `PUT` to
  `/api/log/:weekId` (KV allows ~1 write/sec per key).
- **On load**: `GET` from KV, whole-record merge by `updatedAt`, last write
  wins (single user, acceptable).
- **Offline** at the gym is fine; unconfirmed edits are flagged and flushed
  when connectivity returns. The service worker keeps the app shell loading
  offline (PWA, installable).
- **Service worker cache rule**: JS/CSS are content-hashed, so a deploy renames
  them and the cache follows. The icons and the manifest are **not** hashed and
  are served cache-first, so changing one means bumping `VERSION` in
  [`public/sw.js`](public/sw.js) — `activate` only drops caches whose name no
  longer matches, and without the bump an installed PWA serves the old file
  indefinitely.
- **Versioning rule**: any structural change to the log shape bumps the
  localStorage key version (`v1` → … → `v9`) so stale state never merges
  into new code. KV records are unversioned; v2-era records were repaired by
  the one-shot v2 → v3 migration (`src/lib/migrate.ts`) and rewritten clean.
  The repair never runs on v3+ data — a typed `0` weight legitimately means
  bodyweight and is kept as logged. `v4` added the per-set band colour and the
  per-exercise measure override; `v5` the (since-retired) exercise swap and
  per-set time/cal/distance; `v6` per-block added exercises; `v7` stored set
  values as coerced clean numbers (dropping corrupted legacy ones); `v8` the
  per-exercise skip — all purely additive beyond v7's scrub, so those
  migrations just move the record forward. `v9` rekeyed `exercises` from the
  bare exercise id to `blockId::exerciseId`
  ([`src/lib/logKeys.ts`](src/lib/logKeys.ts)), so a movement programmed twice
  in one week keeps one id and still logs independently on each day. That one
  is **not** additive, and because the KV copy is unversioned and shared,
  `scopeLog()` rekeys on every read — local and remote alike — rather than
  only on promotion. It is idempotent; an id the plan no longer carries keeps
  its unscoped key rather than being dropped.

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
  // keyed "<blockId>::<exerciseId>" — the block is part of the key, so the same
  // movement programmed on two days logs independently under one exercise id
  exercises: {
    // set-based: index-aligned with the plan's sets; empty w/r = untouched (done as prescribed)
    "press::press-main": { sets: [ { w: "40", r: "5", done: true }, { w: "47.5", r: "5", done: true },
                                   { w: "52.5", r: "7", done: true } ], rpe: 8, note: "strong" },
    // free-text: runs, C2, anything without programmed sets. Same id, two blocks, two entries.
    "mon-run::easy-run": { done: true, actual: "38:20 z2" , rpe: 5 },
    "tue-long-run::easy-run": { done: true, actual: "45:00 z2-3", rpe: 6 },
    // skipped on its own; anything logged before the skip is kept and restored with it
    "shoulder-physio::scap": { skipped: true, skipReason: "shoulder tight" }
  },
  sessionNotes: { "Mon": "slept badly" },
  deferred: [ { blockId: "cj", from: "Thu", reason: "London trip" } ], // whole-block skips
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
- Hand-written **service worker** + manifest for PWA / offline. The app icon (a
  lifter with a barbell overhead, in the app's accent on the ink background) is
  defined geometrically in [`scripts/gen-icons.mjs`](scripts/gen-icons.mjs) as
  capsules and rendered by a hand-rolled PNG encoder, so `npm run icons` needs
  no fonts or image libraries and produces identical output anywhere. The mark
  is scaled by its true ink radius, so the maskable safe zone holds even if the
  figure is redrawn.

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
src/lib/plans.ts               typed plan access, Mon-Sun days, day layout (moves/deferrals)
src/lib/export.ts              the week-summary text builder
src/lib/{api,storage,log}.ts   KV client, localStorage mirror, merge rules
src/hooks/useLog.ts            local-first state + debounced sync
src/components/                gate, header, day view, block card, week panel, section bar
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
