/**
 * bitacoraSesionPanel.js — Panel de bitácora libre por sesión (Modo Sesión)
 *
 * Tarea 3.5 (openspec/changes/mapa-gamificado-planificacion): texto libre +
 * 3 toggles independientes (tareas enviadas / incidencia de comportamiento /
 * clase no realizada, cada uno con su propio campo de detalle opcional) +
 * botón "profesionalizar con IA" que reutiliza `profesionalizarBitacoraIA`
 * (GROQ, Tarea 3.5 también) y persiste vía `bitacoraSesionService.js`
 * (Tarea 2.3, ya existe).
 *
 * REQ-11: la versión IA se muestra para revisión — nunca se guarda sola. El
 * maestro tiene que aceptarla explícitamente (botón "Aceptar y guardar"),
 * que delega en `guardarTextoProfesionalizado(sesionId, texto, { aceptadoPorMaestro: true })`.
 * Descartar la borra sin persistir nada.
 *
 * REQ-12 (regla dura, aislamiento estructural): este panel MUST NOT leer ni
 * escribir ningún dato relacionado con la evaluación por criterio de
 * dominio ni con el catálogo de nodos del mapa de clase. Cero import, cero
 * referencia, cero vocabulario de ese dominio en este archivo — el
 * contenido libre no participa jamás en el cálculo de estrellas. Se
 * verifica con un guard estructural sobre el código fuente (mismo patrón
 * que Decisión 7 / migration.sesionBitacora.test.js).
 *
 * Patrón visual: mismo overlay/estilo que calificacionIndicadorPanel.js /
 * objetivoEditorModal.js. A diferencia de esos dos, los toggles se
 * inyectan/retiran del DOM de forma puntual (no hay un ciclo de
 * innerHTML completo en cada cambio) para no perder lo ya tipeado en el
 * texto libre ni en los demás campos.
 */

import { guardarBitacora, guardarTextoProfesionalizado } from '../services/bitacoraSesionService.js'
import { profesionalizarBitacoraIA } from '../services/aiEvaluacionService.js'

const TOGGLES = [
  {
    key: 'tareas',
    toggleId: 'bitacora-toggle-tareas',
    detalleId: 'bitacora-detalle-tareas',
    label: 'Tareas enviadas',
    placeholder: 'Detalle de las tareas enviadas...',
  },
  {
    key: 'incidencia',
    toggleId: 'bitacora-toggle-incidencia',
    detalleId: 'bitacora-detalle-incidencia',
    label: 'Incidencia de comportamiento',
    placeholder: 'Detalle de la incidencia...',
  },
  {
    key: 'no-realizada',
    toggleId: 'bitacora-toggle-no-realizada',
    detalleId: 'bitacora-detalle-no-realizada',
    label: 'Clase no realizada',
    placeholder: 'Motivo por el que no se realizó la clase...',
  },
]

/**
 * @param {object} options
 * @param {string} options.sesionId - id de sesiones_clase
 * @param {string} options.claseId
 * @param {string} [options.maestroId]
 * @param {function} [options.onSaved] - callback tras guardar, recibe el registro de sesion_bitacora
 * @param {function} [options.onClosed] - callback al cerrar el panel
 */
