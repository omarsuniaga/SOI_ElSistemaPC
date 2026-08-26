/**
 * Domain: beca
 * Scholarship management — no Supabase imports.
 * All monetary fields are integer centavos (RD$1.00 = 100 centavos). ADR-002.
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

/**
 * Applies a scholarship discount to a cuota's monto_base_centavos.
 * The discount (porcentaje% of monto_base_centavos) is rounded half-up to
 * the nearest whole centavo before being subtracted, so monto_final_centavos
 * always stays an integer.
 */
export function aplicarBecaACuota(cuota, beca) {
  const descuentoCentavos = Math.round((cuota.monto_base_centavos * beca.porcentaje) / 100)
  return {
    newEstado: 'becada',
    monto_final_centavos: cuota.monto_base_centavos - descuentoCentavos,
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
