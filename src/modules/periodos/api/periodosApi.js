import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Obtiene todos los períodos académicos, ordenados por fecha de inicio descendente.
 */
export async function getPeriodos() {
  const { data, error } = await supabase
    .from('periodos')
    .select('*')
    .order('fecha_inicio', { ascending: false })

  if (error) throw new Error('No se pudieron cargar los períodos')
  return data
}

/**
 * Obtiene el período académico marcado como activo.
 */
export async function getPeriodoActivo() {
  const { data, error } = await supabase
    .from('periodos')
    .select('*')
    .eq('activo', true)
    .single()

  if (error) return null
  return data
}

/**
 * Crea un nuevo período académico.
 */
export async function crearPeriodo(periodo) {
  if (!periodo.nombre) throw new Error('El nombre es obligatorio')
  if (!periodo.fecha_inicio) throw new Error('La fecha de inicio es obligatoria')
  if (!periodo.fecha_fin) throw new Error('La fecha de fin es obligatoria')

  const { data, error } = await supabase
    .from('periodos')
    .insert([{
      nombre:       periodo.nombre.trim(),
      fecha_inicio: periodo.fecha_inicio,
      fecha_fin:    periodo.fecha_fin,
      activo:       periodo.activo ?? false,
    }])
    .select()

  if (error) throw new Error('No se pudo crear el período')
  return data[0]
}

/**
 * Actualiza los datos de un período existente.
 */
export async function actualizarPeriodo(id, datos) {
  const { data, error } = await supabase
    .from('periodos')
    .update(datos)
    .eq('id', id)
    .select()

  if (error) throw new Error('No se pudo actualizar el período')
  return data[0]
}

/**
 * Activa un período y desactiva todos los demás.
 *
 * Delega en la RPC `fn_activar_periodo`, que resuelve el corte en una sola
 * transacción. La versión anterior emitía dos requests independientes y
 * descartaba el error del primero: si el segundo fallaba, el sistema quedaba
 * SIN ningún período activo, y el índice único parcial sobre `activo` impedía
 * recuperarse sin intervención manual.
 */
export async function activarPeriodo(periodoId) {
  const { data, error } = await supabase.rpc('fn_activar_periodo', {
    p_periodo_id: periodoId,
  })

  if (error) throw new Error(`No se pudo activar el período: ${error.message}`)
  return data
}

/**
 * Elimina un período académico.
 *
 * Nota sobre integridad: las claves foráneas hacia `periodos` están declaradas
 * como ON DELETE SET NULL, de modo que un período con datos asociados NUNCA
 * produce una violación 23503 — se borra y deja los registros huérfanos. El
 * manejo de ese código que vivía aquí era inalcanzable y daba una falsa
 * sensación de protección. La advertencia real se muestra en la interfaz antes
 * de confirmar.
 */
export async function eliminarPeriodo(id) {
  const { error } = await supabase
    .from('periodos')
    .delete()
    .eq('id', id)

  if (error) {
    if (error.code === '42501') {
      throw new Error('No tiene permisos para eliminar períodos')
    }
    throw new Error(`No se pudo eliminar el período: ${error.message}`)
  }
  return true
}

/**
 * Realiza una auditoría del cumplimiento de asistencias de los docentes para un período.
 * Retorna el resumen global y el desglose por maestro.
 */
