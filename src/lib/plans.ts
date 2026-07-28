import type { Block, DayName, Deferral, Exercise, WeekLog, WeekPlan } from '../types'
import { weeks as rawWeeks, currentWeekId } from '../plans/index.js'

// Typed boundary around the plain-JS plan modules.
export const weeks = rawWeeks as Record<string, WeekPlan>
export { currentWeekId }

export const weekIds = Object.keys(weeks).sort()

export function getPlan(weekId: string): WeekPlan {
  return weeks[weekId] ?? weeks[currentWeekId]
}

// The full week. Ordered Mon-first (training weeks run Mon-Sun, not Sun-Sat),
// which is also the order the day tabs and the export's day lines use.
export const DAY_NAMES: DayName[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const isWeekend = (day: DayName): boolean => day === 'Sat' || day === 'Sun'

// Date.getDay() is Sun-indexed; DAY_NAMES is Mon-first, so this maps rather
// than indexes. Every real day now has a tab, so it never returns null.
export function todayName(): DayName {
  return (['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as DayName[])[new Date().getDay()]
}

export function findBlock(plan: WeekPlan, blockId: string): { block: Block; day: DayName } | null {
  for (const day of plan.days) {
    const block = day.blocks.find((b) => b.id === blockId)
    if (block) return { block, day: day.day }
  }
  return null
}

export function findExercise(
  plan: WeekPlan,
  exerciseId: string,
): { exercise: Exercise; block: Block; day: DayName } | null {
  for (const day of plan.days) {
    for (const block of day.blocks) {
      const exercise = block.exercises.find((e) => e.id === exerciseId)
      if (exercise) return { exercise, block, day: day.day }
    }
  }
  return null
}

export interface PlacedBlock {
  block: Block
  homeDay: DayName // where the plan put it
  movedFrom?: DayName // set when the log reshuffled it to another day
  deferral?: Deferral // set when the block is deferred
}

// The effective layout of a day once the log's moves and deferrals are
// applied. Deferred blocks stay visible on their home day (as placeholders),
// moved blocks render on their target day only.
export function blocksForDay(plan: WeekPlan, log: WeekLog, day: DayName): PlacedBlock[] {
  const placed: PlacedBlock[] = []
  for (const planDay of plan.days) {
    for (const block of planDay.blocks) {
      const deferral = log.deferred.find((d) => d.blockId === block.id)
      if (deferral) {
        if (planDay.day === day) placed.push({ block, homeDay: planDay.day, deferral })
        continue
      }
      const movedTo = log.moves[block.id]
      const effectiveDay = movedTo ?? planDay.day
      if (effectiveDay !== day) continue
      placed.push({
        block,
        homeDay: planDay.day,
        movedFrom: movedTo && movedTo !== planDay.day ? planDay.day : undefined,
      })
    }
  }
  return placed
}
