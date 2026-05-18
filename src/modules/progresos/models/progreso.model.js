import { CALIFICACION_MIN, CALIFICACION_MAX } from '../../_shared/evaluacion-constants.js'

/**
 * Modelo de Progreso - Validaciones y lógica de negocio
 */
export class Progreso {
  constructor(data = {}) {
    this.id = data.id || null
    this.alumno_id = data.alumno_id || ''
    this.clase_id = data.clase_id || ''
    this.maestro_id = data.maestro_id || null
    this.fecha_evaluacion = data.fecha_evaluacion || ''
    // Accept both field names from callers; normalize to tipo_evaluacion internally
    this.tipo_evaluacion = data.tipo_evaluacion || data.evaluacion_tipo || ''
    this.calificacion = data.calificacion !== undefined && data.calificacion !== null
      ? parseFloat(data.calificacion)
      : null
    this.observaciones = data.observaciones || ''
    // Accept both estado and estado_cualitativo from callers
    this.estado = data.estado || data.estado_cualitativo || 'en_progreso'
    this.created_at = data.created_at || null
    this.updated_at = data.updated_at || null
  }

  /**
   * Valida los datos del progreso
   * @returns {string[]} Array de errores (vacío si no hay errores)
   */
  validate() {
    const errores = []

    if (!this.alumno_id) {
      errores.push('El alumno es obligatorio')
    }

    if (!this.clase_id) {
      errores.push('La clase es obligatoria')
    }

    if (!this.tipo_evaluacion || !this.tipo_evaluacion.trim()) {
      errores.push('El tipo de evaluación es obligatorio')
    } else {
      const tiposValidos = Progreso.getTiposEvaluacion().map(t => t.value)
      if (!tiposValidos.includes(this.tipo_evaluacion)) {
        errores.push('Tipo de evaluación no válido')
      }
    }

    if (this.calificacion !== null && this.calificacion !== undefined) {
      if (isNaN(this.calificacion) || this.calificacion < CALIFICACION_MIN || this.calificacion > CALIFICACION_MAX) {
        errores.push(`La calificación debe estar entre 0 y 10`)
      }
    }

    if (this.observaciones && this.observaciones.length > 500) {
      errores.push('Las observaciones no pueden exceder 500 caracteres')
    }

    const estadosValidos = Progreso.getEstados().map(e => e.value)
    if (this.estado && !estadosValidos.includes(this.estado)) {
      errores.push('Estado no válido')
    }

    return errores
  }

  static getTiposEvaluacion() {
    return [
      { value: 'parcial', label: 'Parcial' },
      { value: 'final', label: 'Final' },
      { value: 'continua', label: 'Continua' },
      { value: 'oral', label: 'Oral' },
      { value: 'escrita', label: 'Escrita' },
      { value: 'practica', label: 'Práctica' },
    ]
  }

  static getEstados() {
    return [
      { value: 'en_progreso', label: 'En Progreso', color: 'bg-primary' },
      { value: 'completado', label: 'Completado', color: 'bg-success' },
      { value: 'pendiente', label: 'Pendiente', color: 'bg-secondary' },
    ]
  }

  static getEstadoConfig(estado) {
    return this.getEstados().find(e => e.value === estado) || { value: estado, label: estado, color: 'bg-secondary' }
  }

  /**
   * Devuelve los datos como objeto limpio para persistencia en Supabase.
   * Column names match the actual DB schema:
   *   - evaluacion_tipo  (NOT tipo_evaluacion)
   *   - estado_cualitativo (NOT estado)
   * @returns {object}
   */
  toJSON() {
    return {
      alumno_id:          this.alumno_id,
      clase_id:           this.clase_id,
      maestro_id:         this.maestro_id,
      fecha_evaluacion:   this.fecha_evaluacion || null,
      evaluacion_tipo:    this.tipo_evaluacion.trim(),
      calificacion:       this.calificacion,
      observaciones:      this.observaciones ? this.observaciones.trim() : null,
      estado_cualitativo: this.estado,
    }
  }
}
