/**
 * Director-Level Reporting Panel
 * Institution-wide compliance trends, critical alerts, and performance analysis
 */

import {
  getInstitutionComplianceSummary,
  getCriticalMaestrosReport,
  getMaestroTrendAnalysis,
  exportComplianceReport
} from '../api/adminReportingApi.js'
import '../styles/admin-dashboard.css'

export class DirectorReportingPanel {
  constructor(containerId) {
    this.containerId = containerId
    this.container = document.getElementById(containerId)
    this.summary = null
    this.critical = null
  }

  /**
   * Initialize reporting panel
   */
  async init() {
    try {
      this.container.innerHTML = `
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando reportes institucionales...</div>
        </div>
      `

      await this.loadData()
      this.render()
      this.attachEventListeners()

      console.log('[DirectorReportingPanel] Initialized')
    } catch (err) {
      console.error('[DirectorReportingPanel] Init error:', err)
      this.container.innerHTML = `
        <div class="premium-error-card">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <div>Error cargando reportes: ${err.message}</div>
        </div>
      `
    }
  }

  /**
   * Load all reporting data
   */
  async loadData() {
    this.summary = await getInstitutionComplianceSummary()
    this.critical = await getCriticalMaestrosReport()
  }

  /**
   * Render main panel
   */
  render() {
    const html = `
      <div class="admin-dashboard-container">
        <!-- Premium Page Header -->
        <div class="admin-header-premium mb-4">
          <div class="admin-header-brand">
            <div class="admin-header-icon-wrapper">
              <i class="bi bi-graph-up-arrow"></i>
            </div>
            <div class="admin-header-title-section">
              <h1 class="page-title">Reporte Institucional de Cumplimiento</h1>
              <div class="admin-header-subtitle">
                Análisis de desempeño de maestros en registro de asistencias
                <span class="badge">${this.summary.totalMaestros} Maestros</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Overall Metrics -->
        <section class="metrics-section">
          <h2>Métricas Generales</h2>
          <div class="metrics-grid">
            <div class="stat-card primary">
              <div class="stat-label">Tasa de Cumplimiento</div>
              <div class="stat-value">${this.summary.overallComplianceRate}%</div>
              <div class="stat-subtitle">${this.summary.completedSessions}/${this.summary.totalSessions} sesiones</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total de Maestros</div>
              <div class="stat-value">${this.summary.totalMaestros}</div>
              <div class="stat-subtitle">Plantilla institucional</div>
            </div>
            <div class="stat-card success">
              <div class="stat-label">Maestros Responsables</div>
              <div class="stat-value">${this.summary.byCategory.responsable || 0}</div>
              <div class="stat-subtitle">Cumplimiento óptimo</div>
            </div>
            <div class="stat-card alert">
              <div class="stat-label">Críticos (NARANJA/ROJO)</div>
              <div class="stat-value">${this.critical.totalCritical}</div>
              <div class="stat-subtitle">Requieren atención</div>
            </div>
          </div>
        </section>

        <!-- Category & Trend Distributions -->
        <section class="distribution-section">
          <div class="distribution-card">
            <h3>Distribución por Categoría</h3>
            <div class="distribution-chart">
              ${this.renderCategoryDistribution()}
            </div>
          </div>
          <div class="distribution-card">
            <h3>Distribución por Tendencia</h3>
            <div class="distribution-chart">
              ${this.renderTrendDistribution()}
            </div>
          </div>
        </section>

        <!-- Critical Maestros Alert -->
        ${this.critical.totalCritical > 0 ? `
          <section class="critical-section">
            <h2><i class="bi bi-exclamation-octagon"></i> Maestros en Estado Crítico (${this.critical.totalCritical})</h2>
            <div class="premium-table-container">
              ${this.renderCriticalTable()}
            </div>
          </section>
        ` : ''}

        <!-- Actions Toolbar -->
        <div class="admin-toolbar-dense">
          <button id="btnExportCSV" class="btn-premium-action btn-premium-success">
            <i class="bi bi-download"></i> Descargar Reporte CSV
          </button>
          <button id="btnRefresh" class="btn-premium-action btn-premium-primary">
            <i class="bi bi-arrow-clockwise"></i> Actualizar
          </button>
        </div>

        <div class="generated-timestamp-premium">
          Generado: ${new Date(this.summary.generatedAt).toLocaleString()}
        </div>
      </div>
    `

    this.container.innerHTML = html
  }

  /**
   * Render category distribution bars
   */
  renderCategoryDistribution() {
    const maxCount = Math.max(...Object.values(this.summary.byCategory))

    return Object.entries(this.summary.byCategory)
      .map(([cat, count]) => {
        const percentage = ((count / maxCount) * 100).toFixed(1)
        return `
          <div class="distribution-item">
            <div class="distribution-label">${cat.toUpperCase()}</div>
            <div class="distribution-bar">
              <div class="distribution-fill" style="width: ${percentage}%">${percentage}%</div>
            </div>
            <div class="distribution-count">${count}</div>
          </div>
        `
      })
      .join('')
  }

  /**
   * Render trend distribution bars
   */
  renderTrendDistribution() {
    const maxCount = Math.max(...Object.values(this.summary.byTrend))

    return Object.entries(this.summary.byTrend)
      .map(([trend, count]) => {
        const percentage = ((count / maxCount) * 100).toFixed(1)
        return `
          <div class="distribution-item">
            <div class="distribution-label">${trend.toUpperCase()}</div>
            <div class="distribution-bar">
              <div class="distribution-fill" style="width: ${percentage}%">${percentage}%</div>
            </div>
            <div class="distribution-count">${count}</div>
          </div>
        `
      })
      .join('')
  }

  /**
   * Render critical maestros table
   */
  renderCriticalTable() {
    return `
      <table class="premium-table">
        <thead>
          <tr>
            <th>Maestro</th>
            <th>Días de Atraso</th>
            <th>NARANJA</th>
            <th>ROJO</th>
            <th>Total Pendiente</th>
            <th>Urgencia</th>
          </tr>
        </thead>
        <tbody>
          ${this.critical.maestros
            .map(
              (m) => `
            <tr>
              <td><strong>${m.nombre}</strong></td>
              <td>${m.diasAtraso} días</td>
              <td><span class="badge bg-warning bg-opacity-10 text-warning px-2 py-1">${m.naranjaCount}</span></td>
              <td>
                <span class="badge ${m.rojoCount > 0 ? 'bg-danger text-white' : 'bg-secondary bg-opacity-10 text-secondary'} px-2 py-1">
                  ${m.rojoCount}
                </span>
              </td>
              <td><strong>${m.totalCount}</strong></td>
              <td>
                <span class="urgency-indicator ${m.urgency === 'CRITICA' ? 'text-danger' : 'text-warning'}">
                  <i class="bi ${m.urgency === 'CRITICA' ? 'bi-fire' : 'bi-exclamation-triangle'}"></i> ${m.urgency}
                </span>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const btnExport = document.getElementById('btnExportCSV')
    const btnRefresh = document.getElementById('btnRefresh')

    btnExport?.addEventListener('click', () => this.exportReport())
    btnRefresh?.addEventListener('click', () => this.init())
  }

  /**
   * Export report as CSV
   */
  async exportReport() {
    try {
      const csv = await exportComplianceReport('csv')

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reporte-cumplimiento-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      window.URL.revokeObjectURL(url)

      console.log('[DirectorReportingPanel] CSV exported')
    } catch (err) {
      console.error('[DirectorReportingPanel] Export error:', err)
      alert('Error al descargar reporte: ' + err.message)
    }
  }
}

export default DirectorReportingPanel
