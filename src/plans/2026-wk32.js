// Week 32: 3 August - 9 August 2026.
//
// 5/3/1 cycle 2, week 2 (3s week). Training maxes HELD at press 63 kg, squat
// 126 kg, deadlift 171 kg. Tom is confident in his true 1RMs; a proposal to
// raise the squat and deadlift TMs was dropped on 2 Aug 2026.
//
// "3+" means AMRAP leaving 1 to 2 reps in reserve. AMRAPs are UNCAPPED. Expect
// double figures on the lower body top sets: that is Tom's rep profile, not a
// miscalibrated TM.
//
// Week 31 did not finish. The ATHX endurance simulation has been scheduled
// twice and never run, so there is still no baseline. The metcon was deferred
// twice. The knee physio block did not happen at all.
//
// Physio placement: shoulder programme as Monday's press warm-up; crab walks as
// Wednesday's squat warm-up; knee block once, Tuesday.
//
// Running per 09 Running Plan: two runs, Mon 35-40 min and Tue 45 min, both
// zone 2 to 3 on the Garmin. Distance is an output, not a target.
//
// New this week: toes-to-bar enters as skill work in the muscle up block.
//
// ID note: ids are reused across weeks so the KV log stays queryable by
// exercise id. toes-to-bar and easy-run are new to the plan; easy-run is added
// to the catalogue (toes-to-bar was already there). easy-run runs BOTH Mon and
// Tue under the SAME id, separated only by block id (mon-run / tue-long-run) —
// deliberately NOT the wk29-wk31 "-2" suffix, which split the history.
// CAVEAT, unresolved in the app as of this week: WeekLog.exercises is a flat
// Record<exerciseId, ExerciseLog> (src/types.ts) and BlockCard reads
// log.exercises[ex.id] with no block scoping (src/components/BlockCard.tsx:488),
// so Mon and Tue share one easy-run entry — logging Monday's run pre-fills and
// marks Tuesday's. Block-scoped log keys are the fix; until then this is a
// known, accepted collision, not an oversight.
export default {
  weekId: '2026-wk32',
  label: '3 August - 9 August',
  wendler: { cycle: 2, week: 2 },
  stages:
    'C2W2 3s week (TMs held 63/126/171) | AMRAPs uncapped, 1-2 reps in reserve | Mon press + shoulder physio + run 35-40 min | Tue run 45 min + full knee block | Wed squat + crab walks | Thu deadlift, hook grip from the warm-ups | Fri ATHX endurance sim (STILL no baseline, 3rd attempt) + metcon | toes-to-bar new in the muscle up block',
  notes:
    'Week 31 did not finish: the endurance simulation has been scheduled twice and never run, the metcon was deferred twice, and the knee block did not happen at all. Friday priority order is endurance simulation first, metcon second — cut the metcon if time is short, the baseline is the point. TMs held at 63/126/171 by decision on 2 Aug 2026; do not raise them mid-cycle. 3+ means AMRAP with 1 to 2 reps in reserve and no rep cap; double figures on squat and deadlift top sets are expected. Runs are Garmin zone 2 to 3 by time, not distance.',
  days: [
    {
      day: 'Mon',
      blocks: [
        {
          id: 'shoulder-physio',
          title: 'Shoulder physio (press day warm-up)',
          short: 'Shoulder physio',
          priority: 1,
          exercises: [
            {
              id: 'cable-er',
              name: 'Cable GHjt external rotation',
              rx: '3x8-12',
              measure: 'reps',
              sets: [{ r: 10 }, { r: 10 }, { r: 10 }],
            },
            {
              id: 'scap',
              name: 'Scapular retraction',
              rx: '4x5',
              measure: 'reps',
              sets: [{ r: 5 }, { r: 5 }, { r: 5 }, { r: 5 }],
            },
          ],
        },
        {
          id: 'mu-work',
          title: 'Muscle up work',
          short: 'Muscle up',
          priority: 2,
          exercises: [
            {
              id: 'pull-up',
              name: 'Strict chest-to-bar pull-up',
              rx: '4x3, 1s pause at the top',
              measure: 'reps',
              sets: [{ r: 3 }, { r: 3 }, { r: 3 }, { r: 3 }],
            },
            {
              id: 'mu-transition',
              name: 'Muscle up transition drill',
              rx: '4x3 banded. Add band assistance on a weak day',
              measure: 'band',
              sets: [{ r: 3 }, { r: 3 }, { r: 3 }, { r: 3 }],
            },
            {
              id: 'toes-to-bar',
              name: 'Toes-to-bar',
              rx: '5x5. Strict or controlled kip, full hollow to arch. End the set when the swing degrades',
              measure: 'reps',
              sets: [{ r: 5 }, { r: 5 }, { r: 5 }, { r: 5 }, { r: 5 }],
            },
          ],
        },
        {
          id: 'press',
          title: '5/3/1 Shoulder press',
          short: 'Press',
          priority: 1,
          wendler: true,
          exercises: [
            {
              id: 'press-main',
              name: 'Shoulder press',
              rx: 'Warm-up 25x5, 32.5x5, 37.5x3, then 45x3, 50x3, 57.5x3+ kg',
              measure: 'weightReps',
              sets: [
                { w: 45, r: 3 },
                { w: 50, r: 3 },
                { w: 57.5, r: 3 },
              ],
            },
          ],
        },
        {
          id: 'pulldown',
          title: 'Straight arm pulldown',
          short: 'SA pulldown',
          priority: 2,
          exercises: [
            {
              id: 'straight-arm-pulldown',
              name: 'Straight arm pulldown',
              rx: '3x12 at 40.5 kg or less. Fixed slight elbow bend, hinge 15-20 degrees, ribs down, hands start at eye level, 1s lat squeeze at the bottom',
              measure: 'weightReps',
              sets: [
                { w: 40.5, r: 12 },
                { w: 40.5, r: 12 },
                { w: 40.5, r: 12 },
              ],
            },
          ],
        },
        {
          id: 'mon-run',
          title: 'Easy run',
          short: 'Easy run',
          priority: 3,
          exercises: [
            {
              // Same id as Tuesday's run, separated by block id only — see the
              // ID note at the top of this file.
              id: 'easy-run',
              name: 'Easy run',
              rx: '35 to 40 minutes, heart rate zone 2 to 3',
              measure: 'freeText',
            },
          ],
        },
      ],
    },
    {
      day: 'Tue',
      blocks: [
        {
          id: 'tue-long-run',
          title: 'Long easy run',
          short: 'Long run',
          priority: 3,
          exercises: [
            {
              // Same id as Monday's run, separated by block id only — see the
              // ID note at the top of this file.
              id: 'easy-run',
              name: 'Easy run',
              rx: '45 minutes, heart rate zone 2 to 3',
              measure: 'freeText',
            },
          ],
        },
        {
          id: 'knee-physio',
          title: 'Knee physio (once weekly, full programme)',
          short: 'Knee physio',
          priority: 1,
          exercises: [
            { id: 'dj-two-foot', name: 'Drop jump two-foot land', rx: '2x6', measure: 'reps' },
            { id: 'dj-single', name: 'Drop jump single-leg land and hold', rx: '3x3', measure: 'reps' },
            { id: 'line-jumps', name: 'Forward line jumps', rx: '2x10', measure: 'reps' },
            { id: 'trx-squat', name: 'TRX squat', rx: '3x8', measure: 'reps' },
            { id: 'step-down', name: 'Lateral step down heel tap', rx: '2x5', measure: 'reps' },
            {
              id: 'hip-thrust',
              name: 'Single-leg barbell hip extension',
              rx: '3x8, load as appropriate',
              measure: 'weightReps',
            },
            {
              id: 'copenhagen',
              name: 'Copenhagen hip adduction',
              rx: '3x5 with a 5 second hold',
              measure: 'reps',
            },
            { id: 'leg-press', name: 'Leg press', rx: '3x12 at 60 kg', measure: 'weightReps' },
            {
              id: 'knee-ext',
              name: 'Knee extension single leg',
              rx: '3x8 at 14 kg, 90 to 40 degrees only',
              measure: 'weightReps',
            },
            { id: 'skip', name: 'Rope skipping', rx: '4 x 1 min 30 sec', measure: 'time' },
          ],
        },
      ],
    },
    {
      day: 'Wed',
      blocks: [
        {
          id: 'wed-warmup',
          title: 'Warm-up - banded crab walks',
          short: 'Crab walks',
          priority: 1,
          exercises: [
            {
              id: 'crab-walk',
              name: 'Banded crab walks',
              rx: '3x12, warm-up',
              measure: 'reps',
              sets: [{ r: 12 }, { r: 12 }, { r: 12 }],
            },
          ],
        },
        {
          id: 'du-emom',
          title: 'Double unders - EMOM',
          short: 'DU EMOM',
          priority: 2,
          exercises: [
            {
              id: 'du',
              name: 'Double unders',
              rx: '8 min EMOM, 20-30 reps each minute',
              measure: 'freeText',
            },
          ],
        },
        {
          id: 'squat',
          title: '5/3/1 Back squat',
          short: 'Squat',
          priority: 1,
          wendler: true,
          exercises: [
            {
              id: 'squat-main',
              name: 'Back squat',
              rx: 'Warm-up 50x5, 62.5x5, 75x3, then 87.5x3, 100x3, 112.5x3+ kg',
              measure: 'weightReps',
              sets: [
                { w: 87.5, r: 3 },
                { w: 100, r: 3 },
                { w: 112.5, r: 3 },
              ],
            },
          ],
        },
      ],
    },
    {
      day: 'Thu',
      blocks: [
        {
          id: 'power-clean',
          title: 'Power clean technique',
          short: 'Power clean',
          priority: 3,
          exercises: [
            {
              id: 'power-clean',
              name: 'Power clean',
              rx: '5x3 at roughly 60%, focus on bar speed',
              measure: 'weightReps',
              sets: [{ r: 3 }, { r: 3 }, { r: 3 }, { r: 3 }, { r: 3 }],
            },
          ],
        },
        {
          id: 'dl',
          title: '5/3/1 Deadlift',
          short: 'Deadlift',
          priority: 1,
          wendler: true,
          exercises: [
            {
              id: 'dl-main',
              name: 'Deadlift',
              rx: 'Warm-up 67.5x5, 85x5, 102.5x3, then 120x3, 137.5x3, 155x3+ kg. Hook grip from the warm-ups, not straps: grip capped last week and ATHX scores a 5RM',
              measure: 'weightReps',
              sets: [
                { w: 120, r: 3 },
                { w: 137.5, r: 3 },
                { w: 155, r: 3 },
              ],
            },
          ],
        },
      ],
    },
    {
      day: 'Fri',
      blocks: [
        {
          id: 'hsw',
          title: 'Handstand walk practice',
          short: 'HSW',
          priority: 2,
          exercises: [
            {
              id: 'hsw-walk',
              name: 'Handstand walk',
              rx: '10 minutes. Wall walks and shoulder taps as regressions',
              measure: 'freeText',
            },
          ],
        },
        {
          id: 'row-run-30',
          title: 'ATHX endurance zone simulation',
          short: 'Endurance 30',
          priority: 1,
          exercises: [
            {
              id: 'c2-intervals',
              name: 'Row/run endurance block',
              rx: '30 minutes for max distance, alternating 750m run and 750m C2 bike equivalent at threshold. RECORD THE DISTANCE: this is the baseline benchmark and it does not exist yet',
              measure: 'freeText',
            },
          ],
        },
        {
          id: 'metcon',
          title: 'Metcon finale rehearsal - 10 min AMRAP',
          short: 'Metcon',
          priority: 2,
          exercises: [
            {
              id: 'metcon-amrap',
              name: '10 min AMRAP',
              rx: '10 DB ground-to-overhead, 12 DB walking lunges, 6 burpee broad jumps. Log rounds + reps. Cut this before the simulation if time is short',
              measure: 'freeText',
            },
          ],
        },
      ],
    },
    {
      day: 'Sat',
      blocks: [{ id: 'rest-sat', title: 'Rest', short: 'Rest', priority: 3, exercises: [] }],
    },
    {
      day: 'Sun',
      blocks: [{ id: 'rest-sun', title: 'Rest', short: 'Rest', priority: 3, exercises: [] }],
    },
  ],
}