export function renderBitacoraSesionPanel({
  sesionId,
  claseId,
  maestroId = null,
  onSaved = null,
  onClosed = null,
}) {
  document.querySelectorAll('.bitacora-panel-overlay').forEach((el) => el.remove())

  const overlay = document.createElement('div')
  overlay.className = 'bitacora-panel-overlay'
  overlay.innerHTML = _buildHTML()
  document.body.appendChild(overlay)

  if (!document.getElementById('bitacora-panel-styles')) {
    const style = document.createElement('style')
    style.id = 'bitacora-panel-styles'
    style.textContent = _getStyles()
    document.head.appendChild(style)
  }

  const close = () => {
    overlay.remove()
    onClosed?.()
  }

  overlay.querySelector('.bitacora-panel-close-x')?.addEventListener('click', close)
  overlay.querySelector('.bitacora-panel-backdrop')?.addEventListener('click', close)
  overlay.querySelector('.bitacora-panel-cancelar-btn')?.addEventListener('click', close)

  TOGGLES.forEach((cfg) => _wireToggle(overlay, cfg))

  overlay.querySelector('.bitacora-panel-ia-btn')?.addEventListener('click', async () => {
    const btn = overlay.querySelector('.bitacora-panel-ia-btn')
    const textoLibre = overlay.querySelector('#bitacora-texto-libre')?.value || ''
    btn.disabled = true
    try {
      const textoIA = await profesionalizarBitacoraIA(textoLibre)
      _mostrarPreviewIA({ overlay, sesionId, textoIA })
    } catch (err) {
      console.error('[bitacoraSesionPanel] Error generando versión profesionalizada:', err)
      _showError(overlay, 'No se pudo generar la versión profesionalizada')
    } finally {
      btn.disabled = false
    }
  })

  overlay.querySelector('.bitacora-panel-guardar-btn')?.addEventListener('click', async () => {
    const btn = overlay.querySelector('.bitacora-panel-guardar-btn')
    btn.disabled = true

    const datos = {
      clase_id: claseId,
      maestro_id: maestroId,
      texto_libre: overlay.querySelector('#bitacora-texto-libre')?.value || '',
      tareas_enviadas: overlay.querySelector('#bitacora-toggle-tareas')?.checked || false,
      tareas_detalle: overlay.querySelector('#bitacora-detalle-tareas')?.value || null,
      incidencia_comportamiento: overlay.querySelector('#bitacora-toggle-incidencia')?.checked || false,
      incidencia_detalle: overlay.querySelector('#bitacora-detalle-incidencia')?.value || null,
      clase_no_realizada: overlay.querySelector('#bitacora-toggle-no-realizada')?.checked || false,
      motivo_no_realizada: overlay.querySelector('#bitacora-detalle-no-realizada')?.value || null,
    }

    try {
      const guardado = await guardarBitacora(sesionId, datos)
      onSaved?.(guardado)
      close()
    } catch (err) {
      console.error('[bitacoraSesionPanel] Error guardando bitácora:', err)
      _showError(overlay, 'No se pudo guardar la bitácora')
      btn.disabled = false
    }
  })
}

function _wireToggle(overlay, cfg) {
  const checkbox = overlay.querySelector(`#${cfg.toggleId}`)
  checkbox?.addEventListener('change', () => {
    const slot = overlay.querySelector(`.bitacora-detalle-slot[data-slot="${cfg.key}"]`)
    if (!slot) return
    if (checkbox.checked) {
      slot.innerHTML = `<textarea id="${cfg.detalleId}" class="form-control form-control-sm mt-1" rows="2" placeholder="${esc(cfg.placeholder)}"></textarea>`
    } else {
      slot.innerHTML = ''
    }
  })
}

function _mostrarPreviewIA({ overlay, sesionId, textoIA }) {
  const slot = overlay.querySelector('.bitacora-ia-preview-slot')
  if (!slot) return

  slot.innerHTML = `
    <div class="bitacora-ia-preview">${esc(textoIA)}</div>
    <div class="bitacora-ia-preview-actions">
      <button type="button" class="btn btn-sm btn-outline-secondary bitacora-ia-descartar-btn">Descartar</button>
      <button type="button" class="btn btn-sm btn-success bitacora-ia-aceptar-btn">Aceptar y guardar</button>
    </div>
  `

  slot.querySelector('.bitacora-ia-descartar-btn')?.addEventListener('click', () => {
    slot.innerHTML = ''
  })

  slot.querySelector('.bitacora-ia-aceptar-btn')?.addEventListener('click', async () => {
    try {
      await guardarTextoProfesionalizado(sesionId, textoIA, { aceptadoPorMaestro: true })
      slot.innerHTML = ''
    } catch (err) {
      console.error('[bitacoraSesionPanel] Error guardando versión profesionalizada:', err)
      _showError(overlay, 'No se pudo guardar la versión profesionalizada')
    }
  })
}

