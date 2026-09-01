/**
 * Admin Dashboard Widget: Cumplimiento de Maestros (Canonical Attendance Solvency)
 * Rediseñado con la estructura, metodología y estética unificada de la vista Salones.
 */

import {
  getMaestrosComplianceStatus,
  getSemanaActualSantoDomingo,
} from "../api/adminMaestroApi.js"
import { InfoTooltip, attachInfoTooltipEvents, injectInfoTooltipStyles } from "../../../shared/components/InfoTooltip.js"
import { cargarHistorialInstitucional } from "../../../portal-maestros/services/historialClasesService.js"
import { generateInstitutionalReportHTML } from "../../../portal-maestros/services/reportService.js"
import { openReport } from "../../../portal-maestros/services/reportTemplates.js"
import { AppToast } from "../../../shared/components/AppToast.js"
import { escapeHTML } from "../../../shared/utils/sanitize.js"
import { renderViewInfoButton, attachViewInfoEvents } from "../../../shared/components/ViewInfoModal.js"
import { openNominaConsolidadaModal } from "../components/nominaConsolidadaModal.js"
import "../styles/admin-dashboard.css"

function hoyISO(offsetDias = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDias)
  return d.toISOString().split("T")[0]
}

export class CumplimientoMaestrosWidget {
  constructor(containerId) {
    this.containerId = containerId
    this.container = document.getElementById(containerId)
    this.maestros = []
    this.filteredMaestros = []
    this.currentRango = "semana_actual"
    this.customDates = getSemanaActualSantoDomingo()
    this.currentFilter = {
      estado: null,
      especialidad: "",
      search: "",
      sort: "nombre_asc",
    }
    this.reportePanelOpen = false
    this.filtrosAbiertos = false
    this.generandoReporte = false
    this.reporteRango = {
      desde: hoyISO(-30),
      hasta: hoyISO(0),
    }
  }

  /**
   * Initialize widget: load data and render
   */
  async init() {
    try {
      injectInfoTooltipStyles()
      this.container.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-4 text-center text-muted bg-body">
          <div class="spinner-border text-primary mb-3" role="status"></div>
          <p class="mb-0 fw-medium">Cargando balance canónico de asistencia y cumplimiento docente...</p>
        </div>
      `

      await this.loadData()
      this.render()
      this.attachEventListeners()

      console.log("[CumplimientoMaestrosWidget] Canonical attendance loaded with", this.maestros.length, "maestros")
    } catch (err) {
      console.error("[CumplimientoMaestrosWidget] Init error:", err)
      this.container.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-4 text-center text-danger bg-body">
          <i class="bi bi-exclamation-triangle-fill fs-3 d-block mb-2"></i>
          <div class="fw-semibold">Error cargando datos: ${escapeHTML(err.message)}</div>
        </div>
      `
    }
  }

  /**
   * Resolve active date range
   */
  getRangoFechas() {
    if (this.currentRango === "semana_actual") {
      return getSemanaActualSantoDomingo()
    }

    // Semana anterior (Lunes a Domingo previo)
    if (this.currentRango === "semana_anterior") {
      const sem = getSemanaActualSantoDomingo()
      const lunesSemana = new Date(`${sem.desde}T12:00:00Z`)
      lunesSemana.setUTCDate(lunesSemana.getUTCDate() - 7)
      const domingoSemana = new Date(lunesSemana)
      domingoSemana.setUTCDate(domingoSemana.getUTCDate() + 6)
      return {
        desde: lunesSemana.toISOString().split("T")[0],
        hasta: domingoSemana.toISOString().split("T")[0],
      }
    }
    
    // Rango 14 días (2 semanas)
    if (this.currentRango === "ultimas_2_semanas") {
      const sem = getSemanaActualSantoDomingo()
      const lunesSemana = new Date(`${sem.desde}T12:00:00Z`)
      lunesSemana.setUTCDate(lunesSemana.getUTCDate() - 7)
      return {
        desde: lunesSemana.toISOString().split("T")[0],
        hasta: sem.hasta,
      }
    }

    // 1ra Quincena del mes en curso (1 al 15)
    if (this.currentRango === "quincena_1_actual") {
      const ahora = new Date()
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Santo_Domingo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      const [y, m] = formatter.format(ahora).split("-")
      return { desde: `${y}-${m}-01`, hasta: `${y}-${m}-15` }
    }

    // 2da Quincena del mes en curso (16 a fin de mes)
    if (this.currentRango === "quincena_2_actual") {
      const ahora = new Date()
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Santo_Domingo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      const [y, m] = formatter.format(ahora).split("-")
      const ultimoDiaNum = new Date(Number(y), Number(m), 0).getDate()
      return { desde: `${y}-${m}-16`, hasta: `${y}-${m}-${String(ultimoDiaNum).padStart(2, "0")}` }
    }

    // Mes en curso AST
    if (this.currentRango === "mes_actual") {
      const ahora = new Date()
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Santo_Domingo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      const [y, m] = formatter.format(ahora).split("-")
      const primerDia = `${y}-${m}-01`
      const ultimoDiaNum = new Date(Number(y), Number(m), 0).getDate()
      const ultimoDia = `${y}-${m}-${String(ultimoDiaNum).padStart(2, "0")}`
      return { desde: primerDia, hasta: ultimoDia }
    }

    // Mes anterior AST
    if (this.currentRango === "mes_anterior") {
      const ahora = new Date()
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Santo_Domingo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      const [y, m] = formatter.format(ahora).split("-")
      const prevDate = new Date(Number(y), Number(m) - 2, 1)
      const prevYear = prevDate.getFullYear()
      const prevMonth = String(prevDate.getMonth() + 1).padStart(2, "0")
      const ultimoDiaPrev = new Date(prevYear, Number(prevMonth), 0).getDate()
      return {
        desde: `${prevYear}-${prevMonth}-01`,
        hasta: `${prevYear}-${prevMonth}-${String(ultimoDiaPrev).padStart(2, "0")}`,
      }
    }

    // Rango personalizado explícito
    if (this.currentRango === "personalizado" && this.customDates?.desde && this.customDates?.hasta) {
      return {
        desde: this.customDates.desde,
        hasta: this.customDates.hasta,
      }
    }

    return getSemanaActualSantoDomingo()
  }

