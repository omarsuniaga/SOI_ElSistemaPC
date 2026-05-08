import { AppModal } from '../../../shared/components/AppModal.js'

const mockPlantillas = [
  { id: 'tpl_001', nombre: 'Plantilla Clase Regular', descripcion: 'Estructura estándar para clases regulares de instrumento', tipo: 'instrumento', contenido_dsl: 'objetivos: []\ncontenidos: []\nactividades: []\nrecursos: []\nevaluacion: null', estado: 'activa', fecha_creacion: '2026-01-15' },
  { id: 'tpl_002', nombre: 'Plantilla Clase Grupal', descripcion: 'Para clases de conjunto o grupo', tipo: 'grupo', contenido_dsl: 'objetivos: []\nrepertorio: []\nactividades: []\nevaluacion: null', estado: 'activa', fecha_creacion: '2026-02-01' },
  { id: 'tpl_003', nombre: 'Plantilla Examen', descripcion: 'Estructura para planificaciones de examen', tipo: 'examen', contenido_dsl: 'objetivos: []\npiezas: []\ncriterios: []\ncalificacion: null', estado: 'activa', fecha_creacion: '2026-03-10' },
  { id: 'tpl_004', nombre: 'Plantilla Concierto', descripcion: 'Para presentaciones y conciertos', tipo: 'presentacion', contenido_dsl: 'repertorio: []\norden: []\nlogistica: null', estado: 'draft', fecha_creacion: '2026-04-20' },
]

const state = {
  plantillas: [...mockPlantillas],
  editando: null,
  filtro: 'todas',
}

export async function renderPlantillasAdminView(container) {
  _render(container)
  _bindEvents(container)
}

function _render(container) {
  const filtradas = state.plantillas.filter(p => state.filtro === 'todas' || p.estado === state.filtro)

  container.innerHTML = `
    <div class="plantillas-admin-view px-3 px-md-4 py-3">
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 class="mb-0 fw-semibold"><i class="bi bi-file-earmark-template me-2 text-primary"></i>Plantillas Institucionales</h4>
          <p class="text-secondary small mb-0">Gestión de plantillas DSL para planificaciones</p>
        </div>
        <button class="btn btn-primary btn-sm" id="btnNuevaPlantilla">
          <i class="bi bi-plus-lg me-1"></i>Nueva Plantilla
        </button>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body py-2 px-3">
          <div class="d-flex gap-2 align-items-center flex-wrap">
            <span class="text-secondary small">Filtrar:</span>
            <div class="btn-group btn-group-sm">
              <button class="btn ${state.filtro === 'todas' ? 'btn-primary' : 'btn-outline-secondary'}" data-filter="todas">Todas</button>
              <button class="btn ${state.filtro === 'activa' ? 'btn-success' : 'btn-outline-secondary'}" data-filter="activa">Activas</button>
              <button class="btn ${state.filtro === 'draft' ? 'btn-warning' : 'btn-outline-secondary'}" data-filter="draft">Borrador</button>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        ${filtradas.length ? filtradas.map(p => _renderPlantillaCard(p)).join('') : _renderEmpty()}
      </div>
    </div>
  `
}

function _renderPlantillaCard(p) {
  const tipoIcon = { instrumento: 'bi-music-note', grupo: 'bi-people', examen: 'bi-file-earmark-check', presentacion: 'bi-mic' }[p.tipo] || 'bi-file-earmark'
  const tipoLabel = { instrumento: 'Instrumento', grupo: 'Grupal', examen: 'Examen', presentacion: 'Presentación' }[p.tipo] || p.tipo
  const estadoClass = p.estado === 'activa' ? 'success' : 'warning'

  return `
    <div class="col-md-6 col-lg-4">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="d-flex align-items-center gap-2">
              <div class="bg-primary-subtle text-primary rounded p-2">
                <i class="bi ${tipoIcon}"></i>
              </div>
              <div>
                <h6 class="mb-0 fw-semibold">${p.nombre}</h6>
                <span class="badge bg-${estadoClass} bg-opacity-10 text-${estadoClass}" style="font-size: 0.7rem;">${p.estado}</span>
              </div>
            </div>
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                <i class="bi bi-three-dots"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><button class="dropdown-item" data-action="edit" data-id="${p.id}"><i class="bi bi-pencil me-2"></i>Editar</button></li>
                <li><button class="dropdown-item" data-action="duplicate" data-id="${p.id}"><i class="bi bi-copy me-2"></i>Duplicar</button></li>
                <li><button class="dropdown-item" data-action="export" data-id="${p.id}"><i class="bi bi-download me-2"></i>Exportar DSL</button></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item text-danger" data-action="delete" data-id="${p.id}"><i class="bi bi-trash me-2"></i>Eliminar</button></li>
              </ul>
            </div>
          </div>
          <p class="text-muted small mb-2">${p.descripcion}</p>
          <div class="d-flex gap-2 flex-wrap">
            <span class="badge bg-secondary-subtle"><i class="bi bi-tag me-1"></i>${tipoLabel}</span>
            <span class="badge bg-secondary-subtle"><i class="bi bi-calendar me-1"></i>${_formatFecha(p.fecha_creacion)}</span>
          </div>
        </div>
      </div>
    </div>
  `
}

