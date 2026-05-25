/**
 * Conflict Report and Metrics component.
 * Visualizes the optimization results, including scheduling success score,
 * teacher workload, classroom utilization, and diagnostic errors for unscheduled classes.
 */
export function createConflictReport({
  noAsignadas = [],
  metricas = {},
  teachers = [],
  classrooms = []
}) {
  const successRate = metricas.score ?? 0;
  let scoreColorClass = 'text-danger';
  let scoreProgressColor = '#ef4444';
  if (successRate >= 90) {
    scoreColorClass = 'text-success';
    scoreProgressColor = '#10b981';
  } else if (successRate >= 60) {
    scoreColorClass = 'text-warning';
    scoreProgressColor = '#f59e0b';
  }

  // 1. Unscheduled classes list
  const unscheduledHtml = noAsignadas.length > 0
    ? noAsignadas.map(c => `
        <div class="hb-conflict-item" style="border-left: 4px solid var(--hb-danger); background: var(--hb-danger-light); padding: 10px 14px; border-radius: 4px; margin-bottom: 8px; font-size: 0.85rem; color: var(--hb-text);">
          <div style="font-weight: 700; display: flex; align-items: center; gap: 6px;">
            <i class="bi bi-exclamation-triangle-fill text-danger"></i>
            <span>${c.nombre}</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--hb-text-muted); margin-top: 2px;">
            ⚠️ Razón: ${c.razon}
          </div>
        </div>
      `).join('')
    : `
      <div style="text-align: center; padding: 1.25rem; border: 1px dashed var(--hb-border); border-radius: 12px; background: var(--hb-success-light); color: var(--hb-success); font-size: 0.85rem; font-weight: 650; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <i class="bi bi-shield-check-fill" style="font-size: 1.25rem;"></i>
        <span>Optimización perfecta: 100% de clases programadas exitosamente.</span>
      </div>
    `;

  // 2. Classrooms utilization bars
  const salonOccupancy = metricas.ocupacionSalones || {};
  const salonsHtml = Object.keys(salonOccupancy).map(id => {
    const s = salonOccupancy[id];
    const pct = s.porcentaje || 0;
    let barColor = 'bg-primary';
    if (pct > 75) barColor = 'bg-success';
    else if (pct < 20) barColor = 'bg-warning';

    return `
      <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 3px;">
          <span style="font-weight: 600; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 180px;">🏫 ${s.nombre}</span>
          <span style="font-weight: 700; color: var(--hb-text-muted);">${pct}%</span>
        </div>
        <div class="progress" style="height: 8px; border-radius: 20px; background: var(--hb-gray-200);">
          <div class="progress-bar ${barColor}" role="progressbar" style="width: ${pct}%; border-radius: 20px;" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
    `;
  }).join('');

  // 3. Teachers weekly load
  const cargaMaestros = metricas.cargaMaestros || {};
  const teachersLoadHtml = Object.keys(cargaMaestros).map(id => {
    const m = cargaMaestros[id];
    const hrs = m.horas || 0;
    
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed var(--hb-border); font-size: 0.8rem;">
        <span style="font-weight: 600; color: var(--hb-text);">👤 ${m.nombre}</span>
        <span class="badge bg-secondary-subtle text-secondary" style="font-weight: 700; font-size: 0.75rem; border-radius: 6px;">
          ${hrs} hrs / sem
        </span>
      </div>
    `;
  }).join('');

  return `
    <div class="hb-card" style="padding: 1.25rem;">
      <h3 class="hb-card-title">
        <i class="bi bi-bar-chart-line-fill"></i>
        <span>Resultados y Métricas</span>
      </h3>

      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 1.5rem; background: var(--hb-gray-100); padding: 12px; border-radius: 12px; border: 1px solid var(--hb-border);">
        <div style="position: relative; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.05); font-weight: 800; font-size: 1.2rem; border: 3px solid ${scoreProgressColor};">
          ${successRate}%
        </div>
        <div>
          <div style="font-size: 0.75rem; color: var(--hb-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Efectividad de Asignación</div>
          <div style="font-weight: 750; font-size: 1rem; color: var(--hb-text);">
            ${metricas.clasesAsignadas} de ${metricas.totalClases} clases
          </div>
        </div>
      </div>

      <ul class="nav nav-tabs hb-metrics-tabs" id="hbMetricsTabs" role="tablist" style="margin-bottom: 1rem; border-bottom: 1px solid var(--hb-border);">
        <li class="nav-item" role="presentation" style="flex: 1;">
          <button class="nav-link active" id="hb-tab-conflicts" data-bs-toggle="tab" data-bs-target="#hb-panel-conflicts" type="button" role="tab" style="width: 100%; font-size: 0.8rem; font-weight: 700; text-align: center;">
            No Asignadas (${noAsignadas.length})
          </button>
        </li>
        <li class="nav-item" role="presentation" style="flex: 1;">
          <button class="nav-link" id="hb-tab-classrooms" data-bs-toggle="tab" data-bs-target="#hb-panel-classrooms" type="button" role="tab" style="width: 100%; font-size: 0.8rem; font-weight: 700; text-align: center;">
            Uso Salones
          </button>
        </li>
        <li class="nav-item" role="presentation" style="flex: 1;">
          <button class="nav-link" id="hb-tab-teachers" data-bs-toggle="tab" data-bs-target="#hb-panel-teachers" type="button" role="tab" style="width: 100%; font-size: 0.8rem; font-weight: 700; text-align: center;">
            Carga Docente
          </button>
        </li>
      </ul>

      <div class="tab-content" id="hbMetricsTabsContent" style="max-height: 250px; overflow-y: auto; padding-right: 4px;">
        <div class="tab-pane fade show active" id="hb-panel-conflicts" role="tabpanel" aria-labelledby="hb-tab-conflicts">
          ${unscheduledHtml}
        </div>
        <div class="tab-pane fade" id="hb-panel-classrooms" role="tabpanel" aria-labelledby="hb-tab-classrooms">
          ${salonsHtml || '<p style="font-size:0.8rem;color:var(--hb-text-muted);">Carga salones para ver ocupación.</p>'}
        </div>
        <div class="tab-pane fade" id="hb-panel-teachers" role="tabpanel" aria-labelledby="hb-tab-teachers">
          ${teachersLoadHtml || '<p style="font-size:0.8rem;color:var(--hb-text-muted);">Carga maestros para ver carga.</p>'}
        </div>
      </div>
    </div>
  `;
}
