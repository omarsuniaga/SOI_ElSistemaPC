import policyCatalog from '../data/soiPolicyCatalog.json'

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

const DEPARTMENT_FALLBACK = {
  DIR: 'DIR-P05',
  ACM: 'ACM-P02',
  ADM: 'ADM-P02',
  FIN: 'FIN-P13',
  LOG: 'LOG-P03',
}

const KEYWORD_TO_DOC_IDS = [
  { regex: /\b(mora|morosidad|cobranza|pago atrasado)\b/i, docId: 'FIN-P13' },
  { regex: /\b(crisis|emergencia|incidencia grave)\b/i, docId: 'DIR-P05' },
  { regex: /\b(evento|concierto|actividad)\b/i, docId: 'EVT-P01' },
  { regex: /\b(instrumento|daño|danado|reparaci[oó]n|luther[ií]a)\b/i, docId: 'LOG-P03' },
  { regex: /\b(asistencia|contenido|reporte semanal|minuta|reunion academica)\b/i, docId: 'ACM-P02' },
  { regex: /\b(expediente|inscripci[oó]n|alumno|matricula)\b/i, docId: 'ADM-P02' },
  { regex: /\b(justificaci[oó]n|permiso|inasistencia)\b/i, docId: 'ADM-P08' },
  { regex: /\b(nuevo proceso|crear proceso|formalizar proceso)\b/i, docId: 'AGT-P03' },
]

function isCanonicalVigente(doc) {
  return doc?.status === 'vigente'
    && doc?.has_frontmatter === true
    && typeof doc?.canonical_path === 'string'
    && !doc.canonical_path.includes('99_OBSOLETO/')
}

function buildOk(docId, matchedBy, query, category) {
  const doc = policyCatalog.documents[docId]
  if (!doc || !isCanonicalVigente(doc)) {
    return {
      ok: false,
      error: 'policy_gap',
      reason: `El doc_id ${docId} no está vigente o no existe en el catálogo canónico.`,
      query,
      category,
      matched_by: matchedBy,
      authoritative_source: policyCatalog.authoritative_source,
    }
  }

  return {
    ok: true,
    doc_id: doc.doc_id,
    version: doc.current_version,
    status: doc.status,
    department: doc.department,
    owner: doc.owner,
    canonical_path: doc.canonical_path,
    matched_by: matchedBy,
    query,
    category,
    authoritative_source: policyCatalog.authoritative_source,
  }
}

export function resolvePolicyForInput({ query = '', category = '', department = '', docId = '' } = {}) {
  const explicitDocId = String(docId || '').trim().toUpperCase()
  if (explicitDocId) return buildOk(explicitDocId, 'doc_id', query, category)

  if (category && CATEGORY_TO_DOC_ID[category]) {
    return buildOk(CATEGORY_TO_DOC_ID[category], 'category', query, category)
  }

  const raw = String(query || '')
  for (const rule of KEYWORD_TO_DOC_IDS) {
    if (rule.regex.test(raw)) return buildOk(rule.docId, 'keyword', query, category)
  }

  if (department && DEPARTMENT_FALLBACK[department]) {
    return buildOk(DEPARTMENT_FALLBACK[department], 'department_fallback', query, category)
  }

  return {
    ok: false,
    error: 'policy_gap',
    reason: 'No se pudo resolver una política SOI vigente para esta solicitud.',
    query,
    category,
    department,
    authoritative_source: policyCatalog.authoritative_source,
  }
}

