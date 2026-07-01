/// <reference types="@cloudflare/workers-types" />

// Framework-agnostic log API handler, shared by the Worker entry
// (worker/index.ts) and the Pages Function (functions/api/log/[weekId].ts) so
// there is a single source of truth for the API logic (section 7).
//
//   GET    -> { log: {...} | null }
//   PUT    -> body { log: {...} }  ->  { ok: true }
//   DELETE -> { ok: true }
//
// Every request must send header X-App-Token === env.APP_TOKEN, else 401.

export interface LogEnv {
  TRACKER_KV: KVNamespace
  APP_TOKEN: string
}

const kvKey = (weekId: string) => `log:${weekId}`

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function authorized(request: Request, env: LogEnv): boolean {
  const token = request.headers.get('X-App-Token')
  return Boolean(env.APP_TOKEN) && token === env.APP_TOKEN
}

export async function handleLog(request: Request, env: LogEnv, weekId: string): Promise<Response> {
  if (!authorized(request, env)) return json({ error: 'unauthorized' }, 401)
  if (!weekId) return json({ error: 'missing weekId' }, 400)

  switch (request.method) {
    case 'GET': {
      const raw = await env.TRACKER_KV.get(kvKey(weekId))
      return json({ log: raw ? JSON.parse(raw) : null })
    }
    case 'PUT': {
      let body: unknown
      try {
        body = await request.json()
      } catch {
        return json({ error: 'invalid JSON body' }, 400)
      }
      if (!body || typeof body !== 'object' || !('log' in body)) {
        return json({ error: 'missing "log" in body' }, 400)
      }
      await env.TRACKER_KV.put(kvKey(weekId), JSON.stringify((body as { log: unknown }).log))
      return json({ ok: true })
    }
    case 'DELETE': {
      await env.TRACKER_KV.delete(kvKey(weekId))
      return json({ ok: true })
    }
    default:
      return json({ error: `method ${request.method} not allowed` }, 405)
  }
}
