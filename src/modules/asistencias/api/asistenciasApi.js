import { supabase } from '../../../lib/supabaseClient.js'

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

export const ESTADOS = {
  PRESENTE:    'presente',
  AUSENTE:     'ausente',
  JUSTIFICADO: 'justificado',
}

// Etiquetas cortas para UI
export const ESTADO_LABEL = {
  presente:    { short: 'P', label: 'Presente',    css: 'success' },
  ausente:     { short: 'A', label: 'Ausente',      css: 'danger'  },
  justificado: { short: 'J', label: 'Justificado',  css: 'warning' },
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function throwError(msg, err) {
  console.error(msg, err?.message)
  throw new Error(msg)
}

// ─── 1. TIMELINE AGRUPADO POR FECHA ─────────────────────────────────────────
// Retorna: { fecha, sesiones[] } agrupado para el timeline de la vista principal

export async function getSesionesPorRango({ fechaInicio, fechaFin, periodoId, claseId, maestroId } = {}) {
  let query = supabase
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
        estado
      )
    `)
    .order('fecha', { ascending: false })
    .order('hora_inicio', { ascending: true })

  if (fechaInicio) query = query.gte('fecha', fechaInicio)
  if (fechaFin)    query = query.lte('fecha', fechaFin)
  if (claseId)     query = query.eq('clase_id', claseId)

  // Filtrar por período si se provee
  if (periodoId) {
    const { data: periodo } = await supabase
      .from('periodos')
      .select('fecha_inicio, fecha_fin')
      .eq('id', periodoId)
      .single()

    if (periodo) {
      if (!fechaInicio) query = query.gte('fecha', periodo.fecha_inicio)
      if (!fechaFin)    query = query.lte('fecha', periodo.fecha_fin)
    }
  }

  const { data, error } = await query
  if (error) throwError('No se pudieron cargar las sesiones', error)

  // Transformar y agregar conteos P/A/J
const sesiones = (data || []).map(sc => {
    const ayudas = sc.asistencias || []
    return {
      sesionId:              sc.id,
      fecha:                 sc.fecha,
      horaInicio:            sc.hora_inicio,
      horaFin:               sc.hora_fin,
      temaPrincipal:         sc.tema_principal,
      observacionesGenerales:sc.observaciones_generales,
      estado:                sc.estado,
      claseId:               sc.clase_id,
      claseNombre:           sc.clases?.nombre ?? '—',
      instrumento:           sc.clases?.instrumento ?? '—',
      maestroId:             sc.clases?.maestro_principal_id ?? null,
      maestroNombre:         sc.clases?.maestros?.nombre_completo ?? '—',
      totalPresentes:        ayudas.filter(a => a.estado === ESTADOS.PRESENTE).length,
      totalAusentes:         ayudas.filter(a => a.estado === ESTADOS.AUSENTE).length,
      totalJustificados:     ayudas.filter(a => a.estado === ESTADOS.JUSTIFICADO).length,
      totalRegistros:        ayudas.length,
    }
  })

  // Filtrar por maestro si se provee (a través de la clase)
  let sesionesFiltradas = sesiones
  if (maestroId) {
    sesionesFiltradas = sesiones.filter(s => {
      return s.maestroId && s.maestroId.toString() === maestroId.toString()
    })
  }

  // Agrupar por fecha → { '2026-05-02': [sesion, sesion], ... }
  return agruparPorFecha(sesionesFiltradas)
}

function agruparPorFecha(sesiones) {
  const map = new Map()
  for (const s of sesiones) {
    if (!map.has(s.fecha)) map.set(s.fecha, [])
    map.get(s.fecha).push(s)
  }
  // Retornar array ordenado descendente por fecha
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([fecha, sesiones]) => ({ fecha, sesiones }))
}

// ─── 2. DETALLE COMPLETO DE UNA SESIÓN (para el modal) ──────────────────────
// Retorna: { sesion, asistencias[], observaciones[] }

export async function getDetalleSesion(sesionId) {
  if (!sesionId) throwError('Se requiere sesionId')

  // Sesión + clase + maestro
  const { data: sc, error: errSc } = await supabase
    .from('sesiones_clase')
    .select(`
      id, fecha, hora_inicio, hora_fin,
      tema_principal, observaciones_generales, estado,
      clases (
        nombre, instrumento,
        maestros!fk_clases_maestro_principal ( nombre_completo )
      )
    `)
    .eq('id', sesionId)
    .single()

  if (errSc) throwError('No se pudo cargar la sesión', errSc)

  // Asistencias + alumnos
  const { data: asistencias, error: errA } = await supabase
    .from('asistencias')
    .select(`
      id, estado, justificacion_texto, observaciones, alumno_id,
      alumnos ( id, nombre_completo )
    `)
    .eq('sesion_clase_id', sesionId)
    .order('alumnos(nombre_completo)', { ascending: true })

  if (errA) throwError('No se pudieron cargar las asistencias', errA)

  // Justificaciones separadas (por falta de FK directa)
  const { data: justificaciones } = await supabase
    .from('justificaciones')
    .select('motivo, descripcion, archivo_url, estado, alumno_id')
    .eq('sesion_id', sesionId)

  const justificacionesMap = {}
  if (justificaciones) {
    justificaciones.forEach(j => { justificacionesMap[j.alumno_id] = j })
  }

  // Observaciones por alumno vinculadas a esta sesión
  const { data: observaciones, error: errO } = await supabase
    .from('observaciones_alumnos')
    .select(`
      id, tipo, observacion, titulo, descripcion, prioridad,
      alumnos ( id, nombre_completo )
    `)
    .eq('sesion_clase_id', sesionId)

  if (errO) throwError('No se pudieron cargar las observaciones', errO)

  // Contenidos trabajados (link a planificación)
  const { data: contenidos, error: errC } = await supabase
    .from('contenidos_sesion')
    .select(`
      id, descripcion, nivel_logro,
      planificaciones ( titulo, contenidos )
    `)
    .eq('sesion_clase_id', sesionId)

  if (errC) throwError('No se pudieron cargar los contenidos', errC)

  return {
    sesion: {
      id:                    sc.id,
      fecha:                 sc.fecha,
      horaInicio:            sc.hora_inicio,
      horaFin:               sc.hora_fin,
      temaPrincipal:         sc.tema_principal,
      observacionesGenerales:sc.observaciones_generales,
      estado:                sc.estado,
      claseNombre:           sc.clases?.nombre ?? '—',
      instrumento:           sc.clases?.instrumento ?? '—',
      maestroNombre:         sc.clases?.maestros?.nombre_completo ?? '—',
    },
    asistencias: (asistencias || []).map(a => ({
      id:               a.id,
      estado:           a.estado,
      justificacionTexto: a.justificacion_texto,
      observacion:      a.observaciones,
      alumnoId:         a.alumno_id,
      alumnoNombre:     a.alumnos?.nombre_completo ?? '—',
      justificacion:    justificacionesMap[a.alumno_id] ?? null,
    })),
    observaciones: (observaciones || []).map(o => ({
      id:           o.id,
      tipo:         o.tipo,
      titulo:       o.titulo,
      descripcion:  o.descripcion ?? o.observacion,
      prioridad:    o.prioridad,
      alumnoId:     o.alumnos?.id,
      alumnoNombre: o.alumnos?.nombre_completo ?? '—',
    })),
    contenidos: (contenidos || []).map(c => ({
      id:           c.id,
      descripcion:  c.descripcion,
      nivelLogro:   c.nivel_logro,
      planTitulo:   c.planificaciones?.titulo,
    })),
  }
}

// ─── 3. REPORTE COMPLETO DEL PERÍODO (para exportar) ─────────────────────────
// Retorna estructura plana lista para Excel/PDF/MD

export async function getReporteCompleto({ fechaInicio, fechaFin, periodoId } = {}) {
  // Reutilizamos el timeline agrupado
  const grupos = await getSesionesPorRango({ fechaInicio, fechaFin, periodoId })

  // Para cada sesión del timeline, cargamos el detalle completo
  const sesionIds = grupos.flatMap(g => g.sesiones.map(s => s.sesionId))

  if (sesionIds.length === 0) return { grupos: [], sesiones: [], resumen: _resumenVacio() }

  const { data: asistencias, error } = await supabase
    .from('asistencias')
    .select(`
      id, estado, justificacion_texto, sesion_clase_id, alumno_id,
      alumnos ( id, nombre_completo )
    `)
    .in('sesion_clase_id', sesionIds)
    .order('alumnos(nombre_completo)', { ascending: true })

  if (error) throwError('No se pudo generar el reporte', error)

  const { data: justificacionesData } = await supabase
    .from('justificaciones')
    .select('motivo, descripcion, alumno_id, sesion_id')
    .in('sesion_id', sesionIds)

  const justificacionesMap = {}
  if (justificacionesData) {
    justificacionesData.forEach(j => {
      justificacionesMap[`${j.sesion_id}_${j.alumno_id}`] = j
    })
  }

  // Indexar asistencias por sesion_clase_id
  const asistenciasPorSesion = {}
  for (const a of asistencias || []) {
    if (!asistenciasPorSesion[a.sesion_clase_id]) {
      asistenciasPorSesion[a.sesion_clase_id] = []
    }
    asistenciasPorSesion[a.sesion_clase_id].push({
      alumnoNombre:       a.alumnos?.nombre_completo ?? '—',
      estado:             a.estado,
      justificacionTexto: a.justificacion_texto,
      justificacionMotivo:justificacionesMap[`${a.sesion_clase_id}_${a.alumno_id}`]?.motivo ?? null,
    })
  }

  // Enriquecer el timeline con los detalles de asistencia
  const gruposConDetalle = grupos.map(grupo => ({
    fecha: grupo.fecha,
    sesiones: grupo.sesiones.map(s => ({
      ...s,
      alumnos: asistenciasPorSesion[s.sesionId] || [],
    }))
  }))

  // Resumen global
  const todasAsistencias = asistencias || []
  const resumen = {
    totalSesiones:    sesionIds.length,
    totalRegistros:   todasAsistencias.length,
    totalPresentes:   todasAsistencias.filter(a => a.estado === ESTADOS.PRESENTE).length,
    totalAusentes:    todasAsistencias.filter(a => a.estado === ESTADOS.AUSENTE).length,
    totalJustificados:todasAsistencias.filter(a => a.estado === ESTADOS.JUSTIFICADO).length,
  }

  return { grupos: gruposConDetalle, resumen }
}

function _resumenVacio() {
  return { totalSesiones: 0, totalRegistros: 0, totalPresentes: 0, totalAusentes: 0, totalJustificados: 0 }
}

// ─── 4. PERÍODOS DISPONIBLES (para el filtro) ────────────────────────────────

export async function getPeriodos() {
  const { data, error } = await supabase
    .from('periodos')
    .select('id, nombre, fecha_inicio, fecha_fin, activo')
    .order('fecha_inicio', { ascending: false })

  if (error) throwError('No se pudieron cargar los períodos', error)
  return data || []
}

export async function getPeriodoActivo() {
  const { data, error } = await supabase
    .from('periodos')
    .select('id, nombre, fecha_inicio, fecha_fin')
    .eq('activo', true)
    .single()

  if (error) return null
  return data
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

// ─── 5. CRUD LEGACY (conservado para compatibilidad) ─────────────────────────

export async function obtenerAsistencias() {
  const { data, error } = await supabase
    .from('asistencias')
    .select('*')
    .order('fecha', { ascending: false })
  if (error) throwError('No se pudieron cargar las asistencias', error)
  return data
}

export async function obtenerAsistencia(id) {
  const { data, error } = await supabase
    .from('asistencias')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throwError('No se pudo cargar la asistencia', error)
  return data
}

export async function crearAsistencia(asistencia) {
  const estadosValidos = Object.values(ESTADOS)
  if (!asistencia.clase_id)   throwError('La clase es obligatoria')
  if (!asistencia.alumno_id)  throwError('El alumno es obligatorio')
  if (!asistencia.fecha)      throwError('La fecha es obligatoria')
  if (!asistencia.estado || !estadosValidos.includes(asistencia.estado)) {
    throwError(`Estado inválido. Debe ser: ${estadosValidos.join(', ')}`)
  }

  const { data, error } = await supabase
    .from('asistencias')
    .insert([{
      clase_id:           asistencia.clase_id,
      alumno_id:          asistencia.alumno_id,
      fecha:              asistencia.fecha,
      estado:             asistencia.estado,
      justificacion_texto:(asistencia.justificacion_texto || '').trim() || null,
      observaciones:      (asistencia.observaciones || '').trim() || null,
      ...(asistencia.sesion_clase_id ? { sesion_clase_id: asistencia.sesion_clase_id } : {}),
      ...(asistencia.registrado_por  ? { registrado_por:  asistencia.registrado_por  } : {}),
    }])
    .select()
  if (error) throwError('No se pudo crear la asistencia', error)
  return data[0]
}

export async function registrarAsistenciaBulk(asistencias) {
  if (!asistencias?.length) throwError('No hay asistencias para registrar')
  const { data, error } = await supabase
    .from('asistencias')
    .upsert(
      asistencias.map(a => ({
        clase_id:           a.clase_id,
        alumno_id:          a.alumno_id,
        fecha:              a.fecha,
        estado:             a.estado || ESTADOS.PRESENTE,
        justificacion_texto:(a.justificacion_texto || '').trim() || null,
        observaciones:      (a.observaciones || '').trim() || null,
        ...(a.sesion_clase_id ? { sesion_clase_id: a.sesion_clase_id } : {}),
        ...(a.registrado_por  ? { registrado_por:  a.registrado_por  } : {}),
      })),
      { onConflict: 'clase_id, alumno_id, fecha' }
    )
    .select()
  if (error) throwError('No se pudieron registrar las asistencias', error)
  return data
}
