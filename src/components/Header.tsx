import type { SyncStatus, WeekPlan } from '../types'
import { clearToken } from '../lib/api'

const STATUS_LABEL: Record<SyncStatus, string> = {
  synced: 'synced',
  pending: 'saving…',
  offline: 'offline',
  error: 'sync error',
  auth: 'auth',
}

interface Props {
  plan: WeekPlan
  weekIds: string[]
  weekId: string
  onWeek: (weekId: string) => void
  status: SyncStatus
  onRetry: () => void
}

export default function Header({ plan, weekIds, weekId, onWeek, status, onRetry }: Props) {
  const signOut = () => {
    if (window.confirm('Clear the stored app token?')) {
      clearToken()
      window.location.reload()
    }
  }

  return (
    <header className="header">
      <div className="header-title">
        <h1>ATHX</h1>
        {weekIds.length > 1 ? (
          <select value={weekId} onChange={(e) => onWeek(e.target.value)} aria-label="Week">
            {weekIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        ) : (
          <span className="week-label">{plan.label}</span>
        )}
        {plan.wendler && (
          <span className="wendler-tag">
            C{plan.wendler.cycle}W{plan.wendler.week}
          </span>
        )}
      </div>
      <div className="header-right">
        <button
          type="button"
          className={`sync ${status}`}
          onClick={onRetry}
          title={`Sync: ${STATUS_LABEL[status]} — tap to retry`}
        >
          <span className="sync-dot" />
          {STATUS_LABEL[status]}
        </button>
        <button type="button" className="btn tiny" onClick={signOut} aria-label="Clear token">
          ⚙
        </button>
      </div>
    </header>
  )
}
