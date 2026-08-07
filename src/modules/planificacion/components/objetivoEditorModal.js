/**
 * objetivoEditorModal.js — Modal de edición de Objetivo + Indicadores (Modo Diseño)
 *
 * Tarea 3.3 (openspec/changes/mapa-gamificado-planificacion): CRUD de un
 * objetivo (`clase_mapa_objetivos`) y sus indicadores
 * (`clase_mapa_indicadores`), scopeado por clase, usando `mapaClaseService.js`
 * (Tarea 2.2, ya existe).
 *
 * REQ-01 (scoping de nivel): el selector de Nivel MUST listar únicamente los
 * `niveles` que el container (`MapaClaseView.js`, Tarea 3.2) resolvió vía
 * `acm_active_routes`. Si `niveles` está vacío, el modal bloquea el guardado
 * y explica por qué — la clase no tiene niveles asignados en la matriz ACM.
 *
 * REQ-09 / Decisión 4 (design.md): `mapaClaseService.eliminarObjetivo` /
 * `eliminarIndicador` ya traducen el Postgres 23503 (FK RESTRICT por
 * evaluaciones asociadas) a `RequiereArchivarError`. Este modal lo captura y
 * ofrece "Archivar" en su lugar — NUNCA deja que el borrado falle en
 * silencio ni muestra un error crudo de base de datos.
 *
 * Patrón visual: mismo overlay/estilo que evaluacionClaseModal.js.
 */

import {
  crearObjetivo,
  actualizarObjetivo,
  archivarObjetivo,
  eliminarObjetivo,
  crearIndicador,
  obtenerIndicadoresPorObjetivo,
  obtenerObjetivosPorClase,
  actualizarIndicador,
  archivarIndicador,
  eliminarIndicador,
  RequiereArchivarError,
} from '../services/mapaClaseService.js'
import { renderHistorialIndicadorModal } from './historialIndicadorModal.js'

/**
 * @param {object} options
 * @param {string} options.claseId
 * @param {Array<{id: string, nombre: string}>} [options.niveles] - niveles asignados a la clase (REQ-01)
 * @param {object|null} [options.objetivo] - objetivo existente a editar, o null para crear uno nuevo
 * @param {string|null} [options.maestroId] - created_by del nuevo objetivo
 * @param {function} [options.onSaved] - callback tras crear/actualizar el objetivo
 * @param {function} [options.onClosed] - callback al cerrar el modal
 */
export function renderObjetivoEditorModal({
  claseId,
  niveles = [],
  objetivo = null,
  maestroId = null,
  onSaved = null,
  onClosed = null,
}) {
  document.querySelectorAll('.objetivo-editor-modal-overlay').forEach((el) => el.remove())

  const state = {
    objetivo,
    indicadores: [],
    // id del indicador que está mostrando el prompt "no se puede borrar, archivar?"
    archivarPendienteId: null,
    archivarObjetivoPendiente: false,
  }

  const overlay = document.createElement('div')
  overlay.className = 'objetivo-editor-modal-overlay'
  document.body.appendChild(overlay)

  if (!document.getElementById('objetivo-editor-modal-styles')) {
    const style = document.createElement('style')
    style.id = 'objetivo-editor-modal-styles'
    style.textContent = _getStyles()
    document.head.appendChild(style)
  }

  const close = () => {
    overlay.remove()
    onClosed?.()
  }

  const render = () => {
    overlay.innerHTML = _buildHTML({ claseId, niveles, state })
    _wireEvents({ overlay, claseId, niveles, maestroId, state, close, render, onSaved })
  }

  render()

  if (state.objetivo?.id) {
    _cargarIndicadores(state, render)
  }
}

async function _cargarIndicadores(state, render) {
  try {
    state.indicadores = await obtenerIndicadoresPorObjetivo(state.objetivo.id)
  } catch (err) {
    console.error('[objetivoEditorModal] Error cargando indicadores:', err)
    state.indicadores = []
  }
  render()
}

