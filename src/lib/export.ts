import type { Block, Exercise, ExerciseLog, WeekLog, WeekPlan } from '../types'
import { DAY_NAMES, blocksForDay, findBlock } from './plans'
import { effectiveSets, estimate1RM, formatSet, isExerciseDone } from './sets'

// Builds the "Copy week summary" text — the contract with the planning chat.
// Deterministic: same plan + log always produces the same text.
//
//   WEEK EXPORT 2026-wk28 (6-10 July)
//   STATE: Wendler C1W1 complete | BMU s1 | DU s1 | HSW s1 | T2B s1
//   DEFERRED: clean and jerk (Thu, London trip)
//   MAX DU FRESH: 34
//   Mon press: 52.5x7 @8 "strong" | shoulder physio done | BMU done
//   NOTES: slept badly (Mon)

const short = (block: Block) => block.short ?? block.title.toLowerCase()

// Collapses a set-based exercise into the ExerciseLog view the segment
// builder works with: actual = the completed sets ("40x5, 47.5x5, 52.5x7").
// Sets ticked done with nothing typed contribute no text — done as
// prescribed is already carried by the done count, never as a fake actual.
function exerciseView(exercise: Exercise, entry: ExerciseLog | undefined): ExerciseLog {
  if (!exercise.sets) return entry ?? {}
  const sets = effectiveSets(exercise, entry)
  const doneSets = sets.filter((s) => s.done)
  const e1rm = estimate1RM(sets)
  const setsStr = doneSets.map(formatSet).filter(Boolean).join(', ')
  return {
    done: isExerciseDone(exercise, entry),
    actual: (setsStr ? `${setsStr}${e1rm === null ? '' : ` (e1RM ${e1rm})`}` : '') || entry?.actual,
    rpe: entry?.rpe,
    note: entry?.note,
  }
}

function exerciseDetail(name: string | null, e: ExerciseLog): string {
  const parts: string[] = []
  if (name) parts.push(name)
  if (e.actual) parts.push(e.actual)
  if (e.rpe != null) parts.push(`@${e.rpe}`)
  if (e.note) parts.push(`"${e.note}"`)
  return parts.join(' ')
}

function blockSegment(block: Block, log: WeekLog): string | null {
  const entries = block.exercises.map((ex) => ({ ex, log: exerciseView(ex, log.exercises[ex.id]) }))
  const detailed = entries.filter((e) => e.log.actual || e.log.rpe != null || e.log.note)
  const doneCount = entries.filter((e) => e.log.done).length

  if (detailed.length > 0) {
    const single = block.exercises.length === 1
    const details = detailed.map((e) => exerciseDetail(single ? null : e.ex.name, e.log))
    const rest = entries.filter((e) => !detailed.includes(e))
    const suffix = rest.length > 0 && rest.every((e) => e.log.done) ? ', rest done' : ''
    return `${short(block)}: ${details.join(', ')}${suffix}`
  }
  if (doneCount === 0) return null
  if (doneCount === entries.length) return `${short(block)} done`
  return `${short(block)} ${doneCount}/${entries.length} done`
}

function wendlerStatus(plan: WeekPlan, log: WeekLog): string {
  const mains = plan.days.flatMap((d) => d.blocks).filter((b) => b.wendler)
  if (mains.length === 0) return ''
  const exercises = mains.flatMap((b) => b.exercises)
  const done = exercises.filter((ex) => isExerciseDone(ex, log.exercises[ex.id])).length
  if (done === exercises.length) return ' complete'
  if (done > 0) return ' in progress'
  return ' not started'
}

export function buildExport(plan: WeekPlan, log: WeekLog): string {
  const lines: string[] = []
  lines.push(`WEEK EXPORT ${plan.weekId} (${plan.label})`)

  const state: string[] = []
  if (plan.wendler) state.push(`Wendler C${plan.wendler.cycle}W${plan.wendler.week}${wendlerStatus(plan, log)}`)
  if (plan.stages) state.push(plan.stages)
  if (state.length > 0) lines.push(`STATE: ${state.join(' | ')}`)

  const deferred = log.deferred.map((d) => {
    const title = findBlock(plan, d.blockId)?.block.title.toLowerCase() ?? d.blockId
    return `${title} (${d.from}, ${d.reason || 'no reason given'})`
  })
  lines.push(`DEFERRED: ${deferred.length > 0 ? deferred.join('; ') : 'none'}`)

  if (log.maxDU != null) lines.push(`MAX DU FRESH: ${log.maxDU}`)
  if (log.c2) lines.push(`C2: ${log.c2}`)

  for (const day of DAY_NAMES) {
    const placed = blocksForDay(plan, log, day).filter((p) => !p.deferral)
    const segments = placed
      .slice()
      .sort((a, b) => a.block.priority - b.block.priority)
      .map((p) => {
        const seg = blockSegment(p.block, log)
        return seg && p.movedFrom ? `${seg} (moved from ${p.movedFrom})` : seg
      })
      .filter((s): s is string => s !== null)
    if (segments.length > 0) lines.push(`${day} ${segments.join(' | ')}`)
  }

  const notes = DAY_NAMES.filter((d) => log.sessionNotes[d]).map((d) => `${log.sessionNotes[d]} (${d})`)
  if (notes.length > 0) lines.push(`NOTES: ${notes.join(' | ')}`)

  return lines.join('\n')
}
