/**
 * IndicadorLogro.js — Entidad de Dominio para Indicadores Atómicos de Aprendizaje
 */

export class IndicadorLogro {
  /**
   * @param {Object} data
   * @param {string} data.id
   * @param {string} data.objetivoId
   * @param {string} data.titulo
   * @param {string} [data.descripcion]
   * @param {number} [data.nivelIndex=0] — Nivel (0 a 3)
   * @param {number} [data.orden=1]
   */
  constructor({ id, objetivoId, titulo, descripcion = '', nivelIndex = 0, orden = 1 }) {
    if (!id || !titulo) {
      throw new Error('[IndicadorLogro] Todo indicador requiere un id y un título válido.')
    }
    this.id = id
    this.objetivoId = objetivoId
    this.titulo = titulo
    this.descripcion = descripcion
    this.nivelIndex = nivelIndex
    this.orden = orden
  }

  /**
   * Evalúa si una nota de 1 a 5 se considera aprobada/lograda.
   * @param {number} nota — Calificación de 1 a 5 estrellas
   * @returns {boolean} true si nota >= 3
   */
  esLogrado(nota) {
    return typeof nota === 'number' && nota >= 3
  }

  /**
   * Calcula la siguiente estrella en el ciclo de evaluación 1-Tap.
   * Regla única de negocio: 0 → 1 → 2 → 3 → 4 → 5 → 0. Antes estaba duplicada
   * (con la misma expresión) en tres vistas distintas — centralizada acá para
   * que no puedan divergir.
   * @param {number} actual — Estrellas actuales (0 a 5)
   * @returns {number} Siguiente valor en el ciclo
   */
  static siguienteEstrella(actual) {
    const n = typeof actual === 'number' && actual >= 0 ? actual : 0
    return n >= 5 ? 0 : n + 1
  }

  /**
   * Retorna la etiqueta textual del desempeño según las estrellas.
   * @param {number} estrellas — 0 a 5
   * @returns {string}
   */
  static getEtiquetaDesempeno(estrellas) {
    switch (estrellas) {
      case 1:
        return 'Iniciado (Requiere refuerzo)'
      case 2:
        return 'En Proceso'
      case 3:
        return 'Logrado Básico'
      case 4:
        return 'Logrado Fluido'
      case 5:
        return 'Dominado / Excelencia'
      default:
        return 'Sin Evaluar'
    }
  }
}

/**
 * Genera un UUID v4 seguro, con fallback si crypto.randomUUID no está disponible.
 * @returns {string}
 */
export function generarUUIDSeguro() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Fábrica centralizada de dominio para crear indicadores con UUID real e integridad garantizada.
 */
export function crearIndicadorDominio({
  objetivoId,
  titulo,
  descripcion = '',
  nivelIndex = 0,
  orden = 1,
  prerrequisitoId = null,
  id = null,
}) {
  const indicadorId = id || generarUUIDSeguro()
  const indicador = new IndicadorLogro({
    id: indicadorId,
    objetivoId,
    titulo,
    descripcion,
    nivelIndex,
    orden,
  })

  return {
    ...indicador,
    prerrequisitoId,
  }
}

