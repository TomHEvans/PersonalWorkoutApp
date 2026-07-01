/// <reference types="@cloudflare/workers-types" />

// Cloudflare Pages Function handling the log API (section 7).
// File-based routing: this file serves /api/log/:weekId.
//
//   GET    -> { log: {...} | null }
//   PUT    -> body { log: {...} }  ->  { ok: true }
//   DELETE -> { ok: true }
//
// Every request must send header X-App-Token === env.APP_TOKEN, else 401.
// Unhandled methods get an automatic 405 from Pages.

interface Env {
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

function authorized(request: Request, env: Env): boolean {
  const token = request.headers.get('X-App-Token')
  return Boolean(env.APP_TOKEN) && token === env.APP_TOKEN
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!authorized(request, env)) return json({ error: 'unauthorized' }, 401)
  const weekId = String(params.weekId)
  const raw = await env.TRACKER_KV.get(kvKey(weekId))
  return json({ log: raw ? JSON.parse(raw) : null })
}

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!authorized(request, env)) return json({ error: 'unauthorized' }, 401)
  const weekId = String(params.weekId)
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

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!authorized(request, env)) return json({ error: 'unauthorized' }, 401)
  const weekId = String(params.weekId)
  await env.TRACKER_KV.delete(kvKey(weekId))
  return json({ ok: true })
}
