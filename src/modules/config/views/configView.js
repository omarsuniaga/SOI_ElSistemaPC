import {
  getGroqApiKey, setGroqApiKey,
  getOpenRouterApiKey, setOpenRouterApiKey,
  getPreferredModel, setPreferredModel
} from '../api/configApi.js'
import {
  getNotificationPreferences, saveNotificationPreferences,
  getSubscriptionStatus, isPushSupported, subscribeToPush,
  unsubscribeFromPush, testNotification, isPushSubscribed
} from '../../portal-maestros/services/pushService.js'

const FREE_MODELS = [
  { id: 'google/gemini-2.0-flash-exp', name: '🔥 Gemini 2.0 Flash (Gratis)', provider: 'openrouter' },
  { id: 'google/gemini-flash-1.5-exp', name: 'Google Gemini Flash 1.5 (Gratis)', provider: 'openrouter' },
  { id: 'google/gemma-4-31b', name: 'Google Gemma 4 31B (Gratis)', provider: 'openrouter' },
  { id: 'google/gemma-4-26b-a4b', name: 'Google Gemma 4 26B (Gratis)', provider: 'openrouter' },
  { id: 'nvidia/nemotron-3-super-8b', name: 'NVIDIA Nemotron 3 Super (Gratis)', provider: 'openrouter' },
  { id: 'nvidia/nemotron-nano-9b-v2', name: 'NVIDIA Nemotron Nano 9B (Gratis)', provider: 'openrouter' },
  { id: 'poolside/laguna-xs.2', name: 'Poolside Laguna XS (Gratis)', provider: 'openrouter' },
  { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B (Gratis)', provider: 'openrouter' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku (Gratis)', provider: 'openrouter' },
  { id: 'openrouter/auto', name: '🤖 Auto-Selector (Gratis - El mejor gratuito)', provider: 'openrouter' },
  { id: 'groq-llama-3.3-70b', name: 'LLaMA 3.3 70B (GROQ - Rápido)', provider: 'groq' },
  { id: 'groq-llama-3.1-70b', name: 'LLaMA 3.1 70B (GROQ)', provider: 'groq' }
]

function getLocalStorageKey(key) {
  try {
    return localStorage.getItem(`portal-maestros:${key}`)
  } catch { return null }
}

function saveLocalStorageKey(key, value) {
  try {
    localStorage.setItem(`portal-maestros:${key}`, value)
  } catch { /* ignore */ }
}

function getUsageStats() {
  try {
    const stored = localStorage.getItem('portal-maestros:groq-usage')
    if (!stored) return null
    return JSON.parse(stored)
  } catch { return null }
}

