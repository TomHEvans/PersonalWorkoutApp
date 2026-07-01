import type { WeekLog } from '../types'

// The passcode is stored once in localStorage and sent on every request as
// the X-App-Token header (section 7).
const TOKEN_KEY = 'wt:token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore private-mode failures */
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
  return (data.log as WeekLog | null) ?? null
}

export async function putLog(weekId: string, log: WeekLog): Promise<void> {
  await request('PUT', weekId, { log })
}

export async function deleteLog(weekId: string): Promise<void> {
  await request('DELETE', weekId)
}
