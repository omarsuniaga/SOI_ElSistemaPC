/**
 * MapaClaseView.js — Contenedor del Mapa Gamificado de Planificación (por clase)
 *
 * Tarea 3.2 (openspec/changes/mapa-gamificado-planificacion). Responsabilidades
 * (design.md, File Changes):
 *   - Resuelve los niveles asignados a la clase vía `acm_active_routes`
 *     (REQ-01) y los pasa como scope al selector de Nivel del builder
 *     (`objetivoEditorModal.js`, Tarea 3.3) — sin niveles asignados, bloquea
 *     la creación de nodos.
 *   - Sostiene el toggle de dos modos, **Diseñar Ruta / Dar Clase** (REQ-02).
 *   - Aplica el gate de Modo Sesión: no se puede entrar a "Dar Clase" para
 *     una fecha sin asistencia ya registrada (REQ-03) — dirige al módulo de
 *     asistencias en su lugar.
 *   - Modo Diseño: click en nodo abre `objetivoEditorModal.js` (Tarea 3.3).
 *   - Modo Sesión: click en objetivo lista sus indicadores; click en
 *     indicador abre `calificacionIndicadorPanel.js` (Tarea 3.4), acotado a
 *     los alumnos presentes hoy (resueltos acá, no en el panel).
 *
 * `MapaContenidoSVG.js` (Tarea 3.1) sigue siendo un renderer puro — todas
 * las decisiones de qué abrir al hacer click viven acá.
 */

import { AppToast } from '../../../shared/components/AppToast.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { renderMapaContenidoSVG } from '../components/MapaContenidoSVG.js'
import { renderObjetivoEditorModal } from '../components/objetivoEditorModal.js'
import { renderCalificacionIndicadorPanel } from '../components/calificacionIndicadorPanel.js'
import {
  obtenerNivelesAsignadosClase,
  obtenerObjetivosPorClase,
  obtenerEstrellasPorClase,
  obtenerIndicadoresPorObjetivo,
} from '../services/mapaClaseService.js'
import { obtenerAsistenciaDelDia } from '../../asistencias/api/asistenciasApi.js'
import { navegarConClase } from '../utils/crossPortalNav.js'

function _fechaHoy() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * @param {HTMLElement} container
 * @param {object} options
 * @param {string} options.claseId
 * @param {string|null} [options.maestroId] - id del maestro actual, usado como evaluado_por/created_by
 */
