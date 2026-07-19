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

  // ---- CrossFit: barbell (generic ids for the common lifts) ----
  'back-squat': { name: 'Back squat', measures: ['weightReps'] },
  'deadlift': { name: 'Deadlift', measures: ['weightReps'] },
  'sumo-deadlift': { name: 'Sumo deadlift', measures: ['weightReps'] },
  'overhead-squat': { name: 'Overhead squat', measures: ['weightReps', 'reps'] },
  'shoulder-press': { name: 'Strict press', measures: ['weightReps'], aliases: ['strict press', 'OHP'] },
  'clean-and-jerk': { name: 'Clean & jerk', measures: ['reps', 'weightReps'] },
  'squat-clean': { name: 'Squat clean', measures: ['reps', 'weightReps'] },
  'squat-snatch': { name: 'Squat snatch', measures: ['reps', 'weightReps'] },
  'power-snatch': { name: 'Power snatch', measures: ['reps', 'weightReps'] },
  'hang-power-clean': { name: 'Hang power clean', measures: ['reps', 'weightReps'] },
  'hang-squat-clean': { name: 'Hang squat clean', measures: ['reps', 'weightReps'] },
  'hang-power-snatch': { name: 'Hang power snatch', measures: ['reps', 'weightReps'] },
  'push-jerk': { name: 'Push jerk', measures: ['reps', 'weightReps'] },
  'split-jerk': { name: 'Split jerk', measures: ['reps', 'weightReps'] },
  'sdhp': { name: 'Sumo deadlift high pull', measures: ['reps', 'weightReps'] },
  'overhead-lunge': { name: 'Overhead lunge', measures: ['reps', 'weightReps'] },
  'front-rack-lunge': { name: 'Front-rack lunge', measures: ['reps', 'weightReps'] },
  'bear-complex': { name: 'Bear complex', measures: ['weightReps', 'reps'] },
  'good-morning': { name: 'Good morning', measures: ['weightReps', 'reps'] },

  // ---- CrossFit: gymnastics / bodyweight ----
  'wall-walk': { name: 'Wall walk', measures: ['reps', 'time'] },
  'strict-hspu': { name: 'Strict handstand push-up', measures: ['reps'] },
  'kipping-hspu': { name: 'Kipping handstand push-up', measures: ['reps'] },
  'deficit-hspu': { name: 'Deficit handstand push-up', measures: ['reps'] },
  'ring-muscle-up': { name: 'Ring muscle-up', measures: ['reps'] },
  'chest-to-bar': { name: 'Chest-to-bar pull-up', measures: ['reps', 'weightReps'] },
  'kipping-pull-up': { name: 'Kipping pull-up', measures: ['reps'] },
  'butterfly-pull-up': { name: 'Butterfly pull-up', measures: ['reps'] },
  'toes-to-bar': { name: 'Toes-to-bar', measures: ['reps'] },
  'knees-to-elbow': { name: 'Knees-to-elbow', measures: ['reps'] },
  'ghd-situp': { name: 'GHD sit-up', measures: ['reps'] },
  'ghd-hip-ext': { name: 'GHD hip extension', measures: ['reps'] },
  'sit-up': { name: 'Sit-up', measures: ['reps', 'time'] },
  'v-up': { name: 'V-up', measures: ['reps'] },
  'ring-row': { name: 'Ring row', measures: ['reps'] },
  'legless-rope-climb': { name: 'Legless rope climb', measures: ['reps'] },
  'burpee-box-jump-over': { name: 'Burpee box jump-over', measures: ['reps', 'time'] },
  'bar-facing-burpee': { name: 'Bar-facing burpee', measures: ['reps', 'time'] },
  'box-jump-over': { name: 'Box jump-over', measures: ['reps'] },
  'handstand-hold': { name: 'Handstand hold', measures: ['time'] },
  'wall-sit': { name: 'Wall sit', measures: ['time'] },

  // ---- CrossFit: dumbbell / kettlebell ----
  'db-snatch': { name: 'Dumbbell snatch', measures: ['reps', 'weightReps'] },
  'db-thruster': { name: 'Dumbbell thruster', measures: ['reps', 'weightReps'] },
  'db-clean-and-jerk': { name: 'Dumbbell clean & jerk', measures: ['reps', 'weightReps'] },
  'db-push-press': { name: 'Dumbbell push press', measures: ['reps', 'weightReps'] },
  'db-box-step-up': { name: 'Dumbbell box step-up', measures: ['reps', 'weightReps'] },
  'db-walking-lunge': { name: 'Dumbbell walking lunge', measures: ['reps', 'weightReps'] },
  'dual-db-deadlift': { name: 'Dual dumbbell deadlift', measures: ['reps', 'weightReps'] },
  'devil-press': { name: 'Devil press', measures: ['reps', 'weightReps'] },
  'man-maker': { name: 'Man maker', measures: ['reps', 'weightReps'] },
  'kb-snatch': { name: 'Kettlebell snatch', measures: ['reps', 'weightReps'] },
  'kb-clean': { name: 'Kettlebell clean', measures: ['reps', 'weightReps'] },
  'kb-clean-and-jerk': { name: 'Kettlebell clean & jerk', measures: ['reps', 'weightReps'] },
  'american-kb-swing': { name: 'American KB swing', measures: ['reps', 'weightReps'] },
  'russian-kb-swing': { name: 'Russian KB swing', measures: ['reps', 'weightReps'] },
  'goblet-squat': { name: 'Goblet squat', measures: ['reps', 'weightReps'] },
  'goblet-lunge': { name: 'Goblet lunge', measures: ['reps', 'weightReps'] },
  'turkish-get-up': { name: 'Turkish get-up', measures: ['reps', 'weightReps'] },

  // ---- Machines / carries / running (CrossFit + Hyrox) ----
  'echo-bike': { name: 'Echo bike', measures: ['freeText', 'time'] },
  'bike-erg': { name: 'Bike erg (C2)', measures: ['freeText', 'time'] },
  'sled-pull': { name: 'Sled pull', measures: ['time', 'freeText'] },
  'sandbag-clean': { name: 'Sandbag clean', measures: ['reps', 'weightReps'] },
  'sandbag-carry': { name: 'Sandbag carry', measures: ['time', 'freeText'] },
  'sandbag-lunge': { name: 'Sandbag lunge', measures: ['reps', 'time', 'weightReps'] },
  'd-ball-over-shoulder': { name: 'D-ball over shoulder', measures: ['reps', 'weightReps'] },
  'shuttle-run': { name: 'Shuttle run', measures: ['time', 'freeText'] },
  'run': { name: 'Run', measures: ['freeText', 'time'] },

  // ---- Hyrox stations (fixed race format; log the station time) ----
  'hyrox-ski': { name: 'HYROX SkiErg (1000 m)', measures: ['time', 'freeText'] },
  'hyrox-sled-push': { name: 'HYROX Sled push (50 m)', measures: ['time', 'freeText'] },
  'hyrox-sled-pull': { name: 'HYROX Sled pull (50 m)', measures: ['time', 'freeText'] },
  'hyrox-burpee-broad-jump': { name: 'HYROX Burpee broad jumps (80 m)', measures: ['time', 'freeText'] },
  'hyrox-row': { name: 'HYROX Row (1000 m)', measures: ['time', 'freeText'] },
  'hyrox-farmers-carry': { name: 'HYROX Farmers carry (200 m)', measures: ['time', 'freeText'] },
  'hyrox-sandbag-lunge': { name: 'HYROX Sandbag lunges (100 m)', measures: ['time', 'freeText'] },
  'hyrox-wall-balls': { name: 'HYROX Wall balls (75 / 100)', measures: ['time', 'reps'] },
  'hyrox-run': { name: 'HYROX run (1 km)', measures: ['time', 'freeText'] },
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

