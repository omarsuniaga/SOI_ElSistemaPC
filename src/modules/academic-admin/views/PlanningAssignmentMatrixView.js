import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  getPlanningAssignmentMatrix,
  listAssignableRoutes,
  updateClassRouteAssignment,
} from '../api/academicAdminApi.js'

const escapeHTML = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char])

function ensureStyles() {
  if (document.getElementById('acm-assignment-matrix-styles')) return

  const style = document.createElement('style')
  style.id = 'acm-assignment-matrix-styles'
  style.textContent = `
    .acm-matrix-shell { display:flex; flex-direction:column; gap:1rem; }
    .acm-matrix-hero,
    .acm-matrix-kpi,
    .acm-matrix-note,
    .acm-matrix-table {
      background: var(--pm-surface);
      color: var(--pm-text);
      border: 1px solid var(--pm-border);
      border-radius: 16px;
    }
    .acm-matrix-hero,
    .acm-matrix-note,
    .acm-matrix-table { box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06); }
    [data-bs-theme="dark"] .acm-matrix-hero,
    [data-bs-theme="dark"] .acm-matrix-note,
    [data-bs-theme="dark"] .acm-matrix-table { box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); }
    .acm-matrix-hero { padding:1.25rem; }
    .acm-matrix-note { padding:0.875rem 1rem; background:var(--pm-surface-2); }
    .acm-matrix-kpis { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:1rem; }
    .acm-matrix-kpi { padding:1rem; }
    .acm-matrix-kpi-value { font-size:1.75rem; font-weight:700; line-height:1; }
    .acm-matrix-kpi-label { font-size:0.85rem; color:var(--bs-secondary-color); margin-top:0.35rem; }
    .acm-matrix-table .table { margin-bottom:0; }
    .acm-matrix-table thead th {
      background: var(--pm-surface-2);
      color: var(--pm-text);
      border-bottom-color: var(--pm-border);
      white-space: nowrap;
    }
    .acm-matrix-table td { background: var(--pm-surface); color: var(--pm-text); border-color: var(--pm-border); }
    .acm-route-meta { font-size:0.8rem; color:var(--bs-secondary-color); }
    .acm-matrix-actions { display:flex; justify-content:flex-end; }
    .acm-modal-help { font-size:0.85rem; color:var(--bs-secondary-color); margin-top:0.5rem; }
    @media (max-width: 992px) {
      .acm-matrix-kpis { grid-template-columns:repeat(2, minmax(0,1fr)); }
    }
    @media (max-width: 576px) {
      .acm-matrix-kpis { grid-template-columns:1fr; }
      .acm-matrix-hero { padding:1rem; }
      .acm-matrix-kpi { padding:0.875rem; }
      .acm-matrix-actions .btn { width:100%; }
    }
  `
  document.head.appendChild(style)
}

export async function renderPlanningAssignmentMatrixView(container) {
  ensureStyles()
  await renderMatrix(container)
}

