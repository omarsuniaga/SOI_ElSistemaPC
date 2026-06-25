/**
 * tareasMock.js — Datos en memoria que reflejan el esquema REAL de
 * `tareas_institucionales` (verificado 2026-06-25). Espejo del adaptador Supabase.
 *
 * Enums reales:
 *   departamento: DIR | ACM | ADM | FIN | LOG | COM | TECNICO
 *   estado:       pendiente | en_progreso | completada | bloqueada | cancelada
 *   prioridad:    baja | media | alta | critica
 * checklist: jsonb [{ item, completado }]
 * feedback:  TEXT (no objeto)
 *
 * Las tareas demo imitan las que genera el protocolo de concierto vía
 * fn_hermes_auto_delegar_tareas, más algunas de otros departamentos.
 */

const LATENCIA = 250

const EVENT_DEMO = '00000000-0000-0000-0000-0000000000ev'

const tareas = [
  {
    id: 'tarea-acm-001',
    titulo: '🎼 ACM: Definir repertorio y ensayos generales - Concierto de Gala',
    descripcion:
      'Establecer la lista de obras y coordinar el cronograma detallado de ensayos parciales y generales.',
    departamento: 'ACM',
    estado: 'en_progreso',
    prioridad: 'critica',
    fecha_vencimiento: '2026-07-11',
    asignado_a: null,
    checklist: [
      { item: 'Definir repertorio', completado: true },
      { item: 'Asignar partituras a profesores', completado: true },
      { item: 'Realizar ensayos seccionales', completado: false },
      { item: 'Realizar ensayo general', completado: false },
    ],
    feedback: null,
    documentos_adjuntos: [],
    event_id: EVENT_DEMO,
    minuta_id: null,
    created_at: '2026-06-20T09:00:00Z',
    updated_at: '2026-06-24T14:30:00Z',
  },
  {
    id: 'tarea-com-001',
    titulo: '📢 COM: Diseñar piezas de difusión y convocar prensa',
    descripcion:
      'Desarrollar el material gráfico para redes sociales, convocar a medios locales y patrocinadores.',
    departamento: 'COM',
    estado: 'pendiente',
    prioridad: 'media',
    fecha_vencimiento: '2026-07-15',
    asignado_a: null,
    checklist: [
      { item: 'Diseñar afiche oficial del evento', completado: false },
      { item: 'Publicar en redes oficiales', completado: false },
      { item: 'Redactar y enviar nota de prensa', completado: false },
      { item: 'Coordinar fotógrafo para el día del concierto', completado: false },
    ],
    feedback: null,
    documentos_adjuntos: [],
    event_id: EVENT_DEMO,
    minuta_id: null,
    created_at: '2026-06-20T09:00:00Z',
    updated_at: '2026-06-20T09:00:00Z',
  },
  {
    id: 'tarea-log-001',
    titulo: '📦 LOG: Coordinar logística, hidratación y sonido - Concierto de Gala',
    descripcion:
      'Organizar el traslado de instrumentos, sonido, refrigerios para alumnos y tarima.',
    departamento: 'LOG',
    estado: 'pendiente',
    prioridad: 'alta',
    fecha_vencimiento: '2026-07-18',
    asignado_a: null,
    checklist: [
      { item: 'Reservar transporte escolar/autobuses', completado: false },
      { item: 'Coordinar equipo de sonido e iluminación', completado: false },
      { item: 'Garantizar agua/refrigerios para el elenco', completado: false },
      { item: 'Coordinar montaje de tarima en locación', completado: false },
    ],
    feedback: null,
    documentos_adjuntos: [],
    event_id: EVENT_DEMO,
    minuta_id: null,
    created_at: '2026-06-20T09:00:00Z',
    updated_at: '2026-06-20T09:00:00Z',
  },
  {
    id: 'tarea-fin-001',
    titulo: '💰 FIN: Asegurar viáticos y pagos de aranceles de sala',
    descripcion:
      'Verificar presupuesto del evento, aprobar desembolsos de viáticos y confirmar pago de permisos de sala.',
    departamento: 'FIN',
    estado: 'bloqueada',
    prioridad: 'alta',
    fecha_vencimiento: '2026-07-20',
    asignado_a: null,
    checklist: [
      { item: 'Revisar estimación presupuestaria', completado: true },
      { item: 'Emitir pagos a proveedores de logística', completado: false },
      { item: 'Realizar pago de arancel de la sala del concierto', completado: false },
    ],
    feedback: 'Bloqueada: a la espera de la confirmación del presupuesto por Dirección.',
    documentos_adjuntos: [],
    event_id: EVENT_DEMO,
    minuta_id: null,
    created_at: '2026-06-20T09:00:00Z',
    updated_at: '2026-06-23T16:00:00Z',
  },
  {
    id: 'tarea-dir-001',
    titulo: '🎯 DIR: Protocolo, invitaciones especiales y discurso',
    descripcion:
      'Enviar invitaciones formales a patrocinadores, entes aliados y preparar palabras de apertura.',
    departamento: 'DIR',
    estado: 'pendiente',
    prioridad: 'critica',
    fecha_vencimiento: '2026-07-22',
    asignado_a: null,
    checklist: [
      { item: 'Enviar invitaciones oficiales a sponsors/donantes', completado: false },
      { item: 'Confirmar protocolo y orden de llegada de autoridades', completado: false },
      { item: 'Escribir palabras de apertura y bienvenida', completado: false },
    ],
    feedback: null,
    documentos_adjuntos: [],
    event_id: EVENT_DEMO,
    minuta_id: null,
    created_at: '2026-06-20T09:00:00Z',
    updated_at: '2026-06-20T09:00:00Z',
  },
  {
    id: 'tarea-log-002',
    titulo: '📦 LOG: Revisión de stock de instrumentos en comodato',
    descripcion: 'Verificar el estado de instrumentos prestados y detectar reposiciones.',
    departamento: 'LOG',
    estado: 'completada',
    prioridad: 'media',
    fecha_vencimiento: '2026-06-18',
    asignado_a: null,
    checklist: [
      { item: 'Inventariar instrumentos en comodato', completado: true },
      { item: 'Reportar daños', completado: true },
    ],
    feedback: 'Completada sin novedades. 29 comodatos verificados, 2 requieren mantenimiento menor.',
    documentos_adjuntos: [],
    event_id: null,
    minuta_id: null,
    created_at: '2026-06-10T09:00:00Z',
    updated_at: '2026-06-18T11:00:00Z',
  },
]

