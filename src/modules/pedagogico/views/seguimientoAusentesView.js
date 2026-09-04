import { AppModal } from '../../../shared/components/AppModal.js'
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
import {
  getPeriodoActivo,
  fetchSeguimientoAusentes,
  fetchHistorialSeguimiento,
  resolverContactoAlumno,
} from '../services/seguimientoAusentesService.js'
import { whatsappLink } from '../../../shared/utils/phoneUtils.js'

const state = {
  alumnos: [],
  busqueda: '',
  container: null,
  totalCount: 0,
  nivel3Count: 0,
  periodo: null,
  limit: 50,
  offset: 0,
  loading: false,
  filtroNivel: null,
  filtroMaestro: null,
  soloSinContacto: false,
  maestros: [],
}

export async function renderSeguimientoAusentesView(container) {
  if (!container) return
  state.container = container
  container.innerHTML = _renderLoading()

  try {
    await _loadData()
    _render()
    _attachEvents()
  } catch (err) {
    console.error('[SeguimientoAusentes]', err)
    container.innerHTML = `<div class="page-container"><div class="alert alert-warning">${err.message}</div></div>`
  }
}

async function _loadData() {
  state.loading = true
  state.periodo = await getPeriodoActivo()

  const result = await fetchSeguimientoAusentes({
    nivel: state.filtroNivel,
    maestroId: state.filtroMaestro,
    soloSinContacto: state.soloSinContacto,
    busqueda: state.busqueda,
    limit: state.limit,
    offset: state.offset,
  })

  state.alumnos = result.alumnos || []
  state.totalCount = result.totalCount || 0

  // Count nivel 3 for banner
  state.nivel3Count = state.alumnos.filter((a) => a.nivel === 3).length

  // Extract unique maestros for filter dropdown
  const maestroSet = new Set()
  state.alumnos.forEach((a) => {
    if (a.maestro_id && a.maestro_nombre) {
      maestroSet.add(JSON.stringify({ id: a.maestro_id, nombre: a.maestro_nombre }))
    }
  })
  state.maestros = Array.from(maestroSet).map((s) => JSON.parse(s))

  state.loading = false
}

function _renderLoading() {
  return `
    <div class="page-container">
      <div class="d-flex align-items-center justify-content-center" style="height:300px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
    </div>
  `
}

