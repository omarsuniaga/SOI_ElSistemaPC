/**
 * portalShell.js
 * Responsabilidad: Renderizar y gestionar el shell persistente del portal
 * (sidebar, header, footer nav, search, breakpoints).
 */

import { themeToggle } from '../components/themeToggle.js'
import { notificacionesPanel } from '../components/notificacionesPanel.js'
import { getAlumnoIndexFromMetricas } from '../views/metricasView.js'
import { supabase } from '../../lib/supabaseClient.js'

let _currentBreakpoint = getBreakpoint()

export function getBreakpoint() {
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

window.addEventListener(
  'resize',
  () => {
    const next = getBreakpoint()
    if (next !== _currentBreakpoint) {
      _currentBreakpoint = next
      document.body.dataset.pmLayout = next
    }
  },
  { passive: true },
)

export function hideShell() {
  const app = document.getElementById('portal-app')
  if (!app) return
  const header = app.querySelector('.pm-header')
  const nav = app.querySelector('.pm-bottom-nav')
  const view = app.querySelector('.pm-view')
  if (header) header.style.display = 'none'
  if (nav) nav.style.display = 'none'
  if (view) view.style.display = 'none'
}

export function showShell() {
  const app = document.getElementById('portal-app')
  if (!app) return
  const header = app.querySelector('.pm-header')
  const nav = app.querySelector('.pm-bottom-nav')
  const view = app.querySelector('.pm-view')
  if (header) header.style.display = ''
  if (nav) nav.style.display = ''
  if (view) view.style.display = ''
}

export function setActiveTab(route) {
  document.querySelectorAll('.pm-nav-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.route === route)
  })
  document.querySelectorAll('.pm-sidebar-link').forEach((link) => {
    link.classList.toggle('active', link.dataset.route === route)
  })
}

