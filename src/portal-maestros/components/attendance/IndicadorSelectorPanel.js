/**
 * IndicadorSelectorPanel.js — Selector rápido de Unidad → Objetivo → Indicador
 * embebido en asistenciaView.js, para calificar con estrellas sin salir de
 * la toma de asistencia.
 *
 * No es un sistema nuevo de escritura: reutiliza exactamente el mismo árbol
 * y los mismos servicios que MapaClaseView.js (Modo Sesión) —
 * `clase_mapa_objetivos`/`clase_mapa_indicadores` vía `mapaClaseService.js`,
 * y la calificación 1-5 vía `calificacionIndicadorPanel.js` (que ya persiste
 * con `evaluacionClaseService.registrarEvaluacion`, `clase_indicador_id`
 * como única fuente de verdad — REQ-14). Este panel es solo un atajo de UI:
 * agrupa los objetivos por Unidad (Nivel del catálogo, ver
 * MapaContenidoSVG.js/MapaClaseView.js) y, al elegir un indicador, delega
 * directamente en `calificacionIndicadorPanel.js` — no duplica ninguna
 * lógica de guardado.
 *
 * Gate: requiere que ya exista `sesionId` (asistencia de hoy guardada) y al
 * menos un alumno presente, igual que el botón "Ir a Modo Sesión (Mapa)".
 */
import {
  obtenerNivelesAsignadosClase,
  obtenerObjetivosPorClase,
  obtenerIndicadoresPorObjetivo,
} from '../../../modules/planificacion/services/mapaClaseService.js'
import { renderCalificacionIndicadorPanel } from '../../../modules/planificacion/components/calificacionIndicadorPanel.js'
import { AppToast } from '../../../shared/components/AppToast.js'

