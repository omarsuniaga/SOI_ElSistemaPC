export const DIAS_TURNO = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

export function diaEfectivo(inscripcion, horarios = []) {
  if (inscripcion?.dia) return { dia: inscripcion.dia, heredado: false }
  const dias = [...new Set(horarios.map(h => h.dia).filter(Boolean))]
  return dias.length === 1 ? { dia: dias[0], heredado: true } : { dia: null, heredado: false }
}

export function ordenarHorarios(horarios = []) {
  return [...horarios].sort((a, b) =>
    DIAS_TURNO.indexOf(a.dia) - DIAS_TURNO.indexOf(b.dia) ||
    String(a.hora_inicio || '').localeCompare(String(b.hora_inicio || '')))
}

export function ordenarInscripciones(inscripciones = [], horarios = []) {
  return [...inscripciones].sort((a, b) => {
    const ad = diaEfectivo(a, horarios).dia
    const bd = diaEfectivo(b, horarios).dia
    return (ad ? DIAS_TURNO.indexOf(ad) : 7) - (bd ? DIAS_TURNO.indexOf(bd) : 7) ||
      String(a.hora_inicio || '').localeCompare(String(b.hora_inicio || '')) ||
      String(a.alumnos?.nombre_completo || '').localeCompare(String(b.alumnos?.nombre_completo || ''), 'es')
  })
}

export function agruparTurnos(inscripciones = [], horarios = []) {
  const grupos = new Map()
  for (const ins of inscripciones) {
    const dia = diaEfectivo(ins, horarios).dia
    const inicio = String(ins.hora_inicio || '00:00').slice(0, 5)
    const fin = String(ins.hora_fin || '00:00').slice(0, 5)
    const key = `${dia || 'pendiente'}|${inicio}|${fin}`
    if (!grupos.has(key)) grupos.set(key, { dia, hora_inicio: inicio, hora_fin: fin, alumnosIds: [], originalDays: {} })
    if (ins.alumno_id) {
      grupos.get(key).alumnosIds.push(ins.alumno_id)
      grupos.get(key).originalDays[ins.alumno_id] = ins.dia ?? ''
    }
  }
  return [...grupos.values()].sort((a, b) =>
    (a.dia ? DIAS_TURNO.indexOf(a.dia) : 7) - (b.dia ? DIAS_TURNO.indexOf(b.dia) : 7) || a.hora_inicio.localeCompare(b.hora_inicio))
}

export function validarTurno({ dia, horaInicio, horaFin }, horarios = []) {
  if (dia !== null && !DIAS_TURNO.includes(dia)) return 'Selecciona un día válido.'
  if (!horaInicio || !horaFin || !/^\d{2}:\d{2}$/.test(horaInicio) || !/^\d{2}:\d{2}$/.test(horaFin) || horaInicio >= horaFin) {
    return 'Indica horas válidas de inicio y fin.'
  }
  const efectivo = diaEfectivo({ dia }, horarios).dia
  if (!efectivo) return 'Selecciona un día: la clase tiene varios días.'
  if (!horarios.some(h => h.dia === efectivo && horaInicio >= String(h.hora_inicio).slice(0, 5) && horaFin <= String(h.hora_fin).slice(0, 5))) {
    return 'El turno debe estar dentro de un horario general de la clase.'
  }
  return null
}
