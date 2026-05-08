import { router } from '../../../core/router/router.js';

let state = {
  programas: [],
  programaSeleccionado: null,
  nivelSeleccionado: null,
  bloqueSeleccionado: null,
  loading: true
};

export function renderPlanificacionCurricularView(container) {
  container.innerHTML = `
    <div class="container py-4">
      <div class="perfil-header mb-4">
        <h2 class="fw-bold">
          <i class="bi bi-diagram-3 me-2"></i>Planificación Curricular
        </h2>
        <p class="text-muted">Gestiona la estructura pedagógica por objetivos e indicadores</p>
      </div>

      <div class="row mb-4">
        <div class="col-md-4">
          <label class="form-label label-apple">Programa</label>
          <select class="input-apple" id="programaSelect">
            <option value="">Cargando programas...</option>
          </select>
        </div>
        <div class="col-md-8">
          <div class="breadcrumb-apple mt-2" id="breadcrumbNav">
            <span class="text-muted">Selecciona un programa</span>
          </div>
        </div>
      </div>

      <div id="pcLoading" class="text-center py-5 ${state.loading ? '' : 'd-none'}">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Cargando estructura...</p>
      </div>

      <div id="pcEmpty" class="text-center py-5 ${state.loading || state.programaSeleccionado ? ('d-none') : ''}">
        <i class="bi bi-diagram-3" style="font-size: 3rem; color: var(--bs-secondary);"></i>
        <p class="mt-3 text-muted">Selecciona un programa para ver la estructura</p>
      </div>

      <div class="row ${state.programaSeleccionado ? '' : 'd-none'}" id="pcContent">
        <div class="col-lg-4 mb-4">
          <div class="card-apple p-3">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-layers me-2"></i>Niveles
            </h6>
            <div class="list-group list-group-apple" id="nivelesList">
              ${renderNiveles()}
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-4">
          <div class="card-apple p-3 ${state.nivelSeleccionado ? '' : 'd-none'}' id="bloquesCard">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-columns-gap me-2"></i>Bloques
            </h6>
            <div class="list-group list-group-apple" id="bloquesList">
              ${renderBloques()}
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-4">
          <div class="card-apple p-3 ${state.bloqueSeleccionado ? '' : 'd-none'}" id="objetivosCard">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-bullseye me-2"></i>Objetivos
            </h6>
            <div class="list-group list-group-apple" id="objetivosList">
              ${renderObjetivos()}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="objetivoModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-bullseye me-2"></i>Objetivo
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="objetivoModalBody">
            <div class="text-center py-4">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="indicadorModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-check-circle me-2"></i>Indicador
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="indicadorModalBody"></div>
        </div>
      </div>
    </div>
  `;

  cargarProgramas();
  configurarEventos();
}

function renderNiveles() {
  if (!state.programaSeleccionado) return '';
  
  return state.programaSeleccionado.niveles.map(nivel => `
    <button class="list-group-item ${state.nivelSeleccionado?.id === nivel.id ? 'active' : ''}" 
            data-nivel-id="${nivel.id}">
      <div class="d-flex justify-content-between align-items-center">
        <span>${nivel.nombre}</span>
        <small class="text-muted">${nivel.descripcion}</small>
      </div>
    </button>
  `).join('');
}

function renderBloques() {
  if (!state.nivelSeleccionado) return '';
  
  return state.nivelSeleccionado.bloques.map(bloque => `
    <button class="list-group-item ${state.bloqueSeleccionado?.id === bloque.id ? 'active' : ''}"
            data-bloque-id="${bloque.id}"
            style="border-left: 3px solid ${bloque.color};">
      <div class="d-flex justify-content-between align-items-center">
        <span>${bloque.nombre}</span>
        <span class="badge" style="background-color: ${bloque.color};">${bloque.objetivos?.length || 0}</span>
      </div>
    </button>
  `).join('');
}

