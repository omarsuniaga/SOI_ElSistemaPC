/**
 * Domain: campana
 * Payment campaign management — no Supabase imports.
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
    monto_recuperado: 0,
  }
}

export function calcularMontoRecuperado(participaciones) {
  return participaciones.reduce((sum, p) => sum + (p.monto_recuperado || 0), 0)
}
