import * as PeriodosApi from '../api/periodosApi.js'
import { Toast } from 'bootstrap'
import { AppModal } from '../../../shared/components/AppModal.js'

export async function renderPeriodosView(container) {
  container.innerHTML = `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-0">Gestión de Períodos Académicos</h2>
          <p class="text-muted mb-0">Administra los ciclos de estudio y el período activo del sistema.</p>
        </div>
        <button id="btn-nuevo-periodo" class="btn btn-primary d-flex align-items-center gap-2">
          <i class="bi bi-plus-lg"></i> Nuevo Período
        </button>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">Nombre del Período</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Estado</th>
                  <th class="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody id="periodos-table-body">
                <tr><td colspan="5" class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="toast-container position-fixed bottom-0 end-0 p-3"></div>
  `

  const tableBody = document.getElementById('periodos-table-body')

  async function loadPeriodos() {
    try {
      const periodos = await PeriodosApi.getPeriodos()
      renderTable(periodos)
    } catch (error) {
      showToast(error.message, 'danger')
    }
  }

  function renderTable(periodos) {
    if (periodos.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-5 text-muted">No hay períodos registrados.</td></tr>'
      return
    }

    tableBody.innerHTML = periodos.map(p => {
      const start = new Date(p.fecha_inicio).toLocaleDateString()
      const end = new Date(p.fecha_fin).toLocaleDateString()
      
      return `
      <tr>
        <td class="ps-4">
          <span class="fw-bold text-body d-block">${p.nombre}</span>
          ${p.activo ? '<span class="badge bg-success-subtle text-success border border-success-subtle small" style="font-size: 0.7rem;">PERÍODO ACTUAL</span>' : ''}
        </td>
        <td class="text-muted">${start}</td>
        <td class="text-muted">${end}</td>
        <td>
          <span class="badge ${p.activo ? 'bg-success' : 'bg-body-tertiary text-muted border'} rounded-pill">
            ${p.activo ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td class="text-end pe-4">
          <div class="btn-group shadow-sm">
            ${!p.activo ? `
              <button class="btn btn-sm btn-outline-success px-3" data-action="activar" data-id="${p.id}">
                Activar
              </button>
            ` : ''}
            <button class="btn btn-sm btn-outline-secondary px-2" data-action="edit" data-id="${p.id}" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger px-2" data-action="delete" data-id="${p.id}" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `}).join('')
  }

  function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container')
    if (!container) return
    const toastId = 'toast-' + Date.now()
    container.innerHTML += `
      <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">${message}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `
    const toastEl = document.getElementById(toastId)
    if (toastEl) new Toast(toastEl).show()
  }

  document.getElementById('btn-nuevo-periodo').addEventListener('click', () => {
    openCreateModal()
  })

  tableBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]')
    if (!btn) return
    
    const id = btn.dataset.id
    const action = btn.dataset.action
    
    if (action === 'activar') {
      await activarPeriodo(id)
    } else if (action === 'edit') {
      await openEditModal(id)
    } else if (action === 'delete') {
      await openDeleteModal(id)
    }
  })

  async function openCreateModal() {
    AppModal.open({
      title: 'Crear Nuevo Período',
      body: `<form class="row g-3" id="form-periodo">
        <div class="col-12">
          <label class="form-label fw-semibold small">Nombre del Período *</label>
          <input type="text" class="form-control" id="modal-nombre" placeholder="Ej: Primer Semestre 2026" required>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold small">Fecha Inicio *</label>
          <input type="date" class="form-control" id="modal-fecha_inicio" required>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold small">Fecha Fin *</label>
          <input type="date" class="form-control" id="modal-fecha_fin" required>
        </div>
        <div class="col-12">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="modal-activo">
            <label class="form-check-label" for="modal-activo">Marcar como período activo</label>
          </div>
        </div>
      </form>`,
      saveText: 'Guardar Período',
      onSave: async (modalBody) => {
        const nombre = modalBody.querySelector('#modal-nombre').value.trim()
        const fecha_inicio = modalBody.querySelector('#modal-fecha_inicio').value
        const fecha_fin = modalBody.querySelector('#modal-fecha_fin').value
        const activo = modalBody.querySelector('#modal-activo').checked

        if (!nombre || !fecha_inicio || !fecha_fin) {
          showToast('Por favor complete todos los campos obligatorios', 'warning')
          return false
        }

        if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
          showToast('La fecha de fin debe ser posterior a la fecha de inicio', 'warning')
          return false
        }

        await PeriodosApi.crearPeriodo({ nombre, fecha_inicio, fecha_fin, activo })
        showToast('Período creado con éxito')
        await loadPeriodos()
      }
    })
  }

  async function openEditModal(id) {
    const periodos = await PeriodosApi.getPeriodos()
    const periodo = periodos.find(p => p.id === id)
    if (!periodo) {
      showToast('Período no encontrado', 'danger')
      return
    }

    AppModal.open({
      title: 'Editar Período',
      body: `<form class="row g-3" id="form-periodo">
        <div class="col-12">
          <label class="form-label fw-semibold small">Nombre del Período *</label>
          <input type="text" class="form-control" id="modal-nombre" value="${periodo.nombre}" required>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold small">Fecha Inicio *</label>
          <input type="date" class="form-control" id="modal-fecha_inicio" value="${periodo.fecha_inicio}" required>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold small">Fecha Fin *</label>
          <input type="date" class="form-control" id="modal-fecha_fin" value="${periodo.fecha_fin}" required>
        </div>
        <div class="col-12">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="modal-activo" ${periodo.activo ? 'checked' : ''}>
            <label class="form-check-label" for="modal-activo">Marcar como período activo</label>
          </div>
        </div>
      </form>`,
      saveText: 'Guardar Cambios',
      onSave: async (modalBody) => {
        const nombre = modalBody.querySelector('#modal-nombre').value.trim()
        const fecha_inicio = modalBody.querySelector('#modal-fecha_inicio').value
        const fecha_fin = modalBody.querySelector('#modal-fecha_fin').value
        const activo = modalBody.querySelector('#modal-activo').checked

        if (!nombre || !fecha_inicio || !fecha_fin) {
          showToast('Por favor complete todos los campos obligatorios', 'warning')
          return false
        }

        if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
          showToast('La fecha de fin debe ser posterior a la fecha de inicio', 'warning')
          return false
        }

        await PeriodosApi.actualizarPeriodo(id, { nombre, fecha_inicio, fecha_fin, activo })
        showToast('Período actualizado con éxito')
        await loadPeriodos()
      }
    })
  }

  async function openDeleteModal(id) {
    const periodos = await PeriodosApi.getPeriodos()
    const periodo = periodos.find(p => p.id === id)
    if (!periodo) {
      showToast('Período no encontrado', 'danger')
      return
    }

    AppModal.open({
      title: '⚠️ Eliminar Período',
      size: 'sm',
      saveText: 'Eliminar',
      body: `<p>¿Estás seguro de que deseas eliminar el período <strong>${periodo.nombre}</strong>?</p>
             <p class="text-muted small mb-0">Esta acción no se puede deshacer.</p>`,
      onSave: async () => {
        await PeriodosApi.eliminarPeriodo(id)
        showToast('Período eliminado con éxito')
        await loadPeriodos()
      }
    })
  }

  async function activarPeriodo(id) {
    if (confirm('¿Estás seguro de que quieres activar este período? Se desactivarán los demás.')) {
      try {
        await PeriodosApi.activarPeriodo(id)
        showToast('Período activado con éxito')
        await loadPeriodos()
      } catch (error) {
        showToast(error.message, 'danger')
      }
    }
  }

  loadPeriodos()
}