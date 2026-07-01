import type { Week } from '../types'

// Week 6 — current recovery week.
// Monday is complete, so its sessions are prefilled done with the actual loads
// lifted. The rest of the week is a recovery block with optional runs.
const week: Week = {
  id: '2026-W06',
  label: 'Week 6',
  dateRange: 'Mon 29 Jun to Sun 5 Jul',
  subtitle: 'Recovery week · strength banked Monday · runs optional',
  days: [
    {
      key: 'mon',
      dow: 'Mon',
      date: '29 Jun',
      today: false,
      sessions: [
        { id: 'm-sh-er', type: 'physio', name: 'Cable external rotation', target: '3 x 8-12', kind: 'repSets', sets: 3, prefillDone: true },
        { id: 'm-sh-sc', type: 'physio', name: 'Scapular retraction', target: '4 x 5', kind: 'repSets', sets: 4, prefillDone: true },
        { id: 'm-sh-rem', type: 'physio', name: 'Remaining shoulder block', target: 'as prescribed', kind: 'single', prefillDone: true },
        { id: 'm-trx', type: 'physio', name: 'TRX squat', target: '3 x 8', kind: 'repSets', sets: 3, prefillDone: true },
        { id: 'm-cop', type: 'physio', name: 'Copenhagen adduction', target: '3 x 5 · 5s hold', kind: 'repSets', sets: 3, prefillDone: true },
        { id: 'm-clean', type: 'oly', name: 'Clean', target: '4 x 2-3 · from hang/blocks', kind: 'repSets', sets: 4, prefillDone: true },
        { id: 'm-cpull', type: 'oly', name: 'Clean pull', target: 'above knee', kind: 'single', prefillDone: true },
        {
          id: 'm-press',
          type: 'strength',
          name: 'Strict press',
          target: '5 x 3 · RPE 8',
          kind: 'logSets',
          sets: 5,
          prefillSets: [
            { w: '40', r: '3', done: true },
            { w: '50', r: '3', done: true },
            { w: '50', r: '3', done: true },
            { w: '50', r: '3', done: true },
            { w: '50', r: '3', done: true },
          ],
        },
        {
          id: 'm-dl',
          type: 'strength',
          name: 'Deadlift',
          target: '3 x 5 · RPE 7',
          kind: 'logSets',
          sets: 3,
          prefillSets: [
            { w: '140', r: '5', done: true },
            { w: '140', r: '5', done: true },
            { w: '140', r: '5', done: true },
          ],
        },
        { id: 'm-bike', type: 'cond', name: 'C2 bike finisher', target: '10 min · 5 rounds 30s hard / 90s easy', kind: 'single', optional: true, noteField: true, prefillDone: true },
        { id: 'm-run', type: 'runQuality', name: 'Progressive run', target: '5 km · skipped, strength day instead', kind: 'single', optional: true, noteField: true },
      ],
    },
    {
      key: 'tue',
      dow: 'Tue',
      date: '30 Jun',
      today: false,
      sessions: [
        { id: 't-run', type: 'runEasy', name: 'Easy run', target: '5 km · skipped this week, 1 km shakeout only (6m 18s)', kind: 'single', optional: true, noteField: true },
      ],
    },
    {
      key: 'wed',
      dow: 'Wed',
      date: '1 Jul',
      today: true,
      sessions: [
        { id: 'wed-rest', type: 'rest', name: 'Rest', target: 'no training, work on and legs recovering. Optional 10-20 min walk plus mobility for calves, quads and glutes', kind: 'single', optional: true },
      ],
    },
    {
      key: 'thu',
      dow: 'Thu',
      date: '2 Jul',
      today: false,
      sessions: [
        { id: 'th-mu', type: 'skill', name: 'Muscle-up technique', target: 'up to 8 x 1-2 · full rest · false-grip + transitions', kind: 'repSets', sets: 8 },
        { id: 'th-hsw', type: 'skill', name: 'Handstand-walk practice', target: '10-15 min · wall holds, taps, short walks', kind: 'single' },
        { id: 'th-run', type: 'runEasy', name: 'Optional easy run', target: '5 km easy, or 10-15 min easy C2 bike if legs still sore', kind: 'single', optional: true, noteField: true },
      ],
    },
    {
      key: 'fri',
      dow: 'Fri',
      date: '3 Jul',
      today: false,
      sessions: [
        { id: 'f-run', type: 'runEasy', name: 'Optional easy run', target: '5 km easy, or easy C2 bike', kind: 'single', optional: true, noteField: true },
        { id: 'f-p-legpress', type: 'physio', name: 'Leg press', target: '3 x 12 · easy · only if legs recovered', kind: 'repSets', sets: 3, optional: true },
        { id: 'f-p-hipthrust', type: 'physio', name: 'Single-leg hip thrust (barbell)', target: '3 x 8 · only if legs recovered', kind: 'repSets', sets: 3, optional: true },
        { id: 'f-p-stepdown', type: 'physio', name: 'Lateral step-down, heel tap', target: '2 x 5 each side · only if legs recovered', kind: 'repSets', sets: 2, optional: true },
        { id: 'f-p-kneeext', type: 'physio', name: 'Single-leg knee extension', target: '3 x 8 · 14 kg · only if legs recovered', kind: 'repSets', sets: 3, optional: true },
        { id: 'f-p-crab', type: 'physio', name: 'Resisted crab walks (v3)', target: '3 x 12 · only if legs recovered', kind: 'repSets', sets: 3, optional: true },
      ],
    },
    {
      key: 'sat',
      dow: 'Sat',
      date: '4 Jul',
      today: false,
      sessions: [
        { id: 'sa-rest', type: 'rest', name: 'Rest', target: 'easy walk or mobility if you feel like it', kind: 'single', optional: true },
      ],
    },
    {
      key: 'sun',
      dow: 'Sun',
      date: '5 Jul',
      today: false,
      sessions: [
        { id: 'su-rest', type: 'rest', name: 'Rest', target: 'easy walk or mobility if you feel like it', kind: 'single', optional: true },
      ],
    },
  ],
}

export default week
