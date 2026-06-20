/**
 * AppToast -- Sistema de toasts nativo, sin dependencia de Bootstrap JS.
 * Usa las variables CSS del design system del portal (--pm-*).
 * Soporta apilamiento, auto-dismiss, y animación de entrada/salida.
 */

const CONTAINER_ID = 'app-toast-container';

// -- Estilos ----------------------------------------------------------------
let _stylesInjected = false;
function _injectStyles() {
  if (_stylesInjected) return;
  _stylesInjected = true;

  const s = document.createElement('style');
  s.id = 'app-toast-styles';
  s.textContent = `
    #app-toast-container {
      position: fixed;
      bottom: 1.25rem;
      right: 1.25rem;
      z-index: 10050;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }

    .app-toast {
      pointer-events: all;
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      min-width: 280px;
      max-width: 360px;
      padding: 0.85rem 1rem;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(24, 24, 32, 0.97);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      color: #fff;
      font-size: 0.875rem;
      line-height: 1.4;
      opacity: 0;
      transform: translateY(12px) scale(0.97);
      transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1);
    }

    .app-toast.app-toast--visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .app-toast.app-toast--hiding {
      opacity: 0;
      transform: translateY(8px) scale(0.96);
    }

    .app-toast__icon {
      font-size: 1.1rem;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .app-toast__body {
      flex: 1;
      min-width: 0;
    }

    .app-toast__title {
      font-weight: 700;
      font-size: 0.78rem;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      margin-bottom: 2px;
      opacity: 0.75;
    }

    .app-toast__msg {
      font-size: 0.875rem;
      color: rgba(255,255,255,0.9);
    }

    .app-toast__close {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.4);
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
      transition: color 0.2s;
      align-self: flex-start;
    }
    .app-toast__close:hover { color: #fff; }

    /* Colores por tipo */
    .app-toast--success .app-toast__icon { color: #34d399; }
    .app-toast--success { border-color: rgba(52,211,153,0.2); }

    .app-toast--error .app-toast__icon   { color: #f87171; }
    .app-toast--error   { border-color: rgba(248,113,113,0.2); }

    .app-toast--warning .app-toast__icon { color: #fbbf24; }
    .app-toast--warning { border-color: rgba(251,191,36,0.2); }

    .app-toast--info .app-toast__icon    { color: #60a5fa; }
    .app-toast--info    { border-color: rgba(96,165,250,0.2); }

    @media (max-width: 400px) {
      #app-toast-container { right: 0.75rem; left: 0.75rem; }
      .app-toast { min-width: unset; max-width: 100%; }
    }
  `;
  document.head.appendChild(s);
}

// -- Container --------------------------------------------------------------
function _ensureContainer() {
  let el = document.getElementById(CONTAINER_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = CONTAINER_ID;
    document.body.appendChild(el);
  }
  return el;
}

// -- Config por tipo --------------------------------------------------------
const TYPE_CONFIG = {
  success: { icon: 'bi bi-check-circle-fill', title: 'Éxito' },
  error:   { icon: 'bi bi-exclamation-octagon-fill', title: 'Error' },
  danger:  { icon: 'bi bi-exclamation-octagon-fill', title: 'Error' },
  warning: { icon: 'bi bi-exclamation-triangle-fill', title: 'Atención' },
  info:    { icon: 'bi bi-info-circle-fill', title: 'Info' },
};

// -- Lógica de dismiss ------------------------------------------------------
function _dismiss(toastEl) {
  if (toastEl._dismissing) return;
  toastEl._dismissing = true;
  toastEl.classList.remove('app-toast--visible');
  toastEl.classList.add('app-toast--hiding');
  setTimeout(() => toastEl.remove(), 350);
}

// -- API pública ------------------------------------------------------------
export const AppToast = {
  show(message, type = 'info') {
    _injectStyles();
    const container = _ensureContainer();

    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;
    const canonicalType = type === 'danger' ? 'error' : type;

    const toastEl = document.createElement('div');
    toastEl.className = `app-toast app-toast--${canonicalType}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'polite');
    toastEl.innerHTML = `
      <i class="${cfg.icon} app-toast__icon" aria-hidden="true"></i>
      <div class="app-toast__body">
        <div class="app-toast__title">${cfg.title}</div>
        <div class="app-toast__msg">${message}</div>
      </div>
      <button class="app-toast__close" aria-label="Cerrar">&#x2715;</button>
    `;

    container.appendChild(toastEl);

    // Botón de cierre
    toastEl.querySelector('.app-toast__close').addEventListener('click', () => _dismiss(toastEl));

    // Animar entrada (necesita un frame para que la transición funcione)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toastEl.classList.add('app-toast--visible'));
    });

    // Auto-dismiss a los 4 segundos
    const timer = setTimeout(() => _dismiss(toastEl), 4000);

    // Pausar auto-dismiss al hacer hover
    toastEl.addEventListener('mouseenter', () => clearTimeout(timer));
    toastEl.addEventListener('mouseleave', () => {
      setTimeout(() => _dismiss(toastEl), 1500);
    });
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error');   },
  danger(msg)  { this.show(msg, 'danger');  },
  info(msg)    { this.show(msg, 'info');    },
  warning(msg) { this.show(msg, 'warning'); },
};
