// Plan registry. Weekly updates touch only this directory:
//   1. add src/plans/<weekId>.js (default-exporting the week object)
//   2. import it below and add it to `weeks`
//   3. point `currentWeekId` at it
import wk28 from './2026-wk28.js'
import wk29 from './2026-wk29.js'

export const weeks = {
  [wk28.weekId]: wk28,
  [wk29.weekId]: wk29,
}

export const currentWeekId = '2026-wk29'