// ---------------------------------------------------------------------------
// Browsable listing + slot-aware measure resolution (used by the in-app
// exercise swap picker in BlockCard).
// ---------------------------------------------------------------------------

// Group labels for the picker, keyed by the FIRST id of each section of the
// CATALOGUE object above (entries iterate in insertion order). Keep in sync
// with the section comments when adding a new section.
const GROUP_STARTS: Record<string, string> = {
  'squat-main': 'Programme',
  'front-squat': 'Strength & hybrid',
  'back-squat': 'CrossFit barbell',
  'wall-walk': 'Gymnastics',
  'db-snatch': 'Dumbbell & kettlebell',
  'echo-bike': 'Machines & carries',
  'hyrox-ski': 'Hyrox',
}

export interface CatalogueListing extends CatalogueExercise {
  id: string
  group: string
}

export function allExercises(): CatalogueListing[] {
  const out: CatalogueListing[] = []
  let group = 'Exercises'
  for (const [id, e] of Object.entries(CATALOGUE)) {
    group = GROUP_STARTS[id] ?? group
    out.push({ id, group, ...e })
  }
  return out
}

// Which measurement types a slot's structure can physically log: set-based
// slots log per-set rows, free-text slots log a single actual.
export const SET_MEASURES: MeasureType[] = ['weightReps', 'reps', 'band']
export const FREE_MEASURES: MeasureType[] = ['time', 'freeText']

// The effective measurement for a slot, considering the log's in-app overrides:
// explicit measure override > swapped exercise's default > plan/catalogue
// default — each clamped to what the slot structure supports.
export function resolveMeasure(
  exercise: Exercise,
  entry?: { measure?: MeasureType; swap?: string },
): MeasureType {
  const allowed = exercise.sets ? SET_MEASURES : FREE_MEASURES
  if (entry?.measure && allowed.includes(entry.measure)) return entry.measure
  if (entry?.swap) {
    const m = catalogueEntry(entry.swap)?.measures.find((x) => allowed.includes(x))
    if (m) return m
  }
  const planned = measureOf(exercise)
  return allowed.includes(planned) ? planned : exercise.sets ? 'reps' : 'freeText'
}
