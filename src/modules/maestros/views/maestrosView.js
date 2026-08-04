import '../styles/maestros.css'
import { AppModal } from '../../../shared/components/AppModal.js'
import {
  obtenerMaestros,
  crearMaestroConAuth,
  actualizarMaestro,
  inactivarMaestro,
  activarMaestro,
  validarEmail,
} from '../api/maestrosApi.js'
import {
  obtenerEstadoCredencialesMaestro,
  revelarCredencialesMaestro,
  generarCredencialesMaestro,
} from '../api/maestroCredencialesApi.js'
import { escapeHTML, getStatusColor, getStatusLabel, getInitials } from '../utils/maestrosUtils.js'
import {
  obtenerClasesPorMaestro,
  actualizarClase,
  obtenerAlumnosInscritosPorClases,
} from '../../clases/api/clasesApi.js'
import { openClaseModal } from '../../clases/components/claseModal.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
import { descargarPdfReporteMaestro } from '../domain/generarPdfReporteMaestro.js'

const state = {
  maestros: [],
  maestrosOriginales: [],
  editando: null,
  deletingId: null,
}

const VALIDATION = {
  nombreMax: 100,
}

let currentContainer = null

// â”€â”€â”€ Entry point â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ESPECTACULOS_PREDEFINIDOS = [
  'Piano',
  'Guitarra',
  'ViolÃ­n',
  'Viola',
  'Cello',
  'Contrabajo',
  'Flauta',
  'Clarinete',
  'Oboe',
  'Fagot',
  'SaxofÃ³n',
  'Trompeta',
  'TrombÃ³n',
  'Corno',
  'Tuba',
  'PercusiÃ³n',
  'BaterÃ­a',
  'Canto',
  'TeorÃ­a',
  'Solfeo',
  'DirecciÃ³n',
  'ComposiciÃ³n',
  'Arreglos',
]

export async function renderMaestrosView(container) {
  try {
    renderLoading(container)
    const maestros = await obtenerMaestros()
    state.maestros = maestros
    state.maestrosOriginales = [...maestros]
    renderContent(container)
    attachEvents(container)
  } catch (error) {
    console.error(error)
    renderError(container, error.message)
  }
}

// â”€â”€â”€ Render helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando maestros...</p>
      </div>
    </div>
  `
}

function renderError(container, mensaje) {
  container.innerHTML = `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${escapeHTML(mensaje)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
  container
    .querySelector('#retryBtn')
    ?.addEventListener('click', () => renderMaestrosView(container))
}

function renderEspecialidadesChips(especialidades = [], inputId = 'modal-especialidades-input') {
  const containerId = 'modal-especialidades-container'
  return `
    <div class="mb-3">
      <label class="form-label-compact">Especialidades</label>
      <div class="especialidades-chips-container" id="${containerId}">
        <div class="chips-wrapper d-flex flex-wrap gap-1 mb-2">
          ${especialidades
            .map(
              (e) => `
            <span class="badge bg-primary-subtle text-primary rounded-pill chip-item">
              ${escapeHTML(e)}
              <i class="bi bi-x-lg chip-remove" data-especialidad="${escapeHTML(e)}" style="cursor:pointer;margin-left:4px;"></i>
            </span>
          `,
            )
            .join('')}
        </div>
        <div class="d-flex gap-2">
          <input type="text" class="form-control input-dense" id="${inputId}" placeholder="Escribir y presionar Enter...">
          <button type="button" class="btn btn-outline-secondary btn-sm-compact" id="btnAddEspecialidad">
            <i class="bi bi-plus-lg"></i>
          </button>
        </div>
        <div class="mt-2">
          <small class="text-muted">Sugerencias:</small>
          <div class="d-flex flex-wrap gap-1 mt-1">
            ${ESPECTACULOS_PREDEFINIDOS.slice(0, 8)
              .map(
                (e) => `
              <button type="button" class="btn btn-link btn-sm p-0 suggest-chip" data-especialidad="${escapeHTML(e)}">${escapeHTML(e)}</button>
            `,
              )
              .join(', ')}
          </div>
        </div>
      </div>
    </div>
  `
}

function getEspecialidadesFromModal(modalBody) {
  const container = modalBody.querySelector('.especialidades-chips-container')
  if (!container) return []
  const chips = container.querySelectorAll('.chip-item')
  return Array.from(chips).map((chip) => chip.textContent.replace(/Ã—$/, '').trim())
}

