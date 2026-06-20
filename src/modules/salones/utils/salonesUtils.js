export const salonesUtils = {
  escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
  },

  getPisoLabel(piso) {
    if (piso === null || piso === undefined || isNaN(piso)) return 'No especificado';
    return piso === 0 ? 'Planta Baja' : `Piso ${piso}`;
  },

  getCondicionColor(condicion) {
    const colores = {
      'excelente': 'success',
      'buena': 'primary',
      'regular': 'warning',
      'mala': 'danger'
    };
    return colores[condicion] || 'secondary';
  },

  getCondicionLabel(condicion) {
    if (!condicion) return 'Desconocida';
    return condicion.charAt(0).toUpperCase() + condicion.slice(1);
  },

  getStatusColor(isActive) {
    return isActive ? 'success' : 'secondary';
  },

  getStatusLabel(isActive) {
    return isActive ? 'Activo' : 'Inactivo';
  },

  formatCapacidad(num) {
    return `${num} personas`;
  }
};
