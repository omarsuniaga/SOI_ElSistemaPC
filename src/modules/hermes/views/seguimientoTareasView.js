/**
 * seguimientoTareasView.js — Seguimiento de Tareas Institucionales (Bandeja).
 * Visor de solo lectura: conteos por estado + listado filtrable, scopeado al
 * departamento del portal. Incluye exportación a PDF.
 */

import * as tareasApi from '../api/tareasApi.js'
import { renderTaskStatusBadge, getEstadoConfig } from '../components/taskStatusBadge.js'
import { descargarPdfSeguimientoTareas } from '../../admin-dashboard/services/academicReportsPdfService.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'

/**
 * @param {HTMLElement} container
 * @param {object} opciones
 * @param {string} opciones.departamento — enum soi_departamento del portal
 * @returns {{ teardown(): void }}
 */
export function renderSeguimientoTareasView(container, { departamento = 'ADM' } = {}) {
  const controller = new AbortController()
  const { signal } = controller
  let tareas = []
  let filtroEstado = ''
  let isExporting = false

  container.innerHTML = `
    <div class="premium-loading text-center py-5">
      <div class="spinner-border text-primary mb-3" role="status"></div>
      <div class="text-muted fw-semibold">Cargando seguimiento de tareas...</div>
    </div>
  `

  async function load() {
    try {
      tareas = await tareasApi.getTareasByDepartamento(departamento)
      render()
    } catch (err) {
      console.error('[seguimientoTareasView] Error:', err)
      container.innerHTML = `
        <div class="admin-dashboard-container p-4">
          <div class="alert alert-danger d-flex align-items-center gap-3">
            <i class="bi bi-exclamation-triangle-fill fs-3"></i>
            <div>
              <div class="fw-bold">No se pudo cargar el seguimiento de tareas</div>
              <div class="small">${escapeHTML(err.message || String(err))}</div>
            </div>
          </div>
        </div>
      `
    }
  }

  function render() {
    const estadoConfig = getEstadoConfig()
    const conteos = Object.keys(estadoConfig).reduce((acc, k) => ({ ...acc, [k]: 0 }), {})
    tareas.forEach((t) => {
      if (conteos[t.estado] !== undefined) conteos[t.estado] += 1
    })

    const visibles = filtroEstado ? tareas.filter((t) => t.estado === filtroEstado) : tareas

    container.innerHTML = `
      <div class="admin-dashboard-container p-3 p-md-4">
        <!-- Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 mb-4 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div class="rounded-4 bg-primary text-white p-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
              <i class="bi bi-list-check fs-4"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h3 class="fw-bold m-0 text-body">Seguimiento de Tareas</h3>
                <span class="badge bg-primary-subtle text-primary border">${tareas.length} totales</span>
              </div>
              <p class="text-muted small m-0">Bandeja departamental y control de avance de compromisos (${escapeHTML(departamento)})</p>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button id="btnDescargarPdfTareas" class="btn btn-sm btn-primary d-flex align-items-center gap-2 shadow-sm rounded-3">
              <i class="bi bi-file-earmark-pdf"></i>
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>

        <!-- Filtros por Estado -->
        <section class="metrics-section mb-4">
          <div class="row g-2">
            ${Object.entries(estadoConfig)
              .map(
                ([key, cfg]) => `
              <div class="col-6 col-sm-4 col-md-2">
                <button class="btn btn-outline-secondary w-100 p-2 text-start seg-filtro-btn ${filtroEstado === key ? 'active btn-primary text-white border-primary' : 'bg-body'}" data-estado="${key}" type="button">
                  <div class="small text-truncate ${filtroEstado === key ? 'text-white-50' : 'text-muted'}">${escapeHTML(cfg.label)}</div>
                  <div class="fs-4 fw-bold mt-1">${conteos[key]}</div>
                </button>
              </div>`,
              )
              .join('')}
          </div>
        </section>

        <!-- Barra de Estado Filtro Activo -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="small text-muted">
            Mostrando <strong>${visibles.length}</strong> tareas ${filtroEstado ? `filtradas por <strong>${escapeHTML(estadoConfig[filtroEstado]?.label || filtroEstado)}</strong>` : ''}
          </div>
          ${filtroEstado ? `<button class="btn btn-sm btn-outline-danger" id="btnLimpiarFiltro"><i class="bi bi-x-circle me-1"></i>Quitar filtro</button>` : ''}
        </div>

        <!-- Tabla de Tareas -->
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-body">
          ${renderTabla(visibles)}
        </div>
      </div>
    `

    container.querySelectorAll('.seg-filtro-btn').forEach((btn) => {
      btn.addEventListener(
        'click',
        () => {
          const estado = btn.dataset.estado
          filtroEstado = filtroEstado === estado ? '' : estado
          render()
        },
        { signal },
      )
    })

    container.querySelector('#btnLimpiarFiltro')?.addEventListener(
      'click',
      () => {
        filtroEstado = ''
        render()
      },
      { signal },
    )

    container.querySelector('#btnDescargarPdfTareas')?.addEventListener(
      'click',
      async () => {
        if (isExporting) return
        isExporting = true
        const btn = container.querySelector('#btnDescargarPdfTareas')
        if (btn) {
          btn.disabled = true
          btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Generando PDF...`
        }

        try {
          await descargarPdfSeguimientoTareas(visibles, departamento)
        } catch (err) {
          console.error('[seguimientoTareasView] Error al exportar PDF:', err)
          alert('Error al generar el PDF de tareas.')
        } finally {
          isExporting = false
          if (btn) {
            btn.disabled = false
            btn.innerHTML = `<i class="bi bi-file-earmark-pdf"></i> <span>Descargar PDF</span>`
          }
        }
      },
      { signal },
    )
  }

  function renderTabla(lista) {
    if (!lista.length) {
      return `
        <div class="text-center py-5 text-muted">
          <i class="bi bi-inbox fs-1 d-block mb-2"></i>
          Sin tareas ${filtroEstado ? 'en este estado' : 'registradas'} actualmente.
        </div>
      `
    }
    return `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light small">
            <tr>
              <th>Código</th>
              <th>Tarea / Compromiso</th>
              <th>Responsable</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Vencimiento</th>
            </tr>
          </thead>
          <tbody>
            ${lista
              .map(
                (t) => `
              <tr>
                <td><span class="font-monospace small text-muted">${escapeHTML(t.codigo || '—')}</span></td>
                <td><strong class="text-body">${escapeHTML(t.titulo || t.descripcion || 'Sin título')}</strong></td>
                <td class="small text-muted">${escapeHTML(t.responsable_nombre || t.asignado_a || 'Sin asignar')}</td>
                <td>
                  <span class="badge ${t.prioridad === 'alta' || t.prioridad === 'critica' ? 'bg-danger' : t.prioridad === 'media' ? 'bg-warning text-dark' : 'bg-secondary-subtle text-secondary'}">
                    ${escapeHTML(t.prioridad || 'NORMAL').toUpperCase()}
                  </span>
                </td>
                <td>${renderTaskStatusBadge(t.estado)}</td>
                <td class="small text-muted">${t.fecha_vencimiento || t.fecha_limite ? new Date(t.fecha_vencimiento || t.fecha_limite).toLocaleDateString('es-DO') : 'Sin fecha'}</td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  load()

  return {
    teardown() {
      controller.abort()
    },
  }
}

export default renderSeguimientoTareasView