function _renderEmpty() {
  return `
    <div class="col-12 text-center py-5">
      <i class="bi bi-file-earmark-x fs-1 text-muted d-block mb-3"></i>
      <h5 class="text-muted">No hay plantillas</h5>
      <p class="text-muted small">Crea una nueva plantilla para comenzar</p>
    </div>
  `
}

function _bindEvents(container) {
  container.querySelector('#btnNuevaPlantilla')?.addEventListener('click', () => _openEditor(null))

  container.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.filtro = btn.dataset.filter
      _render(container)
    })
  })

  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id
      const action = btn.dataset.action

      if (action === 'edit') _openEditor(id)
      else if (action === 'duplicate') _duplicate(id)
      else if (action === 'export') _exportDSL(id)
      else if (action === 'delete') _delete(id, container)
    })
  })
}

function _openEditor(id) {
  const plantilla = id ? state.plantillas.find(p => p.id === id) : null
  state.editando = plantilla

  AppModal.open({
    title: plantilla ? 'Editar Plantilla' : 'Nueva Plantilla',
    size: 'lg',
    saveText: plantilla ? 'Guardar' : 'Crear',
    body: `
      <div class="mb-3">
        <label class="form-label">Nombre de la plantilla</label>
        <input type="text" class="form-control" id="tplNombre" value="${plantilla?.nombre || ''}" placeholder="Ej: Plantilla Clase Regular">
      </div>
      <div class="mb-3">
        <label class="form-label">Descripción</label>
        <textarea class="form-control" id="tplDescripcion" rows="2" placeholder="Describe el propósito de esta plantilla">${plantilla?.descripcion || ''}</textarea>
      </div>
      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label">Tipo</label>
          <select class="form-select" id="tplTipo">
            <option value="instrumento" ${plantilla?.tipo === 'instrumento' ? 'selected' : ''}>Instrumento</option>
            <option value="grupo" ${plantilla?.tipo === 'grupo' ? 'selected' : ''}>Grupal</option>
            <option value="examen" ${plantilla?.tipo === 'examen' ? 'selected' : ''}>Examen</option>
            <option value="presentacion" ${plantilla?.tipo === 'presentacion' ? 'selected' : ''}>Presentación</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Estado</label>
          <select class="form-select" id="tplEstado">
            <option value="draft" ${plantilla?.estado === 'draft' ? 'selected' : ''}>Borrador</option>
            <option value="activa" ${plantilla?.estado === 'activa' ? 'selected' : ''}>Activa</option>
          </select>
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label">Contenido DSL</label>
        <textarea class="form-control font-monospace" id="tplDSL" rows="12" style="font-size: 0.85rem;" placeholder="objetivos: []&#10;contenidos: []&#10;actividades: []">${plantilla?.contenido_dsl || 'objetivos: []\ncontenidos: []\nactividades: []\nrecursos: []\nevaluacion: null'}</textarea>
        <small class="text-muted">Usa el formato DSL definido por la institución</small>
      </div>
    `,
    onSave: () => {
      const nombre = document.getElementById('tplNombre').value.trim()
      const descripcion = document.getElementById('tplDescripcion').value.trim()
      const tipo = document.getElementById('tplTipo').value
      const estado = document.getElementById('tplEstado').value
      const dsl = document.getElementById('tplDSL').value

      if (!nombre) {
        alert('El nombre es obligatorio')
        return false
      }

      if (plantilla) {
        const idx = state.plantillas.findIndex(p => p.id === plantilla.id)
        if (idx !== -1) {
          state.plantillas[idx] = { ...state.plantillas[idx], nombre, descripcion, tipo, estado, contenido_dsl: dsl }
        }
      } else {
        state.plantillas.unshift({
          id: 'tpl_' + Date.now(),
          nombre,
          descripcion,
          tipo,
          contenido_dsl: dsl,
          estado,
          fecha_creacion: new Date().toISOString().slice(0, 10),
        })
      }

      _render(document.querySelector('.plantillas-admin-view'))
      AppModal.close()
    },
  })
}

function _duplicate(id) {
  const original = state.plantillas.find(p => p.id === id)
  if (!original) return

  const nueva = {
    ...original,
    id: 'tpl_' + Date.now(),
    nombre: original.nombre + ' (copia)',
    estado: 'draft',
    fecha_creacion: new Date().toISOString().slice(0, 10),
  }

  state.plantillas.unshift(nueva)
  _render(document.querySelector('.plantillas-admin-view'))
}

function _exportDSL(id) {
  const plantilla = state.plantillas.find(p => p.id === id)
  if (!plantilla) return

  const blob = new Blob([plantilla.contenido_dsl], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${plantilla.nombre.toLowerCase().replace(/\s+/g, '-')}.dsl`
  a.click()
  URL.revokeObjectURL(url)
}

function _delete(id, container) {
  AppModal.open({
    title: 'Eliminar Plantilla',
    size: 'sm',
    saveText: 'Eliminar',
    body: `
      <div class="alert alert-warning mb-0">
        <i class="bi bi-exclamation-triangle me-2"></i>
        ¿Estás seguro de eliminar esta plantilla? Esta acción no se puede deshacer.
      </div>
    `,
    onSave: () => {
      state.plantillas = state.plantillas.filter(p => p.id !== id)
      _render(container)
      AppModal.close()
    },
  })
}

function _formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}