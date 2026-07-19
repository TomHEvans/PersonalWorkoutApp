import type { Exercise, ExerciseLog, MeasureType, SetLog } from '../types'

// Set weight/reps are captured as numbers, not free text. These keep the
// stored value a clean numeric string (or empty) at the point of entry, so a
// prescribed default can never be concatenated onto a typed value ("127" +
// "130.5" -> "127130.5") and no "x" can slip into a field ("0x5"). Every
// downstream reader can therefore Number() the value safely.
//   - weight: digits and at most one decimal point
//   - reps: whole digits only
export const sanitizeWeight = (raw: string): string => {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  const dot = cleaned.indexOf('.')
  if (dot === -1) return cleaned
  return cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./g, '')
}

export const sanitizeReps = (raw: string): string => raw.replace(/[^0-9]/g, '')

// The set rows shown (and exported) for a set-based exercise: logged rows
// where they exist, otherwise empty rows. Rows start empty — the programmed
// values appear only as input placeholders — so a stored value always means
// the user typed it, and an untouched set never exports as a fake actual.
export function effectiveSets(exercise: Exercise, entry: ExerciseLog | undefined): SetLog[] {
  if (!exercise.sets) return []
  return exercise.sets.map((_, i) => entry?.sets?.[i] ?? { w: '', r: '', done: false })
}

export function isExerciseDone(exercise: Exercise, entry: ExerciseLog | undefined): boolean {
  if (!exercise.sets) return Boolean(entry?.done)
  const sets = effectiveSets(exercise, entry)
  return sets.length > 0 && sets.every((s) => s.done)
}

// Export text for a set: only what was actually typed. Empty for an
// untouched row — callers drop empty strings rather than inventing values.
// The measure picks which field leads (band "red×12" vs weight "52.5x7"); with
// no measure it falls back to whatever was typed. Passing the measure keeps the
// export correct after an exercise's type is switched, without wiping fields.
export const formatSet = (s: SetLog, measure?: MeasureType): string => {
  const band = (s.band ?? '').trim()
  const w = s.w.trim()
  const r = s.r.trim()
  const t = (s.t ?? '').trim()
  if (measure === 'time') return t
  if (measure === 'cal') {
    const cal = (s.cal ?? '').trim()
    return cal ? `${cal} cal` : ''
  }
  if (measure === 'distance') return (s.dist ?? '').trim()
  if (measure === 'band') return band && r ? `${band}×${r}` : band || r
  if (measure === 'reps') return r
  if (measure === 'weightReps') return w && r ? `${w}x${r}` : w ? `${w} kg` : r
  if (band && r) return `${band}×${r}`
  if (band) return band
  if (w && r) return `${w}x${r}`
  if (w) return `${w} kg`
  return r
}

// Estimated 1RM (Epley: w * (1 + r/30)) from the best completed set with a
// numeric weight and rep count — in a 5/3/1 week that is the AMRAP top set.
// Returns null when no completed set qualifies (bodyweight work, weight or
// reps not filled in, nothing ticked yet). Rounded to 0.5 kg.
export function estimate1RM(sets: SetLog[]): number | null {
  let best: number | null = null
  for (const s of sets) {
    if (!s.done) continue
    const wt = s.w.trim()
    if (!wt) continue
    const w = Number(wt)
    if (!Number.isFinite(w) || w <= 0) continue
    if (!/^\d+$/.test(s.r.trim())) continue
    const r = Number(s.r.trim())
    if (r < 1) continue
    const e = r === 1 ? w : w * (1 + r / 30)
    if (best === null || e > best) best = e
  }
  return best === null ? null : Math.round(best * 2) / 2
}
