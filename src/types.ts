// ---------------------------------------------------------------------------
// The PLAN (bundled from the repo — see section 4 of the brief).
//
// This shape is a *reference, not a hard contract*. Future weeks may add
// fields or new session kinds. The renderer ignores unknown fields rather
// than crashing, and new kinds are added through the registry in
// src/kinds/registry.tsx. The index signature on Session lets a future week
// attach extra fields to a session literal without a type error.
// ---------------------------------------------------------------------------

export type SessionType =
  | 'strength'
  | 'oly'
  | 'runQuality'
  | 'runEasy'
  | 'runLong'
  | 'physio'
  | 'skill'
  | 'cond'
  | 'rest'

export type SessionKind = 'logSets' | 'repSets' | 'single'

export interface PrefillSet {
  w: string
  r: string
  done: boolean
}

export interface Session {
  id: string
  type: SessionType
  name: string
  target: string
  kind: SessionKind
  sets?: number
  optional?: boolean
  noteField?: boolean
  prefillDone?: boolean
  prefillSets?: PrefillSet[]
  // Allow future weeks to add fields without a type error; ignored at runtime.
  [key: string]: unknown
}

export interface Day {
  key: string
  dow: string
  date: string
  today?: boolean
  sessions: Session[]
}

export interface Week {
  id: string
  label: string
  dateRange: string
  subtitle: string
  days: Day[]
}

// ---------------------------------------------------------------------------
// The LOG (stored in Cloudflare KV — see section 7 of the brief).
// Keyed by session id.
// ---------------------------------------------------------------------------

export interface SingleLog {
  done: boolean
  value?: string
}

export type RepSetsLog = boolean[]

export interface LogSetRow {
  weight: string
  reps: string
  done: boolean
}

export type LogSetsLog = LogSetRow[]

export type SessionLog = SingleLog | RepSetsLog | LogSetsLog

export type WeekLog = Record<string, SessionLog>
