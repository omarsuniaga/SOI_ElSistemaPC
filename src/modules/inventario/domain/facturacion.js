export const METODOS_PAGO = ['efectivo', 'transferencia', 'deposito', 'tarjeta']
export const ESTADOS_FACTURA = ['pendiente', 'pagado', 'anulada']
export const TIPOS_FACTURA = ['alumno', 'institucion']

export function calcularIVA(subtotal, tasa) {
  if (tasa === undefined) tasa = 0.18
  return subtotal * tasa
}

export function calcularTotal(subtotal, impuestos) {
  return subtotal + impuestos
}

export function formatearMoneda(valor) {
  return `RD $${Number(valor).toFixed(2)}`
}

export function formatearNumeroFactura(contador) {
  const anio = new Date().getFullYear()
  return `FACT-${anio}-${String(contador).padStart(5, '0')}`
}

export function validarFactura(payload) {
  const errores = []
  if (!payload.reparacion_id) errores.push('reparacion_id es requerido')
  if (!payload.monto_total || payload.monto_total <= 0) {
    errores.push('monto_total debe ser mayor a 0')
  }
  if (!payload.metodo_pago) {
    errores.push('metodo_pago es requerido')
  } else if (!METODOS_PAGO.includes(payload.metodo_pago)) {
    errores.push(`metodo_pago inválido: ${payload.metodo_pago}. Válidos: ${METODOS_PAGO.join(', ')}`)
  }
  if (payload.tipo_factura && !TIPOS_FACTURA.includes(payload.tipo_factura)) {
    errores.push(`tipo_factura inválido: ${payload.tipo_factura}. Válidos: ${TIPOS_FACTURA.join(', ')}`)
  }
  return errores
}

export function puedeAnularse(factura) {
  return factura.estado_pago === 'pendiente'
}

export function liquidarFactura(factura) {
  return {
    ...factura,
    estado_pago: 'pagado',
    fecha_pago: new Date().toISOString().split('T')[0],
  }
}
