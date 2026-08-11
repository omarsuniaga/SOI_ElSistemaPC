/**
 * gestionarClasesView.js
 * Teacher-facing class management portal.
 * Unified class roster: View enrolled & available students,
 * perform accent-insensitive search, accumulate selections non-destructively,
 * and register new students with real-time duplicate detection.
 *
 * Depends on: clasesApi (DataAdapter pattern), alumnosApi, crearAlumno
 */

import {
  obtenerClasesPorMaestro,
  obtenerAlumnosInscritos,
  obtenerAlumnosSinClase,
  inscribirAlumno,
  desinscribirAlumno,
} from '../../modules/clases/api/clasesApi.js'
import { obtenerAlumnos, crearAlumno } from '../../modules/alumnos/api/alumnosApi.js'
import { openClaseModal } from '../../modules/clases/components/claseModal.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { obtenerDatosCreadorClases } from '../api/crearClasePortalApi.js'
import { getPermisos, solicitarPermiso } from '../services/permisoService.js'
import { AppToast } from '../../shared/components/AppToast.js'

// ── Helpers ──────────────────────────────────────────────────────────────────

function escHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getInitials(name) {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function formatHorarios(horarios) {
  if (!horarios || horarios.length === 0)
    return '<span style="color:var(--pm-text-muted);font-size:.8rem;">Sin horario asignado</span>'
  const dayMap = {
    lunes: 'Lun',
    martes: 'Mar',
    miercoles: 'Mié',
    miércoles: 'Mié',
    jueves: 'Jue',
    viernes: 'Vie',
    sabado: 'Sáb',
    sábado: 'Sáb',
    domingo: 'Dom',
  }
  return horarios
    .map((h) => {
      const dia = dayMap[h.dia] || h.dia || ''
      const inicio = (h.hora_inicio || '').slice(0, 5)
      const fin = (h.hora_fin || '').slice(0, 5)
      return `<span class="gcv-horario-chip">${dia} ${inicio}–${fin}</span>`
    })
    .join(' ')
}

function normalizeAlumnosPayload(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.alumnos)) return payload.alumnos
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function flattenAlumnosSinClase(grupos = []) {
  if (!Array.isArray(grupos)) return []
  return grupos.flatMap((grupo) => (Array.isArray(grupo?.alumnos) ? grupo.alumnos : [])).filter(Boolean)
}

function normalizeSearch(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function getInstrumentOptions(alumnos = []) {
  return [...new Set(
    alumnos
      .map((alumno) => String(alumno.instrumento_principal || alumno.instrumento || '').trim())
      .filter(Boolean),
  )].sort((a, b) => a.localeCompare(b, 'es'))
}

// ── Duplicate Detection Logic ────────────────────────────────────────────────

function findDuplicateMatches(nombre = '', telefono = '', allStudents = []) {
  const normNombre = normalizeSearch(nombre)
  const normTel = String(telefono || '').replace(/\D/g, '')
  if (normNombre.length < 2 && normTel.length < 6) return []

  const nameTokens = normNombre.split(/\s+/).filter((t) => t.length >= 2)

  return allStudents.filter((student) => {
    const studentNormNombre = normalizeSearch(student.nombre_completo || student.nombre || '')
    const studentTel = String(student.familiar_telefono || student.telefono || '').replace(/\D/g, '')

    // Match by phone (at least 7 digits)
    if (normTel.length >= 7 && studentTel.length >= 7 && (normTel === studentTel || studentTel.endsWith(normTel) || normTel.endsWith(studentTel))) {
      return true
    }

    if (normNombre.length < 2) return false

    // Exact match or substring inclusion
    if (studentNormNombre === normNombre) return true
    if (studentNormNombre.includes(normNombre) || normNombre.includes(studentNormNombre)) return true

    // Multi-token match (e.g. "Dylan Machillanda" matches "Dylan" + "Machillanda")
    if (nameTokens.length >= 2) {
      const matchCount = nameTokens.filter((token) => studentNormNombre.includes(token)).length
      if (matchCount >= 2) return true
    }

    return false
  })
}

// ── Module state ──────────────────────────────────────────────────────────────

let _selectedClaseId = null
let _allStudents = [] // Cache of all active students for search
let _enrolledIds = new Set()
let _studentsWithoutClassIds = new Set()
let _selectedAvailableStudentIds = new Set() // Persistent selection queue across filters/searches
let _canEditClasses = false
let _classEditorSupport = null
let _rootContainer = null

// ── Main render ───────────────────────────────────────────────────────────────

export async function renderGestionarClasesView(container) {
  _rootContainer = container
  _classEditorSupport = null
  container.innerHTML = _skeletonHTML()

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = _emptyState(
      'bi-lock',
      'Sin sesión activa',
      'Por favor ingresá nuevamente.',
    )
    return
  }

  try {
    const permisos = await getPermisos(maestro.id)
    if (!permisos.puede_inscribir_clases) {
      container.innerHTML = _noPermissionState(permisos)
      _attachPermissionEvents(maestro.id)
      return
    }

    const [clases, alumnosPayload, gruposSinClase] = await Promise.all([
      obtenerClasesPorMaestro(maestro.id),
      obtenerAlumnos().catch(() => ({ alumnos: [] })),
      obtenerAlumnosSinClase().catch(() => []),
    ])

    const todosAlumnos = normalizeAlumnosPayload(alumnosPayload)

    _allStudents = (todosAlumnos || []).filter((a) => a && a.activo !== false && a.is_active !== false)
    _studentsWithoutClassIds = new Set(flattenAlumnosSinClase(gruposSinClase).map((alumno) => alumno.id))
    _canEditClasses = permisos.puede_inscribir_clases === true

    container.innerHTML = _buildShell(clases, { canCreateClasses: permisos.puede_crear_clases })
    _attachShellEvents(clases, permisos)

    if (clases.length > 0) {
      await _selectClase(clases[0].id, clases)
    }
  } catch (err) {
    console.error('[GestionarClases]', err)
    container.innerHTML = _emptyState(
      'bi-exclamation-triangle',
      'Error al cargar',
      escHTML(err.message),
    )
  }
}

