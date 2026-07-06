import { useState } from 'react'
import type { DayName, Exercise, ExerciseLog, SetLog, WeekLog } from '../types'
import type { PlacedBlock } from '../lib/plans'
import { DAY_NAMES } from '../lib/plans'
import { effectiveSets, isExerciseDone } from '../lib/sets'

interface Props {
  placed: PlacedBlock
  currentDay: DayName
  log: WeekLog
  onExercise: (exerciseId: string, patch: Partial<ExerciseLog>) => void
  onDefer: (blockId: string, from: DayName, reason: string) => void
  onRestore: (blockId: string) => void
  onMove: (blockId: string, to: DayName | null) => void
}

function RpeStepper({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  const dec = () => onChange(value == null ? null : value <= 1 ? null : value - 1)
  const inc = () => onChange(value == null ? 7 : Math.min(10, value + 1))
  return (
    <div className="rpe" aria-label="RPE">
      <button type="button" className="rpe-btn" onClick={dec} disabled={value == null}>
        −
      </button>
      <span className={`rpe-value${value == null ? ' empty' : ''}`}>{value ?? 'RPE'}</span>
      <button type="button" className="rpe-btn" onClick={inc} disabled={value === 10}>
        +
      </button>
    </div>
  )
}

function SetRow({ index, set, onChange }: { index: number; set: SetLog; onChange: (patch: Partial<SetLog>) => void }) {
  return (
    <div className={`set-row${set.done ? ' done' : ''}`}>
      <button
        type="button"
        className={`check set-check${set.done ? ' on' : ''}`}
        aria-label={`Set ${index + 1} ${set.done ? 'not done' : 'done'}`}
        onClick={() => onChange({ done: !set.done })}
      >
        ✓
      </button>
      <span className="set-num">{index + 1}</span>
      <input
        className="set-w"
        inputMode="decimal"
        placeholder="kg"
        aria-label={`Set ${index + 1} weight`}
        value={set.w}
        onChange={(e) => onChange({ w: e.target.value })}
      />
      <span className="set-x">×</span>
      <input
        className="set-r"
        inputMode="numeric"
        placeholder="reps"
        aria-label={`Set ${index + 1} reps`}
        value={set.r}
        onChange={(e) => onChange({ r: e.target.value })}
      />
    </div>
  )
}

function ExerciseRow({
  exercise,
  entry,
  onChange,
}: {
  exercise: Exercise
  entry: ExerciseLog
  onChange: (patch: Partial<ExerciseLog>) => void
}) {
  const setBased = Boolean(exercise.sets)
  const sets = effectiveSets(exercise, entry)
  const done = isExerciseDone(exercise, entry)

  const toggleAll = () => {
    if (setBased) onChange({ sets: sets.map((s) => ({ ...s, done: !done })) })
    else onChange({ done: !entry.done })
  }

  const patchSet = (i: number, patch: Partial<SetLog>) =>
    onChange({ sets: sets.map((s, j) => (j === i ? { ...s, ...patch } : s)) })

  return (
    <div className={`exercise${done ? ' done' : ''}`}>
      <div className="exercise-head">
        <button
          type="button"
          className={`check${done ? ' on' : ''}`}
          aria-label={done ? 'Mark not done' : 'Mark done'}
          onClick={toggleAll}
        >
          ✓
        </button>
        <div className="exercise-name">
          <span>{exercise.name}</span>
          <span className="rx">{exercise.rx}</span>
        </div>
      </div>
      {setBased && (
        <div className="sets">
          {sets.map((s, i) => (
            <SetRow key={i} index={i} set={s} onChange={(patch) => patchSet(i, patch)} />
          ))}
        </div>
      )}
      <div className="exercise-inputs">
        {!setBased && (
          <input
            className="actual"
            placeholder="actual"
            value={entry.actual ?? ''}
            onChange={(e) => onChange({ actual: e.target.value })}
          />
        )}
        <RpeStepper value={entry.rpe ?? null} onChange={(rpe) => onChange({ rpe })} />
        <input
          className="note"
          placeholder="note"
          value={entry.note ?? ''}
          onChange={(e) => onChange({ note: e.target.value })}
        />
      </div>
    </div>
  )
}

export default function BlockCard({ placed, currentDay, log, onExercise, onDefer, onRestore, onMove }: Props) {
  const { block, deferral, movedFrom, homeDay } = placed
  const [deferring, setDeferring] = useState(false)
  const [reason, setReason] = useState('')
  const [moving, setMoving] = useState(false)

  if (deferral) {
    return (
      <div className={`block p${block.priority} deferred-block`}>
        <div className="block-head">
          <span className={`prio p${block.priority}`}>P{block.priority}</span>
          <h3>{block.title}</h3>
        </div>
        <p className="deferred-note">Deferred — {deferral.reason || 'no reason given'}</p>
        <button type="button" className="btn small" onClick={() => onRestore(block.id)}>
          Restore
        </button>
      </div>
    )
  }

  const confirmDefer = () => {
    onDefer(block.id, currentDay, reason.trim())
    setDeferring(false)
    setReason('')
  }

  return (
    <div className={`block p${block.priority}`}>
      <div className="block-head">
        <span className={`prio p${block.priority}`}>P{block.priority}</span>
        <h3>{block.title}</h3>
        <div className="block-actions">
          <button type="button" className="btn tiny" onClick={() => (setMoving(!moving), setDeferring(false))}>
            Move
          </button>
          <button type="button" className="btn tiny" onClick={() => (setDeferring(!deferring), setMoving(false))}>
            Defer
          </button>
        </div>
      </div>
      {movedFrom && <span className="moved-tag">moved from {movedFrom}</span>}

      {deferring && (
        <div className="inline-form">
          <input
            placeholder="Reason (e.g. London trip)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
          />
          <button type="button" className="btn small primary" onClick={confirmDefer}>
            Defer
          </button>
          <button type="button" className="btn small" onClick={() => setDeferring(false)}>
            Cancel
          </button>
        </div>
      )}

      {moving && (
        <div className="inline-form days">
          {DAY_NAMES.filter((d) => d !== currentDay).map((d) => (
            <button
              type="button"
              key={d}
              className="btn small"
              onClick={() => (onMove(block.id, d === homeDay ? null : d), setMoving(false))}
            >
              {d}
            </button>
          ))}
          <button type="button" className="btn small" onClick={() => setMoving(false)}>
            Cancel
          </button>
        </div>
      )}

      {block.exercises.map((ex) => (
        <ExerciseRow
          key={ex.id}
          exercise={ex}
          entry={log.exercises[ex.id] ?? {}}
          onChange={(patch) => onExercise(ex.id, patch)}
        />
      ))}
    </div>
  )
}
