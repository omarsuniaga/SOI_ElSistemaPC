/**
 * tareasMock.js — Datos en memoria que reflejan el esquema REAL de
 * `tareas_institucionales` (verificado 2026-06-25, SP-0 ampliado 2026-06-26).
 * Espejo del adaptador Supabase — MISMA API, datos en memoria.
 *
 * Enums reales:
 *   departamento: DIR | ACM | ADM | FIN | LOG | COM | TECNICO
 *   estado:       pendiente | en_progreso | completada | bloqueada | cancelada | observada
 *   prioridad:    baja | media | alta | critica
 * checklist: jsonb [{ item, completado }]
 * feedback:  TEXT (no objeto)
 *
 * SP-0 agrega:
 *   entidad_tipo, entidad_id, entidad_label (asociación polimórfica)
 *   correlation_id (agrupación por caso)
 *   updated_by, updated_by_nombre (actor real del cambio)
 *   tarea_comentarios, tarea_historial, documentos_adjuntos con storage_path
 *
 * "Mock First": la feature funciona en Demo mode antes de ir a producción.
 */

const LATENCIA = 250

const EVENT_DEMO = '00000000-0000-0000-0000-0000000000ev'
const CORR_CONCIERTO = 'corr-0000-0000-0000-concierto2026'

const ENTIDAD_TIPOS_VALIDOS = [
  'alumno', 'maestro', 'postulante', 'representante', 'instrumento', 'evento', 'otro',
]

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
    documentos_adjuntos: [
      {
        id: 'adj-acm-001',
        nombre: 'repertorio-gala-2026.pdf',
        storage_path: 'tareas/tarea-acm-001/adj-acm-001.pdf',
        mime_type: 'application/pdf',
        size_bytes: 128000,
        subido_por: 'actor-demo-uuid',
        subido_por_nombre: 'Prof. Ramírez',
        created_at: '2026-06-22T10:00:00Z',
      },
    ],
    event_id: EVENT_DEMO,
    minuta_id: null,
    created_at: '2026-06-20T09:00:00Z',
    updated_at: '2026-06-24T14:30:00Z',
    entidad_tipo: 'evento',
    entidad_id: EVENT_DEMO,
    entidad_label: 'Concierto de Gala 2026',
    correlation_id: CORR_CONCIERTO,
    updated_by: null,
    updated_by_nombre: null,
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
    entidad_tipo: null,
    entidad_id: null,
    entidad_label: null,
    correlation_id: CORR_CONCIERTO,
    updated_by: null,
    updated_by_nombre: null,
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
    entidad_tipo: null,
    entidad_id: null,
    entidad_label: null,
    correlation_id: CORR_CONCIERTO,
    updated_by: null,
    updated_by_nombre: null,
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
    entidad_tipo: null,
    entidad_id: null,
    entidad_label: null,
    correlation_id: CORR_CONCIERTO,
    updated_by: null,
    updated_by_nombre: null,
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
    entidad_tipo: null,
    entidad_id: null,
    entidad_label: null,
    correlation_id: CORR_CONCIERTO,
    updated_by: null,
    updated_by_nombre: null,
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
    entidad_tipo: 'instrumento',
    entidad_id: 'inst-comodato-lote-a',
    entidad_label: 'Lote A — Comodatos 2026',
    correlation_id: 'corr-log-002-standalone',
    updated_by: null,
    updated_by_nombre: null,
  },
]

// ─── In-memory stores for SP-0 tables ────────────────────────────────────────

const comentarios = [
  {
    id: 'coment-demo-001',
    tarea_id: 'tarea-acm-001',
    autor_id: 'actor-demo-uuid',
    autor_nombre: 'Prof. Ramírez',
    cuerpo: 'Repertorio confirmado con el director. Iniciamos ensayos seccionales el lunes.',
    created_at: '2026-06-22T09:00:00Z',
  },
  {
    id: 'coment-demo-002',
    tarea_id: 'tarea-acm-001',
    autor_id: 'actor-dir-uuid',
    autor_nombre: 'Director García',
    cuerpo: 'Confirmo el repertorio. Recuerden coordinar con LOG el traslado de instrumentos.',
    created_at: '2026-06-23T11:00:00Z',
  },
]

