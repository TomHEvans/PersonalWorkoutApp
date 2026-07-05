import { useCallback, useEffect, useRef, useState } from 'react'
import type { SyncStatus, WeekLog } from '../types'
import { ApiError, getLog, putLog } from '../lib/api'
import { emptyLog } from '../lib/log'
import { isDirty, readLocal, setDirty, writeLocal } from '../lib/storage'

const PUT_DEBOUNCE_MS = 1200 // KV allows ~1 write/sec per key

// Local-first week log: every change hits localStorage immediately, then a
// debounced PUT to /api/log/:weekId. On load, GET from KV and merge by
// updatedAt, whole-record last-write-wins (single user, acceptable).
export function useLog(weekId: string) {
  const [log, setLog] = useState<WeekLog>(() => readLocal(weekId) ?? emptyLog())
  const [status, setStatus] = useState<SyncStatus>('pending')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef(log)
  latest.current = log

  const push = useCallback(
    async (snapshot: WeekLog) => {
      try {
        setStatus('pending')
        await putLog(weekId, snapshot)
        // Only mark clean if nothing changed while the PUT was in flight.
        if (latest.current.updatedAt === snapshot.updatedAt) {
          setDirty(weekId, false)
          setStatus('synced')
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) setStatus('auth')
        else setStatus(navigator.onLine === false ? 'offline' : 'error')
      }
    },
    [weekId],
  )

  const schedulePush = useCallback(
    (snapshot: WeekLog) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => push(snapshot), PUT_DEBOUNCE_MS)
    },
    [push],
  )

  const update = useCallback(
    (mutate: (prev: WeekLog) => WeekLog) => {
      setLog((prev) => {
        const next = { ...mutate(prev), updatedAt: Date.now() }
        writeLocal(weekId, next)
        setDirty(weekId, true)
        schedulePush(next)
        return next
      })
    },
    [weekId, schedulePush],
  )

  // Initial sync: adopt the remote copy if it is newer than local; otherwise
  // push local up if it has unconfirmed edits.
  useEffect(() => {
    let cancelled = false
    setLog(readLocal(weekId) ?? emptyLog())
    setStatus('pending')
    ;(async () => {
      try {
        const remote = await getLog(weekId)
        if (cancelled) return
        if (remote && remote.updatedAt > latest.current.updatedAt) {
          setLog(remote)
          writeLocal(weekId, remote)
          setDirty(weekId, false)
          setStatus('synced')
        } else if (latest.current.updatedAt > (remote?.updatedAt ?? 0) && isDirty(weekId)) {
          push(latest.current)
        } else {
          setDirty(weekId, false)
          setStatus('synced')
        }
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) setStatus('auth')
        else setStatus(navigator.onLine === false ? 'offline' : 'error')
      }
    })()
    return () => {
      cancelled = true
      if (timer.current) clearTimeout(timer.current)
    }
  }, [weekId, push])

  // When connectivity returns, flush any unconfirmed local edits.
  useEffect(() => {
    const flush = () => {
      if (isDirty(weekId)) push(latest.current)
    }
    window.addEventListener('online', flush)
    return () => window.removeEventListener('online', flush)
  }, [weekId, push])

  return { log, status, update, retry: () => push(latest.current) }
}
