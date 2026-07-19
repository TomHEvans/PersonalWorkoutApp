import { useState } from 'react'
import type { DayName, Exercise, ExerciseLog, MeasureType, PlanSet, SetLog, WeekLog } from '../types'
import type { PlacedBlock } from '../lib/plans'
import { DAY_NAMES } from '../lib/plans'
import { FREE_MEASURES, SET_MEASURES, allExercises, catalogueEntry, resolveMeasure } from '../catalogue'
import type { CatalogueListing } from '../catalogue'
import { BANDS, bandColor } from '../lib/bands'
import { effectiveSets, estimate1RM, isExerciseDone, sanitizeReps, sanitizeWeight } from '../lib/sets'

// Compact clarity tag next to the exercise name; tapping it opens the adjuster.
const MEASURE_LABEL: Record<MeasureType, string> = {
  weightReps: 'load',
  reps: 'reps',
  band: 'band',
  time: 'time',
  freeText: 'free',
}

// Adjuster labels + the options offered per exercise structure. A set-based
// exercise can be logged as load / reps / band (all use the set rows); a
// non-set exercise as time / note (both use the free-text actual).
const ADJUST_LABEL: Record<MeasureType, string> = {
  weightReps: 'Load',
  reps: 'Reps',
  band: 'Band',
  time: 'Time',
  freeText: 'Note',
}

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

// Per-set band colour picker (band-measured exercises), parallel to the weight
// input. A swatch shows the chosen colour; the native select is thumb-friendly.
function BandSelect({ index, value, onChange }: { index: number; value: string; onChange: (v: string) => void }) {
  const color = bandColor(value)
  return (
    <span className="set-band">
      <span className="band-dot" style={{ background: color ?? 'transparent', borderColor: color ?? 'var(--hair, #e3e7ed)' }} />
      <select aria-label={`Set ${index + 1} band`} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">band</option>
        {BANDS.map((b) => (
          <option key={b.value} value={b.value}>
            {b.label}
          </option>
        ))}
      </select>
    </span>
  )
}

// The programmed values are placeholders only — the inputs start empty, so
// a logged value always comes from typing (pre-loading them as values let
// mobile keyboards append to the default, corrupting weights and reps).
function SetRow({
  index,
  planned,
  set,
  measure,
  onChange,
}: {
  index: number
  planned: PlanSet
  set: SetLog
  measure: MeasureType // weightReps shows kg, band shows a band picker, reps neither
  onChange: (patch: Partial<SetLog>) => void
}) {
  const showWeight = measure === 'weightReps'
  const showBand = measure === 'band'
  return (
    <div className={`set-row${set.done ? ' done' : ''}${showWeight || showBand ? '' : ' no-load'}`}>
      <button
        type="button"
        className={`check set-check${set.done ? ' on' : ''}`}
        aria-label={`Set ${index + 1} ${set.done ? 'not done' : 'done'}`}
        onClick={() => onChange({ done: !set.done })}
      >
        ✓
      </button>
      <span className="set-num">{index + 1}</span>
      {showWeight && (
        <>
          <input
            className="set-w"
            inputMode="decimal"
            placeholder={planned.w != null ? String(planned.w) : 'kg'}
            aria-label={`Set ${index + 1} weight`}
            value={set.w}
            onChange={(e) => onChange({ w: sanitizeWeight(e.target.value) })}
          />
          <span className="set-x">×</span>
        </>
      )}
      {showBand && (
        <>
          <BandSelect index={index} value={set.band ?? ''} onChange={(band) => onChange({ band })} />
          <span className="set-x">×</span>
        </>
      )}
      <input
        className="set-r"
        inputMode="numeric"
        placeholder={planned.r != null ? String(planned.r) : 'reps'}
        aria-label={`Set ${index + 1} reps`}
        value={set.r}
        onChange={(e) => onChange({ r: sanitizeReps(e.target.value) })}
      />
    </div>
  )
}

