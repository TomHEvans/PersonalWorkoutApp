// The bottom bar: the app's top-level sections, always reachable with a thumb.
//
// This is where new functionality gets hung off over time. Adding a section is
// two edits: an entry here, and its panel in App's section switch — the day
// tabs, the header and the log layer stay untouched. Keep it to four or five
// entries; past that a bottom bar stops being thumb-sized.
export type SectionId = 'train' | 'week'

interface Section {
  id: SectionId
  label: string
  hint: string // tooltip / accessible description
}

export const SECTIONS: Section[] = [
  { id: 'train', label: 'Train', hint: 'Log a day' },
  { id: 'week', label: 'Week', hint: 'Quick fields, skipped blocks and the week summary' },
]

interface Props {
  section: SectionId
  onSection: (section: SectionId) => void
}

export default function TabBar({ section, onSection }: Props) {
  return (
    <nav className="tabbar" aria-label="Sections">
      <div className="tabbar-inner">
        {SECTIONS.map((s) => (
          <button
            type="button"
            key={s.id}
            className={`tabbar-btn${section === s.id ? ' active' : ''}`}
            aria-current={section === s.id ? 'page' : undefined}
            title={s.hint}
            onClick={() => onSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
