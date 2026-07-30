/**
 * AGT-PORTAL — Reporter
 * ---------------------
 * Genera los tres artefactos de salida del agente:
 *  1. buildReport()           -> JSON estructurado (para MCP, CI, dashboards)
 *  2. buildMarkdownReport()   -> MD legible para Hermes/humanos
 *  3. buildCoverageIndex()    -> regenera SOI_PORTAL_COVERAGE_INDEX_V9.md
 *                                 a partir de los hallazgos reales
 *
 * Ninguno toca el filesystem. El caller decide dónde escribir.
 */

import { COVERAGE_STATES, DEPARTMENTS, AGENT_CODE, PORTAL_CONTRACT_VERSION } from './contract.js'

const STATE_ICONS = {
  [COVERAGE_STATES.ALIGNED]: '\u2705',
  [COVERAGE_STATES.PORTAL_EXCEEDS_DOC]: '\ud83d\udcdd',     // 📝
  [COVERAGE_STATES.DOC_EXCEEDS_PORTAL]: '\ud83d\ude80',     // 🚀
  [COVERAGE_STATES.DRIFT]: '\u26a0\ufe0f',                  // ⚠️
  [COVERAGE_STATES.LEGACY]: '\ud83d\uddd1\ufe0f',           // 🗑️
}

const STATE_LABELS = {
  [COVERAGE_STATES.ALIGNED]: 'Cubierto',
  [COVERAGE_STATES.PORTAL_EXCEEDS_DOC]: 'Portal excede doc',
  [COVERAGE_STATES.DOC_EXCEEDS_PORTAL]: 'Doc excede portal',
  [COVERAGE_STATES.DRIFT]: 'Drift',
  [COVERAGE_STATES.LEGACY]: 'Legacy',
}

export function buildReport(comparison, scanResult = null, meta = {}) {
  return {
    agent: AGENT_CODE,
    contract_version: PORTAL_CONTRACT_VERSION,
    generated_at: comparison.generated_at || new Date().toISOString(),
    score_global: comparison.score_global,
    total_findings: comparison.total_findings,
    coverage: comparison.coverage,
    findings: comparison.findings,
    scan_summary: scanResult
      ? {
          root: scanResult.root,
          scanned_at: scanResult.scanned_at,
          total_files: scanResult.total_files,
          total_features: scanResult.total_features,
          features_by_department: Object.fromEntries(
            Object.entries(scanResult.departments || {}).map(([k, v]) => [k, v.length]),
          ),
        }
      : null,
    meta,
  }
}

export function buildMarkdownReport(report) {
  const lines = []
  lines.push(`# Reporte AGT-PORTAL — ${report.generated_at}`)
  lines.push('')
  lines.push(`**Score global de cobertura:** ${(report.score_global * 100).toFixed(1)}%`)
  lines.push(`**Total hallazgos:** ${report.total_findings}`)
  lines.push('')

  if (report.scan_summary) {
    lines.push('## \ud83d\udd0d Resumen del escaneo')
    lines.push('')
    lines.push(`- Ra\u00edz: \`${report.scan_summary.root}\``)
    lines.push(`- Archivos escaneados: ${report.scan_summary.total_files}`)
    lines.push(`- Features detectadas: ${report.scan_summary.total_features}`)
    lines.push('')
    lines.push('### Por departamento')
    lines.push('')
    lines.push('| Departamento | Features |')
    lines.push('|---|---:|')
    for (const [dept, count] of Object.entries(report.scan_summary.features_by_department)) {
      lines.push(`| ${dept} | ${count} |`)
    }
    lines.push('')
  }

  lines.push('## \ud83c\udfaf Cobertura por departamento')
  lines.push('')
  lines.push('| Departamento | Total | \u2705 Cubierto | \ud83d\udcdd Portal>Doc | \ud83d\ude80 Doc>Portal | \u26a0\ufe0f Drift | Score |')
  lines.push('|---|---:|---:|---:|---:|---:|---:|')
  for (const dept of DEPARTMENTS) {
    const c = report.coverage[dept]
    if (!c || c.total_findings === 0) continue
    lines.push(
      `| ${dept} | ${c.total_findings} | ${c.aligned} | ${c.portal_exceeds_doc} | ${c.doc_exceeds_portal} | ${c.drift} | ${(c.score * 100).toFixed(1)}% |`,
    )
  }
  lines.push('')

  // Hallazgos por estado
  const byState = {}
  for (const f of report.findings) {
    byState[f.state] = byState[f.state] || []
    byState[f.state].push(f)
  }

  for (const state of [
    COVERAGE_STATES.PORTAL_EXCEEDS_DOC,
    COVERAGE_STATES.DOC_EXCEEDS_PORTAL,
    COVERAGE_STATES.DRIFT,
    COVERAGE_STATES.ALIGNED,
  ]) {
    const list = byState[state] || []
    if (!list.length) continue
    lines.push(`## ${STATE_ICONS[state]} ${STATE_LABELS[state]} (${list.length})`)
    lines.push('')
    for (const f of list.slice(0, 50)) {
      const what =
        f.side === 'portal'
          ? `\`${f.feature_path}\` (${f.feature_kind}, ${f.feature_lines} l\u00edneas)`
          : `\`${f.related_doc}\``
      lines.push(`- **${f.department}** \u2014 ${what} \u2014 score=${f.match_score}`)
      lines.push(`  - Remediaci\u00f3n: ${f.remediation.action} -> ${f.remediation.target}`)
      lines.push(`  - ${f.remediation.message}`)
    }
    if (list.length > 50) {
      lines.push(`- _... y ${list.length - 50} m\u00e1s hallazgos_`)
    }
    lines.push('')
  }

  lines.push('## \ud83d\udcdd Notas')
  lines.push('')
  lines.push(`- Agente: \`${AGENT_CODE}\` v${PORTAL_CONTRACT_VERSION}`)
  lines.push(`- Generado: ${report.generated_at}`)
  lines.push(`- Score global = promedio de score por depto (no incluye deptos sin findings).`)

  return lines.join('\n')
}

