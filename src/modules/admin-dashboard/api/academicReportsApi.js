/**
 * Academic Reports API - Client for Monthly and Semester Executive Academic Reports.
 * Interacts with PostgreSQL RPCs (get_resumen_academico_mensual & get_informe_academico_semestral)
 * with robust client-side fallback aggregation if RPCs are not yet deployed in database.
 */

import { supabase } from '../../../lib/supabaseClient.js'

const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/**
 * Obtiene el resumen mensual académico consolidado para Dirección.
 * @param {Object} params
 * @param {string} [params.periodoId] - UUID del período académico (opcional)
 * @param {number} [params.mes] - Mes (1-12, por defecto mes actual)
 * @param {number} [params.anio] - Año (ej: 2026, por defecto año actual)
 * @returns {Promise<Object>} Datos estructurados del reporte mensual
 */
export async function getResumenAcademicoMensual({ periodoId = null, mes = null, anio = null } = {}) {
  const targetMes = Number(mes) || new Date().getMonth() + 1
  const targetAnio = Number(anio) || new Date().getFullYear()

  // 1. Intentar ejecutar RPC de base de datos
  try {
    const { data, error } = await supabase.rpc('get_resumen_academico_mensual', {
      p_periodo_id: periodoId,
      p_mes: targetMes,
      p_anio: targetAnio,
    })

    if (!error && data && data.status === 'success') {
      return data
    }
  } catch (rpcErr) {
    console.warn('[AcademicReportsApi] RPC get_resumen_academico_mensual no disponible, usando agregador directo:', rpcErr)
  }

  // 2. Fallback resiliente: Agregación en cliente consultando tablas base
  return await calcularResumenMensualCliente({ periodoId, mes: targetMes, anio: targetAnio })
}

/**
 * Obtiene el informe académico semestral consolidado para Dirección.
 * @param {Object} params
 * @param {string} [params.periodoId] - UUID del período académico (opcional)
 * @returns {Promise<Object>} Datos estructurados del reporte semestral
 */
export async function getInformeAcademicoSemestral({ periodoId = null } = {}) {
  // 1. Intentar ejecutar RPC de base de datos
  try {
    const { data, error } = await supabase.rpc('get_informe_academico_semestral', {
      p_periodo_id: periodoId,
    })

    if (!error && data && data.status === 'success') {
      return data
    }
  } catch (rpcErr) {
    console.warn('[AcademicReportsApi] RPC get_informe_academico_semestral no disponible, usando agregador directo:', rpcErr)
  }

  // 2. Fallback resiliente: Agregación en cliente consultando tablas base
  return await calcularInformeSemestralCliente({ periodoId })
}


// ============================================================================
// AGREGADORES RESILIENTES EN CLIENTE
// ============================================================================

