import { AppModal } from '../../shared/components/AppModal.js';
import { 
  getNotificationPreferences, 
  saveNotificationPreferences, 
  isPushSubscribed, 
  subscribeToPush, 
  unsubscribeFromPush,
  testNotification
} from '../services/pushService.js';

/**
 * Modal de Configuración de Notificaciones (Apple Design)
 */
export const notifConfigModal = {
  async open() {
    const prefs = await getNotificationPreferences();
    const subscribed = await isPushSubscribed();

    AppModal.open({
      title: 'Notificaciones',
      size: 'md',
      body: this._renderBody(prefs, subscribed),
      saveText: 'Hecho',
      onShow: (container) => this._initLogic(container),
      onSave: async (container) => {
        await this._handleSave(container);
        return true;
      }
    });
  },

  _renderBody(prefs, subscribed) {
    return `
      <div class="pm-notif-config pm-fade-in">
        <p class="apple-caption mb-4">Gestiona cómo y cuándo quieres recibir las alertas del sistema SOI.</p>

        <!-- Grupo 1: Estado General -->
        <div class="pm-settings-group">
          <div class="pm-settings-row">
            <div class="pm-settings-row__icon bg-primary">
              <i class="bi bi-broadcast"></i>
            </div>
            <div class="pm-settings-row__info">
              <span class="pm-settings-row__title">Alertas Push</span>
              <span class="pm-settings-row__desc">Habilitar en este dispositivo</span>
            </div>
            <label class="pm-apple-switch">
              <input type="checkbox" id="modal-notif-push" ${subscribed ? 'checked' : ''}>
              <span class="pm-apple-switch-slider"></span>
            </label>
          </div>
        </div>

        <!-- Grupo 2: Recordatorios de Clase -->
        <div class="pm-settings-label">RECORDATORIOS DE CLASE</div>
        <div class="pm-settings-group">
          <div class="pm-settings-row">
            <div class="pm-settings-row__icon bg-warning">
              <i class="bi bi-clock-history"></i>
            </div>
            <div class="pm-settings-row__info">
              <span class="pm-settings-row__title">Antes de empezar</span>
              <select id="modal-notif-min-antes" class="pm-apple-select-inline">
                <option value="5" ${prefs.min_antes_clase === 5 ? 'selected' : ''}>5 min</option>
                <option value="15" ${prefs.min_antes_clase === 15 ? 'selected' : ''}>15 min</option>
                <option value="30" ${prefs.min_antes_clase === 30 ? 'selected' : ''}>30 min</option>
              </select>
            </div>
            <label class="pm-apple-switch">
              <input type="checkbox" id="modal-notif-pre" ${prefs.alerta_pre_clase ? 'checked' : ''}>
              <span class="pm-apple-switch-slider"></span>
            </label>
          </div>

          <div class="pm-settings-row">
            <div class="pm-settings-row__icon bg-danger">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <div class="pm-settings-row__info">
              <span class="pm-settings-row__title">Pase de lista pendiente</span>
              <select id="modal-notif-min-post" class="pm-apple-select-inline">
                <option value="30" ${prefs.min_post_clase_sin_registro === 30 ? 'selected' : ''}>30 min</option>
                <option value="60" ${prefs.min_post_clase_sin_registro === 60 ? 'selected' : ''}>1 hora</option>
              </select>
            </div>
            <label class="pm-apple-switch">
              <input type="checkbox" id="modal-notif-post" ${prefs.alerta_post_clase ? 'checked' : ''}>
              <span class="pm-apple-switch-slider"></span>
            </label>
          </div>
        </div>

        <!-- Grupo 3: Otras Alertas -->
        <div class="pm-settings-label">OTRAS ALERTAS</div>
        <div class="pm-settings-group">
          <div class="pm-settings-row">
            <div class="pm-settings-row__icon bg-info">
              <i class="bi bi-calendar-check"></i>
            </div>
            <div class="pm-settings-row__info">
              <span class="pm-settings-row__title">Resumen de 24 horas</span>
            </div>
            <label class="pm-apple-switch">
              <input type="checkbox" id="modal-notif-24h" ${prefs.alerta_24h ? 'checked' : ''}>
              <span class="pm-apple-switch-slider"></span>
            </label>
          </div>
        </div>

        <div class="mt-4">
          <button class="btn-apple-secondary w-100" id="modal-notif-test">
            <i class="bi bi-send me-2"></i> Enviar prueba de diagnóstico
          </button>
        </div>

        <style>
          .pm-settings-label {
            font-size: 0.7rem;
            font-weight: 600;
            color: var(--pm-text-muted);
            margin: 1.5rem 0 0.5rem 0.5rem;
            letter-spacing: 0.05em;
          }
          .pm-settings-group {
            background: var(--pm-surface-2);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid var(--pm-border);
          }
          .pm-settings-row {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            gap: 1rem;
            border-bottom: 1px solid var(--pm-border);
          }
          .pm-settings-row:last-child { border-bottom: none; }
          .pm-settings-row__icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.1rem;
            flex-shrink: 0;
          }
          .pm-settings-row__info { flex: 1; min-width: 0; }
          .pm-settings-row__title { display: block; font-size: 0.95rem; font-weight: 500; color: var(--pm-text); }
          .pm-settings-row__desc { display: block; font-size: 0.75rem; color: var(--pm-text-muted); }
          
          .pm-apple-select-inline {
            background: transparent;
            border: none;
            color: var(--pm-primary);
            font-size: 0.85rem;
            font-weight: 600;
            padding: 0;
            cursor: pointer;
            outline: none;
          }
          
          /* Switch iOS Style */
          .pm-apple-switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
            flex-shrink: 0;
          }
          .pm-apple-switch input { opacity: 0; width: 0; height: 0; }
          .pm-apple-switch-slider {
            position: absolute;
            cursor: pointer;
            inset: 0;
            background-color: var(--pm-border);
            transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 24px;
          }
          .pm-apple-switch-slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          input:checked + .pm-apple-switch-slider { background-color: var(--pm-success); }
          input:checked + .pm-apple-switch-slider:before { transform: translateX(20px); }
        </style>
      </div>
    `;
  },

  _initLogic(container) {
    // Test Notif
    container.querySelector('#modal-notif-test').addEventListener('click', async () => {
      const ok = await testNotification();
      if (!ok) {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Primero activa las notificaciones', type: 'warning' } 
        }));
      }
    });

    // Push Toggle
    const pushToggle = container.querySelector('#modal-notif-push');
    pushToggle.addEventListener('change', async () => {
      const original = !pushToggle.checked;
      if (pushToggle.checked) {
        const res = await subscribeToPush();
        if (!res.success) {
          pushToggle.checked = false;
          this._toast(res.error || 'Error al suscribir', 'danger');
        } else {
          this._toast('Notificaciones activadas', 'success');
        }
      } else {
        const res = await unsubscribeFromPush();
        if (res.success) this._toast('Notificaciones desactivadas', 'info');
      }
    });
  },

  async _handleSave(container) {
    const prefs = {
      alerta_pre_clase: container.querySelector('#modal-notif-pre').checked,
      min_antes_clase: parseInt(container.querySelector('#modal-notif-min-antes').value, 10),
      alerta_post_clase: container.querySelector('#modal-notif-post').checked,
      min_post_clase_sin_registro: parseInt(container.querySelector('#modal-notif-min-post').value, 10),
      alerta_24h: container.querySelector('#modal-notif-24h').checked,
      alerta_48h: true
    };
    
    await saveNotificationPreferences(prefs);
    this._toast('Preferencias guardadas', 'success');
  },

  _toast(message, type) {
    window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }));
  }
};
