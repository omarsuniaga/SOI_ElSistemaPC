/**
 * AusentismoDashboardView — panel de solo lectura para ADM.
 * KPIs del ausentismo, histórico de casos cerrados y export a CSV.
 */

import {
  getPeriodoActivo,
  fetchKpisAusentismo,
  fetchCasosCerrados,
} from '../services/seguimientoAusentesService.js'
import { renderSeguimientoAusentesCardADM } from '../components/SeguimientoAusentesCardADM.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
import { AppModal } from '../../../shared/components/AppModal.js'

const PAGE_SIZE = 25

const state = {
  container: null,
  periodo: null,
  kpis: null,
  casos: [],
  desde: '',
  hasta: '',
  page: 1,
  pageSize: PAGE_SIZE,
  loading: false,
  loadingCasos: false,
}

export async function renderAusentismoDashboardView(container) {
  if (!container) return
  state.container = container
  state.page = 1
  container.innerHTML = _renderLoading()
  try {
    await _loadData()
    _render()
    _attachEvents()
  } catch (err) {
    console.error('[AusentismoDashboard]', err)
    container.innerHTML = `<div class="page-container"><div class="alert alert-warning">${escapeHTML(err.message)}</div></div>`
  }
}

async function _loadData() {
  state.loading = true
  try { state.periodo = await getPeriodoActivo() } catch (err) { console.error(err) }
  const [kpis, casos] = await Promise.all([
    fetchKpisAusentismo().catch((e) => { console.error(e); return null }),
    fetchCasosCerrados({ desde: state.desde || null, hasta: state.hasta || null }).catch((e) => { console.error(e); return [] }),
  ])
  state.kpis = kpis
  state.casos = casos
  state.loading = false
}

async function _refreshCasosOnly() {
  state.loadingCasos = true
  state.page = 1
  _renderCasosSection()

  try {
    state.casos = await fetchCasosCerrados({ desde: state.desde || null, hasta: state.hasta || null })
  } catch (err) {
    console.error('[AusentismoDashboard] Error al refrescar casos:', err)
    state.casos = []
  } finally {
    state.loadingCasos = false
    _renderCasosSection()
  }
}

function _renderLoading() {
  return `
    <div class="page-container">
      <div class="d-flex align-items-center justify-content-center" style="height:300px;">
        <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
      </div>
    </div>`
}

function _statsForCards() {
  const k = state.kpis || {}
  return {
    nivel1: k.nivel1 || 0,
    nivel2: k.nivel2 || 0,
    nivel3: k.nivel3 || 0,
    contactados72h: k.contactosUltimas72h || 0,
    totalContactos: k.totalAusentes || 0,
    retencionesActivas: k.retencionesActivas || 0,
    retencionesLevantadas: k.retencionesLevantadas || 0,
  }
}

