import { AppModal } from '../../../shared/components/AppModal.js'
import {
  getSesionesPorRango,
  getDetalleSesion,
  getReporteCompleto,
  getPeriodos,
  getPeriodoActivo,
  getClases,
  getMaestros,
  ESTADO_LABEL,
  ESTADOS,
} from '../api/asistenciasApi.js'
import { useAsistencias } from '../hooks/useAsistencias.js'
import { openAsistenciaJustificarModal } from '../components/asistenciaModal.js'

const hook = useAsistencias()

// ─── STATE ────────────────────────────────────────────────────────────────────

const state = {
  grupos: [],          // [{ fecha, sesiones[] }]
  periodos: [],
  periodoActivo: null,
  clases: [],
  maestros: [],
  filtro: {
    modo: 'periodo',   // 'periodo' | 'preset' | 'custom'
    periodoId: null,
    preset: 'mes',     // 'semana' | 'mes' | 'trimestre'
    desde: null,
    hasta: null,
    claseId: null,
    maestroId: null,
  },
  cargando: false,
}

// ─── ENTRY POINT ──────────────────────────────────────────────────────────────

export async function renderAsistenciasView(container) {
  // Reset stale loading state from previous navigation
  state.cargando = false
  container.innerHTML = esqueleto()
  await Promise.all([
    _cargarPeriodos(),
    _cargarClasesYMaestros()
  ])
  _bindFiltros(container)
  await _cargarTimeline()
}

