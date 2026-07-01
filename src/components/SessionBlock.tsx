import type { CSSProperties } from 'react'
import type { Session, SessionLog } from '../types'
import { getKind } from '../kinds/registry'
import { typeColor, typeLabel } from '../lib/theme'

export function SessionBlock({
  session,
  log,
  onChange,
}: {
  session: Session
  log: SessionLog | undefined
  onChange: (next: SessionLog) => void
}) {
  const def = getKind(session.kind)
  const color = typeColor(session.type)
  // Expose the type colour to the CSS (left bar + set-chip fill) via a custom
  // property, plus the left border colour directly.
  const style: CSSProperties = { borderLeftColor: color }
  ;(style as Record<string, string>)['--type'] = color
  return (
    <div className="session" style={style}>
      <div className="session-head">
        <span className="type-label" style={{ color }}>
          {typeLabel(session.type)}
          {session.optional ? ' · optional' : ''}
        </span>
        <span className="session-name">{session.name}</span>
        <span className="mono session-target">{session.target}</span>
      </div>
      {def && log !== undefined ? (
        <def.Component session={session} log={log} onChange={onChange} />
      ) : (
        <p className="unsupported">Unsupported session type: {session.kind}</p>
      )}
    </div>
  )
}
