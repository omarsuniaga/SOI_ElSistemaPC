import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ref = process.argv[2] || 'HEAD'
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
const manifestPath = resolve(root, 'supabase/migrations/REPERTOIRE_R1A_MIGRATION_MANIFEST.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

let failures = 0
for (const migration of manifest.migrations) {
  const path = `supabase/migrations/${migration.filename}`
  const bytes = execFileSync('git', ['show', `${ref}:${path}`])
  const actual = createHash('sha256').update(bytes).digest('hex')
  const pass = actual === migration.sha256
  if (!pass) failures += 1
  console.log(`${migration.order}/10 ${migration.filename} expected=${migration.sha256} actual=${actual} ${pass ? 'PASS' : 'FAIL'}`)
}

if (failures > 0) {
  console.error(`Migration manifest verification failed: ${failures} mismatch(es) for ref ${ref}`)
  process.exitCode = 1
} else {
  console.log(`Migration manifest verification passed: ${manifest.migrations.length}/10 canonical Git hashes for ${ref}`)
}
