/**
 * solicitudesView.js — Solicitudes de compra de insumos.
 *
 * Lista de solicitudes con estado, items y costo total estimado.
 * Desde aquí se pueden crear nuevas solicitudes (modal).
 */

import '../styles/luteria.css'
import * as api from '../api/luteriaTallerApi.js'

const state = { solicitudes: [], filtroEstado: 'todas', busqueda: '' }
let _abort = null

const ESTADOS_SOL = [
  { value: 'todas', label: 'Todas' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'pendiente_aprobacion', label: 'Pendiente Aprob.' },
  { value: 'aprobada', label: 'Aprobada' },
  { value: 'en_compra', label: 'En Compra' },
  { value: 'recibida_parcial', label: 'Recibida Parcial' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
]

const ESTADO_BADGE = {
  borrador: 'secondary', pendiente_aprobacion: 'warning', aprobada: 'info',
  en_compra: 'primary', recibida_parcial: 'primary', completada: 'success', cancelada: 'dark',
}

function escapeHTML(str) {
  if (!str) return ''
  const d = document.createElement('div')
  d.textContent = str
  return d.innerHTML
}

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })
}

export async function renderSolicitudesView(container) {
  _abort?.abort()
  _abort = new AbortController()

  container.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`

  try {
    state.solicitudes = await api.getSolicitudesCompra()
    renderContent(container)
  } catch (err) {
    console.error('[LutSolicitudes] Error:', err)
    container.innerHTML = `<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar solicitudes</h5>
      <p>${escapeHTML(err.message)}</p></div></div>`
  }

  return { teardown: () => _abort?.abort() }
}

function renderContent(container) {
  let filtradas = state.solicitudes
  if (state.filtroEstado !== 'todas') {
    filtradas = filtradas.filter((s) => s.estado === state.filtroEstado)
  }
  if (state.busqueda.trim()) {
    const q = state.busqueda.trim().toLowerCase()
    filtradas = filtradas.filter((s) => {
      const items = s.items || (s.insumo_id ? [s] : [])
      return s.id?.toLowerCase().includes(q) ||
        s.solicitante_nombre?.toLowerCase().includes(q) ||
        items.some((it) => it.insumo_nombre?.toLowerCase().includes(q) || it.insumo_id?.toLowerCase().includes(q))
    })
  }

  container.innerHTML = `
    <div class="page-container luteria-portal">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(249,115,22,0.1);color:#ea580c">
          <i class="bi bi-cart-check fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Solicitudes de Compra</h1>
          <p class="text-muted small mb-0">${state.solicitudes.length} solicitudes</p>
        </div>
      </div>

      <div class="d-flex gap-2 flex-wrap mb-3 align-items-center">
        <input type="text" class="form-control form-control-sm" style="max-width:240px" id="lut-sol-search"
          placeholder="Buscar por ID, insumo..." value="${escapeHTML(state.busqueda)}">
        <select class="form-select form-select-sm" id="lut-sol-estado" style="width:auto">
          ${ESTADOS_SOL.map((e) => `<option value="${e.value}" ${state.filtroEstado === e.value ? 'selected' : ''}>${e.label}</option>`).join('')}
        </select>
        <span class="text-muted small ms-auto">${filtradas.length} resultado${filtradas.length !== 1 ? 's' : ''}</span>
      </div>

      ${filtradas.length === 0
        ? '<div class="text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No hay solicitudes</div>'
        : `<div class="table-responsive">
             <table class="table table-hover align-middle mb-0 small">
               <thead class="text-muted small">
                 <tr>
                   <th>ID</th>
                   <th>Solicitante</th>
                   <th>Insumo</th>
                   <th class="text-end">Cant.</th>
                   <th class="text-end">Costo Est.</th>
                   <th>Estado</th>
                   <th>Creada</th>
                 </tr>
               </thead>
               <tbody>
                 ${filtradas.map((s) => {
                   const insumo = escapeHTML(s.insumo_nombre || s.insumo_id || '—')
                   return `<tr>
                     <td class="text-muted" style="font-size:0.65rem">${escapeHTML(s.id)}</td>
                     <td>${escapeHTML(s.solicitante_nombre || s.solicitado_por || '—')}</td>
                     <td class="fw-semibold">${insumo}</td>
                     <td class="text-end">${s.cantidad_solicitada ?? '—'}</td>
                     <td class="fw-semibold text-end">${s.costo_estimado ? 'RD$' + Number(s.costo_estimado).toFixed(2) : '—'}</td>
                     <td>${estadoBadge(s.estado)}</td>
                     <td class="text-muted">${formatFecha(s.created_at)}</td>
                   </tr>`
                 }).join('')}
               </tbody>
             </table>
           </div>`
      }
    </div>
  `

  const searchEl = container.querySelector('#lut-sol-search')
  let debounceTimer
  searchEl?.addEventListener('input', () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => { state.busqueda = searchEl.value; renderContent(container) }, 250)
  })
  container.querySelector('#lut-sol-estado')?.addEventListener('change', (e) => {
    state.filtroEstado = e.target.value; renderContent(container)
  })
}

function estadoBadge(e) {
  const c = ESTADO_BADGE[e] || 'secondary'
  const l = ESTADOS_SOL.find((x) => x.value === e)?.label || e
  return `<span class="badge bg-${c}-subtle text-${c} rounded-pill lut-estado-badge">${l}</span>`
}
