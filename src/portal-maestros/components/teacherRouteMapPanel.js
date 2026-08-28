/**
 * teacherRouteMapPanel.js — Panel del Mapa de Rutas Vertical estilo Duolingo
 *
 * Incluye:
 * - Modal a pantalla completa (100vw / 100vh) con ambient backdrop y shimmer.
 * - S-Curve trail vertical con nodos 3D estilo Duolingo.
 * - Popover de Misión flotante e interactivo al tocar un nodo.
 * - Soporte para candados de prerrequisitos 🔒.
 * - Auto-scroll inteligente al nodo activo.
 */

import { escHTML } from "../utils/portalUtils.js"
import { openTeacherRoutePicker, openTeacherRouteBuilder } from "./TeacherRouteBuilder.js"
import { openIndicadorGradingModal } from "./IndicadorGradingModal.js"
import { getPersonalRoutes, getIndicadorCheckStates } from "../services/maestroDataService.js"
import { supabase } from "../../lib/supabaseClient.js"

export async function abrirMapaDeRutas(claseId, maestro, fechaHoy) {
  const routes = await getPersonalRoutes(maestro.id, claseId, true)

  if (!routes || routes.length === 0) {
    openTeacherRoutePicker(maestro.id, claseId, () => {
      abrirMapaDeRutas(claseId, maestro, fechaHoy)
    })
    return
  }

  const route = routes[0]
  await _renderMapaDeRutasPanel(route, claseId, maestro, fechaHoy)
}

