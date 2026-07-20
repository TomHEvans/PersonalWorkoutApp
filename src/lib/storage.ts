import type { WeekLog } from '../types'
import { normalize } from './log'
import { getPlan } from './plans'
import { repairLog } from './migrate'

// localStorage is the local-first copy: every change lands here immediately,
// the KV PUT follows debounced. Any structural change to the log shape bumps
// this version (v1 -> ... -> v5) so stale state never merges into new code.
const VERSION = 'athx-log-v6' // v6: per-block added exercises
const V5 = 'athx-log-v5' // v5: per-exercise swap override + per-set time/cal/dist
const V4 = 'athx-log-v4' // v4: per-set band colour + per-exercise measure override
const V3 = 'athx-log-v3' // v3: set rows start empty; programming is placeholder only
const V2 = 'athx-log-v2' // v2 pre-loaded programmed values into the set rows
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

// One-shot migration to the current version. v5/v4/v3 -> v6 are purely
// additive (the new fields are simply absent on old records) so they just move
// the record; v2 also repairs the pre-loaded/concatenated set values first.
function migrateLegacy(weekId: string): WeekLog | null {
  for (const from of [V5, V4, V3]) {
    const raw = localStorage.getItem(`${from}:${weekId}`)
    if (raw) return promote(weekId, normalize(JSON.parse(raw)), from)
  }
  const v2raw = localStorage.getItem(`${V2}:${weekId}`)
  if (v2raw) return promote(weekId, repairLog(getPlan(weekId), normalize(JSON.parse(v2raw))), V2)
  return null
}

// Write the migrated record under the current keys and drop the old ones.
function promote(weekId: string, log: WeekLog, from: string): WeekLog {
  localStorage.setItem(logKey(weekId), JSON.stringify(log))
  if (localStorage.getItem(`${from}:dirty:${weekId}`) === '1') {
    localStorage.setItem(dirtyKey(weekId), '1')
  }
  localStorage.removeItem(`${from}:${weekId}`)
  localStorage.removeItem(`${from}:dirty:${weekId}`)
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
