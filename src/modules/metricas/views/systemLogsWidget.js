import { getSystemLogs, recordSystemLog } from '../api/observabilidadApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

/**
 * Widget Premium: System Logs & Monitor Offline
 * @param {string} containerId - ID del contenedor DOM
 */
export function systemLogsWidget(containerId) {
  let container = null
  let activeFilter = 'ALL'
  let onlineListener = null
  let offlineListener = null

  async function render() {
    if (!container) return

    container.innerHTML = `
      <div class="row g-3">
        <div class="col-12 col-lg-8">
          <div class="obs-panel-card p-3 h-100">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <span class="small fw-semibold" style="color: var(--obs-text-secondary);">Filtro de Severidad:</span>
              <div class="btn-group btn-group-sm shadow-sm" role="group">
                <button class="btn btn-outline-secondary ${activeFilter === 'ALL' ? 'active' : ''}" data-log-filter="ALL">TODOS</button>
                <button class="btn btn-outline-info ${activeFilter === 'INFO' ? 'active' : ''}" data-log-filter="INFO">INFO</button>
                <button class="btn btn-outline-warning text-dark ${activeFilter === 'WARNING' ? 'active' : ''}" data-log-filter="WARNING">WARN</button>
                <button class="btn btn-outline-danger ${activeFilter === 'ERROR' ? 'active' : ''}" data-log-filter="ERROR">ERROR</button>
              </div>
            </div>

            <!-- Terminal Consola -->
            <div class="obs-terminal-container">
              <div class="obs-terminal-header">
                <div class="obs-terminal-dots">
                  <div class="obs-terminal-dot red"></div>
                  <div class="obs-terminal-dot yellow"></div>
                  <div class="obs-terminal-dot green"></div>
                </div>
                <div class="obs-terminal-title">SOI_OS v1.1.0 // PWA_TERMINAL_LOGS</div>
                <div id="live-net-status"></div>
              </div>
              <div class="obs-terminal-body" id="logs-body">
                <div class="text-center py-5 text-muted">Cargando consola técnica...</div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="obs-panel-card p-3 h-100 d-flex flex-column justify-content-between">
            <div>
              <h6 class="fw-bold text-primary mb-2"><i class="bi bi-bug me-1"></i>Simulador de Eventos Técnicos</h6>
              <p class="extra-small lh-base" style="color: var(--obs-text-secondary);">
                Genera de manera interactiva excepciones en caliente para evaluar el sistema de alertas tempranas, el flujo RLS de Supabase y la tolerancia offline.
              </p>
              <div class="vstack gap-2 mt-3">
                <button class="btn btn-sm btn-outline-danger text-start px-3 d-flex align-items-center justify-content-between" id="btn-mock-rls">
                  <span><i class="bi bi-shield-x me-1"></i> Falla de Permisos RLS</span>
                  <span class="badge bg-danger">ERROR</span>
                </button>
                <button class="btn btn-sm btn-outline-warning text-dark text-start px-3 d-flex align-items-center justify-content-between" id="btn-mock-timeout">
                  <span><i class="bi bi-wifi-off me-1"></i> Timeout de Petición HTTP</span>
                  <span class="badge bg-warning text-dark">WARN</span>
                </button>
                <button class="btn btn-sm btn-outline-success text-start px-3 d-flex align-items-center justify-content-between" id="btn-mock-vitals">
                  <span><i class="bi bi-activity me-1"></i> Reportar Core Web Vitals</span>
                  <span class="badge bg-success">INFO</span>
                </button>
              </div>
            </div>

            <div class="mt-4 border-top pt-3" style="border-color: var(--obs-border) !important;">
              <span class="small fw-semibold d-block mb-1" style="color: var(--obs-text-secondary);">Audit Trail de Conectividad</span>
              <p class="extra-small mb-0" style="color: var(--obs-text-muted);">
                La PWA encola de forma resiliente todos los logs de excepción locales en su almacenamiento cacheado cuando no detecta conexión a internet.
              </p>
            </div>
          </div>
        </div>
      </div>
    `

    _updateLiveNetStatus()
    await loadLogs()
    attachEvents()
  }

  function _updateLiveNetStatus() {
    const el = container.querySelector('#live-net-status')
    if (!el) return

    const isOnline = navigator.onLine
    el.innerHTML = isOnline
      ? `<span class="badge bg-success rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 shadow-sm small"><span class="spinner-grow spinner-grow-sm text-white obs-net-spinner obs-spinner-slow"></span> ONLINE</span>`
      : `<span class="badge bg-warning text-dark rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 shadow-sm small obs-pulse-offline"><span class="spinner-grow spinner-grow-sm text-dark obs-net-spinner"></span> OFFLINE</span>`
  }

  async function loadLogs() {
    const logsBody = container.querySelector('#logs-body')
    if (!logsBody) return

    const logs = await getSystemLogs()
    const filtered = activeFilter === 'ALL' ? logs : logs.filter((l) => l.level === activeFilter)

    if (filtered.length === 0) {
      logsBody.innerHTML = `<div class="text-center text-muted py-5">[Consola vacía. No hay logs registrados con severidad "${activeFilter}"]</div>`
      return
    }

    logsBody.innerHTML = filtered
      .map((l) => {
        let lvlClass = 'obs-log-level-info'
        if (l.level === 'WARNING') lvlClass = 'obs-log-level-warning'
        if (l.level === 'ERROR') lvlClass = 'obs-log-level-error'

        const ts = l.timestamp
          ? l.timestamp.substring(11, 19)
          : new Date().toISOString().substring(11, 19)

        const networkBadge = l.network_status
          ? `<span class="obs-log-net">${escapeHTML(l.network_status)}</span>`
          : ''

        const stackTrace = l.stack
          ? `<div class="obs-log-stack">${escapeHTML(l.stack)}</div>`
          : ''

        return `
        <div class="obs-log-item">
          <span class="obs-log-ts">[${escapeHTML(ts)}]</span>
          <span class="${lvlClass}">[${escapeHTML(l.level)}]</span>
          <span class="obs-log-module">&lt;${escapeHTML(l.module || 'SYSTEM')}&gt;</span>
          <span>${escapeHTML(l.message)}</span>
          ${networkBadge}
          ${stackTrace}
        </div>
      `
      })
      .join('')
  }

  function attachEvents() {
    container.querySelectorAll('[data-log-filter]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        activeFilter = e.target.dataset.logFilter
        container
          .querySelectorAll('[data-log-filter]')
          .forEach((b) => b.classList.remove('active'))
        e.target.classList.add('active')
        loadLogs()
      })
    })

    container.querySelector('#btn-mock-rls')?.addEventListener('click', async () => {
      await recordSystemLog({
        level: 'ERROR',
        module: 'SUPABASE_RLS',
        message: 'Acceso denegado a tabla protegida: maestros_salarios (código 42501)',
        network_status: navigator.onLine ? 'ONLINE' : 'OFFLINE',
        stack: 'Error: RLS violation at supabaseClient.js:42\n    at fetchData (adminApi.js:18)',
      })
      AppToast.show('Falla RLS simulada y registrada en el sistema de observabilidad', 'danger')
      await loadLogs()
    })

    container.querySelector('#btn-mock-timeout')?.addEventListener('click', async () => {
      await recordSystemLog({
        level: 'WARNING',
        module: 'HTTP_FETCH',
        message: 'Timeout (5000ms) al sincronizar lote de asistencias PWA',
        network_status: navigator.onLine ? 'ONLINE' : 'OFFLINE',
        stack: 'FetchError: Request timeout at syncQueue.js:88',
      })
      AppToast.show('Advertencia de timeout HTTP registrada en la consola técnica', 'warning')
      await loadLogs()
    })

    container.querySelector('#btn-mock-vitals')?.addEventListener('click', async () => {
      await recordSystemLog({
        level: 'INFO',
        module: 'CORE_VITALS',
        message: 'LCP: 1.2s | FID: 14ms | CLS: 0.01 — Rendimiento óptimo en cliente PWA',
        network_status: navigator.onLine ? 'ONLINE' : 'OFFLINE',
      })
      AppToast.show('Métricas de rendimiento Web Vitals reportadas con éxito', 'success')
      await loadLogs()
    })

    onlineListener = () => {
      _updateLiveNetStatus()
      loadLogs()
    }
    offlineListener = () => {
      _updateLiveNetStatus()
      loadLogs()
    }
    window.addEventListener('online', onlineListener)
    window.addEventListener('offline', offlineListener)
  }

  function destroy() {
    if (onlineListener) {
      window.removeEventListener('online', onlineListener)
      onlineListener = null
    }
    if (offlineListener) {
      window.removeEventListener('offline', offlineListener)
      offlineListener = null
    }
  }

  return {
    init: async () => {
      container = document.getElementById(containerId)
      await render()
    },
    destroy,
  }
}
