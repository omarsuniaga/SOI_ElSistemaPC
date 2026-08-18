import { supabase } from '../../../lib/supabaseClient.js'

// ─── RESUMEN POR ALUMNO ──────────────────────────────────────────────────────

export async function getResumenAlumnos() {
  const { data, error } = await supabase
    .from('vw_resumen_alumno')
    .select('*')
    .order('nombre_completo')

  if (error) throw new Error('No se pudo cargar el resumen de alumnos')
  return data
}

export async function getResumenAlumno(alumnoId) {
  const { data, error } = await supabase
    .from('vw_resumen_alumno')
    .select('*')
    .eq('id', alumnoId)
    .single()

  if (error) throw new Error('No se pudo cargar el resumen del alumno')
  return data
}

// ─── RIESGO DE ABANDONO ──────────────────────────────────────────────────────

export async function getRiesgoAbandono({ nivel = null } = {}) {
  let query = supabase
    .from('vw_riesgo_abandono')
    .select('*')
    .order('score_riesgo', { ascending: false })

  if (nivel) query = query.eq('nivel_riesgo', nivel)

  const { data, error } = await query
  if (error) throw new Error('No se pudo cargar el análisis de riesgo')
  return data
}

export async function getAlumnosEnRiesgoAlto() {
  return getRiesgoAbandono({ nivel: 'alto' })
}

// ─── ALERTAS ACTIVAS ─────────────────────────────────────────────────────────

export async function getAlertasActivas({ color = null, alumnoId = null } = {}) {
  let query = supabase
    .from('vw_alertas_activas')
    .select('*')
    .order('fecha_referencia', { ascending: true })

  if (color)    query = query.eq('color', color)
  if (alumnoId) query = query.eq('alumno_id', alumnoId)

  const { data, error } = await query
  if (error) throw new Error('No se pudieron cargar las alertas')
  return data
}

export async function getAlertasRojas() {
  return getAlertasActivas({ color: 'rojo' })
}

export async function getResumenAlertas() {
  const { data, error } = await supabase
    .from('vw_alertas_activas')
    .select('color, tipo_alerta')

  if (error) throw new Error('No se pudo obtener el resumen de alertas')

  return {
    total: data.length,
    rojas:    data.filter(a => a.color === 'rojo').length,
    naranjas: data.filter(a => a.color === 'naranja').length,
    amarillas: data.filter(a => a.color === 'amarillo').length,
    porTipo:  data.reduce((acc, a) => {
      acc[a.tipo_alerta] = (acc[a.tipo_alerta] || 0) + 1
      return acc
    }, {}),
  }
}

// ─── RENDIMIENTO DE MAESTROS ─────────────────────────────────────────────────

export async function getRendimientoMaestros() {
  const { data, error } = await supabase
    .from('vw_rendimiento_maestro')
    .select('*')

  if (error) throw new Error('No se pudo cargar el rendimiento de maestros')
  return data
}

export async function getRendimientoMaestro(maestroId) {
  const { data, error } = await supabase
    .from('vw_rendimiento_maestro')
    .select('*')
    .eq('maestro_id', maestroId)
    .single()

  if (error) throw new Error('No se pudo cargar el rendimiento del maestro')
  return data
}

// ─── PATRÓN DE ASISTENCIA ────────────────────────────────────────────────────

export async function getPatronAsistencia({ instrumento = null } = {}) {
  let query = supabase
    .from('vw_patron_asistencia')
    .select('*')
    .order('dia_semana_num')

  if (instrumento) query = query.eq('instrumento_principal', instrumento)

  const { data, error } = await query
  if (error) throw new Error('No se pudo cargar el patrón de asistencia')
  return data
}

// ─── ESTADÍSTICAS POR PERÍODO ────────────────────────────────────────────────

export async function getEstadisticasPeriodos() {
  const { data, error } = await supabase
    .from('vw_estadisticas_periodo')
    .select('*')

  if (error) throw new Error('No se pudieron cargar las estadísticas por período')
  return data
}

