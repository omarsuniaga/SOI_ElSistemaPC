/**
 * Domain: cuota
 * Financial quota management — no Supabase imports.
 */

export const CUOTA_ESTADOS = {
  PENDIENTE: 'pendiente',
  PAGADA: 'pagada',
  VENCIDA: 'vencida',
  EN_MORA: 'en_mora',
  EXONERADA: 'exonerada',
  BECADA: 'becada',
  PRE_PAGADA: 'pre_pagada',
}

const VALID_TRANSITIONS = {
  pendiente: ['pagada', 'vencida', 'exonerada', 'becada', 'pre_pagada'],
  vencida: ['pagada', 'en_mora', 'exonerada'],
  en_mora: ['pagada', 'exonerada'],
  pagada: [],
  exonerada: [],
  becada: [],
  pre_pagada: [],
}

/**
 * @param {{ familia_id, alumno_id, ciclo_mes, ciclo_anio, monto_base, concepto }} params
 */
export function buildCuotaForCiclo({ familia_id, alumno_id, ciclo_mes, ciclo_anio, monto_base, concepto }) {
  const mm = String(ciclo_mes).padStart(2, '0')
  const fecha_vencimiento = `${ciclo_anio}-${mm}-05`
  return {
    familia_id,
    alumno_id,
    ciclo_mes,
    ciclo_anio,
    monto_base,
    monto_final: monto_base,
    concepto,
    estado: 'pendiente',
    fecha_vencimiento,
  }
}

export function canTransitionTo(currentEstado, targetEstado) {
  const allowed = VALID_TRANSITIONS[currentEstado]
  if (!allowed) return false
  return allowed.includes(targetEstado)
}

export function applyPagoToCuota(cuota, montoPagado) {
  const montoCubierto = Math.min(montoPagado, cuota.monto_final)
  const montoRestante = cuota.monto_final - montoCubierto
  const newEstado = montoRestante === 0 ? 'pagada' : cuota.estado
  return { newEstado, montoRestante, montoCubierto }
}

export function calcularMoraInfo(cuota, today) {
  const venc = new Date(cuota.fecha_vencimiento)
  const diffMs = today.getTime() - venc.getTime()
  const diasMora = diffMs <= 0 ? 0 : Math.floor(diffMs / (1000 * 60 * 60 * 24))

  return {
    diasMora,
    esMora: diasMora > 30,
    esVencida: diasMora >= 1 && diasMora <= 30,
    esAlDia: diasMora === 0,
  }
}

export function isCuotaVencida(cuota, today) {
  return new Date(cuota.fecha_vencimiento) < today
}

export function cuotaEsLiquidable(cuota) {
  return ['pendiente', 'vencida', 'en_mora'].includes(cuota.estado)
}
