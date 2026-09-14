import * as adapter from '../../portal-maestros/services/confirmacionesEmergentesAdapter.js'

/**
 * Component: ActividadEmergenteBandeja
 * Displays pending institutional activities requiring maestro confirmation.
 * Provides a responsive (375px mobile ready) modal with 4 confirmation options:
 * Sí / No / No Aplica / No Sé.
 *
 * Supports deep linking via `deepLinkActividadId` or URL search params (?actividad_id=uuid).
 */

export function renderActividadEmergenteBandeja(container, {
  maestroId,
  onConfirm,
  deepLinkActividadId = null
} = {}) {
  if (!container) throw new Error('renderActividadEmergenteBandeja: se requiere un contenedor DOM válido.')

  // Resolve deep link from options or window.location
  let activeDeepLinkId = deepLinkActividadId
  if (!activeDeepLinkId && typeof window !== 'undefined' && window.location) {
    try {
      const search = window.location.search || (window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '')
      const params = new URLSearchParams(search)
      activeDeepLinkId = params.get('actividad_id')
    } catch {
      // safe fallback
    }
  }

  let estado = {
    loading: true,
    pendientes: [],
    error: null,
    modalActividad: null,
    respuestaSeleccionada: null,
    observaciones: '',
    guardando: false,
    toastMensaje: null
  }

  function render() {
    container.innerHTML = `
      <div class="actividad-emergente-bandeja" style="width: 100%; max-width: 900px; margin: 0 auto; padding: 1rem; box-sizing: border-box;">
        <header style="margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.3rem; font-weight: 700; margin: 0 0 0.5rem 0; color: var(--pm-text, #1e293b);">
            Confirmaciones de Actividades Institucionales
          </h2>
          <p style="margin: 0; font-size: 0.9rem; color: var(--pm-text-muted, #64748b);">
            Confirma si las actividades programadas justificaron tus clases del día.
          </p>
        </header>

        ${estado.toastMensaje ? `
          <div data-role="toast-alert" style="background: #ecfdf5; border: 1px solid #10b981; color: #065f46; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center;">
            <span>${estado.toastMensaje}</span>
            <button type="button" data-action="cerrar-toast" style="background: transparent; border: none; font-weight: bold; cursor: pointer; color: #065f46;">&times;</button>
          </div>
        ` : ''}

        ${estado.error ? `
          <div data-role="error-alert" style="background: #fef2f2; border: 1px solid #ef4444; color: #991b1b; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem;">
            ${estado.error}
          </div>
        ` : ''}

        <div data-role="actividades-lista" style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${renderLista()}
        </div>

        ${estado.modalActividad ? renderModal() : ''}
      </div>
    `

    vincularEventos()
  }

  function renderLista() {
    if (estado.loading) {
      return `
        <div data-role="loading-indicator" style="padding: 2rem; text-align: center; color: var(--pm-text-muted, #64748b);">
          <div class="pm-spinner" style="margin: 0 auto 0.5rem auto;"></div>
          <span>Cargando actividades pendientes...</span>
        </div>
      `
    }

    if (estado.pendientes.length === 0) {
      return `
        <div data-role="vacio-mensaje" style="padding: 2.5rem 1.5rem; text-align: center; background: var(--pm-surface, #f8fafc); border-radius: 12px; border: 1px dashed var(--pm-border, #cbd5e1); color: var(--pm-text-muted, #64748b);">
          <span style="display: block; font-size: 1.75rem; margin-bottom: 0.5rem;">🎉</span>
          <strong style="display: block; font-size: 1rem; color: var(--pm-text, #334155); margin-bottom: 0.25rem;">
            No tienes actividades pendientes
          </strong>
          <p style="margin: 0; font-size: 0.85rem;">Todas tus confirmaciones están al día.</p>
        </div>
      `
    }

    return estado.pendientes.map((item) => {
      const info = item.actividad_info || item.sesion_clase || {}
      const nombre = info.actividad || info.nombre || 'Actividad Institucional'
      const fecha = info.fecha || item.fecha || 'Fecha no especificada'
      const lugar = info.lugar ? `📍 ${info.lugar}` : ''
      const alcance = info.alcance_tipo ? `Alcance: ${info.alcance_tipo}` : ''
      const esEnValidacion = item.confirmacion?.respuesta === 'no_se' && item.confirmacion?.estado_validacion === 'pendiente'

      return `
        <div class="pm-card actividad-fila" data-role="actividad-fila" data-id="${item.actividad_id}"
             style="background: var(--pm-card-bg, #ffffff); border: 1px solid var(--pm-border, #e2e8f0); border-radius: 10px; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; cursor: pointer; transition: all 0.2s ease; box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
            <div>
              <h3 style="margin: 0 0 0.25rem 0; font-size: 1rem; font-weight: 600; color: var(--pm-text, #0f172a);">
                ${nombre}
              </h3>
              <div style="font-size: 0.85rem; color: var(--pm-text-muted, #64748b); display: flex; flex-wrap: wrap; gap: 0.75rem;">
                <span>📅 ${fecha}</span>
                ${lugar ? `<span>${lugar}</span>` : ''}
                ${alcance ? `<span>🏷️ ${alcance}</span>` : ''}
              </div>
            </div>
            ${esEnValidacion ? `
              <span data-role="badge-en-validacion" style="background: #fef3c7; color: #92400e; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.6rem; border-radius: 9999px; white-space: nowrap;">
                En Validación
              </span>
            ` : `
              <span style="background: #e0f2fe; color: #0369a1; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.6rem; border-radius: 9999px; white-space: nowrap;">
                Pendiente
              </span>
            `}
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
            <button type="button" class="btn-apple-secondary" data-action="abrir-modal" data-id="${item.actividad_id}"
                    style="min-height: 44px; min-width: 44px; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; border-radius: 8px; border: 1px solid var(--pm-border, #cbd5e1); background: var(--pm-btn-secondary-bg, #f1f5f9); color: var(--pm-text, #1e293b); cursor: pointer;">
              ${esEnValidacion ? 'Ver Estado' : 'Confirmar Participación'}
            </button>
          </div>
        </div>
      `
    }).join('')
  }

  function renderModal() {
    const item = estado.modalActividad
    if (!item) return ''
    const info = item.actividad_info || item.sesion_clase || {}
    const nombre = info.actividad || info.nombre || 'Actividad Institucional'
    const fecha = info.fecha || item.fecha || ''
    const lugar = info.lugar || 'No especificado'
    const clasesAfectadas = item.clases_afectadas || info.clases_afectadas || []
    const esEnValidacion = item.confirmacion?.respuesta === 'no_se' && item.confirmacion?.estado_validacion === 'pendiente'

    const respuestas = [
      { key: 'si', label: 'Sí, justificó mis clases', desc: 'Participé en la actividad', bg: '#ecfdf5', border: '#10b981', color: '#065f46' },
      { key: 'no', label: 'No aplicó a mis clases', desc: 'Debo registrar asistencia manual', bg: '#fef2f2', border: '#ef4444', color: '#991b1b' },
      { key: 'no_aplica', label: 'No aplica a mi grupo', desc: 'Exención institucional', bg: '#f8fafc', border: '#94a3b8', color: '#334155' },
      { key: 'no_se', label: 'No sé / Requiere validación', desc: 'Se elevará a Coordinación (ACM)', bg: '#fffbeb', border: '#f59e0b', color: '#92400e' }
    ]

    return `
      <div data-role="modal-confirmacion" class="actividad-modal-backdrop" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem; box-sizing: border-box; overflow-y: auto;">
        <div class="actividad-modal-dialog" style="background: var(--pm-modal-bg, #ffffff); border-radius: 16px; width: 100%; max-width: 520px; box-sizing: border-box; overflow-x: hidden; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
          
          <!-- Header -->
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--pm-border, #e2e8f0); display: flex; justify-content: space-between; align-items: flex-start; flex-shrink: 0;">
            <div>
              <h3 style="margin: 0 0 0.25rem 0; font-size: 1.15rem; font-weight: 700; color: var(--pm-text, #0f172a);">
                ${nombre}
              </h3>
              <div style="font-size: 0.85rem; color: var(--pm-text-muted, #64748b);">
                <span>📅 ${fecha}</span> &bull; <span>📍 ${lugar}</span>
              </div>
            </div>
            <button type="button" data-action="cerrar-modal" style="min-height: 44px; min-width: 44px; background: transparent; border: none; font-size: 1.5rem; line-height: 1; color: var(--pm-text-muted, #64748b); cursor: pointer; border-radius: 8px;">&times;</button>
          </div>

          <!-- Body -->
          <div style="padding: 1.25rem 1.5rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 1rem;">
            
            ${esEnValidacion ? `
              <div data-role="estado-en-validacion" style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 10px; padding: 1rem; color: #92400e;">
                <strong style="display: block; font-size: 0.95rem; margin-bottom: 0.25rem;">⏳ Respuesta en Validación</strong>
                <p style="margin: 0; font-size: 0.85rem;">
                  Has respondido "No Sé" para esta actividad. Coordinación Académica (ACM) está revisando si aplicaba a tus clases. No se requieren más acciones de tu parte por ahora.
                </p>
              </div>
            ` : `
              <div>
                <label style="display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--pm-text, #1e293b);">
                  ¿Esta actividad justificó tus clases de este día?
                </label>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  ${respuestas.map(r => {
                    const isSelected = estado.respuestaSeleccionada === r.key
                    return `
                      <button type="button"
                              class="opcion-respuesta-btn"
                              data-action="seleccionar-respuesta"
                              data-role="btn-confirmar-${r.key}"
                              data-respuesta="${r.key}"
                              style="min-height: 44px; min-width: 44px; width: 100%; box-sizing: border-box; text-align: left; padding: 0.75rem 1rem; border-radius: 10px; border: 2px solid ${isSelected ? r.border : 'var(--pm-border, #e2e8f0)'}; background: ${isSelected ? r.bg : 'var(--pm-card-bg, #ffffff)'}; color: ${isSelected ? r.color : 'var(--pm-text, #1e293b)'}; cursor: pointer; transition: all 0.15s ease;">
                        <div style="font-weight: 600; font-size: 0.9rem;">${r.label}</div>
                        <div style="font-size: 0.75rem; opacity: 0.85;">${r.desc}</div>
                      </button>
                    `
                  }).join('')}
                </div>
              </div>

              ${clasesAfectadas && clasesAfectadas.length > 0 ? `
                <div style="background: var(--pm-surface, #f8fafc); border-radius: 8px; padding: 0.75rem; font-size: 0.85rem;">
                  <strong style="display: block; margin-bottom: 0.25rem; color: var(--pm-text, #334155);">Clases identificadas para esta fecha:</strong>
                  <ul style="margin: 0; padding-left: 1.25rem; color: var(--pm-text-muted, #64748b);">
                    ${clasesAfectadas.map(c => `<li>${c.clase_nombre || c.nombre || 'Clase'} (${c.alumnos_count || 0} alumnos)</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              <div>
                <label for="actividad-observaciones" style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.4rem; color: var(--pm-text, #1e293b);">
                  Observaciones (opcional):
                </label>
                <textarea id="actividad-observaciones"
                          data-role="input-observaciones"
                          rows="3"
                          placeholder="Agrega cualquier aclaratoria sobre tu participación u horario..."
                          style="width: 100%; box-sizing: border-box; padding: 0.6rem 0.8rem; border-radius: 8px; border: 1px solid var(--pm-border, #cbd5e1); font-family: inherit; font-size: 0.875rem; resize: vertical;">${estado.observaciones || ''}</textarea>
              </div>
            `}
          </div>

          <!-- Footer -->
          <div style="padding: 1rem 1.5rem; border-top: 1px solid var(--pm-border, #e2e8f0); display: flex; justify-content: flex-end; gap: 0.75rem; flex-shrink: 0;">
            <button type="button"
                    data-action="cerrar-modal"
                    style="min-height: 44px; min-width: 44px; padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid var(--pm-border, #cbd5e1); background: var(--pm-btn-secondary-bg, #f1f5f9); color: var(--pm-text, #334155); font-weight: 500; cursor: pointer;">
              ${esEnValidacion ? 'Cerrar' : 'Cancelar'}
            </button>

            ${!esEnValidacion ? `
              <button type="button"
                      data-action="guardar-confirmacion"
                      data-role="btn-guardar"
                      ${!estado.respuestaSeleccionada || estado.guardando ? 'disabled' : ''}
                      style="min-height: 44px; min-width: 44px; padding: 0.5rem 1.25rem; border-radius: 8px; border: none; background: ${estado.respuestaSeleccionada && !estado.guardando ? '#2563eb' : '#94a3b8'}; color: #ffffff; font-weight: 600; cursor: ${estado.respuestaSeleccionada && !estado.guardando ? 'pointer' : 'not-allowed'}; display: flex; align-items: center; gap: 0.5rem;">
                ${estado.guardando ? 'Guardando...' : 'Confirmar'}
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `
  }

  function vincularEventos() {
    // Cerrar toast
    const toastBtn = container.querySelector('[data-action="cerrar-toast"]')
    if (toastBtn) {
      toastBtn.onclick = () => {
        estado.toastMensaje = null
        render()
      }
    }

    // Abrir modal desde fila
    container.querySelectorAll('[data-action="abrir-modal"], [data-role="actividad-fila"]').forEach(el => {
      el.addEventListener('click', (e) => {
        // Evitar doble disparo si se clickea el botón dentro de la fila
        const id = el.dataset.id || el.closest('[data-id]')?.dataset.id
        const item = estado.pendientes.find(p => p.actividad_id === id)
        if (item) {
          abrirModal(item)
        }
      })
    })

    // Cerrar modal
    container.querySelectorAll('[data-action="cerrar-modal"]').forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation()
        cerrarModal()
      }
    })

    // Seleccionar respuesta en modal
    container.querySelectorAll('[data-action="seleccionar-respuesta"]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation()
        estado.respuestaSeleccionada = btn.dataset.respuesta
        render()
      }
    })

    // Input observaciones
    const obsInput = container.querySelector('[data-role="input-observaciones"]')
    if (obsInput) {
      obsInput.oninput = (e) => {
        estado.observaciones = e.target.value
      }
    }

    // Guardar confirmación
    const btnGuardar = container.querySelector('[data-action="guardar-confirmacion"]')
    if (btnGuardar) {
      btnGuardar.onclick = async (e) => {
        e.stopPropagation()
        await ejecutarGuardado()
      }
    }
  }

  function abrirModal(item) {
    estado.modalActividad = item
    estado.respuestaSeleccionada = item.confirmacion?.respuesta || null
    estado.observaciones = item.confirmacion?.observaciones || ''
    render()
  }

  function cerrarModal() {
    estado.modalActividad = null
    estado.respuestaSeleccionada = null
    estado.observaciones = ''
    render()
  }

  async function ejecutarGuardado() {
    if (!estado.modalActividad || !estado.respuestaSeleccionada || estado.guardando) return

    estado.guardando = true
    estado.error = null
    render()

    const item = estado.modalActividad
    const info = item.actividad_info || item.sesion_clase || {}

    try {
      const confirmacionResult = await adapter.confirmarActividad({
        actividad_id: item.actividad_id,
        maestro_id: maestroId || item.maestro_id,
        fecha: info.fecha || item.fecha,
        respuesta: estado.respuestaSeleccionada,
        observaciones: estado.observaciones || null,
        clases_afectadas: item.clases_afectadas || info.clases_afectadas || []
      })

      estado.toastMensaje = 'Confirmación registrada correctamente.'
      estado.modalActividad = null
      estado.respuestaSeleccionada = null
      estado.observaciones = ''

      if (typeof onConfirm === 'function') {
        onConfirm(confirmacionResult)
      }

      await cargarPendientes()
    } catch (err) {
      estado.error = err?.message || 'Error al registrar la confirmación.'
      estado.guardando = false
      render()
    }
  }

  async function cargarPendientes() {
    if (!maestroId) {
      estado.loading = false
      estado.pendientes = []
      render()
      return
    }

    estado.loading = true
    render()

    try {
      const items = await adapter.obtenerConfirmacionesPendientes(maestroId)
      estado.pendientes = items || []
      estado.loading = false
      estado.guardando = false

      // Check for deep link
      if (activeDeepLinkId) {
        const match = estado.pendientes.find(p => p.actividad_id === activeDeepLinkId)
        if (match) {
          estado.modalActividad = match
          estado.respuestaSeleccionada = match.confirmacion?.respuesta || null
          estado.observaciones = match.confirmacion?.observaciones || ''
        }
        // Consume deep link once opened
        activeDeepLinkId = null
      }

      render()
    } catch (err) {
      estado.error = err?.message || 'Error al cargar las confirmaciones pendientes.'
      estado.loading = false
      render()
    }
  }

  // Initial load
  cargarPendientes()

  return {
    reload: cargarPendientes,
    abrirActividad: (id) => {
      const match = estado.pendientes.find(p => p.actividad_id === id)
      if (match) abrirModal(match)
    }
  }
}
