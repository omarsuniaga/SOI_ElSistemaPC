#!/usr/bin/env node
import { execSync } from 'child_process'

const SOI_ROOT = '/home/omedsunriv/soi'
const EXCLUDE_DIRS = ['99_OBSOLETO', 'node_modules', '.git', '.venv', '__pycache__', 'SOI_QUARANTINE_BACKUP']
// Subdirs that contain policy docs (SOI_ROOT is a symlink; grep -r won't follow it at root)
const POLICY_SUBDIRS = [
  '00_SISTEMA_MAESTRO', '00_MOCS', '00_DASHBOARDS', '00_DOCUMENTACION_INSTITUCIONAL',
  '01_DEPARTAMENTOS', '02_MAPAS_Y_FLUJOS', '04_IMPLEMENTACION_Y_MATRICES',
  '05_SOI_STAGING', '06_IA_AGENTS_LOGIC', '08_TASK_LIST', '09_SOI_Sistema_Operativo_Institucional',
]
const MAX_RESULTS = 8
const DEFAULT_CONTEXT = 6

const args = process.argv.slice(2)

if (!args.length || args[0] === '--help') {
  console.log('Uso: node scripts/read-soi-policy.js "<keyword>" [--context N] [--file filename.md] [--json]')
  process.exit(0)
}

const keyword = args[0]
const ctxIdx = args.indexOf('--context')
const context = ctxIdx !== -1 ? parseInt(args[ctxIdx + 1]) || DEFAULT_CONTEXT : DEFAULT_CONTEXT
const fileIdx = args.indexOf('--file')
const targetFile = fileIdx !== -1 ? args[fileIdx + 1] : null
const jsonMode = args.includes('--json')

const excludeFlags = EXCLUDE_DIRS.map(d => `--exclude-dir="${d}"`).join(' ')

function searchSOI() {
  if (targetFile) {
    const found = execSync(
      `find "${SOI_ROOT}" -name "${targetFile}" -not -path "*/99_OBSOLETO/*" 2>/dev/null`,
      { encoding: 'utf-8' }
    ).trim().split('\n')[0]

    if (!found) {
      console.error(`Archivo no encontrado: ${targetFile}`)
      process.exit(1)
    }
    return execSync(`grep -n -i -C ${context} "${keyword}" "${found}" 2>/dev/null || true`, { encoding: 'utf-8' })
  }

  // SOI_ROOT is a symlink; grep -r won't follow it at root level, so use explicit subdirs
  const subdirs = POLICY_SUBDIRS.map(d => `"${SOI_ROOT}/${d}"`).join(' ')
  return execSync(
    `grep -r -n -i -C ${context} ${excludeFlags} --include="*.md" -m 40 "${keyword}" ${subdirs} 2>/dev/null || true`,
    { encoding: 'utf-8', timeout: 30000, maxBuffer: 5 * 1024 * 1024 }
  )
}

function parseBlocks(raw) {
  const blocks = []
  let current = null

  for (const line of raw.split('\n')) {
    const m = line.match(/^(.+?\.md)([:-])(\d+)[:-](.*)$/)
    if (!m) {
      if (line === '--' && current) { blocks.push(current); current = null }
      continue
    }
    const [, filePath, sep, lineNum, content] = m
    const shortPath = filePath.replace(SOI_ROOT + '/', '')
    if (!current || current.file !== shortPath) {
      if (current) blocks.push(current)
      current = { file: shortPath, lines: [], matches: [] }
    }
    const isMatch = sep === ':'
    current.lines.push({ n: parseInt(lineNum), text: content, match: isMatch })
    if (isMatch) current.matches.push(parseInt(lineNum))
  }
  if (current) blocks.push(current)
  return blocks.slice(0, MAX_RESULTS)
}

try {
  const raw = searchSOI()
  const blocks = parseBlocks(raw)

  if (jsonMode) {
    console.log(JSON.stringify({ keyword, count: blocks.length, results: blocks }, null, 2))
    process.exit(0)
  }

  if (!blocks.length) {
    console.log(`[SOI] Sin resultados para: "${keyword}"`)
    process.exit(0)
  }

  console.log(`[SOI] Busqueda: "${keyword}" -- ${blocks.length} bloque(s) encontrado(s)`)
  console.log('-'.repeat(60))

  for (const block of blocks) {
    console.log(`\nArchivo: ${block.file}  (lineas: ${block.matches.join(', ')})`)
    for (const { n, text, match } of block.lines) {
      const prefix = match ? `L${n} >>> ` : `L${n}     `
      console.log(prefix + text)
    }
  }

  console.log('\n' + '-'.repeat(60))
  console.log(`[SOI] Fin de resultados para: "${keyword}"`)

} catch (err) {
  if (err.status === 1) {
    console.log(`[SOI] Sin resultados para: "${keyword}"`)
  } else {
    console.error('Error:', err.message)
    process.exit(1)
  }
}
