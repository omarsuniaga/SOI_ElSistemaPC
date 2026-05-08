export class Observacion {
  constructor(data = {}) {
    this.id = data.id || null
    this.alumno_id = data.alumno_id || null
    this.maestro_id = data.maestro_id || null
    this.tipo = data.tipo || 'comportamiento'
    this.titulo = data.titulo || ''
    this.descripcion = data.descripcion || ''
    this.prioridad = data.prioridad || 'media'
    this.estado = data.estado || 'abierta'
    this.fecha_observacion = data.fecha_observacion || null
    this.seguimiento_fecha = data.seguimiento_fecha || null
    this.seguimiento_observacion = data.seguimiento_observacion || ''
    this.created_at = data.created_at || null
    this.updated_at = data.updated_at || null
  }

  validate() {
    const errores = []

    if (!this.alumno_id) {
      errores.push('El alumno es obligatorio')
    }

    if (!this.titulo || !this.titulo.trim()) {
      errores.push('El título es obligatorio')
    } else if (this.titulo.trim().length < 5) {
      errores.push('El título debe tener mínimo 5 caracteres')
    } else if (this.titulo.trim().length > 100) {
      errores.push('El título no puede exceder 100 caracteres')
    }

    if (!this.descripcion || !this.descripcion.trim()) {
      errores.push('La descripción es obligatoria')
    } else if (this.descripcion.trim().length < 20) {
      errores.push('La descripción debe tener mínimo 20 caracteres')
    } else if (this.descripcion.trim().length > 1000) {
      errores.push('La descripción no puede exceder 1000 caracteres')
    }

    if (!this.tipo) {
      errores.push('El tipo es obligatorio')
    }

    return errores
  }

  static getTipos() {
    return [
      { value: 'comportamiento', label: 'Comportamiento' },
      { value: 'academico', label: 'Académico' },
      { value: 'social', label: 'Social' },
      { value: 'disciplina', label: 'Disciplina' },
    ]
  }

  static getPrioridades() {
    return [
      { value: 'baja', label: 'Baja' },
      { value: 'media', label: 'Media' },
      { value: 'alta', label: 'Alta' },
    ]
  }

  static getEstados() {
    return [
      { value: 'abierta', label: 'Abierta' },
      { value: 'resuelta', label: 'Resuelta' },
      { value: 'seguimiento', label: 'Seguimiento' },
    ]
  }

  static validarTitulo(titulo) {
    if (!titulo || !titulo.trim()) return false
    if (titulo.trim().length < 5) return false
    if (titulo.trim().length > 100) return false
    return true
  }

  static validarDescripcion(descripcion) {
    if (!descripcion || !descripcion.trim()) return false
    if (descripcion.trim().length < 20) return false
    if (descripcion.trim().length > 1000) return false
    return true
  }

  static validarTipo(tipo) {
    return this.getTipos().some(t => t.value === tipo)
  }

  toJSON() {
    return {
      id: this.id,
      alumno_id: this.alumno_id,
      maestro_id: this.maestro_id,
      tipo: this.tipo.trim(),
      titulo: this.titulo.trim(),
      descripcion: this.descripcion.trim(),
      prioridad: this.prioridad.trim(),
      estado: this.estado.trim(),
      fecha_observacion: this.fecha_observacion,
      seguimiento_fecha: this.seguimiento_fecha,
      seguimiento_observacion: this.seguimiento_observacion.trim() || null,
      created_at: this.created_at,
      updated_at: this.updated_at,
    }
  }
}
