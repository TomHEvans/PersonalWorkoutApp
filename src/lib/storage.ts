import type { WeekLog } from '../types'
import { normalize } from './log'
import { getPlan } from './plans'
import { repairLog } from './migrate'

// localStorage is the local-first copy: every change lands here immediately,
// the KV PUT follows debounced. Any structural change to the log shape bumps
// this version (v1 -> v2 -> v3) so stale state never merges into new code.
const VERSION = 'athx-log-v3' // v3: set rows start empty; programming is placeholder only
const LEGACY_VERSION = 'athx-log-v2' // v2 pre-loaded programmed values into the set rows
const logKey = (weekId: string) => `${VERSION}:${weekId}`
const dirtyKey = (weekId: string) => `${VERSION}:dirty:${weekId}`

export function readLocal(weekId: string): WeekLog | null {
  try {
    const raw = localStorage.getItem(logKey(weekId))
    if (raw) return normalize(JSON.parse(raw))
    return migrateLegacy(weekId)
  } catch {
    return null
  }
}

// One-shot v2 -> v3 migration: repair the pre-loaded/concatenated set values
// and move the record (and its dirty flag) over to the v3 keys.
function migrateLegacy(weekId: string): WeekLog | null {
  const raw = localStorage.getItem(`${LEGACY_VERSION}:${weekId}`)
  if (!raw) return null
  const log = repairLog(getPlan(weekId), normalize(JSON.parse(raw)))
  localStorage.setItem(logKey(weekId), JSON.stringify(log))
  if (localStorage.getItem(`${LEGACY_VERSION}:dirty:${weekId}`) === '1') {
    localStorage.setItem(dirtyKey(weekId), '1')
  }
  localStorage.removeItem(`${LEGACY_VERSION}:${weekId}`)
  localStorage.removeItem(`${LEGACY_VERSION}:dirty:${weekId}`)
  return log
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
