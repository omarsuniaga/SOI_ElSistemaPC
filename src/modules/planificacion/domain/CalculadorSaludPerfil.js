/**
 * CalculadorSaludPerfil.js — Calculador del Índice de Salud e Integridad Académica (IDIA)
 */

export class CalculadorSaludPerfil {
  /**
   * Calcula el progreso ajustado del alumno considerando avance curricular e inasistencias.
   * @param {Object} params
   * @param {number} params.totalIndicadores — Cantidad total de indicadores del nivel/programa
   * @param {number} params.indicadoresLogrados — Cantidad de indicadores aprobados (>=3 estrellas)
   * @param {number} params.inasistenciasInjustificadas — Faltas no justificadas
   * @param {number} params.inasistenciasJustificadas — Faltas justificadas
   * @returns {Object} Datos consolidados del perfil
   */
  static calcular({
    totalIndicadores = 1,
    indicadoresLogrados = 0,
    inasistenciasInjustificadas = 0,
    inasistenciasJustificadas = 0,
  }) {
    const total = Math.max(totalIndicadores, 1)
    const avancePuroPct = Math.min(Math.round((indicadoresLogrados / total) * 100), 100)

    // Penalización: -4% por cada falta injustificada, -1.5% por cada falta justificada (atraso de práctica)
    const penalizacionInjustificada = inasistenciasInjustificadas * 4
    const penalizacionJustificada = inasistenciasJustificadas * 1.5
    const penalizacionTotal = penalizacionInjustificada + penalizacionJustificada

    const progresoAjustadoPct = Math.max(0, Math.round(avancePuroPct - penalizacionTotal))

    // Alertas por Ausentismo
    let alertaAusentismo = null
    const totalFaltas = inasistenciasInjustificadas + inasistenciasJustificadas

    if (inasistenciasInjustificadas >= 4) {
      alertaAusentismo = {
        nivel: 'critico',
        codigo: 'CITA_OBLIGATORIA',
        mensaje: '🔴 Alumno en estado crítico (4+ faltas). Requiere cita obligatoria con el representante antes de ingresar a clase.',
      }
    } else if (inasistenciasInjustificadas === 3) {
      alertaAusentismo = {
        nivel: 'alto',
        codigo: 'RETENCION_INSTRUMENTO',
        mensaje: '🟠 Carta institucional enviada. Instrumento retenido por acumulación de 3 inasistencias.',
      }
    } else if (inasistenciasInjustificadas === 2) {
      alertaAusentismo = {
        nivel: 'medio',
        codigo: 'NOTIFICACION_EXPLORATORIA',
        mensaje: '🟡 Notificación exploratoria preventiva enviada al representante.',
      }
    }

    return {
      avancePuroPct,
      penalizacionTotalPct: Math.round(penalizacionTotal),
      progresoAjustadoPct,
      totalFaltas,
      inasistenciasInjustificadas,
      inasistenciasJustificadas,
      alertaAusentismo,
    }
  }
}
