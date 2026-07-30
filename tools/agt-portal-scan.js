#!/usr/bin/env node
/**
 * AGT-PORTAL CLI — Escaneo de portales
 * -------------------------------------
 * Uso:
 *   node tools/agt-portal-scan.js                          # scan completo, salida a tools/reports/
 *   node tools/agt-portal-scan.js --dept ACM               # filtra por departamento
 *   node tools/agt-portal-scan.js --json-only              # solo JSON
 *   node tools/agt-portal-scan.js --md-only                # solo Markdown
 *   node tools/agt-portal-scan.js --update-index           # regenera SOI_PORTAL_COVERAGE_INDEX_V9.md
 *   node tools/agt-portal-scan.js --root <path>            # usa otra raíz de portal
 *
 * El script:
 *  1. Escanea 09_SOI_WEB_PORTAL/ con el scanner de AGT-PORTAL
 *  2. Carga el SOI_PROCESS_INDEX (soiProcessIndex.js)
 *  3. Compara y emite findings
 *  4. Escribe:
 *     - tools/reports/agt-portal-report.json
 *     - tools/reports/agt-portal-report.md
 *     - (opcional) 00_SISTEMA_MAESTRO/SOI_PORTAL_COVERAGE_INDEX_V9.md
 *
 * Salida en stdout: resumen del score, conteo por estado, ruta de los archivos.
 */

import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { scanPortal, comparePortalDocs, buildReport, buildMarkdownReport, buildCoverageIndex } from '../src/agents/agt-portal/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

// Resuelve la raíz del proyecto (2 niveles arriba: tools/ -> sistema-academico-pwa/)
const PROJECT_ROOT = path.resolve(__dirname, '..')
// Raíz del portal: la asumimos como la carpeta padre del PWA (09_SOI_WEB_PORTAL)
const PORTAL_ROOT = path.resolve(PROJECT_ROOT, '..')
// Raíz de la documentación: la del workspace SOI
const DOCS_ROOT = path.resolve(PORTAL_ROOT, '..')

function parseArgs(argv) {
  const out = { dept: null, jsonOnly: false, mdOnly: false, updateIndex: false, root: PORTAL_ROOT }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dept') out.dept = argv[++i]
    else if (a === '--json-only') out.jsonOnly = true
    else if (a === '--md-only') out.mdOnly = true
    else if (a === '--update-index') out.updateIndex = true
    else if (a === '--root') out.root = path.resolve(argv[++i])
    else if (a === '--help' || a === '-h') {
      printHelp()
      process.exit(0)
    } else {
      console.error(`Argumento desconocido: ${a}`)
      printHelp()
      process.exit(1)
    }
  }
  return out
}

function printHelp() {
  console.log(`AGT-PORTAL CLI — Escaneo de portales del SOI V9

Uso:
  node tools/agt-portal-scan.js [opciones]

Opciones:
  --dept <DIR|ACM|ADM|FIN|OPR|LOG|COM>   Filtra el reporte por departamento
  --json-only                            Solo escribe el JSON, no el MD
  --md-only                              Solo escribe el MD, no el JSON
  --update-index                         Regenera SOI_PORTAL_COVERAGE_INDEX_V9.md
  --root <path>                          Raíz del portal a escanear
  --help, -h                             Muestra esta ayuda

Salida por defecto:
  tools/reports/agt-portal-report.json
  tools/reports/agt-portal-report.md

Score global = promedio de score por departamento.
`)
}

async function loadProcessIndex() {
  // Cargamos el process index del módulo Hermes
  const modPath = pathToFileURL(path.join(PROJECT_ROOT, 'src/modules/hermes/data/soiProcessIndex.js')).href
  const mod = await import(modPath)
  return mod.SOI_PROCESS_INDEX || []
}

function filterByDept(report, dept) {
  if (!dept) return report
  const filtered = {
    ...report,
    findings: report.findings.filter((f) => f.department === dept),
    coverage: Object.fromEntries(
      Object.entries(report.coverage).filter(([k]) => k === dept),
    ),
  }
  filtered.total_findings = filtered.findings.length
  return filtered
}

async function main() {
  const opts = parseArgs(process.argv)
  console.log(`\u{1F50D} AGT-PORTAL \u2014 escaneando ${opts.root}\n`)

  // 1. Escanear el portal
  const scan = await scanPortal(opts.root, {
    includeDirs: ['portal-maestros', 'portales'],
  })
  console.log(`\u2705 Escaneo completo: ${scan.total_features} features en ${scan.total_files} archivos`)

  // 2. Cargar process index
  const processIndex = await loadProcessIndex()
  console.log(`\u2705 Process index cargado: ${processIndex.length} procesos`)

  // 3. Comparar
  const comparison = comparePortalDocs(scan, { processIndex })
  let report = buildReport(comparison, scan, {
    portal_root: opts.root,
    docs_root: DOCS_ROOT,
  })

  // 4. Filtrar por depto si aplica
  if (opts.dept) {
    report = filterByDept(report, opts.dept)
    console.log(`\u{1F50E} Filtrado por departamento: ${opts.dept}`)
  }

  // 5. Resumen en stdout
  console.log('')
  console.log('='.repeat(60))
  console.log(`Score global: ${(report.score_global * 100).toFixed(1)}%`)
  console.log(`Hallazgos: ${report.total_findings}`)
  for (const [state, count] of Object.entries(countByState(report.findings))) {
    console.log(`  ${state.padEnd(22)} ${count}`)
  }
  console.log('='.repeat(60))
  console.log('')

  // 6. Escribir artefactos
  const reportsDir = path.join(PROJECT_ROOT, 'tools', 'reports')
  fs.mkdirSync(reportsDir, { recursive: true })

  if (!opts.mdOnly) {
    const jsonPath = path.join(reportsDir, 'agt-portal-report.json')
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8')
    console.log(`\ud83d\udcdd JSON: ${jsonPath}`)
  }
  if (!opts.jsonOnly) {
    const mdPath = path.join(reportsDir, 'agt-portal-report.md')
    fs.writeFileSync(mdPath, buildMarkdownReport(report), 'utf8')
    console.log(`\ud83d\udcdd MD:   ${mdPath}`)
  }

  if (opts.updateIndex) {
    const indexPath = path.join(DOCS_ROOT, '00_SISTEMA_MAESTRO', 'SOI_PORTAL_COVERAGE_INDEX_V9.md')
    const portalByDept = {}
    if (scan.departments) {
      for (const [d, fs_] of Object.entries(scan.departments)) {
        portalByDept[d] = fs_.length
      }
    }
    const md = buildCoverageIndex(report, { portalByDept })
    fs.writeFileSync(indexPath, md, 'utf8')
    console.log(`\ud83d\udd04 \u00cdndice de cobertura actualizado: ${indexPath}`)
  }
}

function countByState(findings) {
  const out = { aligned: 0, portal_exceeds_doc: 0, doc_exceeds_portal: 0, drift: 0, legacy: 0 }
  for (const f of findings) out[f.state] = (out[f.state] || 0) + 1
  return out
}

main().catch((err) => {
  console.error('\u274c AGT-PORTAL fall\u00f3:')
  console.error(err)
  process.exit(1)
})