function attachEspecialidadesEvents(modalBody, onChange) {
  const input = modalBody.querySelector('#modal-especialidades-input')
  const addBtn = modalBody.querySelector('#btnAddEspecialidad')
  const container = modalBody.querySelector('.especialidades-chips-container')

  const addEspecialidad = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return
    const current = getEspecialidadesFromModal(modalBody)
    if (!current.includes(trimmed)) {
      const wrapper = container.querySelector('.chips-wrapper')
      const chip = document.createElement('span')
      chip.className = 'badge bg-primary-subtle text-primary rounded-pill chip-item'
      chip.innerHTML = `${escapeHTML(trimmed)}<i class="bi bi-x-lg chip-remove" data-especialidad="${escapeHTML(trimmed)}" style="cursor:pointer;margin-left:4px;"></i>`
      wrapper.appendChild(chip)
      if (onChange) onChange()
    }
    input.value = ''
  }

  input?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addEspecialidad(input.value)
    }
  })

  addBtn?.addEventListener('click', () => addEspecialidad(input.value))

  container?.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip-remove')) {
      e.target.closest('.chip-item').remove()
      if (onChange) onChange()
    }
    if (e.target.classList.contains('suggest-chip')) {
      e.preventDefault()
      addEspecialidad(e.target.dataset.especialidad)
    }
  })
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="maestros-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-person-check fs-4"></i>
          </div>
          <div>
            <h1 class="maestros-title-premium mb-0">Maestros</h1>
            <p class="text-muted small mb-0">${state.maestros.length} maestros en total</p>
          </div>
        </div>
        
        <div class="maestros-header-actions">
          <button class="btn-help-trigger" id="btn-help-maestros" title="Â¿CÃ³mo funciona esta pantalla?" aria-label="Ayuda">
            <i class="bi bi-question"></i>
          </button>
          <button class="btn btn-outline-success btn-sm-compact me-2" id="btnExportarCSV" title="Exportar CSV">
            <i class="bi bi-file-earmark-spreadsheet"></i> CSV
          </button>
          <button class="btn btn-premium-action" id="btnAgregarMaestro">
            <i class="bi bi-plus-lg me-1.5"></i>Nuevo Maestro
          </button>
        </div>
      </div>

      <div class="maestros-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar maestro..." id="buscar" autocomplete="off">
        </div>
        
        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroEstado">
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      <div class="page-glass rounded w-100">
        <div class="list-group list-group-flush w-100" id="maestrosTBody">
          ${renderTableRows(state.maestros)}
        </div>
      </div>

    </div>
  `
}

function renderTableRows(maestros) {
  if (!maestros.length) {
    return `
      <div class="text-center py-5 w-100 text-muted list-group-item" style="background: transparent; border: none;">
        <i class="bi bi-inbox fs-1 d-block mb-3" style="color: var(--bs-secondary);"></i>
        No hay maestros registrados.
      </div>`
  }
  return maestros
    .map((a) => {
      const nombre = a.nombre || a.name || '-'
      const isActive = a.is_active ?? true
      const accentClass = `border-accent-${isActive ? 'success' : 'secondary'}`
      const statusDotClass = `bg-${isActive ? 'success' : 'secondary'}`
      return `
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${accentClass}" data-id="${a.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${getInitials(nombre)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${statusDotClass} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${escapeHTML(nombre)}</span>
            <small class="text-muted text-truncate">
              ${escapeHTML(a.instrumento || 'Sin instrumento especificado')}
            </small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          <button class="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center btn-maestro-pdf" data-action="pdf" data-id="${a.id}" title="Descargar Reporte PDF de Clases y Alumnos" style="width: 32px; height: 32px; padding: 0;">
            <i class="bi bi-file-earmark-pdf"></i>
          </button>
          ${
            a.telefono
              ? `
            <button class="btn btn-sm btn-success bg-gradient text-white rounded-pill px-3 shadow-sm d-flex align-items-center gap-2" data-action="whatsapp" data-id="${a.id}" title="Enviar WhatsApp" style="min-height: 32px;" ${!isActive ? 'disabled' : ''}>
              <i class="bi bi-whatsapp"></i> <span class="d-none d-sm-inline fw-medium">${escapeHTML(a.telefono)}</span>
            </button>
          `
              : '<span class="badge bg-light text-muted border d-none d-sm-inline-block">Sin nÃºmero</span>'
          }
          <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `
    })
    .join('')
}

// â”€â”€â”€ Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function attachEvents(container) {
  currentContainer = container

  container.querySelector('#btnAgregarMaestro').addEventListener('click', () => openCreateModal())

  container.querySelector('#btn-help-maestros')?.addEventListener('click', () => {
    HelpPanel.open({
      title: 'Maestros',
      intro:
        'GestiÃ³n del plantel docente. Desde acÃ¡ podÃ©s ver, agregar, editar y desactivar maestros, y acceder al perfil completo de cada uno.',
      sections: [
        {
          icon: 'bi-search',
          title: 'Buscador y filtros',
          description: 'FiltrÃ¡ por nombre, instrumento o estado (activo/inactivo) en tiempo real.',
          color: '#6b7280',
        },
        {
          icon: 'bi-person-badge',
          title: 'Tarjeta de maestro',
          description:
            'Nombre, instrumento principal, clases activas y estado. Badge verde = activo, gris = inactivo.',
          color: '#3b82f6',
        },
        {
          icon: 'bi-eye',
          title: 'Ver perfil',
          description:
            'Perfil completo: datos personales, clases (titular y suplente), horarios y ocupaciÃ³n.',
          color: '#10b981',
        },
        {
          icon: 'bi-pencil',
          title: 'Editar desde el perfil',
          description:
            'Desde el perfil podÃ©s editar cualquier clase que dicte directamente, sin salir del modal.',
          color: '#f59e0b',
        },
        {
          icon: 'bi-person-x',
          title: 'Desactivar maestro',
          description:
            'Desactivar oculta al maestro de listas operativas pero conserva su historial. No elimina datos.',
          color: '#ef4444',
        },
      ],
    })
  })

  container.querySelector('#btnExportarCSV')?.addEventListener('click', () => exportarMaestrosCSV())

  container.querySelector('#buscar').addEventListener('input', () => applyFilters())
  container.querySelector('#filtroEstado').addEventListener('change', () => applyFilters())

  container.querySelector('#maestrosTBody').addEventListener('click', (e) => {
    const row = e.target.closest('.list-group-item[data-id]')
    if (row && !e.target.closest('[data-action]')) {
      openViewModal(row.dataset.id)
      return
    }

    const btn = e.target.closest('[data-action]')
    if (!btn) return
    const id = btn.dataset.id
    const action = btn.dataset.action
    if (action === 'edit') openEditModal(id)
    else if (action === 'delete') openDeleteModal(id)
    else if (action === 'whatsapp') openWhatsAppModal(id)
    else if (action === 'pdf') {
      const maestro = state.maestrosOriginales.find((m) => m.id === id)
      if (!maestro) return
      descargarReporteMaestroPdf(maestro, btn)
    }
  })
}

async function descargarReporteMaestroPdf(maestro, btn) {
  if (btn) {
    btn.disabled = true
    btn.style.opacity = '0.5'
  }
  try {
    const clases = await obtenerClasesPorMaestro(maestro.id)
    const claseIds = clases.map((c) => c.id)
    let inscripcionesMap = {}
    if (claseIds.length > 0) {
      inscripcionesMap = await obtenerAlumnosInscritosPorClases(claseIds)
    }
    const { data: salones } = await supabase.from('salones').select('*')
    descargarPdfReporteMaestro(maestro, clases, inscripcionesMap, { salones })
    showToast('Reporte PDF descargado exitosamente', 'success')
  } catch (err) {
    console.error('Error al generar PDF:', err)
    showToast('Error al generar PDF: ' + err.message, 'error')
  } finally {
    if (btn) {
      btn.disabled = false
      btn.style.opacity = '1'
    }
  }
}

function openWhatsAppModal(id) {
  const maestro = state.maestrosOriginales.find((a) => a.id === id)
  if (!maestro || !maestro.telefono) return

  const telefonoLimpio = maestro.telefono.replace(/\D/g, '')

  AppModal.open({
    title: 'Enviar WhatsApp a ' + escapeHTML(maestro.nombre || maestro.name || ''),
    size: 'md',
    saveText: 'Enviar WhatsApp',
    body: `
      <div class="mb-3">
        <label class="form-label-compact">NÃºmero de destino</label>
        <p class="form-control-plaintext fw-bold mb-0">
          <i class="bi bi-whatsapp text-success me-1"></i> +${telefonoLimpio}
        </p>
      </div>
      <div class="mb-3">
        <label class="form-label-compact">Mensaje</label>
        <textarea class="form-control input-dense" id="modal-whatsapp-msg" rows="4" placeholder="Escribe tu mensaje aquÃ­..."></textarea>
      </div>
      <p class="text-muted small mb-0">
        Se abrirÃ¡ WhatsApp Web (o la aplicaciÃ³n) con el mensaje listo para ser enviado.
      </p>
    `,
    onSave: async (modalBody) => {
      const msg = modalBody.querySelector('#modal-whatsapp-msg').value.trim()
      const url = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(msg)}`
      window.open(url, '_blank')
    },
  })
}

