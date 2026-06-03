/**
 * Admin view for managing maestro permission requests (solicitudes_permisos)
 * Shows pending requests with approve/reject workflow
 */

import {
  obtenerSolicitudesPendientes,
  aprobarSolicitud,
  rechazarSolicitud,
} from '../../permisos/api/permisosSupabase.js'
import { supabase } from '../../../lib/supabaseClient.js'

export async function renderSolicitudesPermisosView(container) {
  // Get current authenticated user from supabase
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    container.innerHTML = `
      <div class="admin-empty">
        <i class="bi bi-shield-lock"></i>
        <p>No hay sesión activa.</p>
      </div>`
    return
  }

  container.innerHTML = `
    <div class="admin-solicitudes-view admin-fade-in" role="main" aria-label="Solicitudes de Permisos">
      <header class="admin-view-header">
        <h1 class="admin-display-md">Solicitudes de Permisos</h1>
        <p class="admin-caption">Aprueba o rechaza solicitudes de maestros para gestionar alumnos y clases</p>
      </header>
      <div id="admin-solicitudes-container" class="admin-content-area">
        <div class="admin-loading">
          <span class="spinner-apple"></span>
          <p>Cargando solicitudes pendientes...</p>
        </div>
      </div>
    </div>`

  await loadAndRenderSolicitudes(container, user.id)
}

async function loadAndRenderSolicitudes(container, adminId) {
  const contentArea = container.querySelector('#admin-solicitudes-container')

  try {
    const solicitudes = await obtenerSolicitudesPendientes()

    if (!solicitudes || solicitudes.length === 0) {
      contentArea.innerHTML = `
        <div class="admin-empty-state">
          <i class="bi bi-check-circle"></i>
          <h2>No hay solicitudes pendientes</h2>
          <p>Todas las solicitudes de permisos han sido revisadas.</p>
        </div>`
      return
    }

    contentArea.innerHTML = `
      <div class="admin-solicitudes-grid">
        ${solicitudes.map((sol) => renderSolicitudCard(sol, adminId)).join('')}
      </div>`

    // Asignar listeners a los botones
    attachSolicitudListeners(contentArea, adminId)
  } catch (err) {
    console.error('[SolicitudesPermisosView] Error cargando solicitudes:', err.message)
    contentArea.innerHTML = `
      <div class="admin-error">
        <i class="bi bi-exclamation-circle"></i>
        <h3>Error al cargar solicitudes</h3>
        <p>${escHTML(err.message)}</p>
        <button class="btn-apple-primary" onclick="location.reload()">
          <i class="bi bi-arrow-clockwise"></i>
          Reintentar
        </button>
      </div>`
  }
}

function renderSolicitudCard(solicitud, adminId) {
  const permisos = []
  if (solicitud.solicita_alumnos) permisos.push('Registrar Alumnos')
  if (solicitud.solicita_clases) permisos.push('Gestionar Clases')

  const fechaCreacion = new Date(solicitud.creado_en).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return `
    <div class="admin-solicitud-card card-apple" data-solicitud-id="${solicitud.id}">
      <div class="admin-solicitud-header">
        <div class="admin-solicitud-info">
          <h3 class="admin-solicitud-name">${escHTML(solicitud.maestro_nombre)}</h3>
          <p class="admin-solicitud-email">${escHTML(solicitud.maestro_email)}</p>
          <p class="admin-solicitud-timestamp">
            <i class="bi bi-calendar-event"></i>
            ${fechaCreacion}
          </p>
        </div>
        <div class="admin-solicitud-badge">
          <span class="badge badge-warning">
            <i class="bi bi-clock-history"></i>
            Pendiente
          </span>
        </div>
      </div>

      <div class="admin-solicitud-permisos">
        <h4>Solicita los siguientes permisos:</h4>
        <div class="admin-permisos-list">
          ${
            solicitud.solicita_alumnos
              ? `
            <div class="admin-permiso-item">
              <i class="bi bi-person-plus-fill"></i>
              <span>Registrar Alumnos</span>
            </div>
          `
              : ''
          }
          ${
            solicitud.solicita_clases
              ? `
            <div class="admin-permiso-item">
              <i class="bi bi-mortarboard-fill"></i>
              <span>Gestionar Clases</span>
            </div>
          `
              : ''
          }
        </div>
      </div>

      <div class="admin-solicitud-actions">
        <button class="btn-apple-secondary btn-sm btn-reject" data-action="rechazar" data-solicitud-id="${solicitud.id}">
          <i class="bi bi-x-circle"></i>
          Rechazar
        </button>
        <button class="btn-apple-primary btn-sm btn-approve" data-action="aprobar" data-solicitud-id="${solicitud.id}">
          <i class="bi bi-check-circle"></i>
          Aprobar
        </button>
      </div>
    </div>`
}

function escHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return String(text).replace(/[&<>"']/g, (char) => map[char])
}

function attachSolicitudListeners(container, adminId) {
  // Botón aprobar
  container.querySelectorAll('[data-action="aprobar"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const solicitudId = btn.dataset.solicitudId
      await handleAprobacion(solicitudId, adminId, btn)
    })
  })

  // Botón rechazar
  container.querySelectorAll('[data-action="rechazar"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const solicitudId = btn.dataset.solicitudId
      await handleRechazo(solicitudId, adminId, btn)
    })
  })
}

async function handleAprobacion(solicitudId, adminId, btnElement) {
  const card = btnElement.closest('.admin-solicitud-card')
  const nombreMaestro = card?.querySelector('.admin-solicitud-name')?.textContent || 'maestro'

  // Confirmación
  const confirmar = confirm(
    `¿Aprobás la solicitud de ${nombreMaestro}?\n\nEl maestro tendrá acceso a los permisos solicitados.`,
  )

  if (!confirmar) return

  let originalHtml
  try {
    btnElement.disabled = true
    originalHtml = btnElement.innerHTML
    btnElement.innerHTML = `<span class="spinner-apple-sm"></span> Aprobando...`

    await aprobarSolicitud(solicitudId, adminId)

    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: { message: `Solicitud de ${nombreMaestro} aprobada.`, type: 'success' },
      }),
    )

    // Remover la tarjeta con animación
    if (card) {
      card.style.animation = 'fadeOut 0.3s ease-out'
      setTimeout(() => {
        card.remove()
        // Si no quedan tarjetas, recargar vista
        const container = card.closest('.admin-solicitudes-grid')
        if (container && container.children.length === 0) {
          location.reload()
        }
      }, 300)
    }
  } catch (err) {
    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: { message: 'Error aprobando solicitud: ' + err.message, type: 'danger' },
      }),
    )
    btnElement.disabled = false
    btnElement.innerHTML = originalHtml
  }
}

async function handleRechazo(solicitudId, adminId, btnElement) {
  const card = btnElement.closest('.admin-solicitud-card')
  const nombreMaestro = card?.querySelector('.admin-solicitud-name')?.textContent || 'maestro'

  const motivo = prompt(
    `¿Por qué rechazás la solicitud de ${nombreMaestro}?\n\nEste mensaje se le mostrará al maestro.`,
    '',
  )

  if (motivo === null) return // Cancelado

  let originalHtml
  try {
    btnElement.disabled = true
    originalHtml = btnElement.innerHTML
    btnElement.innerHTML = `<span class="spinner-apple-sm"></span> Rechazando...`

    await rechazarSolicitud(solicitudId, adminId, motivo)

    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: { message: `Solicitud de ${nombreMaestro} rechazada.`, type: 'success' },
      }),
    )

    // Remover la tarjeta con animación
    if (card) {
      card.style.animation = 'fadeOut 0.3s ease-out'
      setTimeout(() => {
        card.remove()
        // Si no quedan tarjetas, recargar vista
        const container = card.closest('.admin-solicitudes-grid')
        if (container && container.children.length === 0) {
          location.reload()
        }
      }, 300)
    }
  } catch (err) {
    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: { message: 'Error rechazando solicitud: ' + err.message, type: 'danger' },
      }),
    )
    btnElement.disabled = false
    btnElement.innerHTML = originalHtml
  }
}
