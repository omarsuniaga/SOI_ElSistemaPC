/**
 * AGT-PORTAL — Comparator
 * -----------------------
 * Compara el resultado del scanner (features reales del portal) contra:
 *  - processIndex: SOI_PROCESS_INDEX (process_code, process_name, department_owner, canonical_doc_path, automation_status)
 *  - vigencia:     SOI_DOCUMENTO_VIGENCIA.json (doc_id, status, path, current_version, owner)
 *  - mocs:         lista de MOC_<DEPT>.md parseados
 *
 * Emite findings con uno de los 5 estados:
 *  - aligned, portal_exceeds_doc, doc_exceeds_portal, drift, legacy
 *
 * Cada finding lleva la evidencia mínima obligatoria que el contrato exige:
 *  - archivo de portal leído
 *  - documento rector leído
 *  - vista o función asociada
 *  - brecha o coincidencia detectada
 *
 * Adicionalmente computa coverage[department] = { aligned, portal_exceeds_doc, ... }
 * y un coverage_score (0..1) por departamento.
 */

import { COVERAGE_STATES, DEPARTMENTS } from './contract.js'

const STOPWORDS = new Set([
  'de', 'del', 'la', 'el', 'los', 'las', 'y', 'o', 'a', 'en', 'con', 'por', 'para',
  'un', 'una', 'unos', 'unas', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'at',
  'gestion', 'gesti\u00f3n', 'procedimiento', 'proceso', 'manual', 'ficha', 'reporte',
  'control', 'gestion', 'control', 'bitacora', 'bit\u00e1cora', 'control',
])

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
}

function similarity(a, b) {
  if (!a || !b) return 0
  const A = new Set(tokenize(a))
  const B = new Set(tokenize(b))
  if (!A.size || !B.size) return 0
  let inter = 0
  for (const t of A) if (B.has(t)) inter++
  // Jaccard suavizado
  return inter / (A.size + B.size - inter)
}

/**
 * Encuentra el mejor process para una feature.
 *  - match exacto por nombre normalizado
 *  - match fuzzy por token overlap (Jaccard)
 */
function bestProcessForFeature(feature, processIndex) {
  let best = null
  let bestScore = 0
  for (const proc of processIndex) {
    if (proc.department_owner && proc.department_owner !== feature.department) continue
    const score = similarity(feature.name, proc.process_name) +
                  similarity(feature.name, proc.process_code) * 0.3
    if (score > bestScore) {
      best = proc
      bestScore = score
    }
  }
  return { process: best, score: bestScore }
}

function bestFeatureForProcess(process, features) {
  let best = null
  let bestScore = 0
  for (const f of features) {
    if (f.department !== process.department_owner) continue
    const score = similarity(f.name, process.process_name) +
                  similarity(f.name, process.process_code) * 0.3
    if (score > bestScore) {
      best = f
      bestScore = score
    }
  }
  return { feature: best, score: bestScore }
}

const FUZZY_MATCH_THRESHOLD = 0.18
const STRONG_MATCH_THRESHOLD = 0.45

/**
 * comparePortalDocs
 * -----------------
 * @param {object} scanResult - resultado de scanPortal()
 * @param {object} docs
 *   - processIndex: array de procesos del SOI_PROCESS_INDEX
 *   - vigencia:     objeto { documents: { ... } } del VIGENCIA.json (opcional)
 *   - mocs:         array de MOCs parseados (opcional)
 * @returns {{ findings: object[], coverage: object, score_global: number }}
 */
