// ---------------------------------------------------------------------------
// The PLAN — one plain-JS module per week under src/plans/ (see design doc).
// Plans are code: they ship with the app bundle and never touch stored data.
// These types describe the shape those JS modules must follow; the registry
// casts the imported modules to WeekPlan at the boundary.
// ---------------------------------------------------------------------------

export type Priority = 1 | 2 | 3

export interface PlanSet {
  w?: string | number // programmed weight (kg); omit for bodyweight
  r?: string | number // programmed reps, e.g. 5 or "3-5" or "5+"
}

// How an exercise is measured / logged. Layered on additively — it refines the
// existing renderer (does the weight field show, is there a band, is the actual
// a time) without changing the stored log shape. Resolved from the exercise's
// `measure`, else the catalogue (src/catalogue), else inferred from `sets`.
//   weightReps  per-set weight + reps (loaded lifts)
//   reps        per-set reps only, bodyweight — the weight field is hidden
//   band        per-set reps with a resistance band (band named in rx)
//   time        time per set on set-based work; a timed actual on free-text work
//   cal         calories per set (ergs / bikes)
//   distance    distance per set (carries, sleds, shuttles)
//   freeText    a free-text actual (runs, mixed efforts)
export type MeasureType = 'weightReps' | 'reps' | 'band' | 'time' | 'cal' | 'distance' | 'freeText'

export interface Exercise {
  id: string // stable across weeks where the exercise recurs (press-main is always press-main)
  name: string
  rx: string // prescription, free text: "4x3-5", "40x5, 47.5x5, 52.5x5+ kg"
  measure?: MeasureType // how it is logged this week; else from catalogue, else inferred
  sets?: PlanSet[] // per-set programming; set-based exercises log weight+reps per set,
  // pre-loaded from these values. Exercises without sets log a free-text actual.
}

export interface Block {
  id: string
  title: string
  priority: Priority // P1 runs/main lifts/physio, P2 skills/C2, P3 oly + extras
  exercises: Exercise[]
  short?: string // compact label used in the week export; falls back to title
  wendler?: boolean // marks the 5/3/1 main-lift blocks; drives the STATE line
}

export type DayName = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

export interface PlanDay {
  day: DayName
  blocks: Block[]
}

export interface WeekPlan {
  weekId: string // "2026-wk28"
  label: string // "6-10 July"
  wendler?: { cycle: number; week: number }
  stages?: string // skill-ladder state echoed into the export, e.g. "BMU s1 | DU s1"
  days: PlanDay[]
}

// ---------------------------------------------------------------------------
// The LOG — what actually happened. Stored in Cloudflare KV under
// log:<weekId>, mirrored to localStorage (athx-log-v3:<weekId>).
// Merge rule: whole-record last-write-wins by updatedAt (single user).
// ---------------------------------------------------------------------------

export interface SetLog {
  // Stored as a string, but always a clean coerced number or empty: the input
  // sanitizers keep typing numeric, blur coerces the committed value
  // (coerceWeight/coerceReps), and normalize() re-applies the coercion to
  // every record read, so every reader can Number() it safely.
  w: string // weight actually lifted (kg); empty until typed (plan value is placeholder only)
  r: string // reps actually done; empty until typed (plan value is placeholder only)
  band?: string // band colour used (band-measured exercises only; see src/lib/bands)
  t?: string // time taken (time-measured sets; free format, e.g. "0:45" or "1min")
  cal?: string // calories (cal-measured sets; numeric string)
  dist?: string // distance (distance-measured sets; free format, e.g. "200m")
  done: boolean
}

export interface ExerciseLog {
  done?: boolean // non-set exercises only; set-based done derives from the sets
  actual?: string // free text, e.g. "52.5x7" (non-set exercises)
  sets?: SetLog[] // set-based exercises, index-aligned with the plan's sets
  measure?: MeasureType // per-exercise override of how it is logged (the in-app adjuster)
  swap?: string // legacy (v5-era): catalogue id logged in place of the plan's. The swap UI
  // was replaced by added exercises; old records still render/export correctly.
  rpe?: number | null // 1-10
  note?: string
}

// An exercise added in-session (not in the plan): "did extra work" rather than
// editing the plan. Lives in the log, renders inside its block, logs like any
// other exercise under its own id, and exports as "<name> (added)".
export interface AddedExercise {
  id: string // unique within the week; the ExerciseLog key for this addition
  blockId: string // block it was added under
  exerciseId: string // catalogue id it was created from (name + default measure)
  sets?: number // set-row count; absent -> free-text actual (runs etc.)
}

export interface Deferral {
  blockId: string
  from: DayName
  reason: string
}

export interface WeekLog {
  exercises: Record<string, ExerciseLog>
  sessionNotes: Partial<Record<DayName, string>>
  deferred: Deferral[] // "skipped" in the UI; field name kept for data compat
  moves: Record<string, DayName> // blockId -> day it was reshuffled to
  added: AddedExercise[] // in-session additions, per block
  maxDU: number | null // weekly max unbroken double-unders
  c2: string // C2 interval pace/watts quick field
  updatedAt: number
}

export type SyncStatus = 'synced' | 'pending' | 'offline' | 'error' | 'auth'
