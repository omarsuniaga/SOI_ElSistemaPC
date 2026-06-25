/**
 * seguimiento.js — Dominio del CRM de seguimiento de comunicaciones (portal COM).
 * Basado en el "Activity model" de CRM (Salesforce/HubSpot/Pipedrive) + el patrón
 * de "próxima actividad" (Pipedrive): ningún contacto abierto debe quedar sin un
 * próximo paso agendado.
 */

export const CANALES = {
  llamada: { label: 'Llamada', icon: 'bi-telephone' },
  whatsapp: { label: 'WhatsApp', icon: 'bi-whatsapp' },
  correo: { label: 'Correo', icon: 'bi-envelope' },
  reunion: { label: 'Reunión', icon: 'bi-people' },
  otro: { label: 'Otro', icon: 'bi-chat-dots' },
}

// Disposition codes — máximo 5-7 por estándar CRM para mantener datos consistentes.
export const RESULTADOS = {
  contactado: { label: 'Contactado', color: 'success' },
  buzon_no_contesto: { label: 'Buzón / No contestó', color: 'secondary' },
  reagendar: { label: 'Reagendar', color: 'warning' },
  sin_interes: { label: 'Sin interés', color: 'dark' },
  resuelto: { label: 'Resuelto', color: 'primary' },
}

// Parsea fechas: las cadenas 'YYYY-MM-DD' se interpretan como LOCALES (no UTC),
// para evitar el corrimiento de un día en zonas detrás de UTC (RD = UTC-4).
function parseLocalDate(value) {
  if (value instanceof Date) return new Date(value)
  if (typeof value === 'string') {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }
  return new Date(value)
}

function startOfDay(d) {
  const x = parseLocalDate(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function fechaProxima(reg) {
  return reg?.proxima_fecha ? startOfDay(reg.proxima_fecha) : null
}

export function esAbierto(reg) {
  return reg?.estado === 'abierto'
}

/** Diferencia en días entre proxima_fecha y hoy (negativo = pasado). null si no hay fecha. */
export function diasParaProxima(reg, hoy = new Date()) {
  const f = fechaProxima(reg)
  if (!f) return null
  return Math.round((f - startOfDay(hoy)) / 86400000)
}

/** Tiene un follow-up pendiente y ya pasó su fecha. */
export function esSeguimientoVencido(reg, hoy = new Date()) {
  if (!esAbierto(reg) || !reg?.requiere_seguimiento) return false
  const dias = diasParaProxima(reg, hoy)
  return dias !== null && dias < 0
}

/** El follow-up cae justo hoy. */
export function esSeguimientoHoy(reg, hoy = new Date()) {
  if (!esAbierto(reg) || !reg?.requiere_seguimiento) return false
  return diasParaProxima(reg, hoy) === 0
}

/**
 * Clasifica registros para la agenda de follow-up: vencidos, hoy y próximos.
 * Solo considera registros abiertos que requieren seguimiento y tienen fecha.
 */
export function clasificarAgenda(registros = [], hoy = new Date()) {
  const out = { vencidos: [], hoy: [], proximos: [] }
  for (const r of registros) {
    if (!esAbierto(r) || !r?.requiere_seguimiento) continue
    const dias = diasParaProxima(r, hoy)
    if (dias === null) continue
    if (dias < 0) out.vencidos.push(r)
    else if (dias === 0) out.hoy.push(r)
    else out.proximos.push(r)
  }
  return out
}
