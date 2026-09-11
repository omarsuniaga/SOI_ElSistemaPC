#!/usr/bin/env node
/**
 * check-structural-policy.mjs — Trinquete de la Política Estructural.
 *
 * Ver docs/POLITICA_DE_DESARROLLO.md. Verifica mecánicamente las dos reglas que
 * SÍ son automatizables; el resto vive en la revisión de PR.
 *
 *   R1 · Toda tabla nace con escritor
 *        Una tabla creada en una migración y jamás referenciada desde `src/`
 *        es "huérfana". El repo arrastra deuda, así que la regla NO es
 *        "cero huérfanas" sino "no más huérfanas que el baseline".
 *
 *   R3 · Multi-institución desde el día uno
 *        Toda tabla de dominio nueva declara `institucion_id`, o una exención
 *        explícita en la migración:
 *            -- policy:exento-institucion_id razón: <por qué>
 *
 * Uso:
 *   node scripts/check-structural-policy.mjs              # verifica
 *   node scripts/check-structural-policy.mjs --record     # regraba el baseline
 *   node scripts/check-structural-policy.mjs --list       # lista las huérfanas
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MIGRATIONS = join(ROOT, 'supabase', 'migrations')
const SRC = join(ROOT, 'src')
const BASELINE = join(ROOT, 'scripts', '.structural-baseline.json')

const CODE_EXT = new Set(['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.json', '.vue', '.svelte'])

/** Tablas de infraestructura que no son dominio: no exigen institucion_id. */
const INFRA_PREFIXES = ['sim_', 'telegram_', 'whatsapp_', 'push_', 'schedule_run', 'document_batch']
const INFRA_EXACT = new Set([
  'instituciones', 'profiles', 'app_users', 'system_config', 'catalogos',
  'portal_catalog', 'modulos', 'soi_eventos', 'soi_event_bus',
])

const args = new Set(process.argv.slice(2))
const MODE = args.has('--record') ? 'record' : args.has('--list') ? 'list' : 'check'

// ── 1. Tablas creadas (y no borradas) en las migraciones ─────────────────────

function collectMigrationTables() {
  if (!existsSync(MIGRATIONS)) return { created: new Map(), dropped: new Set() }

  const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort()
  const created = new Map() // tabla -> { file, body }
  const dropped = new Set()

  const reCreate = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?([a-z_][a-z0-9_]*)"?\s*\(/gi
  const reDrop = /drop\s+table\s+(?:if\s+exists\s+)?(?:public\.)?"?([a-z_][a-z0-9_]*)"?/gi

  for (const file of files) {
    // schema_reference.sql es un dump de referencia, no una migración aplicada.
    if (file === 'schema_reference.sql') continue
    const sql = readFileSync(join(MIGRATIONS, file), 'utf8')

    for (const m of sql.matchAll(reCreate)) {
      const name = m[1].toLowerCase()
      // Cuerpo del CREATE TABLE: desde el paréntesis hasta el ');' que lo cierra.
      const from = m.index + m[0].length
      const end = sql.indexOf(');', from)
      const body = sql.slice(from, end === -1 ? from + 2000 : end)
      created.set(name, { file, body, stmt: m[0] })
    }
    for (const m of sql.matchAll(reDrop)) dropped.add(m[1].toLowerCase())
  }

  for (const t of dropped) created.delete(t)
  return { created, dropped }
}

// ── 2. Identificadores citados en el código fuente ───────────────────────────

function collectSourceLiterals() {
  const found = new Set()
  const reLiteral = /['"`]([a-z_][a-z0-9_]{2,})['"`]/g

  const walk = (dir) => {
    let entries
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue
      const full = join(dir, entry)
      let st
      try {
        st = statSync(full)
      } catch {
        continue
      }
      if (st.isDirectory()) {
        walk(full)
      } else if (CODE_EXT.has(extname(entry))) {
        const text = readFileSync(full, 'utf8')
        for (const m of text.matchAll(reLiteral)) found.add(m[1].toLowerCase())
      }
    }
  }

  walk(SRC)
  return found
}

// ── 3. Reglas ────────────────────────────────────────────────────────────────

const isInfra = (t) =>
  INFRA_EXACT.has(t) || INFRA_PREFIXES.some((p) => t.startsWith(p))

