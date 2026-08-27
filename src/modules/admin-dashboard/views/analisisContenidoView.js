/**
 * analisisContenidoView.js — Visor Ejecutivo de Análisis Pedagógico y Contenido Curricular (Portal ADM).
 * Rediseño Bento Grid Compacto de Alta Densidad con Síntesis Curricular IA,
 * Maduración de Repertorio Suzuki/Orquestal y Exportación a PDF Oficial.
 */

import { getAnalisisContenidoPedagogico } from '../api/contenidoAnalyticsApi.js'
import { descargarPdfAnalisisContenido } from '../services/academicReportsPdfService.js'
import { generarSintesisPedagogicaIA } from '../services/analisisPedagogicoAiService.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import '../styles/admin-dashboard.css'

export class AnalisisContenidoView {
  constructor(containerId) {
    this.containerId = containerId
    this.container = document.getElementById(containerId)
    this.data = null
    this.tipo = 'mes' // 'semana' | 'mes' | 'semestre'
    this.catedra = 'Todas'
    this.isExporting = false
    this.iaData = null
  }

  async init() {
    if (!this.container) return
    await this.cargarDatos()
  }

  async cargarDatos() {
    this.container.innerHTML = `
      <div class="premium-loading text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <div class="text-body-secondary fw-semibold small font-monospace">Analizando bitácoras docentes y avance curricular (${this.tipo.toUpperCase()})...</div>
      </div>
    `
    try {
      this.data = await getAnalisisContenidoPedagogico({
        tipo: this.tipo,
        catedra: this.catedra,
      })
      this.render()
    } catch (err) {
      console.error('[AnalisisContenidoView] Error:', err)
      this.container.innerHTML = `
        <div class="admin-dashboard-container p-3 p-md-4">
          ${this.renderHeader()}
          <div class="alert alert-danger d-flex align-items-center gap-3 mt-3 rounded-3 shadow-xs">
            <i class="bi bi-exclamation-triangle-fill fs-4 text-danger"></i>
            <div>
              <div class="fw-bold">No se pudo generar el análisis pedagógico</div>
              <div class="small text-body-secondary">${escapeHTML(err.message || String(err))}</div>
            </div>
          </div>
        </div>
      `
      this.attachEventListeners()
    }
  }