const clone = (t) => JSON.parse(JSON.stringify(t))
const delay = (val) => new Promise((resolve) => setTimeout(() => resolve(val), LATENCIA))

export async function getTareas() {
  return delay(tareas.map(clone))
}

export async function getTareaById(tareaId) {
  const tarea = tareas.find((t) => t.id === tareaId)
  if (!tarea) throw new Error('Tarea no encontrada')
  return delay(clone(tarea))
}

export async function getTareasByDepartamento(departamento) {
  return delay(tareas.filter((t) => t.departamento === departamento).map(clone))
}

export async function getTareasByEvento(eventId) {
  return delay(tareas.filter((t) => t.event_id === eventId).map(clone))
}

export async function updateTareaEstado(tareaId, nuevoEstado) {
  const tarea = tareas.find((t) => t.id === tareaId)
  if (!tarea) throw new Error('Tarea no encontrada')
  tarea.estado = nuevoEstado
  tarea.updated_at = new Date().toISOString()
  return delay(clone(tarea))
}

export async function updateChecklistItem(tareaId, indice, completado) {
  const tarea = tareas.find((t) => t.id === tareaId)
  if (!tarea) throw new Error('Tarea no encontrada')
  if (indice < 0 || indice >= tarea.checklist.length) {
    throw new Error('Índice de checklist fuera de rango')
  }
  tarea.checklist[indice].completado = completado
  tarea.updated_at = new Date().toISOString()
  return delay(clone(tarea))
}

export async function completarTarea(tareaId, feedbackTexto = null) {
  const tarea = tareas.find((t) => t.id === tareaId)
  if (!tarea) throw new Error('Tarea no encontrada')
  tarea.estado = 'completada'
  if (feedbackTexto != null) tarea.feedback = feedbackTexto
  tarea.updated_at = new Date().toISOString()
  return delay(clone(tarea))
}

export async function guardarFeedback(tareaId, feedbackTexto) {
  const tarea = tareas.find((t) => t.id === tareaId)
  if (!tarea) throw new Error('Tarea no encontrada')
  tarea.feedback = feedbackTexto
  tarea.updated_at = new Date().toISOString()
  return delay(clone(tarea))
}