// â”€â”€â”€ Filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function applyFilters() {
  const searchTerm = currentContainer.querySelector('#buscar').value.trim().toLowerCase()
  const filtroEstado = currentContainer.querySelector('#filtroEstado').value

  state.maestros = state.maestrosOriginales.filter((a) => {
    const nombre = (a.nombre || a.name || '').toLowerCase()
    const matchSearch =
      !searchTerm ||
      nombre.includes(searchTerm) ||
      (a.email || '').toLowerCase().includes(searchTerm) ||
      (a.instrumento || '').toLowerCase().includes(searchTerm) ||
      (a.especialidad || '').toLowerCase().includes(searchTerm) ||
      (a.especialidades || []).some((e) => e.toLowerCase().includes(searchTerm))

    const isActive = a.is_active ?? true
    const matchEstado =
      filtroEstado === 'todos' ||
      (filtroEstado === 'activo' && isActive) ||
      (filtroEstado === 'inactivo' && !isActive)

    return matchSearch && matchEstado
  })

  refreshTable()
}

// â”€â”€â”€ Modal openers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function openCreateModal() {
  state.editando = null
  AppModal.open({
    title: 'Crear Nuevo Maestro',
    body: `<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${VALIDATION.nombreMax}" placeholder="Juan PÃ©rez">
        <small class="text-muted" id="modal-nombreCount">0/${VALIDATION.nombreMax}</small>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Email *</label>
        <input type="email" class="form-control input-dense" id="modal-email" required placeholder="email@ejemplo.com">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">ContraseÃ±a *</label>
        <input type="password" class="form-control input-dense" id="modal-password" required placeholder="ContraseÃ±a para iniciar sesiÃ³n" minlength="6">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">TelÃ©fono</label>
        <input type="text" class="form-control input-dense" id="modal-telefono" placeholder="+58 412 1234567">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" required placeholder="ViolÃ­n">
      </div>
      ${renderEspecialidadesChips([], 'modal-especialidades-input')}
      <div class="col-12">
        <label class="form-label-compact">BiografÃ­a</label>
        <textarea class="form-control input-dense" id="modal-bio" rows="2" placeholder="Breve descripciÃ³n..."></textarea>
      </div>
    </form>`,
    onShow: (modalBody) => attachEspecialidadesEvents(modalBody),
    saveText: 'Crear Maestro',
    onSave: async (modalBody) => {
      const nombre = modalBody.querySelector('#modal-nombre').value.trim()
      const email = modalBody.querySelector('#modal-email').value.trim().toLowerCase()
      const password = modalBody.querySelector('#modal-password')?.value
      const telefono = modalBody.querySelector('#modal-telefono').value.trim()
      const instrumento = modalBody.querySelector('#modal-instrumento').value.trim()
      const bio = modalBody.querySelector('#modal-bio').value.trim()

      if (!nombre) {
        showToast('El nombre es obligatorio', 'error')
        return false
      }
      if (!email) {
        showToast('El email es obligatorio', 'error')
        return false
      }
      if (!isValidEmail(email)) {
        showToast('El formato del email no es vÃ¡lido', 'error')
        return false
      }
      if (!password || password.length < 6) {
        showToast('La contraseÃ±a debe tener al menos 6 caracteres', 'error')
        return false
      }
      if (!instrumento) {
        showToast('El instrumento es obligatorio', 'error')
        return false
      }

      const emailExiste = await validarEmail(email)
      if (emailExiste) {
        showToast('El email ya estÃ¡ registrado', 'error')
        return false
      }

      const especialidades = getEspecialidadesFromModal(modalBody)

      await crearMaestroConAuth({
        nombre,
        email,
        password,
        telefono,
        instrumento,
        especialidades,
        bio,
      })

      const maestros = await obtenerMaestros()
      state.maestros = maestros
      state.maestrosOriginales = [...maestros]
      applyFilters()
      showToast('Maestro creado exitosamente. Ya puede iniciar sesiÃ³n.', 'success')
    },
  })
}

