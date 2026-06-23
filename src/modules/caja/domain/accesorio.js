/**
 * Domain: accesorio
 * Accessory/instrument management — no Supabase imports.
 */

export function checkAutoAprobacion(accesorio, autorizacion) {
  if (!autorizacion.activa) return false
  if (accesorio.precio_unitario > autorizacion.monto_maximo) return false
  if (autorizacion.categorias_incluidas && autorizacion.categorias_incluidas.length > 0) {
    return autorizacion.categorias_incluidas.includes(accesorio.categoria)
  }
  return true
}

export function calcularMontoCargo(accesorio, cantidad) {
  return accesorio.precio_unitario * cantidad
}

export function isStockBajo(accesorio) {
  return accesorio.stock_actual <= accesorio.stock_minimo
}

export function buildAsignacion({ accesorio_id, alumno_id, familia_id, cantidad, precio_unitario, aprobacionRequerida }) {
  return {
    accesorio_id,
    alumno_id,
    familia_id,
    cantidad,
    precio_unitario,
    estado: 'pendiente',
    aprobacion_requerida: aprobacionRequerida === true,
  }
}
