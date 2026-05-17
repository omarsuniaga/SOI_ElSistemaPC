/**
 * Modelo de Asistencia - Validaciones y lógica de negocio
 */
export class Asistencia {
  static MAP_LEGACY = {
    'P': 'presente',
    'A': 'ausente',
    'J': 'justificado'
  }

  static MAP_SHORT = {
    'presente': 'P',
    'ausente': 'A',
    'justificado': 'J'
  }

  constructor(data = {}) {
    this.id = data.id || null
    this.clase_id = data.clase_id || null
    this.student_id = data.student_id || data.alumno_id || null
    this.sesion_clase_id = data.sesion_clase_id || null
    this.fecha = data.fecha || ''
    this.estado = this._normalizeEstado(data.estado || 'presente')
    this.justificacion_texto = data.justificacion_texto || ''
    this.observaciones = data.observaciones || ''
    this.created_at = data.created_at || null
    this.updated_at = data.updated_at || null
  }

  _normalizeEstado(val) {
    if (!val) return 'presente'
    const normalized = val.toLowerCase().trim()
    return Asistencia.MAP_LEGACY[val.toUpperCase()] || normalized
  }

  /**
   * Retorna el código corto (P, A, J) para la UI
   */
  getShortCode() {
    return Asistencia.MAP_SHORT[this.estado] || 'P'
  }

  /**
   * Valida los datos de la asistencia
   * @returns {string[]} Array de errores (vacío si no hay errores)
   */
  validate() {
    const errores = []

    if (!this.clase_id) {
      errores.push('La clase es obligatoria')
    }

    if (!this.student_id) {
      errores.push('El alumno es obligatorio')
    }

    if (!this.fecha) {
      errores.push('La fecha es obligatoria')
    }

    const estadosValidos = ['presente', 'ausente', 'justificado']
    if (!estadosValidos.includes(this.estado)) {
      errores.push('Estado no válido. Debe ser presente, ausente o justificado')
    }

    if (this.justificacion_texto && this.justificacion_texto.length > 500) {
      errores.push('La justificación no puede exceder 500 caracteres')
    }

    return errores
  }

  /**
   * Comprueba si la asistencia está completa
   * @returns {boolean}
   */
  isCompleto() {
    return !!(this.clase_id && this.student_id && this.fecha && this.estado)
  }

  /**
   * Devuelve los datos como objeto limpio para persistencia en Supabase
   * @returns {object}
   */
  toJSON() {
    return {
      clase_id: this.clase_id,
      alumno_id: this.student_id,
      sesion_clase_id: this.sesion_clase_id,
      fecha: this.fecha,
      estado: this.estado,
      justificacion_texto: this.justificacion_texto ? this.justificacion_texto.trim() : null,
      observaciones: this.observaciones ? this.observaciones.trim() : null
    }
  }

  /**
   * Obtiene los estados posibles de asistencia con etiquetas
   * @returns {Array<{value: string, label: string}>}
   */
  static getEstados() {
    return [
      { value: 'presente', label: 'Presente' },
      { value: 'ausente', label: 'Ausente' },
      { value: 'justificado', label: 'Justificado' },
    ]
  }
}
