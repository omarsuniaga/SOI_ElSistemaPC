/**
 * planningView.js
 * Vista: Planificación Académica
 * Dashboard semáforo de indicadores por ruta académica
 */

import { getMisClases } from '../services/maestroDataService.js'
import { getRutasMaestro } from '../services/rutaService.js'
import {
  getIndicatorsWithStatus,
  getIndicatorHistory,
  createIndicatorObservation,
} from '../../modules/planning/services/planningService.js'
import { announce } from '../utils/a11yUtils.js'
import { AppToast } from '../../shared/components/AppToast.js'
import { createPlanningRegistroModal } from '../components/PlanningRegistroModal.js'
import { createPlanningDetailsModal } from '../components/PlanningDetailsModal.js'

export async function renderPlanningView(container, { maestroId }) {
  let _currentRoute = null
  let _currentClase = null
  let _indicators = []

  const html = `
    <style>
      .pm-planning-container {
        padding: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .pm-planning-header {
        background: linear-gradient(135deg, var(--pm-primary), #1d4ed8);
        color: white;
        padding: 2rem;
        border-radius: 16px;
        margin-bottom: 2rem;
      }

      .pm-planning-title {
        font-size: 1.8rem;
        font-weight: 800;
        margin: 0 0 1rem 0;
      }

      .pm-planning-filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }

      .pm-planning-filter {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .pm-planning-filter label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--pm-text-muted);
      }

      .pm-planning-filter select {
        padding: 0.6rem 0.8rem;
        border-radius: 8px;
        border: 1px solid var(--pm-border);
        background: var(--pm-surface);
        color: var(--pm-text);
        font-weight: 500;
      }

      .pm-planning-grid {
        display: grid;
        gap: 2rem;
      }

      .pm-planning-group {
        display: grid;
        gap: 1rem;
      }

      .pm-planning-group-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--pm-text);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .pm-planning-indicator-card {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 1.25rem;
        border-radius: 12px;
        border: 2px solid var(--pm-border);
        background: var(--pm-surface);
        transition: all 0.2s;
        cursor: pointer;
      }

      .pm-planning-indicator-card:hover {
        border-color: var(--pm-primary);
        box-shadow: 0 4px 12px rgba(0, 122, 255, 0.1);
        transform: translateY(-2px);
      }

      /* Color backgrounds por estado */
      .pm-planning-indicator-card.estado-completado {
        background: rgba(74, 222, 128, 0.08);
        border-color: rgba(74, 222, 128, 0.3);
      }

      .pm-planning-indicator-card.estado-parcial {
        background: rgba(251, 191, 36, 0.08);
        border-color: rgba(251, 191, 36, 0.3);
      }

      .pm-planning-indicator-card.estado-no_iniciado {
        background: rgba(107, 114, 128, 0.05);
        border-color: rgba(107, 114, 128, 0.2);
      }

      .pm-planning-indicator-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        font-weight: bold;
        flex-shrink: 0;
        background: white;
      }

      .pm-planning-indicator-card.estado-completado .pm-planning-indicator-icon {
        background: #4ade80;
        color: white;
      }

      .pm-planning-indicator-card.estado-parcial .pm-planning-indicator-icon {
        background: #fbbf24;
        color: white;
      }

      .pm-planning-indicator-card.estado-no_iniciado .pm-planning-indicator-icon {
        background: #d1d5db;
        color: #6b7280;
      }

      .pm-planning-indicator-content {
        flex: 1;
        min-width: 0;
      }

      .pm-planning-indicator-name {
        font-weight: 700;
        font-size: 1rem;
        margin: 0 0 0.25rem 0;
      }

      .pm-planning-indicator-progress {
        font-size: 0.85rem;
        color: var(--pm-text-muted);
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .pm-planning-progress-bar {
        width: 120px;
        height: 6px;
        background: var(--pm-border);
        border-radius: 999px;
        overflow: hidden;
      }

      .pm-planning-progress-fill {
        height: 100%;
        background: var(--pm-primary);
        transition: width 0.3s;
      }

      .pm-planning-indicator-card.estado-completado .pm-planning-progress-fill {
        background: #4ade80;
      }

      .pm-planning-indicator-card.estado-parcial .pm-planning-progress-fill {
        background: #fbbf24;
      }

      .pm-planning-indicator-actions {
        display: flex;
        gap: 0.75rem;
      }

      .pm-planning-btn {
        padding: 0.6rem 1rem;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .pm-planning-btn-info {
        background: var(--pm-primary);
        color: white;
      }

      .pm-planning-btn-info:hover {
        background: #0056b3;
        transform: scale(1.05);
      }

      .pm-planning-empty {
        text-align: center;
        padding: 3rem;
        color: var(--pm-text-muted);
      }
    </style>

    <div class="pm-planning-container">
      <div class="pm-planning-header">
        <h1 class="pm-planning-title">📚 Planificación Académica</h1>
        <p style="margin: 0; opacity: 0.9;">Semáforo visual de indicadores — Verde (completado), Naranja (parcial), Gris (no trabajado)</p>
      </div>

      <div class="pm-planning-filters">
        <div class="pm-planning-filter">
          <label>Selecciona tu Clase</label>
          <select id="pm-planning-clase-select">
            <option value="">Cargando clases...</option>
          </select>
        </div>
        <div class="pm-planning-filter">
          <label>Selecciona la Ruta</label>
          <select id="pm-planning-ruta-select">
            <option value="">Cargando rutas...</option>
          </select>
        </div>
      </div>

      <div id="pm-planning-content">
        <div class="pm-planning-empty">
          <p>Selecciona una clase y ruta para comenzar</p>
        </div>
      </div>
    </div>
  `

  container.innerHTML = html

  const claseSelect = container.querySelector('#pm-planning-clase-select')
  const rutaSelect = container.querySelector('#pm-planning-ruta-select')
  const contentDiv = container.querySelector('#pm-planning-content')

  // Cargar clases
  try {
    const clases = await getMisClases()
    claseSelect.innerHTML =
      '<option value="">Selecciona una clase...</option>' +
      clases
        .map((c) => `<option value="${c.id}">${c.nombre} (${c.instrumento || 'S/I'})</option>`)
        .join('')
  } catch (err) {
    console.error('[planning] Error cargando clases:', err)
    AppToast.error('Error cargando clases')
  }

  // Cuando cambia la clase
  claseSelect.addEventListener('change', async () => {
    _currentClase = claseSelect.value
    rutaSelect.value = ''
    _currentRoute = null
    contentDiv.innerHTML = '<div class="pm-planning-empty"><p>Selecciona una ruta...</p></div>'

    if (!_currentClase) return

    // Cargar rutas para esta clase
    try {
      const rutas = await getRutasMaestro(maestroId)
      rutaSelect.innerHTML =
        '<option value="">Selecciona una ruta...</option>' +
        rutas
          .map((r) => `<option value="${r.id}">${r.nombre} (v${r.version})</option>`)
          .join('')
    } catch (err) {
      console.error('[planning] Error cargando rutas:', err)
      AppToast.error('Error cargando rutas')
    }
  })

  // Cuando cambia la ruta
  rutaSelect.addEventListener('change', async () => {
    if (!rutaSelect.value || !_currentClase) {
      contentDiv.innerHTML = '<div class="pm-planning-empty"><p>Selecciona una ruta...</p></div>'
      return
    }

    _currentRoute = rutaSelect.value
    contentDiv.innerHTML = '<div class="pm-planning-empty"><p>Cargando indicadores...</p></div>'

    try {
      _indicators = await getIndicatorsWithStatus(_currentRoute, maestroId, _currentClase)
      _renderIndicators()
    } catch (err) {
      console.error('[planning] Error cargando indicadores:', err)
      AppToast.error('Error cargando indicadores')
      contentDiv.innerHTML =
        '<div class="pm-planning-empty"><p>Error al cargar indicadores. Intenta de nuevo.</p></div>'
    }
  })

  function _renderIndicators() {
    if (!_indicators || _indicators.length === 0) {
      contentDiv.innerHTML = '<div class="pm-planning-empty"><p>No hay indicadores en esta ruta</p></div>'
      return
    }

    // Agrupar por tipo/categoría
    const grouped = {}
    _indicators.forEach((ind) => {
      const tipo = ind.tipo || 'Sin Categoría'
      if (!grouped[tipo]) grouped[tipo] = []
      grouped[tipo].push(ind)
    })

    const html = Object.entries(grouped)
      .map(
        ([tipo, indicadores]) => `
      <div class="pm-planning-group">
        <div class="pm-planning-group-title">
          ${tipo}
          <span style="font-size: 0.8rem; color: var(--pm-text-muted);">
            (${indicadores.filter((i) => i.estado.estado === 'completado').length}/${indicadores.length})
          </span>
        </div>
        ${indicadores.map((ind) => _renderIndicatorCard(ind)).join('')}
      </div>
    `
      )
      .join('')

    contentDiv.innerHTML = `<div class="pm-planning-grid">${html}</div>`

    // Agregar listeners
    contentDiv.querySelectorAll('[data-indicator-id]').forEach((card) => {
      const indId = card.dataset.indicatorId
      const indicator = _indicators.find((i) => i.node_id === indId)

      card.addEventListener('click', async () => {
        await _showIndicatorDetails(indicator)
      })
    })

    contentDiv.querySelectorAll('[data-register-btn]').forEach((btn) => {
      const indId = btn.dataset.indicatorId
      const indicator = _indicators.find((i) => i.node_id === indId)

      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        _showRegistroModal(indicator)
      })
    })
  }

  function _renderIndicatorCard(indicator) {
    const progreso = (indicator.progreso_porcentaje / 100) * 100
    const { estado, icono, color } = indicator.estado

    return `
      <div class="pm-planning-indicator-card estado-${estado}" data-indicator-id="${indicator.node_id}">
        <div class="pm-planning-indicator-icon">${icono}</div>
        <div class="pm-planning-indicator-content">
          <p class="pm-planning-indicator-name">${indicator.nombre}</p>
          <div class="pm-planning-indicator-progress">
            <div class="pm-planning-progress-bar">
              <div class="pm-planning-progress-fill" style="width: ${progreso}%"></div>
            </div>
            <span>${indicator.estudiantes_vieron}/${indicator.estudiantes_totales} alumnos</span>
          </div>
        </div>
        <div class="pm-planning-indicator-actions">
          <button class="pm-planning-btn pm-planning-btn-info" data-register-btn data-indicator-id="${indicator.node_id}">
            Registrar
          </button>
        </div>
      </div>
    `
  }

  async function _showIndicatorDetails(indicator) {
    createPlanningDetailsModal(container, {
      indicator,
      claseId: _currentClase,
      maestroId,
      routeVersionId: _currentRoute,
    })
  }

  async function _showRegistroModal(indicator) {
    createPlanningRegistroModal(container, {
      indicator,
      claseId: _currentClase,
      maestroId,
      routeVersionId: _currentRoute,
      onSave: async () => {
        // Recargar indicadores después de guardar
        try {
          _indicators = await getIndicatorsWithStatus(_currentRoute, maestroId, _currentClase)
          _renderIndicators()
          AppToast.success('✓ Indicadores actualizados')
        } catch (err) {
          console.error('[planning] Error reloading:', err)
        }
      },
    })
  }
}
