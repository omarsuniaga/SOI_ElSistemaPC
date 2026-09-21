/**
 * Nómina de la fila para la vista de Repertorio.
 *
 * El adaptador real devuelve filas crudas de `montaje_alumnos` (solo ids) y los
 * estados individuales viven aparte, en `montaje_alumno_compases`. La vista, en
 * cambio, pide un alumno con nombre, estado y sus excepciones por compás. Esta
 * función hace esa traducción en un solo lugar.
 */
import { ESTADOS_PREPARACION } from './repertoireFoundation.js'

/**
 * @param {Array} assignments - Filas de `montaje_alumnos`, con `alumnos` embebido.
 * @param {Array} overrides - Filas de `montaje_alumno_compases`.
 * @returns {Array<{id, alumno_id, nombre, estado_preparacion, overrides}>}
 */
export function buildStudentRoster(assignments, overrides) {
  const porAlumno = new Map()
  for (const fila of overrides || []) {
    if (!fila?.montaje_alumno_id || !fila?.montaje_compas_id) continue
    const actual = porAlumno.get(fila.montaje_alumno_id) || {}
    actual[fila.montaje_compas_id] = fila.estado_preparacion
    porAlumno.set(fila.montaje_alumno_id, actual)
  }

  return (assignments || [])
    .map((asignacion) => {
      const suyos = porAlumno.get(asignacion.id) || {}
      return {
        id: asignacion.id,
        alumno_id: asignacion.alumno_id,
        nombre: asignacion.alumnos?.nombre_completo || 'Alumno sin nombre',
        // Sin excepciones cargadas no hay estado individual que mostrar: el
        // alumno sigue el estado colectivo de la fila.
        estado_preparacion: estadoMasAtrasado(Object.values(suyos)),
        overrides: suyos,
      }
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

/**
 * El estado que resume a un alumno es el peor de sus compases: es el que le
 * dice al maestro dónde hace falta trabajo.
 */
function estadoMasAtrasado(estados) {
  const validos = estados.filter((estado) => ESTADOS_PREPARACION.includes(estado))
  if (!validos.length) return null
  return validos.reduce((peor, estado) =>
    ESTADOS_PREPARACION.indexOf(estado) < ESTADOS_PREPARACION.indexOf(peor) ? estado : peor
  )
}