// ── Templates ──────────────────────────────────────────────────────────

function _buildHTML() {
  const togglesHTML = TOGGLES.map(
    (cfg) => `
      <div class="bitacora-toggle-row">
        <label class="bitacora-toggle-label" for="${cfg.toggleId}">
          <input type="checkbox" id="${cfg.toggleId}" />
          ${esc(cfg.label)}
        </label>
        <div class="bitacora-detalle-slot" data-slot="${cfg.key}"></div>
      </div>
    `,
  ).join('')

  return `
    <div class="bitacora-panel-backdrop"></div>
    <div class="bitacora-panel-dialog">
      <div class="bitacora-panel-header">
        <h5 class="bitacora-panel-title">Bitácora de la sesión</h5>
        <button class="bitacora-panel-close-x" aria-label="Cerrar">&times;</button>
      </div>
      <div class="bitacora-panel-body">
        <div class="bitacora-panel-error-msg d-none" role="alert"></div>

        <label class="bitacora-panel-label" for="bitacora-texto-libre">Texto libre</label>
        <textarea id="bitacora-texto-libre" class="form-control" rows="4" placeholder="¿Qué pasó en la clase de hoy?"></textarea>

        <button type="button" class="btn btn-sm btn-outline-primary bitacora-panel-ia-btn mt-2">Profesionalizar con IA</button>
        <div class="bitacora-ia-preview-slot"></div>

        <hr />

        ${togglesHTML}
      </div>
      <div class="bitacora-panel-footer">
        <button class="btn btn-outline-secondary bitacora-panel-cancelar-btn">Cancelar</button>
        <button class="btn btn-primary bitacora-panel-guardar-btn">Guardar</button>
      </div>
    </div>
  `
}

function _showError(overlay, msg) {
  const el = overlay.querySelector('.bitacora-panel-error-msg')
  if (!el) return
  el.textContent = msg
  el.classList.remove('d-none')
  setTimeout(() => el.classList.add('d-none'), 3000)
}

function esc(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function _getStyles() {
  return `
    .bitacora-panel-overlay {
      position: fixed; inset: 0; z-index: 10003;
      display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
    .bitacora-panel-backdrop {
      position: absolute; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    }
    .bitacora-panel-dialog {
      position: relative; background: var(--bs-body-bg, #fff); border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); width: 100%; max-width: 560px;
      max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;
    }
    .bitacora-panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--bs-border-color, #dee2e6);
    }
    .bitacora-panel-title { font-size: 1.05rem; font-weight: 700; margin: 0; }
    .bitacora-panel-close-x {
      width: 32px; height: 32px; border: none; background: var(--bs-tertiary-bg, #f8f9fa);
      border-radius: 8px; cursor: pointer; font-size: 1.2rem;
    }
    .bitacora-panel-body { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; }
    .bitacora-panel-label { display: block; font-size: 0.75rem; font-weight: 600; margin: 0 0 0.2rem; }
    .bitacora-panel-error-msg {
      background: #fee2e2; color: #dc2626; padding: 0.5rem 0.75rem; border-radius: 8px;
      font-size: 0.8rem; margin-bottom: 0.75rem;
    }
    .bitacora-ia-preview-slot { margin-top: 0.5rem; }
    .bitacora-ia-preview {
      background: #eef2ff; color: #3730a3; padding: 0.6rem 0.75rem; border-radius: 8px;
      font-size: 0.85rem; white-space: pre-wrap;
    }
    .bitacora-ia-preview-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; justify-content: flex-end; }
    .bitacora-toggle-row {
      padding: 0.5rem 0; border-bottom: 1px solid var(--bs-border-color, #eee);
    }
    .bitacora-toggle-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
    .bitacora-panel-footer {
      display: flex; justify-content: flex-end; gap: 0.5rem;
      padding: 0.75rem 1.25rem; border-top: 1px solid var(--bs-border-color, #dee2e6);
    }
  `
}
