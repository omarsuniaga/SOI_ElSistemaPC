// ============================================================
// Hermes Mock Data Implementation with LocalStorage Persistence
// ============================================================

const KEYS = {
  events: 'hermes_mock_events',
  tasks: 'hermes_mock_tasks',
  protocols: 'hermes_mock_protocols'
}

// Initial Seeds
const DEFAULT_PROTOCOLS = [
  {
    id: 'proto-concierto',
    categoria_evento: 'concierto',
    nombre_protocolo: 'Protocolo de Producción de Conciertos Maestro',
    descripcion: 'Automatiza las tareas de preparación y logística previas y posteriores a una presentación musical pública.',
    activo: true,
    tareas_plantilla: [
      {
        titulo: "🎼 ACM: Definir repertorio y ensayos generales - {evento_titulo}",
        descripcion: "Establecer la lista de obras y coordinar el cronograma detallado de ensayos parciales y generales.",
        departamento: "ACM",
        prioridad: "critica",
        diferencia_dias: -14,
        checklist: [
          {item: "Definir repertorio", estado: "pendiente"},
          {item: "Asignar partituras a profesores", estado: "pendiente"},
          {item: "Realizar ensayos seccionales", estado: "pendiente"},
          {item: "Realizar ensayo general", estado: "pendiente"}
        ]
      },
      {
        titulo: "📦 LOG: Coordinar logística, hidratación y sonido - {evento_titulo}",
        descripcion: "Organizar el traslado de instrumentos, sonido, refrigerios para alumnos y tarima.",
        departamento: "LOG",
        prioridad: "alta",
        diferencia_dias: -7,
        checklist: [
          {item: "Reservar transporte de autobuses", estado: "pendiente"},
          {item: "Coordinar equipo de sonido e iluminación", estado: "pendiente"},
          {item: "Garantizar agua/refrigerios para el elenco", estado: "pendiente"},
          {item: "Coordinar montaje de tarima en locación", estado: "pendiente"}
        ]
      },
      {
        titulo: "💰 FIN: Asegurar viáticos y pagos de aranceles de sala",
        descripcion: "Verificar presupuesto del evento, aprobar desembolsos de viáticos y confirmar pago de permisos de sala.",
        departamento: "FIN",
        prioridad: "alta",
        diferencia_dias: -5,
        checklist: [
          {item: "Revisar estimación presupuestaria", estado: "pendiente"},
          {item: "Emitir pagos a proveedores de logística", estado: "pendiente"},
          {item: "Realizar pago de arancel de la sala del concierto", estado: "pendiente"}
        ]
      },
      {
        titulo: "📢 COM: Diseñar piezas de difusión y convocar prensa",
        descripcion: "Desarrollar el material gráfico para redes sociales, convocar a medios locales y patrocinadores.",
        departamento: "COM",
        prioridad: "media",
        diferencia_dias: -10,
        checklist: [
          {item: "Diseñar afiche oficial del evento", estado: "pendiente"},
          {item: "Publicar en redes oficiales", estado: "pendiente"},
          {item: "Redactar y enviar nota de prensa", estado: "pendiente"},
          {item: "Coordinar fotógrafo para el día del concierto", estado: "pendiente"}
        ]
      },
      {
        titulo: "🎯 DIR: Protocolo, invitaciones especiales y discurso",
        descripcion: "Enviar invitaciones formales a patrocinadores, entes aliados y preparar palabras de apertura.",
        departamento: "DIR",
        prioridad: "critica",
        diferencia_dias: -3,
        checklist: [
          {item: "Enviar invitaciones oficiales a sponsors/donantes", estado: "pendiente"},
          {item: "Confirmar protocolo y orden de llegada de autoridades", estado: "pendiente"},
          {item: "Escribir palabras de apertura y bienvenida", estado: "pendiente"}
        ]
      }
    ]
  },
  {
    id: 'proto-patrocinio',
    categoria_evento: 'patrocinio',
    nombre_protocolo: 'Protocolo de Atención a Donantes y Aliados',
    descripcion: 'Procedimiento operativo para preparar visitas institucionales de patrocinadores actuales o potenciales.',
    activo: true,
    tareas_plantilla: [
      {
        titulo: "🎯 DIR: Preparar informe de impacto de donaciones",
        descripcion: "Armar la carpeta institucional de resultados pedagógicos y financieros para el patrocinante.",
        departamento: "DIR",
        prioridad: "alta",
        diferencia_dias: -2,
        checklist: [
          {item: "Extraer métricas de asistencia de la base de datos", estado: "pendiente"},
          {item: "Consolidar informe financiero simplificado", estado: "pendiente"},
          {item: "Preparar carta de agradecimiento oficial firmada", estado: "pendiente"}
        ]
      },
      {
        titulo: "🎼 ACM: Organizar muestra musical en vivo - {evento_titulo}",
        descripcion: "Coordinar una pequeña pieza demostrativa (5-10 minutos) con los alumnos durante la visita.",
        departamento: "ACM",
        prioridad: "alta",
        diferencia_dias: -3,
        checklist: [
          {item: "Seleccionar el ensamble o alumnos solistas", estado: "pendiente"},
          {item: "Montar y ensayar la pieza corta", estado: "pendiente"},
          {item: "Alinear a los alumnos sobre el protocolo de bienvenida", estado: "pendiente"}
        ]
      },
      {
        titulo: "📦 LOG: Adecuación y limpieza de espacios",
        descripcion: "Verificar que el salón de ensayos principal y oficinas estén impecables para la recepción.",
        departamento: "LOG",
        prioridad: "media",
        diferencia_dias: -1,
        checklist: [
          {item: "Solicitar jornada especial de limpieza en salones", estado: "pendiente"},
          {item: "Disponer estación de café/agua para la visita", estado: "pendiente"}
        ]
      }
    ]
  }
]

