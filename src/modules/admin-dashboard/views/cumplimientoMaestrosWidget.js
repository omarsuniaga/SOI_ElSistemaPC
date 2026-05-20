/**
 * Admin Dashboard Widget: Cumplimiento de Maestros (Teacher Compliance)
 * Displays maestro registration compliance status with escalation states
 */

import {
  getMaestrosComplianceStatus,
  getMaestrosByCategory,
  getCriticalMaestros,
  getMaestroPendingRegistros
} from '../api/adminMaestroApi.js'
import '../styles/admin-dashboard.css'

export class CumplimientoMaestrosWidget {
  constructor(containerId) {
    this.containerId = containerId
    this.container = document.getElementById(containerId)
    this.maestros = []
    this.filteredMaestros = []
    this.currentFilter = {
      categoria: null,
      estado: null,
      diasAtrasoMin: 0,
      diasAtrasoMax: 999
    }
  }

  /**
   * Initialize widget: load data and render
   */
  async init() {
    try {
      this.container.innerHTML = `
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando cumplimiento de maestros...</div>
        </div>
      `

      await this.loadData()
      this.render()
      this.attachEventListeners()

      console.log('[CumplimientoMaestrosWidget] Initialized with', this.maestros.length, 'maestros')
    } catch (err) {
      console.error('[CumplimientoMaestrosWidget] Init error:', err)
      this.container.innerHTML = `
        <div class="premium-error-card">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <div>Error cargando datos: ${err.message}</div>
        </div>
      `
    }
  }

  /**
   * Load maestro compliance data
   */
  async loadData() {
    const maestros = await getMaestrosComplianceStatus()

    // Enrich each maestro with pending registros info
    this.maestros = await Promise.all(
      maestros.map(async (m) => {
        const pendingCount = await this.getPendingCount(m.maestro_id)
        const oldestDiasAtraso = await this.getOldestDiasAtraso(m.maestro_id)

        return {
          ...m,
          pendingCount,
          oldestDiasAtraso,
          statusColor: this.getStatusColor(m.categoria),
          categoryLabel: this.getCategoryLabel(m.categoria)
        }
      })
    )

    this.filteredMaestros = [...this.maestros]
  }

  /**
   * Get count of pending registros for maestro
   */
  async getPendingCount(maestroId) {
    try {
      const registros = await getMaestroPendingRegistros(maestroId)
      return registros.length
    } catch {
      return 0
    }
  }

  /**
   * Get oldest pending registro dias_atraso
   */
  async getOldestDiasAtraso(maestroId) {
    try {
      const registros = await getMaestroPendingRegistros(maestroId)
      if (registros.length === 0) return 0

      return registros.reduce((max, reg) => {
        const created = new Date(reg.created_at).getTime()
        const now = Date.now()
        const dias = Math.ceil((now - created) / (1000 * 60 * 60 * 24))
        return Math.max(max, dias)
      }, 0)
    } catch {
      return 0
    }
  }

  /**
   * Get color for status/category
   */
  getStatusColor(categoria) {
    const colors = {
      responsable: '#10b981', // Green
      regular: '#f59e0b', // Amber
      incumplidor: '#f97316', // Orange
      negligente: '#dc2626' // Red
    }
    return colors[categoria] || '#9ca3af'
  }

  /**
   * Get human-readable category label
   */
  getCategoryLabel(categoria) {
    const labels = {
      responsable: 'Responsable ✓',
      regular: 'Regular',
      incumplidor: 'Incumplidor',
      negligente: 'Negligente ⚠️'
    }
    return labels[categoria] || categoria
  }

  /**
   * Apply filters
   */
  applyFilter(filterObj) {
    this.currentFilter = { ...this.currentFilter, ...filterObj }

    this.filteredMaestros = this.maestros.filter((m) => {
      if (this.currentFilter.categoria && m.categoria !== this.currentFilter.categoria) {
        return false
      }
      if (
        this.currentFilter.diasAtrasoMin &&
        m.oldestDiasAtraso < this.currentFilter.diasAtrasoMin
      ) {
        return false
      }
      if (
        this.currentFilter.diasAtrasoMax &&
        m.oldestDiasAtraso > this.currentFilter.diasAtrasoMax
      ) {
        return false
      }
      return true
    })

    this.render()
  }