function _hasPendingClassRequest(permisos) {
  const solicitudes = permisos?.solicitudes || []
  const solicitudActual = permisos?.solicitud_actual

  return (
    solicitudes.includes('clases:enroll') ||
    solicitudes.includes('inscribir_clases') ||
    (solicitudActual?.estado === 'pendiente' && solicitudActual?.solicita_clases)
  )
}

function _noPermissionState(permisos) {
  const pending = _hasPendingClassRequest(permisos)

  return `
    <div class="gcv-root">
      <div class="gcv-permission-card">
        <div class="gcv-permission-icon">
          <i class="bi bi-shield-exclamation"></i>
        </div>
        <h2 class="gcv-permission-title">Acceso de Colaborador Requerido</h2>
        <p class="gcv-permission-copy">
          Para gestionar clases e inscribir alumnos, necesitás que Admin active tu permiso de clases.
        </p>
        <div id="gcv-permission-action">
          ${
            pending
              ? `
            <div class="gcv-pending-badge">
              <i class="bi bi-clock-history"></i>
              Solicitud Pendiente de Aprobación
            </div>
          `
              : `
            <button class="gcv-btn gcv-btn-primary" id="gcv-btn-request-classes" type="button">
              <i class="bi bi-send-fill"></i>
              Solicitar Permiso de Clases
            </button>
          `
          }
        </div>
      </div>
    </div>
  `
}

function _attachPermissionEvents(maestroId) {
  const btn = document.getElementById('gcv-btn-request-classes')
  if (!btn) return

  btn.addEventListener('click', async () => {
    btn.disabled = true
    const originalHTML = btn.innerHTML
    btn.innerHTML = '<span class="gcv-spinner-sm"></span> Enviando...'

    try {
      await solicitarPermiso(maestroId, 'clases:enroll')
      AppToast.success('Solicitud de permiso enviada correctamente.')
      const action = document.getElementById('gcv-permission-action')
      if (action) {
        action.innerHTML = `
          <div class="gcv-pending-badge">
            <i class="bi bi-clock-history"></i>
            Solicitud Pendiente de Aprobación
          </div>`
      }
    } catch (err) {
      AppToast.error('Error al solicitar: ' + err.message)
      btn.disabled = false
      btn.innerHTML = originalHTML
    }
  })
}

// ── Shell layout ──────────────────────────────────────────────────────────────

function _buildShell(clases, { canCreateClasses = false } = {}) {
  return `
    <div class="gcv-root">
      <div class="gcv-header">
        <div class="gcv-header-left">
          <i class="bi bi-mortarboard gcv-header-icon"></i>
          <div>
            <h2 class="gcv-title">Mis Clases</h2>
            <p class="gcv-subtitle">${clases.length} clase${clases.length !== 1 ? 's' : ''} asignada${clases.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        ${canCreateClasses ? `
          <button type="button" class="gcv-btn gcv-btn-primary" id="gcv-btn-crear-clase">
            <i class="bi bi-plus-circle"></i> Nueva clase
          </button>
        ` : ''}
      </div>

      ${
        clases.length === 0
          ? _emptyState(
              'bi-calendar-x',
              'Sin clases asignadas',
              'El administrador debe asignarte clases primero.',
            )
          : `<div class="gcv-layout">
            <div class="gcv-clase-list" id="gcv-clase-list">
              ${clases.map((c) => _classCard(c)).join('')}
            </div>
            <div class="gcv-panel" id="gcv-panel">
              <div class="gcv-panel-placeholder">
                <i class="bi bi-arrow-left-circle" style="font-size:2.5rem;opacity:.3;"></i>
                <p style="margin-top:.75rem;opacity:.4;">Seleccioná una clase</p>
              </div>
            </div>
          </div>`
      }
    </div>
  `
}

