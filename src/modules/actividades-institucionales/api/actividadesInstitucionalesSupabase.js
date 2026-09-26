/**
 * @fileoverview Actividades institucionales: feriados, suspensiones y actividades
 * especiales aprobadas sobre calendario_institucional. Ver
 * docs/planning/SPEC_actividades_institucionales_SOI.md.
 *
 * La aprobación (crear afectaciones/exenciones/convocatoria) nunca escribe esas
 * tablas directamente desde el cliente: pasa por fn_aprobar_actividad_institucional
 * (transaccional, idempotente, valida es_admin() en el servidor).
 */

import { supabase } from '../../../lib/supabaseClient.js'

const CATEGORIAS_MODULO = ['feriado', 'suspension', 'actividad_especial']

// clase_horarios.dia se guarda con tildes ("miércoles", "sábado"). Comparar
// sin normalizar deja esos dos días fuera de cualquier match (mismo bug ya
// encontrado en portal-maestros/services/emergenteJustificacionService.js).
const DIAS_ES_LARGO = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

function normalizeDia(str) {
  return Array.from((str || '').normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0)
      return code < 0x300 || code > 0x36f
    })
    .join('')
    .trim()
    .toLowerCase()
}

function diaSemanaDe(fechaISO) {
  const [y, m, d] = fechaISO.split('-').map(Number)
  return DIAS_ES_LARGO[new Date(y, m - 1, d).getDay()]
}

// fecha_inicio/fecha_fin son timestamptz (para poder guardar franja horaria a
// futuro). Postgres las devuelve como "2026-09-24 00:00:00+00" — nada del
// resto del código debe ver ese formato: se recorta acá, una sola vez, al
// primer punto de entrada. Escribimos y leemos siempre en el mismo huso
// horario (session tz = UTC), así que tomar los primeros 10 caracteres da el
// mismo día calendario que se guardó, sin cálculos de zona horaria.
function soloFecha(valor) {
  return valor ? String(valor).slice(0, 10) : null
}

function normalizeActividad(row) {
  if (!row) return null
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion ?? '',
    categoria: row.categoria,
    alcance: row.alcance,
    fechaInicio: soloFecha(row.fecha_inicio),
    fechaFin: soloFecha(row.fecha_fin),
    ubicacion: row.ubicacion ?? '',
    programasConvocados: row.programas_convocados ?? [],
    clasesConvocadas: row.clases_convocadas ?? [],
    responsableAsistenciaId: row.responsable_asistencia_id ?? null,
    requiereAprobacion: row.requiere_aprobacion ?? true,
    estado: row.estado,
    aprobadoPor: row.aprobado_por ?? null,
    aprobadoEn: row.aprobado_en ?? null,
    motivoRechazo: row.motivo_rechazo ?? null,
    creadoPor: row.creado_por ?? null,
    version: row.version ?? 1,
    createdAt: row.created_at,
  }
}

/**
 * Lista actividades del módulo (feriado/suspension/actividad_especial), más
 * recientes primero.
 * @param {{estado?: string}} [filtros]
 */
export async function listarActividades(filtros = {}) {
  let query = supabase
    .from('calendario_institucional')
    .select('*')
    .in('categoria', CATEGORIAS_MODULO)
    .order('fecha_inicio', { ascending: false })

  if (filtros.estado) {
    query = query.eq('estado', filtros.estado)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message || 'No se pudieron cargar las actividades')

  return (data || []).map(normalizeActividad)
}

/**
 * Trae una actividad con sus afectaciones (+ nombre de clase), exenciones
 * (+ nombre de alumno) y convocatoria (+ nombre de programa/clase/alumno).
 */