  render() {
    const d = this.data || {}
    const resumen = d.resumen || {}
    const niveles = d.nivelesLogro || {}
    const foco = Array.isArray(d.focoTecnico) ? d.focoTecnico : []
    const catedras = Array.isArray(d.catedrasResumen) ? d.catedrasResumen : []
    const concierto = Array.isArray(d.repertorioConcierto) ? d.repertorioConcierto : []
    const retos = Array.isArray(d.retosPedagogicos) ? d.retosPedagogicos : []
    const recientes = Array.isArray(d.temasRecientes) ? d.temasRecientes : []

    this.container.innerHTML = `
      <div class="admin-dashboard-container p-3 p-md-4">
        ${this.renderHeader()}

        <!-- Panel de Síntesis Ejecutiva con IA (Desplegable / Conmutable) -->
        <div id="panel-resena-pedagogica-ia" class="p-3 mb-3 rounded-3 border d-none animate-in fade-in" style="background: var(--soi-bg-subtle, var(--bs-tertiary-bg, #f8fafc)); border-color: rgba(99, 102, 241, 0.3) !important;">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="d-flex align-items-center gap-1.5">
              <i class="bi bi-stars text-primary fs-5"></i>
              <strong class="text-uppercase font-monospace text-primary" style="font-size:0.78rem;">Auditoría Curricular Ejecutiva con IA</strong>
            </div>
            <span class="badge" id="badge-salud-curricular" style="font-size:0.72rem;"></span>
          </div>
          
          <div class="row g-2 mb-2">
            <div class="col-md-7">
              <div class="p-2.5 rounded-2 bg-body border border-secondary-subtle h-100">
                <div class="fw-semibold text-body mb-1" style="font-size:0.75rem;"><i class="bi bi-search me-1 text-primary"></i>Diagnóstico del Ciclo:</div>
                <p class="small text-body-secondary mb-0" id="texto-diagnostico-pedagogico" style="font-size:0.8rem; line-height:1.45;"></p>
              </div>
            </div>
            <div class="col-md-5">
              <div class="p-2.5 rounded-2 bg-body border border-secondary-subtle h-100">
                <div class="fw-semibold text-warning mb-1" style="font-size:0.75rem;"><i class="bi bi-exclamation-octagon me-1"></i>Cuellos de Botella Detectados:</div>
                <p class="small text-body-secondary mb-0" id="texto-cuello-botella" style="font-size:0.78rem; line-height:1.4;"></p>
              </div>
            </div>
          </div>

          <div class="p-2.5 rounded-2 bg-body border border-secondary-subtle">
            <div class="fw-semibold text-body mb-1" style="font-size:0.75rem;"><i class="bi bi-lightbulb me-1 text-warning"></i>Plan de Acción Pedagógico Recomendado:</div>
            <div class="text-body-secondary font-monospace" id="texto-recomendacion-pedagogica" style="font-size:0.76rem; white-space: pre-line;"></div>
          </div>
        </div>

        <!-- 1. 4 Micro-KPIs Pedagógicos de Alta Densidad -->
        <section class="metrics-section mb-3">
          <div class="row g-2">
            
            <div class="col-6 col-xl-3">
              <div class="card border rounded-3 bg-body border-secondary-subtle shadow-2xs h-100" style="padding: 0.80rem;">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="text-uppercase font-monospace text-body-secondary fw-bold" style="font-size:0.68rem;">1. Sesiones Auditadas</span>
                  <span class="badge bg-primary-subtle text-primary font-monospace px-1.5 py-0.5" style="font-size:0.65rem;">Aula PWA</span>
                </div>
                <div class="fs-4 fw-bold font-monospace text-primary mb-0.5">
                  ${resumen.totalSesionesAnalizadas || 0}
                </div>
                <div class="text-body-secondary font-monospace text-truncate" style="font-size:0.7rem;">
                  ${resumen.totalContenidosRegistrados || 0} entradas de bitácora
                </div>
              </div>
            </div>

            <div class="col-6 col-xl-3">
              <div class="card border rounded-3 bg-body border-secondary-subtle shadow-2xs h-100" style="padding: 0.80rem;">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="text-uppercase font-monospace text-body-secondary fw-bold" style="font-size:0.68rem;">2. Obras en Ensayo</span>
                  <span class="badge bg-info-subtle text-info-emphasis font-monospace px-1.5 py-0.5" style="font-size:0.65rem;">Repertorio</span>
                </div>
                <div class="fs-4 fw-bold font-monospace text-info-emphasis mb-0.5">
                  ${resumen.obrasEnProgreso || 0}
                </div>
                <div class="text-body-secondary font-monospace text-truncate" style="font-size:0.7rem;">
                  Suzuki & Piezas de Cámara
                </div>
              </div>
            </div>

            <div class="col-6 col-xl-3">
              <div class="card border rounded-3 bg-body border-secondary-subtle shadow-2xs h-100" style="padding: 0.80rem;">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="text-uppercase font-monospace text-body-secondary fw-bold" style="font-size:0.68rem;">3. Listas p/ Concierto</span>
                  <span class="badge bg-success-subtle text-success font-monospace px-1.5 py-0.5" style="font-size:0.65rem;">Gala / Audición</span>
                </div>
                <div class="fs-4 fw-bold font-monospace text-success mb-0.5">
                  ${resumen.obrasDominadasConcierto || 0}
                </div>
                <div class="text-body-secondary font-monospace text-truncate" style="font-size:0.7rem;">
                  Nivel Dominado / Evaluado
                </div>
              </div>
            </div>

            <div class="col-6 col-xl-3">
              <div class="card border rounded-3 bg-body border-secondary-subtle shadow-2xs h-100" style="padding: 0.80rem;">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="text-uppercase font-monospace text-body-secondary fw-bold" style="font-size:0.68rem;">4. Puntos de Refuerzo</span>
                  <span class="badge bg-warning-subtle text-warning-emphasis font-monospace px-1.5 py-0.5" style="font-size:0.65rem;">Atención</span>
                </div>
                <div class="fs-4 fw-bold font-monospace text-warning-emphasis mb-0.5">
                  ${resumen.puntosRefuerzoPendientes || 0}
                </div>
                <div class="text-body-secondary font-monospace text-truncate" style="font-size:0.7rem;">
                  Dificultades técnicas en aula
                </div>
              </div>
            </div>

          </div>
        </section>

        <!-- 2. Maduración Curricular & Distribución de Foco Técnico -->
        <div class="row g-2 mb-3">
          
          <!-- Maduración de Contenidos -->
          <div class="col-12 col-lg-6">
            <div class="card border rounded-3 bg-body border-secondary-subtle shadow-2xs h-100" style="padding: 0.80rem;">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="fw-bold mb-0 text-body small d-flex align-items-center gap-1.5">
                  <i class="bi bi-bar-chart-steps text-primary"></i>
                  <span>Escala de Maduración Curricular</span>
                </h6>
                <span class="text-body-secondary font-monospace" style="font-size:0.7rem;">Fases Suzuki / ACM</span>
              </div>
              ${this.renderNivelesLogro(niveles)}
            </div>
          </div>

          <!-- Foco Técnico y Metodológico -->
          <div class="col-12 col-lg-6">
            <div class="card border rounded-3 bg-body border-secondary-subtle shadow-2xs h-100" style="padding: 0.80rem;">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="fw-bold mb-0 text-body small d-flex align-items-center gap-1.5">
                  <i class="bi bi-compass-fill text-info"></i>
                  <span>Distribución del Foco Pedagógico</span>
                </h6>
                <span class="text-body-secondary font-monospace" style="font-size:0.7rem;">Dimensiones de Aula</span>
              </div>
              ${this.renderFocoTecnico(foco)}
            </div>
          </div>
        </div>

        <!-- 3. Síntesis de Repertorio por Cátedra & Obras Listas -->
        <div class="row g-2 mb-3">
          
          <!-- Cátedras -->
          <div class="col-12 col-xl-7">
            <div class="card border rounded-3 bg-body border-secondary-subtle shadow-2xs h-100" style="padding: 0.80rem;">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <h6 class="fw-bold mb-0 text-body small d-flex align-items-center gap-1.5">
                  <i class="bi bi-music-note-list text-primary"></i>
                  <span>Avance de Contenidos por Cátedra</span>
                </h6>
                <span class="text-body-secondary font-monospace" style="font-size:0.7rem;">${catedras.length} cátedras</span>
              </div>
              ${this.renderCatedrasTable(catedras)}
            </div>
          </div>

          <!-- Obras Listas & Puntos Críticos -->
          <div class="col-12 col-xl-5">
            <div class="card border rounded-3 bg-body border-secondary-subtle shadow-2xs h-100" style="padding: 0.80rem;">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <h6 class="fw-bold mb-0 text-success small d-flex align-items-center gap-1.5">
                  <i class="bi bi-award-fill"></i>
                  <span>Obras Listas p/ Concierto</span>
                </h6>
                <span class="badge bg-success-subtle text-success font-monospace" style="font-size:0.68rem;">${concierto.length} dominadas</span>
              </div>
              ${this.renderConciertoTable(concierto)}

              <div class="border-top border-secondary-subtle pt-2.5 mt-2.5">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <h6 class="fw-bold mb-0 text-warning small d-flex align-items-center gap-1.5">
                    <i class="bi bi-tools"></i>
                    <span>Puntos Críticos Señalados</span>
                  </h6>
                  <span class="badge bg-warning-subtle text-warning-emphasis font-monospace" style="font-size:0.68rem;">${retos.length} alertas</span>
                </div>
                ${this.renderRetosTable(retos)}
              </div>
            </div>
          </div>

        </div>

        <!-- 4. Registro Cronológico Reciente -->
        <section>
          <div class="card border rounded-3 bg-body border-secondary-subtle shadow-2xs" style="padding: 0.80rem;">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h6 class="fw-bold mb-0 text-body small d-flex align-items-center gap-1.5">
                <i class="bi bi-clock-history text-secondary"></i>
                <span>Bitácora Cronológica de Obras y Clases Impartidas</span>
              </h6>
              <span class="text-body-secondary font-monospace" style="font-size:0.7rem;">Últimas ${recientes.length} entradas</span>
            </div>
            ${this.renderRecientesTable(recientes)}
          </div>
        </section>
      </div>
    `

    this.attachEventListeners()
  }