async function _renderMapaDeRutasPanel(route, claseId, maestro, fechaHoy) {
  const checkStates = await getIndicadorCheckStates(route.id, claseId)
  const checkByIndicador = Object.fromEntries((checkStates || []).map((c) => [c.indicador_id, c.check_state]))

  // Fetch all prerequisites in parallel
  let prereqMap = {}
  try {
    const { data: prereqs } = await supabase
      .from("indicador_prerequisito")
      .select("indicador_id, prerequisito_indicador_id")

    if (prereqs) {
      prereqs.forEach((p) => {
        prereqMap[p.indicador_id] = p.prerequisito_indicador_id
      })
    }
  } catch (_e) {
    prereqMap = {}
  }

  _injectDuolingoStyles()

  // Calculate stats
  let totalIndicadores = 0
  let dominadosCount = 0
  let enProgresoCount = 0

  const unidades = route.unidades || []
  const allIndicatorsMap = {}

  unidades.forEach((u) => {
    (u.objetivos || []).forEach((o) => {
      (o.indicadores || []).forEach((ind) => {
        totalIndicadores += 1
        allIndicatorsMap[ind.id] = { ind, obj: o, u }
        const st = checkByIndicador[ind.id] || "none"
        if (st === "double") dominadosCount += 1
        else if (st === "single") enProgresoCount += 1
      })
    })
  })

  const progressPct = totalIndicadores > 0 ? Math.round((dominadosCount / totalIndicadores) * 100) : 0

  const backdrop = document.createElement("div")
  backdrop.className = "pmr-fullscreen-backdrop"

  backdrop.innerHTML = `
    <div class="pmr-fullscreen-modal" role="dialog" aria-modal="true">
      <!-- Sticky Glass Header -->
      <div class="pmr-header-bar">
        <div class="pmr-header-left">
          <div class="pmr-header-badge"><i class="bi bi-signpost-2-fill"></i></div>
          <div class="pmr-header-info">
            <h2 class="pmr-header-title">${escHTML(route.nombre)}</h2>
            <div class="pmr-header-progress-wrap">
              <div class="pmr-progress-bar-bg">
                <div class="pmr-progress-bar-fill" style="width: ${progressPct}%;"></div>
              </div>
              <span class="pmr-progress-text">${dominadosCount}/${totalIndicadores} dominados (${progressPct}%)</span>
            </div>
          </div>
        </div>

        <div class="pmr-header-actions">
          <button type="button" class="pmr-action-btn pmr-btn-edit" id="pmr-btn-edit-route" title="Editar árbol de unidades y objetivos">
            <i class="bi bi-pencil-square"></i>
            <span class="pmr-btn-text">Editar Malla</span>
          </button>
          <button type="button" class="pmr-action-btn pmr-btn-close" id="pmr-btn-close-modal" aria-label="Cerrar mapa">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <!-- Duolingo Vertical Trail Canvas -->
      <div class="pmr-scroll-canvas" id="pmr-scroll-canvas">
        ${
          unidades.length === 0
            ? `<div class="pmr-empty-state">
                 <div class="pmr-empty-icon">🗺️</div>
                 <h3>Esta ruta aún no tiene unidades</h3>
                 <p>Presiona "Editar Malla" para agregar tus primeras unidades, objetivos e indicadores.</p>
               </div>`
            : `<div class="pmr-duolingo-trail" id="pmr-duolingo-trail"></div>`
        }
      </div>
    </div>
  `
  document.body.appendChild(backdrop)

  const closeModal = () => backdrop.remove()
  backdrop.querySelector("#pmr-btn-close-modal").addEventListener("click", closeModal)

  backdrop.querySelector("#pmr-btn-edit-route")?.addEventListener("click", () => {
    closeModal()
    openTeacherRouteBuilder({
      maestroId: maestro.id,
      claseId,
      route,
      onSaved: () => abrirMapaDeRutas(claseId, maestro, fechaHoy),
    })
  })

  // Render Vertical Duolingo Trail
  if (unidades.length > 0) {
    const trailContainer = backdrop.querySelector("#pmr-duolingo-trail")
    const canvas = backdrop.querySelector("#pmr-scroll-canvas")

    const refrescar = () => {
      closeModal()
      abrirMapaDeRutas(claseId, maestro, fechaHoy)
    }

    _renderDuolingoVerticalTrail(trailContainer, route, checkByIndicador, prereqMap, allIndicatorsMap, {
      onEvaluateIndicador: async (indicador, breadcrumb) => {
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
    })

    // Smart Auto-Scroll to Active / Next in progress node
    setTimeout(() => {
      const activeNode =
        trailContainer.querySelector(".pmr-duo-node-wrap.node-active") ||
        trailContainer.querySelector(".pmr-duo-node-wrap:not(.node-completed)")
      if (activeNode) {
        activeNode.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 200)
  }
}

/**
 * Renderiza el camino vertical serpenteante (S-Curve) estilo Duolingo con Popover interactivo
 */
function _renderDuolingoVerticalTrail(
  container,
  route,
  checkByIndicador,
  prereqMap,
  allIndicatorsMap,
  { onEvaluateIndicador }
) {
  const unidades = route.unidades || []
  let globalStepIndex = 0

  // Patrón de oscilación horizontal estilo Duolingo (porcentaje X)
  const X_OFFSETS = [50, 32, 22, 34, 50, 66, 78, 66]

  let fullHTML = ""

  unidades.forEach((unidad, uIdx) => {
    const objetivos = unidad.objetivos || []
    const unitNumber = uIdx + 1

    // Flatten all indicators for this unit
    const unitIndicators = []
    objetivos.forEach((obj) => {
      (obj.indicadores || []).forEach((ind) => {
        const prereqId = prereqMap[ind.id] || null
        const prereqItem = prereqId ? allIndicatorsMap[prereqId] : null
        const prereqState = prereqId ? checkByIndicador[prereqId] || "none" : null
        const isLocked = prereqId && prereqState !== "double"

        unitIndicators.push({
          indicador: ind,
          objetivo: obj,
          unidad: unidad,
          checkState: checkByIndicador[ind.id] || "none",
          isLocked,
          prereqItem,
        })
      })
    })

    const unitTotal = unitIndicators.length
    const unitDone = unitIndicators.filter((i) => i.checkState === "double").length

    fullHTML += `
      <div class="pmr-unit-section" data-unit-index="${uIdx}">
        <!-- Unit Banner -->
        <div class="pmr-unit-banner">
          <div class="pmr-unit-banner-left">
            <span class="pmr-unit-tag">UNIDAD ${unitNumber}</span>
            <h3 class="pmr-unit-title">${escHTML(unidad.nombre)}</h3>
            <span class="pmr-unit-meta">${unitDone}/${unitTotal} completados · ${objetivos.length} objetivos</span>
          </div>
          <div class="pmr-unit-trophy">🏆</div>
        </div>

        <!-- Vertical S-Curve Path of Nodes -->
        <div class="pmr-unit-nodes-trail">
    `

    // Generate nodes and connecting SVG path
    const nodeCoords = []
    const nodeYStep = 100
    const trailHeight = Math.max(120, unitIndicators.length * nodeYStep + 40)

    unitIndicators.forEach((item, itemIdx) => {
      globalStepIndex += 1
      const offsetIndex = (globalStepIndex - 1) % X_OFFSETS.length
      const xPct = X_OFFSETS[offsetIndex]
      const yPx = 40 + itemIdx * nodeYStep

      nodeCoords.push({ xPct, yPx, item })
    })

    // Build SVG curved road path using numerical coordinates (1000 units reference width in viewBox)
    let svgPathD = ""
    if (nodeCoords.length > 1) {
      const getXVal = (pct) => (pct / 100) * 1000
      svgPathD = `M ${getXVal(nodeCoords[0].xPct)} ${nodeCoords[0].yPx}`
      for (let i = 1; i < nodeCoords.length; i++) {
        const prevX = getXVal(nodeCoords[i - 1].xPct)
        const currX = getXVal(nodeCoords[i].xPct)
        const prevY = nodeCoords[i - 1].yPx
        const currY = nodeCoords[i].yPx
        const midY = (prevY + currY) / 2
        svgPathD += ` C ${prevX} ${midY}, ${currX} ${midY}, ${currX} ${currY}`
      }
    }

    fullHTML += `
      <div class="pmr-trail-stage" style="height: ${trailHeight}px;">
        <svg class="pmr-trail-svg" viewBox="0 0 1000 ${trailHeight}" width="100%" height="${trailHeight}" preserveAspectRatio="none">
          ${svgPathD ? `<path class="pmr-trail-road-back" d="${svgPathD}" />` : ""}
          ${svgPathD ? `<path class="pmr-trail-road-front" d="${svgPathD}" />` : ""}
        </svg>

        ${nodeCoords
          .map(({ xPct, yPx, item }, idx) => {
            const ind = item.indicador
            const obj = item.objetivo
            const st = item.checkState
            const isCompleted = st === "double"
            const isInProgress = st === "single"
            const isLocked = item.isLocked

            let nodeClass = "node-unstarted"
            let iconHTML = `<span class="pmr-node-num">${idx + 1}</span>`

            if (isLocked) {
              nodeClass = "node-locked"
              iconHTML = `<i class="bi bi-lock-fill"></i>`
            } else if (isCompleted) {
              nodeClass = "node-completed"
              iconHTML = `<i class="bi bi-star-fill"></i>`
            } else if (isInProgress) {
              nodeClass = "node-in-progress node-active"
              iconHTML = `<i class="bi bi-play-fill"></i>`
            }

            return `
              <div class="pmr-duo-node-wrap ${nodeClass}" style="left: ${xPct}%; top: ${yPx}px;" data-ind-id="${ind.id}">
                <button type="button" class="pmr-duo-button ${nodeClass}" aria-label="${escHTML(ind.nombre)}">
                  <div class="pmr-duo-button-inner">
                    ${iconHTML}
                  </div>
                  ${isCompleted ? `<span class="pmr-node-crown">👑</span>` : ""}
                  ${isInProgress ? `<span class="pmr-node-pulse"></span>` : ""}
                </button>

                <!-- Tooltip Title on Side -->
                <div class="pmr-duo-label ${xPct > 50 ? "label-left" : "label-right"}">
                  <span class="pmr-label-topic">${escHTML(ind.nombre)}</span>
                  <span class="pmr-label-sub">${escHTML(obj.nombre)}</span>
                </div>
              </div>
            `
          })
          .join("")}
      </div>
    `

    fullHTML += `
        </div>
      </div>
    `
  })

  container.innerHTML = fullHTML

  // Wire node tap to show Interactive Mission Popover
  container.querySelectorAll(".pmr-duo-node-wrap").forEach((nodeEl) => {
    nodeEl.addEventListener("click", (e) => {
      e.stopPropagation()
      const indId = nodeEl.dataset.indId
      const target = allIndicatorsMap[indId]
      if (!target) return

      const checkSt = checkByIndicador[indId] || "none"
      const prereqId = prereqMap[indId]
      const prereqTarget = prereqId ? allIndicatorsMap[prereqId] : null
      const isLocked = prereqId && (checkByIndicador[prereqId] || "none") !== "double"

      _showMissionPopover(nodeEl, target, checkSt, isLocked, prereqTarget, onEvaluateIndicador)
    })
  })

  // Dismiss popover on canvas click
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".pmr-mission-popover") && !e.target.closest(".pmr-duo-node-wrap")) {
      _closeMissionPopover()
    }
  })
}

