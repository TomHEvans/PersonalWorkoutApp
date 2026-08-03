import type { ExerciseLog, PlanSet, SetLog, WeekLog, WeekPlan } from '../types'
import { exerciseKey } from './logKeys'

// Repairs week logs written while the set rows pre-loaded the plan's
// programmed values as input VALUES (athx-log-v2, and the unversioned KV
// records it synced). Editing a pre-filled field on a mobile keyboard could
// append to the default instead of replacing it, which corrupted stored
// sets two ways:
//
//   - a stray "0" landed in the weight of an otherwise untouched row, so
//     the export showed "0x8-12" instead of skipping the set
//   - programmed and typed weight ran together ("127" + "130.5" ->
//     "127130.5"), which still parses as a number and poisoned the e1RM
//
// v3 rows start empty (programming is placeholder only), so a stored value
// now always means "typed". This repair maps old rows onto that meaning:
// zero/garbage weights and untouched non-numeric rep schemes become empty,
// concatenated weights keep their typed remainder, and plain numeric values
// (typed, or pre-loaded programming that was completed as written —
// indistinguishable, and both correct) are kept.
//
// Runs ONLY on the one-shot v2 -> v3 localStorage migration. It must never
// touch v3-era data: under v3 a "0" weight is something the user typed
// (bodyweight work, e.g. "TRX squat 0x7") and has to be kept as logged,
// while under v2 a "0" could only be the input corruption.

function repairWeight(value: unknown, planned: PlanSet | undefined): string {
  const w = String(value ?? '').trim()
  if (!w) return ''
  const n = Number(w)
  if (!Number.isFinite(n) || n <= 0) return '' // stray 0 or unparseable
  const pw = planned?.w != null ? String(planned.w) : ''
  // "<programmed><typed>" run together — also with just the programmed
  // integer part when the typed decimal ate the rest ("127" + "130.5").
  // Only strip when the remainder is 2+ chars and itself a weight, so a
  // genuine "95" against a programmed "9x" never loses digits.
  for (const prefix of [pw, pw.split('.')[0]]) {
    if (prefix && w !== pw && w !== prefix && w.startsWith(prefix)) {
      const rest = w.slice(prefix.length)
      if (rest.length >= 2 && Number(rest) > 0) return rest
    }
  }
  return w
}

function repairReps(value: unknown, planned: PlanSet | undefined): string {
  const r = String(value ?? '').trim()
  if (!r || r === '0') return ''
  const pr = planned?.r != null ? String(planned.r) : ''
  // An untouched pre-load of a non-numeric scheme ("8-12", "5+", "8/side"):
  // a target, never something typed as an actual rep count.
  if (r === pr && !/^\d+$/.test(r)) return ''
  return r
}

function repairSets(sets: SetLog[], planned: PlanSet[]): SetLog[] {
  return sets.map((s, i) => ({
    w: repairWeight(s?.w, planned[i]),
    r: repairReps(s?.r, planned[i]),
    done: Boolean(s?.done),
  }))
}

export function repairLog(plan: WeekPlan, log: WeekLog): WeekLog {
  const exercises: Record<string, ExerciseLog> = { ...log.exercises }
  for (const day of plan.days) {
    for (const block of day.blocks) {
      for (const ex of block.exercises) {
        const key = exerciseKey(block.id, ex.id)
        const entry = exercises[key]
        if (!ex.sets || !entry?.sets) continue
        exercises[key] = { ...entry, sets: repairSets(entry.sets, ex.sets) }
      }
    }
  }
  return { ...log, exercises }
}