export async function obtenerAuditoriaCierrePeriodo(periodoId) {
  const { data: periodo, error: pErr } = await supabase
    .from('periodos')
    .select('*')
    .eq('id', periodoId)
    .single()

  if (pErr || !periodo) throw new Error('No se pudo encontrar el período seleccionado.')

  const { data: sesiones, error: sErr } = await supabase
    .from('sesiones_clase')
    .select('id, fecha, borrador, estado, maestro_id, asistencia, clase_id')
    .gte('fecha', periodo.fecha_inicio)
    .lte('fecha', periodo.fecha_fin)

  if (sErr) throw new Error('Error al consultar sesiones del período.')

  const { data: maestros } = await supabase
    .from('maestros')
    .select('id, nombre, apellido, email')

  const maestrosMap = new Map((maestros || []).map((m) => [m.id, m]))
  const auditoriaMaestros = new Map()

  const listaSesiones = sesiones || []
  listaSesiones.forEach((s) => {
    const mId = s.maestro_id || 'desconocido'
    if (!auditoriaMaestros.has(mId)) {
      const mInfo = maestrosMap.get(mId)
      auditoriaMaestros.set(mId, {
        maestroId: mId,
        nombre: mInfo ? `${mInfo.nombre || ''} ${mInfo.apellido || ''}`.trim() || mInfo.email : 'Maestro',
        totalSesiones: 0,
        completadas: 0,
        pendientes: 0,
      })
    }
    const item = auditoriaMaestros.get(mId)
    item.totalSesiones++

    const tieneAsistencia = Array.isArray(s.asistencia) && s.asistencia.length > 0
    const esCompletada = !s.borrador && s.estado !== 'pendiente' && (s.estado === 'registrada' || s.estado === 'cerrada' || tieneAsistencia)

    if (esCompletada) {
      item.completadas++
    } else {
      item.pendientes++
    }
  })

  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id, estado')

  const totalAlumnosMatriculados = (alumnos || []).length
  const totalAlumnosActivos = (alumnos || []).filter(a => a.estado === 'activo' || !a.estado).length
  const tasaRetencionEstudiantil = totalAlumnosMatriculados > 0
    ? Math.round((totalAlumnosActivos / totalAlumnosMatriculados) * 100)
    : 100

  let totalMarcasP = 0
  let totalMarcasA = 0
  let totalMarcasJ = 0
  let clasesEmergentesCount = 0
  let sesionesConContenidoPlanificado = 0

  const ausenciasPorDiaSemana = {
    'Lunes': 0,
    'Martes': 0,
    'Miércoles': 0,
    'Jueves': 0,
    'Viernes': 0,
    'Sábado': 0,
    'Domingo': 0
  }

  const asistenciaPorAlumnoMap = new Map()

  listaSesiones.forEach((s) => {
    if (s.emergente_id) clasesEmergentesCount++
    if (s.contenido_planificado || s.observacion) sesionesConContenidoPlanificado++

    const fechaObj = new Date(s.fecha + 'T00:00:00')
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const diaNombre = dias[fechaObj.getDay()] || 'Otros'

    if (Array.isArray(s.asistencia)) {
      s.asistencia.forEach((a) => {
        const alId = a.alumno_id || a.student_id || 'desc'
        if (!asistenciaPorAlumnoMap.has(alId)) {
          asistenciaPorAlumnoMap.set(alId, { presentes: 0, ausentes: 0, total: 0, nombre: a.nombre_alumno || alId })
        }
        const alStat = asistenciaPorAlumnoMap.get(alId)
        alStat.total++

        if (a.estado === 'P') {
          totalMarcasP++
          alStat.presentes++
        } else if (a.estado === 'A') {
          totalMarcasA++
          alStat.ausentes++
          if (ausenciasPorDiaSemana[diaNombre] !== undefined) {
            ausenciasPorDiaSemana[diaNombre]++
          }
        } else if (a.estado === 'J') {
          totalMarcasJ++
        }
      })
    }
  })

  const totalMarcasAsistencia = totalMarcasP + totalMarcasA + totalMarcasJ
  const coberturaCurricularPct = listaSesiones.length > 0
    ? Math.round((sesionesConContenidoPlanificado / listaSesiones.length) * 100)
    : 100

  // Identificar alumnos en riesgo (ausencias > 25% de sus clases)
  const alumnosEnRiesgo = Array.from(asistenciaPorAlumnoMap.values())
    .filter(al => al.total >= 3 && (al.ausentes / al.total) >= 0.25)
    .map(al => ({
      ...al,
      pctAusencias: Math.round((al.ausentes / al.total) * 100)
    }))

  const desgloseMaestros = Array.from(auditoriaMaestros.values()).map((m) => ({
    ...m,
    porcentajeCumplimiento: m.totalSesiones > 0 ? Math.round((m.completadas / m.totalSesiones) * 100) : 100,
  }))

  const totalSesiones = listaSesiones.length
  const totalCompletadas = desgloseMaestros.reduce((acc, m) => acc + m.completadas, 0)
  const totalPendientes = desgloseMaestros.reduce((acc, m) => acc + m.pendientes, 0)
  const porcentajeGlobal = totalSesiones > 0 ? Math.round((totalCompletadas / totalSesiones) * 100) : 100

  return {
    periodo,
    totalSesiones,
    totalCompletadas,
    totalPendientes,
    porcentajeGlobal,
    totalAlumnosMatriculados,
    totalAlumnosActivos,
    tasaRetencionEstudiantil,
    totalMarcasAsistencia,
    totalMarcasP,
    totalMarcasA,
    totalMarcasJ,
    clasesEmergentesCount,
    coberturaCurricularPct,
    ausenciasPorDiaSemana,
    alumnosEnRiesgo,
    maestros: desgloseMaestros.sort((a, b) => a.porcentajeCumplimiento - b.porcentajeCumplimiento),
  }
}
