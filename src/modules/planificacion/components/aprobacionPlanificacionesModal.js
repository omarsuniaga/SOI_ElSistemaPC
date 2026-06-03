import { AppModal } from '../../../shared/components/AppModal.js'
import { marcarRevisada, marcarEjecutada } from '../api/planificacionAdapter.js'

export function openAprobacionPlanificacionesModal(planificaciones, onAprobar) {
  const pendientes = planificaciones.filter(
    (p) => p.estado === 'planificado' || p.estado === 'ejecutado',
  )

  if (!pendientes.length) {
    AppModal.open({
      title: 'Aprobación de Planificaciones',
      body: '<div class="alert alert-info mb-0">No hay planificaciones pendientes de aprobación.</div>',
      hideSave: true,
      cancelText: 'Cerrar',
    })
    return
  }

  AppModal.open({
    title: 'Aprobación de Planificaciones',
    size: 'lg',
    saveText: 'Aprobar Seleccionadas',
    body: `
      <div class="mb-3">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="selectAllPlans" checked>
          <label class="form-check-label fw-semibold" for="selectAllPlans">Seleccionar todas</label>
        </div>
      </div>
      <div class="table-responsive" style="max-height: 350px; overflow-y: auto;">
        <table class="table table-sm table-hover mb-0">
          <thead class="table-light sticky-top">
            <tr>
              <th style="width: 30px;"><input type="checkbox" id="checkAll" checked></th>
              <th>Tema</th>
              <th>Maestro</th>
              <th>Estado Actual</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody id="plansToApprove">
            ${pendientes
              .map(
                (p) => `
              <tr data-id="${p.id}">
                <td><input type="checkbox" class="plan-check" checked></td>
                <td class="text-truncate" style="max-width: 200px;">${_esc(p.tema)}</td>
                <td>${_esc(p.maestro || '-')}</td>
                <td><span class="badge ${_getBadgeClass(p.estado)}">${p.estado}</span></td>
                <td>${p.fecha_inicio || '-'}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
      <div class="mt-3 p-3 bg-light rounded">
        <div class="row">
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Agregar comentario (opcional):</label>
            <textarea class="form-control form-control-sm" id="approvalComment" rows="2" placeholder="Observaciones sobre la aprobación..."></textarea>
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Acción:</label>
            <select class="form-select form-select-sm" id="approvalAction">
              <option value="revisado">Marcar como Revisado</option>
              <option value="ejecutado">Marcar como Ejecutado</option>
            </select>
          </div>
        </div>
      </div>
    `,
    onSave: async () => {
      const selectedIds = []
      document.querySelectorAll('#plansToApprove tr').forEach((row) => {
        const checkbox = row.querySelector('.plan-check')
        if (checkbox?.checked) {
          selectedIds.push(row.dataset.id)
        }
      })

      const action = document.getElementById('approvalAction').value
      const comment = document.getElementById('approvalComment').value

      if (!selectedIds.length) {
        alert('Selecciona al menos una planificación')
        return false
      }

      AppModal.showLoading('Aprobando planificaciones...')

      try {
        for (const id of selectedIds) {
          if (action === 'revisado') {
            await marcarRevisada(id)
          } else {
            await marcarEjecutada(id)
          }
        }

        if (onAprobar) {
          onAprobar(selectedIds, action, comment)
        }

        AppModal.close()
      } catch (error) {
        alert('Error al aprobar: ' + error.message)
      }
    },
  })

  document.getElementById('selectAllPlans')?.addEventListener('change', (e) => {
    document.querySelectorAll('.plan-check').forEach((cb) => {
      cb.checked = e.target.checked
    })
    document.getElementById('checkAll').checked = e.target.checked
  })

  document.getElementById('checkAll')?.addEventListener('change', (e) => {
    document.querySelectorAll('.plan-check').forEach((cb) => {
      cb.checked = e.target.checked
    })
    document.getElementById('selectAllPlans').checked = e.target.checked
  })
}

function _esc(str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function _getBadgeClass(estado) {
  const map = { planificado: 'bg-primary', ejecutado: 'bg-success', revisado: 'bg-info' }
  return map[estado] || 'bg-secondary'
}
