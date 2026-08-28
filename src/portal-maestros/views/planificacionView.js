/**
 * planificacionView.js
 * Portal Maestros — Gestión y Rutas Académicas (Ultra-Premium Edition)
 *
 * Módulo rediseñado enfocado 100% en la jerarquía pedagógica del maestro:
 * UNIDADES ➔ OBJETIVOS ➔ INDICADORES (con prelaciones y deudas pedagógicas).
 */

import { getMisClases, getInscripcionesClases } from "../services/maestroDataService.js"
import { getTeacherRoutes } from "../services/maestroRouteService.js"
import { announce } from "../utils/a11yUtils.js"
import { AppToast } from "../../shared/components/AppToast.js"
import { router as internalRouter } from "../../core/router/router.js"
import { getMaestroLocal } from "../auth/maestroAuth.js"
import { abrirMapaDeRutas } from "../components/teacherRouteMapPanel.js"
import { openTeacherRoutePicker } from "../components/TeacherRouteBuilder.js"

// ─── Constantes de Instrumentos ───────────────────────────────────────────────

const INSTRUMENT_ICONS = {
  violin: "🎻", viola: "🎻", cello: "🎻", contrabajo: "🎻", chelo: "🎻",
  piano: "🎹", teclado: "🎹",
  guitarra: "🎸", bajo: "🎸", ukulele: "🎸",
  flauta: "🪈", clarinete: "🎵", oboe: "🎵", fagot: "🎵", saxofon: "🎵",
  trompeta: "🎺", trombon: "🎺", tuba: "🎺", corno: "🎺", corneta: "🎺",
  percusion: "🥁", bateria: "🥁", marimba: "🥁", xilofono: "🥁", timbal: "🥁",
  canto: "🎤", voz: "🎤", vocal: "🎤",
  arpa: "🪗", acordeon: "🪗",
  teoria: "📖", solfeo: "📖", armonia: "📖", historia: "📖",
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
  })[char])
}

function getInstrumentIcon(instrumento) {
  if (!instrumento) return "🎼"
  const key = instrumento.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return Object.entries(INSTRUMENT_ICONS).find(([k]) => key.includes(k))?.[1] || "🎼"
}

// ─── Vista Principal ───────────────────────────────────────────────────────────

