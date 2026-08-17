// Week 34: 17 August - 23 August 2026.
//
// WEEKS 32 AND 33 WERE BOTH UNTRAINED. Tom confirmed on 17 Aug 2026 that he did
// no sessions in the week of 10 to 16 August, having already lost 3 to 9 August.
// Both weeks are logged as skipped in the training log, tom_confirmed. His
// instruction both times was to push the training week back rather than skip
// forward, so this module is week 33 re-dated, which was itself week 32 re-dated.
//
// 5/3/1 cycle 2, week 2, the 3s week, REPEATS FOR THE THIRD TIME. The cycle does
// not advance for a week that was not trained. Training maxes HELD at press
// 63 kg, squat 126 kg, deadlift 171 kg, unchanged since 2 Aug 2026.
//
// "3+" means AMRAP leaving 1 to 2 reps in reserve. AMRAPs are UNCAPPED. Expect
// double figures on the lower body top sets: that is Tom's rep profile, not a
// miscalibrated TM.
//
// Running per 09 Running Plan: two runs, Mon 45 min and Sat 35-40 min, both zone
// 2 to 3 on the Garmin. The long run STAYS AT 45 MINUTES for the third week,
// because run progression counts weeks actually run.
//
// Physio placement: shoulder programme as Tuesday's press warm-up, crab walks as
// Wednesday's squat warm-up, knee block once on Tuesday. The knee block has now
// been missed THREE weeks running, 31, 32 and 33.
//
// MONDAY AND TUESDAY SWAPPED, 17 Aug 2026, at Tom's request: he runs Monday and
// lifts Tuesday. Monday is the 45 min long run and NOTHING ELSE, a single
// session, because Monday is always a heavy meetings day and he cannot double
// up on it. The press day moved wholesale to Tuesday, shoulder physio warm-up
// included, and the knee block stays on Tuesday rather than following the run,
// which is what keeps Monday to one session. Tuesday is therefore the long day
// of the week. The 35-40 min run stays on Saturday. Sunday is the only rest day.
//
// Authored on its own Monday: the Sunday kickoff was answered on the morning of
// Mon 17 Aug. Monday is authored as planned regardless; whether it ran is logged
// separately.
//
// ATHX endurance simulation: scheduled four times, run zero times, still no
// baseline with the event in October. Highest priority item in the week. If
// Friday is short, cut the metcon, never the simulation.
//
// Never run under their current prescription: toes-to-bar, the rings
// feet-assisted mu-transition drill, and the corrected straight arm pulldown
// technique.
//
// Contingency: cut from the bottom. Saturday run first, power clean second.
// Never cut the rehab warm-ups, the rehab blocks, or the three competition
// lifts.
export default {
  weekId: '2026-wk34',
  label: '17 August - 23 August',
  wendler: { cycle: 2, week: 2 },
  stages:
    'C2W2 3s week REPEATED A THIRD TIME (wk32 and wk33 both untrained) | TMs held 63/126/171 | AMRAPs uncapped, 1-2 reps in reserve | Mon run 45 min ONLY, single session (heavy meetings day) | Tue press + shoulder physio + full knee block, the long day | Wed squat + crab walks | Thu deadlift, hook grip from the warm-ups | Fri ATHX endurance sim (STILL no baseline, 5th attempt) + metcon | Sat run 35-40 min | Sun rest',
  notes:
    'Weeks 32 and 33 were both untrained: Tom confirmed 17 Aug 2026. The plan is shifted for a second time, not skipped, so the 5/3/1 cycle repeats C2W2 at identical numbers for a third scheduling and the long run stays at 45 minutes. TMs held at 63/126/171 by decision on 2 Aug 2026. 3+ means AMRAP with 1 to 2 reps in reserve and no rep cap; double figures on squat and deadlift top sets are expected. Friday priority order is endurance simulation first, metcon second: cut the metcon if time is short, the baseline is the point and after four attempts it still does not exist. Runs are Garmin zone 2 to 3 by time, not distance. Monday and Tuesday were swapped on 17 Aug 2026 as Tom requested: Monday is the 45 minute long run and nothing else, a single session on a heavy meetings day, and Tuesday carries the whole press day plus the knee block.',
  days: [
    {
      day: 'Mon',
      blocks: [
        {
          // Renamed from tue-long-run when the long run moved to Monday. The
          // block id names its day, as sat-run does, so leaving it as
          // "tue-long-run" on a Monday would mislabel every logged row.
          id: 'mon-long-run',
          title: 'Long easy run',
          short: 'Long run',
          priority: 3,
          exercises: [
            {
              // Same id as Saturday's run, separated by block id only. Log
              // entries are keyed blockId::exerciseId (src/lib/logKeys.ts), so
              // the two days log independently under the one id.
              id: 'easy-run',
              name: 'Easy run',
              rx: '45 minutes, heart rate zone 2 to 3',
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
              rx: '4x3 on rings, feet-assisted. False grip, rings stay in contact with the body, drive the elbows back and lean the chest forward through the rings. If the chest never gets in front of the rings, take more weight through the feet. Band only as scaling on a weak day',
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
            { id: 'copenhagen', name: 'Copenhagen hip adduction', rx: '3x5 with a 5 second hold', measure: 'reps' },
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
            { id: 'du', name: 'Double unders', rx: '8 min EMOM, 20-30 reps each minute', measure: 'freeText' },
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
              rx: 'Warm-up 67.5x5, 85x5, 102.5x3, then 120x3, 137.5x3, 155x3+ kg. Hook grip from the warm-ups, not straps: grip capped the top set in C2W1 and ATHX scores a 5RM',
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
              rx: '30 minutes for max distance, alternating 750m run and 750m C2 bike equivalent at threshold. RECORD THE DISTANCE: this is the baseline benchmark and after four attempts it still does not exist',
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
      blocks: [
        {
          id: 'sat-run',
          title: 'Easy run',
          short: 'Easy run',
          priority: 3,
          exercises: [
            {
              // Same id as Tuesday's run, separated by block id only. See the
              // note on Tuesday's block.
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
      day: 'Sun',
      blocks: [{ id: 'rest-sun', title: 'Rest', short: 'Rest', priority: 3, exercises: [] }],
    },
  ],
}
