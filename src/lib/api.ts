import type { WeekLog } from '../types'
import { normalize } from './log'

// The shared token is entered once in the app and sent on every request as
// the X-App-Token header, checked against the APP_TOKEN Worker var.
const TOKEN_KEY = 'athx-token-v1'
const LEGACY_TOKEN_KEY = 'wt:token' // pre-rewrite key; migrated on first read

export function getToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) return token
    const legacy = localStorage.getItem(LEGACY_TOKEN_KEY)
    if (legacy) {
      localStorage.setItem(TOKEN_KEY, legacy)
      localStorage.removeItem(LEGACY_TOKEN_KEY)
    }
    return legacy
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(method: string, weekId: string, body?: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(`/api/log/${encodeURIComponent(weekId)}`, {
    method,
    headers: {
      'X-App-Token': getToken() ?? '',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new ApiError(`request failed (${res.status})`, res.status)
  const text = await res.text()
  return text ? (JSON.parse(text) as Record<string, unknown>) : {}
}

export async function getLog(weekId: string): Promise<WeekLog | null> {
  const data = await request('GET', weekId)
  return data.log ? normalize(data.log) : null
}

export async function putLog(weekId: string, log: WeekLog): Promise<void> {
  await request('PUT', weekId, { log })
}
