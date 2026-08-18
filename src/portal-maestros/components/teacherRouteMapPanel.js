/**
 * teacherRouteMapPanel.js — Panel del Mapa de Rutas del maestro (por clase)
 *
 * Compartido entre hoyView.js y asistenciaView.js: ambos abren el mismo mapa
 * SVG estilo Duolingo (anillo de luz = sin evaluar / con deuda, gris-opaco =
 * evaluado al 100%) sobre la ruta personal del maestro (maestro_routes).
 *
 * Los 3 niveles de la jerarquía tienen roles distintos al hacer click —
 * solo el Indicador es "hoja calificable"; Unidad y Objetivo son vistas de
 * resumen/agregado, nunca abren la calificación directamente:
 *   - Indicador → IndicadorGradingModal (calificar alumnos presentes).
 *   - Objetivo  → resumen de sus indicadores y el check de cada uno.
 *   - Unidad    → sinapsis (qué se aprende) + promedio de sus objetivos.
 */
import { escHTML } from '../utils/portalUtils.js'
import { openTeacherRoutePicker, openTeacherRouteBuilder } from './TeacherRouteBuilder.js'
import { openIndicadorGradingModal } from './IndicadorGradingModal.js'
import { getPersonalRoutes, getIndicadorCheckStates } from '../services/maestroDataService.js'

// Jerarquía de tamaño real: madre (Unidad) notablemente más grande que sus
// hijos (Objetivo), que a su vez son más grandes que los nietos (Indicador).
const NODE_R = { unidad: 34, objetivo: 20, indicador: 11 }
const NODE_COLOR = { unidad: '#0d6efd', objetivo: '#8b5cf6', indicador: '#10b981' }
const NODE_GLOW = { unidad: '#93c5fd', objetivo: '#c4b5fd', indicador: '#6ee7b7' }
const OFF_COLOR = '#94a3b8'

// Geometría del árbol de clusters (madre → hijos → nietos, ramificando hacia
// la derecha en vez de la serpiente vertical anterior de un solo nodo por fila).
const GAP_UNIDAD_OBJETIVO = 58
const GAP_OBJETIVO_INDICADOR = 42
const OBJ_SPACING_Y = 66
const IND_SPACING_X = 34
const BLOCK_GAP = 58
const LEFT_PAD = 46
const TOP_PAD = 58

function normalizeNullableId(value) {
  if (value == null) return null
  const text = String(value).trim()
  if (!text || text.toLowerCase() === 'null' || text.toLowerCase() === 'undefined') return null
  return text
}

/**
 * Combina check_states hijos en el estado agregado del padre:
 *   'double' solo si TODOS los hijos están 'double' (unidad/objetivo "se apagan"
 *   únicamente cuando absolutamente todo debajo fue evaluado al 100%);
 *   'single' si hay al menos un hijo con progreso (evita quedar "none" con
 *   trabajo parcial ya hecho);
 *   'none' si nadie ha tocado nada debajo.
 */
function _aggregateState(childStates) {
  if (!childStates.length) return 'none'
  if (childStates.every((s) => s === 'double')) return 'double'
  if (childStates.some((s) => s !== 'none')) return 'single'
  return 'none'
}

/**
 * Abre el mapa de rutas propio del maestro para una clase: si no tiene
 * ninguna ruta creada, abre el picker (que a su vez ofrece crear una nueva);
 * si ya tiene, muestra el panel con el mapa SVG y sus checks.
 * @param {string} claseId
 * @param {Object} maestro
 * @param {string} fechaHoy - 'YYYY-MM-DD'
 */
export async function abrirMapaDeRutas(claseId, maestro, fechaHoy) {
  const normalizedClaseId = normalizeNullableId(claseId)
  const normalizedMaestroId = normalizeNullableId(maestro?.id)

  if (!normalizedClaseId || !normalizedMaestroId) {
    console.warn('[teacherRouteMapPanel] Cannot open route map without valid ids:', {
      claseId,
      maestroId: maestro?.id,
    })
    return
  }

  const routes = await getPersonalRoutes(normalizedMaestroId, normalizedClaseId, true)

  if (!routes || routes.length === 0) {
    openTeacherRoutePicker(normalizedMaestroId, normalizedClaseId, () => {
      abrirMapaDeRutas(normalizedClaseId, { ...maestro, id: normalizedMaestroId }, fechaHoy)
    })
    return
  }

  // Fase 1: una ruta activa por clase (UNIQUE(maestro_id, clase_id) en el schema)
  const route = routes[0]
  await _renderMapaDeRutasPanel(route, normalizedClaseId, { ...maestro, id: normalizedMaestroId }, fechaHoy)
}

