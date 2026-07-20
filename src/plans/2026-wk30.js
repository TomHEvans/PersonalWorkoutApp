// Week 30: 20-26 July 2026. Wendler C1W2 (3s week: 70/80/90% of TM, 3/3/3+).
// TEST WEEK — Sat is a 10km fitness test (not a race). Rolled forward from
// wk29 (renovation week): nothing ran beyond the Mon run, which is logged in
// Runna; the wk29 strength blocks were never done and this module supersedes
// them. C1W1 remains complete for press, squat and deadlift.
//
// Squat and press run at C1W2 this week. The HEAVY deadlift C1W2 working set
// (120/137.5/155x3+) is DEFERRED to wk31 — deadlift now sits one week behind
// squat/press. Wed carries a LIGHT technique/grip pull only; it is NOT the
// C1W2 working set, so its block is deliberately not wendler-flagged (the
// STATE line must not count it toward C1W2). Also deferred to wk31: the C2
// bike threshold baseline test, clean and jerk, and clean pull.
//
// Training maxes this cycle: press 63, squat 126, deadlift 171 kg.
// Working sets (from TM): press 45/50/57.5, squat 87.5/100/112.5;
// warm-ups 40/50/60% of TM x5/5/3, rounded to nearest 2.5 kg.
// Test week: AMRAP top sets stop with 1-2 reps in reserve.
//
// Running is logged EXTERNALLY in Runna (priority 1; runs are not app
// blocks — wk29 convention; run days carry a placeholder block):
//   Tue 5km race pace | Thu 5km easy | Sat 10km TEST, record time + avg
//   pace/HR. Mon and Sun are OFF; Fri is pre-test rest (10-15 min easy
//   mobility / light band shoulder work at most — no legs, no impact).
//
// Structure: Wed is the designated leg/impact day (plyo first, fresh, then
// OHS -> squat C1W2 -> light DL -> loaded knee physio). Tue is skills plus
// light non-impact knee physio around the race-pace run. Thu is press C1W2
// and BMU session 2 after the easy run. BMU stage rule: two turnover-fault-
// free sessions clears to stage 2.
//
// Sat/Sun day entries are data-complete but dormant: the UI tabs and the
// export currently cover Mon-Fri only.
//
// ID note: every exercise this week recurred from wk28/wk29, so every id is
// reused and no new ids are minted (KV logs are queried by exercise id
// across weeks). BMU runs twice; as in wk29 the second session's exercises
// take the "-2" suffix (c2b-2, kip-pull-2, jbmu-2) so both sessions log
// independently.
export default {
  weekId: '2026-wk30',
  label: '20-26 July',
  wendler: { cycle: 1, week: 2 },
  stages:
    'BMU s1 (2 sessions; 2 turnover-fault-free -> s2) | T2B | HSW | DU light optional | Sat 10km test | deferred to wk31: DL C1W2, C2 test, C&J + clean pull',
  notes:
    'C1W2, test week. Rolled from wk29 (renovation week, only Mon run ran). Squat and press at C1W2. Heavy deadlift C1W2 deferred to next week (deadlift now one week behind press/squat); light technique/grip pull only this week. C2 bike test deferred to next week. Clean and jerk / clean pull deferred. No Monday training. Sat is a 10km fitness test, not a race.',
  days: [
    {
      day: 'Mon',
      blocks: [
        {
          id: 'rest-mon',
          title: 'OFF — no training, no run',
          short: 'off',
          priority: 1,
          exercises: [],
        },
      ],
    },
    {
      day: 'Tue',
      blocks: [
        {
          id: 'run-tue',
          title: '5km race pace run (Runna)',
          short: 'run',
          priority: 1,
          // Run logged externally in Runna. Placeholder block only.
          exercises: [],
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
              rx: '4x5. Cue: shoulder push-down through the bar, not an arm pull',
              sets: [{ r: 5 }, { r: 5 }, { r: 5 }, { r: 5 }],
            },
            {
              id: 'jbmu',
              name: 'Jumping bar MU, 3s negative',
              rx: '4x2. Two turnover-fault-free sessions clears to stage 2',
              sets: [{ r: 2 }, { r: 2 }, { r: 2 }, { r: 2 }],
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
          id: 'knee-physio-light',
          title: 'Knee physio (light, non-impact)',
          short: 'knee physio light',
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
            {
              id: 'crab-walk',
              name: 'Resisted crab walks',
              rx: '3x12 (version 3)',
              sets: [{ r: 12 }, { r: 12 }, { r: 12 }],
            },
          ],
        },
      ],
    },
    {
      day: 'Wed',
      blocks: [
        {
          id: 'knee-plyo',
          title: 'Plyometrics (first, fresh)',
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
          id: 'ohs',
          title: 'Overhead squat (shoulder rehab)',
          short: 'OHS',
          priority: 1,
          exercises: [
            {
              id: 'ohs-main',
              name: 'Overhead squat',
              rx: '30 kg, 4x5, RPE 6 MAX. Shoulder rehab, not a loading lift',
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
          id: 'squat',
          title: '5/3/1 Back squat',
          short: 'squat',
          priority: 1,
          wendler: true,
          exercises: [
            {
              id: 'squat-main',
              name: 'Back squat',
              rx: 'Warm-up 50/62.5/75 kg x5/5/3, then 87.5x3, 100x3, 112.5 kg x3+. AMRAP: leave 1-2 in reserve (test week)',
              sets: [
                { w: 87.5, r: 3 },
                { w: 100, r: 3 },
                { w: 112.5, r: '3+' },
              ],
            },
          ],
        },
        {
          // LIGHT technique/grip pull only — NOT the C1W2 working set (that is
          // deferred to wk31), so this block carries no wendler flag.
          id: 'dl',
          title: 'Deadlift — LIGHT technique + grip (not the C1W2 set)',
          short: 'DL light',
          priority: 2,
          exercises: [
            {
              id: 'dl-main',
              name: 'Deadlift',
              rx: '3x3 @ 110-120 kg (~65-70% TM). Set 1 mixed grip, sets 2-3 hook grip, no straps. Grip and bar-path practice before next week’s heavy pull — stop well short of grip failure. RPE 6-7',
              sets: [
                { w: '110-120', r: 3 },
                { w: '110-120', r: 3 },
                { w: '110-120', r: 3 },
              ],
            },
          ],
        },
        {
          id: 'knee-physio-loaded',
          title: 'Knee physio (impact + loaded)',
          short: 'knee physio loaded',
          priority: 1,
          exercises: [
            {
              id: 'skip',
              name: 'Rope skipping',
              rx: '4x1 min',
              sets: [{ r: '1min' }, { r: '1min' }, { r: '1min' }, { r: '1min' }],
            },
            {
              id: 'hip-thrust',
              name: 'Single-leg barbell hip thrust',
              rx: '3x8 per side. Add load',
              sets: [{ r: '8/side' }, { r: '8/side' }, { r: '8/side' }],
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
            {
              id: 'copenhagen',
              name: 'Copenhagen adduction',
              rx: '3x5 with 5 s holds',
              sets: [{ r: 5 }, { r: 5 }, { r: 5 }],
            },
          ],
        },
      ],
    },
    {
      day: 'Thu',
      blocks: [
        {
          id: 'run-thu',
          title: '5km easy run (Runna)',
          short: 'run',
          priority: 1,
          // Run logged externally in Runna. Placeholder block only.
          exercises: [],
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
              rx: 'Warm-up 25/32.5/37.5 kg x5/5/3, then 45x3, 50x3, 57.5 kg x3+. AMRAP: leave 1-2 in reserve. TM 63 aggressive — if the top set is under 5 reps, flag it (TM -> 60 for C2)',
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
              rx: '4x5. Cue: shoulder push-down through the bar, not an arm pull',
              sets: [{ r: 5 }, { r: 5 }, { r: 5 }, { r: 5 }],
            },
            {
              id: 'jbmu-2',
              name: 'Jumping bar MU, 3s negative',
              rx: '4x2. Two turnover-fault-free sessions clears to stage 2',
              sets: [{ r: 2 }, { r: 2 }, { r: 2 }, { r: 2 }],
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
        {
          id: 'du',
          title: 'Double unders (optional, light)',
          short: 'DU',
          priority: 2,
          exercises: [
            {
              id: 'du',
              name: 'Double unders',
              rx: '4x10 short sets. Optional — drop if shins are irritated',
              sets: [{ r: 10 }, { r: 10 }, { r: 10 }, { r: 10 }],
            },
          ],
        },
      ],
    },
    {
      day: 'Fri',
      blocks: [
        {
          id: 'pre-test',
          title: 'Pre-test — rest, or 10-15 min easy mobility + light band shoulder work only. No legs, no impact',
          short: 'pre-test',
          priority: 1,
          exercises: [],
        },
      ],
    },
    {
      // Dormant in the current Mon-Fri UI; kept so the module documents the
      // full 20-26 July week (see header note).
      day: 'Sat',
      blocks: [
        {
          id: 'run-sat',
          title: '10km fitness test (Runna) — record time + avg pace/HR. A test, not a race',
          short: '10km test',
          priority: 1,
          exercises: [],
        },
      ],
    },
    {
      day: 'Sun',
      blocks: [
        {
          id: 'rest-sun',
          title: 'OFF — no training',
          short: 'off',
          priority: 1,
          exercises: [],
        },
      ],
    },
  ],
}
