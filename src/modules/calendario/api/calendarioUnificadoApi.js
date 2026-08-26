/**
 * calendarioUnificadoApi.js — DataAdapter unificado del Calendario Institucional SOI
 * Integra:
 *   1. Eventos Institucionales (public.calendario_institucional)
 *   2. Horarios y Clases Regulares (public.clase_horarios + public.clases)
 *   3. Tareas Hermes vinculadas a eventos
 */

import { supabase } from '../../../lib/supabaseClient.js'

export const EVENT_CATEGORIAS = {
  concierto: {
    label: 'Concierto / Presentación',
    icon: 'bi-music-note-beamed',
    color: '#8b5cf6', // Violet / Imperial
    textColor: '#ffffff',
    deptDefault: 'ACM',
  },
  academico: {
    label: 'Académico / Clases y Talleres',
    icon: 'bi-mortarboard',
    color: '#3b82f6', // Blue
    textColor: '#ffffff',
    deptDefault: 'ACM',
  },
  ensayo: {
    label: 'Ensayo General / Seccional',
    icon: 'bi-soundwave',
    color: '#06b6d4', // Cyan
    textColor: '#ffffff',
    deptDefault: 'ACM',
  },
  administrativo: {
    label: 'Administrativo / Operativo',
    icon: 'bi-briefcase',
    color: '#64748b', // Slate
    textColor: '#ffffff',
    deptDefault: 'ADM',
  },
  reunion: {
    label: 'Reunión de Coordinación / Junta',
    icon: 'bi-people',
    color: '#6366f1', // Indigo
    textColor: '#ffffff',
    deptDefault: 'DIR',
  },
  pago: {
    label: 'Finanzas / Pagos y Nómina',
    icon: 'bi-cash-coin',
    color: '#10b981', // Emerald
    textColor: '#ffffff',
    deptDefault: 'FIN',
  },
  corte: {
    label: 'Corte Contable / Auditoría',
    icon: 'bi-pie-chart',
    color: '#f59e0b', // Amber
    textColor: '#ffffff',
    deptDefault: 'FIN',
  },
  inscripcion: {
    label: 'Inscripciones / Admisiones',
    icon: 'bi-person-plus',
    color: '#ec4899', // Pink
    textColor: '#ffffff',
    deptDefault: 'ADM',
  },
  auditoria: {
    label: 'Supervisión / Control de Calidad',
    icon: 'bi-shield-check',
    color: '#ef4444', // Red
    textColor: '#ffffff',
    deptDefault: 'DIR',
  },
  patrocinio: {
    label: 'Relaciones Públicas / Patrocinio',
    icon: 'bi-star',
    color: '#eab308', // Yellow/Gold
    textColor: '#000000',
    deptDefault: 'COM',
  },
  otro: {
    label: 'Otro Evento Institucional',
    icon: 'bi-calendar-event',
    color: '#71717a', // Zinc
    textColor: '#ffffff',
    deptDefault: 'DIR',
  },
}

export const DEPARTAMENTOS_SOI = [
  { id: 'TODOS', label: 'Todos los Deptos.' },
  { id: 'ACM', label: 'ACM · Académico' },
  { id: 'ADM', label: 'ADM · Administrativo' },
  { id: 'COM', label: 'COM · Comunicaciones' },
  { id: 'FIN', label: 'FIN · Finanzas' },
  { id: 'DIR', label: 'DIR · Dirección' },
  { id: 'LUT', label: 'LUT · Lutería' },
  { id: 'TEC', label: 'TEC · Técnico / PWA' },
]

const DIAS_MAP = {
  0: 'domingo',
  1: 'lunes',
  2: 'martes',
  3: 'miercoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sabado',
}

/**
 * Obtiene eventos combinados para FullCalendar dentro de un rango de fechas.
 * @param {Object} options
 * @param {Date|string} options.start - Fecha de inicio ISO
 * @param {Date|string} options.end - Fecha de fin ISO
 * @param {string} [options.categoria] - Filtro de categoría ('todas' o categoría específica)
 * @param {string} [options.departamento] - Filtro de departamento ('TODOS' o código)
 * @param {string} [options.search] - Texto de búsqueda libre
 * @param {boolean} [options.incluirClases] - Si incluye horarios de clases regulares
 * @returns {Promise<Array>} Lista de eventos en formato FullCalendar
 */
