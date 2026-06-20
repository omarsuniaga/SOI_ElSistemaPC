import { supabase } from '../../../lib/supabaseClient.js'
import { normalizeText } from '../../../core/utils/normalizeText.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'

// ─── Module state ─────────────────────────────────────────────────────────────
const state = {
  all: [],
  filtered: [],
  container: null,
}

// ─── View entry point ─────────────────────────────────────────────────────────
export async function renderSolicitudesAdminView(container) {
  if (!container) return
  state.container = container

  container.innerHTML = `
    <div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;">
      <div class="spinner-border text-primary"></div>
    </div>`

  await _loadSolicitudes()
}

// ─── Data ─────────────────────────────────────────────────────────────────────
async function _loadSolicitudes() {
  try {
    const { data, error } = await supabase
      .from('solicitudes_necesidades')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    state.all = data || []
    state.filtered = [...state.all]
    _renderPage()
  } catch (err) {
    console.error('[solicitudesAdmin]', err)
    state.container.innerHTML = `
      <div class="page-container">
        <div class="alert alert-warning">Error al cargar solicitudes: ${err.message}</div>
      </div>`
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────
function _renderPage() {
  state.container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center"
             style="width:42px;height:42px;">
          <i class="bi bi-envelope-paper fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Solicitudes de maestros</h1>
          <p class="text-muted small mb-0">Necesidades enviadas por los maestros</p>
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 mb-4">
        <input type="text" class="form-control form-control-sm" id="sol-buscar"
               placeholder="Buscar por título o maestro..." style="max-width:260px;">
        <select class="form-select form-select-sm" id="sol-filtro-estado" style="max-width:160px;">
          <option value="">Estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_revision">En revisión</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
          <option value="resuelta">Resuelta</option>
        </select>
        <select class="form-select form-select-sm" id="sol-filtro-prioridad" style="max-width:140px;">
          <option value="">Prioridad</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
        <select class="form-select form-select-sm" id="sol-filtro-tipo" style="max-width:160px;">
          <option value="">Tipo</option>
          <option value="material">Material</option>
          <option value="pedagogico">Pedagógico</option>
          <option value="tecnico">Técnico</option>
          <option value="institucional">Institucional</option>
        </select>
        <button class="btn btn-sm btn-outline-secondary" id="sol-limpiar">
          <i class="bi bi-x-circle me-1"></i>Limpiar
        </button>
      </div>

      <div id="solicitudes-list"></div>
    </div>
  `

  _renderList()
  _attachEvents()
}

function _renderList() {
  const list = state.container.querySelector('#solicitudes-list')
  if (!list) return

  if (state.filtered.length === 0) {
    list.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="bi bi-envelope fs-1 d-block mb-2 opacity-50"></i>
        <p>No hay solicitudes de maestros registradas.</p>
      </div>`
    return
  }

  const estadoClass   = { pendiente: 'bg-warning-subtle text-warning-emphasis', en_revision: 'bg-info-subtle text-info-emphasis', aprobada: 'bg-success-subtle text-success-emphasis', rechazada: 'bg-danger-subtle text-danger-emphasis', resuelta: 'bg-secondary-subtle text-secondary-emphasis' }
  const prioClass     = { urgente: 'danger', alta: 'warning', media: 'primary', baja: 'secondary' }

  list.innerHTML = state.filtered.map(s => `
    <div class="list-group-item list-group-item-action p-3 mb-2 border rounded solicitud-row"
         data-id="${s.id}" style="cursor:pointer;">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div class="flex-grow-1 overflow-hidden">
          <div class="fw-semibold text-truncate">${s.titulo}</div>
          <div class="small text-muted mt-1">
            <span class="me-2"><i class="bi bi-person me-1"></i>${s.maestro_nombre || '—'}</span>
            <span class="me-2">${s.tipo_necesidad || '—'}</span>
            ${s.area ? `<span class="me-2">${s.area}</span>` : ''}
            <span class="me-2 text-${prioClass[s.prioridad] || 'secondary'}">
              <i class="bi bi-flag me-1"></i>${s.prioridad}
            </span>
            <span><i class="bi bi-calendar3 me-1"></i>${s.fecha_solicitud || '—'}</span>
          </div>
        </div>
        <span class="badge flex-shrink-0 ${estadoClass[s.estado] || 'bg-secondary-subtle text-secondary-emphasis'}">
          ${(s.estado || '').replace('_', ' ')}
        </span>
      </div>
    </div>
  `).join('')
}

// ─── Filters ──────────────────────────────────────────────────────────────────
function _applyFilters() {
  const buscar    = normalizeText(state.container.querySelector('#sol-buscar')?.value    || '')
  const estado    = state.container.querySelector('#sol-filtro-estado')?.value           || ''
  const prioridad = state.container.querySelector('#sol-filtro-prioridad')?.value        || ''
  const tipo      = state.container.querySelector('#sol-filtro-tipo')?.value             || ''

  state.filtered = state.all.filter(s => {
    if (buscar) {
      const text = normalizeText(`${s.titulo} ${s.maestro_nombre || ''} ${s.area || ''} ${s.descripcion}`)
      if (!text.includes(buscar)) return false
    }
    if (estado    && s.estado         !== estado)    return false
    if (prioridad && s.prioridad      !== prioridad) return false
    if (tipo      && s.tipo_necesidad !== tipo)       return false
    return true
  })

  _renderList()
}

// ─── Modal de detalle + gestión ───────────────────────────────────────────────
function _openSolicitudModal(id) {
  const s = state.all.find(x => x.id === id)
  if (!s) return

  const estadoOptions = ['pendiente', 'en_revision', 'aprobada', 'rechazada', 'resuelta']
    .map(v => `<option value="${v}" ${s.estado === v ? 'selected' : ''}>${v.replace('_', ' ')}</option>`)
    .join('')

  AppModal.open({
    title: 'Detalle de solicitud',
    size: 'lg',
    saveText: 'Guardar cambios',
    body: `
      <div class="small">
        <div class="row g-2 mb-3">
          <div class="col-md-8">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Título</div>
            <div class="fw-bold">${s.titulo}</div>
          </div>
          <div class="col-md-4">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Maestro</div>
            <div>${s.maestro_nombre || '—'}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Tipo</div>
            <div>${s.tipo_necesidad || '—'}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Categoría</div>
            <div>${s.categoria || '—'}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Área</div>
            <div>${s.area || '—'}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Cantidad</div>
            <div>${s.cantidad ?? '—'}</div>
          </div>
          <div class="col-12">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Descripción</div>
            <p class="mb-0" style="white-space:pre-line;">${s.descripcion}</p>
          </div>
          ${s.observaciones ? `
          <div class="col-12">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Observaciones</div>
            <p class="mb-0" style="white-space:pre-line;">${s.observaciones}</p>
          </div>` : ''}
        </div>
        <hr>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label fw-semibold small">Estado</label>
            <select class="form-select form-select-sm" id="modal-sol-estado">${estadoOptions}</select>
          </div>
          <div class="col-12">
            <label class="form-label fw-semibold small">Respuesta administrativa</label>
            <textarea class="form-control form-control-sm" id="modal-sol-respuesta" rows="3"
                      placeholder="Escribí la respuesta para el maestro...">${s.respuesta_admin || ''}</textarea>
          </div>
        </div>
      </div>
    `,
    onSave: async () => {
      const nuevoEstado = document.querySelector('#modal-sol-estado')?.value
      const respuesta   = document.querySelector('#modal-sol-respuesta')?.value?.trim() || null

      const { error } = await supabase
        .from('solicitudes_necesidades')
        .update({ estado: nuevoEstado, respuesta_admin: respuesta, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) { AppToast.error('Error al guardar los cambios'); return false }
      AppToast.success('Solicitud actualizada')
      await _loadSolicitudes()
      return true
    }
  })
}

// ─── Events ───────────────────────────────────────────────────────────────────
function _attachEvents() {
  const c = state.container
  c.querySelector('#sol-buscar')?.addEventListener('input', _applyFilters)
  c.querySelector('#sol-filtro-estado')?.addEventListener('change', _applyFilters)
  c.querySelector('#sol-filtro-prioridad')?.addEventListener('change', _applyFilters)
  c.querySelector('#sol-filtro-tipo')?.addEventListener('change', _applyFilters)
  c.querySelector('#sol-limpiar')?.addEventListener('click', () => {
    ;['#sol-buscar', '#sol-filtro-estado', '#sol-filtro-prioridad', '#sol-filtro-tipo']
      .forEach(sel => { const el = c.querySelector(sel); if (el) el.value = '' })
    state.filtered = [...state.all]
    _renderList()
  })
  c.addEventListener('click', (e) => {
    const row = e.target.closest('.solicitud-row[data-id]')
    if (row) _openSolicitudModal(row.dataset.id)
  })
}
