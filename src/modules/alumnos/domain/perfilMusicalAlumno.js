/** La situación actual se obtiene de inscripciones activas, nunca de una preferencia. */
export function perfilMusicalAlumno(alumno, clases = []) {
  const enIniciacion = clases.some(c =>
    c.programas?.nombre === 'Iniciación Musical' ||
    (!c.programas && c.nombre?.startsWith('Iniciación Musical'))
  )
  const tieneCatedraInstrumental = clases.some(c =>
    c.instrumento && !['no aplica', 'todos'].includes(c.instrumento.trim().toLowerCase())
  )

  return {
    enIniciacion,
    tieneCatedraInstrumental,
    instrumentoPrincipal: alumno.instrumento_principal?.trim() || null,
    instrumentoInteres: alumno.instrumento_interes?.trim() || null,
  }
}