function _wireEvents({ overlay, claseId, niveles, maestroId, state, close, render, onSaved }) {
  overlay.querySelector('.objetivo-editor-modal-close-x')?.addEventListener('click', close)
  overlay.querySelector('.objetivo-editor-modal-backdrop')?.addEventListener('click', close)
  overlay.querySelector('.objetivo-editor-cancelar-btn')?.addEventListener('click', close)

  // Guardar objetivo (crear o actualizar)
  overlay.querySelector('.objetivo-editor-guardar-btn')?.addEventListener('click', async () => {
    const nombre = overlay.querySelector('#objetivo-editor-nombre')?.value?.trim() || ''
    const descripcion = overlay.querySelector('#objetivo-editor-descripcion')?.value?.trim() || ''
    const levelId = overlay.querySelector('#objetivo-editor-nivel')?.value || null

    if (!nombre) {
      _showError(overlay, 'El nombre del objetivo es requerido')
      return
    }

    try {
      if (state.objetivo?.id) {
        const actualizado = await actualizarObjetivo(state.objetivo.id, { nombre, descripcion })
        state.objetivo = { ...state.objetivo, ...actualizado }
        onSaved?.(state.objetivo)
      } else {
        if (!levelId) {
          _showError(overlay, 'Seleccioná un nivel')
          return
        }
        const existentes = await obtenerObjetivosPorClase(claseId)
        const ordenObjetivo = existentes
          .filter((o) => o.level_id === levelId)
          .reduce((max, o) => Math.max(max, o.orden_objetivo || 0), 0) + 1
        const creado = await crearObjetivo({ clase_id: claseId, level_id: levelId, nombre, descripcion, orden_objetivo: ordenObjetivo, created_by: maestroId })
        state.objetivo = creado
        onSaved?.(creado)
      }
      render()
      if (state.objetivo?.id) _cargarIndicadores(state, render)
    } catch (err) {
      console.error('[objetivoEditorModal] Error guardando objetivo:', err)
      _showError(overlay, 'No se pudo guardar el objetivo')
    }
  })

  // Borrar objetivo (REQ-09)
  overlay.querySelector('.objetivo-editor-borrar-objetivo-btn')?.addEventListener('click', async () => {
    try {
      await eliminarObjetivo(state.objetivo.id)
      close()
    } catch (err) {
      if (err instanceof RequiereArchivarError) {
        state.archivarObjetivoPendiente = true
        render()
        return
      }
      console.error('[objetivoEditorModal] Error borrando objetivo:', err)
      _showError(overlay, 'No se pudo borrar el objetivo')
    }
  })

  overlay.querySelector('.objetivo-editor-archivar-objetivo-btn')?.addEventListener('click', async () => {
    try {
      await archivarObjetivo(state.objetivo.id)
      close()
    } catch (err) {
      console.error('[objetivoEditorModal] Error archivando objetivo:', err)
      _showError(overlay, 'No se pudo archivar el objetivo')
    }
  })

  // Agregar indicador
  overlay.querySelector('.objetivo-editor-agregar-indicador-btn')?.addEventListener('click', async () => {
    const input = overlay.querySelector('#objetivo-editor-nuevo-indicador')
    const descripcion = input?.value?.trim() || ''
    if (!descripcion) return

    try {
      await crearIndicador({ objetivo_id: state.objetivo.id, clase_id: claseId, descripcion })
      await _cargarIndicadores(state, render)
    } catch (err) {
      console.error('[objetivoEditorModal] Error agregando indicador:', err)
      _showError(overlay, 'No se pudo agregar el indicador')
    }
  })

  // Borrar / Archivar indicadores (REQ-09 — el path principal de esta tarea)
  overlay.querySelectorAll('.objetivo-editor-indicador-row').forEach((row) => {
    const indicadorId = row.dataset.indicadorId
    const indicador = state.indicadores.find((i) => String(i.id) === String(indicadorId))

    row.querySelector('.btn-historial-indicador')?.addEventListener('click', () => {
      renderHistorialIndicadorModal({
        claseId,
        claseIndicadorId: indicadorId,
        indicadorDescripcion: indicador?.descripcion || '',
      })
    })

    row.querySelector('.btn-borrar-indicador')?.addEventListener('click', async () => {
      try {
        await eliminarIndicador(indicadorId)
        await _cargarIndicadores(state, render)
      } catch (err) {
        if (err instanceof RequiereArchivarError) {
          state.archivarPendienteId = indicadorId
          render()
          return
        }
        console.error('[objetivoEditorModal] Error borrando indicador:', err)
        _showError(overlay, 'No se pudo borrar el indicador')
      }
    })

    row.querySelector('.btn-archivar-indicador')?.addEventListener('click', async () => {
      try {
        await archivarIndicador(indicadorId)
        state.archivarPendienteId = null
        await _cargarIndicadores(state, render)
      } catch (err) {
        console.error('[objetivoEditorModal] Error archivando indicador:', err)
        _showError(overlay, 'No se pudo archivar el indicador')
      }
    })
  })
}

