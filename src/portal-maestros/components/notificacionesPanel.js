import { fetchNotificaciones, onNotificacionesChange, marcarLeida, marcarTodasLeidas, eliminarNotificacion, getDedupCount } from '../services/notificationService.js';
import { enableTrap } from '../utils/focusTrap.js';

// -- Listener: NAVIGATE_TO desde el SW (toque en notificación OS) ----------------
// El SW envía este mensaje cuando el usuario toca una notificación del SO
// y el portal ya está abierto en una pestaña.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'NAVIGATE_TO') {
      // SW sends `url` (hash string like '#/asistencia?clase=...&fecha=...')
      const target = event.data.url || event.data.hash;
      if (target) window.location.hash = target.startsWith('#') ? target.slice(1) : target;
    }
  });
}

let isOpen = false;
let container = null;
let unsubscribe = null;

// Formateador nativo para tiempo relativo (hace X minutos)
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

  if (diffDays > 0) return rtf.format(-diffDays, 'day');
  if (diffHours > 0) return rtf.format(-diffHours, 'hour');
  if (diffMins > 0) return rtf.format(-diffMins, 'minute');
  return 'hace un momento';
}

export const notificacionesPanel = {
  init() {
    if (document.getElementById('pm-notificaciones-drawer-overlay')) return;

    container = document.createElement('div');
    container.innerHTML = `
      <div id="pm-notificaciones-drawer-overlay" class="pm-drawer-overlay" role="dialog" aria-modal="true" aria-labelledby="pm-notif-dialog-title">
        <div class="pm-drawer">
          <div class="pm-drawer-header">
            <h4 id="pm-notif-dialog-title"><i class="bi bi-bell"></i> Notificaciones <span id="pm-notif-dedup-badge" class="pm-dedup-badge" style="display:none;"></span></h4>
            <div style="display:flex; gap: 0.5rem;">
              <button id="pm-notif-mark-all" class="pm-icon-btn" title="Marcar todas como leídas" style="font-size: 1rem;">
                <i class="bi bi-check2-all"></i>
              </button>
              <button class="pm-drawer-close" id="pm-notificaciones-close" aria-label="Cerrar">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          <div class="pm-drawer-body" id="pm-notificaciones-list">
            <!-- Render list here -->
            <div class="text-center text-muted mt-4">
              <div class="spinner-border spinner-border-sm mb-2"></div><br>
              Cargando...
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    // Eventos UI
    document.getElementById('pm-notificaciones-close').addEventListener('click', this.close);
    document.getElementById('pm-notificaciones-drawer-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'pm-notificaciones-drawer-overlay') this.close();
    });

    document.getElementById('pm-notif-mark-all').addEventListener('click', () => {
      marcarTodasLeidas();
    });

    // Suscripción al servicio
    unsubscribe = onNotificacionesChange((notifs) => {
      this.renderList(notifs);
    });

    // Carga inicial
    fetchNotificaciones();
  },

  _updateDedupBadge() {
    const dedupBadge = document.getElementById('pm-notif-dedup-badge');
    if (!dedupBadge) return;
    const count = getDedupCount();
    if (count > 0) {
      dedupBadge.textContent = `🔄 ${count} dedup`;
      dedupBadge.style.display = 'inline-flex';
    } else {
      dedupBadge.style.display = 'none';
    }
  },

  renderList(notificaciones) {
    const listEl = document.getElementById('pm-notificaciones-list');
    if (!listEl) return;
    this._updateDedupBadge();

    if (notificaciones.length === 0) {
      listEl.innerHTML = `
        <div class="text-center text-muted mt-5">
          <i class="bi bi-bell-slash" style="font-size: 2rem; opacity: 0.5;"></i>
          <p class="mt-2">No tienes notificaciones recientes.</p>
        </div>
      `;
      return;
    }

    // ── Agrupar por tipo: más de una del mismo tipo → un ítem colapsado ──
    const groups = _groupByTipo(notificaciones);

    listEl.innerHTML = groups.map(g => {
      const isGroup = g.count > 1;
      const anyUnread = g.items.some(n => n.estado !== 'leida');
      const route = _routeForTipo(g.tipo, g.items[0]);

      const isSinRegistrar = g.tipo === 'sesion_sin_registrar'

      return `
        <div
          class="pm-notif-item ${anyUnread ? '' : 'leida'} ${isSinRegistrar ? 'pm-notif-item--urgent' : ''}"
          data-ids="${g.items.map(n => n.id).join(',')}"
          data-route="${route}"
          title="${isGroup ? 'Ver todo' : g.items[0].titulo}"
        >
          <div class="pm-notif-icon ${getNotifColor(g.tipo)}">
            <i class="bi ${getNotifIcon(g.tipo)}"></i>
          </div>
          <div class="pm-notif-content">
            <div class="pm-notif-title">
              ${isGroup ? `${g.items[0].titulo} <span class="pm-notif-count">${g.count}</span>` : g.items[0].titulo}
            </div>
            <div class="pm-notif-msg">
              ${isGroup
                ? `${g.count} clases sin registrar`
                : g.items[0].mensaje
              }
            </div>
            <div class="pm-notif-footer-row">
              <span class="pm-notif-time">${formatRelativeTime(g.items[0].created_at)}</span>
              ${isSinRegistrar && route !== '#/'
                ? `<a class="pm-notif-cta" data-route="${route}" href="javascript:void(0)">Registrar ahora →</a>`
                : ''
              }
            </div>
          </div>
          <div class="pm-notif-actions">
            <button class="pm-notif-btn-mark" data-ids="${g.items.map(n => n.id).join(',')}" title="Marcar como leída">
              <i class="bi bi-check-circle"></i>
            </button>
            <button class="pm-notif-btn-delete" data-ids="${g.items.map(n => n.id).join(',')}" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
          ${anyUnread ? '<div class="pm-notif-dot"></div>' : ''}
        </div>
      `;
    }).join('');

    // Click en CTA "Registrar ahora" — navegar directo sin propagar al item
    listEl.querySelectorAll('.pm-notif-cta').forEach(cta => {
      cta.addEventListener('click', (e) => {
        e.stopPropagation()
        const ids = cta.closest('.pm-notif-item').dataset.ids.split(',')
        ids.forEach(id => marcarLeida(id))
        const route = cta.dataset.route
        if (route && route !== '#/') {
          window.location.hash = route.replace(/^#/, '')
          notificacionesPanel.close()
        }
      })
    })

    // Click en item: marcar leída(s) y navegar a la ruta relevante
    listEl.querySelectorAll('.pm-notif-item').forEach(el => {
      el.addEventListener('click', (e) => {
        // Evitar si el click fue en un botón de acción o CTA
        if (e.target.closest('.pm-notif-actions')) return
        if (e.target.closest('.pm-notif-cta')) return

        const ids = el.dataset.ids.split(',');
        ids.forEach(id => marcarLeida(id));

        const route = el.dataset.route;
        if (route && route !== '#/') {
          window.location.hash = route.replace(/^#/, '');
        }
      });
    });

    // Botón "marcar leída"
    listEl.querySelectorAll('.pm-notif-btn-mark').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ids = btn.dataset.ids.split(',');
        ids.forEach(id => marcarLeida(id));
      });
    });

    // Botón "eliminar"
    listEl.querySelectorAll('.pm-notif-btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const ids = btn.dataset.ids.split(',');
        
        // Confirmación nativa elegante
        const confirmar = confirm('¿Estás seguro de que querés eliminar esta notificación?');
        if (!confirmar) return;

        let deleteSuccess = true;
        for (const id of ids) {
          const res = await eliminarNotificacion(id);
          if (!res.success) {
            deleteSuccess = false;
          }
        }

        if (deleteSuccess) {
          window.dispatchEvent(new CustomEvent('showToast', { 
            detail: { message: 'Notificación eliminada correctamente.', type: 'info' } 
          }));
        } else {
          window.dispatchEvent(new CustomEvent('showToast', { 
            detail: { message: 'Hubo un problema al eliminar la notificación.', type: 'danger' } 
          }));
        }

        // Recargar lista y refrescar badge
        fetchNotificaciones();
      });
    });
  },

  open() {
    this.init();
    // Store the trigger element so we can restore focus on close
    this._triggerEl = document.activeElement;
    const overlay = document.getElementById('pm-notificaciones-drawer-overlay');
    overlay.style.display = 'block';
    // Forzar reflow para la transición
    overlay.offsetHeight;
    overlay.classList.add('open');
    isOpen = true;
    
    // Focus trap
    const drawer = document.querySelector('#pm-notificaciones-drawer-overlay .pm-drawer');
    if (drawer) {
      if (this._trap) this._trap.dispose();
      this._trap = enableTrap(drawer, { onClose: () => this.close() });
    }

    // Move focus to the close button inside the drawer
    const closeBtn = document.getElementById('pm-notificaciones-close');
    if (closeBtn) closeBtn.focus();

    // Al abrir el panel, traemos la última data
    this._updateDedupBadge();
    fetchNotificaciones();
  },

  close() {
    if (this._trap) { this._trap.dispose(); this._trap = null; }
    const overlay = document.getElementById('pm-notificaciones-drawer-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
    }
    isOpen = false;

    // Restore focus to the element that triggered the drawer
    if (this._triggerEl && typeof this._triggerEl.focus === 'function') {
      this._triggerEl.focus();
    }
    this._triggerEl = null;
  }
};

// Helpers visuales
function getNotifIcon(tipo) {
  switch (tipo) {
    case 'sesion_sin_registrar': return 'bi-exclamation-triangle';
    case 'recordatorio_clase': return 'bi-clock-history';
    case 'mensaje_admin': return 'bi-megaphone';
    case 'tarea_vencida': return 'bi-journal-x';
    default: return 'bi-bell';
  }
}

function getNotifColor(tipo) {
  switch (tipo) {
    case 'sesion_sin_registrar': return 'bg-danger text-white';
    case 'recordatorio_clase': return 'bg-warning text-dark';
    case 'mensaje_admin': return 'bg-primary text-white';
    default: return 'bg-secondary text-white';
  }
}

/**
 * Agrupa notificaciones por tipo.
 * NOTA: sesion_sin_registrar NO se agrupa porque cada notificación es para una clase/día específica
 * y el usuario necesita acceso individual a cada una para registrar esa clase.
 */
function _groupByTipo(notificaciones) {
  // Tipos que se agrupan cuando hay más de uno
  // Removido 'sesion_sin_registrar' para que cada notificación sea accesible individualmente
  const GROUPABLE = new Set(['recordatorio_clase', 'in_app']);

  const groups = [];
  const seen = new Map(); // tipo → index en groups[]

  for (const notif of notificaciones) {
    if (GROUPABLE.has(notif.tipo) && seen.has(notif.tipo)) {
      const g = groups[seen.get(notif.tipo)];
      g.items.push(notif);
      g.count++;
    } else {
      seen.set(notif.tipo, groups.length);
      groups.push({ tipo: notif.tipo, items: [notif], count: 1 });
    }
  }

  return groups;
}

/**
 * Resuelve la ruta de navegación in-app para el click en el panel.
 */
function _routeForTipo(tipo, notif) {
  const claseId = notif.clase_id || notif.data?.clase_id;
  const alumnoId = notif.alumno_id || notif.data?.alumno_id;
  const fecha = notif.fecha || new Date().toISOString().split('T')[0];

  switch (tipo) {
    case 'sesion_sin_registrar':
    case 'recordatorio_clase':
      return claseId ? `#/asistencia?clase=${claseId}&fecha=${fecha}` : '#/hoy';
    case 'mensaje_admin':
      return '#/perfil';
    case 'tarea_vencida':
      return alumnoId ? `#/alumno?id=${alumnoId}` : '#/hoy';
    default:
      return '#/hoy';
  }
}