function openEditModal(id) {
  const maestro = state.maestrosOriginales.find((a) => a.id === id)
  if (!maestro) {
    showToast('Maestro no encontrado', 'error')
    return
  }

  state.editando = id
  AppModal.open({
    title: 'Editar Maestro',
    body: `<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${VALIDATION.nombreMax}" value="${escapeHTML(maestro.nombre || maestro.name || '')}">
        <small class="text-muted" id="modal-nombreCount">${(maestro.nombre || maestro.name || '').length}/${VALIDATION.nombreMax}</small>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Email *</label>
        <input type="email" class="form-control input-dense" id="modal-email" required value="${escapeHTML(maestro.email || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">TelÃ©fono</label>
        <input type="text" class="form-control input-dense" id="modal-telefono" value="${escapeHTML(maestro.telefono || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" required value="${escapeHTML(maestro.instrumento || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Especialidad</label>
        <input type="text" class="form-control input-dense" id="modal-especialidad" value="${escapeHTML(maestro.especialidad || '')}">
      </div>
      ${renderEspecialidadesChips(maestro.especialidades || [], 'modal-especialidades-input')}
      <div class="col-12">
        <label class="form-label-compact">BiografÃ­a</label>
        <textarea class="form-control input-dense" id="modal-bio" rows="2">${escapeHTML(maestro.bio || '')}</textarea>
      </div>
      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="modal-esActivo" ${maestro.is_active !== false ? 'checked' : ''}>
          <label class="form-check-label" for="modal-esActivo">Maestro activo</label>
        </div>
      </div>
    </form>`,
    onShow: (modalBody) => attachEspecialidadesEvents(modalBody),
    saveText: 'Guardar cambios',
    onSave: async (modalBody) => {
      const nombre = modalBody.querySelector('#modal-nombre').value.trim()
      const email = modalBody.querySelector('#modal-email').value.trim().toLowerCase()
      const telefono = modalBody.querySelector('#modal-telefono').value.trim()
      const instrumento = modalBody.querySelector('#modal-instrumento').value.trim()
      const especialidad = modalBody.querySelector('#modal-especialidad').value.trim()
      const bio = modalBody.querySelector('#modal-bio').value.trim()
      const esActivo = modalBody.querySelector('#modal-esActivo').checked

      if (!nombre) {
        showToast('El nombre es obligatorio', 'error')
        return false
      }
      if (!email) {
        showToast('El email es obligatorio', 'error')
        return false
      }
      if (!isValidEmail(email)) {
        showToast('El formato del email no es vÃ¡lido', 'error')
        return false
      }

      if (email && maestro.email !== email) {
        const emailExiste = await validarEmail(email)
        if (emailExiste) {
          showToast('El email ya estÃ¡ registrado', 'error')
          return false
        }
      }

      const especialidades = getEspecialidadesFromModal(modalBody)
      const datosMaestro = {
        nombre,
        email: email || null,
        telefono: telefono || null,
        instrumento: instrumento || null,
        especialidad: especialidad || null,
        bio: bio || null,
        is_active: esActivo,
        especialidades,
      }
      await actualizarMaestro(state.editando, datosMaestro)
      const idx = state.maestrosOriginales.findIndex((a) => a.id === state.editando)
      if (idx !== -1)
        state.maestrosOriginales[idx] = { ...state.maestrosOriginales[idx], ...datosMaestro }
      applyFilters()
      showToast('Maestro actualizado correctamente', 'success')
    },
  })
}

