import type React from 'react'
import type {
  LogSetRow,
  LogSetsLog,
  RepSetsLog,
  Session,
  SessionLog,
  SingleLog,
} from '../types'

// ---------------------------------------------------------------------------
// Kind registry.
//
// Everything a session "kind" needs lives in one entry here:
//   - init:      build the initial log (applying prefill) on first open
//   - reconcile: adapt a stored log to the *current* plan shape, or fall back
//                to init if the stored value is missing / the wrong shape
//   - units:     progress denominator for the session
//   - doneUnits: progress numerator from the current log
//   - Component: the renderer
//
// Adding a new kind is a single, isolated change: add one entry to KINDS and,
// if it is a new string, widen SessionKind in types.ts.
// ---------------------------------------------------------------------------

export interface KindProps {
  session: Session
  log: SessionLog
  onChange: (next: SessionLog) => void
}

export interface KindDef {
  init(session: Session): SessionLog
  reconcile(session: Session, stored: unknown): SessionLog
  units(session: Session): number
  doneUnits(log: SessionLog): number
  Component: React.FC<KindProps>
}

// ---- logSets: a loaded lift — rows of { weight, reps, done } -----------------

function logRow(session: Session, i: number): LogSetRow {
  const pf = session.prefillSets?.[i]
  return pf
    ? { weight: String(pf.w ?? ''), reps: String(pf.r ?? ''), done: !!pf.done }
    : { weight: '', reps: '', done: false }
}

function logCount(session: Session, stored?: unknown): number {
  if (typeof session.sets === 'number') return session.sets
  if (session.prefillSets) return session.prefillSets.length
  if (Array.isArray(stored)) return stored.length
  return 0
}

const logSets: KindDef = {
  init(session) {
    const n = logCount(session)
    return Array.from({ length: n }, (_, i) => logRow(session, i))
  },
  reconcile(session, stored) {
    const n = logCount(session, stored)
    const arr = Array.isArray(stored) ? stored : []
    const out: LogSetsLog = []
    for (let i = 0; i < n; i++) {
      const s = arr[i] as Partial<LogSetRow> | undefined
      if (s && typeof s === 'object' && 'done' in s) {
        out.push({
          weight: String(s.weight ?? ''),
          reps: String(s.reps ?? ''),
          done: !!s.done,
        })
      } else {
        // A set that exists in the plan but not in the stored log
        // (e.g. sets added mid-week): seed it from prefill.
        out.push(logRow(session, i))
      }
    }
    return out
  },
  units(session) {
    return logCount(session)
  },
  doneUnits(log) {
    return (log as LogSetsLog).filter((r) => r.done).length
  },
  Component: ({ log, onChange }) => {
    const rows = log as LogSetsLog
    const set = (i: number, patch: Partial<LogSetRow>) => {
      onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
    }
    return (
      <div className="rows">
        {rows.map((row, i) => (
          <div className="row" key={i}>
            <button
              type="button"
              className={`chip ${row.done ? 'done' : ''}`}
              aria-pressed={row.done}
              aria-label={`Set ${i + 1} ${row.done ? 'done' : 'not done'}`}
              onClick={() => set(i, { done: !row.done })}
            >
              {i + 1}
            </button>
            <label className="field">
              <span className="field-label">kg</span>
              <input
                className="mono num"
                type="text"
                inputMode="decimal"
                enterKeyHint="next"
                value={row.weight}
                placeholder="–"
                onChange={(e) => set(i, { weight: e.target.value })}
              />
            </label>
            <label className="field">
              <span className="field-label">reps</span>
              <input
                className="mono num"
                type="text"
                inputMode="numeric"
                enterKeyHint="done"
                value={row.reps}
                placeholder="–"
                onChange={(e) => set(i, { reps: e.target.value })}
              />
            </label>
          </div>
        ))}
      </div>
    )
  },
}

// ---- repSets: prescribed reps, no load — numbered done chips ----------------

function repCount(session: Session, stored?: unknown): number {
  if (typeof session.sets === 'number') return session.sets
  if (Array.isArray(stored)) return stored.length
  return 0
}

const repSets: KindDef = {
  init(session) {
    const n = repCount(session)
    return Array.from({ length: n }, () => session.prefillDone === true)
  },
  reconcile(session, stored) {
    const n = repCount(session, stored)
    const arr = Array.isArray(stored) ? stored : []
    const out: RepSetsLog = []
    for (let i = 0; i < n; i++) {
      out.push(typeof arr[i] === 'boolean' ? (arr[i] as boolean) : session.prefillDone === true)
    }
    return out
  },
  units(session) {
    return typeof session.sets === 'number' ? session.sets : 0
  },
  doneUnits(log) {
    return (log as RepSetsLog).filter(Boolean).length
  },
  Component: ({ log, onChange }) => {
    const chips = log as RepSetsLog
    const toggle = (i: number) => onChange(chips.map((c, j) => (j === i ? !c : c)))
    return (
      <div className="chips">
        {chips.map((done, i) => (
          <button
            type="button"
            key={i}
            className={`chip ${done ? 'done' : ''}`}
            aria-pressed={done}
            aria-label={`Set ${i + 1} ${done ? 'done' : 'not done'}`}
            onClick={() => toggle(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    )
  },
}

// ---- single: one toggle, optional notes field ------------------------------

const single: KindDef = {
  init(session) {
    return { done: session.prefillDone === true, value: '' }
  },
  reconcile(session, stored) {
    if (stored && typeof stored === 'object' && !Array.isArray(stored) && 'done' in stored) {
      const s = stored as Partial<SingleLog>
      return { done: !!s.done, value: typeof s.value === 'string' ? s.value : '' }
    }
    return { done: session.prefillDone === true, value: '' }
  },
  units() {
    return 1
  },
  doneUnits(log) {
    return (log as SingleLog).done ? 1 : 0
  },
  Component: ({ session, log, onChange }) => {
    const s = log as SingleLog
    return (
      <div className="single">
        <button
          type="button"
          className={`toggle ${s.done ? 'done' : ''}`}
          aria-pressed={s.done}
          onClick={() => onChange({ ...s, done: !s.done })}
        >
          {s.done ? 'Logged' : 'Mark done'}
        </button>
        {session.noteField && (
          <textarea
            className="mono note"
            rows={2}
            placeholder="Notes…"
            value={s.value ?? ''}
            onChange={(e) => onChange({ ...s, value: e.target.value })}
          />
        )}
      </div>
    )
  },
}

export const KINDS: Record<string, KindDef> = { logSets, repSets, single }

export function getKind(kind: string): KindDef | undefined {
  return KINDS[kind]
}
