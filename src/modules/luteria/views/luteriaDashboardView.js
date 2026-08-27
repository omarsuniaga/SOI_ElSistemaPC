/**
 * luteriaDashboardView.js — Panel de Control Ejecutivo y Operativo del Taller de Lutería (LUT).
 * Formateado bajo la Plantilla V2:
 * - Header & Toolbar Unificada V2 con KPI badges en tiempo real.
 * - Resumen operativo de órdenes recientes y alertas de stock de repuestos.
 * - Accesos directos al flujo de taller y soporte completo Dark / Light mode.
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { getDashboard, getOrdenes, getInsumos } from '../../luteria-taller/api/luteriaTallerSupabase.js'
import { openLuteriaOrdenWizard } from '../components/luteriaOrdenWizard.js'
import { renderViewInfoButton, attachViewInfoEvents } from '../../../shared/components/ViewInfoModal.js'
import { router } from '../../../core/router/router.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import '../styles/luteria.css'

let _abortController = null

export async function renderLuteriaDashboardView(container) {
  if (!container) return

  _abortController?.abort()
  _abortController = new AbortController()

  container.innerHTML = _renderSkeleton()

  try {
    const [stats, ordenesRecientes, insumosBajos] = await Promise.all([
      _safeFetchDashboard(),
      getOrdenes({ prioridad: 'todos' }).then(res => (res || []).slice(0, 8)).catch(() => []),
      getInsumos({ stock_bajo: true }).catch(() => []),
    ])

    container.innerHTML = _renderContent(stats, ordenesRecientes, insumosBajos)
    _attachEvents(container)
    attachViewInfoEvents(container)
  } catch (err) {
    console.error('[LuteriaDashboard] Error:', err)
    container.innerHTML = `
      <div class="container-fluid p-4">
        <div class="alert alert-danger shadow-sm rounded-4">
          <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar el panel de lutería: ${escapeHTML(err.message)}
        </div>
      </div>
    `
  }
}

async function _safeFetchDashboard() {
  try {
    return await getDashboard()
  } catch (e) {
    console.warn('[LuteriaDashboard] Fallback getDashboard:', e)
    return {
      abiertas_total: 0,
      en_reparacion: 0,
      esperando_insumos: 0,
      listos_entrega: 0,
      pendientes_diagnostico: 0,
      insumos_stock_bajo: 0,
      recibidos_hoy: 0,
    }
  }
}

function _renderSkeleton() {
  return `
    <div class="container-fluid p-3 p-md-4">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <div class="spinner-border spinner-border-sm text-primary me-2"></div>
          <span class="text-muted fw-semibold">Sincronizando banco de lutería...</span>
        </div>
      </div>
    </div>
  `
}

function _renderContent(stats, ordenesRecientes, insumosBajos) {
  const enReparacion = stats.en_reparacion || 0
  const pendientesDiag = stats.pendientes_diagnostico || 0
  const esperandoInsumos = stats.esperando_insumos || 0
  const listosEntrega = stats.listos_entrega || 0

  return `
    <div class="page-container" style="max-width: 1300px;">
      
      <!-- Header & Toolbar Unificada V2 -->
      <div class="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-body mb-3 border border-body-tertiary">
        
        <!-- Fila 1: Título, Badges Informativos y Botones de Acción -->
        <div class="d-flex flex-wrap justify-content-between align-items-center" style="gap: 0.85rem;">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <div class="p-2 rounded-3 bg-warning-subtle text-warning-emphasis d-flex align-items-center justify-content-center">
              <i class="bi bi-tools fs-5"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0 text-body d-flex align-items-center">Taller de Lutería & Mantenimiento</h5>
              <small class="text-muted d-block" style="font-size:0.75rem;">Supervisión del banco de trabajo, diagnóstico de instrumentos y disponibilidad de repuestos</small>
            </div>
            
            <!-- Badges de Resumen en Tiempo Real -->
            <div class="d-flex align-items-center gap-1.5 ms-md-2 flex-wrap">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                <i class="bi bi-wrench-adjustable me-1"></i><span>${enReparacion}</span> En Reparación
              </span>
              <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                <i class="bi bi-clipboard-pulse me-1"></i><span>${pendientesDiag}</span> Pendientes Diagnóstico
              </span>
              ${esperandoInsumos > 0 ? `
                <span class="badge bg-danger-subtle text-danger border border-danger-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                  <i class="bi bi-hourglass-split me-1"></i><span>${esperandoInsumos}</span> Esperando Repuesto
                </span>
              ` : ''}
              <span class="badge bg-success-subtle text-success border border-success-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                <i class="bi bi-check-circle-fill me-1"></i><span>${listosEntrega}</span> Listos para Entrega
              </span>
            </div>
          </div>

          <!-- Toolbar de Botones -->
          <div class="d-flex align-items-center flex-wrap" style="gap: 0.85rem;">
            ${renderViewInfoButton('luteria-dashboard')}
            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btn-refresh-dashboard" title="Refrescar">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button class="btn btn-sm btn-warning d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-bold shadow-xs text-dark" id="btn-nuevo-ingreso" style="font-size:0.78rem;">
              <i class="bi bi-plus-circle-fill"></i>
              <span>Nueva Orden de Taller</span>
            </button>
          </div>
        </div>

      </div>

      <!-- SECCIÓN PRINCIPAL: FLUJO OPERATIVO + ALERTAS DE INSUMOS -->
      <div class="row g-3 mb-4">
        <!-- Órdenes Activas en Taller -->
        <div class="col-12 col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 h-100 bg-body">
            <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-body-tertiary">
              <div>
                <h6 class="fw-bold mb-0 text-body"><i class="bi bi-kanban me-2 text-warning"></i>Órdenes Recientes en Proceso</h6>
                <small class="text-muted" style="font-size:0.75rem;">Últimas intervenciones en curso</small>
              </div>
              <button class="btn btn-sm btn-outline-primary rounded-3 px-3 fw-semibold" id="btn-ver-kanban" style="font-size:0.78rem;">
                <span>Ver Tablero Completo</span> <i class="bi bi-arrow-right ms-1"></i>
              </button>
            </div>

            ${ordenesRecientes.length > 0 ? `
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0" style="font-size:0.85rem;">
                  <thead class="table-light">
                    <tr>
                      <th>Instrumento / Alumno</th>
                      <th>Prioridad</th>
                      <th>Estado de Reparación</th>
                      <th>Diagnóstico</th>
                      <th class="text-end">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${ordenesRecientes.map(o => `
                      <tr>
                        <td>
                          <div class="fw-bold text-body">${escapeHTML(o.alumno_nombre || 'Instrumento Institucional')}</div>
                          <div class="text-muted small" style="font-size:0.72rem;">
                            <i class="bi bi-music-note me-0.5"></i>${escapeHTML(o.tipo_instrumento || 'Instrumento')}
                          </div>
                        </td>
                        <td>${_prioridadBadge(o.prioridad)}</td>
                        <td>${_estadoBadge(o.estado)}</td>
                        <td class="text-secondary small">${escapeHTML(o.tipo_dano || o.descripcion_inicial || 'Mantenimiento preventivo')}</td>
                        <td class="text-end">
                          <button class="btn btn-sm btn-outline-secondary py-1 px-2.5 rounded-3 btn-gestionar-orden shadow-2xs" data-id="${o.id}" title="Ver en Tablero">
                            <i class="bi bi-arrow-right"></i>
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="text-center py-5 text-muted">
                <i class="bi bi-check2-all display-5 text-success d-block mb-2"></i>
                <p class="mb-0 fw-semibold">No hay órdenes pendientes en este momento.</p>
                <span class="small">El banco de trabajo se encuentra al día.</span>
              </div>
            `}
          </div>
        </div>

        <!-- Alertas de Stock de Insumos & Repuestos -->
        <div class="col-12 col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 h-100 bg-body d-flex flex-column">
            <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-body-tertiary">
              <div>
                <h6 class="fw-bold mb-0 text-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i>Stock Crítico</h6>
                <small class="text-muted" style="font-size:0.75rem;">Consumibles bajo mínimo</small>
              </div>
              <button class="btn btn-sm btn-outline-secondary rounded-3 px-2.5" id="btn-ver-insumos" style="font-size:0.75rem;">
                Ver Almacén
              </button>
            </div>

            ${insumosBajos.length > 0 ? `
              <div class="list-group list-group-flush mb-3">
                ${insumosBajos.map(i => `
                  <div class="list-group-item px-0 py-2 d-flex align-items-center justify-content-between bg-transparent">
                    <div>
                      <div class="fw-semibold text-body" style="font-size:0.82rem;">${escapeHTML(i.nombre)}</div>
                      <span class="badge bg-secondary-subtle text-secondary" style="font-size:0.68rem;">${escapeHTML(i.categoria || 'Repuesto')}</span>
                    </div>
                    <div class="text-end">
                      <span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2.5 py-1 fw-bold" style="font-size:0.72rem;">${i.stock_actual} / ${i.stock_minimo}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="text-center py-4 text-muted mb-3">
                <i class="bi bi-box-seam text-success display-6 d-block mb-2"></i>
                <p class="small mb-0 fw-semibold text-body">Stock en condiciones óptimas.</p>
                <span class="small text-muted">No se registran faltantes de consumibles.</span>
              </div>
            `}

            <!-- Accesos rápidos del taller -->
            <div class="mt-auto pt-3 border-top border-body-tertiary">
              <div class="small fw-bold text-uppercase text-muted mb-2" style="font-size:0.7rem;">Operaciones de Taller</div>
              <div class="d-grid gap-2">
                <button class="btn btn-sm btn-outline-warning text-dark text-start d-flex align-items-center justify-content-between py-2 rounded-3 shadow-2xs" id="btn-ir-diagnosticos" style="font-size:0.78rem;">
                  <span><i class="bi bi-wrench me-2 text-warning"></i>Banco de Diagnósticos</span>
                  <i class="bi bi-chevron-right text-muted small"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary text-start d-flex align-items-center justify-content-between py-2 rounded-3 shadow-2xs" id="btn-ir-ordenes" style="font-size:0.78rem;">
                  <span><i class="bi bi-kanban me-2 text-primary"></i>Tablero Kanban de Órdenes</span>
                  <i class="bi bi-chevron-right text-muted small"></i>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  `
}

function _prioridadBadge(p) {
  const map = {
    critica: { label: 'CRÍTICA', bg: 'bg-danger-subtle text-danger border border-danger-subtle', dot: 'dot-critica' },
    alta: { label: 'ALTA', bg: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle', dot: 'dot-alta' },
    media: { label: 'MEDIA', bg: 'bg-info-subtle text-info-emphasis border border-info-subtle', dot: 'dot-media' },
    baja: { label: 'BAJA', bg: 'bg-secondary-subtle text-secondary border border-secondary-subtle', dot: 'dot-baja' },
  }
  const meta = map[p] || map.baja
  return `<span class="badge ${meta.bg} rounded-pill px-2 py-0.5 fw-bold d-inline-flex align-items-center" style="font-size:0.65rem;">
    <span class="lut-prio-dot ${meta.dot}"></span>${meta.label}
  </span>`
}

function _estadoBadge(e) {
  const map = {
    reportado: { label: 'Reportado', bg: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' },
    recibido: { label: 'Recibido', bg: 'bg-primary-subtle text-primary border border-primary-subtle' },
    pendiente_diagnostico: { label: 'Pendiente Diag.', bg: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' },
    diagnosticado: { label: 'Diagnosticado', bg: 'bg-info-subtle text-info-emphasis border border-info-subtle' },
    presupuesto_pendiente: { label: 'Presupuesto', bg: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' },
    esperando_aprobacion: { label: 'Esperando Aprob.', bg: 'bg-danger-subtle text-danger border border-danger-subtle' },
    esperando_insumos: { label: 'Esperando Repuesto', bg: 'bg-danger-subtle text-danger border border-danger-subtle' },
    en_reparacion: { label: 'En Reparación', bg: 'bg-primary text-white' },
    en_prueba: { label: 'En Calibración', bg: 'bg-primary-subtle text-primary border border-primary-subtle' },
    listo_entrega: { label: 'Listo para Entrega', bg: 'bg-success text-white' },
    entregado: { label: 'Entregado', bg: 'bg-success-subtle text-success border border-success-subtle' },
    cerrado: { label: 'Cerrado', bg: 'bg-secondary-subtle text-secondary border border-secondary-subtle' },
  }
  const meta = map[e] || { label: e, bg: 'bg-secondary-subtle text-secondary border border-secondary-subtle' }
  return `<span class="badge ${meta.bg} rounded-pill px-2 py-0.5 fw-semibold" style="font-size:0.7rem;">${meta.label}</span>`
}

function _attachEvents(container) {
  const signal = _abortController.signal

  container.querySelector('#btn-refresh-dashboard')?.addEventListener('click', () => {
    renderLuteriaDashboardView(container)
  }, { signal })

  container.querySelector('#btn-nuevo-ingreso')?.addEventListener('click', async () => {
    await openLuteriaOrdenWizard({
      onSuccess: () => renderLuteriaDashboardView(container)
    })
  }, { signal })

  container.querySelector('#btn-ver-kanban')?.addEventListener('click', () => {
    router.navigate('luteria-ordenes')
  }, { signal })

  container.querySelector('#btn-ver-insumos')?.addEventListener('click', () => {
    router.navigate('luteria-insumos')
  }, { signal })

  container.querySelector('#btn-ir-diagnosticos')?.addEventListener('click', () => {
    router.navigate('luteria-diagnosticos')
  }, { signal })

  container.querySelector('#btn-ir-ordenes')?.addEventListener('click', () => {
    router.navigate('luteria-ordenes')
  }, { signal })

  container.querySelectorAll('.btn-gestionar-orden').forEach(btn => {
    btn.addEventListener('click', () => {
      router.navigate('luteria-ordenes', { ordenId: btn.dataset.id })
    }, { signal })
  })
}
