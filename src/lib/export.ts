import type { Block, DayName, Exercise, ExerciseLog, MeasureType, SetLog, WeekLog, WeekPlan } from '../types'
import { DAY_NAMES, blocksForDay, findBlock } from './plans'
import { catalogueEntry, resolveMeasure } from '../catalogue'
import { addedToExercise } from './added'
import { effectiveSets, epley, formatSet, isExerciseDone } from './sets'

// Builds the "Copy week summary" text — the contract with the planning chat.
//
// The format is a short key=value header followed by ONE PIPE-DELIMITED ROW
// PER SET, deliberately shaped like the training log spreadsheet the planning
// chat writes into (natural key: week_id + day + block_id + exercise_id +
// set_index). Two rules drive every decision here:
//
//   1. Every planned block is emitted, whether or not anything was logged
//      against it. "Planned and not done" and "never planned" are different
//      facts, and only the app knows which is which.
//   2. Nothing is inferred. `status` reflects the ticks in the app and
//      nothing else; typed values ride along on the act_* columns even where
//      nothing was ticked, so the reader can apply its own evidence rules.
//
// It carries the prescription alongside the actuals so the summary is
// self-contained: the reader never has to fetch the week's plan module to
// find an id, a priority or a programmed weight.
//
// Deterministic for a given plan, log and export date. The date matters
// because a day still in the future reports `planned` rather than
// `not_logged` — a mid-week export must not read as a week of missed work.

const FORMAT = 'ATHX WEEK EXPORT v2'

// Column order. Mirrors the log sheet's own column set closely enough that a
// row maps across field by field.
const COLUMNS = [
  'day',
  'date',
  'block_id',
  'block',
  'prio',
  'wendler',
  'exercise_id',
  'exercise',
  'measure',
  'set',
  'plan_w',
  'plan_r',
  'plan_rx',
  'act_w',
  'act_r',
  'act_value',
  'rpe',
  'e1rm',
  'status',
  'note',
] as const

// Plan sets carry numbers, the log carries strings; cell() stringifies either.
type Row = Partial<Record<(typeof COLUMNS)[number], string | number>>

// Rows are pipe-delimited, so a pipe inside free text (a note, an rx string)
// would silently add a column. Swap it out and flatten any newlines.
const cell = (value: unknown): string =>
  value === undefined || value === null
    ? ''
    : String(value)
        .replace(/\|/g, '/')
        .replace(/\s+/g, ' ')
        .trim()

const renderRow = (row: Row): string => COLUMNS.map((c) => cell(row[c])).join('|')

// ---------------------------------------------------------------------------
// Dates. weekId is an ISO week ("2026-wk31"), so the calendar dates are
// derivable — which is worth doing, because the planning chat keys its records
// by date and would otherwise infer them from the free-text label.
// ---------------------------------------------------------------------------

function weekMonday(weekId: string): Date | null {
  const m = /^(\d{4})-wk(\d{1,2})$/.exec(weekId.trim())
  if (!m) return null
  const week = Number(m[2])
  if (week < 1 || week > 53) return null
  // ISO-8601: week 1 is the week containing 4 January.
  const jan4 = new Date(Date.UTC(Number(m[1]), 0, 4))
  const isoDow = jan4.getUTCDay() === 0 ? 7 : jan4.getUTCDay()
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - (isoDow - 1) + (week - 1) * 7)
  return monday
}

const isoDate = (d: Date): string => d.toISOString().slice(0, 10)

function dayDate(monday: Date | null, day: DayName): string {
  if (!monday) return ''
  const d = new Date(monday)
  d.setUTCDate(monday.getUTCDate() + DAY_NAMES.indexOf(day))
  return isoDate(d)
}

// Local today as a plain date string, compared against the day dates above to
// tell "not logged yet" from "hasn't happened yet".
function todayISO(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return isoDate(local)
}

