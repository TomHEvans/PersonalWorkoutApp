import { useState } from 'react'
import type { Week, WeekLog } from '../types'
import { weekProgress } from '../lib/progress'
import { ProgressBar } from './ProgressBar'
import { Legend } from './Legend'
import type { SyncState } from '../hooks/useWeekLog'

function syncText(s: SyncState): string {
  switch (s) {
    case 'saving':
      return 'Saving…'
    case 'saved':
      return 'Saved'
    case 'offline':
      return 'Offline'
    case 'error':
      return 'Error'
    default:
      return ''
  }
}

export function Header({
  week,
  weeks,
  weekId,
  onWeekChange,
  log,
  sync,
  onCopy,
  onReset,
  onClearPasscode,
}: {
  week: Week
  weeks: Week[]
  weekId: string
  onWeekChange: (id: string) => void
  log: WeekLog
  sync: SyncState
  onCopy: () => void | Promise<void>
  onReset: () => void
  onClearPasscode: () => void
}) {
  const prog = weekProgress(week, log)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await onCopy()
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="eyebrow">HYBRID TRAINING</div>

        <div className="week-row">
          <h1 className="week-label">{week.label}</h1>
          <select
            className="week-switch mono"
            value={weekId}
            onChange={(e) => onWeekChange(e.target.value)}
            aria-label="Switch week"
          >
            {weeks.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </select>
          <span className={`sync sync-${sync}`}>{syncText(sync)}</span>
        </div>

        <div className="mono date-range">{week.dateRange}</div>
        <div className="subtitle">{week.subtitle}</div>

        <div className="header-progress">
          <ProgressBar progress={prog} showCount unit="sets" />
        </div>

        <div className="header-actions">
          <button type="button" className="action" onClick={copy}>
            {copied ? 'Copied!' : 'Copy log'}
          </button>
          <button type="button" className="action" onClick={onReset}>
            Reset week
          </button>
          <button type="button" className="action ghost" onClick={onClearPasscode}>
            Clear passcode
          </button>
        </div>

        <Legend />
      </div>
    </header>
  )
}
