/**
 * SOI Smart Insights Bar — Cápsula Superior de Alertas Contextuales
 *
 * Comportamiento:
 * - Evalúa dinámicamente tareas pendientes y recordatorios críticos para el docente.
 * - Flota de forma premium estilo Dynamic Island/iOS con glassmorphism, sin empujar el layout.
 * - Soporta desestimación selectiva por 7 días en localStorage.
 * - Preserva las guías de instalación manuales y nativas para el botón del header.
 */

import { getMaestroLocal } from '../auth/maestroAuth.js'
import { getSesiones, getMisClases } from '../services/maestroDataService.js'

let deferredPrompt = null
let smartBannerEl = null
let guideModalEl = null

export const pwaInstaller = {
  init() {
    window.pwaInstaller = this
    this._injectStyles()

    // Capturar el prompt de instalación nativo para el botón del header
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
    })

    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwa-installed', 'true')
      deferredPrompt = null
    })
  },

  // ── Motor de Evaluación de Insights / Alertas ──────────────────────────────

  async evaluateInsights() {
    const maestro = getMaestroLocal()
    if (!maestro?.id) return

    try {
      // 1. Obtener datos clave en paralelo (aprovechando la cache en memoria)
      const misClases = await getMisClases()

      const hoy = new Date()
      const sieteDiasAgo = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000)
      const hasta = hoy.toISOString().split('T')[0]
      const desde = sieteDiasAgo.toISOString().split('T')[0]

      const sesiones = await getSesiones(maestro.id, desde, hasta)

      // 2. Definir y evaluar alertas en orden de prioridad (Alta -> Media -> Baja)
      const activeAlerts = []

      // A. ALTA: Clases en borrador (pendientes de guardar)
      const borradores = (sesiones || []).filter((s) => s.borrador === true)
      if (borradores.length > 0) {
        const classMap = Object.fromEntries((misClases || []).map((c) => [c.id, c.nombre]))

        if (borradores.length === 1) {
          const s = borradores[0]
          const className = classMap[s.clase_id] || 'Clase'
          const formattedDate = s.fecha ? s.fecha.split('-').reverse().slice(0, 2).join('/') : ''
          const dateStr = formattedDate ? ` del ${formattedDate}` : ''

          activeAlerts.push({
            id: 'draft-sessions',
            priority: 'high',
            icon: 'bi-exclamation-triangle-fill',
            text: `Tienes el registro de ${className}${dateStr} en borrador.`,
            actionLabel: 'Revisar',
            action: () => {
              if (window.router)
                window.router.navigate(`asistencia?clase=${s.clase_id}&fecha=${s.fecha}`)
            },
          })
        } else {
          // Si hay múltiples borradores, mostrar el contador general pero llevar al primero
          const s = borradores[0]
          activeAlerts.push({
            id: 'draft-sessions',
            priority: 'high',
            icon: 'bi-exclamation-triangle-fill',
            text: `Tienes ${borradores.length} registros de clase en borrador.`,
            actionLabel: 'Revisar',
            action: () => {
              if (window.router)
                window.router.navigate(`asistencia?clase=${s.clase_id}&fecha=${s.fecha}`)
            },
          })
        }
      }

      // B. ALTA: Sesiones pasadas sin asistencia registrada (últimos 7 días, excluye hoy)
      const claseIds = new Set((misClases || []).map((c) => c.id))
      const sinRegistrar = (sesiones || []).filter((s) => {
        if (s.fecha >= hasta) return false // excluir hoy y futuro
        if (!claseIds.has(s.clase_id)) return false
        const tieneAsistencia = Array.isArray(s.asistencia) && s.asistencia.length > 0
        const tieneContenido = typeof s.contenido === 'string' && s.contenido.trim().length > 0
        return !tieneAsistencia && !(s.borrador === false && tieneContenido)
      })

      if (sinRegistrar.length > 0) {
        const classMap = Object.fromEntries((misClases || []).map((c) => [c.id, c.nombre]))
        const primera = sinRegistrar[0]
        const nombreClase = classMap[primera.clase_id] || 'Clase'
        const fechaCorta = primera.fecha
          ? primera.fecha.split('-').reverse().slice(0, 2).join('/')
          : ''

        activeAlerts.push({
          id: 'sessions-without-attendance',
          priority: 'high',
          icon: 'bi-clipboard-x-fill',
          text:
            sinRegistrar.length === 1
              ? `${nombreClase} del ${fechaCorta} quedó sin registrar asistencia.`
              : `Tienes ${sinRegistrar.length} clases sin asistencia registrada esta semana.`,
          actionLabel: 'Registrar',
          action: () => {
            if (window.router)
              window.router.navigate(`asistencia?clase=${primera.clase_id}&fecha=${primera.fecha}`)
          },
        })
      }

      // D. MEDIA: Perfil incompleto (falta teléfono)
      const tieneTelefono = maestro.telefono || maestro.tlf
      if (!tieneTelefono) {
        activeAlerts.push({
          id: 'profile-incomplete',
          priority: 'medium',
          icon: 'bi-person-exclamation',
          text: 'Completa tu número de teléfono en tu perfil de usuario.',
          actionLabel: 'Completar',
          action: () => {
            if (window.router) window.router.navigate('perfil')
          },
        })
      }

      // E. MEDIA: PWA instalable no instalada
      if (deferredPrompt !== null && !this._isStandalone()) {
        activeAlerts.push({
          id: 'pwa-install-prompt',
          priority: 'medium',
          icon: 'bi-download',
          text: 'Instala SOI Maestros en tu pantalla de inicio para acceso rápido sin conexión.',
          actionLabel: 'Instalar',
          action: () => {
            this.promptInstall()
          },
        })
      }

      // F. BAJA: Sin clases asignadas
      if (!misClases || misClases.length === 0) {
        activeAlerts.push({
          id: 'no-classes-assigned',
          priority: 'low',
          icon: 'bi-info-circle-fill',
          text: 'No tienes clases asignadas en el sistema actualmente.',
          actionLabel: 'Soporte',
          action: () => {
            if (window.router) window.router.navigate('perfil')
          },
        })
      }

      // 3. Filtrar alertas desestimadas en localStorage (duración: 7 días)
      const validAlerts = activeAlerts.filter((alert) => {
        const dismissedTime = localStorage.getItem(`soi-dismissed-${alert.id}`)
        if (!dismissedTime) return true

        const diff = Date.now() - parseInt(dismissedTime, 10)
        const sieteDiasMs = 7 * 24 * 60 * 60 * 1000
        return diff > sieteDiasMs // Retornar true solo si ya pasaron los 7 días
      })

      // 4. Renderizar la alerta de mayor prioridad
      if (validAlerts.length > 0) {
        const nextAlert = validAlerts[0]
        if (this.currentAlertId === nextAlert.id && this.currentAlertText === nextAlert.text) {
          // Si es la misma alerta y el mismo texto, mantenerla sin cambios ni parpadeos
          return
        }
        this._showInsightBanner(nextAlert)
      } else {
        this.dismissBanner()
      }
    } catch (err) {
      console.warn('[SmartInsights] Error al evaluar alertas:', err)
    }
  },

  // ── Renderizado de la Cápsula Flotante (Dynamic Island style) ───────────────

  _showInsightBanner(alert) {
    // Si ya existe el banner y es otra alerta, hacer transición en lugar de destruir y recrear
    const existingBanner = document.getElementById('pwa-smart-banner') || smartBannerEl
    if (existingBanner) {
      const capsuleEl = existingBanner.querySelector('.psb-capsule')
      if (capsuleEl) {
        capsuleEl.style.transition = 'opacity 0.2s ease'
        capsuleEl.style.opacity = '0'

        setTimeout(() => {
          const dotEl = capsuleEl.querySelector('.psb-severity-dot')
          if (dotEl) {
            dotEl.className = `psb-severity-dot ${alert.priority}`
            dotEl.innerHTML = `<i class="bi ${alert.icon}"></i>`
          }
          const titleEl = capsuleEl.querySelector('.psb-title')
          if (titleEl) {
            titleEl.textContent = alert.text
          }
          const actionBtn = capsuleEl.querySelector('#pwa-banner-action')
          if (actionBtn) {
            actionBtn.innerHTML = `<span>${alert.actionLabel}</span>`
            const newActionBtn = actionBtn.cloneNode(true)
            actionBtn.parentNode.replaceChild(newActionBtn, actionBtn)
            newActionBtn.addEventListener('click', () => {
              alert.action()
            })
          }

          const closeBtn = capsuleEl.querySelector('#pwa-banner-close')
          if (closeBtn) {
            const newCloseBtn = closeBtn.cloneNode(true)
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn)
            newCloseBtn.addEventListener('click', () => {
              localStorage.setItem(`soi-dismissed-${alert.id}`, Date.now().toString())
              this.dismissBanner()
            })
          }

          this.currentAlertId = alert.id
          this.currentAlertText = alert.text
          capsuleEl.style.opacity = '1'
        }, 200)
        return
      }
    }

    smartBannerEl = document.createElement('div')
    smartBannerEl.id = 'pwa-smart-banner'
    smartBannerEl.setAttribute('role', 'status')
    smartBannerEl.setAttribute('aria-live', 'polite')
    smartBannerEl.innerHTML = `
      <div class="psb-capsule" style="opacity: 1;">
        <div class="psb-severity-dot ${alert.priority}">
          <i class="bi ${alert.icon}"></i>
        </div>
        <div class="psb-info">
          <span class="psb-title">${alert.text}</span>
        </div>
        <button class="psb-action" id="pwa-banner-action">
          <span>${alert.actionLabel}</span>
        </button>
        <button class="psb-close" id="pwa-banner-close" aria-label="Cerrar aviso">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `

    document.body.prepend(smartBannerEl)
    this.currentAlertId = alert.id
    this.currentAlertText = alert.text

    // Animación de entrada fluida amortiguada
    requestAnimationFrame(() => {
      requestAnimationFrame(() => smartBannerEl?.classList.add('psb-visible'))
    })

    document.getElementById('pwa-banner-action').addEventListener('click', () => {
      alert.action()
    })

    document.getElementById('pwa-banner-close').addEventListener('click', () => {
      // Guardar descarte en localStorage
      localStorage.setItem(`soi-dismissed-${alert.id}`, Date.now().toString())
      this.dismissBanner()
    })
  },

  dismissBanner() {
    this.currentAlertId = null
    this.currentAlertText = null
    if (!smartBannerEl) return
    smartBannerEl.classList.remove('psb-visible')
    const el = smartBannerEl
    smartBannerEl = null
    setTimeout(() => {
      el.remove()
    }, 400)
  },

  // ── Public API (Guías e Instalación del Header) ──────────────────────────────

  promptInstall() {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      this._showIOSGuide()
    } else if (deferredPrompt) {
      this._triggerNativeInstall()
    } else {
      this._showDesktopGuide()
    }
  },

  async _triggerNativeInstall() {
    if (!deferredPrompt) {
      this._showDesktopGuide()
      return
    }
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true')
      }
    } catch (err) {
      console.warn('[PWA] Error al mostrar prompt:', err)
    } finally {
      deferredPrompt = null
    }
  },

  _showIOSGuide() {
    if (guideModalEl) return
    guideModalEl = document.createElement('div')
    guideModalEl.id = 'pwa-guide-modal'
    guideModalEl.innerHTML = `
      <div class="pgm-overlay" id="pgm-overlay">
        <div class="pgm-card" role="dialog" aria-modal="true" aria-labelledby="pgm-title">
          <div class="pgm-icon-wrap">
            <i class="bi bi-phone"></i>
          </div>
          <h3 id="pgm-title">Instalar en iPhone / iPad</h3>
          <p class="pgm-subtitle">Añadí SOI Maestros a tu pantalla de inicio</p>
          <ol class="pgm-steps">
            <li>
              <span class="pgm-step-num">1</span>
              <span>Toca el botón <strong>Compartir</strong> <i class="bi bi-box-arrow-up"></i> en la barra inferior de Safari</span>
            </li>
            <li>
              <span class="pgm-step-num">2</span>
              <span>Desliza hacia abajo y toca <strong>"Añadir a pantalla de inicio"</strong></span>
            </li>
            <li>
              <span class="pgm-step-num">3</span>
              <span>Presiona <strong>Añadir</strong> — la app aparecerá como un ícono nativo</span>
            </li>
          </ol>
          <button class="pgm-btn" id="pgm-close">Entendido</button>
        </div>
      </div>
    `
    document.body.appendChild(guideModalEl)

    const close = () => {
      guideModalEl?.classList.add('pgm-hiding')
      setTimeout(() => {
        guideModalEl?.remove()
        guideModalEl = null
      }, 300)
    }

    document.getElementById('pgm-close').addEventListener('click', close)
    document.getElementById('pgm-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'pgm-overlay') close()
    })
  },

  _showDesktopGuide() {
    if (guideModalEl) return
    guideModalEl = document.createElement('div')
    guideModalEl.id = 'pwa-guide-modal'
    guideModalEl.innerHTML = `
      <div class="pgm-overlay" id="pgm-overlay">
        <div class="pgm-card" role="dialog" aria-modal="true" aria-labelledby="pgm-title">
          <div class="pgm-icon-wrap">
            <i class="bi bi-display"></i>
          </div>
          <h3 id="pgm-title">Instalar como App de Escritorio</h3>
          <p class="pgm-subtitle">Accede sin el navegador, como una app nativa</p>
          <ol class="pgm-steps">
            <li>
              <span class="pgm-step-num">1</span>
              <span>En la barra de Chrome busca el ícono <strong>"Instalar aplicación"</strong> (ícono de pantalla con flecha)</span>
            </li>
            <li>
              <span class="pgm-step-num">2</span>
              <span>En <strong>Edge</strong>: Menú ⋯ → Apps → Instalar este sitio como app</span>
            </li>
            <li>
              <span class="pgm-step-num">3</span>
              <span>Confirma la instalación — SOI Maestros quedará en tu escritorio y barra de tareas</span>
            </li>
          </ol>
          <button class="pgm-btn" id="pgm-close">Entendido</button>
        </div>
      </div>
    `
    document.body.appendChild(guideModalEl)

    const close = () => {
      guideModalEl?.classList.add('pgm-hiding')
      setTimeout(() => {
        guideModalEl?.remove()
        guideModalEl = null
      }, 300)
    }

    document.getElementById('pgm-close').addEventListener('click', close)
    document.getElementById('pgm-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'pgm-overlay') close()
    })
  },

  _isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      localStorage.getItem('pwa-installed') === 'true'
    )
  },

  // ── Estilos ─────────────────────────────────────────────────────────────────

  _injectStyles() {
    if (document.getElementById('pwa-installer-styles')) return
    const style = document.createElement('style')
    style.id = 'pwa-installer-styles'
    style.textContent = `
      /* ── SOI Smart Insights Banner (Inline above Header) ── */
      #pwa-smart-banner {
        position: relative;
        width: 100%;
        z-index: 10000;
        opacity: 0;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease, opacity 0.3s ease;
      }

      #pwa-smart-banner.psb-visible {
        opacity: 1;
        max-height: 80px;
      }

      .psb-capsule {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        background: #f5f5f7;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        min-height: 48px;
      }

      /* Dark mode styles for capsule */
      [data-portal-theme="dark"] .psb-capsule,
      [data-bs-theme="dark"] .psb-capsule {
        background: rgba(30, 41, 59, 0.88);
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }

      .psb-severity-dot {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .psb-severity-dot.high {
        background: rgba(255, 59, 48, 0.15);
        color: #ff3b30;
      }

      .psb-severity-dot.medium {
        background: rgba(255, 149, 0, 0.15);
        color: #ff9500;
      }

      .psb-severity-dot.low {
        background: rgba(9, 132, 227, 0.15);
        color: #0984e3;
      }

      .psb-severity-dot i {
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .psb-info {
        flex: 1;
        min-width: 0;
      }

      .psb-title {
        font-size: 13px;
        font-weight: 600;
        color: #1d1d1f;
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* Dark mode text */
      [data-portal-theme="dark"] .psb-title,
      [data-bs-theme="dark"] .psb-title {
        color: #f1f5f9;
      }

      .psb-action {
        background: var(--pm-primary, #5856D6);
        color: white !important;
        border: none;
        border-radius: 16px;
        padding: 5px 12px;
        font-size: 11.5px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.2s, transform 0.1s;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .psb-action:hover {
        background: #4745b4;
        transform: translateY(-0.5px);
      }

      .psb-action:active {
        transform: scale(0.96);
      }

      .psb-close {
        background: transparent;
        border: none;
        color: #86868b;
        font-size: 16px;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
        flex-shrink: 0;
      }

      .psb-close:hover {
        color: #1d1d1f;
      }

      [data-portal-theme="dark"] .psb-close:hover,
      [data-bs-theme="dark"] .psb-close:hover {
        color: #ffffff;
      }

      /* ── Guide Modal ───────────────────────────────── */
      #pwa-guide-modal .pgm-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        z-index: 10001;
        padding: 16px;
        animation: pgm-fade-in 0.25s ease;
      }

      #pwa-guide-modal.pgm-hiding .pgm-overlay {
        animation: pgm-fade-out 0.3s ease forwards;
      }

      @keyframes pgm-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes pgm-fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      #pwa-guide-modal .pgm-card {
        background: rgba(22, 22, 30, 0.97);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px 24px 16px 16px;
        padding: 28px 24px 24px;
        max-width: 420px;
        width: 100%;
        text-align: center;
        animation: pgm-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 -4px 40px rgba(0, 0, 0, 0.4);
      }

      #pwa-guide-modal.pgm-hiding .pgm-card {
        animation: pgm-slide-down 0.3s ease forwards;
      }

      @keyframes pgm-slide-up {
        from { transform: translateY(40px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      @keyframes pgm-slide-down {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(40px); opacity: 0; }
      }

      .pgm-icon-wrap {
        width: 64px;
        height: 64px;
        margin: 0 auto 16px;
        background: linear-gradient(135deg, #5856D6, #7C7AE6);
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(88, 86, 214, 0.4);
      }

      .pgm-icon-wrap i {
        font-size: 28px;
        color: white;
      }

      #pwa-guide-modal h3 {
        margin: 0 0 6px;
        font-size: 18px;
        font-weight: 700;
        color: #fff;
      }

      .pgm-subtitle {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.5);
        margin: 0 0 20px;
      }

      .pgm-steps {
        list-style: none;
        padding: 0;
        margin: 0 0 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        text-align: left;
      }

      .pgm-steps li {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 13.5px;
        color: rgba(255, 255, 255, 0.75);
        line-height: 1.5;
      }

      .pgm-step-num {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: rgba(88, 86, 214, 0.3);
        border: 1px solid rgba(88, 86, 214, 0.6);
        color: #7C7AE6;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 1px;
      }

      .pgm-steps strong {
        color: #fff;
      }

      .pgm-btn {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #5856D6, #7C7AE6);
        color: white;
        border: none;
        border-radius: 14px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 4px 16px rgba(88, 86, 214, 0.35);
      }

      .pgm-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 24px rgba(88, 86, 214, 0.5);
      }

      .pgm-btn:active {
        transform: scale(0.98);
      }

      /* Desktop: centrar el modal */
      @media (min-width: 600px) {
        #pwa-guide-modal .pgm-overlay {
          align-items: center;
        }
        #pwa-guide-modal .pgm-card {
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
      }
    `
    document.head.appendChild(style)
  },
}

// Auto-inicializar al cargar el módulo para capturar antes de la carga completa
pwaInstaller.init()