function _render() {
  const currentPage = Math.floor(state.offset / state.limit) + 1
  const totalPages = Math.max(1, Math.ceil(state.totalCount / state.limit))

  state.container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-warning bg-opacity-10 text-warning rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-exclamation-circle fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h1 class="page-title mb-0">Seguimiento de Ausentes</h1>
          <p class="text-muted small mb-0">${state.periodo?.nombre} - ${state.totalCount} alumno${state.totalCount !== 1 ? 's' : ''} | N1: ${state.alumnos.filter((a) => a.nivel === 1).length} | N2: ${state.alumnos.filter((a) => a.nivel === 2).length} | N3: ${state.alumnos.filter((a) => a.nivel === 3).length}</p>
        </div>
        <button class="btn-help-trigger" id="btn-help-ausentes" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
          <i class="bi bi-question"></i>
        </button>
      </div>

      <!-- Nivel 3 Banner -->
      ${state.nivel3Count > 0 ? `
        <div class="alert alert-danger border-0 d-flex align-items-center gap-2 mb-3 py-2" data-nivel3-alert>
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span style="font-size:0.85rem;"><strong>${state.nivel3Count}</strong> alumno${state.nivel3Count !== 1 ? 's' : ''} en nivel 3 (retención de instrumento)</span>
        </div>
      ` : ''}

      <!-- Filtros -->
      <div class="mb-3 p-2 bg-body-tertiary border rounded">
        <div class="row g-2">
          <div class="col-md-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control border-start-0" id="busqueda-ausente"
                     placeholder="Buscar alumno..." value="${state.busqueda}">
            </div>
          </div>
          <div class="col-md-2">
            <select class="form-select form-select-sm" id="filtro-nivel" data-filter="nivel">
              <option value="">Todos los niveles</option>
              <option value="1" ${state.filtroNivel === 1 ? 'selected' : ''}>Nivel 1</option>
              <option value="2" ${state.filtroNivel === 2 ? 'selected' : ''}>Nivel 2</option>
              <option value="3" ${state.filtroNivel === 3 ? 'selected' : ''}>Nivel 3</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select form-select-sm" id="filtro-maestro" data-filter="maestro">
              <option value="">Todos los maestros</option>
              ${state.maestros.map((m) => `<option value="${m.id}" ${state.filtroMaestro === m.id ? 'selected' : ''}>${m.nombre}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-3">
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="checkbox" id="solo-sin-contacto" data-filter="solo-sin-contacto" ${state.soloSinContacto ? 'checked' : ''}>
              <label class="form-check-label small" for="solo-sin-contacto">Sólo sin contactar</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista -->
      <div class="d-flex flex-column gap-2" id="lista-ausentes">
        ${state.alumnos.length > 0
          ? state.alumnos.map((a) => _renderAlumnoRow(a)).join('')
          : '<div class="text-center text-muted py-5" data-empty-state>Sin alumnos con ausencias acumuladas en el período.</div>'}
      </div>

      <!-- Paginación -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <button class="btn btn-sm btn-outline-secondary" id="btn-prev-page" ${state.offset <= 0 ? 'disabled' : ''}>
          <i class="bi bi-chevron-left me-1"></i>Anterior
        </button>
        <span class="text-muted small" data-pagination-info>Mostrando ${state.offset + 1}-${Math.min(state.offset + state.alumnos.length, state.totalCount)} de ${state.totalCount}</span>
        <button class="btn btn-sm btn-outline-secondary" id="btn-next-page" ${state.offset + state.limit >= state.totalCount ? 'disabled' : ''}>
          Siguiente<i class="bi bi-chevron-right ms-1"></i>
        </button>
      </div>
    </div>
  `

}

function _abrirAyuda() {
  HelpPanel.open({
    title: 'Seguimiento de Ausentes',
    intro: 'El contador es la cantidad de DÍAS (no sesiones) con inasistencias sin justificar que el alumno acumula en el período actual. Si falta a varias clases el mismo día, cuenta una sola vez.',
    sections: [
      { icon: 'bi-1-circle-fill', title: 'Nivel 1 — Aviso preventivo', description: 'Se contacta al representante para entender la situación.', color: '#d99a2b' },
      { icon: 'bi-2-circle-fill', title: 'Nivel 2 — Comunicación institucional', description: 'Mensaje formal con fecha límite. Requiere respuesta de la familia.', color: '#c2560f' },
      { icon: 'bi-3-circle-fill', title: 'Nivel 3 — Retención de instrumento', description: 'El instrumento queda retenido. El alumno se reincorpora firmando un acta de compromiso.', color: '#9a1f3a' },
      { icon: 'bi-sliders', title: 'Umbrales configurables', description: 'La cantidad de días de cada nivel la define el Departamento Académico en seguimiento_reglas.', color: '#6b7280' },
    ],
  })
}

// Colores de nivel: saturados, legibles sobre fondo claro y oscuro (no dependen del tema).
const NIVEL_STYLE = {
  1: { bg: '#b7791f', fg: '#fff' },
  2: { bg: '#c2410c', fg: '#fff' },
  3: { bg: '#9f1239', fg: '#fff' },
}

function _nivelStyle(nivel) {
  return NIVEL_STYLE[nivel] || { bg: 'var(--bs-secondary)', fg: '#fff' }
}

function _renderAlumnoRow(alumno) {
  const ns = _nivelStyle(alumno.nivel)
  const badgeStyle = `background:${ns.bg};color:${ns.fg};`

  return `
    <div class="card mb-2" data-alumno-id="${alumno.alumno_id}" style="border-left: 4px solid ${ns.bg}; cursor: pointer;">
      <div class="card-body p-3">
        <div class="row align-items-start g-3">
          <div class="col-md-4">
            <p class="mb-0"><strong>${alumno.alumno_nombre}</strong></p>
            <small class="text-muted">${alumno.instrumento_principal}</small>
            <p class="small text-muted mb-0">${alumno.clase_nombres}</p>
          </div>
          <div class="col-md-2">
            <div class="text-center">
              <div class="badge p-2 d-inline-block" data-nivel="${alumno.nivel}" style="font-size:1rem;${badgeStyle}">
                ${alumno.dias_ausente}
              </div>
              <p class="small text-muted mb-0">${alumno.dias_ausente} día${alumno.dias_ausente !== 1 ? 's' : ''}</p>
              <p class="small text-muted mb-0">${alumno.sesiones_ausente} sesiones</p>
            </div>
          </div>
          <div class="col-md-1">
            <span class="badge" style="${badgeStyle}">N${alumno.nivel}</span>
          </div>
          <div class="col-md-2">
            ${alumno.contacto_telefono
              ? `<p class="small mb-0"><strong>${alumno.contacto_nombre || 'Contacto'}</strong></p><p class="small text-muted mb-0">${alumno.contacto_telefono}</p>`
              : '<span class="badge bg-danger" data-sin-contacto>Sin contacto</span>'}
          </div>
          <div class="col-md-3">
            ${alumno.ultimo_seguimiento_fecha
              ? `<small class="text-muted">N${alumno.ultimo_seguimiento_nivel} • ${alumno.ultimo_seguimiento_fecha} • ${alumno.ultimo_seguimiento_resultado}</small>`
              : '<small class="text-muted">—</small>'}
          </div>
        </div>
      </div>
    </div>
  `
}

function _attachEvents() {
  // Ayuda
  state.container.querySelector('#btn-help-ausentes')?.addEventListener('click', _abrirAyuda)

  // Debounced search
  const busquedaInput = state.container.querySelector('#busqueda-ausente')
  if (busquedaInput) {
    let debounceTimer
    busquedaInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(async () => {
        state.busqueda = e.target.value
        state.offset = 0
        await _loadData()
        _render()
        _attachEvents()
      }, 300)
    })
  }

  // Filtro nivel
  const nivelSelect = state.container.querySelector('#filtro-nivel')
  if (nivelSelect) {
    nivelSelect.addEventListener('change', async (e) => {
      state.filtroNivel = e.target.value ? parseInt(e.target.value) : null
      state.offset = 0
      await _loadData()
      _render()
      _attachEvents()
    })
  }

  // Filtro maestro
  const maestroSelect = state.container.querySelector('#filtro-maestro')
  if (maestroSelect) {
    maestroSelect.addEventListener('change', async (e) => {
      state.filtroMaestro = e.target.value || null
      state.offset = 0
      await _loadData()
      _render()
      _attachEvents()
    })
  }

  // Filtro sin contacto
  const soloSinContactoCheck = state.container.querySelector('#solo-sin-contacto')
  if (soloSinContactoCheck) {
    soloSinContactoCheck.addEventListener('change', async (e) => {
      state.soloSinContacto = e.target.checked
      state.offset = 0
      await _loadData()
      _render()
      _attachEvents()
    })
  }

  // Pagination
  const prevBtn = state.container.querySelector('#btn-prev-page')
  if (prevBtn) {
    prevBtn.addEventListener('click', async () => {
      state.offset = Math.max(0, state.offset - state.limit)
      await _loadData()
      _render()
      _attachEvents()
    })
  }

  const nextBtn = state.container.querySelector('#btn-next-page')
  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      state.offset += state.limit
      await _loadData()
      _render()
      _attachEvents()
    })
  }

  // Row click → detail panel
  const rows = state.container.querySelectorAll('[data-alumno-id]')
  rows.forEach((row) => {
    row.addEventListener('click', async () => {
      const alumnoId = row.getAttribute('data-alumno-id')
      const alumno = state.alumnos.find((a) => a.alumno_id === alumnoId)
      if (alumno) {
        await _openDetailPanel(alumno)
      }
    })
  })
}

