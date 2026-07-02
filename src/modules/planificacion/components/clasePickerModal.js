import { getAlumnos } from '../../alumnos/api/alumnosApi.js'

export function createClasePickerModal(options = {}) {
  const { clases = [], onSelect = null } = options

  let searchTerm = ''
  let currentClase = null

  const modal = document.createElement('div')
  modal.className = 'modal fade'
  modal.setAttribute('tabindex', '-1')
  modal.setAttribute('role', 'dialog')
  modal.innerHTML = `
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h5 class="modal-title mb-1">Selecciona tu clase</h5>
            <div class="small text-muted">Explora las clases, revisa su estado y abre su detalle curricular.</div>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <div class="row g-3 align-items-start">
            <div class="col-12 col-lg-7">
              <div class="p-3 rounded-4 border bg-body-secondary mb-3">
                <input type="text" class="form-control" id="clase-picker-search" placeholder="Buscar por clase, maestro o instrumento...">
              </div>
              <div class="row g-3" id="clase-picker-grid"></div>
            </div>
            <div class="col-12 col-lg-5">
              <div class="card border-0 shadow-sm sticky-top" style="top: 1rem;">
                <div class="card-body" id="clase-picker-detail">
                  <div class="text-center text-muted py-5">
                    Selecciona una clase para ver su perfil, temas e indicadores.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" class="btn btn-primary" id="clase-picker-open" disabled>Abrir clase</button>
        </div>
      </div>
    </div>
  `

  const searchInput = modal.querySelector('#clase-picker-search')
  const grid = modal.querySelector('#clase-picker-grid')
  const detail = modal.querySelector('#clase-picker-detail')
  const openBtn = modal.querySelector('#clase-picker-open')

  function renderGrid() {
    const term = searchTerm.trim().toLowerCase()
    const filtered = term
      ? clases.filter((c) =>
          [c.nombre, c.maestro_nombre, c.instrumento, c.plan_estudio]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(term),
        )
      : clases

    grid.innerHTML = filtered.map((clase) => {
      const active = currentClase?.id === clase.id
      return `
        <div class="col-12 col-md-6">
          <button type="button" class="w-100 text-start card border-0 shadow-sm h-100 p-0 clase-card ${active ? 'border-primary' : ''}" data-id="${clase.id}">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
                <div>
                  <div class="fw-bold">${escapeHtml(clase.nombre || 'Sin nombre')}</div>
                  <div class="small text-muted">${escapeHtml(clase.maestro_nombre || 'Sin maestro')}</div>
                </div>
                <span class="badge text-bg-light">${escapeHtml(clase.instrumento || 'N/D')}</span>
              </div>
              <div class="small text-muted mb-2">${escapeHtml(clase.plan_estudio || 'Sin plan de estudio')}</div>
              <div class="d-flex gap-2 flex-wrap">
                <span class="badge text-bg-primary-subtle text-primary">Planificación</span>
                <span class="badge text-bg-secondary-subtle text-secondary">Ruta viva</span>
              </div>
            </div>
          </button>
        </div>
      `
    }).join('')

    grid.querySelectorAll('[data-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentClase = clases.find((c) => String(c.id) === String(btn.dataset.id)) || null
        renderGrid()
        renderDetail()
      })
    })
  }

  function renderDetail() {
    if (!currentClase) {
      detail.innerHTML = `
        <div class="text-center text-muted py-5">
          Selecciona una clase para ver su perfil, temas e indicadores.
        </div>`
      openBtn.disabled = true
      return
    }

    const temas = currentClase.temas || currentClase.planificacion_temas || []
    const indicadores = currentClase.indicadores || currentClase.planificacion_indicadores || []

    detail.innerHTML = `
      <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
        <div>
          <h5 class="mb-1">${escapeHtml(currentClase.nombre || 'Clase')}</h5>
          <div class="small text-muted">${escapeHtml(currentClase.maestro_nombre || 'Sin maestro')}</div>
        </div>
        <span class="badge text-bg-primary">${escapeHtml(currentClase.instrumento || 'N/D')}</span>
      </div>
      <div class="mb-3 small text-muted">
        ${escapeHtml(currentClase.descripcion || 'Revisa aquí el perfil curricular de la clase antes de entrar a editar o marcar avances.')}
      </div>
      <div class="mb-3">
        <div class="fw-semibold mb-2">Temas clave</div>
        <div class="d-flex flex-wrap gap-2">
          ${(temas.length ? temas : ['Sin temas cargados']).map((t) => `<span class="badge text-bg-light">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
      <div class="mb-3">
        <div class="fw-semibold mb-2">Indicadores visibles</div>
        <div class="d-flex flex-wrap gap-2">
          ${(indicadores.length ? indicadores : ['Sin indicadores cargados']).map((i) => `<span class="badge text-bg-warning-subtle text-dark">${escapeHtml(typeof i === 'string' ? i : (i.titulo || i.nombre || 'Indicador'))}</span>`).join('')}
        </div>
      </div>
      <div class="d-grid gap-2">
        <button type="button" class="btn btn-outline-primary" id="btn-clase-edit">Editar planificación</button>
        <button type="button" class="btn btn-outline-success" id="btn-clase-seen">Marcar indicadores vistos</button>
      </div>
    `
    openBtn.disabled = false
  }

  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value || ''
    renderGrid()
  })

  openBtn.addEventListener('click', () => {
    if (currentClase && onSelect) onSelect(currentClase)
    closeModal()
  })

  function openModal() {
    currentClase = clases[0] || null
    searchTerm = ''
    searchInput.value = ''
    renderGrid()
    renderDetail()
    const bsModal = new bootstrap.Modal(modal)
    bsModal.show()
    modal.bsModal = bsModal
  }

  function closeModal() {
    if (modal.bsModal) modal.bsModal.hide()
  }

  modal.openModal = openModal
  modal.closeModal = closeModal

  return modal
}

function escapeHtml(text) {
  if (text == null) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
