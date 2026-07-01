import type { Week } from '../types'
import w2026W06 from './2026-W06'

// ---------------------------------------------------------------------------
// Register every week here. To add a new week:
//   1. Create src/plans/<id>.ts default-exporting a Week (copy an existing one).
//   2. Import it below and add it to WEEKS.
//   3. Redeploy. That's the whole "add a week" flow — no in-app import.
// Weeks are returned sorted ascending by id, so id must be sortable
// (e.g. "2026-W06", "2026-W07").
// ---------------------------------------------------------------------------

const WEEKS: Week[] = [w2026W06]

export function getWeeks(): Week[] {
  return [...WEEKS].sort((a, b) => a.id.localeCompare(b.id))
}

// The "current" week: the one containing a day flagged today, else the
// highest id. If several are flagged today, the highest id among them wins.
export function pickCurrentWeek(weeks: Week[]): Week {
  const sorted = [...weeks].sort((a, b) => a.id.localeCompare(b.id))
  const todays = sorted.filter((w) => w.days.some((d) => d.today))
  const pool = todays.length > 0 ? todays : sorted
  return pool[pool.length - 1]
}