async function _renderMapaDeRutasPanel(route, claseId, maestro, fechaHoy) {
  const checkStates = await getIndicadorCheckStates(route.id, claseId)
  const checkByIndicador = Object.fromEntries((checkStates || []).map((c) => [c.indicador_id, c.check_state]))

  const backdrop = document.createElement('div')
  backdrop.className = 'pmr-backdrop'

  backdrop.innerHTML = `
    <div class="pmr-modal" role="dialog" aria-modal="true">
      <div class="pmr-header">
        <h3><i class="bi bi-signpost-2-fill"></i> ${escHTML(route.nombre)}</h3>
        <div class="pmr-header-actions">
          <button class="pmr-editar-btn" title="Editar unidades, objetivos e indicadores"><i class="bi bi-pencil-square"></i></button>
          <button class="pmr-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
        </div>
      </div>
      <div class="pmr-body" id="pmr-mapa-canvas">
        ${(route.unidades || []).length === 0 ? '<p class="pmr-empty">Esta ruta todavía no tiene unidades.</p>' : ''}
      </div>
    </div>
  `
  document.body.appendChild(backdrop)

  const closeModal = () => backdrop.remove()
  backdrop.querySelector('.pmr-close').addEventListener('click', closeModal)
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal()
  })

  // Directo al editor de nodos de ESTA ruta (no al picker) — Fase 1 solo permite
  // una ruta activa por clase (UNIQUE(maestro_id, clase_id)), así que el picker
  // era un paso extra sin utilidad real acá.
  backdrop.querySelector('.pmr-editar-btn').addEventListener('click', () => {
    closeModal()
    openTeacherRouteBuilder({
      maestroId: maestro.id,
      claseId,
      route,
      // `route` queda desactualizado tras guardar (nombres/nodos nuevos) — se
      // vuelve a resolver desde cero en vez de reusar la referencia vieja.
      onSaved: () => abrirMapaDeRutas(claseId, maestro, fechaHoy),
    })
  })

  const canvas = backdrop.querySelector('#pmr-mapa-canvas')
  if ((route.unidades || []).length > 0) {
    const refrescar = () => _renderMapaDeRutasPanel(route, claseId, maestro, fechaHoy)

    _renderMapaSVG(canvas, route, checkByIndicador, {
      onIndicadorClick: async (indicador, breadcrumb) => {
        closeModal()
        await openIndicadorGradingModal({
          claseId,
          fecha: fechaHoy,
          indicadorId: indicador.id,
          indicadorNombre: indicador.nombre,
          breadcrumb,
          evaluadoPor: maestro.user_id,
          onSaved: refrescar,
        })
      },
      onObjetivoClick: (objetivo, unidad) => _abrirResumenObjetivo(objetivo, unidad, checkByIndicador),
      onUnidadClick: (unidad) => _abrirResumenUnidad(unidad, checkByIndicador),
    })
  }
}

/**
 * Dibuja el mapa como un árbol de clusters, madre → hijos → nietos:
 * cada Unidad es un círculo grande a la izquierda; sus Objetivos son
 * círculos medianos que se ramifican a su derecha; los Indicadores de cada
 * objetivo son círculos chicos que se ramifican todavía más a la derecha,
 * en fila. La diferencia de tamaño ES la jerarquía — no hace falta leer
 * las etiquetas para saber qué nivel es cada nodo.
 *
 * Estado visual por nodo (Duolingo-style), agregado hacia arriba vía
 * `_aggregateState`:
 *   - 'none'/'single' → anillo de luz con gradiente (sin evaluar / con
 *     progreso parcial debajo) — se mantiene "encendido" para invitar al click.
 *   - 'double'        → círculo gris, opaco ("se apaga": todo lo que hay
 *     debajo de este nodo ya fue evaluado al 100%).
 * Insignia inferior derecha: check simple (deuda) o doble check (completo).
 */
