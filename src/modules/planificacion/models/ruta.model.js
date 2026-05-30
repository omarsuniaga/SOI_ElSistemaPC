/**
 * Ruta — Curriculum route with objectives sequenced by week
 */
export class Ruta {
  constructor(data = {}) {
    this.id = data.id
    this.instrumento = data.instrumento
    this.nivel = data.nivel
    this.nombre = data.nombre
    this.tipo = data.tipo // 'soi-estandar' | 'maestro-variante'
    this.estado = data.estado // 'activa' | 'pendiente' | 'aprobada' | 'rechazada'
    this.descripcion = data.descripcion
    this.ruta_base_id = data.ruta_base_id
    this.duracion_semanas = data.duracion_semanas || 40
    this.creada_por = data.creada_por
    this.aprobada_por = data.aprobada_por
    this.fecha_aprobacion = data.fecha_aprobacion
    this.objetivos = data.objetivos || []
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }

  validate() {
    const errors = []

    if (!this.instrumento?.trim()) errors.push('Instrumento es requerido')
    if (!this.nivel?.trim()) errors.push('Nivel es requerido')
    if (!this.nombre?.trim()) errors.push('Nombre es requerido')
    if (this.nombre?.length > 200) errors.push('Nombre máximo 200 caracteres')
    if (!['soi-estandar', 'maestro-variante'].includes(this.tipo))
      errors.push('Tipo debe ser soi-estandar o maestro-variante')
    if (!['activa', 'pendiente', 'aprobada', 'rechazada'].includes(this.estado))
      errors.push('Estado inválido')
    if (this.tipo === 'maestro-variante' && !this.ruta_base_id)
      errors.push('Variante debe referenciar ruta base')
    if (this.duracion_semanas < 1 || this.duracion_semanas > 52)
      errors.push('Duración debe estar entre 1 y 52 semanas')
    if (!Array.isArray(this.objetivos) || this.objetivos.length === 0)
      errors.push('Debe haber al menos 1 objetivo')

    // Validate objectives
    this.objetivos.forEach((obj, i) => {
      if (!obj.descripcion?.trim()) errors.push(`Objetivo ${i + 1}: descripción requerida`)
      if (obj.semana_inicio < 1) errors.push(`Objetivo ${i + 1}: semana_inicio >= 1`)
      if (obj.semana_fin > this.duracion_semanas)
        errors.push(`Objetivo ${i + 1}: semana_fin <= ${this.duracion_semanas}`)
      if (obj.semana_fin < obj.semana_inicio)
        errors.push(`Objetivo ${i + 1}: semana_fin >= semana_inicio`)
    })

    return errors
  }

  isVariante() {
    return this.tipo === 'maestro-variante'
  }

  isActiva() {
    return this.estado === 'activa'
  }

  isPendiente() {
    return this.estado === 'pendiente'
  }

  toJSON() {
    return {
      id: this.id,
      instrumento: this.instrumento,
      nivel: this.nivel,
      nombre: this.nombre,
      tipo: this.tipo,
      estado: this.estado,
      descripcion: this.descripcion,
      ruta_base_id: this.ruta_base_id,
      duracion_semanas: this.duracion_semanas,
      creada_por: this.creada_por,
      aprobada_por: this.aprobada_por,
      fecha_aprobacion: this.fecha_aprobacion,
      objetivos: this.objetivos,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }

  static getEstados() {
    return [
      { value: 'activa', label: 'Activa', color: 'bg-success' },
      { value: 'pendiente', label: 'Pendiente de aprobación', color: 'bg-warning' },
      { value: 'aprobada', label: 'Aprobada', color: 'bg-info' },
      { value: 'rechazada', label: 'Rechazada', color: 'bg-danger' }
    ]
  }
}
