import type { DayName, ExerciseLog, WeekLog, WeekPlan } from '../types'
import { blocksForDay } from '../lib/plans'
import BlockCard from './BlockCard'

interface Props {
  plan: WeekPlan
  log: WeekLog
  day: DayName
  onExercise: (exerciseId: string, patch: Partial<ExerciseLog>) => void
  onDefer: (blockId: string, from: DayName, reason: string) => void
  onRestore: (blockId: string) => void
  onMove: (blockId: string, to: DayName | null) => void
  onSessionNote: (day: DayName, note: string) => void
}

export default function DayView({ plan, log, day, onExercise, onDefer, onRestore, onMove, onSessionNote }: Props) {
  const placed = blocksForDay(plan, log, day)

  return (
    <div className="day">
      {placed.length === 0 && <p className="empty-day">Nothing planned yet — the week update fills this in.</p>}
      {placed.map((p) => (
        <BlockCard
          key={p.block.id}
          placed={p}
          currentDay={day}
          log={log}
          onExercise={onExercise}
          onDefer={onDefer}
          onRestore={onRestore}
          onMove={onMove}
        />
      ))}
      <input
        className="session-note"
        placeholder={`Session note for ${day} (e.g. slept badly)`}
        value={log.sessionNotes[day] ?? ''}
        onChange={(e) => onSessionNote(day, e.target.value)}
      />
    </div>
  )
}