// Plantillas de cascada por categoría de evento (espejo de hermes_protocolos).
// Cada entrada genera una tarea departamental al crear el evento.
const CASCADA_POR_CATEGORIA = {
  concierto: [
    { departamento: 'ACM', prioridad: 'critica', dias: 21, titulo: '🎼 ACM: Definir repertorio y ensayos', checklist: ['Definir repertorio', 'Asignar partituras', 'Ensayos seccionales', 'Ensayo general'] },
    { departamento: 'COM', prioridad: 'media', dias: 25, titulo: '📢 COM: Difusión y prensa', checklist: ['Diseñar afiche', 'Publicar en redes', 'Nota de prensa', 'Coordinar fotógrafo'] },
    { departamento: 'LOG', prioridad: 'alta', dias: 28, titulo: '📦 LOG: Logística, sonido e hidratación', checklist: ['Reservar transporte', 'Sonido e iluminación', 'Refrigerios', 'Montaje de tarima'] },
    { departamento: 'FIN', prioridad: 'alta', dias: 30, titulo: '💰 FIN: Viáticos y aranceles de sala', checklist: ['Revisar presupuesto', 'Pagos a proveedores', 'Pago de arancel de sala'] },
    { departamento: 'DIR', prioridad: 'critica', dias: 32, titulo: '🎯 DIR: Protocolo, invitaciones y discurso', checklist: ['Invitaciones a sponsors', 'Confirmar protocolo', 'Palabras de apertura'] },
  ],
  reunion: [
    { departamento: 'DIR', prioridad: 'media', dias: 3, titulo: '🎯 DIR: Preparar agenda y convocatoria', checklist: ['Definir agenda', 'Convocar participantes'] },
  ],
  pago: [
    { departamento: 'FIN', prioridad: 'alta', dias: 5, titulo: '💰 FIN: Procesar pago programado', checklist: ['Verificar fondos', 'Emitir pago', 'Registrar comprobante'] },
  ],
}

let _eventSeq = 1

/**
 * Simula la cascada Hermes: crea un evento y genera tareas departamentales
 * según la categoría. Espejo de fn_hermes_auto_delegar_tareas.
 */
export async function crearEventoInstitucional(evento) {
  const eventId = `mock-event-${String(_eventSeq++).padStart(4, '0')}`
  const base = evento.fecha_inicio ? new Date(evento.fecha_inicio) : new Date()
  const plantilla = CASCADA_POR_CATEGORIA[evento.categoria] || []

  const generadas = plantilla.map((p, i) => {
    const venc = new Date(base.getTime() - p.dias * 86400000)
    return {
      id: `${eventId}-t${i}`,
      titulo: p.titulo,
      descripcion: `Generada por Hermes para «${evento.titulo}».`,
      departamento: p.departamento,
      estado: 'pendiente',
      prioridad: p.prioridad,
      fecha_vencimiento: venc.toISOString().slice(0, 10),
      asignado_a: null,
      checklist: p.checklist.map((item) => ({ item, completado: false })),
      feedback: null,
      documentos_adjuntos: [],
      event_id: eventId,
      minuta_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  })

  tareas.push(...generadas)
  return delay({
    evento: { id: eventId, titulo: evento.titulo, categoria: evento.categoria, fecha_inicio: evento.fecha_inicio, fecha_fin: evento.fecha_fin, departamento_responsable: evento.departamento_responsable || 'DIR' },
    tareasGeneradas: generadas.map(clone),
  })
}

export async function getTareasFiltradas(filtros = {}) {
  let res = tareas.map(clone)
  if (filtros.departamento) res = res.filter((t) => t.departamento === filtros.departamento)
  if (filtros.estado) res = res.filter((t) => t.estado === filtros.estado)
  if (filtros.prioridad) res = res.filter((t) => t.prioridad === filtros.prioridad)
  if (filtros.asignado_a) res = res.filter((t) => t.asignado_a === filtros.asignado_a)
  if (filtros.event_id) res = res.filter((t) => t.event_id === filtros.event_id)
  if (filtros.buscar) {
    const q = filtros.buscar.toLowerCase()
    res = res.filter(
      (t) =>
        t.titulo.toLowerCase().includes(q) ||
        (t.descripcion || '').toLowerCase().includes(q),
    )
  }
  return delay(res)
}
