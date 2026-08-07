/**
 * gestionarClasesView.js
 * Teacher-facing class management portal.
 * Allows teachers to view their assigned classes, manage student rosters,
 * enroll existing students, remove students, and register new ones.
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
  return []
}

function flattenAlumnosSinClase(grupos = []) {
  return grupos.flatMap((grupo) => grupo?.alumnos || []).filter(Boolean)
}

function getInstrumentoSlug(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('es')
}

function getInstrumentOptions(alumnos = []) {
  return [...new Set(
    alumnos
      .map((alumno) => getInstrumentoSlug(alumno.instrumento_principal || alumno.instrumento))
      .filter(Boolean),
  )].sort((a, b) => a.localeCompare(b, 'es'))
}

// ── Module state ──────────────────────────────────────────────────────────────

let _selectedClaseId = null
let _allStudents = [] // Cache of all active students for search
let _enrolledIds = new Set()
let _studentsWithoutClassIds = new Set()
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

    _allStudents = todosAlumnos.filter((a) => a.activo !== false && a.is_active !== false)
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

// ── Panel de gestión de alumnos ────────────────────────────────────────────────

async function _selectClase(claseId, clases) {
  _selectedClaseId = claseId

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
  const instrumentosDisponibles = getInstrumentOptions(disponibles)
  return `
    <div class="gcv-panel-inner">
      <div class="gcv-panel-header">
        <div>
          <h3 class="gcv-panel-title"><i class="bi bi-people-fill"></i> ${nombre}</h3>
          <p class="gcv-panel-subtitle">Gestiona alumnos y actualiza la configuracion de esta clase.</p>
        </div>
        <div class="gcv-panel-header-actions">
          <span class="gcv-enrolled-badge">${inscritos.length} alumno${inscritos.length !== 1 ? 's' : ''}</span>
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

      <!-- Search bar -->
      <div class="gcv-search-bar">
        <i class="bi bi-search gcv-search-icon"></i>
        <input
          type="text"
          id="gcv-search"
          class="gcv-search-input"
          placeholder="Buscar alumno inscrito por nombre o instrumento..."
          autocomplete="off"
        />
      </div>

      <!-- Quick register form -->
      <div class="gcv-new-form d-none" id="gcv-new-form">
        <p class="gcv-new-form-title"><i class="bi bi-person-plus-fill"></i> Registrar nuevo alumno</p>
        <div class="gcv-new-form-grid">
          <input type="text" id="gcv-nuevo-nombre" class="gcv-input" placeholder="Nombre completo *" />
          <input type="text" id="gcv-nuevo-instrumento" class="gcv-input" placeholder="Instrumento *" />
          <input type="tel" id="gcv-nuevo-telefono" class="gcv-input" placeholder="Telefono representante *" />
        </div>
        <div class="gcv-new-form-actions">
          <button type="button" class="gcv-btn gcv-btn-ghost" id="gcv-btn-cancelar-nuevo">Cancelar</button>
          <button type="button" class="gcv-btn gcv-btn-primary" id="gcv-btn-guardar-nuevo">
            <i class="bi bi-floppy"></i> Guardar e inscribir
          </button>
        </div>
      </div>

      <!-- Enrolled students -->
      <div class="gcv-section">
        <div class="gcv-section-header">
          <span class="gcv-section-label"><i class="bi bi-check-circle-fill gcv-icon-success"></i> Inscritos</span>
          <span class="gcv-section-count" id="gcv-count-inscritos">${inscritos.length}</span>
        </div>
        <div id="gcv-lista-inscritos" class="gcv-student-list">
          ${
            inscritos.length === 0
              ? '<p class="gcv-empty-list">Sin alumnos inscritos aun.</p>'
              : inscritos.map((a) => _rowInscrito(a)).join('')
          }
        </div>
      </div>

      <div class="gcv-divider"></div>

      <!-- Available students -->
      <div class="gcv-section">
        <div class="gcv-section-header">
          <div style="display:flex;align-items:center;gap:.75rem;">
            <span class="gcv-section-label"><i class="bi bi-person-plus-fill gcv-icon-primary"></i> Agregar alumno</span>
            <span class="gcv-section-count" id="gcv-count-disponibles">${disponibles.length} de ${disponibles.length} disponibles</span>
          </div>
          <button class="gcv-btn-new" id="gcv-btn-nuevo" type="button" title="Registrar nuevo alumno">
            <i class="bi bi-person-plus"></i>
            <span>Nuevo</span>
          </button>
        </div>
        <div class="gcv-available-toolbar">
          <div class="gcv-search-bar gcv-search-bar-compact">
            <i class="bi bi-filter-circle gcv-search-icon"></i>
            <input
              type="text"
              id="gcv-disponibles-search"
              class="gcv-search-input"
              placeholder="Filtrar por nombre..."
              autocomplete="off"
            />
          </div>
          <div class="gcv-available-filters">
            <select id="gcv-filter-instrumento" class="gcv-input gcv-input-sm" aria-label="Filtrar por instrumento">
              <option value="">Todos los instrumentos</option>
              ${instrumentosDisponibles.map((instrumento) => `<option value="${escHTML(instrumento)}">${escHTML(instrumento)}</option>`).join('')}
            </select>
            <label class="gcv-inline-check" title="Mostrar únicamente alumnos sin ninguna clase asignada">
              <input type="checkbox" id="gcv-filter-sin-clase" />
              <span>Sin clase asignada</span>
            </label>
          </div>
        </div>
        <div id="gcv-lista-disponibles" class="gcv-student-list gcv-available-list">
          ${
            disponibles.length === 0
              ? '<p class="gcv-empty-list">Todos los alumnos activos ya estan inscritos.</p>'
              : disponibles.map((a) => _rowDisponible(a)).join('')
          }
        </div>
        <p class="gcv-empty-list d-none" id="gcv-empty-disponibles-filter">Ningun alumno coincide con los filtros actuales.</p>
        ${
          disponibles.length > 0
            ? `
          <div class="gcv-add-actions">
            <button type="button" class="gcv-btn gcv-btn-primary" id="gcv-btn-inscribir">
              <i class="bi bi-person-check"></i> Inscribir seleccionados
            </button>
          </div>
        `
            : ''
        }
      </div>
    </div>
  `
}

function _rowInscrito(a) {
  const nombre = escHTML(a.nombre_completo || a.nombre || 'Alumno')
  const instrumento = escHTML(a.instrumento_principal || a.instrumento || '')
  return `
    <div class="gcv-student-row inscrito-item"
         data-alumno-id="${a.id}"
         data-name="${nombre.toLowerCase()}"
         data-instrumento="${instrumento.toLowerCase()}">
      <div class="gcv-student-avatar gcv-avatar-success">${getInitials(nombre)}</div>
      <div class="gcv-student-data">
        <span class="gcv-student-name">${nombre}</span>
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
  return `
    <label class="gcv-student-row gcv-student-selectable disponible-item"
           data-alumno-id="${a.id}"
           data-name="${nombre.toLowerCase()}"
           data-instrumento="${instrumento.toLowerCase()}"
           data-sin-clase="${_studentsWithoutClassIds.has(a.id) ? 'true' : 'false'}">
      <input class="gcv-checkbox" type="checkbox" value="${a.id}" />
      <div class="gcv-student-avatar gcv-avatar-primary">${getInitials(nombre)}</div>
      <div class="gcv-student-data">
        <span class="gcv-student-name">${nombre}</span>
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
  document.getElementById('gcv-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim()
    document.querySelectorAll('.inscrito-item').forEach((row) => {
      const match =
        !term ||
        (row.dataset.name || '').includes(term) ||
        (row.dataset.instrumento || '').includes(term)
      row.style.display = match ? '' : 'none'
    })
  })

  const applyAvailableFilters = () => {
    const term = document.getElementById('gcv-disponibles-search')?.value?.toLowerCase().trim() || ''
    const instrumento = document.getElementById('gcv-filter-instrumento')?.value || ''
    const soloSinClase = document.getElementById('gcv-filter-sin-clase')?.checked === true
    const rows = [...document.querySelectorAll('.disponible-item')]
    let visibles = 0

    rows.forEach((row) => {
      const matchText =
        !term ||
        (row.dataset.name || '').includes(term) ||
        (row.dataset.instrumento || '').includes(term)
      const matchInstrumento = !instrumento || (row.dataset.instrumento || '') === instrumento
      const matchSinClase = !soloSinClase || row.dataset.sinClase === 'true'
      const visible = matchText && matchInstrumento && matchSinClase
      row.style.display = visible ? '' : 'none'
      if (!visible) {
        const checkbox = row.querySelector('.gcv-checkbox')
        if (checkbox) checkbox.checked = false
      }
      if (visible) visibles++
    })

    const count = document.getElementById('gcv-count-disponibles')
    if (count) count.textContent = `${visibles} de ${rows.length} disponibles`

    const empty = document.getElementById('gcv-empty-disponibles-filter')
    if (empty) empty.classList.toggle('d-none', visibles > 0 || rows.length === 0)
  }

  document.getElementById('gcv-disponibles-search')?.addEventListener('input', applyAvailableFilters)
  document.getElementById('gcv-filter-instrumento')?.addEventListener('change', applyAvailableFilters)
  document.getElementById('gcv-filter-sin-clase')?.addEventListener('change', applyAvailableFilters)
  applyAvailableFilters()

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

  document.getElementById('gcv-btn-nuevo')?.addEventListener('click', () => {
    const form = document.getElementById('gcv-new-form')
    form?.classList.remove('d-none')
    document.getElementById('gcv-nuevo-nombre')?.focus()
  })

  document.getElementById('gcv-btn-cancelar-nuevo')?.addEventListener('click', _resetNewForm)

  document.getElementById('gcv-btn-guardar-nuevo')?.addEventListener('click', async () => {
    const nombre = document.getElementById('gcv-nuevo-nombre').value.trim()
    const instrumento = document.getElementById('gcv-nuevo-instrumento').value.trim()
    const telefono = document.getElementById('gcv-nuevo-telefono').value.trim()

    if (!nombre || !instrumento || !telefono) {
      AppToast.error('Nombre, instrumento y telefono son obligatorios')
      return
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
      _allStudents = todosActualizados.filter((a) => a.activo !== false && a.is_active !== false)
      await _refreshStudentsWithoutClass()
      _classEditorSupport = null
      await _selectClase(claseId, clases)
    } catch (err) {
      AppToast.error('Error: ' + err.message)
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-floppy"></i> Guardar e inscribir'
    }
  })

  document.getElementById('gcv-lista-inscritos')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('.desinscribir-btn')
    if (!btn) return
    const alumnoId = btn.dataset.alumnoId
    const row = btn.closest('.gcv-student-row')
    const nombre = row?.querySelector('.gcv-student-name')?.textContent || 'este alumno'

    if (!confirm(`Quitar a ${nombre} de esta clase?`)) return

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

  document.getElementById('gcv-btn-inscribir')?.addEventListener('click', async () => {
    const checks = [...document.querySelectorAll('#gcv-lista-disponibles .gcv-checkbox:checked')]
    if (!checks.length) {
      AppToast.error('Selecciona al menos un alumno')
      return
    }

    const btn = document.getElementById('gcv-btn-inscribir')
    btn.disabled = true
    btn.innerHTML = '<span class="gcv-spinner-sm"></span> Inscribiendo...'

    try {
      for (const cb of checks) {
        await inscribirAlumno(claseId, cb.value)
      }
      await _refreshStudentsWithoutClass()
      AppToast.success(
        `${checks.length} alumno${checks.length > 1 ? 's' : ''} inscrito${checks.length > 1 ? 's' : ''} correctamente`,
      )
      await _selectClase(claseId, clases)
    } catch (err) {
      AppToast.error('Error: ' + err.message)
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-person-check"></i> Inscribir seleccionados'
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
