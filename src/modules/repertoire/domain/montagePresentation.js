/**
 * Presentación de un montaje: subtítulo, evento y cuenta regresiva.
 *
 * Vive en el dominio y no en la vista porque la tarjeta y el encabezado del
 * mapa mostraban cada uno su propia versión del mismo dato, y en modo real
 * ambas mentían: "Sin evento" con el evento vinculado, "Fecha pendiente" con
 * `fecha_objetivo` cargada, y un "undefined · undefined" en el encabezado.
 */
import { daysRemaining } from './repertoireFoundation.js'

/** "Compositor · Versión", sin separador colgando si falta una de las dos. */
export function montageSubtitle(montaje = {}) {
  return [montaje.obra?.compositor, montaje.version?.nombre].filter(Boolean).join(' · ')
}

/** Nombre del evento vinculado, o el texto honesto cuando no hay ninguno. */
export function montageEventLabel(montaje = {}) {
  return montaje.evento?.nombre || 'Sin evento'
}

/**
 * Cuenta regresiva del montaje. La fecha del evento manda; si no hay evento
 * vinculado se usa la `fecha_objetivo` del propio montaje, que es la que el
 * maestro cargó al crearlo.
 * @returns {{days: number|null, label: string}}
 */
export function montageDeadline(montaje = {}, today = new Date()) {
  const fecha = montaje.evento?.fecha || montaje.fecha_objetivo || null
  const days = daysRemaining(fecha, today)
  if (days == null) return { days: null, label: 'Fecha pendiente' }
  if (days === 0) return { days: 0, label: 'Hoy' }
  if (days > 0) return { days, label: `Faltan ${days} días` }
  return { days, label: `Venció hace ${Math.abs(days)} días` }
}

/**
 * Reduce los vínculos de `montaje_eventos` al evento que la vista muestra.
 * Prefiere el marcado como principal; si ninguno lo está, el primero con
 * evento cargado.
 * @returns {{nombre: string, fecha: string|null}|null}
 */
export function pickPrincipalEvent(links) {
  const conEvento = (links || []).filter((link) => link?.calendario_institucional)
  if (!conEvento.length) return null
  const elegido = conEvento.find((link) => link.es_principal) || conEvento[0]
  const evento = elegido.calendario_institucional
  return {
    nombre: evento.titulo || 'Evento sin título',
    fecha: evento.fecha_inicio ? String(evento.fecha_inicio).slice(0, 10) : null,
  }
}
