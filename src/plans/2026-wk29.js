// Week 29: 13-17 July 2026. Wendler C1W2 (3s week: 70/80/90% of TM, 3/3/3+).
//
// State correction: C1W1 is COMPLETE for press, squat and deadlift. The wk28
// squat was NOT capped — the AMRAP was completed Fri 10 July at 107.5 kg x10
// @ RPE 8 (the wk28 plan text said "capped" but the session went to AMRAP).
//
// Training maxes this cycle: press 63, squat 126, deadlift 171 kg.
// Working sets (from TM): press 45/50/57.5, squat 87.5/100/112.5,
// deadlift 120/137.5/155; warm-ups 40/50/60% x5/5/3 as usual.
//
// Running is logged EXTERNALLY in Runna this week, so runs are not app blocks:
//   Mon 1km repeats, 5km total (run only, no gym) | Wed 6km easy |
//   Fri 7km long run. Tue/Thu have no run.
//
// Structure: Tue is the designated impact day (plyo first, fresh, then squat).
// Wed is deliberately the compromised session (OLY 24h after the squat AMRAP,
// priority 3). Thu opens with the C2 FTP test (deferred from wk28) done fresh.
// HSW and the C2 baseline, both deferred from wk28, are scheduled this week.
//
// Cues live in each exercise's rx. Notable ones: squat top set — last cycle
// 107.5x10@8, expect 8-10, stop at RPE 9. Press TM 63 is aggressive (~95% of
// the 66.5 e1RM off 52.5x8); if the top set is under 5 reps, flag it and drop
// press TM to 60 for C2. Deadlift — hook/mixed grip from set 1 (grip was the
// limiter at 145 last cycle). BMU primary fault is the kip push-down: drive it
// through the bar from the shoulders, it is a push not a pull.
//
// ID note: exercises that recurred from prior weeks keep their existing ids so
// KV logs stay queryable across weeks. Bar muscle-up and double unders run
// twice this week; because a log is keyed by exercise id within a week, the
// second session's exercises take a "-2" suffix (c2b-2, du-2, ...) so both
// sessions log independently. New exercises get fresh ids per convention.
export default {
  weekId: '2026-wk29',
  label: '13-17 July',
  wendler: { cycle: 1, week: 2 },
  stages: 'C1W1 complete (press/squat/DL) | BMU s1 (2 sessions) | DU fatigue-resistance | HSW s1 | T2B new | C2 FTP baseline',
  days: [
    {
      day: 'Mon',
      blocks: [
        {
          id: 'run-mon',
          title: 'Run only — no gym',
          short: 'run only',
          priority: 1,
          // Run logged externally in Runna (1km repeats, 5km total). No gym
          // work scheduled: empty exercises, like a rest-day placeholder.
          exercises: [],
        },
      ],
    },
    {
      day: 'Tue',
      blocks: [
        {
          id: 'knee-plyo',
          title: 'Plyometrics (first, fresh, before squat)',
          short: 'plyo',
          priority: 1,
          exercises: [
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
              rx: 'Warm-up 50/62.5/75 kg x5/5/3, then 87.5x3, 100x3, 112.5 kg x3+. Last cycle 107.5x10@8; expect 8-10, stop at RPE 9',
              sets: [
                { w: 87.5, r: 3 },
                { w: 100, r: 3 },
                { w: 112.5, r: '3+' },
              ],
            },
          ],
        },
        {
          id: 'knee-physio-a',
          title: 'Knee physio A',
          short: 'knee physio A',
          priority: 1,
          exercises: [
            {
              id: 'hip-thrust',
              name: 'Single-leg barbell hip thrust',
              rx: '3x8 per side. Add load — last session @7, not at failure',
              sets: [{ r: '8/side' }, { r: '8/side' }, { r: '8/side' }],
            },
            {
              id: 'copenhagen',
              name: 'Copenhagen adduction',
              rx: '3x5 with 5 s holds',
              sets: [{ r: 5 }, { r: 5 }, { r: 5 }],
            },
            {
              id: 'crab-walk',
              name: 'Resisted crab walks',
              rx: '3x12 (version 3)',
              sets: [{ r: 12 }, { r: 12 }, { r: 12 }],
            },
            {
              id: 'skip',
              name: 'Rope skipping',
              rx: '4x1 min',
              sets: [{ r: '1min' }, { r: '1min' }, { r: '1min' }, { r: '1min' }],
            },
          ],
        },
        {
          id: 'bmu',
          title: 'Bar muscle-up (stage 1, session 1 of 2)',
          short: 'BMU s1.1',
          priority: 2,
          exercises: [
            { id: 'c2b', name: 'Strict chest-to-bar pull-up', rx: '4x4', sets: [{ r: 4 }, { r: 4 }, { r: 4 }, { r: 4 }] },
            {
              id: 'kip-pull',
              name: 'Hips-to-bar kip pull',
              rx: '4x5. PRIMARY FAULT: drive the push-down through the bar from the shoulders — aggressive push-down, not a pull',
              sets: [{ r: 5 }, { r: 5 }, { r: 5 }, { r: 5 }],
            },
            {
              id: 'jbmu',
              name: 'Jumping bar MU, 3s negative',
              rx: '4x2. Control the transition — collapse here is mechanical, not strength',
              sets: [{ r: 2 }, { r: 2 }, { r: 2 }, { r: 2 }],
            },
          ],
        },
      ],
    },
    {
      day: 'Wed',
      blocks: [
        {
          id: 'ohs',
          title: 'Overhead squat (shoulder rehab)',
          short: 'OHS',
          priority: 1,
          exercises: [
            {
              id: 'ohs-main',
              name: 'Overhead squat',
              rx: '30 kg, 4x5, RPE 6 MAX. Shoulder rehab, not a loading lift. Set grip width before set 1 and keep it consistent',
              sets: [
                { w: 30, r: 5 },
                { w: 30, r: 5 },
                { w: 30, r: 5 },
                { w: 30, r: 5 },
              ],
            },
          ],
        },
        {
          id: 'cj',
          title: 'Clean and jerk',
          short: 'C&J',
          priority: 3,
          exercises: [
            {
              id: 'cj-main',
              name: 'Clean and jerk',
              rx: '6x2. Start 50 kg, +5 kg/set while form holds. Cap RPE 7, no misses. Compromised session — 24h after squat AMRAP',
              sets: [
                { w: 50, r: 2 },
                { w: 55, r: 2 },
                { w: 60, r: 2 },
                { w: 65, r: 2 },
                { w: 70, r: 2 },
                { w: 75, r: 2 },
              ],
            },
          ],
        },
        {
          id: 'clean-pull',
          title: 'Clean pull',
          short: 'clean pull',
          priority: 3,
          exercises: [
            {
              id: 'clean-pull',
              name: 'Clean pull',
              rx: '3x3 at top C&J weight +10-15%. Drop entirely if legs are flat',
              sets: [{ r: 3 }, { r: 3 }, { r: 3 }],
            },
          ],
        },
        {
          id: 't2b',
          title: 'Toes-to-bar (stage 1)',
          short: 'T2B',
          priority: 2,
          exercises: [
            {
              id: 't2b',
              name: 'Toes-to-bar',
              rx: '6x5, 60s rest',
              sets: [{ r: 5 }, { r: 5 }, { r: 5 }, { r: 5 }, { r: 5 }, { r: 5 }],
            },
          ],
        },
        {
          id: 'du',
          title: 'Double unders (volume)',
          short: 'DU',
          priority: 2,
          exercises: [
            {
              id: 'du',
              name: 'Double unders',
              rx: '5x12 unbroken, 60s rest (60 reps). Fatigue resistance, not max — no max sets',
              sets: [{ r: 12 }, { r: 12 }, { r: 12 }, { r: 12 }, { r: 12 }],
            },
          ],
        },
      ],
    },
    {
      day: 'Thu',
      blocks: [
        {
          id: 'c2',
          title: 'C2 bike threshold test (baseline, first & fresh)',
          short: 'C2 test',
          priority: 2,
          exercises: [
            {
              id: 'c2-test',
              name: 'C2 bike threshold test',
              rx: '15 min warm-up, then 20 min max sustainable effort. Log avg watts + avg HR. Field FTP = 20-min avg watts x 0.95',
            },
          ],
        },
        {
          id: 'press',
          title: '5/3/1 Strict press',
          short: 'press',
          priority: 1,
          wendler: true,
          exercises: [
            {
              id: 'press-main',
              name: 'Strict press',
              rx: 'Warm-up 25/32.5/37.5 kg x5/5/3, then 45x3, 50x3, 57.5 kg x3+. TM 63 aggressive; if top set <5 reps, flag (TM -> 60 for C2). If off after the bike, take a hard 3 and skip the AMRAP',
              sets: [
                { w: 45, r: 3 },
                { w: 50, r: 3 },
                { w: 57.5, r: '3+' },
              ],
            },
          ],
        },
        {
          id: 'bmu-2',
          title: 'Bar muscle-up (stage 1, session 2 of 2)',
          short: 'BMU s1.2',
          priority: 2,
          exercises: [
            {
              id: 'c2b-2',
              name: 'Strict chest-to-bar pull-up',
              rx: '4x4',
              sets: [{ r: 4 }, { r: 4 }, { r: 4 }, { r: 4 }],
            },
            {
              id: 'kip-pull-2',
              name: 'Hips-to-bar kip pull',
              rx: '4x5. PRIMARY FAULT: drive the push-down through the bar from the shoulders — aggressive push-down, not a pull',
              sets: [{ r: 5 }, { r: 5 }, { r: 5 }, { r: 5 }],
            },
            {
              id: 'jbmu-2',
              name: 'Jumping bar MU, 3s negative',
              rx: '4x2. Control the transition — collapse here is mechanical, not strength',
              sets: [{ r: 2 }, { r: 2 }, { r: 2 }, { r: 2 }],
            },
          ],
        },
        {
          id: 'hsw',
          title: 'Handstand walk (stage 1)',
          short: 'HSW',
          priority: 2,
          exercises: [
            {
              id: 'hsw-walk',
              name: 'Handstand walk',
              rx: '8x10m attempts, OR 8x20s wall-facing holds. Full rest between efforts',
              sets: [
                { r: '10m' },
                { r: '10m' },
                { r: '10m' },
                { r: '10m' },
                { r: '10m' },
                { r: '10m' },
                { r: '10m' },
                { r: '10m' },
              ],
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
              rx: '3x8-12, GHjt external rotation on the cable machine',
              sets: [{ r: '8-12' }, { r: '8-12' }, { r: '8-12' }],
            },
            { id: 'scap', name: 'Scapular retraction', rx: '4x5', sets: [{ r: 5 }, { r: 5 }, { r: 5 }, { r: 5 }] },
          ],
        },
      ],
    },
    {
      day: 'Fri',
      blocks: [
        {
          id: 'dl',
          title: '5/3/1 Deadlift',
          short: 'DL',
          priority: 1,
          wendler: true,
          exercises: [
            {
              id: 'dl-main',
              name: 'Deadlift',
              rx: 'Warm-up 70/85/102.5 kg x5/5/3, then 120x3, 137.5x3, 155 kg x3+. HOOK OR MIXED GRIP FROM SET 1 — grip is the limiter, not the posterior chain',
              sets: [
                { w: 120, r: 3 },
                { w: 137.5, r: 3 },
                { w: 155, r: '3+' },
              ],
            },
          ],
        },
        {
          id: 'knee-physio-b',
          title: 'Knee physio B',
          short: 'knee physio B',
          priority: 1,
          exercises: [
            {
              id: 'trx-squat',
              name: 'TRX squat',
              rx: '3x8. Stop the set if pain builds (physio guidance) — log the stop, do not push through',
              sets: [{ r: 8 }, { r: 8 }, { r: 8 }],
            },
            {
              id: 'step-down',
              name: 'Lateral step down heel tap',
              rx: '2x5 per side',
              sets: [{ r: '5/side' }, { r: '5/side' }],
            },
            { id: 'leg-press', name: 'Leg press', rx: '3x12', sets: [{ r: 12 }, { r: 12 }, { r: 12 }] },
            {
              id: 'knee-ext',
              name: 'Knee extension single leg',
              rx: '3x8 @ 14 kg per leg. Machine 90-40°. Single leg only (14 kg is the real load)',
              sets: [
                { w: 14, r: 8 },
                { w: 14, r: 8 },
                { w: 14, r: 8 },
              ],
            },
          ],
        },
        {
          id: 'du-fri',
          title: 'Double unders (volume)',
          short: 'DU',
          priority: 2,
          exercises: [
            {
              id: 'du-2',
              name: 'Double unders',
              rx: '4x10 on 45s (40 reps). Cut to 3 sets if Wed left the shins sore',
              sets: [{ r: 10 }, { r: 10 }, { r: 10 }, { r: 10 }],
            },
          ],
        },
      ],
    },
  ],
}
