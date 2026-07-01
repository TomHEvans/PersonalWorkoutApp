import type { SessionType } from '../types'

// Session type -> colour (section 5). Kept in one place so the legend,
// session blocks and set chips all stay in sync.
export const TYPE_COLOR: Record<SessionType, string> = {
  strength: '#D6453D',
  oly: '#C2842B',
  runQuality: '#E0863A',
  runEasy: '#4F9D4A',
  runLong: '#7A5AF0',
  physio: '#14958A',
  skill: '#C2479B',
  cond: '#1E90A8',
  rest: '#8A93A3',
}

// Uppercase-ish captions for the type label / legend.
export const TYPE_LABEL: Record<SessionType, string> = {
  strength: 'Strength',
  oly: 'Olympic',
  runQuality: 'Quality run',
  runEasy: 'Easy run',
  runLong: 'Long run',
  physio: 'Physio',
  skill: 'Skill',
  cond: 'Conditioning',
  rest: 'Rest',
}

// Order used by the legend.
export const LEGEND_ORDER: SessionType[] = [
  'strength',
  'oly',
  'runQuality',
  'runEasy',
  'runLong',
  'physio',
  'skill',
  'cond',
  'rest',
]

// Tolerant lookups so an unknown future type never throws.
export function typeColor(type: string): string {
  return (TYPE_COLOR as Record<string, string>)[type] ?? TYPE_COLOR.rest
}

export function typeLabel(type: string): string {
  return (TYPE_LABEL as Record<string, string>)[type] ?? type
}