  /**
   * Load maestro compliance data from canonical RPC
   */
  async loadData() {
    const rango = this.getRangoFechas()
    this.customDates = rango
    const maestros = await getMaestrosComplianceStatus(rango)

    this.maestros = (maestros || []).map(m => {
      const esSolvente = m.es_solvente
      const pendientes = m.pending_count ?? 0
      const vencidas = m.vencidas_count ?? 0

      let estado = "solvente"
      if (vencidas > 0) {
        estado = "vencida"
      } else if (pendientes > 0) {
        estado = "pendiente"
      }

      return {
        ...m,
        estado,
        esSolvente,
        pendingCount: pendientes,
        vencidasCount: vencidas,
        totalSesiones: m.total_sesiones ?? 0,
        registradas: m.registradas ?? 0,
        statusConfig: this.getStatusConfig(estado),
      }
    })

    this.applyFilter()
  }

  /**
   * Get semantic label and badge classes for status
   */
  getStatusConfig(estado) {
    const configs = {
      solvente: {
        label: "SOLVENTE",
        icon: "bi-check-circle-fill",
        badgeClass: "bg-success-subtle text-success border border-success-subtle",
      },
      pendiente: {
        label: "CON PENDIENTES",
        icon: "bi-clock-fill",
        badgeClass: "bg-warning-subtle text-warning-emphasis border border-warning-subtle",
      },
      vencida: {
        label: "CON VENCIDAS",
        icon: "bi-exclamation-octagon-fill",
        badgeClass: "bg-danger-subtle text-danger border border-danger-subtle",
      },
    }
    return configs[estado] || {
      label: "DESCONOCIDO",
      icon: "bi-question-circle",
      badgeClass: "bg-secondary-subtle text-secondary border border-secondary-subtle",
    }
  }

  /**
   * Filter and sort maestros list
   */
  applyFilter(newFilters = {}) {
    this.currentFilter = { ...this.currentFilter, ...newFilters }
    const { estado, especialidad, search, sort } = this.currentFilter

    let result = [...this.maestros]

    if (estado) {
      result = result.filter(m => m.estado === estado)
    }

    if (especialidad) {
      result = result.filter(m => (m.maestros?.especialidad || "").toLowerCase() === especialidad.toLowerCase())
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(m => {
        const nombre = (m.maestros?.nombre_completo || "").toLowerCase()
        const esp = (m.maestros?.especialidad || "").toLowerCase()
        return nombre.includes(q) || esp.includes(q)
      })
    }

    result.sort((a, b) => {
      const nomA = a.maestros?.nombre_completo || ""
      const nomB = b.maestros?.nombre_completo || ""
      const pctA = a.totalSesiones > 0 ? (a.registradas / a.totalSesiones) : 0
      const pctB = b.totalSesiones > 0 ? (b.registradas / b.totalSesiones) : 0

      if (sort === "nombre_asc") return nomA.localeCompare(nomB)
      if (sort === "nombre_desc") return nomB.localeCompare(nomA)
      if (sort === "cumplimiento_desc") return pctB - pctA
      if (sort === "cumplimiento_asc") return pctA - pctB
      if (sort === "pendientes_desc") return (b.pendingCount || 0) - (a.pendingCount || 0)
      if (sort === "vencidas_desc") return (b.vencidasCount || 0) - (a.vencidasCount || 0)
      return 0
    })

    this.filteredMaestros = result
    this.renderGridOnly()
  }

