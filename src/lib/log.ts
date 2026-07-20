import type { WeekLog } from '../types'

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

// Fill in any missing fields so a partial or older record never crashes the
// app. Structural changes beyond this bump the localStorage key version.
export function normalize(raw: unknown): WeekLog {
  const empty = emptyLog()
  if (!raw || typeof raw !== 'object') return empty
  const r = raw as Partial<WeekLog>
  return {
    exercises: r.exercises && typeof r.exercises === 'object' ? r.exercises : {},
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