export async function renderMapaClaseView(container, { claseId, maestroId = null } = {}) {
  if (!container || !claseId) return

  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center py-5" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
  `

  const state = {
    claseId,
    maestroId,
    niveles: [],
    objetivos: [],
    estrellasMap: new Map(),
    modo: 'diseno',
    gateBloqueado: false,
    presentes: [],
    selectedObjetivoId: null,
    indicadoresSeleccionados: [],
  }

  await _cargarNiveles(state)
  await _cargarObjetivosYEstrellas(state)

  _renderShell(container, state)
}

async function _cargarNiveles(state) {
  try {
    state.niveles = await obtenerNivelesAsignadosClase(state.claseId)
  } catch (err) {
    console.error('[MapaClaseView] Error cargando niveles asignados:', err)
    state.niveles = []
  }
}

async function _cargarObjetivosYEstrellas(state) {
  try {
    const [objetivos, estrellas] = await Promise.all([
      obtenerObjetivosPorClase(state.claseId),
      obtenerEstrellasPorClase(state.claseId),
    ])
    state.objetivos = objetivos || []
    state.estrellasMap = new Map((estrellas || []).map((e) => [e.objetivoId, e]))
  } catch (err) {
    console.error('[MapaClaseView] Error cargando objetivos/estrellas:', err)
    state.objetivos = []
    state.estrellasMap = new Map()
  }
}

function _buildNodos(state) {
  return state.objetivos.map((o) => {
    const est = state.estrellasMap.get(o.id)
    return {
      id: o.id,
      titulo: o.nombre,
      ...(est
        ? { estrellas: est.estrellas, pctAvance: est.pctAvance, estadoVisual: est.estadoVisual }
        : {}),
    }
  })
}

function _renderShell(container, state) {
  const sinNiveles = state.niveles.length === 0

  container.innerHTML = `
    <div class="mapa-clase-view container-fluid px-3 py-3">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h4 class="fw-bold mb-0">Mapa de Planificación</h4>
        <div class="d-flex flex-wrap align-items-center gap-2">
          <div class="btn-group" role="group" aria-label="Modo del mapa">
            <button type="button" id="btn-modo-diseno" class="btn btn-sm ${state.modo === 'diseno' ? 'btn-primary' : 'btn-outline-primary'}">
              <i class="bi bi-pencil-square me-1"></i>Diseñar Ruta
            </button>
            <button type="button" id="btn-modo-sesion" class="btn btn-sm ${state.modo === 'sesion' ? 'btn-primary' : 'btn-outline-primary'}">
              <i class="bi bi-person-video3 me-1"></i>Dar Clase
            </button>
          </div>
          <button type="button" id="btn-ir-disenador" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-diagram-3 me-1"></i>Diseñador Completo
          </button>
        </div>
      </div>

      ${sinNiveles ? `
        <div class="alert alert-warning" role="alert">
          Esta clase no tiene niveles asignados en la matriz ACM (acm_active_routes). Asigná un nivel antes de crear objetivos.
        </div>
      ` : ''}

      ${state.gateBloqueado ? `
        <div class="alert alert-warning d-flex align-items-center justify-content-between gap-2" role="alert">
          <span>No hay asistencia registrada para hoy. Registrala antes de entrar a Dar Clase.</span>
          <button id="btn-ir-asistencias" class="btn btn-sm btn-warning">Ir a Asistencias</button>
        </div>
      ` : ''}

      <div id="mapa-clase-svg-canvas" class="mb-3"></div>

      <div id="mapa-clase-panel-sesion"></div>
    </div>
  `

  const canvasEl = container.querySelector('#mapa-clase-svg-canvas')
  if (canvasEl) {
    renderMapaContenidoSVG({
      container: canvasEl,
      nodos: _buildNodos(state),
      modo: state.modo,
      onNodeClick: (nodo) => _handleNodeClick(container, state, nodo),
      onAddNodeClick: () => _handleAddNodeClick(container, state),
    })
  }

  if (state.modo === 'sesion' && state.selectedObjetivoId) {
    _renderPanelIndicadores(container, state)
  }

  container.querySelector('#btn-modo-diseno')?.addEventListener('click', () => {
    state.modo = 'diseno'
    state.gateBloqueado = false
    state.selectedObjetivoId = null
    state.indicadoresSeleccionados = []
    _renderShell(container, state)
  })

  container.querySelector('#btn-modo-sesion')?.addEventListener('click', () => _handleToggleSesion(container, state))
  container.querySelector('#btn-ir-asistencias')?.addEventListener('click', () => window.router?.navigate('asistencias'))
  container.querySelector('#btn-ir-disenador')?.addEventListener('click', () => navegarConClase('planificacion-disenador', state.claseId))
}

async function _handleToggleSesion(container, state) {
  const fecha = _fechaHoy()
  let gate = { tomada: false, presentes: [] }
  try {
    gate = await obtenerAsistenciaDelDia({ claseId: state.claseId, fecha })
  } catch (err) {
    console.error('[MapaClaseView] Error verificando asistencia del día:', err)
  }

  if (!gate.tomada) {
    state.gateBloqueado = true
    _renderShell(container, state)
    return
  }

  state.gateBloqueado = false
  state.presentes = gate.presentes || []
  state.modo = 'sesion'
  _renderShell(container, state)
}

function _handleAddNodeClick(container, state) {
  if (state.niveles.length === 0) {
    AppToast.warning('Esta clase no tiene niveles asignados. Asigná un nivel en la matriz ACM primero.')
    return
  }

  renderObjetivoEditorModal({
    claseId: state.claseId,
    niveles: state.niveles,
    objetivo: null,
    maestroId: state.maestroId,
    onSaved: () => _refrescarYRerender(container, state),
  })
}

function _handleNodeClick(container, state, nodo) {
  if (state.modo === 'diseno') {
    const objetivo = state.objetivos.find((o) => String(o.id) === String(nodo.id)) || null
    renderObjetivoEditorModal({
      claseId: state.claseId,
      niveles: state.niveles,
      objetivo,
      maestroId: state.maestroId,
      onSaved: () => _refrescarYRerender(container, state),
    })
    return
  }

  // Modo Sesión: click en objetivo -> listar sus indicadores.
  state.selectedObjetivoId = nodo.id
  obtenerIndicadoresPorObjetivo(nodo.id)
    .then((indicadores) => {
      // Descarta la respuesta si el maestro ya seleccionó otro objetivo.
      if (state.selectedObjetivoId !== nodo.id) return
      state.indicadoresSeleccionados = indicadores || []
      _renderShell(container, state)
    })
    .catch((err) => {
      console.error('[MapaClaseView] Error cargando indicadores del objetivo:', err)
      state.indicadoresSeleccionados = []
      _renderShell(container, state)
    })
}

function _renderPanelIndicadores(container, state) {
  const panel = container.querySelector('#mapa-clase-panel-sesion')
  if (!panel) return

  const objetivo = state.objetivos.find((o) => String(o.id) === String(state.selectedObjetivoId))

  const rows = state.indicadoresSeleccionados
    .map(
      (ind) => `
      <div class="mapa-clase-indicador-row d-flex align-items-center justify-content-between border-bottom py-2">
        <span>${escapeHTML(ind.descripcion || '')}</span>
        <button class="btn btn-sm btn-outline-primary btn-calificar-indicador" data-indicador-id="${ind.id}">
          Calificar
        </button>
      </div>
    `,
    )
    .join('')

  panel.innerHTML = `
    <div class="card border-secondary-subtle rounded-4 p-3 bg-body-tertiary">
      <h6 class="fw-bold mb-2">Indicadores de "${escapeHTML(objetivo?.nombre || '')}"</h6>
      <p class="text-body-secondary small mb-2">Elegí cuáles se cubrieron hoy y calificá a los alumnos presentes.</p>
      ${rows || '<div class="text-muted small">Este objetivo todavía no tiene indicadores.</div>'}
    </div>
  `

  panel.querySelectorAll('.btn-calificar-indicador').forEach((btn) => {
    btn.addEventListener('click', () => {
      const indicador = state.indicadoresSeleccionados.find((i) => String(i.id) === btn.dataset.indicadorId)
      if (!indicador) return
      renderCalificacionIndicadorPanel({
        claseId: state.claseId,
        claseIndicadorId: indicador.id,
        indicadorDescripcion: indicador.descripcion,
        presentes: state.presentes,
        fecha: _fechaHoy(),
        evaluadoPor: state.maestroId,
        onGuardado: () => _refrescarYRerender(container, state),
      })
    })
  })
}

async function _refrescarYRerender(container, state) {
  await _cargarObjetivosYEstrellas(state)
  _renderShell(container, state)
}
