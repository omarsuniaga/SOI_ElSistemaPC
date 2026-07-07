/**
 * simuladorFormato.js — Funciones puras de formateo/mapeo de estado para las
 * vistas del portal Simulador (Slice 3). Extraídas del wiring DOM para poder
 * testearlas con Vitest sin montar el DOM completo.
 */

const ESTADO_RUN_BADGES = Object.freeze({
  creado: Object.freeze({ label: 'Creado', color: 'secondary' }),
  corriendo: Object.freeze({ label: 'Corriendo', color: 'success' }),
  pausado: Object.freeze({ label: 'Pausado', color: 'warning' }),
  finalizado: Object.freeze({ label: 'Finalizado', color: 'primary' }),
  error: Object.freeze({ label: 'Error', color: 'danger' }),
})

const ESTADO_OUTBOX_BADGES = Object.freeze({
  pendiente: Object.freeze({ label: 'Pendiente', color: 'secondary' }),
  enviado: Object.freeze({ label: 'Enviado', color: 'success' }),
  fallido: Object.freeze({ label: 'Fallido', color: 'danger' }),
})

/**
 * Formatea una fecha simulada (ISO) a texto legible en español.
 * @param {string|null|undefined} fechaIso
 * @returns {string}
 */
export function formatearFechaSimulada(fechaIso) {
  if (!fechaIso) return '—'
  const fecha = new Date(fechaIso)
  if (Number.isNaN(fecha.getTime())) return '—'

  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Calcula el % de avance de una corrida entre fecha_inicio_virtual y
 * fecha_fin_virtual, según fecha_actual_virtual. Clampeado a [0, 100].
 * @param {{ fecha_inicio_virtual: string, fecha_fin_virtual: string|null, fecha_actual_virtual: string }} run
 * @returns {number}
 */
export function calcularProgresoRun(run) {
  if (!run?.fecha_inicio_virtual || !run?.fecha_fin_virtual || !run?.fecha_actual_virtual) return 0

  const inicio = new Date(run.fecha_inicio_virtual).getTime()
  const fin = new Date(run.fecha_fin_virtual).getTime()
  const actual = new Date(run.fecha_actual_virtual).getTime()

  if (Number.isNaN(inicio) || Number.isNaN(fin) || Number.isNaN(actual) || fin <= inicio) return 0

  const pct = ((actual - inicio) / (fin - inicio)) * 100
  return Math.max(0, Math.min(100, Math.round(pct)))
}

/**
 * Mapea sim_runs.estado a { label, color } para un badge Bootstrap.
 * Ante un estado desconocido, cae a color neutro con el valor crudo como label.
 * @param {string} estado
 * @returns {{ label: string, color: string }}
 */
export function mapEstadoRunABadge(estado) {
  return ESTADO_RUN_BADGES[estado] || { label: estado, color: 'secondary' }
}

/**
 * Mapea sim_outbox.estado a { label, color } para un badge Bootstrap.
 * @param {string} estado
 * @returns {{ label: string, color: string }}
 */
export function mapEstadoOutboxABadge(estado) {
  return ESTADO_OUTBOX_BADGES[estado] || { label: estado, color: 'secondary' }
}

/**
 * Agrupa eventos de sim_calendario por fecha_inicio exacta (mismo timestamp
 * = eventos concurrentes del mismo día simulado). Eventos sin fecha_inicio
 * se descartan silenciosamente.
 * @param {Array<{fecha_inicio: string}>} eventos
 * @returns {Record<string, object[]>}
 */
export function agruparEventosPorFecha(eventos) {
  const grupos = {}
  for (const evento of eventos || []) {
    if (!evento?.fecha_inicio) continue
    if (!grupos[evento.fecha_inicio]) grupos[evento.fecha_inicio] = []
    grupos[evento.fecha_inicio].push(evento)
  }
  return grupos
}
