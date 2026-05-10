import { fetchNotificaciones, onNotificacionesChange, marcarLeida, marcarTodasLeidas, _isDuplicateNotification, _recordNotificationReceived } from '../services/notificationService.js';

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
      <div id="pm-notificaciones-drawer-overlay" class="pm-drawer-overlay">
        <div class="pm-drawer">
          <div class="pm-drawer-header">
            <h4><i class="bi bi-bell"></i> Notificaciones</h4>
            <div style="display:flex; gap: 0.5rem;">
              <button id="pm-notif-mark-all" class="pm-icon-btn" title="Marcar todas como leídas" style="font-size: 1rem;">
                <i class="bi bi-check2-all"></i>
              </button>
              <button class="pm-drawer-close" id="pm-notificaciones-close">
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

  renderList(notificaciones) {
    const listEl = document.getElementById('pm-notificaciones-list');
    if (!listEl) return;

    // FILTER: Apply deduplication
    const visibleNotifications = notificaciones.filter(n => {
      if (_isDuplicateNotification(n)) {
        console.log('[Panel] Skipping duplicate notification:', n.id);
        return false;
      }
      _recordNotificationReceived(n);
      return true;
    });

    if (visibleNotifications.length === 0) {
      listEl.innerHTML = `
        <div class="text-center text-muted mt-5">
          <i class="bi bi-bell-slash" style="font-size: 2rem; opacity: 0.5;"></i>
          <p class="mt-2">No tienes notificaciones recientes.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = visibleNotifications.map(n => `
      <div class="pm-notif-item ${n.estado === 'leida' ? 'leida' : ''}" data-id="${n.id}">
        <div class="pm-notif-icon ${getNotifColor(n.tipo)}">
          <i class="bi ${getNotifIcon(n.tipo)}"></i>
        </div>
        <div class="pm-notif-content">
          <div class="pm-notif-title">${n.titulo}</div>
          <div class="pm-notif-msg">${n.mensaje}</div>
          <div class="pm-notif-time">${formatRelativeTime(n.created_at)}</div>
        </div>
        ${n.estado !== 'leida' ? '<div class="pm-notif-dot"></div>' : ''}
      </div>
    `).join('');

    // Marcar como leída al clickear (si no es local/In-app simple)
    listEl.querySelectorAll('.pm-notif-item').forEach(el => {
      el.addEventListener('click', () => {
        marcarLeida(el.dataset.id);
        // Aquí se podría navegar a la sesión si es necesario
      });
    });
  },

  open() {
    this.init();
    const overlay = document.getElementById('pm-notificaciones-drawer-overlay');
    overlay.style.display = 'block';
    // Forzar reflow para la transición
    overlay.offsetHeight;
    overlay.classList.add('open');
    isOpen = true;
    
    // Al abrir el panel, traemos la última data
    fetchNotificaciones();
  },

  close() {
    const overlay = document.getElementById('pm-notificaciones-drawer-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
    }
    isOpen = false;
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
    .pm-notif-time {
      font-size: 0.7rem;
      color: var(--pm-text-muted);
      margin-top: 0.4rem;
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

    /* Dark mode */
    [data-portal-theme="dark"] .pm-notif-item:hover {
      background: rgba(255, 255, 255, 0.04);
    }
  `;
  document.head.appendChild(style);
}
