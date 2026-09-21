/**
 * Filtra candidatos únicamente por la búsqueda visible del modal.
 * El programa pertenece a la clase, pero no determina elegibilidad del alumno.
 */
export function alumnoCoincideBusqueda({ nombre = '', instrumento = '' } = {}, term = '') {
  return !term || nombre.includes(term) || instrumento.includes(term)
}

// Tipos guardados que el formulario muestra como "Rotativa (Turnos)".
// `individual` es el valor de compatibilidad que la API escribe cuando el
// check constraint de la base aún no acepta `rotativa`.
const TIPOS_ROTATIVOS = new Set(['rotativa', 'rotativo', 'individual'])

/**
 * Decide si la clase abre en modo rotativo.
 * El valor guardado manda: una clase `grupal` sigue siendo grupal aunque su
 * nómina arrastre horas por alumno (datos heredados). Solo se infiere desde los
 * turnos cuando la clase todavía no tiene tipo guardado (altas nuevas).
 */
export function resolveEsRotativa({ tipoClase, inscritosSlots = [] } = {}) {
  const tipoGuardado = typeof tipoClase === 'string' ? tipoClase.trim().toLowerCase() : ''
  if (tipoGuardado) return TIPOS_ROTATIVOS.has(tipoGuardado)
  return Boolean(inscritosSlots?.some(slot => Boolean(slot?.hora_inicio || slot?.hora_fin)))
}