// ---------------------------------------------------------------------------
// Status. The app can only honestly report four of the log's status values:
// what was ticked, what was skipped, what is still ahead, and what is none of
// those. Everything else (external, deferred to a later week, rest) is a
// judgment the planning chat makes with context the app does not have.
// ---------------------------------------------------------------------------

type Status = 'completed' | 'skipped' | 'planned' | 'not_logged'

// Nothing ticked. A day still ahead is `planned` rather than `not_logged`, so
// a mid-week export does not read as a week of missed sessions — but only
// where the row is genuinely untouched. Typed numbers, an RPE or a note on a
// future day mean the session moved earlier, and calling that `planned` would
// throw away the one thing the row is telling us.
const openStatus = (ctx: Context, evidence: boolean): Status =>
  !evidence && ctx.date && ctx.date > ctx.today ? 'planned' : 'not_logged'

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

// What the log actually holds for one set, split across the act_* columns so
// the reader never has to parse "red×12" or "52.5x7" back apart. Weight and
// reps always ride their own columns when present, whatever the measure says:
// a measure switched after the fact must not silently drop a typed number.
// act_value carries whatever is neither (a band colour, a time, calories, a
// distance), and the e1RM follows the log sheet's own rule — computed only
// where actual weight AND actual reps are both numeric.
function actuals(set: SetLog, measure: MeasureType): Pick<Row, 'act_w' | 'act_r' | 'act_value' | 'e1rm'> {
  const value =
    measure === 'band' ? (set.band ?? '') : measure === 'weightReps' || measure === 'reps' || measure === 'freeText' ? '' : formatSet(set, measure)
  const e = epley(set.w, set.r)
  return { act_w: set.w, act_r: set.r, act_value: value, e1rm: e === null ? '' : String(e) }
}

// A bare number typed into a calories-measured actual gets its unit, so "45"
// reads as "45 cal" rather than as an unlabelled quantity.
function freeActual(entry: ExerciseLog | undefined, measure: MeasureType): string {
  const actual = entry?.actual ?? ''
  if (measure === 'cal' && /^\d+(\.\d+)?$/.test(actual.trim())) return `${actual.trim()} cal`
  return actual
}

// The exercise name a row leads with. In-session additions and legacy swapped
// slots say so, since neither is what the plan prescribed.
function exerciseName(exercise: Exercise, entry: ExerciseLog | undefined, added: boolean): string {
  if (added) return `${exercise.name} (added)`
  if (entry?.swap) {
    const swapName = catalogueEntry(entry.swap)?.name ?? entry.swap
    return `${swapName} (was ${exercise.name})`
  }
  return exercise.name
}

interface Context {
  day: DayName
  date: string
  today: string
  block: Block
  skipped: boolean
}

// One exercise -> one row per programmed set, or a single row where there are
// no programmed sets. Exercise-level fields (the rx, the RPE, the note) sit on
// the first row of the group only, the same convention the log sheet uses for
// repeated text.
function exerciseRows(ctx: Context, exercise: Exercise, entry: ExerciseLog | undefined, added: boolean): Row[] {
  const measure = resolveMeasure(exercise, entry)
  // Either the whole block was skipped, or this one exercise was. Both report
  // `skipped`; the header's skipped= / skipped_exercises= lines say which.
  const skipped = ctx.skipped || Boolean(entry?.skipped)
  const base: Row = {
    day: ctx.day,
    date: ctx.date,
    block_id: ctx.block.id,
    block: ctx.block.title,
    prio: String(ctx.block.priority),
    wendler: ctx.block.wendler ? 'y' : '',
    exercise_id: exercise.id,
    exercise: exerciseName(exercise, entry, added),
    measure,
  }
  const head: Row = {
    plan_rx: exercise.rx,
    rpe: entry?.rpe == null ? '' : String(entry.rpe),
    note: entry?.note,
  }

  // Anything the user put on the exercise, wherever it ended up: enough to
  // say the session happened even when nothing was ticked.
  const noted = Boolean(entry?.rpe != null || entry?.note)

  if (!exercise.sets) {
    const actual = freeActual(entry, measure)
    return [
      {
        ...base,
        ...head,
        act_value: actual,
        status: skipped ? 'skipped' : entry?.done ? 'completed' : openStatus(ctx, noted || Boolean(actual)),
      },
    ]
  }

  // A free-text actual stored against a set-based exercise — legacy records,
  // or an exercise the plan turned into set rows after it was logged. It has
  // nowhere of its own to go, so it rides the first row rather than vanishing.
  const stray = freeActual(entry, measure)

  return effectiveSets(exercise, entry).map((set, i) => {
    const act = actuals(set, measure)
    if (i === 0 && stray && !act.act_value) act.act_value = stray
    const typed = Boolean(act.act_w || act.act_r || act.act_value)
    return {
      ...base,
      ...(i === 0 ? head : {}),
      set: String(i + 1),
      plan_w: exercise.sets?.[i]?.w,
      plan_r: exercise.sets?.[i]?.r,
      ...act,
      status: skipped ? 'skipped' : set.done ? 'completed' : openStatus(ctx, typed || noted),
    }
  })
}

