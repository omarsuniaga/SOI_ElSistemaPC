/**
 * Admin Ausencias Insights — Smart Insights bar para el portal Admin
 *
 * Muestra un banner flotante cuando hay solicitudes de ausencia pendientes
 * de aprobación. Diseñado para igualar la experiencia de Smart Insights
 * del portal de maestros (glassmorphism, Dynamic Island style).
 *
 * Uso:
 *   import { adminAusenciasInsights } from './adminAusenciasInsights.js'
 *   adminAusenciasInsights.init()       // una vez al montar el shell
 *   adminAusenciasInsights.evaluate()   // llamar en cada cambio de ruta
 */

import { obtenerAusenciasPendientes } from '../api/ausenciaAprobacionApi.js'

// ── DOM refs ───────────────────────────────────────────────────────────────
let _bannerEl = null
let _evaluating = false

// ── Tipos legibles ─────────────────────────────────────────────────────────
const TIPO_LABELS = {
  enfermedad:    'Médica',
  personal:      'Personal',
  capacitacion:  'Capacitación',
  vacaciones:    'Vacaciones',
  otro:          'Otro',
}

// ── Utilidades ─────────────────────────────────────────────────────────────
function _formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function _urgIcon(urg) {
  if (urg === 'alta')  return '<i class="bi bi-exclamation-circle-fill" style="color:#ef4444"></i>'
  if (urg === 'media') return '<i class="bi bi-exclamation-circle-fill" style="color:#f59e0b"></i>'
  return '<i class="bi bi-info-circle-fill" style="color:#22c55e"></i>'
}

// ── Estilos inline ─────────────────────────────────────────────────────────
function _injectStyles() {
  if (document.getElementById('admin-ausencias-insights-styles')) return

  const style = document.createElement('style')
  style.id = 'admin-ausencias-insights-styles'
  style.textContent = `
    /* ── Admin Ausencias Insights Banner ── */
    #admin-ausencias-insights {
      position: fixed;
      top: 1rem;
      left: 50%;
      transform: translateX(-50%) translateY(-120%);
      z-index: 1080;
      width: min(92vw, 500px);
      background: rgba(30, 30, 46, 0.82);
      backdrop-filter: blur(20px) saturate(1.8);
      -webkit-backdrop-filter: blur(20px) saturate(1.8);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 1.25rem;
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.35),
        0 1px 0 rgba(255,255,255,0.08) inset;
      padding: 0.85rem 1rem;
      transition: transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1),
                  opacity 0.28s ease;
      opacity: 0;
      pointer-events: none;
      color: #f0f0f5;
    }

    [data-bs-theme="light"] #admin-ausencias-insights,
    [data-portal-theme="light"] #admin-ausencias-insights {
      background: rgba(255, 255, 255, 0.88);
      border-color: rgba(0,0,0,0.1);
      color: #1a1a2e;
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.15),
        0 1px 0 rgba(255,255,255,0.6) inset;
    }

    #admin-ausencias-insights.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    .aai-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .aai-icon-wrap {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .aai-icon-wrap i {
      font-size: 1.1rem;
      color: #ef4444;
    }

    .aai-body {
      flex: 1;
      min-width: 0;
    }

    .aai-title {
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .aai-sub {
      font-size: 0.74rem;
      opacity: 0.72;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .aai-badge {
      background: #ef4444;
      color: #fff;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15em 0.55em;
      min-width: 1.4rem;
      text-align: center;
      flex-shrink: 0;
    }

    .aai-actions {
      display: flex;
      gap: 0.45rem;
      align-items: center;
    }

    .aai-btn-revisar {
      background: #ef4444;
      color: #fff;
      border: none;
      border-radius: 999px;
      padding: 0.32rem 0.9rem;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.18s;
      white-space: nowrap;
    }
    .aai-btn-revisar:hover { background: #dc2626; }

    .aai-btn-dismiss {
      background: transparent;
      border: none;
      color: inherit;
      opacity: 0.45;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.2rem;
      line-height: 1;
      transition: opacity 0.18s;
    }
    .aai-btn-dismiss:hover { opacity: 0.85; }

    /* Preview list for single request */
    .aai-preview {
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    [data-bs-theme="light"] .aai-preview,
    [data-portal-theme="light"] .aai-preview {
      border-color: rgba(0,0,0,0.1);
    }

    .aai-preview-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.76rem;
    }

    .aai-chip {
      background: rgba(255,255,255,0.1);
      border-radius: 999px;
      padding: 0.1em 0.6em;
      font-size: 0.7rem;
      font-weight: 500;
    }

    [data-bs-theme="light"] .aai-chip,
    [data-portal-theme="light"] .aai-chip {
      background: rgba(0,0,0,0.07);
    }

    /* ── Nav badge ── */
    .aai-nav-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: #ef4444;
      color: #fff;
      border-radius: 999px;
      font-size: 0.6rem;
      font-weight: 700;
      min-width: 1.1rem;
      height: 1.1rem;
      padding: 0 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      pointer-events: none;
      z-index: 10;
    }

    /* Sidebar link needs relative positioning for badge */
    .pm-sidebar-link[data-route="admin-ausencias"],
    .pm-nav-tab[data-route="admin-ausencias"],
    .pm-sidebar-link[data-route="admin-notificaciones"],
    .pm-nav-tab[data-route="admin-notificaciones"] {
      position: relative;
    }
  `
  document.head.appendChild(style)
}

