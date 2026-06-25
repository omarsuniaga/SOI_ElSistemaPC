/**
 * calendarioCom.js — Dominio de la lente de calendario de comunicación (portal COM).
 * Lee eventos de calendario_institucional (no los crea) y los organiza para que
 * el departamento de Comunicaciones esté al día: conciertos, ciclos, inscripciones,
 * temporadas. Basado en el patrón de "editorial/content calendar".
 */

// Espejo del enum event_categoria de la DB.
export const CATEGORIAS_EVENTO = {
  concierto: { label: 'Concierto', icon: 'bi-music-note-beamed', color: 'primary' },
  ensayo: { label: 'Ensayo', icon: 'bi-music-note', color: 'info' },
  reunion: { label: 'Reunión', icon: 'bi-people', color: 'secondary' },
  patrocinio: { label: 'Patrocinio', icon: 'bi-gift', color: 'success' },
  pago: { label: 'Pago', icon: 'bi-cash-coin', color: 'warning' },
  corte: { label: 'Corte', icon: 'bi-scissors', color: 'dark' },
  inscripcion: { label: 'Inscripción', icon: 'bi-person-plus', color: 'primary' },
  auditoria: { label: 'Auditoría', icon: 'bi-shield-check', color: 'secondary' },
  otro: { label: 'Otro', icon: 'bi-calendar-event', color: 'secondary' },
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** Días desde hoy hasta el inicio del evento (negativo = ya pasó). */
export function diasHasta(evento, hoy = new Date()) {
  if (!evento?.fecha_inicio) return null
  return Math.round((startOfDay(evento.fecha_inicio) - startOfDay(hoy)) / 86400000)
}

/** True si el evento cae entre hoy y `dias` días hacia adelante. */
export function esProximo(evento, dias = 30, hoy = new Date()) {
  const d = diasHasta(evento, hoy)
  return d !== null && d >= 0 && d <= dias
}

/**
 * Agrupa eventos por mes (clave YYYY-MM) en orden cronológico ascendente.
 * @returns {Array<{clave: string, label: string, eventos: object[]}>}
 */
export function agruparPorMes(eventos = []) {
  const mapa = new Map()
  for (const e of eventos) {
    if (!e?.fecha_inicio) continue
    const d = new Date(e.fecha_inicio)
    const clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!mapa.has(clave)) {
      mapa.set(clave, { clave, label: `${MESES[d.getMonth()]} ${d.getFullYear()}`, eventos: [] })
    }
    mapa.get(clave).eventos.push(e)
  }
  const grupos = [...mapa.values()].sort((a, b) => a.clave.localeCompare(b.clave))
  for (const g of grupos) {
    g.eventos.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
  }
  return grupos
}
