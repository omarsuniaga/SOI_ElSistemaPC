import { supabase } from '../../../lib/supabaseClient.js'

function mapStatusToNota(status) {
  if (['achieved', 'exceeded'].includes(status)) return 'bien'
  if (['in_process', 'needs_reinforcement'].includes(status)) return 'regular'
  if (status === 'failed') return 'mal'
  return null
}

function buildSemaforoEntry(alumnoId, claseId, objetivoId, notas = []) {
  const counts = {
    alumno_id: alumnoId,
    clase_id: claseId,
    objetivo_id: objetivoId,
    total_registros: notas.length,
    bien_count: notas.filter((nota) => nota === 'bien').length,
    regular_count: notas.filter((nota) => nota === 'regular').length,
    mal_count: notas.filter((nota) => nota === 'mal').length,
  }

  let semaforo = 'naranja'
  if (counts.total_registros === 0) semaforo = 'gris'
  else if (counts.mal_count > counts.total_registros / 2) semaforo = 'rojo'
  else if (counts.bien_count >= Math.ceil(counts.total_registros * 0.7)) semaforo = 'verde'

  return { ...counts, semaforo }
}

async function loadAcmBitacoraBase(claseId) {
  const { data: activeRoute } = await supabase
    .from('acm_active_routes')
    .select('id, weekly_plan_id, current_week')
    .eq('group_id', claseId)
    .eq('status', 'active')
    .maybeSingle()

  if (!activeRoute?.weekly_plan_id) return null

  const [{ data: objetivos }, { data: planItems }, { data: sesiones }] = await Promise.all([
    supabase
      .from('ruta_contenido_objetivos')
      .select('*')
      .eq('clase_id', claseId)
      .is('activo', true),
    supabase
      .from('acm_weekly_plan_items')
      .select('id, week_number, indicator_id, topic')
      .eq('weekly_plan_id', activeRoute.weekly_plan_id),
    supabase
      .from('sesiones_clase')
      .select('id, fecha, clase_id')
      .eq('clase_id', claseId),
  ])

  const sessionIds = (sesiones || []).map((sesion) => sesion.id).filter(Boolean)
  const indicatorIds = [...new Set((planItems || []).map((item) => item.indicator_id).filter(Boolean))]

  if (!sessionIds.length || !indicatorIds.length) {
    return {
      activeRoute,
      objetivos: objetivos || [],
      planItems: planItems || [],
      sesiones: sesiones || [],
      progressRows: [],
    }
  }

  const { data: progressRows } = await supabase
    .from('student_indicator_progress')
    .select('student_id, indicator_id, status, session_id, updated_at')
    .in('session_id', sessionIds)
    .in('indicator_id', indicatorIds)
    .neq('status', 'not_started')

  return {
    activeRoute,
    objetivos: objetivos || [],
    planItems: planItems || [],
    sesiones: sesiones || [],
    progressRows: progressRows || [],
  }
}

function buildAcmHistorialSessions(base, objetivoId) {
  if (!base) return []

  const objetivo = (base.objetivos || []).find((item) => String(item.id) === String(objetivoId))
  if (!objetivo) return []

  const validIndicatorIds = new Set(
    (base.planItems || [])
      .filter((item) =>
        Number(item.week_number) >= Number(objetivo.semana_inicio || 0) &&
        Number(item.week_number) <= Number(objetivo.semana_fin || 0) &&
        item.indicator_id)
      .map((item) => item.indicator_id),
  )

  if (!validIndicatorIds.size) return []

  const sessionMap = new Map((base.sesiones || []).map((sesion) => [sesion.id, sesion]))
  const grouped = new Map()

  for (const row of base.progressRows || []) {
    if (!validIndicatorIds.has(row.indicator_id)) continue
    const nota = mapStatusToNota(row.status)
    if (!nota) continue
    const sesion = sessionMap.get(row.session_id)
    if (!sesion) continue

    if (!grouped.has(row.session_id)) {
      grouped.set(row.session_id, {
        id: row.session_id,
        fecha: sesion.fecha,
        notas: [],
        indicator_session_students: [],
        source: 'acm',
      })
    }

    const entry = grouped.get(row.session_id)
    entry.notas.push({ alumno_id: row.student_id, nota })
    entry.indicator_session_students.push({
      alumno_id: row.student_id,
      nota_cualitativa: nota,
      status: row.status,
      updated_at: row.updated_at,
    })
  }

  return Array.from(grouped.values()).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
}

