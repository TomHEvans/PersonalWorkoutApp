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

export interface Exercise {
  id: string // stable across weeks where the exercise recurs (press-main is always press-main)
  name: string
  rx: string // prescription, free text: "4x3-5", "40x5, 47.5x5, 52.5x5+ kg"
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

export type DayName = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'

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
// log:<weekId>, mirrored to localStorage (athx-log-v1:<weekId>).
// Merge rule: whole-record last-write-wins by updatedAt (single user).
// ---------------------------------------------------------------------------

export interface SetLog {
  w: string // weight actually lifted (kg), pre-loaded from the plan
  r: string // reps actually done, pre-loaded from the plan
  done: boolean
}

export interface ExerciseLog {
  done?: boolean // non-set exercises only; set-based done derives from the sets
  actual?: string // free text, e.g. "52.5x7" (non-set exercises)
  sets?: SetLog[] // set-based exercises, index-aligned with the plan's sets
  rpe?: number | null // 1-10
  note?: string
}

export interface Deferral {
  blockId: string
  from: DayName
  reason: string
}

export interface WeekLog {
  exercises: Record<string, ExerciseLog>
  sessionNotes: Partial<Record<DayName, string>>
  deferred: Deferral[]
  moves: Record<string, DayName> // blockId -> day it was reshuffled to
  maxDU: number | null // weekly max unbroken double-unders
  c2: string // C2 interval pace/watts quick field
  updatedAt: number
}

export type SyncStatus = 'synced' | 'pending' | 'offline' | 'error' | 'auth'
