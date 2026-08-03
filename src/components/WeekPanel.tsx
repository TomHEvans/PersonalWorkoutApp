import { useState } from 'react'
import type { WeekLog, WeekPlan } from '../types'
import { buildExport } from '../lib/export'
import { copyText } from '../lib/clipboard'
import { findBlock, findExercise } from '../lib/plans'
import { splitKey } from '../lib/logKeys'
import { catalogueEntry } from '../catalogue'

interface Props {
  plan: WeekPlan
  log: WeekLog
  onQuick: (patch: Partial<Pick<WeekLog, 'maxDU' | 'c2'>>) => void
  onRestore: (blockId: string) => void
  onUnskipExercise: (key: string) => void // log key, exerciseKey(blockId, exerciseId)
}

// The weekly tab: quick fields, what was skipped, and the export preview.
export default function WeekPanel({ plan, log, onQuick, onRestore, onUnskipExercise }: Props) {
  const [copied, setCopied] = useState(false)
  const text = buildExport(plan, log)
  // Data rows only: everything after the header, legend and column line.
  const rows = text.split('\n').filter((l) => l.includes('|') && !l.startsWith('#') && !l.startsWith('day|')).length

  // Exercises skipped on their own. An addition names itself from the
  // catalogue; anything the plan no longer carries falls back to its id
  // rather than vanishing from the list. Exercises inside a block that was
  // itself skipped are left out — the block above them already says it.
  // Keys are blockId::exerciseId, so the block comes off the key rather than
  // off the first plan match — which is what lets a movement programmed on
  // two days report the day it was actually skipped on.
  const skippedBlocks = new Set(log.deferred.map((d) => d.blockId))
  const skippedExercises = Object.entries(log.exercises)
    .filter(([, e]) => e.skipped)
    .map(([key, e]) => {
      const { blockId: keyed, exerciseId } = splitKey(key)
      const added = log.added.find((a) => a.id === exerciseId)
      const found = findExercise(plan, exerciseId)
      const blockId = keyed ?? added?.blockId ?? found?.block.id
      const name = added ? (catalogueEntry(added.exerciseId)?.name ?? added.exerciseId) : found?.exercise.name
      const day = blockId ? findBlock(plan, blockId)?.day : found?.day
      return { key, name: name ?? exerciseId, day, reason: e.skipReason, blockId }
    })
    .filter((e) => !e.blockId || !skippedBlocks.has(e.blockId))

  const copy = async () => {
    if (await copyText(text)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="week-panel">
      <section className="quick">
        <h3>Quick fields</h3>
        <label>
          Max unbroken DU (fresh)
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="e.g. 34"
            value={log.maxDU ?? ''}
            onChange={(e) => onQuick({ maxDU: e.target.value === '' ? null : Number(e.target.value) })}
          />
        </label>
        <label>
          C2 pace / watts
          <input
            placeholder="e.g. 4x6min 2:05/500m"
            value={log.c2}
            onChange={(e) => onQuick({ c2: e.target.value })}
          />
        </label>
      </section>

      <section>
        <h3>Skipped</h3>
        {log.deferred.length === 0 && skippedExercises.length === 0 && <p className="muted">Nothing skipped.</p>}
        {log.deferred.map((d) => (
          <div key={d.blockId} className="deferred-row">
            <div>
              <strong>{findBlock(plan, d.blockId)?.block.title ?? d.blockId}</strong>
              <span className="muted">
                {' '}
                — {d.from}, {d.reason || 'no reason given'}
              </span>
            </div>
            <button type="button" className="btn small" onClick={() => onRestore(d.blockId)}>
              Restore
            </button>
          </div>
        ))}
        {skippedExercises.map((e) => (
          <div key={e.key} className="deferred-row">
            <div>
              <strong>{e.name}</strong>
              <span className="muted">
                {' '}
                — exercise{e.day ? `, ${e.day}` : ''}, {e.reason || 'no reason given'}
              </span>
            </div>
            <button type="button" className="btn small" onClick={() => onUnskipExercise(e.key)}>
              Restore
            </button>
          </div>
        ))}
      </section>

      <section>
        <div className="export-head">
          <h3>Week summary</h3>
          <button type="button" className="btn primary" onClick={copy}>
            {copied ? 'Copied ✓' : 'Copy week summary'}
          </button>
        </div>
        <p className="export-size">
          {rows} set {rows === 1 ? 'row' : 'rows'} · {text.length.toLocaleString()} characters
        </p>
        <pre className="export-preview">{text}</pre>
      </section>
    </div>
  )
}
