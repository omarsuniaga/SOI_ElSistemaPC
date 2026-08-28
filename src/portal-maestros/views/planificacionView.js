/**
 * planificacionView.js
 * Portal Maestros — Gestión y Rutas Académicas (Cuadrícula Compacta 3x)
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
      <!-- Header Hero Compacto & Elegante -->
      <div class="pm-planning-hero">
        <div class="pm-hero-glow"></div>
        <div class="pm-hero-content">
          <div class="pm-hero-icon-wrap">
            <span class="pm-hero-icon">🎼</span>
          </div>
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

      <!-- Segmented Filter Bar -->
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
        <div class="pm-search-box">
          <i class="bi bi-search"></i>
          <input type="text" id="pm-search-clases" placeholder="Buscar clase o instrumento..." />
        </div>
      </div>

      <!-- Main Content Grid (3 por fila) -->
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
      <div class="pm-compact-grid">
        ${filtered
          .map((clase) => {
            const icon = getInstrumentIcon(clase.instrumento)
            const hasRoute = clase.hasRoute

            return `
              <div class="pm-compact-card ${hasRoute ? "has-route" : "no-route"}" data-clase-id="${clase.id}">
                <!-- Top Accent Line -->
                <div class="pm-compact-card-accent ${hasRoute ? "accent-emerald" : "accent-amber"}"></div>

                <!-- Card Header -->
                <div class="pm-card-top-row">
                  <div class="pm-compact-avatar">
                    <span>${icon}</span>
                  </div>
                  <div class="pm-compact-title-wrap">
                    <h3 class="pm-compact-title" title="${escapeHtml(clase.nombre)}">${escapeHtml(clase.nombre)}</h3>
                    <div class="pm-compact-subtitle">
                      <span>${escapeHtml(clase.instrumento || "General")}</span>
                      <span class="pm-dot-separator">·</span>
                      <span><i class="bi bi-people-fill"></i> ${clase.totalStudents}</span>
                    </div>
                  </div>
                  <div class="pm-compact-badge ${hasRoute ? "badge-active" : "badge-pending"}" title="${hasRoute ? "Ruta Activa" : "Sin Ruta"}">
                    ${hasRoute ? "● Lista" : "○ Pendiente"}
                  </div>
                </div>

                <!-- Compact Structure Bar -->
                <div class="pm-compact-body">
                  ${
                    hasRoute
                      ? `
                    <div class="pm-micro-hierarchy">
                      <div class="pm-micro-chip">
                        <span class="pm-micro-val">${clase.unidadesCount}</span>
                        <span class="pm-micro-lbl">Unid</span>
                      </div>
                      <span class="pm-micro-arrow">➔</span>
                      <div class="pm-micro-chip">
                        <span class="pm-micro-val">${clase.objetivosCount}</span>
                        <span class="pm-micro-lbl">Obj</span>
                      </div>
                      <span class="pm-micro-arrow">➔</span>
                      <div class="pm-micro-chip pm-micro-chip--highlight">
                        <span class="pm-micro-val">${clase.indicadoresCount}</span>
                        <span class="pm-micro-lbl">Ind</span>
                      </div>
                    </div>
                  `
                      : `
                    <div class="pm-micro-warning">
                      <i class="bi bi-exclamation-triangle-fill text-warning"></i>
                      <span>Malla sin definir</span>
                    </div>
                  `
                  }
                </div>

                <!-- Compact Actions Row -->
                <div class="pm-compact-actions">
                  <button type="button" class="pm-btn-compact-primary pm-btn-designer" data-clase-id="${clase.id}">
                    <i class="bi bi-pencil-square"></i>
                    <span>${hasRoute ? "Editar" : "Diseñar"}</span>
                  </button>

                  <button type="button" class="pm-btn-compact-secondary pm-btn-map" data-clase-id="${clase.id}">
                    <i class="bi bi-diagram-3-fill"></i>
                    <span>Mapa</span>
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

// ─── Estilos CSS Cuadrícula Compacta 3x ────────────────────────────────────────

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
      padding: 1.4rem 1.8rem;
      border-radius: 18px;
      border: 1px solid rgba(99, 102, 241, 0.22);
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.2rem;
      margin-bottom: 1.4rem;
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

    .pm-hero-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%);
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.9rem;
      flex-shrink: 0;
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

    /* ── Cuadrícula Compacta: 3 Clases por Fila ── */
    .pm-compact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
      gap: 1rem;
    }

    @media (min-width: 992px) {
      .pm-compact-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (min-width: 1360px) {
      .pm-compact-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
    }

    .pm-compact-card {
      position: relative;
      background: var(--pm-surface, #ffffff);
      border: 1px solid var(--pm-border, #e2e8f0);
      border-radius: 16px;
      padding: 1rem 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .pm-compact-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
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
      align-items: center;
      gap: 0.75rem;
    }

    .pm-compact-avatar {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
      border: 1px solid rgba(79, 70, 229, 0.14);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .pm-compact-title-wrap {
      flex: 1;
      min-width: 0;
    }

    .pm-compact-title {
      font-size: 0.95rem;
      font-weight: 800;
      margin: 0 0 0.15rem;
      letter-spacing: -0.01em;
      color: var(--pm-text, #0f172a);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pm-compact-subtitle {
      font-size: 0.74rem;
      font-weight: 600;
      color: var(--pm-text-muted, #64748b);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .pm-dot-separator { opacity: 0.5; }

    .pm-compact-badge {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.22rem 0.55rem;
      border-radius: 999px;
      white-space: nowrap;
    }

    .badge-active {
      background: rgba(16, 185, 129, 0.12);
      color: #059669;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .badge-pending {
      background: rgba(245, 158, 11, 0.12);
      color: #d97706;
      border: 1px solid rgba(245, 158, 11, 0.25);
    }

    .pm-compact-body {
      flex: 1;
    }

    /* Micro-Hierarchy */
    .pm-micro-hierarchy {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--pm-surface-2, #f8fafc);
      padding: 0.55rem 0.8rem;
      border-radius: 11px;
      border: 1px solid var(--pm-border, #e2e8f0);
    }

    .pm-micro-chip {
      display: flex;
      align-items: baseline;
      gap: 3px;
    }

    .pm-micro-val {
      font-size: 1.02rem;
      font-weight: 900;
      color: var(--pm-primary, #4f46e5);
      line-height: 1;
    }

    .pm-micro-chip--highlight .pm-micro-val { color: #059669; }

    .pm-micro-lbl {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--pm-text-muted, #64748b);
      text-transform: uppercase;
    }

    .pm-micro-arrow {
      color: #cbd5e1;
      font-size: 0.72rem;
    }

    .pm-micro-warning {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0.55rem 0.75rem;
      border-radius: 10px;
      background: rgba(245, 158, 11, 0.07);
      border: 1px solid rgba(245, 158, 11, 0.2);
      font-size: 0.75rem;
      color: #92400e;
      font-weight: 600;
    }

    /* Actions Compact */
    .pm-compact-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.55rem;
    }

    .pm-btn-compact-primary {
      border: none;
      background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
      color: #fff;
      padding: 0.52rem 0.75rem;
      border-radius: 11px;
      font-size: 0.8rem;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
      transition: all 0.18s ease;
    }

    .pm-btn-compact-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
    }

    .pm-btn-compact-secondary {
      border: 1px solid var(--pm-border, #cbd5e1);
      background: var(--pm-surface-2, #f8fafc);
      color: var(--pm-text, #334155);
      padding: 0.52rem 0.75rem;
      border-radius: 11px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      transition: all 0.18s ease;
    }

    .pm-btn-compact-secondary:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    /* Loading & Empty States */
    .pm-loading-card,
    .pm-empty-card {
      padding: 3.5rem 1.5rem;
      text-align: center;
      background: var(--pm-surface, #fff);
      border-radius: 18px;
      border: 1px dashed var(--pm-border, #cbd5e1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.65rem;
    }

    .pm-empty-icon { font-size: 2.6rem; }
    .pm-empty-title { font-size: 1.1rem; font-weight: 800; margin: 0; color: var(--pm-text, #0f172a); }
    .pm-empty-desc { font-size: 0.84rem; color: var(--pm-text-muted, #64748b); max-width: 400px; margin: 0; }

    /* Dark Theme Support */
    [data-theme="dark"] .pm-segmented-control {
      background: rgba(15, 23, 42, 0.6);
      border-color: rgba(255, 255, 255, 0.08);
    }

    [data-theme="dark"] .pm-seg-btn { color: #94a3b8; }
    [data-theme="dark"] .pm-seg-btn:hover { color: #fff; }

    [data-theme="dark"] .pm-search-box input {
      background: #1e293b;
      border-color: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    [data-theme="dark"] .pm-compact-card {
      background: linear-gradient(180deg, rgba(30, 41, 59, 0.65) 0%, rgba(15, 23, 42, 0.85) 100%);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-color: rgba(255, 255, 255, 0.08);
    }

    [data-theme="dark"] .pm-compact-title { color: #fff; }

    [data-theme="dark"] .pm-micro-hierarchy {
      background: rgba(15, 23, 42, 0.7);
      border-color: rgba(255, 255, 255, 0.06);
    }

    [data-theme="dark"] .pm-btn-compact-secondary {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.12);
      color: #e2e8f0;
    }

    [data-theme="dark"] .pm-btn-compact-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    [data-theme="dark"] .pm-micro-warning {
      background: rgba(245, 158, 11, 0.08);
      border-color: rgba(245, 158, 11, 0.2);
      color: #fde68a;
    }

    /* ── Mobile Viewport (Ultra-Dense 2-Column / Compact Cards) ── */
    @media (max-width: 768px) {
      .pm-planning-container { padding: 0.6rem; }
      .pm-planning-hero {
        padding: 0.9rem 1rem;
        border-radius: 14px;
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
        margin-bottom: 0.9rem;
      }
      .pm-hero-content { gap: 0.7rem; }
      .pm-hero-icon-wrap { width: 38px; height: 38px; font-size: 1.3rem; border-radius: 10px; }
      .pm-hero-title { font-size: 1.15rem; }
      .pm-hero-subtitle { font-size: 0.76rem; line-height: 1.3; }
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
        margin-bottom: 0.9rem;
      }
      .pm-segmented-control { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); padding: 2px; }
      .pm-seg-btn { justify-content: center; padding: 0.42rem 0.2rem; font-size: 0.72rem; }
      .pm-search-box { width: 100%; }
      .pm-search-box input { padding: 0.45rem 0.8rem 0.45rem 32px; font-size: 16px; }

      /* Cuadrícula móvil de 2 columnas densa para ver múltiples clases en pantalla */
      .pm-compact-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.55rem;
      }
      .pm-compact-card {
        padding: 0.7rem 0.65rem;
        border-radius: 12px;
        gap: 0.5rem;
      }
      .pm-compact-avatar {
        width: 30px;
        height: 30px;
        font-size: 1.15rem;
        border-radius: 8px;
      }
      .pm-compact-title {
        font-size: 0.82rem;
        margin-bottom: 1px;
      }
      .pm-compact-subtitle {
        font-size: 0.68rem;
      }
      .pm-compact-badge {
        font-size: 0.6rem;
        padding: 0.15rem 0.4rem;
      }
      .pm-micro-hierarchy {
        padding: 0.35rem 0.45rem;
        border-radius: 8px;
      }
      .pm-micro-val {
        font-size: 0.85rem;
      }
      .pm-micro-lbl {
        font-size: 0.55rem;
      }
      .pm-micro-arrow {
        font-size: 0.6rem;
      }
      .pm-micro-warning {
        padding: 0.35rem 0.45rem;
        font-size: 0.68rem;
        gap: 4px;
      }
      .pm-compact-actions {
        gap: 0.35rem;
      }
      .pm-btn-compact-primary, .pm-btn-compact-secondary {
        min-height: 36px;
        font-size: 0.74rem;
        padding: 0.35rem 0.4rem;
        border-radius: 8px;
        gap: 3px;
      }
    }

    @media (max-width: 360px) {
      .pm-compact-grid {
        grid-template-columns: 1fr;
      }
    }
  `
  document.head.appendChild(style)
}
