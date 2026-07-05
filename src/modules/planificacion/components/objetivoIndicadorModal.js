export function openObjetivoModal(objetivo) {
  const modalBody = document.getElementById('objetivoModalBody');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <form id="objetivoForm" class="row g-3">
      <div class="col-md-4">
        <label class="form-label label-apple">Código</label>
        <input type="text" class="input-apple" id="objCodigo" value="${objetivo.codigo || ''}" required>
      </div>
      <div class="col-md-8">
        <label class="form-label label-apple">Tipo</label>
        <select class="input-apple" id="objTipo">
          <option value="proceso" ${objetivo.tipo === 'proceso' ? 'selected' : ''}>Proceso</option>
          <option value="resultado" ${objetivo.tipo === 'resultado' ? 'selected' : ''}>Resultado</option>
        </select>
      </div>
      <div class="col-12">
        <label class="form-label label-apple">Descripción</label>
        <textarea class="input-apple" id="objDescripcion" rows="3" required>${objetivo.descripcion || ''}</textarea>
      </div>
      <div class="col-12">
        <h6 class="fw-bold mb-3">
          <i class="bi bi-check2-all me-2"></i>Indicadores
        </h6>
        <div id="indicadoresList" class="mb-3">
          ${renderIndicadores(objetivo.indicadores || [])}
        </div>
        <button type="button" class="btn-apple-utility btn-sm" id="btnAddIndicador">
          <i class="bi bi-plus-lg me-1"></i>Agregar indicador
        </button>
      </div>
      <div class="col-12">
        <div class="d-flex gap-2">
          <button type="submit" class="btn-apple-primary">
            <i class="bi bi-check-lg me-1"></i>Guardar
          </button>
          <button type="button" class="btn-apple-secondary" data-bs-dismiss="modal">
            Cancelar
          </button>
        </div>
      </div>
    </form>
  `;

  configurarEventosObjetivo(objetivo);
  bootstrap.Modal.getOrCreateInstance(document.getElementById('objetivoModal')).show();
}

function renderIndicadores(indicadores) {
  if (!indicadores.length) {
    return '<p class="text-muted">Sin indicadores definidos</p>';
  }

  return indicadores.map((ind, i) => `
    <div class="card mb-2 p-2" data-ind-id="${ind.id || 'new-' + i}">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <strong>${ind.codigo}</strong>
          <p class="mb-0 text-muted small">${ind.descripcion}</p>
        </div>
        <button type="button" class="btn btn-sm btn-link text-danger btn-delete-indicador">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function configurarEventosObjetivo(objetivo) {
  document.getElementById('btnAddIndicador')?.addEventListener('click', () => {
    openIndicadorModal(null, objetivo);
  });

  document.getElementById('indicadoresList')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-delete-indicador');
    if (btn) {
      btn.closest('[data-ind-id]')?.remove();
    }
  });

  document.getElementById('objetivoForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    guardarObjetivo(objetivo);
  });
}

function guardarObjetivo(objetivo) {
  const codigo = document.getElementById('objCodigo').value;
  const descripcion = document.getElementById('objDescripcion').value;
  const tipo = document.getElementById('objTipo').value;

  window.dispatchEvent(new CustomEvent('showToast', {
    detail: { message: 'Objetivo guardado correctamente', type: 'success' }
  }));

  bootstrap.Modal.getOrCreateInstance(document.getElementById('objetivoModal')).hide();
}

export function openIndicadorModal(indicador, objetivo) {
  const modalBody = document.getElementById('indicadorModalBody');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <form id="indicadorForm" class="row g-3">
      <div class="col-md-4">
        <label class="form-label label-apple">Código</label>
        <input type="text" class="input-apple" id="indCodigo" 
          value="${indicador?.codigo || ''}" required>
      </div>
      <div class="col-md-8">
        <label class="form-label label-apple">Tipo</label>
        <select class="input-apple" id="indTipo">
          <option value="proceso" ${indicador?.tipo === 'proceso' ? 'selected' : ''}>Proceso</option>
          <option value="resultado" ${indicador?.tipo === 'resultado' ? 'selected' : ''}>Resultado</option>
        </select>
      </div>
      <div class="col-12">
        <label class="form-label label-apple">Descripción</label>
        <textarea class="input-apple" id="indDescripcion" rows="3" required>${indicador?.descripcion || ''}</textarea>
      </div>
      <div class="col-md-6">
        <label class="form-label label-apple">Ponderación (%)</label>
        <input type="number" class="input-apple" id="indPonderacion" 
          value="${indicador?.ponderacion || 0}" min="0" max="100">
      </div>
      <div class="col-12">
        <div class="d-flex gap-2">
          <button type="submit" class="btn-apple-primary">
            <i class="bi bi-check-lg me-1"></i>Guardar indicador
          </button>
          <button type="button" class="btn-apple-secondary" data-bs-dismiss="modal">
            Cancelar
          </button>
        </div>
      </div>
    </form>
  `;

  configurarEventosIndicador(indicador, objetivo);
  bootstrap.Modal.getOrCreateInstance(document.getElementById('indicadorModal')).show();
}

function configurarEventosIndicador(indicador, objetivo) {
  document.getElementById('indicadorForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nuevoIndicador = {
      id: indicador?.id || 'ind-' + Date.now(),
      codigo: document.getElementById('indCodigo').value,
      descripcion: document.getElementById('indDescripcion').value,
      tipo: document.getElementById('indTipo').value,
      ponderacion: parseInt(document.getElementById('indPonderacion').value) || 0
    };

    const indicadoresEl = document.getElementById('indicadoresList');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = renderIndicadores([nuevoIndicador]);
    indicadoresEl?.appendChild(tempDiv.firstElementChild);

    window.dispatchEvent(new CustomEvent('showToast', {
      detail: { message: 'Indicador agregado', type: 'success' }
    }));

    bootstrap.Modal.getOrCreateInstance(document.getElementById('indicadorModal')).hide();
  });
}