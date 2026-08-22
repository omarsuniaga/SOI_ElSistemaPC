/**
 * Domain: pago
 * Payment logic — no Supabase imports.
 * All monetary fields are integer centavos (RD$1.00 = 100 centavos). ADR-002.
 */

export const METODOS_PAGO = [
  'efectivo',
  'transferencia',
  'pago_movil',
  'tarjeta',
  'mixto',
  'tercero',
  'link_externo',
]

export function validatePagoMetodo(metodo) {
  return METODOS_PAGO.includes(metodo)
}

export function buildPago({ familia_id, cuota_ids, monto_centavos, metodo_pago, cajero_id, notas }) {
  return {
    familia_id,
    cuota_ids,
    monto_centavos,
    metodo_pago,
    cajero_id,
    notas: notas || '',
    fecha_pago: new Date().toISOString(),
  }
}

/**
 * Greedy oldest-first distribution.
 * Sorts cuotas by fecha_vencimiento ASC, applies payment to each in order.
 * @param {Array} cuotas
 * @param {number} montoPagoCentavos
 */
export function distribuirPago(cuotas, montoPagoCentavos) {
  const sorted = [...cuotas].sort((a, b) =>
    new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento)
  )

  let remaining = montoPagoCentavos
  const distribucion = []

  for (const cuota of sorted) {
    if (remaining <= 0) break
    const montoCubierto = Math.min(remaining, cuota.monto_final_centavos)
    const montoRestante = cuota.monto_final_centavos - montoCubierto
    const newEstado = montoRestante === 0 ? 'pagada' : cuota.estado
    distribucion.push({ cuota_id: cuota.id, montoCubierto, montoRestante, newEstado })
    remaining -= montoCubierto
  }

  return { distribucion, montoSobrante: Math.max(0, remaining) }
}
