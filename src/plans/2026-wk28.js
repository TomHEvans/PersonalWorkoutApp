// Week 28: 6-10 July 2026. Wendler C1W1 (5s week).
//
// Planner notes: away Thu (full rest) and Sat/Sun. Clean and jerk dropped
// (P3, travel). T2B not scheduled this week; HSW optional Fri.
// Reference maxes: squat 1RM ~140 kg (TM 126), deadlift 1RM ~190 kg (TM 171).
export default {
  weekId: '2026-wk28',
  label: '6-10 July',
  wendler: { cycle: 1, week: 1 },
  stages: 'BMU s1 | DU s1 | HSW s1 | T2B not scheduled',
  days: [
    {
      day: 'Mon',
      blocks: [
        {
          id: 'run-mon',
          title: '7km easy run (Runna)',
          short: 'run',
          priority: 1,
          exercises: [{ id: 'run-easy-1', name: 'Easy run', rx: '7 km' }],
        },
        {
          id: 'bmu',
          title: 'Bar muscle-up (stage 1)',
          short: 'BMU',
          priority: 2,
          exercises: [
            {
              id: 'c2b',
              name: 'Strict chest-to-bar pull-up',
              rx: '4x3-5',
              sets: [{ r: '3-5' }, { r: '3-5' }, { r: '3-5' }, { r: '3-5' }],
            },
            { id: 'kip-pull', name: 'Hips-to-bar kip pull', rx: '3x5', sets: [{ r: 5 }, { r: 5 }, { r: 5 }] },
            { id: 'jbmu', name: 'Jumping bar MU, 3s negative', rx: '3x2', sets: [{ r: 2 }, { r: 2 }, { r: 2 }] },
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
              rx: 'Warm-up 25/32.5/37.5 kg x5/5/3, then 40x5, 47.5x5, 52.5 kg x5+',
              sets: [
                { w: 40, r: 5 },
                { w: 47.5, r: 5 },
                { w: 52.5, r: '5+' },
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
              rx: '3x8-12',
              sets: [{ r: '8-12' }, { r: '8-12' }, { r: '8-12' }],
            },
            { id: 'scap', name: 'Scapular retraction', rx: '4x5', sets: [{ r: 5 }, { r: 5 }, { r: 5 }, { r: 5 }] },
          ],
        },
        {
          id: 'c2',
          title: 'C2 bike threshold (baseline)',
          short: 'C2',
          priority: 2,
          exercises: [
            {
              id: 'c2-intervals',
              name: 'Bike intervals',
              rx: '4x6 min @ RPE 7-8, 2 min easy between. Log avg pace/watts',
            },
          ],
        },
      ],
    },
    {
      day: 'Tue',
      blocks: [
        {
          id: 'run-tue',
          title: '7.5km easy run (Runna)',
          short: 'run',
          priority: 1,
          exercises: [{ id: 'run-easy-2', name: 'Easy run', rx: '7.5 km' }],
        },
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
              rx: 'Warm-up 70/85/102.5 kg x5/5/3, then 110x5, 127.5x5, 145 kg x5+',
              sets: [
                { w: 110, r: 5 },
                { w: 127.5, r: 5 },
                { w: 145, r: '5+' },
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
              rx: '3x8 per side',
              sets: [{ r: '8/side' }, { r: '8/side' }, { r: '8/side' }],
            },
            {
              id: 'copenhagen',
              name: 'Copenhagen adduction',
              rx: '3x5 with 5 s holds',
              sets: [{ r: 5 }, { r: 5 }, { r: 5 }],
            },
            { id: 'crab-walk', name: 'Resisted crab walks', rx: '3x12', sets: [{ r: 12 }, { r: 12 }, { r: 12 }] },
          ],
        },
        {
          id: 'skip-du',
          title: 'Skipping + double unders (stage 1)',
          short: 'skipping/DU',
          priority: 1,
          exercises: [
            {
              id: 'skip',
              name: 'Rope skipping',
              rx: '4x1 min: rd 1 singles, rds 2-4 unbroken DU sets of 20-25',
              sets: [{ r: '1min' }, { r: '1min' }, { r: '1min' }, { r: '1min' }],
            },
            { id: 'max-du', name: 'Max unbroken DU', rx: '1 max set, log the number' },
          ],
        },
      ],
    },
    {
      day: 'Wed',
      blocks: [
        {
          id: 'knee-plyo',
          title: 'Knee plyometrics (first, while fresh)',
          short: 'knee plyo',
          priority: 1,
          exercises: [
            { id: 'dj-two-foot', name: 'Drop jump two-foot land', rx: '2x6', sets: [{ r: 6 }, { r: 6 }] },
            {
              id: 'dj-single',
              name: 'Drop jump single-leg land and hold',
              rx: '3x3',
              sets: [{ r: 3 }, { r: 3 }, { r: 3 }],
            },
            { id: 'line-jumps', name: 'Forward line jumps', rx: '2x10', sets: [{ r: 10 }, { r: 10 }] },
          ],
        },
        {
          id: 'ohs',
          title: 'Overhead squat (snatch sub)',
          short: 'OHS',
          priority: 3,
          exercises: [
            {
              id: 'ohs-main',
              name: 'Overhead squat',
              rx: '3x5 to RPE 6',
              sets: [{ r: 5 }, { r: 5 }, { r: 5 }],
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
              rx: 'Warm-up 50/62.5/75 kg x5/5/3, then 82.5x5, 95x5, 107.5 kg x5+',
              sets: [
                { w: 82.5, r: 5 },
                { w: 95, r: 5 },
                { w: 107.5, r: '5+' },
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
            { id: 'trx-squat', name: 'TRX squat', rx: '3x8', sets: [{ r: 8 }, { r: 8 }, { r: 8 }] },
            {
              id: 'step-down',
              name: 'Lateral step down heel tap',
              rx: '2x5 per side',
              sets: [{ r: '5/side' }, { r: '5/side' }],
            },
            {
              id: 'knee-ext',
              name: 'Knee extension single leg',
              rx: '3x8 @ 14 kg',
              sets: [
                { w: 14, r: 8 },
                { w: 14, r: 8 },
                { w: 14, r: 8 },
              ],
            },
            { id: 'leg-press', name: 'Leg press', rx: '3x12', sets: [{ r: 12 }, { r: 12 }, { r: 12 }] },
          ],
        },
      ],
    },
    {
      day: 'Thu',
      blocks: [{ id: 'rest', title: 'Rest (away)', short: 'rest', priority: 1, exercises: [] }],
    },
    {
      day: 'Fri',
      blocks: [
        {
          id: 'run-long',
          title: '10km progressive long run (Runna)',
          short: 'long run',
          priority: 1,
          exercises: [{ id: 'run-long-1', name: 'Progressive long run', rx: '10 km' }],
        },
        {
          id: 'hsw',
          title: 'Handstand walk (stage 1, optional)',
          short: 'HSW',
          priority: 2,
          exercises: [
            { id: 'wall-walks', name: 'Wall walks', rx: '3x3', sets: [{ r: 3 }, { r: 3 }, { r: 3 }] },
            {
              id: 'shoulder-taps',
              name: 'Wall shoulder taps',
              rx: '3x10',
              sets: [{ r: 10 }, { r: 10 }, { r: 10 }],
            },
          ],
        },
      ],
    },
  ],
}
