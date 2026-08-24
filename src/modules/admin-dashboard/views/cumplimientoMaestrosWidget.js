/**
 * Admin Dashboard Widget: Cumplimiento de Maestros (Canonical Attendance Solvency)
 * Uses canonical RPC fn_resumen_cumplimiento_asistencia from Supabase
 */

import {
  getMaestrosComplianceStatus,
  getSemanaActualSantoDomingo,
} from '../api/adminMaestroApi.js'
import { InfoTooltip, attachInfoTooltipEvents, injectInfoTooltipStyles } from '../../../shared/components/InfoTooltip.js'
import '../styles/admin-dashboard.css'

export class CumplimientoMaestrosWidget {
  constructor(containerId) {
    this.containerId = containerId
    this.container = document.getElementById(containerId)
    this.maestros = []
    this.filteredMaestros = []
    this.currentRango = 'semana_actual'
    this.customDates = getSemanaActualSantoDomingo()
    this.currentFilter = {
      estado: null,
    }
  }

  /**
   * Initialize widget: load data and render
   */
  async init() {
    try {
      injectInfoTooltipStyles()
      this.container.innerHTML = `
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando balance canónico de asistencia...</div>
        </div>
      `

      await this.loadData()
      this.render()
      this.attachEventListeners()

      console.log('[CumplimientoMaestrosWidget] Canonical attendance loaded with', this.maestros.length, 'maestros')
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
   * Resolve active date range
   */
  getRangoFechas() {
    if (this.currentRango === 'semana_actual') {
      return getSemanaActualSantoDomingo()
    }
    
    // Rango 14 días (2 semanas)
    if (this.currentRango === 'ultimas_2_semanas') {
      const sem = getSemanaActualSantoDomingo()
      const lunesSemana = new Date(`${sem.desde}T12:00:00Z`)
      lunesSemana.setUTCDate(lunesSemana.getUTCDate() - 7)
      return {
        desde: lunesSemana.toISOString().split('T')[0],
        hasta: sem.hasta,
      }
    }

    // Mes en curso AST
    if (this.currentRango === 'mes_actual') {
      const ahora = new Date()
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Santo_Domingo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      const [y, m] = formatter.format(ahora).split('-')
      const primerDia = `${y}-${m}-01`
      const ultimoDiaNum = new Date(Number(y), Number(m), 0).getDate()
      const ultimoDia = `${y}-${m}-${String(ultimoDiaNum).padStart(2, '0')}`
      return { desde: primerDia, hasta: ultimoDia }
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

      let estado = 'solvente'
      if (vencidas > 0) {
        estado = 'vencida' // Rojo (#ef4444)
      } else if (pendientes > 0) {
        estado = 'pendiente' // Naranja (#f97316)
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

    this.filteredMaestros = [...this.maestros]
  }

  /**
   * Get semantic label and icon for status
   */
  getStatusConfig(estado) {
    const configs = {
      solvente: {
        label: 'SOLVENTE',
        icon: 'bi-check-circle-fill',
        color: '#10b981', // Emerald Green
        bg: 'rgba(16, 185, 129, 0.15)',
      },
      pendiente: {
        label: 'CON PENDIENTES',
        icon: 'bi-clock-fill',
        color: '#f97316', // Orange
        bg: 'rgba(249, 115, 22, 0.15)',
      },
      vencida: {
        label: 'CON VENCIDAS',
        icon: 'bi-exclamation-triangle-fill',
        color: '#ef4444', // Crimson Red
        bg: 'rgba(239, 68, 68, 0.15)',
      },
    }
    return configs[estado] || configs.solvente
  }

  /**
   * Apply filters
   */
  applyFilter(filterObj) {
    this.currentFilter = { ...this.currentFilter, ...filterObj }

    this.filteredMaestros = this.maestros.filter((m) => {
      if (this.currentFilter.estado && m.estado !== this.currentFilter.estado) {
        return false
      }
      return true
    })

    this.render()
    this.attachEventListeners()
  }

  /**
   * Render widget HTML
   */
  render() {
    const countSolventes = this.maestros.filter((m) => m.esSolvente).length
    const countPendientes = this.maestros.filter((m) => m.estado === 'pendiente').length
    const countVencidas = this.maestros.filter((m) => m.estado === 'vencida').length
    const totalClasesEnRango = this.maestros.reduce((acc, m) => acc + (m.totalSesiones || 0), 0)

    const html = `
      <div class="distribution-card">
        <div class="admin-header-brand mb-4">
          <div class="admin-header-icon-wrapper" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <i class="bi bi-person-check-fill"></i>
          </div>
          <div class="admin-header-title-section">
            <h3 style="margin: 0; font-size: 1.3rem; font-weight: 800; letter-spacing: -0.02em;">Balance de Asistencia & Solvencia Docente ${InfoTooltip('cumplimiento_sesiones')}</h3>
            <p class="subtitle" style="margin: 0.25rem 0 0; color: #6b7280; font-size: 0.85rem;">
              Fuente canónica de clases programadas vs asistencia registrada en el ciclo lectivo
            </p>
          </div>
        </div>

        <!-- Filter Toolbar -->
        <div class="admin-toolbar-dense">
          <div class="premium-select-container">
            <i class="bi bi-calendar3"></i>
            <select id="selectRangoFechas" class="premium-select">
              <option value="semana_actual" ${this.currentRango === 'semana_actual' ? 'selected' : ''}>Esta Semana (${this.customDates.desde} a ${this.customDates.hasta})</option>
              <option value="ultimas_2_semanas" ${this.currentRango === 'ultimas_2_semanas' ? 'selected' : ''}>Últimas 2 Semanas</option>
              <option value="mes_actual" ${this.currentRango === 'mes_actual' ? 'selected' : ''}>Mes en Curso</option>
            </select>
          </div>

          <div class="premium-select-container">
            <i class="bi bi-funnel"></i>
            <select id="filterEstado" class="premium-select">
              <option value="">Todos los Estados (${this.maestros.length})</option>
              <option value="solvente" ${this.currentFilter.estado === 'solvente' ? 'selected' : ''}>Solventes (${countSolventes})</option>
              <option value="pendiente" ${this.currentFilter.estado === 'pendiente' ? 'selected' : ''}>Con Pendientes (${countPendientes})</option>
              <option value="vencida" ${this.currentFilter.estado === 'vencida' ? 'selected' : ''}>Con Vencidas (${countVencidas})</option>
            </select>
          </div>

          <button id="btnRefresh" class="btn-premium-action btn-premium-secondary ms-auto">
            <i class="bi bi-arrow-clockwise"></i> Actualizar
          </button>
          <button id="btnGotoNotificaciones" class="btn-premium-action btn-premium-primary ms-2" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border: none; color: white;">
            <i class="bi bi-bell-fill animate-bell"></i> Centro de Actividad
          </button>
        </div>

        <!-- Stats Overview Cards -->
        <div class="metrics-grid mb-4">
          <div class="stat-card success" style="padding: 1rem 1.25rem;">
            <div class="stat-value" style="font-size: 1.75rem; color: #10b981;">${countSolventes}</div>
            <div class="stat-label" style="font-size: 0.72rem; margin-bottom: 0;">SOLVENTES PARA NÓMINA ${InfoTooltip('cumplimiento')}</div>
          </div>
          <div class="stat-card warning" style="padding: 1rem 1.25rem; border-left-color: #f97316; background: linear-gradient(135deg, rgba(249, 115, 22, 0.03) 0%, rgba(245, 158, 11, 0.03) 100%);">
            <div class="stat-value" style="font-size: 1.75rem; color: #f97316;">${countPendientes}</div>
            <div class="stat-label" style="font-size: 0.72rem; margin-bottom: 0;">CON PENDIENTES (&le; 7 DÍAS) ${InfoTooltip('cumplimiento')}</div>
          </div>
          <div class="stat-card alert" style="padding: 1rem 1.25rem; border-left-color: #ef4444;">
            <div class="stat-value" style="font-size: 1.75rem; color: #ef4444;">${countVencidas}</div>
            <div class="stat-label" style="font-size: 0.72rem; margin-bottom: 0;">CON VENCIDAS (&gt; 7 DÍAS) ${InfoTooltip('cumplimiento')}</div>
          </div>
          <div class="stat-card" style="padding: 1rem 1.25rem; border-left-color: #3b82f6;">
            <div class="stat-value" style="font-size: 1.75rem; color: #3b82f6;">${totalClasesEnRango}</div>
            <div class="stat-label" style="font-size: 0.72rem; margin-bottom: 0;">CLASES PROGRAMADAS EN RANGO</div>
          </div>
        </div>

        <!-- Data Table Container -->
        <div class="premium-table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th style="width: 36%; min-width: 240px;">Maestro & Especialidad</th>
                <th style="width: 15%; text-align: center;">Solvencia ${InfoTooltip('cumplimiento')}</th>
                <th style="width: 13%; text-align: center;">Pendientes (&le;7d)</th>
                <th style="width: 13%; text-align: center;">Vencidas (&gt;7d)</th>
                <th style="width: 13%; text-align: center;">Registradas</th>
                <th style="width: 10%; text-align: center;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${
                this.filteredMaestros.length === 0
                  ? '<tr><td colspan="6" class="premium-no-data"><i class="bi bi-inbox fs-4 d-block mb-2 text-secondary"></i>No hay maestros que coincidan con los filtros</td></tr>'
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
    const config = maestro.statusConfig || this.getStatusConfig(maestro.estado)
    const especialidad = maestro.maestros?.especialidad || 'Cátedra Instrumental'
    const nombre = maestro.maestros?.nombre_completo || 'Maestro'
    const totalClases = maestro.totalSesiones || 0

    return `
      <tr>
        <td style="width: 36%;">
          <div style="display: flex; flex-direction: column; gap: 0.15rem;">
            <div style="font-weight: 750; font-size: 0.95rem; color: var(--bs-body-color);">${nombre}</div>
            <div style="font-size: 0.78rem; color: #8b949e; display: flex; align-items: center; gap: 0.4rem;">
              <span><i class="bi bi-music-note-beamed"></i> ${especialidad}</span>
              ${totalClases > 0 ? `<span class="badge" style="background: rgba(255,255,255,0.06); font-size: 0.7rem; font-weight: normal;">${totalClases} programadas</span>` : ''}
            </div>
          </div>
        </td>
        <td style="text-align: center; width: 15%;">
          <span class="status-badge" style="background-color: ${config.color}; font-size: 0.72rem; padding: 0.35rem 0.75rem; letter-spacing: 0.04em;">
            <i class="bi ${config.icon} me-1"></i> ${config.label}
          </span>
        </td>
        <td style="text-align: center; width: 13%;">
          ${maestro.pendingCount > 0 
            ? `<span class="badge" style="background: rgba(249, 115, 22, 0.15); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.3); font-size: 0.8rem; font-weight: 700; padding: 0.35rem 0.6rem;">${maestro.pendingCount} pendientes</span>` 
            : '<span style="color: #6b7280; font-size: 0.85rem;">0</span>'}
        </td>
        <td style="text-align: center; width: 13%;">
          ${maestro.vencidasCount > 0 
            ? `<span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 0.8rem; font-weight: 700; padding: 0.35rem 0.6rem;">${maestro.vencidasCount} vencidas</span>` 
            : '<span style="color: #6b7280; font-size: 0.85rem;">0</span>'}
        </td>
        <td style="text-align: center; width: 13%; color: #10b981; font-weight: 700; font-size: 0.9rem;">
          ${maestro.registradas}
        </td>
        <td style="text-align: center; width: 10%; white-space: nowrap;">
          <div style="display: flex; gap: 0.4rem; justify-content: center; align-items: center;">
            <button class="btn-action-icon btn-action-success-light btn-contactar" data-maestro-id="${maestro.maestro_id}" title="Enviar recordatorio por WhatsApp">
              <i class="bi bi-whatsapp"></i>
            </button>
            <button class="btn-action-icon btn-action-primary-light btn-detalle" data-maestro-id="${maestro.maestro_id}" title="Ver detalle por clase">
              <i class="bi bi-eye-fill"></i>
            </button>
          </div>
        </td>
      </tr>
    `
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    attachInfoTooltipEvents(this.container)

    const selectRangoFechas = document.getElementById('selectRangoFechas')
    const filterEstado = document.getElementById('filterEstado')
    const btnRefresh = document.getElementById('btnRefresh')

    this._selectRangoHandler = async (e) => {
      this.currentRango = e.target.value
      await this.loadData()
      this.render()
      this.attachEventListeners()
    }

    this._filterEstadoHandler = (e) => {
      this.applyFilter({ estado: e.target.value || null })
    }

    this._btnRefreshHandler = () => {
      this.init()
    }

    selectRangoFechas?.addEventListener('change', this._selectRangoHandler)
    filterEstado?.addEventListener('change', this._filterEstadoHandler)
    btnRefresh?.addEventListener('click', this._btnRefreshHandler)

    const btnGotoNotificaciones = document.getElementById('btnGotoNotificaciones')
    this._btnGotoNotificacionesHandler = () => {
      import('../../../core/router/router.js').then(({ router }) => {
        router.navigate('admin-notificaciones')
      })
    }
    btnGotoNotificaciones?.addEventListener('click', this._btnGotoNotificacionesHandler)

    this._contactarHandlers = []
    this._detalleHandlers = []

    this.container.querySelectorAll('.btn-contactar').forEach((btn) => {
      const handler = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const button = e.target.closest('.btn-contactar')
        const maestroId = button.dataset.maestroId
        this.onContactarMaestro(maestroId)
      }
      this._contactarHandlers.push({ btn, handler })
      btn.addEventListener('click', handler)
    })

    this.container.querySelectorAll('.btn-detalle').forEach((btn) => {
      const handler = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const button = e.target.closest('.btn-detalle')
        const maestroId = button.dataset.maestroId
        this.onVerDetalle(maestroId)
      }
      this._detalleHandlers.push({ btn, handler })
      btn.addEventListener('click', handler)
    })
  }

  /**
   * Open WhatsApp modal for a maestro
   */
  onContactarMaestro(maestroId) {
    import('../../../core/router/router.js').then(({ router }) => {
      router.navigate('admin-maestro-detalle', { id: maestroId, autoOpenWhatsApp: true })
    })
  }

  /**
   * Navigate to Maestro Detalle view
   */
  onVerDetalle(maestroId) {
    import('../../../core/router/router.js').then(({ router }) => {
      router.navigate('admin-maestro-detalle', { id: maestroId })
    })
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    const selectRangoFechas = document.getElementById('selectRangoFechas')
    const filterEstado = document.getElementById('filterEstado')
    const btnRefresh = document.getElementById('btnRefresh')
    const btnGotoNotificaciones = document.getElementById('btnGotoNotificaciones')

    if (selectRangoFechas && this._selectRangoHandler) {
      selectRangoFechas.removeEventListener('change', this._selectRangoHandler)
    }
    if (filterEstado && this._filterEstadoHandler) {
      filterEstado.removeEventListener('change', this._filterEstadoHandler)
    }
    if (btnRefresh && this._btnRefreshHandler) {
      btnRefresh.removeEventListener('click', this._btnRefreshHandler)
    }
    if (btnGotoNotificaciones && this._btnGotoNotificacionesHandler) {
      btnGotoNotificaciones.removeEventListener('click', this._btnGotoNotificacionesHandler)
    }

    if (this._contactarHandlers) {
      this._contactarHandlers.forEach(({ btn, handler }) => {
        btn.removeEventListener('click', handler)
      })
      this._contactarHandlers = []
    }

    if (this._detalleHandlers) {
      this._detalleHandlers.forEach(({ btn, handler }) => {
        btn.removeEventListener('click', handler)
      })
      this._detalleHandlers = []
    }
  }
}

export default CumplimientoMaestrosWidget
