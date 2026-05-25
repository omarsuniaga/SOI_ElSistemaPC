/**
 * adminNotifApi — Feed sintetizado de eventos para el portal Admin
 *
 * No depende de la tabla `notificaciones` (que es exclusiva de maestros).
 * Construye un stream unificado consultando directamente las tablas fuente.
 *
 * Fuentes:
 *  - ausencias_maestros  → solicitudes pendientes + historial reciente
 *  - sesiones_clase      → maestros con baja compliance (sin asistencia)
 *  - alumnos             → registros nuevos de los últimos 7 días
 */

import { supabase } from '../../../lib/supabaseClient.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function isoToDisplay(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function timeAgo(isoStr) {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 2)  return 'ahora mismo'
  if (mins  < 60) return `hace ${mins} min`
  if (hours < 24) return `hace ${hours}h`
  if (days  < 7)  return `hace ${days}d`
  return isoToDisplay(isoStr)
}

const TIPO_AUSENCIA = {
  enfermedad:   'Médica',
  personal:     'Personal',
  capacitacion: 'Capacitación',
  vacaciones:   'Vacaciones',
  otro:         'Otro',
}

// ── Source 1: Ausencias ───────────────────────────────────────────────────────

async function _fetchAusencias() {
  const since = daysAgo(30)
  const { data, error } = await supabase
    .from('ausencias_maestros')
    .select(`
      id, maestro_id, tipo_ausencia, urgencia, fecha_inicio, fecha_fin,
      estado, motivo, created_at, decidido_en,
      maestros:maestro_id(nombre_completo, correo, instrumento)
    `)
    .in('estado', ['pendiente', 'aprobada', 'rechazada'])
    .gte('created_at', `${since}T00:00:00`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data || []
}

function _ausenciaToEvent(a, activeMaestros = []) {
  const nombre   = a.maestros?.nombre_completo || 'Maestro'
  const tipo     = TIPO_AUSENCIA[a.tipo_ausencia] || a.tipo_ausencia || 'Ausencia'
  const isPending = a.estado === 'pendiente'
  const isApproved = a.estado === 'aprobada'
  const dateStr  = a.fecha_inicio === a.fecha_fin
    ? isoToDisplay(a.fecha_inicio)
    : `${isoToDisplay(a.fecha_inicio)} → ${isoToDisplay(a.fecha_fin)}`

  // Buscar sustitutos proactivos (del mismo instrumento y diferentes al ausente)
  const maestroInstrumento = a.maestros?.instrumento
  const suplentesSugeridos = isPending && maestroInstrumento
    ? activeMaestros.filter(m => m.instrumento === maestroInstrumento && m.id !== a.maestro_id).slice(0, 3)
    : []

  return {
    id:        `ausencia:${a.id}`,
    source:    'ausencia',
    sourceId:  a.id,
    priority:  isPending ? (a.urgencia === 'alta' ? 'alta' : a.urgencia === 'media' ? 'media' : 'baja') : 'info',
    actionable: isPending,
    estado:    a.estado,
    urgencia:  a.urgencia,
    tipo_ausencia: a.tipo_ausencia,
    icon:      isPending ? 'bi-calendar-x-fill'
             : isApproved ? 'bi-calendar-check-fill'
             : 'bi-calendar-minus-fill',
    iconColor: isPending ? (a.urgencia === 'alta' ? '#ef4444' : a.urgencia === 'media' ? '#f59e0b' : '#6b7280')
             : isApproved ? '#22c55e'
             : '#ef4444',
    category:  'ausencia',
    titulo:    isPending
      ? `${nombre} solicitó ausencia ${tipo.toLowerCase()}`
      : isApproved
        ? `Ausencia de ${nombre} aprobada`
        : `Ausencia de ${nombre} rechazada`,
    subtitulo: dateStr,
    motivo:    a.motivo || '',
    timestamp: a.created_at,
    timeAgo:   timeAgo(a.created_at),
    actionRoute: isPending ? 'admin-ausencias' : null,
    actionLabel: isPending ? 'Revisar' : null,
    suplentesSugeridos,
    maestroInstrumento
  }
}

// ── Source 2: Sesiones sin asistencia (compliance) ────────────────────────────

async function _fetchSesionesSinAsistencia() {
  const since = daysAgo(7)
  const hoy   = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('sesiones_clase')
    .select(`
      id, fecha, asistencia, borrador, contenido, clase_id,
      clases:clase_id(nombre, maestro_id,
        maestros:maestro_id(nombre_completo)
      )
    `)
    .gte('fecha', since)
    .lt('fecha', hoy)         // excluir hoy (puede estar en progreso)
    .order('fecha', { ascending: false })
    .limit(200)

  if (error) throw error
  return data || []
}

function _sesionesToEvents(sesiones) {
  // Filtrar las que no tienen asistencia registrada
  const sinAsistencia = sesiones.filter(s => {
    const tieneAsistencia = Array.isArray(s.asistencia) && s.asistencia.length > 0
    const tieneContenido  = typeof s.contenido === 'string' && s.contenido.trim().length > 0
    return !tieneAsistencia && !(s.borrador === false && tieneContenido)
  })

  // Agrupar por maestro para no spamear un evento por sesión
  const porMaestro = {}
  for (const s of sinAsistencia) {
    const mid    = s.clases?.maestro_id || 'unknown'
    const nombre = s.clases?.maestros?.nombre_completo || 'Maestro desconocido'
    if (!porMaestro[mid]) porMaestro[mid] = { nombre, count: 0, ultima: s.fecha, mid }
    porMaestro[mid].count++
    if (s.fecha > porMaestro[mid].ultima) porMaestro[mid].ultima = s.fecha
  }

  return Object.values(porMaestro).map(m => ({
    id:        `compliance:${m.mid}`,
    source:    'sesion',
    sourceId:  m.mid,
    priority:  m.count >= 3 ? 'alta' : m.count >= 2 ? 'media' : 'baja',
    actionable: false,
    estado:    'info',
    icon:      'bi-clipboard-x-fill',
    iconColor: m.count >= 3 ? '#ef4444' : m.count >= 2 ? '#f59e0b' : '#6b7280',
    category:  'compliance',
    titulo:    `${m.nombre} tiene ${m.count} clase${m.count > 1 ? 's' : ''} sin asistencia`,
    subtitulo: `Última: ${isoToDisplay(m.ultima)} · últimos 7 días`,
    motivo:    '',
    timestamp: new Date(`${m.ultima}T12:00:00`).toISOString(),
    timeAgo:   isoToDisplay(m.ultima),
    actionRoute: null,
    actionLabel: null,
  }))
}

// ── Source 3: Alumnos registrados ─────────────────────────────────────────────

async function _fetchAlumnosRecientes() {
  const since = daysAgo(7)
  const { data, error } = await supabase
    .from('alumnos')
    .select('id, nombre_completo, creado_en, created_at')
    .gte('creado_en', `${since}T00:00:00`)
    .order('creado_en', { ascending: false })
    .limit(20)

  if (error) {
    console.warn('[adminNotifApi] alumnos fetch warn:', error.message)
    return []
  }
  return data || []
}

function _alumnosToEvents(alumnos) {
  return alumnos.map(a => ({
    id:        `alumno:${a.id}`,
    source:    'alumno',
    sourceId:  a.id,
    priority:  'info',
    actionable: false,
    estado:    'info',
    icon:      'bi-person-plus-fill',
    iconColor: '#3b82f6',
    category:  'alumno',
    titulo:    `Nuevo alumno registrado: ${a.nombre_completo || 'Alumno'}`,
    subtitulo: `Estado: activo`,
    motivo:    '',
    timestamp: a.creado_en || a.created_at,
    timeAgo:   timeAgo(a.creado_en || a.created_at),
    actionRoute: null,
    actionLabel: null,
  }))
}

// ── Source 4: Aprobación de Maestros (Seguridad) ──────────────────────────────

async function _fetchMaestrosPendientes() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, nombre_completo, created_at, instrumento')
    .eq('rol', 'maestro')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.warn('[adminNotifApi] pending teachers fetch warn:', error.message)
    return []
  }
  return data || []
}

