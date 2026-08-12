/**
 * gatewayConfigView.js — Panel de Control del Gateway WhatsApp (Baileys) — Subsistema 4
 *
 * Interfaz de administración institucional con:
 * - Monitor de salud y telemetría Anti-Ban en vivo
 * - Consola de diagnóstico y pruebas en caliente
 * - Formulario de políticas de ritmo, jitter y warmup
 * - Visor de cola de salida (Outbox Queue)
 */

import '../styles/gatewayConfig.css'
import * as gatewayApi from '../api/gatewayApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

const state = {
  config: null,
  stats: null,
  queue: [],
  filtroCola: 'todos',
  cargando: false,
  enviandoTest: false,
}

export async function renderGatewayConfigView(container) {
  const ac = new AbortController()
  await cargarDatos(container)

  const onClick = async (e) => {
    // Refrescar
    if (e.target.closest('#btn-refrescar-gw')) {
      return cargarDatos(container)
    }

    // Auto-inicializar
    if (e.target.closest('#btn-init-gw')) {
      try {
        state.cargando = true
        render(container)
        await gatewayApi.inicializarGatewayDefault()
        AppToast.success('Gateway inicializado con políticas Anti-Ban recomendadas.')
        await cargarDatos(container)
      } catch (err) {
        AppToast.error(`Error al inicializar: ${err.message}`)
        state.cargando = false
        render(container)
      }
      return
    }

    // Enviar mensaje de prueba
    if (e.target.closest('#btn-enviar-test')) {
      const jidInput = container.querySelector('#test-jid')
      const msgInput = container.querySelector('#test-mensaje')
      const jid = jidInput?.value?.trim()
      const msg = msgInput?.value?.trim()

      if (!jid || !msg) {
        AppToast.error('Ingresa el número telefónico y el mensaje de prueba.')
        return
      }

      try {
        state.enviandoTest = true
        render(container)
        await gatewayApi.enviarMensajePrueba(jid, msg)
        AppToast.success(`Mensaje de prueba despachado a ${jid}`)
        if (msgInput) msgInput.value = ''
        await cargarDatos(container)
      } catch (err) {
        AppToast.error(`Fallo al enviar mensaje: ${err.message}`)
      } finally {
        state.enviandoTest = false
        render(container)
      }
      return
    }

    // Guardar cambios de configuración
    if (e.target.closest('#btn-guardar-config')) {
      const form = container.querySelector('#form-gateway-config')
      if (!form) return

      const payload = {
        numero_wid: container.querySelector('#inp-numero-wid')?.value?.trim(),
        numero_nombre: container.querySelector('#inp-numero-nombre')?.value?.trim(),
        gateway_url: container.querySelector('#inp-gateway-url')?.value?.trim(),
        instance_name: container.querySelector('#inp-instance-name')?.value?.trim(),
        cap_diario: Number(container.querySelector('#inp-cap-diario')?.value || 200),
        cap_horario: Number(container.querySelector('#inp-cap-horario')?.value || 40),
        jitter_min_seg: Number(container.querySelector('#inp-jitter-min')?.value || 8),
        jitter_max_seg: Number(container.querySelector('#inp-jitter-max')?.value || 20),
        batch_size: Number(container.querySelector('#inp-batch-size')?.value || 10),
        warmup_dias: Number(container.querySelector('#inp-warmup-dias')?.value || 7),
        warmup_inicio: Number(container.querySelector('#inp-warmup-inicio')?.value || 20),
        warmup_desde: container.querySelector('#inp-warmup-desde')?.value || null,
        activo: container.querySelector('#inp-activo')?.checked ?? true,
      }

      try {
        state.cargando = true
        render(container)
        await gatewayApi.actualizarGatewayConfig(payload)
        AppToast.success('Configuración y políticas Anti-Ban actualizadas exitosamente.')
        await cargarDatos(container)
      } catch (err) {
        AppToast.error(`Error al guardar: ${err.message}`)
        state.cargando = false
        render(container)
      }
      return
    }

    // Filtros de la cola
    const filterBtn = e.target.closest('[data-queue-filter]')
    if (filterBtn) {
      state.filtroCola = filterBtn.dataset.queueFilter
      render(container)
      return
    }

    // Reintentar mensaje
    const retryBtn = e.target.closest('[data-retry-id]')
    if (retryBtn) {
      const id = retryBtn.dataset.retryId
      try {
        await gatewayApi.reintentarMensajeCola(id)
        AppToast.success('Mensaje re-encolado para reintento.')
        await cargarDatos(container)
      } catch (err) {
        AppToast.error(`Error al reintentar: ${err.message}`)
      }
      return
    }
  }

  container.addEventListener('click', onClick, { signal: ac.signal })
  return { teardown: () => ac.abort() }
}

