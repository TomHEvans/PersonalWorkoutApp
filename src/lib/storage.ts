import type { WeekLog } from '../types'
import { normalize } from './log'

// localStorage is the local-first copy: every change lands here immediately,
// the KV PUT follows debounced. Any structural change to the log shape bumps
// this version (v1 -> v2) so stale state never merges into new code.
const VERSION = 'athx-log-v2' // v2: per-set logging (SetLog[] on ExerciseLog)
const logKey = (weekId: string) => `${VERSION}:${weekId}`
const dirtyKey = (weekId: string) => `${VERSION}:dirty:${weekId}`

export function readLocal(weekId: string): WeekLog | null {
  try {
    const raw = localStorage.getItem(logKey(weekId))
    return raw ? normalize(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function writeLocal(weekId: string, log: WeekLog): void {
  try {
    localStorage.setItem(logKey(weekId), JSON.stringify(log))
  } catch {
    /* ignore private-mode failures */
  }
}

// Marks a log with local edits not yet confirmed written to KV.
export function isDirty(weekId: string): boolean {
  try {
    return localStorage.getItem(dirtyKey(weekId)) === '1'
  } catch {
    return false
  }
}

export function setDirty(weekId: string, dirty: boolean): void {
  try {
    if (dirty) localStorage.setItem(dirtyKey(weekId), '1')
    else localStorage.removeItem(dirtyKey(weekId))
  } catch {
    /* ignore */
  }
}