export async function getEstadisticasPeriodoActivo() {
  const { data, error } = await supabase
    .from('vw_estadisticas_periodo')
    .select('*')
    .eq('activo', true)
    .order('fecha_inicio', { ascending: false })
    .limit(1)

  if (error) throw new Error('No se pudieron cargar las estadísticas del período activo: ' + error.message)
  return (data && data.length > 0) ? data[0] : null
}

export async function getResumenCierreAcademico({ periodoId = null, fechaInicio, fechaFin, claseId = null, maestroId = null } = {}) {
  let sesionesQuery = supabase
    .from('sesiones_clase')
    .select(`
      id,
      fecha,
      hora_inicio,
      hora_fin,
      tema_principal,
      observaciones_generales,
      estado,
      clase_id,
      clases (
        id,
        nombre,
        instrumento,
        maestro_principal_id,
        maestros!fk_clases_maestro_principal (
          id,
          nombre_completo
        )
      ),
      asistencias (
        id,
        estado,
        justificacion_texto,
        alumno_id,
        alumnos (
          id,
          nombre_completo
        )
      ),
      contenidos_sesion (
        id,
        descripcion,
        nivel_logro
      )
    `)
    .order('fecha', { ascending: true })
    .order('hora_inicio', { ascending: true })

  if (fechaInicio) sesionesQuery = sesionesQuery.gte('fecha', fechaInicio)
  if (fechaFin) sesionesQuery = sesionesQuery.lte('fecha', fechaFin)
  if (claseId) sesionesQuery = sesionesQuery.eq('clase_id', claseId)

  const { data: sesiones, error: sesionesError } = await sesionesQuery
  if (sesionesError) throw new Error('No se pudo cargar el consolidado de cierre: ' + sesionesError.message)

  const filas = sesiones || []
  const alumnosMap = new Map()
  const clasesMap = new Map()
  const alumnosPorClase = new Map()

  let totalPresentes = 0
  let totalAusentes = 0
  let totalJustificados = 0
  let totalClases = 0
  let totalContenido = 0

  for (const sesion of filas) {
    totalClases += 1
    const clase = sesion.clases || {}
    if (maestroId && String(clase.maestro_principal_id || '') !== String(maestroId)) continue

    const asistencias = Array.isArray(sesion.asistencias) ? sesion.asistencias : []
    const contenidos = Array.isArray(sesion.contenidos_sesion) ? sesion.contenidos_sesion : []
    totalContenido += contenidos.length

    const claseKey = sesion.clase_id
    if (!clasesMap.has(claseKey)) {
      clasesMap.set(claseKey, {
        claseId: claseKey,
        claseNombre: clase.nombre || '—',
        instrumento: clase.instrumento || '—',
        maestroNombre: clase.maestros?.nombre_completo || '—',
        sesiones: 0,
        contenidosTrabajados: 0,
        presentes: 0,
        ausentes: 0,
        justificados: 0,
      })
    }
    const claseAgg = clasesMap.get(claseKey)
    claseAgg.sesiones += 1
    claseAgg.contenidosTrabajados += contenidos.length

    if (!alumnosPorClase.has(claseKey)) alumnosPorClase.set(claseKey, new Map())

    for (const a of asistencias) {
      const alumnoId = a.alumno_id
      const alumnoNombre = a.alumnos?.nombre_completo || '—'
      if (!alumnosMap.has(alumnoId)) {
        alumnosMap.set(alumnoId, {
          alumnoId,
          alumnoNombre,
          presentes: 0,
          ausentes: 0,
          justificados: 0,
          justificaciones: [],
          progreso: 0,
        })
      }
      const alumnoAgg = alumnosMap.get(alumnoId)
      const porClase = alumnosPorClase.get(claseKey)
      if (!porClase.has(alumnoId)) porClase.set(alumnoId, { alumnoId, alumnoNombre, presentes: 0, ausentes: 0, justificados: 0 })
      const claseAlumno = porClase.get(alumnoId)

      if (a.estado === 'presente') { totalPresentes += 1; alumnoAgg.presentes += 1; claseAgg.presentes += 1; claseAlumno.presentes += 1 }
      if (a.estado === 'ausente') { totalAusentes += 1; alumnoAgg.ausentes += 1; claseAgg.ausentes += 1; claseAlumno.ausentes += 1 }
      if (a.estado === 'justificado') {
        totalJustificados += 1
        alumnoAgg.justificados += 1
        claseAgg.justificados += 1
        claseAlumno.justificados += 1
        if (a.justificacion_texto) alumnoAgg.justificaciones.push(a.justificacion_texto)
      }
    }
  }

  const { data: progresos, error: progresosError } = await supabase
    .from('progresos')
    .select('id, alumno_id, clase_id, evaluacion_tipo, estado_cualitativo, calificacion, observaciones, fecha_evaluacion, alumnos(id, nombre_completo), clases(id, nombre, instrumento)')
    .order('fecha_evaluacion', { ascending: false })

  if (progresosError) throw new Error('No se pudo cargar el progreso académico: ' + progresosError.message)

  const progresoPorAlumno = new Map()
  for (const p of (progresos || [])) {
    const alumnoId = p.alumno_id
    if (!alumnoId) continue
    if (!progresoPorAlumno.has(alumnoId)) {
      progresoPorAlumno.set(alumnoId, {
        alumnoId,
        alumnoNombre: p.alumnos?.nombre_completo || '—',
        totalRegistros: 0,
        promedio: 0,
        estados: {},
        observaciones: [],
      })
    }
    const agg = progresoPorAlumno.get(alumnoId)
    agg.totalRegistros += 1
    if (p.calificacion != null) agg.promedio += Number(p.calificacion)
    agg.estados[p.estado_cualitativo || 'sin_estado'] = (agg.estados[p.estado_cualitativo || 'sin_estado'] || 0) + 1
    if (p.observaciones) agg.observaciones.push(p.observaciones)
  }

  const alumnos = Array.from(alumnosMap.values()).map((a) => {
    const prog = progresoPorAlumno.get(a.alumnoId)
    return {
      ...a,
      promedioProgreso: prog && prog.totalRegistros ? (prog.promedio / prog.totalRegistros) : null,
      totalRegistrosProgreso: prog?.totalRegistros || 0,
      estadosProgreso: prog?.estados || {},
      observacionesProgreso: prog?.observaciones || [],
      tasaAsistencia: (a.presentes + a.ausentes + a.justificados) > 0
        ? ((a.presentes + a.justificados) / (a.presentes + a.ausentes + a.justificados)) * 100
        : null,
    }
  })

  return {
    periodoId: periodoId || null,
    rango: { fechaInicio: fechaInicio || null, fechaFin: fechaFin || null },
    resumen: {
      totalClases,
      totalContenido,
      totalPresentes,
      totalAusentes,
      totalJustificados,
      totalAlumnos: alumnos.length,
    },
    clases: Array.from(clasesMap.values()),
    alumnos,
  }
}

