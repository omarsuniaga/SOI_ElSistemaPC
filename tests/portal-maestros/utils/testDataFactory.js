export const testDataFactory = {
  createNode(overrides = {}) {
    return {
      id: `node-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Postura de Violín',
      is_critical: false,
      level_id: 'level-1',
      ...overrides
    }
  },

  createIndicator(overrides = {}) {
    return {
      id: `indicator-${Math.random().toString(36).substr(2, 9)}`,
      node_id: 'node-1',
      description: 'Espalda recta',
      order_index: 0,
      ...overrides
    }
  },

  createStudent(overrides = {}) {
    return {
      id: `student-${Math.random().toString(36).substr(2, 9)}`,
      nombre_completo: 'Alumno de Prueba',
      ...overrides
    }
  }
}