// ── Templates ──────────────────────────────────────────────────────────

function _buildHTML({ claseId, niveles, state }) {
  const { objetivo } = state
  const esEdicion = Boolean(objetivo?.id)
  const bloqueadoPorNiveles = !esEdicion && niveles.length === 0

  const nivelOptions = niveles
    .map((n) => `<option value="${n.id}">${esc(n.nombre)}</option>`)
    .join('')

  return `
    <div class="objetivo-editor-modal-backdrop"></div>
    <div class="objetivo-editor-modal-dialog">
      <div class="objetivo-editor-modal-header">
        <h5 class="objetivo-editor-modal-title">${esEdicion ? 'Editar Objetivo' : 'Nuevo Objetivo'}</h5>
        <button class="objetivo-editor-modal-close-x" aria-label="Cerrar">&times;</button>
      </div>
      <div class="objetivo-editor-modal-body">
        ${bloqueadoPorNiveles ? `
          <div class="objetivo-editor-warning" role="alert">
            Esta clase no tiene niveles asignados en la matriz ACM. Asigná un nivel antes de crear objetivos.
          </div>
        ` : ''}
        <div class="objetivo-editor-error-msg d-none" role="alert"></div>

        <label class="objetivo-editor-label" for="objetivo-editor-nombre">Nombre</label>
        <input type="text" id="objetivo-editor-nombre" class="form-control" value="${esc(objetivo?.nombre || '')}" placeholder="Ej: La 3ra posición" />

        <label class="objetivo-editor-label" for="objetivo-editor-descripcion">Descripción</label>
        <textarea id="objetivo-editor-descripcion" class="form-control" rows="2">${esc(objetivo?.descripcion || '')}</textarea>

        ${!esEdicion ? `
          <label class="objetivo-editor-label" for="objetivo-editor-nivel">Nivel</label>
          <select id="objetivo-editor-nivel" class="form-select" ${bloqueadoPorNiveles ? 'disabled' : ''}>
            ${nivelOptions}
          </select>
        ` : ''}

        ${esEdicion ? _buildIndicadoresHTML(state, claseId) : ''}
      </div>
      <div class="objetivo-editor-modal-footer">
        ${esEdicion ? `<button class="btn btn-outline-danger objetivo-editor-borrar-objetivo-btn">Borrar Objetivo</button>` : ''}
        ${esEdicion && state.archivarObjetivoPendiente ? `<button class="btn btn-warning objetivo-editor-archivar-objetivo-btn">Archivar Objetivo</button>` : ''}
        <button class="btn btn-outline-secondary objetivo-editor-cancelar-btn">Cancelar</button>
        <button class="btn btn-primary objetivo-editor-guardar-btn" ${bloqueadoPorNiveles ? 'disabled' : ''}>Guardar</button>
      </div>
    </div>
  `
}

