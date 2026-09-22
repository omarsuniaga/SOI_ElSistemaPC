// Justificaciones registradas por Administración (o por el maestro) que la vista de
// asistencia debe mostrar al abrir la clase, con su motivo.

/**
 * Mapa alumno_id -> registro de justificación con `motivo`.
 * La fila de `justificaciones` manda; si no existe, se usa asistencias.justificacion_texto
 * (registro sin `id`, para que "desmarcar J" no intente borrar una fila inexistente).
 */
export function construirJustificaciones(justificacionesRows = [], asistenciasRows = []) {
  const mapa = {}

  for (const a of asistenciasRows || []) {
    if (a?.estado === 'justificado' && a.justificacion_texto) {
      mapa[a.alumno_id] = {
        alumno_id: a.alumno_id,
        sesion_id: a.sesion_clase_id || null,
        motivo: a.justificacion_texto,
      }
    }
  }
  for (const j of justificacionesRows || []) {
    if (j?.alumno_id) mapa[j.alumno_id] = j
  }
  return mapa
}

/**
 * Marca 'J' en `estado` para los alumnos justificados en `asistencias`.
 * Solo cambia alumnos de la clase sin marcar ('null') o ausentes ('A'):
 * justificar una ausencia la convierte en J, pero no pisa un 'P' ni un 'T'.
 */
export function aplicarJustificadosDeAsistencias(estado, asistenciasRows = []) {
  for (const a of asistenciasRows || []) {
    if (a?.estado !== 'justificado') continue
    if (!Object.prototype.hasOwnProperty.call(estado, a.alumno_id)) continue
    if (estado[a.alumno_id] == null || estado[a.alumno_id] === 'A') estado[a.alumno_id] = 'J'
  }
  return estado
}

/**
 * Razón de los alumnos justificados porque la clase se suspendió por una actividad
 * especial (sesión con emergente_id). No pisa las justificaciones que ya existen.
 * Sin `id`: no hay fila en `justificaciones` que borrar.
 */
export function justificacionesPorActividad(estado, actividad, existentes = {}) {
  if (!actividad) return { ...existentes }
  const mapa = { ...existentes }
  for (const [alumnoId, valor] of Object.entries(estado)) {
    if (valor !== 'J' || mapa[alumnoId]) continue
    mapa[alumnoId] = {
      alumno_id: alumnoId,
      motivo: `Actividad especial: ${actividad.actividad || 'Actividad especial'}`,
      descripcion: actividad.motivo || '',
    }
  }
  return mapa
}