export function comparePortalDocs(scanResult, docs = {}) {
  const processIndex = docs.processIndex || []
  const features = scanResult.features || []

  const findings = []
  const seenProcesses = new Set()

  // 1. Por cada feature del portal, buscar su contraparte documental
  for (const feature of features) {
    const { process, score } = bestProcessForFeature(feature, processIndex)
    let state
    let relatedDocPath = null
    let relatedDocVersion = null

    if (!process || score < FUZZY_MATCH_THRESHOLD) {
      state = COVERAGE_STATES.PORTAL_EXCEEDS_DOC
    } else if (score >= STRONG_MATCH_THRESHOLD) {
      state = COVERAGE_STATES.ALIGNED
      relatedDocPath = process.canonical_doc_path
      seenProcesses.add(process.process_code)
    } else {
      state = COVERAGE_STATES.DRIFT
      relatedDocPath = process.canonical_doc_path
      seenProcesses.add(process.process_code)
    }

    if (process && process.automation_status === 'manual' && state === COVERAGE_STATES.ALIGNED) {
      // No es drift pero podría serlo si la doc dice auto y el portal no
    }

    findings.push({
      finding_id: `F-${findings.length + 1}`,
      side: 'portal',
      feature_id: feature.feature_id,
      feature_name: feature.name,
      feature_path: feature.rel_path,
      feature_kind: feature.kind,
      feature_lines: feature.lines,
      feature_tags: feature.tags,
      department: feature.department,
      state,
      match_score: Number(score.toFixed(3)),
      related_doc: relatedDocPath,
      related_doc_version: relatedDocVersion,
      evidence: {
        portal_file: feature.rel_path,
        rector_doc: relatedDocPath,
        view_or_function: `${feature.kind}:${feature.name}`,
        gap_or_match: state,
      },
      remediation: remediationFor(state, { side: 'portal', feature, process }),
    })
  }

  // 2. Por cada proceso del index, ver si tiene contraparte en el portal
  for (const proc of processIndex) {
    if (seenProcesses.has(proc.process_code)) continue
    const { feature, score } = bestFeatureForProcess(proc, features)
    const state = COVERAGE_STATES.DOC_EXCEEDS_PORTAL

    findings.push({
      finding_id: `F-${findings.length + 1}`,
      side: 'doc',
      feature_id: feature ? feature.feature_id : null,
      feature_name: feature ? feature.name : null,
      feature_path: feature ? feature.rel_path : null,
      feature_kind: feature ? feature.kind : null,
      feature_lines: feature ? feature.lines : null,
      department: proc.department_owner,
      state,
      match_score: Number(score.toFixed(3)),
      related_doc: proc.canonical_doc_path,
      related_doc_version: proc.automation_status,
      evidence: {
        portal_file: feature ? feature.rel_path : null,
        rector_doc: proc.canonical_doc_path,
        view_or_function: feature ? `${feature.kind}:${feature.name}` : null,
        gap_or_match: state,
      },
      remediation: remediationFor(state, { side: 'doc', process: proc, feature }),
    })
  }

  // 3. Coverage por departamento
  const coverage = {}
  for (const dept of DEPARTMENTS) {
    const deptFindings = findings.filter((f) => f.department === dept)
    const total = deptFindings.length
    const byState = {
      aligned: 0,
      portal_exceeds_doc: 0,
      doc_exceeds_portal: 0,
      drift: 0,
      legacy: 0,
    }
    for (const f of deptFindings) byState[f.state] = (byState[f.state] || 0) + 1
    coverage[dept] = {
      total_findings: total,
      ...byState,
      score: total ? Number((byState.aligned / total).toFixed(3)) : null,
    }
  }

  // 4. Score global = promedio ponderado por total de findings
  const deptsConDatos = Object.values(coverage).filter((c) => c.total_findings > 0)
  const scoreGlobal = deptsConDatos.length
    ? Number(
        (deptsConDatos.reduce((acc, c) => acc + c.score, 0) / deptsConDatos.length).toFixed(3),
      )
    : 0

  return {
    findings,
    coverage,
    score_global: scoreGlobal,
    generated_at: new Date().toISOString(),
    total_findings: findings.length,
  }
}

function remediationFor(state, ctx) {
  switch (state) {
    case COVERAGE_STATES.PORTAL_EXCEEDS_DOC:
      return {
        action: 'documentar',
        target: 'departamento',
        message: ctx.feature
          ? `La feature "${ctx.feature.name}" existe en el portal pero no está en el process index. Agregar entrada en MOC y SOI_PROCESS_INDEX.`
          : 'Feature huérfana en el portal.',
      }
    case COVERAGE_STATES.DOC_EXCEEDS_PORTAL:
      return {
        action: 'implementar',
        target: 'portal',
        message: ctx.process
          ? `El proceso "${ctx.process.process_code} - ${ctx.process.process_name}" está documentado pero no tiene contraparte en el portal. Crear vista/servicio o marcar como manual.`
          : 'Proceso huérfano en la documentación.',
      }
    case COVERAGE_STATES.DRIFT:
      return {
        action: 'revisar',
        target: 'hermes',
        message: ctx.process && ctx.feature
          ? `Drift entre "${ctx.process.process_code}" y "${ctx.feature.name}". Revisar si el portal cumple el proceso o si hay que actualizar la doc.`
          : 'Drift sin contexto suficiente.',
      }
    case COVERAGE_STATES.LEGACY:
      return {
        action: 'archivar',
        target: '99_OBSOLETO',
        message: 'Feature marcada como legacy. Mover a 99_OBSOLETO y quitar del portal activo.',
      }
    case COVERAGE_STATES.ALIGNED:
    default:
      return { action: 'mantener', target: 'ninguno', message: 'Cubierto correctamente.' }
  }
}
