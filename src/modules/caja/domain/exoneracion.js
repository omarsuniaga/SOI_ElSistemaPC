/**
 * Domain: exoneracion
 * Fee exemption logic — no Supabase imports.
 * All monetary fields are integer centavos (RD$1.00 = 100 centavos). ADR-002.
 */

export function validateExoneracion(data) {
  const errors = []
  if (!data.motivo || !String(data.motivo).trim()) {
    errors.push('motivo es requerido')
  }
  if (!data.aprobado_por || !String(data.aprobado_por).trim()) {
    errors.push('aprobado_por es requerido')
  }
  if (data.porcentaje < 0 || data.porcentaje > 100) {
    errors.push('porcentaje debe estar entre 0 y 100')
  }
  if (data.tipo === 'total' && data.porcentaje !== 100) {
    errors.push('porcentaje debe ser 100 para exoneración total')
  }
  return { valid: errors.length === 0, errors }
}

export function buildExoneracion({ cuota_id, familia_id, tipo, porcentaje, motivo, aprobado_por }) {
  return {
    cuota_id,
    familia_id,
    tipo,
    porcentaje,
    motivo,
    aprobado_por,
  }
}

/**
 * Rounds half-up to the nearest whole centavo so the exonerated amount
 * is always an integer number of centavos.
 */
export function calcularMontoExonerado(cuota, exoneracion) {
  return Math.round((cuota.monto_base_centavos * exoneracion.porcentaje) / 100)
}