  renderHeader() {
    const labelTipo = this.tipo === 'semana' ? 'Semana Actual' : this.tipo === 'semestre' ? 'Semestre Completo' : 'Mes Actual'

    return `
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 pb-2.5 mb-3 border-bottom border-secondary-subtle">
        <div class="d-flex align-items-center gap-2.5">
          <div class="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center shadow-xs" style="width: 42px; height: 42px;">
            <i class="bi bi-journal-text fs-5"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <h5 class="fw-bold mb-0 text-body">Análisis Pedagógico y Curricular</h5>
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace" style="font-size:0.7rem;">${escapeHTML(labelTipo)}</span>
            </div>
            <p class="text-body-secondary small mb-0" style="font-size:0.76rem;">Monitoreo de bitácoras docentes, maduración de repertorio Suzuki y salud curricular.</p>
          </div>
        </div>

        <div class="d-flex flex-wrap align-items-center gap-2">
          <!-- Botón de Análisis IA -->
          <button id="btn-analisis-ia-pedagogico" class="btn btn-sm btn-light text-primary fw-bold shadow-xs d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill" style="font-size:0.78rem;">
            <i class="bi bi-robot text-primary"></i>
            <span id="btn-ia-pedagogico-text">Auditar con IA</span>
          </button>

          <!-- Selector de Horizonte Temporal -->
          <div class="btn-group btn-group-sm" role="group">
            <button type="button" class="btn btn-outline-secondary btn-tipo ${this.tipo === 'semana' ? 'active btn-primary text-white' : ''}" data-tipo="semana" style="font-size:0.75rem;">Semana</button>
            <button type="button" class="btn btn-outline-secondary btn-tipo ${this.tipo === 'mes' ? 'active btn-primary text-white' : ''}" data-tipo="mes" style="font-size:0.75rem;">Mes</button>
            <button type="button" class="btn btn-outline-secondary btn-tipo ${this.tipo === 'semestre' ? 'active btn-primary text-white' : ''}" data-tipo="semestre" style="font-size:0.75rem;">Semestre</button>
          </div>

          <!-- Selector de Cátedra -->
          <select id="selCatedra" class="form-select form-select-sm" style="width: auto; font-size:0.75rem;">
            <option value="Todas" ${this.catedra === 'Todas' ? 'selected' : ''}>Todas las Cátedras</option>
            <option value="Violín" ${this.catedra === 'Violín' ? 'selected' : ''}>Violín</option>
            <option value="Viola" ${this.catedra === 'Viola' ? 'selected' : ''}>Viola</option>
            <option value="Violonchelo" ${this.catedra === 'Violonchelo' ? 'selected' : ''}>Violonchelo</option>
            <option value="Contrabajo" ${this.catedra === 'Contrabajo' ? 'selected' : ''}>Contrabajo</option>
            <option value="Flauta" ${this.catedra === 'Flauta' ? 'selected' : ''}>Flauta</option>
            <option value="Clarinete" ${this.catedra === 'Clarinete' ? 'selected' : ''}>Clarinete</option>
            <option value="Piano" ${this.catedra === 'Piano' ? 'selected' : ''}>Piano</option>
            <option value="Guitarra" ${this.catedra === 'Guitarra' ? 'selected' : ''}>Guitarra</option>
            <option value="Canto" ${this.catedra === 'Canto' ? 'selected' : ''}>Canto / Coro</option>
          </select>

          <!-- Botón de Descarga PDF -->
          <button id="btnDescargarPdfContenido" class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5 shadow-xs rounded-pill px-3 py-1.5" style="font-size:0.78rem;">
            <i class="bi bi-file-earmark-pdf"></i>
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>
    `
  }

