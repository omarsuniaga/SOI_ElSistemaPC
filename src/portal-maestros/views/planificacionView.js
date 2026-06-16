/**
 * planificacionView.js
 * Vista: Planificación Académica
 * Tabs: Semáforo/Bitácora (default), Ruta, Gestionar, Historial
 */

import { getMisClases } from '../services/maestroDataService.js'
import { getRutasMaestro } from '../services/maestroDataService.js'
import { AppToast } from '../../shared/components/AppToast.js'

export async function renderPlanificacionView(container, { maestroId }) {
  let _currentRoute = null
  let _currentClase = null

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

      .pm-planning-empty {
        text-align: center;
        padding: 3rem;
        color: var(--pm-text-muted);
      }

      /* Tabs */
      .pm-planning-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid var(--pm-border);
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }
      .pm-planning-tabs::-webkit-scrollbar { display: none; }

      .pm-planning-tab {
        background: none;
        border: none;
        border-bottom: 3px solid transparent;
        padding: 0.75rem 1rem;
        cursor: pointer;
        font-weight: 600;
        color: var(--pm-text-muted);
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.95rem;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .pm-planning-tab:hover { color: var(--pm-primary); }
      .pm-planning-tab.active {
        color: var(--pm-primary);
        border-bottom-color: var(--pm-primary);
      }

      .pm-planning-pane { animation: pmFadeIn 0.2s ease; }
      .pm-planning-pane[hidden] { display: none; }
      @keyframes pmFadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Mobile (<= 640px) */
      @media (max-width: 640px) {
        .pm-planning-container { padding: 0.75rem; }
        .pm-planning-header { padding: 1rem; border-radius: 12px; margin-bottom: 1rem; }
        .pm-planning-title { font-size: 1.3rem; margin-bottom: 0.5rem; }
        .pm-planning-header p { font-size: 0.85rem; }
        .pm-planning-filters { flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
        .pm-planning-filter { width: 100%; }
        .pm-planning-filter select { width: 100%; min-height: 44px; font-size: 0.95rem; }
        .pm-planning-tab { padding: 0.6rem 0.75rem; font-size: 0.85rem; }
        .pm-planning-empty { padding: 1.5rem; }
      }
    </style>

    <div class="pm-planning-container">
      <div class="pm-planning-header">
        <h1 class="pm-planning-title">📚 Planificación Académica</h1>
        <p style="margin: 0; opacity: 0.9;">Semáforo / Bitácora — visualizá el progreso de tus clases</p>
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

      <div class="pm-planning-tabs" role="tablist">
        <button class="pm-planning-tab active" data-tab="bitacora" role="tab" aria-selected="true">
          📊 Semáforo / Bitácora
        </button>
        <button class="pm-planning-tab" data-tab="ruta" role="tab" aria-selected="false">
          🗺️ Ruta
        </button>
        <button class="pm-planning-tab" data-tab="gestionar" role="tab" aria-selected="false">
          ⚙️ Gestionar
        </button>
        <button class="pm-planning-tab" data-tab="historial" role="tab" aria-selected="false">
          📋 Historial
        </button>
      </div>

      <div class="pm-planning-pane" data-pane="bitacora" role="tabpanel">
        <div id="pm-planning-bitacora">
          <div class="pm-planning-empty">
            <p>Selecciona una clase para ver la bitácora</p>
          </div>
        </div>
      </div>

      <div class="pm-planning-pane" data-pane="ruta" role="tabpanel" hidden>
        <div id="pm-planning-route-tree">
          <div class="pm-planning-empty">
            <p>Selecciona una ruta para ver su estructura</p>
          </div>
        </div>
      </div>

      <div class="pm-planning-pane" data-pane="gestionar" role="tabpanel" hidden>
        <div id="pm-planning-manager">
          <div class="pm-planning-empty">
            <p>Selecciona una ruta para gestionar su contenido</p>
          </div>
        </div>
      </div>

      <div class="pm-planning-pane" data-pane="historial" role="tabpanel" hidden>
        <div id="pm-planning-historial">
          <div class="pm-planning-empty">
            <p>Selecciona una clase para ver el historial</p>
          </div>
        </div>
      </div>
    </div>
  `

  container.innerHTML = html

  // ── Tab switching ──
  const TAB_KEY = 'pm-planning-active-tab'
  const tabs = container.querySelectorAll('.pm-planning-tab')
  const panes = container.querySelectorAll('.pm-planning-pane')

  function _activateTab(tabName) {
    tabs.forEach((t) => {
      const active = t.dataset.tab === tabName
      t.classList.toggle('active', active)
      t.setAttribute('aria-selected', active ? 'true' : 'false')
    })
    panes.forEach((p) => {
      p.hidden = p.dataset.pane !== tabName
    })
    try {
      sessionStorage.setItem(TAB_KEY, tabName)
    } catch {
      /* sessionStorage no disponible */
    }
    _onTabActivated(tabName)
  }

  tabs.forEach((t) => {
    t.addEventListener('click', () => _activateTab(t.dataset.tab))
  })

  const claseSelect = container.querySelector('#pm-planning-clase-select')
  const rutaSelect = container.querySelector('#pm-planning-ruta-select')

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

    // Invalidar caches dependientes de la clase
    _historialLoadedFor = null
    _routeTreeLoadedFor = null
    _managerLoadedFor = null
    _bitacoraLoadedFor = null

    // Reload active tab
    const activeTab = container.querySelector('.pm-planning-tab.active')?.dataset.tab
    _onTabActivated(activeTab || 'bitacora')

    if (!_currentClase) return

    // Cargar rutas para esta clase
    try {
      const rutas = await getRutasMaestro(_currentClase)
      rutaSelect.innerHTML =
        '<option value="">Selecciona una ruta...</option>' +
        rutas.map((r) => `<option value="${r.route_version_id}">${r.name}${r.instrumento ? ` (${r.instrumento})` : ''}</option>`).join('')
    } catch (err) {
      console.error('[planning] Error cargando rutas:', err)
      AppToast.error('Error cargando rutas')
    }
  })

  // Cuando cambia la ruta → refrescar el tab activo
  rutaSelect.addEventListener('change', () => {
    _currentRoute = rutaSelect.value || null
    const activeTab = container.querySelector('.pm-planning-tab.active')?.dataset.tab || 'bitacora'
    _onTabActivated(activeTab)
  })

  // ── Dispatcher de tabs ──
  const routeTreeDiv = container.querySelector('#pm-planning-route-tree')
  const managerDiv = container.querySelector('#pm-planning-manager')
  const historialDiv = container.querySelector('#pm-planning-historial')
  const bitacoraDiv = container.querySelector('#pm-planning-bitacora')
  let _routeTreeLoadedFor = null
  let _managerLoadedFor = null
  let _historialLoadedFor = null
  let _bitacoraLoadedFor = null
  let _routeTreeInFlight = false
  let _managerInFlight = false
  let _historialInFlight = false
  let _bitacoraInFlight = false

  function _onTabActivated(tabName) {
    if (tabName === 'ruta') return _loadRouteTree()
    if (tabName === 'gestionar') return _loadManager()
    if (tabName === 'historial') return _loadHistorial()
    if (tabName === 'bitacora') return _loadBitacora()
  }

  async function _loadRouteTree() {
    if (!_currentRoute) {
      routeTreeDiv.innerHTML =
        '<div class="pm-planning-empty"><p>Selecciona una ruta para ver su estructura</p></div>'
      return
    }
    if (_routeTreeLoadedFor === _currentRoute || _routeTreeInFlight) return
    _routeTreeInFlight = true
    routeTreeDiv.innerHTML = '<div class="pm-planning-empty"><p>Cargando estructura...</p></div>'
    try {
      const { renderPlanningRouteTree } = await import(
        '../components/PlanningRouteTree.js'
      )
      await renderPlanningRouteTree(routeTreeDiv, { routeVersionId: _currentRoute })
      _routeTreeLoadedFor = _currentRoute
    } catch (err) {
      console.error('[planning] Error cargando estructura de ruta:', err)
      routeTreeDiv.innerHTML =
        '<div class="pm-planning-empty"><p>Error al cargar la estructura. Intenta de nuevo.</p></div>'
    } finally {
      _routeTreeInFlight = false
    }
  }

  async function _loadManager() {
    if (!_currentRoute) {
      managerDiv.innerHTML =
        '<div class="pm-planning-empty"><p>Selecciona una ruta para gestionar su contenido</p></div>'
      return
    }
    if (_managerLoadedFor === _currentRoute || _managerInFlight) return
    _managerInFlight = true
    managerDiv.innerHTML =
      '<div class="pm-planning-empty"><p>Preparando tu borrador editable…</p></div>'
    try {
      const { renderPlanningManager } = await import(
        '../components/PlanningManagerPanel.js'
      )
      await renderPlanningManager(managerDiv, {
        publishedRouteVersionId: _currentRoute,
        maestroId,
        onChanged: () => {
          _routeTreeLoadedFor = null
        },
      })
      _managerLoadedFor = _currentRoute
    } catch (err) {
      console.error('[planning] Error cargando gestor:', err)
      managerDiv.innerHTML =
        '<div class="pm-planning-empty"><p>Error al cargar el gestor. Intenta de nuevo.</p></div>'
    } finally {
      _managerInFlight = false
    }
  }

  async function _loadHistorial() {
    if (!_currentClase) {
      historialDiv.innerHTML =
        '<div class="pm-planning-empty"><p>Selecciona una clase para ver el historial</p></div>'
      return
    }
    const cacheKey = `${_currentClase}:${_currentRoute}`
    if (_historialLoadedFor === cacheKey || _historialInFlight) return
    _historialInFlight = true
    historialDiv.innerHTML =
      '<div class="pm-planning-empty"><p>Cargando historial...</p></div>'
    try {
      const { renderPlanningHistorialPane } = await import(
        '../components/PlanningHistorialPane.js'
      )
      await renderPlanningHistorialPane(historialDiv, {
        maestroId,
        claseId: _currentClase,
        publishedRouteVersionId: _currentRoute,
        onPromoted: () => {
          // No semáforo to reload — bitácora reloads naturally
        },
      })
      _historialLoadedFor = cacheKey
    } catch (err) {
      console.error('[planning] Error cargando historial:', err)
      historialDiv.innerHTML =
        '<div class="pm-planning-empty"><p>Error al cargar el historial. Intenta de nuevo.</p></div>'
    } finally {
      _historialInFlight = false
    }
  }

  async function _loadBitacora() {
    if (!_currentClase) {
      bitacoraDiv.innerHTML =
        '<div class="pm-planning-empty"><p>Selecciona una clase para ver la bitácora</p></div>'
      return
    }
    if (_bitacoraLoadedFor === _currentClase || _bitacoraInFlight) return
    _bitacoraInFlight = true
    bitacoraDiv.innerHTML =
      '<div class="pm-planning-empty"><p>Cargando bitácora...</p></div>'
    try {
      const { renderBitacoraView } = await import('../../modules/bitacora/views/bitacoraView.js')
      await renderBitacoraView(bitacoraDiv, { claseId: _currentClase })
      _bitacoraLoadedFor = _currentClase
    } catch (err) {
      console.error('[planning] Error cargando bitácora:', err)
      bitacoraDiv.innerHTML =
        '<div class="pm-planning-empty"><p>Error al cargar la bitácora. Intenta de nuevo.</p></div>'
    } finally {
      _bitacoraInFlight = false
    }
  }

  // Restaurar tab activo persistido (ignoring old 'semaforo' value)
  try {
    const savedTab = sessionStorage.getItem(TAB_KEY)
    if (savedTab && savedTab !== 'semaforo') _activateTab(savedTab)
    else _loadBitacora() // trigger default tab load
  } catch {
    /* sessionStorage no disponible */
    _loadBitacora()
  }
}