function _maestroToEvent(p) {
  return {
    id:        `maestro-pendiente:${p.id}`,
    source:    'maestro',
    sourceId:  p.id,
    priority:  'alta',
    actionable: true,
    estado:    'pendiente',
    icon:      'bi-person-badge-fill',
    iconColor: '#ef4444',
    category:  'maestro',
    titulo:    `Nuevo maestro registrado esperando aprobación: ${p.nombre_completo || 'Maestro'}`,
    subtitulo: `Email: ${p.email} · Instrumento: ${p.instrumento || 'No especificado'}`,
    motivo:    '',
    timestamp: p.created_at,
    timeAgo:   timeAgo(p.created_at),
    actionRoute: 'admin-aprobacion',
    actionLabel: 'Ver Aprobaciones',
  }
}

// ── Source 5: Early Warning Risk Engine (Riesgo Académico) ────────────────────

async function _fetchActiveMaestros() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nombre_completo, email, instrumento')
    .eq('rol', 'maestro')
    .eq('estado', 'activo')

  if (error) {
    console.warn('[adminNotifApi] active maestros fetch warn:', error.message)
    return []
  }
  return data || []
}

async function _fetchEarlyWarningRisks() {
  const since = daysAgo(30)
  const { data, error } = await supabase
    .from('asistencias')
    .select(`
      alumno_id, estado, fecha,
      alumnos:alumno_id(nombre_completo)
    `)
    .gte('fecha', since)
    .order('fecha', { ascending: false })

  if (error) {
    console.warn('[adminNotifApi] early warning fetch warn:', error.message)
    return []
  }

  const studentHistory = {}
  for (const a of (data || [])) {
    const aid = a.alumno_id
    if (!aid) continue
    if (!studentHistory[aid]) {
      studentHistory[aid] = {
        nombre: a.alumnos?.nombre_completo || 'Estudiante',
        asistencias: []
      }
    }
    studentHistory[aid].asistencias.push(a.estado)
  }

  const riskEvents = []
  for (const [studentId, info] of Object.entries(studentHistory)) {
    const total = info.asistencias.length
    if (total < 3) continue

    // 1. Inasistencias consecutivas
    let consecutiveAbsences = 0
    for (const estado of info.asistencias) {
      if (estado === 'A' || estado === 'ausente') {
        consecutiveAbsences++
      } else if (estado === 'P' || estado === 'presente' || estado === 'T' || estado === 'tarde') {
        break
      }
    }

    if (consecutiveAbsences >= 3) {
      riskEvents.push({
        id: `riesgo-alumno-ausencias:${studentId}`,
        source: 'riesgo',
        sourceId: studentId,
        priority: 'alta',
        actionable: false,
        estado: 'info',
        icon: 'bi-exclamation-triangle-fill',
        iconColor: '#ef4444',
        category: 'compliance',
        titulo: `Riesgo de Deserción: ${info.nombre}`,
        subtitulo: `Acumula ${consecutiveAbsences} inasistencias consecutivas en los últimos 30 días.`,
        motivo: `Acción recomendada: Contactar de urgencia al tutor legal o revisar ficha médica.`,
        timestamp: new Date().toISOString(),
        timeAgo: 'ahora mismo',
        actionRoute: 'admin-alumnos',
        actionLabel: 'Ver Ficha'
      })
      continue
    }

    // 2. Caída de asistencia por debajo del 70%
    const presentes = info.asistencias.filter(e => e === 'P' || e === 'presente').length
    const rate = presentes / total
    if (rate < 0.70) {
      riskEvents.push({
        id: `riesgo-alumno-rate:${studentId}`,
        source: 'riesgo',
        sourceId: studentId,
        priority: 'media',
        actionable: false,
        estado: 'info',
        icon: 'bi-graph-down',
        iconColor: '#f59e0b',
        category: 'compliance',
        titulo: `Bajo Compliance Académico: ${info.nombre}`,
        subtitulo: `Asistencia del ${Math.round(rate * 100)}% en los últimos 30 días (${presentes} de ${total} clases).`,
        motivo: `Acción recomendada: Coordinar entrevista de seguimiento y analizar tutoría.`,
        timestamp: new Date().toISOString(),
        timeAgo: 'ahora mismo',
        actionRoute: 'admin-alumnos',
        actionLabel: 'Ver Ficha'
      })
    }
  }

  return riskEvents
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Obtiene el feed completo de eventos para el admin.
 * Retorna un array ordenado: accionables primero, luego por timestamp desc.
 */
export async function fetchAdminFeed() {
  const [ausencias, sesiones, alumnos, maestros, activeMaestrosRes, riesgos] = await Promise.allSettled([
    _fetchAusencias(),
    _fetchSesionesSinAsistencia(),
    _fetchAlumnosRecientes(),
    _fetchMaestrosPendientes(),
    _fetchActiveMaestros(), // we will fetch active maestros below
    _fetchEarlyWarningRisks(),
  ])

  // fallback to separate calls if needed
  let activeMaestros = []
  try {
    activeMaestros = await _fetchActiveMaestros()
  } catch (e) {
    console.warn('[adminNotifApi] fallback active maestros failed:', e)
  }

  const ausenciaItems = ausencias.status === 'fulfilled'
    ? ausencias.value.map(a => _ausenciaToEvent(a, activeMaestros))
    : []

  const sesionItems = sesiones.status === 'fulfilled'
    ? _sesionesToEvents(sesiones.value)
    : []

  const alumnoItems = alumnos.status === 'fulfilled'
    ? _alumnosToEvents(alumnos.value)
    : []

  const maestroItems = maestros.status === 'fulfilled'
    ? maestros.value.map(_maestroToEvent)
    : []

  const riesgoItems = riesgos.status === 'fulfilled'
    ? riesgos.value
    : []

  const all = [...ausenciaItems, ...sesionItems, ...alumnoItems, ...maestroItems, ...riesgoItems]

  // Orden: accionables + alta primero, luego timestamp desc
  const priorityOrder = { alta: 0, media: 1, baja: 2, info: 3 }
  all.sort((a, b) => {
    if (a.actionable !== b.actionable) return a.actionable ? -1 : 1
    const pa = priorityOrder[a.priority] ?? 4
    const pb = priorityOrder[b.priority] ?? 4
    if (pa !== pb) return pa - pb
    return (b.timestamp || '').localeCompare(a.timestamp || '')
  })

  return all
}

/**
 * Cuenta solo los eventos accionables pendientes (para el badge).
 */
export async function fetchAdminPendingCount() {
  const [ausenciasRes, maestrosRes] = await Promise.allSettled([
    supabase
      .from('ausencias_maestros')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'pendiente'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('rol', 'maestro')
      .eq('estado', 'pendiente')
  ])

  const ausenciasCount = ausenciasRes.status === 'fulfilled' && !ausenciasRes.value.error
    ? (ausenciasRes.value.count || 0)
    : 0

  const maestrosCount = maestrosRes.status === 'fulfilled' && !maestrosRes.value.error
    ? (maestrosRes.value.count || 0)
    : 0

  return ausenciasCount + maestrosCount
}

