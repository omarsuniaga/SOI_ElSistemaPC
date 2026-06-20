/**
 * Componente: AsistenciaLista
 * Implementa la "Cola UX": Alumnos marcados se mueven al final de la lista.
 * 
 * @param {HTMLElement} container 
 * @param {{ alumnos: Array, onStateChange: Function }} options
 * @returns {Object} API del componente
 */
export function createAsistenciaLista(container, { alumnos = [], onStateChange }) {
  // Estado local del componente
  let _alumnos = [...alumnos].map(a => ({
    ...a,
    estado: null, // P, A, J o null (pendiente)
  }));

  /**
   * Ordena los alumnos: primero los pendientes (A-Z), luego los marcados (A-Z).
   */
  function _sortAlumnos() {
    return [..._alumnos].sort((a, b) => {
      const aMarcado = a.estado !== null;
      const bMarcado = b.estado !== null;

      if (!aMarcado && bMarcado) return -1;
      if (aMarcado && !bMarcado) return 1;

      // Si ambos tienen el mismo estado (marcado o no), ordenar alfabéticamente
      return (a.nombre_completo || '').localeCompare(b.nombre_completo || '');
    });
  }

  function render() {
    const sorted = _sortAlumnos();

    container.innerHTML = `
      <div class="pm-asistencia-lista">
        ${sorted.map(alumno => `
          <div class="pm-clase-card pm-asistencia-card ${alumno.estado ? 'marcado' : ''}" 
               data-id="${alumno.id}" 
               style="${_getCardStyle(alumno.estado)}">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <div style="display: flex; flex-direction: column;">
                <span style="font-weight: 700; font-size: 1rem;">${_escHTML(alumno.nombre_completo)}</span>
                <span style="font-size: 0.8rem; color: var(--pm-text-muted);">${_escHTML(alumno.instrumento_principal || '—')}</span>
              </div>
              
              <div style="display: flex; gap: 0.5rem;">
                <button class="pm-asistencia-btn ${alumno.estado === 'P' ? 'active' : ''}" 
                        data-action="P" data-id="${alumno.id}" title="Presente">P</button>
                <button class="pm-asistencia-btn ${alumno.estado === 'A' ? 'active' : ''}" 
                        data-action="A" data-id="${alumno.id}" title="Ausente">A</button>
                <button class="pm-asistencia-btn ${alumno.estado === 'J' ? 'active' : ''}" 
                        data-action="J" data-id="${alumno.id}" title="Justificado">J</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    _attachEvents();
  }

  function _getCardStyle(estado) {
    if (estado === 'P') return 'border-left-color: var(--pm-success); background: rgba(34, 197, 94, 0.05);';
    if (estado === 'A') return 'border-left-color: var(--pm-danger); background: rgba(239, 68, 68, 0.05);';
    if (estado === 'J') return 'border-left-color: var(--pm-warning); background: rgba(234, 179, 8, 0.05);';
    return '';
  }

  function _attachEvents() {
    container.querySelectorAll('.pm-asistencia-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const { id, action } = btn.dataset;
        _updateEstado(id, action);
      });
    });
  }

  function _updateEstado(id, nuevoEstado) {
    const idx = _alumnos.findIndex(a => a.id === id);
    if (idx === -1) return;

    // Toggle: si toca el mismo, vuelve a null
    _alumnos[idx].estado = _alumnos[idx].estado === nuevoEstado ? null : nuevoEstado;

    if (onStateChange) {
      onStateChange(_alumnos[idx]);
    }

    render();
  }

  /**
   * API Pública: Marca todos los que no tienen estado aún
   */
  function markAll(estado) {
    _alumnos.forEach(a => {
      if (a.estado === null) {
        a.estado = estado;
        if (onStateChange) onStateChange(a);
      }
    });
    render();
  }

  /**
   * API Pública: Forzar un estado para un alumno
   */
  function setEstado(id, estado) {
    const idx = _alumnos.findIndex(a => a.id === id);
    if (idx !== -1) {
      _alumnos[idx].estado = estado;
      render();
    }
  }

  function getEstadoActual() {
    return [..._alumnos];
  }

  function _escHTML(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Estilos específicos para los botones de asistencia dentro del componente
  if (!document.getElementById('pm-asistencia-styles')) {
    const style = document.createElement('style');
    style.id = 'pm-asistencia-styles';
    style.textContent = `
      .pm-asistencia-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid var(--pm-border);
        background: var(--pm-surface);
        color: var(--pm-text-muted);
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
        font-size: 0.9rem;
      }
      .pm-asistencia-btn.active[data-action="P"] { background: var(--pm-success); color: white; border-color: var(--pm-success); }
      .pm-asistencia-btn.active[data-action="A"] { background: var(--pm-danger); color: white; border-color: var(--pm-danger); }
      .pm-asistencia-btn.active[data-action="J"] { background: var(--pm-warning); color: white; border-color: var(--pm-warning); }
      
      .pm-asistencia-card {
        transition: transform 0.3s ease, background 0.2s ease;
      }
      .pm-asistencia-card.marcado {
        opacity: 0.8;
      }
    `;
    document.head.appendChild(style);
  }

  render();

  return {
    markAll,
    setEstado,
    getEstadoActual
  };
}
