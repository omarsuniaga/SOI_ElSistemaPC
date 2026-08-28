/**
 * planificacionView.js
 * Portal Maestros — Gestión y Rutas Académicas
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
      <!-- Header Hero -->
      <div class="pm-planning-hero">
        <div class="pm-hero-content">
          <div class="pm-hero-icon">📚</div>
          <div class="pm-hero-text">
            <h1 class="pm-hero-title">Gestión y Rutas Académicas</h1>
            <p class="pm-hero-subtitle">
              Diseña la malla curricular de tus clases: <strong>Unidades ➔ Objetivos ➔ Indicadores</strong> con prelaciones y seguimiento de deudas pedagógicas.
            </p>
          </div>
        </div>

        <!-- Metrics Dashboard -->
        <div class="pm-hero-stats" id="pm-hero-stats">
          <div class="pm-stat-box">
            <span class="pm-stat-num" id="stat-total-clases">-</span>
            <span class="pm-stat-label">Mis Clases</span>
          </div>
          <div class="pm-stat-box">
            <span class="pm-stat-num" id="stat-con-ruta">-</span>
            <span class="pm-stat-label">Con Ruta Activa</span>
          </div>
          <div class="pm-stat-box">
            <span class="pm-stat-num" id="stat-total-indicadores">-</span>
            <span class="pm-stat-label">Indicadores Totales</span>
          </div>
        </div>
      </div>

      <!-- Toolbar & Filters -->
      <div class="pm-planning-toolbar">
        <div class="pm-filter-pills" id="pm-class-filters">
          <button type="button" class="pm-pill active" data-filter="all">Todas las clases</button>
          <button type="button" class="pm-pill" data-filter="with-route">Con Ruta Diseñada</button>
          <button type="button" class="pm-pill" data-filter="no-route">Sin Ruta (Pendientes)</button>
        </div>
        <div class="pm-toolbar-search">
          <i class="bi bi-search"></i>
          <input type="text" id="pm-search-clases" placeholder="Buscar clase o instrumento..." />
        </div>
      </div>

      <!-- Main Content Grid -->
      <div id="pm-classes-grid-host">
        <div class="pm-loading-skeleton">
          <div class="spinner-border text-primary" role="status"></div>
          <span>Cargando tus clases y mapas de rutas...</span>
        </div>
      </div>
    </div>
  `

  const gridHost = container.querySelector("#pm-classes-grid-host")
  const searchInput = container.querySelector("#pm-search-clases")
  const filterPills = container.querySelectorAll("#pm-class-filters .pm-pill")

  let currentFilter = "all"
  let currentSearch = ""
  let loadedClases = []

  // Event Listeners
  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filterPills.forEach((p) => p.classList.remove("active"))
      pill.classList.add("active")
      currentFilter = pill.dataset.filter
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
          <div class="pm-empty-state">
            <div class="pm-empty-icon">🎼</div>
            <h3>Sin clases asignadas</h3>
            <p>Cuando la administración te asigne clases, aparecerán aquí para que puedas diseñar sus rutas.</p>
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
      announce(`${totalClases} clases cargadas en Rutas Académicas.`)
    } catch (err) {
      console.error("[planificacionView] Error loading classes:", err)
      gridHost.innerHTML = `
        <div class="pm-error-state">
          <div class="pm-error-icon">⚠️</div>
          <h3>Error al cargar las rutas</h3>
          <p>${escapeHtml(err.message)}</p>
          <button type="button" class="btn btn-outline-primary btn-sm mt-3" id="btn-retry-planning">
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
        <div class="pm-empty-state">
          <div class="pm-empty-icon">🔍</div>
          <h3>No se encontraron clases</h3>
          <p>No hay clases que coincidan con los filtros seleccionados.</p>
        </div>
      `
      return
    }

    gridHost.innerHTML = `
      <div class="pm-routes-grid">
        ${filtered
          .map((clase) => {
            const icon = getInstrumentIcon(clase.instrumento)
            const hasRoute = clase.hasRoute

            return `
              <div class="pm-route-card ${hasRoute ? "has-route" : "no-route"}" data-clase-id="${clase.id}">
                <!-- Card Header -->
                <div class="pm-rc-header">
                  <div class="pm-rc-avatar">${icon}</div>
                  <div class="pm-rc-title-block">
                    <h3 class="pm-rc-title">${escapeHtml(clase.nombre)}</h3>
                    <div class="pm-rc-instrument">${escapeHtml(clase.instrumento || "General")} · 👥 ${clase.totalStudents} alumno${clase.totalStudents !== 1 ? "s" : ""}</div>
                  </div>
                  <div class="pm-rc-status-badge ${hasRoute ? "badge-active" : "badge-pending"}">
                    ${hasRoute ? "● Ruta Activa" : "○ Sin Ruta"}
                  </div>
                </div>

                <!-- Card Structure Summary -->
                <div class="pm-rc-body">
                  ${
                    hasRoute
                      ? `
                    <div class="pm-hierarchy-stats">
                      <div class="pm-hs-item">
                        <span class="pm-hs-val">${clase.unidadesCount}</span>
                        <span class="pm-hs-lbl">Unidades</span>
                      </div>
                      <div class="pm-hs-divider">➔</div>
                      <div class="pm-hs-item">
                        <span class="pm-hs-val">${clase.objetivosCount}</span>
                        <span class="pm-hs-lbl">Objetivos</span>
                      </div>
                      <div class="pm-hs-divider">➔</div>
                      <div class="pm-hs-item">
                        <span class="pm-hs-val">${clase.indicadoresCount}</span>
                        <span class="pm-hs-lbl">Indicadores</span>
                      </div>
                    </div>
                  `
                      : `
                    <div class="pm-no-route-notice">
                      <i class="bi bi-exclamation-circle-fill text-warning"></i>
                      <span>Esta clase no tiene un mapa de ruta definido. Crea una para organizar tus clases y calificar.</span>
                    </div>
                  `
                  }
                </div>

                <!-- Card Actions -->
                <div class="pm-rc-actions">
                  <button type="button" class="pm-btn-action pm-btn-designer" data-clase-id="${clase.id}" title="Diseñar o editar Unidades, Objetivos e Indicadores">
                    <i class="bi bi-pencil-square"></i> ${hasRoute ? "Editar Ruta" : "Diseñar Ruta"}
                  </button>

                  <button type="button" class="pm-btn-action pm-btn-map" data-clase-id="${clase.id}" title="Abrir matriz interactiva de logro y deudas">
                    <i class="bi bi-diagram-3-fill"></i> Ver Mapa & Deudas
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

// ─── Estilos CSS ───────────────────────────────────────────────────────────────

function _injectStyles() {
  if (document.getElementById("pm-planning-redesign-styles")) return

  const style = document.createElement("style")
  style.id = "pm-planning-redesign-styles"
  style.textContent = `
    .pm-planning-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 1.5rem;
      color: var(--pm-text, #1e293b);
    }

    /* ── Hero Banner ── */
    .pm-planning-hero {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #fff;
      padding: 2rem 2.2rem;
      border-radius: 20px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
      overflow: hidden;
    }

    .pm-planning-hero::after {
      content: "";
      position: absolute;
      right: -40px;
      bottom: -40px;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
      pointer-events: none;
    }

    .pm-hero-content {
      display: flex;
      align-items: center;
      gap: 1.2rem;
      max-width: 680px;
    }

    .pm-hero-icon {
      font-size: 2.8rem;
      background: rgba(255, 255, 255, 0.06);
      width: 68px;
      height: 68px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      flex-shrink: 0;
    }

    .pm-hero-title {
      font-size: 1.6rem;
      font-weight: 800;
      margin: 0 0 0.4rem;
      letter-spacing: -0.02em;
    }

    .pm-hero-subtitle {
      font-size: 0.92rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }

    .pm-hero-subtitle strong {
      color: #e2e8f0;
    }

    .pm-hero-stats {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .pm-stat-box {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.9rem 1.4rem;
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 100px;
    }

    .pm-stat-num {
      font-size: 1.6rem;
      font-weight: 800;
      color: #38bdf8;
    }

    .pm-stat-label {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* ── Toolbar & Filters ── */
    .pm-planning-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }

    .pm-filter-pills {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .pm-pill {
      background: var(--pm-surface, #fff);
      color: var(--pm-text-muted, #64748b);
      border: 1px solid var(--pm-border, #e2e8f0);
      padding: 0.55rem 1.1rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .pm-pill:hover {
      border-color: #cbd5e1;
      color: var(--pm-text, #1e293b);
    }

    .pm-pill.active {
      background: var(--pm-primary, #3b82f6);
      color: #fff;
      border-color: var(--pm-primary, #3b82f6);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }

    .pm-toolbar-search {
      position: relative;
      min-width: 260px;
    }

    .pm-toolbar-search i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .pm-toolbar-search input {
      width: 100%;
      padding: 0.55rem 1rem 0.55rem 36px;
      border-radius: 999px;
      border: 1px solid var(--pm-border, #e2e8f0);
      background: var(--pm-surface, #fff);
      color: inherit;
      font-size: 0.85rem;
    }

    .pm-toolbar-search input:focus {
      outline: none;
      border-color: var(--pm-primary, #3b82f6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    /* ── Routes Grid ── */
    .pm-routes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.5rem;
    }

    .pm-route-card {
      background: var(--pm-surface, #fff);
      border: 1px solid var(--pm-border, #e2e8f0);
      border-radius: 18px;
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      transition: all 0.25s ease;
    }

    .pm-route-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
      border-color: #cbd5e1;
    }

    .pm-route-card.has-route {
      border-top: 4px solid #10b981;
    }

    .pm-route-card.no-route {
      border-top: 4px solid #f59e0b;
    }

    .pm-rc-header {
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }

    .pm-rc-avatar {
      font-size: 1.8rem;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(59, 130, 246, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .pm-rc-title-block {
      flex: 1;
      min-width: 0;
    }

    .pm-rc-title {
      font-size: 1.05rem;
      font-weight: 800;
      margin: 0 0 0.2rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--pm-text, #0f172a);
    }

    .pm-rc-instrument {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #64748b);
      font-weight: 600;
    }

    .pm-rc-status-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      white-space: nowrap;
    }

    .pm-rc-status-badge.badge-active {
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .pm-rc-status-badge.badge-pending {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.25);
    }

    .pm-rc-body {
      flex: 1;
    }

    /* Hierarchy Stats */
    .pm-hierarchy-stats {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--pm-surface-2, #f8fafc);
      padding: 0.8rem 1rem;
      border-radius: 12px;
      border: 1px solid var(--pm-border, #e2e8f0);
    }

    .pm-hs-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .pm-hs-val {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--pm-primary, #3b82f6);
    }

    .pm-hs-lbl {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--pm-text-muted, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .pm-hs-divider {
      color: #cbd5e1;
      font-size: 0.85rem;
    }

    .pm-no-route-notice {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      padding: 0.8rem;
      border-radius: 12px;
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.2);
      font-size: 0.8rem;
      color: #92400e;
      line-height: 1.4;
    }

    /* Actions */
    .pm-rc-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .pm-btn-action {
      border: none;
      padding: 0.65rem 0.85rem;
      border-radius: 12px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: all 0.2s ease;
    }

    .pm-btn-designer {
      background: var(--pm-primary, #3b82f6);
      color: #fff;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }

    .pm-btn-designer:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .pm-btn-map {
      background: var(--pm-surface-2, #f1f5f9);
      color: var(--pm-text, #334155);
      border: 1px solid var(--pm-border, #cbd5e1);
    }

    .pm-btn-map:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    /* States */
    .pm-loading-skeleton,
    .pm-empty-state,
    .pm-error-state {
      padding: 4rem 2rem;
      text-align: center;
      background: var(--pm-surface, #fff);
      border-radius: 18px;
      border: 1px dashed var(--pm-border, #cbd5e1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .pm-empty-icon, .pm-error-icon {
      font-size: 3rem;
    }

    /* Dark Mode Support */
    [data-theme="dark"] .pm-planning-container {
      color: #f1f5f9;
    }

    [data-theme="dark"] .pm-pill {
      background: #1e293b;
      border-color: #334155;
      color: #94a3b8;
    }

    [data-theme="dark"] .pm-pill.active {
      background: #3b82f6;
      color: #fff;
    }

    [data-theme="dark"] .pm-toolbar-search input {
      background: #1e293b;
      border-color: #334155;
      color: #fff;
    }

    [data-theme="dark"] .pm-route-card {
      background: #1e293b;
      border-color: #334155;
    }

    [data-theme="dark"] .pm-rc-title {
      color: #fff;
    }

    [data-theme="dark"] .pm-hierarchy-stats {
      background: #0f172a;
      border-color: #334155;
    }

    [data-theme="dark"] .pm-btn-map {
      background: #0f172a;
      color: #cbd5e1;
      border-color: #334155;
    }

    @media (max-width: 768px) {
      .pm-planning-container {
        padding: 1rem;
      }
      .pm-planning-hero {
        padding: 1.4rem;
      }
      .pm-routes-grid {
        grid-template-columns: 1fr;
      }
      .pm-rc-actions {
        grid-template-columns: 1fr;
      }
    }
  `
  document.head.appendChild(style)
}
