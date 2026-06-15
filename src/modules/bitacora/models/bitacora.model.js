const VALID_NOTAS = ['bien', 'regular', 'mal']

export class BitacoraRegistro {
  constructor(data = {}) {
    this.id = data.id || null
    this.claseId = data.claseId || null
    this.objetivoId = data.objetivoId || null
    this.fecha = data.fecha || ''
    this.notas = Array.isArray(data.notas) ? data.notas : []
  }

  validate() {
    const errors = []

    if (this.fecha) {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      const fechaDate = new Date(this.fecha + 'T23:59:59')
      if (fechaDate > today) {
        errors.push('La fecha no puede ser posterior a hoy')
      }
    }

    if (!this.notas.length) {
      errors.push('La lista de notas no puede estar vacía')
    }

    for (const nota of this.notas) {
      if (!VALID_NOTAS.includes(nota.nota)) {
        errors.push(`Nota no válida: "${nota.nota}". Debe ser bien, regular o mal`)
      }
    }

    return errors
  }

  toJSON() {
    return {
      claseId: this.claseId,
      objetivoId: this.objetivoId,
      fecha: this.fecha,
      notas: this.notas.map(n => ({ ...n })),
    }
  }

  static calcularSemaforo({ bien_count, regular_count, mal_count, total_registros }) {
    if (total_registros === 0) {
      return 'gris'
    }

    if (mal_count > total_registros / 2) {
      return 'rojo'
    }

    if (bien_count >= Math.ceil(total_registros * 0.7)) {
      return 'verde'
    }

    return 'naranja'
  }
}
