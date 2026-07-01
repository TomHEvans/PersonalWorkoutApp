import type { WeekLog } from '../types'

// localStorage mirror of each week's log, for instant load and offline
// viewing (section 3). A per-week "dirty" flag marks a log that has local
// edits not yet confirmed by the server.
const logKey = (weekId: string) => `wt:log:${weekId}`
const dirtyKey = (weekId: string) => `wt:dirty:${weekId}`

export function readLocal(weekId: string): WeekLog | null {
  try {
    const raw = localStorage.getItem(logKey(weekId))
    return raw ? (JSON.parse(raw) as WeekLog) : null
  } catch {
    return null
  }
}

export function writeLocal(weekId: string, log: WeekLog): void {
  try {
    localStorage.setItem(logKey(weekId), JSON.stringify(log))
  } catch {
    /* ignore */
  }
}

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
