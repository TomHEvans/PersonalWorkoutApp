import { useState, type FocusEvent } from 'react'
import type { DayName, Exercise, ExerciseLog, MeasureType, PlanSet, SetLog, WeekLog } from '../types'
import type { PlacedBlock } from '../lib/plans'
import { DAY_NAMES } from '../lib/plans'
import { FREE_MEASURES, SET_MEASURES, allExercises, catalogueEntry, resolveMeasure } from '../catalogue'
import type { CatalogueListing } from '../catalogue'
import { addedToExercise } from '../lib/added'
import { exerciseKey } from '../lib/logKeys'
import { BANDS, bandColor } from '../lib/bands'
import { coerceReps, coerceWeight, effectiveSets, estimate1RM, isExerciseDone, sanitizeReps, sanitizeWeight } from '../lib/sets'

// Compact clarity tag next to the exercise name; tapping it opens the adjuster.
const MEASURE_LABEL: Record<MeasureType, string> = {
  weightReps: 'load',
  reps: 'reps',
  band: 'band',
  time: 'time',
  cal: 'cal',
  distance: 'dist',
  freeText: 'free',
}

// Adjuster labels + the options offered per exercise structure. A set-based
// exercise logs per-set rows (load / reps / band / time / cal / distance); a
// non-set exercise logs a single actual (time / cal / distance / note).
const ADJUST_LABEL: Record<MeasureType, string> = {
  weightReps: 'Load',
  reps: 'Reps',
  band: 'Band',
  time: 'Time',
  cal: 'Cal',
  distance: 'Dist',
  freeText: 'Note',
}

// Placeholder for the free-text actual, per measurement.
const ACTUAL_PLACEHOLDER: Partial<Record<MeasureType, string>> = {
  time: 'time (e.g. 2:05/500m)',
  cal: 'calories',
  distance: 'distance (e.g. 200m)',
}

interface Props {
  placed: PlacedBlock
  currentDay: DayName
  log: WeekLog
  onExercise: (key: string, patch: Partial<ExerciseLog>) => void // key is exerciseKey(blockId, exerciseId)
  onDefer: (blockId: string, from: DayName, reason: string) => void
  onRestore: (blockId: string) => void
  onMove: (blockId: string, to: DayName | null) => void
  onAddExercise: (blockId: string, exerciseId: string) => void
  onRemoveAdded: (addedId: string) => void
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
// When a field DOES hold a value (typed earlier, or synced back from KV),
// focusing selects it so the first keystroke replaces it — a mobile cursor
// otherwise lands at the end and typing appends ("14" + "7" -> "147").
// Blur coerces the field to a clean number (or empty) before it stays stored.
const selectOnFocus = (e: FocusEvent<HTMLInputElement>) => {
  const el = e.currentTarget
  // rAF: iOS Safari can undo a select() made synchronously inside focus.
  requestAnimationFrame(() => el.select())
}

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
  const showTime = measure === 'time' // time replaces the reps input entirely
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
            onFocus={selectOnFocus}
            onChange={(e) => onChange({ w: sanitizeWeight(e.target.value) })}
            onBlur={() => coerceWeight(set.w) !== set.w && onChange({ w: coerceWeight(set.w) })}
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
      {measure === 'time' && (
        <input
          className="set-t"
          placeholder={planned.r != null ? String(planned.r) : 'mm:ss'}
          aria-label={`Set ${index + 1} time`}
          value={set.t ?? ''}
          onChange={(e) => onChange({ t: e.target.value })}
        />
      )}
      {measure === 'cal' && (
        <input
          className="set-t"
          inputMode="numeric"
          placeholder="cal"
          aria-label={`Set ${index + 1} calories`}
          value={set.cal ?? ''}
          onFocus={selectOnFocus}
          onChange={(e) => onChange({ cal: sanitizeReps(e.target.value) })}
          onBlur={() => coerceReps(set.cal ?? '') !== (set.cal ?? '') && onChange({ cal: coerceReps(set.cal ?? '') })}
        />
      )}
      {measure === 'distance' && (
        <input
          className="set-t"
          placeholder="distance (e.g. 200m)"
          aria-label={`Set ${index + 1} distance`}
          value={set.dist ?? ''}
          onChange={(e) => onChange({ dist: e.target.value })}
        />
      )}
      {!showTime && measure !== 'cal' && measure !== 'distance' && (
        <input
          className="set-r"
          inputMode="numeric"
          placeholder={planned.r != null ? String(planned.r) : 'reps'}
          aria-label={`Set ${index + 1} reps`}
          value={set.r}
          onFocus={selectOnFocus}
          onChange={(e) => onChange({ r: sanitizeReps(e.target.value) })}
          onBlur={() => coerceReps(set.r) !== set.r && onChange({ r: coerceReps(set.r) })}
        />
      )}
    </div>
  )
}

