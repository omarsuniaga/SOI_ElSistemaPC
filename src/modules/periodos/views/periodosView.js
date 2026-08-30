/**
 * Gestión de Períodos Académicos
 * Rediseñado con la estructura, metodología y estética unificada de la vista Salones.
 */

import * as PeriodosApi from '../api/periodosApi.js'
import { Toast } from 'bootstrap'
import { AppModal } from '../../../shared/components/AppModal.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import { router } from '../../../core/router/router.js'
import { renderViewInfoButton, attachViewInfoEvents } from '../../../shared/components/ViewInfoModal.js'
import {
  obtenerReporteCierre,
  activarPeriodoAtomico,
  explicarListaVacia,
  clasificarDocente,
  fmtPct,
  ESTADO,
} from '../api/reporteCierreApi.js'
import { generarInformePdfCierreSemestre } from '../services/pdfCierreSemestre.js'

export async function renderPeriodosView(container) {
  let periodosData = []
  let filtrosAbiertos = false
  let currentFilters = {
    search: '',
    estado: 'todos',
    sort: 'inicio_desc',
  }

  container.innerHTML = `
    <div class="page-container">
      
      <!-- Header & Toolbar Unificada V2 (Estructura Salones) -->
      <div class="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-body mb-3 border border-body-tertiary">
        
        <!-- Fila 1: Título, Badges Informativos y Botones de Acción -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-2.5 pb-2 border-bottom border-body-tertiary" style="gap: 0.85rem;">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <div class="p-2 rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
              <i class="bi bi-calendar-event-fill fs-5"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0 text-body d-flex align-items-center">Gestión de Períodos Académicos</h5>
              <small class="text-muted d-block" style="font-size:0.75rem;">Administra los ciclos de estudio, auditorías de cierre y el período activo del sistema</small>
            </div>
            
            <!-- Badges de Resumen en Tiempo Real -->
            <div class="d-flex align-items-center gap-1.5 ms-md-2 flex-wrap">
              <span class="badge bg-success-subtle text-success border border-success-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Período académico activo">
                <i class="bi bi-check-circle-fill me-1"></i><span id="badgePeriodoActivoNombre">Cargando...</span>
              </span>
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Total de ciclos registrados">
                <i class="bi bi-calendar-range me-1"></i><span id="badgeTotalPeriodos">0</span> Ciclos Totales
              </span>
              <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Períodos cerrados con informe">
                <i class="bi bi-archive-fill me-1"></i><span id="badgeCerrados">0</span> Cerrados
              </span>
            </div>
          </div>

          <!-- Toolbar de Botones con 0.85rem de separación -->
          <div class="d-flex align-items-center flex-wrap" style="gap: 0.85rem;">
            ${renderViewInfoButton('periodos')}
            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnExportarCSVPeriodos" title="Exportar CSV" style="font-size:0.78rem;">
              <i class="bi bi-file-earmark-spreadsheet"></i>
              <span class="d-none d-sm-inline">CSV</span>
            </button>
            <button class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btn-nuevo-periodo" style="font-size:0.78rem;">
              <i class="bi bi-plus-circle-fill"></i>
              <span>Nuevo Período</span>
            </button>
          </div>
        </div>

        <!-- Fila 2: Búsqueda y Botón Desplegable de Filtros & Orden -->
        <div class="d-flex align-items-center justify-content-between flex-wrap pt-1" style="gap: 0.85rem;">
          <div class="flex-grow-1" style="min-width: 260px;">
            <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden">
              <span class="input-group-text bg-body-tertiary border-end-0 py-1.5"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control border-start-0 py-1.5 fw-medium" id="searchPeriodo" placeholder="Buscar período por nombre o año..." autocomplete="off" style="font-size:0.8rem;">
            </div>
          </div>

          <div class="d-flex align-items-center" style="gap: 0.85rem;">
            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnToggleFiltrosPeriodos" type="button" aria-expanded="false" style="font-size:0.78rem;">
              <i class="bi bi-funnel"></i>
              <span>Filtros & Orden</span>
              <span class="badge bg-primary text-white rounded-pill px-1.5 ms-1 d-none" id="filtrosBadgeCountPeriodos" style="font-size:0.68rem;">0</span>
            </button>

            <button class="btn btn-sm btn-outline-secondary rounded-3 shadow-xs px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1" id="btnLimpiarFiltrosPeriodos" title="Restablecer filtros y búsqueda" style="font-size:0.78rem;">
              <i class="bi bi-arrow-counterclockwise"></i>
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        <!-- Fila 3: Panel Desplegable de Filtros y Ordenamiento -->
        <div class="collapse pt-2.5" id="panelFiltrosPeriodos">
          <div class="p-3 rounded-4 bg-body-tertiary border border-body-tertiary shadow-xs">
            <div class="row g-2 align-items-center">
              
              <div class="col-12 col-sm-6 col-lg-6">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Estado del Período</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filterEstadoPeriodo" style="font-size:0.8rem;">
                  <option value="todos">Todos los períodos</option>
                  <option value="activo">Solo Período Activo</option>
                  <option value="inactivos">Inactivos</option>
                  <option value="cerrados">Cerrados</option>
                </select>
              </div>

              <div class="col-12 col-sm-6 col-lg-6">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Criterio de Orden</label>
                <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden">
                  <span class="input-group-text bg-body border-end-0 py-1.5 text-muted" style="font-size:0.75rem;"><i class="bi bi-sort-down"></i></span>
                  <select class="form-select form-select-sm border-start-0 py-1.5 fw-semibold text-primary" id="selectOrdenarPeriodos" style="font-size:0.8rem;">
                    <option value="inicio_desc">Fecha de Inicio (Más reciente primero)</option>
                    <option value="inicio_asc">Fecha de Inicio (Más antiguo primero)</option>
                    <option value="nombre_asc">Nombre (A-Z)</option>
                    <option value="nombre_desc">Nombre (Z-A)</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <!-- Contenedor de Cuadrícula de Períodos (Estructura Salones responsive) -->
      <div class="w-100">
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-2.5 w-100 m-0" id="periodos-table-body">
          <div class="col-12 text-center py-5 text-muted">
            <div class="spinner-border text-primary mb-3" role="status"></div>
            <br><small class="text-muted">Cargando períodos académicos...</small>
          </div>
        </div>
      </div>
    </div>

    <div class="toast-container position-fixed bottom-0 end-0 p-3"></div>
  `

  const gridBody = container.querySelector('#periodos-table-body')

  async function loadPeriodos() {
    try {
      periodosData = await PeriodosApi.getPeriodos()
      await renderGrid()
    } catch (error) {
      showToast(error.message, 'danger')
    }
  }

  function getFilteredPeriodos() {
    let list = [...periodosData]
    const { search, estado, sort } = currentFilters

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => (p.nombre || '').toLowerCase().includes(q))
    }

    if (estado === 'activo') {
      list = list.filter(p => Boolean(p.activo))
    } else if (estado === 'inactivos') {
      list = list.filter(p => !p.activo)
    } else if (estado === 'cerrados') {
      list = list.filter(p => Boolean(p.cerrado))
    }

    list.sort((a, b) => {
      if (sort === 'inicio_desc') return new Date(b.fecha_inicio || 0) - new Date(a.fecha_inicio || 0)
      if (sort === 'inicio_asc') return new Date(a.fecha_inicio || 0) - new Date(b.fecha_inicio || 0)
      if (sort === 'nombre_asc') return (a.nombre || '').localeCompare(b.nombre || '')
      if (sort === 'nombre_desc') return (b.nombre || '').localeCompare(a.nombre || '')
      return 0
    })

    return list
  }

  async function renderGrid() {
    const totalPeriodos = periodosData.length
    const activo = periodosData.find(p => p.activo)
    const cerrados = periodosData.filter(p => p.cerrado).length

    const badgeActivo = container.querySelector('#badgePeriodoActivoNombre')
    const badgeTotal = container.querySelector('#badgeTotalPeriodos')
    const badgeCerrados = container.querySelector('#badgeCerrados')

    if (badgeActivo) badgeActivo.textContent = activo ? `Activo: ${activo.nombre}` : 'Sin período activo'
    if (badgeTotal) badgeTotal.textContent = `${totalPeriodos}`
    if (badgeCerrados) badgeCerrados.textContent = `${cerrados}`

    const periodos = getFilteredPeriodos()

    if (periodos.length === 0) {
      if (periodosData.length === 0) {
        const motivo = await explicarListaVacia()
        gridBody.innerHTML = `
          <div class="col-12 text-center py-5 w-100 text-muted">
            <i class="bi bi-inbox fs-1 d-block mb-3 text-secondary"></i>
            <div class="fw-semibold mb-1">No hay períodos para mostrar</div>
            <div class="small text-secondary">${escapeHTML(motivo)}</div>
          </div>`
      } else {
        gridBody.innerHTML = `
          <div class="col-12 text-center py-5 w-100 text-muted">
            <i class="bi bi-inbox fs-1 d-block mb-3 text-secondary"></i>
            No se encontraron períodos con los criterios seleccionados.
          </div>`
      }
      return
    }

    gridBody.innerHTML = periodos.map(p => {
      const start = fmtFecha(p.fecha_inicio)
      const end = fmtFecha(p.fecha_fin)

      return `
        <div class="col p-1">
          <div class="list-group-item card h-100 rounded-4 border bg-body shadow-xs hover-shadow transition-all d-flex flex-column justify-content-between position-relative overflow-hidden" data-id="${p.id}" style="padding: 0.85rem 0.85rem 1.05rem 0.85rem !important;">
            
            <!-- Parte Superior: Nombre, Badges de Estado y Fechas -->
            <div class="mb-2">
              
              <!-- Nombre del Período -->
              <div class="d-flex align-items-start justify-content-between gap-1 mb-1">
                <strong class="text-body text-truncate d-block" style="font-size: 0.92rem;" title="${escapeHTML(p.nombre)}">
                  ${escapeHTML(p.nombre)}
                </strong>
              </div>

              <!-- Badges de Estado -->
              <div class="d-flex align-items-center gap-1 mb-2 flex-wrap">
                ${p.activo ? '<span class="badge bg-success-subtle text-success border border-success-subtle py-0.5 px-2 rounded-2 fw-semibold" style="font-size: 0.68rem;"><i class="bi bi-check-circle-fill me-1"></i>PERÍODO ACTIVO</span>' : '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle py-0.5 px-2 rounded-2" style="font-size: 0.68rem;">Inactivo</span>'}
                ${p.cerrado ? '<span class="badge bg-danger-subtle text-danger border border-danger-subtle py-0.5 px-2 rounded-2 fw-semibold" style="font-size: 0.68rem;"><i class="bi bi-lock-fill me-1"></i>CERRADO</span>' : ''}
              </div>

              <!-- Rango de Fechas -->
              <div class="mb-2">
                <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle py-1 px-2 text-truncate w-100 text-start d-block rounded-3" style="font-size: 0.72rem;">
                  <i class="bi bi-calendar-range me-1 text-primary"></i>${start} &mdash; ${end}
                </span>
              </div>

              <!-- Información de Vigencia -->
              <div class="d-flex flex-column gap-1 text-muted small" style="font-size: 0.76rem;">
                <div class="d-flex align-items-center justify-content-between">
                  <span><i class="bi bi-calendar-play me-1 text-primary"></i>Fecha Inicio:</span>
                  <span class="fw-semibold text-body">${start}</span>
                </div>
                <div class="d-flex align-items-center justify-content-between">
                  <span><i class="bi bi-calendar-check me-1 text-secondary"></i>Fecha Fin:</span>
                  <span class="fw-semibold text-body">${end}</span>
                </div>
              </div>

            </div>

            <!-- Footer con Acciones -->
            <div class="pt-2 border-top border-body-tertiary d-flex align-items-center justify-content-between mt-auto flex-wrap" style="gap: 0.35rem;">
              <div class="d-flex align-items-center gap-1">
                <button class="btn btn-sm btn-outline-info rounded-3 shadow-xs d-inline-flex align-items-center gap-1 py-1 px-2" data-action="auditar" data-id="${p.id}" title="Auditar Cierre de Semestre" style="font-size:0.75rem;">
                  <i class="bi bi-clipboard-check"></i>
                  <span>Auditar</span>
                </button>
                ${!p.activo ? `
                  <button class="btn btn-sm btn-outline-success rounded-3 shadow-xs d-inline-flex align-items-center gap-1 py-1 px-2" data-action="activar" data-id="${p.id}" title="Activar este período" style="font-size:0.75rem;">
                    <i class="bi bi-power"></i>
                    <span>Activar</span>
                  </button>
                ` : ''}
              </div>

              <div class="d-flex align-items-center gap-1">
                <button class="btn btn-sm btn-outline-secondary rounded-3 shadow-xs py-1 px-2" data-action="edit" data-id="${p.id}" title="Editar Período" style="font-size:0.75rem;">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger rounded-3 shadow-xs py-1 px-2" data-action="delete" data-id="${p.id}" title="Eliminar Período" style="font-size:0.75rem;">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>

          </div>
        </div>
      `
    }).join('')
  }

  function fmtFecha(valor) {
    if (!valor) return '—'
    const d = new Date(`${valor}T00:00:00`)
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString()
  }

  function showToast(message, type = 'success') {
    const toastContainer = container.querySelector('.toast-container')
    if (!toastContainer) return
    const toastId = 'toast-' + Date.now()
    toastContainer.insertAdjacentHTML('beforeend', `
      <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">${escapeHTML(message)}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `)
    const toastEl = document.getElementById(toastId)
    if (toastEl) new Toast(toastEl).show()
  }

  // Event Listeners de Filtros & Toolbar
  attachViewInfoEvents(container)
  const searchInput = container.querySelector('#searchPeriodo')
  const filterEstadoPeriodo = container.querySelector('#filterEstadoPeriodo')
  const selectOrdenarPeriodos = container.querySelector('#selectOrdenarPeriodos')
  const btnToggleFiltros = container.querySelector('#btnToggleFiltrosPeriodos')
  const btnLimpiar = container.querySelector('#btnLimpiarFiltrosPeriodos')
  const btnNuevo = container.querySelector('#btn-nuevo-periodo')
  const btnExportarCSV = container.querySelector('#btnExportarCSVPeriodos')

  searchInput?.addEventListener('input', (e) => {
    currentFilters.search = e.target.value.trim()
    renderGrid()
  })

  filterEstadoPeriodo?.addEventListener('change', (e) => {
    currentFilters.estado = e.target.value
    updateFiltrosBadge()
    renderGrid()
  })

  selectOrdenarPeriodos?.addEventListener('change', (e) => {
    currentFilters.sort = e.target.value
    renderGrid()
  })

  btnToggleFiltros?.addEventListener('click', () => {
    filtrosAbiertos = !filtrosAbiertos
    const panel = container.querySelector('#panelFiltrosPeriodos')
    if (panel) {
      panel.classList.toggle('show', filtrosAbiertos)
      btnToggleFiltros.setAttribute('aria-expanded', String(filtrosAbiertos))
    }
  })

  btnLimpiar?.addEventListener('click', () => {
    if (searchInput) searchInput.value = ''
    if (filterEstadoPeriodo) filterEstadoPeriodo.value = 'todos'
    if (selectOrdenarPeriodos) selectOrdenarPeriodos.value = 'inicio_desc'

    currentFilters = {
      search: '',
      estado: 'todos',
      sort: 'inicio_desc',
    }
    updateFiltrosBadge()
    renderGrid()
  })

  function updateFiltrosBadge() {
    const badge = container.querySelector('#filtrosBadgeCountPeriodos')
    let count = 0
    if (currentFilters.estado !== 'todos') count++
    if (badge) {
      badge.textContent = count
      badge.classList.toggle('d-none', count === 0)
    }
  }

  btnExportarCSV?.addEventListener('click', () => {
    if (periodosData.length === 0) {
      showToast('No hay períodos para exportar', 'warning')
      return
    }
    const headers = ['ID', 'Nombre', 'Fecha Inicio', 'Fecha Fin', 'Activo', 'Cerrado']
    const rows = periodosData.map(p => [
      p.id,
      `"${(p.nombre || '').replace(/"/g, '""')}"`,
      p.fecha_inicio || '',
      p.fecha_fin || '',
      p.activo ? 'SI' : 'NO',
      p.cerrado ? 'SI' : 'NO',
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `periodos_academicos_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exportación CSV completada')
  })

  btnNuevo?.addEventListener('click', () => {
    openCreateModal()
  })

  gridBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]')
    if (!btn) return
    
    const id = btn.dataset.id
    const action = btn.dataset.action
    
    if (action === 'activar') {
      await openActivarModal(id)
    } else if (action === 'auditar') {
      await openAuditoriaModal(id)
    } else if (action === 'edit') {
      await openEditModal(id)
    } else if (action === 'delete') {
      await openDeleteModal(id)
    }
  })

  /**
   * Resumen del informe de cierre, con acceso al PDF y al informe completo.
   */
  async function openAuditoriaModal(periodoId) {
    AppModal.open({
      title: 'Informe de cierre',
      body: '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>',
      saveText: 'Cerrar',
      hideSave: true,
    })

    let reporte
    try {
      reporte = await obtenerReporteCierre(periodoId)
      if (!reporte?.resumen) throw new Error('El informe no devolvió datos del período')
    } catch (err) {
      AppModal.close()
      showToast(err.message, 'danger')
      return
    }

    const s = reporte.resumen ?? {}
    const a = reporte.asistencia ?? {}
    const evaluables = reporte.docentesEvaluables ?? []
    const sinEvaluar = (reporte.docentes ?? []).filter(d => d.estado_evaluacion !== ESTADO.EVALUABLE)

    const docentesHTML = evaluables.length === 0
      ? '<p class="text-muted small my-2">Ningún docente registró sesiones en este período.</p>'
      : `<div class="list-group list-group-flush my-2" style="max-height: 220px; overflow-y: auto;">
          ${evaluables.map(m => {
            const ef = clasificarDocente(m.pct_puntualidad, m.estado_evaluacion)
            return `
            <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
              <div>
                <div class="fw-semibold small">${escapeHTML(m.nombre)}</div>
                <div class="text-muted" style="font-size:0.75rem;">
                  ${m.registradas ?? 0} registradas / ${m.borradores ?? 0} en borrador (${m.sesiones ?? 0} sesiones)
                </div>
              </div>
              <div class="d-flex align-items-center gap-1">
                <span class="badge bg-${ef.tone}-subtle text-${ef.tone} border border-${ef.tone}-subtle small" style="font-size:0.7rem;">${escapeHTML(ef.badge)}</span>
                <span class="badge bg-${ef.tone} rounded-pill">${escapeHTML(fmtPct(m.pct_puntualidad))}</span>
              </div>
            </div>`
          }).join('')}
        </div>`

    AppModal.open({
      title: `Informe de cierre: ${reporte.periodo?.nombre ?? ''}`,
      size: 'lg',
      saveText: 'Ver informe completo',
      cancelText: 'Cerrar',
      body: `
        <div class="mb-2">
          <button id="btn-descargar-pdf-cierre" class="btn btn-outline-danger btn-sm w-100 mb-3 d-flex align-items-center justify-content-center gap-2 py-2">
            <i class="bi bi-file-earmark-pdf-fill fs-5"></i>
            <span>Descargar Informe Ejecutivo PDF</span>
          </button>

          <div class="p-3 rounded bg-body-tertiary mb-3">
            <div class="row g-2 text-center small">
              <div class="col-4"><div class="p-2 rounded bg-body">
                <div class="text-muted" style="font-size:.7rem;">CUMPLIM. REGISTRO</div>
                <div class="fw-bold text-primary fs-6">${escapeHTML(fmtPct(s.pct_cumplimiento_registro))}</div>
                <div class="text-muted" style="font-size:.65rem;">${s.sesiones_registradas ?? 0}/${s.sesiones_periodo ?? 0}</div>
              </div></div>
              <div class="col-4"><div class="p-2 rounded bg-body">
                <div class="text-muted" style="font-size:.7rem;">ASISTENCIA</div>
                <div class="fw-bold text-success fs-6">${escapeHTML(fmtPct(a.tasa_global))}</div>
                <div class="text-muted" style="font-size:.65rem;">${a.total_marcas ?? 0} marcas</div>
              </div></div>
              <div class="col-4"><div class="p-2 rounded bg-body">
                <div class="text-muted" style="font-size:.7rem;">REGISTRO PUNTUAL</div>
                <div class="fw-bold text-warning fs-6">${escapeHTML(fmtPct(a.pct_registro_puntual))}</div>
                <div class="text-muted" style="font-size:.65rem;">${a.marcas_tardias ?? 0} tardías</div>
              </div></div>
            </div>
          </div>

          <h6 class="fw-bold small mb-1">Desempeño docente</h6>
          ${docentesHTML}
          ${sinEvaluar.length === 0 ? '' : `
            <p class="text-muted mt-2 mb-0" style="font-size:.72rem;">
              <i class="bi bi-info-circle"></i>
              ${sinEvaluar.length} docente(s) sin actividad registrada no se clasifican:
              ausencia de datos no equivale a incumplimiento.
            </p>`}
        </div>`,
      onSave: () => {
        AppModal.close()
        router.navigate('reporte-cierre')
        return false
      },
    })

    const btnPdf = document.getElementById('btn-descargar-pdf-cierre')
    if (btnPdf) {
      btnPdf.addEventListener('click', async () => {
        const original = btnPdf.innerHTML
        btnPdf.disabled = true
        btnPdf.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Generando PDF…'
        try {
          const doc = await generarInformePdfCierreSemestre(reporte)
          const nombre = String(reporte.periodo?.nombre ?? 'periodo').replace(/[^\w-]+/g, '_')
          doc.save(`Informe_Cierre_${nombre}.pdf`)
          showToast('Informe PDF descargado')
        } catch (pdfErr) {
          showToast('Error al generar PDF: ' + pdfErr.message, 'danger')
        } finally {
          btnPdf.disabled = false
          btnPdf.innerHTML = original
        }
      })
    }
  }

  /**
   * Corte de período académico.
   */
  async function openActivarModal(periodoId) {
    const periodos = await PeriodosApi.getPeriodos()
    const periodo = periodos.find(p => p.id === periodoId)
    if (!periodo) {
      showToast('Período no encontrado', 'danger')
      return
    }
    if (periodo.cerrado) {
      showToast('No se puede activar un período cerrado', 'warning')
      return
    }

    const saliente = periodos.find(p => p.activo && p.id !== periodoId)

    AppModal.open({
      title: 'Corte de período académico',
      saveText: 'Confirmar activación',
      cancelText: 'Cancelar',
      body: `
        <div class="p-2">
          <div class="alert alert-warning border-warning-subtle d-flex align-items-start gap-2 mb-3">
            <i class="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
            <div>
              <strong class="d-block mb-1">Advertencia de integridad académica</strong>
              Se activará <strong>${escapeHTML(periodo.nombre)}</strong>${
                saliente ? ` y se desactivará <strong>${escapeHTML(saliente.nombre)}</strong>` : ''}.
            </div>
          </div>
          <p class="mb-2 small">Esta acción aplica los siguientes cambios:</p>
          <ul class="small text-muted mb-3 ps-3">
            <li class="mb-1"><strong>Período de referencia</strong>: el nuevo período pasa a ser el activo del sistema.</li>
            <li class="mb-1"><strong>Operación atómica</strong>: el cambio ocurre completo o no ocurre; el sistema no queda sin período activo.</li>
            <li class="mb-1"><strong>Consulta histórica</strong>: los registros del período saliente siguen disponibles para lectura.</li>
          </ul>
          <div class="alert alert-info border-info-subtle small mb-0">
            <i class="bi bi-info-circle"></i>
            <strong>Nota:</strong> activar un período <em>no</em> congela por sí solo los datos del anterior.
            El bloqueo de escritura histórica requiere cerrar el período desde el informe de cierre.
          </div>
        </div>`,
      onSave: async () => {
        try {
          await activarPeriodoAtomico(periodoId)
          showToast('Período activado correctamente')
          await loadPeriodos()
        } catch (error) {
          showToast(error.message, 'danger')
          return false
        }
      },
    })
  }

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

        const nuevoPeriodo = await PeriodosApi.crearPeriodo({ nombre, fecha_inicio, fecha_fin, activo: false })
        if (activo) {
          await activarPeriodoAtomico(nuevoPeriodo.id)
        }
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
          <input type="text" class="form-control" id="modal-nombre" value="${escapeHTML(periodo.nombre)}" required>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold small">Fecha Inicio *</label>
          <input type="date" class="form-control" id="modal-fecha_inicio" value="${escapeHTML(periodo.fecha_inicio)}" required>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold small">Fecha Fin *</label>
          <input type="date" class="form-control" id="modal-fecha_fin" value="${escapeHTML(periodo.fecha_fin)}" required>
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
      saveText: 'Eliminar',
      body: `<p>¿Estás seguro de que deseas eliminar el período <strong>${escapeHTML(periodo.nombre)}</strong>?</p>
             <div class="alert alert-warning small mb-0">
               <i class="bi bi-exclamation-triangle"></i>
               Las claves foráneas hacia este período están definidas como <code>ON DELETE SET NULL</code>:
               los registros asociados <strong>no se borran, quedan sin período asignado</strong> y dejan de
               aparecer en los informes de cierre. Esta acción no se puede deshacer.
             </div>`,
      onSave: async () => {
        try {
          await PeriodosApi.eliminarPeriodo(id)
          showToast('Período eliminado')
          await loadPeriodos()
        } catch (error) {
          showToast(error.message, 'danger')
          return false
        }
      }
    })
  }

  loadPeriodos()
}
