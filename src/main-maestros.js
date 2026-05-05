// ============================================================
// PORTAL MAESTROS — Entry Point
// ============================================================
import './portal-maestros/styles/portal.css'

import { usePortalAuth }        from './portal-maestros/auth/usePortalAuth.js'
import { createPortalRouter }   from './portal-maestros/router/portalRouter.js'
import { processQueue, getQueue } from './portal-maestros/services/offlineQueue.js'
import { supabase }             from './lib/supabaseClient.js'

import { renderLoginView }      from './portal-maestros/views/loginView.js'
import { renderHoyView }        from './portal-maestros/views/hoyView.js'
import { renderCalendarioView } from './portal-maestros/views/calendarioView.js'
import { renderMetricasView }   from './portal-maestros/views/metricasView.js'

const TABS = [
  { id: 'calendario', label: 'Inicio',   icon: 'bi-calendar3' },
  { id: 'hoy',        label: 'Hoy',      icon: 'bi-house-door' },
  { id: 'metricas',   label: 'Métricas', icon: 'bi-bar-chart-line' },
]

const router = createPortalRouter()

// ── Sync indicator ─────────────────────────────────────────

async function _syncWithSupabase(item) {
  const { tabla, operacion, payload } = item
  if (operacion === 'insert') {
    const { error } = await supabase.from(tabla).insert(payload)
    if (error) throw error
  } else if (operacion === 'update') {
    const { error } = await supabase.from(tabla).update(payload).eq('id', payload.id)
    if (error) throw error
  } else if (operacion === 'delete') {
    const { error } = await supabase.from(tabla).delete().eq('id', payload.id)
    if (error) throw error
  }
}

let _syncTimeout = null

async function _updateSyncIndicator() {
  const indicator = document.getElementById('pm-sync-indicator')
  if (!indicator) return

  try {
    const queue = await getQueue()
    if (queue.length === 0) {
      indicator.className  = 'pm-sync-indicator synced'
      indicator.textContent = '✓ Sincronizado'
    } else {
      indicator.className  = 'pm-sync-indicator pending'
      indicator.textContent = `⏳ Pendiente (${queue.length})`
    }
  } catch {
    indicator.className  = 'pm-sync-indicator error'
    indicator.textContent = '⚠️ Error de sync'
  }
}

async function _triggerSync() {
  clearTimeout(_syncTimeout)
  _syncTimeout = setTimeout(async () => {
    if (!navigator.onLine) return
    try {
      await processQueue(_syncWithSupabase)
    } finally {
      await _updateSyncIndicator()
    }
  }, 1000)
}

window.addEventListener('online',  _triggerSync)
window.addEventListener('offline', _updateSyncIndicator)

// ── Shell (estructura persistente) ─────────────────────────

function _renderShell(app, maestro) {
  app.innerHTML = `
    <!-- Header -->
    <header class="pm-header">
      <span class="pm-header-title">
        ${maestro?.nombre_completo?.split(' ')[0] ?? 'Maestro'}
      </span>
      <div class="pm-header-right">
        <span class="pm-sync-indicator synced" id="pm-sync-indicator">✓ Sincronizado</span>
        <button id="pm-btn-perfil" style="background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer;padding:.25rem;" title="Perfil">
          <i class="bi bi-person-circle"></i>
        </button>
      </div>
    </header>

    <!-- Contenido de la vista activa -->
    <main class="pm-view" id="pm-view-container"></main>

    <!-- Bottom nav -->
    <nav class="pm-bottom-nav" id="pm-bottom-nav">
      ${TABS.map(tab => `
        <button class="pm-bottom-tab" data-route="${tab.id}">
          <i class="bi ${tab.icon}"></i>
          <span>${tab.label}</span>
        </button>
      `).join('')}
    </nav>
  `

  // Bootstrap Icons — import dynamically if not already loaded
  if (!document.querySelector('link[href*="bootstrap-icons"]')) {
    const link = document.createElement('link')
    link.rel   = 'stylesheet'
    link.href  = '/node_modules/bootstrap-icons/font/bootstrap-icons.css'
    document.head.appendChild(link)
  }

  _updateSyncIndicator()

  // Bottom nav events
  const bottomNav = document.getElementById('pm-bottom-nav')
  bottomNav.querySelectorAll('.pm-bottom-tab').forEach(tab => {
    tab.addEventListener('click', () => router.navigate(tab.dataset.route))
  })

  document.getElementById('pm-btn-perfil').addEventListener('click', () => {
    router.navigate('perfil')
  })

  // Retry sync on error indicator click
  document.getElementById('pm-sync-indicator').addEventListener('click', async (e) => {
    if (e.target.classList.contains('error')) {
      await _triggerSync()
    }
  })
}

function _setActiveTab(route) {
  document.querySelectorAll('.pm-bottom-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.route === route)
  })
}

// ── Renderizado de vistas ───────────────────────────────────

function _renderView(route) {
  const container = document.getElementById('pm-view-container')
  if (!container) return

  _setActiveTab(route)

  switch (route) {
    case 'calendario':
      renderCalendarioView(container)
      break
    case 'hoy':
      renderHoyView(container)
      break
    case 'metricas':
      renderMetricasView(container)
      break
    case 'perfil':
      container.innerHTML = `<p class="pm-empty">Perfil disponible en F6.</p>`
      break
    default:
      renderCalendarioView(container)
  }
}

// ── Bootstrap ───────────────────────────────────────────────

async function bootstrap() {
  const app = document.getElementById('portal-app')
  if (!app) return

  // 1. Init auth (optimistic load from cache)
  const maestro = await usePortalAuth.init()

  if (!maestro) {
    renderLoginView(app, {
      onSuccess: () => bootstrap()
    })
    return
  }

  // 2. Render shell with navigation
  _renderShell(app, maestro)

  // 3. Configure router
  router.on('calendario', () => _renderView('calendario'))
  router.on('hoy',        () => _renderView('hoy'))
  router.on('metricas',   () => _renderView('metricas'))
  router.on('perfil',     () => _renderView('perfil'))
  router.onNotFound(()   => _renderView('calendario'))

  router.start()

  // 4. Initial sync attempt
  _triggerSync()
}

bootstrap()
