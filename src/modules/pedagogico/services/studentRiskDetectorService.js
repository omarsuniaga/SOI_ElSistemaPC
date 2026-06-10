import { supabase } from '../../../lib/supabaseClient.js'
import { getActiveRuleByTipo } from './seguimientoRulesService.js'

const RISK_LEVELS = ['bajo', 'medio', 'alto', 'critico']
const RISK_RANK = { bajo: 1, medio: 2, alto: 3, critico: 4 }

/** Return [from, to] ISO date strings for the current month */
function _monthRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  return [from, to]
}

/** Return [from, to] ISO date strings for the current semester */
function _semesterRange() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  if (month < 6) return [`${year}-01-01`, `${year}-06-30`]
  return [`${year}-07-01`, `${year}-12-31`]
}

/** Bucket an evidence count against rule thresholds */
function _bucketLevel(count, cfg) {
  if (!cfg) return null
  if (count >= (cfg.critico ?? Infinity)) return 'critico'
  if (count >= (cfg.alto ?? Infinity)) return 'alto'
  if (count >= (cfg.medio ?? Infinity)) return 'medio'
  if (count >= (cfg.leve ?? Infinity)) return 'bajo'
  return null
}

export async function detectAttendanceRisk(alumnoId, period = {}) {
  const [from, to] = period.from && period.to ? [period.from, period.to] : _monthRange()
  const rule = await getActiveRuleByTipo('asistencia_irregular')
  if (!rule) return null

  const { data, error } = await supabase
    .from('asistencias')
    .select('estado, fecha')
    .eq('alumno_id', alumnoId)
    .gte('fecha', from)
    .lte('fecha', to)
  if (error) console.error('[detectAttendanceRisk]', error)

  const ausencias = (data || []).filter((a) => a.estado === 'A').length
  const justifs = (data || []).filter((a) => a.estado === 'J').length
  const contarJ = rule.config?.contar_justificadas
  const count = contarJ ? ausencias + justifs : ausencias
  const level = _bucketLevel(count, rule.config)

  return {
    tipo: 'asistencia_irregular',
    count,
    level,
    razon:
      count > 0
        ? `${count} ausencia${count !== 1 ? 's' : ''}${contarJ ? '' : ' injustificada' + (count !== 1 ? 's' : '')} este mes`
        : null,
  }
}

export async function detectTardinessRisk(alumnoId, period = {}) {
  const [from, to] = period.from && period.to ? [period.from, period.to] : _monthRange()
  const rule = await getActiveRuleByTipo('tardanzas_recurrentes')
  if (!rule) return null

  const { data, error } = await supabase
    .from('asistencias')
    .select('estado, fecha')
    .eq('alumno_id', alumnoId)
    .gte('fecha', from)
    .lte('fecha', to)
  if (error) console.error('[detectTardinessRisk]', error)

  const tardanzas = (data || []).filter((a) => a.estado === 'T').length
  const level = _bucketLevel(tardanzas, rule.config)

  return {
    tipo: 'tardanzas_recurrentes',
    count: tardanzas,
    level,
    razon: tardanzas > 0 ? `${tardanzas} tardanza${tardanzas !== 1 ? 's' : ''} este mes` : null,
  }
}

export async function detectObservationRisk(alumnoId, _period = {}) {
  const rule = await getActiveRuleByTipo('observacion_requiere_seguimiento')
  if (!rule) return null

  const { data } = await supabase
    .from('perfil_conocimiento')
    .select('id, item, dimension, estado, confianza')
    .eq('alumno_id', alumnoId)
    .eq('dimension', 'problema')
    .eq('estado', 'confirmado')

  const matches = data || []
  const count = matches.length

  let level = null
  if (count === 1) level = 'bajo'
  else if (count === 2) level = 'medio'
  else if (count >= 3) level = 'alto'

  return {
    tipo: 'observacion_requiere_seguimiento',
    count,
    level,
    razon:
      count > 0
        ? `${count} problema${count !== 1 ? 's' : ''} confirmado${count !== 1 ? 's' : ''} en el perfil de conocimiento`
        : null,
  }
}

export async function detectJustificationRisk(alumnoId, _period = {}) {
  const rule = await getActiveRuleByTipo('justificaciones_pendientes')
  if (!rule) return null

  const { data } = await supabase
    .from('justificaciones')
    .select('id, estado')
    .eq('alumno_id', alumnoId)
    .eq('estado', 'pendiente')

  const count = (data || []).length
  const max = rule.config?.max_pendientes ?? 2
  const level = count >= max ? rule.config?.nivel || 'medio' : null

  return {
    tipo: 'justificaciones_pendientes',
    count,
    level,
    razon: count >= max ? `${count} justificación${count !== 1 ? 'es' : ''} sin revisar` : null,
  }
}