export async function obtenerEventosCalendario({
  start,
  end,
  categoria = 'todas',
  departamento = 'TODOS',
  search = '',
  incluirClases = true,
} = {}) {
  const eventosResultado = []

  // 1. Obtener eventos de calendario_institucional
  let queryEventos = supabase
    .from('calendario_institucional')
    .select('*')

  if (start) {
    const startDate = typeof start === 'string' ? start : start.toISOString()
    queryEventos = queryEventos.gte('fecha_fin', startDate)
  }
  if (end) {
    const endDate = typeof end === 'string' ? end : end.toISOString()
    queryEventos = queryEventos.lte('fecha_inicio', endDate)
  }

  if (categoria && categoria !== 'todas') {
    queryEventos = queryEventos.eq('categoria', categoria)
  }

  if (departamento && departamento !== 'TODOS') {
    queryEventos = queryEventos.eq('departamento_responsable', departamento)
  }

  const { data: eventosRaw, error: errEventos } = await queryEventos

  if (errEventos) {
    console.error('[calendarioUnificadoApi] Error cargando eventos institucionales:', errEventos)
  } else if (eventosRaw) {
    eventosRaw.forEach(ev => {
      const catConfig = EVENT_CATEGORIAS[ev.categoria] || EVENT_CATEGORIAS.otro
      
      // Filtro de búsqueda por texto
      if (search && search.trim()) {
        const q = search.toLowerCase()
        const matchTitle = (ev.titulo || '').toLowerCase().includes(q)
        const matchDesc = (ev.descripcion || '').toLowerCase().includes(q)
        const matchLoc = (ev.ubicacion || '').toLowerCase().includes(q)
        if (!matchTitle && !matchDesc && !matchLoc) return
      }

      eventosResultado.push({
        id: `inst-${ev.id}`,
        rawId: ev.id,
        title: ev.titulo,
        start: ev.fecha_inicio,
        end: ev.fecha_fin || ev.fecha_inicio,
        allDay: Boolean(ev.all_day || (!ev.fecha_inicio.includes('T') && !ev.fecha_fin?.includes('T'))),
        backgroundColor: catConfig.color,
        borderColor: catConfig.color,
        textColor: catConfig.textColor,
        extendedProps: {
          tipoOrigen: 'institucional',
          categoria: ev.categoria || 'otro',
          categoriaLabel: catConfig.label,
          categoriaIcon: catConfig.icon,
          departamento: ev.departamento_responsable || 'DIR',
          descripcion: ev.descripcion || '',
          ubicacion: ev.ubicacion || 'Sede Principal',
          estado: ev.estado || 'activo',
          metadata: ev.metadata || {},
        },
      })
    })
  }

  // 2. Proyectar clases regulares en el rango solicitado si está activo
  if (incluirClases && (categoria === 'todas' || categoria === 'academico') && (departamento === 'TODOS' || departamento === 'ACM')) {
    try {
      const { data: horariosRaw } = await supabase
        .from('clase_horarios')
        .select(`
          id, dia_semana, hora_inicio, hora_fin,
          clase:clases!inner(id, nombre, activo, maestro:maestros(nombre_completo)),
          salon:salones(nombre)
        `)
        .eq('clase.activo', true)

      if (horariosRaw && start && end) {
        const startDt = new Date(start)
        const endDt = new Date(end)
        
        // Iterar días del rango para expandir los horarios semanales recurrentes
        for (let d = new Date(startDt); d <= endDt; d.setDate(d.getDate() + 1)) {
          const dayName = DIAS_MAP[d.getDay()]
          const matchingHorarios = horariosRaw.filter(h => h.dia_semana?.toLowerCase() === dayName)

          matchingHorarios.forEach(h => {
            const dateStr = d.toISOString().split('T')[0]
            const horaInicioStr = h.hora_inicio ? `${dateStr}T${h.hora_inicio}` : dateStr
            const horaFinStr = h.hora_fin ? `${dateStr}T${h.hora_fin}` : dateStr

            const className = h.clase?.nombre || 'Clase Regular'
            const teacherName = h.clase?.maestro?.nombre_completo || 'Docente'
            const roomName = h.salon?.nombre || 'Aula'

            // Filtro de búsqueda
            if (search && search.trim()) {
              const q = search.toLowerCase()
              if (!className.toLowerCase().includes(q) && !teacherName.toLowerCase().includes(q)) return
            }

            eventosResultado.push({
              id: `clase-${h.id}-${dateStr}`,
              title: `🎻 ${className}`,
              start: horaInicioStr,
              end: horaFinStr,
              allDay: false,
              backgroundColor: '#3b82f6',
              borderColor: '#2563eb',
              textColor: '#ffffff',
              extendedProps: {
                tipoOrigen: 'clase_regular',
                categoria: 'academico',
                categoriaLabel: 'Clase Regular de Cátedra',
                categoriaIcon: 'bi-mortarboard',
                departamento: 'ACM',
                descripcion: `Docente: ${teacherName} · Salón: ${roomName}`,
                ubicacion: roomName,
                maestro: teacherName,
                claseId: h.clase?.id,
              },
            })
          })
        }
      }
    } catch (errClases) {
      console.warn('[calendarioUnificadoApi] No se pudieron proyectar clases recurrentes:', errClases)
    }
  }

  return eventosResultado
}

/**
 * Inserta un nuevo evento institucional en Supabase.
 */
