import { obtenerKPI, obtenerActivos, obtenerComodatosActivos, obtenerReparaciones } from '../api/inventarioApi.js'
import { estadoVencimiento } from '../domain/comodato.js'
// Stub functions for missing Hermes Tareas API on master branch
async function obtenerTareas() { return { data: [], error: null } }
async function actualizarTarea() { return { data: null, error: null } }

export async function renderDashboardInventarioView(container) {
  const _ac = new AbortController()

  container.innerHTML = '<p class="p-4">Cargando dashboard...</p>'

  const [kpiResult, activosResult, comodatosResult, reparacionesResult, tasksResult] = await Promise.all([
    obtenerKPI(),
    obtenerActivos({ pageSize: 200 }),
    obtenerComodatosActivos(),
    obtenerReparaciones({}),
    obtenerTareas({ departamento: 'LOG' })
  ])

  if (kpiResult.error) {
    container.innerHTML = `<div class="alert alert-danger m-4">Error: ${kpiResult.error.message}</div>`
    return { teardown: () => _ac.abort() }
  }

  const kpi = kpiResult.data
  const activosActivos = (activosResult.data?.data || activosResult.data || [])
  const comodatos = comodatosResult.data || []
  const reparaciones = reparacionesResult.data || []
  const logTasks = tasksResult.data || []

  const resumen = kpi.resumen || kpi
  const distribucion = kpi.distribucion_por_tipo || {}

  // Pie chart data
  const pieColors = [
    '#0d6efd', '#6f42c1', '#d63384', '#fd7e14',
    '#ffc107', '#198754', '#0dcaf0', '#dc3545',
  ]
  const tipoKeys = Object.keys(distribucion)
  const pieSegments = tipoKeys.map((tipo, i) => {
    const pct = resumen.total > 0 ? ((distribucion[tipo] / resumen.total) * 100).toFixed(1) : 0
    return {
      label: tipo,
      count: distribucion[tipo],
      pct,
      color: pieColors[i % pieColors.length],
    }
  })
  const conicGradient = pieSegments.map((s, i) => {
    const start = pieSegments.slice(0, i).reduce((sum, x) => sum + parseFloat(x.pct), 0)
    return `${s.color} ${start}% ${start + parseFloat(s.pct)}%`
  }).join(', ')

  // Próximos a vencer
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const proximosVencer = (comodatos || [])
    .filter(c => c.estado === 'activo' && c.fecha_vencimiento)
    .map(c => ({ ...c, _vencimiento: estadoVencimiento(c) }))
    .filter(c => !c._vencimiento.label.startsWith('Sin'))
    .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))
    .slice(0, 10)

  const proxRows = proximosVencer.map(c => `
    <tr>
      <td class="font-monospace small">${c.activo_id || '—'}</td>
      <td>${c.alumno_nombre || '—'}</td>
      <td>${new Date(c.fecha_vencimiento).toLocaleDateString('es-DO')}</td>
      <td><span class="${c._vencimiento.clase}">${c._vencimiento.label}</span></td>
    </tr>
  `).join('')

  // Últimas reparaciones
  const ultimasReps = [...reparaciones]
    .sort((a, b) => new Date(b.created_at || b.fecha_ingreso) - new Date(a.created_at || a.fecha_ingreso))
    .slice(0, 10)

  const repRows = ultimasReps.map(r => {
    const estadoBadge = {
      recibido: 'badge bg-secondary',
      en_reparacion: 'badge bg-warning text-dark',
      finalizado: 'badge bg-info text-dark',
      entregado: 'badge bg-success',
    }[r.estado] || 'badge bg-secondary'
    return `
      <tr>
        <td class="font-monospace small">${r.activo_id || '—'}</td>
        <td>${r.descripcion ? r.descripcion.substring(0, 40) : '—'}</td>
        <td>${r.tallerista_nombre || '—'}</td>
        <td><span class="${estadoBadge}">${r.estado}</span></td>
        <td>${new Date(r.fecha_ingreso).toLocaleDateString('es-DO')}</td>
      </tr>
    `
  }).join('')

  container.innerHTML = `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0"><i class="bi bi-speedometer2 me-2"></i>Dashboard de Inventario</h4>
      </div>

      <div class="row g-3 mb-4" id="kpi-row">
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-primary h-100" id="kpi-total">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">Total</h6>
              <span class="kpi-value fs-2 fw-bold">${resumen.total}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-success h-100" id="kpi-disponibles">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">Disponibles</h6>
              <span class="kpi-value fs-2 fw-bold">${resumen.disponibles}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-info h-100" id="kpi-en-uso">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">En uso</h6>
              <span class="kpi-value fs-2 fw-bold">${resumen.en_uso}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-warning h-100" id="kpi-ociosos">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">Ociosos</h6>
              <span class="kpi-value fs-2 fw-bold">${resumen.ociosos}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-danger h-100" id="kpi-en-reparacion">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">En reparación</h6>
              <span class="kpi-value fs-2 fw-bold">${resumen.en_reparacion}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-dark h-100" id="kpi-de-baja">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">De baja</h6>
              <span class="kpi-value fs-2 fw-bold">${resumen.de_baja}</span>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-xl-3">
          <div class="card border-primary h-100" id="kpi-valor-total">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase text-muted">Valor total</h6>
              <span class="kpi-value fs-4 fw-bold text-primary">RD$ ${(resumen.valor_total || 0).toLocaleString('es-DO')}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">Distribución por tipo</div>
            <div class="card-body d-flex align-items-center justify-content-center">
              <div class="text-center">
                ${pieSegments.length > 0 ? `
                <div id="pie-chart" class="mx-auto mb-3"
                  style="width:180px;height:180px;border-radius:50%;
                  background: conic-gradient(${conicGradient});">
                </div>
                ` : '<p class="text-muted">Sin datos</p>'}
                <ul id="pie-legend" class="list-unstyled small text-start d-inline-block">
                  ${pieSegments.map(s => `
                    <li><span class="d-inline-block rounded me-1" style="width:12px;height:12px;background:${s.color}"></span>
                    ${s.label}: ${s.count} (${s.pct}%)</li>
                  `).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">Próximos a vencer</div>
            <div class="card-body p-0">
              <table class="table table-hover mb-0" id="tabla-proximos-vencer">
                <thead class="table-light small">
                  <tr><th>Código</th><th>Alumno</th><th>Vencimiento</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  ${proxRows || '<tr><td colspan="4" class="text-center text-muted py-3">Sin comodatos próximos a vencer</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-8">
          <div class="card h-100">
            <div class="card-header fw-semibold">Últimas reparaciones</div>
            <div class="card-body p-0">
              <table class="table table-hover mb-0" id="tabla-ultimas-reparaciones">
                <thead class="table-light small">
                  <tr><th>Activo</th><th>Descripción</th><th>Tallerista</th><th>Estado</th><th>Ingreso</th></tr>
                </thead>
                <tbody>
                  ${repRows || '<tr><td colspan="5" class="text-center text-muted py-3">Sin reparaciones registradas</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-header fw-semibold d-flex justify-content-between align-items-center">
              <span>📋 Tareas de Logística (Hermes)</span>
              <span class="badge bg-primary text-white">${logTasks.filter(t => t.estado !== 'completada').length}</span>
            </div>
            <div class="card-body p-3" style="max-height: 250px; overflow-y: auto;">
              ${logTasks.filter(t => t.estado !== 'completada').map(t => {
                const checklist = t.checklist || []
                const done = checklist.filter(c => (c.estado || (c.completado ? 'completada' : 'pendiente')) === 'completada').length
                const progress = checklist.length > 0 ? Math.round((done / checklist.length) * 100) : 0
                return `
                  <div class="p-2 mb-2 rounded-3 border bg-light" id="dash-task-${t.id}">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <strong class="text-dark d-block" style="font-size: 11px;">${t.titulo}</strong>
                        <span class="text-muted" style="font-size: 9px;">Vence: ${t.fecha_vencimiento}</span>
                      </div>
                      <button class="btn btn-outline-success btn-sm btn-quick-complete rounded-pill px-2 py-0" style="font-size: 9px;" data-id="${t.id}">
                        Listo
                      </button>
                    </div>
                    <div class="progress mb-2" style="height: 3px;">
                      <div class="progress-bar bg-success" style="width: ${progress}%;"></div>
                    </div>
                    <div class="text-muted" style="font-size: 9px;">${done}/${checklist.length} pasos listos (${progress}%)</div>
                  </div>
                `
              }).join('') || '<p class="text-muted small text-center my-3">Sin tareas pendientes de logística.</p>'}
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  container.querySelectorAll('.btn-quick-complete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const taskId = btn.dataset.id
      if (confirm('¿Marcar esta tarea de logística como completada?')) {
        const { error } = await actualizarTarea(taskId, { estado: 'completada' })
        if (!error) {
          renderDashboardInventarioView(container)
        }
      }
    })
  })

  return { teardown: () => _ac.abort() }
}