function _renderMapaSVG(canvas, route, checkByIndicador, { onIndicadorClick, onObjetivoClick, onUnidadClick }) {
  const unidades = route.unidades || []
  if (unidades.length === 0) {
    canvas.innerHTML = '<p class="pmr-empty">Esta ruta todavía no tiene unidades.</p>'
    return
  }

  const nodes = [] // { type, node, unidad, objetivo, checkState, x, y }
  const linksHTML = []
  let maxIndicadoresEnFila = 0
  let cursorY = TOP_PAD
  const unidadX = LEFT_PAD + NODE_R.unidad
  const objX = unidadX + NODE_R.unidad + GAP_UNIDAD_OBJETIVO
  const indX0 = objX + NODE_R.objetivo + GAP_OBJETIVO_INDICADOR

  unidades.forEach((unidad) => {
    const objetivos = unidad.objetivos || []
    const objetivoStates = []
    const blockTop = cursorY

    objetivos.forEach((objetivo, oi) => {
      const objY = blockTop + oi * OBJ_SPACING_Y
      const indicadores = objetivo.indicadores || []
      const indicadorStates = indicadores.map((ind) => checkByIndicador[ind.id] || 'none')
      const objetivoState = _aggregateState(indicadorStates)
      objetivoStates.push(objetivoState)

      nodes.push({ type: 'objetivo', node: objetivo, unidad, checkState: objetivoState, x: objX, y: objY })

      indicadores.forEach((indicador, ii) => {
        const indX = indX0 + ii * IND_SPACING_X
        nodes.push({
          type: 'indicador', node: indicador, unidad, objetivo,
          checkState: checkByIndicador[indicador.id] || 'none', x: indX, y: objY,
        })
        linksHTML.push(_linkPath(objX, objY, indX, objY))
      })
      maxIndicadoresEnFila = Math.max(maxIndicadoresEnFila, indicadores.length)
    })

    const blockBottom = objetivos.length ? blockTop + (objetivos.length - 1) * OBJ_SPACING_Y : blockTop
    const unidadY = objetivos.length ? (blockTop + blockBottom) / 2 : blockTop

    nodes.unshift({ type: 'unidad', node: unidad, checkState: _aggregateState(objetivoStates), x: unidadX, y: unidadY })
    objetivos.forEach((_, oi) => {
      linksHTML.push(_linkPath(unidadX, unidadY, objX, blockTop + oi * OBJ_SPACING_Y))
    })

    cursorY = blockBottom + OBJ_SPACING_Y + BLOCK_GAP
  })

  const svgWidth = Math.max(320, indX0 + maxIndicadoresEnFila * IND_SPACING_X + 70)
  const svgHeight = cursorY - BLOCK_GAP + TOP_PAD

  const nodesHTML = nodes
    .map((n, i) => {
      const r = NODE_R[n.type]
      const encendido = n.checkState !== 'double'
      const glowId = `pmr-glow-${i}`
      const gradId = `pmr-grad-${i}`
      const titulo = n.node.nombre || ''
      const badgeR = Math.max(6, r * 0.42)
      const badgeOffset = r * 0.72

      const badge =
        n.checkState === 'double'
          ? `<circle cx="${n.x + badgeOffset}" cy="${n.y + badgeOffset}" r="${badgeR}" class="pmr-svg-badge pmr-svg-badge-double" />
             <text x="${n.x + badgeOffset}" y="${n.y + badgeOffset + badgeR * 0.35}" text-anchor="middle" class="pmr-svg-badge-text" style="font-size:${badgeR}px">✓✓</text>`
          : n.checkState === 'single'
          ? `<circle cx="${n.x + badgeOffset}" cy="${n.y + badgeOffset}" r="${badgeR}" class="pmr-svg-badge pmr-svg-badge-single" />
             <text x="${n.x + badgeOffset}" y="${n.y + badgeOffset + badgeR * 0.35}" text-anchor="middle" class="pmr-svg-badge-text" style="font-size:${badgeR}px">✓</text>`
          : ''

      // Todas las etiquetas van centradas y fuera del círculo en el eje
      // vertical (arriba para Unidad/Objetivo, abajo para Indicador) — nunca
      // al costado, porque ahí es justo donde se ramifica el siguiente nivel
      // y un nombre largo terminaba superpuesto con el próximo círculo.
      const labelHTML =
        n.type === 'indicador'
          ? `<text x="${n.x}" y="${n.y + r + 11}" text-anchor="middle" class="pmr-svg-node-label pmr-svg-node-label-indicador">${escHTML(_truncar(titulo, 10))}</text>`
          : `<text x="${n.x}" y="${n.y - r - (n.type === 'unidad' ? 12 : 9)}" text-anchor="middle" class="pmr-svg-node-label pmr-svg-node-label-${n.type}">${escHTML(_truncar(titulo, n.type === 'unidad' ? 16 : 14))}</text>`

      return `
        <g class="pmr-svg-node pmr-svg-node-${n.type}" data-idx="${i}" tabindex="0" role="button" aria-label="${escHTML(titulo)}">
          <title>${escHTML(titulo)}</title>
          ${encendido ? `<circle cx="${n.x}" cy="${n.y}" r="${r + Math.max(6, r * 0.3)}" fill="url(#${glowId})" />` : ''}
          <circle class="pmr-svg-node-main" cx="${n.x}" cy="${n.y}" r="${r}" fill="url(#${gradId})" opacity="${encendido ? 1 : 0.6}" stroke="#fff" stroke-width="${n.type === 'indicador' ? 1.5 : 2.5}" />
          ${badge}
          ${labelHTML}
        </g>
      `
    })
    .join('')

  const defsHTML = nodes
    .map((n, i) => `
      <radialGradient id="pmr-glow-${i}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${NODE_GLOW[n.type]}" stop-opacity="0.85" />
        <stop offset="100%" stop-color="${NODE_GLOW[n.type]}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="pmr-grad-${i}" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="${_lighten(n.checkState !== 'double' ? NODE_COLOR[n.type] : OFF_COLOR)}" />
        <stop offset="100%" stop-color="${n.checkState !== 'double' ? NODE_COLOR[n.type] : OFF_COLOR}" />
      </radialGradient>
    `)
    .join('')

  canvas.innerHTML = `
    <div class="pmr-svg-scroll">
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" style="display:block;">
        <defs>
          ${defsHTML}
          <filter id="pmr-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#0f172a" flood-opacity="0.18" />
          </filter>
        </defs>
        <g filter="url(#pmr-shadow)">
          ${linksHTML.join('')}
          ${nodesHTML}
        </g>
      </svg>
    </div>
  `

  canvas.querySelectorAll('.pmr-svg-node').forEach((g) => {
    const idx = Number(g.dataset.idx)
    const n = nodes[idx]
    const activate = () => {
      if (n.type === 'indicador') {
        onIndicadorClick(n.node, `${n.unidad.nombre} > ${n.objetivo.nombre}`)
      } else if (n.type === 'objetivo') {
        onObjetivoClick(n.node, n.unidad)
      } else {
        onUnidadClick(n.node)
      }
    }
    g.addEventListener('click', activate)
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        activate()
      }
    })
  })
}

