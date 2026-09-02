/**
 * stamp-signage-build.js — escribe public/signage/build.js con la versión actual.
 *
 * Se ejecuta en `npm run prebuild` (antes de `vite build`), así el player que
 * Netlify publica en /signage/ lleva un sello de versión que el overlay de
 * diagnóstico (?debug=1) muestra. La Raspberry lo sobrescribe con su propio
 * sello desde scripts/deploy-signage-pi.sh.
 *
 * Nunca rompe el build: si algo falla, deja un sello con la fecha.
 */
import { writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/signage/build.js')

function sh(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return ''
  }
}

const sha =
  process.env.COMMIT_REF || // Netlify
  process.env.GITHUB_SHA || // GitHub Actions
  sh('git rev-parse HEAD')

const short = sha ? sha.slice(0, 7) : 'nogit'
const branch =
  process.env.BRANCH ||
  process.env.HEAD ||
  sh('git rev-parse --abbrev-ref HEAD') ||
  ''
const at = new Date().toISOString().replace('T', ' ').slice(0, 16) + 'Z'

const ver = branch && branch !== 'HEAD' ? `${short} (${branch})` : short
const body = `/* Sello de versión de la cartelera — generado por scripts/stamp-signage-build.js */\n` +
  `window.SIGNAGE_BUILD = ${JSON.stringify({ ver, at, sha: sha || null })};\n`

writeFileSync(OUT, body)
console.log(`[stamp-signage-build] ${OUT} -> ${ver} @ ${at}`)