/**
 * Muestra el Popover de Misión táctil estilo Duolingo
 */
function _showMissionPopover(anchorEl, target, checkSt, isLocked, prereqTarget, onEvaluateIndicador) {
  _closeMissionPopover()

  const { ind, obj, u } = target
  const isCompleted = checkSt === "double"
  const isInProgress = checkSt === "single"

  let statusBadge = ""
  if (isLocked) {
    statusBadge = `<span class="pmr-popover-badge badge-locked"><i class="bi bi-lock-fill"></i> Bloqueado por Prerrequisito</span>`
  } else if (isCompleted) {
    statusBadge = `<span class="pmr-popover-badge badge-success"><i class="bi bi-star-fill"></i> Malla Dominada (5★)</span>`
  } else if (isInProgress) {
    statusBadge = `<span class="pmr-popover-badge badge-active"><i class="bi bi-play-circle-fill"></i> En Evaluación</span>`
  } else {
    statusBadge = `<span class="pmr-popover-badge badge-neutral"><i class="bi bi-circle"></i> Sin Calificar</span>`
  }

  const popover = document.createElement("div")
  popover.className = "pmr-mission-popover"
  popover.id = "pmr-active-mission-popover"

  popover.innerHTML = `
    <div class="pmr-popover-arrow"></div>
    <div class="pmr-popover-header">
      <span class="pmr-popover-breadcrumb">${escHTML(u.nombre)} › ${escHTML(obj.nombre)}</span>
      <button type="button" class="pmr-popover-close-btn" aria-label="Cerrar"><i class="bi bi-x"></i></button>
    </div>

    <div class="pmr-popover-body">
      <h4 class="pmr-popover-title">${escHTML(ind.nombre)}</h4>
      ${statusBadge}

      ${
        isLocked && prereqTarget
          ? `
        <div class="pmr-popover-debt-warning">
          <i class="bi bi-exclamation-octagon-fill"></i>
          <div>
            <strong>Deuda Pedagógica:</strong>
            <span>Requiere dominar primero <em>"${escHTML(prereqTarget.ind.nombre)}"</em>.</span>
          </div>
        </div>
      `
          : ""
      }
    </div>

    <div class="pmr-popover-footer">
      <button type="button" class="pmr-popover-action-btn ${isLocked ? "btn-disabled" : "btn-start"}" id="pmr-btn-start-eval">
        <i class="bi bi-star-fill"></i>
        <span>${isCompleted ? "Ver / Modificar Calificación" : "Evaluar Sesión (5★)"}</span>
      </button>
    </div>
  `

  anchorEl.appendChild(popover)

  popover.querySelector(".pmr-popover-close-btn")?.addEventListener("click", (e) => {
    e.stopPropagation()
    _closeMissionPopover()
  })

  popover.querySelector("#pmr-btn-start-eval")?.addEventListener("click", async (e) => {
    e.stopPropagation()
    _closeMissionPopover()
    await onEvaluateIndicador(ind, `${u.nombre} > ${obj.nombre}`)
  })
}

