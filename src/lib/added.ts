import type { AddedExercise, Exercise } from '../types'
import { catalogueEntry } from '../catalogue'

// Build a new in-session addition for a block. Default set-row counts follow
// the exercise's catalogue measure: lifts/reps/band get 3 rows, time/cal/
// distance efforts get 1, free-text (runs etc.) get none (a single actual).
export function makeAdded(blockId: string, exerciseId: string): AddedExercise {
  const measure = catalogueEntry(exerciseId)?.measures[0] ?? 'freeText'
  const sets =
    measure === 'freeText' ? undefined : measure === 'weightReps' || measure === 'reps' || measure === 'band' ? 3 : 1
  return {
    id: `a-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`,
    blockId,
    exerciseId,
    ...(sets ? { sets } : {}),
  }
}

// The synthetic plan Exercise an addition renders/exports as. The measure is
// pinned from the catalogue default so resolution never depends on the unique
// log id; "Log as" can still override it per entry.
export function addedToExercise(a: AddedExercise): Exercise {
  const entry = catalogueEntry(a.exerciseId)
  return {
    id: a.id,
    name: entry?.name ?? a.exerciseId,
    rx: 'added in session',
    ...(entry ? { measure: entry.measures[0] } : {}),
    ...(a.sets ? { sets: Array.from({ length: a.sets }, () => ({})) } : {}),
  }
}
