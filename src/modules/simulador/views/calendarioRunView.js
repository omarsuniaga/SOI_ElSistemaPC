/**
 * calendarioRunView.js — Calendario simulado de la corrida (Slice 3).
 * Lista los eventos de `sim_calendario` para la corrida activa, agrupados
 * por fecha (eventos concurrentes se muestran juntos), con su estado.
 *
 * Patrón de vista: export function render...(container, opciones) -> { teardown() }
 *
 * Verificación manual (no cubierta por Vitest — wiring DOM puro):
 *   1. Abrir /simulador -> Calendario de la corrida.
 *   2. Confirmar que se listan los eventos sembrados (inscripciones,
 *      reuniones mensuales, nómina, cobranza, conciertos, cierre de ciclo).
 *   3. Confirmar que la audición de marzo aparece agrupada junto con la
 *      reunión mensual de ese mes si comparten fecha_inicio exacta.
 */

import { escapeHTML } from '../../../shared/utils/sanitize.js'
import * as simuladorApi from '../api/simuladorApi.js'
import { formatearFechaSimulada, agruparEventosPorFecha } from '../logic/simuladorFormato.js'

const RUN_DEMO_ID = '00000000-0000-0000-0000-000000000001'

const state = {
  eventos: [],
  cargando: false,
  runId: RUN_DEMO_ID,
}

let _abortController = null

export async function renderCalendarioRunView(container, opciones = {}) {
  _abortController?.abort()
  _abortController = new AbortController()
  state.runId = opciones.runId || RUN_DEMO_ID

  try {
    state.cargando = true
    renderLoading(container)
    state.eventos = await simuladorApi.getCalendarioPorRun(state.runId)
    state.cargando = false
    renderContent(container)
  } catch (error) {
    console.error('[calendarioRunView] Error:', error.message)
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

const ESTADO_EVENTO_COLORS = {
  programado: 'secondary',
  en_curso: 'info',
  completado: 'success',
  cancelado: 'danger',
}

function renderContent(container) {
  const grupos = agruparEventosPorFecha(state.eventos)
  const fechas = Object.keys(grupos).sort()

  container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-calendar-event fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 fs-4">Calendario de la Corrida</h1>
          <p class="text-muted small mb-0">${state.eventos.length} evento(s) sembrado(s)</p>
        </div>
      </div>

      ${
        fechas.length === 0
          ? `<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay eventos en esta corrida</div>`
          : fechas
              .map(
                (fecha) => `
        <div class="mb-3">
          <h6 class="text-muted mb-2">${formatearFechaSimulada(fecha)}${grupos[fecha].length > 1 ? ` <span class="badge bg-info">${grupos[fecha].length} eventos concurrentes</span>` : ''}</h6>
          ${grupos[fecha].map(renderEventoCard).join('')}
        </div>`,
              )
              .join('')
      }
    </div>
  `
}

function renderEventoCard(evento) {
  const color = ESTADO_EVENTO_COLORS[evento.estado] || 'secondary'
  return `
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body p-3 d-flex justify-content-between align-items-center">
        <div>
          <strong>${escapeHTML(evento.titulo)}</strong>
          <p class="text-muted small mb-0">${escapeHTML(evento.descripcion || '')}</p>
          <span class="text-muted small"><i class="bi bi-building"></i> ${escapeHTML(evento.departamento_responsable)} · ${escapeHTML(evento.categoria)}</span>
        </div>
        <span class="badge bg-${color}">${escapeHTML(evento.estado)}</span>
      </div>
    </div>
  `
}