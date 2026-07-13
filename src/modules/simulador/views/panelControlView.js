/**
 * panelControlView.js — Panel de Control del Simulador (Slice 3).
 * Crear corrida (desde el seed demo), iniciar/pausar/reanudar, cambiar
 * velocidad, mostrar fecha simulada actual y progreso.
 *
 * El reloj (setInterval) vive en `simuladorEngine.js` (puro, testeado con
 * fake timers). Esta vista solo hace wiring: al cada tick, avanza 1 día
 * simulado, consulta eventos del día (`getEventosDelDia`), invoca
 * `invocarTick` si hay eventos, y refresca `fecha_actual_virtual`.
 *
 * Patrón de vista: export function render...(container, opciones) -> { teardown() }
 * (ver src/modules/hermes/views/tareasView.js).
 *
 * Verificación manual (no cubierta por Vitest — wiring DOM puro):
 *   1. Abrir /simulador -> Panel de Control -> botón "Crear corrida desde seed".
 *   2. Confirmar que aparece la corrida demo con estado "Creado" y progreso 0%.
 *   3. Pulsar "Iniciar": el estado pasa a "Corriendo", el badge de fecha
 *      simulada avanza cada `velocidad` segundos.
 *   4. Cambiar el selector de velocidad en caliente: confirmar que la
 *      cadencia de avance cambia sin reiniciar la corrida ni perder fecha.
 *   5. Pulsar "Pausar" y esperar >1 ciclo de velocidad: confirmar que la
 *      fecha simulada NO avanza mientras está pausado.
 *   6. Pulsar "Reanudar": confirmar que continúa desde la fecha pausada.
 */

import { escapeHTML } from '../../../shared/utils/sanitize.js'
import * as simuladorApi from '../api/simuladorApi.js'
import { crearSimuladorEngine } from '../logic/simuladorEngine.js'
import { formatearFechaSimulada, calcularProgresoRun, mapEstadoRunABadge } from '../logic/simuladorFormato.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const RUN_DEMO_ID = '00000000-0000-0000-0000-000000000001'
const VELOCIDADES_DISPONIBLES = [1, 2, 5, 10, 30, 60]
const UN_DIA_MS = 24 * 60 * 60 * 1000

const state = {
  run: null,
  cargando: false,
  procesandoTick: false,
}

let _abortController = null
let _engine = null

function _detenerEngine() {
  _engine?.stop()
  _engine = null
}

async function _avanzarUnDia(container) {
  if (!state.run || state.procesandoTick) return
  state.procesandoTick = true
  try {
    const fechaActual = new Date(state.run.fecha_actual_virtual)
    const fechaFin = state.run.fecha_fin_virtual ? new Date(state.run.fecha_fin_virtual) : null
    const nuevaFecha = new Date(fechaActual.getTime() + UN_DIA_MS)

    if (fechaFin && nuevaFecha.getTime() >= fechaFin.getTime()) {
      _detenerEngine()
      state.run = await simuladorApi.actualizarEstadoRun(state.run.id, 'finalizado')
      AppToast.show('Simulación finalizada: se alcanzó la fecha de fin', 'success')
      _renderSafe(container)
      return
    }

    const nuevaFechaIso = nuevaFecha.toISOString()
    const eventos = await simuladorApi.getEventosDelDia(state.run.id, nuevaFechaIso)
    if (eventos.length > 0) {
      await simuladorApi.invocarTick({
        run_id: state.run.id,
        fecha_simulada: nuevaFechaIso,
        eventos,
      })
    }
    state.run = await simuladorApi.actualizarFechaActualRun(state.run.id, nuevaFechaIso)
    _renderSafe(container)
  } catch (err) {
    console.error('[panelControlView] Error al avanzar el reloj:', err.message)
    AppToast.show(`Error al procesar el tick: ${err.message}`, 'error')
  } finally {
    state.procesandoTick = false
  }
}

function _asegurarEngine(container) {
  if (_engine) return _engine
  _engine = crearSimuladorEngine({
    velocidad: state.run?.velocidad || 10,
    onTick: () => _avanzarUnDia(container),
  })
  return _engine
}

function _renderSafe(container) {
  if (_abortController?.signal.aborted) return
  renderContent(container)
  attachEvents(container)
}