  /**
   * Render widget HTML
   */
  render() {
    const html = `
      <div class="distribution-card">
        <div class="admin-header-brand mb-4">
          <div class="admin-header-icon-wrapper" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <i class="bi bi-people-fill"></i>
          </div>
          <div class="admin-header-title-section">
            <h3 style="margin: 0; font-size: 1.3rem; font-weight: 800; letter-spacing: -0.02em;">Cumplimiento de Maestros</h3>
            <p class="subtitle" style="margin: 0.25rem 0 0; color: #6b7280; font-size: 0.85rem;">
              Estado de registros de asistencias y observaciones
            </p>
          </div>
        </div>

        <!-- Filter Toolbar -->
        <div class="admin-toolbar-dense">
          <div class="premium-select-container">
            <i class="bi bi-funnel"></i>
            <select id="filterCategoria" class="premium-select">
              <option value="">Todas las Categorías</option>
              <option value="responsable" ${this.currentFilter.categoria === 'responsable' ? 'selected' : ''}>Responsable</option>
              <option value="regular" ${this.currentFilter.categoria === 'regular' ? 'selected' : ''}>Regular</option>
              <option value="incumplidor" ${this.currentFilter.categoria === 'incumplidor' ? 'selected' : ''}>Incumplidor</option>
              <option value="negligente" ${this.currentFilter.categoria === 'negligente' ? 'selected' : ''}>Negligente</option>
            </select>
          </div>

          <div class="premium-select-container">
            <i class="bi bi-clock-history"></i>
            <select id="filterDiasAtraso" class="premium-select">
              <option value="">Cualquier Atraso</option>
              <option value="1-2">1-2 días</option>
              <option value="3-6">3-6 días</option>
              <option value="7-999">7+ días</option>
            </select>
          </div>

          <button id="btnRefresh" class="btn-premium-action btn-premium-secondary ms-auto">
            <i class="bi bi-arrow-clockwise"></i> Actualizar
          </button>
        </div>

        <!-- Stats Overview Cards -->
        <div class="metrics-grid mb-4">
          <div class="stat-card success" style="padding: 1rem 1.25rem;">
            <div class="stat-value" style="font-size: 1.75rem;">${this.maestros.filter((m) => m.categoria === 'responsable').length}</div>
            <div class="stat-label" style="font-size: 0.7rem; margin-bottom: 0;">Responsables</div>
          </div>
          <div class="stat-card warning" style="padding: 1rem 1.25rem;">
            <div class="stat-value" style="font-size: 1.75rem;">${this.maestros.filter((m) => m.categoria === 'regular').length}</div>
            <div class="stat-label" style="font-size: 0.7rem; margin-bottom: 0;">Regulares</div>
          </div>
          <div class="stat-card alert" style="padding: 1rem 1.25rem; border-left-color: #f97316; background: linear-gradient(135deg, rgba(249, 115, 22, 0.03) 0%, rgba(245, 158, 11, 0.03) 100%);">
            <div class="stat-value" style="font-size: 1.75rem;">${this.maestros.filter((m) => m.categoria === 'incumplidor').length}</div>
            <div class="stat-label" style="font-size: 0.7rem; margin-bottom: 0;">Incumplidores</div>
          </div>
          <div class="stat-card alert" style="padding: 1rem 1.25rem;">
            <div class="stat-value" style="font-size: 1.75rem;">${this.maestros.filter((m) => m.categoria === 'negligente').length}</div>
            <div class="stat-label" style="font-size: 0.7rem; margin-bottom: 0;">Negligentes</div>
          </div>
        </div>

        <!-- Data Table Container -->
        <div class="premium-table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Maestro</th>
                <th>Estado</th>
                <th>Días de Atraso</th>
                <th>Categoría</th>
                <th>Sesiones Pendientes</th>
                <th>Última Notificación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${this.filteredMaestros.length === 0 
                ? '<tr><td colspan="7" class="premium-no-data"><i class="bi bi-inbox fs-4 d-block mb-2 text-secondary"></i>No hay maestros que coincidan con los filtros</td></tr>' 
                : this.filteredMaestros.map((m) => this.renderMaestroRow(m)).join('')
              }
            </tbody>
          </table>
        </div>
      </div>
    `

    this.container.innerHTML = html
  }