function _classCard(clase) {
  const nombre = escHTML(clase.nombre || 'Clase sin nombre')
  const horarioHTML = formatHorarios(clase.horarios || [])
  const nivel = escHTML(clase.nivel || '')
  const capacidad = clase.capacidad_maxima ?? clase.max_alumnos ?? '–'
  return `
    <button class="gcv-clase-card" data-clase-id="${clase.id}" id="gcv-card-${clase.id}" type="button">
      <div class="gcv-clase-card-top">
        <div class="gcv-clase-avatar">
          <i class="bi bi-music-note-beamed"></i>
        </div>
        <div class="gcv-clase-info">
          <span class="gcv-clase-name">${nombre}</span>
          ${nivel ? `<span class="gcv-clase-nivel">${nivel}</span>` : ''}
        </div>
        <i class="bi bi-chevron-right gcv-clase-arrow"></i>
      </div>
      <div class="gcv-clase-horarios">${horarioHTML}</div>
      <div class="gcv-clase-meta">
        <span><i class="bi bi-people"></i> Cap. ${capacidad}</span>
      </div>
    </button>
  `
}

// ── Unified Student Roster Panel ──────────────────────────────────────────────

async function _selectClase(claseId, clases) {
  _selectedClaseId = claseId
  _selectedAvailableStudentIds.clear()

  // Highlight selected card
  document.querySelectorAll('.gcv-clase-card').forEach((c) => c.classList.remove('active'))
  document.getElementById(`gcv-card-${claseId}`)?.classList.add('active')

  const panel = document.getElementById('gcv-panel')
  if (!panel) return

  const clase = clases.find((c) => c.id === claseId)
  if (!clase) return

  panel.innerHTML = `<div class="gcv-loading"><div class="gcv-spinner"></div></div>`

  try {
    const inscritosRaw = await obtenerAlumnosInscritos(claseId)
    const inscritos = inscritosRaw.map((r) => r.alumno).filter(Boolean)
    _enrolledIds = new Set(inscritosRaw.map((r) => r.alumno_id))
    const disponibles = _allStudents.filter((a) => !_enrolledIds.has(a.id))

    panel.innerHTML = _buildPanel(clase, inscritos, disponibles)
    _attachPanelEvents(claseId, clases)
  } catch (err) {
    panel.innerHTML = _emptyState(
      'bi-exclamation-circle',
      'Error al cargar alumnos',
      escHTML(err.message),
    )
  }
}