export async function detectDocumentHistoryRisk(alumnoId, _period = {}) {
  const { data, error } = await supabase
    .from('generated_documents')
    .select('id, tipo')
    .eq('alumno_id', alumnoId)
    .in('estado', ['generado', 'archivado'])
  if (error) console.error('[detectDocumentHistoryRisk]', error)

  const cartasPrevias = (data || []).length
  return { tipo: 'historial_documental', count: cartasPrevias, level: null, razon: null }
}

const _estadoAusente = (estado) => !estado || estado === 'A' || estado === 'ausente'

export async function detectImportantEventsRisk(alumnoId, period = {}) {
  const rule = await getActiveRuleByTipo('eventos_importantes_ausencia_total')
  if (!rule) return null

  const motivos = rule.config?.motivos || ['Concierto']
  const minEv = rule.config?.min_eventos || 1
  const [from, to] = period.from && period.to ? [period.from, period.to] : _semesterRange()

  // Sistema A: sesiones_clase (módulo planificación)
  const { data: sesiones } = await supabase
    .from('sesiones_clase')
    .select('id, fecha, motivo, asistencia')
    .in('motivo', motivos)
    .gte('fecha', from)
    .lte('fecha', to)

  // Sistema B: clases_emergentes (portal-maestros)
  const { data: emergentes } = await supabase
    .from('clases_emergentes')
    .select('id, fecha, motivo')
    .in('motivo', motivos)
    .gte('fecha', from)
    .lte('fecha', to)

  if (
    (!sesiones?.length && !emergentes?.length) ||
    (sesiones?.length || 0) + (emergentes?.length || 0) < minEv
  )
    return null

  // Asistencias para Sistema A
  const sesionIds = (sesiones || []).map((s) => s.id)
  const { data: asistencias } = sesionIds.length
    ? await supabase
        .from('asistencias')
        .select('sesion_clase_id, estado')
        .eq('alumno_id', alumnoId)
        .in('sesion_clase_id', sesionIds)
    : { data: [] }

  const attMap = {}
  for (const a of asistencias || []) attMap[a.sesion_clase_id] = a.estado

  // Asistencias para Sistema B
  const emergenteIds = (emergentes || []).map((e) => e.id)
  const { data: asistenciasEmergentes } = emergenteIds.length
    ? await supabase
        .from('asistencias_emergentes')
        .select('clase_emergente_id, estado')
        .eq('alumno_id', alumnoId)
        .in('clase_emergente_id', emergenteIds)
    : { data: [] }

  const attEmergMap = {}
  for (const a of asistenciasEmergentes || []) attEmergMap[a.clase_emergente_id] = a.estado

  // Combinar eventos de ambos sistemas
  const detalle = [
    ...(sesiones || []).map((s) => {
      let estado = attMap[s.id]
      if (!estado)
        estado = (s.asistencia || []).find((a) => a.alumno_id === alumnoId)?.estado || null
      return { fuente: 'sesiones_clase', id: s.id, fecha: s.fecha, motivo: s.motivo, estado }
    }),
    ...(emergentes || []).map((e) => {
      const estado = attEmergMap[e.id] || null
      return { fuente: 'clases_emergentes', id: e.id, fecha: e.fecha, motivo: e.motivo, estado }
    }),
  ]
  // Sort by date ascending
  detalle.sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''))

  const ausentes = detalle.filter((e) => _estadoAusente(e.estado))
  const total = detalle.length
  const totalAus = ausentes.length

  const eventos = {
    tipo: 'eventos_importantes_ausencia_total',
    count: totalAus,
    total,
    eventos: detalle,
  }

  const thresholdPct = rule.config?.threshold_pct ?? 100
  const minAusencias = Math.max(minEv, Math.ceil((total * thresholdPct) / 100))

  let level = null
  if (totalAus >= minAusencias) level = 'critico'
  else if (totalAus >= Math.ceil(total * 0.5)) level = 'alto'
  else if (totalAus >= 1) level = 'medio'

  if (level) {
    const fechas = detalle.map((e) => e.fecha).join(', ')
    eventos.level = level
    eventos.razon = `${totalAus} ausencia(s) de ${total} evento(s) importante(s): ${fechas}`
    eventos.accionesSugeridas = rule.config?.acciones || [
      'Suspensión temporal del alumno',
      'Retención del instrumento',
      'Reunión con representante',
    ]
    return eventos
  }

  eventos.level = null
  eventos.razon = null
  return eventos
}

/** Compute aggregate risk level from multiple sub-detector results */
export function calculateRiskLevel(subResults) {
  const levels = subResults.map((r) => r?.level).filter(Boolean)
  if (levels.length === 0) return null
  const maxRank = Math.max(...levels.map((l) => RISK_RANK[l] || 0))
  return RISK_LEVELS[maxRank - 1] || null
}