export function renderShell(app, maestro, tabs, isAdmin, onNavigate, onModoSwitch, updateSyncIndicator) {
  app.innerHTML = `
    <!-- Sidebar (desktop only) -->
    <aside class="pm-sidebar" id="pm-sidebar">
      <div class="pm-sidebar-header">
        <div class="pm-sidebar-logo">
          <i class="bi bi-music-note-beamed"></i>
          <span>SOI</span>
        </div>
      </div>
      <nav class="pm-sidebar-nav">
        ${tabs
          .map(
            (tab) => `
          <a class="pm-sidebar-link" data-route="${tab.id}" title="${tab.label}">
            <i class="bi ${tab.icon}"></i>
            <span>${tab.label}</span>
          </a>
        `,
          )
          .join('')}
      </nav>
      <div class="pm-sidebar-footer">
        <button id="pm-btn-perfil-sidebar" class="pm-sidebar-link" data-route="perfil">
          <i class="bi bi-person-circle"></i>
          <span>Perfil</span>
        </button>
      </div>
    </aside>

    <!-- Main content area -->
    <div class="pm-main-area ${isAdmin ? 'pm-main-area--admin' : ''}">
      <!-- Header -->
      <header class="pm-header" id="pm-header">
        <div class="pm-header-left" id="pm-header-left">
          <span class="pm-header-greeting">${isAdmin ? 'Panel Admin' : 'Portal Maestros'}</span>
          <span class="pm-header-title" style="font-size:clamp(1rem,3.5vw,1.5rem);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:52vw;">
            ${
              isAdmin
                ? (maestro?.nombre_completo ?? 'Administrador')
                : 'Prof. ' + (maestro?.nombre_completo ?? '')
            }
            <span class="pm-online-dot" id="pm-sync-indicator" title="Sincronizado"></span>
          </span>
        </div>

        <!-- Dynamic WhatsApp-Style Search Container -->
        <div class="pm-header-search-container" id="pm-header-search-container">
          <button id="pm-search-back-btn" class="pm-icon-btn pm-search-back-btn" title="Cerrar búsqueda">
            <i class="bi bi-arrow-left"></i>
          </button>
          <div class="pm-header-search" id="pm-header-search">
            <i class="bi bi-search"></i>
            <input type="search" placeholder="Buscar alumno..." id="pm-header-search-input" autocomplete="off" />
          </div>
        </div>

        <!-- Header right controls -->
        <div class="pm-header-right" id="pm-header-right">
          <button id="pm-search-toggle-btn" class="pm-icon-btn pm-search-toggle-btn" title="Buscar alumno">
            <i class="bi bi-search"></i>
          </button>

          ${
            maestro?.es_admin && maestro?.es_maestro
              ? `
            <button id="pm-modo-switcher" title="${isAdmin ? 'Cambiar a vista de maestro' : 'Cambiar a panel admin'}"
              style="display:flex;align-items:center;gap:0.35rem;padding:0.3rem 0.65rem;border-radius:20px;border:1.5px solid var(--pm-primary);background:transparent;color:var(--pm-primary);font-size:0.72rem;font-weight:600;cursor:pointer;white-space:nowrap;">
              <i class="bi ${isAdmin ? 'bi-mortarboard' : 'bi-grid-1x2-fill'}"></i>
              ${isAdmin ? 'Mis clases' : 'Admin'}
            </button>
          `
              : ''
          }

          <div id="pm-theme-toggle-container"></div>

          <button id="pm-bell-btn" class="pm-icon-btn" title="Notificaciones" style="position: relative;">
            <i class="bi bi-bell"></i>
            <span class="pm-ausencias-badge" id="pm-notif-badge" style="display: none; background: var(--pm-danger);">0</span>
          </button>

          <button id="pm-btn-perfil" class="pm-avatar-btn" title="Perfil">
            ${
              maestro?.avatar_url
                ? `<img src="${maestro.avatar_url}" alt="Avatar">`
                : `<i class="bi bi-person-circle"></i>`
            }
          </button>
        </div>
      </header>

      <!-- Contenido de la vista activa -->
      <main class="pm-view" id="pm-view-container"></main>

      <!-- Footer Nav (mobile/tablet only) -->
      <nav class="pm-footer-nav ${isAdmin ? 'pm-footer-nav--admin' : ''}" id="pm-footer-nav">
        <div class="pm-footer-nav__inner">
          ${tabs
            .map(
              (tab) => `
            <button class="pm-nav-tab" data-route="${tab.id}" title="${tab.label}" aria-label="${tab.label}">
              <i class="bi ${tab.icon}"></i>
              <span>${tab.label}</span>
            </button>
          `,
            )
            .join('')}
        </div>
      </nav>
    </div>
  `

  updateSyncIndicator()

  // Theme toggle
  const themeContainer = document.getElementById('pm-theme-toggle-container')
  if (themeContainer) {
    themeContainer.appendChild(themeToggle.createToggleButton())
  }

  // Footer nav events
  document.getElementById('pm-footer-nav')?.querySelectorAll('.pm-nav-tab').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault()
      onNavigate(tab.dataset.route)
    })
  })

  // Sidebar nav events
  document.getElementById('pm-sidebar')?.querySelectorAll('.pm-sidebar-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      onNavigate(link.dataset.route)
    })
  })

  // Modo switcher
  document.getElementById('pm-modo-switcher')?.addEventListener('click', onModoSwitch)

  document.getElementById('pm-btn-perfil').addEventListener('click', (e) => {
    e.preventDefault()
    onNavigate('perfil')
  })

  // Bell / notifications
  document.getElementById('pm-bell-btn')?.addEventListener('click', () => {
    notificacionesPanel.open()
  })

  _initHeaderSearch(onNavigate)
}