function needsInstitucionId(name, entry) {
  if (isInfra(name)) return false
  if (/policy:exento-institucion_id/i.test(entry.body)) return false
  return !/\binstitucion_id\b/i.test(entry.body)
}

// ── 4. Ejecución ─────────────────────────────────────────────────────────────

const { created } = collectMigrationTables()
const literals = collectSourceLiterals()

const orphans = [...created.keys()].filter((t) => !literals.has(t)).sort()
const missingTenant = [...created.entries()]
  .filter(([name, entry]) => needsInstitucionId(name, entry))
  .map(([name]) => name)
  .sort()

if (MODE === 'list') {
  console.log(`Tablas creadas en migraciones: ${created.size}`)
  console.log(`\nHuérfanas (${orphans.length}) — creadas y nunca referenciadas desde src/:`)
  for (const t of orphans) console.log(`  ${t.padEnd(42)} ${created.get(t).file}`)
  console.log(`\nSin institucion_id (${missingTenant.length}):`)
  for (const t of missingTenant) console.log(`  ${t.padEnd(42)} ${created.get(t).file}`)
  process.exit(0)
}

if (MODE === 'record') {
  const baseline = {
    recorded_at: new Date().toISOString().slice(0, 10),
    note: 'Deuda estructural conocida. El gate falla si estos números CRECEN. Ver docs/POLITICA_DE_DESARROLLO.md',
    orphan_tables: orphans,
    tables_without_institucion_id: missingTenant,
  }
  writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + '\n')
  console.log(
    `Baseline grabado en scripts/.structural-baseline.json\n` +
      `  huérfanas: ${orphans.length}\n` +
      `  sin institucion_id: ${missingTenant.length}\n` +
      `Revisá y commiteá.`,
  )
  process.exit(0)
}

// ── check ────────────────────────────────────────────────────────────────────

if (!existsSync(BASELINE)) {
  console.error(
    'x No existe scripts/.structural-baseline.json.\n' +
      '  Corré: node scripts/check-structural-policy.mjs --record',
  )
  process.exit(1)
}

const base = JSON.parse(readFileSync(BASELINE, 'utf8'))
const baseOrphans = new Set(base.orphan_tables ?? [])
const baseTenant = new Set(base.tables_without_institucion_id ?? [])

const newOrphans = orphans.filter((t) => !baseOrphans.has(t))
const newTenant = missingTenant.filter((t) => !baseTenant.has(t))
const fixedOrphans = [...baseOrphans].filter((t) => !orphans.includes(t))

let fail = false

console.log('\n\x1b[1m▶ Política Estructural (docs/POLITICA_DE_DESARROLLO.md)\x1b[0m')

if (newOrphans.length) {
  fail = true
  console.log('\n  \x1b[31mx R1 · Tabla nueva sin escritor\x1b[0m')
  for (const t of newOrphans) {
    console.log(`      ${t}  (${created.get(t).file})`)
  }
  console.log(
    '\n      Toda tabla nace con el código que la escribe, en el MISMO PR.\n' +
      '      Si el escritor llega después, la tabla llega después.',
  )
} else {
  console.log(`  \x1b[32m✔ R1 · sin tablas huérfanas nuevas (${orphans.length} en baseline)\x1b[0m`)
}

if (newTenant.length) {
  fail = true
  console.log('\n  \x1b[31mx R3 · Tabla de dominio nueva sin institucion_id\x1b[0m')
  for (const t of newTenant) {
    console.log(`      ${t}  (${created.get(t).file})`)
  }
  console.log(
    '\n      Agregá institucion_id, o declaralo exento en la migración:\n' +
      '        -- policy:exento-institucion_id razón: <por qué>',
  )
} else {
  console.log(
    `  \x1b[32m✔ R3 · sin tablas nuevas sin institucion_id (${missingTenant.length} en baseline)\x1b[0m`,
  )
}

if (fixedOrphans.length) {
  console.log(
    `\n  \x1b[36m↓ ${fixedOrphans.length} huérfana(s) del baseline ya tienen escritor: ` +
      `${fixedOrphans.slice(0, 6).join(', ')}${fixedOrphans.length > 6 ? '…' : ''}\x1b[0m\n` +
      '      Regrabá el baseline para que el trinquete no retroceda:\n' +
      '        node scripts/check-structural-policy.mjs --record',
  )
}

process.exit(fail ? 1 : 0)
