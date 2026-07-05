// Week 28: 6-10 July 2026. Wendler C1W1.
//
// Only Monday is programmed so far; Tue-Fri arrive from the planning chat as
// edits to this file. Reference numbers for programming the remaining days:
// squat 1RM ~140 kg (TM 126), deadlift 1RM ~190 kg (TM 171).
export default {
  weekId: '2026-wk28',
  label: '6-10 July',
  wendler: { cycle: 1, week: 1 },
  stages: 'BMU s1 | DU s1 | HSW s1 | T2B s1',
  days: [
    {
      day: 'Mon',
      blocks: [
        {
          id: 'bmu',
          title: 'Bar muscle-up (stage 1)',
          short: 'BMU',
          priority: 2,
          exercises: [
            { id: 'c2b', name: 'Strict chest-to-bar pull-up', rx: '4x3-5' },
            { id: 'kip-pull', name: 'Hips-to-bar kip pull', rx: '3x5' },
            { id: 'jbmu', name: 'Jumping bar MU, 3s negative', rx: '3x2' },
          ],
        },
        {
          id: 'press',
          title: '5/3/1 Strict press',
          short: 'press',
          priority: 1,
          wendler: true,
          exercises: [
            { id: 'press-main', name: 'Strict press', rx: '40x5, 47.5x5, 52.5x5+ kg' },
          ],
        },
        {
          id: 'sh-physio',
          title: 'Shoulder physio',
          short: 'shoulder physio',
          priority: 1,
          exercises: [
            { id: 'cable-er', name: 'Cable external rotation', rx: '3x8-12' },
            { id: 'scap', name: 'Scapular retraction', rx: '4x5' },
          ],
        },
      ],
    },
    { day: 'Tue', blocks: [] },
    { day: 'Wed', blocks: [] },
    { day: 'Thu', blocks: [] },
    { day: 'Fri', blocks: [] },
  ],
}
