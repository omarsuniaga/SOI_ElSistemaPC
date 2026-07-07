/**
 * Componente: AlumnoPickerModal
 * Modal para seleccionar alumnos y generar tokens #alumno.
 * 
 * @param {HTMLElement} parentContainer 
 * @param {{ alumnos: Array, onSelect: Function }} options
 */
export function createAlumnoPickerModal(parentContainer, { alumnos = [], onSelect }) {
  let modalEl = document.getElementById('pm-alumno-picker-modal');

  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'pm-alumno-picker-modal';
    modalEl.className = 'pm-modal-overlay';
    modalEl.innerHTML = `
      <div class="pm-modal-content">
        <div class="pm-modal-header">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700;">Mencionar Alumnos</h3>
          <button class="pm-modal-close" id="pm-picker-close">&times;</button>
        </div>
        <div class="pm-modal-body" style="max-height: 300px; overflow-y: auto;">
          <div id="pm-picker-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
            <!-- Lista de alumnos con checkboxes -->
          </div>
        </div>
        <div class="pm-modal-footer" style="padding: 1rem; border-top: 1px solid var(--pm-border);">
          <button class="pm-btn pm-btn-primary" id="pm-picker-insert">Insertar Menciones</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  const listContainer = modalEl.querySelector('#pm-picker-list');
  const closeBtn = modalEl.querySelector('#pm-picker-close');
  const insertBtn = modalEl.querySelector('#pm-picker-insert');

  function renderList() {
    listContainer.innerHTML = alumnos.map(alumno => `
      <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; cursor: pointer; border-bottom: 1px solid var(--pm-surface-2);">
        <input type="checkbox" class="pm-alumno-check" value="${alumno.nombre_completo.replace(/\s+/g, '')}" data-id="${alumno.id}">
        <span style="font-size: 0.9rem;">${alumno.nombre_completo}</span>
      </label>
    `).join('');
  }

  function open() {
    renderList();
    modalEl.classList.add('open');
  }

  function close() {
    modalEl.classList.remove('open');
  }

  closeBtn.onclick = close;

  insertBtn.onclick = () => {
    const selected = Array.from(modalEl.querySelectorAll('.pm-alumno-check:checked'))
      .map(input => `#${input.value}`);
    
    if (selected.length > 0) {
      onSelect(selected.join(', ') + ' ');
    }
    close();
  };

  return { open, close };
}
