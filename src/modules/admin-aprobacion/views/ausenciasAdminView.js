/**
 * ausenciasAdminView — Vista de aprobación de ausencias para el portal Admin
 * Header con stats, cards redesignadas, empty state amigable.
 */

import {
  aprobarAusencia,
  obtenerAusenciasPendientes,
  rechazarAusencia,
} from '../api/ausenciaAprobacionApi.js'
import { createAusenciaAprobacionCard } from '../components/ausenciaAprobacionCard.js'

function showToast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }))
}

function _injectStyles() {
  if (document.getElementById('ausencias-admin-view-styles')) return
  const style = document.createElement('style')
  style.id = 'ausencias-admin-view-styles'
  style.textContent = `
    .aav-root {
      padding: 1.25rem 1rem 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .aav-header {
      margin-bottom: 1.5rem;
    }

    .aav-title-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.4rem;
    }

    .aav-icon-wrap {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      background: rgba(239,68,68,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .aav-icon-wrap i {
      font-size: 1.2rem;
      color: #ef4444;
    }

    .aav-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0;
    }

    .aav-subtitle {
      font-size: 0.82rem;
      opacity: 0.55;
      margin: 0;
      padding-left: calc(2.5rem + 0.75rem);
    }

    /* ── Stats strip ── */
    .aav-stats {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .aav-stat {
      flex: 1;
      min-width: 100px;
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.04));
      border-radius: 0.75rem;
      padding: 0.65rem 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    [data-bs-theme="dark"] .aav-stat,
    [data-portal-theme="dark"] .aav-stat {
      background: rgba(255,255,255,0.05);
    }

    .aav-stat-num {
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1;
    }

    .aav-stat-label {
      font-size: 0.72rem;
      opacity: 0.6;
      line-height: 1.3;
    }

    /* ── Refresh btn ── */
    .aav-refresh-btn {
      background: transparent;
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.15));
      border-radius: 0.5rem;
      padding: 0.3rem 0.75rem;
      font-size: 0.78rem;
      cursor: pointer;
      color: var(--bs-body-color);
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: background 0.15s;
      margin-left: auto;
    }
    .aav-refresh-btn:hover { background: var(--bs-tertiary-bg); }
    .aav-refresh-btn.spinning i { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Action bar ── */
    .aav-action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .aav-count-label {
      font-size: 0.8rem;
      font-weight: 600;
      opacity: 0.65;
    }

    /* ── List ── */
    .aav-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* ── Empty state ── */
    .aav-empty {
      text-align: center;
      padding: 3.5rem 1.5rem;
    }

    .aav-empty-icon {
      font-size: 3.5rem;
      opacity: 0.2;
      margin-bottom: 0.75rem;
    }

    .aav-empty-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.3rem;
    }

    .aav-empty-sub {
      font-size: 0.82rem;
      opacity: 0.55;
    }

    /* ── Error state ── */
    .aav-error {
      text-align: center;
      padding: 2rem;
      color: #ef4444;
      font-size: 0.85rem;
    }

    /* ── Loading ── */
    .aav-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem 1rem;
      opacity: 0.6;
      font-size: 0.9rem;
    }

    .aav-spinner {
      width: 1.5rem;
      height: 1.5rem;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
  `
  document.head.appendChild(style)
}

function _renderShell(container) {
  _injectStyles()
  container.innerHTML = `
    <div class="aav-root">
      <div class="aav-header">
        <div class="aav-title-row">
          <div class="aav-icon-wrap"><i class="bi bi-calendar-x-fill"></i></div>
          <h2 class="aav-title">Solicitudes de Ausencia</h2>
        </div>
        <p class="aav-subtitle">Revisá y aprobá o rechazá las ausencias solicitadas por los maestros.</p>
        <div class="aav-stats" id="aav-stats-row">
          <!-- se llena después de cargar -->
        </div>
      </div>

      <div class="aav-action-bar">
        <span class="aav-count-label" id="aav-count-label"></span>
        <button class="aav-refresh-btn" id="aav-refresh-btn">
          <i class="bi bi-arrow-clockwise"></i> Actualizar
        </button>
      </div>

      <div id="aav-content">
        <div class="aav-loading">
          <div class="aav-spinner"></div>
          <span>Cargando solicitudes...</span>
        </div>
      </div>
    </div>
  `
}

