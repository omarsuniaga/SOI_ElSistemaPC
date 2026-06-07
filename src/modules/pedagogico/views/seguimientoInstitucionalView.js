import { supabase } from '../../../lib/supabaseClient.js'
import { router } from '../../../core/router/router.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { normalizeText } from '../../../core/utils/normalizeText.js'
import {
  listStudentCases, listAlerts, getCaseKPIs,
  createCaseFromAlert, discardAlert, markAlertReviewed,
  createStudentCase,
} from '../services/studentCasesService.js'
import { analyzeAllStudentsRisk, createAlertFromRisk } from '../services/studentRiskDetectorService.js'

const state = {
  container:    null,
  cases:        [],
  alerts:       [],
  kpis:         null,
  filtered:     [],
  filterEstado: '',
  filterRiesgo: '',
  filterBuscar: '',
}

export async function renderSeguimientoInstitucionalView(container) {
  if (!container) return
  state.container = container
  container.innerHTML = `
    <div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;">
      <div class="spinner-border text-primary"></div>
    </div>`
  await _load()
}

async function _load() {
  try {
    const [cases, alerts, kpis] = await Promise.all([
      listStudentCases({ limit: 200 }),
      listAlerts({ limit: 50, estado: 'pendiente' }),
      getCaseKPIs(),
    ])
    state.cases    = cases
    state.alerts   = alerts
    state.kpis     = kpis
    state.filtered = [...cases]
    _applyFilters()
    _render()
  } catch (err) {
    console.error('[seguimientoInstitucional]', err)
    state.container.innerHTML = `<div class="page-container"><div class="alert alert-warning">Error: ${err.message}</div></div>`
  }
}

const RIESGO_BADGE = {
  bajo:    'bg-info-subtle text-info-emphasis',
  medio:   'bg-warning-subtle text-warning-emphasis',
  alto:    'bg-warning text-dark',
  critico: 'bg-danger text-white',
}
const ESTADO_BADGE = {
  abierto:        'bg-primary-subtle text-primary-emphasis',
  en_seguimiento: 'bg-warning-subtle text-warning-emphasis',
  resuelto:       'bg-success-subtle text-success-emphasis',
  escalado:       'bg-danger-subtle text-danger-emphasis',
  archivado:      'bg-secondary-subtle text-secondary-emphasis',
}

