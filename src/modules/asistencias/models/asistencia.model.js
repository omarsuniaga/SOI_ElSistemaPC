/**
 * Modelo de Asistencia - Validaciones y lógica de negocio
 */
export class Asistencia {
  constructor(data = {}) {
    this.id = data.id || null
    this.clase_id = data.clase_id || null
    this.student_id = data.student_id || null
    this.fecha = data.fecha || ''
    this.estado = data.estado || 'P'
    this.justificacion_texto = data.justificacion_texto || ''
    this.justificacion_archivo = data.justificacion_archivo || ''
    this.created_at = data.created_at || null
    this.updated_at = data.updated_at || null
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

    if (!this.estado) {
      errores.push('El estado es obligatorio')
    } else {
      const estadosValidos = ['P', 'A', 'J']
      if (!estadosValidos.includes(this.estado)) {
        errores.push('Estado no válido. Debe ser P (Presente), A (Ausente) o J (Justificado)')
      }
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
   * Devuelve los datos como objeto limpio
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      clase_id: this.clase_id,
      student_id: this.student_id,
      fecha: this.fecha,
      estado: this.estado,
      justificacion_texto: this.justificacion_texto.trim() || null,
      justificacion_archivo: this.justificacion_archivo.trim() || null,
      created_at: this.created_at,
      updated_at: this.updated_at,
    }
  }

  /**
   * Obtiene los estados posibles de asistencia
   * @returns {Array<{value: string, label: string}>}
   */
  static getEstados() {
    return [
      { value: 'P', label: 'Presente' },
      { value: 'A', label: 'Ausente' },
      { value: 'J', label: 'Justificado' },
    ]
  }
}
