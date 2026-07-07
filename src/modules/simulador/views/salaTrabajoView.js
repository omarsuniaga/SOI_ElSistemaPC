/**
 * salaTrabajoView.js — Sala de Trabajo animada (Slice 4).
 * Canvas 2D nativo (sin librerías de juego, design decisión #6): 7
 * escritorios departamentales (DIR/ACM/ADM/FIN/LOG/COM/TECNICO), cada uno
 * con un muñeco pixel-art simple dibujado con primitivas Canvas, que anima
 * su máquina de estados (idle -> working -> talking -> idle) al recibir
 * entradas de `sim_log` en tiempo real (Supabase Realtime, design decisión
 * #7, mismo patrón que `logView.js` `setupRealtime`).
 *
 * Lógica pura extraída y testeada con Vitest (RED->GREEN):
 *   - `escritorioLayout.js`      -> posiciones de los 7 escritorios
 *   - `escritorioMaquinaEstados.js` -> estado/cola de animación por muñeco
 *   - `simuladorLogMapper.js`   -> mapeo fila sim_log -> evento de animación
 *
 * Esta vista es wiring: Canvas drawing calls + suscripción Realtime +
 * requestAnimationFrame. NO tiene test automatizado (dibujo Canvas puro y
 * conexión de red) — ver checklist de verificación manual más abajo.
 *
 * Patrón de vista: export function render...(container, opciones) -> { teardown() }
 * (ver src/modules/hermes/views/tareasView.js / logView.js).
 *
 * Verificación manual (no cubierta por Vitest):
 *   1. Abrir /simulador -> Sala de Trabajo con una corrida activa.
 *   2. Confirmar que se dibujan los 7 escritorios rotulados (DIR, ACM, ADM,
 *      FIN, LOG, COM, TECNICO) en una grilla, cada uno con su muñeco en
 *      estado idle (respiración/parpadeo sutil).
 *   3. Disparar un tick desde el Panel de Control (o insertar manualmente
 *      una fila en sim_log vía SQL editor) y confirmar que el escritorio del
 *      departamento correspondiente pasa a "working" (tecleando) y luego
 *      muestra el globo de diálogo con el texto de `sim_log.accion`, sin
 *      recargar la página.
 *   4. Insertar varias filas de sim_log casi simultáneas para el mismo
 *      departamento (eventos concurrentes) y confirmar que se animan en
 *      orden, una a la vez, sin solaparse ni perderse ninguna.
 *   5. Cambiar de pestaña del navegador (o minimizar) y confirmar en
 *      DevTools que el loop de `requestAnimationFrame` se pausa
 *      (`visibilitychange`); al volver, se reanuda sin saltos raros.
 *   6. Salir de la ruta (navegar a otra vista del portal) y confirmar que
 *      no quedan animation frames ni canal Realtime abiertos (teardown).
 *   7. Alternar el toggle de tema (claro/oscuro) del shell y confirmar que
 *      el fondo/trazos del canvas se adaptan sin recargar la vista.
 *   8. Desconectar la red (o forzar que Realtime no conecte) y confirmar
 *      que el botón "Refrescar" manual sigue trayendo el estado más
 *      reciente del log como fallback.
 */

import * as simuladorApi from '../api/simuladorApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { DEPARTAMENTOS_SALA, calcularLayoutEscritorios } from '../logic/escritorioLayout.js'
import { crearEscritorioMaquinaEstados } from '../logic/escritorioMaquinaEstados.js'
import { mapLogAEventoAnimacion, esFilaDeRunActiva } from '../logic/simuladorLogMapper.js'
import { formatearFechaSimulada, mapEstadoRunABadge } from '../logic/simuladorFormato.js'

const RUN_DEMO_ID = '00000000-0000-0000-0000-000000000001'
const CANVAS_HEIGHT = 420

let _abortController = null
let _realtimeChannel = null
let _rafId = null
let _resizeObserver = null
let _canvasEl = null
let _maquinas = null
let _contadores = null
let _run = null
let _visibilityHandler = null

function _crearMaquinas() {
  const maquinas = {}
  const contadores = {}
  for (const dept of DEPARTAMENTOS_SALA) {
    maquinas[dept] = crearEscritorioMaquinaEstados()
    contadores[dept] = 0
  }
  return { maquinas, contadores }
}

async function _refrescarRun(container) {
  try {
    _run = await simuladorApi.getRunById(RUN_DEMO_ID)
  } catch {
    _run = null
  }
  _renderBarraSuperior(container)
}

function _procesarFilaLog(fila) {
  const evento = mapLogAEventoAnimacion(fila)
  _maquinas[evento.departamento]?.encolarEvento({ texto: evento.texto })
  _contadores[evento.departamento] = (_contadores[evento.departamento] || 0) + 1
  _renderLeyenda(document.getElementById('salaTrabajoLeyenda'))
}

async function _refrescarUltimasEntradas(container) {
  if (!_run) return
  try {
    const entradas = await simuladorApi.getLogPorRun(_run.id)
    // Solo re-anima la más reciente para no saturar la cola en un refresh manual.
    if (entradas[0]) _procesarFilaLog(entradas[0])
  } catch (err) {
    console.error('[salaTrabajoView] Error al refrescar log:', err.message)
  }
}

