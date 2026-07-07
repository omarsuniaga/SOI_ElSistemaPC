/**
 * Utilidades para el módulo de Clases
 */

/**
 * Formatea una fecha a formato legible
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'Fecha desconocida'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * Escapa caracteres HTML para prevenir XSS
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (!str) return ''
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;'
    if (m === '<') return '&lt;'
    if (m === '>') return '&gt;'
    return m
  })
}

/**
 * Formatea una hora (HH:MM:SS) a formato legible (HH:MM)
 * @param {string} timeStr
 * @returns {string}
 */
export function formatHora(timeStr) {
  if (!timeStr) return ''
  const partes = timeStr.split(':')
  if (partes.length >= 2) {
    return `${partes[0]}:${partes[1]}`
  }
  return timeStr
}

/**
 * Formatea un array de días a string legible
 * @param {string[]} dias
 * @returns {string}
 */
export function formatDias(dias) {
  if (!dias || dias.length === 0) return 'Sin días asignados'

  const abreviaturas = {
    lunes: 'Lun',
    martes: 'Mar',
    miércoles: 'Mié',
    jueves: 'Jue',
    viernes: 'Vie',
    sábado: 'Sáb',
  }

  return dias.map(d => abreviaturas[d] || d).join(', ')
}

/**
 * Obtiene la clase de Bootstrap para el estado
 * @param {string} estado
 * @returns {string}
 */
export function getEstadoClass(estado) {
  const clases = {
    activa: 'bg-success',
    suspendida: 'bg-warning',
    finalizada: 'bg-secondary',
  }
  return clases[estado] || 'bg-secondary'
}

/**
 * Obtiene el label del estado
 * @param {string} estado
 * @returns {string}
 */
export function getEstadoLabel(estado) {
  const labels = {
    activa: 'Activa',
    suspendida: 'Suspendida',
    finalizada: 'Finalizada',
  }
  return labels[estado] || 'Activa'
}

/**
 * Obtiene la clase de badge para el estado
 * @param {string} estado
 * @returns {string}
 */
export function getEstadoBadgeClass(estado) {
  const clases = {
    activa: 'success',
    suspendida: 'warning',
    finalizada: 'secondary',
  }
  return clases[estado] || 'success'
}

/**
 * Obtiene el ícono para un instrumento
 * @param {string} instrumento
 * @returns {string}
 */
export function getInstrumentoIcon(instrumento) {
  if (!instrumento) return 'bi-music-note'

  const instrumentos = instrumento.toLowerCase()

  const iconos = {
    violin: 'bi-music-note-beamed',
    viola: 'bi-music-note-beamed',
    cello: 'bi-music-note-beamed',
    bajo: 'bi-music-note-beamed',
    guitarra: 'bi-music-note-beamed',
    arpa: 'bi-music-note-beamed',
    flauta: 'bi-wind',
    oboe: 'bi-wind',
    clarinete: 'bi-wind',
    fagot: 'bi-wind',
    trompa: 'bi-wind',
    trompeta: 'bi-wind',
    trombon: 'bi-wind',
    tuba: 'bi-wind',
    piano: 'bi-piano',
    percusion: 'bi-disc',
    voz: 'bi-mic',
    direccion: 'bi-person-badge',
    solfeo: 'bi-journal-text',
    teoría: 'bi-book',
  }

  return iconos[instrumentos] || 'bi-music-note'
}

/**
 * Obtiene iniciales del nombre
 * @param {string} nombre
 * @returns {string}
 */
export function getInitials(nombre) {
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Calcula la duración en minutos entre dos horas
 * @param {string} horaInicio - Formato HH:MM
 * @param {string} horaFin - Formato HH:MM
 * @returns {number}
 */
export function calcularDuracion(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return 0

  const [h1, m1] = horaInicio.split(':').map(Number)
  const [h2, m2] = horaFin.split(':').map(Number)

  const minutosInicio = h1 * 60 + m1
  const minutosFin = h2 * 60 + m2

  if (minutosFin <= minutosInicio) return 0

  return minutosFin - minutosInicio
}

/**
 * Obtiene color de badge consistente según el ID (formato hex)
 * @param {string} id
 * @returns {string}
 */
export function getConsistentColor(id) {
  const colores = [
    '#007aff', // primary (apple)
    '#5856d6', // indigo
    '#34c759', // success
    '#ff3b30', // danger
    '#ff9500', // warning
    '#5ac8fa', // info
  ]
  if (!id) return colores[0]
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colores[Math.abs(hash) % colores.length]
}

/**
 * Convierte un string de hora a minutos desde la medianoche
 * @param {string} timeStr - Formato HH:MM, HH:MM:SS, HH:MM:SS.SSS, con o sin AM/PM y espacios
 * @returns {number} Minutos desde la medianoche
 */
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0
  const cleanTime = timeStr.trim()
  let isPM = false
  let timePart = cleanTime

  if (cleanTime.toLowerCase().includes('pm')) {
    isPM = true
    timePart = cleanTime.toLowerCase().replace('pm', '').trim()
  } else if (cleanTime.toLowerCase().includes('am')) {
    timePart = cleanTime.toLowerCase().replace('am', '').trim()
  }

  const parts = timePart.split(':')
  let hours = parseInt(parts[0], 10) || 0
  const minutes = parseInt(parts[1], 10) || 0

  if (isPM && hours < 12) {
    hours += 12
  } else if (!isPM && hours === 12) {
    hours = 0
  }

  return hours * 60 + minutes
}

