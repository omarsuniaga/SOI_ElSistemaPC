/**
 * protocoloAusentismoService.js — Motor del Protocolo de Escalabilidad de Asistencia (1 a 4 Faltas)
 */

import { CalculadorSaludPerfil } from '../../planificacion/domain/CalculadorSaludPerfil.js'

export const NIVELES_PROTOCOLO = {
  TOLERANCIA: 1,
  EXPLORATORIO: 2,
  RETENCION_INSTRUMENTO: 3,
  CITA_OBLIGATORIA: 4,
}

/**
 * Procesa la asistencia de un alumno y determina si se deben disparar alertas o bloqueos.
 * @param {Object} params
 * @param {string} params.alumnoId
 * @param {string} params.alumnoNombre
 * @param {number} params.inasistenciasAcumuladas
 * @param {boolean} [params.esJustificada=false]
 * @returns {Object} Estado del protocolo
 */
export function procesarProtocoloAusencia({
  alumnoId,
  alumnoNombre,
  inasistenciasAcumuladas = 0,
  esJustificada = false,
}) {
  const faltasInjustificadas = esJustificada ? Math.max(0, inasistenciasAcumuladas - 1) : inasistenciasAcumuladas

  const salud = CalculadorSaludPerfil.calcular({
    totalIndicadores: 10,
    indicadoresLogrados: 5,
    inasistenciasInjustificadas: faltasInjustificadas,
    inasistenciasJustificadas: esJustificada ? 1 : 0,
  })

  let accionRequerida = 'NINGUNA'
  let permiteEvaluacionClase = true

  if (!esJustificada) {
    if (faltasInjustificadas >= NIVELES_PROTOCOLO.CITA_OBLIGATORIA) {
      accionRequerida = 'BLOQUEO_INGRESO_CITA_REPRESENTANTE'
      permiteEvaluacionClase = false
    } else if (faltasInjustificadas === NIVELES_PROTOCOLO.RETENCION_INSTRUMENTO) {
      accionRequerida = 'NOTIFICACION_FORMAL_RETENER_INSTRUMENTO'
    } else if (faltasInjustificadas === NIVELES_PROTOCOLO.EXPLORATORIO) {
      accionRequerida = 'ENVIAR_MENSAJE_EXPLORATORIO'
    }
  }

  return {
    alumnoId,
    alumnoNombre,
    faltasInjustificadas,
    accionRequerida,
    permiteEvaluacionClase,
    alerta: salud.alertaAusentismo,
    saludAcademica: salud,
  }
}
