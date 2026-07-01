import type { Week, WeekLog } from '../types'
import { getKind } from '../kinds/registry'

// Merge a stored log onto the current plan (section 3 — "Reconciliation").
//
//   stored === null/undefined  -> first open: seed everything from prefill.
//   stored provided            -> keep entries for sessions that still exist,
//                                 initialise missing sessions from prefill,
//                                 and drop entries whose session is gone
//                                 (they are simply never copied across).
//
// The result is always keyed to the *current* plan, so editing a week's plan
// mid-week never loses already-logged sets for unchanged sessions.
export function reconcileWeek(week: Week, stored: WeekLog | null | undefined): WeekLog {
  const out: WeekLog = {}
  for (const day of week.days) {
    for (const session of day.sessions) {
      const def = getKind(session.kind)
      if (!def) continue // unknown kind: no log entry; the renderer shows a fallback
      const prev = stored ? stored[session.id] : undefined
      out[session.id] = stored ? def.reconcile(session, prev) : def.init(session)
    }
  }
  return out
}