  renderNivelesLogro(niveles) {
    const total = Object.values(niveles).reduce((a, b) => a + b, 0) || 1
    const items = [
      { key: 'introducido', label: '1. Introducido', color: 'bg-secondary', cant: niveles.introducido || 0 },
      { key: 'practicado', label: '2. En Práctica', color: 'bg-primary', cant: niveles.practicado || 0 },
      { key: 'reforzado', label: '3. En Refuerzo', color: 'bg-warning text-dark', cant: niveles.reforzado || 0 },
      { key: 'evaluado', label: '4. Evaluado', color: 'bg-info', cant: niveles.evaluado || 0 },
      { key: 'dominado', label: '5. Dominado (Concierto)', color: 'bg-success', cant: niveles.dominado || 0 },
    ]

    return `
      <div class="d-flex flex-column gap-2 pt-1">
        ${items
          .map((it) => {
            const pct = Math.round((it.cant / total) * 100)
            return `
            <div>
              <div class="d-flex justify-content-between align-items-center small mb-0.5" style="font-size:0.73rem;">
                <span class="fw-semibold text-body">${it.label}</span>
                <span class="text-body-secondary font-monospace">${it.cant} (${pct}%)</span>
              </div>
              <div class="progress" style="height: 5px;">
                <div class="progress-bar ${it.color}" style="width: ${pct}%;"></div>
              </div>
            </div>`
          })
          .join('')}
      </div>
    `
  }

