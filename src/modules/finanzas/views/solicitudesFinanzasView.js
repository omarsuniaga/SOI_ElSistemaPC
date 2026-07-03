import { AppToast } from '../../../shared/components/AppToast.js'
import { listarPorDepartamento, cargarPresupuesto, resolver } from '../../../portal-maestros/api/solicitudesNecesidadesApi.js'

const state = { all: [], container: null }

export async function renderSolicitudesFinanzasView(container) {
  if (!container) return
  state.container = container
  container.innerHTML = '<div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;"><div class="spinner-border text-primary"></div></div>'
  await _load()
}

async function _load() {
  try {
    state.all = await listarPorDepartamento('FIN', ['en_presupuesto', 'presupuestada'])
    _render()
  } catch (err) {
    state.container.innerHTML = `<div class="page-container"><div class="alert alert-warning">Error al cargar solicitudes FIN: ${err.message}</div></div>`
  }
}

function _render() {
  state.container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-cash-coin fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Solicitudes FIN</h1>
          <p class="text-muted small mb-0">Presupuestos por resolver</p>
        </div>
      </div>
      <div id="fin-solicitudes-list"></div>
    </div>`
  const list = state.container.querySelector('#fin-solicitudes-list')
  if (!state.all.length) { list.innerHTML = '<div class="text-center py-5 text-muted"><p>No hay solicitudes en presupuesto.</p></div>'; return }
  list.innerHTML = state.all.map(s => `
    <div class="list-group-item p-3 mb-2 border rounded">
      <div class="d-flex justify-content-between gap-2">
        <div>
          <div class="fw-semibold">${s.titulo}</div>
          <div class="small text-muted">${s.maestro_nombre || '?'} ? ${s.estado}</div>
          <div class="small text-muted">Presupuesto: ${s.presupuesto ?? '?'} | Costo: ${s.costo_estimado ?? '?'}</div>
        </div>
        <div class="d-flex gap-2 flex-wrap justify-content-end">
          <button class="btn btn-sm btn-outline-success" data-action="presupuestar" data-id="${s.id}">Marcar presupuestada</button>
          <button class="btn btn-sm btn-outline-primary" data-action="aprobar" data-id="${s.id}">Aprobar</button>
          <button class="btn btn-sm btn-outline-danger" data-action="rechazar" data-id="${s.id}">Rechazar</button>
          <button class="btn btn-sm btn-outline-secondary" data-action="comprada" data-id="${s.id}">Comprada</button>
          <button class="btn btn-sm btn-outline-dark" data-action="entregada" data-id="${s.id}">Entregada</button>
        </div>
      </div>
    </div>`).join('')
  list.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', async () => {
    const id = btn.dataset.id
    try {
      if (btn.dataset.action === 'presupuestar') {
        const presupuesto = prompt('Presupuesto')
        const costo = prompt('Costo estimado', presupuesto || '')
        await cargarPresupuesto(id, null, Number(presupuesto || 0), costo ? Number(costo) : null, 'Presupuesto cargado')
      } else {
        await resolver(id, btn.dataset.action, null, `Estado FIN: ${btn.dataset.action}`)
      }
      AppToast.success('Solicitud actualizada')
      await _load()
    } catch (err) {
      AppToast.error(err.message || 'No se pudo actualizar')
    }
  }))
}
