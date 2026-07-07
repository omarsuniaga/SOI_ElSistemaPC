/**
 * Modelo de Permiso - Validaciones y lógica de negocio
 */
export class Permiso {
  constructor(data = {}) {
    this.id = data.id || null
    this.maestro_id = data.maestro_id || ''
    this.maestro_nombre = data.maestro_nombre || ''
    this.maestro_email = data.maestro_email || ''
    this.puede_registrar_alumnos = data.puede_registrar_alumnos !== undefined ? data.puede_registrar_alumnos : false
    this.puede_inscribir_clases = data.puede_inscribir_clases !== undefined ? data.puede_inscribir_clases : false
    this.permisos = Array.isArray(data.permisos) ? data.permisos : []
    this.solicitudes = Array.isArray(data.solicitudes) ? data.solicitudes : []
    this.concedido_por = data.concedido_por || null
    this.concedido_por_nombre = data.concedido_por_nombre || null
    this.creado_en = data.creado_en || null
    this.actualizado_en = data.actualizado_en || null
  }

  /**
   * Valida los datos del permiso
   * @returns {string[]} Array de errores (vacío si no hay errores)
   */
  validate() {
    const errores = []

    // Validación de maestro_id
    if (!this.maestro_id || !this.maestro_id.trim()) {
      errores.push('El ID del maestro es obligatorio')
    }

    // Validación de booleanos
    if (typeof this.puede_registrar_alumnos !== 'boolean') {
      errores.push('puede_registrar_alumnos debe ser un valor booleano')
    }

    if (typeof this.puede_inscribir_clases !== 'boolean') {
      errores.push('puede_inscribir_clases debe ser un valor booleano')
    }

    // Validación de arreglos
    if (!Array.isArray(this.permisos)) {
      errores.push('permisos debe ser un arreglo')
    }

    if (!Array.isArray(this.solicitudes)) {
      errores.push('solicitudes debe ser un arreglo')
    }

    return errores
  }

  /**
   * Devuelve los datos como objeto limpio
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      maestro_id: this.maestro_id,
      maestro_nombre: this.maestro_nombre || null,
      maestro_email: this.maestro_email || null,
      puede_registrar_alumnos: this.puede_registrar_alumnos,
      puede_inscribir_clases: this.puede_inscribir_clases,
      permisos: this.permisos,
      solicitudes: this.solicitudes,
      concedido_por: this.concedido_por || null,
      concedido_por_nombre: this.concedido_por_nombre || null,
      creado_en: this.creado_en || null,
      actualizado_en: this.actualizado_en || null,
    }
  }
}