// Inyectar estilos específicos del panel de notificaciones
if (!document.getElementById('pm-notif-styles')) {
  const style = document.createElement('style');
  style.id = 'pm-notif-styles';
  style.textContent = `
    .pm-notif-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid var(--pm-border);
      cursor: pointer;
      transition: background 0.2s;
      position: relative;
    }
    .pm-notif-item:hover {
      background: var(--pm-surface-2);
    }
    .pm-notif-item.leida {
      opacity: 0.7;
    }
    .pm-notif-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .pm-notif-content {
      flex: 1;
      min-width: 0;
    }
    .pm-notif-title {
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 0.2rem;
      color: var(--pm-text);
    }
    .pm-notif-msg {
      font-size: 0.8rem;
      color: var(--pm-text-muted);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .pm-notif-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.4rem;
      gap: 0.5rem;
    }
    .pm-notif-time {
      font-size: 0.7rem;
      color: var(--pm-text-muted);
    }
    /* CTA "Registrar ahora" */
    .pm-notif-cta {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--pm-danger, #ef4444);
      text-decoration: none;
      white-space: nowrap;
      padding: 2px 8px;
      border-radius: 99px;
      border: 1px solid currentColor;
      line-height: 1.6;
      transition: background 0.15s, color 0.15s;
    }
    .pm-notif-cta:hover {
      background: var(--pm-danger, #ef4444);
      color: #fff;
    }
    /* Borde izquierdo urgente para clases sin registrar */
    .pm-notif-item--urgent {
      border-left: 3px solid var(--pm-danger, #ef4444);
    }
    .pm-notif-dot {
      width: 8px;
      height: 8px;
      background: var(--pm-primary);
      border-radius: 50%;
      position: absolute;
      top: 1.2rem;
      right: 1rem;
    }

    /* Badge de conteo para grupos */
    .pm-notif-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      background: var(--pm-primary);
      color: #fff;
      border-radius: 9px;
      font-size: 0.68rem;
      font-weight: 700;
      margin-left: 6px;
      vertical-align: middle;
      letter-spacing: 0;
    }

    /* Dedup badge in panel header */
    .pm-dedup-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      background: rgba(245, 158, 11, 0.15);
      color: #d97706;
      vertical-align: middle;
      margin-left: 6px;
      letter-spacing: 0;
    }

    /* Action buttons */
    .pm-notif-actions {
      display: flex;
      gap: 0.5rem;
      margin-left: 0.5rem;
      flex-shrink: 0;
    }

    .pm-notif-btn-mark,
    .pm-notif-btn-delete {
      background: none;
      border: none;
      padding: 0.4rem;
      cursor: pointer;
      color: var(--pm-text-muted);
      border-radius: 4px;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .pm-notif-btn-mark:hover {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .pm-notif-btn-delete:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    /* Dark mode */
    [data-portal-theme="dark"] .pm-notif-item:hover {
      background: rgba(255, 255, 255, 0.04);
    }
  `;
  document.head.appendChild(style);
}
