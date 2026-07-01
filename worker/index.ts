/// <reference types="@cloudflare/workers-types" />
import { handleLog, type LogEnv } from '../server/logApi'

// Worker entry point. Cloudflare serves static assets (the built Vite app in
// ./dist) automatically for matching paths; this Worker runs for everything
// else — the log API under /api/log/:weekId, plus an SPA fallback to index.html.
interface Env extends LogEnv {
  ASSETS: Fetcher
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      const match = url.pathname.match(/^\/api\/log\/(.+)$/)
      if (match) return handleLog(request, env, decodeURIComponent(match[1]))
      return new Response(JSON.stringify({ error: 'not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Static asset, or SPA fallback to index.html for unknown paths.
    const res = await env.ASSETS.fetch(request)
    if (res.status === 404) {
      return env.ASSETS.fetch(new Request(new URL('/', request.url), request))
    }
    return res
  },
} satisfies ExportedHandler<Env>