export async function obtenerActividad(id) {
  const [{ data: evento, error: eventoErr }, { data: afectaciones, error: afError }, { data: convocatoria, error: convError }] =
    await Promise.all([
      supabase.from('calendario_institucional').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('calendario_afectaciones_clase')
        .select('*, clases(nombre)')
        .eq('evento_id', id)
        .eq('vigente', true),
      supabase
        .from('calendario_convocatoria')
        .select('*, programas(nombre), clases(nombre), alumnos(nombre_completo)')
        .eq('evento_id', id),
    ])

  if (eventoErr) throw new Error(eventoErr.message || 'No se pudo cargar la actividad')
  if (afError) throw new Error(afError.message || 'No se pudieron cargar las afectaciones')
  if (convError) throw new Error(convError.message || 'No se pudo cargar la convocatoria')
  if (!evento) return null

  const afectacionIds = (afectaciones || []).map((a) => a.id)
  let exencionesPorAfectacion = new Map()
  if (afectacionIds.length) {
    const { data: exenciones, error: exError } = await supabase
      .from('calendario_exenciones_alumno')
      .select('*, alumnos(nombre_completo)')
      .in('afectacion_id', afectacionIds)
    if (exError) throw new Error(exError.message || 'No se pudieron cargar las exenciones')
    exencionesPorAfectacion = (exenciones || []).reduce((map, ex) => {
      const list = map.get(ex.afectacion_id) || []
      list.push({ alumnoId: ex.alumno_id, alumnoNombre: ex.alumnos?.nombre_completo ?? '', motivo: ex.motivo ?? '' })
      map.set(ex.afectacion_id, list)
      return map
    }, new Map())
  }

  return {
    ...normalizeActividad(evento),
    afectaciones: (afectaciones || []).map((a) => ({
      id: a.id,
      claseId: a.clase_id,
      claseNombre: a.clases?.nombre ?? '',
      fecha: a.fecha,
      tipoAfectacion: a.tipo_afectacion,
      motivo: a.motivo ?? '',
      exentos: exencionesPorAfectacion.get(a.id) || [],
    })),
    convocatoria: (convocatoria || []).map((c) => ({
      id: c.id,
      programaId: c.programa_id,
      programaNombre: c.programas?.nombre ?? null,
      claseId: c.clase_id,
      claseNombre: c.clases?.nombre ?? null,
      alumnoId: c.alumno_id,
      alumnoNombre: c.alumnos?.nombre_completo ?? null,
    })),
  }
}

/**
 * Crea una actividad como propuesta (pendiente_revision), sin efecto en
 * clases ni métricas hasta que se apruebe (§3 del spec).
 * @param {{titulo:string, descripcion?:string, categoria:string, alcance:string,
 *   fechaInicio:string, fechaFin:string, ubicacion?:string,
 *   programasConvocados?:string[], clasesConvocadas?:string[],
 *   responsableAsistenciaId?:string}} payload
 */
