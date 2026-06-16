/**
 * BitacoraRegistro — Validations and business logic for content qualification records.
 *
 * Mirrors planificacion.model.js style: pure class, no I/O, validate() returns
 * string[], toJSON() returns snake_case payload for Supabase.
 */

/** @type {readonly string[]} */
const NOTAS_VALIDAS = ['bien', 'regular', 'mal']

export class BitacoraRegistro {
  /**
   * @param {object} data
   * @param {string|null} data.claseId
   * @param {string|null} data.objetivoId
   * @param {string|null} data.alumnoId
   * @param {string} [data.fecha]           - ISO date string YYYY-MM-DD; defaults to today
   * @param {string|null} [data.nota]       - 'bien' | 'regular' | 'mal'
   * @param {string} [data.observacion]
   */
  constructor(data = {}) {
    this.claseId = data.claseId || null
    this.objetivoId = data.objetivoId || null
    this.alumnoId = data.alumnoId || null
    this.fecha = data.fecha || new Date().toISOString().slice(0, 10)
    this.nota = data.nota || null
    this.observacion = data.observacion || ''
  }

  /**
   * Validates the record data.
   * @returns {string[]} Array of error messages (empty when valid).
   */
  validate() {
    const errors = []

    if (!this.claseId) {
      errors.push('claseId es obligatorio')
    }

    if (!this.objetivoId) {
      errors.push('objetivoId es obligatorio')
    }

    if (!this.alumnoId) {
      errors.push('alumnoId es obligatorio')
    }

    if (!this.nota || !NOTAS_VALIDAS.includes(this.nota)) {
      errors.push(`nota debe ser uno de: ${NOTAS_VALIDAS.join(', ')}`)
    }

    const today = new Date().toISOString().slice(0, 10)
    if (this.fecha > today) {
      errors.push('fecha no puede ser una fecha futura')
    }

    return errors
  }

  /**
   * Returns a clean snake_case payload for Supabase persistence.
   * @returns {object}
   */
  toJSON() {
    return {
      clase_id: this.claseId,
      objetivo_id: this.objetivoId,
      alumno_id: this.alumnoId,
      fecha: this.fecha,
      nota_cualitativa: this.nota,
      observacion: this.observacion?.trim() || null,
    }
  }

  /**
   * Derives the semáforo color from raw aggregate counts.
   *
   * Thresholds (provisional — requires product sign-off):
   *   gris:    total_registros === 0
   *   rojo:    mal_count / total > 0.50  (conservative; takes precedence over verde)
   *   verde:   bien_count / total >= 0.70
   *   naranja: all other cases
   *
   * @param {{ bien_count: number, regular_count: number, mal_count: number, total_registros: number }} counts
   * @returns {'verde'|'naranja'|'rojo'|'gris'}
   */
  static calcularSemaforo({ bien_count, mal_count, total_registros }) {
    if (total_registros === 0) return 'gris'
    // rojo takes precedence over verde when both thresholds are met (conservative)
    if (mal_count / total_registros > 0.5) return 'rojo'
    if (bien_count / total_registros >= 0.7) return 'verde'
    return 'naranja'
  }
}
