/**
 * Push Diagnostic - Panel de diagnóstico para notificaciones push
 * Muestra el estado de todos los componentes necesarios para push
 */

import { 
  isPushSupported, 
  requestNotificationPermission, 
  subscribeToPush,
  isPushSubscribed,
  getSubscriptionStatus,
  testNotification
} from '../services/pushService.js'
import { enableTrap } from '../utils/focusTrap.js'
import { escapeHTML } from '../../shared/utils/sanitize.js'

export const pushDiagnostic = {
  container: null,

  async init() {
    if (document.getElementById('push-diagnostic-panel')) return

    this.createPanel()
    await this.checkStatus()
  },

  createPanel() {
    this.container = document.createElement('div')
    this.container.id = 'push-diagnostic-panel'
    this.container.innerHTML = `
      <div class="push-diagnostic-overlay" id="push-diagnostic-overlay">
        <div class="push-diagnostic-card">
          <div class="push-diagnostic-header">
            <h5><i class="bi bi-bell-fill"></i> Configuración de Notificaciones</h5>
            <button class="btn-close" id="push-diagnostic-close"></button>
          </div>
          
          <div class="push-diagnostic-body">
            <!-- Estado General -->
            <div class="mb-4">
              <div class="push-status-grid">
                <div class="push-status-item" id="status-browser">
                  <div class="status-icon"><i class="bi bi-browser-chrome"></i></div>
                  <div class="status-label">Navegador</div>
                  <div class="status-value">...</div>
                </div>
                <div class="push-status-item" id="status-permission">
                  <div class="status-icon"><i class="bi bi-shield-check"></i></div>
                  <div class="status-label">Permiso</div>
                  <div class="status-value">...</div>
                </div>
                <div class="push-status-item" id="status-serviceworker">
                  <div class="status-icon"><i class="bi bi-gear"></i></div>
                  <div class="status-label">Service Worker</div>
                  <div class="status-value">...</div>
                </div>
                <div class="push-status-item" id="status-subscription">
                  <div class="status-icon"><i class="bi bi-radioactive"></i></div>
                  <div class="status-label">Suscripción</div>
                  <div class="status-value">...</div>
                </div>
              </div>
            </div>

            <!-- Diagnóstico Detallado -->
            <div class="push-diagnostic-details" id="diagnostic-details">
              <!-- Se llena dinámicamente -->
            </div>

            <!-- Acciones -->
            <div class="push-diagnostic-actions mt-4">
              <button class="btn-push-ios-primary w-100" id="btn-enable-push">
                <i class="bi bi-bell-fill"></i> Activar Notificaciones
              </button>
              <button class="btn-push-ios-secondary w-100" id="btn-test-push">
                <i class="bi bi-send-fill"></i> Probar Notificación
              </button>
            </div>

            <!-- Resultado -->
            <div class="push-diagnostic-result mt-3" id="diagnostic-result"></div>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(this.container)
    this.injectStyles()
    this.bindEvents()
  },

  injectStyles() {
    if (document.getElementById('push-diagnostic-styles')) return;
    
    const style = document.createElement('style')
    style.id = 'push-diagnostic-styles'
    style.textContent = `
      .push-diagnostic-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        animation: pm-fade-in 0.3s ease-out;
      }
      
      .push-diagnostic-card {
        background: var(--pm-surface, #fff);
        border-radius: 24px;
        width: 92%;
        max-width: 440px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: pm-modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .push-diagnostic-header {
        background: var(--pm-primary);
        color: white;
        padding: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
      }
      
      .push-diagnostic-header h5 {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      
      .push-diagnostic-body {
        padding: 1.5rem;
        background: var(--pm-surface);
      }
      
      .push-status-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin-bottom: 1.5rem;
      }
      
      .push-status-item {
        background: var(--pm-surface-2);
        border-radius: 20px;
        padding: 1.25rem;
        text-align: center;
        border: 1px solid var(--pm-border);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .push-status-item.success { border-color: rgba(74, 222, 128, 0.4); background: rgba(74, 222, 128, 0.05); }
      .push-status-item.warning { border-color: rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.05); }
      .push-status-item.error { border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.05); }
      
      .push-status-item .status-icon {
        font-size: 1.75rem;
        margin-bottom: 0.75rem;
        color: var(--pm-primary);
      }
      
      .push-status-item.success .status-icon { color: #22c55e; }
      .push-status-item.warning .status-icon { color: #f59e0b; }
      
      .push-status-item .status-label {
        font-size: 0.7rem;
        color: var(--pm-text-muted);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 4px;
      }
      
      .push-status-item .status-value {
        font-weight: 700;
        font-size: 0.9rem;
        color: var(--pm-text);
      }
      
      .push-diagnostic-details {
        background: var(--pm-surface-2);
        border-radius: 16px;
        padding: 0.5rem 1rem;
        border: 1px solid var(--pm-border);
        margin-bottom: 1.5rem;
      }
      
      .push-diagnostic-details .log-item {
        padding: 10px 0;
        border-bottom: 1px solid var(--pm-border);
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.85rem;
        font-weight: 500;
      }
      
      .push-diagnostic-details .log-item:last-child { border-bottom: none; }
      .push-diagnostic-details .log-ok { color: #22c55e; }
      .push-diagnostic-details .log-warn { color: #f59e0b; }
      .push-diagnostic-details .log-error { color: #ef4444; }
      
      .push-diagnostic-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .btn-push-ios-primary {
        background: var(--pm-primary);
        color: white;
        border: none;
        padding: 1rem;
        border-radius: 14px;
        font-weight: 700;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
        transition: all 0.2s;
      }
      
      .btn-push-ios-secondary {
        background: var(--pm-surface-2);
        color: var(--pm-text);
        border: 1px solid var(--pm-border);
        padding: 0.85rem;
        border-radius: 14px;
        font-weight: 600;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;
      }
      
      .btn-push-ios-primary:active, .btn-push-ios-secondary:active {
        transform: scale(0.97);
        opacity: 0.8;
      }

      .push-diagnostic-result {
        margin-top: 1.25rem;
        padding: 1rem;
        border-radius: 14px;
        font-size: 0.85rem;
        font-weight: 600;
        text-align: center;
        animation: pm-fade-in 0.3s;
      }
      
      .push-diagnostic-result.success { background: rgba(34, 197, 94, 0.1); color: #166534; }
      .push-diagnostic-result.error { background: rgba(239, 68, 68, 0.1); color: #991b1b; }
      .push-diagnostic-result.info { background: rgba(59, 130, 246, 0.1); color: #1e40af; }

      [data-portal-theme="dark"] .push-diagnostic-card { background: #1c1c1e; }
      [data-portal-theme="dark"] .push-status-item { background: #2c2c2e; }
    `
    document.head.appendChild(style)
  },

  bindEvents() {
    document.getElementById('push-diagnostic-close').addEventListener('click', () => this.close())
    document.getElementById('push-diagnostic-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'push-diagnostic-overlay') this.close()
    })
    
    document.getElementById('btn-enable-push').addEventListener('click', () => this.enablePush())
    document.getElementById('btn-test-push').addEventListener('click', () => this.testPush())
  },

  async checkStatus() {
    const logs = []
    const details = document.getElementById('diagnostic-details')
    
    // Detectar dispositivo
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    
    logs.push({ 
      text: `📱 Dispositivo: ${isMobile ? (isIOS ? 'iOS' : 'Android') : 'Desktop'}`, 
      type: 'info' 
    })
    if (isMobile && isSafari) {
      logs.push({ 
        text: `⚠️ iOS Safari: Requiere iOS 16.4+ y agregar a pantalla de inicio`, 
        type: 'warn' 
      })
    }
    
    // 1. Navegador
    const browserSupported = isPushSupported()
    logs.push({ 
      text: `Navegador: ${browserSupported ? '✅ Compatible' : '❌ No compatible'}`, 
      type: browserSupported ? 'ok' : 'error' 
    })
    this.updateStatusItem('status-browser', browserSupported)
    
    // 2. Permisos
    let permStatus = 'default'
    if ('Notification' in window) {
      permStatus = Notification.permission
    }
    const permOk = permStatus === 'granted'
    logs.push({ 
      text: `Permiso: ${permStatus === 'granted' ? '✅ Otorgado' : permStatus === 'denied' ? '❌ Denegado - ve a Configuración del navegador' : '⚠️ No solicitado - click en Activar abajo'}`, 
      type: permOk ? 'ok' : 'warn' 
    })
    this.updateStatusItem('status-permission', permOk, permStatus)
    
    // 3. Service Worker
    let swStatus = 'no-registrado'
    let swActive = false
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration('/sw.js')
        if (reg) {
          swStatus = reg.active ? '✅ Activo' : '⏳ Registrado'
          swActive = !!reg.active
          logs.push({ text: `Service Worker: ${swStatus}`, type: 'ok' })
        } else {
          logs.push({ text: `Service Worker: ❌ No registrado`, type: 'error' })
        }
        this.updateStatusItem('status-serviceworker', swActive)
      } catch (e) {
        logs.push({ text: `Service Worker: ❌ Error - ${e.message}`, type: 'error' })
        this.updateStatusItem('status-serviceworker', false)
      }
    } else {
      logs.push({ text: `Service Worker: ❌ No soportado`, type: 'error' })
      this.updateStatusItem('status-serviceworker', false)
    }
    
    // 4. Suscripción Push
    let subStatus = 'no-suscrito'
    if (swActive) {
      try {
        const status = await getSubscriptionStatus()
        subStatus = status.subscribed ? '✅ Suscrito' : '❌ No suscrito'
        logs.push({ text: `Suscripción: ${subStatus}`, type: status.subscribed ? 'ok' : 'warn' })
        this.updateStatusItem('status-subscription', status.subscribed)
      } catch (e) {
        logs.push({ text: `Suscripción: ❌ Error - ${e.message}`, type: 'error' })
        this.updateStatusItem('status-subscription', false)
      }
    } else {
      logs.push({ text: `Suscripción: ⚠️ SW inactivo`, type: 'warn' })
      this.updateStatusItem('status-subscription', false)
    }

    // Mostrar logs
    details.innerHTML = logs.map(l => 
      `<div class="log-item log-${l.type}">${l.text}</div>`
    ).join('')
    
    return { browserSupported, permOk, swActive }
  },

  updateStatusItem(id, success, extra = '') {
    const el = document.getElementById(id)
    el.className = `push-status-item ${success ? 'success' : 'warning'}`
    const value = el.querySelector('.status-value')
    value.textContent = success ? '✓ Listo' : '⚠ Revisar'
    if (extra) value.textContent += ` (${extra})`
  },

  async enablePush() {
    const resultDiv = document.getElementById('diagnostic-result')
    const btn = document.getElementById('btn-enable-push')
    btn.disabled = true
    btn.innerHTML = '<span class="pm-spinner-sm me-2"></span> Configurando...'

    try {
      // Paso 1: Solicitar permiso de notificaciones
      resultDiv.className = 'push-diagnostic-result info'
      const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      
      if (isMobile && isIOS) {
        resultDiv.innerHTML = '📱 iOS detectado: Se abrirá una solicitud de permiso...'
      } else if (isMobile) {
        resultDiv.innerHTML = '📱 Android detectado: Solicitando permiso...'
      } else {
        resultDiv.innerHTML = 'Solicitando permiso de notificaciones...'
      }
      
      const { granted, error: permError } = await requestNotificationPermission()
      if (!granted) {
        const helpMsg = isMobile 
          ? '<br><br><strong>En móvil:</strong> Ve a Configuración → Safari → Notificaciones → Permitir' 
          : ''
        throw new Error((permError || 'Permiso denegado') + helpMsg)
      }

      // Paso 2: Suscribirse a Push
      resultDiv.innerHTML = 'Registrando en el sistema de notificaciones...'
      
      const result = await subscribeToPush()
      if (!result.success) {
        throw new Error(result.error || 'Error al suscribirse a push')
      }

      // Éxito
      resultDiv.className = 'push-diagnostic-result success'
      const isMobileFinal = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)
      let successMsg = '✅ ¡Notificaciones push activadas!'
      
      if (isMobileFinal) {
        successMsg += '<br><small>💡 En móvil, agrega la app a pantalla de inicio para notificaciones completas (botón Compartir → Agregar a pantalla de inicio)</small>'
      }
      resultDiv.innerHTML = successMsg
      
      await this.checkStatus()
      
      // Auto-probar después de 2 segundos
      setTimeout(() => this.testPush(), 2000)
      
    } catch (err) {
      resultDiv.className = 'push-diagnostic-result error'
      resultDiv.innerHTML = `❌ ${err.message}`
    } finally {
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-bell me-2"></i>Activar Notificaciones Push'
    }
  },

  async testPush() {
    const resultDiv = document.getElementById('diagnostic-result')
    
    try {
      const result = await testNotification()
      if (result.success) {
        resultDiv.className = 'push-diagnostic-result success'
        resultDiv.innerHTML = `✅ ${result.method === 'serviceWorker' 
          ? '¡Notificación del sistema enviada! Deberías verla en tu escritorio.' 
          : 'Notificación enviada (modo local).'}`
      } else {
        resultDiv.className = 'push-diagnostic-result error'
        resultDiv.innerHTML = `❌ ${escapeHTML(result.error)}`
      }
    } catch (err) {
      resultDiv.className = 'push-diagnostic-result error'
      resultDiv.innerHTML = `❌ Error: ${escapeHTML(err.message)}`
    }
  },

  open() {
    this.init()
    const overlay = document.getElementById('push-diagnostic-overlay')
    overlay.style.display = 'flex'

    // Focus trap
    const card = document.querySelector('#push-diagnostic-panel .push-diagnostic-card')
    if (card) {
      if (this._trap) this._trap.dispose()
      this._trap = enableTrap(card, { onClose: () => this.close() })
    }
  },

  close() {
    if (this._trap) { this._trap.dispose(); this._trap = null }
    const overlay = document.getElementById('push-diagnostic-overlay')
    if (overlay) overlay.style.display = 'none'
  }
}

// Auto-inicializar en portal de maestros
export function initPushDiagnostic() {
  // Esperar a que el usuario haga click en el icono de notificaciones
  const notifBtn = document.querySelector('[data-bs-toggle="notificaciones"], .pm-notificaciones-btn')
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      // No abrir automáticamente, solo está disponible
    })
  }
}