// ── Badge en nav tabs ─────────────────────────────────────────────────────
function _updateNavBadge(count) {
  // Aplica badge a ausencias Y al Centro de Actividad
  document.querySelectorAll('[data-route="admin-ausencias"],[data-route="admin-notificaciones"]').forEach(el => {
    let badge = el.querySelector('.aai-nav-badge')

    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span')
        badge.className = 'aai-nav-badge'
        el.appendChild(badge)
      }
      badge.textContent = count > 99 ? '99+' : String(count)
      badge.style.display = 'flex'
    } else {
      if (badge) badge.style.display = 'none'
    }
  })
}

// ── Crear o recuperar el elemento del banner ──────────────────────────────
function _getOrCreateBanner() {
  if (_bannerEl) return _bannerEl

  _bannerEl = document.createElement('div')
  _bannerEl.id = 'admin-ausencias-insights'
  _bannerEl.setAttribute('role', 'status')
  _bannerEl.setAttribute('aria-live', 'polite')
  document.body.appendChild(_bannerEl)
  return _bannerEl
}

// ── Renderizar contenido del banner ───────────────────────────────────────
function _renderBanner(ausencias) {
  const el = _getOrCreateBanner()
  const count = ausencias.length
  const first = ausencias[0]

  const previewHTML = count === 1 && first ? `
    <div class="aai-preview">
      <div class="aai-preview-row">
        ${_urgIcon(first.urgencia)}
        <span>${first.maestros?.nombre_completo ?? 'Maestro'}</span>
        <span class="aai-chip">${TIPO_LABELS[first.tipo_ausencia] ?? first.tipo_ausencia ?? '—'}</span>
        <span style="opacity:.7">${_formatDate(first.fecha_inicio)}${first.fecha_fin && first.fecha_fin !== first.fecha_inicio ? ' → ' + _formatDate(first.fecha_fin) : ''}</span>
      </div>
    </div>
  ` : ''

  const subtitle = count === 1
    ? 'Hay una solicitud esperando tu decisión'
    : `${count} maestros esperan tu aprobación`

  el.innerHTML = `
    <div class="aai-row">
      <div class="aai-icon-wrap">
        <i class="bi bi-calendar-x-fill"></i>
      </div>
      <div class="aai-body">
        <div class="aai-title">
          Solicitudes de Ausencia
          <span class="aai-badge">${count}</span>
        </div>
        <div class="aai-sub">${subtitle}</div>
      </div>
      <div class="aai-actions">
        <button class="aai-btn-revisar" id="aai-btn-revisar">
          <i class="bi bi-eye"></i> Revisar
        </button>
        <button class="aai-btn-dismiss" id="aai-btn-dismiss" title="Ocultar" aria-label="Ocultar alerta">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
    ${previewHTML}
  `

  // Mostrar
  requestAnimationFrame(() => {
    el.classList.add('visible')
  })

  // Evento Revisar
  el.querySelector('#aai-btn-revisar')?.addEventListener('click', () => {
    _hideBanner()
    if (window.router) window.router.navigate('admin-ausencias')
  })

  // Evento Ocultar (dismissal temporal de 30 min)
  el.querySelector('#aai-btn-dismiss')?.addEventListener('click', () => {
    _dismissBanner()
  })
}

function _hideBanner() {
  if (!_bannerEl) return
  _bannerEl.classList.remove('visible')
}

function _dismissBanner() {
  _hideBanner()
  // Suprimir por 30 minutos
  const expires = Date.now() + 30 * 60 * 1000
  localStorage.setItem('admin-ausencias-insights-dismiss', String(expires))
}

function _isDismissed() {
  const raw = localStorage.getItem('admin-ausencias-insights-dismiss')
  if (!raw) return false
  return Date.now() < Number(raw)
}

// ── API pública ────────────────────────────────────────────────────────────
export const adminAusenciasInsights = {

  init() {
    window.adminAusenciasInsights = this
    _injectStyles()
    _getOrCreateBanner()
    this.evaluate()
  },

  async evaluate() {
    if (_evaluating) return
    _evaluating = true

    try {
      // Si el admin está mirando admin-ausencias no molestamos con el banner,
      // pero sí actualizamos el badge
      const currentRoute = (window.router?.currentRoute?.() ?? '').split('?')[0]
      if (currentRoute === 'admin-ausencias') {
        _hideBanner()
        // Aun así actualizamos el badge con el conteo real
        const pending = await obtenerAusenciasPendientes()
        _updateNavBadge(pending?.length ?? 0)
        return
      }

      if (_isDismissed()) return

      const ausencias = await obtenerAusenciasPendientes()

      // El badge en el nav siempre refleja el conteo real (incluso si el banner está dismissed)
      _updateNavBadge(ausencias?.length ?? 0)

      if (!ausencias || ausencias.length === 0) {
        _hideBanner()
        return
      }

      _renderBanner(ausencias)
    } catch (err) {
      // Silencioso — no interrumpir el flujo del admin
      console.warn('[adminAusenciasInsights] Error evaluando:', err)
      _hideBanner()
    } finally {
      _evaluating = false
    }
  },
}
