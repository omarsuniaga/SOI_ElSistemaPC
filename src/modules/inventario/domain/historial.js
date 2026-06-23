export const TIPOS_EVENTO = [
  'asignacion', 'devolucion', 'reparacion', 'cambio_estado',
  'baja', 'creacion', 'observacion',
]

export const ICONOS_EVENTO = {
  asignacion: 'bi-clipboard-check',
  devolucion: 'bi-box-arrow-left',
  reparacion: 'bi-tools',
  cambio_estado: 'bi-arrow-repeat',
  baja: 'bi-trash',
  creacion: 'bi-plus-circle',
  observacion: 'bi-chat-dots',
}

let _eventoCounter = 0

function generarId() {
  _eventoCounter++
  return `evt-${Date.now()}-${_eventoCounter}`
}

export function crearEvento(activoId, tipo, descripcion, usuarioId, metadata) {
  if (!TIPOS_EVENTO.includes(tipo)) {
    throw new Error(`tipo_evento inválido: ${tipo}. Válidos: ${TIPOS_EVENTO.join(', ')}`)
  }
  return {
    id: generarId(),
    activo_id: activoId,
    tipo_evento: tipo,
    descripcion,
    fecha: new Date().toISOString(),
    usuario_id: usuarioId || null,
    metadata: metadata || null,
  }
}

export function crearEventoAsignacion(activoId, alumnoNombre, usuarioId) {
  return crearEvento(
    activoId,
    'asignacion',
    `Instrumento asignado a ${alumnoNombre}`,
    usuarioId,
  )
}

export function crearEventoDevolucion(activoId, alumnoNombre, usuarioId) {
  return crearEvento(
    activoId,
    'devolucion',
    `Instrumento devuelto por ${alumnoNombre}`,
    usuarioId,
  )
}

export function eventosPorTipo(eventos, tipo) {
  return eventos.filter(e => e.tipo_evento === tipo)
}

export function formatearEvento(evento) {
  const fecha = new Date(evento.fecha)
  const fechaLegible = fecha.toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return {
    ...evento,
    icono: ICONOS_EVENTO[evento.tipo_evento] || 'bi-question-circle',
    fecha_legible: fechaLegible,
    tipo_label: evento.tipo_evento.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  }
}

export function agruparPorFecha(eventos) {
  const grupos = {}
  eventos.forEach(evt => {
    const fecha = new Date(evt.fecha)
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
    if (!grupos[key]) grupos[key] = []
    grupos[key].push(evt)
  })
  return grupos
}

export function lineTime(eventos) {
  return [...eventos]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .map(e => formatearEvento(e))
}