const getStorageItem = (key, defaultVal) => {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : defaultVal
}

const setStorageItem = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val))
}

// Seed local storage with default events and tasks if empty
const initMockDB = () => {
  const events = getStorageItem(KEYS.events, [])
  const tasks = getStorageItem(KEYS.tasks, [])
  const protocols = getStorageItem(KEYS.protocols, [])

  if (protocols.length === 0) {
    setStorageItem(KEYS.protocols, DEFAULT_PROTOCOLS)
  }

  if (events.length === 0) {
    const today = new Date()
    const concertDate = new Date(today)
    concertDate.setDate(today.getDate() + 10)
    concertDate.setHours(19, 0, 0, 0)
    
    const concertEnd = new Date(concertDate)
    concertEnd.setHours(21, 0, 0, 0)

    const sponsorDate = new Date(today)
    sponsorDate.setDate(today.getDate() + 3)
    sponsorDate.setHours(10, 0, 0, 0)
    
    const sponsorEnd = new Date(sponsorDate)
    sponsorEnd.setHours(12, 0, 0, 0)

    const defaultEvents = [
      {
        id: 'evt-concert-1',
        titulo: 'Gran Gala del Sol Punta Cana',
        descripcion: 'Presentación anual de gala en el teatro principal con patrocinadores internacionales.',
        categoria: 'concierto',
        fecha_inicio: concertDate.toISOString(),
        fecha_fin: concertEnd.toISOString(),
        ubicacion: 'Centro de Convenciones Meliá',
        departamento_responsable: 'ACM',
        estado: 'programado',
        created_at: today.toISOString(),
        updated_at: today.toISOString()
      },
      {
        id: 'evt-sponsor-1',
        titulo: 'Visita Ejecutiva Fundación Meliá',
        descripcion: 'Visita de la mesa directiva para auditar el uso de fondos del programa de becas.',
        categoria: 'patrocinio',
        fecha_inicio: sponsorDate.toISOString(),
        fecha_fin: sponsorEnd.toISOString(),
        ubicacion: 'Sede Principal del SOI',
        departamento_responsable: 'DIR',
        estado: 'programado',
        created_at: today.toISOString(),
        updated_at: today.toISOString()
      }
    ]

    setStorageItem(KEYS.events, defaultEvents)

    // Generate mock tasks corresponding to the events based on protocols
    const defaultTasks = []
    
    // Concert tasks (using proto-concierto)
    const concertEvent = defaultEvents[0]
    const pConcert = DEFAULT_PROTOCOLS[0]
    pConcert.tareas_plantilla.forEach((t, index) => {
      const v_date = new Date(concertEvent.fecha_inicio)
      v_date.setDate(v_date.getDate() + t.diferencia_dias)
      
      defaultTasks.push({
        id: `task-concert-${index}`,
        event_id: concertEvent.id,
        titulo: t.titulo.replace('{evento_titulo}', concertEvent.titulo),
        descripcion: t.descripcion.replace('{evento_titulo}', concertEvent.titulo),
        departamento: t.departamento,
        asignado_a: 'Coordinador del Área',
        estado: index === 0 ? 'en_progreso' : 'pendiente',
        prioridad: t.prioridad,
        fecha_vencimiento: v_date.toISOString().split('T')[0],
        checklist: t.checklist.map(c => ({ ...c })),
        documentos_adjuntos: [],
        feedback: '',
        created_at: today.toISOString(),
        updated_at: today.toISOString()
      })
    })

    // Sponsor tasks
    const sponsorEvent = defaultEvents[1]
    const pSponsor = DEFAULT_PROTOCOLS[1]
    pSponsor.tareas_plantilla.forEach((t, index) => {
      const v_date = new Date(sponsorEvent.fecha_inicio)
      v_date.setDate(v_date.getDate() + t.diferencia_dias)
      
      defaultTasks.push({
        id: `task-sponsor-${index}`,
        event_id: sponsorEvent.id,
        titulo: t.titulo.replace('{evento_titulo}', sponsorEvent.titulo),
        descripcion: t.descripcion.replace('{evento_titulo}', sponsorEvent.titulo),
        departamento: t.departamento,
        asignado_a: 'Director Ejecutivo',
        estado: 'pendiente',
        prioridad: t.prioridad,
        fecha_vencimiento: v_date.toISOString().split('T')[0],
        checklist: t.checklist.map(c => ({ ...c })),
        documentos_adjuntos: [],
        feedback: '',
        created_at: today.toISOString(),
        updated_at: today.toISOString()
      })
    })

    setStorageItem(KEYS.tasks, defaultTasks)
  }
}