/** Curva suave (Bézier cuadrática) que conecta un nodo padre con un hijo. */
function _linkPath(x1, y1, x2, y2) {
  const midX = (x1 + x2) / 2
  return `<path d="M ${x1} ${y1} Q ${midX} ${y1}, ${midX} ${(y1 + y2) / 2} T ${x2} ${y2}" class="pmr-svg-link" />`
}

function _truncar(text, max) {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

/** Aclara un color hex para el punto de luz del degradado radial de cada nodo. */
function _lighten(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((n >> 16) & 255) + 55)
  const g = Math.min(255, ((n >> 8) & 255) + 55)
  const b = Math.min(255, (n & 255) + 55)
  return `rgb(${r}, ${g}, ${b})`
}

function _checkIconHTML(state) {
  if (state === 'double') return '<i class="bi bi-check2-all pmr-resumen-check-double" title="Todos evaluados"></i>'
  if (state === 'single') return '<i class="bi bi-check2 pmr-resumen-check-single" title="Con deuda pendiente"></i>'
  return '<span class="pmr-resumen-check-none" title="Sin evaluar todavía"></span>'
}

/**
 * Resumen de un Objetivo: solo lectura, lista sus indicadores con el check
 * de cada uno. No se califica desde acá — el maestro debe tocar el nodo del
 * indicador en el mapa para eso (evita calificaciones "a ciegas" sin ver el
 * contexto completo del indicador).
 */
