/**
 * planificacionView.js
 * Portal Maestros — Gestión y Rutas Académicas (Cuadrícula Móvil 2x & Desktop 3x)
 *
 * Módulo rediseñado enfocado 100% en la jerarquía pedagógica del maestro:
 * UNIDADES ➔ OBJETIVOS ➔ INDICADORES (con títulos completos, clonación y mapa vertical).
 */

import { getMisClases, getInscripcionesClases } from "../services/maestroDataService.js"
import { getTeacherRoutes, createRoute } from "../services/maestroRouteService.js"
import { announce } from "../utils/a11yUtils.js"
import { AppToast } from "../../shared/components/AppToast.js"
import { router as internalRouter } from "../../core/router/router.js"
import { getMaestroLocal } from "../auth/maestroAuth.js"
import { abrirMapaDeRutas } from "../components/teacherRouteMapPanel.js"
import { openTeacherRoutePicker } from "../components/TeacherRouteBuilder.js"

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
  })[char])
}

// ─── Vista Principal ───────────────────────────────────────────────────────────

export async function renderPlanificacionView(container, { maestroId: explicitMaestroId, router: portalRouter } = {}) {
  const activeRouter = portalRouter || window.router || internalRouter
  const maestro = getMaestroLocal()
  const maestroId = explicitMaestroId || maestro?.id || null

  _injectStyles()

  container.innerHTML = `
    <div class="pm-planning-container">
      <!-- Header Hero Compacto -->
      <div class="pm-planning-hero">
        <div class="pm-hero-glow"></div>
        <div class="pm-hero-content">
          <div class="pm-hero-text">
            <div class="pm-hero-eyebrow">
              <span class="pm-live-dot"></span> MALLA ACADÉMICA
            </div>
            <h1 class="pm-hero-title">Gestión y Rutas</h1>
            <p class="pm-hero-subtitle">
              Planificación por <strong>Unidades ➔ Objetivos ➔ Indicadores</strong> con prelación y control de deuda pedagógica.
            </p>
          </div>
        </div>

        <!-- Metrics Dashboard Compacto -->
        <div class="pm-hero-stats" id="pm-hero-stats">
          <div class="pm-stat-card">
            <span class="pm-stat-num" id="stat-total-clases">-</span>
            <span class="pm-stat-label">Clases</span>
          </div>
          <div class="pm-stat-card">
            <span class="pm-stat-num pm-stat-num--success" id="stat-con-ruta">-</span>
            <span class="pm-stat-label">Con Malla</span>
          </div>
          <div class="pm-stat-card">
            <span class="pm-stat-num pm-stat-num--accent" id="stat-total-indicadores">-</span>
            <span class="pm-stat-label">Indicadores</span>
          </div>
        </div>
      </div>

      <!-- Segmented Filter Bar & Guide Button -->
      <div class="pm-planning-toolbar">
        <div class="pm-segmented-control" id="pm-class-filters">
          <button type="button" class="pm-seg-btn active" data-filter="all">
            <i class="bi bi-grid-fill"></i> Todas
          </button>
          <button type="button" class="pm-seg-btn" data-filter="with-route">
            <i class="bi bi-check-circle-fill"></i> Con Malla
          </button>
          <button type="button" class="pm-seg-btn" data-filter="no-route">
            <i class="bi bi-exclamation-circle-fill"></i> Pendientes
          </button>
        </div>

        <div class="pm-toolbar-right">
          <button type="button" class="pm-btn-info-guide" id="btn-open-planning-guide" title="Ver guía paso a paso de uso">
            <i class="bi bi-lightbulb-fill text-warning"></i>
            <span>¿Cómo funciona?</span>
          </button>
          <div class="pm-search-box">
            <i class="bi bi-search"></i>
            <input type="text" id="pm-search-clases" placeholder="Buscar clase o instrumento..." />
          </div>
        </div>
      </div>

      <!-- Main Content Grid (2 por fila en móvil, 3 por fila en desktop) -->
      <div id="pm-classes-grid-host">
        <div class="pm-loading-card">
          <div class="spinner-border text-primary" role="status"></div>
          <span>Sincronizando mallas curriculares...</span>
        </div>
      </div>
    </div>
  `

  const gridHost = container.querySelector("#pm-classes-grid-host")
  const searchInput = container.querySelector("#pm-search-clases")
  const filterButtons = container.querySelectorAll("#pm-class-filters .pm-seg-btn")

  let currentFilter = "all"
  let currentSearch = ""
  let loadedClases = []

  // Event Listeners
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      currentFilter = btn.dataset.filter
      renderGrid()
    })
  })

  searchInput?.addEventListener("input", (e) => {
    currentSearch = e.target.value.toLowerCase().trim()
    renderGrid()
  })

  container.querySelector("#btn-open-planning-guide")?.addEventListener("click", () => {
    _abrirModalGuiaUso()
  })

  // Load Classes & Route Data
  async function loadData() {
    try {
      const clases = await getMisClases()
      if (!clases || clases.length === 0) {
        gridHost.innerHTML = `
          <div class="pm-empty-card">
            <div class="pm-empty-icon">🎼</div>
            <h3 class="pm-empty-title">Sin clases asignadas</h3>
            <p class="pm-empty-desc">No tienes clases asignadas en este momento. Cuando la coordinación te asigne un grupo podrás diseñar su malla aquí.</p>
          </div>
        `
        _updateHeroStats(0, 0, 0)
        return
      }

      // Query routes for all classes in parallel
      const enrichedClases = await Promise.all(
        clases.map(async (clase) => {
          let routes = []
          let inscritos = []
          try {
            routes = await getTeacherRoutes(maestroId, clase.id)
          } catch (_e) {
            routes = []
          }
          try {
            inscritos = await getInscripcionesClases([clase.id])
          } catch (_e) {
            inscritos = []
          }

          const primaryRoute = routes?.[0] || null
          const unidades = primaryRoute?.unidades || []

          let totalObjetivos = 0
          let totalIndicadores = 0

          unidades.forEach((u) => {
            const objs = u.objetivos || []
            totalObjetivos += objs.length
            objs.forEach((o) => {
              totalIndicadores += (o.indicadores || []).length
            })
          })

          return {
            ...clase,
            hasRoute: Boolean(primaryRoute),
            route: primaryRoute,
            unidadesCount: unidades.length,
            objetivosCount: totalObjetivos,
            indicadoresCount: totalIndicadores,
            totalStudents: inscritos.length,
          }
        })
      )

      loadedClases = enrichedClases

      // Update Hero Metrics
      const totalClases = loadedClases.length
      const conRuta = loadedClases.filter((c) => c.hasRoute).length
      const totalInd = loadedClases.reduce((acc, c) => acc + c.indicadoresCount, 0)
      _updateHeroStats(totalClases, conRuta, totalInd)

      renderGrid()
      announce(`${totalClases} clases cargadas en Malla Curricular.`)
    } catch (err) {
      console.error("[planificacionView] Error loading classes:", err)
      gridHost.innerHTML = `
        <div class="pm-empty-card">
          <div class="pm-empty-icon">⚠️</div>
          <h3 class="pm-empty-title">Error al sincronizar mallas</h3>
          <p class="pm-empty-desc">${escapeHtml(err.message)}</p>
          <button type="button" class="pm-btn-primary mt-3" id="btn-retry-planning">
            <i class="bi bi-arrow-clockwise"></i> Reintentar
          </button>
        </div>
      `
      gridHost.querySelector("#btn-retry-planning")?.addEventListener("click", loadData)
    }
  }

  function _updateHeroStats(total, conRuta, totalInd) {
    const elTotal = container.querySelector("#stat-total-clases")
    const elRuta = container.querySelector("#stat-con-ruta")
    const elInd = container.querySelector("#stat-total-indicadores")
    if (elTotal) elTotal.textContent = total
    if (elRuta) elRuta.textContent = conRuta
    if (elInd) elInd.textContent = totalInd
  }

  function renderGrid() {
    let filtered = loadedClases

    if (currentFilter === "with-route") {
      filtered = filtered.filter((c) => c.hasRoute)
    } else if (currentFilter === "no-route") {
      filtered = filtered.filter((c) => !c.hasRoute)
    }

    if (currentSearch) {
      filtered = filtered.filter(
        (c) =>
          (c.nombre || "").toLowerCase().includes(currentSearch) ||
          (c.instrumento || "").toLowerCase().includes(currentSearch)
      )
    }

    if (filtered.length === 0) {
      gridHost.innerHTML = `
        <div class="pm-empty-card">
          <div class="pm-empty-icon">🔍</div>
          <h3 class="pm-empty-title">Sin coincidencias</h3>
          <p class="pm-empty-desc">No hay clases que coincidan con la búsqueda o filtro aplicado.</p>
        </div>
      `
      return
    }

    gridHost.innerHTML = `
      <div class="pm-compact-grid">
        ${filtered
          .map((clase) => {
            const hasRoute = clase.hasRoute

            return `
              <div class="pm-compact-card ${hasRoute ? "has-route" : "no-route"}" data-clase-id="${clase.id}">
                <!-- Top Accent Line -->
                <div class="pm-compact-card-accent ${hasRoute ? "accent-emerald" : "accent-amber"}"></div>

                <!-- Top Row: Full Title + Glowing Status Dot Badge -->
                <div class="pm-card-top-row">
                  <div class="pm-card-title-wrap">
                    <h3 class="pm-compact-title">${escapeHtml(clase.nombre)}</h3>
                    <div class="pm-card-meta-line">
                      <span class="pm-meta-text">${escapeHtml(clase.instrumento || "General")}</span>
                      <span class="pm-dot-separator">·</span>
                      <span class="pm-meta-text"><i class="bi bi-people-fill"></i> ${clase.totalStudents}</span>
                    </div>
                  </div>
                  <div class="pm-status-indicator ${hasRoute ? "indicator-active" : "indicator-pending"}" title="${hasRoute ? "Malla Diseñada" : "Malla Pendiente"}">
                    <span class="pm-status-dot"></span>
                  </div>
                </div>

                <!-- Compact Structure Bar (Icon-only metrics) -->
                <div class="pm-compact-body">
                  ${
                    hasRoute
                      ? `
                    <div class="pm-icon-hierarchy">
                      <div class="pm-icon-chip" title="${clase.unidadesCount} Unidades">
                        <span class="pm-chip-symbol">📦</span>
                        <span class="pm-chip-val">${clase.unidadesCount}</span>
                      </div>
                      <span class="pm-chip-arrow">›</span>
                      <div class="pm-icon-chip" title="${clase.objetivosCount} Objetivos">
                        <span class="pm-chip-symbol">🎯</span>
                        <span class="pm-chip-val">${clase.objetivosCount}</span>
                      </div>
                      <span class="pm-chip-arrow">›</span>
                      <div class="pm-icon-chip pm-icon-chip--highlight" title="${clase.indicadoresCount} Indicadores">
                        <span class="pm-chip-symbol">⚡</span>
                        <span class="pm-chip-val">${clase.indicadoresCount}</span>
                      </div>
                    </div>
                  `
                      : `
                    <div class="pm-warning-chip" title="Malla pendiente de diseño">
                      <i class="bi bi-exclamation-triangle-fill text-warning"></i>
                      <span>Sin malla</span>
                    </div>
                  `
                  }
                </div>

                <!-- Compact Actions Row -->
                <div class="pm-compact-actions">
                  <button type="button" class="pm-btn-compact-primary pm-btn-designer" data-clase-id="${clase.id}" title="${hasRoute ? "Editar Malla" : "Diseñar Malla"}">
                    <i class="bi bi-pencil-square"></i>
                    <span>${hasRoute ? "Editar" : "Diseñar"}</span>
                  </button>

                  <button type="button" class="pm-btn-compact-secondary pm-btn-map" data-clase-id="${clase.id}" title="Ver Mapa y Deudas">
                    <i class="bi bi-diagram-3-fill"></i>
                    <span>Mapa</span>
                  </button>

                  ${
                    hasRoute
                      ? `
                    <button type="button" class="pm-btn-compact-icon pm-btn-clone" data-clase-id="${clase.id}" title="Duplicar Malla hacia otra clase">
                      <i class="bi bi-copy"></i>
                    </button>
                  `
                      : ""
                  }
                </div>
              </div>
            `
          })
          .join("")}
      </div>
    `

    // Wire entire card click to open map directly
    gridHost.querySelectorAll(".pm-compact-card").forEach((card) => {
      card.style.cursor = "pointer"
      card.addEventListener("click", async () => {
        const cid = card.dataset.claseId
        const fechaHoy = new Date().toISOString().slice(0, 10)
        await abrirMapaDeRutas(cid, maestro, fechaHoy)
      })
    })

    // Wire action buttons with stopPropagation
    gridHost.querySelectorAll(".pm-btn-designer").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation()
        const cid = btn.dataset.claseId
        openTeacherRoutePicker(maestroId, cid, () => loadData())
      })
    })

    gridHost.querySelectorAll(".pm-btn-map").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation()
        const cid = btn.dataset.claseId
        const fechaHoy = new Date().toISOString().slice(0, 10)
        await abrirMapaDeRutas(cid, maestro, fechaHoy)
      })
    })

    gridHost.querySelectorAll(".pm-btn-clone").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation()
        const cid = btn.dataset.claseId
        const sourceClase = loadedClases.find((c) => c.id === cid)
        if (!sourceClase || !sourceClase.route) return
        _abrirModalClonarMalla(sourceClase, loadedClases, maestroId, () => loadData())
      })
    })
  }

  await loadData()
}

