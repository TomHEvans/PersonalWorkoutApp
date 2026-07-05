import { useState } from 'react'
import type { DayName, ExerciseLog, WeekLog } from './types'
import { DAY_NAMES, currentWeekId, getPlan, todayName, weekIds } from './lib/plans'
import { getToken } from './lib/api'
import { useLog } from './hooks/useLog'
import TokenGate from './components/TokenGate'
import Header from './components/Header'
import DayView from './components/DayView'
import WeekPanel from './components/WeekPanel'

type Tab = DayName | 'week'

function Tracker({ onAuthRetry }: { onAuthRetry: () => void }) {
  const [weekId, setWeekId] = useState(currentWeekId)
  const [tab, setTab] = useState<Tab>(() => todayName() ?? 'Mon')
  const plan = getPlan(weekId)
  const { log, status, update, retry } = useLog(weekId)

  if (status === 'auth') return <TokenGate denied onDone={onAuthRetry} />

  const onExercise = (exerciseId: string, patch: Partial<ExerciseLog>) =>
    update((prev) => ({
      ...prev,
      exercises: { ...prev.exercises, [exerciseId]: { ...prev.exercises[exerciseId], ...patch } },
    }))

  const onDefer = (blockId: string, from: DayName, reason: string) =>
    update((prev) => {
      const moves = { ...prev.moves }
      delete moves[blockId]
      return {
        ...prev,
        moves,
        deferred: [...prev.deferred.filter((d) => d.blockId !== blockId), { blockId, from, reason }],
      }
    })

  const onRestore = (blockId: string) =>
    update((prev) => ({ ...prev, deferred: prev.deferred.filter((d) => d.blockId !== blockId) }))

  const onMove = (blockId: string, to: DayName | null) =>
    update((prev) => {
      const moves = { ...prev.moves }
      if (to === null) delete moves[blockId]
      else moves[blockId] = to
      return { ...prev, moves }
    })

  const onSessionNote = (day: DayName, note: string) =>
    update((prev) => ({ ...prev, sessionNotes: { ...prev.sessionNotes, [day]: note } }))

  const onQuick = (patch: Partial<Pick<WeekLog, 'maxDU' | 'c2'>>) => update((prev) => ({ ...prev, ...patch }))

  const today = todayName()

  return (
    <div className="app">
      <Header plan={plan} weekIds={weekIds} weekId={weekId} onWeek={setWeekId} status={status} onRetry={retry} />
      <nav className="tabs">
        {DAY_NAMES.map((d) => (
          <button
            type="button"
            key={d}
            className={`tab${tab === d ? ' active' : ''}${today === d ? ' today' : ''}`}
            onClick={() => setTab(d)}
          >
            {d}
          </button>
        ))}
        <button type="button" className={`tab${tab === 'week' ? ' active' : ''}`} onClick={() => setTab('week')}>
          Week
        </button>
      </nav>
      {tab === 'week' ? (
        <WeekPanel plan={plan} log={log} onQuick={onQuick} onRestore={onRestore} />
      ) : (
        <DayView
          plan={plan}
          log={log}
          day={tab}
          onExercise={onExercise}
          onDefer={onDefer}
          onRestore={onRestore}
          onMove={onMove}
          onSessionNote={onSessionNote}
        />
      )}
    </div>
  )
}

export default function App() {
  // Bumping the epoch remounts Tracker after a token change, re-running the
  // initial sync from scratch.
  const [epoch, setEpoch] = useState(0)
  if (!getToken()) return <TokenGate denied={false} onDone={() => setEpoch((e) => e + 1)} />
  return <Tracker key={epoch} onAuthRetry={() => setEpoch((e) => e + 1)} />
}
