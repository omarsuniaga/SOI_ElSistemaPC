import { getAlertasActivas, getResumenAlertas } from '../api/metricsApi.js'
import { createAlertaRow, createAlertaBadge } from '../components/alertaBadge.js'

const TIPOS_ALERTA = [
  { value: '', label: 'Todos los tipos' },
  { value: 'ausencias_consecutivas', label: 'Ausencias Consecutivas' },
  { value: 'obs_alta_sin_seguimiento', label: 'Obs. Alta Sin Seguimiento' },
  { value: 'caida_calificacion', label: 'Caída de Calificación' },
  { value: 'sin_evaluacion', label: 'Sin Evaluación' },
  { value: 'obs_media_sin_seguimiento', label: 'Obs. Media Sin Seguimiento' },
]

let currentFilter = { color: null, tipo: null }
let alertasData = []
let resumenData = null
let refreshInterval = null
let currentContainer = null

function dispatchNavigateEvent(alumnoId) {
  window.dispatchEvent(new CustomEvent('navigate:alumno', { detail: { alumnoId } }))
}

function getFilteredAlertas() {
  let filtered = alertasData
  if (currentFilter.color) {
    filtered = filtered.filter(a => a.color === currentFilter.color)
  }
  if (currentFilter.tipo) {
    filtered = filtered.filter(a => a.tipo_alerta === currentFilter.tipo)
  }
  return filtered
}

function renderHeader(resumen) {
  return `
    <div class="d-flex flex-wrap gap-3 mb-4">
      <div class="d-flex align-items-center gap-2">
        <span class="text-muted">Total:</span>
        <span class="badge bg-secondary fs-6">${resumen.total}</span>
      </div>
      <div class="d-flex align-items-center gap-2">
        ${createAlertaBadge('rojo')}
        <span class="fw-bold">${resumen.rojas}</span>
      </div>
      <div class="d-flex align-items-center gap-2">
        ${createAlertaBadge('naranja')}
        <span class="fw-bold">${resumen.naranjas}</span>
      </div>
      <div class="d-flex align-items-center gap-2">
        ${createAlertaBadge('amarillo')}
        <span class="fw-bold">${resumen.amarillas}</span>
      </div>
    </div>
  `
}

function renderFilters() {
  const tiposOptions = TIPOS_ALERTA.map(t => 
    `<option value="${t.value}" ${currentFilter.tipo === t.value ? 'selected' : ''}>${t.label}</option>`
  ).join('')

  const btnClass = (color) => 
    `btn btn-sm ${color === '' ? 'btn-primary' : color === 'rojo' ? 'btn-danger' : color === 'naranja' ? 'btn-warning' : 'btn-info'} btn-filter ${currentFilter.color === color || (color === '' && currentFilter.color === null) ? 'active' : ''}`

  return `
    <div class="d-flex flex-wrap gap-3 mb-3 align-items-center">
      <div class="btn-group btn-group-sm" role="group">
        <button type="button" class="${btnClass('')}" data-color="">Todas</button>
        <button type="button" class="${btnClass('rojo')}" data-color="rojo">Rojas</button>
        <button type="button" class="${btnClass('naranja')}" data-color="naranja">Naranjas</button>
        <button type="button" class="${btnClass('amarillo')}" data-color="amarillo">Amarillas</button>
      </div>
      <select class="form-select form-select-sm w-auto" id="filtro-tipo" style="max-width: 220px;">
        ${tiposOptions}
      </select>
      <span class="text-muted small ms-auto">
        <i class="bi bi-clock"></i> Actualiza en 5 min
      </span>
    </div>
  `
}

function renderTable(alertas) {
  if (alertas.length === 0) {
    return `
      <div class="text-center py-5">
        <div class="display-1 mb-3">🎉</div>
        <h4 class="text-muted">¡No hay alertas!</h4>
        <p class="text-muted">Todo está bajo control. Sigue así.</p>
      </div>
    `
  }

  const rows = alertas.map(a => createAlertaRow(a)).join('')

  return `
    <div class="table-responsive">
      <table class="table table-hover align-middle table-sm">
        <thead class="table-light">
          <tr>
            <th>Tipo</th>
            <th>Alumno</th>
            <th>Instrumento</th>
            <th>Maestro</th>
            <th>Descripción</th>
            <th>Días/Valor</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `
}

function renderLoading() {
  return `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2 text-muted">Cargando alertas...</p>
    </div>
  `
}

function renderError(msg) {
  return `
    <div class="alert alert-danger m-3" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      <strong>Error:</strong> ${msg}
      <button class="btn btn-sm btn-outline-danger ms-3" onclick="location.reload()">Reintentar</button>
    </div>
  `
}

function renderContent() {
  const filtered = getFilteredAlertas()
  return renderHeader(resumenData) + renderFilters() + renderTable(filtered)
}

async function loadAlertas(container, showLoading = true) {
  if (showLoading) container.innerHTML = renderLoading()

  try {
    const [alertas, resumen] = await Promise.all([
      getAlertasActivas({}),
      getResumenAlertas(),
    ])

    alertasData = alertas
    resumenData = resumen

    container.innerHTML = renderContent()
    attachEventHandlers(container)
  } catch (err) {
    container.innerHTML = renderError(err.message)
  }
}

function attachEventHandlers(container) {
  container.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter.color = btn.dataset.color || null
      container.innerHTML = renderContent()
      attachEventHandlers(container)
    })
  })

  container.querySelector('#filtro-tipo')?.addEventListener('change', (e) => {
    currentFilter.tipo = e.target.value || null
    container.innerHTML = renderContent()
    attachEventHandlers(container)
  })

  container.querySelectorAll('.alerta-row').forEach(row => {
    row.addEventListener('click', () => {
      const alumnoId = row.dataset.alumnoId
      if (alumnoId) {
        dispatchNavigateEvent(alumnoId)
      }
    })
  })
}

export async function renderAlertasView(container) {
  if (typeof container === 'string') {
    container = document.querySelector(container)
  }

  currentContainer = container
  
  if (refreshInterval) clearInterval(refreshInterval)

  await loadAlertas(container)

  refreshInterval = setInterval(() => {
    if (currentContainer && document.body.contains(currentContainer)) {
      loadAlertas(currentContainer, false)
    } else {
      clearInterval(refreshInterval)
    }
  }, 5 * 60 * 1000)
}

export function destroyAlertasView() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
  currentFilter = { color: null, tipo: null }
  alertasData = []
  resumenData = null
}