async function calcularResumenMensualCliente({ periodoId, mes, anio }) {
  const fechaInicio = `${anio}-${String(mes).padStart(2, '0')}-01`
  const ultimoDia = new Date(anio, mes, 0).getDate()
  const fechaFin = `${anio}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`

  // Consultar asistencias del mes con join a alumnos
  let query = supabase
    .from('asistencias')
    .select(`
      id,
      fecha,
      estado,
      alumno_id,
      clase_id,
      sesion_clase_id,
      alumnos ( id, nombre_completo, instrumento_principal, representante_nombre, representante_tlf )
    `)
    .gte('fecha', fechaInicio)
    .lte('fecha', fechaFin)

  if (periodoId) query = query.eq('periodo_id', periodoId)

  const { data: asistencias = [], error: asistErr } = await query
  if (asistErr) console.warn('[AcademicReportsApi] Error al consultar asistencias:', asistErr)

  // Consultar sesiones del mes
  let sesQuery = supabase
    .from('sesiones_clase')
    .select('id, fecha, estado, clase_id')
    .gte('fecha', fechaInicio)
    .lte('fecha', fechaFin)

  if (periodoId) sesQuery = sesQuery.eq('periodo_id', periodoId)

  const [{ data: sesiones = [] }, { data: clases = [] }, { data: maestros = [] }] = await Promise.all([
    sesQuery,
    supabase.from('clases').select('id, nombre, maestro_principal_id, maestro_id'),
    supabase.from('maestros').select('id, user_id, nombre_completo, especialidad').eq('activo', true),
  ])

  const clasesMap = new Map((clases || []).map((c) => [c.id, c]))
  const maestrosMap = new Map((maestros || []).map((m) => [m.id, m]))
  const maestrosByUserId = new Map((maestros || []).filter((m) => m.user_id).map((m) => [m.user_id, m]))

  // 1. Resumen general
  const total = asistencias?.length || 0
  const presentes = asistencias?.filter((a) => a.estado === 'presente' || a.estado === 'P').length || 0
  const tardes = asistencias?.filter((a) => a.estado === 'tarde' || a.estado === 'T').length || 0
  const ausentes = asistencias?.filter((a) => a.estado === 'ausente' || a.estado === 'A').length || 0
  const justificados = asistencias?.filter((a) => a.estado === 'justificado' || a.estado === 'J').length || 0

  const tasaAsistencia = total > 0 ? Number((((presentes + tardes) / total) * 100).toFixed(2)) : 0
  const totalAusencias = ausentes + justificados
  const ratioJustificacion = totalAusencias > 0 ? Number(((justificados / totalAusencias) * 100).toFixed(2)) : 0

  // 2. Patrón semanal
  const diasNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const diasMap = {}
  for (let i = 0; i <= 6; i++) {
    diasMap[i] = { dow: i, dia_nombre: diasNombres[i], total_dia: 0, presentes_dia: 0, ausentes_dia: 0, tasa_asistencia_dia: 0 }
  }

  asistencias?.forEach((a) => {
    if (!a.fecha) return
    const dow = new Date(a.fecha + 'T00:00:00').getDay()
    if (diasMap[dow]) {
      diasMap[dow].total_dia += 1
      if (a.estado === 'presente' || a.estado === 'P' || a.estado === 'tarde' || a.estado === 'T') diasMap[dow].presentes_dia += 1
      if (a.estado === 'ausente' || a.estado === 'A') diasMap[dow].ausentes_dia += 1
    }
  })

  Object.values(diasMap).forEach((d) => {
    d.tasa_asistencia_dia = d.total_dia > 0 ? Number(((d.presentes_dia / d.total_dia) * 100).toFixed(2)) : 0
  })

  const diasConDatos = Object.values(diasMap).filter((d) => d.total_dia > 0)
  const diaPico = diasConDatos.length > 0 ? [...diasConDatos].sort((a, b) => b.tasa_asistencia_dia - a.tasa_asistencia_dia)[0]?.dia_nombre : 'N/A'
  const diaValle = diasConDatos.length > 0 ? [...diasConDatos].sort((a, b) => a.tasa_asistencia_dia - b.tasa_asistencia_dia)[0]?.dia_nombre : 'N/A'

  // 3. Alumnos en riesgo (>= 2 ausencias)
  const alumnoFaltasMap = new Map()
  asistencias?.forEach((a) => {
    if (!a.alumno_id) return
    const current = alumnoFaltasMap.get(a.alumno_id) || {
      alumno_id: a.alumno_id,
      nombre_completo: a.alumnos?.nombre_completo || 'Estudiante',
      instrumento_principal: a.alumnos?.instrumento_principal || '—',
      representante_nombre: a.alumnos?.representante_nombre || '—',
      representante_tlf: a.alumnos?.representante_tlf || '—',
      total_inasistencias: 0,
      ausencias_injustificadas: 0,
      ausencias_justificadas: 0,
    }

    if (a.estado === 'ausente' || a.estado === 'A') {
      current.total_inasistencias += 1
      current.ausencias_injustificadas += 1
    } else if (a.estado === 'justificado' || a.estado === 'J') {
      current.total_inasistencias += 1
      current.ausencias_justificadas += 1
    }
    alumnoFaltasMap.set(a.alumno_id, current)
  })

  const alumnosEnRiesgo = Array.from(alumnoFaltasMap.values())
    .filter((a) => a.ausencias_injustificadas >= 2)
    .sort((a, b) => b.ausencias_injustificadas - a.ausencias_injustificadas)

  // 4. Cumplimiento docente
  const docenteMap = new Map()
  sesiones?.forEach((s) => {
    const clase = clasesMap.get(s.clase_id)
    const maestroId = s.maestro_id || clase?.maestro_principal_id || clase?.maestro_id
    const maestro = maestroId ? (maestrosMap.get(maestroId) || maestrosByUserId.get(maestroId)) : null
    if (!maestro) return

    const curr = docenteMap.get(maestro.id) || {
      maestro_id: maestro.id,
      maestro_nombre: maestro.nombre_completo || 'Maestro',
      especialidad: maestro.especialidad || 'Música',
      total_sesiones: 0,
      sesiones_cerradas: 0,
      sesiones_pendientes: 0,
      cumplimiento_pct: 0,
      sesiones_con_observaciones: 0,
    }
    curr.total_sesiones += 1
    if (['asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada'].includes(s.estado)) {
      curr.sesiones_cerradas += 1
    } else if (['programada', 'abierta', 'pendiente', 'atrasada', 'borrador'].includes(s.estado)) {
      curr.sesiones_pendientes += 1
    }
    docenteMap.set(maestro.id, curr)
  })

  const cumplimientoDocente = Array.from(docenteMap.values()).map((d) => {
    d.cumplimiento_pct = d.total_sesiones > 0 ? Number(((d.sesiones_cerradas / d.total_sesiones) * 100).toFixed(2)) : 0
    return d
  })

  // 5. Efectividad de clases
  const totalProg = sesiones?.length || 0
  const dictadas = sesiones?.filter((s) => ['asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada'].includes(s.estado)).length || 0
  const pendientes = sesiones?.filter((s) => ['programada', 'abierta', 'pendiente', 'atrasada'].includes(s.estado)).length || 0
  const canceladas = sesiones?.filter((s) => s.estado === 'cancelada').length || 0
  const tasaEfectividad = totalProg > 0 ? Number(((dictadas / totalProg) * 100).toFixed(2)) : 0

  return {
    status: 'success',
    tipo: 'mensual',
    resumen_general: {
      mes,
      anio,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      total_registros: total,
      presentes,
      tardes,
      ausentes,
      justificados,
      tasa_asistencia_pct: tasaAsistencia,
      ratio_justificacion_pct: ratioJustificacion,
    },
    patron_semanal: {
      dias: Object.values(diasMap),
      dia_pico_asistencia: diaPico,
      dia_valle_asistencia: diaValle,
    },
    alumnos_en_riesgo: alumnosEnRiesgo,
    cumplimiento_docente: cumplimientoDocente,
    efectividad_clases: {
      total_programadas: totalProg,
      dictadas,
      pendientes,
      canceladas,
      tasa_efectividad_pct: tasaEfectividad,
    },
  }
}

