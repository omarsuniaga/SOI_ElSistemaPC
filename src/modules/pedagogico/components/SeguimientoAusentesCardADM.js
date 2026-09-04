/**
 * T1b.4 — SeguimientoAusentesCardADM KPI Card Component
 * Displays read-only KPI cards for ADM dashboard
 */

/**
 * Render KPI cards for the ADM dashboard
 * Returns HTML string with 4 cards:
 * 1. Alumnos Nivel 1
 * 2. Alumnos Nivel 2
 * 3. Alumnos Nivel 3
 * 4. % Contactados <72h
 *
 * @param {Object} data - Mock data for testing; real data comes from props
 * @returns {string} HTML
 */
export function renderSeguimientoAusentesCardADM(data = null) {
  // Default data for rendering (used in tests with mocked service)
  const defaultData = {
    nivel1: 0,
    nivel2: 0,
    nivel3: 0,
    contactados72h: 0,
    totalContactos: 0,
    retencionesActivas: 0,
    retencionesLevantadas: 0,
  }

  const stats = data || defaultData

  const contactadosPercentage =
    stats.totalContactos > 0 ? Math.round((stats.contactados72h / stats.totalContactos) * 100) : 0

  return `
    <div class="row g-3">
      <!-- Nivel 1 Card -->
      <div class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm" data-kpi-card data-kpi="nivel-1">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <p class="text-muted small mb-0">Nivel 1</p>
                <h4 class="mb-0">${stats.nivel1 || '0'}</h4>
                <small class="text-muted">Alumnos con aviso</small>
              </div>
              <div class="badge p-3" style="font-size: 1.5rem;background:#b7791f;color:#fff;">
                <i class="bi bi-exclamation-circle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Nivel 2 Card -->
      <div class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm" data-kpi-card data-kpi="nivel-2">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <p class="text-muted small mb-0">Nivel 2</p>
                <h4 class="mb-0">${stats.nivel2 || '0'}</h4>
                <small class="text-muted">Comunicación formal</small>
              </div>
              <div class="badge p-3" style="font-size: 1.5rem;background:#c2410c;color:#fff;">
                <i class="bi bi-exclamation-triangle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Nivel 3 Card -->
      <div class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm" data-kpi-card data-kpi="nivel-3">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <p class="text-muted small mb-0">Nivel 3</p>
                <h4 class="mb-0">${stats.nivel3 || '0'}</h4>
                <small class="text-muted">Retención activa</small>
              </div>
              <div class="badge p-3" style="font-size: 1.5rem;background:#9f1239;color:#fff;">
                <i class="bi bi-exclamation-circle-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contactados <72h Card -->
      <div class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm" data-kpi-card data-kpi="contactados">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <p class="text-muted small mb-0">Contactados <72h</p>
                <h4 class="mb-0">${contactadosPercentage}%</h4>
                <small class="text-muted">${stats.contactados72h || 0} de ${stats.totalContactos || 0}</small>
              </div>
              <div class="badge bg-success text-white p-3" style="font-size: 1.5rem;">
                <i class="bi bi-check-circle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Retenciones Activas Card (optional, extra info) -->
      <div class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm" data-kpi-card data-kpi="retenciones-activas">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <p class="text-muted small mb-0">Retenciones Activas</p>
                <h4 class="mb-0">${stats.retencionesActivas || '0'}</h4>
                <small class="text-muted">En proceso</small>
              </div>
              <div class="badge bg-danger text-white p-3" style="font-size: 1.5rem;">
                <i class="bi bi-shield-lock"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Retenciones Levantadas Card (optional) -->
      <div class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm" data-kpi-card data-kpi="retenciones-levantadas">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <p class="text-muted small mb-0">Retenciones Levantadas</p>
                <h4 class="mb-0">${stats.retencionesLevantadas || '0'}</h4>
                <small class="text-muted">Este período</small>
              </div>
              <div class="badge bg-success text-white p-3" style="font-size: 1.5rem;">
                <i class="bi bi-check2-all"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

/**
 * Component class for KPI cards (for async initialization)
 */
export class SeguimientoAusentesCardADM {
  constructor(options = {}) {
    this.options = options
    this.data = null
  }

  async load() {
    // In real usage, this would fetch data from the service
    // For tests, data is injected via options
    return this.data
  }

  render() {
    return renderSeguimientoAusentesCardADM(this.data)
  }
}
