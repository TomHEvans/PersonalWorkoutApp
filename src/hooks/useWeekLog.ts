import { useCallback, useEffect, useRef, useState } from 'react'
import type { SessionLog, Week, WeekLog } from '../types'
import { ApiError, getLog, putLog } from '../lib/api'
import { reconcileWeek } from '../lib/reconcile'
import { isDirty, readLocal, setDirty, writeLocal } from '../lib/storage'

export type SyncState = 'idle' | 'saving' | 'saved' | 'offline' | 'error'

export interface UseWeekLog {
  log: WeekLog | null
  sync: SyncState
  update: (sessionId: string, next: SessionLog) => void
  reset: () => void
}

const SAVE_DEBOUNCE_MS = 800

// Owns one week's log: instant local load, background reconcile against the
// server (source of truth), debounced autosave, and offline retry.
export function useWeekLog(week: Week, onAuthError: () => void): UseWeekLog {
  const [log, setLog] = useState<WeekLog | null>(null)
  const [sync, setSync] = useState<SyncState>('idle')

  const weekId = week.id
  // Refs so the debounce/save closures always read the latest values.
  const logRef = useRef<WeekLog | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const authRef = useRef(onAuthError)
  authRef.current = onAuthError

  const flush = useCallback(async () => {
    const current = logRef.current
    if (!current) return
    setSync('saving')
    try {
      await putLog(weekId, current)
      setDirty(weekId, false)
      setSync('saved')
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        authRef.current()
        setSync('error')
        return
      }
      // Offline / server error: keep the dirty flag and retry later.
      setSync('offline')
    }
  }, [weekId])

  const scheduleSave = useCallback(
    (next: WeekLog, immediate = false) => {
      logRef.current = next
      writeLocal(weekId, next)
      setDirty(weekId, true)
      if (timer.current) clearTimeout(timer.current)
      if (immediate) {
        void flush()
        return
      }
      setSync('saving')
      timer.current = setTimeout(() => void flush(), SAVE_DEBOUNCE_MS)
    },
    [weekId, flush],
  )

  // Load + reconcile whenever the selected week changes.
  useEffect(() => {
    let cancelled = false
    if (timer.current) clearTimeout(timer.current)

    // 1) Instant: local mirror (or prefill) reconciled onto the current plan.
    const local = readLocal(weekId)
    const initial = reconcileWeek(week, local)
    logRef.current = initial
    setLog(initial)
    setSync('idle')

    // 2) Background: if we have unsynced local edits, flush them; otherwise
    //    take the server copy as the source of truth and reconcile it in.
    void (async () => {
      if (isDirty(weekId)) {
        await flush()
        return
      }
      try {
        const server = await getLog(weekId)
        if (cancelled) return
        if (server) {
          const merged = reconcileWeek(week, server)
          logRef.current = merged
          setLog(merged)
          writeLocal(weekId, merged)
        }
        setSync('saved')
      } catch (e) {
        if (cancelled) return
        if (e instanceof ApiError && e.status === 401) {
          authRef.current()
          setSync('error')
          return
        }
        setSync('offline')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [weekId, week, flush])

  // Retry a pending save when the connection returns.
  useEffect(() => {
    const onOnline = () => {
      if (isDirty(weekId)) void flush()
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [weekId, flush])

  const update = useCallback(
    (sessionId: string, next: SessionLog) => {
      setLog((prev) => {
        const base = prev ?? logRef.current ?? {}
        const updated: WeekLog = { ...base, [sessionId]: next }
        scheduleSave(updated)
        return updated
      })
    },
    [scheduleSave],
  )

  const reset = useCallback(() => {
    const fresh = reconcileWeek(week, null) // back to prefilled state
    setLog(fresh)
    scheduleSave(fresh, true) // sync immediately so other devices follow
  }, [week, scheduleSave])

  return { log, sync, update, reset }
}