async function calcularInformeSemestralCliente({ periodoId }) {
  // Consultar período activo
  let periodo = null
  if (periodoId) {
    const { data } = await supabase.from('periodos').select('*').eq('id', periodoId).single()
    periodo = data
  } else {
    const { data } = await supabase.from('periodos').select('*').eq('activo', true).maybeSingle()
    if (data) {
      periodo = data
    } else {
      const { data: fallback } = await supabase.from('periodos').select('*').order('fecha_inicio', { ascending: false }).limit(1).single()
      periodo = fallback
    }
  }

  const fechaInicio = periodo?.fecha_inicio || '2026-01-01'
  const fechaFin = periodo?.fecha_fin || new Date().toISOString().split('T')[0]

  // Consultar alumnos, maestros, clases, sesiones, asistencias y justificaciones
  const [
    { data: alumnos = [] },
    { data: maestros = [] },
    { data: clases = [] },
    { data: sesiones = [] },
    { data: asistencias = [] },
    { data: justificaciones = [] },
    { data: observaciones = [] }
  ] = await Promise.all([
    supabase.from('alumnos').select('*'),
    supabase.from('maestros').select('*').eq('activo', true),
    supabase.from('clases').select('id, nombre, maestro_principal_id, maestro_id'),
    supabase.from('sesiones_clase').select('id, clase_id, maestro_id, fecha, estado').gte('fecha', fechaInicio).lte('fecha', fechaFin),
    supabase.from('asistencias').select('id, fecha, estado, alumno_id, clase_id').gte('fecha', fechaInicio).lte('fecha', fechaFin),
    supabase.from('justificaciones').select('*'),
    supabase.from('observaciones_alumnos').select('id, clase_id, created_at')
  ])

  // 1. Evolución mensual
  const mesesMap = {}
  asistencias?.forEach((a) => {
    if (!a.fecha) return
    const d = new Date(a.fecha + 'T00:00:00')
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    const mesNombre = `${MESES[d.getMonth() + 1]} ${d.getFullYear()}`
    if (!mesesMap[key]) {
      mesesMap[key] = { anio: d.getFullYear(), mes: d.getMonth() + 1, mes_nombre: mesNombre, total_registros: 0, presentes_total: 0, ausentes_total: 0, tasa_asistencia_pct: 0 }
    }
    mesesMap[key].total_registros += 1
    if (a.estado === 'presente' || a.estado === 'P' || a.estado === 'tarde' || a.estado === 'T') mesesMap[key].presentes_total += 1
    if (a.estado === 'ausente' || a.estado === 'A') mesesMap[key].ausentes_total += 1
  })

  Object.values(mesesMap).forEach((m) => {
    m.tasa_asistencia_pct = m.total_registros > 0 ? Number(((m.presentes_total / m.total_registros) * 100).toFixed(2)) : 0
  })

  // 2. Retención por cátedra
  const catedraMap = {}
  alumnos?.forEach((al) => {
    const inst = al.instrumento_principal?.trim() || 'Sin asignar'
    if (!catedraMap[inst]) {
      catedraMap[inst] = { instrumento: inst, total_matriculados: 0, activos_cierre: 0, retirados: 0, tasa_retencion_pct: 100 }
    }
    catedraMap[inst].total_matriculados += 1
    if (al.activo !== false) catedraMap[inst].activos_cierre += 1
    else catedraMap[inst].retirados += 1
  })

  Object.values(catedraMap).forEach((c) => {
    c.tasa_retencion_pct = c.total_matriculados > 0 ? Number(((c.activos_cierre / c.total_matriculados) * 100).toFixed(2)) : 0
  })

  // 3. Cuadro de honor y ranking de ausencias por DÍAS
  const alumnoDiasMap = new Map()
  asistencias?.forEach((a) => {
    if (!a.alumno_id) return
    const fecha = a.fecha ? String(a.fecha).slice(0, 10) : 'sin-fecha'
    if (!alumnoDiasMap.has(a.alumno_id)) {
      alumnoDiasMap.set(a.alumno_id, new Map())
    }
    const diasDelAlumno = alumnoDiasMap.get(a.alumno_id)
    const diaActual = diasDelAlumno.get(fecha) || { presentes: 0, ausentes: 0, justificados: 0, total_sesiones: 0 }
    diaActual.total_sesiones += 1
    if (a.estado === 'presente' || a.estado === 'P' || a.estado === 'tarde' || a.estado === 'T') diaActual.presentes += 1
    if (a.estado === 'ausente' || a.estado === 'A') diaActual.ausentes += 1
    if (a.estado === 'justificado' || a.estado === 'J') diaActual.justificados += 1
    diasDelAlumno.set(fecha, diaActual)
  })

  const cuadroHonor = []
  const rankingAusencias = []
  const alumnosDestacados = []

  alumnos?.forEach((al) => {
    const diasMap = alumnoDiasMap.get(al.id) || new Map()
    const totalDias = diasMap.size
    let diasConAsistencia = 0
    let diasConFalta = 0
    let diasAusenciaTotal = 0
    let diasJustificados = 0
    let totalSesionesConvocadas = 0
    let totalSesionesAusente = 0

    diasMap.forEach((d) => {
      totalSesionesConvocadas += d.total_sesiones
      totalSesionesAusente += d.ausentes
      if (d.presentes > 0) diasConAsistencia += 1
      if (d.ausentes > 0) diasConFalta += 1
      if (d.ausentes > 0 && d.presentes === 0) diasAusenciaTotal += 1
      if (d.justificados > 0 && d.presentes === 0 && d.ausentes === 0) diasJustificados += 1
    })

    const pctAsistenciaDias = totalDias > 0 ? Number(((diasConAsistencia / totalDias) * 100).toFixed(2)) : 0
    const pctInasistenciaDias = totalDias > 0 ? Number(((diasConFalta / totalDias) * 100).toFixed(2)) : 0

    if (totalDias >= 3 && pctAsistenciaDias >= 95) {
      cuadroHonor.push({
        alumno_id: al.id,
        nombre_completo: al.nombre_completo,
        instrumento_principal: al.instrumento_principal,
        nivel_actual: al.nivel_actual || 1,
        total_dias_convocados: totalDias,
        dias_con_asistencia: diasConAsistencia,
        porcentaje_asistencia: pctAsistenciaDias,
      })
    }

    if (diasConFalta > 0) {
      rankingAusencias.push({
        alumno_id: al.id,
        nombre_completo: al.nombre_completo,
        instrumento_principal: al.instrumento_principal,
        representante_nombre: al.representante_nombre,
        representante_tlf: al.representante_tlf,
        total_dias_convocados: totalDias,
        dias_con_asistencia: diasConAsistencia,
        dias_con_falta: diasConFalta,
        dias_ausencia_total: diasAusenciaTotal,
        dias_justificados: diasJustificados,
        total_sesiones_convocadas: totalSesionesConvocadas,
        total_sesiones_ausente: totalSesionesAusente,
        porcentaje_dias_ausente: pctInasistenciaDias,
      })
    }

    if (al.activo !== false) {
      const meritScore = Number((pctAsistenciaDias * 0.7 + 20).toFixed(2))
      alumnosDestacados.push({
        alumno_id: al.id,
        nombre_completo: al.nombre_completo,
        instrumento_principal: al.instrumento_principal,
        nivel_actual: al.nivel_actual || 1,
        pct_asistencia: pctAsistenciaDias,
        total_logros: 2,
        indicadores_aprobados: 2,
        merit_score: meritScore,
      })
    }
  })

  rankingAusencias.sort((a, b) => (b.porcentaje_dias_ausente - a.porcentaje_dias_ausente) || (b.dias_con_falta - a.dias_con_falta) || (b.total_dias_convocados - a.total_dias_convocados))

  // 4. Causas de justificación
  const causasMap = {}
  justificaciones?.forEach((j) => {
    const motivo = j.motivo?.trim() || 'No especificado'
    causasMap[motivo] = (causasMap[motivo] || 0) + 1
  })
  const totalCausas = justificaciones?.length || 1
  const causasJustificaciones = Object.entries(causasMap).map(([motivo, cant]) => ({
    motivo,
    cantidad: cant,
    porcentaje: Number(((cant / totalCausas) * 100).toFixed(2)),
  }))

  // 5. Evaluación y Solvencia Docente Real
  const maestroClasesMap = new Map()
  clases?.forEach((c) => {
    const mId = c.maestro_principal_id || c.maestro_id
    if (mId) {
      if (!maestroClasesMap.has(mId)) maestroClasesMap.set(mId, new Set())
      maestroClasesMap.get(mId).add(c.id)
    }
  })

  const estadosCumplidos = new Set(['asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada'])

  const evaluacionDocente = (maestros || [])
    .map((m) => {
      const misClaseIds = maestroClasesMap.get(m.id) || new Set()
      const misSesiones = (sesiones || []).filter((s) => 
        s.maestro_id === m.id || 
        (m.user_id && s.maestro_id === m.user_id) || 
        misClaseIds.has(s.clase_id)
      )

      const totalSesiones = misSesiones.length
      const cumplidas = misSesiones.filter((s) => estadosCumplidos.has(s.estado)).length
      const obsCount = (observaciones || []).filter((o) => misClaseIds.has(o.clase_id)).length

      const solvenciaPct = totalSesiones > 0 ? Number(((cumplidas / totalSesiones) * 100).toFixed(2)) : 0
      const scoreDocente = totalSesiones > 0 ? Number((solvenciaPct * 0.8 + Math.min(obsCount / totalSesiones * 100, 100) * 0.2).toFixed(2)) : 0

      return {
        maestro_id: m.id,
        maestro_nombre: m.nombre_completo,
        especialidad: m.especialidad || 'General',
        total_sesiones_semestre: totalSesiones,
        sesiones_cumplidas: cumplidas,
        observaciones_cargadas: obsCount,
        solvencia_registro_pct: solvenciaPct,
        score_docente_global: Math.round(scoreDocente),
      }
    })
    .filter((d) => d.total_sesiones_semestre > 0)
    .sort((a, b) => b.score_docente_global - a.score_docente_global || b.total_sesiones_semestre - a.total_sesiones_semestre)

  return {
    status: 'success',
    tipo: 'semestral',
    periodo: {
      id: periodo?.id || 'periodo-activo',
      nombre: periodo?.nombre || 'Semestre Actual',
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    },
    evolucion_mensual: Object.values(mesesMap),
    cuadro_honor: cuadroHonor.slice(0, 15),
    ranking_ausencias: rankingAusencias.sort((a, b) => b.total_ausencias_injustificadas - a.total_ausencias_injustificadas).slice(0, 15),
    causas_justificaciones: causasJustificaciones,
    retencion_por_catedra: Object.values(catedraMap),
    alumnos_destacados: alumnosDestacados.sort((a, b) => b.merit_score - a.merit_score).slice(0, 15),
    evaluacion_docente: evaluacionDocente,
  }
}

