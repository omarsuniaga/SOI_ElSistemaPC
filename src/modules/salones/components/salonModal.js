import { EQUIPAMIENTO_DISPONIBLE, Salon } from '../models/salon.model.js';
import { salonesUtils } from '../utils/salonesUtils.js';

export const salonModal = {
  modalInstance: null,
  
  init() {
    let modalEl = document.getElementById('salonModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'salonModal';
      modalEl.className = 'modal fade';
      modalEl.tabIndex = '-1';
      document.body.appendChild(modalEl);
    }
  },

  renderForm(salonData = {}) {
    const isEdit = !!salonData.id;
    const s = new Salon(salonData);
    
    const eqHtml = EQUIPAMIENTO_DISPONIBLE.map(eq => `
      <div class="form-check form-check-inline">
        <input class="form-check-input equipamiento-checkbox" type="checkbox" value="${eq}" id="eq_${eq.replace(' ', '_')}" ${s.equipamiento.includes(eq) ? 'checked' : ''}>
        <label class="form-check-label" for="eq_${eq.replace(' ', '_')}">${eq}</label>
      </div>
    `).join('');

    return `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form id="salonForm">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title"><i class="bi bi-door-open"></i> ${isEdit ? 'Editar Salón' : 'Nuevo Salón'}</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label">Nombre del Salón <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" name="nombre" value="${salonesUtils.escapeHTML(s.nombre)}" required minlength="2">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Código del Salón</label>
                  <input type="text" class="form-control" name="codigo_salon" placeholder="Ej: A-101" value="${salonesUtils.escapeHTML(s.codigo_salon)}">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Capacidad <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input type="number" class="form-control" name="capacidad" value="${s.capacidad}" required min="1" max="500">
                    <span class="input-group-text"><i class="bi bi-people"></i></span>
                  </div>
                </div>
                <div class="col-md-8">
                  <label class="form-label">Ubicación <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" name="ubicacion" placeholder="Ej: Edificio Principal" value="${salonesUtils.escapeHTML(s.ubicacion)}" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Piso</label>
                  <input type="number" class="form-control" name="piso" placeholder="Ej: 0, 1, 2" value="${s.piso !== null ? s.piso : ''}">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Condición Física</label>
                  <select class="form-select" name="condicion_fisica">
                    <option value="excelente" ${s.condicion_fisica === 'excelente' ? 'selected' : ''}>Excelente</option>
                    <option value="buena" ${s.condicion_fisica === 'buena' ? 'selected' : ''}>Buena</option>
                    <option value="regular" ${s.condicion_fisica === 'regular' ? 'selected' : ''}>Regular</option>
                    <option value="mala" ${s.condicion_fisica === 'mala' ? 'selected' : ''}>Mala</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Estado</label>
                  <div class="form-check form-switch mt-2">
                    <input class="form-check-input" type="checkbox" name="is_active" id="isActive" ${s.is_active ? 'checked' : ''}>
                    <label class="form-check-label" for="isActive">Activo</label>
                  </div>
                </div>
                <div class="col-12 mt-4">
                  <label class="form-label fw-bold"><i class="bi bi-plug"></i> Equipamiento Disponible</label>
                  <div class="p-3 border rounded bg-body-tertiary">
                    ${eqHtml}
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-primary"><i class="bi bi-save"></i> Guardar Salón</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  open(salon, onSave) {
    this.init();
    const modalEl = document.getElementById('salonModal');
    modalEl.innerHTML = this.renderForm(salon);
    
    // Asumiendo que Bootstrap global está disponible
    // eslint-disable-next-line no-undef
    this.modalInstance = new bootstrap.Modal(modalEl);
    this.modalInstance.show();

    const form = modalEl.querySelector('#salonForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Obtener equipamiento chequeado
      const equipamiento = Array.from(modalEl.querySelectorAll('.equipamiento-checkbox:checked')).map(cb => cb.value);
      const formData = new FormData(form);
      
      // Armar objeto a guardar
      const data = {
        nombre: formData.get('nombre').trim(),
        codigo_salon: formData.get('codigo_salon').trim() || null,
        capacidad: parseInt(formData.get('capacidad')),
        ubicacion: formData.get('ubicacion').trim(),
        piso: formData.get('piso') !== '' ? parseInt(formData.get('piso')) : null,
        condicion_fisica: formData.get('condicion_fisica'),
        is_active: formData.get('is_active') === 'on',
        equipamiento
      };
      
      const objSalon = new Salon(data);
      const errores = objSalon.validar();
      if (errores.length > 0) {
        alert("Corrija los siguientes errores:\n" + errores.join("\n"));
        return;
      }

      onSave(data, this.modalInstance);
    });
  }
};