async function _cargarClasesYMaestros() {
  const [clases, maestros] = await Promise.all([getClases(), getMaestros()])
  state.clases = clases
  state.maestros = maestros

  const selClase = document.getElementById('as-select-clase')
  const selMaestro = document.getElementById('as-select-maestro')

  clases.forEach(c => {
    const opt = document.createElement('option')
    opt.value = c.id
    opt.textContent = c.nombre
    selClase.appendChild(opt)
  })

  maestros.forEach(m => {
    const opt = document.createElement('option')
    opt.value = m.id
    opt.textContent = m.nombre_completo
    selMaestro.appendChild(opt)
  })
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function esqueleto() {
  return `
    <div class="asistencias-view px-3 px-md-4 py-3" style="max-width:900px;margin:0 auto;">

      <!-- Header -->
      <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h4 class="mb-0 fw-semibold"><i class="bi bi-calendar-check me-2 text-primary"></i>Asistencias</h4>
          <p class="text-secondary small mb-0">Historial de sesiones con registro de presencia</p>
        </div>
        <div class="d-flex gap-2 flex-wrap" id="as-download-bar"></div>
      </div>

      <!-- Filter bar -->
      <div class="card border-0 shadow-sm mb-4" style="background:var(--bs-body-bg)">
        <div class="card-body py-2 px-3">
          <div class="d-flex flex-wrap gap-2 align-items-center">

            <!-- Modo -->
            <div class="btn-group btn-group-sm" role="group">
              <input type="radio" class="btn-check" name="as-modo" id="as-modo-periodo" value="periodo" checked>
              <label class="btn btn-outline-primary" for="as-modo-periodo">Período</label>

              <input type="radio" class="btn-check" name="as-modo" id="as-modo-preset"  value="preset">
              <label class="btn btn-outline-primary" for="as-modo-preset">Rápido</label>

              <input type="radio" class="btn-check" name="as-modo" id="as-modo-custom"  value="custom">
              <label class="btn btn-outline-primary" for="as-modo-custom">Personalizado</label>
            </div>

            <!-- Panel período -->
            <div id="panel-periodo" class="d-flex gap-2 align-items-center flex-wrap">
              <select id="as-select-periodo" class="form-select form-select-sm" style="min-width:180px;">
                <option value="">— Todos los períodos —</option>
              </select>
              <select id="as-select-clase" class="form-select form-select-sm" style="min-width:150px;">
                <option value="">— Todas las clases —</option>
              </select>
              <select id="as-select-maestro" class="form-select form-select-sm" style="min-width:150px;">
                <option value="">— Todos los maestros —</option>
              </select>
            </div>

            <!-- Panel preset -->
            <div id="panel-preset" class="d-flex gap-2 flex-wrap" style="display:none!important">
              ${['semana','mes','trimestre'].map(p => `
                <input type="radio" class="btn-check" name="as-preset" id="as-preset-${p}" value="${p}" ${p==='mes'?'checked':''}>
                <label class="btn btn-outline-secondary btn-sm" for="as-preset-${p}">${_labelPreset(p)}</label>
              `).join('')}
            </div>

            <!-- Panel custom -->
            <div id="panel-custom" class="d-flex gap-2 align-items-center flex-wrap" style="display:none!important">
              <input type="date" id="as-desde" class="form-control form-control-sm" style="width:150px">
              <span class="text-secondary small">→</span>
              <input type="date" id="as-hasta" class="form-control form-control-sm" style="width:150px">
              <button id="as-btn-aplicar" class="btn btn-sm btn-primary">Aplicar</button>
            </div>

          </div>
        </div>
      </div>

      <!-- Summary bar -->
      <div id="as-summary-bar" class="d-flex gap-3 mb-3 flex-wrap" style="display:none!important"></div>

      <!-- Timeline -->
      <div id="as-timeline">
        ${_spinnerHTML()}
      </div>

    </div>
  `
}

// ─── FILTROS ──────────────────────────────────────────────────────────────────

async function _cargarPeriodos() {
  const [periodos, activo] = await Promise.all([getPeriodos(), getPeriodoActivo()])
  state.periodos = periodos
  state.periodoActivo = activo

  const sel = document.getElementById('as-select-periodo')
  if (!sel) return

  periodos.forEach(p => {
    const opt = document.createElement('option')
    opt.value = p.id
    opt.textContent = p.nombre + (p.activo ? ' ✦' : '')
    sel.appendChild(opt)
  })

  if (activo) {
    sel.value = activo.id
    state.filtro.periodoId = activo.id
  }
}

function _bindFiltros(container) {
  // Modo radio
  container.querySelectorAll('input[name="as-modo"]').forEach(r => {
    r.addEventListener('change', e => {
      state.filtro.modo = e.target.value
      _togglePanels()
      if (state.filtro.modo !== 'custom') _cargarTimeline()
    })
  })

  // Período select
  const sel = document.getElementById('as-select-periodo')
  if (sel) {
    sel.addEventListener('change', e => {
      state.filtro.periodoId = e.target.value || null
      _cargarTimeline()
    })
  }

  // Preset radios
  container.querySelectorAll('input[name="as-preset"]').forEach(r => {
    r.addEventListener('change', e => {
      state.filtro.preset = e.target.value
      _cargarTimeline()
    })
  })

  // Custom range
  const btnAplicar = document.getElementById('as-btn-aplicar')
  if (btnAplicar) {
    btnAplicar.addEventListener('click', () => {
      const desde = document.getElementById('as-desde')?.value
      const hasta = document.getElementById('as-hasta')?.value
      state.filtro.desde = desde || null
      state.filtro.hasta = hasta || null
      _cargarTimeline()
    })
  }

  // Clase select
  const selClase = document.getElementById('as-select-clase')
  if (selClase) {
    selClase.addEventListener('change', e => {
      state.filtro.claseId = e.target.value || null
      _cargarTimeline()
    })
  }

  // Maestro select
  const selMaestro = document.getElementById('as-select-maestro')
  if (selMaestro) {
    selMaestro.addEventListener('change', e => {
      state.filtro.maestroId = e.target.value || null
      _cargarTimeline()
    })
  }
}

function _togglePanels() {
  const modo = state.filtro.modo
  document.getElementById('panel-periodo').style.display = modo === 'periodo' ? '' : 'none'
  document.getElementById('panel-preset').style.display  = modo === 'preset'  ? '' : 'none'
  document.getElementById('panel-custom').style.display  = modo === 'custom'  ? '' : 'none'
}

function _resolverFiltro() {
  const { modo, periodoId, preset, desde, hasta, claseId, maestroId } = state.filtro
  const _asFiltrosBase = {
    ...(claseId ? { claseId } : {}),
    ...(maestroId ? { maestroId } : {}),
  }
  if (modo === 'periodo') return { ..._asFiltrosBase, periodoId: periodoId || undefined }
  if (modo === 'custom')  return { ..._asFiltrosBase, fechaInicio: desde, fechaFin: hasta }
  // preset
  const hoy    = new Date()
  const isoHoy = _toISO(hoy)

  if (preset === 'semana') {
    const lunes = new Date(hoy)
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
    return { ..._asFiltrosBase, fechaInicio: _toISO(lunes), fechaFin: isoHoy }
  }
  if (preset === 'mes') {
    return { ..._asFiltrosBase, fechaInicio: `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-01`, fechaFin: isoHoy }
  }
  // trimestre
  const mes       = hoy.getMonth()
  const iniMes    = Math.floor(mes / 3) * 3
  const iniTrim   = new Date(hoy.getFullYear(), iniMes, 1)
  return { ..._asFiltrosBase, fechaInicio: _toISO(iniTrim), fechaFin: isoHoy }
}

// ─── LOAD TIMELINE ────────────────────────────────────────────────────────────

async function _cargarTimeline() {
  if (state.cargando) return
  state.cargando = true

  const tl = document.getElementById('as-timeline')
  if (tl) tl.innerHTML = _spinnerHTML()

  try {
    const params = _resolverFiltro()
    state.grupos = await getSesionesPorRango(params)
    _renderTimeline()
    _renderSummaryBar()
    _renderDownloadBar(params)
  } catch (err) {
    if (tl) tl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`
  } finally {
    state.cargando = false
  }
}

// ─── RENDER TIMELINE ─────────────────────────────────────────────────────────

function _renderTimeline() {
  const tl = document.getElementById('as-timeline')
  if (!tl) return

  if (!state.grupos.length) {
    tl.innerHTML = `
      <div class="text-center py-5 text-secondary">
        <i class="bi bi-calendar-x fs-1 d-block mb-2"></i>
        Sin sesiones en este período
      </div>`
    return
  }

  tl.innerHTML = state.grupos.map(({ fecha, sesiones }) => `
    <div class="as-fecha-grupo mb-4">

      <!-- Fecha header -->
      <div class="d-flex align-items-center gap-2 mb-2">
        <span class="badge bg-primary-subtle text-primary-emphasis px-3 py-2 rounded-pill fw-semibold" style="font-size:.85rem;">
          <i class="bi bi-calendar3 me-1"></i>${_formatFecha(fecha)}
        </span>
        <div class="flex-grow-1" style="height:1px;background:var(--bs-border-color)"></div>
        <button
          class="btn btn-outline-secondary btn-sm py-0 px-2 as-dl-dia"
          data-fecha="${fecha}"
          title="Descargar reporte del día"
          style="font-size:.75rem;"
        >
          <i class="bi bi-download me-1"></i>Día
        </button>
      </div>

      <!-- Sessions -->
      <div class="d-flex flex-column gap-2 ms-2">
        ${sesiones.map(s => _tarjetaSesion(s)).join('')}
      </div>
    </div>
  `).join('')

  // Bind events
  tl.querySelectorAll('.as-btn-detalle').forEach(btn => {
    btn.addEventListener('click', () => _abrirDetalle(btn.dataset.sesionId))
  })

  tl.querySelectorAll('.as-dl-dia').forEach(btn => {
    btn.addEventListener('click', () => _descargarDia(btn.dataset.fecha))
  })
}

function _tarjetaSesion(s) {
  const total     = s.totalRegistros
  const pct       = total ? Math.round((s.totalPresentes / total) * 100) : null
  const pctColor  = pct === null ? 'secondary' : pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'danger'

  return `
    <div class="card border-0 shadow-sm" style="background:var(--bs-body-bg)">
      <div class="card-body py-2 px-3">
        <div class="d-flex align-items-start justify-content-between gap-2 flex-wrap">

          <!-- Info -->
          <div style="flex:1;min-width:0">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <span class="fw-semibold text-truncate" style="font-size:.93rem;">${_esc(s.claseNombre)}</span>
              ${s.instrumento ? `<span class="badge bg-secondary-subtle text-secondary-emphasis rounded-pill" style="font-size:.7rem;">${_esc(s.instrumento)}</span>` : ''}
              <span class="text-secondary" style="font-size:.8rem;">${s.horaInicio?.slice(0,5) ?? ''} – ${s.horaFin?.slice(0,5) ?? ''}</span>
            </div>
            <div class="text-secondary small mt-1">
              <i class="bi bi-person-circle me-1"></i>${_esc(s.maestroNombre)}
              ${s.temaPrincipal ? `<span class="ms-3"><i class="bi bi-book me-1"></i>${_esc(s.temaPrincipal)}</span>` : ''}
            </div>
          </div>

          <!-- Badges P/A/J -->
          <div class="d-flex align-items-center gap-1">
            ${total ? `
              <span class="badge bg-success-subtle text-success-emphasis px-2 py-1 rounded-pill" title="Presentes">
                P ${s.totalPresentes}
              </span>
              <span class="badge bg-danger-subtle text-danger-emphasis px-2 py-1 rounded-pill" title="Ausentes">
                A ${s.totalAusentes}
              </span>
              ${s.totalJustificados ? `
                <span class="badge bg-warning-subtle text-warning-emphasis px-2 py-1 rounded-pill" title="Justificados">
                  J ${s.totalJustificados}
                </span>` : ''}
              <span class="badge bg-${pctColor}-subtle text-${pctColor}-emphasis px-2 py-1 rounded-pill fw-bold" title="% asistencia">
                ${pct}%
              </span>
            ` : `<span class="badge bg-secondary-subtle text-secondary rounded-pill px-2">Sin registros</span>`}
            <button
              class="btn btn-outline-primary btn-sm ms-1 py-0 px-2 as-btn-detalle"
              data-sesion-id="${s.sesionId}"
              style="font-size:.78rem;"
            >Ver detalle</button>
          </div>

        </div>
      </div>
    </div>
  `
}

// ─── SUMMARY BAR ─────────────────────────────────────────────────────────────

function _renderSummaryBar() {
  const bar = document.getElementById('as-summary-bar')
  if (!bar) return

  if (!state.grupos.length) { bar.style.display = 'none'; return }

  let totalSesiones = 0, totalP = 0, totalA = 0, totalJ = 0, totalReg = 0
  for (const { sesiones } of state.grupos) {
    for (const s of sesiones) {
      totalSesiones++
      totalP   += s.totalPresentes
      totalA   += s.totalAusentes
      totalJ   += s.totalJustificados
      totalReg += s.totalRegistros
    }
  }
  const pct = totalReg ? Math.round((totalP / totalReg) * 100) : 0
  const pctColor = pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'danger'

  bar.style.display = ''
  bar.innerHTML = `
    <div class="d-flex align-items-center gap-2">
      <div class="progress flex-grow-1" style="height: 8px; min-width: 120px; max-width: 200px;" role="progressbar">
        <div class="progress-bar bg-success" style="width: ${totalReg ? (totalP/totalReg*100) : 0}%"></div>
        <div class="progress-bar bg-danger" style="width: ${totalReg ? (totalA/totalReg*100) : 0}%"></div>
        <div class="progress-bar bg-warning" style="width: ${totalReg ? (totalJ/totalReg*100) : 0}%"></div>
      </div>
      <span class="badge bg-${pctColor}">${pct}%</span>
    </div>
    <div class="d-flex gap-1 flex-wrap">
      ${_chip('bi-calendar3',     'secondary', `${totalSesiones} ses`)}
      ${_chip('bi-check-circle',  'success',   `${totalP}`)}
      ${_chip('bi-x-circle',      'danger',    `${totalA}`)}
      ${totalJ ? _chip('bi-exclamation-circle','warning',`${totalJ}`) : ''}
    </div>
  `
}

function _chip(icon, color, text) {
  return `
    <span class="badge bg-${color}-subtle text-${color}-emphasis px-3 py-2 rounded-pill" style="font-size:.82rem;">
      <i class="bi ${icon} me-1"></i>${text}
    </span>`
}

// ─── DOWNLOAD BAR ────────────────────────────────────────────────────────────

function _renderDownloadBar(params) {
  const bar = document.getElementById('as-download-bar')
  if (!bar) return

  bar.innerHTML = `
    <span class="text-secondary small align-self-center d-none d-sm-inline">Exportar:</span>
    <button class="btn btn-outline-success btn-sm as-exp-periodo" data-fmt="xlsx">
      <i class="bi bi-file-earmark-spreadsheet me-1"></i>Excel
    </button>
    <button class="btn btn-outline-danger btn-sm as-exp-periodo" data-fmt="pdf">
      <i class="bi bi-file-earmark-pdf me-1"></i>PDF
    </button>
    <button class="btn btn-outline-secondary btn-sm as-exp-periodo" data-fmt="md">
      <i class="bi bi-markdown me-1"></i>MD
    </button>
  `

  bar.querySelectorAll('.as-exp-periodo').forEach(btn => {
    btn.addEventListener('click', () => _exportarPeriodo(params, btn.dataset.fmt))
  })
}

// ─── DETALLE MODAL ────────────────────────────────────────────────────────────

async function _abrirDetalle(sesionId) {
  const container = document.getElementById('as-timeline')
  if (!container) return

  try {
    const { sesion, asistencias, observaciones, contenidos } = await getDetalleSesion(sesionId)

    const sesionData = {
      sesionId: sesion.id,
      fecha: sesion.fecha,
      claseNombre: sesion.claseNombre,
      instrumento: sesion.instrumento,
      horaInicio: sesion.horaInicio,
      horaFin: sesion.horaFin,
      maestroNombre: sesion.maestroNombre,
      temaPrincipal: sesion.temaPrincipal,
      lastModified: Date.now(),
      alumnos: asistencias.map(a => ({
        id: a.alumnoId,
        nombre: a.alumnoNombre,
        estado: ESTADO_LABEL[a.estado]?.short || null,
        justificacionTexto: a.justificacionTexto || '',
      })),
    }

    await renderTomarAsistencia(container, sesionData)

  } catch (err) {
    console.error('Error al abrir detalle:', err)
    AppModal.open({
      title: 'Error',
      body: `<div class="alert alert-danger mb-0">${err.message}</div>`,
      hideSave: true,
      cancelText: 'Cerrar',
    })
  }
}

function _bodyDetalle(sesion, asistencias, observaciones, contenidos) {
  const totalP = asistencias.filter(a => a.estado === 'presente').length
  const totalA = asistencias.filter(a => a.estado === 'ausente').length
  const totalJ = asistencias.filter(a => a.estado === 'justificado').length
  const pct    = asistencias.length ? Math.round((totalP / asistencias.length) * 100) : 0

  return `
    <!-- Sesión info -->
    <div class="d-flex gap-3 mb-3 flex-wrap">
      <div class="text-secondary small"><i class="bi bi-person-circle me-1"></i>${_esc(sesion.maestroNombre)}</div>
      <div class="text-secondary small"><i class="bi bi-clock me-1"></i>${sesion.horaInicio?.slice(0,5)} – ${sesion.horaFin?.slice(0,5)}</div>
      ${sesion.instrumento ? `<div class="text-secondary small"><i class="bi bi-music-note me-1"></i>${_esc(sesion.instrumento)}</div>` : ''}
    </div>
    ${sesion.temaPrincipal ? `<p class="small mb-1"><strong>Tema:</strong> ${_esc(sesion.temaPrincipal)}</p>` : ''}
    ${sesion.observacionesGenerales ? `<p class="small text-secondary mb-3">${_esc(sesion.observacionesGenerales)}</p>` : ''}

    <!-- Summary chips -->
    <div class="d-flex gap-2 mb-3 flex-wrap">
      <span class="badge bg-success-subtle text-success-emphasis px-3 py-2 rounded-pill">P ${totalP}</span>
      <span class="badge bg-danger-subtle text-danger-emphasis px-3 py-2 rounded-pill">A ${totalA}</span>
      ${totalJ ? `<span class="badge bg-warning-subtle text-warning-emphasis px-3 py-2 rounded-pill">J ${totalJ}</span>` : ''}
      <span class="badge bg-primary-subtle text-primary-emphasis px-3 py-2 rounded-pill">${pct}% asistencia</span>
    </div>

    <!-- Asistencias list -->
    ${asistencias.length ? `
      <h6 class="fw-semibold mb-2" style="font-size:.85rem;">Asistencias</h6>
      <div class="list-group list-group-flush mb-3" style="border-radius:.5rem;overflow:hidden;border:1px solid var(--bs-border-color)">
        ${asistencias.map(a => {
          const meta = ESTADO_LABEL[a.estado] ?? { short: '?', css: 'secondary' }
          return `
            <div class="list-group-item list-group-item-action py-2 px-3 d-flex align-items-center gap-2" style="background:var(--bs-body-bg)">
              <span class="badge bg-${meta.css}-subtle text-${meta.css}-emphasis rounded-pill px-2" style="width:28px;text-align:center">${meta.short}</span>
              <span class="flex-grow-1 small">${_esc(a.alumnoNombre)}</span>
              ${a.justificacionTexto ? `<span class="text-secondary" style="font-size:.75rem;" title="${_esc(a.justificacionTexto)}"><i class="bi bi-chat-dots"></i></span>` : ''}
            </div>`
        }).join('')}
      </div>
    ` : ''}

    <!-- Observaciones -->
    ${observaciones.length ? `
      <h6 class="fw-semibold mb-2" style="font-size:.85rem;">Observaciones de clase</h6>
      <div class="d-flex flex-column gap-2 mb-3">
        ${observaciones.map(o => `
          <div class="card border-0 bg-warning-subtle p-2 px-3" style="border-radius:.5rem;">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div>
                <span class="badge bg-warning text-dark rounded-pill me-1" style="font-size:.7rem;">${_esc(o.tipo ?? '')}</span>
                <span class="small fw-semibold">${_esc(o.titulo ?? o.descripcion ?? '')}</span>
                <div class="text-secondary" style="font-size:.78rem;">${_esc(o.alumnoNombre)}</div>
              </div>
              ${o.prioridad === 'alta' ? `<i class="bi bi-exclamation-triangle-fill text-danger" title="Prioridad alta"></i>` : ''}
            </div>
          </div>`).join('')}
      </div>
    ` : ''}

    <!-- Contenidos -->
    ${contenidos.length ? `
      <h6 class="fw-semibold mb-2" style="font-size:.85rem;">Contenidos trabajados</h6>
      <ul class="list-unstyled small text-secondary mb-3">
        ${contenidos.map(c => `<li class="mb-1"><i class="bi bi-check2 text-success me-1"></i>${_esc(c.descripcion ?? '')} ${c.nivelLogro ? `<span class="badge bg-secondary-subtle text-secondary ms-1">${_esc(c.nivelLogro)}</span>` : ''}</li>`).join('')}
      </ul>
    ` : ''}

    <!-- Download session -->
    <div class="d-flex gap-2 mt-1 flex-wrap">
      <span class="text-secondary small align-self-center">Exportar sesión:</span>
      <button class="btn btn-outline-success btn-sm py-0 px-2 as-dl-sesion" data-fmt="xlsx" style="font-size:.75rem;">
        <i class="bi bi-file-earmark-spreadsheet me-1"></i>Excel
      </button>
      <button class="btn btn-outline-danger btn-sm py-0 px-2 as-dl-sesion" data-fmt="pdf" style="font-size:.75rem;">
        <i class="bi bi-file-earmark-pdf me-1"></i>PDF
      </button>
      <button class="btn btn-outline-secondary btn-sm py-0 px-2 as-dl-sesion" data-fmt="md" style="font-size:.75rem;">
        <i class="bi bi-markdown me-1"></i>MD
      </button>
    </div>
  `
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

async function _exportarPeriodo(params, fmt) {
  try {
    const { grupos, resumen } = await getReporteCompleto(params)
    const { generarReporte } = await import('../utils/reportGenerator.js')
    await generarReporte({ grupos, resumen, fmt, nombre: 'reporte-periodo' })
  } catch (err) {
    alert('Error al generar el reporte: ' + err.message)
  }
}

async function _descargarDia(fecha) {
  const grupo = state.grupos.find(g => g.fecha === fecha)
  if (!grupo) return
  try {
    const { generarReporte } = await import('../utils/reportGenerator.js')
    const resumen = _resumenDeGrupos([grupo])
    await generarReporte({ grupos: [grupo], resumen, fmt: 'xlsx', nombre: `asistencias-${fecha}` })
  } catch (err) {
    alert('Error al generar el reporte: ' + err.message)
  }
}

async function _descargarSesion(sesion, asistencias, observaciones, fmt) {
  try {
    const { generarReporteSesion } = await import('../utils/reportGenerator.js')
    await generarReporteSesion({ sesion, asistencias, observaciones, fmt })
  } catch (err) {
    alert('Error al generar el reporte: ' + err.message)
  }
}

function _resumenDeGrupos(grupos) {
  let totalSesiones = 0, totalRegistros = 0, totalPresentes = 0, totalAusentes = 0, totalJustificados = 0
  for (const { sesiones } of grupos) {
    for (const s of sesiones) {
      totalSesiones++
      totalRegistros   += s.totalRegistros
      totalPresentes   += s.totalPresentes
      totalAusentes    += s.totalAusentes
      totalJustificados+= s.totalJustificados
    }
  }
  return { totalSesiones, totalRegistros, totalPresentes, totalAusentes, totalJustificados }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function _spinnerHTML() {
  return `<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>`
}

function _labelPreset(p) {
  return { semana: 'Esta semana', mes: 'Este mes', trimestre: 'Trimestre' }[p] ?? p
}

function _toISO(d) {
  return d.toISOString().slice(0, 10)
}

function _formatFecha(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  const fecha = new Date(+y, +m - 1, +d)
  return fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function _esc(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── TOMA DE ASISTENCIA ─────────────────────────────────────────────────────────

const tomaState = {
  sesion: null,
  alumnos: [],
  conflictBanner: false,
}

export async function renderTomarAsistencia(container, sesion) {
  tomaState.sesion = sesion
  tomaState.conflictBanner = false

  const draft = hook.loadDraft(sesion.sesionId)
  let alumnos = sesion.alumnos || []

  if (draft && draft.alumnos && draft.alumnos.length > 0) {
    alumnos = draft.alumnos
  }

  tomaState.alumnos = hook.reorderByMarked(alumnos.map(a => ({
    id: a.alumnoId || a.id,
    nombre: a.alumnoNombre || a.nombre,
    estado: a.estado || null,
    marcado: a.marcado || false,
    justificacionTexto: a.justificacionTexto || a.justificacion_texto || '',
    justificacionArchivo: a.justificacionArchivo || '',
  })))

  _renderTomaAsistenciaUI(container)
}

function _renderTomaAsistenciaUI(container) {
  container.innerHTML = _tomaAsistenciaSkeleton()

  const { sesion, alumnos } = tomaState
  const counts = _contarEstados(alumnos)

  _bindTomaEventos(container)
  _actualizarBarraProgreso(container, counts, alumnos.length)
  _renderListaAlumnos(container, hook.reorderByMarked(alumnos))

  const conflict = hook.checkConflict(sesion.sesionId, sesion.lastModified)
  if (conflict.hasConflict) {
    _mostrarBannerConflicto(container)
  }
}

function _tomaAsistenciaSkeleton() {
  const { sesion } = tomaState
  return `
    <div class="tomar-asistencia-view px-3 px-md-4 py-3" style="max-width:900px;margin:0 auto;">
      
      <!-- Banner conflicto -->
      <div id="conflicto-banner" class="alert alert-warning d-flex align-items-center gap-2 mb-3" style="display:none!important">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <span class="flex-grow-1">Esta sesión fue editada por otro usuario. ¿Qué deseas hacer?</span>
        <button class="btn btn-sm btn-warning" id="btn-sobrescribir">Sobrescribir</button>
        <button class="btn btn-sm btn-outline-secondary" id="btn-descartar">Descartar</button>
      </div>

      <!-- Header -->
      <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h5 class="mb-0 fw-semibold">
            <i class="bi bi-clipboard-check me-2 text-primary"></i>
            Tomar Asistencia
          </h5>
          <p class="text-secondary small mb-0">
            ${_esc(sesion?.claseNombre)} — ${_formatFecha(sesion?.fecha)}
            <span class="ms-2">${sesion?.horaInicio?.slice(0,5) || ''} – ${sesion?.horaFin?.slice(0,5) || ''}</span>
          </p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-success btn-sm" id="btn-todos-p" title="Marcar todos como Presentes">
            <i class="bi bi-check-all me-1"></i>Todos P
          </button>
          <button class="btn btn-danger btn-sm" id="btn-todos-a" title="Marcar todos como Ausentes">
            <i class="bi bi-x-circle me-1"></i>Todos A
          </button>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div class="card border-0 shadow-sm mb-4" style="background:var(--bs-body-bg)">
        <div class="card-body py-2 px-3">
          <div class="d-flex align-items-center gap-3">
            <div class="flex-grow-1">
              <div class="progress" style="height:12px;border-radius:.5rem;" id="progreso-bar">
                <div class="progress-bar bg-success" id="progreso-p" style="width:0%"></div>
                <div class="progress-bar bg-danger" id="progreso-a" style="width:0%"></div>
                <div class="progress-bar bg-warning" id="progreso-j" style="width:0%"></div>
              </div>
            </div>
            <div class="d-flex gap-2 align-items-center">
              <span class="badge bg-success-subtle text-success-emphasis" id="count-p">P: 0</span>
              <span class="badge bg-danger-subtle text-danger-emphasis" id="count-a">A: 0</span>
              <span class="badge bg-warning-subtle text-warning-emphasis" id="count-j">J: 0</span>
              <span class="badge bg-secondary-subtle text-secondary-emphasis" id="count-total">Total: 0</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de alumnos -->
      <div id="lista-alumnos" class="d-flex flex-column gap-2"></div>

      <!-- Acciones -->
      <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
        <button class="btn btn-outline-secondary" id="btn-cancelar">
          <i class="bi bi-arrow-left me-1"></i>Volver
        </button>
        <button class="btn btn-primary" id="btn-guardar-asistencia">
          <i class="bi bi-check-lg me-1"></i>Guardar Asistencia
        </button>
      </div>
    </div>
  `
}

function _contarEstados(alumnos) {
  let p = 0, a = 0, j = 0
  for (const alum of alumnos) {
    if (alum.estado === ESTADOS.PRESENTE || alum.estado === 'P') p++
    else if (alum.estado === ESTADOS.AUSENTE || alum.estado === 'A') a++
    else if (alum.estado === ESTADOS.JUSTIFICADO || alum.estado === 'J') j++
  }
  return { p, a, j }
}

function _actualizarBarraProgreso(container, counts, total) {
  if (total === 0) return
  const pctP = (counts.p / total) * 100
  const pctA = (counts.a / total) * 100
  const pctJ = (counts.j / total) * 100

  const barP = container.querySelector('#progreso-p')
  const barA = container.querySelector('#progreso-a')
  const barJ = container.querySelector('#progreso-j')

  if (barP) barP.style.width = pctP + '%'
  if (barA) barA.style.width = pctA + '%'
  if (barJ) barJ.style.width = pctJ + '%'

  const countP = container.querySelector('#count-p')
  const countA = container.querySelector('#count-a')
  const countJ = container.querySelector('#count-j')
  const countTotal = container.querySelector('#count-total')

  if (countP) countP.textContent = `P: ${counts.p}`
  if (countA) countA.textContent = `A: ${counts.a}`
  if (countJ) countJ.textContent = `J: ${counts.j}`
  if (countTotal) countTotal.textContent = `Total: ${total}`
}

function _renderListaAlumnos(container, alumnos) {
  const lista = container.querySelector('#lista-alumnos')
  if (!lista) return

  lista.innerHTML = alunos.map((alum, idx) => _tarjetaAlumno(alum, idx)).join('')

  lista.querySelectorAll('.btn-estado').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.closest('.alumno-card').dataset.index, 10)
      const estado = e.target.dataset.estado
      _marcarAlumno(index, estado)
    })
  })

  lista.querySelectorAll('.btn-justificar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.closest('.alumno-card').dataset.index, 10)
      _abrirJustificacion(index)
    })
  })

  lista.querySelectorAll('.btn-toggle-marcado').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.closest('.alumno-card').dataset.index, 10)
      _toggleMarcado(index)
    })
  })
}

function _tarjetaAlumno(alum, index) {
  const estado = alum.estado
  const esP = estado === 'P' || estado === ESTADOS.PRESENTE
  const esA = estado === 'A' || estado === ESTADOS.AUSENTE
  const esJ = estado === 'J' || estado === ESTADOS.JUSTIFICADO

  const btnPcls = `btn btn-sm btn-estado ${esP ? 'btn-success' : 'btn-outline-success'}`
  const btnAcls = `btn btn-sm btn-estado ${esA ? 'btn-danger' : 'btn-outline-danger'}`
  const btnJcls = `btn btn-sm btn-estado ${esJ ? 'btn-warning text-dark' : 'btn-outline-warning'}`

  const badgeEstado = estado
    ? `<span class="badge bg-${esP ? 'success' : esA ? 'danger' : 'warning'} text-${esJ ? 'dark' : 'white'} ms-2">${esP ? 'P' : esA ? 'A' : 'J'}</span>`
    : '<span class="badge bg-secondary ms-2">—</span>'

  return `
    <div class="alumno-card card border-0 shadow-sm" data-index="${index}" style="background:var(--bs-body-bg)">
      <div class="card-body py-2 px-3">
        <div class="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div class="d-flex align-items-center gap-2 flex-grow-1">
            <button class="btn btn-sm btn-toggle-marcado ${alum.marcado ? 'btn-primary' : 'btn-outline-secondary'}" title="Marcar para reordenar">
              <i class="bi ${alum.marcado ? 'bi-flag-fill' : 'bi-flag'}"></i>
            </button>
            <span class="fw-semibold" style="font-size:.9rem;">${_esc(alum.nombre)}</span>
            ${badgeEstado}
            ${alum.justificacionTexto ? `<i class="bi bi-chat-dots text-warning ms-1" title="${_esc(alum.justificacionTexto)}"></i>` : ''}
          </div>
          <div class="d-flex gap-1">
            <button class="${btnPcls}" data-estado="P" title="Presente">P</button>
            <button class="${btnAcls}" data-estado="A" title="Ausente">A</button>
            <button class="${btnJcls}" data-estado="J" title="Justificado">J</button>
            <button class="btn btn-sm btn-outline-info btn-justificar" title="Justificar">
              <i class="bi bi-file-earmark-text"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}

function _marcarAlumno(index, estado) {
  tomaState.alumnos[index].estado = estado
  if (estado === 'J') {
    tomaState.alumnos[index].marcado = false
  }
  _guardarDraftYActualizarUI()
}

function _toggleMarcado(index) {
  tomaState.alumnos[index].marcado = !tomaState.alumnos[index].marcado
  _guardarDraftYActualizarUI()
}

function _abrirJustificacion(index) {
  const alum = tomaState.alumnos[index]
  openAsistenciaJustificarModal(alum, (data) => {
    tomaState.alumnos[index].justificacionTexto = data.justificacionTexto
    tomaState.alumnos[index].justificacionArchivo = data.justificacionArchivo
    tomaState.alumnos[index].estado = 'J'
    _guardarDraftYActualizarUI()
  })
}

function _guardarDraftYActualizarUI() {
  const { sesion, alumnos } = tomaState
  hook.saveDraft(sesion.sesionId, { alumnos })

  const container = document.querySelector('.tomar-asistencia-view')
  if (!container) return

  const reordered = hook.reorderByMarked([...alumnos])
  const counts = _contarEstados(alumnos)

  _actualizarBarraProgreso(container, counts, alumnos.length)
  _renderListaAlumnos(container, reordered)
}

function _bindTomaEventos(container) {
  const btnTodosP = container.querySelector('#btn-todos-p')
  const btnTodosA = container.querySelector('#btn-todos-a')
  const btnGuardar = container.querySelector('#btn-guardar-asistencia')
  const btnCancelar = container.querySelector('#btn-cancelar')
  const btnSobrescribir = container.querySelector('#btn-sobrescribir')
  const btnDescartar = container.querySelector('#btn-descartar')

  btnTodosP?.addEventListener('click', () => _marcarTodos('P'))
  btnTodosA?.addEventListener('click', () => _marcarTodos('A'))
  btnGuardar?.addEventListener('click', () => _guardarAsistencia())
  btnCancelar?.addEventListener('click', () => {
    const container = document.querySelector('.tomar-asistencia-view')
    if (container) {
      container.innerHTML = ''
      renderAsistenciasView(container)
    }
  })

  btnSobrescribir?.addEventListener('click', () => {
    hook.clearDraft(tomaState.sesion.sesionId)
    tomaState.conflictBanner = false
    const container = document.querySelector('.tomar-asistencia-view')
    if (container) {
      const banner = container.querySelector('#conflicto-banner')
      if (banner) banner.style.display = 'none'
    }
  })

  btnDescartar?.addEventListener('click', () => {
    tomaState.alumnos = []
    _renderTomaAsistenciaUI(document.querySelector('.tomar-asistencia-view'))
  })
}

function _marcarTodos(estado) {
  for (const alum of tomaState.alumnos) {
    alum.estado = estado
    if (estado !== 'J') {
      alum.justificacionTexto = ''
      alum.justificacionArchivo = ''
    }
  }
  _guardarDraftYActualizarUI()
}

function _mostrarBannerConflicto(container) {
  const banner = container.querySelector('#conflicto-banner')
  if (banner) banner.style.display = 'flex'
  tomaState.conflictBanner = true
}

async function _guardarAsistencia() {
  const { sesion, alumnos } = tomaState

  const ausentes = []
  for (const alum of alumnos) {
    if (alum.estado === 'A' || alum.estado === ESTADOS.AUSENTE) {
      ausentes.push({
        id: alum.id,
        nombre: alum.nombre,
        estado: alum.estado,
        justificacionTexto: alum.justificacionTexto || '',
        justificacionArchivo: alum.justificacionArchivo || '',
      })
    }
  }

  const total = alumnos.length
  const presentes = total - ausentes.length

  console.log('Guardando asistencia:', { sesionId: sesion.sesionId, total, presentes, ausentes })

  hook.clearDraft(sesion.sesionId)

  AppModal.open({
    title: 'Asistencia Guardada',
    body: `<div class="text-center py-3">
      <i class="bi bi-check-circle-fill text-success fs-1 d-block mb-2"></i>
      <p class="mb-1">Se registraron <strong>${presentes}</strong> presentes de <strong>${total}</strong> alumnos.</p>
      ${ausentes.length > 0 ? `<p class="text-secondary small">${ausentes.length} ausentes</p>` : ''}
    </div>`,
    hideSave: true,
    cancelText: 'Cerrar',
  })

  const container = document.querySelector('.tomar-asistencia-view')
  if (container) {
    container.innerHTML = ''
    renderAsistenciasView(container)
  }
}
