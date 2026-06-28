import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(CURRENT_DIR, '../../../../')
const INDEX_PATH = path.join(REPO_ROOT, '00_SISTEMA_MAESTRO', 'SOI_DOCUMENTO_VIGENCIA.json')

const CATEGORY_TO_DOC_ID = {
  minuta_reunion: 'ACM-P02',
  reporte_semanal_profesores: 'ACM-P02',
  solicitud_nuevo_proceso: 'AGT-P03',
  alerta_crisis: 'DIR-P05',
  solicitud_evento: 'EVT-P01',
  dano_instrumento: 'LOG-P03',
  mora_pago: 'FIN-P13',
  expediente_alumno: 'ADM-P02',
  justificacion_inasistencia: 'ADM-P08',
}

const KEYWORD_TO_DOC_IDS = [
  { regex: /\b(mora|morosidad|cobranza|pago atrasado)\b/i, docId: 'FIN-P13' },
  { regex: /\b(crisis|emergencia|incidencia grave)\b/i, docId: 'DIR-P05' },
  { regex: /\b(evento|concierto|actividad)\b/i, docId: 'EVT-P01' },
  { regex: /\b(instrumento|daño|reparaci[oó]n|luther[ií]a)\b/i, docId: 'LOG-P03' },
  { regex: /\b(asistencia|contenido|reporte semanal|minuta)\b/i, docId: 'ACM-P02' },
  { regex: /\b(expediente|inscripci[oó]n|alumno)\b/i, docId: 'ADM-P02' },
  { regex: /\b(justificaci[oó]n|permiso|inasistencia)\b/i, docId: 'ADM-P08' },
]

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function readIndex() {
  return JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'))
}

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/)
  if (!match) return {}
  const out = {}
  for (const line of match[1].split('\n')) {
    if (!line.includes(':')) continue
    const idx = line.indexOf(':')
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
    out[key] = value === 'null' ? null : value
  }
  return out
}

function parseYamlBlock(content) {
  const match = content.match(/```yaml\s*\n([\s\S]*?)\n```/i)
  if (!match) return {}
  const out = {}
  for (const rawLine of match[1].split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || line.startsWith('- ')) continue
    if (!line.includes(':')) continue
    const idx = line.indexOf(':')
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
    if (value) out[key] = value
  }
  return out
}

function getExcerpt(content) {
  const withoutFrontmatter = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '')
  const lines = withoutFrontmatter
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('```'))
  return lines.slice(0, 4).join(' ').slice(0, 280)
}

function isCanonicalVigente(doc) {
  return doc?.status === 'vigente'
    && doc?.has_frontmatter === true
    && typeof doc?.path === 'string'
    && !doc.path.includes('99_OBSOLETO/')
}

function resolveDocIdFromQuery(query = '', category = '') {
  if (category && CATEGORY_TO_DOC_ID[category]) return { docId: CATEGORY_TO_DOC_ID[category], matchedBy: 'category' }

  const normalizedQuery = normalizeText(query)
  const exactDocId = String(query || '').trim().toUpperCase()
  if (/^[A-Z]{2,4}-[A-Z]{1,3}\d{2,3}$/.test(exactDocId)) {
    return { docId: exactDocId, matchedBy: 'doc_id' }
  }

  for (const rule of KEYWORD_TO_DOC_IDS) {
    if (rule.regex.test(normalizedQuery)) return { docId: rule.docId, matchedBy: 'keyword' }
  }

  return { docId: null, matchedBy: null }
}

export function resolveSoiPolicy({ query = '', category = '', docId = '' } = {}) {
  const index = readIndex()
  const documents = index.documents || {}
  const explicitDocId = String(docId || '').trim().toUpperCase()
  const resolved = explicitDocId
    ? { docId: explicitDocId, matchedBy: 'doc_id' }
    : resolveDocIdFromQuery(query, category)

  if (!resolved.docId) {
    return {
      ok: false,
      error: 'policy_gap',
      reason: 'No se pudo resolver un doc_id canónico desde la consulta.',
      query,
      category,
      authoritative_source: INDEX_PATH,
    }
  }

  const doc = documents[resolved.docId]
  if (!doc) {
    return {
      ok: false,
      error: 'policy_gap',
      reason: `El doc_id ${resolved.docId} no existe en SOI_DOCUMENTO_VIGENCIA.json.`,
      doc_id: resolved.docId,
      matched_by: resolved.matchedBy,
      authoritative_source: INDEX_PATH,
    }
  }

  if (!isCanonicalVigente(doc)) {
    return {
      ok: false,
      error: 'policy_gap',
      reason: `El doc_id ${resolved.docId} no está vigente o no es canónico.`,
      doc_id: resolved.docId,
      matched_by: resolved.matchedBy,
      status: doc.status,
      path: doc.path,
      authoritative_source: INDEX_PATH,
    }
  }

  const fullPath = path.join(REPO_ROOT, doc.path)
  const content = fs.readFileSync(fullPath, 'utf8')
  const frontmatter = parseFrontmatter(content)
  const yamlBlock = parseYamlBlock(content)

  return {
    ok: true,
    doc_id: doc.doc_id,
    version: doc.current_version || frontmatter.version || null,
    status: doc.status,
    path: doc.path,
    canonical_path: frontmatter.canonical_path || doc.path,
    owner: doc.owner || frontmatter.owner || null,
    department: doc.department || frontmatter.department || null,
    matched_by: resolved.matchedBy,
    query,
    category,
    source_excerpt: getExcerpt(content),
    evidence_required: yamlBlock.evidence_required || null,
    sla: yamlBlock.sla || null,
    authoritative_source: INDEX_PATH,
  }
}

export { CATEGORY_TO_DOC_ID, INDEX_PATH }
