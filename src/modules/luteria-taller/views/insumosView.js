/**
 * insumosView.js — Catálogo de insumos/repuestos con stock.
 *
 * Grilla/tabla con categorías, stock mínimo, precios.
 * Último movimiento visible para cada insumo.
 */

import '../styles/luteria.css'
import * as api from '../api/luteriaTallerApi.js'

const state = { insumos: [], busqueda: '', categoria: 'todas' }
let _abort = null

const CATEGORIAS = [
  { value: 'todas', label: 'Todas' },
  { value: 'cuerdas', label: 'Cuerdas' },
  { value: 'clavijas', label: 'Clavijas' },
  { value: 'puentes', label: 'Puentes' },
  { value: 'almas', label: 'Almas' },
  { value: 'crin', label: 'Crin' },
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'pastillas', label: 'Pastillas' },
  { value: 'electronica', label: 'Electrónica' },
  { value: 'herramientas', label: 'Herramientas' },
  { value: 'otros', label: 'Otros' },
]

function escapeHTML(str) {
  if (!str) return ''
  const d = document.createElement('div')
  d.textContent = str
  return d.innerHTML
}

export async function renderInsumosView(container) {
  _abort?.abort()
  _abort = new AbortController()

  container.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`

  try {
    state.insumos = await api.getInsumos()
    renderContent(container)
  } catch (err) {
    console.error('[LutInsumos] Error:', err)
    container.innerHTML = `<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar insumos</h5>
      <p>${escapeHTML(err.message)}</p></div></div>`
  }

  return { teardown: () => _abort?.abort() }
}

function renderContent(container) {
  let filtrados = state.insumos
  if (state.categoria !== 'todas') {
    filtrados = filtrados.filter((i) => i.categoria === state.categoria)
  }
  if (state.busqueda.trim()) {
    const q = state.busqueda.trim().toLowerCase()
    filtrados = filtrados.filter((i) =>
      i.nombre?.toLowerCase().includes(q) ||
      i.descripcion?.toLowerCase().includes(q) ||
      i.codigo?.toLowerCase().includes(q) ||
      i.proveedor?.toLowerCase().includes(q)
    )
  }

  const bajoStock = state.insumos.filter((i) => i.stock_actual <= (i.stock_minimo || 0)).length
  const totalValor = filtrados.reduce((s, i) => s + (i.stock_actual || 0) * (i.costo_unitario || 0), 0)

  container.innerHTML = `
    <div class="page-container luteria-portal">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(34,197,94,0.1);color:#16a34a">
          <i class="bi bi-box-seam fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Insumos y Repuestos</h1>
          <p class="text-muted small mb-0">${state.insumos.length} registros · ${bajoStock} con stock bajo · RD$${totalValor.toFixed(2)} en inventario</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="d-flex gap-2 flex-wrap mb-3 align-items-center">
        <input type="text" class="form-control form-control-sm" style="max-width:240px" id="lut-insumos-search"
          placeholder="Buscar por nombre, código, proveedor..." value="${escapeHTML(state.busqueda)}">
        <select class="form-select form-select-sm" id="lut-insumos-categoria" style="width:auto">
          ${CATEGORIAS.map((c) => `<option value="${c.value}" ${state.categoria === c.value ? 'selected' : ''}>${c.label}</option>`).join('')}
        </select>
        <span class="text-muted small ms-auto">${filtrados.length} resultado${filtrados.length !== 1 ? 's' : ''}</span>
      </div>

      ${filtrados.length === 0
        ? '<div class="text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No hay insumos con estos criterios</div>'
        : `<div class="table-responsive">
             <table class="table table-hover align-middle mb-0 small">
               <thead class="text-muted small">
                 <tr>
                   <th>Insumo</th>
                   <th>Categoría</th>
                   <th>Código</th>
                   <th class="text-end">Stock</th>
                   <th class="text-end">Stock Mín.</th>
                   <th class="text-end">Costo U.</th>
                   <th>Proveedor</th>
                   <th>Ubicación</th>
                 </tr>
               </thead>
               <tbody>
                 ${filtrados.map((i) => {
                   const bajo = i.stock_actual <= (i.stock_minimo || 0)
                   return `<tr>
                     <td>
                       <span class="d-block fw-semibold">${escapeHTML(i.nombre)}</span>
                       ${i.descripcion ? `<span class="text-muted" style="font-size:0.6rem">${escapeHTML(i.descripcion.slice(0, 60))}</span>` : ''}
                     </td>
                     <td><span class="badge bg-secondary-subtle text-secondary">${escapeHTML(i.categoria || '—')}</span></td>
                     <td class="text-muted" style="font-size:0.6rem">${escapeHTML(i.codigo || '—')}</td>
                     <td class="text-end fw-semibold ${bajo ? 'text-danger' : ''}">${i.stock_actual ?? '—'}</td>
                     <td class="text-end text-muted">${i.stock_minimo ?? '—'}</td>
                     <td class="text-end">${i.costo_unitario ? 'RD$' + Number(i.costo_unitario).toFixed(2) : '—'}</td>
                     <td class="text-muted">${escapeHTML(i.proveedor || '—')}</td>
                     <td class="text-muted">${escapeHTML(i.ubicacion || '—')}</td>
                   </tr>`
                 }).join('')}
               </tbody>
             </table>
           </div>`
      }
    </div>
  `

  // Wire filters
  const searchEl = container.querySelector('#lut-insumos-search')
  let debounceTimer
  searchEl?.addEventListener('input', () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => { state.busqueda = searchEl.value; renderContent(container) }, 250)
  })
  container.querySelector('#lut-insumos-categoria')?.addEventListener('change', (e) => {
    state.categoria = e.target.value; renderContent(container)
  })
}