function openViewModal(id) {
  const maestro = state.maestrosOriginales.find((a) => a.id === id)
  if (!maestro) {
    showToast('Maestro no encontrado', 'error')
    return
  }

  const nombre = maestro.nombre || maestro.name || '-'
  const isActive = maestro.is_active ?? true
  const headerActionsHTML = `
    <div class="d-flex align-items-center gap-1">
      <button class="btn btn-sm text-white border-0 d-inline-flex align-items-center justify-content-center px-2 py-1" id="modal-view-btn-pdf" style="background: rgba(255,255,255,0.18); font-size: 0.8rem; border-radius: 6px;" type="button" title="Descargar Reporte PDF">
        <i class="bi bi-file-earmark-pdf me-1"></i>PDF
      </button>
      <button class="btn btn-sm text-white border-0 d-inline-flex align-items-center justify-content-center px-2 py-1" id="modal-view-btn-edit" style="background: rgba(255,255,255,0.18); font-size: 0.8rem; border-radius: 6px;" type="button" title="Editar Perfil">
        <i class="bi bi-pencil me-1"></i>Editar
      </button>
      <button class="btn btn-sm text-white border-0 d-inline-flex align-items-center justify-content-center px-2 py-1" id="modal-view-btn-delete" style="background: rgba(220, 53, 69, 0.45); font-size: 0.8rem; border-radius: 6px;" type="button" title="Eliminar Maestro">
        <i class="bi bi-trash me-1"></i>Eliminar
      </button>
    </div>
  `

  AppModal.open({
    title: nombre,
    headerActions: headerActionsHTML,
    autoFocus: false,
    hideSave: true,
    cancelText: 'Cerrar',
    body: `
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${escapeHTML(nombre)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Email</label>
            <p class="form-control-plaintext">${maestro.email ? `<a href="mailto:${escapeHTML(maestro.email)}">${escapeHTML(maestro.email)}</a>` : '-'}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">TelÃ©fono</label>
            <p class="form-control-plaintext">${escapeHTML(maestro.telefono || '-')}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Instrumento</label>
            <p class="form-control-plaintext">${escapeHTML(maestro.instrumento || '-')}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Especialidad</label>
            <p class="form-control-plaintext">${escapeHTML(maestro.especialidad || '-')}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Especialidades</label>
            <p class="form-control-plaintext">
              ${
                (maestro.especialidades || []).length
                  ? maestro.especialidades
                      .map(
                        (e) =>
                          `<span class="badge bg-primary-subtle text-primary me-1">${escapeHTML(e)}</span>`,
                      )
                      .join('')
                  : 'Sin especialidades'
              }
            </p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${getStatusColor(isActive)}">${getStatusLabel(isActive)}</span>
            </p>
          </div>
        </div>
      </div>
      <hr>
      <div class="mb-4">
        <label class="form-label fw-bold">BiografÃ­a</label>
        <p class="form-control-plaintext">${escapeHTML(maestro.bio || 'Sin biografÃ­a')}</p>
      </div>
      <hr>
      <div class="mb-4">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div>
            <label class="form-label fw-bold mb-0">Credenciales de acceso</label>
            <div class="text-muted small">Se almacenan cifradas y se pueden recuperar en cualquier momento desde ADM.</div>
          </div>
          <span class="badge bg-secondary-subtle text-secondary" id="maestro-cred-status">Cargando...</span>
        </div>
        <div id="maestro-cred-container">
          <div class="d-flex align-items-center gap-2 text-muted py-2">
            <div class="spinner-border spinner-border-sm text-primary"></div>
            <small>Cargando credenciales...</small>
          </div>
        </div>
      </div>
      <hr>
      <div class="mb-2">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="fw-bold" style="font-size:0.95rem;"><i class="bi bi-journal-text me-1 text-primary"></i> Clases Asignadas</span>
          <span id="maestro-clases-badge" class="badge bg-primary-subtle text-primary rounded-pill" style="font-size:0.75rem;">Cargando...</span>
        </div>
        <div id="maestro-clases-container">
          <div class="d-flex align-items-center gap-2 text-muted py-2">
            <div class="spinner-border spinner-border-sm text-primary"></div>
            <small>Cargando clases...</small>
          </div>
        </div>
      </div>
    `,
    onShow: async (modalBody) => {
      const dialog = modalBody.closest('.app-modal-dialog')
      dialog?.querySelector('#modal-view-btn-pdf')?.addEventListener('click', (e) => {
        descargarReporteMaestroPdf(maestro, e.currentTarget)
      })
      dialog?.querySelector('#modal-view-btn-edit')?.addEventListener('click', () => {
        AppModal.close()
        setTimeout(() => openEditModal(id), 300)
      })
      dialog?.querySelector('#modal-view-btn-delete')?.addEventListener('click', () => {
        AppModal.close()
        setTimeout(() => openDeleteModal(id), 300)
      })

      const credContainer = modalBody.querySelector('#maestro-cred-container')
      const credStatus = modalBody.querySelector('#maestro-cred-status')
      const fechaFormatter = new Intl.DateTimeFormat('es-DO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
      const maskPassword = '••••••••••••••'

      let currentPlainPassword = null
      let currentCredentialData = null

      const formatCredentialDate = (value) => {
        if (!value) return 'Sin registro'
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return 'Sin registro'
        return fechaFormatter.format(date)
      }

      const setCredentialBadge = (label, tone = 'secondary') => {
        if (!credStatus) return
        credStatus.className = `badge bg-${tone}-subtle text-${tone}`
        credStatus.textContent = label
      }

      const renderCredentialActions = (hasCredentials) => `
        <div class="d-flex flex-wrap gap-2">
          ${
            hasCredentials
              ? `
            <button type="button" class="btn btn-outline-primary btn-sm" id="btn-maestro-cred-reveal">
              <i class="bi bi-eye me-1"></i>Ver contraseña
            </button>
            <button type="button" class="btn btn-outline-secondary btn-sm" id="btn-maestro-cred-copy" ${
              currentPlainPassword ? '' : 'disabled'
            }>
              <i class="bi bi-copy me-1"></i>Copiar
            </button>
            <button type="button" class="btn btn-warning btn-sm" id="btn-maestro-cred-regenerate">
              <i class="bi bi-arrow-repeat me-1"></i>Regenerar contraseña
            </button>
          `
              : `
            <button type="button" class="btn btn-primary btn-sm" id="btn-maestro-cred-generate">
              <i class="bi bi-key me-1"></i>Generar contraseña
            </button>
          `
          }
          <button type="button" class="btn btn-outline-secondary btn-sm" id="btn-maestro-cred-refresh">
            <i class="bi bi-arrow-clockwise me-1"></i>Actualizar estado
          </button>
        </div>
      `

      const renderCredentialCard = (credentialData, plainPassword = null) => {
        currentCredentialData = credentialData
        currentPlainPassword = plainPassword

        const hasCredentials = !!credentialData?.hasCredentials
        const credentialEmail = credentialData?.email || maestro.email || maestro.correo || '-'
        const passwordVersion = credentialData?.passwordVersion || 0
        const passwordValue =
          plainPassword || (hasCredentials ? maskPassword : 'Sin contraseña generada')

        credContainer.innerHTML = `
          <div class="card border-0 bg-body-tertiary">
            <div class="card-body p-3">
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <div class="small text-muted">Correo de acceso</div>
                  <div class="fw-semibold text-break">${escapeHTML(credentialEmail)}</div>
                </div>
                <div class="col-md-3">
                  <div class="small text-muted">Versión</div>
                  <div class="fw-semibold">${hasCredentials ? `v${passwordVersion}` : '—'}</div>
                </div>
                <div class="col-md-3">
                  <div class="small text-muted">Vinculación</div>
                  <div class="fw-semibold">${credentialData?.userLinked ? 'Activa' : 'Pendiente'}</div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold mb-1">Contraseña</label>
                <input
                  type="text"
                  class="form-control font-monospace"
                  id="maestro-cred-password-input"
                  readonly
                  value="${escapeHTML(passwordValue)}"
                >
                <div class="form-text">
                  ${hasCredentials ? 'La contraseña se almacena cifrada en la base de datos.' : 'Aún no existe una contraseña para este maestro.'}
                </div>
              </div>

              <div class="d-flex flex-column gap-2">
                ${renderCredentialActions(hasCredentials)}
                <div class="small text-muted">
                  <div><strong>Generada:</strong> ${formatCredentialDate(credentialData?.lastGeneratedAt)}</div>
                  <div><strong>Última visualización:</strong> ${formatCredentialDate(credentialData?.lastRevealedAt)}</div>
                </div>
              </div>
            </div>
          </div>
        `

        const passwordInput = credContainer.querySelector('#maestro-cred-password-input')
        const revealBtn = credContainer.querySelector('#btn-maestro-cred-reveal')
        const copyBtn = credContainer.querySelector('#btn-maestro-cred-copy')
        const regenerateBtn = credContainer.querySelector('#btn-maestro-cred-regenerate')
        const generateBtn = credContainer.querySelector('#btn-maestro-cred-generate')
        const refreshBtn = credContainer.querySelector('#btn-maestro-cred-refresh')

        const setPasswordValue = (value) => {
          currentPlainPassword = value
          if (passwordInput) passwordInput.value = value
          if (copyBtn) copyBtn.disabled = !value
        }

        revealBtn?.addEventListener('click', async () => {
          try {
            revealBtn.disabled = true
            revealBtn.innerHTML =
              '<span class="spinner-border spinner-border-sm me-1"></span>Verificando...'
            const result = await revelarCredencialesMaestro(id)
            setCredentialBadge('Visible', 'success')
            setPasswordValue(result.password)
            showToast('Contraseña revelada correctamente', 'success')
          } catch (error) {
            showToast(error.message || 'No se pudo revelar la contraseña', 'error')
          } finally {
            revealBtn.disabled = false
            revealBtn.innerHTML = '<i class="bi bi-eye me-1"></i>Ver contraseña'
          }
        })

        copyBtn?.addEventListener('click', async () => {
          if (!currentPlainPassword) {
            showToast('Primero debes ver la contraseña', 'warning')
            return
          }

          try {
            await navigator.clipboard.writeText(currentPlainPassword)
            showToast('Contraseña copiada al portapapeles', 'success')
          } catch {
            showToast('No se pudo copiar la contraseña', 'error')
          }
        })

        const generatePassword = async ({ confirmReplace = false } = {}) => {
          if (
            confirmReplace &&
            !confirm('Esto reemplazará la contraseña actual del maestro. ¿Deseas continuar?')
          ) {
            return
          }

          let button = null
          try {
            button = confirmReplace ? regenerateBtn : generateBtn
            if (button) {
              button.disabled = true
              button.innerHTML =
                '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...'
            }

            const result = await generarCredencialesMaestro(id)
            setCredentialBadge('Cifradas', 'success')
            renderCredentialCard(
              {
                ...(currentCredentialData || {}),
                hasCredentials: true,
                email: result.email || credentialEmail,
                passwordVersion: result.passwordVersion || passwordVersion + 1,
                lastGeneratedAt: result.generatedAt || new Date().toISOString(),
                lastRevealedAt: null,
                userLinked: true,
              },
              result.password,
            )
            showToast('Credenciales generadas correctamente', 'success')
          } catch (error) {
            showToast(error.message || 'No se pudieron generar las credenciales', 'error')
          } finally {
            if (button) {
              button.disabled = false
              button.innerHTML = confirmReplace
                ? '<i class="bi bi-arrow-repeat me-1"></i>Regenerar contraseña'
                : '<i class="bi bi-key me-1"></i>Generar contraseña'
            }
          }
        }

        regenerateBtn?.addEventListener('click', () => {
          void generatePassword({ confirmReplace: true })
        })

        generateBtn?.addEventListener('click', () => {
          void generatePassword()
        })

        refreshBtn?.addEventListener('click', () => {
          void loadCredentialState()
        })
      }

      const loadCredentialState = async () => {
        try {
          setCredentialBadge('Cargando...', 'secondary')
          credContainer.innerHTML = `
            <div class="d-flex align-items-center gap-2 text-muted py-2">
              <div class="spinner-border spinner-border-sm text-primary"></div>
              <small>Cargando credenciales...</small>
            </div>
          `

          const credentialState = await obtenerEstadoCredencialesMaestro(id)
          currentCredentialData = credentialState
          setCredentialBadge(
            credentialState.hasCredentials ? 'Cifradas' : 'Sin credenciales',
            credentialState.hasCredentials ? 'success' : 'warning',
          )
          renderCredentialCard(credentialState)
        } catch (error) {
          setCredentialBadge('Error', 'danger')
          credContainer.innerHTML = `
            <div class="alert alert-danger py-2 mb-0 small">
              <i class="bi bi-exclamation-triangle me-1"></i>
              ${escapeHTML(error.message || 'No se pudieron cargar las credenciales')}
            </div>
          `
        }
      }
      const clasesContainer = modalBody.querySelector('#maestro-clases-container')
      const badge = modalBody.querySelector('#maestro-clases-badge')

      const renderClasesSection = async () => {
        try {
          const [clases, maestrosRes, salonesRes, programasRes, alumnosRes] = await Promise.all([
            obtenerClasesPorMaestro(id),
            supabase.from('maestros').select('*').order('nombre_completo', { ascending: true }),
            supabase.from('salones').select('*').order('nombre', { ascending: true }),
            supabase.from('programas').select('*').order('nombre', { ascending: true }),
            supabase
              .from('alumnos')
              .select('*')
              .eq('activo', true)
              .order('nombre_completo', { ascending: true }),
          ])

          const catalogos = {
            maestros: maestrosRes.data || [],
            salones: salonesRes.data || [],
            programas: programasRes.data || [],
            alumnos: alumnosRes.data || [],
          }

          badge.textContent = `${clases.length} clase${clases.length !== 1 ? 's' : ''}`

          if (clases.length === 0) {
            clasesContainer.innerHTML = `
              <div class="text-center py-4 text-muted">
                <i class="bi bi-journal-x" style="font-size:2rem; opacity:0.4;"></i>
                <p class="mt-2 mb-0 small">Sin clases asignadas actualmente.</p>
              </div>`
            return
          }

          const DIAS = {
            lunes: 'Lun',
            martes: 'Mar',
            miercoles: 'MiÃ©',
            jueves: 'Jue',
            viernes: 'Vie',
            sabado: 'SÃ¡b',
            domingo: 'Dom',
          }
          const fmtHora = (t) => t?.slice(0, 5) || ''
          const fmtHorario = (h) =>
            `${DIAS[h.dia] || h.dia} ${fmtHora(h.hora_inicio)}â€“${fmtHora(h.hora_fin)}`

          clasesContainer.innerHTML = `
            <div class="d-flex flex-column gap-2">
              ${clases
                .map((c) => {
                  // BUG FIX: Clase model no mapea `activo`, usar `estado` (string de BD)
                  const esActiva = c.estado === 'activa' || c.estado == null
                  const ocupacion = c.capacidad_maxima
                    ? Math.round((c.total_alumnos / c.capacidad_maxima) * 100)
                    : null
                  const ocupColor =
                    ocupacion >= 90 ? '#ef4444' : ocupacion >= 70 ? '#f59e0b' : '#10b981'
                  const horarioPills = c.horarios
                    .map(
                      (h) =>
                        `<span style="background:var(--bs-tertiary-bg);border:1px solid var(--bs-border-color);border-radius:20px;padding:1px 8px;font-size:0.7rem;white-space:nowrap;">${fmtHorario(h)}</span>`,
                    )
                    .join('')

                  return `
                  <div class="clase-card" data-clase-id="${c.id}" style="
                    border-radius: 10px;
                    border: 1px solid var(--bs-border-color);
                    overflow: hidden;
                    transition: box-shadow 0.15s;
                    ${!esActiva ? 'opacity:0.6;' : ''}
                  ">
                    <div class="d-flex align-items-stretch">

                      <!-- Indicador de rol -->
                      <div style="width:4px;flex-shrink:0;background:${c.es_suplente ? '#f59e0b' : '#6366f1'};"></div>

                      <!-- Info -->
                      <div class="flex-grow-1 px-3 py-2 overflow-hidden">
                        <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          <span class="fw-semibold text-truncate" style="font-size:0.87rem;" title="${escapeHTML(c.nombre)}">${escapeHTML(c.nombre)}</span>
                          ${!esActiva ? `<span style="font-size:0.62rem;padding:1px 7px;border-radius:20px;background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;">Inactiva</span>` : ''}
                          ${c.es_suplente ? `<span style="font-size:0.62rem;padding:1px 7px;border-radius:20px;background:#fffbeb;color:#92400e;border:1px solid #fde68a;">Suplente</span>` : ''}
                        </div>

                        <div class="d-flex align-items-center gap-2 flex-wrap mb-1" style="font-size:0.75rem;color:var(--bs-secondary-color);">
                          ${c.instrumento ? `<span>${escapeHTML(c.instrumento)}</span><span style="opacity:0.3;">Â·</span>` : ''}
                          ${c.horarios.length ? horarioPills : `<span class="fst-italic" style="opacity:0.5;">Sin horario</span>`}
                        </div>

                        <div class="d-flex align-items-center gap-1" style="font-size:0.72rem;">
                          <i class="bi bi-people" style="color:var(--bs-secondary-color);"></i>
                          <span style="color:var(--bs-secondary-color);">${c.total_alumnos}${c.capacidad_maxima ? `/${c.capacidad_maxima}` : ''}</span>
                          ${
                            ocupacion !== null
                              ? `
                            <div style="flex:1;max-width:60px;height:4px;background:var(--bs-tertiary-bg);border-radius:2px;overflow:hidden;margin-left:4px;">
                              <div style="width:${ocupacion}%;height:100%;background:${ocupColor};border-radius:2px;transition:width 0.3s;"></div>
                            </div>
                            <span style="color:${ocupColor};font-weight:600;">${ocupacion}%</span>`
                              : ''
                          }
                        </div>
                      </div>

                      <!-- Acciones -->
                      <div class="d-flex flex-column" style="border-left:1px solid var(--bs-border-color);flex-shrink:0;">
                        <button class="btn btn-link btn-editar-clase d-flex flex-column align-items-center justify-content-center gap-1 flex-fill px-3"
                          data-clase-id="${c.id}" title="Editar"
                          style="font-size:0.65rem;color:#6366f1;text-decoration:none;border-radius:0;border-bottom:1px solid var(--bs-border-color);">
                          <i class="bi bi-pencil" style="font-size:0.95rem;"></i>
                          Editar
                        </button>
                        <button class="btn btn-link btn-desvincular-clase d-flex flex-column align-items-center justify-content-center gap-1 flex-fill px-3"
                          data-clase-id="${c.id}"
                          data-clase-nombre="${escapeHTML(c.nombre)}"
                          data-es-suplente="${c.es_suplente}"
                          title="Quitar"
                          style="font-size:0.65rem;color:#ef4444;text-decoration:none;border-radius:0;">
                          <i class="bi bi-person-dash" style="font-size:0.95rem;"></i>
                          Quitar
                        </button>
                      </div>

                    </div>
                  </div>`
                })
                .join('')}
            </div>`

          // â”€â”€ Editar clase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          clasesContainer.querySelectorAll('.btn-editar-clase').forEach((btn) => {
            btn.addEventListener('click', (e) => {
              const claseId = e.currentTarget.dataset.claseId
              const clase = clases.find((c) => c.id === claseId)
              if (!clase) return
              AppModal.close()
              setTimeout(() => {
                openClaseModal(clase, {
                  ...catalogos,
                  onSuccess: () => {
                    setTimeout(() => openViewModal(id), 300)
                  },
                })
              }, 300)
            })
          })

          // â”€â”€ Desvincular maestro â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          clasesContainer.querySelectorAll('.btn-desvincular-clase').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
              const claseId = e.currentTarget.dataset.claseId
              const claseNombre = e.currentTarget.dataset.claseNombre
              const esSuplente = e.currentTarget.dataset.esSuplente === 'true'
              const campo = esSuplente ? 'maestro_suplente_id' : 'maestro_principal_id'
              if (!confirm(`Â¿Quitar a este maestro de "${claseNombre}"?`)) return
              try {
                e.currentTarget.disabled = true
                e.currentTarget.innerHTML = '<span class="spinner-border spinner-border-sm"></span>'
                await actualizarClase(claseId, { [campo]: null }, true)
                showToast('Maestro desvinculado correctamente', 'success')
                AppModal.close()
                setTimeout(() => openViewModal(id), 300)
              } catch (err) {
                showToast('Error al desvincular: ' + err.message, 'error')
                e.currentTarget.disabled = false
                e.currentTarget.innerHTML =
                  '<i class="bi bi-person-dash" style="font-size:1rem;"></i><span>Quitar</span>'
              }
            })
          })
        } catch {
          badge.textContent = 'Error'
          clasesContainer.innerHTML = `
            <div class="alert alert-danger py-2 mb-0 small">
              <i class="bi bi-exclamation-triangle me-1"></i> Error al cargar las clases.
            </div>`
        }
      }

      void loadCredentialState()
      void renderClasesSection()
    },
  })
}

