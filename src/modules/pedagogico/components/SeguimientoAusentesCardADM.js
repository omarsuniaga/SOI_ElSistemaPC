/**
 * T1b.4 — SeguimientoAusentesCardADM KPI Card Component
 * Displays read-only KPI cards for ADM dashboard structured in 2 distinct semantic blocks:
 * 1. Escalamiento de Ausentismo (Nivel 1, Nivel 2, Nivel 3)
 * 2. Retención, Contactabilidad & Alertas (Contactados <72h, Sin Contacto, Retenciones Activas / Levantadas)
 *
 * Implements VD1 (3+3 layout), VD2 (Level 3 hierarchy & urgency), VD3 (data-driven semantic colors, no false greens/reds on zero),
 * VD4 (subtle icon badges), VD8 (prominent 'Sin Contacto' metric), and VD9 (subtle card contrast & borders).
 */

/**
 * Render KPI cards for the ADM dashboard
 * @param {Object} data - Metrics data object
 * @returns {string} HTML string
 */
export function renderSeguimientoAusentesCardADM(data = null) {
  const defaultData = {
    nivel1: 0,
    nivel2: 0,
    nivel3: 0,
    contactados72h: 0,
    totalContactos: 0,
    sinContacto: 0,
    retencionesActivas: 0,
    retencionesLevantadas: 0,
  }

  const stats = data || defaultData

  const totalAusentes = Number(stats.totalContactos || 0)
  const contactados72h = Number(stats.contactados72h || 0)
  const nivel1 = Number(stats.nivel1 || 0)
  const nivel2 = Number(stats.nivel2 || 0)
  const nivel3 = Number(stats.nivel3 || 0)
  const sinContacto = Number(stats.sinContacto || 0)
  const retencionesActivas = Number(stats.retencionesActivas || 0)
  const retencionesLevantadas = Number(stats.retencionesLevantadas || 0)

  const contactadosPercentage =
    totalAusentes > 0
      ? Math.min(100, Math.round((contactados72h / totalAusentes) * 100))
      : 0

  // VD3: Data-driven semantic styling (no fixed green on 0%, no fixed red alarm on 0 retentions)
  // Contactados: >= 70% success, 40-69% warning, >0% danger, 0% secondary/neutral
  const contactadosBadgeClass =
    contactadosPercentage >= 70
      ? 'bg-success-subtle text-success-emphasis'
      : contactadosPercentage >= 40
        ? 'bg-warning-subtle text-warning-emphasis'
        : contactadosPercentage > 0
          ? 'bg-danger-subtle text-danger-emphasis'
          : 'bg-body-secondary text-body-secondary'

  const contactadosIcon =
    contactadosPercentage >= 70
      ? 'bi-check-circle'
      : contactadosPercentage >= 40
        ? 'bi-clock-history'
        : 'bi-exclamation-circle'

  // Retenciones Activas: > 0 is alarming, 0 is calm neutral
  const retActivasBadgeClass =
    retencionesActivas > 0
      ? 'bg-danger-subtle text-danger-emphasis'
      : 'bg-body-secondary text-body-secondary'

  const retActivasIcon =
    retencionesActivas > 0
      ? 'bi-shield-lock'
      : 'bi-shield-check'

  // Retenciones Levantadas: > 0 success, 0 neutral
  const retLevantadasBadgeClass =
    retencionesLevantadas > 0
      ? 'bg-success-subtle text-success-emphasis'
      : 'bg-body-secondary text-body-secondary'

  // Sin Contacto: > 0 warning/danger, 0 success
  const sinContactoBadgeClass =
    sinContacto > 0
      ? 'bg-danger-subtle text-danger-emphasis'
      : 'bg-success-subtle text-success-emphasis'

  // Nivel 3 acento urgente (VD2)
  const hasUrgentNivel3 = nivel3 > 0
  const nivel3CardClass = hasUrgentNivel3
    ? 'card border-0 shadow-sm ausentismo-kpi-card kpi-nivel-3 has-urgent-cases'
    : 'card border-0 shadow-sm ausentismo-kpi-card kpi-nivel-3'

  return `
    <div class="d-flex flex-column gap-4">
      <!-- Bloque 1: Escalamiento de Ausentismo (VD1) -->
      <div>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="text-uppercase small fw-bold tracking-wide text-body-secondary">
            <i class="bi bi-bar-chart-steps me-1 text-primary"></i>Escalamiento de Casos
          </span>
          <span class="text-muted small">Acumulado del período</span>
        </div>
        <div class="row g-3">
          <!-- Nivel 1 Card -->
          <div class="col-12 col-md-4">
            <div class="card border-0 shadow-sm ausentismo-kpi-card" data-kpi-card data-kpi="nivel-1">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <p class="text-muted small mb-1">Nivel 1</p>
                    <div class="h4 mb-0 fw-bold">${nivel1}</div>
                    <small class="text-muted">Aviso preventivo</small>
                  </div>
                  <div class="ausentismo-icon-badge bg-warning-subtle text-warning-emphasis">
                    <i class="bi bi-exclamation-circle"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Nivel 2 Card -->
          <div class="col-12 col-md-4">
            <div class="card border-0 shadow-sm ausentismo-kpi-card" data-kpi-card data-kpi="nivel-2">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <p class="text-muted small mb-1">Nivel 2</p>
                    <div class="h4 mb-0 fw-bold">${nivel2}</div>
                    <small class="text-muted">Comunicación formal</small>
                  </div>
                  <div class="ausentismo-icon-badge bg-danger-subtle text-danger-emphasis">
                    <i class="bi bi-exclamation-triangle"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Nivel 3 Card (VD2 Urgente) -->
          <div class="col-12 col-md-4">
            <div class="${nivel3CardClass}" data-kpi-card data-kpi="nivel-3">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <div class="d-flex align-items-center gap-1 mb-1">
                      <p class="text-muted small mb-0">Nivel 3</p>
                      ${hasUrgentNivel3 ? '<span class="badge bg-danger text-white ms-1" style="font-size: 0.65rem;">ACCIÓN</span>' : ''}
                    </div>
                    <div class="h4 mb-0 fw-bold ${hasUrgentNivel3 ? 'text-danger' : ''}">${nivel3}</div>
                    <small class="text-muted">Retención de instrumento</small>
                  </div>
                  <div class="ausentismo-icon-badge ${hasUrgentNivel3 ? 'bg-danger text-white' : 'bg-body-secondary text-body-secondary'}">
                    <i class="bi bi-exclamation-circle-fill"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bloque 2: Contactabilidad, Alertas y Retenciones (VD1, VD8) -->
      <div>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="text-uppercase small fw-bold tracking-wide text-body-secondary">
            <i class="bi bi-telephone-inbound me-1 text-info"></i>Retención & Gestión de Contacto
          </span>
          <span class="text-muted small">Indicadores de gestión</span>
        </div>
        <div class="row g-3">
          <!-- Contactados <72h Card -->
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="card border-0 shadow-sm ausentismo-kpi-card" data-kpi-card data-kpi="contactados">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <p class="text-muted small mb-1">Contactados &lt;72h</p>
                    <div class="h4 mb-0 fw-bold">${contactadosPercentage}%</div>
                    <small class="text-muted">${contactados72h} de ${totalAusentes}</small>
                  </div>
                  <div class="ausentismo-icon-badge ${contactadosBadgeClass}">
                    <i class="bi ${contactadosIcon}"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sin Contacto Card (VD8 Destacado) -->
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="card border-0 shadow-sm ausentismo-kpi-card" data-kpi-card data-kpi="sin-contacto">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <p class="text-muted small mb-1">Sin Contacto</p>
                    <div class="h4 mb-0 fw-bold ${sinContacto > 0 ? 'text-danger' : ''}">${sinContacto}</div>
                    <small class="text-muted">${sinContacto > 0 ? 'Requiere actualizar tlf' : 'Datos completos'}</small>
                  </div>
                  <div class="ausentismo-icon-badge ${sinContactoBadgeClass}">
                    <i class="bi ${sinContacto > 0 ? 'bi-telephone-x' : 'bi-telephone-check'}"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Retenciones Activas Card -->
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="card border-0 shadow-sm ausentismo-kpi-card" data-kpi-card data-kpi="retenciones-activas">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <p class="text-muted small mb-1">Retenciones Activas</p>
                    <div class="h4 mb-0 fw-bold ${retencionesActivas > 0 ? 'text-danger' : ''}">${retencionesActivas}</div>
                    <small class="text-muted">${retencionesActivas > 0 ? 'Pendiente acta' : 'Sin retenciones'}</small>
                  </div>
                  <div class="ausentismo-icon-badge ${retActivasBadgeClass}">
                    <i class="bi ${retActivasIcon}"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Retenciones Levantadas Card -->
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="card border-0 shadow-sm ausentismo-kpi-card" data-kpi-card data-kpi="retenciones-levantadas">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <p class="text-muted small mb-1">Retenciones Levantadas</p>
                    <div class="h4 mb-0 fw-bold">${retencionesLevantadas}</div>
                    <small class="text-muted">Reincorporados</small>
                  </div>
                  <div class="ausentismo-icon-badge ${retLevantadasBadgeClass}">
                    <i class="bi bi-check2-all"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

