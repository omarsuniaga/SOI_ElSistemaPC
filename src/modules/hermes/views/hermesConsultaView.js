/**
 * hermesConsultaView.js — Centro de Consulta Estratégico Hermes (SP-5 Evolution)
 *
 * Copiloto Ejecutivo del SOI:
 * - Ribbon superior de KPIs en tiempo real.
 * - Sugerencias contextuales inteligentes basadas en el estado institucional.
 * - Respuestas estructuradas con tarjetas interactivas y deep-links a casos y módulos.
 * - Motor híbrido: IA Semántica (Groq) con respaldo determinístico factual sin alucinaciones.
 * - Herramienta de copiado de minuta ejecutiva para WhatsApp/Correo.
 *
 * @param {HTMLElement} container
 */

import '../styles/tareas.css'
import '../styles/hermes-consulta.css'
import { getHermesOperationalContext } from '../api/hermesContextAggregator.js'
import { queryHermes } from '../logic/hermesQueryEngine.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { router } from '../../../core/router/router.js'

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

const state = {
  context: null,
  historial: [],
  isLoading: false,
}

export async function renderHermesConsultaView(container) {
  const ac = new AbortController()
  state.historial = []
  state.isLoading = false

  try {
    state.context = await getHermesOperationalContext()
  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger m-3">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        No se pudo obtener el estado operacional institucional: ${esc(err.message)}
      </div>
    `
    return { teardown: () => ac.abort() }
  }

  _renderUI(container)

  // ── Event Handlers ──────────────────────────────────────────────────────────

  const handleSend = async () => {
    const input = container.querySelector('#hermes-q')
    const q = input?.value?.trim()
    if (!q || state.isLoading) return

    state.historial.push({ rol: 'user', texto: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    input.value = ''
    state.isLoading = true
    _renderLog(container)

    try {
      const responseHTML = await queryHermes(q, state.context)
      state.historial.push({
        rol: 'hermes',
        html: responseHTML,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    } catch (err) {
      state.historial.push({
        rol: 'hermes',
        html: `<div class="text-danger"><i class="bi bi-exclamation-circle"></i> Error al procesar la consulta: ${esc(err.message)}</div>`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    } finally {
      state.isLoading = false
      _renderLog(container)
    }
  }

  container.addEventListener('click', (e) => {
    // Send button
    if (e.target.closest('#hermes-send')) {
      handleSend()
      return
    }

    // Dynamic suggestions chips
    const chip = e.target.closest('.hermes-sug-btn')
    if (chip) {
      const input = container.querySelector('#hermes-q')
      if (input) {
        input.value = chip.dataset.q
        handleSend()
      }
      return
    }

    // Deep link navigation
    const deepLink = e.target.closest('.hermes-deep-link')
    if (deepLink) {
      const route = deepLink.dataset.route
      const paramId = deepLink.dataset.paramId
      const paramDepto = deepLink.dataset.paramDepto
      if (route) {
        if (paramId) {
          router.navigate(route, { id: paramId })
        } else if (paramDepto) {
          router.navigate(route, { departamento: paramDepto })
        } else {
          router.navigate(route)
        }
      }
      return
    }

    // Copy executive summary
    if (e.target.closest('#hermes-btn-copiar')) {
      _copiarMinutaEjecutiva()
      return
    }

    // Clear history
    if (e.target.closest('#hermes-btn-limpiar')) {
      state.historial = []
      _renderLog(container)
      return
    }
  }, { signal: ac.signal })

  container.addEventListener('keydown', (e) => {
    if (e.target.id === 'hermes-q' && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }, { signal: ac.signal })

  return { teardown: () => ac.abort() }
}

function _renderUI(container) {
  const ctx = state.context || {}
  const { tareas = {}, procedimientos = [], atencionInmediata = [] } = ctx
  const totalAbiertas = (tareas.pendiente || 0) + (tareas.en_progreso || 0) + (tareas.bloqueada || 0)
  const tasaAvance = tareas.total > 0 ? Math.round(((tareas.completada || 0) / tareas.total) * 100) : 100

  // Build dynamic smart suggestions based on real live state
  const sugerencias = [
    '¿Cómo va la operación en general?',
    atencionInmediata.length > 0 ? '¿Qué tareas están bloqueadas y qué las traba?' : '¿Qué departamentos tienen mayor carga?',
    '¿Cómo va el cumplimiento de asistencia de maestros?',
    '¿Qué casos requieren atención inmediata de la Dirección?',
  ]

  container.innerHTML = `
    <div class="hermes-consulta-wrapper">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 class="mb-0 fw-bold"><i class="bi bi-robot text-primary me-2"></i>Consultar a Hermes</h3>
          <p class="text-muted small mb-0">Copiloto Estratégico y Operativo Institucional (SOI)</p>
        </div>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-sm btn-outline-secondary" id="hermes-btn-copiar" title="Copiar resumen para WhatsApp/Email">
            <i class="bi bi-clipboard me-1"></i> Copiar Minuta
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger" id="hermes-btn-limpiar" title="Reiniciar chat">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </div>

      <!-- Executive KPI Ribbon -->
      <div class="hermes-kpi-ribbon">
        <div class="hermes-kpi-card">
          <div class="hermes-kpi-icon primary"><i class="bi bi-diagram-3"></i></div>
          <div>
            <div class="hermes-kpi-val">${ctx.totalProcedimientos || procedimientos.length}</div>
            <div class="hermes-kpi-lbl">Procedimientos Activos</div>
          </div>
        </div>
        <div class="hermes-kpi-card">
          <div class="hermes-kpi-icon ${tareas.bloqueada > 0 ? 'danger' : 'success'}">
            <i class="bi ${tareas.bloqueada > 0 ? 'bi-exclamation-octagon-fill' : 'bi-shield-check'}"></i>
          </div>
          <div>
            <div class="hermes-kpi-val ${tareas.bloqueada > 0 ? 'text-danger' : 'text-success'}">${tareas.bloqueada || 0}</div>
            <div class="hermes-kpi-lbl">Bloqueadas / Críticas</div>
          </div>
        </div>
        <div class="hermes-kpi-card">
          <div class="hermes-kpi-icon warning"><i class="bi bi-clock-history"></i></div>
          <div>
            <div class="hermes-kpi-val">${totalAbiertas}</div>
            <div class="hermes-kpi-lbl">Tareas Abiertas</div>
          </div>
        </div>
        <div class="hermes-kpi-card">
          <div class="hermes-kpi-icon success"><i class="bi bi-graph-up-arrow"></i></div>
          <div>
            <div class="hermes-kpi-val text-success">${tasaAvance}%</div>
            <div class="hermes-kpi-lbl">Tasa de Ejecución</div>
          </div>
        </div>
      </div>

      <!-- Smart Suggestions -->
      <div class="hermes-suggestions-container">
        ${sugerencias.map((s) => `
          <button type="button" class="hermes-sug-btn" data-q="${esc(s)}">
            <i class="bi bi-chat-left-dots"></i> ${esc(s)}
          </button>
        `).join('')}
      </div>

      <!-- Chat Window Card -->
      <div class="hermes-chat-card">
        <div class="hermes-chat-header">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
              <i class="bi bi-lightning-charge-fill me-1"></i> Modo Inteligente
            </span>
            <span class="small text-muted">Datos sincronizados en tiempo real</span>
          </div>
          <span class="small text-muted"><i class="bi bi-circle-fill text-success" style="font-size:0.5rem"></i> En línea</span>
        </div>

        <div id="hermes-chat-log" class="hermes-chat-log">
          <!-- Messages inserted dynamically -->
        </div>

        <div class="hermes-input-bar">
          <div class="hermes-input-group">
            <input
              id="hermes-q"
              type="text"
              class="hermes-input-field"
              placeholder="Pregúntale a Hermes sobre el estado de la institución, cuellos de botella o departamentos…"
              autocomplete="off"
            />
            <button id="hermes-send" class="hermes-send-btn" type="button">
              <span class="hermes-send-text">Consultar</span>
              <i class="bi bi-send-fill"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  _renderLog(container)
}

function _renderLog(container) {
  const log = container.querySelector('#hermes-chat-log')
  if (!log) return

  if (state.historial.length === 0 && !state.isLoading) {
    log.innerHTML = `
      <div class="text-center py-5 my-auto text-muted">
        <i class="bi bi-robot display-4 text-primary opacity-50 mb-3 d-block"></i>
        <h5 class="fw-bold hermes-empty-title">Asistente Operativo Hermes</h5>
        <p class="small text-muted mb-0" style="max-width: 480px; margin: 0 auto;">
          Selecciona una sugerencia superior o formula cualquier consulta sobre procedimientos, tareas departamentales o cumplimiento docente.
        </p>
      </div>
    `
    return
  }

  let html = state.historial.map((m) => {
    if (m.rol === 'user') {
      return `
        <div class="hermes-msg hermes-msg-user">
          <div class="hermes-msg-bubble">${esc(m.texto)}</div>
          <span class="small text-muted text-end mt-1 pe-1">${esc(m.time || '')}</span>
        </div>
      `
    }
    return `
      <div class="hermes-msg hermes-msg-assistant">
        <div class="hermes-msg-author">
          <i class="bi bi-robot text-primary"></i> Hermes COO · ${esc(m.time || '')}
        </div>
        <div class="hermes-msg-bubble">${m.html}</div>
      </div>
    `
  }).join('')

  if (state.isLoading) {
    html += `
      <div class="hermes-msg hermes-msg-assistant">
        <div class="hermes-msg-author">
          <i class="bi bi-robot text-primary"></i> Hermes analizando...
        </div>
        <div class="hermes-msg-bubble py-3">
          <div class="d-flex align-items-center gap-2 text-muted small">
            <span class="spinner-border spinner-border-sm text-primary" role="status"></span>
            <span>Evaluando el estado operacional y métricas institucionales...</span>
          </div>
        </div>
      </div>
    `
  }

  log.innerHTML = html
  log.scrollTop = log.scrollHeight
}

function _copiarMinutaEjecutiva() {
  if (state.historial.length === 0) {
    AppToast.info('No hay respuestas para copiar en la minuta.')
    return
  }

  let textoMinuta = `📌 MINUTA OPERACIONAL INSTITUCIONAL — SOI\nFecha: ${new Date().toLocaleString()}\n\n`
  state.historial.forEach((m) => {
    if (m.rol === 'user') {
      textoMinuta += `👤 Pregunta Directiva: ${m.texto}\n`
    } else {
      const cleanText = m.html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
      textoMinuta += `🤖 Dictamen Hermes: ${cleanText}\n\n`
    }
  })

  navigator.clipboard.writeText(textoMinuta)
    .then(() => AppToast.success('Minuta ejecutiva copiada al portapapeles.'))
    .catch(() => AppToast.error('No se pudo copiar la minuta.'))
}
