export class Salon {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nombre = data.nombre || '';
    this.codigo_salon = data.codigo_salon || '';
    this.capacidad = parseInt(data.capacidad) || 20;
    this.ubicacion = data.ubicacion || '';
    this.piso = data.piso !== undefined && data.piso !== null && data.piso !== '' ? parseInt(data.piso) : null;
    this.condicion_fisica = data.condicion_fisica || 'buena';
    this.equipamiento = Array.isArray(data.equipamiento) ? data.equipamiento : [];
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.responsable_id = data.responsable_id || null;
    this.created_at = data.created_at || null;
  }

  validar() {
    const errores = [];

    if (!this.nombre || this.nombre.trim().length < 2) {
      errores.push('El nombre del salón debe tener al menos 2 caracteres.');
    }
    if (this.capacidad < 1 || this.capacidad > 500) {
      errores.push('La capacidad debe ser un número entre 1 y 500.');
    }
    if (!this.ubicacion || this.ubicacion.trim().length < 3) {
      errores.push('La ubicación es obligatoria.');
    }

    const condicionesValidas = ['excelente', 'buena', 'regular', 'mala'];
    if (!condicionesValidas.includes(this.condicion_fisica)) {
      errores.push('Condición física inválida.');
    }

    return errores;
  }

  // Alias por si lo llama código viejo
  validate() {
    return this.validar();
  }

  toJSON() {
    return {
      nombre: this.nombre,
      codigo_salon: this.codigo_salon || null,
      capacidad: this.capacidad,
      ubicacion: this.ubicacion,
      piso: this.piso,
      condicion_fisica: this.condicion_fisica,
      equipamiento: this.equipamiento,
      is_active: this.is_active,
      responsable_id: this.responsable_id || null
    };
  }
}

export const EQUIPAMIENTO_DISPONIBLE = [
  'proyector',
  'pizarra',
  'audio',
  'wifi',
  'aire acondicionado',
  'iluminación especial'
];
