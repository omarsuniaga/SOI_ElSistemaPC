/**
 * Domain: score
 * Representante financial score — no Supabase imports.
 * Decision D3: voluntad_pago defaults to 20/20 when no compromisos.
 */

export const SCORE_WEIGHTS = {
  puntualidad: 35,
  consistencia: 20,
  voluntad_pago: 20,
  comportamiento_mora: 15,
  generosidad: 10,
}

/**
 * @param {{ puntualidadPct, consistenciaMeses, compromisos, moraEpisodios, pagosExtras }} params
 * @returns {number} 0-100
 */
export function calcularScore({ puntualidadPct, consistenciaMeses, compromisos, moraEpisodios, pagosExtras }) {
  const puntualidad = puntualidadPct * 0.35
  const consistencia = (Math.min(consistenciaMeses, 12) / 12) * 20

  let voluntad_pago
  if (compromisos.length === 0) {
    voluntad_pago = 20 // D3: perfect score when no history
  } else {
    const cumplidos = compromisos.filter(c => c.cumplido).length
    voluntad_pago = (cumplidos / compromisos.length) * 20
  }

  const comportamiento_mora = Math.max(0, 15 - moraEpisodios * 3)
  const generosidad = Math.min(10, pagosExtras * 2)

  return puntualidad + consistencia + voluntad_pago + comportamiento_mora + generosidad
}

export function clasificarNivel(score) {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  if (score >= 40) return 'D'
  return 'E'
}

export function getEfectosNivel(nivel) {
  const efectos = {
    A: {
      puedeRecibirInstrumentoPremium: true,
      requiereAprobacionManual: false,
      protocoloRetencion: false,
      descripcion: 'Familia excelente. Acceso completo a todos los beneficios.',
    },
    B: {
      puedeRecibirInstrumentoPremium: true,
      requiereAprobacionManual: false,
      protocoloRetencion: false,
      descripcion: 'Familia buena. Acceso a la mayoría de beneficios.',
    },
    C: {
      puedeRecibirInstrumentoPremium: false,
      requiereAprobacionManual: false,
      protocoloRetencion: false,
      descripcion: 'Familia regular. Acceso estándar.',
    },
    D: {
      puedeRecibirInstrumentoPremium: false,
      requiereAprobacionManual: true,
      protocoloRetencion: false,
      descripcion: 'Familia con dificultades. Requiere aprobación manual.',
    },
    E: {
      puedeRecibirInstrumentoPremium: false,
      requiereAprobacionManual: true,
      protocoloRetencion: true,
      descripcion: 'Familia en riesgo. Protocolo de retención activo.',
    },
  }
  return efectos[nivel] || efectos['E']
}

export function buildScoreSnapshot({ representante_id, familia_id, ciclo_mes, ciclo_anio, rawData }) {
  const score_total = calcularScore(rawData)
  const nivel = clasificarNivel(score_total)
  return {
    representante_id,
    familia_id,
    ciclo_mes,
    ciclo_anio,
    score_total,
    nivel,
    detalle: {
      puntualidad: rawData.puntualidadPct * 0.35,
      consistencia: (Math.min(rawData.consistenciaMeses, 12) / 12) * 20,
      voluntad_pago: rawData.compromisos.length === 0 ? 20 : (rawData.compromisos.filter(c => c.cumplido).length / rawData.compromisos.length) * 20,
      comportamiento_mora: Math.max(0, 15 - rawData.moraEpisodios * 3),
      generosidad: Math.min(10, rawData.pagosExtras * 2),
    },
  }
}