/**
 * Modal de 1-Tap para duplicar la malla curricular hacia otra clase
 */
function _abrirModalClonarMalla(sourceClase, allClases, maestroId, onComplete) {
  const otherClases = allClases.filter((c) => c.id !== sourceClase.id)
  if (otherClases.length === 0) {
    AppToast.info("No tienes otras clases disponibles para duplicar la malla.")
    return
  }

  const backdrop = document.createElement("div")
  backdrop.className = "pm-clone-modal-backdrop"

  backdrop.innerHTML = `
    <div class="pm-clone-modal" role="dialog" aria-modal="true">
      <div class="pm-clone-header">
        <div>
          <span class="pm-clone-badge"><i class="bi bi-copy"></i> DUPLICAR MALLA</span>
          <h3>Copiar Malla de "${escapeHtml(sourceClase.nombre)}"</h3>
        </div>
        <button type="button" class="pm-clone-close"><i class="bi bi-x"></i></button>
      </div>

      <div class="pm-clone-body">
        <p class="pm-clone-desc">
          Selecciona a qué clase deseas transferir la estructura de 
          <strong>${sourceClase.unidadesCount} Unidades</strong> y 
          <strong>${sourceClase.indicadoresCount} Indicadores</strong>:
        </p>

        <div class="pm-clone-list">
          ${otherClases
            .map(
              (c) => `
            <label class="pm-clone-option">
              <input type="radio" name="target_clase" value="${c.id}" />
              <div class="pm-clone-option-info">
                <strong>${escapeHtml(c.nombre)}</strong>
                <span>${escapeHtml(c.instrumento || "General")} · ${c.hasRoute ? "⚠️ Ya tiene malla (se reemplazará)" : "✨ Sin malla configurada"}</span>
              </div>
            </label>
          `
            )
            .join("")}
        </div>
      </div>

      <div class="pm-clone-footer">
        <button type="button" class="pm-btn-secondary pm-clone-cancel">Cancelar</button>
        <button type="button" class="pm-btn-primary pm-clone-confirm" id="btn-confirm-clone" disabled>
          <i class="bi bi-copy"></i> Duplicar Malla
        </button>
      </div>
    </div>
  `

  document.body.appendChild(backdrop)

  const closeModal = () => backdrop.remove()
  backdrop.querySelector(".pm-clone-close").addEventListener("click", closeModal)
  backdrop.querySelector(".pm-clone-cancel").addEventListener("click", closeModal)

  const confirmBtn = backdrop.querySelector("#btn-confirm-clone")
  const radios = backdrop.querySelectorAll("input[name=target_clase]")

  radios.forEach((r) => {
    r.addEventListener("change", () => {
      confirmBtn.disabled = false
    })
  })

  confirmBtn.addEventListener("click", async () => {
    const selectedRadio = backdrop.querySelector("input[name=target_clase]:checked")
    if (!selectedRadio) return

    const targetClaseId = selectedRadio.value
    const targetClase = allClases.find((c) => c.id === targetClaseId)
    confirmBtn.disabled = true
    confirmBtn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Duplicando...`

    try {
      await createRoute(
        maestroId,
        targetClaseId,
        sourceClase.route.nombre,
        sourceClase.route.unidades || []
      )

      AppToast.success(`Malla duplicada exitosamente hacia "${targetClase?.nombre || "la clase"}"!`)
      closeModal()
      onComplete()
    } catch (err) {
      console.error("[planificacionView] Error cloning route:", err)
      AppToast.error(`Error al duplicar malla: ${err.message}`)
      confirmBtn.disabled = false
      confirmBtn.innerHTML = `<i class="bi bi-copy"></i> Duplicar Malla`
    }
  })
}

/**
 * Modal Informativo / Guía de Uso del Sistema Pedagógico
 */
export function _abrirModalGuiaUso() {
  const backdrop = document.createElement("div")
  backdrop.className = "pm-guide-modal-backdrop"

  backdrop.innerHTML = `
    <div class="pm-guide-modal" role="dialog" aria-modal="true" aria-label="Guía de Uso">
      <div class="pm-guide-header">
        <div class="pm-guide-header-badge"><i class="bi bi-lightbulb-fill"></i></div>
        <div class="pm-guide-header-text">
          <span class="pm-guide-eyebrow">GUÍA PEDAGÓGICA</span>
          <h3>¿Cómo funciona la Malla y Calificación?</h3>
        </div>
        <button type="button" class="pm-guide-close" aria-label="Cerrar"><i class="bi bi-x"></i></button>
      </div>

      <div class="pm-guide-body">
        <p class="pm-guide-intro">
          El sistema conecta la planificación del maestro con la asistencia real y el seguimiento de dominio de cada estudiante en <strong>4 pasos simples</strong>:
        </p>

        <!-- 4 Steps Flow -->
        <div class="pm-guide-steps">
          <div class="pm-guide-step">
            <div class="pm-step-num">1</div>
            <div class="pm-step-content">
              <strong>Diseña la Malla Curricular</strong>
              <p>Presiona <em>"Diseñar"</em> para estructurar tu materia en <strong>Unidades ➔ Objetivos ➔ Indicadores</strong>. Puedes definir prerrequisitos (indicadores que deben dominarse antes de otros).</p>
            </div>
          </div>

          <div class="pm-guide-step">
            <div class="pm-step-num">2</div>
            <div class="pm-step-content">
              <strong>Pasa Asistencia en la Clase</strong>
              <p>En el módulo <em>"Asistencia"</em> o <em>"Hoy"</em>, pasa lista marcando a los alumnos como <strong>Presentes</strong> o <strong>Ausentes</strong>. La evaluación siempre requiere saber quién vino al aula.</p>
            </div>
          </div>

          <div class="pm-guide-step">
            <div class="pm-step-num">3</div>
            <div class="pm-step-content">
              <strong>Califica en el Mapa Duolingo (5★)</strong>
              <p>Abre el <em>"Mapa"</em> de la clase, toca el indicador que trabajaste hoy y califica a los presentes de <strong>1 a 5 estrellas (⭐)</strong>. Con 5★ el indicador se marca como <em>Dominado</em> 👑.</p>
            </div>
          </div>

          <div class="pm-guide-step">
            <div class="pm-step-num">4</div>
            <div class="pm-step-content">
              <strong>Controla Deudas y Candados (🔒)</strong>
              <p>Si un alumno faltó o requiere reforzar un prerrequisito, se le genera una <strong>Deuda Pedagógica</strong> para su sesión de recuperación, desbloqueando su progreso.</p>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="pm-guide-legend">
          <h4>Glosario de Indicadores del Mapa:</h4>
          <div class="pm-legend-grid">
            <div class="pm-legend-item">
              <span class="pm-leg-icon leg-green">👑 ⭐</span>
              <span><strong>Dominado (5★):</strong> Logrado por el grupo.</span>
            </div>
            <div class="pm-legend-item">
              <span class="pm-leg-icon leg-blue">▶️</span>
              <span><strong>En Progreso:</strong> En evaluación activa.</span>
            </div>
            <div class="pm-legend-item">
              <span class="pm-leg-icon leg-red">🔒</span>
              <span><strong>Bloqueado:</strong> Requiere dominar un tema previo.</span>
            </div>
            <div class="pm-legend-item">
              <span class="pm-leg-icon leg-purple">👤</span>
              <span><strong>Vista por Alumno:</strong> Filtra el mapa para 1 estudiante.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="pm-guide-footer">
        <button type="button" class="pm-btn-primary pm-guide-understood">
          ¡Entendido, vamos a usarlo!
        </button>
      </div>
    </div>
  `

  document.body.appendChild(backdrop)

  const closeModal = () => backdrop.remove()
  backdrop.querySelector(".pm-guide-close").addEventListener("click", closeModal)
  backdrop.querySelector(".pm-guide-understood").addEventListener("click", closeModal)
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal()
  })
}

// ─── Estilos CSS Cuadrícula 2x Móvil & 3x Desktop ──────────────────────────────

function _injectStyles() {
  if (document.getElementById("pm-planning-compact-3x-styles")) return

  const style = document.createElement("style")
  style.id = "pm-planning-compact-3x-styles"
  style.textContent = `
    .pm-planning-container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 1.25rem 1.25rem 2.5rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    /* ── Hero Banner Compacto ── */
    .pm-planning-hero {
      position: relative;
      background: radial-gradient(130% 120% at 50% 0%, #1e1b4b 0%, #0f172a 60%, #020617 100%);
      color: #fff;
      padding: 1.25rem 1.6rem;
      border-radius: 18px;
      border: 1px solid rgba(99, 102, 241, 0.22);
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.2rem;
      margin-bottom: 1.25rem;
      overflow: hidden;
    }

    .pm-hero-glow {
      position: absolute;
      top: -40px;
      right: 20%;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, transparent 70%);
      pointer-events: none;
    }

    .pm-hero-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      max-width: 600px;
      position: relative;
      z-index: 1;
    }

    .pm-hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #818cf8;
      margin-bottom: 0.2rem;
      text-transform: uppercase;
    }

    .pm-live-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #38bdf8;
      box-shadow: 0 0 6px #38bdf8;
    }

    .pm-hero-title {
      font-size: 1.45rem;
      font-weight: 900;
      margin: 0 0 0.2rem;
      letter-spacing: -0.02em;
      background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .pm-hero-subtitle {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.4;
    }

    .pm-hero-subtitle strong {
      color: #f1f5f9;
    }

    .pm-hero-stats {
      display: flex;
      gap: 0.6rem;
      position: relative;
      z-index: 1;
    }

    .pm-stat-card {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0.65rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 85px;
    }

    .pm-stat-num {
      font-size: 1.35rem;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: #f8fafc;
      line-height: 1.1;
    }

    .pm-stat-num--success { color: #34d399; }
    .pm-stat-num--accent { color: #a78bfa; }

    .pm-stat-label {
      font-size: 0.64rem;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-top: 0.2rem;
    }

    /* ── Toolbar & Segmented Control ── */
    .pm-planning-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
    }

    .pm-segmented-control {
      display: inline-flex;
      background: rgba(15, 23, 42, 0.05);
      border: 1px solid var(--pm-border, rgba(0, 0, 0, 0.08));
      padding: 3px;
      border-radius: 12px;
      gap: 3px;
    }

    .pm-seg-btn {
      background: transparent;
      border: none;
      color: var(--pm-text-muted, #64748b);
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.45rem 0.9rem;
      border-radius: 9px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.18s ease;
    }

    .pm-seg-btn:hover { color: var(--pm-text, #0f172a); }

    .pm-seg-btn.active {
      background: var(--pm-primary, #4f46e5);
      color: #fff;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.35);
    }

    .pm-toolbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .pm-btn-info-guide {
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #4f46e5;
      padding: 0.45rem 0.85rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.18s ease;
    }

    .pm-btn-info-guide:hover {
      background: rgba(99, 102, 241, 0.2);
      transform: translateY(-1px);
    }

    [data-theme="dark"] .pm-btn-info-guide {
      background: rgba(99, 102, 241, 0.15);
      border-color: rgba(99, 102, 241, 0.4);
      color: #c7d2fe;
    }

    .pm-search-box {
      position: relative;
      min-width: 250px;
    }

    .pm-search-box i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      font-size: 0.85rem;
    }

    .pm-search-box input {
      width: 100%;
      padding: 0.5rem 1rem 0.5rem 34px;
      border-radius: 12px;
      border: 1px solid var(--pm-border, #e2e8f0);
      background: var(--pm-surface, #fff);
      color: inherit;
      font-size: 0.84rem;
      font-weight: 500;
    }

    .pm-search-box input:focus {
      outline: none;
      border-color: var(--pm-primary, #4f46e5);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }

    /* ── Cuadrícula: 3 Clases por Fila en Desktop, 2 en Móvil ── */
    .pm-compact-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.85rem;
    }

    @media (max-width: 1100px) and (min-width: 769px) {
      .pm-compact-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .pm-compact-card {
      position: relative;
      background: var(--pm-surface, #ffffff);
      border: 1px solid var(--pm-border, #e2e8f0);
      border-radius: 16px;
      padding: 0.95rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .pm-compact-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.07);
      border-color: #cbd5e1;
    }

    .pm-compact-card-accent {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
    }

    .accent-emerald { background: linear-gradient(90deg, #10b981, #34d399); }
    .accent-amber { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

    .pm-card-top-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .pm-card-title-wrap {
      flex: 1;
      min-width: 0;
    }

    .pm-compact-title {
      font-size: 0.94rem;
      font-weight: 800;
      margin: 0 0 0.2rem;
      line-height: 1.3;
      letter-spacing: -0.015em;
      color: var(--pm-text, #0f172a);
      white-space: normal;
      word-break: break-word;
    }

    .pm-card-meta-line {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.74rem;
      font-weight: 600;
      color: var(--pm-text-muted, #64748b);
    }

    .pm-dot-separator { opacity: 0.5; }

    /* Glowing Status Dot Indicator */
    .pm-status-indicator {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .indicator-active {
      background: rgba(16, 185, 129, 0.14);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .indicator-active .pm-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }

    .indicator-pending {
      background: rgba(245, 158, 11, 0.14);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .indicator-pending .pm-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #f59e0b;
      box-shadow: 0 0 6px #f59e0b;
    }

    .pm-compact-body {
      flex: 1;
    }

    /* Icon Hierarchy */
    .pm-icon-hierarchy {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--pm-surface-2, #f8fafc);
      padding: 0.4rem 0.65rem;
      border-radius: 9px;
      border: 1px solid var(--pm-border, #e2e8f0);
    }

    .pm-icon-chip {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .pm-chip-symbol {
      font-size: 0.8rem;
    }

    .pm-chip-val {
      font-size: 0.9rem;
      font-weight: 800;
      color: var(--pm-primary, #4f46e5);
      line-height: 1;
    }

    .pm-icon-chip--highlight .pm-chip-val { color: #059669; }

    .pm-chip-arrow {
      color: #cbd5e1;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .pm-warning-chip {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 0.4rem 0.6rem;
      border-radius: 9px;
      background: rgba(245, 158, 11, 0.07);
      border: 1px solid rgba(245, 158, 11, 0.2);
      font-size: 0.74rem;
      color: #92400e;
      font-weight: 700;
    }

    /* Actions Compact */
    .pm-compact-actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .pm-btn-compact-primary {
      flex: 1;
      border: none;
      background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
      color: #fff;
      padding: 0.48rem 0.65rem;
      border-radius: 9px;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.22);
      transition: all 0.18s ease;
    }

    .pm-btn-compact-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
    }

    .pm-btn-compact-secondary {
      flex: 1;
      border: 1px solid var(--pm-border, #cbd5e1);
      background: var(--pm-surface-2, #f8fafc);
      color: var(--pm-text, #334155);
      padding: 0.48rem 0.65rem;
      border-radius: 9px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: all 0.18s ease;
    }

    .pm-btn-compact-secondary:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .pm-btn-compact-icon {
      border: 1px solid var(--pm-border, #cbd5e1);
      background: var(--pm-surface-2, #f8fafc);
      color: #64748b;
      padding: 0.48rem 0.55rem;
      border-radius: 9px;
      font-size: 0.85rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.18s ease;
    }

    .pm-btn-compact-icon:hover {
      color: #4f46e5;
      background: #f1f5f9;
    }

    /* Modal Clonar Malla */
    .pm-clone-modal-backdrop,
    .pm-guide-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 3000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .pm-guide-modal-backdrop {
      z-index: 3500;
    }

    .pm-clone-modal,
    .pm-guide-modal {
      background: #1e293b;
      color: #fff;
      width: 100%;
      max-width: 480px;
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: pmr-popover-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .pm-guide-modal {
      max-width: 580px;
      border-radius: 20px;
    }

    .pm-clone-header,
    .pm-guide-header {
      padding: 1.2rem 1.4rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .pm-guide-header {
      align-items: center;
      gap: 0.85rem;
    }

    .pm-guide-header-badge {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
    }

    .pm-guide-header-text {
      flex: 1;
      min-width: 0;
    }

    .pm-guide-eyebrow {
      font-size: 0.68rem;
      font-weight: 800;
      color: #fbbf24;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .pm-guide-header-text h3 {
      font-size: 1.15rem;
      font-weight: 900;
      margin: 0.1rem 0 0;
      color: #f8fafc;
    }

    .pm-clone-badge {
      font-size: 0.68rem;
      font-weight: 800;
      color: #818cf8;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .pm-clone-header h3 {
      font-size: 1.1rem;
      font-weight: 800;
      margin: 0.2rem 0 0;
      color: #f8fafc;
    }

    .pm-clone-close,
    .pm-guide-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.3rem;
      cursor: pointer;
      padding: 0;
    }

    .pm-clone-body,
    .pm-guide-body {
      padding: 1.2rem 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .pm-guide-body {
      max-height: 70vh;
      overflow-y: auto;
    }

    .pm-guide-intro {
      font-size: 0.88rem;
      color: #cbd5e1;
      margin: 0;
      line-height: 1.45;
    }

    .pm-guide-steps {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .pm-guide-step {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 0.75rem 0.9rem;
    }

    .pm-step-num {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #4f46e5;
      color: #fff;
      font-weight: 900;
      font-size: 0.82rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .pm-step-content strong {
      font-size: 0.88rem;
      color: #fff;
      display: block;
      margin-bottom: 0.15rem;
    }

    .pm-step-content p {
      font-size: 0.78rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.35;
    }

    .pm-guide-legend {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0.85rem 1rem;
    }

    .pm-guide-legend h4 {
      font-size: 0.8rem;
      font-weight: 800;
      margin: 0 0 0.5rem;
      color: #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .pm-legend-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .pm-legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: #cbd5e1;
    }

    .pm-clone-desc {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.4;
    }

    .pm-clone-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      max-height: 220px;
      overflow-y: auto;
    }

    .pm-clone-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.18s ease;
    }

    .pm-clone-option:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(99, 102, 241, 0.4);
    }

    .pm-clone-option-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .pm-clone-option-info strong {
      font-size: 0.88rem;
      color: #fff;
    }

    .pm-clone-option-info span {
      font-size: 0.74rem;
      color: #94a3b8;
    }

    .pm-clone-footer,
    .pm-guide-footer {
      padding: 1rem 1.4rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .pm-guide-understood {
      width: 100%;
      padding: 0.65rem;
      border-radius: 12px;
      font-size: 0.88rem;
      font-weight: 800;
    }

    /* ── Mobile Viewport: Fijo 2 Columnas (repeat(2, 1fr)) ── */
    @media (max-width: 768px) {
      .pm-planning-container { padding: 0.6rem; }
      .pm-planning-hero {
        padding: 0.9rem 1rem;
        border-radius: 14px;
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
        margin-bottom: 0.85rem;
      }
      .pm-hero-title { font-size: 1.2rem; }
      .pm-hero-subtitle { font-size: 0.78rem; line-height: 1.3; }
      .pm-hero-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.35rem;
      }
      .pm-stat-card { padding: 0.4rem 0.2rem; min-width: 0; border-radius: 9px; }
      .pm-stat-num { font-size: 1.05rem; }
      .pm-stat-label { font-size: 0.55rem; text-align: center; }
      .pm-planning-toolbar {
        flex-direction: column;
        align-items: stretch;
        gap: 0.6rem;
        margin-bottom: 0.85rem;
      }
      .pm-segmented-control { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); padding: 2px; }
      .pm-seg-btn { justify-content: center; padding: 0.42rem 0.2rem; font-size: 0.72rem; }
      .pm-toolbar-right { width: 100%; flex-direction: column; align-items: stretch; gap: 0.5rem; }
      .pm-btn-info-guide { justify-content: center; width: 100%; padding: 0.5rem; }
      .pm-search-box { width: 100%; }
      .pm-search-box input { padding: 0.45rem 0.8rem 0.45rem 32px; font-size: 16px; }

      .pm-compact-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 0.5rem;
      }
      .pm-compact-card {
        padding: 0.7rem 0.65rem;
        border-radius: 12px;
        gap: 0.5rem;
      }
      .pm-compact-title {
        font-size: 0.82rem;
        margin-bottom: 0.15rem;
      }
      .pm-card-meta-line {
        font-size: 0.66rem;
      }
      .pm-status-indicator {
        width: 18px;
        height: 18px;
      }
      .pm-status-dot {
        width: 6px;
        height: 6px;
      }
      .pm-icon-hierarchy {
        padding: 0.3rem 0.45rem;
        border-radius: 7px;
      }
      .pm-chip-symbol {
        font-size: 0.72rem;
      }
      .pm-chip-val {
        font-size: 0.8rem;
      }
      .pm-chip-arrow {
        font-size: 0.65rem;
      }
      .pm-warning-chip {
        padding: 0.3rem 0.45rem;
        font-size: 0.66rem;
      }
      .pm-compact-actions {
        gap: 0.3rem;
      }
      .pm-btn-compact-primary, .pm-btn-compact-secondary {
        min-height: 34px;
        font-size: 0.72rem;
        padding: 0.35rem 0.3rem;
        border-radius: 7px;
        gap: 3px;
      }
      .pm-btn-compact-icon {
        min-height: 34px;
        padding: 0.35rem 0.45rem;
      }
    }
  `
  document.head.appendChild(style)
}