function _renderStats(statsRow, ausencias) {
  const total = ausencias.length
  const altas  = ausencias.filter(a => a.urgencia === 'alta').length
  const medias = ausencias.filter(a => a.urgencia === 'media').length

  statsRow.innerHTML = `
    <div class="aav-stat">
      <div>
        <div class="aav-stat-num" style="color:#ef4444">${total}</div>
        <div class="aav-stat-label">Pendiente${total !== 1 ? 's' : ''}</div>
      </div>
      <i class="bi bi-hourglass-split" style="font-size:1.3rem;opacity:.35"></i>
    </div>
    <div class="aav-stat">
      <div>
        <div class="aav-stat-num" style="color:#ef4444">${altas}</div>
        <div class="aav-stat-label">Urgencia alta</div>
      </div>
      <i class="bi bi-exclamation-triangle-fill" style="font-size:1.3rem;color:#ef4444;opacity:.5"></i>
    </div>
    <div class="aav-stat">
      <div>
        <div class="aav-stat-num" style="color:#f59e0b">${medias}</div>
        <div class="aav-stat-label">Urgencia media</div>
      </div>
      <i class="bi bi-dash-circle-fill" style="font-size:1.3rem;color:#f59e0b;opacity:.5"></i>
    </div>
  `
}

function _renderEmpty(contentEl) {
  contentEl.innerHTML = `
    <div class="aav-empty">
      <div class="aav-empty-icon"><i class="bi bi-inbox"></i></div>
      <h3 class="aav-empty-title">Todo al día</h3>
      <p class="aav-empty-sub">No hay solicitudes de ausencia pendientes en este momento.</p>
    </div>
  `
}

async function _loadAndRender(container) {
  const contentEl  = container.querySelector('#aav-content')
  const statsRow   = container.querySelector('#aav-stats-row')
  const countLabel = container.querySelector('#aav-count-label')
  const refreshBtn = container.querySelector('#aav-refresh-btn')

  if (contentEl) {
    contentEl.innerHTML = `
      <div class="aav-loading">
        <div class="aav-spinner"></div>
        <span>Cargando solicitudes...</span>
      </div>
    `
  }

  try {
    const ausencias = await obtenerAusenciasPendientes()

    // Stats
    if (statsRow) _renderStats(statsRow, ausencias)

    // Count label
    if (countLabel) {
      countLabel.textContent = ausencias.length === 0
        ? 'Sin solicitudes pendientes'
        : `${ausencias.length} solicitud${ausencias.length > 1 ? 'es' : ''} pendiente${ausencias.length > 1 ? 's' : ''}`
    }

    // Update nav badge via insights component
    if (window.adminAusenciasInsights) {
      window.adminAusenciasInsights.evaluate()
    }

    if (!ausencias.length) {
      _renderEmpty(contentEl)
      return
    }

    contentEl.innerHTML = ''
    const list = document.createElement('div')
    list.className = 'aav-list'
    contentEl.appendChild(list)

    // Sort: alta urgency first, then by date
    const sorted = [...ausencias].sort((a, b) => {
      const urgOrder = { alta: 0, media: 1, baja: 2 }
      const ua = urgOrder[a.urgencia] ?? 3
      const ub = urgOrder[b.urgencia] ?? 3
      if (ua !== ub) return ua - ub
      return (a.created_at || '').localeCompare(b.created_at || '')
    })

    for (const ausencia of sorted) {
      list.appendChild(createAusenciaAprobacionCard(ausencia, {
        onApprove: async (id, notes) => {
          await aprobarAusencia(id, notes)
          showToast('Ausencia aprobada', 'success')
          await _loadAndRender(container)
        },
        onReject: async (id, notes) => {
          await rechazarAusencia(id, notes)
          showToast('Ausencia rechazada', 'success')
          await _loadAndRender(container)
        },
      }))
    }

  } catch (error) {
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="aav-error">
          <i class="bi bi-exclamation-triangle"></i>
          Error al cargar solicitudes: ${error.message}
        </div>
      `
    }
    showToast(`Error al cargar ausencias: ${error.message}`, 'error')
  } finally {
    if (refreshBtn) refreshBtn.classList.remove('spinning')
  }
}

export async function renderAusenciasAdminView(container) {
  _renderShell(container)

  const root = container.querySelector('.aav-root')
  await _loadAndRender(root)

  // Refresh button
  const refreshBtn = container.querySelector('#aav-refresh-btn')
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.classList.add('spinning')
      await _loadAndRender(root)
    })
  }
}
