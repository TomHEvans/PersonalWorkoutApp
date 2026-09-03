// Plan registry. Weekly updates touch only this directory:
//   1. add src/plans/<weekId>.js (default-exporting the week object)
//   2. import it below and add it to `weeks`
//   3. point `currentWeekId` at it
import wk28 from './2026-wk28.js'
import wk29 from './2026-wk29.js'
import wk30 from './2026-wk30.js'
import wk31 from './2026-wk31.js'
import wk32 from './2026-wk32.js'
import wk34 from './2026-wk34.js'
import wk35 from './2026-wk35.js'
import wk36 from './2026-wk36.js'

export const weeks = {
  [wk28.weekId]: wk28,
  [wk29.weekId]: wk29,
  [wk30.weekId]: wk30,
  [wk31.weekId]: wk31,
  [wk32.weekId]: wk32,
  [wk34.weekId]: wk34,
  [wk35.weekId]: wk35,
  [wk36.weekId]: wk36,
}

export const currentWeekId = '2026-wk36'
