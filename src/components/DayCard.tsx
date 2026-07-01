import { useState } from 'react'
import type { Day, SessionLog, WeekLog } from '../types'
import { dayProgress } from '../lib/progress'
import { ProgressBar } from './ProgressBar'
import { SessionBlock } from './SessionBlock'

export function DayCard({
  day,
  log,
  onChange,
  defaultOpen,
}: {
  day: Day
  log: WeekLog
  onChange: (sessionId: string, next: SessionLog) => void
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const prog = dayProgress(day, log)
  const complete = prog.total > 0 && prog.done === prog.total
  const summary = day.sessions.map((s) => s.name).join(' · ')

  return (
    <section className={`day ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="day-head"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="day-head-top">
          <span className="day-dow">{day.dow}</span>
          <span className="mono day-date">{day.date}</span>
          {day.today && <span className="tag today">Today</span>}
          {complete && <span className="tag done">Done</span>}
          <span className="chevron mono" aria-hidden>
            {open ? '▲' : '▼'}
          </span>
        </div>
        {!open && (
          <div className="day-summary" title={summary}>
            {summary}
          </div>
        )}
        {prog.total > 0 && (
          <div className="day-progress">
            <ProgressBar progress={prog} />
            <span className="mono count small">
              {prog.done}/{prog.total}
            </span>
          </div>
        )}
      </button>
      {open && (
        <div className="day-body">
          {day.sessions.map((s) => (
            <SessionBlock
              key={s.id}
              session={s}
              log={log[s.id]}
              onChange={(next) => onChange(s.id, next)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
