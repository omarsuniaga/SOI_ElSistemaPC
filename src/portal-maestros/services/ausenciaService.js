/**
 * ausenciaService — Service layer for absence management.
 * Stub for PR 2; full implementation in PR 3.
 */

export const ausenciaService = {
  /**
   * Find classes affected in a date range for a given teacher.
   * @param {string} maestroId
   * @param {{ fechaInicio: string, fechaFin: string }} dateRange
   * @returns {Promise<Array>}
   */
  async findAffectedClasses(maestroId, { fechaInicio, fechaFin }) {
    throw new Error('Not implemented — stub for PR 2');
  },

  /**
   * Find available salones for a given date/time range.
   * @param {{ fechaInicio: string, fechaFin: string, horario?: string }} params
   * @returns {Promise<Array>}
   */
  async buscarSalonesDisponibles({ fechaInicio, fechaFin, horario }) {
    throw new Error('Not implemented — stub for PR 2');
  },

  /**
   * Find substitute teachers for a given class.
   * @param {string} claseId
   * @returns {Promise<Array>}
   */
  async findSubstituteTeachers(claseId) {
    throw new Error('Not implemented — stub for PR 2');
  },

  /**
   * Create a new absence request with all related data.
   * @param {string} maestroId
   * @param {Object} formData
   * @returns {Promise<{ absenceId: string, createdAt: string }>}
   */
  async createAbsenceRequest(maestroId, formData) {
    throw new Error('Not implemented — stub for PR 2');
  },
};