function _buildPanel(clase, inscritos, disponibles) {
  const nombre = escHTML(clase.nombre || 'Clase')
  const totalRoster = inscritos.length + disponibles.length
  const sinClaseCount = disponibles.filter((a) => _studentsWithoutClassIds.has(a.id)).length
  const instrumentosTodos = getInstrumentOptions([...inscritos, ...disponibles])

  return `
    <div class="gcv-panel-inner">
      <!-- Header -->
      <div class="gcv-panel-header">
        <div>
          <h3 class="gcv-panel-title"><i class="bi bi-people-fill"></i> ${nombre}</h3>
          <p class="gcv-panel-subtitle">Gestiona inscripciones y alumnos de esta clase.</p>
        </div>
        <div class="gcv-panel-header-actions">
          <span class="gcv-enrolled-badge" id="gcv-count-inscritos-badge">${inscritos.length} inscrito${inscritos.length !== 1 ? 's' : ''}</span>
          ${
            _canEditClasses
              ? `
            <button type="button" class="gcv-btn gcv-btn-ghost" id="gcv-btn-editar-clase">
              <i class="bi bi-pencil-square"></i> Editar clase
            </button>
          `
              : ''
          }
        </div>
      </div>

      <!-- Universal Search & Actions Toolbar -->
      <div class="gcv-available-toolbar">
        <div class="gcv-search-row">
          <div class="gcv-search-bar gcv-search-bar-compact">
            <i class="bi bi-search gcv-search-icon"></i>
            <input
              type="text"
              id="gcv-disponibles-search"
              class="gcv-search-input gcv-universal-search"
              placeholder="Buscar por nombre o instrumento (inscritos y disponibles)..."
              autocomplete="off"
            />
          </div>
          <button class="gcv-btn-new" id="gcv-btn-nuevo" type="button" title="Registrar nuevo alumno en la academia">
            <i class="bi bi-person-plus"></i>
            <span>Nuevo</span>
          </button>
        </div>

        <!-- Selection Queue Banner -->
        <div id="gcv-selection-queue-bar" class="gcv-selection-queue-banner d-none">
          <span><i class="bi bi-check2-circle"></i> <span id="gcv-selection-queue-text">0 seleccionados en cola</span></span>
          <button type="button" id="gcv-btn-clear-selection">Desmarcar todos</button>
        </div>

        <!-- Filter Pills & Instrument Select -->
        <div class="gcv-filters-row">
          <div class="gcv-filter-pills" id="gcv-filter-pills">
            <button type="button" class="gcv-pill active" data-filter="all">Todos (${totalRoster})</button>
            <button type="button" class="gcv-pill" data-filter="inscritos">Inscritos (${inscritos.length})</button>
            <button type="button" class="gcv-pill" data-filter="disponibles">Disponibles (${disponibles.length})</button>
            <button type="button" class="gcv-pill" data-filter="sin-clase">Sin clase (${sinClaseCount})</button>
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;">
            <select id="gcv-filter-instrumento" class="gcv-input gcv-input-sm" aria-label="Filtrar por instrumento">
              <option value="">Todos los instrumentos</option>
              ${instrumentosTodos.map((instrumento) => `<option value="${escHTML(instrumento)}">${escHTML(instrumento)}</option>`).join('')}
            </select>
            <input type="checkbox" id="gcv-filter-sin-clase" class="d-none" />
          </div>
        </div>
      </div>

      <!-- Quick register form with Live Duplicate Detection -->
      <div class="gcv-new-form d-none" id="gcv-new-form">
        <p class="gcv-new-form-title"><i class="bi bi-person-plus-fill"></i> Registrar nuevo alumno</p>
        <div class="gcv-new-form-grid">
          <input type="text" id="gcv-nuevo-nombre" class="gcv-input" placeholder="Nombre completo *" autocomplete="off" />
          <input type="text" id="gcv-nuevo-instrumento" class="gcv-input" placeholder="Instrumento *" autocomplete="off" />
          <input type="tel" id="gcv-nuevo-telefono" class="gcv-input" placeholder="Teléfono representante *" autocomplete="off" />
        </div>
        <div id="gcv-dup-feedback" class="gcv-dup-feedback"></div>
        <div class="gcv-new-form-actions">
          <button type="button" class="gcv-btn gcv-btn-ghost" id="gcv-btn-cancelar-nuevo">Cancelar</button>
          <button type="button" class="gcv-btn gcv-btn-primary" id="gcv-btn-guardar-nuevo">
            <i class="bi bi-floppy"></i> Guardar e inscribir
          </button>
        </div>
      </div>

      <!-- Unified Roster Section -->
      <div class="gcv-section">
        <div class="gcv-section-header">
          <span class="gcv-section-label"><i class="bi bi-list-check gcv-icon-primary"></i> Lista de Alumnos</span>
          <span class="gcv-section-count" id="gcv-count-disponibles">${totalRoster} de ${totalRoster} alumnos</span>
        </div>

        <div id="gcv-lista-disponibles" class="gcv-student-list gcv-unified-list">
          ${
            totalRoster === 0
              ? '<p class="gcv-empty-list">No hay alumnos activos registrados.</p>'
              : `
                ${inscritos.map((a) => _rowInscrito(a)).join('')}
                ${disponibles.map((a) => _rowDisponible(a)).join('')}
              `
          }
        </div>

        <p class="gcv-empty-list d-none" id="gcv-empty-disponibles-filter">Ningún alumno coincide con los filtros de búsqueda.</p>

        <!-- Contextual Enrollment Button -->
        <div class="gcv-add-actions">
          <button type="button" class="gcv-btn gcv-btn-primary" id="gcv-btn-inscribir">
            <i class="bi bi-person-check"></i> Inscribir seleccionados
          </button>
        </div>
      </div>
    </div>
  `
}

function _rowInscrito(a) {
  const nombre = escHTML(a.nombre_completo || a.nombre || 'Alumno')
  const instrumento = escHTML(a.instrumento_principal || a.instrumento || '')
  return `
    <div class="gcv-student-row inscrito-item gcv-row-enrolled"
         data-alumno-id="${a.id}"
         data-is-enrolled="true"
         data-name="${normalizeSearch(nombre)}"
         data-instrumento="${normalizeSearch(instrumento)}"
         data-sin-clase="false">
      <div class="gcv-student-avatar gcv-avatar-success">${getInitials(nombre)}</div>
      <div class="gcv-student-data">
        <div style="display:flex;align-items:center;gap:.5rem;">
          <span class="gcv-student-name">${nombre}</span>
          <span class="gcv-badge-enrolled"><i class="bi bi-check-circle-fill"></i> Inscrito</span>
        </div>
        ${instrumento ? `<span class="gcv-student-sub"><i class="bi bi-music-note"></i> ${instrumento}</span>` : ''}
      </div>
      <button type="button" class="gcv-btn-remove desinscribir-btn" data-alumno-id="${a.id}" title="Quitar de la clase">
        <i class="bi bi-person-x"></i>
      </button>
    </div>
  `
}

