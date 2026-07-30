import { obtenerCoberturaCurricular } from '../api/planificacionAdapter.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

export async function renderCoberturaCurricularView(container) {
  if (!container) return

  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando métricas de cobertura curricular...</span>
      </div>
    </div>
  `

  try {
    const coberturaData = await obtenerCoberturaCurricular(null)
    _renderUI(container, coberturaData)
  } catch (err) {
    console.error('[CoberturaCurricularView] Error:', err)
    container.innerHTML = `
      <div class="alert alert-danger my-4">
        <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar la cobertura curricular: ${escapeHTML(err.message)}
      </div>
    `
  }
}

function _renderUI(container, data) {
  const clasesList = Array.isArray(data) ? data : data?.clases || []
  const totalClases = clasesList.length
  const clasesConPlan = clasesList.filter(c => c.plan_id || c.tienePlan || c.planificacion).length
  const porcentajeConPlan = totalClases > 0 ? Math.round((clasesConPlan / totalClases) * 100) : 0

  container.innerHTML = `
    <div class="container-fluid px-3 py-3">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 class="fw-bold mb-1"><i class="bi bi-grid-3x3-gap text-primary me-2"></i>Cobertura Curricular e Indicadores</h4>
          <p class="text-muted small mb-0">Auditoría del avance pedagógico y cumplimiento del currículo institucional por clase.</p>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-3 p-3">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-3 bg-primary-subtle text-primary p-3 d-flex align-items-center justify-content-center" style="width:48px; height:48px;">
                <i class="bi bi-easel2 fs-4"></i>
              </div>
              <div>
                <div class="text-muted small fw-semibold text-uppercase">Total de Clases</div>
                <h3 class="fw-bold mb-0">${totalClases}</h3>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-3 p-3">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-3 bg-success-subtle text-success p-3 d-flex align-items-center justify-content-center" style="width:48px; height:48px;">
                <i class="bi bi-journal-check fs-4"></i>
              </div>
              <div>
                <div class="text-muted small fw-semibold text-uppercase">Clases con Plan Didáctico</div>
                <h3 class="fw-bold mb-0">${clasesConPlan} <span class="fs-6 fw-normal text-muted">(${porcentajeConPlan}%)</span></h3>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-3 p-3">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-3 ${porcentajeConPlan >= 80 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} p-3 d-flex align-items-center justify-content-center" style="width:48px; height:48px;">
                <i class="bi bi-graph-up-arrow fs-4"></i>
              </div>
              <div>
                <div class="text-muted small fw-semibold text-uppercase">Cobertura Curricular Media</div>
                <h3 class="fw-bold mb-0">${porcentajeConPlan}%</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Table -->
      <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div class="card-header bg-body-tertiary border-0 fw-bold py-3">
          <i class="bi bi-list-task me-2 text-primary"></i>Detalle de Cobertura por Clase
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Clase / Asignatura</th>
                <th>Maestro Asignado</th>
                <th>Estado del Plan</th>
                <th>Avance Curricular</th>
              </tr>
            </thead>
            <tbody>
              ${clasesList.length === 0 ? `
                <tr><td colspan="4" class="text-center py-4 text-muted">Sin datos de clases disponibles.</td></tr>
              ` : clasesList.map(c => {
                const nombre = c.nombre || c.name || `Clase ${c.id}`
                const maestro = c.maestro_nombre || c.maestro || 'Sin asignar'
                const tienePlan = Boolean(c.plan_id || c.tienePlan || c.planificacion)
                const pct = c.porcentaje || (tienePlan ? 85 : 0)

                return `
                  <tr>
                    <td><strong class="text-body">${escapeHTML(nombre)}</strong></td>
                    <td>${escapeHTML(maestro)}</td>
                    <td>
                      ${tienePlan 
                        ? '<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-lg me-1"></i>Plan Vigente</span>' 
                        : '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle"><i class="bi bi-exclamation-triangle me-1"></i>Sin Plan</span>'}
                    </td>
                    <td style="min-width: 180px;">
                      <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1" style="height: 8px;">
                          <div class="progress-bar ${pct >= 75 ? 'bg-success' : pct >= 40 ? 'bg-primary' : 'bg-danger'}" role="progressbar" style="width: ${pct}%;"></div>
                        </div>
                        <span class="small fw-semibold text-muted" style="min-width: 38px;">${pct}%</span>
                      </div>
                    </td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
}