// A block with no exercises at all — a rest day, or a run placeholder logged
// in Runna. It still gets a row, so the day is not silently blank.
const blockOnlyRow = (ctx: Context): Row => ({
  day: ctx.day,
  date: ctx.date,
  block_id: ctx.block.id,
  block: ctx.block.title,
  prio: String(ctx.block.priority),
  wendler: ctx.block.wendler ? 'y' : '',
  status: ctx.skipped ? 'skipped' : openStatus(ctx, false),
})

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function wendlerLine(plan: WeekPlan, log: WeekLog): string | null {
  if (!plan.wendler) return null
  const exercises = plan.days
    .flatMap((d) => d.blocks)
    .filter((b) => b.wendler)
    .flatMap((b) => b.exercises)
  const label = `C${plan.wendler.cycle}W${plan.wendler.week}`
  if (exercises.length === 0) return `wendler=${label}`
  // A swapped slot means the programmed lift was NOT done — it must not count
  // toward Wendler completion.
  const done = exercises.filter((ex) => {
    const entry = log.exercises[ex.id]
    return !entry?.swap && isExerciseDone(ex, entry)
  }).length
  const state = done === exercises.length ? 'complete' : done > 0 ? 'in_progress' : 'not_started'
  return `wendler=${label} status=${state} main_lifts_done=${done}/${exercises.length}`
}

// Per-block roll-up, so the reader gets the shape of the week before it reads
// a single row. Derived from the same rows, never counted separately.
function blockTally(rows: Row[]): string {
  const byBlock = new Map<string, Status[]>()
  for (const r of rows) {
    const key = `${r.day}/${r.block_id}`
    const list = byBlock.get(key) ?? []
    list.push(r.status as Status)
    byBlock.set(key, list)
  }
  const counts: Record<string, number> = {}
  for (const statuses of byBlock.values()) {
    const done = statuses.filter((s) => s === 'completed').length
    // `skipped` only when the WHOLE block went: one skipped exercise inside a
    // session that otherwise ran is a partial block, not a skipped one.
    const key = statuses.every((s) => s === 'skipped')
      ? 'skipped'
      : done === statuses.length
        ? 'completed'
        : done > 0 || statuses.includes('skipped')
          ? 'partial'
          : statuses.every((s) => s === 'planned')
            ? 'planned'
            : 'not_logged'
    counts[key] = (counts[key] ?? 0) + 1
  }
  const order = ['completed', 'partial', 'skipped', 'not_logged', 'planned']
  const parts = order.filter((k) => counts[k]).map((k) => `${counts[k]} ${k}`)
  return `blocks=${byBlock.size} (${parts.join(', ') || 'none'})`
}