  /**
   * Main Render Method (Salones Structure)
   */
  render() {
    const totalMaestros = this.maestros.length
    const countSolventes = this.maestros.filter(m => m.estado === "solvente").length
    const countPendientes = this.maestros.filter(m => m.estado === "pendiente").length
    const countVencidas = this.maestros.filter(m => m.estado === "vencida").length
    const totalClasesEnRango = this.maestros.reduce((acc, m) => acc + (m.totalSesiones || 0), 0)
    const semanaActual = getSemanaActualSantoDomingo()

    const especialidades = Array.from(
      new Set(this.maestros.map(m => m.maestros?.especialidad).filter(Boolean))
    ).sort()

    const html = `
      <div class="page-container">
        
        <!-- Header & Toolbar Unificada V2 (Estructura Salones) -->
        <div class="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-body mb-3 border border-body-tertiary">
          
          <!-- Fila 1: Título, Badges Informativos y Botones de Acción -->
          <div class="d-flex flex-wrap justify-content-between align-items-center mb-2.5 pb-2 border-bottom border-body-tertiary" style="gap: 0.85rem;">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <div class="p-2 rounded-3 bg-success-subtle text-success d-flex align-items-center justify-content-center">
                <i class="bi bi-person-check-fill fs-5"></i>
              </div>
              <div>
                <h5 class="fw-bold mb-0 text-body d-flex align-items-center">Balance de Asistencia & Solvencia Docente ${InfoTooltip("cumplimiento_sesiones")}</h5>
                <small class="text-muted d-block" style="font-size:0.75rem;">Fuente canónica de clases programadas vs asistencia registrada en el ciclo lectivo</small>
              </div>
              
              <!-- Badges de Resumen en Tiempo Real -->
              <div class="d-flex align-items-center gap-1.5 ms-md-2 flex-wrap">
                <span class="badge bg-success-subtle text-success border border-success-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Docentes solventes para nómina">
                  <i class="bi bi-check-circle-fill me-1"></i><span>${countSolventes}/${totalMaestros}</span> Solventes
                </span>
                <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Docentes con clases pendientes (≤7 días)">
                  <i class="bi bi-clock-fill me-1"></i><span>${countPendientes}</span> Pendientes
                </span>
                <span class="badge bg-danger-subtle text-danger border border-danger-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Docentes con clases vencidas (>7 días)">
                  <i class="bi bi-exclamation-octagon-fill me-1"></i><span>${countVencidas}</span> Vencidas
                </span>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Rango activo consultado: ${this.customDates.desde} al ${this.customDates.hasta}">
                  <i class="bi bi-calendar3 me-1"></i><span>${totalClasesEnRango}</span> Clases (${this.customDates.desde} a ${this.customDates.hasta})
                </span>
              </div>
            </div>

            <!-- Toolbar de Botones con 0.85rem de separación -->
            <div class="d-flex align-items-center flex-wrap" style="gap: 0.85rem;">
              ${renderViewInfoButton('admin-dashboard')}
              <button class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnNominaConsolidada" title="Planilla Consolidada de Nómina Docente (PDF / Excel)" style="font-size:0.78rem;">
                <i class="bi bi-file-earmark-spreadsheet-fill text-success"></i>
                <span class="d-none d-sm-inline">Nómina Consolidada</span>
              </button>
              <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnReporteInstitucional" title="Reporte Institucional en PDF" style="font-size:0.78rem;">
                <i class="bi bi-file-earmark-pdf-fill text-danger"></i>
                <span class="d-none d-sm-inline">Reporte Institucional</span>
              </button>
              <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnRefresh" title="Actualizar datos" style="font-size:0.78rem;">
                <i class="bi bi-arrow-clockwise"></i>
                <span class="d-none d-sm-inline">Actualizar</span>
              </button>
              <button class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnGotoNotificaciones" style="font-size:0.78rem;">
                <i class="bi bi-bell-fill animate-bell"></i>
                <span>Centro de Actividad</span>
              </button>
            </div>
          </div>

          <!-- Fila 2: Búsqueda, Selector de Rango, Controles Personalizados y Filtros -->
          <div class="d-flex align-items-center justify-content-between flex-wrap pt-1" style="gap: 0.85rem;">
            <div class="flex-grow-1" style="min-width: 220px;">
              <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden">
                <span class="input-group-text bg-body-tertiary border-end-0 py-1.5"><i class="bi bi-search text-muted"></i></span>
                <input type="text" class="form-control border-start-0 py-1.5 fw-medium" id="searchMaestro" placeholder="Buscar maestro por nombre o especialidad..." value="${escapeHTML(this.currentFilter.search || "")}" autocomplete="off" style="font-size:0.8rem;">
              </div>
            </div>

            <!-- Selector de Período / Rango -->
            <div style="min-width: 210px;">
              <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden">
                <span class="input-group-text bg-body-tertiary border-end-0 py-1.5"><i class="bi bi-calendar3 text-primary"></i></span>
                <select id="selectRangoFechas" class="form-select border-start-0 py-1.5 fw-medium" style="font-size:0.8rem;">
                  <option value="semana_actual" ${this.currentRango === "semana_actual" ? "selected" : ""}>Esta Semana (${semanaActual.desde} a ${semanaActual.hasta})</option>
                  <option value="semana_anterior" ${this.currentRango === "semana_anterior" ? "selected" : ""}>Semana Anterior</option>
                  <option value="ultimas_2_semanas" ${this.currentRango === "ultimas_2_semanas" ? "selected" : ""}>Últimas 2 Semanas</option>
                  <option value="quincena_1_actual" ${this.currentRango === "quincena_1_actual" ? "selected" : ""}>1ra Quincena (1-15)</option>
                  <option value="quincena_2_actual" ${this.currentRango === "quincena_2_actual" ? "selected" : ""}>2da Quincena (16-Fin)</option>
                  <option value="mes_actual" ${this.currentRango === "mes_actual" ? "selected" : ""}>Mes en Curso</option>
                  <option value="mes_anterior" ${this.currentRango === "mes_anterior" ? "selected" : ""}>Mes Anterior</option>
                  <option value="personalizado" ${this.currentRango === "personalizado" ? "selected" : ""}>📅 Rango Personalizado...</option>
                </select>
              </div>
            </div>

            <!-- Controles de Rango Personalizado (Desde / Hasta / Aplicar) -->
            <div id="containerRangoPersonalizado" class="${this.currentRango === "personalizado" ? "d-flex" : "d-none"} align-items-center gap-1.5 flex-wrap">
              <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden" style="max-width: 145px;">
                <span class="input-group-text bg-body-tertiary border-end-0 py-1 px-2 text-muted fw-semibold" style="font-size:0.72rem;">Desde</span>
                <input type="date" id="inputCustomDesde" class="form-control border-start-0 py-1 px-2 fw-medium" value="${this.customDates.desde}" style="font-size:0.78rem;">
              </div>
              <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden" style="max-width: 145px;">
                <span class="input-group-text bg-body-tertiary border-end-0 py-1 px-2 text-muted fw-semibold" style="font-size:0.72rem;">Hasta</span>
                <input type="date" id="inputCustomHasta" class="form-control border-start-0 py-1 px-2 fw-medium" value="${this.customDates.hasta}" style="font-size:0.78rem;">
              </div>
              <button id="btnAplicarRangoPersonalizado" class="btn btn-sm btn-primary rounded-3 shadow-xs px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1" style="font-size:0.78rem;" title="Aplicar rango personalizado de fechas">
                <i class="bi bi-calendar-check-fill"></i>
                <span>Filtrar</span>
              </button>
            </div>

            <div class="d-flex align-items-center" style="gap: 0.85rem;">
              <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnToggleFiltrosMaestros" type="button" aria-expanded="${this.filtrosAbiertos}" style="font-size:0.78rem;">
                <i class="bi bi-funnel"></i>
                <span>Filtros & Orden</span>
                <span class="badge bg-primary text-white rounded-pill px-1.5 ms-1 ${this.getActiveFiltersCount() === 0 ? "d-none" : ""}" id="filtrosBadgeCountMaestros" style="font-size:0.68rem;">${this.getActiveFiltersCount()}</span>
              </button>

              <button class="btn btn-sm btn-outline-secondary rounded-3 shadow-xs px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1" id="btnLimpiarFiltrosMaestros" title="Restablecer filtros y búsqueda" style="font-size:0.78rem;">
                <i class="bi bi-arrow-counterclockwise"></i>
                <span>Limpiar</span>
              </button>
            </div>
          </div>

          <!-- Fila 3: Panel Desplegable de Filtros y Ordenamiento -->
          <div class="collapse pt-2.5 ${this.filtrosAbiertos ? "show" : ""}" id="panelFiltrosMaestros">
            <div class="p-3 rounded-4 bg-body-tertiary border border-body-tertiary shadow-xs">
              <div class="row g-2 align-items-center">
                
                <div class="col-12 col-sm-6 col-lg-4">
                  <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Estado de Solvencia</label>
                  <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filterEstado" style="font-size:0.8rem;">
                    <option value="">Todos los Estados (${this.maestros.length})</option>
                    <option value="solvente" ${this.currentFilter.estado === "solvente" ? "selected" : ""}>Solventes (${countSolventes})</option>
                    <option value="pendiente" ${this.currentFilter.estado === "pendiente" ? "selected" : ""}>Con Pendientes (${countPendientes})</option>
                    <option value="vencida" ${this.currentFilter.estado === "vencida" ? "selected" : ""}>Con Vencidas (${countVencidas})</option>
                  </select>
                </div>

                <div class="col-12 col-sm-6 col-lg-4">
                  <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Especialidad / Cátedra</label>
                  <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filterEspecialidad" style="font-size:0.8rem;">
                    <option value="">Todas las cátedras</option>
                    ${especialidades.map(esp => `<option value="${escapeHTML(esp)}" ${this.currentFilter.especialidad === esp ? "selected" : ""}>${escapeHTML(esp)}</option>`).join("")}
                  </select>
                </div>

                <div class="col-12 col-sm-6 col-lg-4">
                  <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Criterio de Orden</label>
                  <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden">
                    <span class="input-group-text bg-body border-end-0 py-1.5 text-muted" style="font-size:0.75rem;"><i class="bi bi-sort-down"></i></span>
                    <select class="form-select form-select-sm border-start-0 py-1.5 fw-semibold text-primary" id="selectOrdenarMaestros" style="font-size:0.8rem;">
                      <option value="nombre_asc" ${this.currentFilter.sort === "nombre_asc" ? "selected" : ""}>Nombre (A-Z)</option>
                      <option value="nombre_desc" ${this.currentFilter.sort === "nombre_desc" ? "selected" : ""}>Nombre (Z-A)</option>
                      <option value="cumplimiento_desc" ${this.currentFilter.sort === "cumplimiento_desc" ? "selected" : ""}>Mayor % Cumplimiento</option>
                      <option value="cumplimiento_asc" ${this.currentFilter.sort === "cumplimiento_asc" ? "selected" : ""}>Menor % Cumplimiento</option>
                      <option value="vencidas_desc" ${this.currentFilter.sort === "vencidas_desc" ? "selected" : ""}>Más Vencidas</option>
                      <option value="pendientes_desc" ${this.currentFilter.sort === "pendientes_desc" ? "selected" : ""}>Más Pendientes</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        ${this.reportePanelOpen ? this.renderReportePanel() : ""}

        <!-- Contenedor de Cuadrícula de Cumplimiento (Estructura Salones responsive - 4 columnas en desktop) -->
        <div class="w-100">
          <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-2.5 w-100 m-0" id="maestrosGridBody">
            ${this.renderGridItemsHTML()}
          </div>
        </div>

      </div>
    `

    this.container.innerHTML = html
  }

