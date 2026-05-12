export class Planificacion {
  constructor(data = {}) {
    this.id = data.id || null
    this.clase_id = data.clase_id || null
    this.maestro_id = data.maestro_id || null
    this.fecha_inicio = data.fecha_inicio || null
    this.tema = data.tema || ''
    this.objetivos = data.objetivos || ''
    this.contenido = data.contenido || ''
    this.recursos = Array.isArray(data.recursos) ? data.recursos : []
    this.evaluacion_metodo = data.evaluacion_metodo || ''
    this.observaciones = data.observaciones || ''
    this.notas_dsl = data.notas_dsl || ''
    this.estado = data.estado || 'planificado'
    this.instrumento = data.instrumento || null
    this.created_at = data.created_at || null
    this.updated_at = data.updated_at || null
  }

  validate() {
    const errores = []

    if (!this.tema || !this.tema.trim()) {
      errores.push('El tema es obligatorio')
    } else if (this.tema.trim().length < 3) {
      errores.push('El tema debe tener mínimo 3 caracteres')
    } else if (this.tema.trim().length > 200) {
      errores.push('El tema no puede exceder 200 caracteres')
    }

    if (!this.clase_id) {
      errores.push('La clase es obligatoria')
    }

    if (this.objetivos && this.objetivos.length > 1000) {
      errores.push('Los objetivos no pueden exceder 1000 caracteres')
    }

    if (this.contenido && this.contenido.length > 2000) {
      errores.push('El contenido no puede exceder 2000 caracteres')
    }

    if (this.evaluacion_metodo && this.evaluacion_metodo.length > 500) {
      errores.push('El método de evaluación no puede exceder 500 caracteres')
    }

    if (this.observaciones && this.observaciones.length > 1000) {
      errores.push('Las observaciones no pueden exceder 1000 caracteres')
    }

    if (this.instrumento && this.instrumento.length > 100) {
      errores.push('El instrumento no puede exceder 100 caracteres')
    }

    const estadosValidos = Planificacion.getEstados().map(e => e.value)
    if (!estadosValidos.includes(this.estado)) {
      errores.push('El estado no es válido')
    }

    return errores
  }

  static validarTema(tema) {
    if (!tema || !tema.trim()) return false
    if (tema.trim().length < 3) return false
    if (tema.trim().length > 200) return false
    return true
  }

  static getEstados() {
    return [
      { value: 'planificado', label: 'Planificado' },
      { value: 'ejecutado', label: 'Ejecutado' },
      { value: 'revisado', label: 'Revisado' },
    ]
  }

  toJSON() {
    return {
      id: this.id,
      clase_id: this.clase_id,
      maestro_id: this.maestro_id,
      fecha_inicio: this.fecha_inicio,
      tema: this.tema.trim(),
      objetivos: this.objetivos.trim() || null,
      contenido: this.contenido.trim() || null,
      recursos: this.recursos,
      evaluacion_metodo: this.evaluacion_metodo.trim() || null,
      observaciones: this.observaciones.trim() || null,
      estado: this.estado,
      instrumento: this.instrumento?.trim() || null,
      created_at: this.created_at,
      updated_at: this.updated_at,
    }
  }
}