function _render() {
  const k = state.kpis || {}
  state.container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-shield-check fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Seguimiento Institucional</h1>
          <p class="text-muted small mb-0">Alertas, casos y acciones institucionales</p>
        </div>
      </div>

      <div class="row g-3 mb-4">
        ${_kpiCard('bi-bell',                'Alertas pendientes',  k.alertasPendientes ?? 0,         'warning')}
        ${_kpiCard('bi-folder2-open',        'Casos abiertos',      k.casosAbiertos ?? 0,             'primary')}
        ${_kpiCard('bi-arrow-right-circle',  'En seguimiento',      k.casosEnSeguimiento ?? 0,        'info')}
        ${_kpiCard('bi-exclamation-octagon', 'Casos críticos',      k.casosCriticos ?? 0,             'danger')}
        ${_kpiCard('bi-calendar-x',          'Acciones vencidas',   k.proximasAccionesVencidas ?? 0,  'warning')}
        ${_kpiCard('bi-file-earmark-text',   'Cartas este mes',     k.cartasEsteMes ?? 0,             'success')}
      </div>

      <div class="d-flex flex-wrap gap-2 mb-4">
        <button class="btn btn-sm btn-primary" id="btn-analizar-riesgos"><i class="bi bi-search me-1"></i>Analizar riesgos</button>
        <button class="btn btn-sm btn-outline-primary" id="btn-nuevo-caso"><i class="bi bi-plus-lg me-1"></i>Nuevo caso manual</button>
        <button class="btn btn-sm btn-outline-secondary" id="btn-configurar-reglas"><i class="bi bi-sliders me-1"></i>Configurar reglas</button>
      </div>

      ${state.alerts.length > 0 ? `
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-warning-subtle d-flex align-items-center gap-2">
            <i class="bi bi-bell-fill text-warning"></i>
            <span class="fw-semibold">Alertas pendientes (${state.alerts.length})</span>
          </div>
          <div class="card-body p-0">
            ${state.alerts.map(_renderAlertRow).join('')}
          </div>
        </div>` : ''}

      <div class="d-flex flex-wrap gap-2 mb-3">
        <input type="text" class="form-control form-control-sm" id="filtro-buscar"
               placeholder="Buscar por alumno o título..." style="max-width:260px;"
               value="${state.filterBuscar}">
        <select class="form-select form-select-sm" id="filtro-estado" style="max-width:160px;">
          <option value="">Estado</option>
          <option value="abierto"        ${state.filterEstado === 'abierto'        ? 'selected' : ''}>Abierto</option>
          <option value="en_seguimiento" ${state.filterEstado === 'en_seguimiento' ? 'selected' : ''}>En seguimiento</option>
          <option value="resuelto"       ${state.filterEstado === 'resuelto'       ? 'selected' : ''}>Resuelto</option>
          <option value="escalado"       ${state.filterEstado === 'escalado'       ? 'selected' : ''}>Escalado</option>
          <option value="archivado"      ${state.filterEstado === 'archivado'      ? 'selected' : ''}>Archivado</option>
        </select>
        <select class="form-select form-select-sm" id="filtro-riesgo" style="max-width:140px;">
          <option value="">Nivel de riesgo</option>
          <option value="bajo"    ${state.filterRiesgo === 'bajo'    ? 'selected' : ''}>Bajo</option>
          <option value="medio"   ${state.filterRiesgo === 'medio'   ? 'selected' : ''}>Medio</option>
          <option value="alto"    ${state.filterRiesgo === 'alto'    ? 'selected' : ''}>Alto</option>
          <option value="critico" ${state.filterRiesgo === 'critico' ? 'selected' : ''}>Crítico</option>
        </select>
        <button class="btn btn-sm btn-outline-secondary" id="btn-limpiar-filtros">
          <i class="bi bi-x-circle me-1"></i>Limpiar
        </button>
      </div>

      <h6 class="fw-semibold mb-2">Casos (${state.filtered.length})</h6>
      <div id="cases-list">
        ${state.filtered.length === 0 ? `
          <div class="text-center py-5 text-muted">
            <i class="bi bi-folder fs-1 d-block mb-2 opacity-40"></i>
            <p>No hay casos con los filtros seleccionados.</p>
          </div>` : state.filtered.map(_renderCaseRow).join('')}
      </div>
    </div>`

  _attachEvents()
}

function _kpiCard(icon, label, value, color) {
  return `
    <div class="col-6 col-md-2">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body p-3">
          <div class="d-flex align-items-center gap-2 mb-1">
            <i class="bi ${icon} text-${color}" style="font-size:1rem;"></i>
            <span class="text-muted" style="font-size:0.7rem;">${label}</span>
          </div>
          <div class="fw-bold" style="font-size:1.5rem;line-height:1;">${value}</div>
        </div>
      </div>
    </div>`
}

function _renderAlertRow(a) {
  return `
    <div class="d-flex align-items-start gap-3 px-3 py-2 border-bottom" data-alert-id="${a.id}">
      <span class="badge ${RIESGO_BADGE[a.nivel_riesgo]} flex-shrink-0">${a.nivel_riesgo}</span>
      <div class="flex-grow-1 overflow-hidden">
        <div class="fw-semibold small text-truncate">${a.titulo}</div>
        ${a.descripcion ? `<div class="small text-muted text-truncate">${a.descripcion}</div>` : ''}
      </div>
      <div class="d-flex gap-1 flex-shrink-0">
        <button class="btn btn-sm btn-success btn-alert-create-case" data-alert-id="${a.id}" title="Crear caso"><i class="bi bi-plus-circle"></i></button>
        <button class="btn btn-sm btn-outline-secondary btn-alert-review" data-alert-id="${a.id}" title="Marcar revisada"><i class="bi bi-check"></i></button>
        <button class="btn btn-sm btn-outline-secondary btn-alert-discard" data-alert-id="${a.id}" title="Descartar"><i class="bi bi-x"></i></button>
      </div>
    </div>`
}

function _renderCaseRow(c) {
  return `
    <div class="card border-0 shadow-sm mb-2 case-row" data-case-id="${c.id}" style="cursor:pointer;">
      <div class="card-body py-2 px-3">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="flex-grow-1 overflow-hidden">
            <div class="fw-semibold small text-truncate">${c.titulo}</div>
            <div class="text-muted" style="font-size:0.72rem;">
              <span class="me-2"><i class="bi bi-person me-1"></i>${c.alumno_nombre || '—'}</span>
              <span class="me-2">${(c.tipo || '').replace(/_/g, ' ')}</span>
              ${c.proxima_accion ? `<span class="me-2"><i class="bi bi-arrow-right me-1"></i>${c.proxima_accion}${c.proxima_accion_fecha ? ` (${c.proxima_accion_fecha})` : ''}</span>` : ''}
              <span><i class="bi bi-calendar3 me-1"></i>${c.fecha_apertura || '—'}</span>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            <span class="badge ${RIESGO_BADGE[c.nivel_riesgo] || ''}">${c.nivel_riesgo}</span>
            <span class="badge ${ESTADO_BADGE[c.estado] || ''}">${(c.estado || '').replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>
    </div>`
}

function _applyFilters() {
  const term = normalizeText(state.filterBuscar)
  state.filtered = state.cases.filter(c => {
    if (state.filterEstado && c.estado !== state.filterEstado) return false
    if (state.filterRiesgo && c.nivel_riesgo !== state.filterRiesgo) return false
    if (term) {
      const text = normalizeText(`${c.titulo} ${c.alumno_nombre || ''} ${c.descripcion || ''}`)
      if (!text.includes(term)) return false
    }
    return true
  })
}

function _attachEvents() {
  const c = state.container

  c.querySelector('#btn-analizar-riesgos')?.addEventListener('click', _runRiskAnalysis)
  c.querySelector('#btn-nuevo-caso')?.addEventListener('click', _openNewCaseModal)
  c.querySelector('#btn-configurar-reglas')?.addEventListener('click', () => router.navigate('pedagogico-seguimiento-reglas'))

  c.querySelector('#filtro-buscar')?.addEventListener('input', (e) => {
    state.filterBuscar = e.target.value
    _applyFilters()
    const list = c.querySelector('#cases-list')
    if (list) list.innerHTML = state.filtered.length === 0
      ? `<div class="text-center py-5 text-muted"><i class="bi bi-folder fs-1 d-block mb-2 opacity-40"></i><p>No hay casos con los filtros seleccionados.</p></div>`
      : state.filtered.map(_renderCaseRow).join('')
    // Re-attach case row events for new rows
    list?.querySelectorAll('.case-row').forEach(row => {
      row.addEventListener('click', () => router.navigate(`pedagogico-caso?id=${row.dataset.caseId}`))
    })
  })
  c.querySelector('#filtro-estado')?.addEventListener('change', (e) => {
    state.filterEstado = e.target.value; _applyFilters(); _render()
  })
  c.querySelector('#filtro-riesgo')?.addEventListener('change', (e) => {
    state.filterRiesgo = e.target.value; _applyFilters(); _render()
  })
  c.querySelector('#btn-limpiar-filtros')?.addEventListener('click', () => {
    state.filterBuscar = ''; state.filterEstado = ''; state.filterRiesgo = ''
    _applyFilters(); _render()
  })

  c.querySelectorAll('.btn-alert-create-case').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const alertId = btn.dataset.alertId
      try {
        const caso = await createCaseFromAlert(alertId)
        router.navigate(`pedagogico-caso?id=${caso.id}`)
      } catch (err) { alert(`Error: ${err.message}`) }
    })
  })
  c.querySelectorAll('.btn-alert-review').forEach(btn => {
    btn.addEventListener('click', async (e) => { e.stopPropagation(); await markAlertReviewed(btn.dataset.alertId); await _load() })
  })
  c.querySelectorAll('.btn-alert-discard').forEach(btn => {
    btn.addEventListener('click', async (e) => { e.stopPropagation(); await discardAlert(btn.dataset.alertId); await _load() })
  })

  c.querySelectorAll('.case-row').forEach(row => {
    row.addEventListener('click', () => router.navigate(`pedagogico-caso?id=${row.dataset.caseId}`))
  })
}

async function _runRiskAnalysis() {
  const btn = state.container.querySelector('#btn-analizar-riesgos')
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Analizando...' }
  try {
    const risks = await analyzeAllStudentsRisk()
    let created = 0
    for (const r of risks) {
      if (r.nivelRiesgo) { await createAlertFromRisk(r); created++ }
    }
    alert(`Análisis completado. ${created} alerta(s) generada(s).`)
    await _load()
  } catch (err) {
    alert(`Error en el análisis: ${err.message}`)
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="bi bi-search me-1"></i>Analizar riesgos' }
  }
}

async function _openNewCaseModal() {
  const { data: alumnos } = await supabase.from('alumnos').select('id, nombre_completo').eq('activo', true).order('nombre_completo')

  AppModal.open({
    title:    'Nuevo caso institucional',
    size:     'lg',
    saveText: 'Crear caso',
    body: `
      <form id="form-nuevo-caso">
        <div class="row g-2">
          <div class="col-12">
            <label class="form-label small fw-semibold">Alumno *</label>
            <select class="form-select form-select-sm" id="nc-alumno" required>
              <option value="">Seleccioná un alumno...</option>
              ${(alumnos || []).map(a => `<option value="${a.id}" data-nombre="${a.nombre_completo}">${a.nombre_completo}</option>`).join('')}
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label small fw-semibold">Tipo de caso *</label>
            <select class="form-select form-select-sm" id="nc-tipo" required>
              <option value="seguimiento_pedagogico">Seguimiento pedagógico</option>
              <option value="asistencia_irregular">Asistencia irregular</option>
              <option value="tardanzas">Tardanzas</option>
              <option value="conducta">Conducta</option>
              <option value="situacion_familiar">Situación familiar</option>
              <option value="instrumento">Instrumento</option>
              <option value="compromiso">Compromiso</option>
              <option value="documentacion">Documentación</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label small fw-semibold">Nivel de riesgo</label>
            <select class="form-select form-select-sm" id="nc-riesgo">
              <option value="bajo" selected>Bajo</option>
              <option value="medio">Medio</option>
              <option value="alto">Alto</option>
              <option value="critico">Crítico</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label small fw-semibold">Título *</label>
            <input type="text" class="form-control form-control-sm" id="nc-titulo" required maxlength="160" placeholder="Ej: Ausencias reiteradas - mes de junio">
          </div>
          <div class="col-12">
            <label class="form-label small fw-semibold">Descripción</label>
            <textarea class="form-control form-control-sm" id="nc-descripcion" rows="3"></textarea>
          </div>
        </div>
      </form>
    `,
    onSave: async () => {
      const sel          = document.querySelector('#nc-alumno')
      const alumnoId     = sel?.value
      const alumnoNombre = sel?.selectedOptions[0]?.dataset.nombre
      const tipo         = document.querySelector('#nc-tipo')?.value
      const nivelRiesgo  = document.querySelector('#nc-riesgo')?.value
      const titulo       = document.querySelector('#nc-titulo')?.value?.trim()
      const descripcion  = document.querySelector('#nc-descripcion')?.value?.trim() || null

      if (!alumnoId || !tipo || !titulo) {
        alert('Completá alumno, tipo y título.')
        return false
      }

      try {
        const caso = await createStudentCase({
          alumno_id: alumnoId, alumno_nombre: alumnoNombre,
          tipo, titulo, descripcion, nivel_riesgo: nivelRiesgo, origen: 'manual',
        })
        router.navigate(`pedagogico-caso?id=${caso.id}`)
        return true
      } catch (err) { alert(`Error: ${err.message}`); return false }
    },
  })
}
