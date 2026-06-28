/**
 * dashboardView.js — Panel principal del Portal de Lutería.
 *
 * KPIs del taller, órdenes recientes, alertas de stock bajo y cobros pendientes.
 *
 * Patrón: retorna { teardown() } (AbortController).
 */

import '../styles/luteria.css'
import * as api from '../api/luteriaTallerApi.js'
import { getInsumos } from '../api/luteriaTallerApi.js'
import { resetAll } from '../api/luteriaTallerDB.js'

const state = { dash: null, ordenes: [], insumosBajos: [] }
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

const ESTADO_LABEL = {
  reportado: 'Reportado', recibido: 'Recibido', pendiente_diagnostico: 'Pte. Diagnóstico',
  diagnosticado: 'Diagnosticado', presupuesto_pendiente: 'Presupuesto Pte.',
  esperando_aprobacion: 'Esperando Aprob.', esperando_insumos: 'Esperando Insumos',
  en_reparacion: 'En Reparación', en_prueba: 'En Prueba', listo_entrega: 'Listo Entrega',
  entregado: 'Entregado', cerrado: 'Cerrado', cancelado: 'Cancelado',
}

const ESTADO_COLOR = {
  reportado: 'danger', recibido: 'warning', pendiente_diagnostico: 'warning',
  diagnosticado: 'info', presupuesto_pendiente: 'secondary', esperando_aprobacion: 'secondary',
  esperando_insumos: 'dark', en_reparacion: 'primary', en_prueba: 'info',
  listo_entrega: 'success', entregado: 'success', cerrado: 'secondary', cancelado: 'dark',
}

