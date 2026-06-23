/**
 * Domain: beca
 * Scholarship management — no Supabase imports.
 */

export function buildBeca({ alumno_id, familia_id, porcentaje, motivo, aprobado_por, indicador_progreso_minimo }) {
  return {
    alumno_id,
    familia_id,
    porcentaje,
    motivo,
    aprobado_por,
    indicador_progreso_minimo,
    activa: true,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: null,
  }
}

export function aplicarBecaACuota(cuota, beca) {
  return {
    newEstado: 'becada',
    monto_final: cuota.monto_base * (1 - beca.porcentaje / 100),
  }
}

export function becaVigente(beca, today) {
  if (!beca.activa) return false
  const inicio = new Date(beca.fecha_inicio)
  if (today < inicio) return false
  if (beca.fecha_fin !== null) {
    const fin = new Date(beca.fecha_fin)
    if (today > fin) return false
  }
  return true
}

export function debeLiquidarseBeca(beca, progresoActual) {
  return progresoActual < beca.indicador_progreso_minimo
}