export async function crearEventoInstitucional(evento) {
  const payload = {
    titulo: evento.titulo.trim(),
    descripcion: evento.descripcion?.trim() || null,
    categoria: evento.categoria || 'otro',
    fecha_inicio: evento.fecha_inicio,
    fecha_fin: evento.fecha_fin || evento.fecha_inicio,
    ubicacion: evento.ubicacion?.trim() || null,
    departamento_responsable: evento.departamento_responsable || 'DIR',
    estado: 'activo',
  }

  const { data, error } = await supabase
    .from('calendario_institucional')
    .insert(payload)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Actualiza un evento institucional existente.
 */
export async function actualizarEventoInstitucional(id, updates) {
  const payload = {}
  if (updates.titulo !== undefined) payload.titulo = updates.titulo
  if (updates.descripcion !== undefined) payload.descripcion = updates.descripcion
  if (updates.categoria !== undefined) payload.categoria = updates.categoria
  if (updates.fecha_inicio !== undefined) payload.fecha_inicio = updates.fecha_inicio
  if (updates.fecha_fin !== undefined) payload.fecha_fin = updates.fecha_fin
  if (updates.ubicacion !== undefined) payload.ubicacion = updates.ubicacion
  if (updates.departamento_responsable !== undefined) payload.departamento_responsable = updates.departamento_responsable
  if (updates.estado !== undefined) payload.estado = updates.estado

  const { data, error } = await supabase
    .from('calendario_institucional')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Elimina un evento institucional.
 */
export async function eliminarEventoInstitucional(id) {
  const { error } = await supabase
    .from('calendario_institucional')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

/**
 * Genera un archivo iCalendar (.ics) exportable para sincronizar con Google Calendar / Apple Calendar.
 */
export function generarArchivoICS(eventos) {
  const formatDate = (isoStr) => {
    const d = new Date(isoStr)
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//El Sistema Punta Cana//SOI Calendario V9//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Calendario Institucional SOI',
    'X-WR-TIMEZONE:America/Santo_Domingo',
  ]

  eventos.forEach(ev => {
    if (ev.extendedProps?.tipoOrigen === 'clase_regular') return // Omitir clases recurrentes masivas del export ics
    icsContent.push('BEGIN:VEVENT')
    icsContent.push(`UID:${ev.rawId || ev.id}@elsistema.org`)
    icsContent.push(`DTSTAMP:${formatDate(new Date().toISOString())}`)
    icsContent.push(`DTSTART:${formatDate(ev.start)}`)
    icsContent.push(`DTEND:${formatDate(ev.end || ev.start)}`)
    icsContent.push(`SUMMARY:${ev.title.replace(/[,;]/g, ' ')}`)
    if (ev.extendedProps?.descripcion) {
      icsContent.push(`DESCRIPTION:${ev.extendedProps.descripcion.replace(/\n/g, '\\n')}`)
    }
    if (ev.extendedProps?.ubicacion) {
      icsContent.push(`LOCATION:${ev.extendedProps.ubicacion.replace(/[,;]/g, ' ')}`)
    }
    icsContent.push('END:VEVENT')
  })

  icsContent.push('END:VCALENDAR')
  return icsContent.join('\r\n')
}

/**
 * Genera la URL de enlace directo "1-Click" para guardar un evento en Google Calendar / Gmail.
 * Abre directamente la pantalla de creación de evento en https://calendar.google.com/
 * 
 * @param {Object} evento - Objeto de evento con { title, start, end, allDay, extendedProps }
 * @returns {string} URL formateada para Google Calendar Web Intent
 */
export function generarGoogleCalendarUrl(evento) {
  if (!evento || !evento.start) return '#'

  const toGoogleDate = (dateVal, isAllDay = false) => {
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return ''
    if (isAllDay) {
      return d.toISOString().split('T')[0].replace(/-/g, '')
    }
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const isAllDay = Boolean(evento.allDay)
  const startStr = toGoogleDate(evento.start, isAllDay)
  const endStr = toGoogleDate(evento.end || evento.start, isAllDay)

  const title = evento.title || 'Evento Institucional SOI'
  const details = [
    evento.extendedProps?.categoriaLabel ? `Categoría: ${evento.extendedProps.categoriaLabel}` : '',
    evento.extendedProps?.departamento ? `Departamento: ${evento.extendedProps.departamento}` : '',
    evento.extendedProps?.descripcion ? `\nNotas:\n${evento.extendedProps.descripcion}` : '',
    '\n---\nGenerado por SOI (Sistema Operativo Institucional - El Sistema Punta Cana)',
  ].filter(Boolean).join('\n')

  const location = evento.extendedProps?.ubicacion || 'El Sistema Punta Cana'

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`,
    details: details,
    location: location,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Genera el enlace para suscribirse a un feed iCal en Google Calendar con 1 clic.
 */
export function generarUrlSuscripcionGoogle(feedUrl) {
  const cleanUrl = (feedUrl || '').replace(/^https?:\/\//, 'webcal://')
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(cleanUrl)}`
}

