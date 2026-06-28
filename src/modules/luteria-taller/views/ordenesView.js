/**
 * ordenesView.js — Lista de Órdenes de Reparación del Portal de Lutería.
 *
 * Timeline con filtros por estado, prioridad y búsqueda.
 * Navega al detalle al hacer click en una orden.
 *
 * Patrón: retorna { teardown() }.
 */

import '../styles/luteria.css'
import * as api from '../api/luteriaTallerApi.js'

const ESTADOS = [
  'todos', 'reportado', 'recibido', 'pendiente_diagnostico', 'diagnosticado',
  'presupuesto_pendiente', 'esperando_aprobacion', 'esperando_insumos',
  'en_reparacion', 'en_prueba', 'listo_entrega', 'entregado', 'cerrado', 'cancelado',
]
const ESTADO_LABEL = {
  todos: 'Todos los estados', reportado: 'Reportado', recibido: 'Recibido',
  pendiente_diagnostico: 'Pte. Diagnóstico', diagnosticado: 'Diagnosticado',
  presupuesto_pendiente: 'Presupuesto Pte.', esperando_aprobacion: 'Esperando Aprob.',
  esperando_insumos: 'Esperando Insumos', en_reparacion: 'En Reparación',
  en_prueba: 'En Prueba', listo_entrega: 'Listo Entrega', entregado: 'Entregado',
  cerrado: 'Cerrado', cancelado: 'Cancelado',
}
const PRIORIDADES = ['todos', 'baja', 'media', 'alta', 'critica']

const state = { ordenes: [], filtroEstado: 'todos', filtroPrioridad: 'todos', busqueda: '', mostrarFormulario: false }
let _abort = null

