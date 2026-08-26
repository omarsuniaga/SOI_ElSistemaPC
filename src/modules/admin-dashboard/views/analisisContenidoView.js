/**
 * analisisContenidoView.js — Visor Ejecutivo de Análisis Pedagógico y Contenido Curricular (Portal ADM).
 * Permite analizar la bitácora de clases a nivel Semanal, Mensual y Semestral con exportación PDF.
 */

import { getAnalisisContenidoPedagogico } from '../api/contenidoAnalyticsApi.js'
import { descargarPdfAnalisisContenido } from '../services/academicReportsPdfService.js'
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
  }

  async init() {
    if (!this.container) return
    await this.cargarDatos()
  }

  async cargarDatos() {
    this.container.innerHTML = `
      <div class="premium-loading text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <div class="text-muted fw-semibold">Analizando bitácora y contenidos pedagógicos (${this.tipo.toUpperCase()})...</div>
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
        <div class="admin-dashboard-container p-4">
          ${this.renderHeader()}
          <div class="alert alert-danger d-flex align-items-center gap-3 mt-3">
            <i class="bi bi-exclamation-triangle-fill fs-3"></i>
            <div>
              <div class="fw-bold">No se pudo generar el análisis pedagógico</div>
              <div class="small">${escapeHTML(err.message || String(err))}</div>
            </div>
          </div>
        </div>
      `
      this.attachEventListeners()
    }
  }

  render() {
    const d = this.data
    const resumen = d?.resumen || {}
    const niveles = d?.nivelesLogro || {}
    const foco = Array.isArray(d?.focoTecnico) ? d.focoTecnico : []
    const catedras = Array.isArray(d?.catedrasResumen) ? d.catedrasResumen : []
    const concierto = Array.isArray(d?.repertorioConcierto) ? d.repertorioConcierto : []
    const retos = Array.isArray(d?.retosPedagogicos) ? d.retosPedagogicos : []
    const recientes = Array.isArray(d?.temasRecientes) ? d.temasRecientes : []

    this.container.innerHTML = `
      <div class="admin-dashboard-container p-3 p-md-4">
        ${this.renderHeader()}

        <!-- 1. KPIs Pedagógicos -->
        <section class="metrics-section mb-4">
          <div class="row g-3">
            <div class="col-12 col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 border-start border-primary border-4">
                <div class="text-muted small fw-semibold">Sesiones de Clase Analizadas</div>
                <div class="fs-2 fw-bold text-primary my-1">${resumen.totalSesionesAnalizadas || 0}</div>
                <div class="small text-muted">${resumen.totalContenidosRegistrados || 0} entradas de bitácora</div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 border-start border-info border-4">
                <div class="text-muted small fw-semibold">Obras & Estudios en Práctica</div>
                <div class="fs-2 fw-bold text-info my-1">${resumen.obrasEnProgreso || 0}</div>
                <div class="small text-muted">Repertorio curricular activo</div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 border-start border-success border-4">
                <div class="text-muted small fw-semibold">Obras Listas para Concierto</div>
                <div class="fs-2 fw-bold text-success my-1">${resumen.obrasDominadasConcierto || 0}</div>
                <div class="small text-muted">Nivel Dominado / Evaluado</div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-xl-3">
              <div class="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 border-start border-warning border-4">
                <div class="text-muted small fw-semibold">Puntos para Refuerzo</div>
                <div class="fs-2 fw-bold text-warning my-1">${resumen.puntosRefuerzoPendientes || 0}</div>
                <div class="small text-muted">Dificultades técnicas señaladas</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Nivel de Maduración & Foco Técnico -->
        <div class="row g-4 mb-4">
          <!-- Maduración de Contenidos -->
          <div class="col-12 col-xl-6">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-body h-100">
              <h5 class="fw-bold mb-3"><i class="bi bi-bar-chart-steps text-primary me-2"></i>Escala de Maduración Curricular</h5>
              ${this.renderNivelesLogro(niveles)}
            </div>
          </div>

          <!-- Foco Técnico y Metodológico -->
          <div class="col-12 col-xl-6">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-body h-100">
              <h5 class="fw-bold mb-3"><i class="bi bi-compass-fill text-info me-2"></i>Distribución del Foco Pedagógico</h5>
              ${this.renderFocoTecnico(foco)}
            </div>
          </div>
        </div>

        <!-- 3. Síntesis por Cátedra -->
        <section class="mb-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h5 class="fw-bold m-0"><i class="bi bi-music-note-list text-primary me-2"></i>Síntesis de Contenidos por Cátedra</h5>
              <span class="text-muted small">${catedras.length} cátedras activas</span>
            </div>
            ${this.renderCatedrasTable(catedras)}
          </div>
        </section>

        <!-- 4. Repertorio para Concierto y Puntos de Refuerzo -->
        <div class="row g-4 mb-4">
          <!-- Repertorio Concierto -->
          <div class="col-12 col-xl-6">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-body h-100">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold m-0 text-success"><i class="bi bi-award-fill me-2"></i>Obras Listas para Audición / Concierto</h5>
                <span class="badge bg-success-subtle text-success">${concierto.length}</span>
              </div>
              ${this.renderConciertoTable(concierto)}
            </div>
          </div>

          <!-- Puntos de Refuerzo -->
          <div class="col-12 col-xl-6">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-body h-100">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold m-0 text-warning"><i class="bi bi-tools me-2"></i>Puntos Críticos Señalados para Refuerzo</h5>
                <span class="badge bg-warning-subtle text-warning">${retos.length}</span>
              </div>
              ${this.renderRetosTable(retos)}
            </div>
          </div>
        </div>

        <!-- 5. Bitácora Cronológica de Temas Recientes -->
        <section class="mb-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h5 class="fw-bold m-0"><i class="bi bi-clock-history text-secondary me-2"></i>Registro Reciente de Clases y Obras</h5>
              <span class="text-muted small">Últimos ${recientes.length} registros</span>
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
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 mb-4 border-bottom">
        <div class="d-flex align-items-center gap-3">
          <div class="rounded-4 bg-primary text-white p-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
            <i class="bi bi-journal-text fs-4"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <h3 class="fw-bold m-0 text-body">Análisis Pedagógico y Curricular</h3>
              <span class="badge bg-primary-subtle text-primary border">${escapeHTML(labelTipo)}</span>
            </div>
            <p class="text-muted small m-0">Síntesis de temas impartidos, repertorio en ensayo y nivel de maduración técnica</p>
          </div>
        </div>

        <div class="d-flex flex-wrap align-items-center gap-2">
          <!-- Selector de Horizonte Temporal -->
          <div class="btn-group btn-group-sm" role="group">
            <button type="button" class="btn btn-outline-primary btn-tipo ${this.tipo === 'semana' ? 'active' : ''}" data-tipo="semana">Semana</button>
            <button type="button" class="btn btn-outline-primary btn-tipo ${this.tipo === 'mes' ? 'active' : ''}" data-tipo="mes">Mes</button>
            <button type="button" class="btn btn-outline-primary btn-tipo ${this.tipo === 'semestre' ? 'active' : ''}" data-tipo="semestre">Semestre</button>
          </div>

          <!-- Selector de Cátedra -->
          <select id="selCatedra" class="form-select form-select-sm" style="width: auto;">
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
          <button id="btnDescargarPdfContenido" class="btn btn-sm btn-primary d-flex align-items-center gap-2 shadow-sm rounded-3">
            <i class="bi bi-file-earmark-pdf"></i>
            <span>Descargar PDF</span>
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
      <div class="d-flex flex-column gap-3 pt-2">
        ${items
          .map((it) => {
            const pct = Math.round((it.cant / total) * 100)
            return `
            <div>
              <div class="d-flex justify-content-between align-items-center small mb-1">
                <span class="fw-semibold text-body">${it.label}</span>
                <span class="text-muted">${it.cant} (${pct}%)</span>
              </div>
              <div class="progress" style="height: 8px;">
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
      return `<div class="text-center py-4 text-muted small">Sin datos de foco metodológico.</div>`
    }
    return `
      <div class="d-flex flex-column gap-3 pt-2">
        ${foco
          .map((f) => `
          <div>
            <div class="d-flex justify-content-between align-items-center small mb-1">
              <span class="fw-semibold text-body">${escapeHTML(f.area)}</span>
              <span class="badge bg-secondary-subtle text-secondary">${f.cantidad} menciones (${f.porcentaje}%)</span>
            </div>
            <div class="progress" style="height: 8px;">
              <div class="progress-bar bg-info" style="width: ${f.porcentaje}%;"></div>
            </div>
          </div>`)
          .join('')}
      </div>
    `
  }

  renderCatedrasTable(catedras) {
    if (!catedras.length) {
      return `<div class="text-center py-4 text-muted small">Sin registros pedagógicos para el período seleccionado.</div>`
    }
    return `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light small">
            <tr>
              <th>Cátedra</th>
              <th class="text-center">Sesiones</th>
              <th class="text-center">% Maduración</th>
              <th>Temas & Obras Principales</th>
            </tr>
          </thead>
          <tbody>
            ${catedras
              .map(
                (c) => `
              <tr>
                <td><strong class="text-body">${escapeHTML(c.catedra)}</strong></td>
                <td class="text-center font-monospace">${c.totalSesiones || 0}</td>
                <td class="text-center"><span class="badge ${c.tasaDominioPct >= 50 ? 'bg-success' : 'bg-primary'}">${c.tasaDominioPct}%</span></td>
                <td class="small text-muted">${c.temasPrincipales && c.temasPrincipales.length ? escapeHTML(c.temasPrincipales.join(' · ')) : 'Práctica general'}</td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  renderConciertoTable(concierto) {
    if (!concierto.length) {
      return `<div class="text-center py-4 text-muted small"><i class="bi bi-info-circle fs-4 d-block mb-2 text-primary"></i>Aún no hay obras marcadas como dominadas para concierto en este período.</div>`
    }
    return `
      <div class="table-responsive" style="max-height: 250px;">
        <table class="table table-hover table-sm align-middle mb-0">
          <thead class="table-light small">
            <tr>
              <th>Cátedra</th>
              <th>Obra / Contenido</th>
              <th class="text-center">Nivel</th>
            </tr>
          </thead>
          <tbody>
            ${concierto
              .map(
                (c) => `
              <tr>
                <td><span class="badge bg-secondary-subtle text-secondary">${escapeHTML(c.instrumento)}</span></td>
                <td><strong class="text-body small">${escapeHTML(c.tema)}</strong></td>
                <td class="text-center"><span class="badge bg-success">Dominado</span></td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  renderRetosTable(retos) {
    if (!retos.length) {
      return `<div class="text-center py-4 text-muted small"><i class="bi bi-check-circle fs-4 d-block mb-2 text-success"></i>Excelente: No hay temas marcados con necesidad urgente de refuerzo.</div>`
    }
    return `
      <div class="table-responsive" style="max-height: 250px;">
        <table class="table table-hover table-sm align-middle mb-0">
          <thead class="table-light small">
            <tr>
              <th>Cátedra</th>
              <th>Aspecto a Reforzar</th>
              <th class="text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${retos
              .map(
                (r) => `
              <tr>
                <td><span class="badge bg-secondary-subtle text-secondary">${escapeHTML(r.instrumento)}</span></td>
                <td><span class="text-body small">${escapeHTML(r.tema)}</span></td>
                <td class="text-center"><span class="badge bg-warning text-dark">Reforzar</span></td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  renderRecientesTable(recientes) {
    if (!recientes.length) {
      return `<div class="text-center py-4 text-muted small">Sin registros de bitácora recientes.</div>`
    }
    return `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light small">
            <tr>
              <th>Fecha</th>
              <th>Clase</th>
              <th>Cátedra</th>
              <th>Contenido / Obra</th>
              <th class="text-center">Nivel</th>
            </tr>
          </thead>
          <tbody>
            ${recientes
              .map(
                (r) => `
              <tr>
                <td class="small text-muted font-monospace">${escapeHTML(r.fecha)}</td>
                <td><strong class="text-body small">${escapeHTML(r.claseNombre)}</strong></td>
                <td><span class="badge bg-secondary-subtle text-secondary">${escapeHTML(r.instrumento)}</span></td>
                <td class="small">${escapeHTML(r.tema)}</td>
                <td class="text-center">
                  <span class="badge ${r.nivelLogro === 'dominado' ? 'bg-success' : r.nivelLogro === 'reforzado' ? 'bg-warning text-dark' : 'bg-primary-subtle text-primary'}">
                    ${escapeHTML(r.nivelLogro)}
                  </span>
                </td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  attachEventListeners() {
    const btnsTipo = document.querySelectorAll('.btn-tipo')
    const selCatedra = document.getElementById('selCatedra')
    const btnPdf = document.getElementById('btnDescargarPdfContenido')

    btnsTipo.forEach((btn) => {
      btn.addEventListener('click', () => {
        const nuevoTipo = btn.dataset.tipo
        if (nuevoTipo !== this.tipo) {
          this.tipo = nuevoTipo
          this.cargarDatos()
        }
      })
    })

    if (selCatedra) {
      selCatedra.addEventListener('change', (e) => {
        this.catedra = e.target.value
        this.cargarDatos()
      })
    }

    if (btnPdf) {
      btnPdf.addEventListener('click', async () => {
        if (!this.data || this.isExporting) return
        this.isExporting = true
        btnPdf.disabled = true
        btnPdf.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Generando PDF...`

        try {
          const label = `${this.tipo.toUpperCase()} (${this.data?.rango?.fechaInicio || ''} al ${this.data?.rango?.fechaFin || ''})`
          await descargarPdfAnalisisContenido(this.data, this.tipo, label)
        } catch (err) {
          console.error('[AnalisisContenidoView] Error al exportar PDF:', err)
          alert('Hubo un error al generar el PDF de contenido pedagógico.')
        } finally {
          this.isExporting = false
          btnPdf.disabled = false
          btnPdf.innerHTML = `<i class="bi bi-file-earmark-pdf"></i> <span>Descargar PDF</span>`
        }
      })
    }
  }
}

export default AnalisisContenidoView
