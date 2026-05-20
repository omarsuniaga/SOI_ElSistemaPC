/**
 * PWA Installer — Smart Banner + Install Prompt
 *
 * Comportamiento:
 * - Si la app ya corre en standalone (instalada) → no muestra nada.
 * - Si el navegador soporta BeforeInstallPromptEvent (Chrome/Edge desktop y Android)
 *   → captura el prompt y muestra el smart banner con botón nativo de instalación.
 * - Si es iOS (Safari) → muestra el smart banner con botón que abre modal de instrucciones manuales.
 * - El banner se muestra SIEMPRE al abrir la app en el navegador.
 *   Solo desaparece si el usuario lo cierra explícitamente (persiste por sesión,
 *   pero vuelve a aparecer en la próxima visita).
 */

let deferredPrompt = null;
let smartBannerEl = null;
let guideModalEl = null;

export const pwaInstaller = {

  init() {
    window.pwaInstaller = this;
    this._injectStyles();

    // Si ya está instalada como PWA standalone, no mostrar nada.
    if (this._isStandalone()) return;

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Escuchar el prompt nativo del navegador (Chrome/Edge desktop y Android)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this._updateBannerButton(); // Actualizar si el banner ya está visible
    });

    window.addEventListener('appinstalled', () => {
      this._dismissBanner(true);
      deferredPrompt = null;
    });

    // Mostrar el smart banner siempre (con pequeño delay para que el layout esté listo)
    setTimeout(() => this._showSmartBanner(), 300);
  },

  // ── Smart Banner (siempre visible en el navegador) ──────────────────────────

  _showSmartBanner() {
    if (smartBannerEl || this._isStandalone()) return;

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    smartBannerEl = document.createElement('div');
    smartBannerEl.id = 'pwa-smart-banner';
    smartBannerEl.setAttribute('role', 'banner');
    smartBannerEl.setAttribute('aria-label', 'Instalar aplicación SOI Maestros');
    smartBannerEl.innerHTML = `
      <div class="psb-content">
        <div class="psb-icon">
          <img src="/icons/icon-192.png" alt="SOI" onerror="this.parentElement.innerHTML='<i class=\\"bi bi-mortarboard-fill psb-icon-fallback\\"></i>'">
        </div>
        <div class="psb-info">
          <strong class="psb-title">SOI Maestros</strong>
          <span class="psb-subtitle">${isMobile ? 'Instala la app · Acceso directo' : 'Abrí como aplicación de escritorio'}</span>
        </div>
        <button class="psb-action" id="pwa-banner-action" aria-label="${isIOS ? 'Ver cómo instalar' : 'Abrir en aplicación'}">
          ${isIOS
            ? `<i class="bi bi-box-arrow-up"></i> <span>Instalar</span>`
            : `<i class="bi bi-window-plus"></i> <span>Abrir en aplicación</span>`
          }
        </button>
        <button class="psb-close" id="pwa-banner-close" aria-label="Cerrar aviso">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `;

    // Insertar al inicio del body para que quede ARRIBA de todo
    document.body.prepend(smartBannerEl);

    // Ajustar el contenido principal para no quedar tapado
    this._pushBodyDown();

    // Animación de entrada
    requestAnimationFrame(() => {
      requestAnimationFrame(() => smartBannerEl?.classList.add('psb-visible'));
    });

    // Eventos
    document.getElementById('pwa-banner-action').addEventListener('click', () => {
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        this._showIOSGuide();
      } else if (deferredPrompt) {
        this._triggerNativeInstall();
      } else {
        this._showDesktopGuide();
      }
    });

    document.getElementById('pwa-banner-close').addEventListener('click', () => {
      this._dismissBanner(false);
    });
  },

  _updateBannerButton() {
    // Cuando llega el deferredPrompt, actualizar el texto del botón si el banner ya está visible
    const btn = document.getElementById('pwa-banner-action');
    if (btn && deferredPrompt) {
      btn.innerHTML = `<i class="bi bi-window-plus"></i> <span>Abrir en aplicación</span>`;
    }
  },

  _dismissBanner(permanent = false) {
    if (!smartBannerEl) return;
    smartBannerEl.classList.remove('psb-visible');
    this._resetBodyPadding();
    setTimeout(() => {
      smartBannerEl?.remove();
      smartBannerEl = null;
    }, 350);
    // Solo si se instaló de verdad, marcarlo como permanente
    if (permanent) {
      localStorage.setItem('pwa-installed', 'true');
    }
  },

  _pushBodyDown() {
    // Añadir padding-top al contenedor principal para que no tape contenido
    const main = document.querySelector('#app, .pm-portal-container, main, body > div:not(#pwa-smart-banner)');
    if (main) {
      main.style.transition = 'padding-top 0.35s ease';
      main.style.paddingTop = '60px';
    }
  },

  _resetBodyPadding() {
    const main = document.querySelector('#app, .pm-portal-container, main, body > div:not(#pwa-smart-banner)');
    if (main) {
      main.style.paddingTop = '';
    }
  },

  // ── Install nativo (Chrome/Edge desktop y Android) ──────────────────────────

  async _triggerNativeInstall() {
    if (!deferredPrompt) {
      this._showDesktopGuide();
      return;
    }
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        this._dismissBanner(true);
      }
    } catch (err) {
      console.warn('[PWA] Error al mostrar prompt:', err);
    } finally {
      deferredPrompt = null;
    }
  },

  // ── Modal de instrucciones iOS ───────────────────────────────────────────────

  _showIOSGuide() {
    if (guideModalEl) return;
    guideModalEl = document.createElement('div');
    guideModalEl.id = 'pwa-guide-modal';
    guideModalEl.innerHTML = `
      <div class="pgm-overlay" id="pgm-overlay">
        <div class="pgm-card" role="dialog" aria-modal="true" aria-labelledby="pgm-title">
          <div class="pgm-icon-wrap">
            <i class="bi bi-phone"></i>
          </div>
          <h3 id="pgm-title">Instalar en iPhone / iPad</h3>
          <p class="pgm-subtitle">Añade SOI Maestros a tu pantalla de inicio</p>
          <ol class="pgm-steps">
            <li>
              <span class="pgm-step-num">1</span>
              <span>Tocá el botón <strong>Compartir</strong> <i class="bi bi-box-arrow-up"></i> en la barra inferior de Safari</span>
            </li>
            <li>
              <span class="pgm-step-num">2</span>
              <span>Deslizá hacia abajo y tocá <strong>"Añadir a pantalla de inicio"</strong></span>
            </li>
            <li>
              <span class="pgm-step-num">3</span>
              <span>Presioná <strong>Añadir</strong> — la app aparecerá como un ícono nativo</span>
            </li>
          </ol>
          <button class="pgm-btn" id="pgm-close">Entendido</button>
        </div>
      </div>
    `;
    document.body.appendChild(guideModalEl);

    const close = () => {
      guideModalEl?.classList.add('pgm-hiding');
      setTimeout(() => { guideModalEl?.remove(); guideModalEl = null; }, 300);
    };

    document.getElementById('pgm-close').addEventListener('click', close);
    document.getElementById('pgm-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'pgm-overlay') close();
    });
  },

  // ── Modal de instrucciones Desktop ──────────────────────────────────────────

  _showDesktopGuide() {
    if (guideModalEl) return;
    guideModalEl = document.createElement('div');
    guideModalEl.id = 'pwa-guide-modal';
    guideModalEl.innerHTML = `
      <div class="pgm-overlay" id="pgm-overlay">
        <div class="pgm-card" role="dialog" aria-modal="true" aria-labelledby="pgm-title">
          <div class="pgm-icon-wrap">
            <i class="bi bi-display"></i>
          </div>
          <h3 id="pgm-title">Instalar como App de Escritorio</h3>
          <p class="pgm-subtitle">Accedé sin el navegador, como una app nativa</p>
          <ol class="pgm-steps">
            <li>
              <span class="pgm-step-num">1</span>
              <span>En la barra de Chrome buscá el ícono <strong>"Instalar aplicación"</strong> (ícono de pantalla con flecha)</span>
            </li>
            <li>
              <span class="pgm-step-num">2</span>
              <span>En <strong>Edge</strong>: Menú ⋯ → Apps → Instalar este sitio como app</span>
            </li>
            <li>
              <span class="pgm-step-num">3</span>
              <span>Confirmá la instalación — SOI Maestros quedará en tu escritorio y barra de tareas</span>
            </li>
          </ol>
          <button class="pgm-btn" id="pgm-close">Entendido</button>
        </div>
      </div>
    `;
    document.body.appendChild(guideModalEl);

    const close = () => {
      guideModalEl?.classList.add('pgm-hiding');
      setTimeout(() => { guideModalEl?.remove(); guideModalEl = null; }, 300);
    };

    document.getElementById('pgm-close').addEventListener('click', close);
    document.getElementById('pgm-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'pgm-overlay') close();
    });
  },

  // ── Public API ──────────────────────────────────────────────────────────────

  promptInstall() {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      this._showIOSGuide();
    } else if (deferredPrompt) {
      this._triggerNativeInstall();
    } else {
      this._showDesktopGuide();
    }
  },

  // ── Helpers ─────────────────────────────────────────────────────────────────

  _isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      localStorage.getItem('pwa-installed') === 'true'
    );
  },

  // ── Estilos ─────────────────────────────────────────────────────────────────

  _injectStyles() {
    if (document.getElementById('pwa-installer-styles')) return;
    const style = document.createElement('style');
    style.id = 'pwa-installer-styles';
    style.textContent = `
      /* ── Smart Banner ──────────────────────────────── */
      #pwa-smart-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10000;
        transform: translateY(-100%);
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }

      #pwa-smart-banner.psb-visible {
        transform: translateY(0);
      }

      .psb-content {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        background: rgba(20, 20, 30, 0.96);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        min-height: 52px;
      }

      .psb-icon {
        width: 36px;
        height: 36px;
        border-radius: 9px;
        overflow: hidden;
        flex-shrink: 0;
        background: linear-gradient(135deg, #5856D6, #7C7AE6);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .psb-icon img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
      }

      .psb-icon-fallback {
        font-size: 18px;
        color: white;
      }

      .psb-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
      }

      .psb-title {
        font-size: 13px;
        font-weight: 700;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .psb-subtitle {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.55);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .psb-action {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 7px 14px;
        background: #5856D6;
        color: #fff;
        border: none;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
        transition: background 0.2s, transform 0.15s;
        letter-spacing: -0.01em;
      }

      .psb-action:hover {
        background: #6a68e0;
        transform: scale(1.03);
      }

      .psb-action:active {
        transform: scale(0.97);
      }

      .psb-close {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.35);
        cursor: pointer;
        padding: 4px 6px;
        font-size: 16px;
        flex-shrink: 0;
        transition: color 0.2s;
        line-height: 1;
        display: flex;
        align-items: center;
      }

      .psb-close:hover {
        color: rgba(255, 255, 255, 0.8);
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
    `;
    document.head.appendChild(style);
  },
};

// Auto-inicializar al cargar el módulo
pwaInstaller.init();