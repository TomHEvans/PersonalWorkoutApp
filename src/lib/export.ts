import type { Block, Exercise, ExerciseLog, WeekLog, WeekPlan } from '../types'
import { DAY_NAMES, blocksForDay, findBlock } from './plans'
import { catalogueEntry, resolveMeasure } from '../catalogue'
import { addedToExercise } from './added'
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
  if (!exercise.sets) {
    const view = entry ?? {}
    // A bare number typed into a calories-measured actual gets its unit in the
    // export, so "45" reads as "45 cal" to the planning chat.
    if (
      resolveMeasure(exercise, entry) === 'cal' &&
      view.actual &&
      /^\d+(\.\d+)?$/.test(view.actual.trim())
    ) {
      return { ...view, actual: `${view.actual.trim()} cal` }
    }
    return view
  }
  const measure = resolveMeasure(exercise, entry)
  const sets = effectiveSets(exercise, entry)
  const doneSets = sets.filter((s) => s.done)
  // e1RM only means anything for weight-measured work (typed weights can
  // linger after a switch to reps/band; don't export them as an e1RM).
  const e1rm = measure === 'weightReps' ? estimate1RM(sets) : null
  const setsStr = doneSets.map((s) => formatSet(s, measure)).filter(Boolean).join(', ')
  return {
    done: isExerciseDone(exercise, entry),
    actual: (setsStr ? `${setsStr}${e1rm === null ? '' : ` (e1RM ${e1rm})`}` : '') || entry?.actual,
    swap: entry?.swap,
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

// The label a detail line leads with. In-session additions always name
// themselves ("devil press (added)"), as do legacy swapped slots
// ("devil press (was muscle-up)"), even in single-exercise blocks where the
// block title normally suffices.
function detailLabel(ex: Exercise, e: ExerciseLog, single: boolean, added: boolean): string | null {
  if (added) return `${ex.name.toLowerCase()} (added)`
  if (e.swap) {
    const swapName = (catalogueEntry(e.swap)?.name ?? e.swap).toLowerCase()
    return `${swapName} (was ${ex.name.toLowerCase()})`
  }
  return single ? null : ex.name
}

function blockSegment(block: Block, log: WeekLog): string | null {
  const planned = block.exercises.map((ex) => ({ ex, added: false, log: exerciseView(ex, log.exercises[ex.id]) }))
  const extras = log.added
    .filter((a) => a.blockId === block.id)
    .map((a) => {
      const ex = addedToExercise(a)
      return { ex, added: true, log: exerciseView(ex, log.exercises[a.id]) }
    })
  const entries = [...planned, ...extras]
  // Additions surface as a detail line as soon as they're done, even with no
  // typed values — "(added)" is itself the information.
  const detailed = entries.filter(
    (e) => e.log.actual || e.log.rpe != null || e.log.note || e.log.swap || (e.added && e.log.done),
  )
  const doneCount = entries.filter((e) => e.log.done).length

  if (detailed.length > 0) {
    const single = entries.length === 1
    const details = detailed.map((e) => exerciseDetail(detailLabel(e.ex, e.log, single, e.added), e.log))
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
  // A swapped slot means the programmed lift was NOT done — it must not count
  // toward Wendler completion (the detail line still shows what replaced it).
  const done = exercises.filter((ex) => {
    const entry = log.exercises[ex.id]
    return !entry?.swap && isExerciseDone(ex, entry)
  }).length
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
  lines.push(`SKIPPED: ${deferred.length > 0 ? deferred.join('; ') : 'none'}`)

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
