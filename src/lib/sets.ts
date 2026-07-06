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