/**
 * Regenera el \u00edndice de cobertura SOI_PORTAL_COVERAGE_INDEX_V9.md
 * con datos reales. Mantiene el frontmatter y la secci\u00f3n "Cobertura m\u00ednima"
 * que el spec promete, pero la hidrata con el estado actual.
 */
export function buildCoverageIndex(report, options = {}) {
  const portalByDept = options.portalByDept || {}
  const today = new Date().toISOString().slice(0, 10)
  const reviewDue = new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().slice(0, 10)

  const lines = []
  lines.push('---')
  lines.push('doc_id: "SIS-PORTAL-INDEX"')
  lines.push('doc_type: "indice"')
  lines.push('version: "V9"')
  lines.push('status: "vigente"')
  lines.push('department: "SIS"')
  lines.push('owner: "Arquitecto SOI"')
  lines.push('created_at: "2026-06-29"')
  lines.push(`last_reviewed: "${today}"`)
  lines.push(`next_review_due: "${reviewDue}"`)
  lines.push('review_cycle_days: 180')
  lines.push('canonical_path: "00_SISTEMA_MAESTRO/SOI_PORTAL_COVERAGE_INDEX_V9.md"')
  lines.push('supersedes: null')
  lines.push('superseded_by: null')
  lines.push('change_reason: "Regenerado por AGT-PORTAL con datos reales del escaneo."')
  lines.push('aliases:')
  lines.push('  - SIS-PORTAL-INDEX')
  lines.push('tags:')
  lines.push('  - portales')
  lines.push('  - cobertura')
  lines.push('  - indice')
  lines.push('  - hermes')
  lines.push('related_docs:')
  lines.push('  - "[[00_HOME]]"')
  lines.push('  - "[[00_MOCS/MOC_SIS]]"')
  lines.push('  - "[[00_SISTEMA_MAESTRO/SOI_MASTER_BOOK_V9]]"')
  lines.push('  - "[[00_SISTEMA_MAESTRO/SOI_HERMES_CORE_V9]]"')
  lines.push('  - "[[06_IA_AGENTS_LOGIC/AGT-PORTAL_Lector_Portales_V9]]"')
  lines.push('---')
  lines.push('# \u00cdndice de Cobertura de Portales V9')
  lines.push('## Mapa operativo de los portales digitales del SOI (data-driven)')
  lines.push('')
  lines.push(`> **\u00daltima regeneraci\u00f3n autom\u00e1tica:** ${today} por \`AGT-PORTAL\`.`)
  lines.push(`> **Score global de cobertura portal\u2194doc:** ${(report.score_global * 100).toFixed(1)}%.`)
  lines.push('')
  lines.push('Este \u00edndice es regenerado por el agente `AGT-PORTAL` despu\u00e9s de cada')
  lines.push('escaneo del portal. La tabla "Cobertura m\u00ednima" del spec se conserva como')
  lines.push('contrato, pero la tabla "Estado real" refleja lo que el portal hace hoy.')
  lines.push('')
  lines.push('## \ud83d\udd04 Quick path')
  lines.push('1. Identificar el portal.')
  lines.push('2. Leer su documento rector.')
  lines.push('3. Leer el agente lector de portales (`AGT-PORTAL`).')
  lines.push('4. Comparar cobertura doc-portal.')
  lines.push('5. Documentar brechas y extras.')
  lines.push('')
  lines.push('## \ud83d\udccb Cobertura m\u00ednima (contrato)')
  lines.push('')
  lines.push('| Portal | Ruta | Departamento | Agente puente | Documento rector |')
  lines.push('|---|---|---|---|---|')
  lines.push('| Portal de Maestros | `/` | ACM | AGT-PORTAL + AGT-ACM | `SIS-P06` + manual ACM |')
  lines.push('| Portal Administrativo | `/admin` | ADM | AGT-PORTAL + AGT-DIR | pol\u00edticas ADM |')
  lines.push('| Portal Finanzas | `/fin` | FIN | AGT-PORTAL + AGT-FIN | manual FIN |')
  lines.push('| Portal Inventario | `/inventario` | OPR/LOG | AGT-PORTAL + AGT-FIN | manual OPR/LOG |')
  lines.push('| Portal Comunicaciones | `/com` | COM | AGT-PORTAL + AGT-COM | manual COM + `SIS-COM-01` |')
  lines.push('| Portal Direcci\u00f3n | `/dir` | DIR | AGT-PORTAL + AGT-DIR | manual DIR |')
  lines.push('')
  lines.push('## \ud83d\udcca Estado real (generado por AGT-PORTAL)')
  lines.push('')
  lines.push('| Portal | Departamento | Features | Cubiertas | Score | Agente puente | Estado |')
  lines.push('|---|---|---:|---:|---:|---|---|')
  for (const dept of DEPARTMENTS) {
    const cov = report.coverage[dept] || { total_findings: 0, aligned: 0, score: null }
    const total = portalByDept[dept] || cov.total_findings
    if (total === 0) continue
    const agent = AGENT_PUENTE[dept] || '\u2014'
    const estado = cov.score === null
      ? 'sin_datos'
      : cov.score >= 0.6
        ? 'operacional'
        : cov.score >= 0.3
          ? 'parcial'
          : 'deficiente'
    lines.push(`| Portal ${dept} | ${dept} | ${total} | ${cov.aligned} | ${(cov.score * 100).toFixed(1)}% | ${agent} | ${estado} |`)
  }
  lines.push('')
  lines.push('## \ud83d\ude80 Reglas de an\u00e1lisis')
  lines.push('- AGT-PORTAL mira la interfaz real.')
  lines.push('- AGT departamental valida la autoridad funcional.')
  lines.push('- Hermes compara y registra la brecha.')
  lines.push('')
  lines.push('## \ud83d\udcc8 Hallazgos del \u00faltimo escaneo')
  lines.push('')
  const counts = { portal_exceeds_doc: 0, doc_exceeds_portal: 0, drift: 0, aligned: 0 }
  for (const f of report.findings) counts[f.state] = (counts[f.state] || 0) + 1
  lines.push('| Estado | Cantidad |')
  lines.push('|---|---:|')
  lines.push(`| \u2705 Cubierto (aligned) | ${counts.aligned} |`)
  lines.push(`| \ud83d\udcdd Portal excede doc | ${counts.portal_exceeds_doc} |`)
  lines.push(`| \ud83d\ude80 Doc excede portal | ${counts.doc_exceeds_portal} |`)
  lines.push(`| \u26a0\ufe0f Drift | ${counts.drift} |`)
  lines.push('')
  lines.push('## \u2705 Resultado esperado')
  lines.push('Cada portal debe quedar con: due\u00f1o operativo, documento rector, agente lector,')
  lines.push('estado de cobertura, y ruta exacta de lectura. Este \u00edndice cumple ese contrato')
  lines.push('y se regenera peri\u00f3dicamente.')
  lines.push('')

  return lines.join('\n')
}

const AGENT_PUENTE = {
  DIR: 'AGT-PORTAL + AGT-DIR',
  ACM: 'AGT-PORTAL + AGT-ACM',
  ADM: 'AGT-PORTAL + AGT-ATN',
  FIN: 'AGT-PORTAL + AGT-FIN',
  OPR: 'AGT-PORTAL + AGT-OPR',
  COM: 'AGT-PORTAL + AGT-COM',
}
