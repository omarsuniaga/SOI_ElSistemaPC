/**
 * gestionarClasesView.js
 * Teacher-facing class management portal.
 * Allows teachers to view their assigned classes, manage student rosters,
 * enroll existing students, remove students, and register new ones.
 *
 * Depends on: clasesApi (DataAdapter pattern), alumnosApi, crearAlumno
 */

import { obtenerClasesPorMaestro, obtenerAlumnosInscritos, inscribirAlumno, desinscribirAlumno } from '../../modules/clases/api/clasesApi.js'
import { obtenerAlumnos, crearAlumno } from '../../modules/alumnos/api/alumnosApi.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { getPermisos, solicitarPermiso } from '../services/permisoService.js'
import { AppToast } from '../../shared/components/AppToast.js'

// ── Helpers ──────────────────────────────────────────────────────────────────

function escHTML(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function getInitials(name) {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

function formatHorarios(horarios) {
  if (!horarios || horarios.length === 0) return '<span style="color:var(--pm-text-muted);font-size:.8rem;">Sin horario asignado</span>'
  const dayMap = { 
    lunes: 'Lun', 
    martes: 'Mar', 
    miercoles: 'Mié', 
    miércoles: 'Mié', 
    jueves: 'Jue', 
    viernes: 'Vie', 
    sabado: 'Sáb', 
    sábado: 'Sáb', 
    domingo: 'Dom' 
  }
  return horarios.map(h => {
    const dia = dayMap[h.dia] || h.dia || ''
    const inicio = (h.hora_inicio || '').slice(0, 5)
    const fin = (h.hora_fin || '').slice(0, 5)
    return `<span class="gcv-horario-chip">${dia} ${inicio}–${fin}</span>`
  }).join(' ')
}

// ── Module state ──────────────────────────────────────────────────────────────

let _selectedClaseId = null
let _allStudents = []     // Cache of all active students for search
let _enrolledIds = new Set()

// ── Main render ───────────────────────────────────────────────────────────────

export async function renderGestionarClasesView(container) {
  container.innerHTML = _skeletonHTML()
  _injectStyles()

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = _emptyState('bi-lock', 'Sin sesión activa', 'Por favor ingresá nuevamente.')
    return
  }

  try {
    const permisos = await getPermisos(maestro.id)
    if (!permisos.puede_inscribir_clases) {
      container.innerHTML = _noPermissionState(permisos)
      _attachPermissionEvents(maestro.id)
      return
    }

    const [clases, todosAlumnos] = await Promise.all([
      obtenerClasesPorMaestro(maestro.id),
      obtenerAlumnos().catch(() => []),
    ])

    _allStudents = todosAlumnos.filter(a => a.activo !== false && a.is_active !== false)

    container.innerHTML = _buildShell(clases)
    _attachShellEvents(clases)

    if (clases.length > 0) {
      await _selectClase(clases[0].id, clases)
    }
  } catch (err) {
    console.error('[GestionarClases]', err)
    container.innerHTML = _emptyState('bi-exclamation-triangle', 'Error al cargar', escHTML(err.message))
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
          ${pending ? `
            <div class="gcv-pending-badge">
              <i class="bi bi-clock-history"></i>
              Solicitud Pendiente de Aprobación
            </div>
          ` : `
            <button class="gcv-btn gcv-btn-primary" id="gcv-btn-request-classes" type="button">
              <i class="bi bi-send-fill"></i>
              Solicitar Permiso de Clases
            </button>
          `}
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

function _buildShell(clases) {
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
      </div>

      ${clases.length === 0
        ? _emptyState('bi-calendar-x', 'Sin clases asignadas', 'El administrador debe asignarte clases primero.')
        : `<div class="gcv-layout">
            <div class="gcv-clase-list" id="gcv-clase-list">
              ${clases.map(c => _classCard(c)).join('')}
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
  document.querySelectorAll('.gcv-clase-card').forEach(c => c.classList.remove('active'))
  document.getElementById(`gcv-card-${claseId}`)?.classList.add('active')

  const panel = document.getElementById('gcv-panel')
  if (!panel) return

  const clase = clases.find(c => c.id === claseId)
  if (!clase) return

  panel.innerHTML = `<div class="gcv-loading"><div class="gcv-spinner"></div></div>`

  try {
    const inscritosRaw = await obtenerAlumnosInscritos(claseId)
    const inscritos = inscritosRaw.map(r => r.alumno).filter(Boolean)
    _enrolledIds = new Set(inscritosRaw.map(r => r.alumno_id))
    const disponibles = _allStudents.filter(a => !_enrolledIds.has(a.id))

    panel.innerHTML = _buildPanel(clase, inscritos, disponibles)
    _attachPanelEvents(claseId, clases)
  } catch (err) {
    panel.innerHTML = _emptyState('bi-exclamation-circle', 'Error al cargar alumnos', escHTML(err.message))
  }
}

function _buildPanel(clase, inscritos, disponibles) {
  const nombre = escHTML(clase.nombre || 'Clase')
  return `
    <div class="gcv-panel-inner">
      <div class="gcv-panel-header">
        <h3 class="gcv-panel-title"><i class="bi bi-people-fill"></i> ${nombre}</h3>
        <span class="gcv-enrolled-badge">${inscritos.length} alumno${inscritos.length !== 1 ? 's' : ''}</span>
      </div>

      <!-- Search bar -->
      <div class="gcv-search-bar">
        <i class="bi bi-search gcv-search-icon"></i>
        <input
          type="text"
          id="gcv-search"
          class="gcv-search-input"
          placeholder="Buscar alumno por nombre o instrumento..."
          autocomplete="off"
        />
        <button class="gcv-btn-new" id="gcv-btn-nuevo" type="button" title="Registrar nuevo alumno">
          <i class="bi bi-person-plus"></i>
          <span>Nuevo</span>
        </button>
      </div>

      <!-- Quick register form -->
      <div class="gcv-new-form d-none" id="gcv-new-form">
        <p class="gcv-new-form-title"><i class="bi bi-person-plus-fill"></i> Registrar nuevo alumno</p>
        <div class="gcv-new-form-grid">
          <input type="text" id="gcv-nuevo-nombre" class="gcv-input" placeholder="Nombre completo *" />
          <input type="text" id="gcv-nuevo-instrumento" class="gcv-input" placeholder="Instrumento *" />
          <input type="tel" id="gcv-nuevo-telefono" class="gcv-input" placeholder="Teléfono representante *" />
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
          ${inscritos.length === 0
            ? '<p class="gcv-empty-list">Sin alumnos inscritos aún.</p>'
            : inscritos.map(a => _rowInscrito(a)).join('')
          }
        </div>
      </div>

      <div class="gcv-divider"></div>

      <!-- Available students -->
      <div class="gcv-section">
        <div class="gcv-section-header">
          <span class="gcv-section-label"><i class="bi bi-person-plus-fill gcv-icon-primary"></i> Agregar alumno</span>
          <span class="gcv-section-count" id="gcv-count-disponibles">${disponibles.length} disponibles</span>
        </div>
        <div id="gcv-lista-disponibles" class="gcv-student-list gcv-available-list">
          ${disponibles.length === 0
            ? '<p class="gcv-empty-list">Todos los alumnos activos ya están inscritos.</p>'
            : disponibles.map(a => _rowDisponible(a)).join('')
          }
        </div>
        ${disponibles.length > 0 ? `
          <div class="gcv-add-actions">
            <button type="button" class="gcv-btn gcv-btn-primary" id="gcv-btn-inscribir">
              <i class="bi bi-person-check"></i> Inscribir seleccionados
            </button>
          </div>
        ` : ''}
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
           data-instrumento="${instrumento.toLowerCase()}">
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

function _attachShellEvents(clases) {
  document.getElementById('gcv-clase-list')?.addEventListener('click', async e => {
    const card = e.target.closest('.gcv-clase-card')
    if (!card) return
    const claseId = card.dataset.claseId
    if (claseId && claseId !== _selectedClaseId) {
      await _selectClase(claseId, clases)
    }
  })
}

function _attachPanelEvents(claseId, clases) {
  // Live search
  document.getElementById('gcv-search')?.addEventListener('input', e => {
    const term = e.target.value.toLowerCase().trim()
    document.querySelectorAll('.inscrito-item').forEach(row => {
      const match = !term || (row.dataset.name || '').includes(term) || (row.dataset.instrumento || '').includes(term)
      row.style.display = match ? '' : 'none'
    })
    document.querySelectorAll('.disponible-item').forEach(row => {
      const match = !term || (row.dataset.name || '').includes(term) || (row.dataset.instrumento || '').includes(term)
      row.style.display = match ? '' : 'none'
    })
  })

  // Toggle new student form
  document.getElementById('gcv-btn-nuevo')?.addEventListener('click', () => {
    const form = document.getElementById('gcv-new-form')
    form?.classList.remove('d-none')
    document.getElementById('gcv-nuevo-nombre')?.focus()
  })

  document.getElementById('gcv-btn-cancelar-nuevo')?.addEventListener('click', _resetNewForm)

  // Save new student and enroll
  document.getElementById('gcv-btn-guardar-nuevo')?.addEventListener('click', async () => {
    const nombre = document.getElementById('gcv-nuevo-nombre').value.trim()
    const instrumento = document.getElementById('gcv-nuevo-instrumento').value.trim()
    const telefono = document.getElementById('gcv-nuevo-telefono').value.trim()

    if (!nombre || !instrumento || !telefono) {
      AppToast.error('Nombre, instrumento y teléfono son obligatorios')
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
      // Refresh panel
      const todosActualizados = await obtenerAlumnos().catch(() => _allStudents)
      _allStudents = todosActualizados.filter(a => a.activo !== false && a.is_active !== false)
      await _selectClase(claseId, clases)
    } catch (err) {
      AppToast.error('Error: ' + err.message)
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-floppy"></i> Guardar e inscribir'
    }
  })

  // Desinscribir
  document.getElementById('gcv-lista-inscritos')?.addEventListener('click', async e => {
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
      AppToast.success(`${nombre} quitado de la clase`)
      await _selectClase(claseId, clases)
    } catch (err) {
      AppToast.error('Error: ' + err.message)
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-person-x"></i>'
    }
  })

  // Inscribir seleccionados
  document.getElementById('gcv-btn-inscribir')?.addEventListener('click', async () => {
    const checks = [...document.querySelectorAll('#gcv-lista-disponibles .gcv-checkbox:checked')]
    if (!checks.length) {
      AppToast.error('Seleccioná al menos un alumno')
      return
    }

    const btn = document.getElementById('gcv-btn-inscribir')
    btn.disabled = true
    btn.innerHTML = '<span class="gcv-spinner-sm"></span> Inscribiendo...'

    try {
      for (const cb of checks) {
        await inscribirAlumno(claseId, cb.value)
      }
      AppToast.success(`${checks.length} alumno${checks.length > 1 ? 's' : ''} inscrito${checks.length > 1 ? 's' : ''} correctamente`)
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
  inputs.forEach(id => { const el = document.getElementById(id); if (el) el.value = '' })
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
          ${[1,2,3].map(() => '<div class="gcv-skeleton gcv-skel-card"></div>').join('')}
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

// ── Styles ────────────────────────────────────────────────────────────────────

function _injectStyles() {
  if (document.getElementById('gcv-styles')) return
  const style = document.createElement('style')
  style.id = 'gcv-styles'
  style.textContent = `
    .gcv-root {
      padding: 1.5rem;
      max-width: 1100px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      color: var(--pm-text, #1e293b);
    }

    /* ── Header ── */
    .gcv-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: .75rem;
    }
    .gcv-header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .gcv-header-icon {
      font-size: 2rem;
      background: linear-gradient(135deg, var(--pm-primary, #6366f1), #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .gcv-title {
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0;
      color: var(--pm-text, #1e293b);
    }
    .gcv-subtitle {
      font-size: .8rem;
      color: var(--pm-text-muted, #64748b);
      margin: 0;
    }

    /* ── Layout: card list + panel ── */
    .gcv-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 1.25rem;
      flex: 1;
      min-height: 0;
    }
    @media (max-width: 768px) {
      .gcv-layout { grid-template-columns: 1fr; }
    }

    /* ── Class cards ── */
    .gcv-clase-list {
      display: flex;
      flex-direction: column;
      gap: .65rem;
      overflow-y: auto;
    }
    .gcv-clase-card {
      background: var(--pm-surface, #fff);
      border: 1.5px solid var(--pm-border, #e2e8f0);
      border-radius: 14px;
      padding: 1rem;
      cursor: pointer;
      text-align: left;
      transition: all .2s ease;
      width: 100%;
    }
    .gcv-clase-card:hover {
      border-color: var(--pm-primary, #6366f1);
      box-shadow: 0 4px 16px rgba(99,102,241,.12);
      transform: translateY(-1px);
    }
    .gcv-clase-card.active {
      border-color: var(--pm-primary, #6366f1);
      background: linear-gradient(135deg, rgba(99,102,241,.06), rgba(139,92,246,.04));
      box-shadow: 0 4px 20px rgba(99,102,241,.18);
    }
    .gcv-clase-card-top {
      display: flex;
      align-items: center;
      gap: .75rem;
      margin-bottom: .6rem;
    }
    .gcv-clase-avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--pm-primary, #6366f1), #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .gcv-clase-info {
      flex: 1;
      min-width: 0;
    }
    .gcv-clase-name {
      display: block;
      font-weight: 600;
      font-size: .95rem;
      color: var(--pm-text, #1e293b);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gcv-clase-nivel {
      display: block;
      font-size: .72rem;
      color: var(--pm-text-muted, #64748b);
      margin-top: .1rem;
    }
    .gcv-clase-arrow {
      color: var(--pm-text-muted, #64748b);
      font-size: .85rem;
      transition: transform .2s;
    }
    .gcv-clase-card.active .gcv-clase-arrow {
      transform: rotate(90deg);
      color: var(--pm-primary, #6366f1);
    }
    .gcv-clase-horarios {
      display: flex;
      flex-wrap: wrap;
      gap: .35rem;
      margin-bottom: .5rem;
    }
    .gcv-horario-chip {
      display: inline-block;
      background: var(--pm-surface-2, #f1f5f9);
      color: var(--pm-text, #1e293b);
      border: 1px solid var(--pm-border, transparent);
      border-radius: 20px;
      padding: .15rem .6rem;
      font-size: .7rem;
      font-weight: 500;
    }
    .gcv-clase-meta {
      font-size: .72rem;
      color: var(--pm-text-muted, #64748b);
    }

    /* ── Detail panel ── */
    .gcv-panel {
      background: var(--pm-surface, #fff);
      border: 1.5px solid var(--pm-border, #e2e8f0);
      border-radius: 16px;
      overflow-y: auto;
    }
    .gcv-panel-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 300px;
      color: var(--pm-text-muted, #64748b);
    }
    .gcv-panel-inner {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .gcv-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: .5rem;
    }
    .gcv-panel-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
      color: var(--pm-text, #1e293b);
    }
    .gcv-enrolled-badge {
      background: linear-gradient(135deg, var(--pm-primary, #6366f1), #8b5cf6);
      color: #fff;
      border-radius: 20px;
      padding: .2rem .8rem;
      font-size: .78rem;
      font-weight: 600;
    }

    /* ── Search ── */
    .gcv-search-bar {
      display: flex;
      align-items: center;
      gap: .5rem;
      background: var(--pm-surface-2, #f8fafc);
      border: 1.5px solid var(--pm-border, #e2e8f0);
      border-radius: 10px;
      padding: .4rem .75rem;
      transition: border-color .2s;
    }
    .gcv-search-bar:focus-within {
      border-color: var(--pm-primary, #6366f1);
    }
    .gcv-search-icon { color: var(--pm-text-muted, #64748b); font-size: .9rem; }
    .gcv-search-input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: .9rem;
      color: var(--pm-text, #1e293b);
    }
    .gcv-search-input::placeholder { color: var(--pm-text-muted, #94a3b8); }
    .gcv-btn-new {
      display: flex;
      align-items: center;
      gap: .35rem;
      background: linear-gradient(135deg, var(--pm-primary, #6366f1), #8b5cf6);
      color: #fff;
      border: none;
      border-radius: 7px;
      padding: .35rem .8rem;
      font-size: .8rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity .2s, transform .1s;
      white-space: nowrap;
    }
    .gcv-btn-new:hover { opacity: .9; transform: scale(1.03); }

    /* ── New student form ── */
    .gcv-new-form {
      background: var(--pm-surface-2, #f8fafc);
      border: 1.5px solid var(--pm-border, #e2e8f0);
      border-radius: 12px;
      padding: 1.1rem;
    }
    .gcv-new-form-title {
      font-size: .9rem;
      font-weight: 600;
      color: var(--pm-text, #1e293b);
      margin: 0 0 .75rem;
    }
    .gcv-new-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: .65rem;
    }
    .gcv-input {
      background: var(--pm-surface, #fff);
      border: 1.5px solid var(--pm-border, #e2e8f0);
      border-radius: 8px;
      padding: .5rem .85rem;
      font-size: .875rem;
      color: var(--pm-text, #1e293b);
      transition: border-color .15s;
      outline: none;
      width: 100%;
    }
    .gcv-input:focus { border-color: var(--pm-primary, #6366f1); }
    .gcv-new-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: .6rem;
      margin-top: .75rem;
    }

    /* ── Section layout ── */
    .gcv-section { display: flex; flex-direction: column; gap: .6rem; }
    .gcv-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .gcv-section-label {
      font-size: .85rem;
      font-weight: 600;
      color: var(--pm-text, #1e293b);
      display: flex;
      align-items: center;
      gap: .4rem;
    }
    .gcv-section-count {
      font-size: .75rem;
      color: var(--pm-text-muted, #64748b);
    }
    .gcv-icon-success { color: #22c55e; }
    .gcv-icon-primary { color: var(--pm-primary, #6366f1); }
    .gcv-divider {
      height: 1px;
      background: var(--pm-border, #e2e8f0);
    }

    /* ── Student list ── */
    .gcv-student-list { display: flex; flex-direction: column; gap: .35rem; }
    .gcv-available-list { max-height: 260px; overflow-y: auto; }
    .gcv-student-row {
      display: flex;
      align-items: center;
      gap: .75rem;
      padding: .6rem .75rem;
      border-radius: 10px;
      border: 1px solid transparent;
      transition: background .15s, border-color .15s;
    }
    .gcv-student-row:hover {
      background: var(--pm-surface-2, #f8fafc);
      border-color: var(--pm-border, #e2e8f0);
    }
    .gcv-student-selectable { cursor: pointer; }
    .gcv-student-selectable:has(.gcv-checkbox:checked) {
      background: rgba(99,102,241,.06);
      border-color: var(--pm-primary, #6366f1);
    }
    .gcv-student-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .72rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
    }
    .gcv-avatar-success { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .gcv-avatar-primary { background: linear-gradient(135deg, var(--pm-primary, #6366f1), #8b5cf6); }
    .gcv-student-data { flex: 1; min-width: 0; }
    .gcv-student-name {
      display: block;
      font-size: .875rem;
      font-weight: 600;
      color: var(--pm-text, #1e293b);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gcv-student-sub {
      display: block;
      font-size: .72rem;
      color: var(--pm-text-muted, #64748b);
    }
    .gcv-btn-remove {
      background: none;
      border: 1.5px solid transparent;
      border-radius: 8px;
      padding: .3rem .5rem;
      color: var(--pm-text-muted, #94a3b8);
      cursor: pointer;
      transition: all .15s;
      flex-shrink: 0;
    }
    .gcv-btn-remove:hover {
      color: #ef4444;
      border-color: #ef4444;
      background: rgba(239,68,68,.06);
    }
    .gcv-checkbox {
      width: 17px;
      height: 17px;
      accent-color: var(--pm-primary, #6366f1);
      cursor: pointer;
      flex-shrink: 0;
    }
    .gcv-empty-list {
      font-size: .8rem;
      color: var(--pm-text-muted, #64748b);
      margin: .5rem 0;
      padding: .5rem .75rem;
    }
    .gcv-add-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: .5rem;
    }

    /* ── Buttons ── */
    .gcv-btn {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      border: none;
      border-radius: 9px;
      padding: .55rem 1.1rem;
      font-size: .875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all .18s;
    }
    .gcv-btn-primary {
      background: linear-gradient(135deg, var(--pm-primary, #6366f1), #8b5cf6);
      color: #fff;
    }
    .gcv-btn-primary:hover { opacity: .9; transform: translateY(-1px); }
    .gcv-btn-ghost {
      background: var(--pm-surface-2, #f1f5f9);
      color: var(--pm-text, #1e293b);
    }
    .gcv-btn-ghost:hover { background: var(--pm-border, #e2e8f0); }

    /* ── Empty state ── */
    .gcv-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 280px;
      text-align: center;
      padding: 2rem;
    }
    .gcv-empty-icon {
      font-size: 3rem;
      color: var(--pm-text-muted, #94a3b8);
      margin-bottom: 1rem;
    }
    .gcv-empty-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--pm-text, #1e293b);
      margin: 0 0 .4rem;
    }
    .gcv-empty-msg {
      font-size: .85rem;
      color: var(--pm-text-muted, #64748b);
      margin: 0;
    }


    /* Permission state */
    .gcv-permission-card {
      width: min(100%, 520px);
      margin: 2rem auto;
      padding: 3rem 2rem;
      text-align: center;
      background: var(--pm-surface-2, #f8fafc);
      border: 1px solid var(--pm-border, #e2e8f0);
      border-radius: 18px;
      box-shadow: 0 18px 45px rgba(15, 23, 42, .08);
    }
    .gcv-permission-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(59, 130, 246, .12);
      color: var(--pm-primary, #3b82f6);
      font-size: 2.5rem;
    }
    .gcv-permission-title {
      color: var(--pm-text, #1e293b);
      font-size: 1.4rem;
      font-weight: 800;
      margin: 0 0 .75rem;
    }
    .gcv-permission-copy {
      color: var(--pm-text-muted, #64748b);
      line-height: 1.55;
      max-width: 410px;
      margin: 0 auto 1.5rem;
    }
    .gcv-pending-badge {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      padding: .85rem 1rem;
      border-radius: 12px;
      background: rgba(234, 179, 8, .12);
      border: 1px solid rgba(234, 179, 8, .34);
      color: #eab308;
      font-weight: 700;
      font-size: .85rem;
    }

    /* ── Loading ── */
    .gcv-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }
    .gcv-spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--pm-border, #e2e8f0);
      border-top-color: var(--pm-primary, #6366f1);
      border-radius: 50%;
      animation: gcv-spin .7s linear infinite;
    }
    .gcv-spinner-sm {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: gcv-spin .7s linear infinite;
    }
    @keyframes gcv-spin { to { transform: rotate(360deg); } }

    /* ── Skeleton ── */
    .gcv-skeleton {
      background: linear-gradient(90deg, var(--pm-border, #e2e8f0) 25%, var(--pm-bg-secondary, #f1f5f9) 50%, var(--pm-border, #e2e8f0) 75%);
      background-size: 200% 100%;
      animation: gcv-shimmer 1.4s ease infinite;
      border-radius: 10px;
    }
    .gcv-skel-title { height: 36px; width: 220px; }
    .gcv-skel-card { height: 90px; }
    @keyframes gcv-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* ── Utility ── */

    [data-bs-theme="dark"] .gcv-clase-card,
    [data-bs-theme="dark"] .gcv-panel,
    [data-portal-theme="dark"] .gcv-clase-card,
    [data-portal-theme="dark"] .gcv-panel {
      background: rgba(28, 28, 30, .92);
      border-color: rgba(148, 163, 184, .28);
      box-shadow: 0 18px 45px rgba(0, 0, 0, .18);
    }
    [data-bs-theme="dark"] .gcv-clase-card.active,
    [data-portal-theme="dark"] .gcv-clase-card.active {
      background: linear-gradient(135deg, rgba(37, 99, 235, .22), rgba(124, 58, 237, .14));
      border-color: var(--pm-primary, #3b82f6);
    }
    [data-bs-theme="dark"] .gcv-search-bar,
    [data-bs-theme="dark"] .gcv-new-form,
    [data-bs-theme="dark"] .gcv-input,
    [data-bs-theme="dark"] .gcv-btn-ghost,
    [data-bs-theme="dark"] .gcv-horario-chip,
    [data-portal-theme="dark"] .gcv-search-bar,
    [data-portal-theme="dark"] .gcv-new-form,
    [data-portal-theme="dark"] .gcv-input,
    [data-portal-theme="dark"] .gcv-btn-ghost,
    [data-portal-theme="dark"] .gcv-horario-chip {
      background: rgba(15, 23, 42, .72);
      border-color: rgba(148, 163, 184, .28);
      color: var(--pm-text, #f8fafc);
    }
    [data-bs-theme="dark"] .gcv-student-row:hover,
    [data-portal-theme="dark"] .gcv-student-row:hover {
      background: rgba(15, 23, 42, .55);
      border-color: rgba(148, 163, 184, .24);
    }
    [data-bs-theme="dark"] .gcv-permission-card,
    [data-portal-theme="dark"] .gcv-permission-card {
      background: rgba(28, 28, 30, .92);
      border-color: rgba(148, 163, 184, .28);
      box-shadow: 0 18px 45px rgba(0, 0, 0, .24);
    }

    .d-none { display: none !important; }
  `
  document.head.appendChild(style)
}