function _initHeaderSearch(onNavigate) {
  const headerEl = document.getElementById('pm-header')
  const searchInput = document.getElementById('pm-header-search-input')
  const searchToggleBtn = document.getElementById('pm-search-toggle-btn')
  const searchBackBtn = document.getElementById('pm-search-back-btn')

  const openSearch = () => {
    headerEl?.classList.add('search-active')
    setTimeout(() => searchInput?.focus(), 50)
  }

  const closeSearch = () => {
    headerEl?.classList.remove('search-active')
    if (searchInput) searchInput.value = ''
    document.getElementById('pm-header-search-dropdown')?.remove()
  }

  searchToggleBtn?.addEventListener('click', (e) => { e.stopPropagation(); openSearch() })
  searchBackBtn?.addEventListener('click', (e) => { e.stopPropagation(); closeSearch() })

  let _searchDropdown = null
  let _searchTimer = null

  const removeDropdown = () => { _searchDropdown?.remove(); _searchDropdown = null }

  const showDropdown = (items) => {
    removeDropdown()
    if (!items.length) return
    const dd = document.createElement('div')
    dd.id = 'pm-header-search-dropdown'
    dd.setAttribute('role', 'listbox')
    dd.innerHTML = items
      .map(
        (a) => `
      <div class="pm-hsd-item" role="option" tabindex="0" data-id="${a.id}">
        <i class="bi bi-person-fill pm-hsd-icon"></i>
        <div class="pm-hsd-info">
          <span class="pm-hsd-name">${a.nombre_completo}</span>
          ${a.instrumento_principal ? `<span class="pm-hsd-meta">${a.instrumento_principal}</span>` : ''}
        </div>
        <i class="bi bi-chevron-right pm-hsd-arrow"></i>
      </div>`,
      )
      .join('')
    document.body.appendChild(dd)

    const rect = searchInput.getBoundingClientRect()
    dd.style.cssText = `position:fixed;top:${rect.bottom + 4}px;left:${Math.max(8, rect.left)}px;width:${Math.min(320, window.innerWidth - 16)}px;z-index:9999;background:var(--pm-surface);border:1px solid var(--pm-border);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.18);overflow:hidden;`
    _searchDropdown = dd

    dd.querySelectorAll('.pm-hsd-item').forEach((row) => {
      const go = () => {
        closeSearch()
        removeDropdown()
        onNavigate('alumno', { id: row.dataset.id })
      }
      row.addEventListener('click', go)
      row.addEventListener('keypress', (e) => { if (e.key === 'Enter') go() })
    })
  }

  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.trim()
    clearTimeout(_searchTimer)
    if (q.length < 1) { removeDropdown(); return }

    const localIndex = getAlumnoIndexFromMetricas()
    if (localIndex) {
      const lower = q.toLowerCase()
      const hits = localIndex
        .filter((a) => a.nombre_completo?.toLowerCase().includes(lower))
        .slice(0, 8)
        .map((a) => ({ ...a, instrumento_principal: a.clases?.join(', ') || null }))
      showDropdown(hits)
      return
    }

    _searchTimer = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from('alumnos')
          .select('id, nombre_completo, instrumento_principal')
          .ilike('nombre_completo', `%${q}%`)
          .limit(8)
        showDropdown(data || [])
      } catch { removeDropdown() }
    }, 200)
  })

  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeSearch(); removeDropdown() }
  })

  // Inject dropdown styles once
  if (!document.getElementById('pm-hsd-styles')) {
    const s = document.createElement('style')
    s.id = 'pm-hsd-styles'
    s.textContent = `.pm-hsd-item{display:flex;align-items:center;gap:0.625rem;padding:0.75rem 1rem;cursor:pointer;border-bottom:1px solid var(--pm-border);transition:background 0.1s}.pm-hsd-item:last-child{border-bottom:none}.pm-hsd-item:hover,.pm-hsd-item:focus{background:var(--pm-surface-2);outline:none}.pm-hsd-icon{font-size:1rem;color:var(--pm-primary);flex-shrink:0}.pm-hsd-info{flex:1;min-width:0}.pm-hsd-name{display:block;font-size:0.875rem;font-weight:500;color:var(--pm-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pm-hsd-meta{font-size:0.7rem;color:var(--pm-text-muted)}.pm-hsd-arrow{color:var(--pm-text-muted);font-size:0.75rem}`
    document.head.appendChild(s)
  }

  document.addEventListener('click', (e) => {
    if (!searchInput?.contains(e.target) && !_searchDropdown?.contains(e.target)) {
      removeDropdown()
    }
  })
}
