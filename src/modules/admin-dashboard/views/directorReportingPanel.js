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
    try {
      const { obtenerReportesDirector } = await import('../services/aiReportingService.js')
      this.aiReports = obtenerReportesDirector()
    } catch (e) {
      console.warn('[DirectorReportingPanel] AI Service load warning:', e)
      this.aiReports = []
    }
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
                <span class="badge bg-primary-subtle text-primary-emphasis">${this.summary.totalMaestros} Maestros</span>
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

        <!-- AI Reports Section -->
        <section class="ai-reports-section mt-4 mb-4">
          <div class="card border-0 shadow-sm rounded-3">
            <div class="card-body p-3">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h3 class="h5 fw-bold mb-0">
                  <i class="bi bi-robot text-primary me-2"></i>Reportes de Dirección IA (Fase 1)
                </h3>
                <button id="btnGenerateAIReport" class="btn btn-sm btn-primary-premium">
                  <i class="bi bi-magic me-1"></i>Generar Consolidado IA
                </button>
              </div>
              <p class="text-muted small mb-3">Genera consolidados automáticos de asistencia, alumnos en riesgo y recomendaciones pedagógicas usando Groq LLaMA 3.1.</p>
              
              <div id="ai-reports-list">
                ${this.renderAIReportsList()}
              </div>
            </div>
          </div>
        </section>

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
              <td><span class="badge bg-warning-subtle text-warning-emphasis px-2 py-1">${m.naranjaCount}</span></td>
              <td>
                <span class="badge ${m.rojoCount > 0 ? 'bg-danger text-white' : 'bg-secondary-subtle text-secondary-emphasis'} px-2 py-1">
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
    const btnGenerateAI = document.getElementById('btnGenerateAIReport')

    btnExport?.addEventListener('click', () => this.exportReport())
    btnRefresh?.addEventListener('click', () => this.init())

    btnGenerateAI?.addEventListener('click', async () => {
      btnGenerateAI.disabled = true
      btnGenerateAI.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status"></span>Analizando datos...`
      try {
        const { generarReporteConsolidadoIA } = await import('../services/aiReportingService.js')
        await generarReporteConsolidadoIA()
        
        try {
          const { AppToast } = await import('../../../shared/components/AppToast.js')
          AppToast.show('Reporte IA generado con éxito', 'success')
        } catch (e) {
          console.warn('[DirectorReportingPanel] AppToast not available')
        }

        await this.loadData()
        this.render()
        this.attachEventListeners()
      } catch (err) {
        console.error(err)
        alert('Error al generar reporte: ' + err.message)
      } finally {
        btnGenerateAI.disabled = false
        btnGenerateAI.innerHTML = `<i class="bi bi-magic me-1"></i>Generar Consolidado IA`
      }
    })

    this.container.querySelectorAll('.btnViewAIReport').forEach(btn => {
      btn.addEventListener('click', async () => {
        const reportId = btn.dataset.id
        const report = this.aiReports.find(r => r.id === reportId)
        if (!report) return

        try {
          const { AppModal } = await import('../../../shared/components/AppModal.js')
          const formattedBody = `
            <div class="ai-report-markdown-view px-2" style="font-family: -apple-system, Segoe UI, sans-serif; max-height: 500px; overflow-y: auto;">
              ${this.convertMarkdownToHtml(report.contenido_markdown)}
            </div>
          `

          AppModal.open({
            title: report.titulo,
            size: 'lg',
            body: formattedBody,
            saveText: null, // Just close button
          })
        } catch (e) {
          console.error(e)
          alert(report.contenido_markdown)
        }
      })
    })
  }

  renderAIReportsList() {
    const escapeHTML = (str) => String(str || '').replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag))
    const reports = this.aiReports || []
    if (reports.length === 0) {
      return `
        <div class="text-center py-4 text-muted small">
          <i class="bi bi-card-text fs-2 mb-2 d-block text-secondary"></i>
          Ningún reporte IA generado todavía. Haz clic en "Generar Consolidado IA" para iniciar el análisis.
        </div>
      `
    }

    return `
      <div class="list-group list-group-flush rounded-3 border" style="max-height: 250px; overflow-y: auto;">
        ${reports.map(r => {
          const dateFormatted = new Date(r.created_at).toLocaleString()
          return `
            <button class="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-2 px-3 btnViewAIReport" data-id="${r.id}">
              <div class="small">
                <div class="fw-semibold text-primary-emphasis">${escapeHTML(r.titulo)}</div>
                <div class="text-muted" style="font-size: 11px">Asistencia: ${r.asistencia_general}% · Alumnos Críticos: ${r.riesgos_criticos_count}</div>
              </div>
              <span class="text-muted small">${dateFormatted} <i class="bi bi-chevron-right ms-2"></i></span>
            </button>
          `
        }).join('')}
      </div>
    `
  }

  convertMarkdownToHtml(markdown) {
    return String(markdown || '')
      .replace(/^# (.*$)/gim, '<h3 class="fw-bold mt-3 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h4 class="fw-bold mt-3 mb-2 h5 text-primary">$1</h4>')
      .replace(/^### (.*$)/gim, '<h5 class="fw-bold mt-2 mb-1 h6 text-secondary">$1</h5>')
      .replace(/^\* (.*$)/gim, '<li class="ms-3 small mb-1">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
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
