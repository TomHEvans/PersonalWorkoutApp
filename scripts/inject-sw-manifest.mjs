// Post-build: inject the hashed asset list + a content-derived cache version
// into dist/sw.js, so the service worker precaches the exact build and a new
// deploy automatically invalidates the old cache. Run after `vite build`.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const swPath = join(dist, 'sw.js')
const assetsDir = join(dist, 'assets')

if (!existsSync(swPath)) {
  console.error('inject-sw-manifest: dist/sw.js not found — run vite build first')
  process.exit(1)
}

const assets = existsSync(assetsDir)
  ? readdirSync(assetsDir)
      .filter((f) => /\.(js|css|woff2?|ttf|otf|svg)$/.test(f))
      .map((f) => `/assets/${f}`)
  : []

const version = createHash('sha256').update(assets.join('|')).digest('hex').slice(0, 10)

let sw = readFileSync(swPath, 'utf8')
sw = sw.replace('[/* INJECT_MANIFEST */]', JSON.stringify(assets))
sw = sw.replace("const VERSION = 'v1'", `const VERSION = 'b_${version}'`)
writeFileSync(swPath, sw)

console.log(`inject-sw-manifest: version b_${version}, ${assets.length} precached assets`)
