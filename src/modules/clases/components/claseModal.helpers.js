export function getAlumnoProgramaId(alumno) {
  return alumno?.programa_id ?? alumno?.programaId ?? alumno?.programa?.id ?? ''
}

export function alumnoPerteneceAPrograma(alumno, programaId) {
  if (!programaId) return true
  return String(getAlumnoProgramaId(alumno)) === String(programaId)
}
