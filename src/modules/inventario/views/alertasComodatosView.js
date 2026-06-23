import { obtenerActivosOciosos, obtenerComodatosVencidos, obtenerComodatosPorVencer, renovarComodato, devolverComodato } from '../api/inventarioApi.js'
import { estadoVencimiento } from '../domain/comodato.js'

export async function renderAlertasComodatosView(container) {
  const _ac = new AbortController()
  container.innerHTML = '<p class="p-4">Verificando alertas...</p>'

  const [vencidosRes, porVencerRes, ociososRes] = await Promise.all([
    obtenerComodatosVencidos(), obtenerComodatosPorVencer(7), obtenerActivosOciosos(),
  ])

  let hasError = false
  const vencidos = vencidosRes.data || []; const porVencer = porVencerRes.data || []; const ociosos = ociososRes.data || []
  const totalAlertas = vencidos.length + porVencer.length + ociosos.length

  if (vencidosRes.error || porVencerRes.error || ociososRes.error) {
    container.innerHTML = '<div class="alert alert-danger m-4">Error al cargar alertas</div>'
    return { teardown: () => _ac.abort() }
  }

  function renderAlertGroup(title, icon, colorClass, items, actionFn) {
    if (items.length === 0) return ''
    return '<div class="card shadow-sm mb-3 border-' + colorClass + '"><div class="card-header fw-semibold text-bg-' + colorClass + '"><i class="bi ' + icon + ' me-1"></i> ' + title + ' <span class="badge bg-light text-dark ms-1">' + items.length + '</span></div><div class="card-body p-0"><table class="table table-hover mb-0"><thead class="table-light"><tr><th>Alumno</th><th>Instrumento</th><th>Detalle</th><th>Acción sugerida</th><th></th></tr></thead><tbody>' +
      items.map((item, idx) => {
        const ven = item.fecha_vencimiento ? estadoVencimiento(item) : null
        return '<tr><td>' + (item.alumnos?.nombre_completo || item.alumno_nombre || item.alumno_id || '---') + '</td>' +
          '<td class="font-monospace small">' + (item.inventario_activos?.codigo_inventario || item.codigo_inventario || item.activo_id || '---') + '</td>' +
          '<td>' + (ven ? ven.label : (item.dias_prestado ? item.dias_prestado + ' días prestado' : '---')) + '</td>' +
          '<td>' + actionFn(item, idx) + '</td>' +
          '<td><button class="btn btn-sm btn-outline-' + colorClass + ' btn-resolver" data-type="' + title + '" data-idx="' + idx + '"><i class="bi bi-check-circle"></i> Resolver</button></td></tr>'
      }).join('') +
      '</tbody></table></div></div>'
  }

  container.innerHTML = [
    '<div class="container-fluid p-4">',
    '<h4 class="mb-1"><i class="bi bi-exclamation-triangle me-2 text-warning"></i>Alertas de Comodatos</h4>',
    '<p class="text-muted small mb-4">' + totalAlertas + ' alerta' + (totalAlertas !== 1 ? 's' : '') + ' activa' + (totalAlertas !== 1 ? 's' : '') + '</p>',
    renderAlertGroup('Vencidos', 'bi-calendar-x-fill', 'danger', vencidos, () => '<span class="badge bg-danger">Devolver urgente</span>'),
    renderAlertGroup('Vencimiento próximo', 'bi-calendar-warning', 'warning', porVencer, () => '<span class="badge bg-warning text-dark">Renovar</span>'),
    renderAlertGroup('Alumno inactivo', 'bi-person-x-fill', 'info', ociosos, () => '<span class="badge bg-info text-dark">Contactar alumno</span>'),
    (totalAlertas === 0 ? '<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Sin alertas activas.</div>' : ''),
    '</div>',
  ].join('\n')

  container.querySelectorAll('.btn-resolver').forEach(btn => {
    btn.addEventListener('click', async () => {
      const type = btn.dataset.type; const idx = parseInt(btn.dataset.idx)
      let items; let action
      if (type.includes('Vencidos')) { items = vencidos; action = 'devolver' }
      else if (type.includes('Vencimiento')) { items = porVencer; action = 'renovar' }
      else { items = ociosos; action = 'contactar' }
      const item = items[idx]; if (!item) return
      btn.disabled = true
      if (action === 'renovar') {
        if (!confirm('\u00bfRenovar este comodato?')) { btn.disabled = false; return }
        const { error } = await renovarComodato(item.id)
        if (error) { alert('Error: ' + error.message); btn.disabled = false } else { renderAlertasComodatosView(container) }
      } else if (action === 'devolver') {
        if (!confirm('\u00bfDevolver este instrumento?')) { btn.disabled = false; return }
        const { error } = await devolverComodato(item.id)
        if (error) { alert('Error: ' + error.message); btn.disabled = false } else { renderAlertasComodatosView(container) }
      } else {
        alert('Contactar al alumno: ' + (item.alumnos?.nombre_completo || item.alumno_nombre || item.alumno_id || 'desconocido'))
        btn.disabled = false
      }
    }, { signal: _ac.signal })
  })

  return { teardown: () => _ac.abort() }
}
