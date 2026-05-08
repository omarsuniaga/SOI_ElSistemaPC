import { AppModal } from '../../../shared/components/AppModal.js'
import { useAuth } from '../../auth/hooks/useAuth.js'

const mockJustificaciones = [
  { id: 'just_001', alumno: 'Mateo García', clase: 'Violín Beginners', fecha: '2026-05-03', motivo: 'Enfermedad', documento: true, estado: 'pendiente' },
  { id: 'just_002', alumno: 'Sofia López', clase: 'Guitarra Intermediate', fecha: '2026-05-02', motivo: 'Cita médica', documento: true, estado: 'pendiente' },
  { id: 'just_003', alumno: 'Lucas Martínez', clase: 'Piano Advanced', fecha: '2026-04-30', motivo: 'Competencia deportiva', documento: false, estado: 'rechazado' },
  { id: 'just_004', alumno: 'Valentina Rodríguez', clase: 'Canto Beginners', fecha: '2026-05-01', motivo: 'Problema familiar', documento: true, estado: 'aprobado' },
]

const state = {
  justificaciones: [...mockJustificaciones],
  filtro: 'pendiente',
}

export function renderJustificacionesPanel(container) {
  state.filtro = 'pendiente'
  _render(container)
  _bindEvents(container)
}

function _render(container) {
  const filtradas = state.justificaciones.filter(j => state.filtro === 'todos' || j.estado === state.filtro)

  container.innerHTML = `
    <div class="justificaciones-panel">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 class="mb-0 fw-semibold"><i class="bi bi-file-earmark-check me-2"></i>Justificaciones</h5>
        <div class="btn-group btn-group-sm">
          <button class="btn ${state.filtro === 'pendiente' ? 'btn-primary' : 'btn-outline-primary'}" data-filter="pendiente">Pendientes</button>
          <button class="btn ${state.filtro === 'aprobado' ? 'btn-success' : 'btn-outline-success'}" data-filter="aprobado">Aprobadas</button>
          <button class="btn ${state.filtro === 'rechazado' ? 'btn-danger' : 'btn-outline-danger'}" data-filter="rechazado">Rechazadas</button>
        </div>
      </div>

      <div class="d-flex gap-2 mb-3">
        <div class="input-group input-group-sm" style="max-width: 300px;">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input type="text" class="form-control" placeholder="Buscar alumno..." id="searchJustif">
        </div>
      </div>

      <div class="d-flex flex-column gap-2" id="justificacionesList">
        ${filtradas.length ? filtradas.map(j => _renderJustificacionItem(j)).join('') : _renderEmpty()}
      </div>

      <div class="mt-3 text-muted small">
        <i class="bi bi-info-circle me-1"></i>
        Mostrando ${filtradas.length} de ${state.justificaciones.length} justificaciones
      </div>
    </div>
  `
}

function _renderJustificacionItem(j) {
  const estadoColor = { pendiente: 'warning', aprobado: 'success', rechazado: 'danger' }[j.estado]
  const estadoIcon = { pendiente: 'bi-clock', aprobado: 'bi-check-circle', rechazado: 'bi-x-circle' }[j.estado]

  return `
    <div class="card border-0 shadow-sm" data-id="${j.id}">
      <div class="card-body py-2 px-3">
        <div class="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-sm bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
              ${j.alumno.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div class="fw-semibold" style="font-size: 0.9rem;">${j.alumno}</div>
              <div class="text-muted small">${j.clase} • ${_formatFecha(j.fecha)}</div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <div class="text-end">
              <div class="small">${j.motivo}</div>
              ${j.documento ? '<span class="badge bg-info-subtle text-info-emphasis" style="font-size: 0.7rem;"><i class="bi bi-paperclip"></i> Doc</span>' : '<span class="badge bg-secondary-subtle" style="font-size: 0.7rem;">Sin doc</span>'}
            </div>
            ${j.estado === 'pendiente' ? `
              <button class="btn btn-sm btn-success btn-aprobar" title="Aprobar"><i class="bi bi-check-lg"></i></button>
              <button class="btn btn-sm btn-danger btn-rechazar" title="Rechazar"><i class="bi bi-x-lg"></i></button>
            ` : `
              <span class="badge bg-${estadoColor}"><i class="bi ${estadoIcon}"></i> ${j.estado}</span>
            `}
          </div>
        </div>
      </div>
    </div>
  `
}

function _renderEmpty() {
  return `
    <div class="text-center py-4 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      No hay justificaciones con este filtro
    </div>
  `
}

function _bindEvents(container) {
  container.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.filtro = btn.dataset.filter
      _render(container)
    })
  })

  container.querySelector('.btn-aprobar')?.forEach(btn => {
    btn.addEventListener('click', () => _aprobar(container, btn.closest('[data-id]').dataset.id))
  })

  container.querySelector('.btn-rechazar')?.forEach(btn => {
    btn.addEventListener('click', () => _rechazar(container, btn.closest('[data-id]').dataset.id))
  })

  container.querySelector('#searchJustif')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase()
    const items = container.querySelectorAll('[data-id]')
    items.forEach(item => {
      const text = item.textContent.toLowerCase()
      item.style.display = text.includes(term) ? '' : 'none'
    })
  })
}

async function _aprobar(container, id) {
  const idx = state.justificaciones.findIndex(j => j.id === id)
  if (idx !== -1) {
    state.justificaciones[idx].estado = 'aprobado'
    _render(container)
    _showToast('Justificación aprobada', 'success')
  }
}

async function _rechazar(container, id) {
  AppModal.open({
    title: 'Rechazar Justificación',
    size: 'sm',
    saveText: 'Rechazar',
    body: `
      <div class="mb-3">
        <label class="form-label">Motivo del rechazo:</label>
        <textarea class="form-control" id="motivoRechazo" rows="3" placeholder="Especifique el motivo..."></textarea>
      </div>
    `,
    onSave: () => {
      const idx = state.justificaciones.findIndex(j => j.id === id)
      if (idx !== -1) {
        state.justificaciones[idx].estado = 'rechazado'
        _render(container)
        _showToast('Justificación rechazada', 'danger')
      }
    },
  })
}

function _formatFecha(iso) {
  if (!iso) return '—'
  const fecha = new Date(iso)
  return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

function _showToast(message, type) {
  const toast = document.createElement('div')
  toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'danger' ? 'danger' : 'primary'} border-0`
  toast.setAttribute('role', 'alert')
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `
  document.querySelector('.toast-container')?.appendChild(toast)
  setTimeout(() => toast.remove(), 3000)
}