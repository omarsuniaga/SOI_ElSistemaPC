/**
 * logView.js — Log en vivo del simulador (Slice 3).
 * Muestra `sim_log` en tiempo real (Supabase Realtime sobre postgres_changes,
 * mismo patrón que src/modules/hermes/views/tareasView.js `setupRealtime`),
 * con filtro por departamento.
 *
 * Patrón de vista: export function render...(container, opciones) -> { teardown() }
 *
 * Verificación manual (no cubierta por Vitest — wiring DOM + Realtime):
 *   1. Abrir /simulador -> Log, dejar la vista abierta.
 *   2. Disparar un tick desde el Panel de Control (o insertar manualmente
 *      una fila en sim_log vía SQL editor).
 *   3. Confirmar que la nueva entrada aparece en la lista sin recargar.
 *   4. Cambiar el filtro de departamento y confirmar que solo se muestran
 *      las entradas de ese departamento.
 */

import * as simuladorApi from '../api/simuladorApi.js'
import { supabase } from '../../../lib/supabaseClient.js'

const RUN_DEMO_ID = '00000000-0000-0000-0000-000000000001'
const DEPARTAMENTOS = ['DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO']

const state = {
  entradas: [],
  cargando: false,
  filtroDepartamento: 'todos',
  runId: RUN_DEMO_ID,
}

let _abortController = null
let _realtimeChannel = null

async function refreshLog(container) {
  const filtro = state.filtroDepartamento !== 'todos' ? { departamento: state.filtroDepartamento } : {}
  state.entradas = await simuladorApi.getLogPorRun(state.runId, filtro)
  renderContent(container)
  attachEvents(container)
}

function setupRealtime(container) {
  if (!supabase?.channel) return
  _realtimeChannel?.unsubscribe?.()
  _realtimeChannel = supabase
    .channel(`simulador:sim_log:${state.runId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'sim_log' },
      async (payload) => {
        if (_abortController?.signal.aborted) return
        if (payload?.new?.run_id !== state.runId) return
        try {
          await refreshLog(container)
        } catch (err) {
          console.error('[logView] Realtime refresh error:', err.message)
        }
      },
    )
    .subscribe()
}

export async function renderLogView(container, opciones = {}) {
  _abortController?.abort()
  _abortController = new AbortController()
  state.runId = opciones.runId || RUN_DEMO_ID

  try {
    state.cargando = true
    renderLoading(container)
    await refreshLog(container)
    setupRealtime(container)
  } catch (error) {
    console.error('[logView] Error:', error.message)
    renderError(container, error.message)
  }

  return {
    teardown: () => {
      _abortController?.abort()
      _realtimeChannel?.unsubscribe?.()
      _realtimeChannel = null
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
          <i class="bi bi-journal-text fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 fs-4">Log en Vivo</h1>
          <p class="text-muted small mb-0">Auditoría de acciones de agentes (sim_log)</p>
        </div>
      </div>

      <div class="mb-3">
        <select class="form-select form-select-sm" id="filtroDepartamentoLog" style="max-width: 200px;">
          <option value="todos" ${state.filtroDepartamento === 'todos' ? 'selected' : ''}>Todos los departamentos</option>
          ${DEPARTAMENTOS.map(
            (d) => `<option value="${d}" ${state.filtroDepartamento === d ? 'selected' : ''}>${d}</option>`,
          ).join('')}
        </select>
      </div>

      <div id="logList">
        ${
          state.entradas.length === 0
            ? `<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> Sin entradas de log todavía</div>`
            : state.entradas.map(renderLogRow).join('')
        }
      </div>
    </div>
  `
}

function renderLogRow(entrada) {
  return `
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <span class="badge bg-secondary me-2">${escapeHTML(entrada.departamento)}</span>
            <strong>${escapeHTML(entrada.agente)}</strong>
            <span class="text-muted"> — ${escapeHTML(entrada.accion)}</span>
          </div>
          <small class="text-muted">${new Date(entrada.created_at).toLocaleString('es-ES')}</small>
        </div>
      </div>
    </div>
  `
}

function attachEvents(container) {
  const signal = _abortController.signal
  container.querySelector('#filtroDepartamentoLog')?.addEventListener(
    'change',
    async (e) => {
      state.filtroDepartamento = e.target.value
      try {
        await refreshLog(container)
      } catch (err) {
        console.error('[logView] Error al filtrar:', err.message)
      }
    },
    { signal },
  )
}

function escapeHTML(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
