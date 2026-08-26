/**
 * Domain: patrocinio
 * Sponsorship logic — no Supabase imports.
 * Monetary fields are integer centavos (RD$1.00 = 100 centavos). ADR-002.
 */

export function buildPatrocinio({ patrocinante_id, alumno_id, familia_id, cubre, monto_mensual_centavos }) {
  return {
    patrocinante_id,
    alumno_id,
    familia_id,
    cubre,
    monto_mensual_centavos,
    activo: true,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: null,
  }
}

export function calcularAportePatrocinio(patrocinio, cuotaMontoCentavos) {
  if (patrocinio.cubre === 'cuota') {
    return Math.min(patrocinio.monto_mensual_centavos, cuotaMontoCentavos)
  }
  // For wallet and accesorio: return full monto_mensual_centavos
  return patrocinio.monto_mensual_centavos
}

export function cubriendoCargo(patrocinio, tipoGasto) {
  return patrocinio.cubre === tipoGasto
}
