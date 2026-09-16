/**
 * pwaInstaller — Instalación de la app (PWA).
 *
 * Responsabilidad:
 * - Captura el prompt nativo de instalación (`beforeinstallprompt`).
 * - Ofrece `promptInstall()` y las guías manuales de iOS y escritorio, que usa
 *   el botón "Instalar" de la vista Perfil.
 *
 * La cápsula de avisos contextuales que flotaba sobre la cabecera ("SOI Smart
 * Insights Bar": borradores, clases sin asistencia, perfil incompleto, instalar
 * la app) se retiró a pedido. Acá no se inserta nada en el documento.
 */

let deferredPrompt = null
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
          <p class="pgm-subtitle">Agregue SOI Maestros a su pantalla de inicio</p>
          <ol class="pgm-steps">
            <li>
              <span class="pgm-step-num">1</span>
              <span>Presione el botón <strong>Compartir</strong> <i class="bi bi-box-arrow-up"></i> en la barra inferior de Safari</span>
            </li>
            <li>
              <span class="pgm-step-num">2</span>
              <span>Deslice hacia abajo y seleccione <strong>"Agregar a pantalla de inicio"</strong></span>
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
        font-size: 1.75rem;
        color: white;
      }

      #pwa-guide-modal h3 {
        margin: 0 0 6px;
        font-size: 1.125rem;
        font-weight: 700;
        color: #fff;
      }

      .pgm-subtitle {
        font-size: 0.8125rem;
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
        font-size: 0.84375rem;
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
        font-size: 0.6875rem;
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
        font-size: 1rem;
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