function openDeleteModal(id) {
  const maestro = state.maestrosOriginales.find((a) => a.id === id)
  if (!maestro) {
    showToast('Maestro no encontrado', 'error')
    return
  }

  state.deletingId = id
  const nombre = maestro.nombre || maestro.name || ''
  const isActive = maestro.is_active !== false

  AppModal.open({
    title: isActive ? 'â¸ï¸ Desactivar Maestro' : 'â–¶ï¸ Reactivar Maestro',
    size: 'sm',
    saveText: isActive ? 'Desactivar' : 'Reactivar',
    body: isActive
      ? `<p>Â¿Desactivar al maestro <strong>${escapeHTML(nombre)}</strong>?</p>
         <p class="text-muted small mb-0">El maestro no aparecerÃ¡ en las listas, pero sus datos se conservarÃ¡n.</p>`
      : `<p>Â¿Reactivar al maestro <strong>${escapeHTML(nombre)}</strong>?</p>
         <p class="text-muted small mb-0">El maestro volverÃ¡ a aparecer en las listas.</p>`,
    onSave: async () => {
      if (isActive) {
        await inactivarMaestro(id)
        showToast('Maestro desactivado correctamente', 'success')
      } else {
        await activarMaestro(id)
        showToast('Maestro reactivado correctamente', 'success')
      }
      applyFilters()
    },
  })
}

