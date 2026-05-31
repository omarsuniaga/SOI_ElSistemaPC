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
          <div class="p-3 bg-light bg-opacity-25 border rounded-3 h-100">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <span class="small fw-semibold text-secondary">Filtro de Severidad:</span>
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
          <div class="p-3 bg-light bg-opacity-25 border rounded-3 h-100 d-flex flex-column justify-content-between">
            <div>
              <h6 class="fw-bold text-primary mb-2"><i class="bi bi-bug me-1"></i>Simulador de Eventos Técnicos</h6>
              <p class="extra-small text-muted lh-base">
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

            <div class="mt-4 border-top pt-3">
              <span class="small fw-semibold text-secondary d-block mb-1">Audit Trail de Conectividad</span>
              <p class="extra-small text-muted mb-0">
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

        let html = `
        <div class="obs-log-item">
          <span class="obs-log-ts">[${ts}]</span>
          <span class="${lvlClass}">[${l.level}]</span>
          <span class="obs-log-module">${escapeHTML(l.module)}</span>:
          <span>${escapeHTML(l.message)}</span>
          <span class="obs-log-net">${l.network}</span>
      `

        if (l.stack) {
          html += `<pre class="obs-log-stack">${escapeHTML(l.stack)}</pre>`
        }

        html += `</div>`
        return html
      })
      .join('')
  }

  function attachEvents() {
    // Filtros
    container.querySelectorAll('[data-log-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('[data-log-filter]').forEach((b) => b.classList.remove('active'))
        btn.classList.add('active')
        activeFilter = btn.dataset.logFilter
        loadLogs()
      })
    })

    // Limpiar logs
    container.querySelector('#btn-clear-logs')?.addEventListener('click', () => {
      localStorage.setItem('soi_system_logs', JSON.stringify([]))
      AppToast.show('Consola de logs de sistema limpiada con éxito', 'success')
      loadLogs()
    })

    // Simulaciones
    container.querySelector('#btn-mock-rls')?.addEventListener('click', async () => {
      await recordSystemLog({
        level: 'ERROR',
        module: 'SupabaseClient',
        message:
          'Security policy violation for select on public.ausencias_auditoria table (RLS error).',
        stack:
          'Error: Row Level Security block\n  at executeSelect (supabaseClient.js:84:18)\n  at getAuditLogs (observabilidadSupabase.js:46:12)',
      })
      AppToast.show('Log de error de RLS inyectado', 'danger')
      loadLogs()
    })

    container.querySelector('#btn-mock-timeout')?.addEventListener('click', async () => {
      await recordSystemLog({
        level: 'WARNING',
        module: 'HTTPClient',
        message:
          'Request timed out for endpoint /rpc/get_institutional_radar. Falling back to offline fallback state.',
        stack: 'TimeoutException: Request took longer than 5000ms',
      })
      AppToast.show('Log de timeout de red inyectado', 'warning')
      loadLogs()
    })

    container.querySelector('#btn-mock-vitals')?.addEventListener('click', async () => {
      await recordSystemLog({
        level: 'INFO',
        module: 'PWA',
        message:
          'Core Web Vitals: FID: 11ms (Excelente), LCP: 980ms (Excelente), CLS: 0.012 (Excelente).',
      })
      AppToast.show('Log de Core Web Vitals inyectado', 'success')
      loadLogs()
    })
  }

  return {
    async init() {
      container = document.getElementById(containerId)
      if (!container) {
        console.error(`[systemLogsWidget] Contenedor #${containerId} no encontrado en el DOM`)
        return
      }

      await render()

      // Registrar listeners reactivos para el estado de red en vivo
      onlineListener = () => {
        _updateLiveNetStatus()
        AppToast.show('Conectividad restablecida. Sistema Online.', 'success')
      }
      offlineListener = () => {
        _updateLiveNetStatus()
        AppToast.show('Conexión perdida. Trabajando en modo Offline.', 'warning')
      }

      window.addEventListener('online', onlineListener)
      window.addEventListener('offline', offlineListener)
    },

    destroy() {
      if (onlineListener) window.removeEventListener('online', onlineListener)
      if (offlineListener) window.removeEventListener('offline', offlineListener)
    },
  }
}
