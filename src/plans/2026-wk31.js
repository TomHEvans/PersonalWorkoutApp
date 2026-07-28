// Week 31: 27 July - 2 August 2026. REVISED 28 July 2026.
//
// 5/3/1 cycle 2, week 1 (5s week). Training maxes HELD at press 63 kg, squat
// 126 kg, deadlift 171 kg — these are the cycle 1 values. Cycle 1 was never
// completed, so no TM progression was applied.
//
// "5+" means AMRAP leaving 1 to 2 reps in reserve. It does NOT mean go to true
// failure. On 27 July the press top set went to failure at 52.5x6; that is the
// thing to avoid this week.
//
// Mon 27 July completed as written except the C2 threshold intervals, which
// were skipped after the 10km PB and are superseded by Friday's endurance
// simulation rather than deferred again.
//
// Tue 28 July was missed entirely. The squat day moved to Wednesday, which
// pushed deadlift to Thursday and the ATHX work to Friday.
//
// NEW STANDING RULE, 28 July 2026: Wendler days carry the main lift and its
// warm-ups only. No accessories are added to a 5/3/1 lift unless Tom asks for
// them by name. Bulgarian split squats and hanging knee raises are removed from
// this week and are not to reappear. Work Tom has asked for as a programme in
// its own right (muscle up work, straight arm pulldowns, double unders,
// handstand walks, Olympic lifting, physio) is NOT an accessory and stays.
//
// Physio placement this week: banded crab walks as the Wednesday squat warm-up;
// the knee block once, on Saturday, carried as a dormant Friday reminder
// because the app has no weekend days yet. The shoulder programme already ran
// as Monday's press warm-up.
//
// Contingency: none. No travel this week.
//
// SAME-WEEK REPEATS: the log is keyed by exercise id alone (WeekLog.exercises
// is a flat Record<id, ExerciseLog>), so a movement that runs twice in one week
// MUST use distinct ids or both sessions share one entry and the second renders
// as already complete. The muscle up transition drill and the straight arm
// pulldown both run Mon AND Thu here, so Thursday's take the wk29/wk30 "-2"
// suffix (mu-transition-2, straight-arm-pulldown-2); baseId() strips a trailing
// -<n> on catalogue lookup, so they still resolve to the same catalogue entry
// and stay queryable across weeks. Friday's endurance block keeps the existing
// id athx-endurance-sim for the same reason — c2-intervals is already in use by
// Monday's (skipped) bike block.
export default {
  weekId: '2026-wk31',
  label: '27 July - 2 August',
  wendler: { cycle: 2, week: 1 },
  stages:
    'C2W1 5s week (TMs held 63/126/171) | Mon press done 52.5x6 to failure - do not repeat | Tue missed, squat -> Wed | DL Thu | ATHX endurance sim + metcon Fri (supersedes the skipped C2 intervals) | Sat blocks shown on Fri',
  notes:
    'Revised 28 July: Tue missed, squat moved to Wed, DL to Thu, ATHX work to Fri. Standing rule from 28 July: Wendler days carry the main lift and its warm-ups only, no accessories unless asked for by name. The two blocks marked SATURDAY on Friday are Saturday 1 August work, shown there only because the app has no weekend days yet. 5+ means AMRAP with 1 to 2 reps in reserve, not to failure.',
  days: [
    {
      day: 'Mon',
      blocks: [
        {
          id: 'sh-physio',
          title: 'Warm-up — shoulder rehab',
          short: 'shoulder rehab',
          priority: 1,
          exercises: [
            {
              id: 'cable-er',
              name: 'Cable external rotation',
              rx: '3x8-12, glenohumeral external rotation on the cable machine',
              sets: [{ r: '8-12' }, { r: '8-12' }, { r: '8-12' }],
            },
            { id: 'scap', name: 'Scapular retraction', rx: '4x5', sets: [{ r: 5 }, { r: 5 }, { r: 5 }, { r: 5 }] },
          ],
        },
        {
          id: 'mu-practice',
          title: 'Muscle-up practice (first, fresh)',
          short: 'MU practice',
          priority: 2,
          exercises: [
            {
              id: 'c2b',
              name: 'Strict chest-to-bar pull-up',
              rx: '4x3 with a pause at the top. Rounds: alternate with the transition drills',
              sets: [{ r: 3 }, { r: 3 }, { r: 3 }, { r: 3 }],
            },
            {
              id: 'mu-transition',
              name: 'Muscle-up transition drill',
              rx: '4x3, banded or feet-assisted on rings. Alternate with the C2B pull-ups each round',
              sets: [{ r: 3 }, { r: 3 }, { r: 3 }, { r: 3 }],
            },
          ],
        },
        {
          id: 'press',
          title: '5/3/1 Shoulder press',
          short: 'press',
          priority: 1,
          wendler: true,
          exercises: [
            {
              id: 'press-main',
              name: 'Strict press',
              rx: 'Warm-up 25/32.5/37.5 kg x5/5/3, then 65% 40x5, 75% 47.5x5, 85% 52.5 kg x5+. AMRAP: leave 1-2 in reserve. TM held at 63 — adjust if C2 TM was set differently',
              sets: [
                { w: 40, r: 5 },
                { w: 47.5, r: 5 },
                { w: 52.5, r: '5+' },
              ],
            },
          ],
        },
        {
          id: 'upper-accessories',
          title: 'Upper accessories',
          short: 'pull-ups + dips',
          priority: 2,
          exercises: [
            { id: 'pull-up', name: 'Strict pull-up', rx: '4x6', sets: [{ r: 6 }, { r: 6 }, { r: 6 }, { r: 6 }] },
            { id: 'dip', name: 'Strict dip', rx: '3x8', sets: [{ r: 8 }, { r: 8 }, { r: 8 }] },
            {
              id: 'straight-arm-pulldown',
              name: 'Straight-arm pulldown',
              rx: '3x12, moderate weight — muscle-up accessory',
              sets: [{ r: 12 }, { r: 12 }, { r: 12 }],
            },
          ],
        },
        {
          id: 'c2-threshold',
          title: 'C2 bike — threshold intervals (covers the deferred C2 work)',
          short: 'C2 bike',
          priority: 2,
          exercises: [
            {
              id: 'c2-intervals',
              name: 'Bike intervals',
              rx: '3 x 4 min at threshold effort, 3 min easy between. Log pace/watts',
            },
          ],
        },
      ],
    },
    {
      day: 'Tue',
      blocks: [
        {
          id: 'tue-missed',
          title: 'Missed session',
          short: 'Missed',
          priority: 3,
          exercises: [
            {
              id: 'note-tue-moved',
              name: 'Squat day moved to Wednesday',
              rx: 'No session completed 28 July. Squat 5/3/1 rescheduled to Wed 29 July.',
              measure: 'freeText',
            },
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
              rx: 'Warm-up 50x5, 62.5x5, 75x3, then 82.5x5, 95x5, 107.5x5+ kg',
              measure: 'weightReps',
              sets: [
                { w: 82.5, r: 5 },
                { w: 95, r: 5 },
                { w: 107.5, r: 5 },
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
          id: 'mu-work',
          title: 'Muscle up work',
          short: 'Muscle up',
          priority: 2,
          exercises: [
            {
              // "-2" suffix: second muscle-up transition session this week
              // (Monday was the first). Same-week repeats need distinct ids or
              // they share one log entry; baseId() strips the suffix so the
              // catalogue entry still resolves.
              id: 'mu-transition-2',
              name: 'Muscle up transition work',
              rx: '4 rounds of 3 strict chest-to-bar with a 1s pause at the top, plus 3 transition drills. Drop to 4 rounds of 2 once the chest touch degrades',
              measure: 'freeText',
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
              rx: 'Warm-up 67.5x5, 85x5, 102.5x3, then 110x5, 127.5x5, 145x5+ kg. Hook or mixed grip from set 1. Strong effort, no grinding, the day after a squat AMRAP',
              measure: 'weightReps',
              sets: [
                { w: 110, r: 5 },
                { w: 127.5, r: 5 },
                { w: 145, r: 5 },
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
              // "-2": second straight arm pulldown of the week (Monday's upper
              // accessories was the first). See the mu-transition-2 note above.
              id: 'straight-arm-pulldown-2',
              name: 'Straight arm pulldown',
              rx: '3x12 at 40.5 kg or less. Fixed slight elbow bend that does not change, hinge 15-20 degrees at the hips, ribs down, hands start at eye level, 1s lat squeeze at the bottom. Use a rope attachment if the bar pulls into triceps',
              measure: 'weightReps',
              sets: [
                { w: 40.5, r: 12 },
                { w: 40.5, r: 12 },
                { w: 40.5, r: 12 },
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
              rx: '10 minutes practice. Wall walks and shoulder taps as regressions',
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
              // Keeps the id this week's endurance block already used, so the
              // benchmark stays queryable. NOT c2-intervals — Monday's bike
              // block holds that id and same-week ids must be unique.
              id: 'athx-endurance-sim',
              name: 'Row/run endurance block',
              rx: '30 minutes for max distance, alternating 750m run and 750m C2 bike equivalent at threshold pacing. Record total distance, it becomes the baseline ATHX benchmark',
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
              rx: '10 DB ground-to-overhead, 12 DB walking lunges, 6 burpee broad jumps. Log rounds + reps. Cut this before the endurance simulation if time is short',
              measure: 'freeText',
            },
          ],
        },
        {
          // DORMANT REMINDER — this is Saturday 1 August work. It sits on Friday
          // only because the app has no weekend days yet; once they ship, move
          // this block (and sat-reminder-run below) to a real Sat day entry.
          id: 'sat-reminder-physio',
          title: 'SATURDAY 1 AUG reminder (not logged here) - Knee physio block',
          short: 'Sat: physio',
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
              rx: '3x5 with a 5 second hold, lower leg hip variant',
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
        {
          // DORMANT REMINDER — Saturday 1 August work; see the note above.
          id: 'sat-reminder-run',
          title: 'SATURDAY 1 AUG reminder (not logged here) - 7.5km easy run',
          short: 'Sat: run',
          priority: 3,
          exercises: [
            {
              id: 'sat-run',
              name: '7.5km easy run',
              rx: '7.5km easy, conversational pace',
              measure: 'freeText',
            },
          ],
        },
      ],
    },
  ],
}