const historial = [
  {
    id: 'hist-demo-001',
    tarea_id: 'tarea-acm-001',
    campo: 'estado',
    valor_anterior: 'pendiente',
    valor_nuevo: 'en_progreso',
    actor_id: 'actor-dir-uuid',
    actor_nombre: 'Director García',
    actor_rol: null,
    actor_departamento: 'DIR',
    created_at: '2026-06-21T08:00:00Z',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const clone = (t) => JSON.parse(JSON.stringify(t))
const delay = (val) => new Promise((resolve) => setTimeout(() => resolve(val), LATENCIA))

let _mockSeq = 1
const genId = (prefix) => `${prefix}-${String(_mockSeq++).padStart(4, '0')}`

// ─── Existing API (unchanged) ─────────────────────────────────────────────────

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

// SP-3: agrupa las tareas mock por correlation_id (o event_id como fallback) para el Director.
export async function getProcedimientos() {
  const grupos = new Map()
  for (const t of tareas) {
    const key = t.correlation_id || t.event_id || t.id
    if (!grupos.has(key)) grupos.set(key, [])
    grupos.get(key).push(t)
  }
  const PRIO = { critica: 0, alta: 1, media: 2, baja: 3 }
  const resumen = [...grupos.entries()].map(([key, ts]) => {
    const noCanceladas = ts.filter((t) => t.estado !== 'cancelada')
    const completadas = ts.filter((t) => t.estado === 'completada').length
    const cuenta = (e) => ts.filter((t) => t.estado === e).length
    return {
      correlation_id: key,
      titulo_muestra: [...ts].sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))[0]?.titulo || 'Procedimiento',
      total: ts.length,
      completadas,
      pendientes: cuenta('pendiente'),
      en_progreso: cuenta('en_progreso'),
      bloqueadas: cuenta('bloqueada'),
      observadas: cuenta('observada'),
      canceladas: cuenta('cancelada'),
      pct_avance: noCanceladas.length === 0 ? 0 : Math.round((100 * completadas) / noCanceladas.length),
      departamentos: [...new Set(ts.map((t) => t.departamento))],
      prioridad_max: [...ts].sort((a, b) => (PRIO[a.prioridad] ?? 9) - (PRIO[b.prioridad] ?? 9))[0]?.prioridad || 'media',
      ultima_actividad: ts.reduce((m, t) => (t.updated_at > m ? t.updated_at : m), ''),
    }
  })
  return delay(resumen)
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

export async function crearEventoInstitucional(evento) {
  const eventId = `mock-event-${String(_eventSeq++).padStart(4, '0')}`
  const correlationId = `corr-${eventId}`
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
      entidad_tipo: 'evento',
      entidad_id: eventId,
      entidad_label: evento.titulo,
      correlation_id: correlationId,
      updated_by: null,
      updated_by_nombre: null,
    }
  })

  tareas.push(...generadas)
  return delay({
    evento: { id: eventId, titulo: evento.titulo, categoria: evento.categoria, fecha_inicio: evento.fecha_inicio, fecha_fin: evento.fecha_fin, departamento_responsable: evento.departamento_responsable || 'DIR' },
    tareasGeneradas: generadas.map(clone),
  })
}