  getActiveFiltersCount() {
    let count = 0
    if (this.currentFilter.estado) count++
    if (this.currentFilter.especialidad) count++
    return count
  }

  /**
   * Render inline panel to pick a custom date range and trigger the
   * institutional report.
   */
  renderReportePanel() {
    const { desde, hasta } = this.reporteRango
    return `
      <div id="reportePanel" class="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-body-tertiary border border-primary-subtle">
        <div class="d-flex flex-wrap align-items-end justify-content-between gap-3">
          <div style="flex: 1 1 260px; min-width: 220px;">
            <h6 class="fw-bold mb-1 text-body d-flex align-items-center gap-1.5">
              <i class="bi bi-file-earmark-pdf-fill text-danger fs-5"></i> Reporte Institucional de Clases Dadas
            </h6>
            <small class="text-muted d-block" style="font-size:0.75rem;">Genera un informe PDF consolidado con todas las clases, asistencia y contenido registrado de los maestros en el rango seleccionado.</small>
          </div>

          <div class="d-flex align-items-center gap-2 flex-wrap">
            <div>
              <label for="reporteDesde" class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Desde</label>
              <input type="date" id="reporteDesde" class="form-control form-control-sm rounded-3 shadow-xs" value="${desde}" max="${hasta}" style="font-size:0.8rem;">
            </div>
            <div>
              <label for="reporteHasta" class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Hasta</label>
              <input type="date" id="reporteHasta" class="form-control form-control-sm rounded-3 shadow-xs" value="${hasta}" min="${desde}" style="font-size:0.8rem;">
            </div>
            <div class="pt-3">
              <button id="btnGenerarReporteInstitucional" class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" style="font-size:0.78rem;">
                <i class="bi bi-download"></i> Generar PDF
              </button>
            </div>
            <div class="pt-3">
              <button id="btnCerrarReportePanel" class="btn btn-sm btn-outline-secondary rounded-3 shadow-xs px-2 py-1.5" title="Cerrar panel">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Render cards grid items HTML
   */
  renderGridItemsHTML() {
    if (this.filteredMaestros.length === 0) {
      return `
        <div class="col-12 text-center py-5 w-100 text-muted">
          <i class="bi bi-inbox fs-1 d-block mb-3 text-secondary"></i>
          No hay maestros que coincidan con los criterios de búsqueda o filtros.
        </div>
      `
    }

    return this.filteredMaestros.map(m => this.renderMaestroCard(m)).join("")
  }

  /**
   * Render single maestro card matching Salones card anatomy
   */
  renderMaestroCard(maestro) {
    const config = maestro.statusConfig || this.getStatusConfig(maestro.estado)
    const especialidad = maestro.maestros?.especialidad || "Cátedra Instrumental"
    const nombre = maestro.maestros?.nombre_completo || "Maestro"
    const totalClases = maestro.totalSesiones || 0
    const registradas = maestro.registradas || 0
    const pendientes = maestro.pendingCount || 0
    const vencidas = maestro.vencidasCount || 0
    const pct = totalClases > 0 ? Math.round((registradas / totalClases) * 100) : 100

    let progressColor = "bg-success"
    if (vencidas > 0) progressColor = "bg-danger"
    else if (pendientes > 0) progressColor = "bg-warning"

    return `
      <div class="col p-1">
        <div class="list-group-item card h-100 rounded-4 border bg-body shadow-xs hover-shadow transition-all d-flex flex-column justify-content-between position-relative overflow-hidden" style="padding: 0.85rem 0.85rem 1.05rem 0.85rem !important;">
          
          <!-- Parte Superior: Nombre, Especialidad, Solvencia y Métricas -->
          <div class="mb-2">
            
            <!-- Nombre del Maestro -->
            <strong class="text-body text-truncate d-block mb-1" style="font-size: 0.92rem;" title="${escapeHTML(nombre)}">
              ${escapeHTML(nombre)}
            </strong>

            <!-- Cátedra / Especialidad -->
            <div class="mb-2">
              <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle py-1 px-2 text-truncate w-100 text-start d-block rounded-3" style="font-size: 0.72rem;" title="${escapeHTML(especialidad)}">
                <i class="bi bi-music-note-beamed me-1 text-primary"></i>${escapeHTML(especialidad)}
              </span>
            </div>

            <!-- Solvencia Badge -->
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted small" style="font-size:0.75rem;"><i class="bi bi-shield-check me-1 text-secondary"></i>Solvencia:</span>
              <span class="badge ${config.badgeClass} py-0.5 px-2 rounded-2" style="font-size: 0.7rem;">
                <i class="bi ${config.icon} me-1"></i>${config.label}
              </span>
            </div>

            <!-- Barra de Progreso de Asistencia -->
            <div class="mb-2">
              <div class="d-flex justify-content-between text-muted small mb-1" style="font-size: 0.72rem;">
                <span>Cumplimiento:</span>
                <span class="fw-semibold text-body">${pct}% (${registradas}/${totalClases})</span>
              </div>
              <div class="progress" style="height: 6px; border-radius: 4px; background-color: var(--bs-tertiary-bg);">
                <div class="progress-bar ${progressColor}" role="progressbar" style="width: ${pct}%;" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div>

            <!-- Métricas Clave -->
            <div class="d-flex flex-column gap-1 text-muted small" style="font-size: 0.76rem;">
              <div class="d-flex align-items-center justify-content-between">
                <span><i class="bi bi-clock me-1 text-warning"></i>Pendientes (&le;7d):</span>
                <span class="fw-semibold ${pendientes > 0 ? "text-warning-emphasis" : "text-body"}">${pendientes}</span>
              </div>

              <div class="d-flex align-items-center justify-content-between">
                <span><i class="bi bi-exclamation-circle me-1 text-danger"></i>Vencidas (&gt;7d):</span>
                <span class="fw-bold ${vencidas > 0 ? "text-danger" : "text-body"}">${vencidas}</span>
              </div>
            </div>

          </div>

          <!-- Footer con Acciones (WhatsApp y Ver Detalle) -->
          <div class="pt-2 border-top border-body-tertiary d-flex align-items-center justify-content-between mt-auto" style="gap: 0.4rem;">
            <button class="btn btn-sm btn-outline-success rounded-3 shadow-xs d-inline-flex align-items-center gap-1 py-1 px-2 btn-contactar" data-maestro-id="${maestro.maestro_id}" title="Enviar recordatorio por WhatsApp" style="font-size:0.75rem;">
              <i class="bi bi-whatsapp"></i>
              <span class="d-none d-sm-inline">Recordar</span>
            </button>
            <button class="btn btn-sm btn-outline-primary rounded-3 shadow-xs d-inline-flex align-items-center gap-1 py-1 px-2.5 btn-detalle" data-maestro-id="${maestro.maestro_id}" title="Ver detalle por clase" style="font-size:0.75rem;">
              <i class="bi bi-eye-fill"></i>
              <span>Ver Detalle</span>
            </button>
          </div>

        </div>
      </div>
    `
  }

  /**
   * Updates only the grid DOM without rebuilding entire header
   */
  renderGridOnly() {
    const gridBody = this.container?.querySelector("#maestrosGridBody")
    if (gridBody) {
      gridBody.innerHTML = this.renderGridItemsHTML()
      this.attachCardListeners()
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    attachInfoTooltipEvents(this.container)
    attachViewInfoEvents(this.container)

    const searchInput = this.container.querySelector("#searchMaestro")
    const selectRangoFechas = this.container.querySelector("#selectRangoFechas")
    const filterEstado = this.container.querySelector("#filterEstado")
    const filterEspecialidad = this.container.querySelector("#filterEspecialidad")
    const selectOrdenarMaestros = this.container.querySelector("#selectOrdenarMaestros")
    const btnToggleFiltros = this.container.querySelector("#btnToggleFiltrosMaestros")
    const btnLimpiar = this.container.querySelector("#btnLimpiarFiltrosMaestros")
    const btnRefresh = this.container.querySelector("#btnRefresh")
    const btnGotoNotificaciones = this.container.querySelector("#btnGotoNotificaciones")
    const btnReporteInstitucional = this.container.querySelector("#btnReporteInstitucional")

    // Búsqueda en tiempo real
    searchInput?.addEventListener("input", (e) => {
      this.applyFilter({ search: e.target.value.trim() })
    })

    // Selector de rango de fechas
    selectRangoFechas?.addEventListener("change", async (e) => {
      const val = e.target.value
      this.currentRango = val
      if (val === "personalizado") {
        const containerCustom = this.container.querySelector("#containerRangoPersonalizado")
        if (containerCustom) {
          containerCustom.classList.remove("d-none")
          containerCustom.classList.add("d-flex")
        }
      } else {
        await this.loadData()
        this.render()
        this.attachEventListeners()
      }
    })

    // Botón para aplicar rango personalizado
    const btnAplicarCustom = this.container.querySelector("#btnAplicarRangoPersonalizado")
    const inputCustomDesde = this.container.querySelector("#inputCustomDesde")
    const inputCustomHasta = this.container.querySelector("#inputCustomHasta")

    btnAplicarCustom?.addEventListener("click", async () => {
      const desdeVal = inputCustomDesde?.value
      const hastaVal = inputCustomHasta?.value

      if (!desdeVal || !hastaVal) {
        AppToast.error("Debe especificar ambas fechas")
        return
      }
      if (desdeVal > hastaVal) {
        AppToast.error("La fecha 'Desde' no puede ser posterior a 'Hasta'")
        return
      }

      this.currentRango = "personalizado"
      this.customDates = { desde: desdeVal, hasta: hastaVal }
      await this.loadData()
      this.render()
      this.attachEventListeners()
      AppToast.show(`Filtro aplicado: ${desdeVal} al ${hastaVal}`)
    })

    // Toggle Filtros
    btnToggleFiltros?.addEventListener("click", () => {
      this.filtrosAbiertos = !this.filtrosAbiertos
      const panel = this.container.querySelector("#panelFiltrosMaestros")
      if (panel) {
        panel.classList.toggle("show", this.filtrosAbiertos)
        btnToggleFiltros.setAttribute("aria-expanded", String(this.filtrosAbiertos))
      }
    })

    // Limpiar filtros y restablecer período
    btnLimpiar?.addEventListener("click", async () => {
      if (searchInput) searchInput.value = ""
      if (filterEstado) filterEstado.value = ""
      if (filterEspecialidad) filterEspecialidad.value = ""
      if (selectOrdenarMaestros) selectOrdenarMaestros.value = "nombre_asc"

      const badgeCount = this.container.querySelector("#filtrosBadgeCountMaestros")
      if (badgeCount) badgeCount.classList.add("d-none")

      this.currentRango = "semana_actual"
      this.customDates = getSemanaActualSantoDomingo()
      await this.loadData()
      this.render()
      this.attachEventListeners()
    })

    // Filtros internos
    filterEstado?.addEventListener("change", (e) => {
      this.applyFilter({ estado: e.target.value || null })
      this.updateFiltrosBadge()
    })

    filterEspecialidad?.addEventListener("change", (e) => {
      this.applyFilter({ especialidad: e.target.value || "" })
      this.updateFiltrosBadge()
    })

    selectOrdenarMaestros?.addEventListener("change", (e) => {
      this.applyFilter({ sort: e.target.value || "nombre_asc" })
    })

    btnRefresh?.addEventListener("click", () => {
      this.init()
    })

    this.container.querySelector("#btnNominaConsolidada")?.addEventListener("click", () => {
      openNominaConsolidadaModal(this.maestros, this.customDates)
    })

    btnGotoNotificaciones?.addEventListener("click", () => {
      import("../../../core/router/router.js").then(({ router }) => {
        router.navigate("admin-notificaciones")
      })
    })

    btnReporteInstitucional?.addEventListener("click", () => {
      this.reportePanelOpen = !this.reportePanelOpen
      this.render()
      this.attachEventListeners()
    })

    if (this.reportePanelOpen) {
      const reporteDesde = this.container.querySelector("#reporteDesde")
      const reporteHasta = this.container.querySelector("#reporteHasta")
      const btnGenerarReporteInstitucional = this.container.querySelector("#btnGenerarReporteInstitucional")
      const btnCerrarReportePanel = this.container.querySelector("#btnCerrarReportePanel")

      reporteDesde?.addEventListener("change", (e) => {
        this.reporteRango.desde = e.target.value
      })
      reporteHasta?.addEventListener("change", (e) => {
        this.reporteRango.hasta = e.target.value
      })
      btnCerrarReportePanel?.addEventListener("click", () => {
        this.reportePanelOpen = false
        this.render()
        this.attachEventListeners()
      })
      btnGenerarReporteInstitucional?.addEventListener("click", () => {
        this.onGenerarReporteInstitucional(btnGenerarReporteInstitucional)
      })
    }

    this.attachCardListeners()
  }

  updateFiltrosBadge() {
    const badge = this.container.querySelector("#filtrosBadgeCountMaestros")
    const count = this.getActiveFiltersCount()
    if (badge) {
      badge.textContent = count
      badge.classList.toggle("d-none", count === 0)
    }
  }

  /**
   * Card Action Listeners (WhatsApp and Detalle)
   */
  attachCardListeners() {
    this.container.querySelectorAll('.btn-contactar').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const maestroId = btn.dataset.maestroId
        import('../../../core/router/router.js').then(({ router }) => {
          router.navigate('admin-maestro-detalle', {
            id: maestroId,
            autoOpenWhatsApp: true,
            desde: this.customDates.desde,
            hasta: this.customDates.hasta,
          })
        })
      })
    })

    this.container.querySelectorAll('.btn-detalle').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const maestroId = btn.dataset.maestroId
        import('../../../core/router/router.js').then(({ router }) => {
          router.navigate('admin-maestro-detalle', {
            id: maestroId,
            desde: this.customDates.desde,
            hasta: this.customDates.hasta,
          })
        })
      })
    })
  }

  /**
   * Institutional Report Generator
   */
  async onGenerarReporteInstitucional(btnEl) {
    if (this.generandoReporte) return
    const { desde, hasta } = this.reporteRango

    if (!desde || !hasta) {
      AppToast.error("Debe seleccionar ambas fechas")
      return
    }
    if (desde > hasta) {
      AppToast.error("La fecha inicial no puede ser posterior a la fecha final")
      return
    }

    try {
      this.generandoReporte = true
      if (btnEl) {
        btnEl.disabled = true
        btnEl.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status"></span> Generando...`
      }

      const { sesiones } = await cargarHistorialInstitucional({ desde, hasta })
      if (!sesiones || sesiones.length === 0) {
        AppToast.info("No se encontraron clases dadas en el rango seleccionado")
        return
      }

      const html = generateInstitutionalReportHTML(sesiones, { desde, hasta })
      openReport(html)
      AppToast.show("Reporte institucional generado exitosamente")
    } catch (err) {
      console.error("[CumplimientoMaestrosWidget] Error generando reporte:", err)
      AppToast.error(`Error al generar reporte: ${err.message}`)
    } finally {
      this.generandoReporte = false
      if (btnEl) {
        btnEl.disabled = false
        btnEl.innerHTML = `<i class="bi bi-download"></i> Generar PDF`
      }
    }
  }
}

export default CumplimientoMaestrosWidget
