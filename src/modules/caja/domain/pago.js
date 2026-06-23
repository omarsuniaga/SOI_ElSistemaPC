/**
 * Domain: pago
 * Payment logic — no Supabase imports.
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

export function buildPago({ familia_id, cuota_ids, monto, metodo_pago, cajero_id, notas }) {
  return {
    familia_id,
    cuota_ids,
    monto,
    metodo_pago,
    cajero_id,
    notas: notas || '',
    fecha_pago: new Date().toISOString(),
  }
}

/**
 * Greedy oldest-first distribution.
 * Sorts cuotas by fecha_vencimiento ASC, applies payment to each in order.
 */
export function distribuirPago(cuotas, montoPago) {
  const sorted = [...cuotas].sort((a, b) =>
    new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento)
  )

  let remaining = montoPago
  const distribucion = []

  for (const cuota of sorted) {
    if (remaining <= 0) break
    const montoCubierto = Math.min(remaining, cuota.monto_final)
    const montoRestante = cuota.monto_final - montoCubierto
    const newEstado = montoRestante === 0 ? 'pagada' : cuota.estado
    distribucion.push({ cuota_id: cuota.id, montoCubierto, montoRestante, newEstado })
    remaining -= montoCubierto
  }

  return { distribucion, montoSobrante: Math.max(0, remaining) }
}