function _buildIndicadoresHTML(state, claseId) {
  const rows = state.indicadores
    .map((ind) => `
      <div class="objetivo-editor-indicador-row" data-indicador-id="${ind.id}">
        <span class="objetivo-editor-indicador-desc">${esc(ind.descripcion)}</span>
        <div class="objetivo-editor-indicador-actions">
          <button class="btn btn-sm btn-outline-secondary btn-historial-indicador" data-clase-id="${claseId}">Historial</button>
          <button class="btn btn-sm btn-outline-danger btn-borrar-indicador">Borrar</button>
          ${state.archivarPendienteId === ind.id ? `<button class="btn btn-sm btn-warning btn-archivar-indicador">Archivar</button>` : ''}
        </div>
      </div>
    `)
    .join('')

  return `
    <hr />
    <h6>Indicadores</h6>
    ${state.archivarPendienteId ? `<div class="objetivo-editor-warning" role="alert">No se puede borrar: tiene evaluaciones asociadas. Podés archivarlo en su lugar.</div>` : ''}
    <div class="objetivo-editor-indicadores-list">
      ${rows || '<div class="text-muted small">Sin indicadores todavía.</div>'}
    </div>
    <div class="objetivo-editor-nuevo-indicador-row">
      <input type="text" id="objetivo-editor-nuevo-indicador" class="form-control form-control-sm" placeholder="Nuevo indicador..." />
      <button class="btn btn-sm btn-outline-primary objetivo-editor-agregar-indicador-btn">Agregar</button>
    </div>
  `
}

function _showError(overlay, msg) {
  const el = overlay.querySelector('.objetivo-editor-error-msg')
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
    .objetivo-editor-modal-overlay {
      position: fixed; inset: 0; z-index: 10001;
      display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
    .objetivo-editor-modal-backdrop {
      position: absolute; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    }
    .objetivo-editor-modal-dialog {
      position: relative; background: var(--bs-body-bg, #fff); border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); width: 100%; max-width: 560px;
      max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;
    }
    .objetivo-editor-modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--bs-border-color, #dee2e6);
    }
    .objetivo-editor-modal-title { font-size: 1.05rem; font-weight: 700; margin: 0; }
    .objetivo-editor-modal-close-x {
      width: 32px; height: 32px; border: none; background: var(--bs-tertiary-bg, #f8f9fa);
      border-radius: 8px; cursor: pointer; font-size: 1.2rem;
    }
    .objetivo-editor-modal-body { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; }
    .objetivo-editor-label { display: block; font-size: 0.75rem; font-weight: 600; margin: 0.5rem 0 0.2rem; }
    .objetivo-editor-warning {
      background: #fef3c7; color: #92400e; padding: 0.5rem 0.75rem; border-radius: 8px;
      font-size: 0.8rem; margin-bottom: 0.75rem;
    }
    .objetivo-editor-error-msg {
      background: #fee2e2; color: #dc2626; padding: 0.5rem 0.75rem; border-radius: 8px;
      font-size: 0.8rem; margin-bottom: 0.75rem;
    }
    .objetivo-editor-indicador-row {
      display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
      padding: 0.4rem 0; border-bottom: 1px solid var(--bs-border-color, #eee);
    }
    .objetivo-editor-indicador-desc { font-size: 0.85rem; }
    .objetivo-editor-indicador-actions { display: flex; gap: 0.3rem; flex-shrink: 0; }
    .objetivo-editor-nuevo-indicador-row { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
    .objetivo-editor-modal-footer {
      display: flex; justify-content: flex-end; gap: 0.5rem;
      padding: 0.75rem 1.25rem; border-top: 1px solid var(--bs-border-color, #dee2e6);
    }
  `
}
