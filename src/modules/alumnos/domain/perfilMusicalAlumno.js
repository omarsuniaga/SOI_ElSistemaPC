/** La situación actual se obtiene de inscripciones activas, nunca de una preferencia. */
export function perfilMusicalAlumno(alumno, clases = []) {
  const normalizar = valor => (valor || '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const principal = normalizar(alumno.instrumento_principal)
  const instrumentosGenerales = new Set(['no aplica', 'todos', 'coro', 'voz', 'canto', 'madera', 'vientos metales'])
  const clasesInstrumentales = clases.filter(c => {
    const instrumento = normalizar(c.instrumento)
    return instrumento && !instrumentosGenerales.has(instrumento)
  })
  const enIniciacion = clases.some(c =>
    c.programas?.nombre === 'Iniciación Musical' ||
    (!c.programas && c.nombre?.startsWith('Iniciación Musical'))
  )
  const tieneCatedraInstrumental = clasesInstrumentales.length > 0
  const instrumentoPrincipalCoincide = Boolean(principal) && clasesInstrumentales.some(c => {
    const instrumento = normalizar(c.instrumento)
    return instrumento.startsWith(principal) || principal.startsWith(instrumento) ||
      instrumento.includes(principal) || principal.includes(instrumento)
  })

  return {
    enIniciacion,
    tieneCatedraInstrumental,
    instrumentoPrincipalCoincide,
    instrumentoPrincipal: alumno.instrumento_principal?.trim() || null,
    instrumentoInteres: alumno.instrumento_interes?.trim() || null,
  }
}