const LEGEND = [
  '# One row per programmed set. Exercises with no programmed sets, and blocks with',
  '# no exercises, get a single row with set blank. Exercise-level fields (plan_rx,',
  '# rpe, note) are on the first row of each exercise only. Blank means no value,',
  '# never zero. A "|" inside free text was replaced with "/".',
  '# status: completed = ticked in the app | skipped = the block or the exercise',
  '#   itself was skipped, reason on the skipped= / skipped_exercises= line above',
  '#   | planned = day still ahead | not_logged = reached, nothing ticked.',
  '#   Derived from ticks alone: act_* columns can carry typed values on a row',
  '#   that was never ticked, and nothing here is inferred beyond that.',
]

export function buildExport(plan: WeekPlan, log: WeekLog): string {
  const monday = weekMonday(plan.weekId)
  const today = todayISO()

  const rows: Row[] = []
  for (const day of DAY_NAMES) {
    const date = dayDate(monday, day)
    for (const placed of blocksForDay(plan, log, day).sort((a, b) => a.block.priority - b.block.priority)) {
      const ctx: Context = { day, date, today, block: placed.block, skipped: Boolean(placed.deferral) }
      const added = log.added.filter((a) => a.blockId === placed.block.id)
      if (placed.block.exercises.length === 0 && added.length === 0) {
        rows.push(blockOnlyRow(ctx))
        continue
      }
      for (const ex of placed.block.exercises) rows.push(...exerciseRows(ctx, ex, log.exercises[ex.id], false))
      for (const a of added) rows.push(...exerciseRows(ctx, addedToExercise(a), log.exercises[a.id], true))
    }
  }

  const head: string[] = [FORMAT, `week_id=${plan.weekId}`, `label=${cell(plan.label)}`]
  if (monday) {
    head.push(`week_start=${dayDate(monday, 'Mon')}`, `week_end=${dayDate(monday, 'Sun')}`)
  }
  head.push(`exported=${today}`)
  const wendler = wendlerLine(plan, log)
  if (wendler) head.push(wendler)
  if (plan.stages) head.push(`stages=${cell(plan.stages)}`)
  if (plan.notes) head.push(`plan_notes=${cell(plan.notes)}`)
  head.push(blockTally(rows))

  const moved = Object.entries(log.moves).map(([blockId, to]) => {
    const from = findBlock(plan, blockId)?.day
    return `${blockId} ${from ?? '?'}->${to}`
  })
  head.push(`moved=${moved.length > 0 ? moved.join('; ') : 'none'}`)

  const skipped = log.deferred.map((d) => `${d.blockId} (${d.from}) "${cell(d.reason) || 'no reason given'}"`)
  head.push(`skipped=${skipped.length > 0 ? skipped.join('; ') : 'none'}`)

  // Exercises skipped on their own, inside a session that otherwise ran. Read
  // off the rows so a skip against an exercise the plan no longer carries
  // cannot show up here as a phantom. An exercise inside an already-skipped
  // block is left out: its block going is the fact, and listing it twice would
  // read as two separate decisions.
  const skippedBlocks = new Set(log.deferred.map((d) => d.blockId))
  const seen = new Set<string>()
  const skippedExercises: string[] = []
  for (const r of rows) {
    const id = String(r.exercise_id ?? '')
    if (!id || seen.has(id) || skippedBlocks.has(String(r.block_id)) || !log.exercises[id]?.skipped) continue
    seen.add(id)
    skippedExercises.push(`${id} (${r.day}) "${cell(log.exercises[id].skipReason) || 'no reason given'}"`)
  }
  head.push(`skipped_exercises=${skippedExercises.length > 0 ? skippedExercises.join('; ') : 'none'}`)

  if (log.maxDU != null) head.push(`max_du_fresh=${log.maxDU}`)
  if (log.c2) head.push(`c2=${cell(log.c2)}`)

  const notes = DAY_NAMES.filter((d) => log.sessionNotes[d]).map((d) => `${d}="${cell(log.sessionNotes[d])}"`)
  if (notes.length > 0) head.push(`session_notes=${notes.join(' ')}`)

  return [...head, '', ...LEGEND, COLUMNS.join('|'), ...rows.map(renderRow)].join('\n')
}
