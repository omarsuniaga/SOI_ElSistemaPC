/**
 * outboxView.js — Outbox del simulador (Slice 3).
 * Muestra `sim_outbox`: destinatario_original (lo que decidió el LLM) vs
 * destinatario_redirigido (siempre = whitelist, spec: simulador-salida-segura)
 * y el estado de envío de cada mensaje.
 *
 * Patrón de vista: export function render...(container, opciones) -> { teardown() }
 *
 * Verificación manual (no cubierta por Vitest — wiring DOM puro):
 *   1. Abrir /simulador -> Outbox.
 *   2. Confirmar que cada fila muestra AMBOS destinatarios (original vs
 *      redirigido) y que destinatario_redirigido SIEMPRE coincide con la
 *      whitelist de sim_config (+18097176627 / osuniagarivera@gmail.com).
 *   3. Confirmar que el badge de estado (pendiente/enviado/fallido) refleja
 *      sim_outbox.estado correctamente.
 */

import * as simuladorApi from '../api/simuladorApi.js'
import { mapEstadoOutboxABadge } from '../logic/simuladorFormato.js'

const RUN_DEMO_ID = '00000000-0000-0000-0000-000000000001'

const state = {
  mensajes: [],
  cargando: false,
  runId: RUN_DEMO_ID,
}

let _abortController = null

export async function renderOutboxView(container, opciones = {}) {
  _abortController?.abort()
  _abortController = new AbortController()
  state.runId = opciones.runId || RUN_DEMO_ID

  try {
    state.cargando = true
    renderLoading(container)
    state.mensajes = await simuladorApi.getOutboxPorRun(state.runId)
    state.cargando = false
    renderContent(container)
  } catch (error) {
    console.error('[outboxView] Error:', error.message)
    renderError(container, error.message)
  }

  return {
    teardown: () => {
      _abortController?.abort()
    },
  }
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
  `
}

function renderError(container, mensaje) {
  container.innerHTML = `<div class="alert alert-danger m-4"><i class="bi bi-exclamation-triangle"></i> Error: ${escapeHTML(mensaje)}</div>`
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-send fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 fs-4">Outbox</h1>
          <p class="text-muted small mb-0">Mensajes salientes simulados — SIEMPRE redirigidos a la whitelist de seguridad</p>
        </div>
      </div>

      ${
        state.mensajes.length === 0
          ? `<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> Sin mensajes en el outbox todavía</div>`
          : `<div class="table-responsive">
               <table class="table table-sm align-middle">
                 <thead>
                   <tr>
                     <th>Canal</th>
                     <th>Destinatario original</th>
                     <th>Destinatario redirigido (real)</th>
                     <th>Estado</th>
                     <th>Fecha</th>
                   </tr>
                 </thead>
                 <tbody>
                   ${state.mensajes.map(renderOutboxRow).join('')}
                 </tbody>
               </table>
             </div>`
      }
    </div>
  `
}

function renderOutboxRow(mensaje) {
  const badge = mapEstadoOutboxABadge(mensaje.estado)
  return `
    <tr>
      <td><span class="badge bg-info">${escapeHTML(mensaje.canal)}</span></td>
      <td class="text-muted">${escapeHTML(mensaje.destinatario_original)}</td>
      <td><strong>${escapeHTML(mensaje.destinatario_redirigido)}</strong></td>
      <td><span class="badge bg-${badge.color}">${badge.label}</span></td>
      <td><small class="text-muted">${new Date(mensaje.created_at).toLocaleString('es-ES')}</small></td>
    </tr>
  `
}

function escapeHTML(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