// Run DB Initialization
initMockDB()

export async function obtenerEventos() {
  const events = getStorageItem(KEYS.events, [])
  return { data: events, error: null }
}

export async function crearEvento(evento) {
  const events = getStorageItem(KEYS.events, [])
  const newEvent = {
    ...evento,
    id: `evt-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  events.push(newEvent)
  setStorageItem(KEYS.events, events)

  // Run auto-delegator trigger in JS for mock mode!
  const protocols = getStorageItem(KEYS.protocols, [])
  const proto = protocols.find(p => p.categoria_evento === newEvent.categoria && p.activo)
  if (proto) {
    const tasks = getStorageItem(KEYS.tasks, [])
    proto.tareas_plantilla.forEach((t, index) => {
      const v_date = new Date(newEvent.fecha_inicio)
      v_date.setDate(v_date.getDate() + t.diferencia_dias)

      tasks.push({
        id: `task-auto-${newEvent.id}-${index}`,
        event_id: newEvent.id,
        titulo: t.titulo.replace('{evento_titulo}', newEvent.titulo),
        descripcion: t.descripcion.replace('{evento_titulo}', newEvent.titulo),
        departamento: t.departamento,
        asignado_a: 'Asignación Automática Hermes',
        estado: 'pendiente',
        prioridad: t.prioridad,
        fecha_vencimiento: v_date.toISOString().split('T')[0],
        checklist: t.checklist ? t.checklist.map(c => ({ ...c })) : [],
        documentos_adjuntos: [],
        feedback: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    })
    setStorageItem(KEYS.tasks, tasks)
  }

  return { data: newEvent, error: null }
}

export async function eliminarEvento(id) {
  let events = getStorageItem(KEYS.events, [])
  events = events.filter(e => e.id !== id)
  setStorageItem(KEYS.events, events)

  // Cascading tasks delete
  let tasks = getStorageItem(KEYS.tasks, [])
  tasks = tasks.filter(t => t.event_id !== id)
  setStorageItem(KEYS.tasks, tasks)

  return { data: { id }, error: null }
}

export async function obtenerTareas(filtros = {}) {
  let tasks = getStorageItem(KEYS.tasks, [])
  const events = getStorageItem(KEYS.events, [])

  // Join events
  tasks = tasks.map(t => {
    const ev = events.find(e => e.id === t.event_id)
    return {
      ...t,
      calendario_institucional: ev ? { titulo: ev.titulo, categoria: ev.categoria } : null
    }
  })

  if (filtros.departamento) {
    tasks = tasks.filter(t => t.departamento === filtros.departamento)
  }
  if (filtros.estado) {
    tasks = tasks.filter(t => t.estado === filtros.estado)
  }
  if (filtros.event_id) {
    tasks = tasks.filter(t => t.event_id === filtros.event_id)
  }

  return { data: tasks, error: null }
}

export async function crearTarea(tarea) {
  const tasks = getStorageItem(KEYS.tasks, [])
  const newTask = {
    ...tarea,
    id: `task-${Date.now()}`,
    documentos_adjuntos: tarea.documentos_adjuntos || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  tasks.push(newTask)
  setStorageItem(KEYS.tasks, tasks)
  return { data: newTask, error: null }
}

export async function actualizarTarea(id, campos) {
  const tasks = getStorageItem(KEYS.tasks, [])
  const idx = tasks.findIndex(t => t.id === id)
  if (idx !== -1) {
    tasks[idx] = {
      ...tasks[idx],
      ...campos,
      updated_at: new Date().toISOString()
    }
    setStorageItem(KEYS.tasks, tasks)
    return { data: tasks[idx], error: null }
  }
  return { data: null, error: { message: 'Task not found' } }
}

export async function eliminarTarea(id) {
  let tasks = getStorageItem(KEYS.tasks, [])
  tasks = tasks.filter(t => t.id !== id)
  setStorageItem(KEYS.tasks, tasks)
  return { data: { id }, error: null }
}

export async function obtenerProtocolos() {
  const protocols = getStorageItem(KEYS.protocols, [])
  return { data: protocols, error: null }
}

export async function actualizarProtocolo(id, campos) {
  const protocols = getStorageItem(KEYS.protocols, [])
  const idx = protocols.findIndex(p => p.id === id)
  if (idx !== -1) {
    protocols[idx] = {
      ...protocols[idx],
      ...campos,
      updated_at: new Date().toISOString()
    }
    setStorageItem(KEYS.protocols, protocols)
    return { data: protocols[idx], error: null }
  }
  return { data: null, error: { message: 'Protocol not found' } }
}

export async function crearProtocolo(proto) {
  const protocols = getStorageItem(KEYS.protocols, [])
  const newProto = {
    ...proto,
    id: `proto-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  protocols.push(newProto)
  setStorageItem(KEYS.protocols, protocols)
  return { data: newProto, error: null }
}
