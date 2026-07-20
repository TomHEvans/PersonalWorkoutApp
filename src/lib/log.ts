import type { ExerciseLog, WeekLog } from '../types'
import { coerceReps, coerceWeight } from './sets'

export function emptyLog(): WeekLog {
  return {
    exercises: {},
    sessionNotes: {},
    deferred: [],
    moves: {},
    added: [],
    maxDU: null,
    c2: '',
    updatedAt: 0,
  }
}

// Enforce the SetLog contract on every record read (localStorage, legacy
// keys, and KV): a stored set weight/reps/cal is a clean coerced number or
// empty. Records written by old app versions can carry corrupted values —
// pre-loaded programming run together with typed digits, stray zeros, unit
// suffixes ("77kg"), rep schemes ("8-12") — and without this they merge
// straight back into the inputs and the e1RM. Coercion drops what is not
// entirely a number and canonicalizes the rest; idempotent on clean records.
function scrubExercises(raw: Record<string, ExerciseLog>): Record<string, ExerciseLog> {
  const out: Record<string, ExerciseLog> = {}
  for (const [id, entry] of Object.entries(raw)) {
    if (!entry || typeof entry !== 'object') continue
    out[id] = Array.isArray(entry.sets)
      ? {
          ...entry,
          sets: entry.sets.map((s) => ({
            ...s,
            w: coerceWeight(String(s?.w ?? '')),
            r: coerceReps(String(s?.r ?? '')),
            ...(s?.cal != null ? { cal: coerceReps(String(s.cal)) } : {}),
            done: Boolean(s?.done),
          })),
        }
      : entry
  }
  return out
}

// Fill in any missing fields so a partial or older record never crashes the
// app. Structural changes beyond this bump the localStorage key version.
export function normalize(raw: unknown): WeekLog {
  const empty = emptyLog()
  if (!raw || typeof raw !== 'object') return empty
  const r = raw as Partial<WeekLog>
  return {
    exercises: r.exercises && typeof r.exercises === 'object' ? scrubExercises(r.exercises) : {},
    sessionNotes: r.sessionNotes && typeof r.sessionNotes === 'object' ? r.sessionNotes : {},
    deferred: Array.isArray(r.deferred) ? r.deferred : [],
    moves: r.moves && typeof r.moves === 'object' ? r.moves : {},
    added: Array.isArray(r.added) ? r.added : [],
    maxDU: typeof r.maxDU === 'number' ? r.maxDU : null,
    c2: typeof r.c2 === 'string' ? r.c2 : '',
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : 0,
  }
}

// Whole-record last-write-wins by updatedAt (single user, acceptable).
export function newer(a: WeekLog, b: WeekLog): WeekLog {
  return b.updatedAt > a.updatedAt ? b : a
}