function _render() {
  state.container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="brand-badge bg-danger bg-opacity-10 text-danger rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-graph-up fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h1 class="page-title mb-0">Ausencias — Resumen del Período</h1>
          <p class="text-muted small mb-0">${escapeHTML(state.periodo?.nombre || 'Período actual')} · ${state.kpis?.totalAusentes ?? 0} alumnos en seguimiento · ${state.kpis?.sinContacto ?? 0} sin contacto</p>
        </div>
        <button class="btn-help-trigger" id="btn-help-ausentismo-adm" title="¿Cómo funciona este panel?" aria-label="Ayuda sobre ausentismo ADM">
          <i class="bi bi-question"></i>
        </button>
      </div>

      <div class="d-flex align-items-center gap-2 bg-body-tertiary border rounded p-2 mb-4 small text-body-secondary" role="note">
        <i class="bi bi-shield-lock text-secondary"></i>
        <span><strong>Acceso de lectura (ADM):</strong> Las acciones de contacto, seguimiento y levantamiento de retención se gestionan desde el panel de Coordinación Académica.</span>
      </div>

      <div class="mb-4" aria-live="polite">
        <h2 class="h5 mb-3 fw-bold">Métricas clave</h2>
        ${renderSeguimientoAusentesCardADM(_statsForCards())}
      </div>

      <div class="card border-0 shadow-sm mb-4" id="card-casos-cerrados">
        <div class="card-header bg-body-tertiary d-flex flex-wrap align-items-center justify-content-between gap-2">
          <h2 class="h5 mb-0 fw-semibold">Casos cerrados (reincorporaciones y justificaciones)</h2>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <input type="date" class="form-control form-control-sm w-auto" data-desde value="${escapeHTML(state.desde)}" aria-label="Fecha desde">
            <span class="text-muted small">a</span>
            <input type="date" class="form-control form-control-sm w-auto" data-hasta value="${escapeHTML(state.hasta)}" aria-label="Fecha hasta">
            <button class="btn btn-sm btn-outline-secondary" data-filtrar title="Aplicar rango de fechas">Filtrar</button>
            <button class="btn btn-sm btn-outline-secondary" data-limpiar title="Limpiar filtro de fechas">Limpiar</button>
            <button class="btn btn-sm btn-outline-secondary" data-csv ${state.casos.length ? '' : 'disabled'}>
              <i class="bi bi-download me-1"></i>CSV
            </button>
          </div>
        </div>
        <div class="card-body p-0" id="casos-card-body">
          ${_renderCasosBodyHTML()}
        </div>
      </div>
    </div>`
}

function _renderCasosBodyHTML() {
  if (state.loadingCasos) {
    return `
      <div class="d-flex align-items-center justify-content-center p-5">
        <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
        <span class="text-muted small">Actualizando casos...</span>
      </div>`
  }

  const total = state.casos.length
  if (total === 0) {
    return `
      <div class="text-center py-5 px-3" data-empty-state>
        <div class="mb-2 text-secondary opacity-50">
          <i class="bi bi-inbox fs-1"></i>
        </div>
        <p class="fw-semibold text-body-secondary mb-1">Sin casos cerrados</p>
        <p class="text-muted small mb-0">No se encontraron reincorporaciones ni justificaciones en el rango de fechas seleccionado.</p>
      </div>`
  }

  const totalPages = Math.max(1, Math.ceil(total / state.pageSize))
  const currentPage = Math.min(Math.max(1, state.page), totalPages)
  const startIdx = (currentPage - 1) * state.pageSize
  const endIdx = Math.min(startIdx + state.pageSize, total)
  const pagedCasos = state.casos.slice(startIdx, endIdx)

  return `
    <div class="table-responsive">
      <table class="table table-sm table-hover mb-0 align-middle">
        <caption class="visually-hidden">Histórico de casos de ausentismo cerrados, justificados o reincorporados</caption>
        <thead class="table-light">
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Alumno</th>
            <th scope="col">Nivel</th>
            <th scope="col">Canal</th>
            <th scope="col">Resultado</th>
            <th scope="col">Contacto</th>
            <th scope="col">Notas</th>
          </tr>
        </thead>
        <tbody>
          ${pagedCasos.map((c, idx) => {
            const rowIdx = startIdx + idx
            const alumnoNombre = c.alumno_nombre || c.alumnos?.nombre_completo || '—'
            const notasRaw = c.notas || '—'
            const hasNotas = Boolean(c.notas && c.notas.trim() && c.notas !== '—')
            return `
            <tr>
              <td class="small">${escapeHTML(String(c.fecha || '').slice(0, 10))}</td>
              <td class="small fw-semibold">${escapeHTML(alumnoNombre)}</td>
              <td class="small">N${escapeHTML(c.nivel ?? '—')}</td>
              <td class="small text-capitalize">${escapeHTML(c.canal || '—')}</td>
              <td class="small">${escapeHTML(c.resultado || '—')}</td>
              <td class="small">${escapeHTML(c.contacto_nombre || '—')}</td>
              <td class="small" style="max-width:280px">
                <div class="d-flex align-items-center gap-1">
                  <span class="text-truncate" title="${escapeHTML(notasRaw)}">${escapeHTML(notasRaw)}</span>
                  ${hasNotas ? `
                    <button class="btn btn-link btn-sm p-0 text-secondary flex-shrink-0" data-view-note="${rowIdx}" title="Ver nota completa" aria-label="Ver nota completa">
                      <i class="bi bi-eye"></i>
                    </button>` : ''}
                </div>
              </td>
            </tr>`
          }).join('')}
        </tbody>
      </table>
    </div>
    <div class="d-flex flex-wrap align-items-center justify-content-between p-2 border-top bg-body-tertiary">
      <span class="text-muted small" data-pagination-info>
        Mostrando ${startIdx + 1}–${endIdx} de ${total} casos
      </span>
      <div class="btn-group btn-group-sm">
        <button class="btn btn-outline-secondary" data-page-prev ${currentPage <= 1 ? 'disabled' : ''} aria-label="Página anterior">
          <i class="bi bi-chevron-left me-1"></i>Anterior
        </button>
        <span class="btn btn-outline-secondary disabled text-body small">
          Pág. ${currentPage} / ${totalPages}
        </span>
        <button class="btn btn-outline-secondary" data-page-next ${currentPage >= totalPages ? 'disabled' : ''} aria-label="Página siguiente">
          Siguiente<i class="bi bi-chevron-right ms-1"></i>
        </button>
      </div>
    </div>`
}

function _renderCasosSection() {
  const body = state.container?.querySelector('#casos-card-body')
  if (body) {
    body.innerHTML = _renderCasosBodyHTML()
    _attachCasosEvents()
  }
  // Sync CSV button state
  const csvBtn = state.container?.querySelector('[data-csv]')
  if (csvBtn) {
    if (state.casos.length > 0) {
      csvBtn.removeAttribute('disabled')
    } else {
      csvBtn.setAttribute('disabled', 'disabled')
    }
  }
}

function _abrirAyuda() {
  HelpPanel.open({
    title: 'Panel de Ausentismo (ADM)',
    intro: 'Vista consolidada de control institucional sobre el ausentismo estudiantil y las acciones de retención o reincorporación.',
    sections: [
      {
        icon: 'bi-shield-check',
        title: 'Modo Solo Lectura',
        description: 'La administración supervisa indicadores y métricas de contacto. El contacto directo y las actas de retención se gestionan en Coordinación Académica.',
      },
      {
        icon: 'bi-graph-up-arrow',
        title: 'Niveles de Ausentismo',
        description: 'Nivel 1 (aviso preventivo), Nivel 2 (comunicación formal con plazo) y Nivel 3 (retención de instrumento con firma de acta).',
      },
      {
        icon: 'bi-archive',
        title: 'Casos Cerrados',
        description: 'Historial de contactos que concluyeron en reincorporación, justificación o resolución del caso. Podés filtrar por rango de fechas y exportar a CSV.',
      },
    ],
  })
}

function _abrirNotaModal(casoIndex) {
  const caso = state.casos[casoIndex]
  if (!caso) return

  const alumnoNombre = caso.alumno_nombre || caso.alumnos?.nombre_completo || 'Alumno'
  const fecha = String(caso.fecha || '').slice(0, 10)
  const canal = caso.canal || '—'
  const contacto = caso.contacto_nombre || '—'
  const notas = caso.notas || 'Sin notas adicionales.'

  AppModal.open({
    title: `<i class="bi bi-journal-text me-2"></i>Detalle de Nota — ${escapeHTML(alumnoNombre)}`,
    body: `
      <div class="d-flex flex-column gap-3">
        <div class="row g-2 small text-muted border-bottom pb-2">
          <div class="col-sm-4"><strong>Fecha:</strong> ${escapeHTML(fecha)}</div>
          <div class="col-sm-4"><strong>Canal:</strong> ${escapeHTML(canal)}</div>
          <div class="col-sm-4"><strong>Contacto:</strong> ${escapeHTML(contacto)}</div>
        </div>
        <div>
          <label class="form-label fw-semibold small text-secondary mb-1">Nota o Justificación Registrada:</label>
          <div class="p-3 bg-body-tertiary rounded border text-body text-break font-monospace small" style="white-space: pre-wrap;">${escapeHTML(notas)}</div>
        </div>
      </div>
    `,
    size: 'md',
    hideSave: true,
    cancelText: 'Cerrar',
  })
}

function _attachCasosEvents() {
  const body = state.container?.querySelector('#casos-card-body')
  if (!body) return

  // Pagination buttons
  body.querySelector('[data-page-prev]')?.addEventListener('click', () => {
    if (state.page > 1) {
      state.page--
      _renderCasosSection()
    }
  })

  body.querySelector('[data-page-next]')?.addEventListener('click', () => {
    const totalPages = Math.ceil(state.casos.length / state.pageSize)
    if (state.page < totalPages) {
      state.page++
      _renderCasosSection()
    }
  })

  // Modal note triggers
  body.querySelectorAll('[data-view-note]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-view-note'), 10)
      if (!isNaN(idx)) {
        _abrirNotaModal(idx)
      }
    })
  })
}

function _attachEvents() {
  const c = state.container
  if (!c) return

  // Ayuda HelpPanel
  c.querySelector('#btn-help-ausentismo-adm')?.addEventListener('click', _abrirAyuda)

  // Filtro de fechas no destructivo
  c.querySelector('[data-filtrar]')?.addEventListener('click', async () => {
    state.desde = c.querySelector('[data-desde]')?.value || ''
    state.hasta = c.querySelector('[data-hasta]')?.value || ''
    await _refreshCasosOnly()
  })

  // Limpiar fechas
  c.querySelector('[data-limpiar]')?.addEventListener('click', async () => {
    state.desde = ''
    state.hasta = ''
    const desdeInput = c.querySelector('[data-desde]')
    const hastaInput = c.querySelector('[data-hasta]')
    if (desdeInput) desdeInput.value = ''
    if (hastaInput) hastaInput.value = ''
    await _refreshCasosOnly()
  })

  // Exportar CSV
  c.querySelector('[data-csv]')?.addEventListener('click', () => _exportCsv())

  // Delegación de eventos dentro de la tabla de casos (paginación, notas)
  _attachCasosEvents()
}

function _exportCsv() {
  const rows = state.casos
  if (!rows.length) return
  const head = ['fecha', 'alumno', 'nivel', 'canal', 'resultado', 'contacto', 'notas']
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const body = rows.map((r) => {
    const alumnoNombre = r.alumno_nombre || r.alumnos?.nombre_completo || ''
    return [
      String(r.fecha || '').slice(0, 10), alumnoNombre, r.nivel ?? '', r.canal ?? '', r.resultado ?? '', r.contacto_nombre ?? '', r.notas ?? '',
    ].map(esc).join(',')
  })
  const csv = [head.join(','), ...body].join('\r\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `casos-ausentismo-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