function _abrirResumenObjetivo(objetivo, unidad, checkByIndicador) {
  const indicadores = objetivo.indicadores || []
  const rowsHTML = indicadores.length
    ? indicadores
        .map(
          (ind) => `
        <div class="pmr-resumen-row">
          ${_checkIconHTML(checkByIndicador[ind.id] || 'none')}
          <span>${escHTML(ind.nombre)}</span>
        </div>
      `
        )
        .join('')
    : '<p class="pmr-empty">Este objetivo todavía no tiene indicadores.</p>'

  const completos = indicadores.filter((ind) => checkByIndicador[ind.id] === 'double').length

  _abrirResumenModal({
    breadcrumb: unidad.nombre,
    titulo: objetivo.nombre,
    subtitulo: indicadores.length ? `${completos}/${indicadores.length} indicadores completos` : '',
    descripcion: objetivo.descripcion,
    bodyHTML: `<div class="pmr-resumen-list">${rowsHTML}</div>
      <p class="pmr-resumen-hint"><i class="bi bi-info-circle"></i> Toca un indicador en el mapa para calificarlo.</p>`,
  })
}

/**
 * Resumen de una Unidad: sinapsis (qué se aprende, `unidad.descripcion` si
 * existe) + promedio agregado de sus objetivos. Tampoco califica directo.
 */
function _abrirResumenUnidad(unidad, checkByIndicador) {
  const objetivos = unidad.objetivos || []

  let totalIndicadores = 0
  let completosIndicadores = 0

  const rowsHTML = objetivos.length
    ? objetivos
        .map((obj) => {
          const indicadores = obj.indicadores || []
          const completos = indicadores.filter((ind) => checkByIndicador[ind.id] === 'double').length
          totalIndicadores += indicadores.length
          completosIndicadores += completos
          const state = _aggregateState(indicadores.map((ind) => checkByIndicador[ind.id] || 'none'))
          return `
            <div class="pmr-resumen-row">
              ${_checkIconHTML(state)}
              <span>${escHTML(obj.nombre)}</span>
              <span class="pmr-resumen-row-meta">${completos}/${indicadores.length}</span>
            </div>
          `
        })
        .join('')
    : '<p class="pmr-empty">Esta unidad todavía no tiene objetivos.</p>'

  const sinapsis =
    unidad.descripcion ||
    (objetivos.length
      ? `En esta unidad el alumno trabaja: ${objetivos.map((o) => o.nombre).join(', ')}.`
      : '')

  _abrirResumenModal({
    breadcrumb: '',
    titulo: unidad.nombre,
    subtitulo: totalIndicadores ? `${completosIndicadores}/${totalIndicadores} indicadores completos en total` : '',
    descripcion: sinapsis,
    bodyHTML: `<div class="pmr-resumen-list">${rowsHTML}</div>`,
  })
}

function _abrirResumenModal({ breadcrumb, titulo, subtitulo, descripcion, bodyHTML }) {
  const backdrop = document.createElement('div')
  backdrop.className = 'pmr-backdrop'
  backdrop.innerHTML = `
    <div class="pmr-modal" role="dialog" aria-modal="true">
      <div class="pmr-header">
        <div>
          ${breadcrumb ? `<div class="pmr-resumen-breadcrumb">${escHTML(breadcrumb)}</div>` : ''}
          <h3>${escHTML(titulo)}</h3>
          ${subtitulo ? `<div class="pmr-resumen-subtitulo">${escHTML(subtitulo)}</div>` : ''}
        </div>
        <button class="pmr-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="pmr-body">
        ${descripcion ? `<p class="pmr-resumen-sinapsis">${escHTML(descripcion)}</p>` : ''}
        ${bodyHTML}
      </div>
    </div>
  `
  document.body.appendChild(backdrop)
  const closeModal = () => backdrop.remove()
  backdrop.querySelector('.pmr-close').addEventListener('click', closeModal)
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal()
  })
}

