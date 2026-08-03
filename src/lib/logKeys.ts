import type { AddedExercise, ExerciseLog, WeekLog, WeekPlan } from '../types'

// ---------------------------------------------------------------------------
// Log entry keys.
//
// WeekLog.exercises is a flat Record, so the key alone decides which slot a
// logged entry belongs to. Keying it by exercise id ALONE meant a movement
// programmed twice in one week shared a single entry: logging it on Monday
// pre-filled Tuesday's row and marked it done. wk29-wk31 dodged that by
// minting per-session ids (mu-transition-2, du-2), which cost the opposite
// thing — the same movement logged under two ids in one week.
//
// The key is now BLOCK + EXERCISE. A movement keeps ONE id everywhere it
// appears, and each block it appears in gets its own entry. That is exactly
// the natural key the week export has always used (week_id + day + block_id +
// exercise_id + set_index), so the export format does not change at all.
//
// Ids never contain the separator: plan and catalogue ids are kebab-case, and
// added-exercise ids are generated as "a-<base36>-<base36>".
// ---------------------------------------------------------------------------

export const KEY_SEP = '::'

export function exerciseKey(blockId: string, exerciseId: string): string {
  return `${blockId}${KEY_SEP}${exerciseId}`
}

// Splits a key back into its parts. A key written before scoping (no
// separator) reports a null blockId rather than guessing one.
export function splitKey(key: string): { blockId: string | null; exerciseId: string } {
  const i = key.indexOf(KEY_SEP)
  if (i === -1) return { blockId: null, exerciseId: key }
  return { blockId: key.slice(0, i), exerciseId: key.slice(i + KEY_SEP.length) }
}

// Where an unscoped key belongs: the first plan block carrying that exercise,
// else the block an in-session addition was made under.
function homeBlock(plan: WeekPlan, added: AddedExercise[], exerciseId: string): string | null {
  for (const day of plan.days) {
    for (const block of day.blocks) {
      if (block.exercises.some((e) => e.id === exerciseId)) return block.id
    }
  }
  return added.find((a) => a.id === exerciseId)?.blockId ?? null
}

// Rewrites pre-scoping entries onto their block-scoped keys. Runs on every
// record read — localStorage AND the KV copy, which is a single shared record
// with no version of its own — so a log written by an older client is scoped
// the first time this one reads it. Idempotent: already-scoped keys pass
// through untouched.
//
// Two deliberate choices where the old shape cannot answer the question:
//
//   - An exercise programmed in more than one block this week had ONE entry
//     for all of them. It lands on the first block; the later blocks start
//     empty. There is no information in the old record saying which session
//     the values came from, and silently copying them into both would invent
//     a session that may never have happened.
//   - A key matching nothing in the plan (a movement since dropped, an
//     addition since removed) is KEPT as-is rather than discarded. It stays
//     out of the way, and the export and week panel already fall back to the
//     bare id for anything the plan no longer carries.
//
// An already-scoped entry always wins over an unscoped one promoted onto the
// same key, so re-reading a partially-migrated record never clobbers newer
// data with staler data.
export function scopeLog(plan: WeekPlan, log: WeekLog): WeekLog {
  const entries = Object.entries(log.exercises)
  if (!entries.some(([key]) => !key.includes(KEY_SEP))) return log

  const scoped: Record<string, ExerciseLog> = {}
  const pending: [string, ExerciseLog][] = []
  for (const [key, entry] of entries) {
    if (key.includes(KEY_SEP)) scoped[key] = entry
    else pending.push([key, entry])
  }
  // `moved` guards the return: a record whose only unscoped keys are orphans
  // is already in its final shape, and handing back a fresh object every read
  // would churn React state for nothing.
  let moved = false
  for (const [key, entry] of pending) {
    const blockId = homeBlock(plan, log.added, key)
    const next = blockId ? exerciseKey(blockId, key) : key
    if (next !== key) moved = true
    if (!(next in scoped)) scoped[next] = entry
  }
  return moved ? { ...log, exercises: scoped } : log
}