async function _openDetailPanel(alumno) {
  // Resolve cascade contact
  const contactCascade = await resolverContactoAlumno(alumno.alumno_id)

  // Histórico de contactos (vía data service)
  const historicoRows = await fetchHistorialSeguimiento(alumno.alumno_id)

  const modalContent = `
    <div class="modal-body" style="max-height: 80vh; overflow-y: auto;">
      <div class="row mb-4">
        <div class="col-md-6">
          <h5>Información del Alumno</h5>
          <p><strong>${alumno.alumno_nombre}</strong></p>
          <p class="text-muted small">${alumno.instrumento_principal} • ${alumno.clase_nombres}</p>
          <p class="text-muted small">Maestro: ${alumno.maestro_nombre}</p>
        </div>
        <div class="col-md-6">
          <h5>Contacto Resuelto</h5>
          ${contactCascade.origen
            ? `
              <p><strong>${contactCascade.nombre || 'N/A'}</strong></p>
              <p class="small text-muted">${contactCascade.telefono || 'N/A'}</p>
              <p class="small text-muted">Origen: ${contactCascade.origen}</p>
            `
            : '<p class="text-muted">Sin contacto disponible</p>'}
        </div>
      </div>

      <div class="row mb-4">
        <div class="col">
          <h5>Ausencias</h5>
          <p><strong>${alumno.dias_ausente}</strong> días | <strong>${alumno.sesiones_ausente}</strong> sesiones</p>
          <p class="small text-muted">Última ausencia: ${alumno.ultima_ausencia_fecha || '—'}</p>
        </div>
      </div>

      <div class="mb-4">
        <h5>Histórico de Seguimiento</h5>
        ${historicoRows.length > 0
          ? `
            <table class="table table-sm table-hover">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Nivel</th>
                  <th>Resultado</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                ${historicoRows
                  .map(
                    (h) => `
                  <tr>
                    <td class="small">${h.fecha || '—'}</td>
                    <td class="small">N${h.nivel || '—'}</td>
                    <td class="small">${h.resultado || '—'}</td>
                    <td class="small">${h.notas || '—'}</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          `
          : '<p class="text-muted small">Sin seguimiento registrado.</p>'}
      </div>

      <div class="mb-4">
        <h5>Acciones (Fase 2+)</h5>
        <div class="gap-2 d-flex">
          <button class="btn btn-sm btn-outline-primary" disabled title="Disponible en la próxima fase" data-action="contacto-nivel-1">
            Contactar Nivel 1
          </button>
          <button class="btn btn-sm btn-outline-warning" disabled title="Disponible en la próxima fase" data-action="contacto-nivel-2">
            Contactar Nivel 2
          </button>
          <button class="btn btn-sm btn-outline-danger" disabled title="Disponible en la próxima fase" data-action="retencion-nivel-3">
            Retener Instrumento
          </button>
        </div>
      </div>
    </div>
  `

  AppModal.open({
    title: `Detalle: ${alumno.alumno_nombre}`,
    body: modalContent,
    size: 'lg',
    hideSave: true,
    cancelText: 'Cerrar',
  })
}
