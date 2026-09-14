export const EVENT_READINESS = Object.freeze({ READY: 'READY', ON_TRACK: 'ON_TRACK', AT_RISK: 'AT_RISK', CRITICAL: 'CRITICAL', INSUFFICIENT_DATA: 'INSUFFICIENT_DATA' })

export function daysUntilEvent(eventDate, asOf = new Date()) { if (!eventDate) return null; return Math.ceil((Date.parse(`${eventDate.slice(0, 10)}T00:00:00Z`) - Date.parse(`${new Date(asOf).toISOString().slice(0, 10)}T00:00:00Z`)) / 86400000) }

export function evaluateEventReadiness({ event, montages = [] } = {}) {
  const daysRemaining = daysUntilEvent(event?.fecha_inicio, event?.asOf || new Date())
  if (!montages.length) return { status: EVENT_READINESS.INSUFFICIENT_DATA, event, daysRemaining, montages: [], reasons: ['No hay montajes vinculados'] }
  const statuses = montages.map((item) => item.status)
  const reasons = montages.flatMap((item) => (item.reasons || []).map((reason) => `${item.label || item.montageId}: ${reason}`))
  const status = event?.estado === 'CANCELADO' ? EVENT_READINESS.INSUFFICIENT_DATA : statuses.includes('CRITICAL') ? EVENT_READINESS.CRITICAL : statuses.includes('AT_RISK') || statuses.includes('REGRESSING') ? EVENT_READINESS.AT_RISK : statuses.every((value) => value === 'READY') ? EVENT_READINESS.READY : EVENT_READINESS.ON_TRACK
  return { status, event, daysRemaining, montages, reasons }
}
