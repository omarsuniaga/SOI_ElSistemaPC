export class Progreso {
  constructor(data = {}) {
    this.id = data.id || null
    this.alumno_id = data.alumno_id || ''
    this.clase_id = data.clase_id || ''
    this.maestro_id = data.maestro_id || null
    this.fecha_evaluacion = data.fecha_evaluacion || ''
    this.tipo_evaluacion = data.tipo_evaluacion || ''
    this.calificacion = data.calificacion !== undefined ? parseFloat(data.calificacion) : null
    this.observaciones = data.observaciones || ''
    this.estado = data.estado || 'en_progreso'
    this.created_at = data.created_at || null
    this.updated_at = data.updated_at || null
  }

  validate() {
    const errores = []

    if (!this.alumno_id) {
      errores.push('El alumno es obligatorio')
    }

    if (!this.clase_id) {
      errores.push('La clase es obligatoria')
    }

    if (!this.tipo_evaluacion) {
      errores.push('El tipo de evaluacion es obligatorio')
    } else {
      const tiposValidos = Progreso.getTiposEvaluacion().map(t => t.value)
      if (!tiposValidos.includes(this.tipo_evaluacion)) {
        errores.push('Tipo de evaluacion no valido')
      }
    }

    if (this.calificacion !== null && this.calificacion !== undefined) {
      const calif = parseFloat(this.calificacion)
      if (isNaN(calif)) {
        errores.push('La calificacion debe ser un numero valido')
      } else if (calif < 0 || calif > 5) {
        errores.push('La calificacion debe estar entre 0 y 5')
      }
    }

    if (this.observaciones && this.observaciones.length > 500) {
      errores.push('Las observaciones no pueden exceder 500 caracteres')
    }

    if (this.estado) {
      const estadosValidos = Progreso.getEstados().map(e => e.value)
      if (!estadosValidos.includes(this.estado)) {
        errores.push('Estado no valido')
      }
    }

    return errores
  }

  static getTiposEvaluacion() {
    return [
      { value: 'parcial', label: 'Parcial' },
      { value: 'final', label: 'Final' },
      { value: 'continua', label: 'Continua' },
    ]
  }

  static getEstados() {
    return [
      { value: 'en_progreso', label: 'En Progreso' },
      { value: 'completado', label: 'Completado' },
      { value: 'pendiente', label: 'Pendiente' },
    ]
  }

  static validarCalificacion(calificacion) {
    if (calificacion === null || calificacion === undefined) return true
    const num = parseFloat(calificacion)
    if (isNaN(num)) return false
    return num >= 0 && num <= 5
  }

  static validarTipoEvaluacion(tipo) {
    const tipos = this.getTiposEvaluacion()
    return tipos.some(t => t.value === tipo)
  }

  static validarEstado(estado) {
    const estados = this.getEstados()
    return estados.some(e => e.value === estado)
  }

  toJSON() {
    return {
      id: this.id,
      alumno_id: this.alumno_id,
      clase_id: this.clase_id,
      maestro_id: this.maestro_id,
      fecha_evaluacion: this.fecha_evaluacion || null,
      tipo_evaluacion: this.tipo_evaluacion.trim(),
      calificacion: this.calificacion !== null ? parseFloat(this.calificacion) : null,
      observaciones: this.observaciones.trim() || null,
      estado: this.estado,
      created_at: this.created_at,
      updated_at: this.updated_at,
    }
  }
}