export async function renderPlanificacionView(container, { maestroId: explicitMaestroId, router: portalRouter } = {}) {
  const activeRouter = portalRouter || window.router || internalRouter
  const maestro = getMaestroLocal()
  const maestroId = explicitMaestroId || maestro?.id || null

  _injectStyles()

  container.innerHTML = `
    <div class="pm-planning-container">
      <!-- Header Hero Ultra-Premium -->
      <div class="pm-planning-hero">
        <div class="pm-hero-glow"></div>
        <div class="pm-hero-content">
          <div class="pm-hero-icon-wrap">
            <span class="pm-hero-icon">🎼</span>
          </div>
          <div class="pm-hero-text">
            <div class="pm-hero-eyebrow">
              <span class="pm-live-dot"></span> PLANIFICACIÓN PEDAGÓGICA
            </div>
            <h1 class="pm-hero-title">Malla Curricular & Rutas</h1>
            <p class="pm-hero-subtitle">
              Estructura el aprendizaje por <strong>Unidades ➔ Objetivos ➔ Indicadores</strong> con prelación y control de deuda académica.
            </p>
          </div>
        </div>

        <!-- Metrics Dashboard -->
        <div class="pm-hero-stats" id="pm-hero-stats">
          <div class="pm-stat-card">
            <span class="pm-stat-num" id="stat-total-clases">-</span>
            <span class="pm-stat-label">Clases Asignadas</span>
          </div>
          <div class="pm-stat-card">
            <span class="pm-stat-num pm-stat-num--success" id="stat-con-ruta">-</span>
            <span class="pm-stat-label">Con Malla Diseñada</span>
          </div>
          <div class="pm-stat-card">
            <span class="pm-stat-num pm-stat-num--accent" id="stat-total-indicadores">-</span>
            <span class="pm-stat-label">Indicadores Activos</span>
          </div>
        </div>
      </div>

      <!-- Segmented Filter Bar -->
      <div class="pm-planning-toolbar">
        <div class="pm-segmented-control" id="pm-class-filters">
          <button type="button" class="pm-seg-btn active" data-filter="all">
            <i class="bi bi-grid-fill"></i> Todas
          </button>
          <button type="button" class="pm-seg-btn" data-filter="with-route">
            <i class="bi bi-check-circle-fill"></i> Con Ruta
          </button>
          <button type="button" class="pm-seg-btn" data-filter="no-route">
            <i class="bi bi-exclamation-circle-fill"></i> Pendientes
          </button>
        </div>
        <div class="pm-search-box">
          <i class="bi bi-search"></i>
          <input type="text" id="pm-search-clases" placeholder="Buscar por clase o instrumento..." />
        </div>
      </div>

      <!-- Main Content Grid -->
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
      <div class="pm-premium-grid">
        ${filtered
          .map((clase) => {
            const icon = getInstrumentIcon(clase.instrumento)
            const hasRoute = clase.hasRoute

            return `
              <div class="pm-luxury-card ${hasRoute ? "has-route" : "no-route"}" data-clase-id="${clase.id}">
                <!-- Top Glow Accent -->
                <div class="pm-card-glow ${hasRoute ? "glow-emerald" : "glow-amber"}"></div>

                <!-- Header Block -->
                <div class="pm-card-header">
                  <div class="pm-instrument-badge">
                    <span>${icon}</span>
                  </div>
                  <div class="pm-header-info">
                    <h3 class="pm-card-title">${escapeHtml(clase.nombre)}</h3>
                    <div class="pm-card-meta">
                      <span class="pm-meta-chip"><i class="bi bi-music-note-beamed"></i> ${escapeHtml(clase.instrumento || "General")}</span>
                      <span class="pm-meta-chip"><i class="bi bi-people-fill"></i> ${clase.totalStudents} ${clase.totalStudents === 1 ? "alumno" : "alumnos"}</span>
                    </div>
                  </div>
                  <div class="pm-status-pill ${hasRoute ? "status-active" : "status-pending"}">
                    <span class="pm-pill-dot"></span>
                    <span>${hasRoute ? "Ruta Lista" : "Sin Ruta"}</span>
                  </div>
                </div>

                <!-- Body / Hierarchy Stepper -->
                <div class="pm-card-body">
                  ${
                    hasRoute
                      ? `
                    <div class="pm-stepper-capsules">
                      <div class="pm-capsule">
                        <span class="pm-capsule-num">${clase.unidadesCount}</span>
                        <span class="pm-capsule-lbl">Unidades</span>
                      </div>
                      <div class="pm-capsule-arrow"><i class="bi bi-chevron-right"></i></div>
                      <div class="pm-capsule">
                        <span class="pm-capsule-num">${clase.objetivosCount}</span>
                        <span class="pm-capsule-lbl">Objetivos</span>
                      </div>
                      <div class="pm-capsule-arrow"><i class="bi bi-chevron-right"></i></div>
                      <div class="pm-capsule pm-capsule--highlight">
                        <span class="pm-capsule-num">${clase.indicadoresCount}</span>
                        <span class="pm-capsule-lbl">Indicadores</span>
                      </div>
                    </div>
                  `
                      : `
                    <div class="pm-warning-banner">
                      <div class="pm-warn-icon"><i class="bi bi-lightning-charge-fill"></i></div>
                      <div class="pm-warn-text">
                        <strong>Malla pendiente de diseño</strong>
                        <span>Crea las unidades y objetivos para evaluar con estrellas en asistencia.</span>
                      </div>
                    </div>
                  `
                  }
                </div>

                <!-- Footer Action Buttons -->
                <div class="pm-card-footer">
                  <button type="button" class="pm-btn-primary pm-btn-designer" data-clase-id="${clase.id}">
                    <i class="bi bi-pencil-square"></i>
                    <span>${hasRoute ? "Editar Malla" : "Diseñar Malla"}</span>
                  </button>

                  <button type="button" class="pm-btn-secondary pm-btn-map" data-clase-id="${clase.id}">
                    <i class="bi bi-diagram-3-fill"></i>
                    <span>Ver Mapa & Deudas</span>
                  </button>
                </div>
              </div>
            `
          })
          .join("")}
      </div>
    `

    // Wire action buttons
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
  }

  await loadData()
}

