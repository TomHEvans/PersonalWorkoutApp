import { LEGEND_ORDER, TYPE_COLOR, TYPE_LABEL } from '../lib/theme'

export function Legend() {
  return (
    <details className="legend">
      <summary>Legend</summary>
      <div className="legend-items">
        {LEGEND_ORDER.map((t) => (
          <span className="legend-item" key={t}>
            <span className="swatch" style={{ background: TYPE_COLOR[t] }} aria-hidden />
            {TYPE_LABEL[t]}
          </span>
        ))}
      </div>
    </details>
  )
}
