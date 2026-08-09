export { escapeHTML } from '../../../shared/utils/sanitize.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import { normalizeText } from '../../../core/utils/normalizeText.js'

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
  let isAM = false
  let timePart = cleanTime

  if (cleanTime.toLowerCase().includes('pm')) {
    isPM = true
    timePart = cleanTime.toLowerCase().replace('pm', '').trim()
  } else if (cleanTime.toLowerCase().includes('am')) {
    isAM = true
    timePart = cleanTime.toLowerCase().replace('am', '').trim()
  }

  const parts = timePart.split(':')
  let hours = parseInt(parts[0], 10) || 0
  const minutes = parseInt(parts[1], 10) || 0

  if (isPM && hours < 12) {
    hours += 12
  } else if (isAM && hours === 12) {
    hours = 0
  }

  return hours * 60 + minutes
}

// Variantes de escritura que aparecen en datos reales y que la regla de
// plural/acento no puede resolver por sí sola (cambian de raíz, no de
// sufijo): "violonchelo" vs "violoncello", etc.
const SINONIMOS_INSTRUMENTO = {
  violoncello: 'cello',
  violonchelo: 'cello',
}

/**
 * Normaliza un nombre de instrumento para comparar alumno.instrumento_principal
 * contra clase.instrumento pese a variaciones reales de captura: acentos
 * ("Violín" vs "Violin"), plural irregular ("Violín" vs "Violines", "Viola"
 * vs "Violas") y sinónimos de escritura ("Violonchelo" vs "Violoncello").
 * No es infalible — es la mejor aproximación sin normalizar los datos en la DB.
 */
export function normalizarInstrumento(raw) {
  if (!raw) return ''
  let s = normalizeText(raw)
  if (SINONIMOS_INSTRUMENTO[s]) return SINONIMOS_INSTRUMENTO[s]
  if (s.endsWith('es') && s.length > 4) s = s.slice(0, -2)
  else if (s.endsWith('s') && s.length > 3) s = s.slice(0, -1)
  return SINONIMOS_INSTRUMENTO[s] || s
}

const NIVEL_LABEL_ACADEMICO = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' }

/**
 * Etiqueta "Nivel · Prom. X" para ubicar de un vistazo el rendimiento de un
 * alumno al armar/revisar una clase. `alumno` debe traer `nivel` y
 * `promedio_notas` (ver alumnosSupabase.obtenerResumenAcademico para de
 * dónde sale ese dato). Devuelve '' si no hay nada que mostrar.
 */
export function rendimientoBadgeHTML(alumno = {}) {
  const nivel = alumno.nivel ? (NIVEL_LABEL_ACADEMICO[alumno.nivel] || alumno.nivel) : null
  const promedio = alumno.promedio_notas != null ? Number(alumno.promedio_notas) : null
  if (!nivel && promedio == null) return ''
  const partes = [nivel, promedio != null ? `Prom. ${promedio}` : null].filter(Boolean)
  return `<span class="badge text-bg-light border ms-1" style="font-size: 0.7rem; font-weight: 500;">${escapeHTML(partes.join(' · '))}</span>`
}

/**
 * Convierte minutos desde la medianoche a string de hora (HH:MM)
 * @param {number} mins
 * @returns {string} HH:MM
 */
export function minutesToTime(mins) {
  if (mins === null || mins === undefined || isNaN(mins)) return '00:00'
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  const hh = String(h).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  return `${hh}:${mm}`
}