// ─── Estilos CSS Ultra-Premium ───────────────────────────────────────────────

function _injectStyles() {
  if (document.getElementById("pm-planning-ultra-styles")) return

  const style = document.createElement("style")
  style.id = "pm-planning-ultra-styles"
  style.textContent = `
    .pm-planning-container {
      max-width: 1320px;
      margin: 0 auto;
      padding: 1.75rem 1.5rem 3rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    /* ── Hero Banner Ultra-Premium ── */
    .pm-planning-hero {
      position: relative;
      background: radial-gradient(130% 120% at 50% 0%, #1e1b4b 0%, #0f172a 60%, #020617 100%);
      color: #fff;
      padding: 2.2rem 2.5rem;
      border-radius: 24px;
      border: 1px solid rgba(99, 102, 241, 0.25);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.8rem;
      margin-bottom: 2rem;
      overflow: hidden;
    }

    .pm-hero-glow {
      position: absolute;
      top: -60px;
      right: 15%;
      width: 260px;
      height: 260px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, transparent 70%);
      pointer-events: none;
    }

    .pm-hero-content {
      display: flex;
      align-items: center;
      gap: 1.4rem;
      max-width: 650px;
      position: relative;
      z-index: 1;
    }

    .pm-hero-icon-wrap {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%);
      border: 1px solid rgba(255, 255, 255, 0.16);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      flex-shrink: 0;
    }

    .pm-hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #818cf8;
      margin-bottom: 0.4rem;
      text-transform: uppercase;
    }

    .pm-live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #38bdf8;
      box-shadow: 0 0 8px #38bdf8;
    }

    .pm-hero-title {
      font-size: 1.85rem;
      font-weight: 900;
      margin: 0 0 0.4rem;
      letter-spacing: -0.03em;
      background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .pm-hero-subtitle {
      font-size: 0.95rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }

    .pm-hero-subtitle strong {
      color: #f1f5f9;
      font-weight: 700;
    }

    .pm-hero-stats {
      display: flex;
      gap: 0.85rem;
      position: relative;
      z-index: 1;
    }

    .pm-stat-card {
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1rem 1.4rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 110px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    .pm-stat-num {
      font-size: 1.75rem;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: #f8fafc;
      line-height: 1.1;
    }

    .pm-stat-num--success {
      color: #34d399;
      text-shadow: 0 0 16px rgba(52, 211, 153, 0.35);
    }

    .pm-stat-num--accent {
      color: #a78bfa;
      text-shadow: 0 0 16px rgba(167, 139, 250, 0.35);
    }

    .pm-stat-label {
      font-size: 0.72rem;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0.35rem;
    }

    /* ── Toolbar & Segmented Control ── */
    .pm-planning-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.2rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }

    .pm-segmented-control {
      display: inline-flex;
      background: rgba(15, 23, 42, 0.05);
      border: 1px solid var(--pm-border, rgba(0, 0, 0, 0.08));
      padding: 4px;
      border-radius: 16px;
      gap: 4px;
    }

    .pm-seg-btn {
      background: transparent;
      border: none;
      color: var(--pm-text-muted, #64748b);
      font-size: 0.86rem;
      font-weight: 700;
      padding: 0.55rem 1.1rem;
      border-radius: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .pm-seg-btn:hover {
      color: var(--pm-text, #0f172a);
    }

    .pm-seg-btn.active {
      background: var(--pm-primary, #4f46e5);
      color: #fff;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
    }

    .pm-search-box {
      position: relative;
      min-width: 280px;
    }

    .pm-search-box i {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      font-size: 0.95rem;
    }

    .pm-search-box input {
      width: 100%;
      padding: 0.65rem 1.1rem 0.65rem 40px;
      border-radius: 14px;
      border: 1px solid var(--pm-border, #e2e8f0);
      background: var(--pm-surface, #fff);
      color: inherit;
      font-size: 0.88rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .pm-search-box input:focus {
      outline: none;
      border-color: var(--pm-primary, #4f46e5);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }

    /* ── Grid & Luxury Cards ── */
    .pm-premium-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.6rem;
    }

    .pm-luxury-card {
      position: relative;
      background: var(--pm-surface, #ffffff);
      border: 1px solid var(--pm-border, #e2e8f0);
      border-radius: 22px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.3rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .pm-luxury-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.09);
      border-color: #cbd5e1;
    }

    .pm-card-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
    }

    .glow-emerald {
      background: linear-gradient(90deg, #10b981, #34d399, #6ee7b7);
    }

    .glow-amber {
      background: linear-gradient(90deg, #f59e0b, #fbbf24, #fde68a);
    }

    .pm-card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .pm-instrument-badge {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
      border: 1px solid rgba(79, 70, 229, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.9rem;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.08);
    }

    .pm-header-info {
      flex: 1;
      min-width: 0;
    }

    .pm-card-title {
      font-size: 1.12rem;
      font-weight: 800;
      margin: 0 0 0.25rem;
      letter-spacing: -0.02em;
      color: var(--pm-text, #0f172a);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pm-card-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .pm-meta-chip {
      font-size: 0.76rem;
      font-weight: 600;
      color: var(--pm-text-muted, #64748b);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .pm-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.74rem;
      font-weight: 800;
      padding: 0.3rem 0.75rem;
      border-radius: 999px;
      white-space: nowrap;
    }

    .status-active {
      background: rgba(16, 185, 129, 0.12);
      color: #059669;
      border: 1px solid rgba(16, 185, 129, 0.28);
    }

    .status-active .pm-pill-dot {
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }

    .status-pending {
      background: rgba(245, 158, 11, 0.12);
      color: #d97706;
      border: 1px solid rgba(245, 158, 11, 0.28);
    }

    .status-pending .pm-pill-dot {
      background: #f59e0b;
    }

    .pm-pill-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .pm-card-body {
      flex: 1;
    }

    /* Stepper Capsules */
    .pm-stepper-capsules {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--pm-surface-2, #f8fafc);
      padding: 0.9rem 1.1rem;
      border-radius: 16px;
      border: 1px solid var(--pm-border, #e2e8f0);
    }

    .pm-capsule {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .pm-capsule-num {
      font-size: 1.25rem;
      font-weight: 900;
      color: var(--pm-primary, #4f46e5);
      line-height: 1;
    }

    .pm-capsule--highlight .pm-capsule-num {
      color: #059669;
    }

    .pm-capsule-lbl {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--pm-text-muted, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .pm-capsule-arrow {
      color: #cbd5e1;
      font-size: 0.85rem;
    }

    .pm-warning-banner {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      padding: 0.85rem 1rem;
      border-radius: 14px;
      background: rgba(245, 158, 11, 0.07);
      border: 1px solid rgba(245, 158, 11, 0.22);
    }

    .pm-warn-icon {
      font-size: 1.3rem;
      color: #f59e0b;
      flex-shrink: 0;
    }

    .pm-warn-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 0.78rem;
      color: #92400e;
      line-height: 1.35;
    }

    .pm-warn-text strong {
      font-weight: 700;
      color: #78350f;
    }

    /* Actions */
    .pm-card-footer {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      padding-top: 0.2rem;
    }

    .pm-btn-primary {
      border: none;
      background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
      color: #fff;
      padding: 0.75rem 1rem;
      border-radius: 14px;
      font-size: 0.86rem;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .pm-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.45);
    }

    .pm-btn-primary:active {
      transform: scale(0.98);
    }

    .pm-btn-secondary {
      border: 1px solid var(--pm-border, #cbd5e1);
      background: var(--pm-surface-2, #f8fafc);
      color: var(--pm-text, #334155);
      padding: 0.75rem 1rem;
      border-radius: 14px;
      font-size: 0.86rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .pm-btn-secondary:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #94a3b8;
    }

    .pm-btn-secondary:active {
      transform: scale(0.98);
    }

    /* Loading & Empty States */
    .pm-loading-card,
    .pm-empty-card {
      padding: 4.5rem 2rem;
      text-align: center;
      background: var(--pm-surface, #fff);
      border-radius: 22px;
      border: 1px dashed var(--pm-border, #cbd5e1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.85rem;
    }

    .pm-empty-icon {
      font-size: 3.2rem;
    }

    .pm-empty-title {
      font-size: 1.2rem;
      font-weight: 800;
      margin: 0;
      color: var(--pm-text, #0f172a);
    }

    .pm-empty-desc {
      font-size: 0.88rem;
      color: var(--pm-text-muted, #64748b);
      max-width: 440px;
      margin: 0;
      line-height: 1.5;
    }

    /* Dark Theme Support */
    [data-theme="dark"] .pm-segmented-control {
      background: rgba(15, 23, 42, 0.6);
      border-color: rgba(255, 255, 255, 0.08);
    }

    [data-theme="dark"] .pm-seg-btn {
      color: #94a3b8;
    }

    [data-theme="dark"] .pm-seg-btn:hover {
      color: #fff;
    }

    [data-theme="dark"] .pm-search-box input {
      background: #1e293b;
      border-color: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    [data-theme="dark"] .pm-luxury-card {
      background: linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-color: rgba(255, 255, 255, 0.08);
    }

    [data-theme="dark"] .pm-card-title {
      color: #fff;
    }

    [data-theme="dark"] .pm-stepper-capsules {
      background: rgba(15, 23, 42, 0.7);
      border-color: rgba(255, 255, 255, 0.06);
    }

    [data-theme="dark"] .pm-btn-secondary {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.12);
      color: #e2e8f0;
    }

    [data-theme="dark"] .pm-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    [data-theme="dark"] .pm-warning-banner {
      background: rgba(245, 158, 11, 0.08);
      border-color: rgba(245, 158, 11, 0.2);
    }

    [data-theme="dark"] .pm-warn-text {
      color: #fde68a;
    }

    [data-theme="dark"] .pm-warn-text strong {
      color: #fbbf24;
    }

    /* ── Mobile Viewport ── */
    @media (max-width: 768px) {
      .pm-planning-container {
        padding: 0.9rem;
      }
      .pm-planning-hero {
        padding: 1.4rem;
        border-radius: 20px;
        flex-direction: column;
        align-items: stretch;
        gap: 1.3rem;
      }
      .pm-hero-content {
        gap: 1rem;
      }
      .pm-hero-icon-wrap {
        width: 56px;
        height: 56px;
        font-size: 2rem;
        border-radius: 16px;
      }
      .pm-hero-title {
        font-size: 1.45rem;
      }
      .pm-hero-subtitle {
        font-size: 0.86rem;
      }
      .pm-hero-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
      }
      .pm-stat-card {
        min-width: 0;
        padding: 0.75rem 0.4rem;
        border-radius: 14px;
      }
      .pm-stat-num {
        font-size: 1.4rem;
      }
      .pm-stat-label {
        font-size: 0.62rem;
        text-align: center;
      }
      .pm-planning-toolbar {
        flex-direction: column;
        align-items: stretch;
        gap: 0.85rem;
      }
      .pm-segmented-control {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
      }
      .pm-seg-btn {
        justify-content: center;
        padding: 0.6rem 0.5rem;
        font-size: 0.8rem;
      }
      .pm-search-box {
        width: 100%;
      }
      .pm-search-box input {
        font-size: 16px;
        padding: 0.75rem 1rem 0.75rem 40px;
      }
      .pm-premium-grid {
        grid-template-columns: 1fr;
        gap: 1.2rem;
      }
      .pm-luxury-card {
        padding: 1.25rem;
        border-radius: 20px;
      }
      .pm-card-footer {
        grid-template-columns: 1fr;
        gap: 0.65rem;
      }
      .pm-btn-primary, .pm-btn-secondary {
        min-height: 48px;
        font-size: 0.92rem;
      }
    }
  `
  document.head.appendChild(style)
}
