import { supabase } from '../../../lib/supabaseClient.js'
import { getActiveRuleByTipo } from './seguimientoRulesService.js'

const RISK_LEVELS = ['bajo', 'medio', 'alto', 'critico']
const RISK_RANK   = { bajo: 1, medio: 2, alto: 3, critico: 4 }

/** Return [from, to] ISO date strings for the current month */
function _monthRange() {
  const now  = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  return [from, to]
}

/** Bucket an evidence count against rule thresholds */
function _bucketLevel(count, cfg) {
  if (!cfg) return null
  if (count >= (cfg.critico ?? Infinity)) return 'critico'
  if (count >= (cfg.alto    ?? Infinity)) return 'alto'
  if (count >= (cfg.medio   ?? Infinity)) return 'medio'
  if (count >= (cfg.leve    ?? Infinity)) return 'bajo'
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

  const ausencias = (data || []).filter(a => a.estado === 'A').length
  const justifs   = (data || []).filter(a => a.estado === 'J').length
  const contarJ   = rule.config?.contar_justificadas
  const count     = contarJ ? (ausencias + justifs) : ausencias
  const level     = _bucketLevel(count, rule.config)

  return {
    tipo: 'asistencia_irregular',
    count,
    level,
    razon: count > 0 ? `${count} ausencia${count !== 1 ? 's' : ''}${contarJ ? '' : ' injustificada' + (count !== 1 ? 's' : '')} este mes` : null,
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

  const tardanzas = (data || []).filter(a => a.estado === 'T').length
  const level     = _bucketLevel(tardanzas, rule.config)

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

  let q = supabase
    .from('observaciones_alumnos')
    .select('id, prioridad, estado, requiere_seguimiento, observacion')
    .eq('alumno_id', alumnoId)
    .eq('requiere_seguimiento', true)
  if (rule.config?.solo_pendientes) {
    q = q.in('estado', ['pendiente', 'abierta'])
  }

  const { data } = await q
  const matches = (data || []).filter(o => {
    if (!rule.config?.prioridades?.length) return true
    return rule.config.prioridades.includes(o.prioridad)
  })

  let level = null
  if (matches.length === 1) level = 'bajo'
  else if (matches.length === 2) level = 'medio'
  else if (matches.length >= 3) level = 'alto'

  return {
    tipo: 'observacion_requiere_seguimiento',
    count: matches.length,
    level,
    razon: matches.length > 0 ? `${matches.length} observación${matches.length !== 1 ? 'es' : ''} pendiente${matches.length !== 1 ? 's' : ''} marcadas para seguimiento` : null,
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
  const max   = rule.config?.max_pendientes ?? 2
  const level = count >= max ? (rule.config?.nivel || 'medio') : null

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

/** Compute aggregate risk level from multiple sub-detector results */
export function calculateRiskLevel(subResults) {
  const levels = subResults.map(r => r?.level).filter(Boolean)
  if (levels.length === 0) return null
  const maxRank = Math.max(...levels.map(l => RISK_RANK[l] || 0))
  return RISK_LEVELS[maxRank - 1] || null
}

function _suggestedAction(level) {
  const map = {
    bajo:    'Contactar al representante de manera preventiva.',
    medio:   'Generar carta institucional y contactar representante.',
    alto:    'Solicitar reunión formal con el representante.',
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

  const [att, tard, obs, just, hist] = await Promise.all([
    detectAttendanceRisk(alumnoId, options.period),
    detectTardinessRisk(alumnoId, options.period),
    detectObservationRisk(alumnoId, options.period),
    detectJustificationRisk(alumnoId, options.period),
    detectDocumentHistoryRisk(alumnoId, options.period),
  ])

  const subResults  = [att, tard, obs, just].filter(Boolean)
  const nivelRiesgo = calculateRiskLevel(subResults)
  const razones     = subResults.map(r => r?.razon).filter(Boolean)
  const score       = subResults.reduce((s, r) => s + (RISK_RANK[r?.level] || 0) * 20, 0)

  return {
    alumnoId,
    alumnoNombre: alumno?.nombre_completo || '',
    nivelRiesgo,
    score,
    razones,
    evidencia: {
      ausenciasInjustificadas: att?.count   || 0,
      tardanzas:               tard?.count  || 0,
      justificacionesPendientes: just?.count || 0,
      observacionesSeguimiento: obs?.count  || 0,
      cartasPrevias:           hist?.count  || 0,
    },
    accionSugerida: _suggestedAction(nivelRiesgo),
  }
}

/** Analyze all active students. Performs batch queries to minimize network roundtrips (N+1 queries) and processes the risk rules in memory. */
export async function analyzeAllStudentsRisk(options = {}) {
  const { data: alumnos, error: alumnosError } = await supabase
    .from('alumnos')
    .select('id, nombre_completo')
    .eq('activo', true)

  if (alumnosError) {
    console.error('[analyzeAllStudentsRisk] Error fetching active students:', alumnosError)
    throw new Error('No se pudieron obtener los alumnos activos')
  }

  const list = alumnos || []
  if (list.length === 0) return []

  const alumnoIds = list.map(a => a.id)
  const [from, to] = options.period?.from && options.period?.to ? [options.period.from, options.period.to] : _monthRange()

  // Cargar las 4 reglas activas
  const [attRule, tardRule, obsRule, justRule] = await Promise.all([
    getActiveRuleByTipo('asistencia_irregular'),
    getActiveRuleByTipo('tardanzas_recurrentes'),
    getActiveRuleByTipo('observacion_requiere_seguimiento'),
    getActiveRuleByTipo('justificaciones_pendientes')
  ])

  // Cargar todos los datos de forma masiva (batch)
  const [asistenciasRes, observacionesRes, justificacionesRes, documentosRes] = await Promise.all([
    supabase.from('asistencias').select('alumno_id, estado, fecha').in('alumno_id', alumnoIds).gte('fecha', from).lte('fecha', to),
    supabase.from('observaciones_alumnos').select('id, alumno_id, prioridad, estado, requiere_seguimiento, observacion, tipo').in('alumno_id', alumnoIds).eq('requiere_seguimiento', true),
    supabase.from('justificaciones').select('id, alumno_id, estado').in('alumno_id', alumnoIds).eq('estado', 'pendiente'),
    supabase.from('generated_documents').select('id, alumno_id, tipo').in('alumno_id', alumnoIds).in('estado', ['generado', 'archivado'])
  ])

  // Agrupar los datos en memoria por alumno_id
  const asistMap = {}
  const obsMap = {}
  const justMap = {}
  const docsMap = {}

  alumnoIds.forEach(id => {
    asistMap[id] = []
    obsMap[id] = []
    justMap[id] = []
    docsMap[id] = []
  })

  ;(asistenciasRes.data || []).forEach(a => { if (asistMap[a.alumno_id]) asistMap[a.alumno_id].push(a) })
  ;(observacionesRes.data || []).forEach(o => { if (obsMap[o.alumno_id]) obsMap[o.alumno_id].push(o) })
  ;(justificacionesRes.data || []).forEach(j => { if (justMap[j.alumno_id]) justMap[j.alumno_id].push(j) })
  ;(documentosRes.data || []).forEach(d => { if (docsMap[d.alumno_id]) docsMap[d.alumno_id].push(d) })

  const results = []

  // Calcular el riesgo en memoria para cada alumno
  list.forEach(alumno => {
    const alumnoId = alumno.id

    // 1. Asistencia
    let attResult = null
    if (attRule) {
      const attList = asistMap[alumnoId] || []
      const ausencias = attList.filter(a => a.estado === 'A').length
      const justifs   = attList.filter(a => a.estado === 'J').length
      const contarJ   = attRule.config?.contar_justificadas
      const count     = contarJ ? (ausencias + justifs) : ausencias
      const level     = _bucketLevel(count, attRule.config)
      attResult = {
        tipo: 'asistencia_irregular',
        count,
        level,
        razon: count > 0 ? `${count} ausencia${count !== 1 ? 's' : ''}${contarJ ? '' : ' injustificada' + (count !== 1 ? 's' : '')} este mes` : null,
      }
    }

    // 2. Tardanzas
    let tardResult = null
    if (tardRule) {
      const tardList = asistMap[alumnoId] || []
      const tardanzas = tardList.filter(a => a.estado === 'T').length
      const level     = _bucketLevel(tardanzas, tardRule.config)
      tardResult = {
        tipo: 'tardanzas_recurrentes',
        count: tardanzas,
        level,
        razon: tardanzas > 0 ? `${tardanzas} tardanza${tardanzas !== 1 ? 's' : ''} este mes` : null,
      }
    }

    // 3. Observaciones
    let obsResult = null
    if (obsRule) {
      let obsList = obsMap[alumnoId] || []
      if (obsRule.config?.solo_pendientes) {
        obsList = obsList.filter(o => ['pendiente', 'abierta'].includes(o.estado))
      }
      const matches = obsList.filter(o => {
        if (!obsRule.config?.prioridades?.length) return true
        return obsRule.config.prioridades.includes(o.prioridad)
      })
      let level = null
      if (matches.length === 1) level = 'bajo'
      else if (matches.length === 2) level = 'medio'
      else if (matches.length >= 3) level = 'alto'

      obsResult = {
        tipo: 'observacion_requiere_seguimiento',
        count: matches.length,
        level,
        razon: matches.length > 0 ? `${matches.length} observación${matches.length !== 1 ? 'es' : ''} pendiente${matches.length !== 1 ? 's' : ''} marcadas para seguimiento` : null,
      }
    }

    // 4. Justificaciones
    let justResult = null
    if (justRule) {
      const justList = justMap[alumnoId] || []
      const count = justList.length
      const max   = justRule.config?.max_pendientes ?? 2
      const level = count >= max ? (justRule.config?.nivel || 'medio') : null
      justResult = {
        tipo: 'justificaciones_pendientes',
        count,
        level,
        razon: count >= max ? `${count} justificación${count !== 1 ? 'es' : ''} sin revisar` : null,
      }
    }

    // 5. Historial de documentos
    const docsList = docsMap[alumnoId] || []
    const histResult = {
      tipo: 'historial_documental',
      count: docsList.length,
      level: null,
      razon: null
    }

    const subResults = [attResult, tardResult, obsResult, justResult].filter(Boolean)
    const nivelRiesgo = calculateRiskLevel(subResults)
    const razones     = subResults.map(r => r?.razon).filter(Boolean)
    const score       = subResults.reduce((s, r) => s + (RISK_RANK[r?.level] || 0) * 20, 0)

    if (nivelRiesgo) {
      results.push({
        alumnoId,
        alumnoNombre: alumno.nombre_completo || '',
        nivelRiesgo,
        score,
        razones,
        evidencia: {
          ausenciasInjustificadas: attResult?.count   || 0,
          tardanzas:               tardResult?.count  || 0,
          justificacionesPendientes: justResult?.count || 0,
          observacionesSeguimiento: obsResult?.count  || 0,
          cartasPrevias:           histResult?.count  || 0,
        },
        accionSugerida: _suggestedAction(nivelRiesgo),
      })
    }
  })

  results.sort((x, y) => y.score - x.score)
  return results
}

/** Persist a risk result as an alert row */
export async function createAlertFromRisk(riskResult) {
  if (!riskResult?.nivelRiesgo) return null
  const payload = {
    alumno_id:     riskResult.alumnoId,
    alumno_nombre: riskResult.alumnoNombre,
    tipo:          'riesgo_combinado',
    nivel_riesgo:  riskResult.nivelRiesgo,
    titulo:        `Riesgo ${riskResult.nivelRiesgo} detectado — ${riskResult.alumnoNombre}`,
    descripcion:   riskResult.razones.join(' · '),
    evidencia:     riskResult.evidencia,
    estado:        'pendiente',
  }
  const { data, error } = await supabase
    .from('student_case_alerts')
    .insert(payload)
    .select().single()
  if (error) throw error
  return data
}