function _rowDisponible(a) {
  const nombre = escHTML(a.nombre_completo || a.nombre || 'Alumno')
  const instrumento = escHTML(a.instrumento_principal || a.instrumento || '')
  const isSinClase = _studentsWithoutClassIds.has(a.id)
  const isSelected = _selectedAvailableStudentIds.has(a.id)

  return `
    <label class="gcv-student-row gcv-student-selectable disponible-item ${isSelected ? 'selected' : ''}"
           data-alumno-id="${a.id}"
           data-is-enrolled="false"
           data-name="${normalizeSearch(nombre)}"
           data-instrumento="${normalizeSearch(instrumento)}"
           data-sin-clase="${isSinClase ? 'true' : 'false'}">
      <input class="gcv-checkbox" type="checkbox" value="${a.id}" ${isSelected ? 'checked' : ''} />
      <div class="gcv-student-avatar gcv-avatar-primary">${getInitials(nombre)}</div>
      <div class="gcv-student-data">
        <div style="display:flex;align-items:center;gap:.5rem;">
          <span class="gcv-student-name">${nombre}</span>
          ${isSinClase ? '<span class="gcv-badge-sin-clase">Sin clase</span>' : ''}
        </div>
        ${instrumento ? `<span class="gcv-student-sub"><i class="bi bi-music-note"></i> ${instrumento}</span>` : ''}
      </div>
    </label>
  `
}

// ── Event wiring ──────────────────────────────────────────────────────────────

function _attachShellEvents(clases, permisos = {}) {
  document.getElementById('gcv-clase-list')?.addEventListener('click', async (e) => {
    const card = e.target.closest('.gcv-clase-card')
    if (!card) return
    const claseId = card.dataset.claseId
    if (claseId && claseId !== _selectedClaseId) {
      await _selectClase(claseId, clases)
    }
  })

  document.getElementById('gcv-btn-crear-clase')?.addEventListener('click', () => {
    if (!permisos?.puede_crear_clases) {
      AppToast.error('Tu perfil todavía no tiene habilitado el permiso para crear clases.')
      return
    }
    if (window.router?.navigate) {
      window.router.navigate('crear-clase')
    }
  })
}

