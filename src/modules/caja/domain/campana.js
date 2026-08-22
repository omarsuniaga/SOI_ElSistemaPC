/**
 * Domain: campana
 * Payment campaign management — no Supabase imports.
 * Monetary fields are integer centavos (RD$1.00 = 100 centavos). ADR-002.
 */

export function buildCampana({ nombre, descripcion, incentivo, fecha_inicio, fecha_fin, creado_por }) {
  return {
    nombre,
    descripcion,
    incentivo,
    fecha_inicio,
    fecha_fin,
    activa: true,
    creado_por,
  }
}

export function campanaVigente(campana, today) {
  if (!campana.activa) return false
  const inicio = new Date(campana.fecha_inicio)
  const fin = new Date(campana.fecha_fin)
  return today >= inicio && today <= fin
}

export function buildParticipacion(campana_id, familia_id) {
  return {
    campana_id,
    familia_id,
    monto_recuperado_centavos: 0,
  }
}

export function calcularMontoRecuperado(participaciones) {
  return participaciones.reduce((sum, p) => sum + (p.monto_recuperado_centavos || 0), 0)
}
