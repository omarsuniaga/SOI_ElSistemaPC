// ==============================================================================
// EvaluacionMapper.js
// Patrón Data Mapper / Adapter para desacoplar el dominio de la persistencia física.
// Mapea el modelo limpio descriptivo a las columnas físicas de Supabase ('c1'-'c8').
// ==============================================================================

export class EvaluacionMapper {
  /**
   * Traduce el modelo de dominio limpio al formato de la tabla Supabase 'evaluations'.
   * @param {Object} domain - Objeto con variables explícitas.
   * @returns {Object} Payload físico para la persistencia.
   */
  static toPersistence(domain) {
    return {
      c1: domain.afinacion !== undefined ? Number(domain.afinacion) : null,
      c2: domain.ritmo !== undefined ? Number(domain.ritmo) : null,
      c3: domain.postura !== undefined ? Number(domain.postura) : null,
      c4: domain.musicalidad !== undefined ? Number(domain.musicalidad) : null,
      c5: null,
      c6: null,
      c7: null,
      c8: null
    };
  }

  /**
   * Traduce el formato de la tabla Supabase 'evaluations' al modelo de dominio limpio.
   * @param {Object} persistence - Objeto crudo de la base de datos.
   * @returns {Object} Objeto descriptivo limpio.
   */
  static toDomain(persistence) {
    return {
      afinacion: persistence.c1 !== null && persistence.c1 !== undefined ? Number(persistence.c1) : 0,
      ritmo: persistence.c2 !== null && persistence.c2 !== undefined ? Number(persistence.c2) : 0,
      postura: persistence.c3 !== null && persistence.c3 !== undefined ? Number(persistence.c3) : 0,
      musicalidad: persistence.c4 !== null && persistence.c4 !== undefined ? Number(persistence.c4) : 0
    };
  }
}
