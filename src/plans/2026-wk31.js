// Week 31: 27 July - 2 August 2026. REVISED 28 July 2026 (mid-week adjust).
//
// What changed on 28 July: Tuesday 28 July was missed entirely, so the squat
// day moves to Wednesday. The possible holiday from 30 July did not happen, so
// Thursday and Friday are live again — Tom is available Wednesday to Saturday.
//
// Wendler cycle 2, week 1 (5s week). Training maxes HELD at press 63, squat
// 126, deadlift 171 kg. Working sets are 65/75/85% of TM, warm-ups 40/50/60%
// for 5/5/3, everything rounded to the nearest 2.5 kg:
//   press 40/47.5/52.5 | squat 82.5/95/107.5 | deadlift 110/127.5/145 kg
// "5+" means AMRAP leaving 1-2 reps in reserve. It does NOT mean training to
// failure.
//
// Monday ran as planned: the press was completed at 52.5 kg x 6, failing the
// seventh rep. Monday's C2 threshold intervals were skipped (soreness after a
// 10km PB of 53:38 on 26 July) and are now SUPERSEDED by Friday's ATHX
// endurance simulation — they are not deferred again.
//
// Priority order changed on 28 July 2026: ATHX first, CrossFit skills and
// Olympic lifts second, running third. The rest of the week is built around
// the ATHX competition lifts, the endurance zone and the metcon finale.
//
// Physio placement: resisted crab walks warm up every squat day (Wed). The
// shoulder programme is DONE — it ran as Monday's press-day warm-up. The
// once-weekly knee block sits on Saturday.
//
// Saturday is a real day in the app now (weekend days shipped), so the knee
// physio block and the easy run sit on Sat where they belong — they were
// carried as dormant "SATURDAY:" reminder blocks on Friday until then.
//
// ID note: recurring movements keep their stable ids (squat-main, dl-main, du,
// c2b, mu-transition, power-clean, straight-arm-pulldown,
// bulgarian-split-squat, hanging-knee-raise, hsw-walk, crab-walk, and the knee
// physio ids dj-two-foot, dj-single, line-jumps, trx-squat, step-down,
// hip-thrust, copenhagen, leg-press, knee-ext, skip). New this revision:
// note-tue-moved (the missed-session marker), athx-endurance-sim,
// metcon-wk31b and easy-run-75 — each carries an explicit `measure`, so none
// depends on a catalogue entry.
//
// SAME-WEEK REPEATS: the log is keyed by exercise id alone (WeekLog.exercises
// is a flat Record<id, ExerciseLog>), so a movement that runs twice in one
// week MUST use distinct ids or both sessions share one entry and the second
// renders as already complete. C2B, the MU transition drill and the
// straight-arm pulldown all run Mon AND Thu here, so Thursday's take the
// wk29/wk30 "-2" suffix (c2b-2, mu-transition-2, straight-arm-pulldown-2);
// baseId() strips a trailing -<n> on catalogue lookup, so they still resolve
// to the same catalogue entry and stay queryable across weeks.
export default {
  weekId: '2026-wk31',
  label: '27 July - 2 August',
  wendler: { cycle: 2, week: 1 },
  stages:
    'C2W1 5s week (TMs held 63/126/171) | Mon press done 52.5x6 | Tue missed, squat -> Wed | DL Thu | ATHX endurance sim + metcon Fri (supersedes the skipped C2 intervals) | Sat knee physio + easy run',
  notes:
    'Revised 28 July: Tue missed, squat moved to Wed. Holiday cancelled, Thu/Fri live. Priority order now ATHX first, CrossFit skills second, running third. Saturday 1 August (knee physio, 7.5km easy run) is now a real Sat day in the app rather than two reminder blocks on Friday. 5+ means AMRAP with 1 to 2 reps in reserve, not to failure.',
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
          title: 'Squat-day rehab warm-up',
          short: 'Warm-up',
          priority: 1,
          exercises: [
            {
              id: 'crab-walk',
              name: 'Resisted crab walks (v3)',
              rx: '3x12',
              measure: 'band',
              sets: [{ r: 12 }, { r: 12 }, { r: 12 }],
            },
          ],
        },
        {
          id: 'wed-skill',
          title: 'Double unders',
          short: 'DU',
          priority: 2,
          exercises: [
            {
              id: 'du',
              name: 'Double unders',
              rx: '8 min EMOM, 20-30 reps per minute',
              measure: 'reps',
            },
          ],
        },
        {
          id: 'wed-squat',
          title: 'Back squat 5/3/1 (C2W1)',
          short: 'Squat',
          priority: 1,
          wendler: true,
          exercises: [
            {
              id: 'squat-main',
              name: 'Back squat',
              rx: 'Warm-up 50x5, 62.5x5, 75x3. Work 82.5x5, 95x5, 107.5x5+ kg',
              measure: 'weightReps',
              sets: [
                { w: 82.5, r: 5 },
                { w: 95, r: 5 },
                { w: 107.5, r: 5 },
              ],
            },
          ],
        },
        {
          id: 'wed-accessory',
          title: 'Lower accessory',
          short: 'Accessory',
          priority: 3,
          exercises: [
            {
              id: 'bulgarian-split-squat',
              name: 'Bulgarian split squat',
              rx: '3x8 per leg',
              measure: 'weightReps',
              sets: [{ r: 8 }, { r: 8 }, { r: 8 }],
            },
            {
              id: 'hanging-knee-raise',
              name: 'Hanging knee raise',
              rx: '3x10',
              measure: 'reps',
              sets: [{ r: 10 }, { r: 10 }, { r: 10 }],
            },
          ],
        },
      ],
    },
    {
      day: 'Thu',
      blocks: [
        {
          id: 'thu-oly',
          title: 'Power clean technique',
          short: 'Oly',
          priority: 3,
          exercises: [
            {
              id: 'power-clean',
              name: 'Power clean',
              rx: '5x3 at roughly 60%. Technique and bar speed, not load.',
              measure: 'weightReps',
              sets: [{ r: 3 }, { r: 3 }, { r: 3 }, { r: 3 }, { r: 3 }],
            },
          ],
        },
        {
          id: 'thu-mu',
          title: 'Muscle up work',
          short: 'MU',
          priority: 2,
          exercises: [
            {
              // "-2" suffix: second session of these movements this week (Mon
              // was the first). Same-week repeats need distinct ids or they
              // share one log entry — wk29/wk30 convention; baseId() strips
              // the suffix so the catalogue entry still resolves.
              id: 'c2b-2',
              name: 'Strict chest-to-bar pull-up',
              rx: '4 rounds of 3, pause at the top. Drop to 4x2 as soon as the chest touch degrades.',
              measure: 'reps',
              sets: [{ r: 3 }, { r: 3 }, { r: 3 }, { r: 3 }],
            },
            {
              id: 'mu-transition-2',
              name: 'Muscle-up transition drill',
              rx: '4 rounds of 3 (banded rings, feet-assisted, or jumping bar MU negatives)',
              measure: 'reps',
              sets: [{ r: 3 }, { r: 3 }, { r: 3 }, { r: 3 }],
            },
          ],
        },
        {
          id: 'thu-dl',
          title: 'Deadlift 5/3/1 (C2W1)',
          short: 'Deadlift',
          priority: 1,
          wendler: true,
          exercises: [
            {
              id: 'dl-main',
              name: 'Deadlift',
              rx: 'Warm-up 67.5x5, 85x5, 102.5x3. Work 110x5, 127.5x5, 145x5+ kg. Strong effort, no grinding, day after the squat AMRAP.',
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
          id: 'thu-pull',
          title: 'Muscle up accessory',
          short: 'Pulldown',
          priority: 2,
          exercises: [
            {
              // "-2": second straight-arm pulldown of the week (Mon's upper
              // accessories was the first). See the c2b-2 note above.
              id: 'straight-arm-pulldown-2',
              name: 'Straight-arm pulldown',
              rx: '3x12 at 40.5 kg. FIX: fix a slight elbow bend and never let it change, hinge forward 15-20 degrees, ribs down, start at eye level, drive the whole arm in an arc to the thighs, squeeze the lat for 1 sec at the bottom. Use a rope if a straight bar keeps turning it into a triceps pushdown. Stay light.',
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
          id: 'fri-hsw',
          title: 'Handstand walk practice',
          short: 'HSW',
          priority: 2,
          exercises: [
            {
              id: 'hsw-walk',
              name: 'Handstand walk',
              rx: '10 min practice. Wall walks and shoulder taps as regressions.',
              measure: 'freeText',
            },
          ],
        },
        {
          id: 'fri-athx-endurance',
          title: 'ATHX endurance zone simulation',
          short: 'Endurance',
          priority: 1,
          exercises: [
            {
              id: 'athx-endurance-sim',
              name: 'ATHX endurance simulation',
              rx: '30 min for max distance. Alternate 750m run and 750m C2 bike equivalent, continuous, threshold pacing. RECORD THE TOTAL DISTANCE, it becomes the benchmark.',
              measure: 'distance',
            },
          ],
        },
        {
          id: 'fri-metcon',
          title: 'ATHX metcon finale rehearsal',
          short: 'Metcon',
          priority: 2,
          exercises: [
            {
              id: 'metcon-wk31b',
              name: '10 min AMRAP',
              rx: '10 DB ground-to-overhead, 12 DB walking lunges, 6 burpee broad jumps',
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
          id: 'sat-knee-physio',
          title: 'Knee physio block',
          short: 'knee physio',
          priority: 1,
          exercises: [
            {
              id: 'dj-two-foot',
              name: 'Drop jump, two-foot land and jump',
              rx: '2x6',
              measure: 'reps',
              sets: [{ r: 6 }, { r: 6 }],
            },
            {
              id: 'dj-single',
              name: 'Drop jump, single leg land and hold',
              rx: '3x3',
              measure: 'reps',
              sets: [{ r: 3 }, { r: 3 }, { r: 3 }],
            },
            { id: 'line-jumps', name: 'Forward line jumps', rx: '2x10', measure: 'reps', sets: [{ r: 10 }, { r: 10 }] },
            { id: 'trx-squat', name: 'TRX squat', rx: '3x8', measure: 'reps', sets: [{ r: 8 }, { r: 8 }, { r: 8 }] },
            {
              id: 'step-down',
              name: 'Lateral step down, heel tap',
              rx: '2x5',
              measure: 'reps',
              sets: [{ r: 5 }, { r: 5 }],
            },
            {
              id: 'hip-thrust',
              name: 'Single leg barbell hip extension',
              rx: '3x8, load as appropriate',
              measure: 'weightReps',
              sets: [{ r: 8 }, { r: 8 }, { r: 8 }],
            },
            {
              id: 'copenhagen',
              name: 'Copenhagen hip adduction',
              rx: '3x5 with a 5 second hold',
              measure: 'reps',
              sets: [{ r: 5 }, { r: 5 }, { r: 5 }],
            },
            {
              id: 'leg-press',
              name: 'Leg press',
              rx: '3x12 at 60 kg',
              measure: 'weightReps',
              sets: [
                { w: 60, r: 12 },
                { w: 60, r: 12 },
                { w: 60, r: 12 },
              ],
            },
            {
              id: 'knee-ext',
              name: 'Single leg knee extension (90-40 deg)',
              rx: '3x8 at 14 kg',
              measure: 'weightReps',
              sets: [
                { w: 14, r: 8 },
                { w: 14, r: 8 },
                { w: 14, r: 8 },
              ],
            },
            { id: 'skip', name: 'Rope skipping', rx: '4 x 1:30', measure: 'time' },
          ],
        },
        {
          id: 'sat-run',
          title: 'Easy run',
          short: 'easy run',
          priority: 1,
          exercises: [
            {
              id: 'easy-run-75',
              name: 'Easy run',
              rx: '7.5km at conversational pace',
              measure: 'distance',
            },
          ],
        },
      ],
    },
  ],
}