function _suggestedAction(level) {
  const map = {
    bajo: 'Contactar al representante de manera preventiva.',
    medio: 'Generar carta institucional y contactar representante.',
    alto: 'Solicitar reunión formal con el representante.',
    critico: 'Convocar reunión urgente con directiva y evaluar escalamiento.',
  }
  return map[level] || null
}

/** Main entry: full risk analysis for one alumno */
export async function analyzeStudentRisk(alumnoId, options = {}) {
  const { data: alumno } = await supabase
    .from('alumnos')
    .select('id, nombre_completo')
    .eq('id', alumnoId)
    .single()

  const [att, tard, obs, just, hist, eventos] = await Promise.all([
    detectAttendanceRisk(alumnoId, options.period),
    detectTardinessRisk(alumnoId, options.period),
    detectObservationRisk(alumnoId, options.period),
    detectJustificationRisk(alumnoId, options.period),
    detectDocumentHistoryRisk(alumnoId, options.period),
    detectImportantEventsRisk(alumnoId, options.period),
  ])

  const subResults = [att, tard, obs, just, eventos].filter(Boolean)
  const nivelRiesgo = calculateRiskLevel(subResults)
  const razones = subResults.map((r) => r?.razon).filter(Boolean)
  const score = subResults.reduce((s, r) => s + (RISK_RANK[r?.level] || 0) * 20, 0)

  let accionSugerida = _suggestedAction(nivelRiesgo)
  if (eventos?.level === 'critico' && eventos.accionesSugeridas?.length) {
    accionSugerida = eventos.accionesSugeridas.join(' · ')
  }

  return {
    alumnoId,
    alumnoNombre: alumno?.nombre_completo || '',
    nivelRiesgo,
    score,
    razones,
    evidencia: {
      ausenciasInjustificadas: att?.count || 0,
      tardanzas: tard?.count || 0,
      justificacionesPendientes: just?.count || 0,
      observacionesSeguimiento: obs?.count || 0,
      cartasPrevias: hist?.count || 0,
      eventosImportantesAusenciaTotal: eventos?.count || 0,
      eventosImportantesTotal: eventos?.total || 0,
      eventosImportantesDetalle: eventos?.eventos || [],
    },
    accionSugerida,
  }
}

/** Analyze all active students. Returns only students with at least one risk signal. Batches 10 at a time to avoid hanging the UI. */
export async function analyzeAllStudentsRisk(options = {}) {
  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id, nombre_completo')
    .eq('activo', true)

  const list = alumnos || []
  const BATCH = 10
  const results = []
  for (let i = 0; i < list.length; i += BATCH) {
    const slice = list.slice(i, i + BATCH)
    const chunk = await Promise.all(
      slice.map((a) =>
        analyzeStudentRisk(a.id, options).catch((err) => {
          console.error('[analyzeAllStudentsRisk] error for', a.id, err)
          return null
        }),
      ),
    )
    for (const r of chunk) {
      if (r && r.nivelRiesgo) results.push(r)
    }
  }
  results.sort((x, y) => y.score - x.score)
  return results
}

/** Upsert a risk result as an alert row — only one pending alert per student at a time */
export async function createAlertFromRisk(riskResult) {
  if (!riskResult?.nivelRiesgo) return null

  const eventosAusencia = riskResult.evidencia?.eventosImportantesAusenciaTotal || 0
  const eventosTotal = riskResult.evidencia?.eventosImportantesTotal || 0

  let titulo = `Riesgo ${riskResult.nivelRiesgo} detectado — ${riskResult.alumnoNombre}`
  if (eventosAusencia > 0 && eventosAusencia >= eventosTotal) {
    titulo = `⚠️ Ausencia TOTAL a eventos importantes — ${riskResult.alumnoNombre}`
  }

  const payload = {
    alumno_nombre: riskResult.alumnoNombre,
    tipo: 'riesgo_combinado',
    nivel_riesgo: riskResult.nivelRiesgo,
    titulo,
    descripcion: riskResult.razones.join(' · '),
    evidencia: {
      ...riskResult.evidencia,
      accionSugerida: riskResult.accionSugerida,
    },
    estado: 'pendiente',
  }

  // Check for existing pending alert for this student — upsert instead of duplicating
  const { data: existing } = await supabase
    .from('student_case_alerts')
    .select('id')
    .eq('alumno_id', riskResult.alumnoId)
    .eq('tipo', 'riesgo_combinado')
    .eq('estado', 'pendiente')
    .maybeSingle()

  let result
  if (existing) {
    const { data, error } = await supabase
      .from('student_case_alerts')
      .update(payload)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    result = data
  } else {
    const { data, error } = await supabase
      .from('student_case_alerts')
      .insert({ ...payload, alumno_id: riskResult.alumnoId })
      .select()
      .single()
    if (error) throw error
    result = data
  }

  return result
}