// Searchable catalogue picker used by a block's "+ Add exercise" line. The
// added exercise brings its own structure (set rows per its default measure),
// so every movement is offered.
function CataloguePicker({ onPick }: { onPick: (id: string) => void }) {
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()

  const groups: { group: string; items: CatalogueListing[] }[] = []
  for (const item of allExercises()) {
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
        {groups.map((g) => (
          <div key={g.group}>
            <div className="swap-group">{g.group}</div>
            {g.items.map((item) => (
              <button type="button" key={item.id} className="swap-item" onClick={() => onPick(item.id)}>
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
  onRemove,
}: {
  exercise: Exercise
  entry: ExerciseLog
  onChange: (patch: Partial<ExerciseLog>) => void
  onRemove?: () => void // added-in-session exercises only
}) {
  const [adjusting, setAdjusting] = useState(false)
  const setBased = Boolean(exercise.sets)
  const sets = effectiveSets(exercise, entry)
  const done = isExerciseDone(exercise, entry)
  const measure = resolveMeasure(exercise, entry) // override > swap default > plan
  const tag = MEASURE_LABEL[measure]
  const options = setBased ? SET_MEASURES : FREE_MEASURES
  const displayName = entry.swap ? (catalogueEntry(entry.swap)?.name ?? entry.swap) : exercise.name

  // Skipped: the exercise stays on the day as a placeholder (nothing
  // disappears silently) with its inputs put away. Whatever was logged before
  // the skip is untouched underneath and comes back on Restore. The reason is
  // optional and asked for AFTER the skip — one tap is all it costs mid-session.
  if (entry.skipped) {
    return (
      <div className="exercise skipped">
        <div className="exercise-head">
          <div className="exercise-name">
            <span className="name-line">
              <span className="skipped-name">{displayName}</span>
              <span className="skipped-tag">skipped</span>
            </span>
            <span className="rx">{exercise.rx}</span>
          </div>
        </div>
        <div className="inline-form">
          <input
            placeholder="Reason (optional)"
            value={entry.skipReason ?? ''}
            onChange={(e) => onChange({ skipReason: e.target.value })}
          />
          <button type="button" className="btn small" onClick={() => onChange({ skipped: false })}>
            Restore
          </button>
        </div>
      </div>
    )
  }

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
              onClick={() => setAdjusting((v) => !v)}
            >
              {tag} ▾
            </button>
            <button
              type="button"
              className="skip-btn"
              aria-label={`Skip ${displayName}`}
              onClick={() => onChange({ skipped: true })}
            >
              Skip
            </button>
            {onRemove && (
              <button type="button" className="remove-added" aria-label="Remove added exercise" onClick={onRemove}>
                ✕
              </button>
            )}
          </span>
          {entry.swap && <span className="swap-note">was: {exercise.name}</span>}
          <span className="rx">{exercise.rx}</span>
        </div>
      </div>
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
            placeholder={ACTUAL_PLACEHOLDER[measure] ?? 'actual'}
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

export default function BlockCard({
  placed,
  currentDay,
  log,
  onExercise,
  onDefer,
  onRestore,
  onMove,
  onAddExercise,
  onRemoveAdded,
}: Props) {
  const { block, deferral, movedFrom, homeDay } = placed
  const [moving, setMoving] = useState(false)
  const [adding, setAdding] = useState(false)
  const addedHere = log.added.filter((a) => a.blockId === block.id)

  // Skipping a block and skipping one exercise are the same gesture at two
  // scopes, so they behave identically: one tap to skip, the reason asked for
  // afterwards and editable for as long as it stays skipped, Restore always
  // one tap away. Only the labels differ — "Skip block" against the block
  // title, plain "Skip" on the exercise — so the scope is in the words rather
  // than left to be inferred from where the control sits.
  if (deferral) {
    return (
      <div className={`block p${block.priority} deferred-block`}>
        <div className="block-head">
          <span className={`prio p${block.priority}`}>P{block.priority}</span>
          <h3>{block.title}</h3>
          <span className="skipped-tag">skipped</span>
        </div>
        <div className="inline-form">
          <input
            placeholder="Reason (optional)"
            value={deferral.reason}
            onChange={(e) => onDefer(block.id, deferral.from, e.target.value)}
          />
          <button type="button" className="btn small" onClick={() => onRestore(block.id)}>
            Restore
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`block p${block.priority}`}>
      <div className="block-head">
        <span className={`prio p${block.priority}`}>P{block.priority}</span>
        <h3>{block.title}</h3>
        <div className="block-actions">
          <button type="button" className="btn tiny" onClick={() => setMoving(!moving)}>
            Move
          </button>
          <button type="button" className="btn tiny" onClick={() => onDefer(block.id, currentDay, '')}>
            Skip block
          </button>
        </div>
      </div>
      {movedFrom && <span className="moved-tag">moved from {movedFrom}</span>}

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

      {/* Entries are keyed by block AND exercise, so a movement programmed
          twice in one week logs independently on each day under one id. */}
      {block.exercises.map((ex) => (
        <ExerciseRow
          key={ex.id}
          exercise={ex}
          entry={log.exercises[exerciseKey(block.id, ex.id)] ?? {}}
          onChange={(patch) => onExercise(exerciseKey(block.id, ex.id), patch)}
        />
      ))}
      {addedHere.map((a) => (
        <ExerciseRow
          key={a.id}
          exercise={addedToExercise(a)}
          entry={log.exercises[exerciseKey(block.id, a.id)] ?? {}}
          onChange={(patch) => onExercise(exerciseKey(block.id, a.id), patch)}
          onRemove={() => onRemoveAdded(a.id)}
        />
      ))}
      <button type="button" className="add-line" onClick={() => setAdding((v) => !v)}>
        {adding ? '✕ Cancel' : '+ Add exercise'}
      </button>
      {adding && (
        <CataloguePicker
          onPick={(id) => {
            onAddExercise(block.id, id)
            setAdding(false)
          }}
        />
      )}
    </div>
  )
}
