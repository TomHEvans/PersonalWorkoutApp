import type { Exercise, ExerciseLog, SetLog } from '../types'

// The set rows shown (and exported) for a set-based exercise: logged rows
// where they exist, otherwise rows pre-loaded from the plan's programming.
export function effectiveSets(exercise: Exercise, entry: ExerciseLog | undefined): SetLog[] {
  if (!exercise.sets) return []
  return exercise.sets.map(
    (ps, i) => entry?.sets?.[i] ?? { w: String(ps.w ?? ''), r: String(ps.r ?? ''), done: false },
  )
}

export function isExerciseDone(exercise: Exercise, entry: ExerciseLog | undefined): boolean {
  if (!exercise.sets) return Boolean(entry?.done)
  const sets = effectiveSets(exercise, entry)
  return sets.length > 0 && sets.every((s) => s.done)
}

export const formatSet = (s: SetLog): string => (s.w ? `${s.w}x${s.r}` : s.r)

// Estimated 1RM (Epley: w * (1 + r/30)) from the best completed set with a
// numeric weight and rep count — in a 5/3/1 week that is the AMRAP top set.
// Returns null when no completed set qualifies (bodyweight work, rep ranges
// left unedited, nothing ticked yet). Rounded to 0.5 kg.
export function estimate1RM(sets: SetLog[]): number | null {
  let best: number | null = null
  for (const s of sets) {
    if (!s.done) continue
    const w = Number(s.w)
    if (!Number.isFinite(w) || w <= 0) continue
    if (!/^\d+$/.test(s.r.trim())) continue
    const r = Number(s.r.trim())
    if (r < 1) continue
    const e = r === 1 ? w : w * (1 + r / 30)
    if (best === null || e > best) best = e
  }
  return best === null ? null : Math.round(best * 2) / 2
}