export async function renderDashboardView(container) {
  _abort?.abort()
  _abort = new AbortController()

  container.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`

  try {
    const [dash, ordenes, insumosBajos] = await Promise.all([
      api.getDashboard(),
      api.getOrdenes({}),
      getInsumos({ stock_bajo: true }),
    ])
    state.dash = dash
    state.ordenes = ordenes
    state.insumosBajos = insumosBajos
    renderContent(container)
  } catch (err) {
    console.error('[LutDashboard] Error:', err)
    container.innerHTML = `<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar el panel</h5>
      <p>${escapeHTML(err.message)}</p></div></div>`
  }

  return { teardown: () => _abort?.abort() }
}

function renderContent(container) {
  const d = state.dash
  const abiertas = state.ordenes.filter((o) =>
    !['entregado', 'cerrado', 'cancelado'].includes(o.estado)
  )

  container.innerHTML = `
    <div class="page-container luteria-portal">
      <div class="d-flex align-items-center gap-3 mb-3 flex-wrap">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(124,58,237,0.1);color:#7c3aed">
          <i class="bi bi-tools fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Panel del Taller</h1>
          <p class="text-muted small mb-0">Resumen del taller de lutería · instrumentos en reparación y alertas</p>
        </div>
        <div class="ms-auto d-flex gap-2">
          <button class="btn btn-sm btn-outline-danger" id="lut-reset-demo">
            <i class="bi bi-arrow-repeat me-1"></i>Restaurar datos demo
          </button>
        </div>
      </div>

      <!-- KPIs principales -->
      <div class="d-flex gap-2 flex-wrap mb-3">
        ${kpi('Recibidos hoy', d.recibidos_hoy, 'primary')}
        ${kpi('Pte. Diagnóstico', d.pendientes_diagnostico, 'warning')}
        ${kpi('En Reparación', d.en_reparacion, 'info')}
        ${kpi('Esperando Insumos', d.esperando_insumos, 'dark')}
        ${kpi('Listos Entrega', d.listos_entrega, 'success')}
      </div>

      <!-- KPIs secundarios -->
      <div class="d-flex gap-2 flex-wrap mb-4">
        <div class="kpi-card border rounded-3">
          <small class="text-muted">Abiertas</small>
          <div class="kpi-value">${d.abiertas_total}</div>
        </div>
        <div class="kpi-card border rounded-3">
          <small class="text-muted">Costo Est. Abierto</small>
          <div class="kpi-value" style="font-size:1.1rem">RD$${d.costo_estimado_abierto.toFixed(2)}</div>
        </div>
        <div class="kpi-card border rounded-3">
          <small class="text-muted">Con Cobro Pte.</small>
          <div class="kpi-value">${d.con_cobro_pendiente}</div>
        </div>
        <div class="kpi-card border rounded-3">
          <small class="text-muted">Stock Bajo</small>
          <div class="kpi-value">${d.insumos_stock_bajo}</div>
        </div>
      </div>

      <div class="row g-3">
        <!-- Órdenes recientes -->
        <div class="col-lg-8">
          <div class="lut-detail-section">
            <h6>Órdenes abiertas recientes</h6>
            ${abiertas.length === 0
              ? '<div class="text-muted small py-2">No hay órdenes abiertas.</div>'
              : `<div class="table-responsive">
                   <table class="table table-sm table-borderless align-middle mb-0">
                     <thead class="text-muted small">
                       <tr>
                         <th>Instrumento</th>
                         <th>Estado</th>
                         <th>Prioridad</th>
                         <th>Recibido</th>
                         <th></th>
                       </tr>
                     </thead>
                     <tbody>
                       ${abiertas.slice(0, 10).map((o) => `
                         <tr class="orden-row" data-id="${o.id}" style="cursor:pointer">
                           <td class="fw-semibold small">${escapeHTML(o.instrumento_id)}</td>
                           <td>${estadoBadge(o.estado)}</td>
                           <td>${prioridadBadge(o.prioridad)}</td>
                           <td class="small text-muted">${formatFecha(o.fecha_recepcion)}</td>
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
        </div>

        <!-- Alertas -->
        <div class="col-lg-4">
          <!-- Stock bajo -->
          <div class="lut-detail-section mb-3">
            <h6>${state.insumosBajos.length > 0
              ? `<i class="bi bi-exclamation-triangle text-warning me-1"></i>`
              : `<i class="bi bi-check-circle text-success me-1"></i>`}
              Stock bajo (${state.insumosBajos.length})</h6>
            ${state.insumosBajos.length === 0
              ? '<div class="text-muted small">Todos los insumos tienen stock suficiente.</div>'
              : `<ul class="list-unstyled mb-0 small">
                   ${state.insumosBajos.map((i) => `
                     <li class="d-flex justify-content-between align-items-center py-1 border-bottom border-opacity-10">
                       <span>${escapeHTML(i.nombre)}</span>
                       <span class="text-danger fw-semibold">${i.stock_actual}/${i.stock_minimo}</span>
                     </li>`).join('')}
                 </ul>`
            }
          </div>

          <!-- Últimas cerradas -->
          <div class="lut-detail-section">
            <h6><i class="bi bi-check2-all text-success me-1"></i>Últimas entregadas</h6>
            ${state.ordenes.filter((o) => o.estado === 'entregado' || o.estado === 'cerrado').length === 0
              ? '<div class="text-muted small">Ninguna.</div>'
              : `<ul class="list-unstyled mb-0 small">
                   ${state.ordenes.filter((o) => o.estado === 'entregado' || o.estado === 'cerrado').slice(0, 3).map((o) => `
                     <li class="py-1 border-bottom border-opacity-10">
                       <div class="fw-semibold">${escapeHTML(o.instrumento_id)}</div>
                       <div class="text-muted">${formatFecha(o.fecha_entrega)} · RD$${(o.costo_final || 0).toFixed(2)}</div>
                     </li>`).join('')}
                 </ul>`
            }
          </div>
        </div>
      </div>
    </div>
  `

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

  // Restaurar datos demo
  container.querySelector('#lut-reset-demo')?.addEventListener('click', async () => {
    if (!confirm('¿Restaurar datos demo? Se perderán los cambios que hayas hecho.')) return
    const btn = container.querySelector('#lut-reset-demo')
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Restaurando...'
    try {
      await resetAll()
      await renderDashboardView(container)
    } catch (err) {
      console.error('[LutDashboard] Error al restaurar demo:', err)
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i>Restaurar datos demo'
    }
  })
}

function kpi(label, value, color) {
  const colors = {
    primary: ['rgba(124,58,237,0.1)', '#7c3aed'],
    warning: ['rgba(255,193,7,0.15)', '#e6a800'],
    info: ['rgba(13,202,240,0.1)', '#0dcaf0'],
    success: ['rgba(25,135,84,0.1)', '#198754'],
    dark: ['rgba(33,37,41,0.1)', '#212529'],
  }
  const [bg, fg] = colors[color] || colors.primary
  return `
    <div class="kpi-card" style="background:${bg};min-width:90px">
      <small>${label}</small>
      <div class="kpi-value" style="color:${fg}">${value}</div>
    </div>
  `
}

function estadoBadge(estado) {
  const c = ESTADO_COLOR[estado] || 'secondary'
  const l = ESTADO_LABEL[estado] || estado
  return `<span class="badge bg-${c}-subtle text-${c} rounded-pill lut-estado-badge">${l}</span>`
}

function prioridadBadge(p) {
  const map = { baja: 'success', media: 'primary', alta: 'warning', critica: 'danger' }
  return `<span class="badge bg-${map[p] || 'secondary'}-subtle text-${map[p] || 'secondary'} rounded-pill lut-estado-badge">${p}</span>`
}
