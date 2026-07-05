/**
 * HelpPanel — Panel lateral de ayuda, slide desde la derecha.
 * Diseño minimalista: sin fondos de card, accent line izquierda, tipografía limpia.
 * Singleton. Sin dependencia de Bootstrap JS.
 *
 * Uso:
 *   HelpPanel.open({ title, intro, sections: [{ icon, title, description, color? }] })
 *   HelpPanel.close()
 */

const PANEL_ID   = 'app-help-panel'
const OVERLAY_ID = 'app-help-overlay'

let _stylesInjected = false

function _injectStyles() {
  if (_stylesInjected) return
  _stylesInjected = true
  const s = document.createElement('style')
  s.id = 'app-help-panel-styles'
  s.textContent = `
    /* ── Overlay ─────────────────────────────────────────── */
    #app-help-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.18);
      z-index: 3000;
      opacity: 0;
      transition: opacity 0.22s ease;
    }
    #app-help-overlay.hp-visible { opacity: 1; }

    /* ── Panel ───────────────────────────────────────────── */
    #app-help-panel {
      position: fixed;
      top: 0; right: 0; bottom: 0;
      width: min(380px, 94vw);
      background: var(--bs-body-bg, #fff);
      border-left: 1px solid var(--bs-border-color, #e5e7eb);
      box-shadow: -12px 0 40px rgba(0,0,0,0.08);
      z-index: 3001;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.26s cubic-bezier(0.32,0,0.08,1);
      overflow: hidden;
    }
    #app-help-panel.hp-visible { transform: translateX(0); }

    /* ── Header ──────────────────────────────────────────── */
    #ahp-header {
      display: flex;
      align-items: center;
      padding: 0 1.25rem;
      height: 56px;
      border-bottom: 1px solid var(--bs-border-color, #e5e7eb);
      flex-shrink: 0;
      gap: 0.625rem;
    }
    #ahp-badge {
      width: 26px; height: 26px;
      border-radius: 50%;
      border: 1.5px solid var(--bs-border-color, #d1d5db);
      display: flex; align-items: center; justify-content: center;
      color: var(--bs-secondary-color, #6b7280);
      font-size: 0.78rem;
      flex-shrink: 0;
    }
    #ahp-title {
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: var(--bs-body-color, #111827);
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #ahp-close {
      background: none; border: none; cursor: pointer;
      width: 28px; height: 28px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      color: var(--bs-secondary-color, #9ca3af);
      transition: background 0.12s, color 0.12s;
      flex-shrink: 0;
    }
    #ahp-close:hover {
      background: var(--bs-tertiary-bg, #f3f4f6);
      color: var(--bs-body-color, #374151);
    }

    /* ── Body ────────────────────────────────────────────── */
    #ahp-body {
      overflow-y: auto;
      padding: 1.5rem 1.25rem 2rem;
      flex: 1;
    }
    #ahp-body::-webkit-scrollbar { width: 4px; }
    #ahp-body::-webkit-scrollbar-track { background: transparent; }
    #ahp-body::-webkit-scrollbar-thumb { background: var(--bs-border-color, #d1d5db); border-radius: 2px; }

    /* ── Intro ───────────────────────────────────────────── */
    .ahp-intro {
      font-size: 0.8125rem;
      color: var(--bs-secondary-color, #6b7280);
      line-height: 1.65;
      margin: 0 0 1.5rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--bs-border-color, #f0f0f0);
    }

    /* ── Section label ───────────────────────────────────── */
    .ahp-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--bs-tertiary-color, #9ca3af);
      margin-bottom: 0.75rem;
    }

    /* ── Section item ────────────────────────────────────── */
    .ahp-item {
      display: flex;
      gap: 0.875rem;
      padding: 0.875rem 0 0.875rem 0.875rem;
      border-left: 2px solid var(--ahp-accent, #e5e7eb);
      margin-bottom: 0.5rem;
      transition: border-color 0.15s;
    }
    .ahp-item:last-child { margin-bottom: 0; }
    .ahp-item:hover { border-left-color: var(--ahp-accent-hover, #93c5fd); }

    .ahp-item-icon {
      font-size: 0.9rem;
      color: var(--ahp-accent, #6b7280);
      flex-shrink: 0;
      margin-top: 1px;
      width: 16px;
      text-align: center;
    }
    .ahp-item-body {}
    .ahp-item-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--bs-body-color, #111827);
      margin-bottom: 0.2rem;
      line-height: 1.3;
    }
    .ahp-item-desc {
      font-size: 0.77rem;
      color: var(--bs-secondary-color, #6b7280);
      line-height: 1.6;
      margin: 0;
    }

    /* ── Help trigger button (usado en los headers de vistas) */
    .btn-help-trigger {
      width: 28px; height: 28px;
      border-radius: 50%;
      border: 1.5px solid var(--bs-border-color, #d1d5db);
      background: transparent;
      display: inline-flex; align-items: center; justify-content: center;
      color: var(--bs-secondary-color, #9ca3af);
      font-size: 0.75rem;
      cursor: pointer;
      transition: border-color 0.15s, color 0.15s, background 0.15s;
      flex-shrink: 0;
    }
    .btn-help-trigger:hover {
      border-color: var(--bs-primary, #3b82f6);
      color: var(--bs-primary, #3b82f6);
      background: var(--bs-primary-bg-subtle, #eff6ff);
    }
  `
  document.head.appendChild(s)
}