function _setupRealtime(container) {
  if (!supabase?.channel || !_run) return
  _realtimeChannel?.unsubscribe?.()
  _realtimeChannel = supabase
    .channel(`simulador:sala-trabajo:${_run.id}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'sim_log' },
      (payload) => {
        if (_abortController?.signal.aborted) return
        if (!esFilaDeRunActiva(payload, _run.id)) return
        _procesarFilaLog(payload.new)
      },
    )
    .subscribe()
}

// ─── Dibujo Canvas 2D ────────────────────────────────────────────────────────

function _colorTema() {
  const esOscuro = document.documentElement.getAttribute('data-bs-theme') === 'dark'
  return {
    fondo: esOscuro ? '#1e1e2e' : '#f5f5fa',
    escritorio: esOscuro ? '#2a2a3d' : '#ffffff',
    borde: esOscuro ? '#44445a' : '#d8d8e6',
    texto: esOscuro ? '#e4e4f0' : '#2b2b3a',
    muneco: esOscuro ? '#8b9cff' : '#4c5fd5',
    working: '#f0ad4e',
    talking: '#5cb85c',
    dialogoFondo: esOscuro ? '#33334a' : '#ffffff',
  }
}

function _dibujarMuneco(ctx, cx, cy, estado, colores, tFrame) {
  const respiro = estado === 'idle' ? Math.sin(tFrame / 500) * 1.5 : 0
  const color = estado === 'working' ? colores.working : estado === 'talking' ? colores.talking : colores.muneco

  ctx.save()
  ctx.translate(cx, cy + respiro)

  // Cabeza
  ctx.beginPath()
  ctx.arc(0, -14, 8, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()

  // Cuerpo
  ctx.beginPath()
  ctx.roundRect(-7, -6, 14, 18, 4)
  ctx.fill()

  // Parpadeo/ojos simples solo en idle
  if (estado !== 'talking') {
    ctx.fillStyle = colores.fondo
    ctx.fillRect(-4, -15, 2, 2)
    ctx.fillRect(2, -15, 2, 2)
  }

  // Manos "tecleando" en working: pequeño rebote horizontal
  if (estado === 'working') {
    const offset = Math.sin(tFrame / 90) * 3
    ctx.fillStyle = color
    ctx.fillRect(-10 + offset, 6, 4, 3)
    ctx.fillRect(6 - offset, 6, 4, 3)
  }

  ctx.restore()
}

function _dibujarGlobo(ctx, x, y, w, texto, colores) {
  const maxAncho = w - 8
  ctx.font = '11px sans-serif'
  const palabras = texto.split(' ')
  const lineas = []
  let lineaActual = ''
  for (const palabra of palabras) {
    const prueba = lineaActual ? `${lineaActual} ${palabra}` : palabra
    if (ctx.measureText(prueba).width > maxAncho && lineaActual) {
      lineas.push(lineaActual)
      lineaActual = palabra
    } else {
      lineaActual = prueba
    }
  }
  if (lineaActual) lineas.push(lineaActual)
  const lineasVisibles = lineas.slice(0, 3)

  const alturaGlobo = 14 + lineasVisibles.length * 13
  const anchoGlobo = w

  ctx.fillStyle = colores.dialogoFondo
  ctx.strokeStyle = colores.borde
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(x, y - alturaGlobo, anchoGlobo, alturaGlobo, 6)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = colores.texto
  lineasVisibles.forEach((linea, i) => {
    ctx.fillText(linea, x + 4, y - alturaGlobo + 14 + i * 13)
  })
}

function _dibujarFrame(ctx, width, height, tFrame) {
  const colores = _colorTema()
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = colores.fondo
  ctx.fillRect(0, 0, width, height)

  const layout = calcularLayoutEscritorios({ width, height })

  for (const dept of DEPARTAMENTOS_SALA) {
    const pos = layout[dept]
    const maquina = _maquinas[dept]
    const estado = maquina.getEstado()

    // Escritorio
    ctx.fillStyle = colores.escritorio
    ctx.strokeStyle = colores.borde
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(pos.x, pos.y, pos.w, pos.h, 8)
    ctx.fill()
    ctx.stroke()

    // Etiqueta del departamento
    ctx.fillStyle = colores.texto
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(dept, pos.x + 8, pos.y + 16)

    // Contador de acciones
    ctx.font = '10px sans-serif'
    ctx.fillStyle = colores.borde
    ctx.fillText(`${_contadores[dept] || 0} acción(es)`, pos.x + 8, pos.y + pos.h - 6)

    // Muñeco centrado en el escritorio
    const cx = pos.x + pos.w / 2
    const cy = pos.y + pos.h / 2 + 6
    _dibujarMuneco(ctx, cx, cy, estado, colores, tFrame)

    // Globo de diálogo si está talking
    if (estado === 'talking' && maquina.getDialogo()) {
      _dibujarGlobo(ctx, pos.x + 4, pos.y + pos.h / 2 - 14, pos.w - 8, maquina.getDialogo(), colores)
    }
  }
}

function _ajustarTamanoCanvas(canvas) {
  const parent = canvas.parentElement
  if (!parent) return
  const width = Math.max(320, parent.clientWidth)
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = CANVAS_HEIGHT * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${CANVAS_HEIGHT}px`
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function _iniciarLoopAnimacion(canvas) {
  const ctx = canvas.getContext('2d')

  function frame(t) {
    if (document.hidden) {
      // Pausado mientras la pestaña no está visible; no se agenda el
      // siguiente rAF hasta que 'visibilitychange' lo reactive.
      _rafId = null
      return
    }
    const width = parseInt(canvas.style.width, 10) || canvas.width
    _dibujarFrame(ctx, width, CANVAS_HEIGHT, t)
    _rafId = requestAnimationFrame(frame)
  }

  _rafId = requestAnimationFrame(frame)
}

function _pausarLoop() {
  if (_rafId != null) {
    cancelAnimationFrame(_rafId)
    _rafId = null
  }
}

function _reanudarLoopSiVisible() {
  if (_rafId == null && !document.hidden && _canvasEl) {
    _iniciarLoopAnimacion(_canvasEl)
  }
}

// ─── Render DOM (barra superior + leyenda + canvas) ─────────────────────────

function _renderBarraSuperior(container) {
  const el = container.querySelector('#salaTrabajoBarra')
  if (!el) return
  const badge = _run ? mapEstadoRunABadge(_run.estado) : null
  el.innerHTML = `
    <div class="d-flex flex-wrap gap-3 align-items-center">
      <span class="text-muted small">Fecha simulada: <strong>${_run ? formatearFechaSimulada(_run.fecha_actual_virtual) : '—'}</strong></span>
      ${badge ? `<span class="badge bg-${badge.color}">${badge.label}</span>` : ''}
      <span class="text-muted small">Velocidad: <strong>${_run?.velocidad || '—'}s / día simulado</strong></span>
      <button class="btn btn-outline-secondary btn-sm ms-auto" id="btnRefrescarSala">
        <i class="bi bi-arrow-clockwise me-1"></i>Refrescar
      </button>
    </div>
  `
}

function _renderLeyenda(el) {
  if (!el) return
  el.innerHTML = DEPARTAMENTOS_SALA.map(
    (dept) => `<span class="badge bg-light text-dark border me-2 mb-1">${dept}: ${_contadores[dept] || 0}</span>`,
  ).join('')
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

export async function renderSalaTrabajoView(container, opciones = {}) {
  _abortController?.abort()
  _abortController = new AbortController()

  const { maquinas, contadores } = _crearMaquinas()
  _maquinas = maquinas
  _contadores = contadores

  try {
    renderLoading(container)
    _run = await simuladorApi.getRunById(opciones.runId || RUN_DEMO_ID).catch(() => null)

    container.innerHTML = `
      <div class="page-container">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="brand-badge bg-secondary bg-opacity-10 text-secondary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-easel2 fs-4"></i>
          </div>
          <div>
            <h1 class="mb-0 fs-4">Sala de Trabajo</h1>
            <p class="text-muted small mb-0">Animación en vivo de la corrida simulada</p>
          </div>
        </div>

        <div id="salaTrabajoBarra" class="mb-3"></div>

        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body p-2">
            <canvas id="salaTrabajoCanvas" style="width:100%; height:${CANVAS_HEIGHT}px; display:block;"></canvas>
          </div>
        </div>

        <div id="salaTrabajoLeyenda" class="d-flex flex-wrap"></div>
      </div>
    `

    _renderBarraSuperior(container)
    _renderLeyenda(container.querySelector('#salaTrabajoLeyenda'))

    _canvasEl = container.querySelector('#salaTrabajoCanvas')
    _ajustarTamanoCanvas(_canvasEl)
    _iniciarLoopAnimacion(_canvasEl)

    if (typeof ResizeObserver !== 'undefined') {
      _resizeObserver = new ResizeObserver(() => _ajustarTamanoCanvas(_canvasEl))
      _resizeObserver.observe(_canvasEl.parentElement)
    }

    _visibilityHandler = () => {
      if (document.hidden) {
        _pausarLoop()
      } else {
        _reanudarLoopSiVisible()
      }
    }
    document.addEventListener('visibilitychange', _visibilityHandler, { signal: _abortController.signal })

    if (_run) _setupRealtime(container)

    container.querySelector('#btnRefrescarSala')?.addEventListener(
      'click',
      async () => {
        await _refrescarRun(container)
        await _refrescarUltimasEntradas(container)
      },
      { signal: _abortController.signal },
    )
  } catch (error) {
    console.error('[salaTrabajoView] Error:', error.message)
    renderError(container, error.message)
  }

  return {
    teardown: () => {
      _abortController?.abort()
      _pausarLoop()
      _resizeObserver?.disconnect()
      _resizeObserver = null
      _realtimeChannel?.unsubscribe?.()
      _realtimeChannel = null
      _canvasEl = null
      _visibilityHandler = null
    },
  }
}

function escapeHTML(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