export async function renderConfigView(container) {
  const [groqKey, openrouterKey, preferredModel] = await Promise.all([
    getGroqApiKey() || getLocalStorageKey('groq-key') || '',
    getOpenRouterApiKey() || getLocalStorageKey('openrouter-key') || '',
    getPreferredModel() || 'google/gemini-2.0-flash-exp'
  ])

  const currentModel = FREE_MODELS.find(m => m.id === preferredModel) || FREE_MODELS[0]

  container.innerHTML = `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12 col-lg-8 mx-auto">
          
          <!-- Título -->
          <div class="d-flex align-items-center mb-4">
            <i class="bi bi-gear fs-2 me-3 text-primary"></i>
            <div>
              <h2 class="mb-0 fw-bold">Configuración del Sistema</h2>
              <small class="text-muted">Administra las API keys y preferencias de IA</small>
            </div>
          </div>

          <!-- Panel de IA -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-robot me-2"></i>
                Configuración de Inteligencia Artificial
              </h5>
              <small class="text-muted">Priorizamos modelos gratuitos para reducir costos</small>
            </div>
            <div class="card-body">
              <!-- Selector de Modelo -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Modelo de IA activo</label>
                <select class="form-select" id="preferred-model">
                  ${FREE_MODELS.map(m => `
                    <option value="${m.id}" ${m.id === preferredModel ? 'selected' : ''}>
                      ${m.name}
                    </option>
                  `).join('')}
                </select>
                <div class="form-text">Este modelo se usará por defecto en todas las requests</div>
              </div>

              <hr class="my-4">

              <!-- OpenRouter -->
              <div class="mb-4">
                <div class="d-flex align-items-center mb-2">
                  <span class="badge bg-success me-2">GRATIS</span>
                  <h6 class="mb-0 fw-bold">OpenRouter</h6>
                </div>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-cloud"></i></span>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="openrouter-api-key" 
                    placeholder="sk-or-v2-..."
                    value="${openrouterKey}"
                  >
                  <button class="btn btn-outline-secondary" type="button" id="toggle-openrouter-key">
                    <i class="bi bi-eye"></i>
                  </button>
                </div>
                <div class="form-text">
                  Modelos gratuitos: Gemini, Mistral, Claude Haiku. 
                  <a href="https://openrouter.ai/settings/keys" target="_blank">Obtener key →</a>
                </div>
              </div>

              <!-- GROQ -->
              <div class="mb-4">
                <div class="d-flex align-items-center mb-2">
                  <span class="badge bg-warning text-dark me-2">BACKUP</span>
                  <h6 class="mb-0 fw-bold">GROQ</h6>
                </div>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-lightning-charge"></i></span>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="groq-api-key" 
                    placeholder="gsk_..."
                    value="${groqKey}"
                  >
                  <button class="btn btn-outline-secondary" type="button" id="toggle-groq-key">
                    <i class="bi bi-eye"></i>
                  </button>
                </div>
                <div class="form-text">
                  LLaMA 3.3 70B - Rápido y económico. 
                  <a href="https://console.groq.com" target="_blank">Obtener key →</a>
                </div>
              </div>

              <!-- Botones -->
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-primary" id="save-all-keys">
                  <i class="bi bi-save me-2"></i>
                  Guardar Configuración
                </button>
                <button class="btn btn-outline-primary" id="test-connection">
                  <i class="bi bi-lightning-charge me-2"></i>
                  Probar Conexión
                </button>
              </div>

              <div id="config-status" class="mt-3"></div>
            </div>
          </div>

          <!-- Panel de Notificaciones -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-info bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-bell me-2"></i>
                Notificaciones
              </h5>
              <small class="text-muted">Controla tus alertas y recordatorios de clase</small>
            </div>
            <div class="card-body">
              <!-- Web Push Notifications -->
              <div class="mb-4">
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="push-enabled"
                    role="switch"
                  >
                  <label class="form-check-label" for="push-enabled">
                    <strong>Habilitar Web Push Notifications</strong>
                  </label>
                </div>
                <div class="form-text">Recibe notificaciones en el navegador aunque no tengas la app abierta</div>
                <div id="push-status" class="mt-2"></div>
              </div>

              <hr class="my-4">

              <!-- Alertas de Clase -->
              <div class="mb-4">
                <div class="form-check form-switch mb-3">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="alert-pre-class"
                    role="switch"
                    checked
                  >
                  <label class="form-check-label" for="alert-pre-class">
                    <strong>Alertas antes de clase</strong>
                  </label>
                </div>
                <div class="input-group input-group-sm" style="max-width: 200px;">
                  <span class="input-group-text">
                    <i class="bi bi-clock"></i>
                  </span>
                  <input
                    type="number"
                    class="form-control"
                    id="minutes-before-class"
                    min="1"
                    max="120"
                    value="15"
                  >
                  <span class="input-group-text">minutos</span>
                </div>
                <div class="form-text">Recibe alerta antes de que comience cada clase</div>
              </div>

              <!-- Alertas Después de Clase -->
              <div class="mb-4">
                <div class="form-check form-switch mb-3">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="alert-post-class"
                    role="switch"
                    checked
                  >
                  <label class="form-check-label" for="alert-post-class">
                    <strong>Alertas si no registras asistencia</strong>
                  </label>
                </div>
                <div class="input-group input-group-sm" style="max-width: 200px;">
                  <span class="input-group-text">
                    <i class="bi bi-clock"></i>
                  </span>
                  <input
                    type="number"
                    class="form-control"
                    id="minutes-after-class"
                    min="1"
                    max="300"
                    value="60"
                  >
                  <span class="input-group-text">minutos</span>
                </div>
                <div class="form-text">Te recordamos si no marcaste asistencia después de clase</div>
              </div>

              <hr class="my-4">

              <!-- Botones -->
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-primary" id="save-notifications">
                  <i class="bi bi-save me-2"></i>
                  Guardar Notificaciones
                </button>
                <button class="btn btn-outline-secondary" id="test-notification">
                  <i class="bi bi-send me-2"></i>
                  Probar Notificación
                </button>
              </div>

              <div id="notification-status" class="mt-3"></div>
            </div>
          </div>

          <!-- Estadísticas de Uso -->
          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-graph-down me-2"></i>
                Uso y Límites
              </h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-4">
                  <h4 class="text-primary" id="usage-minute">-</h4>
                  <small class="text-muted">Este minuto</small>
                </div>
                <div class="col-4">
                  <h4 class="text-primary" id="usage-hour">-</h4>
                  <small class="text-muted">Esta hora</small>
                </div>
                <div class="col-4">
                  <h4 class="text-secondary" id="usage-cache">-</h4>
                  <small class="text-muted">En cache</small>
                </div>
              </div>
              <hr>
              <button class="btn btn-outline-secondary btn-sm" id="clear-cache">
                <i class="bi bi-trash me-1"></i> Limpiar Cache
              </button>
            </div>
          </div>

          <!-- Información del Sistema -->
          <div class="card shadow-sm">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-info-circle me-2"></i>
                Información del Sistema
              </h5>
            </div>
            <div class="card-body">
              <table class="table table-borderless mb-0">
                <tbody>
                  <tr>
                    <td class="text-muted" style="width: 150px;">Versión</td>
                    <td>1.0.0</td>
                  </tr>
                  <tr>
                    <td class="text-muted">Modo</td>
                    <td><span class="badge bg-success">Demo</span></td>
                  </tr>
                  <tr>
                    <td class="text-muted">Proveedor</td>
                    <td>${currentModel.provider === 'groq' ? 'GROQ' : 'OpenRouter'}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">Modelo activo</td>
                    <td><code>${preferredModel}</code></td>
                  </tr>
                  <tr>
                    <td class="text-muted">Fallback</td>
                    <td>${openrouterKey && groqKey ? '<span class="text-success">Automático</span>' : (openrouterKey ? 'OpenRouter only' : 'GROQ only')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  `

  // Toggle visibility
  function toggleVisibility(inputId, btnId) {
    const input = document.getElementById(inputId)
    const btn = document.getElementById(btnId)
    if (input.type === 'password') {
      input.type = 'text'
      btn.innerHTML = '<i class="bi bi-eye-slash"></i>'
    } else {
      input.type = 'password'
      btn.innerHTML = '<i class="bi bi-eye"></i>'
    }
  }

  document.getElementById('toggle-openrouter-key').addEventListener('click', () => 
    toggleVisibility('openrouter-api-key', 'toggle-openrouter-key'))
  
  document.getElementById('toggle-groq-key').addEventListener('click', () => 
    toggleVisibility('groq-api-key', 'toggle-groq-key'))

  // Guardar
  document.getElementById('save-all-keys').addEventListener('click', async () => {
    const groq = document.getElementById('groq-api-key').value.trim()
    const openrouter = document.getElementById('openrouter-api-key').value.trim()
    const model = document.getElementById('preferred-model').value
    const status = document.getElementById('config-status')
    
    status.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div> Guardando...'
    
    try {
      if (groq) {
        await setGroqApiKey(groq)
        saveLocalStorageKey('groq-key', groq)
      }
      if (openrouter) {
        await setOpenRouterApiKey(openrouter)
        saveLocalStorageKey('openrouter-key', openrouter)
      }
      await setPreferredModel(model)
      status.innerHTML = '<div class="alert alert-success alert-dismissible fade show mb-0">' +
        '<i class="bi bi-check-circle me-1"></i> Configuración guardada correctamente' +
        '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>'
    } catch (err) {
      status.innerHTML = `<div class="alert alert-danger alert-dismissible fade show mb-0">` +
        `<i class="bi bi-exclamation-triangle me-1"></i> Error: ${err.message}` +
        `<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`
    }
  })

  // Probar conexión
  document.getElementById('test-connection').addEventListener('click', async () => {
    const status = document.getElementById('config-status')
    const model = document.getElementById('preferred-model').value
    const modelInfo = FREE_MODELS.find(m => m.id === model)
    
    status.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div> Probando conexión...'

    let key = ''
    let testUrl = ''
    
    if (modelInfo.provider === 'openrouter') {
      key = document.getElementById('openrouter-api-key').value.trim()
      testUrl = 'https://openrouter.ai/api/v1/models'
    } else {
      key = document.getElementById('groq-api-key').value.trim()
      testUrl = 'https://api.groq.com/openai/v1/models'
    }

    if (!key) {
      status.innerHTML = '<div class="alert alert-warning mb-0">Ingresa una API key para el modelo seleccionado</div>'
      return
    }

    try {
      const res = await fetch(testUrl, {
        headers: { 'Authorization': `Bearer ${key}` }
      })
      
      if (res.ok) {
        status.innerHTML = '<div class="alert alert-success alert-dismissible fade show mb-0">' +
          `<i class="bi bi-check-circle me-1"></i> Conexión exitosa con ${modelInfo.name}` +
          '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>'
      } else {
        const err = await res.text()
        status.innerHTML = `<div class="alert alert-danger alert-dismissible fade show mb-0">` +
          `<i class="bi bi-exclamation-triangle me-1"></i> Error ${res.status}: ${err.substring(0, 100)}` +
          `<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`
      }
    } catch (err) {
      status.innerHTML = `<div class="alert alert-danger mb-0">Error de conexión: ${err.message}</div>`
    }
  })

  // Actualizar stats
  function updateUsageStats() {
    const elMinute = document.getElementById('usage-minute')
    const elHour = document.getElementById('usage-hour')
    const elCache = document.getElementById('usage-cache')
    
    if (!elMinute || !elHour || !elCache) return
    
    const usage = getUsageStats()
    if (!usage) {
      elMinute.textContent = '0/10'
      elHour.textContent = '0/100'
      elCache.textContent = '0'
      return
    }
    
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    const oneHourAgo = now - 3600000
    
    const requestsLastMinute = usage.requests?.filter(ts => ts > oneMinuteAgo).length || 0
    const requestsLastHour = usage.requests?.filter(ts => ts > oneHourAgo).length || 0
    const cacheSize = usage.cache ? Object.keys(usage.cache).length : 0
    
    elMinute.textContent = `${requestsLastMinute}/10`
    elHour.textContent = `${requestsLastHour}/100`
    elCache.textContent = cacheSize
  }

  updateUsageStats()
  setInterval(updateUsageStats, 5000)

  // Limpiar cache
  document.getElementById('clear-cache').addEventListener('click', () => {
    try {
      localStorage.removeItem('portal-maestros:groq-usage')
      updateUsageStats()
      document.getElementById('config-status').innerHTML =
        '<div class="alert alert-info mb-0">Cache limpiado</div>'
    } catch (err) {
      console.error('Error clearing cache:', err)
    }
  })

  // ── Notificaciones ──

  // Cargar preferencias de notificaciones
  async function loadNotificationPreferences() {
    try {
      const prefs = await getNotificationPreferences()
      const isSubscribed = await isPushSubscribed()

      document.getElementById('alert-pre-class').checked = prefs.alerta_pre_clase ?? true
      document.getElementById('minutes-before-class').value = prefs.min_antes_clase ?? 15
      document.getElementById('alert-post-class').checked = prefs.alerta_post_clase ?? true
      document.getElementById('minutes-after-class').value = prefs.min_post_clase_sin_registro ?? 60

      // Mostrar estado de push
      if (isPushSupported()) {
        document.getElementById('push-enabled').checked = isSubscribed
        await updatePushStatus()
      } else {
        document.getElementById('push-enabled').disabled = true
        document.getElementById('push-status').innerHTML =
          '<div class="alert alert-warning alert-sm mb-0">Tu navegador no soporta Web Push</div>'
      }
    } catch (err) {
      console.error('Error loading notification preferences:', err)
    }
  }

  // Actualizar estado de push
  async function updatePushStatus() {
    const statusDiv = document.getElementById('push-status')
    try {
      const { subscribed, error } = await getSubscriptionStatus()
      if (subscribed) {
        statusDiv.innerHTML = '<div class="alert alert-success alert-sm mb-0">' +
          '<i class="bi bi-check-circle me-1"></i> Push habilitado correctamente</div>'
      } else if (error) {
        statusDiv.innerHTML = `<div class="alert alert-info alert-sm mb-0">${error}</div>`
      } else {
        statusDiv.innerHTML = ''
      }
    } catch (err) {
      console.error('Error updating push status:', err)
    }
  }

  // Toggle Web Push
  document.getElementById('push-enabled').addEventListener('change', async (e) => {
    const statusDiv = document.getElementById('notification-status')
    const checkbox = e.target

    if (checkbox.checked) {
      statusDiv.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div> Habilitando push...'
      try {
        const result = await subscribeToPush()
        if (result.success) {
          statusDiv.innerHTML = '<div class="alert alert-success alert-dismissible fade show mb-0">' +
            '<i class="bi bi-check-circle me-1"></i> Web Push habilitado' +
            '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>'
          await updatePushStatus()
        } else {
          statusDiv.innerHTML = `<div class="alert alert-danger alert-dismissible fade show mb-0">` +
            `<i class="bi bi-exclamation-triangle me-1"></i> ${result.error || 'Error al habilitar push'}` +
            `<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`
          checkbox.checked = false
        }
      } catch (err) {
        statusDiv.innerHTML = `<div class="alert alert-danger mb-0">Error: ${err.message}</div>`
        checkbox.checked = false
      }
    } else {
      statusDiv.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div> Deshabilitando push...'
      try {
        await unsubscribeFromPush()
        statusDiv.innerHTML = '<div class="alert alert-info alert-dismissible fade show mb-0">' +
          '<i class="bi bi-info-circle me-1"></i> Web Push deshabilitado' +
          '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>'
        await updatePushStatus()
      } catch (err) {
        statusDiv.innerHTML = `<div class="alert alert-danger mb-0">Error: ${err.message}</div>`
        checkbox.checked = true
      }
    }
  })

  // Guardar preferencias
  document.getElementById('save-notifications').addEventListener('click', async () => {
    const statusDiv = document.getElementById('notification-status')
    statusDiv.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div> Guardando...'

    try {
      const prefs = {
        alerta_pre_clase: document.getElementById('alert-pre-class').checked,
        min_antes_clase: parseInt(document.getElementById('minutes-before-class').value),
        alerta_post_clase: document.getElementById('alert-post-class').checked,
        min_post_clase_sin_registro: parseInt(document.getElementById('minutes-after-class').value),
      }

      const { error } = await saveNotificationPreferences(prefs)

      if (error) {
        statusDiv.innerHTML = `<div class="alert alert-danger alert-dismissible fade show mb-0">` +
          `<i class="bi bi-exclamation-triangle me-1"></i> Error: ${error}` +
          `<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`
      } else {
        statusDiv.innerHTML = '<div class="alert alert-success alert-dismissible fade show mb-0">' +
          '<i class="bi bi-check-circle me-1"></i> Preferencias guardadas correctamente' +
          '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>'
      }
    } catch (err) {
      statusDiv.innerHTML = `<div class="alert alert-danger mb-0">Error: ${err.message}</div>`
      console.error('Error saving notification preferences:', err)
    }
  })

  // Probar notificación
  document.getElementById('test-notification').addEventListener('click', async () => {
    const statusDiv = document.getElementById('notification-status')
    statusDiv.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div> Enviando notificación de prueba...'

    try {
      const success = await testNotification()
      if (success) {
        statusDiv.innerHTML = '<div class="alert alert-success alert-dismissible fade show mb-0">' +
          '<i class="bi bi-check-circle me-1"></i> Notificación de prueba enviada' +
          '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>'
      } else {
        statusDiv.innerHTML = '<div class="alert alert-warning alert-dismissible fade show mb-0">' +
          '<i class="bi bi-exclamation-triangle me-1"></i> Debes habilitar los permisos de notificación' +
          '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>'
      }
    } catch (err) {
      statusDiv.innerHTML = `<div class="alert alert-danger mb-0">Error: ${err.message}</div>`
      console.error('Error sending test notification:', err)
    }
  })

  // Cargar preferencias al inicializar
  loadNotificationPreferences()
}