function esc(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * @param {object} options
 * @param {string} options.claseId
 * @param {string} options.fecha - YYYY-MM-DD, hoy
 * @param {string|null} options.evaluadoPor - maestro.id
 * @param {() => Array<{id: string, nombre: string}>} options.getPresentes - resuelto en el momento del click (no snapshot)
 */
export function renderIndicadorSelectorPanel({ claseId, fecha, evaluadoPor, getPresentes }) {
  document.querySelectorAll('.indicador-selector-overlay').forEach((el) => el.remove())

  const state = { niveles: [], objetivos: [], objetivoIdSeleccionado: null, indicadores: [], cargando: true }

  const overlay = document.createElement('div')
  overlay.className = 'indicador-selector-overlay'
  document.body.appendChild(overlay)

  if (!document.getElementById('indicador-selector-styles')) {
    const style = document.createElement('style')
    style.id = 'indicador-selector-styles'
    style.textContent = _getStyles()
    document.head.appendChild(style)
  }

  const close = () => overlay.remove()

  const render = () => {
    overlay.innerHTML = _buildHTML(state)
    _wireEvents()
  }

  function _wireEvents() {
    overlay.querySelector('.indicador-selector-close-x')?.addEventListener('click', close)
    overlay.querySelector('.indicador-selector-backdrop')?.addEventListener('click', close)
    overlay.querySelector('.indicador-selector-cerrar-btn')?.addEventListener('click', close)

    overlay.querySelector('#indicador-selector-objetivo')?.addEventListener('change', async (e) => {
      const objetivoId = e.target.value || null
      state.objetivoIdSeleccionado = objetivoId
      state.indicadores = []
      if (objetivoId) {
        render() // muestra spinner de indicadores
        try {
          state.indicadores = await obtenerIndicadoresPorObjetivo(objetivoId)
        } catch (err) {
          console.error('[IndicadorSelectorPanel] Error cargando indicadores:', err)
          AppToast.error('No se pudieron cargar los indicadores de este objetivo.')
        }
      }
      render()
    })

    overlay.querySelectorAll('.btn-indicador-calificar').forEach((btn) => {
      btn.addEventListener('click', () => {
        const indicador = state.indicadores.find((i) => String(i.id) === btn.dataset.indicadorId)
        if (!indicador) return
        const presentes = getPresentes()
        if (presentes.length === 0) {
          AppToast.warning('No hay alumnos presentes registrados para hoy.')
          return
        }
        close()
        renderCalificacionIndicadorPanel({
          claseId,
          claseIndicadorId: indicador.id,
          indicadorDescripcion: indicador.descripcion,
          presentes,
          fecha,
          evaluadoPor,
          onGuardado: ({ guardados, total }) => {
            AppToast.success(`Calificación guardada: ${guardados}/${total} alumnos`)
          },
        })
      })
    })
  }

  render()

  Promise.all([obtenerNivelesAsignadosClase(claseId), obtenerObjetivosPorClase(claseId)])
    .then(([niveles, objetivos]) => {
      state.niveles = niveles || []
      state.objetivos = objetivos || []
      state.cargando = false
      render()
    })
    .catch((err) => {
      console.error('[IndicadorSelectorPanel] Error cargando objetivos/niveles:', err)
      state.cargando = false
      state.error = true
      render()
    })
}

function _buildHTML(state) {
  const nivelById = new Map(state.niveles.map((n) => [n.id, n.nombre]))

  // Agrupa por Unidad (Nivel), en el orden del catálogo, igual que MapaClaseView.
  const grupos = new Map()
  for (const o of state.objetivos) {
    const unidad = nivelById.get(o.level_id) || 'Sin unidad'
    if (!grupos.has(unidad)) grupos.set(unidad, [])
    grupos.get(unidad).push(o)
  }

  const optgroups = [...grupos.entries()]
    .map(
      ([unidad, objetivos]) => `
      <optgroup label="${esc(unidad)}">
        ${objetivos
          .map((o) => `<option value="${o.id}" ${state.objetivoIdSeleccionado === o.id ? 'selected' : ''}>${esc(o.nombre)}</option>`)
          .join('')}
      </optgroup>
    `,
    )
    .join('')

  const indicadoresRows = state.indicadores
    .map(
      (ind) => `
      <div class="indicador-selector-row">
        <span>${esc(ind.descripcion)}</span>
        <button type="button" class="btn btn-sm btn-primary btn-indicador-calificar" data-indicador-id="${ind.id}">
          <i class="bi bi-stars"></i> Calificar
        </button>
      </div>
    `,
    )
    .join('')

  return `
    <div class="indicador-selector-backdrop"></div>
    <div class="indicador-selector-dialog">
      <div class="indicador-selector-header">
        <h5 class="indicador-selector-title">Indicadores dados hoy</h5>
        <button class="indicador-selector-close-x" aria-label="Cerrar">&times;</button>
      </div>
      <div class="indicador-selector-body">
        ${state.cargando ? '<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>' : ''}
        ${state.error ? '<div class="text-danger small">No se pudo cargar la ruta de contenido de esta clase.</div>' : ''}
        ${
          !state.cargando && !state.error && state.objetivos.length === 0
            ? '<div class="text-muted small">Esta clase todavía no tiene objetivos en su ruta de contenido. Usá "Ir a Modo Sesión (Mapa)" o "Diseñar Ruta" para crear la planificación primero.</div>'
            : ''
        }
        ${
          !state.cargando && !state.error && state.objetivos.length > 0
            ? `
          <label class="form-label small fw-semibold" for="indicador-selector-objetivo">Objetivo</label>
          <select id="indicador-selector-objetivo" class="form-select form-select-sm mb-3">
            <option value="">— Elegí un objetivo —</option>
            ${optgroups}
          </select>
        `
            : ''
        }
        ${
          state.objetivoIdSeleccionado
            ? `<div class="indicador-selector-lista">${indicadoresRows || '<div class="text-muted small">Este objetivo todavía no tiene indicadores.</div>'}</div>`
            : ''
        }
      </div>
      <div class="indicador-selector-footer">
        <button class="btn btn-outline-secondary btn-sm indicador-selector-cerrar-btn">Cerrar</button>
      </div>
    </div>
  `
}

function _getStyles() {
  return `
    .indicador-selector-overlay {
      position: fixed; inset: 0; z-index: 10002;
      display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
    .indicador-selector-backdrop {
      position: absolute; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    }
    .indicador-selector-dialog {
      position: relative; background: var(--bs-body-bg, #fff); border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); width: 100%; max-width: 480px;
      max-height: 80vh; display: flex; flex-direction: column; overflow: hidden;
    }
    .indicador-selector-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--bs-border-color, #dee2e6);
    }
    .indicador-selector-title { font-size: 1.05rem; font-weight: 700; margin: 0; }
    .indicador-selector-close-x {
      width: 32px; height: 32px; border: none; background: var(--bs-tertiary-bg, #f8f9fa);
      border-radius: 8px; cursor: pointer; font-size: 1.2rem;
    }
    .indicador-selector-body { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; }
    .indicador-selector-row {
      display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
      padding: 0.5rem 0; border-bottom: 1px solid var(--bs-border-color, #eee); font-size: 0.85rem;
    }
    .indicador-selector-footer {
      display: flex; justify-content: flex-end; gap: 0.5rem;
      padding: 0.75rem 1.25rem; border-top: 1px solid var(--bs-border-color, #dee2e6);
    }
  `
}