export async function cerrarPeriodoAcademico({ periodoId, fechaInicio, fechaFin, cerradoPor = null, observaciones = null } = {}) {
  const payload = {
    p_periodo_id: periodoId,
    p_fecha_inicio: fechaInicio || null,
    p_fecha_fin: fechaFin || null,
    p_cerrado_por: cerradoPor || null,
    p_observaciones: observaciones || null,
  }

  const { data, error } = await supabase.rpc('fn_cerrar_periodo_academico', payload)
  if (error) throw new Error('No se pudo cerrar el período académico: ' + error.message)
  return data
}

export async function getCierresAcademicos({ limit = 20 } = {}) {
  const { data, error } = await supabase
    .from('periodos_cierre_auditoria')
    .select(`
      id,
      periodo_id,
      fecha_inicio,
      fecha_fin,
      cerrado_por,
      observaciones,
      resumen,
      snapshot,
      created_at,
      periodos (
        id,
        nombre,
        activo,
        cerrado,
        cerrado_at
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error('No se pudo cargar el historial de cierres: ' + error.message)
  return data || []
}

// ─── DESTACADOS Y RIESGO ACADÉMICO ──────────────────────────────────────────


// ─── DESTACADOS Y RIESGO ACADÉMICO ──────────────────────────────────────────

export async function getDestacadosYRiesgoAcademico({ categoria = null } = {}) {
  let query = supabase
    .from('vw_destacados_y_riesgo_academico')
    .select('*')

  if (categoria) query = query.eq('categoria', categoria)

  const { data, error } = await query
  if (error) throw new Error('No se pudo cargar el análisis académico')
  return data
}

export async function getAlumnosDestacados() {
  return getDestacadosYRiesgoAcademico({ categoria: 'destacado' })
}

export async function getAlumnosEnRiesgoAcademico() {
  return getDestacadosYRiesgoAcademico({ categoria: 'riesgo_academico' })
}

// ─── FUNCIONES CALCULADAS ────────────────────────────────────────────────────

export async function getRachaAusencias(alumnoId) {
  const { data, error } = await supabase
    .rpc('fn_racha_ausencias', { p_alumno_id: alumnoId })

  if (error) throw new Error('No se pudo calcular la racha de ausencias')
  return data
}

export async function getTasaAsistenciaPeriodo(alumnoId, desde, hasta = null) {
  const params = { p_alumno_id: alumnoId, p_desde: desde }
  if (hasta) params.p_hasta = hasta

  const { data, error } = await supabase
    .rpc('fn_tasa_asistencia_periodo', params)

  if (error) throw new Error('No se pudo calcular la tasa de asistencia')
  return data
}

export async function getCorrelacionAsistenciaRendimiento() {
  const { data, error } = await supabase
    .rpc('fn_correlacion_asistencia_rendimiento')

  if (error) throw new Error('No se pudo calcular la correlación')
  return data
}


// ─── HISTORIAL DE ESTADO ─────────────────────────────────────────────────────

export async function getHistorialEstadoAlumno(alumnoId) {
  const { data, error } = await supabase
    .from('historial_estado_alumno')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('fecha', { ascending: false })

  if (error) throw new Error('No se pudo cargar el historial')
  return data
}

export async function registrarCambioEstadoAlumno(alumnoId, estado, motivo, registradoPor = null) {
  const estadosValidos = ['activo', 'baja_voluntaria', 'baja_academica', 'suspendido', 'egresado']
  if (!estadosValidos.includes(estado)) throw new Error('Estado no válido')

  const { data, error } = await supabase
    .from('historial_estado_alumno')
    .insert([{
      alumno_id:     alumnoId,
      estado,
      motivo:        motivo?.trim() || null,
      registrado_por: registradoPor || null,
      fecha:         new Date().toISOString().split('T')[0],
    }])
    .select()

  if (error) throw new Error('No se pudo registrar el cambio de estado')
  return data[0]
}

// ─── ANÁLISIS DE ASISTENCIAS E INASISTENCIAS DEL PERÍODO ACTIVO ──────────────

export async function getAnalisisAsistenciasPeriodoActivo({ periodoId = null, fechaInicio = null, fechaFin = null } = {}) {
  let pInicio = fechaInicio
  let pFin = fechaFin
  let pNombre = 'Período Activo'
  let pId = periodoId
  let pActivo = true

  if (!pInicio) {
    try {
      const { data: periodoData } = await supabase
        .from('periodos')
        .select('*')
        .eq('activo', true)
        .order('fecha_inicio', { ascending: false })
        .limit(1)

      if (periodoData && periodoData.length > 0) {
        pInicio = periodoData[0].fecha_inicio
        pFin = periodoData[0].fecha_fin
        pNombre = periodoData[0].nombre || 'Período Activo'
        pId = periodoData[0].id
        pActivo = periodoData[0].activo
      }
    } catch (e) {
      // Ignorar
    }

    if (!pInicio) {
      try {
        const statsActivo = await getEstadisticasPeriodoActivo()
        if (statsActivo) {
          pInicio = statsActivo.fecha_inicio
          pFin = statsActivo.fecha_fin
          pNombre = statsActivo.nombre || 'Período Activo'
          pId = statsActivo.id || statsActivo.periodo_id
          pActivo = statsActivo.activo ?? true
        }
      } catch (e) {
        // Ignorar
      }
    }
  }

  // Fallback seguro a primer día del año actual si aún no hay periodo configurado
  if (!pInicio) {
    const ahora = new Date()
    pInicio = `${ahora.getFullYear()}-01-01`
  }

  let sesionesQuery = supabase
    .from('sesiones_clase')
    .select(`
      id,
      fecha,
      hora_inicio,
      hora_fin,
      tema_principal,
      observaciones_generales,
      estado,
      clase_id,
      maestro_id,
      clases (
        id,
        nombre,
        instrumento,
        maestro_principal_id,
        maestros!fk_clases_maestro_principal (
          id,
          nombre_completo
        )
      ),
      asistencias (
        id,
        estado,
        justificacion_texto,
        observaciones,
        alumno_id,
        alumnos (
          id,
          nombre_completo,
          instrumento_principal,
          programa
        )
      )
    `)
    .gte('fecha', pInicio)

  if (pFin) {
    sesionesQuery = sesionesQuery.lte('fecha', pFin)
  }

  sesionesQuery = sesionesQuery.order('fecha', { ascending: false })

  const { data: sesiones, error: sesionesError } = await sesionesQuery

  if (sesionesError) throw new Error('No se pudo cargar el análisis de asistencias: ' + sesionesError.message)

  const filas = sesiones || []
  const alumnosMap = new Map()
  const maestrosMap = new Map()

  let totalPresentes = 0
  let totalAusentes = 0
  let totalJustificados = 0
  let totalTardes = 0
  let totalRegistros = 0
  let totalSesiones = filas.length

  for (const sesion of filas) {
    const clase = sesion.clases || {}
    const maestroId = clase.maestro_principal_id || sesion.maestro_id || 'sin_maestro'
    const maestroNombre = clase.maestros?.nombre_completo || sesion.maestro_nombre || 'Docente asignado'
    const claseNombre = clase.nombre || 'Clase general'
    const instrumento = clase.instrumento || 'General'

    if (!maestrosMap.has(maestroId)) {
      maestrosMap.set(maestroId, {
        maestroId,
        maestroNombre,
        totalSesiones: 0,
        totalRegistros: 0,
        totalPresentes: 0,
        totalAusentes: 0,
        totalJustificados: 0,
        totalTardes: 0,
        tasaAusentismo: 0,
        clases: new Set(),
      })
    }
    const maestroAgg = maestrosMap.get(maestroId)
    maestroAgg.totalSesiones += 1
    maestroAgg.clases.add(claseNombre)

    const asistencias = Array.isArray(sesion.asistencias) ? sesion.asistencias : []

    for (const a of asistencias) {
      totalRegistros += 1
      maestroAgg.totalRegistros += 1

      const alumnoId = a.alumno_id
      if (!alumnoId) continue

      const alumnoNombre = a.alumnos?.nombre_completo || 'Alumno'
      const alumnoInstrumento = a.alumnos?.instrumento_principal || instrumento || '—'
      const alumnoPrograma = a.alumnos?.programa || 'Académico'

      if (!alumnosMap.has(alumnoId)) {
        alumnosMap.set(alumnoId, {
          alumnoId,
          alumnoNombre,
          instrumento: alumnoInstrumento,
          programa: alumnoPrograma,
          totalPresentes: 0,
          totalAusentes: 0,
          totalJustificados: 0,
          totalTardes: 0,
          totalRegistros: 0,
          tasaAsistencia: 100,
          nivelRiesgo: 'normal',
          ultimaFalta: null,
          clasesAfectadas: new Set(),
          maestrosReportaron: new Set(),
          detalleFaltas: [],
        })
      }

      const alumnoAgg = alumnosMap.get(alumnoId)
      alumnoAgg.totalRegistros += 1

      const estado = (a.estado || '').toLowerCase()

      if (estado === 'presente') {
        totalPresentes += 1
        alumnoAgg.totalPresentes += 1
        maestroAgg.totalPresentes += 1
      } else if (estado === 'ausente') {
        totalAusentes += 1
        alumnoAgg.totalAusentes += 1
        maestroAgg.totalAusentes += 1
        alumnoAgg.clasesAfectadas.add(claseNombre)
        alumnoAgg.maestrosReportaron.add(maestroNombre)
        if (!alumnoAgg.ultimaFalta || sesion.fecha > alumnoAgg.ultimaFalta) {
          alumnoAgg.ultimaFalta = sesion.fecha
        }
        alumnoAgg.detalleFaltas.push({
          fecha: sesion.fecha,
          claseNombre,
          maestroNombre,
          estado: 'ausente',
          justificacion: a.justificacion_texto || a.observaciones || null,
        })
      } else if (estado === 'justificado') {
        totalJustificados += 1
        alumnoAgg.totalJustificados += 1
        maestroAgg.totalJustificados += 1
        alumnoAgg.detalleFaltas.push({
          fecha: sesion.fecha,
          claseNombre,
          maestroNombre,
          estado: 'justificado',
          justificacion: a.justificacion_texto || a.observaciones || 'Justificación médica/personal',
        })
      } else if (estado === 'tarde') {
        totalTardes += 1
        alumnoAgg.totalTardes += 1
        maestroAgg.totalTardes += 1
        alumnoAgg.totalPresentes += 1
      }
    }
  }

  const alumnosList = Array.from(alumnosMap.values()).map((al) => {
    const totalEvaluados = al.totalRegistros || 0
    const tasa = totalEvaluados > 0
      ? (((al.totalPresentes + al.totalJustificados) / totalEvaluados) * 100)
      : 100

    let nivelRiesgo = 'normal'
    if (al.totalAusentes >= 3 || tasa < 75) {
      nivelRiesgo = 'critico'
    } else if (al.totalAusentes >= 1 || tasa < 85) {
      nivelRiesgo = 'alerta'
    }

    return {
      ...al,
      tasaAsistencia: Number(tasa.toFixed(1)),
      nivelRiesgo,
      clasesAfectadas: Array.from(al.clasesAfectadas),
      maestrosReportaron: Array.from(al.maestrosReportaron),
    }
  }).sort((a, b) => b.totalAusentes - a.totalAusentes || a.tasaAsistencia - b.tasaAsistencia)

  const maestrosList = Array.from(maestrosMap.values()).map((m) => {
    const tasaAus = m.totalRegistros > 0
      ? ((m.totalAusentes / m.totalRegistros) * 100)
      : 0
    return {
      ...m,
      tasaAusentismo: Number(tasaAus.toFixed(1)),
      clases: Array.from(m.clases),
    }
  }).sort((a, b) => b.totalAusentes - a.totalAusentes || b.totalSesiones - a.totalSesiones)

  const totalAlumnosEvaluados = alumnosList.length
  const alumnosConFaltas = alumnosList.filter((a) => a.totalAusentes > 0).length
  const alumnosSinFaltas = totalAlumnosEvaluados - alumnosConFaltas
  const porcentajeAlumnosConFaltas = totalAlumnosEvaluados > 0
    ? Number(((alumnosConFaltas / totalAlumnosEvaluados) * 100).toFixed(1))
    : 0
  const tasaAusentismo = totalRegistros > 0
    ? Number(((totalAusentes / totalRegistros) * 100).toFixed(1))
    : 0

  const inicioDate = new Date(pInicio)
  const ahoraDate = new Date()
  const diffTime = Math.abs(ahoraDate - inicioDate)
  const diasTranscurridos = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return {
    periodo: {
      id: pId,
      nombre: pNombre,
      fecha_inicio: pInicio,
      fecha_fin: pFin,
      activo: pActivo,
      dias_transcurridos: diasTranscurridos,
    },
    resumen: {
      totalAlumnosEvaluados,
      alumnosConFaltas,
      alumnosSinFaltas,
      porcentajeAlumnosConFaltas,
      totalRegistros,
      totalPresentes,
      totalAusentes,
      totalJustificados,
      totalTardes,
      tasaAusentismo,
      totalSesionesRegistradas: totalSesiones,
      totalMaestrosConRegistros: maestrosList.length,
    },
    alumnos: alumnosList,
    maestros: maestrosList,
  }
}

// ─── ALERTAS DE ASISTENCIA (DASHBOARD OPERACIONES) ──────────────────────

export async function getStudentAbsencesSummary(daysBack = 7) {
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - daysBack * 24 * 60 * 60 * 1000)
  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  // Query absences directly from asistencias (real table name, real column names)
  const { data: absences, error: absencesError } = await supabase
    .from('asistencias')
    .select(`
      id,
      fecha,
      alumno_id,
      clase_id,
      sesion_clase_id,
      alumnos(id, nombre_completo, representante_tlf, representante_nombre),
      clases(nombre)
    `)
    .gte('fecha', startDateStr)
    .lte('fecha', endDateStr)
    .eq('estado', 'ausente')

  if (absencesError) throw new Error('No se pudieron cargar los registros de asistencia')
  if (!absences || absences.length === 0) {
    return { periodo_dias: daysBack, fecha_inicio: startDate.toISOString(), fecha_fin: endDate.toISOString(), total_alumnos_con_faltas: 0, alumnos: [] }
  }

  // Agrupar por alumno
  const studentAbsences = new Map()
  absences.forEach(record => {
    const alumno = record.alumnos
    if (!alumno) return

    const key = alumno.id
    if (!studentAbsences.has(key)) {
      studentAbsences.set(key, {
        id: alumno.id,
        nombre: alumno.nombre_completo,
        representante_phone: alumno.representante_tlf,
        faltas_periodo: 0,
        clases_ausente: [],
        total_faltas_historico: 0,
      })
    }

    const entry = studentAbsences.get(key)
    entry.faltas_periodo++
    entry.clases_ausente.push({
      grupo: record.clases?.nombre || 'Clase',
      fecha: record.fecha,
    })
  })

  // Obtener total histórico de faltas por alumno (solo para los alumnos encontrados)
  const alumnoIds = Array.from(studentAbsences.keys())
  const { data: allAbsences } = await supabase
    .from('asistencias')
    .select('alumno_id')
    .in('alumno_id', alumnoIds)
    .eq('estado', 'ausente')

  if (allAbsences) {
    const absenceCount = new Map()
    allAbsences.forEach(r => {
      absenceCount.set(r.alumno_id, (absenceCount.get(r.alumno_id) || 0) + 1)
    })
    studentAbsences.forEach((student, key) => {
      student.total_faltas_historico = absenceCount.get(key) || 0
    })
  }

  const resultado = Array.from(studentAbsences.values())
    .sort((a, b) => b.faltas_periodo - a.faltas_periodo)

  return {
    periodo_dias: daysBack,
    fecha_inicio: startDate.toISOString(),
    fecha_fin: endDate.toISOString(),
    total_alumnos_con_faltas: resultado.length,
    alumnos: resultado,
  }
}

export async function getIncompleteClassSessions() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Lunes de la semana actual
  const mondayDate = new Date(today)
  const dayOfWeek = today.getDay()
  mondayDate.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

  const mondayStr = mondayDate.toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]

  // Sesiones de esta semana que NO tienen asistencia registrada (estados incompletos)
  const { data: sessions, error: sessionsError } = await supabase
    .from('sesiones_clase')
    .select(`
      id,
      fecha,
      hora_inicio,
      estado,
      maestro_id,
      clase_id,
      clases(nombre),
      maestros(nombre_completo, whatsapp, phone)
    `)
    .gte('fecha', mondayStr)
    .lte('fecha', todayStr)
    .not('estado', 'in', '("asistencia_registrada","cerrada","progreso_registrado","cancelada")')

  if (sessionsError) throw new Error('No se pudieron cargar las sesiones')
  if (!sessions || sessions.length === 0) return { sesiones_incompletas: [], total: 0 }

  const incomplete = sessions.map(s => ({
    id: s.id,
    fecha: s.fecha,
    grupo: s.clases?.nombre || 'Clase',
    hora: s.hora_inicio,
    estado: s.estado,
    maestro_id: s.maestro_id,
    maestro_nombre: s.maestros?.nombre_completo,
    maestro_whatsapp: s.maestros?.whatsapp,
    maestro_phone: s.maestros?.phone,
  })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  return {
    semana_inicio: mondayDate.toISOString(),
    semana_fin: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    total_incompletas: incomplete.length,
    sesiones_incompletas: incomplete,
  }
}
