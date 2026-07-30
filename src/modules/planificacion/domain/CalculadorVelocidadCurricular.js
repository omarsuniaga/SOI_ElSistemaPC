/**
 * CalculadorVelocidadCurricular.js — Calculador de Velocidad Teórica vs. Real y Desfase Curricular
 */

export class CalculadorVelocidadCurricular {
  /**
   * Calcula el desfase temporal entre el avance esperado por calendario y el avance real de la clase.
   * @param {Object} params
   * @param {number} params.semanasTotales — Duración total del plan en semanas (ej. 24 semanas / 6 meses)
   * @param {number} params.semanaActual — Semana del calendario transcurrida (ej. 12 semanas / 3 meses)
   * @param {number} params.totalIndicadores — Cantidad total de indicadores del plan
   * @param {number} params.indicadoresCompletados — Cantidad de indicadores aprobados en clase
   * @returns {Object} Diagnóstico de avance y desfase
   */
  static calcular({
    semanasTotales = 24,
    semanaActual = 1,
    totalIndicadores = 1,
    indicadoresCompletados = 0,
  }) {
    const semTotales = Math.max(semanasTotales, 1)
    const semActual = Math.min(Math.max(semanaActual, 1), semTotales)
    const totInd = Math.max(totalIndicadores, 1)

    // Avance Teórico Esperado (%)
    const avanceEsperadoPct = Math.round((semActual / semTotales) * 100)

    // Avance Real Alcanzado (%)
    const avanceRealPct = Math.min(Math.round((indicadoresCompletados / totInd) * 100), 100)

    // Desfase (% Real - % Esperado)
    const desfasePct = avanceRealPct - avanceEsperadoPct

    // Determinar Alerta
    let alertaDesfase = null

    if (desfasePct <= -15) {
      alertaDesfase = {
        nivel: 'critico',
        codigo: 'DESFASE_CRITICO',
        mensaje: `⚠️ Alerta de Desfase Crítico: Se esperaba ${avanceEsperadoPct}% (Semana ${semActual}/${semTotales}), pero el avance real es ${avanceRealPct}% (${desfasePct}%). Requiere justificación.`,
        desfasePct,
        requiereJustificacion: true,
      }
    } else if (desfasePct <= -8) {
      alertaDesfase = {
        nivel: 'moderado',
        codigo: 'DESFASE_MODERADO',
        mensaje: `🟡 Alerta de Retraso Moderado: Avance real ${avanceRealPct}% vs. esperado ${avanceEsperadoPct}%.`,
        desfasePct,
        requiereJustificacion: false,
      }
    }

    return {
      semanasTotales: semTotales,
      semanaActual: semActual,
      avanceEsperadoPct,
      avanceRealPct,
      desfasePct,
      alertaDesfase,
    }
  }
}