export async function renderPanelControlView(container, opciones = {}) {
  _abortController?.abort()
  _abortController = new AbortController()

  try {
    state.cargando = true
    renderLoading(container)
    state.run = await simuladorApi.getRunById(opciones.runId || RUN_DEMO_ID).catch(() => null)
    state.cargando = false
    renderContent(container)
    attachEvents(container)
  } catch (error) {
    console.error('[panelControlView] Error:', error.message)
    renderError(container, error.message)
  }

  return {
    teardown: () => {
      _abortController?.abort()
      _detenerEngine()
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
  container.innerHTML = `
    <div class="alert alert-danger m-4">
      <i class="bi bi-exclamation-triangle"></i> Error: ${escapeHTML(mensaje)}
    </div>
  `
}

function renderContent(container) {
  const run = state.run
  const badge = run ? mapEstadoRunABadge(run.estado) : null
  const progreso = run ? calcularProgresoRun(run) : 0
  const velocidadActual = run?.velocidad || 10

  container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-sliders fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 fs-4">Panel de Control</h1>
          <p class="text-muted small mb-0">Simulación operativa institucional (sandbox)</p>
        </div>
      </div>

      ${
        !run
          ? `<div class="alert alert-info">
               <p class="mb-2">No hay corrida activa.</p>
               <button class="btn btn-primary btn-sm" id="btnCrearRun">
                 <i class="bi bi-plus-circle me-1"></i>Crear corrida desde seed
               </button>
             </div>`
          : `
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 class="mb-1">${escapeHTML(run.nombre)}</h5>
                <span class="badge bg-${badge.color}">${badge.label}</span>
              </div>
              <div class="text-end">
                <small class="text-muted d-block">Fecha simulada</small>
                <strong id="fechaSimuladaActual">${formatearFechaSimulada(run.fecha_actual_virtual)}</strong>
              </div>
            </div>

            <div class="progress mb-3" style="height: 10px;">
              <div class="progress-bar" style="width: ${progreso}%;"></div>
            </div>
            <small class="text-muted">${progreso}% completado</small>

            <div class="d-flex gap-2 flex-wrap mt-3">
              <button class="btn btn-success btn-sm" id="btnIniciar" ${run.estado === 'corriendo' ? 'disabled' : ''}>
                <i class="bi bi-play-fill me-1"></i>Iniciar
              </button>
              <button class="btn btn-warning btn-sm" id="btnPausar" ${run.estado !== 'corriendo' ? 'disabled' : ''}>
                <i class="bi bi-pause-fill me-1"></i>Pausar
              </button>
              <button class="btn btn-outline-secondary btn-sm" id="btnReanudar" ${run.estado !== 'pausado' ? 'disabled' : ''}>
                <i class="bi bi-arrow-clockwise me-1"></i>Reanudar
              </button>

              <select class="form-select form-select-sm" id="selectVelocidad" style="max-width: 160px;">
                ${VELOCIDADES_DISPONIBLES.map(
                  (v) => `<option value="${v}" ${velocidadActual === v ? 'selected' : ''}>${v}s / día simulado</option>`,
                ).join('')}
              </select>
            </div>
          </div>
        </div>`
      }
    </div>
  `
}

function attachEvents(container) {
  const signal = _abortController.signal

  container.querySelector('#btnCrearRun')?.addEventListener(
    'click',
    async () => {
      try {
        state.run = await simuladorApi.getRunById(RUN_DEMO_ID)
        AppToast.show('Corrida demo cargada', 'success')
        _renderSafe(container)
      } catch (err) {
        AppToast.show(`Error al crear la corrida: ${err.message}`, 'error')
      }
    },
    { signal },
  )

  container.querySelector('#btnIniciar')?.addEventListener(
    'click',
    async () => {
      try {
        state.run = await simuladorApi.actualizarEstadoRun(state.run.id, 'corriendo')
        _asegurarEngine(container).start()
        _renderSafe(container)
      } catch (err) {
        AppToast.show(`Error al iniciar: ${err.message}`, 'error')
      }
    },
    { signal },
  )

  container.querySelector('#btnPausar')?.addEventListener(
    'click',
    async () => {
      try {
        _engine?.pause()
        state.run = await simuladorApi.actualizarEstadoRun(state.run.id, 'pausado')
        _renderSafe(container)
      } catch (err) {
        AppToast.show(`Error al pausar: ${err.message}`, 'error')
      }
    },
    { signal },
  )

  container.querySelector('#btnReanudar')?.addEventListener(
    'click',
    async () => {
      try {
        state.run = await simuladorApi.actualizarEstadoRun(state.run.id, 'corriendo')
        _asegurarEngine(container).resume()
        _renderSafe(container)
      } catch (err) {
        AppToast.show(`Error al reanudar: ${err.message}`, 'error')
      }
    },
    { signal },
  )

  container.querySelector('#selectVelocidad')?.addEventListener(
    'change',
    async (e) => {
      const nuevaVelocidad = parseInt(e.target.value, 10)
      try {
        state.run = await simuladorApi.actualizarVelocidadRun(state.run.id, nuevaVelocidad)
        _engine?.cambiarVelocidad(nuevaVelocidad)
        AppToast.show(`Velocidad actualizada: ${nuevaVelocidad}s / día simulado`, 'success')
      } catch (err) {
        AppToast.show(`Error al cambiar velocidad: ${err.message}`, 'error')
      }
    },
    { signal },
  )
}