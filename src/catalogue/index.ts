import type { Exercise, MeasureType } from '../types'

// ---------------------------------------------------------------------------
// Exercise catalogue — curated in the repo, grown over time. Keyed by the same
// stable exercise id used in the plan modules (a trailing "-2" session suffix,
// e.g. du-2, is stripped on lookup). Each exercise lists the measurement
// type(s) it supports; measures[0] is the default, and a week's plan can pick a
// different one per exercise via `measure` (e.g. double-unders as reps or time).
//
// The catalogue is metadata only — it refines how an exercise is logged/shown,
// never the stored log shape. Add new exercises here as new weeks introduce
// them (a dev-only warning flags any plan exercise id missing from it).
// ---------------------------------------------------------------------------

export interface CatalogueExercise {
  name: string
  measures: MeasureType[] // supported measurement types; measures[0] is the default
  aliases?: string[]
}

const CATALOGUE: Record<string, CatalogueExercise> = {
  // ---- from the current plan weeks (wk28 / wk29) ----
  'squat-main': { name: 'Back squat', measures: ['weightReps'] },
  'press-main': { name: 'Strict press', measures: ['weightReps'] },
  'dl-main': { name: 'Deadlift', measures: ['weightReps'] },
  'cj-main': { name: 'Clean and jerk', measures: ['weightReps', 'reps'] },
  'ohs-main': { name: 'Overhead squat', measures: ['weightReps', 'reps'] },
  'clean-pull': { name: 'Clean pull', measures: ['reps', 'weightReps'] },
  'knee-ext': { name: 'Knee extension (single leg)', measures: ['weightReps', 'reps'] },
  'leg-press': { name: 'Leg press', measures: ['weightReps', 'reps'] },
  'hip-thrust': { name: 'Single-leg barbell hip thrust', measures: ['weightReps', 'reps'] },
  'copenhagen': { name: 'Copenhagen adduction', measures: ['reps', 'time', 'band'] },
  'crab-walk': { name: 'Resisted crab walks', measures: ['band', 'reps'] },
  'trx-squat': { name: 'TRX squat', measures: ['reps', 'band'] },
  'cable-er': { name: 'Cable external rotation', measures: ['reps', 'band'] },
  'scap': { name: 'Scapular retraction', measures: ['reps'] },
  'step-down': { name: 'Lateral step-down (heel tap)', measures: ['reps'] },
  'dj-two-foot': { name: 'Drop jump (two-foot land)', measures: ['reps'] },
  'dj-single': { name: 'Drop jump (single-leg land + hold)', measures: ['reps'] },
  'line-jumps': { name: 'Forward line jumps', measures: ['reps'] },
  'c2b': { name: 'Strict chest-to-bar pull-up', measures: ['reps', 'weightReps'] },
  'jbmu': { name: 'Jumping bar muscle-up', measures: ['reps'] },
  'kip-pull': { name: 'Hips-to-bar kip pull', measures: ['reps'] },
  't2b': { name: 'Toes-to-bar', measures: ['reps'] },
  'hsw-walk': { name: 'Handstand walk', measures: ['reps', 'time'] },
  'du': { name: 'Double-unders', measures: ['reps', 'time'] },
  'max-du': { name: 'Max unbroken double-unders', measures: ['freeText'] },
  'skip': { name: 'Rope skipping', measures: ['reps', 'time'] },
  'c2-intervals': { name: 'Bike intervals', measures: ['freeText', 'time'] },
  'c2-test': { name: 'C2 bike threshold test', measures: ['freeText', 'time'] },
  'run-easy': { name: 'Easy run', measures: ['freeText'] },
  'run-long': { name: 'Long run', measures: ['freeText'] },

  // ---- common hybrid movements (seed; not yet in a week) ----
  'front-squat': { name: 'Front squat', measures: ['weightReps'] },
  'box-squat': { name: 'Box squat', measures: ['weightReps'] },
  'bench-press': { name: 'Bench press', measures: ['weightReps'] },
  'push-press': { name: 'Push press', measures: ['weightReps'] },
  'romanian-deadlift': { name: 'Romanian deadlift', measures: ['weightReps'], aliases: ['RDL'] },
  'barbell-row': { name: 'Barbell row', measures: ['weightReps'] },
  'hip-thrust-barbell': { name: 'Barbell hip thrust', measures: ['weightReps'] },
  'calf-raise': { name: 'Calf raise', measures: ['weightReps', 'reps'] },
  'clean': { name: 'Clean', measures: ['reps', 'weightReps'] },
  'power-clean': { name: 'Power clean', measures: ['reps', 'weightReps'] },
  'snatch': { name: 'Snatch', measures: ['reps', 'weightReps'] },
  'jerk': { name: 'Jerk', measures: ['reps', 'weightReps'] },
  'thruster': { name: 'Thruster', measures: ['weightReps', 'reps'] },
  'kettlebell-swing': { name: 'Kettlebell swing', measures: ['reps', 'weightReps'] },
  'pull-up': { name: 'Pull-up', measures: ['reps', 'weightReps'] },
  'chin-up': { name: 'Chin-up', measures: ['reps', 'weightReps'] },
  'push-up': { name: 'Push-up', measures: ['reps'] },
  'dip': { name: 'Dip', measures: ['reps', 'weightReps'] },
  'ring-dip': { name: 'Ring dip', measures: ['reps'] },
  'muscle-up': { name: 'Muscle-up', measures: ['reps'] },
  'bar-muscle-up': { name: 'Bar muscle-up', measures: ['reps'] },
  'handstand-push-up': { name: 'Handstand push-up', measures: ['reps'] },
  'pistol-squat': { name: 'Pistol squat', measures: ['reps'] },
  'box-jump': { name: 'Box jump', measures: ['reps'] },
  'broad-jump': { name: 'Broad jump', measures: ['reps'] },
  'burpee': { name: 'Burpee', measures: ['reps', 'time'] },
  'wall-ball': { name: 'Wall ball', measures: ['reps'] },
  'rope-climb': { name: 'Rope climb', measures: ['reps'] },
  'plank': { name: 'Plank', measures: ['time'] },
  'side-plank': { name: 'Side plank', measures: ['time'] },
  'hollow-hold': { name: 'Hollow hold', measures: ['time'] },
  'dead-hang': { name: 'Dead hang', measures: ['time'] },
  'l-sit': { name: 'L-sit', measures: ['time'] },
  'farmers-carry': { name: "Farmer's carry", measures: ['time', 'freeText'] },
  'sled-push': { name: 'Sled push', measures: ['freeText', 'time'] },
  'row-erg': { name: 'Row (erg)', measures: ['freeText', 'time'] },
  'ski-erg': { name: 'Ski erg', measures: ['freeText', 'time'] },
  'assault-bike': { name: 'Assault bike', measures: ['freeText', 'time'] },
  'band-pull-apart': { name: 'Band pull-apart', measures: ['reps', 'band'] },
  'face-pull': { name: 'Face pull', measures: ['reps'] },
  'clamshell': { name: 'Clamshell', measures: ['reps', 'band'] },
  'glute-bridge': { name: 'Glute bridge', measures: ['reps'] },
  'nordic-curl': { name: 'Nordic hamstring curl', measures: ['reps'] },
  'run-tempo': { name: 'Tempo run', measures: ['freeText'] },
  'run-intervals': { name: 'Interval run', measures: ['freeText'] },
  'mobility': { name: 'Mobility', measures: ['freeText'] },
}

// Strip a trailing session suffix ("-2", "-3") so du-2 resolves to du.
function baseId(id: string): string {
  return id.replace(/-\d+$/, '')
}

export function catalogueEntry(exerciseId: string): CatalogueExercise | undefined {
  return CATALOGUE[exerciseId] ?? CATALOGUE[baseId(exerciseId)]
}

// The measurement type to use for an exercise this week: an explicit `measure`
// wins, else the catalogue default, else a fallback that preserves the
// pre-catalogue behaviour exactly (set-based -> weightReps, else freeText).
export function measureOf(exercise: Exercise): MeasureType {
  if (exercise.measure) return exercise.measure
  const entry = catalogueEntry(exercise.id)
  if (entry) return entry.measures[0]
  return exercise.sets ? 'weightReps' : 'freeText'
}

// All measurement types an exercise could use (for week-by-week switching).
export function measuresFor(exercise: Exercise): MeasureType[] {
  if (exercise.measure) return [exercise.measure]
  return catalogueEntry(exercise.id)?.measures ?? [measureOf(exercise)]
}

export function isCatalogued(exerciseId: string): boolean {
  return catalogueEntry(exerciseId) !== undefined
}