export async function crearTareaInstitucional(payload) {
  const nueva = {
    id: `mock-tarea-${String(_eventSeq++).padStart(4, '0')}`,
    titulo: payload.titulo,
    descripcion: payload.descripcion || null,
    departamento: payload.departamento,
    estado: payload.estado || 'pendiente',
    prioridad: payload.prioridad || 'media',
    fecha_vencimiento: payload.fecha_vencimiento || null,
    asignado_a: payload.asignado_a || null,
    checklist: payload.checklist || [],
    feedback: null,
    documentos_adjuntos: [],
    event_id: null,
    minuta_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    entidad_tipo: payload.entidad_tipo || null,
    entidad_id: payload.entidad_id || null,
    entidad_label: payload.entidad_label || null,
    correlation_id: payload.correlation_id || genId('corr'),
    updated_by: null,
    updated_by_nombre: null,
  }
  tareas.unshift(nueva)
  return delay(clone(nueva))
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

// ─── SP-0: Comentarios ────────────────────────────────────────────────────────

export async function listarComentarios(tareaId) {
  const result = comentarios
    .filter((c) => c.tarea_id === tareaId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  return delay(result.map(clone))
}

export async function agregarComentario(tareaId, cuerpo, actor) {
  if (!cuerpo || cuerpo.trim().length === 0) {
    throw new Error('El cuerpo del comentario no puede estar vacío (comentario vacío)')
  }
  const nuevo = {
    id: genId('coment'),
    tarea_id: tareaId,
    autor_id: actor?.id ?? null,
    autor_nombre: actor?.nombre ?? null,
    cuerpo: cuerpo.trim(),
    created_at: new Date().toISOString(),
  }
  comentarios.push(nuevo)
  return delay(clone(nuevo))
}

// ─── SP-0: Historial ──────────────────────────────────────────────────────────

export async function listarHistorial(tareaId) {
  const result = historial
    .filter((h) => h.tarea_id === tareaId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  return delay(result.map(clone))
}

function _registrarHistorial(tareaId, campo, valorAnterior, valorNuevo, actor) {
  historial.push({
    id: genId('hist'),
    tarea_id: tareaId,
    campo,
    valor_anterior: valorAnterior != null ? String(valorAnterior) : null,
    valor_nuevo: valorNuevo != null ? String(valorNuevo) : null,
    actor_id: actor?.id ?? null,
    actor_nombre: actor?.nombre ?? null,
    actor_rol: null,
    actor_departamento: null,
    created_at: new Date().toISOString(),
  })
}

// ─── SP-0: Entidad asociada ───────────────────────────────────────────────────

export async function actualizarEntidadAsociada(tareaId, entidad, actor) {
  if (!ENTIDAD_TIPOS_VALIDOS.includes(entidad.tipo)) {
    throw new Error(`tipo inválido: "${entidad.tipo}". Debe ser uno de: ${ENTIDAD_TIPOS_VALIDOS.join(', ')}`)
  }
  const tarea = tareas.find((t) => t.id === tareaId)
  if (!tarea) throw new Error('Tarea no encontrada')

  const prev = { tipo: tarea.entidad_tipo, id: tarea.entidad_id, label: tarea.entidad_label }
  tarea.entidad_tipo = entidad.tipo
  tarea.entidad_id = entidad.id
  tarea.entidad_label = entidad.label
  tarea.updated_by = actor?.id ?? null
  tarea.updated_by_nombre = actor?.nombre ?? null
  tarea.updated_at = new Date().toISOString()

  if (prev.tipo !== entidad.tipo || prev.id !== entidad.id) {
    _registrarHistorial(tareaId, 'entidad_tipo', prev.tipo, entidad.tipo, actor)
  }

  return delay(clone(tarea))
}

// ─── SP-0: Adjuntos ───────────────────────────────────────────────────────────

export async function agregarAdjunto(tareaId, adjunto) {
  if (!adjunto?.storage_path) {
    throw new Error('storage_path requerido en el adjunto (required)')
  }
  const tarea = tareas.find((t) => t.id === tareaId)
  if (!tarea) throw new Error('Tarea no encontrada')

  const adjuntos = Array.isArray(tarea.documentos_adjuntos) ? tarea.documentos_adjuntos : []
  adjuntos.push(adjunto)
  tarea.documentos_adjuntos = adjuntos
  tarea.updated_at = new Date().toISOString()
  return delay(clone(tarea))
}

export async function urlFirmada(storagePath) {
  return delay(`https://mock-storage.supabase.co/signed/${encodeURIComponent(storagePath)}?token=mock`)
}

// ─── SP-0: observarTarea (RPC atómico simulado) ───────────────────────────────

export async function observarTarea(tareaId, comentario, actor) {
  if (!comentario || comentario.trim().length === 0) {
    throw new Error('observar requiere comentario (comentario vacío)')
  }
  const tarea = tareas.find((t) => t.id === tareaId)
  if (!tarea) throw new Error('Tarea no encontrada')

  const estadoAnterior = tarea.estado

  const nuevoComentario = {
    id: genId('coment'),
    tarea_id: tareaId,
    autor_id: actor?.id ?? null,
    autor_nombre: actor?.nombre ?? null,
    cuerpo: comentario.trim(),
    created_at: new Date().toISOString(),
  }
  comentarios.push(nuevoComentario)

  tarea.estado = 'observada'
  tarea.updated_by = actor?.id ?? null
  tarea.updated_by_nombre = actor?.nombre ?? null
  tarea.updated_at = new Date().toISOString()

  _registrarHistorial(tareaId, 'estado', estadoAnterior, 'observada', actor)

  return delay(undefined)
}