function renderObjetivos() {
  if (!state.bloqueSeleccionado) return '';
  
  return state.bloqueSeleccionado.objetivos.map(obj => `
    <button class="list-group-item" data-obj-id="${obj.id}">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <div class="fw-bold">${obj.codigo}</div>
          <small class="text-muted">${obj.descripcion}</small>
        </div>
        <span class="badge bg-${obj.tipo === 'proceso' ? 'primary' : 'success'} bg-opacity-10 text-${obj.tipo === 'proceso' ? 'primary' : 'success'}">
          ${obj.tipo}
        </span>
      </div>
      <div class="mt-2">
        <small class="text-muted">
          <i class="bi bi-check2-all"></i> ${obj.indicadores?.length || 0} indicadores
        </small>
      </div>
    </button>
  `).join('');
}

async function cargarProgramas() {
  try {
    const response = await fetch('/src/assets/data/mocks/planificacion-curricular.json');
    const data = await response.json();
    state.programas = data;
    
    actualizarProgramaSelect();
    state.loading = false;
    actualizarVista();
  } catch (error) {
    console.error('Error cargando programas:', error);
    state.programas = [];
  }
}

function actualizarProgramaSelect() {
  const select = document.getElementById('programaSelect');
  if (!select) return;

  select.innerHTML = '<option value="">Selecciona un programa</option>' +
    state.programas.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
}

function actualizarVista() {
  const loading = document.getElementById('pcLoading');
  const empty = document.getElementById('pcEmpty');
  const content = document.getElementById('pcContent');
  const nivelesList = document.getElementById('nivelesList');

  if (loading) loading.classList.toggle('d-none', !state.loading);
  if (empty) empty.classList.toggle('d-none', state.loading || !!state.programaSeleccionado);
  if (content) content.classList.toggle('d-none', !state.programaSeleccionado);
  if (nivelesList) nivelesList.innerHTML = renderNiveles();

  const breadcrumb = document.getElementById('breadcrumbNav');
  if (breadcrumb) {
    let items = [];
    if (state.programaSeleccionado) items.push(state.programaSeleccionado.nombre);
    if (state.nivelSeleccionado) items.push(state.nivelSeleccionado.nombre);
    if (state.bloqueSeleccionado) items.push(state.bloqueSeleccionado.nombre);
    
    breadcrumb.innerHTML = items.length 
      ? items.map((t, i) => `<span>${t}</span>${i < items.length -1 ? '<i class="bi bi-chevron-right"></i>' : ''}`).join('')
      : '<span class="text-muted">Selecciona un programa</span>';
  }

  configurarEventos();
}

function configurarEventos() {
  const programaSelect = document.getElementById('programaSelect');
  const nivelesList = document.getElementById('nivelesList');
  const bloquesList = document.getElementById('bloquesList');
  const objetivosList = document.getElementById('objetivosList');

  programaSelect?.addEventListener('change', (e) => {
    const progId = e.target.value;
    state.programaSeleccionado = state.programas.find(p => p.id === progId) || null;
    state.nivelSeleccionado = null;
    state.bloqueSeleccionado = null;
    actualizarVista();
  });

  nivelesList?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-nivel-id]');
    if (!btn) return;
    
    const nivelId = btn.dataset.nivelId;
    state.nivelSeleccionado = state.programaSeleccionado?.niveles.find(n => n.id === nivelId) || null;
    state.bloqueSeleccionado = null;
    
    document.getElementById('bloquesCard')?.classList.remove('d-none');
    document.getElementById('objetivosCard')?.classList.add('d-none');
    actualizarVista();
  });

  bloquesList?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-bloque-id]');
    if (!btn) return;
    
    const bloqueId = btn.dataset.bloqueId;
    state.bloqueSeleccionado = state.nivelSeleccionado?.bloques.find(b => b.id === bloqueId) || null;
    
    document.getElementById('objetivosCard')?.classList.remove('d-none');
    actualizarVista();
  });

  objetivosList?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-obj-id]');
    if (!btn) return;
    
    const objId = btn.dataset.objId;
    const objetivo = state.bloqueSeleccionado?.objetivos.find(o => o.id === objId);
    if (objetivo) {
      await abrirObjetivoModal(objetivo);
    }
  });
}

async function abrirObjetivoModal(objetivo) {
  const { openObjetivoModal } = await import('../components/objetivoIndicadorModal.js');
  openObjetivoModal(objetivo);
}