async function cargarDatos(container) {
  try {
    state.cargando = true
    renderLoading(container)
    const [cfg, stats, queue] = await Promise.all([
      gatewayApi.obtenerGatewayConfig(),
      gatewayApi.obtenerGatewayStats(),
      gatewayApi.obtenerColaMensajes(25),
    ])
    state.config = cfg
    state.stats = stats
    state.queue = queue
    state.cargando = false
    render(container)
  } catch (err) {
    state.cargando = false
    container.innerHTML = `
      <div class="alert alert-danger m-3">
        <i class="bi bi-exclamation-octagon me-2"></i> Error al cargar Gateway: ${esc(err.message)}
      </div>`
  }
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 380px;">
      <div class="text-center text-muted">
        <div class="spinner-border text-success mb-3" role="status"></div>
        <p class="mb-0">Consultando telemetría del Gateway WhatsApp (Baileys)…</p>
      </div>
    </div>`
}

function render(container) {
  const { config, stats, queue, filtroCola, cargando, enviandoTest } = state
  const isOnline = stats?.status === 'online' && config?.activo
  const pctConsumo = stats ? Math.round((stats.enviadosHoy / Math.max(1, stats.capHoy)) * 100) : 0

  const filteredQueue = queue.filter((item) => {
    if (filtroCola === 'todos') return true
    return item.estado === filtroCola
  })

  container.innerHTML = `
    <div class="gateway-container">
      <!-- Encabezado Principal -->
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h3 class="mb-0 fw-bold">
              <i class="bi bi-whatsapp text-success me-2"></i>Gateway WhatsApp (Baileys)
            </h3>
            <span class="gateway-status-pill ${isOnline ? 'gateway-status-online' : 'gateway-status-offline'}">
              <span class="pulse-dot"></span> ${
                isOnline
                  ? 'Conectado (Instancia: ' + esc(config?.instance_name || 'soi-main') + ')'
                  : 'Desconectado ' + (stats?.secondsSinceHeartbeat != null ? `(Inactivo hace ${Math.round(stats.secondsSinceHeartbeat)}s)` : '(Sin worker)')
              }
            </span>
          </div>
          <p class="text-muted mb-0 small">Subsistema 4 · Control de Envíos Institucionales, Blindaje Anti-Ban y Cola de Mensajería</p>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button id="btn-init-gw" class="btn btn-outline-success btn-sm">
            <i class="bi bi-magic me-1"></i> Configuración Recomendada
          </button>
          <button id="btn-refrescar-gw" class="btn btn-outline-secondary btn-sm" ${cargando ? 'disabled' : ''}>
            <i class="bi bi-arrow-clockwise me-1"></i> Refrescar
          </button>
        </div>
      </div>

      <!-- Ribbon de KPIs de Telemetría Anti-Ban -->
      <div class="row row-cols-2 row-cols-md-4 g-2 mb-4 gateway-kpis-grid">
        <div class="col">
          <div class="gateway-kpi-card h-100">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="kpi-num text-success">${stats?.enviadosHoy ?? 0} <span class="fs-6 text-muted">/ ${stats?.capHoy ?? 200}</span></div>
                <div class="kpi-label">Consumo Diario (${pctConsumo}%)</div>
              </div>
              <i class="bi bi-speedometer2 fs-4 text-success opacity-75"></i>
            </div>
            <div class="progress mt-2" style="height: 4px;">
              <div class="progress-bar bg-success" style="width: ${Math.min(100, pctConsumo)}%"></div>
            </div>
          </div>
        </div>

        <div class="col">
          <div class="gateway-kpi-card h-100">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="kpi-num text-primary">Día ${stats?.diaWarmup ?? 1} <span class="fs-6 text-muted">/ ${stats?.totalDiasWarmup ?? 7}</span></div>
                <div class="kpi-label">Fase de Warmup (Maduración)</div>
              </div>
              <i class="bi bi-shield-check fs-4 text-primary opacity-75"></i>
            </div>
            <div class="small text-muted mt-2">Tope Máximo: ${stats?.capDiarioTope ?? 200} msgs/día</div>
          </div>
        </div>

        <div class="col">
          <div class="gateway-kpi-card h-100">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="kpi-num text-warning">${stats?.pendientes ?? 0}</div>
                <div class="kpi-label">Mensajes en Cola</div>
              </div>
              <i class="bi bi-hourglass-split fs-4 text-warning opacity-75"></i>
            </div>
            <div class="small text-muted mt-2">Fallidos acumulados: ${stats?.fallidos ?? 0}</div>
          </div>
        </div>

        <div class="col">
          <div class="gateway-kpi-card h-100">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="kpi-num text-info">${esc(stats?.jitterText ?? '8s – 20s')}</div>
                <div class="kpi-label">Ritmo y Retardo (Jitter)</div>
              </div>
              <i class="bi bi-stopwatch fs-4 text-info opacity-75"></i>
            </div>
            <div class="small text-muted mt-2">Límite: ${stats?.rateLimitHora ?? 40} msgs/hora</div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <!-- Columna Izquierda: Consola de Pruebas y Políticas Anti-Ban -->
        <div class="col-lg-7">
          <!-- 1. Consola de Pruebas en Caliente -->
          <div class="gateway-card p-3 mb-3">
            <div class="d-flex align-items-center gap-2 mb-3">
              <i class="bi bi-terminal text-success fs-5"></i>
              <h6 class="mb-0 fw-bold">Consola de Diagnóstico & Envío de Prueba</h6>
            </div>
            <div class="row g-2 mb-2">
              <div class="col-md-5">
                <label class="form-label small text-muted mb-1">Teléfono Destino (+1...)</label>
                <input
                  type="text"
                  id="test-jid"
                  class="form-control form-control-sm"
                  placeholder="+1 (829) 555-0199"
                  value="+1 (829) 555-0199"
                />
              </div>
              <div class="col-md-7">
                <label class="form-label small text-muted mb-1">Mensaje de Verificación</label>
                <input
                  type="text"
                  id="test-mensaje"
                  class="form-control form-control-sm"
                  placeholder="Escribe el texto de prueba…"
                  value="🔔 [SOI] Prueba de conexión del Gateway WhatsApp exitosa."
                />
              </div>
            </div>
            <div class="d-flex justify-content-end mt-2">
              <button id="btn-enviar-test" class="btn btn-success btn-sm" ${enviandoTest ? 'disabled' : ''}>
                <i class="bi ${enviandoTest ? 'bi-hourglass-split' : 'bi-send-fill'} me-1"></i>
                ${enviandoTest ? 'Despachando…' : 'Enviar Mensaje de Prueba'}
              </button>
            </div>
          </div>

          <!-- 2. Formulario de Parámetros y Políticas Anti-Ban -->
          <div class="gateway-card p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-sliders text-primary fs-5"></i>
                <h6 class="mb-0 fw-bold">Parámetros del Gateway & Blindaje Anti-Ban</h6>
              </div>
              <button id="btn-guardar-config" class="btn btn-primary btn-sm" ${cargando ? 'disabled' : ''}>
                <i class="bi bi-check-lg me-1"></i> Guardar Ajustes
              </button>
            </div>

            <form id="form-gateway-config" class="small">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold text-muted mb-1">Número Emisor Dedicado</label>
                  <input type="text" id="inp-numero-wid" class="form-control form-control-sm" value="${esc(config?.numero_wid || '')}" placeholder="+1 (829) 555-0188" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold text-muted mb-1">Nombre Amigable de la Cuenta</label>
                  <input type="text" id="inp-numero-nombre" class="form-control form-control-sm" value="${esc(config?.numero_nombre || '')}" placeholder="El Sistema Punta Cana" />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-bold text-muted mb-1">URL del Servidor Baileys</label>
                  <input type="text" id="inp-gateway-url" class="form-control form-control-sm" value="${esc(config?.gateway_url || 'https://gateway.elsistema.local/api')}" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold text-muted mb-1">Nombre de Instancia</label>
                  <input type="text" id="inp-instance-name" class="form-control form-control-sm" value="${esc(config?.instance_name || 'soi-main')}" />
                </div>

                <div class="col-12"><hr class="my-1"></div>

                <div class="col-md-4">
                  <label class="form-label fw-bold text-muted mb-1">Cap Diario (msgs/día)</label>
                  <input type="number" id="inp-cap-diario" class="form-control form-control-sm" value="${config?.cap_diario || 200}" />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold text-muted mb-1">Cap Horario (msgs/hora)</label>
                  <input type="number" id="inp-cap-horario" class="form-control form-control-sm" value="${config?.cap_horario || 40}" />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold text-muted mb-1">Tamaño de Lote (Batch)</label>
                  <input type="number" id="inp-batch-size" class="form-control form-control-sm" value="${config?.batch_size || 10}" />
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-bold text-muted mb-1">Jitter Mínimo (seg)</label>
                  <input type="number" id="inp-jitter-min" class="form-control form-control-sm" value="${config?.jitter_min_seg || 8}" />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold text-muted mb-1">Jitter Máximo (seg)</label>
                  <input type="number" id="inp-jitter-max" class="form-control form-control-sm" value="${config?.jitter_max_seg || 20}" />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold text-muted mb-1">Días de Warmup</label>
                  <input type="number" id="inp-warmup-dias" class="form-control form-control-sm" value="${config?.warmup_dias || 7}" />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-bold text-muted mb-1">Cupo Inicial Warmup (Día 1)</label>
                  <input type="number" id="inp-warmup-inicio" class="form-control form-control-sm" value="${config?.warmup_inicio || 20}" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold text-muted mb-1">Fecha de Inicio de Warmup</label>
                  <input type="date" id="inp-warmup-desde" class="form-control form-control-sm" value="${config?.warmup_desde || ''}" />
                </div>

                <div class="col-12 mt-2">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="inp-activo" ${config?.activo ? 'checked' : ''} />
                    <label class="form-check-label fw-bold" for="inp-activo">Gateway Activo y Habilitado para Envíos</label>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Columna Derecha: Monitor de Bandeja de Salida (Cola de Mensajes) -->
        <div class="col-lg-5">
          <div class="gateway-card p-3 h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-inbox-fill text-info fs-5"></i>
                <h6 class="mb-0 fw-bold">Cola de Salida (Outbox)</h6>
              </div>
              <span class="badge bg-secondary-subtle text-secondary-emphasis">${queue.length} registros</span>
            </div>

            <!-- Filtros de la cola -->
            <div class="btn-group btn-group-sm w-100 mb-3" role="group">
              <button class="btn ${filtroCola === 'todos' ? 'btn-primary' : 'btn-outline-secondary'}" data-queue-filter="todos">Todos</button>
              <button class="btn ${filtroCola === 'pendiente' ? 'btn-warning' : 'btn-outline-secondary'}" data-queue-filter="pendiente">Pendientes</button>
              <button class="btn ${filtroCola === 'enviado' ? 'btn-success' : 'btn-outline-secondary'}" data-queue-filter="enviado">Enviados</button>
              <button class="btn ${filtroCola === 'fallido' ? 'btn-danger' : 'btn-outline-secondary'}" data-queue-filter="fallido">Fallidos</button>
            </div>

            <!-- Lista de Mensajes -->
            <div class="vstack gap-2" style="max-height: 480px; overflow-y: auto;">
              ${
                filteredQueue.length === 0
                  ? '<div class="text-center text-muted small py-4">No hay mensajes en esta vista de la cola.</div>'
                  : filteredQueue.map((item) => renderQueueItem(item)).join('')
              }
            </div>
          </div>
        </div>
      </div>
    </div>`
}

function renderQueueItem(item) {
  const badgeMap = {
    pendiente: 'warning',
    enviado: 'success',
    fallido: 'danger',
    procesando: 'info',
  }
  const color = badgeMap[item.estado] || 'secondary'
  const hora = item.created_at ? new Date(item.created_at).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }) : '—'

  return `
    <div class="border rounded-3 p-2 bg-body shadow-sm small">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <span class="fw-bold"><i class="bi bi-telephone-fill text-muted me-1"></i>${esc(item.jid)}</span>
        <span class="badge bg-${color}-subtle text-${color} border border-${color}-subtle text-capitalize">${esc(item.estado)}</span>
      </div>
      <p class="mb-1 text-body-secondary text-truncate" style="max-width: 100%;">${esc(item.mensaje)}</p>
      <div class="d-flex justify-content-between align-items-center text-muted" style="font-size: 0.75rem;">
        <span><i class="bi bi-clock me-1"></i>${hora}</span>
        ${
          item.estado === 'fallido'
            ? `<button class="btn btn-link btn-sm p-0 text-danger" data-retry-id="${esc(item.id)}">Reintentar</button>`
            : `<span class="opacity-75">Intentos: ${item.intentos || 1}</span>`
        }
      </div>
    </div>`
}