async function renderMatrix(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="d-flex justify-content-center align-items-center" style="min-height:220px;">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
    </div>
  `

  try {
    const rows = await getPlanningAssignmentMatrix()
    const total = rows.length
    const assigned = rows.filter((row) => row.ruta_nombre).length
    const missingGuide = total - assigned
    const withPlan = rows.filter((row) => row.tiene_plan).length

    container.innerHTML = `
      <div class="page-container">
        <div class="acm-matrix-shell">
          <section class="acm-matrix-hero">
            <div class="d-flex align-items-start justify-content-between gap-3 flex-wrap">
              <div class="d-flex align-items-center gap-3">
                <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
                  <i class="bi bi-diagram-3 fs-4"></i>
                </div>
                <div>
                  <h1 class="page-title mb-0">Matriz ACM de Asignación</h1>
                  <p class="text-muted small mb-0">Clase, maestro y guía/ruta asignada desde ACM</p>
                </div>
              </div>
            </div>
          </section>

          <section class="acm-matrix-kpis">
            <article class="acm-matrix-kpi">
              <div class="acm-matrix-kpi-value text-primary">${total}</div>
              <div class="acm-matrix-kpi-label">Clases activas</div>
            </article>
            <article class="acm-matrix-kpi">
              <div class="acm-matrix-kpi-value text-success">${assigned}</div>
              <div class="acm-matrix-kpi-label">Con guía asignada</div>
            </article>
            <article class="acm-matrix-kpi">
              <div class="acm-matrix-kpi-value text-danger">${missingGuide}</div>
              <div class="acm-matrix-kpi-label">Sin guía asignada</div>
            </article>
            <article class="acm-matrix-kpi">
              <div class="acm-matrix-kpi-value text-info">${withPlan}</div>
              <div class="acm-matrix-kpi-label">Con plan docente</div>
            </article>
          </section>

          <section class="acm-matrix-note">
            <i class="bi bi-info-circle me-2"></i>
            ACM asigna la guía institucional a la clase; el Portal Maestro la consulta para planificar y ejecutar.
          </section>

          <section class="acm-matrix-table">
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Clase</th>
                    <th>Maestro</th>
                    <th>Instrumento</th>
                    <th>Guía / Ruta ACM</th>
                    <th>Estado Ruta</th>
                    <th>Plan docente</th>
                    <th class="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows
                    .map(
                      (row) => `
                    <tr>
                      <td>
                        <div class="fw-semibold">${escapeHTML(row.clase_nombre)}</div>
                        <div class="acm-route-meta">${escapeHTML(row.clase_id)}</div>
                      </td>
                      <td>${escapeHTML(row.maestro_nombre || 'Sin asignar')}</td>
                      <td>${escapeHTML(row.instrumento || 'General')}</td>
                      <td>
                        ${
                          row.ruta_nombre
                            ? `<div class="fw-semibold">${escapeHTML(row.ruta_nombre)}</div>
                               <div class="acm-route-meta">${escapeHTML(row.ruta_tipo || 'Ruta')}</div>`
                            : '<span class="badge bg-danger-subtle text-danger-emphasis border">Sin guía ACM</span>'
                        }
                      </td>
                      <td>
                        ${
                          row.ruta_nombre
                            ? `<span class="badge ${row.ruta_estado === 'activa' ? 'bg-success' : 'bg-warning text-dark'}">${escapeHTML(row.ruta_estado || 'sin estado')}</span>`
                            : '—'
                        }
                      </td>
                      <td>
                        ${
                          row.tiene_plan
                            ? `<span class="badge bg-info-subtle text-info-emphasis border">${escapeHTML(row.plan_estado || 'con plan')}</span>`
                            : '<span class="badge bg-secondary-subtle text-secondary-emphasis border">Sin plan</span>'
                        }
                      </td>
                      <td class="text-end">
                        <div class="acm-matrix-actions">
                          <button class="btn btn-sm btn-outline-primary" data-action="assign-route" data-clase-id="${escapeHTML(
                            row.clase_id,
                          )}">
                            <i class="bi bi-pencil-square me-1"></i>Reasignar guía
                          </button>
                        </div>
                      </td>
                    </tr>`,
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    `

    container.querySelectorAll('[data-action="assign-route"]').forEach((button) => {
      button.addEventListener('click', async () => {
        const row = rows.find((item) => item.clase_id === button.dataset.claseId)
        if (!row) return
        await openAssignmentModal(row, container)
      })
    })
  } catch (error) {
    container.innerHTML = `
      <div class="page-container">
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Error cargando la matriz ACM: ${escapeHTML(error.message)}
        </div>
      </div>
    `
  }
}

async function openAssignmentModal(row, container) {
  const routes = await listAssignableRoutes()
  const compatibleRoutes = routes.filter(
    (route) => !route.instrumento || route.instrumento === row.instrumento || row.instrumento === 'General',
  )
  const options = compatibleRoutes.length ? compatibleRoutes : routes

  AppModal.open({
    title: `Reasignar guía · ${row.clase_nombre}`,
    saveText: 'Guardar asignación',
    size: 'lg',
    body: `
      <div class="row g-3">
        <div class="col-12">
          <div class="rounded border p-3" style="background:var(--pm-surface-2); border-color:var(--pm-border);">
            <div class="fw-semibold">${escapeHTML(row.clase_nombre)}</div>
            <div class="small text-muted">${escapeHTML(row.maestro_nombre || 'Sin asignar')} · ${escapeHTML(row.instrumento || 'General')}</div>
          </div>
        </div>
        <div class="col-12">
          <label class="form-label">Guía / Ruta ACM</label>
          <select class="form-select" id="acm-route-select">
            <option value="">Sin guía asignada</option>
            ${options
              .map(
                (route) => `<option value="${escapeHTML(route.id)}" ${route.id === row.ruta_id ? 'selected' : ''}>
                  ${escapeHTML(route.nombre)} · ${escapeHTML(route.instrumento || 'General')} · ${escapeHTML(
                    route.nivel || 'Sin nivel',
                  )}
                </option>`,
              )
              .join('')}
          </select>
          <div class="acm-modal-help">
            ACM define qué guía institucional consume el maestro para esta clase.
          </div>
        </div>
      </div>
    `,
    onSave: async (modalBody) => {
      const rutaId = modalBody.querySelector('#acm-route-select')?.value || null
      await updateClassRouteAssignment(row.clase_id, rutaId)
      AppToast.success('Guía/ruta actualizada desde ACM')
      renderMatrix(container)
      return true
    },
  })
}
