/**
 * AppToast -- Sistema de toasts nativo, sin dependencia de Bootstrap JS.
 * Usa las variables CSS del design system del portal (--pm-*).
 * Soporta apilamiento acotado, deduplicación, auto-dismiss y toasts de progreso.
 *
 * API:
 *   AppToast.success(msg) / .error(msg) / .warning(msg) / .info(msg) / .danger(msg)
 *   AppToast.show(msg, type, opts?) -> handle  ({ update, dismiss })
 *   AppToast.progress(msg) -> handle            ({ update, success, error, warning, dismiss })
 *   AppToast.dismissAll()
 *
 * `progress()` devuelve un toast "pegajoso" (sin auto-cierre) pensado para
 * operaciones con espera: en vez de encadenar "Cargando..." + "Éxito" como dos
 * toasts, se muta el mismo en el sitio al resolver.
 */

const CONTAINER_ID = 'app-toast-container';

// Máximo de toasts visibles a la vez. Al superarlo se descarta el más viejo
// (salvo que el usuario lo tenga con el mouse encima).
const MAX_VISIBLE = 3;

// Duración de auto-cierre por tipo (ms). 0 = pegajoso.
const DURATIONS = {
  info: 2800,
  success: 3200,
  warning: 5000,
  error: 6000,
};

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
      z-index: 11020;
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

    .app-toast--progress .app-toast__icon {
      animation: app-toast-spin 0.9s linear infinite;
    }
    @keyframes app-toast-spin { to { transform: rotate(360deg); } }

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

    .app-toast__count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.15rem;
      height: 1.15rem;
      padding: 0 0.3rem;
      margin-left: 0.4rem;
      border-radius: 999px;
      background: rgba(255,255,255,0.16);
      font-size: 0.7rem;
      font-weight: 700;
      vertical-align: middle;
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

    @media (prefers-reduced-motion: reduce) {
      .app-toast { transition: opacity 0.15s ease; transform: none; }
      .app-toast.app-toast--visible { transform: none; }
      .app-toast--progress .app-toast__icon { animation: none; }
    }

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
  success:  { icon: 'bi bi-check-circle-fill', title: 'Éxito' },
  error:    { icon: 'bi bi-exclamation-octagon-fill', title: 'Error' },
  danger:   { icon: 'bi bi-exclamation-octagon-fill', title: 'Error' },
  warning:  { icon: 'bi bi-exclamation-triangle-fill', title: 'Atención' },
  info:     { icon: 'bi bi-info-circle-fill', title: 'Info' },
  progress: { icon: 'bi bi-arrow-repeat', title: 'Procesando' },
};

function _canonical(type) {
  return type === 'danger' ? 'error' : type;
}

function _key(type, message) {
  return `${_canonical(type)}::${message}`;
}

// -- Estado interno -------------------------------------------------------
/** Toasts vivos, en orden de aparición. */
const _live = [];

function _register(toastEl) {
  _live.push(toastEl);
  _enforceCap();
}

function _unregister(toastEl) {
  const i = _live.indexOf(toastEl);
  if (i !== -1) _live.splice(i, 1);
}

/** Descarta los más viejos hasta respetar MAX_VISIBLE, saltando los pegajosos y los que tienen el mouse encima. */
function _enforceCap() {
  if (_live.length <= MAX_VISIBLE) return;
  for (const el of [..._live]) {
    if (_live.length <= MAX_VISIBLE) break;
    if (el._sticky || el._hovered || el._dismissing) continue;
    _dismiss(el);
  }
}

// -- Lógica de dismiss ------------------------------------------------------
function _dismiss(toastEl) {
  if (!toastEl || toastEl._dismissing) return;
  toastEl._dismissing = true;
  clearTimeout(toastEl._timer);
  _unregister(toastEl);
  toastEl.classList.remove('app-toast--visible');
  toastEl.classList.add('app-toast--hiding');
  setTimeout(() => toastEl.remove(), 350);
}

function _scheduleDismiss(toastEl, duration) {
  clearTimeout(toastEl._timer);
  if (!duration || duration <= 0) {
    toastEl._sticky = true;
    return;
  }
  toastEl._sticky = false;
  toastEl._timer = setTimeout(() => _dismiss(toastEl), duration);
}

