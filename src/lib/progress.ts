import type { Day, Session, Week, WeekLog } from '../types'
import { getKind } from '../kinds/registry'

export interface Progress {
  done: number
  total: number
}

function add(a: Progress, b: Progress): Progress {
  return { done: a.done + b.done, total: a.total + b.total }
}

// Optional sessions are excluded from totals (section 4) but remain tickable —
// their done state still lives in the log, it just does not count here.
export function sessionProgress(session: Session, log: WeekLog): Progress {
  const def = getKind(session.kind)
  if (!def || session.optional) return { done: 0, total: 0 }
  const total = def.units(session)
  const entry = log[session.id]
  const done = entry ? def.doneUnits(entry) : 0
  return { done, total }
}

export function dayProgress(day: Day, log: WeekLog): Progress {
  return day.sessions.reduce((acc, s) => add(acc, sessionProgress(s, log)), { done: 0, total: 0 })
}

export function weekProgress(week: Week, log: WeekLog): Progress {
  return week.days.reduce((acc, d) => add(acc, dayProgress(d, log)), { done: 0, total: 0 })
}
