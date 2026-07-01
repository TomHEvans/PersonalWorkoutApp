import type { Progress } from '../lib/progress'

export function ProgressBar({
  progress,
  showCount = false,
  unit = 'sets',
}: {
  progress: Progress
  showCount?: boolean
  unit?: string
}) {
  const { done, total } = progress
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="progress">
      <div
        className="bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
      {showCount && (
        <span className="mono count">
          {done} / {total} {unit}
        </span>
      )}
    </div>
  )
}