function _attachPanelEvents(claseId, clases) {
  let activeFilter = 'all'

  const updateSelectionUI = () => {
    const totalSelected = _selectedAvailableStudentIds.size
    const queueBar = document.getElementById('gcv-selection-queue-bar')
    const queueText = document.getElementById('gcv-selection-queue-text')
    const btnInscribir = document.getElementById('gcv-btn-inscribir')

    if (queueBar && queueText) {
      if (totalSelected > 0) {
        queueBar.classList.remove('d-none')
        queueText.textContent = `${totalSelected} alumno${totalSelected > 1 ? 's' : ''} seleccionado${totalSelected > 1 ? 's' : ''} en cola`
      } else {
        queueBar.classList.add('d-none')
      }
    }

    if (btnInscribir) {
      btnInscribir.innerHTML = totalSelected > 0
        ? `<i class="bi bi-person-check"></i> Inscribir seleccionados (${totalSelected})`
        : '<i class="bi bi-person-check"></i> Inscribir seleccionados'
    }
  }

  const applyUnifiedFilters = () => {
    const term = normalizeSearch(document.getElementById('gcv-disponibles-search')?.value)
    const instrumento = normalizeSearch(document.getElementById('gcv-filter-instrumento')?.value)
    const soloSinClase = activeFilter === 'sin-clase' || document.getElementById('gcv-filter-sin-clase')?.checked === true
    const rows = [...document.querySelectorAll('#gcv-lista-disponibles .gcv-student-row')]
    let visibles = 0
    let disponiblesVisibles = 0
    const totalDisponibles = document.querySelectorAll('.disponible-item').length

    rows.forEach((row) => {
      const isEnrolled = row.dataset.isEnrolled === 'true'
      const matchText =
        !term ||
        (row.dataset.name || '').includes(term) ||
        (row.dataset.instrumento || '').includes(term)
      const matchInstrumento = !instrumento || (row.dataset.instrumento || '') === instrumento

      let matchPill = true
      if (activeFilter === 'inscritos') matchPill = isEnrolled
      else if (activeFilter === 'disponibles') matchPill = !isEnrolled
      else if (soloSinClase) matchPill = !isEnrolled && row.dataset.sinClase === 'true'

      const visible = matchText && matchInstrumento && matchPill
      row.style.display = visible ? '' : 'none'

      if (!isEnrolled) {
        const checkbox = row.querySelector('.gcv-checkbox')
        if (checkbox) {
          checkbox.checked = _selectedAvailableStudentIds.has(row.dataset.alumnoId)
          row.classList.toggle('selected', checkbox.checked)
        }
        if (visible) disponiblesVisibles++
      }

      if (visible) visibles++
    })

    const count = document.getElementById('gcv-count-disponibles')
    if (count) {
      if (activeFilter === 'sin-clase' || soloSinClase) {
        count.textContent = `${disponiblesVisibles} de ${totalDisponibles} disponibles`
      } else {
        count.textContent = `${visibles} de ${rows.length} alumnos`
      }
    }

    const empty = document.getElementById('gcv-empty-disponibles-filter')
    if (empty) empty.classList.toggle('d-none', visibles > 0 || rows.length === 0)
  }

  // Filter Pills click handler
  document.getElementById('gcv-filter-pills')?.addEventListener('click', (e) => {
    const pill = e.target.closest('.gcv-pill')
    if (!pill) return
    document.querySelectorAll('#gcv-filter-pills .gcv-pill').forEach((p) => p.classList.remove('active'))
    pill.classList.add('active')
    activeFilter = pill.dataset.filter || 'all'

    const sinClaseToggle = document.getElementById('gcv-filter-sin-clase')
    if (sinClaseToggle) sinClaseToggle.checked = (activeFilter === 'sin-clase')

    applyUnifiedFilters()
  })

  // Handle selection queue changes
  document.getElementById('gcv-lista-disponibles')?.addEventListener('change', (e) => {
    const cb = e.target.closest('.gcv-checkbox')
    if (!cb) return
    const alumnoId = cb.value
    if (cb.checked) {
      _selectedAvailableStudentIds.add(alumnoId)
      cb.closest('.disponible-item')?.classList.add('selected')
    } else {
      _selectedAvailableStudentIds.delete(alumnoId)
      cb.closest('.disponible-item')?.classList.remove('selected')
    }
    updateSelectionUI()
  })

  // Clear queue
  document.getElementById('gcv-btn-clear-selection')?.addEventListener('click', () => {
    _selectedAvailableStudentIds.clear()
    document.querySelectorAll('#gcv-lista-disponibles .gcv-checkbox').forEach((cb) => {
      cb.checked = false
      cb.closest('.disponible-item')?.classList.remove('selected')
    })
    updateSelectionUI()
  })

  // Search and filter inputs
  document.getElementById('gcv-disponibles-search')?.addEventListener('input', applyUnifiedFilters)
  document.getElementById('gcv-filter-instrumento')?.addEventListener('change', applyUnifiedFilters)
  document.getElementById('gcv-filter-sin-clase')?.addEventListener('change', () => {
    if (document.getElementById('gcv-filter-sin-clase')?.checked) {
      activeFilter = 'sin-clase'
      document.querySelectorAll('#gcv-filter-pills .gcv-pill').forEach((p) => p.classList.toggle('active', p.dataset.filter === 'sin-clase'))
    }
    applyUnifiedFilters()
  })

  applyUnifiedFilters()
  updateSelectionUI()

  // Class editor
  document.getElementById('gcv-btn-editar-clase')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget
    const maestro = getMaestroLocal()
    const clase = clases.find((item) => item.id === claseId)
    if (!btn || !maestro || !clase) return

    const originalHTML = btn.innerHTML
    btn.disabled = true
    btn.innerHTML = '<span class="gcv-spinner-sm"></span> Cargando...'

    try {
      const soporte = await _ensureClassEditorSupport()
      const maestroPrincipal = soporte.maestros.find((item) => item.id === clase.maestro_principal_id)

      openClaseModal(clase, {
        ...soporte,
        lockedPrincipalTeacherId: clase.maestro_principal_id || maestro.id,
        lockedPrincipalTeacherLabel:
          maestroPrincipal?.nombre_completo ||
          maestroPrincipal?.nombre ||
          clase.nombre_maestro ||
          'Maestro titular',
        allowPrincipalTeacherSelection: false,
        onSuccess: async () => {
          _classEditorSupport = null
          if (_rootContainer) {
            await renderGestionarClasesView(_rootContainer)
          }
        },
      })
      btn.disabled = false
      btn.innerHTML = originalHTML
    } catch (err) {
      AppToast.error('No se pudo abrir el editor de la clase: ' + err.message)
      btn.disabled = false
      btn.innerHTML = originalHTML
    }
  })

  // ── New Student Form & Live Duplicate Detection ────────────────────────────

  const evaluateDuplicates = () => {
    const nombre = document.getElementById('gcv-nuevo-nombre')?.value || ''
    const telefono = document.getElementById('gcv-nuevo-telefono')?.value || ''
    const feedback = document.getElementById('gcv-dup-feedback')
    if (!feedback) return

    const matches = findDuplicateMatches(nombre, telefono, _allStudents)

    if (matches.length > 0) {
      feedback.innerHTML = `
        <div class="gcv-dup-alert">
          <div class="gcv-dup-header">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>Atención: Se encontraron coincidencias en la base de datos (${matches.length})</span>
          </div>
          <div class="gcv-dup-list">
            ${matches.slice(0, 4).map((m) => {
              const isEnrolled = _enrolledIds.has(m.id)
              const isSinClase = _studentsWithoutClassIds.has(m.id)
              const statusLabel = isEnrolled
                ? 'Ya inscrito en esta clase'
                : (isSinClase ? 'Sin clase asignada' : 'Activo en otra clase')

              return `
                <div class="gcv-dup-item">
                  <div>
                    <strong>${escHTML(m.nombre_completo || m.nombre)}</strong>
                    <span class="gcv-dup-sub">
                      ${escHTML(m.instrumento_principal || 'Sin instrumento')}
                      ${m.familiar_telefono ? ` • Tel: ${escHTML(m.familiar_telefono)}` : ''}
                      • <em>${statusLabel}</em>
                    </span>
                  </div>
                  ${!isEnrolled ? `
                    <button type="button" class="gcv-btn-use-existing" data-alumno-id="${m.id}" data-alumno-nombre="${escHTML(m.nombre_completo || m.nombre)}">
                      <i class="bi bi-person-check"></i> Inscribir existente
                    </button>
                  ` : ''}
                </div>
              `
            }).join('')}
          </div>
        </div>
      `
    } else if (normalizeSearch(nombre).length >= 3) {
      feedback.innerHTML = `
        <div class="gcv-dup-clean">
          <i class="bi bi-check-circle-fill"></i> Nombre disponible para nuevo registro.
        </div>
      `
    } else {
      feedback.innerHTML = ''
    }
  }

  document.getElementById('gcv-btn-nuevo')?.addEventListener('click', () => {
    const form = document.getElementById('gcv-new-form')
    form?.classList.remove('d-none')
    document.getElementById('gcv-nuevo-nombre')?.focus()
  })

  document.getElementById('gcv-nuevo-nombre')?.addEventListener('input', evaluateDuplicates)
  document.getElementById('gcv-nuevo-telefono')?.addEventListener('input', evaluateDuplicates)

  // Use existing student from duplicate alert
  document.getElementById('gcv-dup-feedback')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('.gcv-btn-use-existing')
    if (!btn) return
    const alumnoId = btn.dataset.alumnoId
    const alumnoNombre = btn.dataset.alumnoNombre || 'El alumno'
    btn.disabled = true
    btn.innerHTML = '<span class="gcv-spinner-sm"></span> Inscribiendo...'

    try {
      await inscribirAlumno(claseId, alumnoId)
      AppToast.success(`${alumnoNombre} inscrito en la clase exitosamente.`)
      _resetNewForm()
      await _refreshStudentsWithoutClass()
      await _selectClase(claseId, clases)
    } catch (err) {
      AppToast.error('Error al inscribir: ' + err.message)
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-person-check"></i> Inscribir existente'
    }
  })

  document.getElementById('gcv-btn-cancelar-nuevo')?.addEventListener('click', _resetNewForm)

  document.getElementById('gcv-btn-guardar-nuevo')?.addEventListener('click', async () => {
    const nombre = document.getElementById('gcv-nuevo-nombre').value.trim()
    const instrumento = document.getElementById('gcv-nuevo-instrumento').value.trim()
    const telefono = document.getElementById('gcv-nuevo-telefono').value.trim()

    if (!nombre || !instrumento || !telefono) {
      AppToast.error('Nombre, instrumento y teléfono son obligatorios')
      return
    }

    // Exact duplicate confirmation safety guard
    const exactMatch = _allStudents.find(
      (a) => normalizeSearch(a.nombre_completo || a.nombre) === normalizeSearch(nombre),
    )
    if (exactMatch) {
      const proceed = confirm(
        `Ya existe un alumno registrado con el nombre exacto "${exactMatch.nombre_completo || exactMatch.nombre}". ¿Deseas registrar un nuevo alumno con este mismo nombre?`,
      )
      if (!proceed) return
    }

    const btn = document.getElementById('gcv-btn-guardar-nuevo')
    btn.disabled = true
    btn.innerHTML = '<span class="gcv-spinner-sm"></span> Guardando...'

    try {
      const nuevoAlumno = await crearAlumno({
        nombre_completo: nombre,
        instrumento_principal: instrumento,
        familiar_telefono: telefono,
        activo: true,
      })
      await inscribirAlumno(claseId, nuevoAlumno.id)
      AppToast.success(`${nombre} registrado e inscrito exitosamente`)
      const todosActualizados = normalizeAlumnosPayload(await obtenerAlumnos().catch(() => _allStudents))
      _allStudents = (todosActualizados || []).filter((a) => a && a.activo !== false && a.is_active !== false)
      await _refreshStudentsWithoutClass()
      _classEditorSupport = null
      await _selectClase(claseId, clases)
    } catch (err) {
      AppToast.error('Error: ' + err.message)
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-floppy"></i> Guardar e inscribir'
    }
  })

  // Unenroll student
  document.getElementById('gcv-lista-disponibles')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('.desinscribir-btn')
    if (!btn) return
    const alumnoId = btn.dataset.alumnoId
    const row = btn.closest('.gcv-student-row')
    const nombre = row?.querySelector('.gcv-student-name')?.textContent || 'este alumno'

    if (!confirm(`¿Quitar a ${nombre} de esta clase?`)) return

    btn.disabled = true
    btn.innerHTML = '<span class="gcv-spinner-sm"></span>'

    try {
      await desinscribirAlumno(claseId, alumnoId)
      await _refreshStudentsWithoutClass()
      AppToast.success(`${nombre} quitado de la clase`)
      await _selectClase(claseId, clases)
    } catch (err) {
      AppToast.error('Error: ' + err.message)
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-person-x"></i>'
    }
  })

  // Inscribe selected students in bulk
  document.getElementById('gcv-btn-inscribir')?.addEventListener('click', async () => {
    const idsToEnroll = [..._selectedAvailableStudentIds]
    if (!idsToEnroll.length) {
      AppToast.error('Selecciona al menos un alumno')
      return
    }

    const btn = document.getElementById('gcv-btn-inscribir')
    btn.disabled = true
    btn.innerHTML = `<span class="gcv-spinner-sm"></span> Inscribiendo ${idsToEnroll.length} alumno(s)...`

    try {
      for (const id of idsToEnroll) {
        await inscribirAlumno(claseId, id)
      }
      _selectedAvailableStudentIds.clear()
      await _refreshStudentsWithoutClass()
      AppToast.success(
        `${idsToEnroll.length} alumno${idsToEnroll.length > 1 ? 's' : ''} inscrito${idsToEnroll.length > 1 ? 's' : ''} correctamente`,
      )
      await _selectClase(claseId, clases)
    } catch (err) {
      AppToast.error('Error: ' + err.message)
      btn.disabled = false
      btn.innerHTML = `<i class="bi bi-person-check"></i> Inscribir seleccionados (${_selectedAvailableStudentIds.size})`
    }
  })
}

