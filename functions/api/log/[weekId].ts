/// <reference types="@cloudflare/workers-types" />
import { handleLog, type LogEnv } from '../../../server/logApi'

// Cloudflare Pages Function adapter (kept for Pages-based deploys). The live
// deploy is a Worker (see worker/index.ts); both share server/logApi.ts, so the
// API behaves identically whichever way the project is deployed.
// File-based routing: this serves /api/log/:weekId.
export const onRequest: PagesFunction<LogEnv> = ({ request, env, params }) =>
  handleLog(request, env, String(params.weekId))