function _closeMissionPopover() {
  const existing = document.getElementById("pmr-active-mission-popover")
  if (existing) existing.remove()
}

// ─── Estilos CSS Duolingo Fullscreen con Popover ──────────────────────────────

function _injectDuolingoStyles() {
  if (document.getElementById("pmr-duolingo-fullscreen-styles")) return

  const style = document.createElement("style")
  style.id = "pmr-duolingo-fullscreen-styles"
  style.textContent = `
    .pmr-fullscreen-backdrop {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background: #0b0f19;
      z-index: 2200;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .pmr-fullscreen-modal {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: radial-gradient(120% 120% at 50% 0%, #171c2f 0%, #0b0f19 60%, #030712 100%);
      color: #fff;
    }

    /* ── Sticky Header ── */
    .pmr-header-bar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(11, 15, 25, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .pmr-header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
      min-width: 0;
    }

    .pmr-header-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
      flex-shrink: 0;
    }

    .pmr-header-info {
      flex: 1;
      min-width: 0;
    }

    .pmr-header-title {
      font-size: 1.15rem;
      font-weight: 900;
      margin: 0 0 0.25rem;
      letter-spacing: -0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #f8fafc;
    }

    .pmr-header-progress-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .pmr-progress-bar-bg {
      width: 140px;
      height: 8px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
      overflow: hidden;
    }

    .pmr-progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #34d399);
      border-radius: 999px;
      transition: width 0.4s ease;
    }

    .pmr-progress-text {
      font-size: 0.76rem;
      font-weight: 700;
      color: #34d399;
    }

    .pmr-header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .pmr-action-btn {
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .pmr-btn-edit {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #e2e8f0;
      padding: 0.55rem 1.1rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .pmr-btn-edit:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }

    .pmr-btn-close {
      background: rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      font-size: 1.1rem;
    }

    .pmr-btn-close:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    /* ── Scroll Canvas ── */
    .pmr-scroll-canvas {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 2rem 1rem 5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .pmr-duolingo-trail {
      width: 100%;
      max-width: 520px;
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    /* ── Unit Section & Banner ── */
    .pmr-unit-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .pmr-unit-banner {
      background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
      color: #fff;
      padding: 1.1rem 1.4rem;
      border-radius: 20px;
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.35);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid rgba(255, 255, 255, 0.18);
    }

    .pmr-unit-tag {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.85;
    }

    .pmr-unit-title {
      font-size: 1.15rem;
      font-weight: 900;
      margin: 0.1rem 0 0.2rem;
    }

    .pmr-unit-meta {
      font-size: 0.78rem;
      opacity: 0.9;
    }

    .pmr-unit-trophy {
      font-size: 2.2rem;
    }

    /* ── S-Curve Stage & Nodes ── */
    .pmr-trail-stage {
      position: relative;
      width: 100%;
    }

    .pmr-trail-svg {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
    }

    .pmr-trail-road-back {
      fill: none;
      stroke: #1e293b;
      stroke-width: 14;
      stroke-linecap: round;
    }

    .pmr-trail-road-front {
      fill: none;
      stroke: #334155;
      stroke-width: 8;
      stroke-linecap: round;
      stroke-dasharray: 6 8;
    }

    .pmr-duo-node-wrap {
      position: absolute;
      transform: translate(-50%, -50%);
      z-index: 10;
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    /* 3D Duolingo Stepping Stone Button */
    .pmr-duo-button {
      width: 62px;
      height: 62px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .pmr-duo-button-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      color: #fff;
    }

    /* States */
    .node-completed .pmr-duo-button {
      background: #10b981;
      box-shadow: 0 7px 0 #047857, 0 10px 20px rgba(16, 185, 129, 0.4);
    }
    .node-completed .pmr-duo-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 9px 0 #047857, 0 14px 26px rgba(16, 185, 129, 0.5);
    }

    .node-in-progress .pmr-duo-button {
      background: #4f46e5;
      box-shadow: 0 7px 0 #3730a3, 0 10px 20px rgba(79, 70, 229, 0.4);
    }
    .node-in-progress .pmr-duo-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 9px 0 #3730a3, 0 14px 26px rgba(79, 70, 229, 0.5);
    }

    .node-locked .pmr-duo-button {
      background: #475569;
      box-shadow: 0 7px 0 #334155;
      color: #cbd5e1;
    }

    .node-unstarted .pmr-duo-button {
      background: #334155;
      box-shadow: 0 7px 0 #1e293b;
    }

    .pmr-node-num {
      font-size: 1.15rem;
      font-weight: 900;
    }

    .pmr-node-crown {
      position: absolute;
      top: -14px;
      right: -6px;
      font-size: 1.3rem;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    }

    .pmr-node-pulse {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid #818cf8;
      animation: pmr-pulse-glow 2s infinite;
      pointer-events: none;
    }

    @keyframes pmr-pulse-glow {
      0% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.18); opacity: 0.2; }
      100% { transform: scale(1); opacity: 0.8; }
    }

    /* Labels on side */
    .pmr-duo-label {
      position: absolute;
      width: 140px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      pointer-events: none;
    }

    .label-left {
      right: calc(100% + 14px);
      text-align: right;
    }

    .label-right {
      left: calc(100% + 14px);
      text-align: left;
    }

    .pmr-label-topic {
      font-size: 0.82rem;
      font-weight: 800;
      color: #f1f5f9;
      line-height: 1.25;
      text-shadow: 0 2px 4px rgba(0,0,0,0.6);
    }

    .pmr-label-sub {
      font-size: 0.68rem;
      color: #94a3b8;
    }

    /* ── Interactive Mission Popover ── */
    .pmr-mission-popover {
      position: absolute;
      top: calc(100% + 14px);
      left: 50%;
      transform: translateX(-50%);
      width: 290px;
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
      z-index: 100;
      padding: 1rem;
      animation: pmr-popover-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes pmr-popover-in {
      from { transform: translateX(-50%) translateY(8px) scale(0.95); opacity: 0; }
      to { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
    }

    .pmr-popover-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .pmr-popover-breadcrumb {
      font-size: 0.68rem;
      font-weight: 700;
      color: #818cf8;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .pmr-popover-close-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0;
      line-height: 1;
    }

    .pmr-popover-title {
      font-size: 0.95rem;
      font-weight: 800;
      margin: 0 0 0.4rem;
      line-height: 1.3;
      color: #fff;
    }

    .pmr-popover-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      margin-bottom: 0.6rem;
    }

    .badge-success { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .badge-active { background: rgba(79, 70, 229, 0.2); color: #a5b4fc; }
    .badge-locked { background: rgba(239, 68, 68, 0.15); color: #f87171; }
    .badge-neutral { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; }

    .pmr-popover-debt-warning {
      display: flex;
      gap: 6px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: 9px;
      padding: 0.5rem 0.65rem;
      font-size: 0.74rem;
      color: #fca5a5;
      margin-bottom: 0.65rem;
      line-height: 1.35;
    }

    .pmr-popover-footer {
      margin-top: 0.6rem;
    }

    .pmr-popover-action-btn {
      width: 100%;
      border: none;
      padding: 0.6rem 0.8rem;
      border-radius: 11px;
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.18s ease;
    }

    .btn-start {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #fff;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
    }
    .btn-start:hover {
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.5);
      transform: translateY(-1px);
    }

    .btn-disabled {
      background: #334155;
      color: #94a3b8;
    }

    /* Empty state */
    .pmr-empty-state {
      padding: 4rem 2rem;
      text-align: center;
    }
    .pmr-empty-icon { font-size: 3.5rem; margin-bottom: 0.5rem; }

    @media (max-width: 640px) {
      .pmr-header-bar {
        padding: 0.75rem 1rem;
      }
      .pmr-header-title {
        font-size: 1rem;
      }
      .pmr-btn-text {
        display: none;
      }
      .pmr-duo-button {
        width: 54px;
        height: 54px;
      }
      .pmr-duo-label {
        width: 110px;
      }
      .pmr-label-topic {
        font-size: 0.75rem;
      }
    }
  `
  document.head.appendChild(style)
}