  renderFocoTecnico(foco) {
    if (!foco.length) {
      return `<p class="text-body-secondary small mb-0 font-monospace" style="font-size:0.75rem;">No hay registros de foco pedagógico para este período.</p>`
    }

    return `
      <div class="d-flex flex-column gap-2 pt-1">
        ${foco
          .slice(0, 5)
          .map((f) => {
            return `
            <div>
              <div class="d-flex justify-content-between align-items-center small mb-0.5" style="font-size:0.73rem;">
                <span class="fw-semibold text-body text-truncate" style="max-width: 75%;">${escapeHTML(f.area || 'Técnica')}</span>
                <span class="text-body-secondary font-monospace">${f.menciones || 0} menciones (${f.porcentaje || 0}%)</span>
              </div>
              <div class="progress" style="height: 5px;">
                <div class="progress-bar bg-info" style="width: ${f.porcentaje || 0}%;"></div>
              </div>
            </div>`
          })
          .join('')}
      </div>
    `
  }

  renderCatedrasTable(catedras) {
    if (!catedras.length) {
      return `<p class="text-body-secondary small mb-0 font-monospace" style="font-size:0.75rem;">Sin datos de cátedra en este rango.</p>`
    }

    return `
      <div class="table-responsive" style="max-height: 220px; overflow-y: auto;">
        <table class="table table-sm table-hover align-middle mb-0 font-monospace" style="font-size:0.75rem;">
          <thead class="table-light sticky-top">
            <tr>
              <th>Cátedra / Materia</th>
              <th class="text-center">Sesiones</th>
              <th class="text-center">Obras</th>
              <th>Repertorio Principal</th>
              <th class="text-end">Maduración</th>
            </tr>
          </thead>
          <tbody>
            ${catedras
              .map(
                (c) => `
              <tr>
                <td class="fw-bold text-body">${escapeHTML(c.nombre || c.catedra || '—')}</td>
                <td class="text-center">${c.sesiones || 0}</td>
                <td class="text-center">${c.obrasActivas || 0}</td>
                <td class="text-truncate text-body-secondary" style="max-width: 180px;" title="${escapeHTML(c.repertorioPrincipal || '—')}">${escapeHTML(c.repertorioPrincipal || '—')}</td>
                <td class="text-end">
                  <span class="badge bg-primary-subtle text-primary px-2 py-0.5 font-monospace">${c.porcentajeMadurez || 0}%</span>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  renderConciertoTable(concierto) {
    if (!concierto.length) {
      return `<p class="text-body-secondary small mb-0 font-monospace" style="font-size:0.72rem;">No hay obras marcadas como listas para concierto en este filtro.</p>`
    }

    return `
      <div class="table-responsive" style="max-height: 110px; overflow-y: auto;">
        <table class="table table-sm table-borderless align-middle mb-0 font-monospace" style="font-size:0.72rem;">
          <tbody>
            ${concierto
              .slice(0, 4)
              .map(
                (c) => `
              <tr class="border-bottom border-secondary-subtle">
                <td class="fw-semibold text-body text-truncate" style="max-width: 200px;">${escapeHTML(c.titulo || c.obra || '—')}</td>
                <td class="text-body-secondary">${escapeHTML(c.catedra || 'Orquesta')}</td>
                <td class="text-end"><span class="badge bg-success-subtle text-success">Listo</span></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  renderRetosTable(retos) {
    if (!retos.length) {
      return `<p class="text-body-secondary small mb-0 font-monospace" style="font-size:0.72rem;">No se registran puntos críticos de refuerzo activos.</p>`
    }

    return `
      <div class="table-responsive" style="max-height: 110px; overflow-y: auto;">
        <table class="table table-sm table-borderless align-middle mb-0 font-monospace" style="font-size:0.72rem;">
          <tbody>
            ${retos
              .slice(0, 4)
              .map(
                (r) => `
              <tr class="border-bottom border-secondary-subtle">
                <td class="fw-semibold text-warning-emphasis text-truncate" style="max-width: 200px;">${escapeHTML(r.descripcion || r.reto || '—')}</td>
                <td class="text-body-secondary">${escapeHTML(r.catedra || 'General')}</td>
                <td class="text-end"><span class="badge bg-warning-subtle text-warning-emphasis">Refuerzo</span></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  renderRecientesTable(recientes) {
    if (!recientes.length) {
      return `<p class="text-body-secondary small mb-0 font-monospace" style="font-size:0.75rem;">Sin registros recientes de bitácora.</p>`
    }

    return `
      <div class="table-responsive" style="max-height: 180px; overflow-y: auto;">
        <table class="table table-sm table-hover align-middle mb-0 font-monospace" style="font-size:0.75rem;">
          <thead class="table-light sticky-top">
            <tr>
              <th style="width: 90px;">Fecha</th>
              <th>Cátedra / Materia</th>
              <th>Maestro / Docente</th>
              <th>Obra / Tema Abordado</th>
              <th>Nivel de Logro</th>
            </tr>
          </thead>
          <tbody>
            ${recientes
              .slice(0, 10)
              .map(
                (r) => `
              <tr>
                <td class="fw-semibold">${r.fecha || '—'}</td>
                <td class="fw-bold text-body">${escapeHTML(r.clase || r.catedra || '—')}</td>
                <td class="text-body-secondary">${escapeHTML(r.maestro || 'Docente')}</td>
                <td class="text-body">${escapeHTML(r.tema || r.contenido || '—')}</td>
                <td>
                  <span class="badge bg-info-subtle text-info-emphasis font-monospace px-2 py-0.5">${escapeHTML(r.logro || 'En Práctica')}</span>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  attachEventListeners() {
    // Horizon buttons
    this.container.querySelectorAll('.btn-tipo').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const tipo = e.currentTarget.dataset.tipo
        if (tipo && tipo !== this.tipo) {
          this.tipo = tipo
          await this.cargarDatos()
        }
      })
    })

    // Cátedra selector
    const selCatedra = this.container.querySelector('#selCatedra')
    selCatedra?.addEventListener('change', async (e) => {
      this.catedra = e.target.value
      await this.cargarDatos()
    })

    // PDF Export
    const btnPdf = this.container.querySelector('#btnDescargarPdfContenido')
    btnPdf?.addEventListener('click', async () => {
      if (this.isExporting) return
      this.isExporting = true
      btnPdf.setAttribute('disabled', 'true')
      btnPdf.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Exportando...'
      try {
        await descargarPdfAnalisisContenido(this.data, {
          tipo: this.tipo,
          catedra: this.catedra,
        })
      } catch (err) {
        console.error('[AnalisisContenidoView] Error al exportar PDF:', err)
        alert('Ocurrió un error al generar el PDF del análisis pedagógico.')
      } finally {
        this.isExporting = false
        btnPdf.removeAttribute('disabled')
        btnPdf.innerHTML = '<i class="bi bi-file-earmark-pdf"></i><span>Exportar PDF</span>'
      }
    })

    // AI Button in Pedagogical View
    const btnIa = this.container.querySelector('#btn-analisis-ia-pedagogico')
    const panelIa = this.container.querySelector('#panel-resena-pedagogica-ia')
    const btnIaText = this.container.querySelector('#btn-ia-pedagogico-text')
    const diagIa = this.container.querySelector('#texto-diagnostico-pedagogico')
    const botIa = this.container.querySelector('#texto-cuello-botella')
    const recIa = this.container.querySelector('#texto-recomendacion-pedagogica')
    const badgeSalud = this.container.querySelector('#badge-salud-curricular')

    btnIa?.addEventListener('click', async () => {
      if (!panelIa || !btnIaText) return
      btnIaText.textContent = 'Auditando...'
      btnIa.setAttribute('disabled', 'true')
      try {
        const sintesis = await generarSintesisPedagogicaIA(this.data)
        diagIa.textContent = sintesis.diagnostico
        botIa.textContent = sintesis.cuello_botella
        recIa.textContent = sintesis.recomendacion
        badgeSalud.className = `badge bg-${sintesis.salud_curricular.color}-subtle text-${sintesis.salud_curricular.color} font-monospace`
        badgeSalud.textContent = `Salud Curricular: ${sintesis.salud_curricular.porcentaje}% (${sintesis.salud_curricular.nivel})`
        panelIa.classList.remove('d-none')
        btnIaText.textContent = 'Actualizar IA'
        btnIa.removeAttribute('disabled')
      } catch (e) {
        btnIaText.textContent = 'Reintentar IA'
        btnIa.removeAttribute('disabled')
      }
    })
  }
}
