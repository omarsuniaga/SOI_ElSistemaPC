import { supabase } from '../../../lib/supabaseClient.js'

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

export const ESTADOS = {
  PRESENTE: 'presente',
  AUSENTE: 'ausente',
  JUSTIFICADO: 'justificado',
  TARDE: 'tarde',
}

const ESTADO_MAP = {
  P: ESTADOS.PRESENTE,
  A: ESTADOS.AUSENTE,
  J: ESTADOS.JUSTIFICADO,
  T: ESTADOS.TARDE,
  presente: ESTADOS.PRESENTE,
  ausente: ESTADOS.AUSENTE,
  justificado: ESTADOS.JUSTIFICADO,
  tarde: ESTADOS.TARDE,
}

function mapEstado(estado) {
  if (!estado) return ESTADOS.PRESENTE
  return ESTADO_MAP[estado] || estado
}

export const ESTADO_LABEL = {
  presente: { short: 'P', label: 'Presente', css: 'success' },
  ausente: { short: 'A', label: 'Ausente', css: 'danger' },
  justificado: { short: 'J', label: 'Justificado', css: 'warning' },
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function throwError(msg, err) {
  console.error(msg, err?.message)
  throw new Error(msg)
}

function isUniqueConstraintError(error) {
  const message = error?.message?.toLowerCase() || ''
  return (
    message.includes('unique constraint') ||
    message.includes('duplicate key') ||
    message.includes('uk_asistencias') ||
    (message.includes('unique') && message.includes('duplicate'))
  )
}

// ─── 1. TIMELINE AGRUPADO POR FECHA ─────────────────────────────────────────

export async function getSesionesPorRango({
  fechaInicio,
  fechaFin,
  periodoId,
  claseId,
  maestroId,
} = {}) {
  let query = supabase
    .from('sesiones_clase')
    .select(
      `
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
        estado
      )
    `,
    )
    .order('fecha', { ascending: false })
    .order('hora_inicio', { ascending: true })

  if (fechaInicio) query = query.gte('fecha', fechaInicio)
  if (fechaFin) query = query.lte('fecha', fechaFin)
  if (claseId) query = query.eq('clase_id', claseId)

  if (periodoId) {
    const { data: periodo } = await supabase
      .from('periodos')
      .select('fecha_inicio, fecha_fin')
      .eq('id', periodoId)
      .single()

    if (periodo) {
      if (!fechaInicio) query = query.gte('fecha', periodo.fecha_inicio)
      if (!fechaFin) query = query.lte('fecha', periodo.fecha_fin)
    }
  }

  const { data, error } = await query
  if (error) throwError('No se pudieron cargar las sesiones', error)

  const sesiones = (data || []).map((sc) => {
    const ayudas = sc.asistencias || []
    return {
      sesionId: sc.id,
      fecha: sc.fecha,
      horaInicio: sc.hora_inicio,
      horaFin: sc.hora_fin,
      temaPrincipal: sc.tema_principal,
      observacionesGenerales: sc.observaciones_generales,
      estado: sc.estado,
      claseId: sc.clase_id,
      claseNombre: sc.clases?.nombre ?? '—',
      instrumento: sc.clases?.instrumento ?? '—',
      maestroId: sc.clases?.maestro_principal_id ?? null,
      maestroNombre: sc.clases?.maestros?.nombre_completo ?? '—',
      totalPresentes: ayudas.filter((a) => a.estado === ESTADOS.PRESENTE).length,
      totalAusentes: ayudas.filter((a) => a.estado === ESTADOS.AUSENTE).length,
      totalJustificados: ayudas.filter((a) => a.estado === ESTADOS.JUSTIFICADO).length,
      totalRegistros: ayudas.length,
    }
  })

  let sesionesFiltradas = sesiones
  if (maestroId) {
    sesionesFiltradas = sesiones.filter((s) => {
      return s.maestroId && s.maestroId.toString() === maestroId.toString()
    })
  }

  return agruparPorFecha(sesionesFiltradas)
}

function agruparPorFecha(sesiones) {
  const map = new Map()
  for (const s of sesiones) {
    if (!map.has(s.fecha)) map.set(s.fecha, [])
    map.get(s.fecha).push(s)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([fecha, sesiones]) => ({ fecha, sesiones }))
}

// ─── 2. DETALLE COMPLETO DE UNA SESIÓN ──────────────────────────────────────

export async function getDetalleSesion(sesionId) {
  if (!sesionId) throwError('Se requiere sesionId')

  const { data: sc, error: errSc } = await supabase
    .from('sesiones_clase')
    .select(
      `
      id, fecha, hora_inicio, hora_fin,
      tema_principal, observaciones_generales, estado,
      clases (
        nombre, instrumento,
        maestros!fk_clases_maestro_principal ( nombre_completo )
      )
    `,
    )
    .eq('id', sesionId)
    .single()

  if (errSc) throwError('No se pudo cargar la sesión', errSc)

  const { data: asistencias, error: errA } = await supabase
    .from('asistencias')
    .select(
      `
      id, estado, justificacion_texto, observaciones, alumno_id,
      alumnos ( id, nombre_completo )
    `,
    )
    .eq('sesion_clase_id', sesionId)
    .order('alumnos(nombre_completo)', { ascending: true })

  if (errA) throwError('No se pudieron cargar las asistencias', errA)

  const { data: justificaciones } = await supabase
    .from('justificaciones')
    .select('motivo, descripcion, archivo_url, estado, alumno_id')
    .eq('sesion_id', sesionId)

  const justificacionesMap = {}
  if (justificaciones) {
    justificaciones.forEach((j) => {
      justificacionesMap[j.alumno_id] = j
    })
  }

  const { data: observaciones, error: errO } = await supabase
    .from('observaciones_alumnos')
    .select(
      `
      id, tipo, observacion, titulo, descripcion, prioridad,
      alumnos ( id, nombre_completo )
    `,
    )
    .eq('sesion_clase_id', sesionId)

  if (errO) throwError('No se pudieron cargar las observaciones', errO)

  const { data: contenidos, error: errC } = await supabase
    .from('contenidos_sesion')
    .select(
      `
      id, descripcion, nivel_logro,
      planificaciones ( titulo, contenidos )
    `,
    )
    .eq('sesion_clase_id', sesionId)

  if (errC) throwError('No se pudieron cargar los contenidos', errC)

  return {
    sesion: {
      id: sc.id,
      fecha: sc.fecha,
      horaInicio: sc.hora_inicio,
      horaFin: sc.hora_fin,
      temaPrincipal: sc.tema_principal,
      observacionesGenerales: sc.observaciones_generales,
      estado: sc.estado,
      claseNombre: sc.clases?.nombre ?? '—',
      instrumento: sc.clases?.instrumento ?? '—',
      maestroNombre: sc.clases?.maestros?.nombre_completo ?? '—',
    },
    asistencias: (asistencias || []).map((a) => ({
      id: a.id,
      estado: a.estado,
      justificacionTexto: a.justificacion_texto,
      observacion: a.observaciones,
      alumnoId: a.alumno_id,
      alumnoNombre: a.alumnos?.nombre_completo ?? '—',
      justificacion: justificacionesMap[a.alumno_id] ?? null,
    })),
    observaciones: (observaciones || []).map((o) => ({
      id: o.id,
      tipo: o.tipo,
      titulo: o.titulo,
      descripcion: o.descripcion ?? o.observacion,
      prioridad: o.prioridad,
      alumnoId: o.alumnos?.id,
      alumnoNombre: o.alumnos?.nombre_completo ?? '—',
    })),
    contenidos: (contenidos || []).map((c) => ({
      id: c.id,
      descripcion: c.descripcion,
      nivelLogro: c.nivel_logro,
      planTitulo: c.planificaciones?.titulo,
    })),
  }
}

// ─── 3. REPORTE COMPLETO DEL PERÍODO ─────────────────────────────────────────

export async function getReporteCompleto({ fechaInicio, fechaFin, periodoId } = {}) {
  const grupos = await getSesionesPorRango({ fechaInicio, fechaFin, periodoId })
  const sesionIds = grupos.flatMap((g) => g.sesiones.map((s) => s.sesionId))

  if (sesionIds.length === 0) return { grupos: [], sesiones: [], resumen: _resumenVacio() }

  const { data: asistencias, error } = await supabase
    .from('asistencias')
    .select(
      `
      id, estado, justificacion_texto, sesion_clase_id, alumno_id,
      alumnos ( id, nombre_completo )
    `,
    )
    .in('sesion_clase_id', sesionIds)
    .order('alumnos(nombre_completo)', { ascending: true })

  if (error) throwError('No se pudo generar el reporte', error)

  const { data: justificacionesData } = await supabase
    .from('justificaciones')
    .select('motivo, descripcion, alumno_id, sesion_id')
    .in('sesion_id', sesionIds)

  const justificacionesMap = {}
  if (justificacionesData) {
    justificacionesData.forEach((j) => {
      justificacionesMap[`${j.sesion_id}_${j.alumno_id}`] = j
    })
  }

  const asistenciasPorSesion = {}
  for (const a of asistencias || []) {
    if (!asistenciasPorSesion[a.sesion_clase_id]) {
      asistenciasPorSesion[a.sesion_clase_id] = []
    }
    asistenciasPorSesion[a.sesion_clase_id].push({
      alumnoNombre: a.alumnos?.nombre_completo ?? '—',
      estado: a.estado,
      justificacionTexto: a.justificacion_texto,
      justificacionMotivo:
        justificacionesMap[`${a.sesion_clase_id}_${a.alumno_id}`]?.motivo ?? null,
    })
  }

  const gruposConDetalle = grupos.map((grupo) => ({
    fecha: grupo.fecha,
    sesiones: grupo.sesiones.map((s) => ({
      ...s,
      alumnos: asistenciasPorSesion[s.sesionId] || [],
    })),
  }))

  const todasAsistencias = asistencias || []
  const resumen = {
    totalSesiones: sesionIds.length,
    totalRegistros: todasAsistencias.length,
    totalPresentes: todasAsistencias.filter((a) => a.estado === ESTADOS.PRESENTE).length,
    totalAusentes: todasAsistencias.filter((a) => a.estado === ESTADOS.AUSENTE).length,
    totalJustificados: todasAsistencias.filter((a) => a.estado === ESTADOS.JUSTIFICADO).length,
  }

  return { grupos: gruposConDetalle, resumen }
}

function _resumenVacio() {
  return {
    totalSesiones: 0,
    totalRegistros: 0,
    totalPresentes: 0,
    totalAusentes: 0,
    totalJustificados: 0,
  }
}

// ─── 4. PERÍODOS Y OTROS FILTROS ──────────────────────────────────────────────

export async function getPeriodos() {
  const { data, error } = await supabase
    .from('periodos')
    .select('id, nombre, fecha_inicio, fecha_fin, activo')
    .order('fecha_inicio', { ascending: false })

  if (error) throwError('No se pudieron cargar los períodos', error)
  return data || []
}

export async function getPeriodoActivo() {
  try {
    const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'
    if (isTestEnv) return null

    const { data, error } = await supabase
      .from('periodos')
      .select('id, nombre, fecha_inicio, fecha_fin')
      .eq('activo', true)
      .single()

    if (error) return null
    return data
  } catch (e) {
    return null
  }
}

/**
 * Evalúa si un maestro ha completado el 100% de las asistencias de su período académico.
 * Retorna { esCompleto, pendientesCount, totalCount }.
 */
export async function obtenerEstadoCumplimientoMaestro(maestroId, periodoId = null) {
  if (!maestroId) return { esCompleto: true, pendientesCount: 0, totalCount: 0 }

  try {
    const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'
    if (isTestEnv) return { esCompleto: true, pendientesCount: 0, totalCount: 0 }

    let periodo = null
    if (periodoId) {
      const { data } = await supabase.from('periodos').select('*').eq('id', periodoId).single()
      periodo = data
    }
    if (!periodo) {
      periodo = await getPeriodoActivo()
    }

    let query = supabase
      .from('sesiones_clase')
      .select('id, fecha, borrador, estado, asistencia')
      .eq('maestro_id', maestroId)

    if (periodo?.fecha_inicio) {
      query = query.gte('fecha', periodo.fecha_inicio)
    }
    if (periodo?.fecha_fin) {
      query = query.lte('fecha', periodo.fecha_fin)
    }

    const { data: sesiones, error } = await query
    if (error || !sesiones || sesiones.length === 0) {
      return { esCompleto: true, pendientesCount: 0, totalCount: 0 }
    }

    let pendientesCount = 0
    sesiones.forEach((s) => {
      const tieneAsistencia = Array.isArray(s.asistencia) && s.asistencia.length > 0
      const esCompletada = !s.borrador && s.estado !== 'pendiente' && (s.estado === 'registrada' || s.estado === 'cerrada' || tieneAsistencia)
      if (!esCompletada) {
        pendientesCount++
      }
    })

    return {
      esCompleto: pendientesCount === 0,
      pendientesCount,
      totalCount: sesiones.length,
    }
  } catch (e) {
    return { esCompleto: true, pendientesCount: 0, totalCount: 0 }
  }
}

export async function getClases() {
  const { data, error } = await supabase
    .from('clases')
    .select('id, nombre, instrumento')
    .order('nombre', { ascending: true })

  if (error) throwError('No se pudieron cargar las clases', error)
  return data || []
}

export async function getMaestros() {
  const { data, error } = await supabase
    .from('maestros')
    .select('id, nombre_completo')
    .eq('activo', true)
    .order('nombre_completo', { ascending: true })

  if (error) throwError('No se pudieron cargar los maestros', error)
  return data || []
}

// ─── 5. CRUD LEGACY ──────────────────────────────────────────────────────────

export async function obtenerAsistencias() {
  const { data, error } = await supabase
    .from('asistencias')
    .select('*')
    .order('fecha', { ascending: false })
  if (error) throwError('No se pudieron cargar las asistencias', error)
  return data
}

export async function obtenerAsistencia(id) {
  const { data, error } = await supabase.from('asistencias').select('*').eq('id', id).single()
  if (error) throwError('No se pudo cargar la asistencia', error)
  return data
}

export async function crearAsistencia(asistencia) {
  const estadosValidos = Object.values(ESTADOS)
  if (!asistencia.clase_id) throwError('La clase es obligatoria')
  if (!asistencia.alumno_id) throwError('El alumno es obligatorio')
  if (!asistencia.fecha) throwError('La fecha es obligatoria')
  if (!asistencia.estado || !estadosValidos.includes(asistencia.estado)) {
    throwError(`Estado inválido. Debe ser: ${estadosValidos.join(', ')}`)
  }

  const { data, error } = await supabase
    .from('asistencias')
    .insert([
      {
        clase_id: asistencia.clase_id,
        alumno_id: asistencia.alumno_id,
        fecha: asistencia.fecha,
        estado: asistencia.estado,
        justificacion_texto: (asistencia.justificacion_texto || '').trim() || null,
        observaciones: (asistencia.observaciones || '').trim() || null,
        ...(asistencia.sesion_clase_id ? { sesion_clase_id: asistencia.sesion_clase_id } : {}),
        ...(asistencia.registrado_por ? { registrado_por: asistencia.registrado_por } : {}),
      },
    ])
    .select()
  if (error) throwError('No se pudo crear la asistencia', error)
  return data[0]
}

export async function registrarAsistenciaBulk(asistencias) {
  if (!asistencias?.length) throwError('No hay asistencias para registrar')

  const alumnoIds = [...new Set(asistencias.map((a) => a.alumno_id))]
  if (alumnoIds.some((id) => !id)) {
    throwError('Todas las asistencias deben tener alumno_id')
  }

  const { data: estudiantesExistentes, error: errorEstudiantes } = await supabase
    .from('alumnos')
    .select('id')
    .in('id', alumnoIds)

  if (errorEstudiantes) {
    throwError('No se pudo validar alumnos en la base de datos', errorEstudiantes)
  }

  const alumnosValidosSet = new Set(estudiantesExistentes?.map((e) => e.id) || [])
  const alumnosInvalidos = alumnoIds.filter((id) => !alumnosValidosSet.has(id))

  if (alumnosInvalidos.length > 0) {
    throwError(`Los siguientes alumnos no existen: ${alumnosInvalidos.join(', ')}`)
  }

  const records = asistencias
    .filter((a) => {
      if (!a.sesion_clase_id) {
        console.warn(
          `[asistenciasApi] Saltando alumno ${a.alumno_id} sin sesion_clase_id (se sincronizará vía offline queue)`,
        )
        return false
      }
      return true
    })
    .map((a) => {
      if (!a.clase_id) {
        throw new Error(`clase_id es requerido para alumno ${a.alumno_id}`)
      }
      if (!a.fecha) {
        throw new Error(`fecha es requerido para alumno ${a.alumno_id}`)
      }
      return {
        sesion_clase_id: a.sesion_clase_id,
        clase_id: a.clase_id,
        alumno_id: a.alumno_id,
        fecha: a.fecha,
        estado: mapEstado(a.estado),
        justificacion_texto: (a.justificacion_texto || '').trim() || null,
        observaciones: (a.observaciones || '').trim() || null,
        ...(a.registrado_por ? { registrado_por: a.registrado_por } : {}),
      }
    })

  if (records.length === 0) {
    console.warn('[asistenciasApi] No hay registros válidos con sesion_clase_id para insertar')
    return []
  }

  const { data, error } = await supabase
    .from('asistencias')
    .upsert(records, { onConflict: 'clase_id,alumno_id,fecha' })
    .select()

  if (error && isUniqueConstraintError(error)) {
    console.warn(
      '[registrarAsistenciaBulk] Constraint detected, trying plain INSERT:',
      error.message,
    )
    const { data: insertData, error: insertError } = await supabase
      .from('asistencias')
      .insert(records, { returning: 'returning' })
      .select()

    if (insertError) {
      throwError('No se pudieron registrar las asistencias (UPSERT y INSERT fallidos)', error)
    }
    return insertData || []
  }

  if (error) throwError('No se pudieron registrar las asistencias', error)
  return data
}

// ─── REPORTE CONSOLIDADO POR CLASE ──────────────────────────────────────

export async function getReporteConsolidado({ periodoId, fecha, claseId } = {}) {
  try {
    let periodoFechaInicio, periodoFechaFin
    if (periodoId) {
      const { data: periodo, error: errPeriodo } = await supabase
        .from('periodos')
        .select('fecha_inicio, fecha_fin')
        .eq('id', periodoId)
        .single()
      if (errPeriodo) {
        console.warn('No se pudo cargar el período, mostrando todas las sesiones', errPeriodo)
      }
      if (periodo) {
        periodoFechaInicio = periodo.fecha_inicio
        periodoFechaFin = periodo.fecha_fin
      }
    }

    let query = supabase.from('vw_asistencias_consolidada').select(`
        fecha,
        sesion_clase_id,
        clase_id,
        nombre_clase,
        hora_inicio,
        hora_fin,
        borrador,
        maestro_principal,
        maestro_auxiliar,
        observacion_clase,
        observacion_sesion,
        presentes,
        ausentes,
        justificados,
        total_registros,
        asistencias_detalle,
        justificaciones_detalle
      `)

    if (periodoFechaInicio) query = query.gte('fecha', periodoFechaInicio)
    if (periodoFechaFin) query = query.lte('fecha', periodoFechaFin)
    if (fecha) query = query.eq('fecha', fecha)
    if (claseId) query = query.eq('clase_id', claseId)

    let { data: sesiones, error } = await query
      .order('fecha', { ascending: false })
      .order('hora_inicio', { ascending: true })
    if (error) throwError('No se pudieron cargar las sesiones consolidadas', error)

    if (!Array.isArray(sesiones)) {
      sesiones = []
    }

    sesiones = sesiones.filter((s) => s.borrador === false)

    // Cargar clases y horarios para resolución precisa de cátedra y horas
    const [clasesMetaRes, horariosMetaRes] = await Promise.all([
      supabase.from('clases').select('*'),
      supabase.from('clase_horarios').select('*'),
    ])

    const clasesMetaMap = new Map()
    for (const cm of clasesMetaRes.data || []) {
      clasesMetaMap.set(cm.id, cm)
    }

    const normalizeDayText = (t) => (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
    const DIAS_KEYS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
    
    const horariosMetaMap = new Map()
    const horariosPorClaseListMap = new Map()

    for (const h of horariosMetaRes.data || []) {
      if (h.clase_id) {
        const diaNorm = normalizeDayText(h.dia || h.dia_semana || '')
        if (diaNorm) {
          horariosMetaMap.set(`${h.clase_id}_${diaNorm}`, h)
        }
        
        if (!horariosPorClaseListMap.has(h.clase_id)) {
          horariosPorClaseListMap.set(h.clase_id, [])
        }
        horariosPorClaseListMap.get(h.clase_id).push(h)
      }
    }

    const timelineByDate = {}

    if (sesiones && sesiones.length > 0) {
      sesiones.forEach((row) => {
        const metaClase = clasesMetaMap.get(row.clase_id) || {}
        let horaIni = row.hora_inicio
        let horaFin = row.hora_fin

        if (!horaIni || horaIni === '--:--' || horaIni === 'null' || horaIni === 'undefined') {
          const dObj = new Date(row.fecha + 'T12:00:00')
          const diaKey = DIAS_KEYS[dObj.getDay()] || ''
          
          const fallbackHorario = 
            horariosMetaMap.get(`${row.clase_id}_${diaKey}`) || 
            (horariosPorClaseListMap.get(row.clase_id) || [])[0] || 
            null

          if (fallbackHorario) {
            horaIni = fallbackHorario.hora_inicio || metaClase.hora_inicio || null
            horaFin = fallbackHorario.hora_fin || fallbackHorario.hora_termino || metaClase.hora_fin || null
          } else if (metaClase.hora_inicio) {
            horaIni = metaClase.hora_inicio
            horaFin = metaClase.hora_fin || null
          }
        }

        const clase = {
          clase_id: row.clase_id,
          clase_nombre: row.nombre_clase || metaClase.nombre || 'Clase',
          instrumento: metaClase.instrumento || 'General',
          fecha: row.fecha,
          hora_inicio: horaIni || null,
          hora_fin: horaFin || null,
          maestro_nombre: row.maestro_principal || 'Sin asignar',
          maestro_auxiliar_nombre: row.maestro_auxiliar || null,
          observacion_clase: row.observacion_clase || null,
          observacion_sesion: row.observacion_sesion || null,
          presentes: row.presentes || 0,
          ausentes: row.ausentes || 0,
          justificados: row.justificados || 0,
          total_alumnos: row.total_registros || 0,
          asistencias: row.asistencias_detalle
            ? Array.isArray(row.asistencias_detalle)
              ? row.asistencias_detalle
              : JSON.parse(row.asistencias_detalle || '[]')
            : [],
          justificaciones: row.justificaciones_detalle
            ? Array.isArray(row.justificaciones_detalle)
              ? row.justificaciones_detalle
              : JSON.parse(row.justificaciones_detalle || '[]')
            : [],
        }

        if (!timelineByDate[row.fecha]) {
          timelineByDate[row.fecha] = []
        }
        timelineByDate[row.fecha].push(clase)
      })
    }

    const timeline = Object.entries(timelineByDate)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([fecha, clases]) => ({
        fecha,
        clases: clases.sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || '')),
      }))

    const PRIO = { presente: 0, justificado: 1, ausente: 2 }
    const idSet = new Set()
    for (const dia of timeline) {
      for (const clase of dia.clases) {
        const vistos = new Map()
        for (const a of clase.asistencias || []) {
          if (!a) continue
          const key = a.alumno_id || a.alumnoId || a.alumno_nombre
          const prev = vistos.get(key)
          if (!prev || (PRIO[a.estado] ?? 9) < (PRIO[prev.estado] ?? 9)) vistos.set(key, a)
        }
        clase.asistencias = [...vistos.values()].sort((a, b) =>
          (a.alumno_nombre || '').localeCompare(b.alumno_nombre || ''),
        )
        clase.presentes = clase.asistencias.filter((a) => a.estado === 'presente').length
        clase.ausentes = clase.asistencias.filter((a) => a.estado === 'ausente').length
        clase.justificados = clase.asistencias.filter((a) => a.estado === 'justificado').length
        clase.total_alumnos = clase.asistencias.length
        clase.asistencias.forEach((a) => idSet.add(a.alumno_id || a.alumnoId))
      }
    }

    if (idSet.size > 0) {
      const ids = [...idSet].filter(Boolean)
      const { data: alumnosInst } = await supabase
        .from('alumnos')
        .select('id, instrumento_principal')
        .in('id', ids)
      const instMap = {}
      ;(alumnosInst || []).forEach((al) => {
        instMap[al.id] = al.instrumento_principal || null
      })
      for (const dia of timeline) {
        for (const clase of dia.clases) {
          for (const a of clase.asistencias) {
            a.instrumento = instMap[a.alumno_id || a.alumnoId] || null
          }
        }
      }
    }

    const todasLasClases = timeline.flatMap((d) => d.clases)
    const resumenGlobal = {
      totalClases: todasLasClases.length,
      totalPresentes: todasLasClases.reduce((sum, c) => sum + c.presentes, 0),
      totalAusentes: todasLasClases.reduce((sum, c) => sum + c.ausentes, 0),
      totalJustificados: todasLasClases.reduce((sum, c) => sum + c.justificados, 0),
      totalRegistros: todasLasClases.reduce((sum, c) => sum + c.total_alumnos, 0),
      totalSesiones: sesiones.length,
    }

    return {
      timelineByDate: timeline,
      resumenGlobal,
    }
  } catch (err) {
    throwError('Error en getReporteConsolidado', err)
  }
}