  /**
   * Render single maestro row
   */
  renderMaestroRow(maestro) {
    const lastNotified = maestro.updated_at ? new Date(maestro.updated_at).toLocaleString() : 'Nunca'
    const color = this.getStatusColor(maestro.categoria)

    return `
      <tr>
        <td><strong>${maestro.maestros?.nombre_completo || 'Unknown'}</strong></td>
        <td>
          <span class="status-badge" style="background-color: ${color}">
            ${maestro.categoria.toUpperCase()}
          </span>
        </td>
        <td><strong>${maestro.oldestDiasAtraso}</strong> días</td>
        <td>
          <span class="category-badge" style="background-color: ${color}15; color: ${color}">
            ${maestro.categoryLabel}
          </span>
        </td>
        <td><strong>${maestro.pendingCount}</strong> sesiones</td>
        <td class="text-secondary" style="font-size: 0.8rem;">${lastNotified}</td>
        <td>
          <button class="btn-action-small btn-action-success-light btn-contactar" data-maestro-id="${maestro.maestro_id}">
            <i class="bi bi-chat-dots"></i> Contactar
          </button>
          <button class="btn-action-small btn-action-primary-light btn-detalle" data-maestro-id="${maestro.maestro_id}">
            <i class="bi bi-eye"></i> Detalle
          </button>
        </td>
      </tr>
    `
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Filter change
    const filterCategoria = document.getElementById('filterCategoria')
    const filterDiasAtraso = document.getElementById('filterDiasAtraso')
    const btnRefresh = document.getElementById('btnRefresh')

    filterCategoria?.addEventListener('change', (e) => {
      this.applyFilter({ categoria: e.target.value || null })
    })

    filterDiasAtraso?.addEventListener('change', (e) => {
      if (!e.target.value) {
        this.applyFilter({ diasAtrasoMin: 0, diasAtrasoMax: 999 })
      } else {
        const range = e.target.value.split('-')
        this.applyFilter({
          diasAtrasoMin: range[0] ? parseInt(range[0]) : 0,
          diasAtrasoMax: range[1] ? parseInt(range[1]) : 999
        })
      }
    })

    btnRefresh?.addEventListener('click', () => {
      this.init()
    })

    // Action buttons
    this.container.querySelectorAll('.btn-contactar').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-contactar')
        const maestroId = button.dataset.maestroId
        this.onContactarMaestro(maestroId)
      })
    })

    this.container.querySelectorAll('.btn-detalle').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-detalle')
        const maestroId = button.dataset.maestroId
        this.onDetalleMaestro(maestroId)
      })
    })
  }

  /**
   * Handle "Contactar" action
   */
  onContactarMaestro(maestroId) {
    const maestro = this.maestros.find((m) => m.maestro_id === maestroId)
    if (!maestro) return

    const email = maestro.maestros?.email
    if (email) {
      window.location.href = `mailto:${email}?subject=Seguimiento%20Registros%20Asistencias`
    } else {
      alert('No hay email disponible para este maestro')
    }
  }

  /**
   * Handle "Detalle" action
   */
  onDetalleMaestro(maestroId) {
    const maestro = this.maestros.find((m) => m.maestro_id === maestroId)
    if (!maestro) return

    // Could open a modal or navigate to detail page
    console.log('View detail for maestro:', maestroId, maestro)
    // Example: navigate to /admin/maestros/{maestroId}/detail
    window.location.href = `/admin/maestros/${maestroId}/detail`
  }
}

// Export as default export for easy importing
export default CumplimientoMaestrosWidget
