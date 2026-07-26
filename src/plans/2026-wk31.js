// Week 31: 27 July - 2 August 2026. 5/3/1 Week 1 (5s week: 65/75/85% of TM,
// 5/5/5+), restarting the wave as C2W1 for press, squat AND deadlift together.
//
// TMs HELD at press 63, squat 126, deadlift 171 kg (C1 values): cycle 1 was
// never completed (wk30 was the C1W2 test week; no 5/3/1 week ran), so no TM
// progression is applied. W1 working sets therefore match wk28's. If the
// planning chat set different C2 TMs (e.g. press -> 60 per the wk30 flag),
// adjust the press/squat/DL numbers below and redeploy.
// Working sets (from TM, rounded to nearest 2.5 kg):
//   press 40/47.5/52.5 x5/5/5+ | squat 82.5/95/107.5 x5/5/5+ |
//   deadlift 110/127.5/145 x5/5/5+ ; warm-ups 40/50/60% x5/5/3 as usual.
// AMRAP (5+) sets: as many reps as possible, leaving 1-2 in reserve.
//
// Supersedes the wk30 deferrals: the deferred heavy DL C1W2 set is replaced
// by this week's W1 pull (deadlift rejoins the same wave as squat/press);
// Monday's 3x4min threshold bike covers the deferred C2 threshold work;
// clean & jerk / clean pull are not programmed this week (power clean
// technique on Thu instead).
//
// Travel contingency: Thu and Fri gym sessions run ONLY if not travelling —
// if away, Skip them with reason "travelling" (or Move). The 7.5km easy run
// is flexible: any day Thu 30 Jul - Sun 2 Aug (block sits on Thu; Sat/Sun
// carry dormant reminders — the UI tabs and export cover Mon-Fri only).
// Doing the Thu run satisfies the flexible run.
//
// Physio runs ONCE WEEKLY this week, on Wed after the metcon: the full knee
// programme (bosu squat, plyo drop jumps + line jumps, TRX squat, step-downs,
// SL hip extension, Copenhagen, leg press 60 kg, SL knee extension 14 kg,
// crab walks, rope skipping 4x90s) plus the shoulder programme (cable ER,
// scap retraction). Monday is upper + bike only — no physio, no leg work.
//
// ID note: recurring exercises keep their stable ids (press-main, squat-main,
// dl-main, c2b, du, hsw-walk, c2-intervals, power-clean, pull-up, dip, and
// the physio ids dj-two-foot, dj-single, line-jumps, trx-squat, step-down,
// hip-thrust, copenhagen, leg-press, knee-ext, crab-walk, skip, cable-er,
// scap). New movements this week get fresh catalogue-backed ids:
// mu-transition, bulgarian-split-squat, hanging-knee-raise, bosu-squat, plus
// free-text metcon-amrap and row-run-30.
export default {
  weekId: '2026-wk31',
  label: '27 July - 2 August',
  wendler: { cycle: 2, week: 1 },
  stages:
    'C2W1 5s week (TMs held 63/126/171) | DL rejoins the wave (wk30 deferral superseded) | C2 threshold 3x4min Mon | MU transitions | Thu/Fri contingent on travel | flex 7.5km run Thu-Sun',
  notes:
    'C2W1 (5s week), TMs held at C1 values — cycle 1 was never completed. Mon is upper + bike threshold, NO leg work and no physio. Physio once weekly on Wed: full knee programme + shoulder programme. Thu and Fri only if not travelling (Skip with reason if away). 7.5km easy run flexible Thu-Sun; Thu run satisfies it.',
  days: [
    {
      day: 'Mon',
      blocks: [
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
          id: 'du-emom',
          title: 'Double unders — EMOM (first)',
          short: 'DU EMOM',
          priority: 2,
          exercises: [
            {
              id: 'du',
              name: 'Double unders',
              rx: '8 min EMOM, 20-30 reps each minute',
              sets: [
                { r: '20-30' },
                { r: '20-30' },
                { r: '20-30' },
                { r: '20-30' },
                { r: '20-30' },
                { r: '20-30' },
                { r: '20-30' },
                { r: '20-30' },
              ],
            },
          ],
        },
        {
          id: 'squat',
          title: '5/3/1 Back squat',
          short: 'squat',
          priority: 1,
          wendler: true,
          exercises: [
            {
              id: 'squat-main',
              name: 'Back squat',
              rx: 'Warm-up 50/62.5/75 kg x5/5/3, then 65% 82.5x5, 75% 95x5, 85% 107.5 kg x5+. AMRAP: leave 1-2 in reserve. Last W1 top set 107.5x10@8',
              sets: [
                { w: 82.5, r: 5 },
                { w: 95, r: 5 },
                { w: 107.5, r: '5+' },
              ],
            },
          ],
        },
        {
          id: 'squat-accessories',
          title: 'Squat accessories',
          short: 'BSS + knee raises',
          priority: 2,
          exercises: [
            {
              id: 'bulgarian-split-squat',
              name: 'Bulgarian split squat',
              rx: '3x8 per leg',
              sets: [{ r: '8/side' }, { r: '8/side' }, { r: '8/side' }],
            },
            {
              id: 'hanging-knee-raise',
              name: 'Hanging knee raise',
              rx: '3x10',
              sets: [{ r: 10 }, { r: 10 }, { r: 10 }],
            },
          ],
        },
      ],
    },
    {
      day: 'Wed',
      blocks: [
        {
          id: 'dl',
          title: '5/3/1 Deadlift (back on the wave)',
          short: 'deadlift',
          priority: 1,
          wendler: true,
          exercises: [
            {
              id: 'dl-main',
              name: 'Deadlift',
              rx: 'Warm-up 67.5/85/102.5 kg x5/5/3, then 65% 110x5, 75% 127.5x5, 85% 145 kg x5+. AMRAP: leave 1-2 in reserve. Hook/mixed grip from set 1 — grip was the limiter at 145 last wave',
              sets: [
                { w: 110, r: 5 },
                { w: 127.5, r: 5 },
                { w: 145, r: '5+' },
              ],
            },
          ],
        },
        {
          id: 'metcon',
          title: 'Metcon — 10 min AMRAP',
          short: 'metcon',
          priority: 2,
          exercises: [
            {
              id: 'metcon-amrap',
              name: '10 min AMRAP',
              rx: '10 DB ground-to-overhead, 12 DB walking lunges, 6 burpee broad jumps. Log rounds+reps (e.g. 4+12)',
            },
          ],
        },
        {
          id: 'knee-physio',
          title: 'Knee physio (once weekly, full programme)',
          short: 'knee physio',
          priority: 1,
          exercises: [
            { id: 'bosu-squat', name: 'Squat on Bosu', rx: '2x8', sets: [{ r: 8 }, { r: 8 }] },
            {
              id: 'dj-two-foot',
              name: 'Drop jump two-foot land',
              rx: '2x6, two-foot land and jump',
              sets: [{ r: 6 }, { r: 6 }],
            },
            {
              id: 'dj-single',
              name: 'Drop jump single-leg land and hold',
              rx: '3x3, hands off, hold the landing',
              sets: [{ r: 3 }, { r: 3 }, { r: 3 }],
            },
            { id: 'line-jumps', name: 'Forward line jumps', rx: '2x10', sets: [{ r: 10 }, { r: 10 }] },
            { id: 'trx-squat', name: 'TRX squat', rx: '3x8', sets: [{ r: 8 }, { r: 8 }, { r: 8 }] },
            {
              id: 'step-down',
              name: 'Lateral step down heel tap',
              rx: '2x5 per side',
              sets: [{ r: '5/side' }, { r: '5/side' }],
            },
            {
              id: 'hip-thrust',
              name: 'Single-leg barbell hip extension',
              rx: '3x8 per side',
              sets: [{ r: '8/side' }, { r: '8/side' }, { r: '8/side' }],
            },
            {
              id: 'copenhagen',
              name: 'Copenhagen hip adduction',
              rx: 'As prescribed in the physio app',
            },
            {
              id: 'leg-press',
              name: 'Leg press',
              rx: '3x12 @ 60 kg',
              sets: [
                { w: 60, r: 12 },
                { w: 60, r: 12 },
                { w: 60, r: 12 },
              ],
            },
            {
              id: 'knee-ext',
              name: 'Knee extension single leg',
              rx: '3x8 @ 14 kg per leg. Machine 90-40° only',
              sets: [
                { w: 14, r: 8 },
                { w: 14, r: 8 },
                { w: 14, r: 8 },
              ],
            },
            {
              id: 'crab-walk',
              name: 'Resisted crab walks',
              rx: '3x12',
              sets: [{ r: 12 }, { r: 12 }, { r: 12 }],
            },
            {
              id: 'skip',
              name: 'Rope skipping',
              rx: '4 x 90 seconds',
              sets: [{ r: '90s' }, { r: '90s' }, { r: '90s' }, { r: '90s' }],
            },
          ],
        },
        {
          id: 'sh-physio',
          title: 'Shoulder physio',
          short: 'shoulder physio',
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
      ],
    },
    {
      day: 'Thu',
      blocks: [
        {
          id: 'flex-run',
          title: '7.5km easy run — flexible: any day Thu 30 Jul - Sun 2 Aug (conversational pace)',
          short: 'flex run',
          priority: 1,
          // Run logged externally in Runna (wk29/wk30 convention). Doing it
          // Thu satisfies the flexible run; if travelling, Move or do it over
          // the weekend and tick here.
          exercises: [],
        },
        {
          id: 'power-clean-tech',
          title: 'Power clean technique (only if not travelling)',
          short: 'power clean',
          priority: 3,
          exercises: [
            {
              id: 'power-clean',
              name: 'Power clean',
              rx: '5x3 @ ~60%, light — focus on bar speed. Skip with reason "travelling" if away',
              sets: [{ r: 3 }, { r: 3 }, { r: 3 }, { r: 3 }, { r: 3 }],
            },
          ],
        },
      ],
    },
    {
      day: 'Fri',
      blocks: [
        {
          id: 'hsw-practice',
          title: 'Handstand walk practice (only if not travelling)',
          short: 'HSW',
          priority: 2,
          exercises: [
            {
              id: 'hsw-walk',
              name: 'Handstand walk',
              rx: '10 min practice. Wall walks and shoulder taps as regressions',
            },
          ],
        },
        {
          id: 'row-run-endurance',
          title: '30 min endurance block (only if not travelling)',
          short: 'row/run 30',
          priority: 2,
          exercises: [
            {
              id: 'row-run-30',
              name: 'Row/run endurance block',
              rx: '30 min continuous: alternate 750m row / 750m run, threshold pacing. Log max total distance',
            },
          ],
        },
      ],
    },
    {
      // Dormant in the current Mon-Fri UI (wk30 convention); documents the
      // flexible-run window through the weekend.
      day: 'Sat',
      blocks: [
        {
          id: 'flex-run-sat',
          title: 'Flex-run window — 7.5km easy run if not yet done (tick the Thu block)',
          short: 'flex run window',
          priority: 1,
          exercises: [],
        },
      ],
    },
    {
      day: 'Sun',
      blocks: [
        {
          id: 'flex-run-sun',
          title: 'Flex-run window (last day) — 7.5km easy run if not yet done (tick the Thu block)',
          short: 'flex run window',
          priority: 1,
          exercises: [],
        },
      ],
    },
  ],
}