function _ensureDOM() {
  if (document.getElementById(PANEL_ID)) return
  _injectStyles()

  const overlay = document.createElement('div')
  overlay.id = OVERLAY_ID
  document.body.appendChild(overlay)

  const panel = document.createElement('div')
  panel.id = PANEL_ID
  panel.setAttribute('role', 'complementary')
  panel.setAttribute('aria-label', 'Ayuda')
  panel.innerHTML = `
    <div id="ahp-header">
      <div id="ahp-badge"><i class="bi bi-question"></i></div>
      <span id="ahp-title">Ayuda</span>
      <button id="ahp-close" aria-label="Cerrar">
        <i class="bi bi-x" style="font-size:1.1rem;"></i>
      </button>
    </div>
    <div id="ahp-body"></div>
  `
  document.body.appendChild(panel)

  overlay.addEventListener('click', () => HelpPanel.close())
  panel.querySelector('#ahp-close').addEventListener('click', () => HelpPanel.close())
  document.addEventListener('keydown', e => { if (e.key === 'Escape') HelpPanel.close() })
}

export const HelpPanel = {
  /**
   * @param {{ title: string, intro: string, sections: Array<{icon:string, title:string, description:string, color?:string}> }} config
   */
  open({ title, intro, sections = [] }) {
    _ensureDOM()

    const panel   = document.getElementById(PANEL_ID)
    const overlay = document.getElementById(OVERLAY_ID)

    document.getElementById('ahp-title').textContent = title || 'Ayuda'
    document.getElementById('ahp-body').innerHTML = `
      ${intro ? `<p class="ahp-intro">${intro}</p>` : ''}
      ${sections.length ? `<div class="ahp-label">En esta pantalla</div>` : ''}
      ${sections.map(s => {
        const accent      = s.color || '#6b7280'
        const accentLight = s.color ? s.color + '60' : '#d1d5db'
        return `
          <div class="ahp-item" style="--ahp-accent:${accent};--ahp-accent-hover:${accentLight};">
            <i class="bi ${s.icon || 'bi-dot'} ahp-item-icon" style="color:${accent};"></i>
            <div class="ahp-item-body">
              <div class="ahp-item-title">${s.title}</div>
              <p class="ahp-item-desc">${s.description}</p>
            </div>
          </div>`
      }).join('')}
    `

    overlay.style.display = 'block'
    requestAnimationFrame(() => {
      overlay.classList.add('hp-visible')
      panel.classList.add('hp-visible')
    })
  },

  close() {
    const panel   = document.getElementById(PANEL_ID)
    const overlay = document.getElementById(OVERLAY_ID)
    if (!panel || !panel.classList.contains('hp-visible')) return
    panel.classList.remove('hp-visible')
    overlay.classList.remove('hp-visible')
    setTimeout(() => { if (overlay) overlay.style.display = 'none' }, 280)
  }
}
