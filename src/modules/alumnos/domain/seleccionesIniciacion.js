// Decisión académica independiente de matrícula y de instrumento asignado.
export const DESTINOS_INICIACION = Object.freeze({
  orquesta: 'Orquesta',
  coro: 'Coro',
})

export function esAlumnoDeIniciacion(alumno, clases = []) {
  return Boolean(
    alumno?.programas?.some(p => /iniciaci[oó]n/i.test(p.nombre || '')) ||
    clases.some(c => c.es_clase_iniciacion === true ||
      /iniciaci[oó]n/i.test(c.programas?.nombre || ''))
  )
}

export function seleccionActiva(alumno, destino) {
  if (!Object.hasOwn(DESTINOS_INICIACION, destino)) return false
  return Boolean(alumno?.selecciones_iniciacion?.some(s => s.destino === destino && s.activo === true))
}

export function renderEtiquetasSeleccion(alumno) {
  return Object.entries(DESTINOS_INICIACION)
    .filter(([destino]) => seleccionActiva(alumno, destino))
    .map(([, titulo]) => `<span class="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle">Seleccionado para ${titulo}</span>`)
    .join('')
}
