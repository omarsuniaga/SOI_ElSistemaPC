import { obtenerBalanceAlumnos } from '../api/finanzasApi.js'
import { calcularEstadoFinanciero, estadoBadgeClass } from '../domain/cobranza.js'
import { obtenerTareas, actualizarTarea } from '../../hermes/api/hermesApi.js'

export async function renderBalanceAlumnosView(container) {
  const _ac = new AbortController()

  container.innerHTML = '<p class="p-4">Cargando balance...</p>'

  const [balanceRes, tasksRes] = await Promise.all([
    obtenerBalanceAlumnos(),
    obtenerTareas({ departamento: 'FIN' })
  ])

  if (balanceRes.error) {
    container.innerHTML = `<div class="alert alert-danger m-4">Error: ${balanceRes.error.message}</div>`
    return { teardown: () => _ac.abort() }
  }

  const { alumnos, pagos } = balanceRes.data
  const finTasks = tasksRes.data || []
  const today = new Date()

  const rows = alumnos.map(alumno => {
    const alumnosPagos = pagos.filter(p => p.alumno_id === alumno.id)
    const est = calcularEstadoFinanciero(alumno, alumnosPagos, today)
    return { alumno, est }
  })

  // Sort: rojo first, then amarillo, then verde
  const order = { rojo: 0, amarillo: 1, verde: 2 }
  rows.sort((a, b) => (order[a.est.estado] ?? 3) - (order[b.est.estado] ?? 3))

  const tableRows = rows.map(({ alumno, est }) => `
    <tr>
      <td>${alumno.nombre_completo}</td>
      <td><span class="${estadoBadgeClass(est.estado)}">${est.etiqueta}</span></td>
      <td class="text-muted small">${est.dias > 0 && est.dias < 900 ? `${est.dias} días` : '—'}</td>
      <td>
        <button class="btn btn-outline-primary btn-sm btn-ver-pagos"
          data-id="${alumno.id}" data-nombre="${alumno.nombre_completo}">
          <i class="bi bi-list-ul"></i>
        </button>
      </td>
    </tr>
  `).join('')

  const verde = rows.filter(r => r.est.estado === 'verde').length
  const amarillo = rows.filter(r => r.est.estado === 'amarillo').length
  const rojo = rows.filter(r => r.est.estado === 'rojo').length

  container.innerHTML = `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0"><i class="bi bi-clipboard-data me-2"></i>Balance de Alumnos</h4>
        <button id="btn-registrar" class="btn btn-primary btn-sm">
          <i class="bi bi-plus-lg me-1"></i> Registrar Pago
        </button>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-4"><div class="card border-success text-center p-3">
          <div class="fs-3 fw-bold text-success">${verde}</div>
          <div class="small text-muted">Al día</div>
        </div></div>
        <div class="col-4"><div class="card border-warning text-center p-3">
          <div class="fs-3 fw-bold text-warning">${amarillo}</div>
          <div class="small text-muted">En mora</div>
        </div></div>
        <div class="col-4"><div class="card border-danger text-center p-3">
          <div class="fs-3 fw-bold text-danger">${rojo}</div>
          <div class="small text-muted">Bloqueados</div>
        </div></div>
      </div>

      <div class="row g-3">
        <div class="col-md-8">
          <div class="card shadow-sm h-100">
            <div class="card-body p-0">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Alumno</th>
                    <th>Estado</th>
                    <th>Días mora</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>${tableRows}</tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm h-100">
            <div class="card-header fw-semibold d-flex justify-content-between align-items-center">
              <span>📋 Tareas de Finanzas (Hermes)</span>
              <span class="badge bg-primary text-white">${finTasks.filter(t => t.estado !== 'completada').length}</span>
            </div>
            <div class="card-body p-3" style="max-height: 300px; overflow-y: auto;">
              ${finTasks.filter(t => t.estado !== 'completada').map(t => {
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
              }).join('') || '<p class="text-muted small text-center my-3">Sin tareas pendientes de finanzas.</p>'}
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  container.querySelector('#btn-registrar')?.addEventListener('click', () => {
    window.router?.navigate('finanzas-registro')
  }, { signal: _ac.signal })

  container.querySelector('tbody')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-ver-pagos')
    if (!btn) return
    window.router?.navigate('finanzas-registro', { alumnoId: btn.dataset.id })
  }, { signal: _ac.signal })

  container.querySelectorAll('.btn-quick-complete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const taskId = btn.dataset.id
      if (confirm('¿Marcar esta tarea de finanzas como completada?')) {
        const { error } = await actualizarTarea(taskId, { estado: 'completada' })
        if (!error) {
          renderBalanceAlumnosView(container)
        }
      }
    })
  })

  return { teardown: () => _ac.abort() }
}