// Searchable catalogue picker for logging a different exercise than planned.
// Set-based slots only offer movements that can log per-set rows (load/reps/
// band); free-text slots can log anything as an actual, so they offer all.
function SwapPicker({
  exercise,
  entry,
  onPick,
  onReset,
}: {
  exercise: Exercise
  entry: ExerciseLog
  onPick: (id: string) => void
  onReset: () => void
}) {
  const [q, setQ] = useState('')
  const setBased = Boolean(exercise.sets)
  const query = q.trim().toLowerCase()

  const groups: { group: string; items: CatalogueListing[] }[] = []
  for (const item of allExercises()) {
    if (setBased && !item.measures.some((m) => SET_MEASURES.includes(m))) continue
    if (query) {
      const hay = `${item.name} ${item.id} ${(item.aliases ?? []).join(' ')} ${item.group}`.toLowerCase()
      if (!hay.includes(query)) continue
    }
    const last = groups[groups.length - 1]
    if (last && last.group === item.group) last.items.push(item)
    else groups.push({ group: item.group, items: [item] })
  }

  return (
    <div className="swap-picker">
      <input
        className="swap-search"
        placeholder="Search exercises…"
        aria-label="Search exercises"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="swap-list">
        {entry.swap && (
          <button type="button" className="swap-item reset" onClick={onReset}>
            As programmed — {exercise.name}
          </button>
        )}
        {groups.map((g) => (
          <div key={g.group}>
            <div className="swap-group">{g.group}</div>
            {g.items.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`swap-item${entry.swap === item.id ? ' active' : ''}`}
                onClick={() => onPick(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        ))}
        {groups.length === 0 && <div className="swap-empty">No matches</div>}
      </div>
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
  const [adjusting, setAdjusting] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const setBased = Boolean(exercise.sets)
  const sets = effectiveSets(exercise, entry)
  const done = isExerciseDone(exercise, entry)
  const measure = resolveMeasure(exercise, entry) // override > swap default > plan
  const tag = MEASURE_LABEL[measure]
  const options = setBased ? SET_MEASURES : FREE_MEASURES
  const displayName = entry.swap ? (catalogueEntry(entry.swap)?.name ?? entry.swap) : exercise.name

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
          <span className="name-line">
            {displayName}
            <button
              type="button"
              className={`measure-tag ${measure} adjustable${adjusting ? ' open' : ''}`}
              aria-label={`Logged as ${ADJUST_LABEL[measure]} — tap to change`}
              onClick={() => {
                setAdjusting((v) => !v)
                setSwapping(false)
              }}
            >
              {tag} ▾
            </button>
            <button
              type="button"
              className={`swap-btn${swapping ? ' open' : ''}${entry.swap ? ' swapped' : ''}`}
              aria-label="Log a different exercise"
              onClick={() => {
                setSwapping((v) => !v)
                setAdjusting(false)
              }}
            >
              ⇄
            </button>
          </span>
          {entry.swap && <span className="swap-note">was: {exercise.name}</span>}
          <span className="rx">{exercise.rx}</span>
        </div>
      </div>
      {swapping && (
        <SwapPicker
          exercise={exercise}
          entry={entry}
          onPick={(id) => {
            // Adopt the picked exercise; clear the measure override so its
            // catalogue default applies (adjustable again via "Log as").
            onChange({ swap: id, measure: undefined })
            setSwapping(false)
          }}
          onReset={() => {
            onChange({ swap: undefined, measure: undefined })
            setSwapping(false)
          }}
        />
      )}
      {adjusting && (
        <div className="measure-adjust">
          <span className="measure-adjust-label">Log as</span>
          {options.map((opt) => (
            <button
              type="button"
              key={opt}
              className={`adjust-opt${measure === opt ? ' active' : ''}`}
              onClick={() => {
                onChange({ measure: opt })
                setAdjusting(false)
              }}
            >
              {ADJUST_LABEL[opt]}
            </button>
          ))}
          <button
            type="button"
            className={`adjust-opt reset${entry.measure == null ? ' active' : ''}`}
            onClick={() => {
              onChange({ measure: undefined })
              setAdjusting(false)
            }}
          >
            Auto
          </button>
        </div>
      )}
      {setBased && (
        <div className="sets">
          {sets.map((s, i) => (
            <SetRow
              key={i}
              index={i}
              planned={exercise.sets?.[i] ?? {}}
              set={s}
              measure={measure}
              onChange={(patch) => patchSet(i, patch)}
            />
          ))}
          {(() => {
            if (measure !== 'weightReps') return null // stale weights can linger after a type switch
            const e1rm = estimate1RM(sets)
            return e1rm === null ? null : <span className="e1rm">est. 1RM ~{e1rm} kg</span>
          })()}
        </div>
      )}
      <div className="exercise-inputs">
        {!setBased && (
          <input
            className="actual"
            placeholder={measure === 'time' ? 'time (e.g. 2:05/500m)' : 'actual'}
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