// â”€â”€â”€ Utils â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function refreshTable() {
  const tbody = currentContainer.querySelector('#maestrosTBody')
  if (!tbody) return
  tbody.innerHTML = renderTableRows(state.maestros)
  const countEl = currentContainer.querySelector('.maestros-header-premium p.text-muted')
  if (countEl) countEl.textContent = `${state.maestros.length} maestros en total`
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function exportarMaestrosCSV() {
  if (state.maestrosOriginales.length === 0) {
    showToast('No hay maestros para exportar', 'error')
    return
  }

  const headers = ['Nombre', 'Email', 'TelÃ©fono', 'Instrumento', 'Especialidad', 'Estado']
  const rows = state.maestrosOriginales.map((m) => [
    m.nombre || '',
    m.email || '',
    m.telefono || '',
    m.instrumento || '',
    m.especialidad || '',
    m.is_active !== false ? 'Activo' : 'Inactivo',
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `maestros-${new Date().toISOString().split('T')[0]}.csv`
  link.click()

  showToast('CSV exportado exitosamente', 'success')
}

function showToast(message, type = 'info') {
  const bgColor = type === 'success' ? '#198754' : type === 'error' ? '#dc3545' : '#0dcaf0'
  const icon =
    type === 'success'
      ? 'bi-check-circle'
      : type === 'error'
        ? 'bi-exclamation-circle'
        : 'bi-info-circle'
  const label = type === 'success' ? 'Ã‰xito' : type === 'error' ? 'Error' : 'InformaciÃ³n'

  const el = document.createElement('div')
  el.style.cssText = `
    position:fixed;top:1rem;right:1rem;z-index:12000;
    min-width:280px;max-width:420px;
    background:#fff;border-radius:8px;
    box-shadow:0 8px 30px rgba(0,0,0,0.18);
    overflow:hidden;
    font-family:system-ui,-apple-system,sans-serif;
    will-change:transform;isolation:isolate;
  `
  el.innerHTML = `
    <div style="display:flex;align-items:center;padding:0.75rem 1rem;background:${bgColor};color:#fff;">
      <i class="bi ${icon} me-2" style="font-size:1.1rem;"></i>
      <strong style="flex:1;font-size:0.9rem;">${label}</strong>
      <button type="button" style="background:none;border:none;color:#fff;cursor:pointer;font-size:1.1rem;line-height:1;padding:0;">&times;</button>
    </div>
    <div style="padding:0.75rem 1rem;font-size:0.875rem;color:#212529;">
      ${escapeHTML(message)}
    </div>
  `
  document.body.appendChild(el)

  el.querySelector('button').addEventListener('click', () => {
    el.remove()
  })
  setTimeout(() => {
    el.style.transition = 'opacity .3s'
    el.style.opacity = '0'
    setTimeout(() => el.remove(), 300)
  }, 3000)
}
