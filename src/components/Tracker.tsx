import { useMemo, useState } from 'react'
import { getWeeks, pickCurrentWeek } from '../plans'
import { useWeekLog } from '../hooks/useWeekLog'
import { Header } from './Header'
import { DayCard } from './DayCard'

export function Tracker({
  onAuthError,
  onClearPasscode,
}: {
  onAuthError: () => void
  onClearPasscode: () => void
}) {
  const weeks = useMemo(() => getWeeks(), [])
  const current = useMemo(() => pickCurrentWeek(weeks), [weeks])
  const [weekId, setWeekId] = useState(current.id)
  const week = useMemo(() => weeks.find((w) => w.id === weekId) ?? current, [weeks, weekId, current])

  const { log, sync, update, reset } = useWeekLog(week, onAuthError)

  const copy = async () => {
    if (!log) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(log, null, 2))
    } catch {
      /* clipboard may be unavailable; ignore */
    }
  }

  const doReset = () => {
    if (window.confirm(`Reset ${week.label}'s log back to its prefilled state? This cannot be undone.`)) {
      reset()
    }
  }

  return (
    <div className="app">
      <Header
        week={week}
        weeks={weeks}
        weekId={weekId}
        onWeekChange={setWeekId}
        log={log ?? {}}
        sync={sync}
        onCopy={copy}
        onReset={doReset}
        onClearPasscode={onClearPasscode}
      />
      <main className="days">
        {log ? (
          week.days.map((day) => (
            <DayCard
              key={`${week.id}-${day.key}`}
              day={day}
              log={log}
              onChange={update}
              defaultOpen={!!day.today}
            />
          ))
        ) : (
          <p className="loading">Loading…</p>
        )}
      </main>
      <footer className="app-footer mono">
        {week.id} · {weeks.length} week{weeks.length === 1 ? '' : 's'} in plan
      </footer>
    </div>
  )
}