/** Actualiza el contenido/tipo de un toast existente y reprograma su cierre. */
function _apply(toastEl, message, type, duration) {
  const canonicalType = _canonical(type);
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;

  toastEl.className = `app-toast app-toast--visible app-toast--${canonicalType}`
    + (type === 'progress' ? ' app-toast--progress' : '');
  toastEl._toastType = canonicalType;
  toastEl._toastMsg = message;
  toastEl._dedupeKey = _key(type, message);
  toastEl._count = 1;

  const iconEl = toastEl.querySelector('.app-toast__icon');
  const titleEl = toastEl.querySelector('.app-toast__title');
  const msgEl = toastEl.querySelector('.app-toast__msg');
  if (iconEl) iconEl.className = `${cfg.icon} app-toast__icon`;
  if (titleEl) titleEl.textContent = cfg.title;
  if (msgEl) msgEl.innerHTML = message;

  const dur = duration === undefined ? DURATIONS[canonicalType] ?? DURATIONS.info : duration;
  _scheduleDismiss(toastEl, dur);
}

function _bumpDuplicate(toastEl) {
  toastEl._count = (toastEl._count || 1) + 1;
  const msgEl = toastEl.querySelector('.app-toast__msg');
  if (msgEl) {
    let badge = msgEl.querySelector('.app-toast__count');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'app-toast__count';
      msgEl.appendChild(badge);
    }
    badge.textContent = `x${toastEl._count}`;
  }
  const canonicalType = toastEl._toastType || 'info';
  _scheduleDismiss(toastEl, DURATIONS[canonicalType] ?? DURATIONS.info);
}

// -- Creación -------------------------------------------------------------
function _create(message, type, { duration } = {}) {
  _injectStyles();
  const container = _ensureContainer();

  // Deduplicación: si ya hay un toast idéntico visible, sólo se refresca.
  const dupKey = _key(type, message);
  const existing = _live.find((el) => el._dedupeKey === dupKey && !el._dismissing);
  if (existing) {
    _bumpDuplicate(existing);
    return _handleFor(existing);
  }

  const toastEl = document.createElement('div');
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'polite');
  toastEl.innerHTML = `
    <i class="app-toast__icon" aria-hidden="true"></i>
    <div class="app-toast__body">
      <div class="app-toast__title"></div>
      <div class="app-toast__msg"></div>
    </div>
    <button class="app-toast__close" aria-label="Cerrar">&#x2715;</button>
  `;
  // Empezar invisible para animar la entrada.
  toastEl.className = 'app-toast';

  toastEl.querySelector('.app-toast__close').addEventListener('click', () => _dismiss(toastEl));
  toastEl.addEventListener('mouseenter', () => {
    toastEl._hovered = true;
    clearTimeout(toastEl._timer);
  });
  toastEl.addEventListener('mouseleave', () => {
    toastEl._hovered = false;
    if (!toastEl._sticky) _scheduleDismiss(toastEl, 1500);
  });

  container.appendChild(toastEl);
  _apply(toastEl, message, type, duration);
  // _apply deja la clase con --visible; forzar el estado inicial y animar.
  toastEl.classList.remove('app-toast--visible');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toastEl.classList.add('app-toast--visible'));
  });

  _register(toastEl);
  return _handleFor(toastEl);
}

// -- Handle público de un toast -----------------------------------------
function _handleFor(toastEl) {
  const resolveWith = (msg, type) => {
    if (!toastEl || !toastEl.isConnected) return;
    _apply(toastEl, msg, type, DURATIONS[_canonical(type)] ?? DURATIONS.info);
  };
  return {
    el: toastEl,
    update(msg, type) {
      if (!toastEl || !toastEl.isConnected) return;
      _apply(toastEl, msg, type || toastEl._toastType || 'info',
        type ? undefined : 0);
    },
    success(msg) { resolveWith(msg, 'success'); },
    error(msg)   { resolveWith(msg, 'error'); },
    warning(msg) { resolveWith(msg, 'warning'); },
    info(msg)    { resolveWith(msg, 'info'); },
    dismiss()    { _dismiss(toastEl); },
  };
}

// -- API pública ------------------------------------------------------------
export const AppToast = {
  /**
   * Muestra un toast. Devuelve un handle con { update, dismiss, success, error... }.
   * @param {string} message
   * @param {'success'|'error'|'danger'|'warning'|'info'|'progress'} type
   * @param {{ duration?: number }} [opts] duration en ms; 0 = pegajoso
   */
  show(message, type = 'info', opts = {}) {
    return _create(message, type, opts);
  },

  /**
   * Toast de progreso: pegajoso hasta que se resuelva con
   * `.success()`, `.error()`, `.warning()` o se descarte con `.dismiss()`.
   */
  progress(message) {
    return _create(message, 'progress', { duration: 0 });
  },

  /** Cierra todos los toasts visibles. */
  dismissAll() {
    for (const el of [..._live]) _dismiss(el);
  },

  success(msg) { return this.show(msg, 'success'); },
  error(msg)   { return this.show(msg, 'error');   },
  danger(msg)  { return this.show(msg, 'danger');  },
  info(msg)    { return this.show(msg, 'info');    },
  warning(msg) { return this.show(msg, 'warning'); },
};