export async function crearActividad(payload) {
  const { titulo, categoria, alcance, fechaInicio, fechaFin } = payload
  if (!titulo || !categoria || !alcance || !fechaInicio || !fechaFin) {
    throw new Error('Título, categoría, alcance y fechas son obligatorios')
  }
  if (!CATEGORIAS_MODULO.includes(categoria)) {
    throw new Error(`Categoría inválida. Debe ser una de: ${CATEGORIAS_MODULO.join(', ')}`)
  }

  const { data: userData } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('calendario_institucional')
    .insert({
      titulo,
      descripcion: payload.descripcion || null,
      categoria,
      alcance,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      ubicacion: payload.ubicacion || null,
      programas_convocados: payload.programasConvocados || [],
      clases_convocadas: payload.clasesConvocadas || [],
      responsable_asistencia_id: payload.responsableAsistenciaId || null,
      estado: 'pendiente_revision',
      creado_por: userData?.user?.id || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message || 'No se pudo crear la actividad')
  return normalizeActividad(data)
}

/**
 * Previsualiza qué clases coinciden con el día de semana de `fecha`, dentro
 * del alcance dado. No escribe nada — es de solo lectura (§6: "previsualizar
 * cruces con clases y alumnos").
 * @param {{fecha:string, alcance:string, clasesConvocadas?:string[], programasConvocados?:string[]}} params
 * @returns {Promise<Array<{claseId:string, claseNombre:string, programaId:string,
 *   totalAlumnos:number, decisionVigente:{tipoAfectacion:string}|null}>>}
 */
export async function previsualizarImpacto({ fecha, alcance, clasesConvocadas = [], programasConvocados = [] }) {
  if (!fecha || !alcance) throw new Error('fecha y alcance son obligatorios')

  const diaSemana = normalizeDia(diaSemanaDe(fecha))

  let clasesQuery = supabase
    .from('clases')
    .select('id, nombre, programa_id, clase_horarios!inner(dia)')
    .eq('activo', true)

  if (alcance === 'clase' && clasesConvocadas.length) {
    clasesQuery = clasesQuery.in('id', clasesConvocadas)
  } else if (alcance === 'programa' && programasConvocados.length) {
    clasesQuery = clasesQuery.in('programa_id', programasConvocados)
  }
  // alcance === 'institucional': sin filtro adicional, todas las clases activas.

  const { data: clases, error: clasesErr } = await clasesQuery
  if (clasesErr) throw new Error(clasesErr.message || 'No se pudieron consultar las clases')

  const claseIdsDelDia = new Set(
    (clases || [])
      .filter((c) => (c.clase_horarios || []).some((h) => normalizeDia(h.dia) === diaSemana))
      .map((c) => c.id),
  )
  const clasesDelDia = (clases || []).filter((c) => claseIdsDelDia.has(c.id))

  if (!clasesDelDia.length) return []

  const claseIds = clasesDelDia.map((c) => c.id)

  const [{ data: inscripciones, error: inscError }, { data: vigentes, error: vigError }] = await Promise.all([
    supabase.from('alumnos_clases').select('clase_id, alumno_id').in('clase_id', claseIds).eq('activo', true),
    supabase
      .from('calendario_afectaciones_clase')
      .select('clase_id, tipo_afectacion')
      .in('clase_id', claseIds)
      .eq('fecha', fecha)
      .eq('vigente', true),
  ])
  if (inscError) throw new Error(inscError.message || 'No se pudieron consultar los alumnos inscritos')
  if (vigError) throw new Error(vigError.message || 'No se pudo consultar la afectación vigente')

  const totalPorClase = (inscripciones || []).reduce((map, i) => {
    map.set(i.clase_id, (map.get(i.clase_id) || 0) + 1)
    return map
  }, new Map())
  const vigentePorClase = new Map((vigentes || []).map((v) => [v.clase_id, v.tipo_afectacion]))

  return clasesDelDia.map((c) => ({
    claseId: c.id,
    claseNombre: c.nombre,
    programaId: c.programa_id,
    totalAlumnos: totalPorClase.get(c.id) || 0,
    decisionVigente: vigentePorClase.has(c.id) ? { tipoAfectacion: vigentePorClase.get(c.id) } : null,
  }))
}

/**
 * Puente hacia el portal de maestros (§6): trae las afectaciones vigentes de
 * un conjunto de clases para una fecha concreta, con el título de la
 * actividad que las originó y los alumnos exentos (si aplica). Ninguna
 * escritura acá — es exactamente lo que el maestro necesita ver para saber
 * "¿qué pasó con mi clase hoy?".
 * @param {string[]} claseIds
 * @param {string} fecha 'YYYY-MM-DD'
 */
export async function obtenerAfectacionesVigentes(claseIds, fecha) {
  if (!claseIds?.length || !fecha) return []

  const { data, error } = await supabase
    .from('calendario_afectaciones_clase')
    .select(`
      id, clase_id, tipo_afectacion, motivo,
      calendario_institucional ( id, titulo, descripcion ),
      calendario_exenciones_alumno ( alumno_id, alumnos ( nombre_completo ) )
    `)
    .in('clase_id', claseIds)
    .eq('fecha', fecha)
    .eq('vigente', true)

  if (error) throw new Error(error.message || 'No se pudieron cargar las actividades institucionales del día')

  return (data || []).map((row) => ({
    claseId: row.clase_id,
    afectacionId: row.id,
    tipoAfectacion: row.tipo_afectacion,
    motivo: row.motivo ?? '',
    actividadId: row.calendario_institucional?.id ?? null,
    actividadTitulo: row.calendario_institucional?.titulo ?? '',
    actividadDescripcion: row.calendario_institucional?.descripcion ?? '',
    exentos: (row.calendario_exenciones_alumno || []).map((e) => ({
      alumnoId: e.alumno_id,
      nombreCompleto: e.alumnos?.nombre_completo ?? '',
    })),
  }))
}

/**
 * Alumnos inscritos en una clase, para elegir exentos al marcar
 * impartida_con_exencion.
 */
export async function listarAlumnosDeClase(claseId) {
  const { data, error } = await supabase
    .from('alumnos_clases')
    .select('alumno_id, alumnos(id, nombre_completo)')
    .eq('clase_id', claseId)
    .eq('activo', true)

  if (error) throw new Error(error.message || 'No se pudieron cargar los alumnos de la clase')
  return (data || [])
    .filter((r) => r.alumnos)
    .map((r) => ({ id: r.alumnos.id, nombreCompleto: r.alumnos.nombre_completo }))
}

/**
 * Aprueba (o corrige, si ya estaba aprobada) la actividad y publica sus
 * afectaciones/exenciones/convocatoria en una sola transacción vía RPC.
 * @param {string} eventoId
 * @param {Array<{claseId:string, fecha:string, tipoAfectacion:string, motivo?:string, exentos?:string[]}>} afectaciones
 * @param {Array<{programaId?:string, claseId?:string, alumnoId?:string}>} [convocatoria]
 * @param {string} [responsableAsistenciaId]
 */
export async function aprobarActividad(eventoId, afectaciones, convocatoria = [], responsableAsistenciaId = null) {
  if (!eventoId) throw new Error('eventoId es obligatorio')

  const { data, error } = await supabase.rpc('fn_aprobar_actividad_institucional', {
    p_evento_id: eventoId,
    p_afectaciones: (afectaciones || []).map((a) => ({
      clase_id: a.claseId,
      fecha: a.fecha,
      tipo_afectacion: a.tipoAfectacion,
      motivo: a.motivo || null,
      exentos: a.exentos || [],
    })),
    p_convocatoria: (convocatoria || []).map((c) => ({
      programa_id: c.programaId || null,
      clase_id: c.claseId || null,
      alumno_id: c.alumnoId || null,
    })),
    p_responsable_asistencia_id: responsableAsistenciaId,
  })

  if (error) throw new Error(error.message || 'No se pudo aprobar la actividad')
  return data
}

/**
 * Elimina una propuesta que todavía no fue aprobada (borrador o
 * pendiente_revision). Una vez aprobada, se corrige o se rechaza — nunca se
 * borra, para no perder el historial de lo que se decidió.
 */
export async function eliminarActividad(id) {
  if (!id) throw new Error('id es obligatorio')

  const { data: actual, error: readError } = await supabase
    .from('calendario_institucional')
    .select('estado')
    .eq('id', id)
    .maybeSingle()
  if (readError) throw new Error(readError.message || 'No se pudo verificar la actividad')
  if (!actual) throw new Error('Actividad no encontrada')
  if (!['borrador', 'pendiente_revision'].includes(actual.estado)) {
    throw new Error('Solo se pueden eliminar propuestas que aún no fueron aprobadas ni rechazadas')
  }

  const { error } = await supabase.from('calendario_institucional').delete().eq('id', id)
  if (error) throw new Error(error.message || 'No se pudo eliminar la actividad')
  return { id }
}

/** Rechaza una propuesta pendiente. No afecta clases ni métricas. */
export async function rechazarActividad(eventoId, motivo) {
  if (!eventoId) throw new Error('eventoId es obligatorio')

  const { data, error } = await supabase.rpc('fn_rechazar_actividad_institucional', {
    p_evento_id: eventoId,
    p_motivo: motivo || null,
  })

  if (error) throw new Error(error.message || 'No se pudo rechazar la actividad')
  return data
}

/**
 * Resuelve el roster de alumnos convocados a la actividad (directo, vía clase
 * o vía programa) con su estado de asistencia actual (§4, §6: el responsable
 * pasa lista de convocados con presente/ausente/pendiente).
 */
export async function obtenerListaAsistenciaActividad(eventoId) {
  const { data: convocatoria, error: convError } = await supabase
    .from('calendario_convocatoria')
    .select('programa_id, clase_id, alumno_id')
    .eq('evento_id', eventoId)

  if (convError) throw new Error(convError.message || 'No se pudo cargar la convocatoria')

  const alumnoIds = new Set((convocatoria || []).map((c) => c.alumno_id).filter(Boolean))
  const claseIds = (convocatoria || []).map((c) => c.clase_id).filter(Boolean)
  const programaIds = (convocatoria || []).map((c) => c.programa_id).filter(Boolean)

  if (claseIds.length) {
    const { data, error } = await supabase.from('alumnos_clases').select('alumno_id').in('clase_id', claseIds).eq('activo', true)
    if (error) throw new Error(error.message || 'No se pudieron cargar los alumnos convocados por clase')
    for (const r of data || []) alumnoIds.add(r.alumno_id)
  }

  if (programaIds.length) {
    const { data: clasesDelPrograma, error: clasesErr } = await supabase.from('clases').select('id').in('programa_id', programaIds)
    if (clasesErr) throw new Error(clasesErr.message || 'No se pudieron cargar las clases del programa')
    const idsClases = (clasesDelPrograma || []).map((c) => c.id)
    if (idsClases.length) {
      const { data, error } = await supabase.from('alumnos_clases').select('alumno_id').in('clase_id', idsClases).eq('activo', true)
      if (error) throw new Error(error.message || 'No se pudieron cargar los alumnos convocados por programa')
      for (const r of data || []) alumnoIds.add(r.alumno_id)
    }
  }

  if (!alumnoIds.size) return []

  const ids = [...alumnoIds]
  const [{ data: alumnos, error: alError }, { data: asistencias, error: asError }] = await Promise.all([
    supabase.from('alumnos').select('id, nombre_completo').in('id', ids),
    supabase.from('calendario_asistencia_actividad').select('alumno_id, estado').eq('evento_id', eventoId).in('alumno_id', ids),
  ])
  if (alError) throw new Error(alError.message || 'No se pudieron cargar los alumnos')
  if (asError) throw new Error(asError.message || 'No se pudo cargar la asistencia registrada')

  const estadoPorAlumno = new Map((asistencias || []).map((a) => [a.alumno_id, a.estado]))

  return (alumnos || [])
    .map((a) => ({ alumnoId: a.id, nombreCompleto: a.nombre_completo, estado: estadoPorAlumno.get(a.id) || 'pendiente' }))
    .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto, 'es'))
}

/**
 * Registra la asistencia real de un alumno convocado a la actividad. Distinta
 * de la asistencia a clase (§2, §4): convocar no implica asistir.
 */
export async function registrarAsistenciaActividad(eventoId, alumnoId, estado) {
  if (!eventoId || !alumnoId) throw new Error('eventoId y alumnoId son obligatorios')
  if (!['presente', 'ausente', 'pendiente'].includes(estado)) {
    throw new Error('estado inválido (presente|ausente|pendiente)')
  }

  const { data: userData } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('calendario_asistencia_actividad')
    .upsert(
      {
        evento_id: eventoId,
        alumno_id: alumnoId,
        estado,
        registrado_por: userData?.user?.id || null,
        registrado_en: new Date().toISOString(),
      },
      { onConflict: 'evento_id,alumno_id' },
    )

  if (error) throw new Error(error.message || 'No se pudo registrar la asistencia')
  return { eventoId, alumnoId, estado }
}
