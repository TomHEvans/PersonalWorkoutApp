import { useState } from 'react'
import type { WeekLog, WeekPlan } from '../types'
import { buildExport } from '../lib/export'
import { copyText } from '../lib/clipboard'
import { findBlock } from '../lib/plans'

interface Props {
  plan: WeekPlan
  log: WeekLog
  onQuick: (patch: Partial<Pick<WeekLog, 'maxDU' | 'c2'>>) => void
  onRestore: (blockId: string) => void
}

// The weekly tab: quick fields, the deferred list, and the export preview.
export default function WeekPanel({ plan, log, onQuick, onRestore }: Props) {
  const [copied, setCopied] = useState(false)
  const text = buildExport(plan, log)
  // Data rows only: everything after the header, legend and column line.
  const rows = text.split('\n').filter((l) => l.includes('|') && !l.startsWith('#') && !l.startsWith('day|')).length

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
        {log.deferred.length === 0 && <p className="muted">Nothing skipped.</p>}
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
