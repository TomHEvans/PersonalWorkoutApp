// Standard resistance / pull-up assistance band colours, ordered light -> heavy.
// Used by the per-set band picker on band-measured exercises. Edit this list to
// match your own band set; `value` is what gets logged, `color` is the swatch.
export interface Band {
  value: string
  label: string
  color: string
}

export const BANDS: Band[] = [
  { value: 'orange', label: 'Orange', color: '#E0863A' },
  { value: 'yellow', label: 'Yellow', color: '#E4B93A' },
  { value: 'red', label: 'Red', color: '#D6453D' },
  { value: 'black', label: 'Black', color: '#181B22' },
  { value: 'purple', label: 'Purple', color: '#7A5AF0' },
  { value: 'green', label: 'Green', color: '#4F9D4A' },
  { value: 'blue', label: 'Blue', color: '#1E90A8' },
  { value: 'grey', label: 'Grey', color: '#8A93A3' },
]

export function bandColor(value: string | undefined): string | null {
  if (!value) return null
  return BANDS.find((b) => b.value === value)?.color ?? null
}
