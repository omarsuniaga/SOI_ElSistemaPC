/**
 * CalculadorSaludPerfil.js — Calculador del Índice de Salud e Integridad Académica (IDIA)
 */

export class CalculadorSaludPerfil {
  /**
   * Calcula el progreso ajustado del alumno considerando avance curricular,
   * promedio de estrellas e inasistencias.
   * @param {Object} params
   * @param {number} params.totalIndicadores — Cantidad total de indicadores del nivel/programa
   * @param {number} params.indicadoresLogrados — Cantidad de indicadores aprobados (>=3 estrellas)
   * @param {number} [params.progresoContenidoPct] — Progreso base ya calculado en porcentaje (0-100)
   * @param {number} [params.promedioEstrellas] — Promedio de estrellas/calificación (0-5)
   * @param {number} params.inasistenciasInjustificadas — Faltas no justificadas
   * @param {number} params.inasistenciasJustificadas — Faltas justificadas
   * @returns {Object} Datos consolidados del perfil
   */
  static calcular({
    totalIndicadores = 1,
    indicadoresLogrados = 0,
    progresoContenidoPct = null,
    promedioEstrellas = null,
    inasistenciasInjustificadas = 0,
    inasistenciasJustificadas = 0,
  }) {
    const total = Math.max(totalIndicadores, 1)
    const avancePorIndicadoresPct = Math.min(Math.round((indicadoresLogrados / total) * 100), 100)
    const avanceContenidoPct = progresoContenidoPct != null && Number.isFinite(Number(progresoContenidoPct))
      ? _clampPct(Number(progresoContenidoPct))
      : avancePorIndicadoresPct
    const avanceEstrellasPct = promedioEstrellas != null && Number.isFinite(Number(promedioEstrellas))
      ? _clampPct((Number(promedioEstrellas) / 5) * 100)
      : null

    const componentes = [avanceContenidoPct]
    if (avanceEstrellasPct != null) componentes.push(avanceEstrellasPct)
    const avancePuroPct = Math.round(componentes.reduce((acc, pct) => acc + pct, 0) / componentes.length)

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
      avancePorIndicadoresPct,
      avanceContenidoPct,
      avanceEstrellasPct,
    }
  }
}

function _clampPct(value) {
  return Math.max(0, Math.min(100, Math.round(value)))
}
