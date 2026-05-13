/**
 * PWA Installer - Muestra banner de instalación cuando la app no está instalada
 */

let deferredPrompt = null;
let bannerElement = null;

export const pwaInstaller = {
  init() {
    // Solo ejecutar en navegador que soporte PWA
    if (!this.isPwaCapable()) {
      // En localhost, mostrar botón manual
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        this.showManualInstallButton();
      }
      return;
    }

    // Escuchar el evento de instalación
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Verificar si ya está instalado
      this.checkInstalled();
    });

    // Detectar si ya se instaló
    window.addEventListener('appinstalled', () => {
      this.hideBanner();
      deferredPrompt = null;
    });

    // Verificar al cargar si ya está instalada
    setTimeout(() => this.checkInstalled(), 2000);
  },

  showManualInstallButton() {
    // Solo mostrar si no está instalado y no se ha cerrado antes
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;
    if (sessionStorage.getItem('pwa-install-dismissed') === 'true') return;

    // Crear botón flotante
    const btn = document.createElement('div');
    btn.id = 'pwa-manual-install';
    btn.innerHTML = `
      <button class="pwa-install-fab" id="pwa-manual-btn">
        <i class="bi bi-download"></i>
      </button>
      <div class="pwa-install-tooltip">Instalar App</div>
    `;
    document.body.appendChild(btn);
    this.injectManualStyles();

    document.getElementById('pwa-manual-btn').addEventListener('click', () => {
      // En Android, mostrar diálogo de información
      this.showInstallInfo();
    });

    // Animación
    setTimeout(() => btn.classList.add('visible'), 2000);
  },

  showInstallInfo() {
    const info = document.createElement('div');
    info.id = 'pwa-install-info-modal';
    info.innerHTML = `
      <div class="pwa-info-overlay">
        <div class="pwa-info-card">
          <h3>📲 Instalar Sistema Académico SOI</h3>
          <p>Para instalar la app en tu móvil:</p>
          <ol>
            <li>Abre el menú de Chrome (los 3 puntos)</li>
            <li>Selecciona <strong>"Agregar a pantalla de inicio"</strong></li>
            <li>¡Listo! La app aparecerá como una aplicación nativa</li>
          </ol>
          <button class="btn btn-primary w-100" id="pwa-info-close">Entendido</button>
        </div>
      </div>
    `;
    document.body.appendChild(info);
    document.getElementById('pwa-info-close').addEventListener('click', () => info.remove());
  },

  injectManualStyles() {
    if (document.getElementById('pwa-manual-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'pwa-manual-styles';
    style.textContent = `
      #pwa-manual-install {
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 9998;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
      }
      
      #pwa-manual-install.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .pwa-install-fab {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0d6efd, #0a58ca);
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(13, 110, 253, 0.4);
        transition: transform 0.2s;
      }

      .pwa-install-fab:active {
        transform: scale(0.95);
      }

      .pwa-install-tooltip {
        position: absolute;
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        background: #1a1a2e;
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        white-space: nowrap;
        margin-right: 10px;
        opacity: 0;
        transition: opacity 0.2s;
      }

      #pwa-manual-install:hover .pwa-install-tooltip {
        opacity: 1;
      }

      #pwa-install-info-modal .pwa-info-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
      }

      #pwa-install-info-modal .pwa-info-card {
        background: white;
        border-radius: 16px;
        padding: 24px;
        max-width: 400px;
        text-align: center;
      }

      #pwa-install-info-modal h3 {
        margin-bottom: 16px;
        font-size: 18px;
      }

      #pwa-install-info-modal ol {
        text-align: left;
        margin: 16px 0;
        padding-left: 20px;
      }

      #pwa-install-info-modal li {
        margin-bottom: 8px;
        color: #555;
      }

      #pwa-install-info-modal strong {
        color: #0d6efd;
      }
    `;
    document.head.appendChild(style);
  },

  isPwaCapable() {
    return 'serviceWorker' in navigator && 
           'BeforeInstallPromptEvent' in window;
  },

  async checkInstalled() {
    // Verificar si está en modo standalone (ya instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true;

    if (isStandalone) return;

    // Verificar si el usuario ya cerró el banner antes
    if (sessionStorage.getItem('pwa-install-dismissed') === 'true') return;

    // Si hay un prompt pendiente, mostrar banner
    if (deferredPrompt) {
      setTimeout(() => {
        if (!sessionStorage.getItem('pwa-install-dismissed')) {
          this.showInstallBanner();
        }
      }, 3000);
    }
    // Si no hay prompt, no reintentar (en localhost no funciona de todas formas)
  },

  showInstallBanner() {
    if (bannerElement) return; // Ya está mostrado
    
    bannerElement = document.createElement('div');
    bannerElement.id = 'pwa-install-banner';
    bannerElement.innerHTML = `
      <div class="pwa-install-content">
        <div class="pwa-install-icon">
          <img src="/icons/icon-192.png" alt="SOI" onerror="this.style.display='none'">
        </div>
        <div class="pwa-install-text">
          <strong>Instalar Sistema Académico SOI</strong>
          <span>Accede rápido desde tu pantalla de inicio</span>
        </div>
        <button class="pwa-install-btn" id="pwa-install-action">
          <i class="bi bi-download"></i> Instalar
        </button>
        <button class="pwa-install-close" id="pwa-install-dismiss">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    `;

    document.body.appendChild(bannerElement);
    this.injectStyles();

    // Evento instalar
    document.getElementById('pwa-install-action').addEventListener('click', () => {
      this.install();
    });

    // Evento cerrar
    document.getElementById('pwa-install-dismiss').addEventListener('click', () => {
      this.hideBanner();
      // No mostrar de nuevo en esta sesión
      sessionStorage.setItem('pwa-install-dismissed', 'true');
    });

    // Animación de entrada
    requestAnimationFrame(() => {
      bannerElement.classList.add('visible');
    });

    console.log('[PWA] Banner de instalación mostrado');
  },

  hideBanner() {
    if (bannerElement) {
      bannerElement.classList.remove('visible');
      setTimeout(() => {
        bannerElement?.remove();
        bannerElement = null;
      }, 300);
    }
  },

  async install() {
    if (!deferredPrompt) {
      console.warn('[PWA] No hay prompt de instalación disponible');
      return;
    }

    // Mostrar el prompt nativo
    deferredPrompt.prompt();
    
    // Esperar respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Resultado de instalación:', outcome);
    
    if (outcome === 'accepted') {
      console.log('[PWA] Usuario aceptó instalar');
    } else {
      console.log('[PWA] Usuario canceló instalación');
    }
    
    deferredPrompt = null;
    this.hideBanner();
  },

  injectStyles() {
    if (document.getElementById('pwa-install-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'pwa-install-styles';
    style.textContent = `
      #pwa-install-banner {
        position: fixed;
        bottom: 20px;
        left: 16px;
        right: 16px;
        z-index: 9999;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      #pwa-install-banner.visible {
        transform: translateY(0);
        opacity: 1;
      }

      .pwa-install-content {
        display: flex;
        align-items: center;
        gap: 12px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .pwa-install-icon {
        width: 48px;
        height: 48px;
        flex-shrink: 0;
      }

      .pwa-install-icon img {
        width: 100%;
        height: 100%;
        border-radius: 12px;
        object-fit: cover;
      }

      .pwa-install-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .pwa-install-text strong {
        color: #fff;
        font-size: 15px;
        font-weight: 600;
      }

      .pwa-install-text span {
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
      }

      .pwa-install-btn {
        background: #0d6efd;
        color: #fff;
        border: none;
        border-radius: 10px;
        padding: 10px 16px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: background 0.2s;
        white-space: nowrap;
      }

      .pwa-install-btn:hover {
        background: #0a58ca;
      }

      .pwa-install-close {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        padding: 8px;
        font-size: 18px;
        line-height: 1;
        transition: color 0.2s;
      }

      .pwa-install-close:hover {
        color: #fff;
      }

      @media (max-width: 400px) {
        .pwa-install-content {
          padding: 12px;
        }
        
        .pwa-install-icon {
          width: 40px;
          height: 40px;
        }
        
        .pwa-install-text strong {
          font-size: 14px;
        }
        
        .pwa-install-btn {
          padding: 8px 12px;
          font-size: 13px;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// Auto-inicializar
pwaInstaller.init();