function escapeHTML(str) {
  if (!str) return ''
  const d = document.createElement('div')
  d.textContent = str
  return d.innerHTML
}

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-DO', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export async function renderOrdenesView(container) {
  _abort?.abort()
  _abort = new AbortController()

  container.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`

  try {
    state.ordenes = await api.getOrdenes()
    renderContent(container)
  } catch (err) {
    console.error('[LutOrdenes] Error:', err)
    container.innerHTML = `<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar órdenes</h5>
      <p>${escapeHTML(err.message)}</p></div></div>`
  }

  return { teardown: () => _abort?.abort() }
}

function renderContent(container) {
  let filtradas = state.ordenes
  if (state.filtroEstado !== 'todos') {
    filtradas = filtradas.filter((o) => o.estado === state.filtroEstado)
  }
  if (state.filtroPrioridad !== 'todos') {
    filtradas = filtradas.filter((o) => o.prioridad === state.filtroPrioridad)
  }
  if (state.busqueda.trim()) {
    const q = state.busqueda.trim().toLowerCase()
    filtradas = filtradas.filter((o) =>
      o.instrumento_id?.toLowerCase().includes(q) ||
      o.alumno_nombre?.toLowerCase().includes(q) ||
      o.descripcion_inicial?.toLowerCase().includes(q)
    )
  }

  container.innerHTML = `
    <div class="page-container luteria-portal">
      <div class="d-flex align-items-center gap-3 mb-3 flex-wrap">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(124,58,237,0.1);color:#7c3aed">
          <i class="bi bi-clipboard-check fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Órdenes de Reparación</h1>
          <p class="text-muted small mb-0">${state.ordenes.length} órdenes · ${filtradas.length} filtradas</p>
        </div>
        <div class="ms-auto">
          <button class="btn btn-sm btn-outline-primary" id="lut-nueva-orden">
            <i class="bi bi-plus-lg me-1"></i>Nueva Orden
          </button>
        </div>
      </div>

      ${state.mostrarFormulario ? `
      <div class="card border-primary mb-3" style="max-width:640px">
        <div class="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center py-2">
          <span class="fw-semibold small"><i class="bi bi-pencil-square me-1"></i>Nueva orden de reparación</span>
          <button class="btn-close btn-close-sm" id="lut-cancelar-form" aria-label="Cerrar"></button>
        </div>
        <div class="card-body">
          <form id="lut-orden-form">
            <div class="mb-2">
              <label class="form-label small mb-1">Instrumento <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm" id="lut-form-instrumento" required
                placeholder="Ej: Violín 4/4 — Yamaha C40">
            </div>
            <div class="mb-2">
              <label class="form-label small mb-1">Alumno</label>
              <input type="text" class="form-control form-control-sm" id="lut-form-alumno"
                placeholder="Nombre del alumno (opcional)">
            </div>
            <div class="mb-2">
              <label class="form-label small mb-1">Descripción del problema</label>
              <textarea class="form-control form-control-sm" id="lut-form-descripcion" rows="2"
                placeholder="Describe el problema reportado..."></textarea>
            </div>
            <div class="mb-2">
              <label class="form-label small mb-1">Prioridad</label>
              <select class="form-select form-select-sm" id="lut-form-prioridad" style="width:auto">
                <option value="baja">Baja</option>
                <option value="media" selected>Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
            <div class="d-flex gap-2 mt-3">
              <button type="submit" class="btn btn-primary btn-sm">
                <i class="bi bi-check-lg me-1"></i>Crear orden
              </button>
              <button type="button" class="btn btn-outline-secondary btn-sm" id="lut-cancelar-form-btn">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
      ` : ''}

      <!-- Filtros -->
      <div class="filtros-bar mb-3">
        <input type="text" class="form-control form-control-sm lut-search-input" id="lut-orden-search"
          placeholder="Buscar por ID, alumno, descripción..." value="${escapeHTML(state.busqueda)}"
          style="max-width:280px">
        <select class="form-select form-select-sm" id="lut-filtro-estado" style="width:auto">
          ${ESTADOS.map((e) => `<option value="${e}" ${state.filtroEstado === e ? 'selected' : ''}>${ESTADO_LABEL[e]}</option>`).join('')}
        </select>
        <select class="form-select form-select-sm" id="lut-filtro-prioridad" style="width:auto">
          ${PRIORIDADES.map((p) => `<option value="${p}" ${state.filtroPrioridad === p ? 'selected' : ''}>${p === 'todos' ? 'Todas prioridades' : p}</option>`).join('')}
        </select>
        <span class="text-muted small ms-auto">${filtradas.length} resultado${filtradas.length !== 1 ? 's' : ''}</span>
      </div>

      <!-- Tabla -->
      ${filtradas.length === 0
        ? '<div class="text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No hay órdenes con estos filtros</div>'
        : `<div class="table-responsive">
             <table class="table table-hover align-middle mb-0 small">
               <thead class="text-muted small">
                 <tr>
                   <th>ID</th>
                   <th>Instrumento</th>
                   <th>Alumno</th>
                   <th>Estado</th>
                   <th>Prioridad</th>
                   <th>Recibido</th>
                   <th>Costo Est.</th>
                   <th></th>
                 </tr>
               </thead>
               <tbody>
                 ${filtradas.map((o) => `
                   <tr class="orden-row" data-id="${o.id}">
                     <td class="text-muted" style="font-size:0.65rem">${escapeHTML(o.id)}</td>
                     <td class="fw-semibold">${escapeHTML(o.instrumento_id)}</td>
                     <td class="text-muted">${escapeHTML(o.alumno_nombre || '—')}</td>
                     <td>${estadoBadge(o)}</td>
                     <td>${prioridadBadge(o.prioridad)}</td>
                     <td class="text-muted" style="font-size:0.7rem">${formatFecha(o.fecha_recepcion)}</td>
                     <td class="fw-semibold">${o.costo_estimado ? 'RD$' + Number(o.costo_estimado).toFixed(2) : '—'}</td>
                     <td class="text-end">
                       <button class="btn btn-sm btn-outline-secondary" data-nav-orden="${o.id}">
                         <i class="bi bi-arrow-right"></i>
                       </button>
                     </td>
                   </tr>`).join('')}
               </tbody>
             </table>
           </div>`
      }
    </div>
  `

  // Wire filters
  const searchInput = container.querySelector('#lut-orden-search')
  let debounceTimer
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      state.busqueda = searchInput.value
      renderContent(container)
    }, 250)
  })
  container.querySelector('#lut-filtro-estado')?.addEventListener('change', (e) => {
    state.filtroEstado = e.target.value; renderContent(container)
  })
  container.querySelector('#lut-filtro-prioridad')?.addEventListener('change', (e) => {
    state.filtroPrioridad = e.target.value; renderContent(container)
  })

  // Wire navigation
  container.querySelectorAll('[data-nav-orden]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      window.router.navigate('lut-orden', { id: btn.dataset.navOrden })
    })
  })
  container.querySelectorAll('.orden-row').forEach((row) => {
    row.addEventListener('click', () => {
      window.router.navigate('lut-orden', { id: row.dataset.id })
    })
  })

  // Nueva orden — toggle form
  container.querySelector('#lut-nueva-orden')?.addEventListener('click', () => {
    state.mostrarFormulario = true
    renderContent(container)
  })

  // Cancelar form
  const cancelar = () => {
    state.mostrarFormulario = false
    renderContent(container)
  }
  container.querySelector('#lut-cancelar-form')?.addEventListener('click', cancelar)
  container.querySelector('#lut-cancelar-form-btn')?.addEventListener('click', cancelar)

  // Submit form
  container.querySelector('#lut-orden-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector('button[type="submit"]')
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Creando...'
    try {
      await api.createOrden({
        instrumento_id: form.querySelector('#lut-form-instrumento').value.trim(),
        alumno_nombre: form.querySelector('#lut-form-alumno').value.trim() || null,
        descripcion_inicial: form.querySelector('#lut-form-descripcion').value.trim() || '',
        prioridad: form.querySelector('#lut-form-prioridad').value,
      })
      state.mostrarFormulario = false
      state.ordenes = await api.getOrdenes()
      renderContent(container)
    } catch (err) {
      console.error('[LutOrdenes] Error al crear orden:', err)
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Crear orden'
      alert('Error al crear la orden: ' + err.message)
    }
  })
}

function estadoBadge(o) {
  const map = {
    reportado: ['danger', 'Reportado'], recibido: ['warning', 'Recibido'],
    pendiente_diagnostico: ['warning', 'Pte. Diag.'], diagnosticado: ['info', 'Diagnosticado'],
    presupuesto_pendiente: ['secondary', 'Presup. Pte.'], esperando_aprobacion: ['secondary', 'Esp. Aprob.'],
    esperando_insumos: ['dark', 'Esp. Insumos'], en_reparacion: ['primary', 'En Reparación'],
    en_prueba: ['info', 'En Prueba'], listo_entrega: ['success', 'Listo Entrega'],
    entregado: ['success', 'Entregado'], cerrado: ['secondary', 'Cerrado'], cancelado: ['dark', 'Cancelado'],
  }
  const [c, l] = map[o.estado] || ['secondary', o.estado]
  return `<span class="badge bg-${c}-subtle text-${c} rounded-pill lut-estado-badge">${l}</span>`
}

function prioridadBadge(p) {
  const map = { baja: 'success', media: 'primary', alta: 'warning', critica: 'danger' }
  return `<span class="badge bg-${map[p] || 'secondary'}-subtle text-${map[p] || 'secondary'} rounded-pill lut-estado-badge">${p}</span>`
}
