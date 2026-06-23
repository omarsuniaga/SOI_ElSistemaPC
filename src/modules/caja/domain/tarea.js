/**
 * Domain: tarea
 * Task management — no Supabase imports.
 */

export function buildTarea({
  titulo,
  tipo,
  asignado_a,
  familia_id,
  alumno_id,
  prioridad,
  fecha_vencimiento,
  recurrente,
  patron_recurrencia,
}) {
  return {
    titulo,
    tipo,
    asignado_a,
    familia_id,
    alumno_id,
    prioridad,
    fecha_vencimiento,
    recurrente: recurrente === true,
    patron_recurrencia: patron_recurrencia || null,
    estado: 'pendiente',
  }
}

export function calcularProximaOcurrencia(tarea, desde) {
  if (!tarea.recurrente || !tarea.patron_recurrencia) return null

  const { tipo, dia } = tarea.patron_recurrencia
  const next = new Date(desde)

  if (tipo === 'semanal') {
    next.setDate(next.getDate() + 7)
    return next
  }

  if (tipo === 'mensual') {
    const month = next.getMonth() + 1
    const year = next.getMonth() === 11 ? next.getFullYear() + 1 : next.getFullYear()
    const targetMonth = next.getMonth() === 11 ? 0 : month
    next.setFullYear(year)
    next.setMonth(targetMonth)
    next.setDate(dia)
    return next
  }

  return null
}

export function tareaVencida(tarea, today) {
  if (['completada', 'cancelada'].includes(tarea.estado)) return false
  return new Date(tarea.fecha_vencimiento) < today
}

export function buildTareaDesdeNotif(notificacion, cajero_id) {
  return buildTarea({
    titulo: notificacion.titulo || 'Seguimiento de mora',
    tipo: 'seguimiento_pago',
    asignado_a: cajero_id,
    familia_id: notificacion.familia_id,
    alumno_id: notificacion.alumno_id,
    prioridad: notificacion.prioridad,
    fecha_vencimiento: null,
    recurrente: false,
    patron_recurrencia: null,
  })
}