if (!document.getElementById('pmr-styles')) {
  const s = document.createElement('style')
  s.id = 'pmr-styles'
  s.textContent = `
    .pmr-backdrop {
      position: fixed; inset: 0; background: rgba(15,23,42,0.55);
      display: flex; align-items: center; justify-content: center;
      z-index: 9400; padding: 1rem;
    }
    .pmr-modal {
      background: var(--pm-surface, #fff); border-radius: 16px;
      width: min(560px, 100%); max-height: 85vh; display: flex; flex-direction: column;
      box-shadow: 0 24px 64px rgba(0,0,0,0.25);
    }
    .pmr-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 1rem 1.15rem; border-bottom: 1px solid var(--pm-border, #e5e7eb);
    }
    .pmr-header h3 { margin: 0.1rem 0 0; font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem; }
    .pmr-header-actions { display: flex; gap: 0.4rem; }
    .pmr-editar-btn, .pmr-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: var(--pm-text-muted); }
    .pmr-body { padding: 1rem 1.15rem; overflow-y: auto; flex: 1; }
    .pmr-empty { color: var(--pm-text-muted); font-size: 0.85rem; text-align: center; padding: 1.5rem 0; }

    .pmr-svg-scroll { overflow-x: auto; overflow-y: hidden; margin: 0 -1.15rem; padding: 0 1.15rem; }
    .pmr-svg-link { fill: none; stroke: var(--pm-border, #cbd5e1); stroke-width: 2.5; opacity: 0.7; }
    .pmr-svg-node { cursor: pointer; }
    .pmr-svg-node:focus { outline: none; }
    .pmr-svg-node:focus .pmr-svg-node-main { stroke: #1d4ed8; }
    .pmr-svg-node-label { font-size: 11px; fill: var(--pm-text, #1f2937); }
    .pmr-svg-node-label-unidad { font-size: 13px; font-weight: 800; fill: var(--pm-text, #1f2937); }
    .pmr-svg-node-label-objetivo { font-size: 11px; font-weight: 700; fill: var(--pm-text-muted, #64748b); }
    .pmr-svg-node-label-indicador { font-size: 8px; fill: var(--pm-text-muted, #64748b); }
    .pmr-svg-badge { stroke: #fff; stroke-width: 1.5; }
    .pmr-svg-badge-double { fill: #16a34a; }
    .pmr-svg-badge-single { fill: #9ca3af; }
    .pmr-svg-badge-text { fill: #fff; font-weight: 700; }

    .pmr-resumen-breadcrumb { font-size: 0.72rem; color: var(--pm-text-muted); font-weight: 600; }
    .pmr-resumen-subtitulo { font-size: 0.75rem; color: var(--pm-primary, #3b82f6); font-weight: 700; margin-top: 0.15rem; }
    .pmr-resumen-sinapsis {
      font-size: 0.85rem; color: var(--pm-text); background: var(--pm-surface-2, #f3f4f6);
      border-radius: 10px; padding: 0.65rem 0.8rem; margin: 0 0 0.9rem;
    }
    .pmr-resumen-list { display: flex; flex-direction: column; gap: 0.35rem; }
    .pmr-resumen-row {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.65rem;
      border: 1px solid var(--pm-border, #e5e7eb); border-radius: 10px;
      background: var(--pm-surface-2, #fafafa); font-size: 0.82rem; color: var(--pm-text);
    }
    .pmr-resumen-row-meta { margin-left: auto; font-size: 0.72rem; font-weight: 700; color: var(--pm-text-muted); }
    .pmr-resumen-check-double { color: #16a34a; }
    .pmr-resumen-check-single { color: #9ca3af; }
    .pmr-resumen-check-none { display: inline-block; width: 1em; }
    .pmr-resumen-hint { font-size: 0.72rem; color: var(--pm-text-muted); margin: 0.7rem 0 0; display: flex; align-items: center; gap: 0.3rem; }

    .pm-mapa-btn {
      background: transparent; border: 2px solid var(--pm-border, #d1d5db); border-radius: 8px;
      padding: 0.5rem 0.7rem; min-width: 32px; height: 32px; font-size: 1rem;
      color: var(--pm-text-muted, #6b7280); cursor: pointer; transition: all 0.2s ease;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index: 10;
    }
    .pm-mapa-btn:hover {
      background: var(--pm-primary, #3b82f6); color: white; border-color: var(--pm-primary, #3b82f6);
      transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
  `
  document.head.appendChild(s)
}
