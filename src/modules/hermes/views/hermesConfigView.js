import { supabase } from '../../../lib/supabaseClient.js'
import { getWhatsAppConfig, saveWhatsAppConfig, getWhatsAppQueue, sendWhatsAppDirect } from '../api/whatsappService.js'
import { AppToast } from '../../../shared/components/AppToast.js'

export async function renderHermesConfigView(container) {
  container.innerHTML = `
    <div class="container-fluid p-4" style="animation: fadeIn 0.4s ease;">
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1" style="color: var(--apple-ink); letter-spacing: -0.5px;">
            ⚙️ Configuración Cerebro Hermes
          </h3>
          <p class="text-muted small mb-0">Control de canales de comunicación automatizada y pasarelas de alertas.</p>
        </div>
      </div>

      <div class="row g-4">
        <!-- Left Column: Preferences & WhatsApp config -->
        <div class="col-lg-6">
          <div class="card shadow-sm border-0 p-4 mb-4" style="border-radius: 16px; background: var(--apple-canvas);">
            <h5 class="fw-bold mb-3"><i class="bi bi-bell-fill text-primary me-2"></i>Canales de Notificación</h5>
            <p class="text-muted small">Elige cómo enviará Hermes las notificaciones al delegar protocolos de eventos.</p>
            
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="chk-push-notifications" checked>
              <label class="form-check-label fw-semibold text-dark small" for="chk-push-notifications">Notificaciones Push (Navegador/PWA)</label>
              <div class="text-muted" style="font-size: 0.75rem;">Remitente directo al dispositivo del maestro o coordinador.</div>
            </div>

            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="chk-inapp-notifications" checked>
              <label class="form-check-label fw-semibold text-dark small" for="chk-inapp-notifications">Notificaciones In-App (Bandeja Interna)</label>
              <div class="text-muted" style="font-size: 0.75rem;">Alertas visuales dentro del panel de control de usuario.</div>
            </div>

            <div class="form-check form-switch mb-4">
              <input class="form-check-input" type="checkbox" id="chk-wa-notifications">
              <label class="form-check-label fw-semibold text-dark small" for="chk-wa-notifications">Alertas Automáticas de WhatsApp</label>
              <div class="text-muted" style="font-size: 0.75rem;">Cola mensajes de texto directo a los grupos y encargados.</div>
            </div>
            
            <button id="btn-save-channels" class="btn btn-primary btn-sm rounded-3">Guardar Preferencias</button>
          </div>

          <div class="card shadow-sm border-0 p-4" style="border-radius: 16px; background: var(--apple-canvas);">
            <h5 class="fw-bold mb-3"><i class="bi bi-whatsapp text-success me-2"></i>Gateway de WhatsApp</h5>
            <p class="text-muted small">Configura la pasarela de WhatsApp basada en API REST (Baileys/Evolution API).</p>
            
            <form id="wa-config-form">
              <div class="mb-3">
                <label class="form-label small fw-semibold text-muted">URL del Gateway API</label>
                <input type="url" id="wa-gateway-url" class="form-control rounded-3" placeholder="https://api.tu-servidor-wa.com" required>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold text-muted">API Token / API Key</label>
                <input type="password" id="wa-api-key" class="form-control rounded-3" placeholder="Ingresa tu clave de autorización">
              </div>
              <div class="row g-2 mb-4">
                <div class="col-md-8">
                  <label class="form-label small fw-semibold text-muted">Nombre de Instancia</label>
                  <input type="text" id="wa-instance" class="form-control rounded-3" value="soi-main" required>
                </div>
                <div class="col-md-4 d-flex align-items-end">
                  <div class="form-check form-switch w-100 pb-2">
                    <input class="form-check-input" type="checkbox" id="wa-active" checked>
                    <label class="form-check-label small" for="wa-active">Activo</label>
                  </div>
                </div>
              </div>
              
              <button type="submit" id="btn-save-wa" class="btn btn-success rounded-3 w-100 fw-semibold text-white">
                Guardar Configuración Gateway
              </button>
            </form>

            <hr class="my-4">

            <h6 class="fw-bold mb-3">🧪 Prueba de Conexión Directa</h6>
            <div class="input-group mb-2">
              <input type="text" id="test-wa-jid" class="form-control rounded-3-start" placeholder="Número (ej: 1809xxxxxxx@s.whatsapp.net o celular)">
              <button id="btn-test-wa" class="btn btn-outline-success rounded-3-end" type="button">Enviar Test</button>
            </div>
            <div class="text-muted" style="font-size: 0.72rem;">Nota: Se requiere guardar la configuración antes de probar.</div>
          </div>
        </div>

        <!-- Right Column: Outbox Monitor Queue -->
        <div class="col-lg-6">
          <div class="card shadow-sm border-0 p-4 h-100" style="border-radius: 16px; background: var(--apple-canvas); overflow: hidden;">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0"><i class="bi bi-envelope-paper text-secondary me-2"></i>Buzón de Salida (Outbox)</h5>
              <button id="btn-refresh-queue" class="btn btn-link btn-sm text-decoration-none text-secondary p-0">
                <i class="bi bi-arrow-clockwise"></i> Actualizar
              </button>
            </div>
            <p class="text-muted small">Monitor en tiempo real de alertas encoladas para envíos de WhatsApp.</p>
            
            <div class="table-responsive" style="max-height: 480px;">
              <table class="table table-hover align-middle" style="font-size: 0.8rem;">
                <thead class="table-light">
                  <tr>
                    <th>Destinatario</th>
                    <th>Mensaje</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody id="wa-queue-list">
                  <tr>
                    <td colspan="4" class="text-center py-4 text-muted">Cargando cola de mensajes...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  // Wire elements
  const chkPush = container.querySelector('#chk-push-notifications')
  const chkInApp = container.querySelector('#chk-inapp-notifications')
  const chkWa = container.querySelector('#chk-wa-notifications')
  const btnSaveChannels = container.querySelector('#btn-save-channels')

  const waForm = container.querySelector('#wa-config-form')
  const waUrl = container.querySelector('#wa-gateway-url')
  const waKey = container.querySelector('#wa-api-key')
  const waInstance = container.querySelector('#wa-instance')
  const waActive = container.querySelector('#wa-active')

  const testJid = container.querySelector('#test-wa-jid')
  const btnTest = container.querySelector('#btn-test-wa')
  const btnRefreshQueue = container.querySelector('#btn-refresh-queue')
  const queueList = container.querySelector('#wa-queue-list')

  let currentConfig = null

  // 1. Fetch current notification preferences (from profiles metadata/config)
  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load config from profiles or a custom preference record
      const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .maybeSingle()

      // Also get config from hermes_config table if exists
      const { data: hermesConfig } = await supabase
        .from('hermes_config')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (hermesConfig) {
        chkPush.checked = hermesConfig.enable_push
        chkInApp.checked = hermesConfig.enable_in_app
        chkWa.checked = hermesConfig.enable_whatsapp
      }
    } catch (err) {
      console.error(err)
    }
  }

  // 2. Save Notification channels preferences
  btnSaveChannels.onclick = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const fields = {
        user_id: user.id,
        enable_push: chkPush.checked,
        enable_in_app: chkInApp.checked,
        enable_whatsapp: chkWa.checked,
        updated_at: new Date()
      }

      const { error } = await supabase
        .from('hermes_config')
        .upsert(fields, { onConflict: 'user_id' })

      if (error) throw error
      AppToast.show('Preferencias de notificación guardadas', 'success')
    } catch (err) {
      console.error(err)
      AppToast.show('Error al guardar preferencias: ' + err.message, 'danger')
    }
  }

  // 3. Load WhatsApp configurations
  const loadWaConfig = async () => {
    const { data, error } = await getWhatsAppConfig()
    if (error) {
      console.warn(error)
      return
    }
    if (data) {
      currentConfig = data
      waUrl.value = data.gateway_url
      waKey.value = data.api_key || ''
      waInstance.value = data.instance_name
      waActive.checked = data.activo
    }
  }

  // 4. Save WhatsApp config
  waForm.onsubmit = async (e) => {
    e.preventDefault()
    const configData = {
      gateway_url: waUrl.value.trim(),
      api_key: waKey.value.trim(),
      instance_name: waInstance.value.trim(),
      activo: waActive.checked,
      updated_at: new Date()
    }

    const { data, error } = await saveWhatsAppConfig(configData)
    if (error) {
      AppToast.show('Error al guardar configuración: ' + error.message, 'danger')
    } else {
      currentConfig = data
      AppToast.show('Configuración de WhatsApp guardada', 'success')
    }
  }

  // 5. Load WhatsApp queue
  const loadQueue = async () => {
    queueList.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Actualizando cola...</td></tr>`
    const { data, error } = await getWhatsAppQueue()
    if (error) {
      queueList.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error: ${error.message}</td></tr>`
      return
    }
    if (!data || data.length === 0) {
      queueList.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">La cola de salida está vacía.</td></tr>`
      return
    }

    queueList.innerHTML = data.map(item => {
      let badge = 'secondary'
      let statusLabel = item.estado
      if (item.estado === 'pendiente') badge = 'warning text-dark'
      else if (item.estado === 'procesando') badge = 'primary'
      else if (item.estado === 'enviado') badge = 'success'
      else if (item.estado === 'fallido') {
        badge = 'danger'
        statusLabel = `Fallido ⚠️`
      }

      const dateStr = item.created_at ? new Date(item.created_at).toLocaleTimeString() : '-'
      const cleanJid = item.jid.split('@')[0]

      return `
        <tr title="${item.error_msg || ''}">
          <td class="fw-bold">${cleanJid}</td>
          <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${item.mensaje}
          </td>
          <td><span class="badge bg-${badge} font-monospace" style="font-size: 0.65rem;">${statusLabel}</span></td>
          <td class="text-muted" style="font-size: 0.72rem;">${dateStr}</td>
        </tr>
      `
    }).join('')
  }

  // 6. Test WhatsApp Direct
  btnTest.onclick = async () => {
    const rawJid = testJid.value.trim()
    if (!rawJid) {
      AppToast.show('Por favor ingresa un número de teléfono o JID destinatario', 'warning')
      return
    }

    if (!currentConfig) {
      AppToast.show('Debe configurar y guardar el gateway antes de realizar un test.', 'warning')
      return
    }

    // Normalizar JID individual si no tiene dominio
    let finalJid = rawJid
    if (!finalJid.includes('@')) {
      // Remover no números
      let clean = finalJid.replace(/\D/g, '')
      if (clean.length === 10 && (clean.startsWith('809') || clean.startsWith('829') || clean.startsWith('849'))) {
        clean = '1' + clean // DR code prefix
      }
      finalJid = `${clean}@s.whatsapp.net`
    }

    btnTest.disabled = true
    btnTest.textContent = 'Enviando...'

    const msg = `🧪 *Test del Servidor Académico SOI - Hermes Virtual Manager*\n\nConexión establecida con éxito el ${new Date().toLocaleString()}.`
    const { success, error } = await sendWhatsAppDirect(currentConfig, finalJid, msg)

    btnTest.disabled = false
    btnTest.textContent = 'Enviar Test'

    if (success) {
      AppToast.show('¡Mensaje de test enviado con éxito!', 'success')
      loadQueue()
    } else {
      AppToast.show(`Fallo en el envío: ${error}`, 'danger')
    }
  }

  // Refresh trigger
  btnRefreshQueue.onclick = () => loadQueue()

  // Initial runs
  await loadPreferences()
  await loadWaConfig()
  await loadQueue()
}
