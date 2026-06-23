/**
 * Domain: patrocinio
 * Sponsorship logic — no Supabase imports.
 */

export function buildPatrocinio({ patrocinante_id, alumno_id, familia_id, cubre, monto_mensual }) {
  return {
    patrocinante_id,
    alumno_id,
    familia_id,
    cubre,
    monto_mensual,
    activo: true,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: null,
  }
}

export function calcularAportePatrocinio(patrocinio, cuotaMonto) {
  if (patrocinio.cubre === 'cuota') {
    return Math.min(patrocinio.monto_mensual, cuotaMonto)
  }
  // For wallet and accesorio: return full monto_mensual
  return patrocinio.monto_mensual
}

export function cubriendoCargo(patrocinio, tipoGasto) {
  return patrocinio.cubre === tipoGasto
}
