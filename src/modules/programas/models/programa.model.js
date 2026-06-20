/**
 * Modelo de Programa - Validaciones y lógica de negocio
 */
export class Programa {
  constructor(data = {}) {
    this.id = data.id || null
    this.nombre = data.nombre || ''
    this.descripcion = data.descripcion || ''
    this.nivel = data.nivel || ''
    this.duracion_anios = data.duracion_anios || null
    this.activo = data.activo !== undefined ? data.activo : true
    this.created_at = data.created_at || null
    this.updated_at = data.updated_at || null
  }

  /**
   * Valida los datos del programa
   * @param {string[]} validLevels - Catálogo de niveles permitidos
   * @returns {string[]} Array de errores (vacío si no hay errores)
   */
  validate(validLevels = []) {
    const errores = []

    if (!this.nombre || !this.nombre.trim()) {
      errores.push('El nombre del programa es obligatorio')
    } else if (this.nombre.length > 100) {
      errores.push('El nombre no puede exceder los 100 caracteres')
    }

    if (!this.nivel) {
      errores.push('El nivel es obligatorio')
    } else if (validLevels.length > 0 && !validLevels.includes(this.nivel)) {
      errores.push('El nivel seleccionado no es válido')
    }

    if (this.descripcion && this.descripcion.length > 500) {
      errores.push('La descripción no puede exceder los 500 caracteres')
    }

    if (this.duracion_anios !== null && (isNaN(this.duracion_anios) || this.duracion_anios < 0)) {
      errores.push('La duración debe ser un número positivo')
    }

    return errores
  }

  /**
   * Devuelve los datos como objeto limpio para la API
   * @returns {object}
   */
  toJSON() {
    return {
      nombre: this.nombre.trim(),
      descripcion: this.descripcion ? this.descripcion.trim() : '',
      nivel: this.nivel,
      duracion_anios: this.duracion_anios,
      activo: this.activo
    }
  }
}