function buildAcmSemaforo(base, claseId) {
  if (!base) return []

  const results = []

  for (const objetivo of base.objetivos || []) {
    const validIndicatorIds = new Set(
      (base.planItems || [])
        .filter((item) =>
          Number(item.week_number) >= Number(objetivo.semana_inicio || 0) &&
          Number(item.week_number) <= Number(objetivo.semana_fin || 0) &&
          item.indicator_id)
        .map((item) => item.indicator_id),
    )

    if (!validIndicatorIds.size) continue

    const notesByStudent = new Map()
    for (const row of base.progressRows || []) {
      if (!validIndicatorIds.has(row.indicator_id)) continue
      const nota = mapStatusToNota(row.status)
      if (!nota) continue
      if (!notesByStudent.has(row.student_id)) notesByStudent.set(row.student_id, [])
      notesByStudent.get(row.student_id).push(nota)
    }

    for (const [studentId, notas] of notesByStudent.entries()) {
      results.push(buildSemaforoEntry(studentId, claseId, objetivo.id, notas))
    }
  }

  return results
}

function mergeSemaforos(primary = [], secondary = []) {
  const merged = new Map()

  for (const row of [...primary, ...secondary]) {
    const key = `${row.objetivo_id}::${row.alumno_id}`
    if (!merged.has(key)) {
      merged.set(key, { ...row })
      continue
    }

    const curr = merged.get(key)
    curr.total_registros += row.total_registros || 0
    curr.bien_count += row.bien_count || 0
    curr.regular_count += row.regular_count || 0
    curr.mal_count += row.mal_count || 0
    merged.set(key, buildSemaforoEntry(curr.alumno_id, curr.clase_id, curr.objetivo_id, [
      ...Array(curr.bien_count).fill('bien'),
      ...Array(curr.regular_count).fill('regular'),
      ...Array(curr.mal_count).fill('mal'),
    ]))
  }

  return Array.from(merged.values())
}

export async function getObjetivosClase(claseId) {
  const { data, error } = await supabase
    .from('ruta_contenido_objetivos')
    .select('*')
    .eq('clase_id', claseId)
    .is('activo', true)

  if (error) throw error
  return data
}

export async function getSemaforoClase(claseId) {
  const [{ data: legacyData, error }, acmBase] = await Promise.all([
    supabase
      .from('v_semaforo_contenidos')
      .select('*')
      .eq('clase_id', claseId),
    loadAcmBitacoraBase(claseId).catch(() => null),
  ])

  if (error) throw error
  const acmData = buildAcmSemaforo(acmBase, claseId)
  return mergeSemaforos(legacyData || [], acmData)
}

export async function registrarSesion(payload) {
  const { data, error } = await supabase.rpc('registrar_sesion_bitacora', {
    p_clase_id: payload.claseId,
    p_objetivo_id: payload.objetivoId,
    p_fecha: payload.fecha,
    p_notas: payload.notas.map((nota) => ({
      alumno_id: nota.alumno_id,
      nota_cualitativa: nota.nota,
    })),
  })

  if (error) throw error
  return { id: data }
}

export async function getHistorialContenido(claseId, objetivoId) {
  const [legacyResult, acmBase] = await Promise.all([
    supabase
      .from('indicator_sessions')
      .select('*, indicator_session_students(*)')
      .eq('clase_id', claseId)
      .eq('objetivo_id', objetivoId)
      .order('fecha', { ascending: false }),
    loadAcmBitacoraBase(claseId).catch(() => null),
  ])

  if (legacyResult.error) throw legacyResult.error

  const acmSessions = buildAcmHistorialSessions(acmBase, objetivoId)
  const merged = [...(legacyResult.data || []), ...acmSessions]

  merged.sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')))
  return merged
}