function _resetNewForm() {
  const form = document.getElementById('gcv-new-form')
  if (form) form.classList.add('d-none')
  const inputs = ['gcv-nuevo-nombre', 'gcv-nuevo-instrumento', 'gcv-nuevo-telefono']
  inputs.forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })
  const feedback = document.getElementById('gcv-dup-feedback')
  if (feedback) feedback.innerHTML = ''
}

async function _refreshStudentsWithoutClass() {
  try {
    const gruposSinClase = await obtenerAlumnosSinClase()
    _studentsWithoutClassIds = new Set(flattenAlumnosSinClase(gruposSinClase).map((alumno) => alumno.id))
  } catch {
    _studentsWithoutClassIds = new Set()
  }
}

async function _ensureClassEditorSupport() {
  if (_classEditorSupport) return _classEditorSupport
  _classEditorSupport = await obtenerDatosCreadorClases()
  return _classEditorSupport
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function _skeletonHTML() {
  return `
    <div class="gcv-root">
      <div class="gcv-header">
        <div class="gcv-skeleton gcv-skel-title"></div>
      </div>
      <div class="gcv-layout">
        <div class="gcv-clase-list">
          ${[1, 2, 3].map(() => '<div class="gcv-skeleton gcv-skel-card"></div>').join('')}
        </div>
        <div class="gcv-panel">
          <div class="gcv-loading"><div class="gcv-spinner"></div></div>
        </div>
      </div>
    </div>
  `
}

function _emptyState(icon, title, msg) {
  return `
    <div class="gcv-empty-state">
      <i class="bi ${icon} gcv-empty-icon"></i>
      <p class="gcv-empty-title">${title}</p>
      <p class="gcv-empty-msg">${msg}</p>
    </div>
  `
}
